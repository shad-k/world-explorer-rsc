import { renderToPipeableStream, renderToString } from "react-dom/server";
import App from "./App";
import type { Response } from "express";
import { Transform } from "node:stream";
import { StrictMode } from "react";
import { RenderMode, type RenderOptions } from "../types";

export function render(
  res: Response,
  options: RenderOptions = { mode: RenderMode.STREAM },
) {
  let didError = false;

  if (options.mode === RenderMode.CSR) {
    // Client-Side Rendering: Send minimal HTML shell
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    const renderModeScript = `<script>window.__RENDER_MODE__ = "${options.mode}";</script>`;
    res.send(`
      ${options.htmlStart ?? '<!DOCTYPE html><html><head><title>App</title></head><body><div id="root"></div>'}
      ${renderModeScript}
      ${options.htmlEnd ?? "</body></html>"}
    `);
    return;
  } else if (options.mode === RenderMode.SSR) {
    // Server-Side Rendering: Render full HTML on the server
    const html = renderToString(
      <StrictMode>
        <App mode={options.mode} />
      </StrictMode>,
    );
    // Inject __RENDER_MODE__ as a global variable for client hydration
    const renderModeScript = `<script>window.__RENDER_MODE__ = "${options.mode}";</script>`;
    const fullHtml = `
      ${options.htmlStart ?? '<!DOCTYPE html><html><head><title>App</title></head><body><div id="root">'}
      ${html}
      </div>
      ${renderModeScript}
      ${options.htmlEnd ?? "</body></html>"}
    `;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.send(fullHtml);
    return;
  } else {
    const stream = renderToPipeableStream(
      <StrictMode>
        <App mode={options.mode ?? RenderMode.STREAM} />
      </StrictMode>,
      {
        bootstrapScriptContent: `window.__RENDER_MODE__ = "${options.mode}";`,
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
}
