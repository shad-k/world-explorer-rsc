import { CountriesView } from "../../CountriesView";
import { getCountries } from "../../../../shared/data/countries";
import { listFavorites } from "../../../../pages/rsc/favoritesStore";
import { FavoriteButton } from "../../../../pages/rsc/full/FavoriteButton";

// RSC: an async Server Component, identical in spirit to ../scoped/Countries
// for data-fetching — but it also computes favorites server-side and threads
// `active` down as a prop, exactly like the original (pre-optimization)
// implementation. Because that read and the button it feeds live inside the
// SAME async function as the slow getCountries() call, this whole section
// (all 6 cards) can only update together, and only once <Root/> fully
// re-renders. Compare with ../scoped/Countries.tsx.
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
