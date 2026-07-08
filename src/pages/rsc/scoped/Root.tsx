/// <reference types="@vitejs/plugin-rsc/types" />
import "../../../index.css";
import { Suspense } from "react";
import { RenderMode } from "../../../../types";
import { PageShell } from "../../../shared/components/PageShell";
import { FeatureSection } from "../../../shared/components/FeatureSection";
import { CardGridSkeleton } from "../../../shared/components/Skeleton";
import { Countries } from "../../../features/countries/rsc/scoped/Countries";
import { Cities } from "../../../features/cities/rsc/Cities";
import { Weather } from "../../../features/weather/rsc/Weather";
import { Favorites } from "./Favorites";
import { FavoritesProvider } from "./FavoritesContext";
import { listFavorites } from "../favoritesStore";
import { RscVariantSwitcher } from "../RscVariantSwitcher";

// The "scoped" variant of the RSC root — see ../entry.rsc.tsx for how it's
// selected from the URL, and ../full/Root.tsx for the naive comparison.
// FavoritesProvider is seeded once with the session's current favorites (a
// synchronous, undelayed read) and then owns all subsequent updates
// client-side.
export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>World Explorer · RSC (scoped)</title>
        {/* CSS for server components is collected + injected by the plugin. */}
        {import.meta.viteRsc.loadCss()}
      </head>
      <body className="bg-slate-900">
        <div id="root">
          <PageShell mode={RenderMode.RSC}>
            <RscVariantSwitcher active="scoped" />
            <FavoritesProvider initialFavorites={listFavorites()}>
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
            </FavoritesProvider>
          </PageShell>
        </div>
      </body>
    </html>
  );
}
