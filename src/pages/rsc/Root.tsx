/// <reference types="@vitejs/plugin-rsc/types" />
import "../../index.css";
import { Suspense } from "react";
import { RenderMode } from "../../../types";
import { PageShell } from "../../shared/components/PageShell";
import { FeatureSection } from "../../shared/components/FeatureSection";
import { CardGridSkeleton } from "../../shared/components/Skeleton";
import { Countries } from "../../features/countries/rsc/Countries";
import { Cities } from "../../features/cities/rsc/Cities";
import { Weather } from "../../features/weather/rsc/Weather";
import { Favorites } from "./Favorites";

// The RSC root renders the ENTIRE document. It is serialized to a Flight payload
// on the server (streaming, with Suspense) and streamed as HTML alongside it;
// the browser hydrates the whole document. Server components here ship no JS —
// only the FavoriteButton "use client" leaf does.
export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>World Explorer · RSC</title>
        {/* CSS for server components is collected + injected by the plugin. */}
        {import.meta.viteRsc.loadCss()}
      </head>
      <body className="bg-slate-900">
        <div id="root">
          <PageShell mode={RenderMode.RSC}>
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
