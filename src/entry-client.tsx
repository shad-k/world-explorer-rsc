import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <App mode={window.__RENDER_MODE__} />
  </StrictMode>,
);
