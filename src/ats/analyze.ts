import type { KeywordReport } from "./keywords";

/** "unknown" is for a check the analyser cannot actually evaluate for this
 *  document (e.g. column layout in a DOCX, which carries no geometry) — it
 *  must never render as a silent "pass", and it earns no score either way. */
export type AtsStatus = "pass" | "warn" | "fail" | "unknown";

/** The three questions a CV is judged on, kept apart because they have
 *  different answers and different fixes.
 *
 *  A single blended number was the old design, and it could not tell the
 *  difference between "this file is unreadable to a parser" and "you are not
 *  a match for this particular ad" — which meant a good CV sent to an
 *  ambitious job looked broken, and the user could not tell whether to fix
 *  the document or pick a different job. */
export type AtsAxisId = "format" | "content" | "match";

export type AtsCheckId =
  | "textLayer"
  | "singleColumn"
  | "headingsFound"
  | "email"
  | "phone"
  | "contactAtTop"
  | "onlineProfile"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "experienceDates"
  | "bullets"
  | "actionVerbs"
  | "quantified"
  | "length"
  | "wordCount"
  | "photo"
  | "fileName"
  | "spacedLetters"
  | "keywords";

export interface AtsCheck {
  id: AtsCheckId;
  axis: AtsAxisId;
  status: AtsStatus;
  weight: number;
  /** The measured fact behind the verdict, interpolated into the message. */
  value?: string | number;
}

export interface AtsAxis {
  id: AtsAxisId;
  score: number;
  checks: AtsCheck[];
}

export interface AtsMatchAxis extends AtsAxis {
  keywords: KeywordReport;
}

export interface AtsReport {
  /** Can a machine read this document and pull the right fields out of it. */
  format: AtsAxis;
  /** Is it written like a CV that gets read by a person once it is parsed. */
  content: AtsAxis;
  /** How much of this specific ad it answers. Null when no ad was given —
   *  that is an unasked question, not a score of zero. */
  match: AtsMatchAxis | null;
  /** Every check, in one list, for callers that just want to render them. */
  checks: AtsCheck[];
  keywords: KeywordReport | null;
}

/** Failures caused by how the document is laid out, rather than by how much
 *  of it has been written.
 *
 *  textLayer is deliberately absent. For an uploaded file it means "this is a
 *  scan with no text", which the report already shouts about on its own; for
 *  a CV still being written it only means "not enough words yet", and a flag
 *  that fires on every empty document is a flag nobody reads. */
const STRUCTURAL_CHECKS: AtsCheckId[] = ["spacedLetters", "singleColumn"];

/** True when a layout decision would defeat a parser, whatever is written.
 *
 *  Narrower than "any format check failed" on purpose. A missing email is a
 *  format failure too, but the author can see that gap in their own form; a
 *  two-column template quietly breaking the parse is invisible to them, and
 *  only the invisible kind earns an interrupting flag. */
export function hasStructuralFailure(report: AtsReport): boolean {
  return report.format.checks.some(
    (check) => check.status === "fail" && STRUCTURAL_CHECKS.includes(check.id),
  );
}

export function scoreBand(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/** A CV only "passes" when nothing about the document itself failed.
 *
 *  Keyword coverage is deliberately not part of this: not matching one ad is
 *  a reason to write a different CV, never a defect in this one. */
export function passesAts(report: AtsReport): boolean {
  return ![...report.format.checks, ...report.content.checks].some((check) => check.status === "fail");
}
