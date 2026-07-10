# World Explorer — a React 19 Rendering Lab

No framework. No magic. Just React 19 + Vite + Express, and every rendering
strategy wired up by hand so the mechanics stay visible.

The domain is intentionally boring — countries, cities, weather — because the
domain is not the point. The point is watching the same data fetch, suspend,
stream, and hydrate differently depending on where and when the work happens.
There are six routes. Each one is a different answer to that question.

---

## The routes

| Route                | Strategy                      |
| -------------------- | ----------------------------- |
| `/`                  | Static SSR (zero client JS)   |
| `/csr`               | Client-side rendering         |
| `/ssr`               | Blocking SSR                  |
| `/stream`            | Streaming SSR                 |
| `/rsc`               | RSC with scoped Server Action |
| `/rsc/full-rerender` | RSC with full-tree re-render  |
| `/lab`               | Performance comparison        |

Each data feature has a deliberate, different delay: Countries resolves at 3s,
Cities at 6s, Weather at 9s. Every feature gets its own `<Suspense>` boundary.
That combination makes the progressive streaming visible in a way a real API
never would be.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build && npm start   # production
```

`npm run typecheck`, `npm run lint`, `npm run format` are also wired.

---

## CSR

The server sends an empty div and a script tag. That's it. React mounts in the
browser, hits `/api/countries`, `/api/cities`, `/api/weather`, and renders.
TTFB is fast because there's nothing to compute. Everything else is slow because
the user is waiting for JS to download, parse, execute, and then for three
sequential network round-trips to complete before anything meaningful appears.

CSR is the baseline for comparison. Once you see how much it ships to the browser
and how long the user stares at skeletons, the case for any server-side strategy
becomes obvious.

`src/pages/csr/render.tsx` is six lines. `src/pages/csr/resource.ts` wraps each
`fetch()` in a suspense-compatible `Resource` so `use(resource)` works.

---

## Blocking SSR

`renderToString` waits for all three data fetches before rendering anything. The
server calls `Promise.all([getCountries(), getCities(), getWeather()])` and blocks
for the full 9s. Then it renders a complete HTML string, embeds the data as
`window.__SSR_DATA__`, and sends one response.

The client gets a fully-formed page and hydrates from the embedded data without
re-fetching. No flash of loading, no skeleton flicker. The tradeoff is that
TTFB equals the slowest dependency — the user waits nine full seconds for the
first byte to arrive.

The embedded data trick is worth understanding. `serializeData("__SSR_DATA__",
data)` writes a `<script>` tag that assigns the JSON to a global. On the client,
`SsrPage` reads `window.__SSR_DATA__` synchronously and passes it straight to
the components. React hydrates against the same output `renderToString` produced,
so there's no mismatch and no re-render.

---

## Streaming SSR

This is where things get interesting.

`renderToPipeableStream` fires `onShellReady` as soon as the static structure
(the nav, the layout, the empty section containers with their skeleton fallbacks)
is ready — typically in single-digit milliseconds. That chunk goes to the browser
immediately. The user sees the shell and the skeletons while the server is still
waiting on data.

As each feature resolves, React flushes its HTML. Next to that HTML, a small
inline `<script>` fires:

```js
window.__WE_DATA__.push(["countries", { ... }])
```

The client-side channel (`src/pages/stream/channel.ts`) has a `Promise` keyed
by `"countries"` waiting for exactly that push. When the script runs, the promise
resolves. The `<Countries>` component is already suspended on that promise via
`use(channelPromise("countries"))` — now it can hydrate without re-fetching.

That's the core of it. Every meta-framework does some version of this. Here it's
spelled out in ~60 lines.

There's one subtle requirement that bit us: the data getter's promise must be
stable within a request. React retries `use()` calls when suspense resolves, and
if each retry creates a new `Promise`, it never settles. `createServerStore()` in
`stream/render.tsx` memoizes each getter's promise in a `Map` for the lifetime
of the request.

Another thing worth noting: Vite's dev-mode HTML transformation (HMR injection,
plugin hooks) can't run chunk-by-chunk on a streaming response. It has to run
once on a complete template. The `buildDocument()` helper splits the document at
the app root and returns `{ start, end }` fragments — start goes before the stream
output, end goes after — so Vite transforms the template before streaming begins
rather than trying to intercept the stream.

---

## React Server Components

RSC is three separate Vite environments in one build: `rsc`, `ssr`, and `client`.
Understanding why requires understanding what each environment does.

The `rsc` environment runs with the `react-server` export condition. That's what
makes `"use client"` and `"use server"` directives work — the bundler replaces
them with references (for client) or action registrations (for server). This
environment serializes the React tree to a Flight stream: a compact binary-ish
format that describes components, their props, and where client component
boundaries are.

The `ssr` environment takes that Flight stream and renders it to HTML using
`renderToReadableStream` from `react-dom/server.edge`. It doesn't know it's
rendering server components — it just sees a React tree that came back from
`createFromReadableStream`. This produces the initial HTML the browser receives.

The `client` environment boots in the browser. It fetches the same Flight payload
a second time, deserializes it via `createFromFetch`, and calls `hydrateRoot`.
Client components hydrate against their SSR output; server components don't run
at all — their JS was never shipped.

The request flow for a full-page navigation is:

```
GET /rsc
  → entry.rsc.tsx: renderToReadableStream(<Root/>) → Flight stream
  → entry.ssr.tsx: createFromReadableStream(stream) → renderToReadableStream → HTML
  → browser receives HTML, boots entry.browser.tsx
  → entry.browser.tsx: fetch /rsc (Accept: text/x-component) → Flight payload
  → hydrateRoot(document, <BrowserRoot/>)
