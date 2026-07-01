// Domain types for the World Explorer sample dataset.
//
// The travel domain is intentionally trivial — it is only a vehicle for
// demonstrating asynchronous rendering. These types are identical regardless
// of rendering mode, so they live in `shared/` (see CLAUDE.md principle 3).

export interface Country {
  code: string;
  name: string;
  flag: string; // emoji flag
  population: number;
  capital: string;
  region: string;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  population: number;
  isCapital: boolean;
}

export interface Weather {
  city: string;
  countryCode: string;
  temperatureC: number;
  condition: string;
  icon: string; // emoji
  humidity: number; // percent
  windKph: number;
}

/** The set of features that each render mode fetches and streams. */
export type FeatureName = "countries" | "cities" | "weather";
