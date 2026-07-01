import { useState } from "react";
import { RenderMode } from "../../../types";
import { PageShell } from "../../shared/components/PageShell";
import { MODES } from "../../shared/modes";
import { formatNumber } from "../../shared/utils/format";

// Measures each mode by fetching its route and reading the response stream:
//  - TTFB: time to the FIRST byte. This is the headline metric — it exposes the
//    streaming vs. blocking difference (stream flushes its shell in ~10ms while
//    blocking SSR withholds everything until the 3s data resolves).
//  - Total: time until the response stream completes.
//  - HTML bytes: transfer size of the document (CSR ships a tiny empty shell).
interface Result {
  ttfb: number;
  total: number;
  bytes: number;
  error?: string;
}

async function measure(path: string): Promise<Result> {
  const t0 = performance.now();
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok || !res.body) {
      return { ttfb: 0, total: 0, bytes: 0, error: `HTTP ${res.status}` };
    }
    const reader = res.body.getReader();
    let ttfb: number | null = null;
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (ttfb === null) ttfb = performance.now() - t0;
      bytes += value.byteLength;
    }
    return { ttfb: ttfb ?? 0, total: performance.now() - t0, bytes };
  } catch (e) {
    return { ttfb: 0, total: 0, bytes: 0, error: (e as Error).message };
  }
}

const ms = (n: number) => `${Math.round(n)} ms`;

export function LabPage() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState(false);

  async function runAll() {
    setRunning(true);
    setResults({});
    // Sequentially so measurements don't contend for the server/network.
    for (const m of MODES) {
      const r = await measure(m.path);
      setResults((prev) => ({ ...prev, [m.path]: r }));
    }
    setRunning(false);
  }

  return (
    <PageShell mode={RenderMode.RSC /* nav highlight is cosmetic here */}>
      <div className="-mt-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={runAll}
            disabled={running}
            className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-slate-900 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {running ? "Running…" : "▶ Run benchmark"}
          </button>
          <p className="text-sm text-slate-400">
            Fetches each route and reads the stream. Watch how{" "}
            <span className="text-sky-300">TTFB</span> stays low for streaming
            while blocking SSR waits for all data.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">TTFB</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">HTML bytes</th>
                <th className="px-4 py-3">Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MODES.map((m) => {
                const r = results[m.path];
                return (
                  <tr key={m.path} className="text-slate-200">
                    <td className="px-4 py-3">
                      <a
                        href={m.path}
                        className="font-mono font-bold text-sky-300 hover:underline"
                      >
                        {m.label}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r ? (r.error ? "—" : ms(r.ttfb)) : "·"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r ? (r.error ? "—" : ms(r.total)) : "·"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r ? (r.error ? r.error : formatNumber(r.bytes)) : "·"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {m.tagline}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Tip: open DevTools → Network and reload each route to inspect the raw
          HTML/stream chunks, the Flight payload (RSC), JS bundle size, and the
          hydration timings logged to the console.
        </p>
      </div>
    </PageShell>
  );
}
