import type { CvData } from "../types";
import { normalizeCvData } from "../data/normalize";

const FILE_MARKER = "cvsible";
const FILE_VERSION = 1;

interface CvFile {
  app: typeof FILE_MARKER;
  version: number;
  exportedAt: string;
  cv: CvData;
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cv"
  );
}

export function buildJsonFilename(fullName: string): string {
  return `CVsible-${slugify(fullName)}.json`;
}

export function downloadCvJson(data: CvData): void {
  const payload: CvFile = {
    app: FILE_MARKER,
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    cv: data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildJsonFilename(data.personalInfo.fullName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export class CvFileError extends Error {}

/** Accepts both the wrapped export format and a bare CvData object, so a file
 *  hand-edited down to its `cv` key still imports. */
export async function readCvJson(file: File): Promise<CvData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new CvFileError("invalid-json");
  }

  if (!parsed || typeof parsed !== "object") throw new CvFileError("invalid-json");

  const candidate =
    "cv" in parsed && parsed.cv && typeof parsed.cv === "object"
      ? (parsed as CvFile).cv
      : (parsed as Partial<CvData>);

  if (!("personalInfo" in candidate) && !("experience" in candidate)) {
    throw new CvFileError("not-a-cv");
  }

  return normalizeCvData(candidate as Partial<CvData>);
}
