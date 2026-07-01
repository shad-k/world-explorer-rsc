import { MODES } from "../../shared/modes";

// Static landing page. It is server-rendered with renderToString and ships no
// hydration JS (its client entry only injects CSS) — a useful zero-JS baseline
// to contrast against the interactive modes.
export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-100">🌍 World Explorer</h1>
        <p className="mt-1 text-lg text-sky-400">
          A React 19 rendering laboratory
        </p>
        <p className="mt-4 max-w-2xl text-slate-400">
          The same trivial country/city/weather data, rendered four different
          ways. Each mode has its own route so you can open DevTools and watch
          exactly what the browser receives over the wire, how much JavaScript
          ships, and when the page becomes interactive. All wired up by hand
          with React + Vite + Express — no meta-framework.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MODES.map((m) => (
            <a
              key={m.path}
              href={m.path}
              className="group rounded-lg border border-slate-700 bg-slate-800/60 p-5 transition hover:border-sky-500 hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="rounded bg-sky-500/20 px-2 py-1 font-mono text-sm font-bold text-sky-300">
                  {m.label}
                </span>
                <span className="font-semibold text-slate-100 group-hover:text-sky-300">
                  {m.tagline}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{m.description}</p>
            </a>
          ))}
        </div>

        <a
          href="/lab"
          className="mt-6 inline-block rounded-lg border border-amber-600/50 bg-amber-500/10 px-5 py-3 font-semibold text-amber-300 transition hover:bg-amber-500/20"
        >
          📊 Open the Performance Lab →
        </a>
      </div>
    </div>
  );
}
