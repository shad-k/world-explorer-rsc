import type { City } from "../types/domain";
import { FEATURE_DELAYS } from "../constants/delays";
import { delay } from "../utils/delay";

export const cities: City[] = [
  { name: "Tokyo", country: "Japan", countryCode: "JP", population: 37_400_000, isCapital: true },
  { name: "Osaka", country: "Japan", countryCode: "JP", population: 19_000_000, isCapital: false },
  { name: "Paris", country: "France", countryCode: "FR", population: 11_100_000, isCapital: true },
  { name: "São Paulo", country: "Brazil", countryCode: "BR", population: 22_400_000, isCapital: false },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", population: 4_700_000, isCapital: true },
  { name: "Sydney", country: "Australia", countryCode: "AU", population: 5_300_000, isCapital: false },
  { name: "Toronto", country: "Canada", countryCode: "CA", population: 6_200_000, isCapital: false },
  { name: "Ottawa", country: "Canada", countryCode: "CA", population: 1_400_000, isCapital: true },
];

/** Async accessor with a deliberate delay so streaming/suspense is observable. */
export async function getCities(): Promise<City[]> {
  await delay(FEATURE_DELAYS.cities);
  return cities;
}
