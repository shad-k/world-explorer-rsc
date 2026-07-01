import type { Response } from "express";
import { renderToPipeableStream } from "react-dom/server";
import { Transform } from "node:stream";
import { StreamPage } from "./StreamPage";
import { ServerStoreContext, type ServerStore } from "./context";
import { buildDocument } from "../../../server/html";
import type { RenderContext } from "../../../server/index";
import { createRequestTimer } from "../../shared/instrumentation/server";
import { getCountries } from "../../shared/data/countries";
import { getCities } from "../../shared/data/cities";
import { getWeather } from "../../shared/data/weather";
import type { FeatureName } from "../../shared/types/domain";

const GETTERS: Record<FeatureName, () => Promise<unknown>> = {
  countries: getCountries,
  cities: getCities,
  weather: getWeather,
};

// Per-request store: memoizes each getter's promise so use() sees a stable
// promise across suspense retries, while still re-running the delay on every
// request (no cross-request caching — that would hide the streaming).
function createServerStore(): ServerStore {
  const cache = new Map<string, Promise<unknown>>();
  return {
    get(key) {
      if (!cache.has(key)) cache.set(key, GETTERS[key as FeatureName]());
      return cache.get(key)!;
    },
  };
}

// Streaming SSR via renderToPipeableStream: flush the shell + Suspense
// fallbacks immediately (onShellReady), then let React stream each section as
// its data resolves. Hydration follows once the client bundle loads.
export async function render(res: Response, ctx: RenderContext) {
  const timer = createRequestTimer("stream");
  timer.log("request received");

  const store = createServerStore();
  const { start, end } = await buildDocument({
    mode: "stream",
    assets: ctx.assets,
    transformHtml: ctx.transformHtml,
  });

  let didError = false;
  const { pipe, abort } = renderToPipeableStream(
    <ServerStoreContext.Provider value={store}>
      <StreamPage />
    </ServerStoreContext.Provider>,
    {
      onShellReady() {
        res.status(didError ? 500 : 200).set("Content-Type", "text/html");
        res.write(start);
        timer.log("shell flushed (fallbacks visible)");

        const transform = new Transform({
          transform(chunk, encoding, cb) {
            res.write(chunk, encoding);
            cb();
          },
          flush(cb) {
            res.write(end);
            cb();
          },
        });
        transform.on("finish", () => res.end());
        pipe(transform);
      },
      onAllReady() {
        timer.log("all sections streamed");
      },
      onError(err) {
        didError = true;
        console.error("Stream render error:", err);
      },
    },
  );

  const timeout = setTimeout(() => abort(), 10_000);
  res.on("close", () => clearTimeout(timeout));
}
