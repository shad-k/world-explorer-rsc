// Presentation-only nav between the two Server Action strategies this RSC
// mode demonstrates side by side. Plain <a> tags (no client JS needed) so
// this stays a zero-JS Server Component like the rest of the page chrome.
export function RscVariantSwitcher({ active }: { active: "scoped" | "full" }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-sm">
      <span className="text-slate-400">Favorite button strategy:</span>
      <a
        href="/rsc"
        className={`rounded px-2 py-1 font-mono ${
          active === "scoped"
            ? "bg-sky-500/20 text-sky-300"
            : "text-slate-400 hover:bg-slate-800"
        }`}
      >
        Scoped update
      </a>
      <a
        href="/rsc/full-rerender"
        className={`rounded px-2 py-1 font-mono ${
          active === "full"
            ? "bg-sky-500/20 text-sky-300"
            : "text-slate-400 hover:bg-slate-800"
        }`}
      >
        Full re-render
      </a>
      <span className="text-xs text-slate-500">
        {active === "scoped"
          ? "— client-side favorites context, no <Root/> re-render on toggle"
          : "— every toggle re-renders and re-fetches the whole page"}
      </span>
    </div>
  );
}
