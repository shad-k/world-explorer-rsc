import { renderToString } from "react-dom/server";
import type { Response } from "express";
import { LandingPage } from "./LandingPage";
import { buildDocument } from "../../../server/html";
import type { RenderContext } from "../../../server/index";
import { createRequestTimer } from "../../shared/instrumentation/server";

export async function render(res: Response, ctx: RenderContext) {
  const timer = createRequestTimer("landing");
  timer.log("request received");

  const appHtml = renderToString(<LandingPage />);
  timer.log("html rendered");

  const { start, end } = await buildDocument({
    mode: "landing",
    assets: ctx.assets,
    transformHtml: ctx.transformHtml,
  });

  res.status(200).set("Content-Type", "text/html").send(start + appHtml + end);
  timer.log("response sent");
}
