import fs from "node:fs";
import path from "node:path";

// Resolves the <script>/<link> tags for a client entry.
//
// In dev, Vite serves source modules directly, so the entry source path is used
// verbatim. The global stylesheet is linked in the <head> via Vite's `?direct`
// query (which serves the compiled CSS as text/css) so first paint is styled —
// otherwise CSS would only arrive when the entry's `import "./index.css"` runs,
// causing a flash of unstyled content. In prod, we read the Vite build manifest
// to map the entry to its hashed JS + CSS assets.

export interface ClientAssets {
  scripts: string[];
  styles: string[];
}

// Every client entry imports this same global stylesheet, so linking it up front
// covers all modes in dev.
const DEV_GLOBAL_CSS = "/src/index.css?direct";

let manifestCache: Record<string, ManifestChunk> | null = null;

interface ManifestChunk {
  file: string;
  css?: string[];
  imports?: string[];
}

function loadManifest(): Record<string, ManifestChunk> {
  if (manifestCache) return manifestCache;
  const manifestPath = path.resolve("dist/client/.vite/manifest.json");
  manifestCache = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  return manifestCache!;
}

export function resolveClientAssets(
  entry: string,
  isProduction: boolean,
): ClientAssets {
  if (!isProduction) {
    // Dev: link the compiled global CSS in <head> for a styled first paint; the
    // entry's own `import "./index.css"` still drives HMR at runtime.
    return { scripts: [entry], styles: [DEV_GLOBAL_CSS] };
  }

  const manifest = loadManifest();
  // Manifest keys are project-relative and omit the leading "/".
  const key = entry.replace(/^\//, "");
  const chunk = manifest[key];
  if (!chunk) {
    throw new Error(`No manifest entry for client entry "${key}"`);
  }

  const styles = new Set<string>(chunk.css ?? []);
  // Pull in CSS from statically imported chunks too.
  for (const imp of chunk.imports ?? []) {
    for (const css of manifest[imp]?.css ?? []) styles.add(css);
  }

  return {
    scripts: [`/${chunk.file}`],
    styles: [...styles].map((s) => `/${s}`),
  };
}
