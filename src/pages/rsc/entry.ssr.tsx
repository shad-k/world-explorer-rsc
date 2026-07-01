/// <reference types="@vitejs/plugin-rsc/types" />
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream } from "react-dom/server.edge";
import type { RscPayload } from "./entry.rsc";

// The `ssr` environment entry. It deserializes the Flight stream back into a
// React tree and renders it to HTML (traditional SSR), injecting the bootstrap
// script that boots the browser entry for hydration.
export async function renderHtml(
  rscStream: ReadableStream<Uint8Array>,
): Promise<ReadableStream<Uint8Array>> {
  const payload = await createFromReadableStream<RscPayload>(rscStream);
  const bootstrapScriptContent =
    await import.meta.viteRsc.loadBootstrapScriptContent("index");

  return renderToReadableStream(payload.root, { bootstrapScriptContent });
}
