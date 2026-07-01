import { RenderMode } from "../../../types";
import { PageShell } from "../../shared/components/PageShell";
import { FeatureSection } from "../../shared/components/FeatureSection";
import { CountriesView } from "../../features/countries/CountriesView";
import { CitiesView } from "../../features/cities/CitiesView";
import { WeatherView } from "../../features/weather/WeatherView";
import type { City, Country, Weather } from "../../shared/types/domain";

export interface SsrData {
  countries: Country[];
  cities: City[];
  weather: Weather[];
}

// Blocking SSR: all data is already resolved (server waited for it), so there
// are no Suspense boundaries — everything renders at once, both on the server
// and on hydration. Data is passed as props; the same props are used on the
// client (read from the embedded __SSR_DATA__) so hydration matches exactly.
export function SsrPage({ data }: { data: SsrData }) {
  return (
    <PageShell mode={RenderMode.SSR}>
      <div className="space-y-8">
        <FeatureSection feature="countries" title="Countries" icon="🗺️">
          <CountriesView countries={data.countries} />
        </FeatureSection>
        <FeatureSection feature="cities" title="Major Cities" icon="🏙️">
          <CitiesView cities={data.cities} />
        </FeatureSection>
        <FeatureSection feature="weather" title="Weather" icon="🌦️">
          <WeatherView weather={data.weather} />
        </FeatureSection>
      </div>
    </PageShell>
  );
}
