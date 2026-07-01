import "../../index.css";
import { hydrateRoot } from "react-dom/client";
import { SsrPage, type SsrData } from "./SsrPage";
import { logBrowser } from "../../shared/instrumentation/browser";

// SSR hydration: read the data the server embedded, then hydrate the existing
// server HTML with the exact same props (no client re-fetch, no mismatch).
declare global {
  interface Window {
    __SSR_DATA__?: SsrData;
  }
}

const data = window.__SSR_DATA__!;
logBrowser("ssr", "hydration start");
hydrateRoot(document.getElementById("root")!, <SsrPage data={data} />);
logBrowser("ssr", "hydration scheduled");
