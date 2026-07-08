"use client";

import { useFavorites } from "./useFavorites";

// A "use client" leaf embedded inside server components. This is the only part
// of the countries section that ships JS to the browser. It reads/writes
// favorites through FavoritesProvider (see FavoritesContext.tsx) rather than
// from a prop threaded through the async Countries server component — so
// toggling flips just this button (and the Favorites panel) instantly,
// without a network round trip and without re-rendering Countries, Cities, or
// Weather at all. Compare with ../full/FavoriteButton.tsx.
export function FavoriteButton({ code }: { code: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(code);
  return (
    <button
      type="button"
      onClick={() => toggle(code)}
      aria-pressed={active}
      className={`rounded px-2 py-1 text-lg leading-none transition ${
        active ? "text-amber-300" : "text-slate-500 hover:text-amber-200"
      }`}
      title={active ? "Remove favorite" : "Add favorite"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
