import { use } from "react";
import { CountriesView } from "../CountriesView";
import { csrResource } from "../../../pages/csr/resource";
import type { Country } from "../../../shared/types/domain";

// CSR: fetch on the client, suspend via use(), then render the shared view.
export function Countries() {
  const countries = use(csrResource<Country[]>("countries"));
  return <CountriesView countries={countries} />;
}
