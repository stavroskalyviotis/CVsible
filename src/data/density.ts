import type { Density } from "../types";

/** Multiplier applied to every template's paddings, gaps and type sizes. */
export const DENSITY_SCALE: Record<Density, number> = {
  compact: 0.88,
  comfortable: 1,
  spacious: 1.12,
};
