import { RenderMode } from "../types";
import CSRApp from "./csr/CSRApp";
import SSRApp from "./ssr/SSRApp";
import StreamingRenderingApp from "./stream/StreamingRenderingApp";

function App({ mode }: { mode: RenderMode }) {
  console.log("Render mode in App:", mode);
  return (
    <main className="min-h-screen p-8">
      {mode === RenderMode.STREAM ? (
        <StreamingRenderingApp />
      ) : mode === RenderMode.CSR ? (
        <CSRApp />
      ) : mode === RenderMode.SSR ? (
        <SSRApp />
      ) : (
        <div>Unsupported render mode</div>
      )}
    </main>
  );
}

export default App;
