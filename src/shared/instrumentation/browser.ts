// Browser-side instrumentation. Logs hydration + performance markers to the
// console so the client lifecycle of each rendering mode is observable, and
// exposes a tiny timing store that the performance lab reads.

export interface BrowserTiming {
  mode: string;
  event: string;
  /** ms since navigation start (performance.now). */
  at: number;
}

declare global {
  interface Window {
    __WE_TIMINGS__?: BrowserTiming[];
  }
}

function store(): BrowserTiming[] {
  if (typeof window === "undefined") return [];
  return (window.__WE_TIMINGS__ ??= []);
}

export function logBrowser(mode: string, event: string, detail?: unknown): void {
  if (typeof window === "undefined") return;
  const at = Math.round(performance.now());
  store().push({ mode, event, at });
  const rest = detail !== undefined ? [detail] : [];
  console.log(
    `%c[browser ${mode}]%c +${at}ms  ${event}`,
    "color:#38bdf8;font-weight:bold",
    "color:inherit",
    ...rest,
  );
}

export function getTimings(): BrowserTiming[] {
  return store();
}
