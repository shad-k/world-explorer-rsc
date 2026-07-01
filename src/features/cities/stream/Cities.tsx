import { useStreamData } from "../../../pages/stream/useStreamData";
import { StreamDataScript } from "../../../pages/stream/StreamDataScript";
import { CitiesView } from "../CitiesView";
import type { City } from "../../../shared/types/domain";

// Streaming SSR: suspend on the server, render the shared view, emit data inline.
export function Cities() {
  const cities = useStreamData<City[]>("cities");
  return (
    <>
      <CitiesView cities={cities} />
      <StreamDataScript name="cities" data={cities} />
    </>
  );
}
