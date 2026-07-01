import { useStreamData } from "../../../pages/stream/useStreamData";
import { StreamDataScript } from "../../../pages/stream/StreamDataScript";
import { WeatherView } from "../WeatherView";
import type { Weather } from "../../../shared/types/domain";

// Streaming SSR: suspend on the server, render the shared view, emit data inline.
export function Weather() {
  const weather = useStreamData<Weather[]>("weather");
  return (
    <>
      <WeatherView weather={weather} />
      <StreamDataScript name="weather" data={weather} />
    </>
  );
}
