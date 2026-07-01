import type { City } from "../../shared/types/domain";
import { Card, CardGrid } from "../../shared/components/Card";
import { formatCompact } from "../../shared/utils/format";

// SHARED presentation-only component (see CLAUDE.md principle 3).
export function CitiesView({ cities }: { cities: City[] }) {
  return (
    <CardGrid>
      {cities.map((c) => (
        <Card key={`${c.countryCode}-${c.name}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">{c.name}</span>
            {c.isCapital && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                capital
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">{c.country}</div>
          <div className="mt-2 text-sm text-slate-300">
            {formatCompact(c.population)} people
          </div>
        </Card>
      ))}
    </CardGrid>
  );
}
