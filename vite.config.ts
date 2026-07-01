import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";

// The RSC plugin sets up three environments (rsc / ssr / client). We disable its
// catch-all dev middleware (serverHandler: false) so Express keeps ownership of
// routing and drives the RSC entry only for the /rsc route. The traditional
// modes (CSR/SSR/Stream) continue to run through Vite's default ssr environment.
export default defineConfig({
  plugins: [
    rsc({ serverHandler: false }),
    react(),
    tailwindcss(),
  ],
  build: {
    target: "esnext",
    manifest: true,
  },
  environments: {
    client: {
      build: {
        outDir: "dist/client",
        rollupOptions: {
          input: {
            // RSC browser entry (referenced by loadBootstrapScriptContent).
            index: "src/pages/rsc/entry.browser.tsx",
            // One client bundle per traditional mode + the lab.
            landing: "src/pages/landing/entry.client.tsx",
            csr: "src/pages/csr/entry.client.tsx",
            ssr: "src/pages/ssr/entry.client.tsx",
            stream: "src/pages/stream/entry.client.tsx",
            lab: "src/pages/lab/entry.client.tsx",
          },
        },
      },
    },
    ssr: {
      build: {
        outDir: "dist/ssr",
        rollupOptions: { input: { index: "src/pages/rsc/entry.ssr.tsx" } },
      },
    },
    rsc: {
      build: {
        outDir: "dist/rsc",
        rollupOptions: { input: { index: "src/pages/rsc/entry.rsc.tsx" } },
      },
    },
  },
});
