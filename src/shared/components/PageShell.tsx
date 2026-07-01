import type { ReactNode } from "react";
import { RenderMode } from "../../../types";
import { MODES, getModeInfo } from "../modes";

// Shared dark-theme layout: header, mode navigation, and a mode badge. This is
// presentation-only chrome identical across modes, so it is shared. The active
// mode is passed in (each page knows its own mode) rather than inferred.
export function PageShell({
  mode,
  children,
}: {
  mode: RenderMode;
  children: ReactNode;
}) {
  const info = getModeInfo(mode);
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <a href="/" className="text-lg font-bold text-slate-100">
            🌍 World Explorer
            <span className="ml-2 text-xs font-normal text-slate-500">
              React 19 Rendering Lab
            </span>
          </a>
          <nav className="flex items-center gap-1 text-sm">
            {MODES.map((m) => (
              <a
                key={m.path}
                href={m.path}
                className={`rounded px-2 py-1 font-mono ${
                  m.mode === mode
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {m.label}
              </a>
            ))}
            <a
              href="/lab"
              className="rounded px-2 py-1 text-slate-400 hover:bg-slate-800"
            >
              Lab
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-sky-500/20 px-2 py-1 font-mono text-sm font-bold text-sky-300">
              {info.label}
            </span>
            <h1 className="text-2xl font-bold text-slate-100">{info.tagline}</h1>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            {info.description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
