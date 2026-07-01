import { use } from "react";
import { CitiesView } from "../CitiesView";
import { csrResource } from "../../../pages/csr/resource";
import type { City } from "../../../shared/types/domain";

// CSR: fetch on the client, suspend via use(), then render the shared view.
export function Cities() {
  const cities = use(csrResource<City[]>("cities"));
  return <CitiesView cities={cities} />;
}
