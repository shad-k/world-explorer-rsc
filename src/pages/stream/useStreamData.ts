import { use, useContext } from "react";
import { ServerStoreContext } from "./context";
import { channelPromise } from "./channel";

// Reads a feature's data during streaming SSR.
//   - On the server: from the per-request store (an in-process delayed fetch).
//     Suspending here is what lets renderToPipeableStream flush the fallback
//     first and stream the real HTML once the data resolves.
//   - On the client: from the streaming channel, which is resolved by the inline
//     data script the server emitted next to this feature's HTML.
// `use()` may be called conditionally in React 19, so the branch is fine.
export function useStreamData<T>(key: string): T {
  const store = useContext(ServerStoreContext);
  if (typeof window === "undefined") {
    return use(store!.get(key)) as T;
  }
  return use(channelPromise(key)) as T;
}
