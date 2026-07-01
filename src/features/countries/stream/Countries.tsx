import { useStreamData } from "../../../pages/stream/useStreamData";
import { StreamDataScript } from "../../../pages/stream/StreamDataScript";
import { CountriesView } from "../CountriesView";
import type { Country } from "../../../shared/types/domain";

// Streaming SSR: suspend on the server until the data resolves (so React can
// stream this section in), render the shared view, and emit the data inline so
// the client hydrates without re-fetching.
export function Countries() {
  const countries = useStreamData<Country[]>("countries");
  return (
    <>
      <CountriesView countries={countries} />
      <StreamDataScript name="countries" data={countries} />
    </>
  );
}
