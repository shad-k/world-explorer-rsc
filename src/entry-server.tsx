import { renderToPipeableStream } from "react-dom/server";
import App from "./App";
import type { Response } from "express";
import { Transform } from "node:stream";
import { StrictMode } from "react";

export type RenderOptions = {
  htmlStart?: string;
  htmlEnd?: string;
};

export function render(res: Response, options: RenderOptions = {}) {
  let didError = false;

  const stream = renderToPipeableStream(
    <StrictMode>
      <App />
    </StrictMode>,
    {
      bootstrapModules: ["/src/entry-client.tsx"],
      onShellReady() {
        // Called when the shell (HTML + Suspense fallbacks) is ready
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-Type", "text/html");

        res.write(options.htmlStart);

        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            res.write(chunk, encoding);
            callback();
          },
          flush(callback) {
            res.write(options.htmlEnd);
            callback();
          },
        });

        transformStream.on("finish", () => {
          res.statusCode = didError ? 500 : 200;
          res.end();
        });

        stream.pipe(transformStream);
      },
      onAllReady() {
        console.log("onAllReady called");
      },
      onError(error, errorInfo) {
        didError = true;
        console.error("SSR render error:", error, errorInfo);
      },
    },
  );

  const timeout = setTimeout(() => {
    console.log("Request timeout, aborting render");
    stream.abort();
  }, 10000);

  // Clean up timeout when response finishes
  res.on("finish", () => {
    clearTimeout(timeout);
  });

  res.on("close", () => {
    clearTimeout(timeout);
  });

  return stream;
}
