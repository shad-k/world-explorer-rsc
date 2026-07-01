// CSR data-fetching strategy: everything happens in the browser. Each feature
// fetches its own JSON endpoint (which carries the deliberate delay) and the
// promise is cached so <Suspense> + `use()` can read it. This is the behavior
// that genuinely differs from the other modes, so it lives with the CSR mode.
const cache = new Map<string, Promise<unknown>>();

export function csrResource<T>(key: string): Promise<T> {
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/api/${key}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch /api/${key}`);
        return r.json();
      }),
    );
  }
  return cache.get(key)! as Promise<T>;
}
