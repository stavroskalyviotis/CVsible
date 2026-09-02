/** Photos and icons are the only genuinely bitmap-or-vector-path parts of a CV
 *  page. Everything else is drawn as PDF primitives, so these are rasterised
 *  once per export at a high device ratio and placed as images. */

export interface RasterImage {
  dataUrl: string;
  format: "PNG";
}

const DEVICE_RATIO = 4;

function parseObjectPosition(value: string, box: number, content: number): number {
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return ((box - content) * parseFloat(trimmed)) / 100;
  const pixels = parseFloat(trimmed);
  return Number.isFinite(pixels) ? pixels : (box - content) / 2;
}

function cornerRadius(style: CSSStyleDeclaration, width: number, height: number): number {
  const minSide = Math.min(width, height);
  const raw = style.borderTopLeftRadius;
  const value = raw.endsWith("%") ? (parseFloat(raw) / 100) * minSide : parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(value, minSide / 2);
}

function roundedPath(ctx: CanvasRenderingContext2D, w: number, h: number, r: number): void {
  ctx.beginPath();
  if (r <= 0) {
    ctx.rect(0, 0, w, h);
  } else {
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
  }
  ctx.closePath();
}

async function rasterizeImage(img: HTMLImageElement): Promise<RasterImage | null> {
  const rect = img.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || !img.naturalWidth) return null;

  const style = getComputedStyle(img);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(rect.width * DEVICE_RATIO);
  canvas.height = Math.round(rect.height * DEVICE_RATIO);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(DEVICE_RATIO, DEVICE_RATIO);

  const radius = cornerRadius(style, rect.width, rect.height);
  roundedPath(ctx, rect.width, rect.height, radius);
  ctx.save();
  ctx.clip();

  const ratio =
    style.objectFit === "contain"
      ? Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight)
      : Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
  const drawWidth = img.naturalWidth * ratio;
  const drawHeight = img.naturalHeight * ratio;
  const [posX, posY] = style.objectPosition.split(/\s+/);
  ctx.drawImage(
    img,
    parseObjectPosition(posX ?? "50%", rect.width, drawWidth),
    parseObjectPosition(posY ?? posX ?? "50%", rect.height, drawHeight),
    drawWidth,
    drawHeight,
  );
  ctx.restore();

  const borderWidth = parseFloat(style.borderTopWidth);
  if (borderWidth > 0 && style.borderTopStyle !== "none") {
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = borderWidth;
    roundedPath(ctx, rect.width, rect.height, radius);
    ctx.stroke();
  }

  return { dataUrl: canvas.toDataURL("image/png"), format: "PNG" };
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not rasterize SVG"));
    image.src = source;
  });
}

async function rasterizeSvg(svg: SVGElement): Promise<RasterImage | null> {
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const clone = svg.cloneNode(true) as SVGElement;
  const color = getComputedStyle(svg).color;
  // The icons paint with stroke="currentColor", which does not survive serialization.
  clone.setAttribute("stroke", color);
  clone.setAttribute("width", String(rect.width));
  clone.setAttribute("height", String(rect.height));
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const markup = new XMLSerializer().serializeToString(clone);
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width * DEVICE_RATIO));
  canvas.height = Math.max(1, Math.round(rect.height * DEVICE_RATIO));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return { dataUrl: canvas.toDataURL("image/png"), format: "PNG" };
}

export async function collectRasters(root: HTMLElement): Promise<Map<Element, RasterImage>> {
  const targets: Element[] = [...root.querySelectorAll("img"), ...root.querySelectorAll("svg")];

  const results = await Promise.all(
    targets.map(async (element) => {
      try {
        const raster =
          element.tagName === "IMG"
            ? await rasterizeImage(element as HTMLImageElement)
            : await rasterizeSvg(element as SVGElement);
        return raster ? ([element, raster] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  return new Map(results.filter((entry): entry is readonly [Element, RasterImage] => entry !== null));
}
