import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

// Server Actions and Server Components never see the incoming Request object
// directly — only entry.rsc.tsx does. AsyncLocalStorage carries the current
// request's session id down through the render/action call tree, which is the
// same mechanism Next.js uses internally to back request-scoped `cookies()` /
// `headers()` inside Server Components and Server Actions.
const sessionContext = new AsyncLocalStorage<{ sessionId: string }>();

const COOKIE_NAME = "session_id";

/** Reads the session id set by the current request's `runWithSession` call. */
export function getSessionId(): string {
  const store = sessionContext.getStore();
  if (!store) {
    throw new Error("getSessionId() called outside of a request scope");
  }
  return store.sessionId;
}

export function runWithSession<T>(sessionId: string, fn: () => T): T {
  return sessionContext.run({ sessionId }, fn);
}

/** Reads the session id from the request's Cookie header, or mints a new one. */
export function readOrCreateSessionId(request: Request): {
  sessionId: string;
  isNew: boolean;
} {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${COOKIE_NAME}=`));

  if (cookie) {
    return { sessionId: cookie.slice(COOKIE_NAME.length + 1), isNew: false };
  }
  return { sessionId: randomUUID(), isNew: true };
}

export function sessionCookieHeader(sessionId: string): string {
  return `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
}
