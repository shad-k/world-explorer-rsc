import type { FeatureName } from "../types/domain";

// Deliberately different per-feature delays so that progressive streaming is
// visible: Countries resolves first, then Cities, then Weather. Every feature
// also gets its own <Suspense> boundary (see the per-mode pages).
export const FEATURE_DELAYS: Record<FeatureName, number> = {
  countries: 3000,
  cities: 6000,
  weather: 9000,
};
