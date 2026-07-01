import fs from "node:fs";
import path from "node:path";

// Resolves the <script>/<link> tags for a client entry.
//
// In dev, Vite serves source modules directly, so the entry source path is used
// verbatim (Vite compiles + injects CSS on import). In prod, we read the Vite
// build manifest to map the entry to its hashed JS + CSS assets.

export interface ClientAssets {
  scripts: string[];
  styles: string[];
}

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
    // Dev: Vite handles CSS injection when the entry module is imported.
    return { scripts: [entry], styles: [] };
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