```

That second fetch is what the browser uses for hydration. It re-runs the RSC
render on the server but skips the SSR step — the response is the raw Flight
payload. This means the server renders the tree twice per navigation (once for
HTML, once for hydration). For the same reason, Server Actions work by POSTing
to the RSC handler with an `x-rsc-action` header — the handler runs the action,
optionally re-renders the tree, and returns a Flight payload the browser applies.

### Session context without passing Request down

Server Components and Server Actions don't receive the `Request` object. Only
`entry.rsc.tsx` does. But anything that needs the session ID — like
`favoritesStore.ts` reading per-user favorites — is called from inside the render
tree, not from the entry point.

The solution is `AsyncLocalStorage`. `entry.rsc.tsx` calls
`runWithSession(sessionId, () => ...)`, which wraps the entire render and any
action it triggers. Anything inside that call can call `getSessionId()` and get
the right value back. This is the same mechanism Next.js uses to back
`cookies()` and `headers()` in Server Components.

### Two Server Action strategies

The `/rsc` and `/rsc/full-rerender` routes exist specifically to show the cost
of naive Server Action implementation.

**`/rsc/full-rerender`:** the `<FavoriteButton>` client component calls
`toggleFavorite(code)`. The RSC handler runs the action, then re-renders
`<Root/>` — the entire tree. That means Countries, Cities, and Weather all run
again with their 3/6/9s delays. A single favorite toggle takes nine seconds to
reflect in the UI because the response can't be sent until the slowest server
component finishes re-rendering.

**`/rsc` (scoped):** `<FavoritesProvider>` is a `"use client"` component that
holds favorites in local state, seeded once with `initialFavorites` from the
server. When the user toggles, `setFavorites` fires immediately (optimistic
update), and `toggleFavorite(code)` is called inside a `startTransition` — fire
and forget. The RSC handler runs the action and returns `{ root: undefined,
returnValue: [...] }`. Because `root` is `undefined`, `entry.browser.tsx` skips
the `setPayload` call entirely. The page never re-renders. The toggle response
time is one network round-trip with no server-component work at all.

The design constraint that makes scoped work: toggling the same country twice is
idempotent. If the optimistic update goes out of sync with server state (e.g.
two rapid toggles), the in-memory store is still correct when the action
completes. No reconciliation needed.

The lesson isn't that full re-render is always wrong. It's that the scope of a
Server Action's side effects should match the scope of UI it actually needs to
update. Scoping state to a client subtree and letting the Server Action be a pure
mutation (not a render trigger) eliminates a lot of latency.

---

## The performance lab

`/lab` runs a simple benchmark: fetch each route with `cache: "no-store"`,
read the response stream to completion, and record time-to-first-byte and total
time. With the 9s weather delay in place, the numbers are stark:

- CSR and stream TTFB: ~10ms (the shell arrives immediately)
- Blocking SSR TTFB: ~9000ms (blocked on all data)
- Total time: CSR finishes early (no server streaming), stream finishes last
  (server keeps writing until weather resolves)
- HTML bytes: CSR is tiny (empty shell); SSR and stream are large (full HTML
  plus embedded data)

None of those numbers require DevTools. The lab makes the architectural
difference immediately legible.

---

## Architecture decisions

**Path-based routing instead of `?mode=`.** An earlier version used a query
param and branched inside a shared `App.tsx`. Each mode now has its own route,
so Express can select a completely different render pipeline per path. This also
makes each mode independently linkable and screenshottable, which matters for
blog posts.

**Shared presentation components, per-mode behavior components.** `CountriesView`
takes `countries: Country[]` and renders cards — it doesn't know or care how the
data arrived. The per-mode `Countries.tsx` in `features/countries/csr/`,
`stream/`, `rsc/scoped/`, etc. owns the fetch/suspend/hydration wiring. Anything
that would behave identically across modes lives in `shared/`; anything that
would differ lives in the per-mode folder.

**Explicit over abstracted.** The streaming data channel, the Flight
pipeline, the session context — all of it is spelled out rather than hidden
behind a library. The goal is that a reader can open `stream/channel.ts` or
`rsc/session.ts` and understand the mechanism without cross-referencing five
other files.

---

## Stack

React 19 · TypeScript · Vite (aliased to `rolldown-vite`) · `@vitejs/plugin-rsc`
· TailwindCSS v4 · Express 5 · `tsx`
