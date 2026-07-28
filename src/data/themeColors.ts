import type { ThemeColorId } from "../types";

export const THEME_PRESETS: { id: ThemeColorId; color: string }[] = [
  { id: "berry", color: "#a9435a" },
  { id: "teal", color: "#146b64" },
  { id: "navy", color: "#25406b" },
  { id: "plum", color: "#6b3a63" },
  { id: "forest", color: "#3c6b3f" },
  { id: "slate", color: "#3f4753" },
];

export const DEFAULT_THEME_COLOR = THEME_PRESETS[0].color;
