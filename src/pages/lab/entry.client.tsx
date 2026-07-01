import "../../index.css";
import { hydrateRoot } from "react-dom/client";
import { LabPage } from "./LabPage";
import { logBrowser } from "../../shared/instrumentation/browser";

logBrowser("lab", "hydration start");
hydrateRoot(document.getElementById("root")!, <LabPage />);
