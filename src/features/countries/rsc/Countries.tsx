import { CountriesView } from "../CountriesView";
import { getCountries } from "../../../shared/data/countries";
import { listFavorites } from "../../../pages/rsc/favoritesStore";
import { FavoriteButton } from "../../../pages/rsc/FavoriteButton";

// RSC: an async Server Component. It awaits data directly on the server (no
// HTTP round-trip, no client fetching code) and ships zero JS for itself. The
// only interactive part — the favorite button — is a "use client" leaf.
export async function Countries() {
  const countries = await getCountries();
  const favorites = new Set(listFavorites());
  return (
    <CountriesView
      countries={countries}
      renderAction={(c) => (
        <FavoriteButton code={c.code} active={favorites.has(c.code)} />
      )}
    />
  );
}
