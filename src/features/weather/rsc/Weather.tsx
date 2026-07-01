import { WeatherView } from "../WeatherView";
import { getWeather } from "../../../shared/data/weather";

// RSC: async Server Component. Awaits data on the server, ships zero JS.
export async function Weather() {
  const weather = await getWeather();
  return <WeatherView weather={weather} />;
}
