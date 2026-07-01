import { listFavorites } from "./favoritesStore";
import { countries } from "../../shared/data/countries";

// Server Component that reflects server-owned state. It re-renders (via the
// streamed RSC payload) whenever the toggleFavorite Server Action mutates the
// store — no client state, no API call.
export function Favorites() {
  const favorites = listFavorites();
  const names = favorites
    .map((code) => countries.find((c) => c.code === code))
    .filter((c): c is (typeof countries)[number] => Boolean(c));

  return (
    <div className="rounded-lg border border-amber-600/40 bg-amber-500/5 p-4">
      <h2 className="text-sm font-semibold text-amber-300">
        ★ Favorites{" "}
        <span className="font-normal text-slate-500">
          (server state, updated by a Server Action)
        </span>
      </h2>
      {names.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          None yet — star a country below.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {names.map((c) => (
            <li
              key={c.code}
              className="rounded bg-amber-500/15 px-2 py-1 text-sm text-amber-200"
            >
              {c.flag} {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
