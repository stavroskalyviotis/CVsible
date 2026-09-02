import { describe, it, expect } from "vitest";
import { getSidebarPalette } from "./contrast";

describe("getSidebarPalette", () => {
  it("uses dark text on a light background", () => {
    const palette = getSidebarPalette("#ffffff");
    expect(palette.text).toBe("#1c1a1f");
  });

  it("uses light text on a dark background", () => {
    const palette = getSidebarPalette("#000000");
    expect(palette.text).toBe("#ffffff");
  });

  it("accepts a 3-digit hex shorthand", () => {
    const palette = getSidebarPalette("#fff");
    expect(palette.text).toBe("#1c1a1f");
  });

  it("picks light text for a strongly saturated dark accent color", () => {
    // A typical CVsible sidebar accent, e.g. deep indigo — should read as "dark".
    const palette = getSidebarPalette("#2c2560");
    expect(palette.text).toBe("#ffffff");
  });
});
