import { CitiesView } from "../CitiesView";
import { getCities } from "../../../shared/data/cities";

// RSC: async Server Component. Awaits data on the server, ships zero JS.
export async function Cities() {
  const cities = await getCities();
  return <CitiesView cities={cities} />;
}
