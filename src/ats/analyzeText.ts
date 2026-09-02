import type { AtsCheck, AtsReport } from "./analyze";
import { extractJobAdKeywords } from "./analyze";
import type { ExtractedResume } from "./extractResume";
import { normalize, parseResume } from "./parse";
import type { ParsedFields } from "./parse";
import { ACTION_VERBS_EL, ACTION_VERBS_EN } from "./rules";

const WEIGHT_CRITICAL = 3;
const WEIGHT_IMPORTANT = 2;
const WEIGHT_MINOR = 1;

function startsWithActionVerb(line: string): boolean {
  const first = normalize(line.replace(/^\s*([•▪◦‣·*+–—-])\s+/, "")).split(" ")[0];
  if (!first) return false;
  return (
    ACTION_VERBS_EN.includes(first) ||
    ACTION_VERBS_EL.some((verb) => first.startsWith(normalize(verb).slice(0, 5)))
  );
}

function check(id: AtsCheck["id"], status: AtsCheck["status"], weight: number, value?: string | number): AtsCheck {
  return { id, status, weight, value };
}

/** Wide letter-spacing makes PDF extractors emit one space per glyph, so a
 *  heading arrives as "S K I L L S" and no parser recognises it. */
function shatteredLines(lines: string[]): string[] {
  return lines.filter((line) => {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 4) return false;
    const singles = tokens.filter((token) => token.length === 1 && /\p{L}/u.test(token)).length;
    return singles / tokens.length >= 0.6;
  });
}

function scoreOf(checks: AtsCheck[]): number {
  const earned = checks.reduce(
    (total, item) => total + item.weight * (item.status === "pass" ? 1 : item.status === "warn" ? 0.5 : 0),
    0,
  );
  const possible = checks.reduce((total, item) => total + item.weight, 0);
  return possible === 0 ? 0 : Math.round((earned / possible) * 100);
}

function keywordSection(text: string, jobAd: string) {
  if (!jobAd.trim()) return null;
  const terms = extractJobAdKeywords(jobAd);
  if (terms.length === 0) return null;

  const haystack = new Set(
    normalize(text)
      .split(/[^\p{L}\p{N}+#.]+/u)
      .filter(Boolean),
  );
  const matched = terms.filter((term) => haystack.has(normalize(term)));
  const missing = terms.filter((term) => !haystack.has(normalize(term)));
  return { matched, missing, ratio: matched.length / terms.length };
}

export interface ResumeAnalysis extends AtsReport {
  fields: ParsedFields;
}

/** Judges the document exactly as a parser would: what can be extracted, and
 *  what structure is present. It reports facts, not writing advice. */
export function analyzeResumeText(resume: ExtractedResume, jobAd: string): ResumeAnalysis {
  const fields = parseResume(resume);

  // With no text layer every other check would report a misleading "missing".
  if (!resume.hasTextLayer) {
    const checks = [check("textLayer", "fail", WEIGHT_CRITICAL, 0)];
    return { score: 0, checks, keywords: null, fields };
  }

  const sectionKeys = new Set(fields.sections.map((section) => section.key));
  const topLines = resume.lines.slice(0, 12).join("\n");
  const bullets = fields.bulletLines;
  const verbBullets = bullets.filter(startsWithActionVerb).length;

  const shattered = shatteredLines(resume.lines);

  const checks: AtsCheck[] = [
    check("textLayer", "pass", WEIGHT_CRITICAL, fields.wordCount),
    check(
      "spacedLetters",
      shattered.length === 0 ? "pass" : "fail",
      WEIGHT_CRITICAL,
      shattered.length > 0 ? shattered[0].slice(0, 40) : 0,
    ),
    check(
      "singleColumn",
      resume.multiColumnPages === 0 ? "pass" : "fail",
      WEIGHT_CRITICAL,
      resume.multiColumnPages,
    ),
    check(
      "headingsFound",
      sectionKeys.has("experience") && sectionKeys.has("education") && sectionKeys.has("skills")
        ? "pass"
        : fields.sections.length >= 2
          ? "warn"
          : "fail",
      WEIGHT_CRITICAL,
      fields.sections.length,
    ),

    check("email", fields.emails.length > 0 ? "pass" : "fail", WEIGHT_CRITICAL, fields.emails[0] ?? ""),
    check("phone", fields.phones.length > 0 ? "pass" : "fail", WEIGHT_IMPORTANT, fields.phones[0] ?? ""),
    check(
      "contactAtTop",
      /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(topLines) ? "pass" : "warn",
      WEIGHT_IMPORTANT,
    ),
    check("onlineProfile", fields.urls.length > 0 ? "pass" : "warn", WEIGHT_MINOR, fields.urls.length),

    check("summary", sectionKeys.has("summary") ? "pass" : "warn", WEIGHT_MINOR),
    check("experience", sectionKeys.has("experience") ? "pass" : "fail", WEIGHT_CRITICAL),
    check("education", sectionKeys.has("education") ? "pass" : "warn", WEIGHT_IMPORTANT),
    check("skills", sectionKeys.has("skills") ? "pass" : "warn", WEIGHT_IMPORTANT),

    check(
      "experienceDates",
      fields.dateRanges.length >= 2 ? "pass" : fields.dateRanges.length === 1 ? "warn" : "fail",
      WEIGHT_CRITICAL,
      fields.dateRanges.length,
    ),
    check(
      "bullets",
      bullets.length >= 4 ? "pass" : bullets.length > 0 ? "warn" : "fail",
      WEIGHT_IMPORTANT,
      bullets.length,
    ),
    check(
      "actionVerbs",
      bullets.length === 0 ? "warn" : verbBullets / bullets.length >= 0.4 ? "pass" : "warn",
      WEIGHT_IMPORTANT,
      bullets.length === 0 ? 0 : Math.round((verbBullets / bullets.length) * 100),
    ),
    check(
      "quantified",
      bullets.length === 0 ? "warn" : bullets.some((line) => /\d/.test(line)) ? "pass" : "warn",
      WEIGHT_IMPORTANT,
      bullets.filter((line) => /\d/.test(line)).length,
    ),

    check("length", resume.pageCount <= 2 ? "pass" : "warn", WEIGHT_IMPORTANT, resume.pageCount),
    check(
      "wordCount",
      fields.wordCount >= 250 && fields.wordCount <= 1200 ? "pass" : "warn",
      WEIGHT_MINOR,
      fields.wordCount,
    ),
    check("photo", resume.imageCount === 0 ? "pass" : "warn", WEIGHT_MINOR, resume.imageCount),
    check(
      "fileName",
      /^[\p{L}\p{N}][\p{L}\p{N} ._-]{3,}\.(pdf|docx|txt)$/iu.test(resume.fileName) ? "pass" : "warn",
      WEIGHT_MINOR,
      resume.fileName,
    ),
  ];

  const keywords = keywordSection(resume.text, jobAd);
  if (keywords) {
    checks.push(
      check(
        "keywords",
        keywords.ratio >= 0.6 ? "pass" : keywords.ratio >= 0.3 ? "warn" : "fail",
        WEIGHT_CRITICAL,
        Math.round(keywords.ratio * 100),
      ),
    );
  }

  return { score: scoreOf(checks), checks, keywords, fields };
}
