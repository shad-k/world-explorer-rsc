import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// One client bundle per mode. The Express server picks the right entry per
// route and reads the build manifest to resolve hashed asset URLs in prod.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext",
    manifest: true,
    outDir: "dist/client",
    rollupOptions: {
      input: {
        landing: "src/pages/landing/entry.client.tsx",
        csr: "src/pages/csr/entry.client.tsx",
        ssr: "src/pages/ssr/entry.client.tsx",
        stream: "src/pages/stream/entry.client.tsx",
        lab: "src/pages/lab/entry.client.tsx",
      },
    },
  },
});
