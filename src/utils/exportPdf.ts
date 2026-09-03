import type { FontFamily } from "../types";
import { paintTree } from "./pdf/domToPdf";
import { collectRasters } from "./pdf/rasterize";
import { registerPdfFonts, waitForPreviewFonts } from "./pdf/fonts";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export interface PdfExportOptions {
  filename: string;
  fontFamily: FontFamily;
  fullName: string;
  jobTitle: string;
}

/** Renders each already laid-out page element into real PDF vector text.
 *  Nothing is rasterised except photos and icons, so the output stays
 *  selectable, searchable and readable by resume parsers. */
export async function exportPagesToPdf(pageElements: HTMLElement[], options: PdfExportOptions): Promise<void> {
  if (pageElements.length === 0) return;

  const { jsPDF, GState } = await import("jspdf");
  await waitForPreviewFonts(options.fontFamily);

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
  const fontAlias = await registerPdfFonts(pdf, options.fontFamily);

  pdf.setProperties({
    title: options.fullName ? `${options.fullName} — CV` : "CV",
    author: options.fullName || "CVsible",
    subject: options.jobTitle || "Curriculum Vitae",
    creator: "CVsible",
  });

  for (let index = 0; index < pageElements.length; index++) {
    const element = pageElements[index];
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0) continue;

    if (index > 0) pdf.addPage("a4", "portrait");

    const scale = A4_WIDTH_PT / rect.width;
    const rasters = await collectRasters(element);

    // The page background is painted first so nothing shows through at the edges.
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, A4_WIDTH_PT, A4_HEIGHT_PT, "F");

    paintTree(element, {
      pdf,
      gState: (gsOptions) => new GState(gsOptions),
      fontAlias,
      scale,
      originX: rect.left,
      originY: rect.top,
      rasters,
    });
  }

  pdf.save(options.filename);
}

function slugifyForFilename(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds "CVsible-Name-Title.pdf" from the CV's own name and job title, so
 *  a downloaded file is self-identifying without the person renaming it. */
export function buildPdfFilename(fullName: string, jobTitle = ""): string {
  const nameSlug = slugifyForFilename(fullName) || "resume";
  const titleSlug = slugifyForFilename(jobTitle);
  const parts = ["CVsible", nameSlug, titleSlug].filter(Boolean);
  return `${parts.join("-")}.pdf`;
}
