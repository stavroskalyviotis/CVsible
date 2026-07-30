import type { Density } from "../types";

export const DENSITY_SCALE: Record<Density, number> = {
  compact: 0.88,
  comfortable: 1,
  spacious: 1.12,
};

const BASE_MAIN_WIDTH = 536;
const BASE_MAIN_HORIZONTAL_PADDING = 60;
const BASE_PAGE_HEIGHT = 1123;
const BASE_MAIN_VERTICAL_PADDING = 64;
const BASE_SECTION_GAP = 16;
const BASE_ENTRY_GAP = 10;

export interface DensityMetrics {
  scale: number;
  mainWidth: number;
  mainCapacity: number;
  sectionGap: number;
  entryGap: number;
}

export function getDensityMetrics(density: Density): DensityMetrics {
  const scale = DENSITY_SCALE[density];
  return {
    scale,
    mainWidth: Math.round(BASE_MAIN_WIDTH - BASE_MAIN_HORIZONTAL_PADDING * scale),
    mainCapacity: Math.round(BASE_PAGE_HEIGHT - BASE_MAIN_VERTICAL_PADDING * scale),
    sectionGap: Math.round(BASE_SECTION_GAP * scale),
    entryGap: Math.round(BASE_ENTRY_GAP * scale),
  };
}
