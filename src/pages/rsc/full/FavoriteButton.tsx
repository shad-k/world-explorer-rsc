"use client";

import { useTransition } from "react";
import { toggleFavorite } from "../actions";

// A "use client" leaf. Unlike ../scoped/FavoriteButton.tsx, `active` is a
// prop computed server-side (inside Countries, from listFavorites()) — there
// is no client-side favorites state here at all. Clicking invokes the Server
// Action and waits for the ENTIRE <Root/> to re-render before this button (or
// any other) reflects the change; see ../entry.rsc.tsx.
export function FavoriteButton({
  code,
  active,
}: {
  code: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleFavorite(code);
        })
      }
      aria-pressed={active}
      className={`rounded px-2 py-1 text-lg leading-none transition ${
        active ? "text-amber-300" : "text-slate-500 hover:text-amber-200"
      } ${pending ? "opacity-50" : ""}`}
      title={active ? "Remove favorite" : "Add favorite"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
