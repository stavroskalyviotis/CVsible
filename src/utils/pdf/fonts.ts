import type { jsPDF } from "jspdf";
import type { FontFamily } from "../../types";
import { FONT_STACKS, PDF_FONT_FILES, PDF_FONT_NAMES } from "../../data/fontStacks";

export type PdfFontStyle = "normal" | "bold" | "italic" | "bolditalic";

const FACE_STYLES: PdfFontStyle[] = ["normal", "bold", "italic", "bolditalic"];

const base64Cache = new Map<string, string>();

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // Chunked so a ~40 KB font does not blow the argument limit of String.fromCharCode.
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function loadFontBase64(file: string): Promise<string> {
  const cached = base64Cache.get(file);
  if (cached) return cached;

  const response = await fetch(`/fonts/${file}.ttf`);
  if (!response.ok) throw new Error(`Missing PDF font: ${file}.ttf`);
  const encoded = toBase64(await response.arrayBuffer());
  base64Cache.set(file, encoded);
  return encoded;
}

/** Embeds all four faces of one family so the PDF carries real, extractable
 *  Greek and Latin text rather than a picture of it. */
export async function registerPdfFonts(pdf: jsPDF, family: FontFamily): Promise<string> {
  const files = PDF_FONT_FILES[family];
  const alias = PDF_FONT_NAMES[family];

  const faces = await Promise.all(FACE_STYLES.map((style) => loadFontBase64(files[style])));

  FACE_STYLES.forEach((style, index) => {
    const filename = `${files[style]}.ttf`;
    pdf.addFileToVFS(filename, faces[index]);
    pdf.addFont(filename, alias, style);
  });

  return alias;
}

/** Blocks until the on-screen faces are actually painted, so the measured
 *  layout matches the metrics the PDF will use. */
export async function waitForPreviewFonts(family: FontFamily): Promise<void> {
  const stack = FONT_STACKS[family];
  const primary = stack.split(",")[0].trim();

  await Promise.all([
    document.fonts.load(`400 16px ${primary}`),
    document.fonts.load(`700 16px ${primary}`),
    document.fonts.load(`italic 400 16px ${primary}`),
    document.fonts.load(`italic 700 16px ${primary}`),
  ]);
  await document.fonts.ready;
}
