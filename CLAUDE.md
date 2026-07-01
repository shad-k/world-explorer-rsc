# CLAUDE.md

Guidance for working in this repository. **This document is the implementation spec.** The project is partway built (CSR/SSR/streaming exist behind a `?mode=` query param); the sections below describe both where the code is today and the finished state to build toward. When current code and this spec disagree, this spec wins — migrate the code to match it.

## What this project is

**World Explorer** is a **React 19 rendering laboratory**, not a production travel app. The country/city/weather domain is intentionally trivial — it exists only as a vehicle for demonstrating asynchronous rendering. The real subject is **rendering architecture**.

The goal is to demonstrate every major rendering paradigm supported by modern React **without an opinionated framework** (no Next.js, Remix, TanStack Start, or Gatsby). We build every abstraction ourselves so the implementation details stay explicit.

It doubles as an educational playground and a source of code snippets, timing diagrams, DevTools screenshots, and performance traces for a series of technical blog posts.

### Guiding principles

1. **Clarity over convenience.** When there's a tradeoff between an explicit, observable implementation and a terser/cleverer one, choose the explicit version. Do not abstract away the mechanics we're trying to teach.
2. **Each rendering mode is a self-contained, standalone artifact.** A reader (or blog post) should be able to open one mode's code and understand the entire rendering strategy without cross-referencing shared abstractions that hide the differences.
3. **Duplicate only where behavior genuinely differs across modes.** The point is to compare how CSR, SSR, streaming, and RSC each *fetch, suspend, and stream* the same domain — so the code that expresses those differences (data-fetching strategy, Suspense/streaming wiring, hydration, Server Actions) is intentionally duplicated per mode and kept self-contained. Everything that is the *same* regardless of mode is **shared, not duplicated**: raw mock/API data, domain types, and **presentation-only components** (dumb components that just render props — cards, skeletons, layout). Do not copy a presentation component or a JSON dataset into every mode. Before duplicating, ask: "would this actually behave differently under another rendering mode?" If no, put it in `shared/`.
4. **Instrumentation and visible loading states are first-class features**, not polish.

## Learning goals (what the code must illustrate)

- React 19 concurrent rendering & Suspense
- The difference between CSR, blocking SSR, Streaming SSR, and RSC
- Streaming SSR via `renderToPipeableStream`
- **React Server Components & Server Actions** (part of this build — see RSC mode)
- Hydration and progressive rendering
- Server and browser rendering lifecycles
- How much JavaScript each strategy ships and what the browser receives over the wire

## Tech stack

- **React 19** (canary features expected), **TypeScript**
- **Vite** — note: aliased to `rolldown-vite` via `overrides` in package.json
- **`@vitejs/plugin-rsc`** — required for RSC mode (Server Components + Flight payload). Add it as part of this work.
- **TailwindCSS v4** (via `@tailwindcss/vite`)
- **Express 5** server (`server/index.ts`) that owns request routing and picks the render strategy per route
- Rendering: `react-dom/server` (`renderToString`, `renderToPipeableStream`) and the RSC APIs (`react-server-dom-*`) for the RSC route
- **No meta-framework.** Keep it React + Vite + Express wherever practical, including for RSC — we wire RSC up ourselves with the Vite plugin rather than adopting Next.js.

## Commands

- `npm run dev` — dev server (Express + Vite middleware) on **port 5173**, runs `server/index.ts` under `tsx`
- `npm run build` — `vite build`; `@vitejs/plugin-rsc` builds the three environments in one pass (`dist/client`, `dist/ssr`, `dist/rsc`) with a client manifest
- `npm start` — production server: runs the same Express server under `tsx` (`NODE_ENV=production`), loading traditional render modules from TSX source and the RSC handler from `dist/rsc`
- `npm run typecheck` — `tsc -b` (project refs). `tsconfig.runtime.json` is the config `tsx` uses at runtime for the automatic JSX transform
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Routing: one page per mode (NOT `?mode=`)

Each rendering strategy has its **own route/page**, not a shared page toggled by a query param. This makes each mode a distinct, linkable, screenshottable artifact and lets Express select an entirely different render pipeline (and, for RSC, a different build) per route.

