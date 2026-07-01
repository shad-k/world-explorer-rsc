import "../../index.css";
import { createRoot } from "react-dom/client";
import { CsrPage } from "./CsrPage";
import { logBrowser } from "../../shared/instrumentation/browser";

// CSR mounts a fresh root (createRoot, not hydrate) into the empty shell.
logBrowser("csr", "client bundle executing");
const root = createRoot(document.getElementById("root")!);
logBrowser("csr", "mount start (fetching begins client-side)");
root.render(<CsrPage />);
