"use client";

import { useTransition } from "react";
import { toggleFavorite } from "./actions";

// A "use client" leaf embedded inside server components. This is the only part
// of the countries section that ships JS to the browser. Clicking it invokes
// the Server Action, which re-renders the server tree (updating the favorites
// panel and every button's state) inside a transition.
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
