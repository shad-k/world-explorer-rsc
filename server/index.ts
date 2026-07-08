import express, { type Request, type Response } from "express";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { resolveClientAssets } from "./assets";
import type { ClientAssets } from "./assets";

// The RSC entry's default export: a web-standard fetch handler.
type RscHandler = (request: globalThis.Request) => Promise<globalThis.Response>;

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

export type RenderFn = (
  res: Response,
  ctx: RenderContext,
) => void | Promise<void>;

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
    const { getCountries } = await loadServerModule(
      vite,
      "/src/shared/data/countries.ts",
    );
    res.json(await getCountries());
  });
  api.get("/cities", async (_req, res) => {
    const { getCities } = await loadServerModule(
      vite,
      "/src/shared/data/cities.ts",
    );
    res.json(await getCities());
  });
  api.get("/weather", async (_req, res) => {
    const { getWeather } = await loadServerModule(
      vite,
      "/src/shared/data/weather.ts",
    );
    res.json(await getWeather());
  });
  app.use("/api", api);

  // --- RSC route ------------------------------------------------------------
  // React Server Components have their own pipeline (rsc -> ssr -> client
  // environments), so we drive the RSC entry's fetch handler directly instead
  // of the generic HTML shell. Handles GET (navigation + Flight fetch) and POST
  // (Server Action calls). /rsc/full-rerender is a sibling page (same handler,
  // same build) demonstrating the naive full-tree re-render strategy side by
  // side with /rsc's scoped one — see src/pages/rsc/entry.rsc.tsx.
  app.all(["/rsc", "/rsc/full-rerender"], async (req, res, next) => {
    try {
      const handler = await loadRscHandler(vite);
      const webRequest = await toWebRequest(req);
      const webResponse = await handler(webRequest);
      sendWebResponse(res, webResponse);
    } catch (err) {
      vite?.ssrFixStacktrace(err as Error);
      console.error("RSC render error:", err);
      next(err);
    }
  });

  // --- Page routes ----------------------------------------------------------
  app.get("*all", async (req, res, next) => {
    const route = ROUTES[req.path];
    if (!route) return next();

    try {
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);

      const { render } = (await loadServerModule(vite, route.renderModule)) as {
        render: RenderFn;
      };

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

/** Loads the RSC entry's fetch handler from the `rsc` environment (dev) or build (prod). */
async function loadRscHandler(
  vite: ViteDevServer | undefined,
): Promise<RscHandler> {
  if (vite) {
    // The rsc environment loads modules with the `react-server` condition.
    const rscEnv = vite.environments.rsc as unknown as {
      runner: { import: (id: string) => Promise<{ default: RscHandler }> };
    };
    const mod = await rscEnv.runner.import("/src/pages/rsc/entry.rsc.tsx");
    return mod.default;
  }
  const mod = await import(path.resolve(__dirname, "../dist/rsc/index.js"));
  return mod.default as RscHandler;
}

/** Converts an Express request into a web-standard Request (body buffered for POST). */
async function toWebRequest(req: Request): Promise<globalThis.Request> {
  const url = `http://${req.headers.host}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value) headers.set(key, value);
  }

  let body: Buffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    body = Buffer.concat(chunks);
  }

  return new globalThis.Request(url, {
    method: req.method,
    headers,
    // Buffer is a Uint8Array at runtime (a valid request body); the lib types
    // don't model that, hence the cast.
    body: body as RequestInit["body"],
  });
}

/** Pipes a web-standard Response back through the Express response. */
function sendWebResponse(res: Response, webResponse: globalThis.Response) {
  res.status(webResponse.status);
  webResponse.headers.forEach((value, key) => res.setHeader(key, value));
  if (webResponse.body) {
    Readable.fromWeb(
      webResponse.body as Parameters<typeof Readable.fromWeb>[0],
    ).pipe(res);
  } else {
    res.end();
  }
}

/** Loads a server-side module: via Vite's module runner in dev, dynamic import in prod. */
async function loadServerModule(
  vite: ViteDevServer | undefined,
  sourcePath: string,
) {
  if (vite) return vite.ssrLoadModule(sourcePath);
  // Prod: the server runs under tsx, so import the TSX source directly. Only the
  // RSC pipeline needs a bundled build (it requires the react-server condition).
  return import(path.resolve(__dirname, "..", sourcePath.replace(/^\//, "")));
}

createServer();
