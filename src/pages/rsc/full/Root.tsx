/// <reference types="@vitejs/plugin-rsc/types" />
import "../../../index.css";
import { Suspense } from "react";
import { RenderMode } from "../../../../types";
import { PageShell } from "../../../shared/components/PageShell";
import { FeatureSection } from "../../../shared/components/FeatureSection";
import { CardGridSkeleton } from "../../../shared/components/Skeleton";
import { Countries } from "../../../features/countries/rsc/full/Countries";
import { Cities } from "../../../features/cities/rsc/Cities";
import { Weather } from "../../../features/weather/rsc/Weather";
import { Favorites } from "./Favorites";
import { RscVariantSwitcher } from "../RscVariantSwitcher";

// The "full re-render" variant of the RSC root — the naive default: every
// Server Action call re-renders and re-serializes this ENTIRE tree, including
// Countries/Cities/Weather's unrelated, artificially slow fetches. Kept side
// by side with ../scoped/Root.tsx (the fix) so the two Server Action
// strategies can be compared directly. See ../entry.rsc.tsx for how the
// variant is selected from the URL.
export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>World Explorer · RSC (full re-render)</title>
        {/* CSS for server components is collected + injected by the plugin. */}
        {import.meta.viteRsc.loadCss()}
      </head>
      <body className="bg-slate-900">
        <div id="root">
          <PageShell mode={RenderMode.RSC}>
            <RscVariantSwitcher active="full" />
            <div className="space-y-8">
              <Favorites />
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
        </div>
      </body>
    </html>
  );
}
