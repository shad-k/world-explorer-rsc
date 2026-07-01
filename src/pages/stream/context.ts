import { createContext } from "react";

// Per-request data store for the server render. Kept in a client-safe module
// (no data getters imported here) so it does not pull the mock datasets into
// the browser bundle. The concrete store is created in render.tsx.
export interface ServerStore {
  get(key: string): Promise<unknown>;
}

export const ServerStoreContext = createContext<ServerStore | null>(null);
