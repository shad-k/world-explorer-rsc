"use server";

import { toggleFavorite as toggle } from "./favoritesStore";

// A Server Action. The "use server" directive turns this into a server
// reference: the client can call it directly, the plugin POSTs the call to the
// RSC handler, the function runs on the server (mutating server-only state),
// and the RSC tree re-renders with the updated favorites. Zero data-fetching
// code or database access ever reaches the browser.
export async function toggleFavorite(code: string): Promise<string[]> {
  return toggle(code);
}
