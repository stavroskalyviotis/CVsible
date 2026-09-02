import type { GState, jsPDF } from "jspdf";
import { upperCaseForDisplay } from "../text";

/** Constructor handed in by the caller, which owns the dynamic jsPDF import.
 *  Importing GState directly would drag the whole library into the entry chunk. */
export type GStateFactory = (options: { opacity: number }) => GState;

/** Painting context for one page. All geometry arrives in CSS pixels relative
 *  to the page element and is converted to PDF points on the way out. */
export interface PaintContext {
  pdf: jsPDF;
  gState: GStateFactory;
  fontAlias: string;
  /** CSS px -> PDF pt. */
  scale: number;
  originX: number;
  originY: number;
  rasters: Map<Element, RasterImage>;
}

interface RasterImage {
  dataUrl: string;
  format: "PNG";
}

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const COLOR_PATTERN = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.%]+))?\s*\)$/i;

function parseColor(value: string): Rgba | null {
  if (!value || value === "transparent" || value === "none") return null;
  const match = COLOR_PATTERN.exec(value.trim());
  if (!match) return null;
  const alphaRaw = match[4];
  const alpha = alphaRaw === undefined ? 1 : alphaRaw.endsWith("%") ? parseFloat(alphaRaw) / 100 : parseFloat(alphaRaw);
  return { r: +match[1], g: +match[2], b: +match[3], a: Number.isFinite(alpha) ? alpha : 1 };
}

