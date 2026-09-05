import { isStopword } from "./rules";

/** "unknown" is for a check the analyser cannot actually evaluate for this
 *  document (e.g. column layout in a DOCX, which carries no geometry) — it
 *  must never render as a silent "pass", and it earns no score either way. */
export type AtsStatus = "pass" | "warn" | "fail" | "unknown";

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
  status: AtsStatus;
  weight: number;
  /** The measured fact behind the verdict, interpolated into the message. */
  value?: string | number;
}

export interface AtsKeywordReport {
  matched: string[];
  missing: string[];
  ratio: number;
}

export interface AtsReport {
  score: number;
  checks: AtsCheck[];
  keywords: AtsKeywordReport | null;
}

/** Pulls the terms a job ad leans on, ranked by how often it repeats them. */
export function extractJobAdKeywords(jobAd: string, limit = 20): string[] {
  const counts = new Map<string, number>();

  jobAd
    .toLocaleLowerCase("el")
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter(Boolean)
    .forEach((word) => {
      if (word.length < 3 || isStopword(word) || /^\d+$/.test(word)) return;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

export function scoreBand(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/** A CV only "passes" when nothing critical failed, regardless of the score. */
export function passesAts(report: AtsReport): boolean {
  return !report.checks.some((check) => check.status === "fail");
}
