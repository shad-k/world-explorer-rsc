import type { ReactNode } from "react";

// Presentation-only. Renders props, no data fetching, no mode-specific logic —
// therefore shared across every rendering mode.
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800/60 p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
