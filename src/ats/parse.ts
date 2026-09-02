import type { ExtractedResume } from "./extractResume";

/** Lowercases and strips Greek accents so heading matching is forgiving. */
export function normalize(value: string): string {
  return value
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const EMAIL_PATTERN = /[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}/gi;
export const PHONE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d[\d\s.-]{7,13}\d/g;
export const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s,;)<>]+|(?:linkedin\.com|github\.com|gitlab\.com)\/[^\s,;)<>]+/gi;
export const DATE_RANGE_PATTERN =
  /((?:0?[1-9]|1[0-2])[/.-](?:19|20)\d{2}|(?:19|20)\d{2})\s*(?:[-–—]|to|έως|ως)\s*((?:0?[1-9]|1[0-2])[/.-](?:19|20)\d{2}|(?:19|20)\d{2}|present|current|now|σήμερα|τώρα|παρόν)/gi;
export const MONTH_YEAR_PATTERN =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ιαν|φεβ|μαρ|απρ|μαΐ|μαϊ|μαι|ιουν|ιουλ|αυγ|σεπ|οκτ|νοε|δεκ)[a-zα-ωά-ώ]*\.?\s*,?\s*((?:19|20)\d{2})/gi;

export const HEADING_PATTERNS = {
  summary: ["professional summary", "summary", "profile", "objective", "about me", "about", "προφιλ", "επαγγελματικο προφιλ", "συνοψη", "στοχος"],
  experience: [
    "work experience", "professional experience", "employment history", "employment", "experience",
    "career history", "work history", "εργασιακη εμπειρια", "επαγγελματικη εμπειρια", "προϋπηρεσια",
    "προυπηρεσια", "εμπειρια", "ιστορικο απασχολησης",
  ],
  education: ["education", "academic background", "qualifications", "εκπαιδευση", "σπουδες", "ακαδημαϊκο υποβαθρο", "ακαδημαικο υποβαθρο", "εκπαιδευση και καταρτιση"],
  skills: ["technical skills", "core skills", "key skills", "skills", "competencies", "δεξιοτητες", "ικανοτητες", "γνωσεις", "τεχνικες δεξιοτητες"],
  languages: ["languages", "γλωσσες", "ξενες γλωσσες"],
  certifications: ["certifications", "certificates", "licenses", "πιστοποιησεις", "πιστοποιητικα"],
  projects: ["projects", "personal projects", "εργα", "προτζεκτ"],
} as const;

export type HeadingKey = keyof typeof HEADING_PATTERNS;
export const HEADING_KEYS = Object.keys(HEADING_PATTERNS) as HeadingKey[];

export interface DetectedSection {
  key: HeadingKey;
  heading: string;
  line: number;
}

/** A section heading is a short standalone line, so body text that merely
 *  mentions "experience" is not mistaken for one. */
export function findSections(lines: string[]): DetectedSection[] {
  const found: DetectedSection[] = [];
  const seen = new Set<HeadingKey>();

  lines.forEach((raw, index) => {
    const text = normalize(raw).replace(/[:：]+$/, "");
    if (text.length === 0 || text.length > 45) return;

    HEADING_KEYS.forEach((key) => {
      if (seen.has(key)) return;
      const matches = HEADING_PATTERNS[key].some(
        (pattern) => text === pattern || text.startsWith(`${pattern} `),
      );
      if (matches) {
        seen.add(key);
        found.push({ key, heading: raw.trim(), line: index });
      }
    });
  });

  return found.sort((a, b) => a.line - b.line);
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

const NAME_LINE = /^[\p{Lu}\p{L}][\p{L}'’.-]*(?:\s+[\p{L}'’.-]+){1,3}$/u;

/** The candidate name is the first short, digit-free line before any heading —
 *  exactly the guess a resume parser makes. */
function guessName(lines: string[], firstHeadingLine: number): string | null {
  const limit = firstHeadingLine >= 0 ? Math.min(firstHeadingLine, 8) : 8;
  for (let index = 0; index < Math.min(limit, lines.length); index++) {
    const line = lines[index].trim();
    if (line.length < 4 || line.length > 48) continue;
    if (/[@\d]/.test(line)) continue;
    if (NAME_LINE.test(line)) return line;
  }
  return null;
}

export interface ParsedFields {
  name: string | null;
  emails: string[];
  phones: string[];
  urls: string[];
  dateRanges: string[];
  sections: DetectedSection[];
  bulletLines: string[];
  wordCount: number;
}

export function parseResume(resume: ExtractedResume): ParsedFields {
  const { text, lines } = resume;
  const sections = findSections(lines);

  const phones = unique([...text.matchAll(PHONE_PATTERN)].map((match) => match[0]))
    // Long digit runs inside a CV are usually dates or amounts, not numbers to call.
    .filter((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15;
    });

  const dateRanges = unique([
    ...[...text.matchAll(DATE_RANGE_PATTERN)].map((match) => match[0]),
    ...[...text.matchAll(MONTH_YEAR_PATTERN)].map((match) => match[0]),
  ]);

  return {
    name: guessName(lines, sections[0]?.line ?? -1),
    emails: unique([...text.matchAll(EMAIL_PATTERN)].map((match) => match[0])),
    phones,
    urls: unique([...[...text.matchAll(URL_PATTERN)].map((match) => match[0]), ...resume.linkUrls]),
    dateRanges,
    sections,
    bulletLines: lines.filter((line) => /^\s*([•▪◦‣·*+–—-])\s+/.test(line)),
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}
