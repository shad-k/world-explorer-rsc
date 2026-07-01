import type { Weather } from "../../shared/types/domain";
import { Card, CardGrid } from "../../shared/components/Card";

// SHARED presentation-only component (see CLAUDE.md principle 3).
export function WeatherView({ weather }: { weather: Weather[] }) {
  return (
    <CardGrid>
      {weather.map((w) => (
        <Card key={`${w.countryCode}-${w.city}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">{w.city}</span>
            <span className="text-3xl">{w.icon}</span>
          </div>
          <div className="mt-1 text-3xl font-bold text-slate-100">
            {w.temperatureC}°C
          </div>
          <div className="text-sm text-slate-400">{w.condition}</div>
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            <span>💧 {w.humidity}%</span>
            <span>💨 {w.windKph} kph</span>
          </div>
        </Card>
      ))}
    </CardGrid>
  );
}
