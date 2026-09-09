/** The change model behind CVfix.
 *
 *  CVfix used to hand back a whole rebuilt draft and ask the candidate to take
 *  it or leave it, which is why "I fixed things and nothing improved" was the
 *  common experience — there was no way to see what it had actually done. It
 *  now proposes individual, addressable edits that the candidate accepts one at
 *  a time.
 *
 *  Everything here is verification rather than trust: the model names a path,
 *  quotes what is there now, and writes a replacement. The server checks that
 *  the path exists, that the quote really matches the current CV, and that the
 *  replacement invents nothing. A change failing any of those is dropped
 *  rather than shown — a proposal the candidate cannot safely accept is worse
 *  than no proposal.
 */

import type { CvDraft } from "./draftTypes.js";
import { findGroundingIssues } from "./grounding.js";
import { EMPTY_DRAFT } from "./draftTypes.js";

/** Sections whose bullets CVfix may edit. */
export type BulletSection = "experience" | "education" | "projects";

export type ChangePath =
  | { kind: "jobTitle" }
  | { kind: "summary" }
  | { kind: "bullet"; section: BulletSection; entry: number; bullet: number }
  | { kind: "bulletAdd"; section: BulletSection; entry: number }
  | { kind: "skillAdd" };

export interface CvFixChange {
  id: string;
  /** The path as written, e.g. "experience[0].bullets[1]". */
  path: string;
  /** Human-readable location, filled in by the server from the draft. */
  where: string;
  before: string;
  after: string;
  why: string;
}

const BULLET_PATH = /^(experience|education|projects)\[(\d+)\]\.bullets\[(\d+)\]$/;
const BULLET_ADD_PATH = /^(experience|education|projects)\[(\d+)\]\.bullets$/;

export function parsePath(path: string): ChangePath | null {
  if (path === "jobTitle") return { kind: "jobTitle" };
  if (path === "summary") return { kind: "summary" };
  if (path === "skills") return { kind: "skillAdd" };

  const bullet = BULLET_PATH.exec(path);
  if (bullet) {
    return {
      kind: "bullet",
      section: bullet[1] as BulletSection,
      entry: Number(bullet[2]),
      bullet: Number(bullet[3]),
    };
  }

  const add = BULLET_ADD_PATH.exec(path);
  if (add) {
    return { kind: "bulletAdd", section: add[1] as BulletSection, entry: Number(add[2]) };
  }

  return null;
}

/** What the CV says at that path right now, or null when the path points at
 *  something that is not there. Additions read as an empty string. */
export function readPath(draft: CvDraft, path: ChangePath): string | null {
  switch (path.kind) {
    case "jobTitle":
      return draft.jobTitle;
    case "summary":
      return draft.summary;
    case "skillAdd":
      return "";
    case "bullet": {
      const entry = draft[path.section][path.entry];
      if (!entry) return null;
      const text = entry.bullets[path.bullet];
      return text === undefined ? null : text;
    }
    case "bulletAdd": {
      const entry = draft[path.section][path.entry];
      return entry ? "" : null;
    }
  }
}

/** A label the candidate can locate in their own CV — "Barista · Coffee Lab"
 *  rather than "experience[0].bullets[2]". */
export function describeLocation(draft: CvDraft, path: ChangePath): string {
  switch (path.kind) {
    case "jobTitle":
      return "jobTitle";
    case "summary":
      return "summary";
    case "skillAdd":
      return "skills";
    case "bullet":
    case "bulletAdd": {
      const entry = draft[path.section][path.entry];
      if (!entry) return path.section;
      if (path.section === "projects") {
        return (entry as CvDraft["projects"][number]).title || "project";
      }
      const named = entry as CvDraft["experience"][number] | CvDraft["education"][number];
      const parts =
        "role" in named
          ? [named.role, named.company]
          : [(named as CvDraft["education"][number]).degree, (named as CvDraft["education"][number]).institution];
      return parts.filter(Boolean).join(" · ") || path.section;
    }
  }
}

/** Whitespace-insensitive comparison. The model reliably reproduces the words
 *  and unreliably reproduces the spacing, and rejecting a good change over a
 *  double space would be pedantry with a cost. */
function sameText(a: string, b: string): boolean {
  return a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
}

/** A change's replacement text, isolated in a draft of its own, so the
 *  existing grounding check can be pointed at it without the rest of the CV
 *  vouching for it. */
function draftOf(path: ChangePath, text: string): CvDraft {
  switch (path.kind) {
    case "jobTitle":
      return { ...EMPTY_DRAFT, jobTitle: text };
    case "summary":
      return { ...EMPTY_DRAFT, summary: text };
    case "skillAdd":
      return { ...EMPTY_DRAFT, skills: [{ name: text, level: 50 }] };
    case "bullet":
    case "bulletAdd":
      return {
        ...EMPTY_DRAFT,
        experience: [
          { role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [text] },
        ],
      };
  }
}

export interface ChangeRejection {
  path: string;
  reason: "unknown_path" | "not_found" | "stale" | "empty" | "unchanged" | "fabricated";
}

export interface ValidationResult {
  changes: CvFixChange[];
  rejected: ChangeRejection[];
}

interface RawChange {
  path?: unknown;
  before?: unknown;
  after?: unknown;
  why?: unknown;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Keeps only the proposals that are safe to show.
 *
 *  `source` is everything the candidate has ever told us — their CV plus, for
 *  an upload, the extracted text. A replacement may reword freely inside that
 *  material but may not introduce a fact from outside it. */
export function validateChanges(raw: unknown, draft: CvDraft, source: string): ValidationResult {
  if (!Array.isArray(raw)) return { changes: [], rejected: [] };

  const changes: CvFixChange[] = [];
  const rejected: ChangeRejection[] = [];
  const seen = new Set<string>();

  raw.forEach((item, index) => {
    const entry = (item ?? {}) as RawChange;
    const pathText = asString(entry.path);
    const after = asString(entry.after);
    const before = asString(entry.before);

    const path = parsePath(pathText);
    if (!path) {
      rejected.push({ path: pathText || `#${index}`, reason: "unknown_path" });
      return;
    }

    const current = readPath(draft, path);
    if (current === null) {
      rejected.push({ path: pathText, reason: "not_found" });
      return;
    }

    if (!after) {
      rejected.push({ path: pathText, reason: "empty" });
      return;
    }

    // An addition has nothing to be stale against; a replacement must quote
    // what is actually there, or it is editing a CV we are not holding.
    const isAddition = path.kind === "bulletAdd" || path.kind === "skillAdd";
    if (!isAddition && !sameText(before, current)) {
      rejected.push({ path: pathText, reason: "stale" });
      return;
    }

    if (!isAddition && sameText(after, current)) {
      rejected.push({ path: pathText, reason: "unchanged" });
      return;
    }

    if (findGroundingIssues(draftOf(path, after), source).length > 0) {
      rejected.push({ path: pathText, reason: "fabricated" });
      return;
    }

    // One edit per location: two proposals for the same bullet cannot both be
    // applied, and the second would be judged against pre-first text.
    const key = pathText;
    if (path.kind !== "bulletAdd" && path.kind !== "skillAdd" && seen.has(key)) {
      rejected.push({ path: pathText, reason: "stale" });
      return;
    }
    seen.add(key);

    changes.push({
      id: `${pathText}#${index}`,
      path: pathText,
      where: describeLocation(draft, path),
      before: isAddition ? "" : current,
      after,
      why: asString(entry.why),
    });
  });

  return { changes, rejected };
}