Target routes:

- `/` — landing page: links to each mode + the performance lab. Explains what each mode does.
- `/csr` — client-only. Server returns a near-empty shell; JS mounts and fetches on the client.
- `/ssr` — traditional blocking SSR. Server waits for all data, sends complete HTML once, client hydrates.
- `/stream` — Streaming SSR via `renderToPipeableStream`. Shell + Suspense fallbacks flush immediately; sections stream in progressively; hydration follows.
- `/rsc` — React Server Components. HTML and the Flight payload stream separately; server components never ship JS to the browser; client components hydrate; Server Actions demonstrated here.
- `/lab` (or `/perf`) — performance comparison across modes.

Each mode can also have **nested pages** for individual views — `/csr/weather`, `/ssr/country`, `/rsc/weather`, etc. — mirrored one-to-one by the `pages/` directory tree (see Structure). The first path segment selects the rendering mode/pipeline; deeper segments select the view.

Express dispatches on `req.path`: the first segment picks the render function and (for RSC) the correct entry/build; the rest resolves to the page. `RenderMode` in [types.ts](types.ts) stays as the canonical enum of strategies; the mode is derived from the leading route segment.

**Migration note:** current code selects mode via `url.searchParams.get("mode")` in [server/index.ts](server/index.ts) and dispatches inside [src/App.tsx](src/App.tsx)/[src/entry-server.tsx](src/entry-server.tsx). Replace query-param dispatch with path-based routing and give each mode its own entry/page rather than a single `App` that branches on `mode`.

## Structure — everything under `src/`

There are two top-level concerns under `src/`: **`pages/`** mirrors the route hierarchy, and **`features/`** holds the reusable feature implementations that pages compose.

**`pages/` mirrors routes.** Each rendering mode (`csr`, `ssr`, `stream`, `rsc`) is itself a page, and **nested pages live inside it** — so a directory maps directly to a URL:

