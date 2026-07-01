import type { Weather } from "../types/domain";
import { FEATURE_DELAYS } from "../constants/delays";
import { delay } from "../utils/delay";

export const weather: Weather[] = [
  { city: "Tokyo", countryCode: "JP", temperatureC: 22, condition: "Clear", icon: "☀️", humidity: 55, windKph: 12 },
  { city: "Paris", countryCode: "FR", temperatureC: 15, condition: "Cloudy", icon: "☁️", humidity: 70, windKph: 18 },
  { city: "Brasília", countryCode: "BR", temperatureC: 28, condition: "Sunny", icon: "🌤️", humidity: 45, windKph: 9 },
  { city: "Nairobi", countryCode: "KE", temperatureC: 24, condition: "Rain", icon: "🌧️", humidity: 80, windKph: 15 },
  { city: "Sydney", countryCode: "AU", temperatureC: 20, condition: "Windy", icon: "💨", humidity: 60, windKph: 30 },
  { city: "Ottawa", countryCode: "CA", temperatureC: 8, condition: "Snow", icon: "❄️", humidity: 85, windKph: 22 },
];

/** Async accessor with a deliberate delay so streaming/suspense is observable. */
export async function getWeather(): Promise<Weather[]> {
  await delay(FEATURE_DELAYS.weather);
  return weather;
}
