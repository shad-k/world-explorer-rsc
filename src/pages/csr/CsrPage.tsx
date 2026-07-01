import { Suspense } from "react";
import { RenderMode } from "../../../types";
import { PageShell } from "../../shared/components/PageShell";
import { FeatureSection } from "../../shared/components/FeatureSection";
import { CardGridSkeleton } from "../../shared/components/Skeleton";
import { Countries } from "../../features/countries/csr/Countries";
import { Cities } from "../../features/cities/csr/Cities";
import { Weather } from "../../features/weather/csr/Weather";

// The CSR page is rendered entirely in the browser. Each feature gets its own
// <Suspense> boundary so the skeletons show while the client fetches.
export function CsrPage() {
  return (
    <PageShell mode={RenderMode.CSR}>
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
