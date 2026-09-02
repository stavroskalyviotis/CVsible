import { EMPTY_DRAFT } from "./draftTypes.js";
import type { CvDraft } from "./draftTypes.js";

/** Normalises whatever the model handed to save_draft.
 *
 *  The tool schema already constrains the shape, but the draft goes on to be
 *  measured and then written into the user's document, so it is cheaper to
 *  clean it once here than to defend against odd values everywhere later.
 */

const MAX_BULLETS = 5;
const MAX_LIST = 40;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown): boolean {
  return value === true;
}

/** Accepts YYYY-MM, and repairs the two shapes models most often produce. */
function month(value: unknown): string {
  const raw = str(value);
  if (!raw) return "";
  const iso = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(raw);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}`;
  const slash = /^(\d{1,2})\/(\d{4})$/.exec(raw);
  if (slash) return `${slash[2]}-${slash[1].padStart(2, "0")}`;
  const yearOnly = /^(\d{4})$/.exec(raw);
  if (yearOnly) return `${yearOnly[1]}-01`;
  return "";
}

function bullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => str(entry).replace(/^[-•*▪·]\s*/, "").replace(/<[^>]*>/g, ""))
    .filter(Boolean)
    .slice(0, MAX_BULLETS);
}

function nameList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    const name = str(entry);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
    if (result.length >= MAX_LIST) break;
  }
  return result;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value.slice(0, MAX_LIST) : [];
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function sanitizeDraft(input: unknown, languageLevels: string[]): CvDraft {
  const source = record(input);
  const levels = new Set(languageLevels);
  const middleLevel = languageLevels[Math.floor(languageLevels.length / 2)] ?? languageLevels[0] ?? "";

  const skillSeen = new Set<string>();

  return {
    ...EMPTY_DRAFT,
    jobTitle: str(source.jobTitle),
    summary: str(source.summary).replace(/<[^>]*>/g, ""),

    experience: array(source.experience).map((raw) => {
      const item = record(raw);
      const current = bool(item.current);
      return {
        role: str(item.role),
        company: str(item.company),
        location: str(item.location),
        startDate: month(item.startDate),
        endDate: current ? "" : month(item.endDate),
        current,
        bullets: bullets(item.bullets),
      };
    }),

    education: array(source.education).map((raw) => {
      const item = record(raw);
      const current = bool(item.current);
      return {
        degree: str(item.degree),
        institution: str(item.institution),
        location: str(item.location),
        startDate: month(item.startDate),
        endDate: current ? "" : month(item.endDate),
        current,
        bullets: bullets(item.bullets),
      };
    }),

    projects: array(source.projects).map((raw) => {
      const item = record(raw);
      return { title: str(item.title), link: str(item.link), bullets: bullets(item.bullets) };
    }),

    certifications: array(source.certifications).map((raw) => {
      const item = record(raw);
      return { title: str(item.title), issuer: str(item.issuer), date: month(item.date) };
    }),

    skills: array(source.skills).flatMap((raw) => {
      const item = record(raw);
      const name = str(item.name);
      const key = name.toLowerCase();
      if (!name || skillSeen.has(key)) return [];
      skillSeen.add(key);
      const level = Number(item.level);
      return [{ name, level: Number.isFinite(level) ? Math.min(100, Math.max(0, Math.round(level))) : 50 }];
    }),

    softSkills: nameList(source.softSkills),

    languages: array(source.languages).flatMap((raw) => {
      const item = record(raw);
      const name = str(item.name);
      if (!name) return [];
      const level = str(item.level);
      return [{ name, level: levels.has(level) ? level : middleLevel }];
    }),

    interests: nameList(source.interests),
    notes: array(source.notes).map(str).filter(Boolean).slice(0, 6),
  };
}
