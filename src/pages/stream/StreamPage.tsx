import { Suspense } from "react";
import { RenderMode } from "../../../types";
import { PageShell } from "../../shared/components/PageShell";
import { FeatureSection } from "../../shared/components/FeatureSection";
import { CardGridSkeleton } from "../../shared/components/Skeleton";
import { Countries } from "../../features/countries/stream/Countries";
import { Cities } from "../../features/cities/stream/Cities";
import { Weather } from "../../features/weather/stream/Weather";

// Rendered identically on the server (via renderToPipeableStream, wrapped in a
// ServerStore provider) and on the client (hydrateRoot). Each feature has its
// own <Suspense> boundary, so the shell + skeletons flush immediately and each
// section streams in when its data resolves (Countries 1s, Cities 2s, Weather 3s).
export function StreamPage() {
  return (
    <PageShell mode={RenderMode.STREAM}>
      <div className="space-y-8">
        <FeatureSection feature="countries" title="Countries" icon="🗺️">
          <Suspense fallback={<CardGridSkeleton />}>
            <Countries />
          </Suspense>
        </FeatureSection>
        <FeatureSection feature="cities" title="Major Cities" icon="🏙️">
          <Suspense fallback={<CardGridSkeleton />}>
            <Cities />
          </Suspense>
        </FeatureSection>
        <FeatureSection feature="weather" title="Weather" icon="🌦️">
          <Suspense fallback={<CardGridSkeleton />}>
            <Weather />
          </Suspense>
        </FeatureSection>
      </div>
    </PageShell>
  );
}
