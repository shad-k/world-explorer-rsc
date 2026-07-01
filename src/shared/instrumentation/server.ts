// Server-side instrumentation. Logging request lifecycle markers is a
// first-class feature of this lab (CLAUDE.md), not polish: it makes the
// difference between blocking SSR and streaming SSR visible in the terminal.

/** A per-request timer that reports elapsed milliseconds since it was created. */
export interface RequestTimer {
  mode: string;
  elapsed(): number;
  log(event: string, detail?: unknown): void;
}

const RESET = "\x1b[0m";
const MODE_COLORS: Record<string, string> = {
  csr: "\x1b[35m", // magenta
  ssr: "\x1b[34m", // blue
  stream: "\x1b[36m", // cyan
  rsc: "\x1b[32m", // green
};

export function createRequestTimer(mode: string): RequestTimer {
  const start = performance.now();
  const color = MODE_COLORS[mode] ?? "";
  return {
    mode,
    elapsed: () => Math.round(performance.now() - start),
    log(event, detail) {
      const ms = Math.round(performance.now() - start);
      const suffix = detail !== undefined ? ` ${JSON.stringify(detail)}` : "";
      console.log(
        `${color}[server ${mode.padEnd(6)}]${RESET} +${String(ms).padStart(5)}ms  ${event}${suffix}`,
      );
    },
  };
}
