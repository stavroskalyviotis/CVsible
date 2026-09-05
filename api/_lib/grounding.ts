/** Deterministic anti-fabrication check.
 *
 *  The agent may rewrite the candidate's wording freely, but every hard fact —
 *  an employer, an institution, a technology, a number — has to be traceable to
 *  what the candidate actually wrote. This module answers that question with
 *  string matching rather than trusting the model, and the failures are fed
 *  straight back into the loop.
 */

import type { CvDraft } from "./draftTypes.js";

const GREEK_TONOS: Record<string, string> = {
  ά: "α", έ: "ε", ή: "η", ί: "ι", ό: "ο", ύ: "υ", ώ: "ω", ϊ: "ι", ϋ: "υ", ΐ: "ι", ΰ: "υ", ς: "σ",
};

export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[άέήίόύώϊϋΐΰς]/g, (char) => GREEK_TONOS[char] ?? char)
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Numbers a bullet may contain without being a factual claim: ordinary
 *  date parts and small counts that come from rephrasing, not invention. */
const NUMBER_NOISE = /^(19|20)\d{2}$/;

function tokens(value: string): string[] {
  return normalizeForMatch(value).split(" ").filter(Boolean);
}

/** A name is supported when it appears verbatim, or when every one of its
 *  tokens appears somewhere in the source (which covers reordering and
 *  inflection differences between "Τμήμα Πληροφορικής" and "πληροφορικης"). */
function isSupported(name: string, haystack: string, haystackTokens: Set<string>): boolean {
  const normalized = normalizeForMatch(name);
  if (!normalized) return true;
  if (haystack.includes(normalized)) return true;

  const parts = normalized.split(" ").filter((part) => part.length > 1);
  if (parts.length === 0) return true;
  return parts.every((part) => haystackTokens.has(part));
}

export interface GroundingIssue {
  field: string;
  value: string;
  kind: "entity" | "number";
}

/** Every string in the draft that asserts a fact about the candidate. */
function factualEntries(draft: CvDraft): { field: string; value: string }[] {
  const entries: { field: string; value: string }[] = [];

  if (draft.jobTitle) entries.push({ field: "jobTitle", value: draft.jobTitle });

  draft.experience.forEach((item, index) => {
    entries.push({ field: `experience[${index}].company`, value: item.company });
    entries.push({ field: `experience[${index}].role`, value: item.role });
    if (item.location) entries.push({ field: `experience[${index}].location`, value: item.location });
  });

  draft.education.forEach((item, index) => {
    entries.push({ field: `education[${index}].institution`, value: item.institution });
    entries.push({ field: `education[${index}].degree`, value: item.degree });
  });

  draft.projects.forEach((item, index) => {
    entries.push({ field: `projects[${index}].title`, value: item.title });
  });

  draft.certifications.forEach((item, index) => {
    entries.push({ field: `certifications[${index}].title`, value: item.title });
    if (item.issuer) entries.push({ field: `certifications[${index}].issuer`, value: item.issuer });
  });

  draft.skills.forEach((item, index) => entries.push({ field: `skills[${index}]`, value: item.name }));
  draft.languages.forEach((item, index) => entries.push({ field: `languages[${index}]`, value: item.name }));
  draft.softSkills.forEach((value, index) => entries.push({ field: `softSkills[${index}]`, value }));
  draft.interests.forEach((value, index) => entries.push({ field: `interests[${index}]`, value }));

  return entries.filter((entry) => entry.value.trim().length > 0);
}

/** Bullets and the summary may be rephrased, but any figure inside them must
 *  already exist in the source — this is where invented metrics show up. */
function narrativeNumbers(draft: CvDraft): { field: string; value: string }[] {
  const found: { field: string; value: string }[] = [];

  const scan = (field: string, text: string) => {
    for (const match of text.matchAll(/\d[\d.,]*\s*%?/g)) {
      const raw = match[0].trim().replace(/[.,]$/, "");
      const digitsOnly = raw.replace(/[^\d]/g, "");
      if (digitsOnly.length === 0) continue;
      if (NUMBER_NOISE.test(digitsOnly)) continue;
      found.push({ field, value: raw });
    }
  };

  scan("summary", draft.summary);
  draft.experience.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) => scan(`experience[${index}].bullets[${bulletIndex}]`, bullet)),
  );
  draft.education.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) => scan(`education[${index}].bullets[${bulletIndex}]`, bullet)),
  );
  draft.projects.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) => scan(`projects[${index}].bullets[${bulletIndex}]`, bullet)),
  );

  return found;
}

export function findGroundingIssues(draft: CvDraft, source: string): GroundingIssue[] {
  const haystack = normalizeForMatch(source);
  const haystackTokens = new Set(tokens(source));
  const sourceDigits = new Set((source.match(/\d[\d.,]*/g) ?? []).map((value) => value.replace(/[^\d]/g, "")));

  const issues: GroundingIssue[] = [];

  factualEntries(draft).forEach((entry) => {
    if (!isSupported(entry.value, haystack, haystackTokens)) {
      issues.push({ ...entry, kind: "entity" });
    }
  });

  narrativeNumbers(draft).forEach((entry) => {
    const digits = entry.value.replace(/[^\d]/g, "");
    if (!sourceDigits.has(digits)) {
      issues.push({ ...entry, kind: "number" });
    }
  });

  return issues;
}
