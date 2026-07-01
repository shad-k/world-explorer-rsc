import type { ReactNode } from "react";
import type { Country } from "../../shared/types/domain";
import { Card, CardGrid } from "../../shared/components/Card";
import { formatCompact } from "../../shared/utils/format";

// SHARED presentation-only component. It just renders the countries it is
// given — no fetching, no suspense, no hydration logic. Every rendering mode
// funnels its resolved data through this same view (CLAUDE.md principle 3).
//
// `renderAction` is an optional slot: the RSC mode uses it to drop an
// interactive "use client" favorite button into an otherwise server-rendered
// card. Other modes omit it. This keeps the view shared instead of forking it.
export function CountriesView({
  countries,
  renderAction,
}: {
  countries: Country[];
  renderAction?: (country: Country) => ReactNode;
}) {
  return (
    <CardGrid>
      {countries.map((c) => (
        <Card key={c.code}>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{c.flag}</span>
            <div>
              <div className="font-semibold text-slate-100">{c.name}</div>
              <div className="text-xs text-slate-400">{c.region}</div>
            </div>
            {renderAction && <div className="ml-auto">{renderAction(c)}</div>}
          </div>
          <dl className="mt-3 space-y-1 text-sm text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">Capital</dt>
              <dd>{c.capital}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Population</dt>
              <dd>{formatCompact(c.population)}</dd>
            </div>
          </dl>
        </Card>
      ))}
    </CardGrid>
  );
}
