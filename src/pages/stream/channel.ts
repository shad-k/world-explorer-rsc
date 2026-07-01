// The streaming data channel.
//
// In streaming SSR the server flushes each feature's HTML as its data resolves.
// For the client to hydrate that boundary WITHOUT re-fetching, the resolved
// data is emitted inline (see StreamDataScript) right next to the HTML. Those
// inline scripts push [key, data] onto window.__WE_DATA__.
//
// This module turns that queue into promises the client components can `use()`.
// It is the same technique meta-frameworks use, implemented explicitly.

type Resolver = (data: unknown) => void;

const promises = new Map<string, Promise<unknown>>();
const resolvers = new Map<string, Resolver>();

function ensure(key: string) {
  if (!promises.has(key)) {
    promises.set(
      key,
      new Promise<unknown>((resolve) => resolvers.set(key, resolve)),
    );
  }
}

/** A promise for a feature's data, resolved once the inline script arrives. */
export function channelPromise(key: string): Promise<unknown> {
  ensure(key);
  return promises.get(key)!;
}

export function resolveChannel(key: string, data: unknown) {
  ensure(key);
  resolvers.get(key)?.(data);
  resolvers.delete(key);
}

type DataQueue = [string, unknown][];

declare global {
  interface Window {
    __WE_DATA__?: DataQueue;
  }
}

/**
 * Client bootstrap. Drains data emitted before the bundle loaded, then patches
 * `push` so data streamed in afterwards resolves its channel immediately.
 */
export function initClientChannel() {
  if (typeof window === "undefined") return;
  const q: DataQueue = (window.__WE_DATA__ ??= []);
  const drain = ([key, data]: [string, unknown]) => resolveChannel(key, data);
  q.forEach(drain);
  q.length = 0;
  q.push = (...entries: [string, unknown][]) => {
    entries.forEach(drain);
    return 0;
  };
}
