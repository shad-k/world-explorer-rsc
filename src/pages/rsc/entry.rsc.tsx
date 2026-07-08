/// <reference types="@vitejs/plugin-rsc/types" />
import type { ReactNode } from "react";
import {
  createTemporaryReferenceSet,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { Root as ScopedRoot } from "./scoped/Root";
import { Root as FullRoot } from "./full/Root";
import { createRequestTimer } from "../../shared/instrumentation/server";
import {
  readOrCreateSessionId,
  runWithSession,
  sessionCookieHeader,
} from "./session";

// The payload streamed to both the SSR and browser environments. `root` is the
// server-component tree; `returnValue` carries a Server Action's result back to
// the caller. `root` is omitted (undefined) for Server Action calls that don't
// need the page re-rendered — see the handler below.
export interface RscPayload {
  root: ReactNode;
  returnValue?: unknown;
}

// Two Server Action strategies live side by side under one entry so they can
// be compared directly at /rsc vs /rsc/full-rerender:
//   - /rsc               (scoped)  — favorites are client-side state; a toggle
//     never re-renders <Root/> at all. See ./scoped/.
//   - /rsc/full-rerender  (full)   — the naive default this plugin gives you
//     out of the box: every Server Action call re-renders and re-serializes
//     the ENTIRE tree, including Countries/Cities/Weather's unrelated,
//     artificially slow fetches. See ./full/.
// Both share the same session/persistence layer (session.ts,
// favoritesStore.ts) — only how much of the tree a Server Action touches
// differs.
function isFullRerender(request: Request): boolean {
  return new URL(request.url).pathname.startsWith("/rsc/full-rerender");
}

// The `rsc` environment entry. The plugin expects a default-exported request
// handler. It (1) runs any invoked Server Action, (2) serializes the React tree
// to an RSC/Flight stream, and (3) either returns that stream directly (browser
// Flight fetch) or delegates to the SSR environment for HTML.
export default async function handler(request: Request): Promise<Response> {
  const fullRerender = isFullRerender(request);
  const timer = createRequestTimer(fullRerender ? "rsc-full" : "rsc-scoped");
  timer.log(`request received (${request.method})`);

  // Server-owned state (favoritesStore) is scoped per-session. The session id
  // rides in a cookie; runWithSession makes it available via getSessionId()
  // anywhere in the render/action call tree below, without threading it
  // through every component's props.
  const { sessionId, isNew } = readOrCreateSessionId(request);

  const response = await runWithSession(sessionId, async () => {
    let returnValue: unknown;
    let temporaryReferences:
      ReturnType<typeof createTemporaryReferenceSet> | undefined;

    const actionId = request.headers.get("x-rsc-action");
    if (actionId) {
      // A Server Action call from the browser.
      const contentType = request.headers.get("content-type") ?? "";
      const body = contentType.startsWith("multipart/form-data")
        ? await request.formData()
        : await request.text();
      temporaryReferences = createTemporaryReferenceSet();
      const args = await decodeReply(body, { temporaryReferences });
      const action = await loadServerAction(actionId);
      returnValue = await action(...(args as unknown[]));
      timer.log(`server action ran: ${actionId}`);
    }

    // The full-rerender variant always re-renders <Root/>, even for actions —
    // that's the entire point of the comparison. The scoped variant only
    // renders it for real navigations; a favorite toggle there needs nothing
    // more than its return value (see ./scoped/FavoritesContext.tsx).
    const RootComponent = fullRerender ? FullRoot : ScopedRoot;
    const payload: RscPayload = {
      root: !fullRerender && actionId ? undefined : <RootComponent />,
      returnValue,
    };
    const rscStream = renderToReadableStream<RscPayload>(payload, {
      temporaryReferences,
    });
    timer.log("flight stream created");

    // Direct Flight payload request (initial browser fetch + action responses).
    if (request.headers.get("accept")?.includes("text/x-component")) {
      return new Response(rscStream, {
        headers: { "content-type": "text/x-component;charset=utf-8" },
      });
    }

    // Full-page navigation: delegate to the SSR environment to produce HTML.
    const ssr = await import.meta.viteRsc.loadModule<
      typeof import("./entry.ssr")
    >("ssr", "index");
    const htmlStream = await ssr.renderHtml(rscStream);
    timer.log("html stream handed off");
    return new Response(htmlStream, {
      headers: { "content-type": "text/html;charset=utf-8" },
    });
  });

  if (isNew)
    response.headers.append("set-cookie", sessionCookieHeader(sessionId));
  return response;
}

if (import.meta.hot) import.meta.hot.accept();
