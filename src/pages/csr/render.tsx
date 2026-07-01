import type { Response } from "express";
import { buildDocument } from "../../../server/html";
import type { RenderContext } from "../../../server/index";
import { createRequestTimer } from "../../shared/instrumentation/server";

// CSR: the server does no app rendering at all. It returns a near-empty shell;
// the browser downloads the JS, mounts React, and fetches data client-side.
export async function render(res: Response, ctx: RenderContext) {
  const timer = createRequestTimer("csr");
  timer.log("request received");

  const { start, end } = await buildDocument({
    mode: "csr",
    assets: ctx.assets,
    transformHtml: ctx.transformHtml,
  });

  // No SSR output between start and end — the #root is empty.
  res.status(200).set("Content-Type", "text/html").send(start + end);
  timer.log("empty shell sent");
}
