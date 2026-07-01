import type { Response } from "express";
import { renderToString } from "react-dom/server";
import { LabPage } from "./LabPage";
import { buildDocument } from "../../../server/html";
import type { RenderContext } from "../../../server/index";
import { createRequestTimer } from "../../shared/instrumentation/server";

// The lab shell is server-rendered (renderToString) and then hydrated so its
// "Run benchmark" button is interactive. Initial render is deterministic (empty
// results), so hydration matches without any embedded data.
export async function render(res: Response, ctx: RenderContext) {
  const timer = createRequestTimer("lab");
  timer.log("request received");

  const appHtml = renderToString(<LabPage />);
  const { start, end } = await buildDocument({
    mode: "lab",
    assets: ctx.assets,
    transformHtml: ctx.transformHtml,
  });

  res
    .status(200)
    .set("Content-Type", "text/html")
    .send(start + appHtml + end);
  timer.log("response sent");
}
