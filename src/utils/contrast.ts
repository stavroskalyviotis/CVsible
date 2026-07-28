function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export interface SidebarPalette {
  text: string;
  textSoft: string;
  border: string;
  track: string;
}

export function getSidebarPalette(themeColor: string): SidebarPalette {
  const isLight = relativeLuminance(themeColor) > 0.5;
  return isLight
    ? {
        text: "#1c1a1f",
        textSoft: "rgba(28, 26, 31, 0.72)",
        border: "rgba(28, 26, 31, 0.28)",
        track: "rgba(28, 26, 31, 0.18)",
      }
    : {
        text: "#ffffff",
        textSoft: "rgba(255, 255, 255, 0.78)",
        border: "rgba(255, 255, 255, 0.32)",
        track: "rgba(255, 255, 255, 0.28)",
      };
}