function px(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Resolves a computed border-radius, which may be a percentage. */
function radiusOf(value: string, box: number): number {
  if (value.endsWith("%")) return (parseFloat(value) / 100) * box;
  return px(value);
}

function withAlpha(pdf: jsPDF, gState: GStateFactory, alpha: number, draw: () => void): void {
  if (alpha >= 0.999) {
    draw();
    return;
  }
  pdf.setGState(gState({ opacity: alpha }));
  draw();
  pdf.setGState(gState({ opacity: 1 }));
}

class Painter {
  private readonly ctx: PaintContext;

  constructor(ctx: PaintContext) {
    this.ctx = ctx;
  }

  private x(clientX: number): number {
    return (clientX - this.ctx.originX) * this.ctx.scale;
  }

  private y(clientY: number): number {
    return (clientY - this.ctx.originY) * this.ctx.scale;
  }

  private s(length: number): number {
    return length * this.ctx.scale;
  }

  private fill(color: Rgba): void {
    this.ctx.pdf.setFillColor(color.r, color.g, color.b);
  }

  private stroke(color: Rgba): void {
    this.ctx.pdf.setDrawColor(color.r, color.g, color.b);
  }

  paintBox(el: Element, style: CSSStyleDeclaration, rect: DOMRect): void {
    const { pdf } = this.ctx;
    const width = this.s(rect.width);
    const height = this.s(rect.height);
    if (width <= 0 || height <= 0) return;

    const left = this.x(rect.left);
    const top = this.y(rect.top);
    const minSide = Math.min(rect.width, rect.height);
    const radii = [
      radiusOf(style.borderTopLeftRadius, minSide),
      radiusOf(style.borderTopRightRadius, minSide),
      radiusOf(style.borderBottomRightRadius, minSide),
      radiusOf(style.borderBottomLeftRadius, minSide),
    ];
    const radius = Math.min(this.s(Math.min(...radii)), width / 2, height / 2);
    const opacity = parseFloat(style.opacity || "1");

    const background = parseColor(style.backgroundColor);
    if (background && background.a > 0.01) {
      this.fill(background);
      withAlpha(pdf, this.ctx.gState, background.a * opacity, () => {
        if (radius > 0.5) pdf.roundedRect(left, top, width, height, radius, radius, "F");
        else pdf.rect(left, top, width, height, "F");
      });
    }

    this.paintBorders(el, style, rect, radius, opacity);
  }

  private paintBorders(
    _el: Element,
    style: CSSStyleDeclaration,
    rect: DOMRect,
    radius: number,
    opacity: number,
  ): void {
    const { pdf } = this.ctx;
    const sides = [
      { w: px(style.borderTopWidth), c: style.borderTopColor, s: style.borderTopStyle },
      { w: px(style.borderRightWidth), c: style.borderRightColor, s: style.borderRightStyle },
      { w: px(style.borderBottomWidth), c: style.borderBottomColor, s: style.borderBottomStyle },
      { w: px(style.borderLeftWidth), c: style.borderLeftColor, s: style.borderLeftStyle },
    ].map((side) => ({ ...side, color: parseColor(side.c) }));

    const visible = sides.filter((side) => side.w > 0 && side.s !== "none" && side.color && side.color.a > 0.01);
    if (visible.length === 0) return;

    const uniform =
      visible.length === 4 &&
      visible.every((side) => side.w === visible[0].w && side.c === visible[0].c);

    if (uniform && radius > 0.5) {
      const side = visible[0];
      const lineWidth = this.s(side.w);
      pdf.setLineWidth(lineWidth);
      this.stroke(side.color!);
      withAlpha(pdf, this.ctx.gState, side.color!.a * opacity, () => {
        pdf.roundedRect(
          this.x(rect.left) + lineWidth / 2,
          this.y(rect.top) + lineWidth / 2,
          this.s(rect.width) - lineWidth,
          this.s(rect.height) - lineWidth,
          radius,
          radius,
          "S",
        );
      });
      return;
    }

    // Straight edges paint more predictably as thin filled rectangles than as strokes.
    const [top, right, bottom, left] = [
      { w: px(style.borderTopWidth), color: parseColor(style.borderTopColor), s: style.borderTopStyle },
      { w: px(style.borderRightWidth), color: parseColor(style.borderRightColor), s: style.borderRightStyle },
      { w: px(style.borderBottomWidth), color: parseColor(style.borderBottomColor), s: style.borderBottomStyle },
      { w: px(style.borderLeftWidth), color: parseColor(style.borderLeftColor), s: style.borderLeftStyle },
    ];

    const paintSide = (
      side: { w: number; color: Rgba | null; s: string },
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      if (side.w <= 0 || side.s === "none" || !side.color || side.color.a <= 0.01) return;
      this.fill(side.color);
      withAlpha(pdf, this.ctx.gState, side.color.a * opacity, () => pdf.rect(x, y, w, h, "F"));
    };

    paintSide(top, this.x(rect.left), this.y(rect.top), this.s(rect.width), this.s(top.w));
    paintSide(
      bottom,
      this.x(rect.left),
      this.y(rect.bottom) - this.s(bottom.w),
      this.s(rect.width),
      this.s(bottom.w),
    );
    paintSide(left, this.x(rect.left), this.y(rect.top), this.s(left.w), this.s(rect.height));
    paintSide(
      right,
      this.x(rect.right) - this.s(right.w),
      this.y(rect.top),
      this.s(right.w),
      this.s(rect.height),
    );
  }

  paintRaster(el: Element, rect: DOMRect): void {
    const raster = this.ctx.rasters.get(el);
    if (!raster || rect.width <= 0 || rect.height <= 0) return;
    this.ctx.pdf.addImage(
      raster.dataUrl,
      raster.format,
      this.x(rect.left),
      this.y(rect.top),
      this.s(rect.width),
      this.s(rect.height),
      undefined,
      "FAST",
    );
  }

  paintLink(rect: DOMRect, url: string): void {
    this.ctx.pdf.link(this.x(rect.left), this.y(rect.top), this.s(rect.width), this.s(rect.height), { url });
  }

  /** Draws the ::marker of a list item, which is generated content and therefore
   *  invisible to a text-node walk. */
  paintListMarker(li: HTMLElement, style: CSSStyleDeclaration, index: number): void {
    const type = style.listStyleType;
    if (type === "none") return;
    const marker = type === "decimal" ? `${index}.` : "•";

    const rect = li.getBoundingClientRect();
    if (rect.height <= 0) return;

    const fontSize = px(style.fontSize);
    const metrics = lineMetrics(style);
    const firstLineHeight = Math.min(rect.height, metrics.lineHeight || fontSize * 1.4);
    const baseline = rect.top + (firstLineHeight - (metrics.ascent + metrics.descent)) / 2 + metrics.ascent;

    const color = parseColor(style.color) ?? { r: 0, g: 0, b: 0, a: 1 };
    const { pdf } = this.ctx;
    pdf.setFont(this.ctx.fontAlias, "normal");
    pdf.setFontSize(this.s(fontSize));
    pdf.setTextColor(color.r, color.g, color.b);

    const markerWidth = pdf.getTextWidth(marker);
    withAlpha(pdf, this.ctx.gState, color.a, () =>
      pdf.text(marker, this.x(rect.left) - markerWidth - this.s(5), this.y(baseline), { baseline: "alphabetic" }),
    );
  }

  paintTextNode(node: Text, style: CSSStyleDeclaration): void {
    const raw = node.nodeValue ?? "";
    if (!raw.trim()) return;

    const lines = splitIntoLines(node, raw, style);
    if (lines.length === 0) return;

    const { pdf } = this.ctx;
    const fontSize = px(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || (style.fontWeight === "bold" ? 700 : 400);
    const italic = style.fontStyle === "italic" || style.fontStyle === "oblique";
    const faceStyle = weight >= 600 ? (italic ? "bolditalic" : "bold") : italic ? "italic" : "normal";
    const color = parseColor(style.color) ?? { r: 0, g: 0, b: 0, a: 1 };
    const letterSpacing = style.letterSpacing === "normal" ? 0 : px(style.letterSpacing);
    const underline = style.textDecorationLine.includes("underline");
    const strike = style.textDecorationLine.includes("line-through");
    const opacity = parseFloat(style.opacity || "1") * color.a;

    pdf.setFont(this.ctx.fontAlias, faceStyle);
    pdf.setFontSize(this.s(fontSize));
    pdf.setTextColor(color.r, color.g, color.b);
    this.fill(color);

    const metrics = lineMetrics(style);
    const charSpace = this.s(letterSpacing);

    lines.forEach((line) => {
      const height = line.rect.height || metrics.lineHeight || fontSize * 1.4;
      const baseline = line.rect.top + (height - (metrics.ascent + metrics.descent)) / 2 + metrics.ascent;
      const x = this.x(line.rect.left);
      const y = this.y(baseline);

      withAlpha(pdf, this.ctx.gState, opacity, () => {
        pdf.text(line.text, x, y, charSpace ? { charSpace, baseline: "alphabetic" } : { baseline: "alphabetic" });

        const thickness = Math.max(this.s(fontSize / 14), 0.4);
        if (underline) {
          pdf.rect(x, y + this.s(fontSize * 0.12), this.s(line.rect.width), thickness, "F");
        }
        if (strike) {
          pdf.rect(x, y - this.s(fontSize * 0.28), this.s(line.rect.width), thickness, "F");
        }
      });
    });
  }
}

interface LineFragment {
  text: string;
  rect: DOMRect;
}

const metricsCache = new Map<string, { ascent: number; descent: number; lineHeight: number }>();
let measureContext: CanvasRenderingContext2D | null = null;

function lineMetrics(style: CSSStyleDeclaration): { ascent: number; descent: number; lineHeight: number } {
  const fontSize = px(style.fontSize);
  const key = `${style.fontStyle}|${style.fontWeight}|${fontSize}|${style.fontFamily}`;
  const cached = metricsCache.get(key);
  if (cached) return cached;

  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }

  let ascent = fontSize * 0.8;
  let descent = fontSize * 0.2;
  if (measureContext) {
    measureContext.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    const measured = measureContext.measureText("HxgΩγ");
    if (measured.fontBoundingBoxAscent) ascent = measured.fontBoundingBoxAscent;
    if (measured.fontBoundingBoxDescent) descent = measured.fontBoundingBoxDescent;
  }

  const result = { ascent, descent, lineHeight: px(style.lineHeight) || fontSize * 1.4 };
  metricsCache.set(key, result);
  return result;
}

function applyTransform(text: string, transform: string, locale: string): string {
  if (transform === "uppercase") return upperCaseForDisplay(text);
  if (transform === "lowercase") return text.toLocaleLowerCase(locale);
  if (transform === "capitalize") {
    return text.replace(/\b\p{L}/gu, (char) => char.toLocaleUpperCase(locale));
  }
  return text;
}

function localeOf(node: Node): string {
  const element = node.parentElement?.closest("[lang]");
  return element?.getAttribute("lang") || document.documentElement.lang || "en";
}

interface Segment {
  start: number;
  end: number;
  rect: DOMRect;
}

/** Splits one word that the browser wrapped mid-token (Chrome breaks after a
 *  hyphen) into one segment per visual line. */
function splitWrappedWord(node: Text, range: Range, start: number, end: number): Segment[] {
  const segments: Segment[] = [];
  let segmentStart = start;
  let previousTop: number | null = null;

  for (let index = start; index < end; index++) {
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    const rect = range.getBoundingClientRect();
    if (previousTop !== null && Math.abs(rect.top - previousTop) > 1) {
      segments.push(measureSegment(node, range, segmentStart, index));
      segmentStart = index;
    }
    previousTop = rect.top;
  }

  segments.push(measureSegment(node, range, segmentStart, end));
  return segments;
}

function measureSegment(node: Text, range: Range, start: number, end: number): Segment {
  range.setStart(node, start);
  range.setEnd(node, end);
  return { start, end, rect: range.getBoundingClientRect() };
}

/** Recovers the visual lines of a text node by probing word ranges, so wrapped
 *  text lands on the same rows in the PDF as it does on screen. */
function splitIntoLines(node: Text, raw: string, style: CSSStyleDeclaration): LineFragment[] {
  const range = document.createRange();
  const words: Segment[] = [];

  for (const match of raw.matchAll(/\S+/g)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    range.setStart(node, start);
    range.setEnd(node, end);

    // More than one client rect means this word straddles a line break.
    const parts =
      range.getClientRects().length > 1
        ? splitWrappedWord(node, range, start, end)
        : [measureSegment(node, range, start, end)];

    parts.forEach((part) => {
      if (part.rect.width > 0 || part.rect.height > 0) words.push(part);
    });
  }

  if (words.length === 0) return [];

  const collapse = !style.whiteSpace.startsWith("pre");
  const locale = localeOf(node);
  const lines: LineFragment[] = [];
  let group = [words[0]];

  const flush = () => {
    const first = group[0];
    const last = group[group.length - 1];
    let text = raw.slice(first.start, last.end);
    if (collapse) text = text.replace(/\s+/g, " ");
    text = applyTransform(text, style.textTransform, locale);

    const left = Math.min(...group.map((word) => word.rect.left));
    const right = Math.max(...group.map((word) => word.rect.right));
    const top = Math.min(...group.map((word) => word.rect.top));
    const bottom = Math.max(...group.map((word) => word.rect.bottom));
    lines.push({ text, rect: new DOMRect(left, top, right - left, bottom - top) });
  };

  for (let index = 1; index < words.length; index++) {
    const previous = group[group.length - 1];
    const current = words[index];
    // A new line box starts when the vertical position jumps or the text runs backwards.
    if (Math.abs(current.rect.top - previous.rect.top) > 1 || current.rect.left < previous.rect.left - 1) {
      flush();
      group = [current];
    } else {
      group.push(current);
    }
  }
  flush();

  return lines;
}

function isHidden(style: CSSStyleDeclaration): boolean {
  return style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity || "1") === 0;
}

export function paintTree(root: HTMLElement, ctx: PaintContext): void {
  const painter = new Painter(ctx);

  const visit = (element: Element, listIndex?: { value: number }) => {
    const style = getComputedStyle(element);
    if (isHidden(style)) return;

    const rect = element.getBoundingClientRect();
    painter.paintBox(element, style, rect);

    if (element instanceof HTMLElement && style.display === "list-item" && listIndex) {
      painter.paintListMarker(element, style, listIndex.value);
      listIndex.value += 1;
    }

    if (element.tagName === "IMG" || element.tagName === "svg") {
      painter.paintRaster(element, rect);
      return;
    }

    if (element instanceof HTMLAnchorElement && element.href) {
      painter.paintLink(rect, element.href);
    }

    const childListIndex = element.tagName === "OL" || element.tagName === "UL" ? { value: 1 } : listIndex;

    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        painter.paintTextNode(child as Text, style);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        visit(child as Element, childListIndex);
      }
    });
  };

  visit(root);
}
