import { use } from "react";
import { WeatherView } from "../WeatherView";
import { csrResource } from "../../../pages/csr/resource";
import type { Weather } from "../../../shared/types/domain";

// CSR: fetch on the client, suspend via use(), then render the shared view.
export function Weather() {
  const weather = use(csrResource<Weather[]>("weather"));
  return <WeatherView weather={weather} />;
}