- `pages/csr/` → `/csr` (the mode's landing/dashboard)
- `pages/csr/weather/` → `/csr/weather`
- `pages/ssr/country/` → `/ssr/country`
- `pages/rsc/weather/` → `/rsc/weather`

This gives the app a meaningful, URL-shaped structure: the path tells you both the rendering mode and the view. A page is a thin composition layer — it picks the right mode-specific feature implementation, sets up Suspense boundaries, and lays out the view. It contains no business logic.

**`features/` holds the actual feature code, split by mode where behavior differs** (principle 3). Only the mode-specific *behavior* lives in per-mode folders; data, types, and presentation-only components are shared.

```
src/
  pages/                         # mirrors the route hierarchy
    landing/                     # → /
    lab/                         # → /lab
    csr/                         # → /csr
      weather/                   # → /csr/weather
      country/                   # → /csr/country
    ssr/                         # → /ssr  (+ nested: ssr/weather, ssr/country, ...)
    stream/                      # → /stream (+ nested pages)
    rsc/                         # → /rsc    (+ nested pages; server-component entry)
  features/
    countries/
      CountriesView.tsx          # SHARED presentation-only component (renders props)
      csr/       Countries.tsx    # mode-specific: fetch/suspend/hydration, then <CountriesView/>
      ssr/       Countries.tsx
      stream/    Countries.tsx
      rsc/       Countries.tsx    # server component; may include "use client" leaves
    cities/      {View + csr,ssr,stream,rsc}/
    weather/     {View + csr,ssr,stream,rsc}/
    # later: news, exchange, holidays, earthquakes, timezones
  shared/                        # anything identical regardless of rendering mode
    types/                       # domain + rendering types
    data/ (or api/)              # raw mock datasets + (later) real API clients
    components/                  # cross-feature presentation-only UI (cards, skeletons, layout)
    constants/                   # e.g. per-feature artificial delays
    utils/                       # e.g. delay(ms) helper, formatting
    instrumentation/             # server + browser logging, timing markers
  entry-client.tsx
  entry-server.tsx               # + entry-rsc for the RSC pipeline
```

- A page under `pages/csr/weather/` composes the CSR weather feature from `features/weather/csr/`. Pages are about *routing and layout*; features are about *fetching and rendering behavior*.
- The per-mode `Countries.tsx` owns **only** what differs by mode: how data is fetched, how it suspends/streams, hydration, and any Server Action. It then delegates rendering to the shared `CountriesView`/presentation components. If a view ends up needing mode-specific markup, that's a signal the behavior differs — only then split it.
- Server-side existing folders `src/{csr,ssr,stream}` should be folded into this `pages/` + `features/` layout.

## Rendering modes — expected behavior

- **CSR** (`/csr`): server sends minimal shell; client downloads JS, React mounts, data fetching begins client-side, UI appears after JS executes. Demonstrates traditional SPA behavior.
- **SSR** (`/ssr`): server waits for all data, renders complete HTML with `renderToString`, sends once, client hydrates. Demonstrates blocking server rendering.
- **Stream** (`/stream`): `renderToPipeableStream` — HTML shell sent immediately, Suspense fallbacks visible, individual sections progressively appear as data resolves, hydration happens later. Demonstrates Streaming SSR.
- **RSC** (`/rsc`): Server Components render on the server and stream as a Flight payload alongside HTML; client components hydrate; server components ship **zero** JS to the browser. Includes at least one **Server Action**. Demonstrates modern React architecture wired up manually via `@vitejs/plugin-rsc`.

## Data & delays

Start with **mocked data with artificial delays** (raw datasets in `src/shared/data/`, delay helper in `src/shared/utils/`); swap in public APIs later (REST Countries, Open-Meteo, News, Exchange Rate, Holiday, Earthquake). The APIs are just async-rendering vehicles.

Each feature resolves at a **different, deliberate delay** to make streaming visible — e.g. Countries 1s, Cities 2s, Weather 3s, News 4s (keep delay values in `src/shared/constants/`). **Every feature gets its own `<Suspense>` boundary** to demonstrate progressive rendering.

## First features

Countries (name, flag, population, capital, region) → Cities (major cities) → Weather (current). Later: news, exchange rates, holidays, earthquakes, timezones.

## Instrumentation (first-class feature)

- **Server logs:** request received, data-fetch start/end, shell ready, stream start/end, hydration markers.
- **Browser logs:** hydration start/finish, performance timings.
- **Performance lab (`/lab`):** compares modes on server start, shell ready, first/last streamed chunk, hydration complete, JS bundle size, TTFB, FCP, LCP.
- **Streaming visualizer:** a dev panel with per-feature progress bars that update as chunks arrive.
- Make HTML chunks, streaming order, hydration, and the RSC Flight payload easy to inspect.

## UI philosophy

Should look like an **engineering demo, not a commercial product**: clean, dark theme, card-based layout, large obvious Suspense skeletons, visible progressive loading, and easy to annotate/screenshot for blog posts.

## Current code (starting point)

- [server/index.ts](server/index.ts) — Express + Vite middleware (dev) / static assets (prod). Currently reads `?mode`; **migrate to path-based routing** and add the RSC pipeline.
- [src/entry-server.tsx](src/entry-server.tsx) — `render()` branches by mode (CSR shell / SSR `renderToString` / stream `renderToPipeableStream` with a `Transform` and 10s abort). Split per-mode entries out of this single branching function; add an RSC entry.
- [src/entry-client.tsx](src/entry-client.tsx) — `hydrateRoot`.
- [src/App.tsx](src/App.tsx), [src/{csr,ssr,stream}/](src/) — fold into `src/pages/` + `src/features/`.
- Mode is currently passed to the client via `window.__RENDER_MODE__`; with per-route pages each client entry knows its own mode, so this global becomes unnecessary.

## Long-term goal

Grow this into a comprehensive **React 19 Rendering Lab** where a developer can visit a route per strategy and directly observe the effects on network traffic, HTML output, JS execution, hydration, the Flight payload, and perceived performance — all framework-free (React + Vite + Express), with every abstraction implemented explicitly.
