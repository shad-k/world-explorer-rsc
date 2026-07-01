# 🌍 World Explorer — a React 19 Rendering Lab

A hands-on comparison of every major React 19 rendering strategy, each on its
own route, wired up **by hand** with React + Vite + Express — **no
meta-framework** (no Next.js, Remix, TanStack Start, or Gatsby).

The country / city / weather domain is deliberately trivial. The real subject is
**rendering architecture**: how CSR, blocking SSR, streaming SSR, and RSC each
_fetch, suspend, stream, and hydrate_ the same data — and what the browser
actually receives over the wire.

## Modes

| Route     | Strategy               | What it demonstrates                                                                                     |
| --------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `/`       | Landing (static SSR)   | A zero-hydration baseline (server HTML only).                                                             |
| `/csr`    | Client-Side Rendering  | Near-empty shell; the browser mounts React and fetches data client-side (`/api/*`).                      |
| `/ssr`    | Blocking SSR           | Server waits for all data, `renderToString`, sends once; client hydrates from embedded data.             |
| `/stream` | Streaming SSR          | `renderToPipeableStream`: shell + skeletons flush immediately, sections stream in, then hydrate.         |
| `/rsc`    | React Server Components | Server Components stream as a Flight payload alongside HTML, ship zero JS, and expose a **Server Action**. |
| `/lab`    | Performance lab        | Benchmarks TTFB / total time / HTML bytes across the modes.                                               |

Each feature (Countries 1s → Cities 2s → Weather 3s) has a deliberate delay and
its **own `<Suspense>` boundary**, so streaming and progressive hydration are
easy to see.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173  (Express + Vite middleware)
```

Production:

```bash
npm run build    # builds the client + ssr + rsc environments (via @vitejs/plugin-rsc)
npm start        # serves the production build
```

Other scripts: `npm run typecheck`, `npm run lint`, `npm run format`.

## How it works

- **`server/index.ts`** — an Express 5 server that dispatches on `req.path` to
  pick the render pipeline per route (no `?mode=` query param). It also serves
  `/api/{countries,cities,weather}` JSON (with the artificial delays) for CSR and
  the lab, and drives the RSC entry directly for `/rsc`.
- **`src/pages/<mode>/`** — one page, one server `render` module, and one client
  entry per mode. Only mode-specific _behavior_ (fetch / suspend / hydrate /
  Server Actions) lives here.
- **`src/features/<feature>/`** — a **shared** presentation-only `*View`
  component plus a small per-mode component that expresses how that mode fetches
  and streams the feature.
- **`src/shared/`** — everything identical across modes: domain types, mock
  datasets + delayed getters, constants, utilities, instrumentation, and
  cross-feature presentation components.

### Instrumentation

- **Server:** each request logs lifecycle markers (received → data resolved →
  shell flushed → stream complete) with per-mode colors, so blocking vs.
  streaming is visible in the terminal.
- **Browser:** hydration and timing markers are logged to the console; the lab
  reads them and measures each route.

### Notable techniques (implemented explicitly, not hidden)

- **Streaming SSR data channel** (`src/pages/stream/`): resolved data is emitted
  inline next to each streamed section and drained by a client-side channel, so
  boundaries hydrate without re-fetching — the technique frameworks use, spelled
  out.
- **RSC pipeline** (`src/pages/rsc/`): three environment entries — `entry.rsc`
  (serialize the tree to a Flight stream + run Server Actions), `entry.ssr`
  (Flight → HTML), `entry.browser` (fetch Flight, hydrate, dispatch actions) —
  plus a `"use client"` `FavoriteButton` that calls the `toggleFavorite` Server
  Action to mutate server-only state.

## Tech stack

React 19 · TypeScript · Vite (aliased to `rolldown-vite`) · `@vitejs/plugin-rsc`
· TailwindCSS v4 · Express 5.
