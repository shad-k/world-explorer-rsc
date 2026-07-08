import { CountriesView } from "../../CountriesView";
import { getCountries } from "../../../../shared/data/countries";
import { FavoriteButton } from "../../../../pages/rsc/scoped/FavoriteButton";

// RSC: an async Server Component. It awaits data directly on the server (no
// HTTP round-trip, no client fetching code) and ships zero JS for itself.
// Favorites are NOT threaded through here as props: FavoriteButton reads/
// writes them via FavoritesProvider (client-side, see
// pages/rsc/scoped/FavoritesContext.tsx), so toggling a favorite never needs
// to re-run this component's slow fetch. Compare with ../full/Countries.tsx.
export async function Countries() {
  const countries = await getCountries();
  return (
    <CountriesView
      countries={countries}
      renderAction={(c) => <FavoriteButton code={c.code} />}
    />
  );
}
