import type { AtsAxis, AtsAxisId, AtsCheck, AtsMatchAxis, AtsReport } from "./analyze";
import { actionVerbRatio } from "./actionVerbs";
import type { ExtractedResume } from "./extractResume";
import { matchKeywords } from "./keywords";
import { parseResume } from "./parse";
import type { ParsedFields } from "./parse";

const WEIGHT_CRITICAL = 3;
const WEIGHT_IMPORTANT = 2;
const WEIGHT_MINOR = 1;

/** Share of bullets that must open with an action before the check passes.
 *  Well under half is deliberate: a CV legitimately carries context lines
 *  alongside its achievements.
 *
 *  Exported because api/_lib/draftReview.ts holds the CVisor agent to the same
 *  number — a draft is not allowed to be "finished" while this report would
 *  mark it down. Its test fails if the two ever diverge. */
export const ACTION_VERB_TARGET = 0.5;

/** Coverage at which a CV is answering the ad rather than brushing past it. */
export const KEYWORD_TARGET = 0.6;

function check(
  id: AtsCheck["id"],
  axis: AtsAxisId,
  status: AtsCheck["status"],
  weight: number,
  value?: string | number,
): AtsCheck {
  return { id, axis, status, weight, value };
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

/** Weighted share of the checks that passed, 0-100.
 *
 *  A check the analyser could not evaluate contributes to neither side of the
 *  fraction — it is excluded, not silently counted as a pass. A single
 *  failure caps the result below "good", because one blocking defect can be
 *  enough for a real ATS to drop the document however well everything else
 *  scores. */
function scoreOf(checks: AtsCheck[]): number {
  const scored = checks.filter((item) => item.status !== "unknown");
  const earned = scored.reduce(
    (total, item) => total + item.weight * (item.status === "pass" ? 1 : item.status === "warn" ? 0.5 : 0),
    0,
  );
  const possible = scored.reduce((total, item) => total + item.weight, 0);
  const raw = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  return scored.some((item) => item.status === "fail") ? Math.min(raw, 69) : raw;
}

function axisOf(id: AtsAxisId, checks: AtsCheck[]): AtsAxis {
  const own = checks.filter((item) => item.axis === id);
  return { id, score: scoreOf(own), checks: own };
}

export interface ResumeAnalysis extends AtsReport {
  fields: ParsedFields;
}

/** Judges the document exactly as a parser would: what can be extracted, and
 *  what structure is present. It reports facts, not writing advice. */
export function analyzeResumeText(resume: ExtractedResume, jobAd: string): ResumeAnalysis {
  const fields = parseResume(resume);

  // With no text layer every other check would report a misleading "missing".
  //
  // Two very different documents land here, and they need different words. A
  // PDF carrying images but no text is a scan or a picture export: the words
  // are there, but only as pixels, and the fix is to export a real text PDF.
  // Everything else — a CV still being started in the builder, a nearly empty
  // file — simply has nothing in it yet. Telling that person their CV "is an
  // image" sends them hunting for a problem they do not have.
  if (!resume.hasTextLayer) {
    const scanned = resume.kind === "pdf" && resume.imageCount > 0;
    const id = scanned ? "textLayer" : "documentEmpty";
    const checks = [check(id, "format", "fail", WEIGHT_CRITICAL, scanned ? 0 : fields.wordCount)];
    return {
      format: axisOf("format", checks),
      content: axisOf("content", []),
      match: null,
      checks,
      keywords: null,
      fields,
    };
  }

  const sectionKeys = new Set(fields.sections.map((section) => section.key));
  const topLines = resume.lines.slice(0, 12).join("\n");
  const bullets = fields.bulletLines;
  const verbRatio = actionVerbRatio(bullets);

  const shattered = shatteredLines(resume.lines);

  // ---------------------------------------------------------------- format
  // Everything a parser has to succeed at before the writing matters at all.
  const formatChecks: AtsCheck[] = [
    check("textLayer", "format", "pass", WEIGHT_CRITICAL, fields.wordCount),
    check(
      "spacedLetters",
      "format",
      shattered.length === 0 ? "pass" : "fail",
      WEIGHT_CRITICAL,
      shattered.length > 0 ? shattered[0].slice(0, 40) : 0,
    ),
    // Column layout is only actually measured for a PDF (from glyph geometry)
    // and the builder's own CV (known from its template). A DOCX/TXT extract
    // carries no positional data, so multiColumnPages is always 0 there —
    // reporting that as a "pass" would be a false positive, not a real check.
    resume.kind === "pdf" || resume.kind === "builder"
      ? check(
          "singleColumn",
          "format",
          resume.multiColumnPages === 0 ? "pass" : "fail",
          WEIGHT_CRITICAL,
          resume.multiColumnPages,
        )
      : check("singleColumn", "format", "unknown", WEIGHT_CRITICAL),
    check(
      "headingsFound",
      "format",
      sectionKeys.has("experience") && sectionKeys.has("education") && sectionKeys.has("skills")
        ? "pass"
        : fields.sections.length >= 2
          ? "warn"
          : "fail",
      WEIGHT_CRITICAL,
      fields.sections.length,
    ),
    check("email", "format", fields.emails.length > 0 ? "pass" : "fail", WEIGHT_CRITICAL, fields.emails[0] ?? ""),
    check("phone", "format", fields.phones.length > 0 ? "pass" : "fail", WEIGHT_IMPORTANT, fields.phones[0] ?? ""),
    check(
      "contactAtTop",
      "format",
      /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(topLines) ? "pass" : "warn",
      WEIGHT_IMPORTANT,
    ),
    check("photo", "format", resume.imageCount === 0 ? "pass" : "warn", WEIGHT_MINOR, resume.imageCount),
    check(
      "fileName",
      "format",
      /^[\p{L}\p{N}][\p{L}\p{N} ._-]{3,}\.(pdf|docx|txt)$/iu.test(resume.fileName) ? "pass" : "warn",
      WEIGHT_MINOR,
      resume.fileName,
    ),
  ];

  // --------------------------------------------------------------- content
  // What the document says once it has been read successfully.
  const contentChecks: AtsCheck[] = [
    check("summary", "content", sectionKeys.has("summary") ? "pass" : "warn", WEIGHT_MINOR),
    check("experience", "content", sectionKeys.has("experience") ? "pass" : "fail", WEIGHT_CRITICAL),
    check("education", "content", sectionKeys.has("education") ? "pass" : "warn", WEIGHT_IMPORTANT),
    check("skills", "content", sectionKeys.has("skills") ? "pass" : "warn", WEIGHT_IMPORTANT),
    check(
      "experienceDates",
      "content",
      fields.dateRanges.length >= 2 ? "pass" : fields.dateRanges.length === 1 ? "warn" : "fail",
      WEIGHT_CRITICAL,
      fields.dateRanges.length,
    ),
    check(
      "bullets",
      "content",
      bullets.length >= 4 ? "pass" : bullets.length > 0 ? "warn" : "fail",
      WEIGHT_IMPORTANT,
      bullets.length,
    ),
    check(
      "actionVerbs",
      "content",
      bullets.length === 0 ? "warn" : verbRatio >= ACTION_VERB_TARGET ? "pass" : "warn",
      WEIGHT_IMPORTANT,
      Math.round(verbRatio * 100),
    ),
    check(
      "quantified",
      "content",
      bullets.length === 0 ? "warn" : bullets.some((line) => /\d/.test(line)) ? "pass" : "warn",
      WEIGHT_IMPORTANT,
      bullets.filter((line) => /\d/.test(line)).length,
    ),
    check("onlineProfile", "content", fields.urls.length > 0 ? "pass" : "warn", WEIGHT_MINOR, fields.urls.length),
    check("length", "content", resume.pageCount <= 2 ? "pass" : "warn", WEIGHT_IMPORTANT, resume.pageCount),
    check(
      "wordCount",
      "content",
      fields.wordCount >= 250 && fields.wordCount <= 1200 ? "pass" : "warn",
      WEIGHT_MINOR,
      fields.wordCount,
    ),
  ];

  // ----------------------------------------------------------------- match
  // Scored as plain coverage rather than as weighted checks: "your CV says
  // 8 of the 20 things this ad asks for" is a fact the reader can act on,
  // and it never drags the document's own score down.
  const keywords = matchKeywords(resume.text, jobAd);
  const matchChecks: AtsCheck[] = keywords
    ? [
        check(
          "keywords",
          "match",
          // Never "fail": missing an ad's vocabulary is a reason to rewrite
          // for that ad, not a defect in the document.
          keywords.ratio >= KEYWORD_TARGET ? "pass" : "warn",
          WEIGHT_IMPORTANT,
          Math.round(keywords.ratio * 100),
        ),
      ]
    : [];

  const checks = [...formatChecks, ...contentChecks, ...matchChecks];
  const format = axisOf("format", checks);
  const content = axisOf("content", checks);
  const match: AtsMatchAxis | null = keywords
    ? { id: "match", score: Math.round(keywords.ratio * 100), checks: matchChecks, keywords }
    : null;

  return { format, content, match, checks, keywords, fields };
}
