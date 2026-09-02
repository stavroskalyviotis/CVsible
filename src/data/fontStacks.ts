import type { FontFamily } from "../types";

/** Family names declared in fonts.css. The fallbacks only matter while the
 *  webfont loads — the PDF renderer always embeds the real face. */
export const FONT_STACKS: Record<FontFamily, string> = {
  sans: '"CV Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif',
  serif: '"CV Serif", Georgia, "Times New Roman", Times, serif',
  condensed: '"CV Condensed", "Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
};

/** Basename of the .ttf files in public/fonts, per family and per face. */
export const PDF_FONT_FILES: Record<FontFamily, Record<"normal" | "bold" | "italic" | "bolditalic", string>> = {
  sans: {
    normal: "NotoSans-Regular",
    bold: "NotoSans-Bold",
    italic: "NotoSans-Italic",
    bolditalic: "NotoSans-BoldItalic",
  },
  serif: {
    normal: "NotoSerif-Regular",
    bold: "NotoSerif-Bold",
    italic: "NotoSerif-Italic",
    bolditalic: "NotoSerif-BoldItalic",
  },
  condensed: {
    normal: "NotoSansCondensed-Regular",
    bold: "NotoSansCondensed-Bold",
    italic: "NotoSansCondensed-Italic",
    bolditalic: "NotoSansCondensed-BoldItalic",
  },
};

/** The jsPDF font alias each family is registered under. */
export const PDF_FONT_NAMES: Record<FontFamily, string> = {
  sans: "CVSans",
  serif: "CVSerif",
  condensed: "CVCondensed",
};
