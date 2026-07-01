import type { Response } from "express";
import { renderToString } from "react-dom/server";
import { SsrPage, type SsrData } from "./SsrPage";
import { buildDocument, serializeData } from "../../../server/html";
import type { RenderContext } from "../../../server/index";
import { createRequestTimer } from "../../shared/instrumentation/server";
import { getCountries } from "../../shared/data/countries";
import { getCities } from "../../shared/data/cities";
import { getWeather } from "../../shared/data/weather";

// Blocking SSR: wait for ALL data, render complete HTML once with
// renderToString, embed the data for hydration, and send in a single response.
// Nothing is visible until the slowest feature (weather, 3s) resolves.
export async function render(res: Response, ctx: RenderContext) {
  const timer = createRequestTimer("ssr");
  timer.log("request received");

  timer.log("fetching all data (blocking)");
  const [countries, cities, weather] = await Promise.all([
    getCountries(),
    getCities(),
    getWeather(),
  ]);
  const data: SsrData = { countries, cities, weather };
  timer.log("all data resolved");

  const appHtml = renderToString(<SsrPage data={data} />);
  timer.log("html rendered (renderToString)");

  const { start, end } = await buildDocument({
    mode: "ssr",
    assets: ctx.assets,
    tailHtml: serializeData("__SSR_DATA__", data),
    transformHtml: ctx.transformHtml,
  });

  res.status(200).set("Content-Type", "text/html").send(start + appHtml + end);
  timer.log("response sent");
}
