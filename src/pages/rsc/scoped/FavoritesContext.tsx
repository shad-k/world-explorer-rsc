"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toggleFavorite } from "../actions";
import { FavoritesContext } from "./context";

// Client-owned favorites state, seeded once from the server's actual session
// state (`initialFavorites`, read synchronously by Root — no delay). The
// Server Action still owns persistence (every toggle calls it), but the UI no
// longer waits for a network round trip, and no longer waits for a fresh
// <Root/> render — which would re-run the unrelated, artificially slow
// Countries/Cities/Weather fetches (see ../entry.rsc.tsx). Toggling the same
// code twice nets back to the same state regardless of order, so applying
// this optimistically and firing the action in the background needs no
// reconciliation with the response.
//
// This is the "scoped" half of the /rsc vs /rsc/full-rerender comparison —
// see ../entry.rsc.tsx and ../full/ for the naive alternative.
export function FavoritesProvider({
  initialFavorites,
  children,
}: {
  initialFavorites: string[];
  children: ReactNode;
}) {
  const [favorites, setFavorites] = useState(() => new Set(initialFavorites));
  const [, startTransition] = useTransition();

  function toggle(code: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    startTransition(async () => {
      await toggleFavorite(code); // fire-and-forget persistence
    });
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite: (code) => favorites.has(code), toggle }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
