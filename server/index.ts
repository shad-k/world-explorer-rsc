import express, { type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { resolveClientAssets } from "./assets";
import type { ClientAssets } from "./assets";

const isProduction = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The context every per-mode render function receives. It hides the dev/prod
// difference (Vite transforms + on-demand module loading vs. built assets).
export interface RenderContext {
  url: string;
  isProduction: boolean;
  assets: ClientAssets;
  transformHtml: (html: string) => Promise<string>;
}

export type RenderFn = (res: Response, ctx: RenderContext) => void | Promise<void>;

// Each page route maps to a server render module and its client entry. The mode
// is derived from the route — there is no `?mode=` query param (see CLAUDE.md).
interface RouteConfig {
  renderModule: string; // source path (dev) / used to derive dist path (prod)
  clientEntry: string;
}

const ROUTES: Record<string, RouteConfig> = {
  "/": {
    renderModule: "/src/pages/landing/render.tsx",
    clientEntry: "/src/pages/landing/entry.client.tsx",
  },
  "/csr": {
    renderModule: "/src/pages/csr/render.tsx",
    clientEntry: "/src/pages/csr/entry.client.tsx",
  },
  "/ssr": {
    renderModule: "/src/pages/ssr/render.tsx",
    clientEntry: "/src/pages/ssr/entry.client.tsx",
  },
  "/stream": {
    renderModule: "/src/pages/stream/render.tsx",
    clientEntry: "/src/pages/stream/entry.client.tsx",
  },
  "/lab": {
    renderModule: "/src/pages/lab/render.tsx",
    clientEntry: "/src/pages/lab/entry.client.tsx",
  },
};

async function createServer() {
  const app = express();
  app.use(express.json());

  let vite: ViteDevServer | undefined;

  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    app.use("/assets", express.static(path.resolve("dist/client/assets")));
  }

  // --- JSON API endpoints ---------------------------------------------------
  // Backs the CSR mode (client-side fetching) and the performance lab. The
  // deliberate per-feature delays live in the data getters themselves.
  const api = express.Router();
  api.get("/countries", async (_req, res) => {
    const { getCountries } = await loadServerModule(vite, "/src/shared/data/countries.ts");
    res.json(await getCountries());
  });
  api.get("/cities", async (_req, res) => {
    const { getCities } = await loadServerModule(vite, "/src/shared/data/cities.ts");
    res.json(await getCities());
  });
  api.get("/weather", async (_req, res) => {
    const { getWeather } = await loadServerModule(vite, "/src/shared/data/weather.ts");
    res.json(await getWeather());
  });
  app.use("/api", api);

  // --- Page routes ----------------------------------------------------------
  app.get("*all", async (req, res, next) => {
    const route = ROUTES[req.path];
    if (!route) return next();

    try {
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);

      const { render } = (await loadServerModule(
        vite,
        route.renderModule,
      )) as { render: RenderFn };

      const ctx: RenderContext = {
        url: url.toString(),
        isProduction,
        assets: resolveClientAssets(route.clientEntry, isProduction),
        transformHtml: vite
          ? (html) => vite!.transformIndexHtml(url.toString(), html)
          : async (html) => html,
      };

      await render(res, ctx);
    } catch (err) {
      vite?.ssrFixStacktrace(err as Error);
      console.error("Render error:", err);
      next(err);
    }
  });

  app.listen(5173, () => {
    console.log(
      `\n🌍 World Explorer running at http://localhost:5173 (${
        isProduction ? "production" : "development"
      })\n`,
    );
  });
}

/** Loads a server-side module: via Vite's module runner in dev, dynamic import in prod. */
async function loadServerModule(
  vite: ViteDevServer | undefined,
  sourcePath: string,
) {
  if (vite) return vite.ssrLoadModule(sourcePath);
  // Prod: map "/src/pages/csr/render.tsx" -> compiled "dist/server/pages/csr/render.js"
  const rel = sourcePath.replace(/^\/src\//, "").replace(/\.tsx?$/, ".js");
  return import(path.resolve(__dirname, rel));
}

createServer();
