import express, { type Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import type { RenderOptions } from "../types";

const isProduction = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  let vite: ViteDevServer;

  if (!isProduction) {
    // -------------------------
    // DEV MODE (Vite middleware)
    // -------------------------
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // Use vite's connect instance as middleware. If you use your own
    // express router (express.Router()), you should use router.use
    // When the server restarts (for example after the user modifies
    // vite.config.js), `vite.middlewares` is still going to be the same
    // reference (with a new internal stack of Vite and plugin-injected
    // middlewares). The following is valid even after restarts.
    app.use(vite.middlewares);
  } else {
    // -------------------------
    // PROD MODE (static assets)
    // -------------------------
    app.use("/assets", express.static(path.resolve("dist/client/assets")));
  }

  app.use("*all", async (req, res, next) => {
    try {
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);
      const mode = url.searchParams.get("mode") ?? "stream";
      let template: string;
      let renderApp: (res: Response, option: RenderOptions) => void;

      if (!isProduction) {
        // 1. Read index.html
        const rawTemplate = fs.readFileSync(
          path.resolve(__dirname, "../index.html"),
          "utf-8",
        );
        // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
        //    and also applies HTML transforms from Vite plugins, e.g. global
        //    preambles from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url.toString(), rawTemplate);

        // 3. Load the server entry. ssrLoadModule automatically transforms
        //    ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        const { render } = await vite.ssrLoadModule("/src/entry-server.js");
        renderApp = render;
      } else {
        template = fs.readFileSync(
          path.resolve("dist/client/index.html"),
          "utf-8",
        );

        const { render } = await import(
          path.resolve("../dist/server/entry-server.js")
        );
        renderApp = render;
      }

      const [htmlStart, htmlEnd] = template.split("<!--ssr-outlet-->");

      renderApp(res, {
        htmlStart,
        htmlEnd,
        mode: mode as RenderOptions["mode"],
      });
    } catch (err) {
      if (!isProduction) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        vite.ssrFixStacktrace(err as Error);
      }
      next(err);
      console.error("Fatal SSR error:", err);
    }
  });

  app.listen(5173);
}

createServer();
