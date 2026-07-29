const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export async function exportPagesToPdf(pageElements: HTMLElement[], filename: string): Promise<void> {
  if (pageElements.length === 0) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  for (let index = 0; index < pageElements.length; index++) {
    const canvas = await html2canvas(pageElements[index], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    if (index > 0) pdf.addPage();
    pdf.addImage(imageData, "JPEG", 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
  }

  pdf.save(filename);
}

export function buildPdfFilename(fullName: string): string {
  const slug = fullName
    .trim()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `CVsible-${slug || "resume"}.pdf`;
}
