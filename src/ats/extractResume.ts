import { unzipSync, strFromU8 } from "fflate";

/** Everything the ATS heuristics need to know about an uploaded document. */
export interface ExtractedResume {
  kind: "pdf" | "docx" | "txt" | "builder";
  fileName: string;
  fileSize: number;
  pageCount: number;
  /** Reading-order text, one line per visual line. */
  text: string;
  lines: string[];
  /** Text split per page, for the "what the parser reads" view. */
  pageTexts: string[];
  /** False when a PDF carries no text layer at all — a scan or an image export. */
  hasTextLayer: boolean;
  /** Pages whose text sits in two or more distinct columns. */
  multiColumnPages: number;
  imageCount: number;
  linkUrls: string[];
  fonts: string[];
  title: string;
  author: string;
  producer: string;
}

export class ResumeReadError extends Error {}

const LINE_TOLERANCE = 3;

interface PositionedItem {
  text: string;
  x: number;
  y: number;
  width: number;
}

/** Groups text fragments into visual lines, then orders lines top-to-bottom and
 *  left-to-right — the same order a resume parser reconstructs. */
function itemsToLines(items: PositionedItem[]): string[] {
  if (items.length === 0) return [];

  const rows: PositionedItem[][] = [];
  [...items]
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .forEach((item) => {
      const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= LINE_TOLERANCE);
      if (row) row.push(item);
      else rows.push([item]);
    });

  return rows
    .map((row) =>
      row
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function verticalSpan(items: PositionedItem[]): number {
  const ys = items.map((item) => item.y);
  return Math.max(...ys) - Math.min(...ys);
}

function distinctRows(items: PositionedItem[]): number {
  return new Set(items.map((item) => Math.round(item.y / LINE_TOLERANCE))).size;
}

/** True only for a genuine two-column page: some vertical gutter that *no*
 *  text crosses, with a substantial, full-height block of text on each side.
 *
 *  The "nothing crosses the gutter" rule is what separates a real sidebar from
 *  an ordinary single column that merely right-aligns its dates — there, body
 *  paragraphs run straight through every candidate gutter. */
function detectColumns(items: PositionedItem[], pageWidth: number): boolean {
  if (items.length < 30 || pageWidth <= 0) return false;

  const pageSpan = verticalSpan(items);
  if (pageSpan <= 0) return false;

  for (let ratio = 0.22; ratio <= 0.72; ratio += 0.04) {
    const gutter = pageWidth * ratio;
    const left = items.filter((item) => item.x + item.width <= gutter);
    const right = items.filter((item) => item.x >= gutter);

    if (left.length + right.length < items.length * 0.97) continue;
    if (Math.min(left.length, right.length) < items.length * 0.2) continue;
    if (verticalSpan(left) < pageSpan * 0.5 || verticalSpan(right) < pageSpan * 0.5) continue;
    if (distinctRows(left) < 6 || distinctRows(right) < 6) continue;

    return true;
  }

  return false;
}

async function extractPdf(file: File): Promise<ExtractedResume> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href;

  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const lines: string[] = [];
  const pageTexts: string[] = [];
  const fonts = new Set<string>();
  const linkUrls = new Set<string>();
  let multiColumnPages = 0;
  let imageCount = 0;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    Object.values(content.styles ?? {}).forEach((style) => {
      const family = (style as { fontFamily?: string }).fontFamily;
      if (family) fonts.add(family);
    });

    const items: PositionedItem[] = content.items
      .filter((item): item is Extract<typeof item, { str: string }> => "str" in item)
      .filter((item) => item.str.trim().length > 0)
      .map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width ?? 0,
      }));

    const pageLines = itemsToLines(items);
    lines.push(...pageLines);
    pageTexts.push(pageLines.join("\n"));
    if (detectColumns(items, viewport.width)) multiColumnPages += 1;

    const imageOps = new Set([
      pdfjs.OPS.paintImageXObject,
      pdfjs.OPS.paintInlineImageXObject,
      pdfjs.OPS.paintImageXObjectRepeat,
    ]);
    const operators = await page.getOperatorList();
    operators.fnArray.forEach((fn) => {
      if (imageOps.has(fn)) imageCount += 1;
    });

    const annotations = await page.getAnnotations();
    annotations.forEach((annotation) => {
      if (typeof annotation.url === "string") linkUrls.add(annotation.url);
    });
  }

  const metadata = await document.getMetadata().catch(() => null);
  const info = (metadata?.info ?? {}) as { Title?: string; Author?: string; Producer?: string };
  const text = lines.join("\n");

  return {
    kind: "pdf",
    fileName: file.name,
    fileSize: file.size,
    pageCount: document.numPages,
    text,
    lines,
    pageTexts,
    hasTextLayer: text.replace(/\s/g, "").length >= 50,
    multiColumnPages,
    imageCount,
    linkUrls: [...linkUrls],
    fonts: [...fonts],
    title: info.Title ?? "",
    author: info.Author ?? "",
    producer: info.Producer ?? "",
  };
}

const XML_TAG = /<[^>]+>/g;

async function extractDocx(file: File): Promise<ExtractedResume> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buffer);
  } catch {
    throw new ResumeReadError("unreadable");
  }

  const document = files["word/document.xml"];
  if (!document) throw new ResumeReadError("unreadable");

  const xml = strFromU8(document);
  const lines = xml
    // Paragraph and line breaks become real newlines before tags are stripped.
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br\s*\/?>/g, "\n")
    .replace(/<w:tab\s*\/?>/g, " ")
    .replace(XML_TAG, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const text = lines.join("\n");
  const imageCount = Object.keys(files).filter((name) => name.startsWith("word/media/")).length;

  return {
    kind: "docx",
    fileName: file.name,
    fileSize: file.size,
    // Word does not store a page count that survives extraction; estimate it.
    pageCount: Math.max(1, Math.ceil(text.split(/\s+/).length / 450)),
    text,
    lines,
    pageTexts: [text],
    hasTextLayer: text.replace(/\s/g, "").length >= 50,
    multiColumnPages: 0,
    imageCount,
    linkUrls: [...text.matchAll(/https?:\/\/\S+/g)].map((match) => match[0]),
    fonts: [],
    title: "",
    author: "",
    producer: "",
  };
}

async function extractTxt(file: File): Promise<ExtractedResume> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return {
    kind: "txt",
    fileName: file.name,
    fileSize: file.size,
    pageCount: Math.max(1, Math.ceil(text.split(/\s+/).length / 450)),
    text: lines.join("\n"),
    lines,
    pageTexts: [lines.join("\n")],
    hasTextLayer: text.trim().length >= 50,
    multiColumnPages: 0,
    imageCount: 0,
    linkUrls: [...text.matchAll(/https?:\/\/\S+/g)].map((match) => match[0]),
    fonts: [],
    title: "",
    author: "",
    producer: "",
  };
}

export const ACCEPTED_RESUME_TYPES = ".pdf,.docx,.txt";
export const MAX_RESUME_BYTES = 12 * 1024 * 1024;

export async function extractResume(file: File): Promise<ExtractedResume> {
  if (file.size > MAX_RESUME_BYTES) throw new ResumeReadError("too-large");

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt")) return extractTxt(file);
  throw new ResumeReadError("unsupported");
}
