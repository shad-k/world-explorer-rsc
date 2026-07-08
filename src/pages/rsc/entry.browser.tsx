/// <reference types="@vitejs/plugin-rsc/types" />
import { startTransition, useState, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  createFromFetch,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import type { RscPayload } from "./entry.rsc";
import { logBrowser } from "../../shared/instrumentation/browser";

// The `client` environment entry (the RSC browser runtime). It:
//  1. registers a server callback so Server Action calls POST to the RSC
//     handler and re-render the tree with the returned Flight payload,
//  2. fetches the initial Flight payload and hydrates the document.
let setPayload: (v: RscPayload) => void;

async function callServer(id: string, args: unknown[]): Promise<unknown> {
  logBrowser("rsc", `server action call: ${id}`);
  const temporaryReferences = createTemporaryReferenceSet();
  const body = await encodeReply(args, { temporaryReferences });
  const payload = await createFromFetch<RscPayload>(
    fetch(window.location.href, {
      method: "POST",
      headers: { "x-rsc-action": id, accept: "text/x-component" },
      body,
    }),
    { temporaryReferences },
  );
  // Action calls that don't touch the page tree omit `root` entirely (see
  // entry.rsc.tsx) — skip applying it rather than blanking the page.
  if (payload.root !== undefined) {
    startTransition(() => setPayload(payload));
  }
  return payload.returnValue;
}
setServerCallback(callServer);

async function main() {
  logBrowser("rsc", "fetch initial flight payload");
  const initialPayload = await createFromFetch<RscPayload>(
    fetch(window.location.href, { headers: { accept: "text/x-component" } }),
  );

  function BrowserRoot() {
    const [payload, set] = useState(initialPayload);
    // Expose the state setter so callServer can push a re-rendered tree. This
    // module-level handoff is the documented RSC browser pattern.
    // eslint-disable-next-line react-hooks/globals
    setPayload = set;
    return payload.root as ReactNode;
  }

  logBrowser("rsc", "hydration start");
  startTransition(() => {
    hydrateRoot(document, <BrowserRoot />);
  });
}

main();
