import { FEATURE_DELAYS } from "../constants/delays";
import type { FeatureName } from "../types/domain";

// Presentation-only header shown above every feature section. Displays the
// deliberate delay so a reader can correlate it with when the section appears.
export function SectionHeader({
  feature,
  title,
  icon,
}: {
  feature: FeatureName;
  title: string;
  icon: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold text-slate-100">
        <span className="mr-2">{icon}</span>
        {title}
      </h2>
      <span className="rounded bg-slate-700/60 px-2 py-0.5 font-mono text-xs text-slate-400">
        {FEATURE_DELAYS[feature]}ms delay
      </span>
    </div>
  );
}
