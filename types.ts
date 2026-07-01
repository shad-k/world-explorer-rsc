// Canonical enum of rendering strategies. The active mode is derived from the
// route (path-based routing), not a query param — see CLAUDE.md.
export const RenderMode = {
  CSR: "csr",
  SSR: "ssr",
  STREAM: "stream",
  RSC: "rsc",
} as const;

export type RenderMode = (typeof RenderMode)[keyof typeof RenderMode];
