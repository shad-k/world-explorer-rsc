import { RenderMode } from "../../types";

// Canonical description of each rendering mode. The mode is derived from the
// route (path-based routing), not a query param. Used by the landing page,
// the nav, and the performance lab.
export interface ModeInfo {
  mode: RenderMode;
  path: string;
  label: string;
  tagline: string;
  description: string;
}

export const MODES: ModeInfo[] = [
  {
    mode: RenderMode.CSR,
    path: "/csr",
    label: "CSR",
    tagline: "Client-Side Rendering",
    description:
      "Server returns a near-empty shell. The browser downloads JS, React mounts, and data is fetched client-side. Classic SPA behavior.",
  },
  {
    mode: RenderMode.SSR,
    path: "/ssr",
    label: "SSR",
    tagline: "Blocking Server-Side Rendering",
    description:
      "Server waits for all data, renders complete HTML with renderToString, and sends it once. The client then hydrates.",
  },
  {
    mode: RenderMode.STREAM,
    path: "/stream",
    label: "Streaming",
    tagline: "Streaming SSR",
    description:
      "renderToPipeableStream flushes the shell and Suspense fallbacks immediately; each section streams in as its data resolves; hydration follows.",
  },
  {
    mode: RenderMode.RSC,
    path: "/rsc",
    label: "RSC",
    tagline: "React Server Components",
    description:
      "Server Components render on the server and stream as a Flight payload alongside HTML. They ship zero JS. Client components hydrate; includes a Server Action.",
  },
];

export function getModeInfo(mode: RenderMode): ModeInfo {
  const info = MODES.find((m) => m.mode === mode);
  if (!info) throw new Error(`Unknown render mode: ${mode}`);
  return info;
}
