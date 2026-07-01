import type { Country } from "../types/domain";
import { FEATURE_DELAYS } from "../constants/delays";
import { delay } from "../utils/delay";

// Raw mock dataset — identical regardless of rendering mode, so it is shared.
// (Later this can be swapped for the REST Countries API; the shape stays.)
export const countries: Country[] = [
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    population: 125_800_000,
    capital: "Tokyo",
    region: "Asia",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    population: 68_000_000,
    capital: "Paris",
    region: "Europe",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    population: 214_300_000,
    capital: "Brasília",
    region: "Americas",
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    population: 54_000_000,
    capital: "Nairobi",
    region: "Africa",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    population: 26_000_000,
    capital: "Canberra",
    region: "Oceania",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    population: 38_900_000,
    capital: "Ottawa",
    region: "Americas",
  },
];

/** Async accessor with a deliberate delay so streaming/suspense is observable. */
export async function getCountries(): Promise<Country[]> {
  await delay(FEATURE_DELAYS.countries);
  return countries;
}
