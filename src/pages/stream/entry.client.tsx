import "../../index.css";
import { hydrateRoot } from "react-dom/client";
import { StreamPage } from "./StreamPage";
import { initClientChannel } from "./channel";
import { logBrowser } from "../../shared/instrumentation/browser";

// Wire up the streaming channel BEFORE hydrating so any data already emitted
// inline is drained, and data still streaming resolves as it arrives.
initClientChannel();
logBrowser("stream", "hydration start");
hydrateRoot(document.getElementById("root")!, <StreamPage />);
logBrowser("stream", "hydration scheduled");
