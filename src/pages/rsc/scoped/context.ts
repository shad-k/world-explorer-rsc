import { createContext } from "react";

// Client-safe context definition, kept in its own non-component module so
// FavoritesProvider.tsx and useFavorites.ts can both import it without
// tripping the Fast Refresh "only export components" rule (same split as
// stream mode's context.ts / useStreamData.ts).
export interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (code: string) => boolean;
  toggle: (code: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);
