import type { CvDraft } from "./draftTypes.js";

/** Structural-only review, used by CVfix.
 *
 *  CVfix may not touch wording, so none of the editorial rules in
 *  draftReview apply here. What matters is that the fields are filled, the
 *  dates parse and nothing is left as raw markup — the things that decide
 *  whether a parser can read the rebuilt document.
 */

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function isMonthOrEmpty(value: string): boolean {
  return value === "" || MONTH_PATTERN.test(value);
}

export function reviewStructure(draft: CvDraft): string[] {
  const issues: string[] = [];

  if (draft.experience.length === 0 && draft.education.length === 0) {
    issues.push(
      "both experience and education are empty. The original CV almost certainly had one of them — map every role and every qualification you can find.",
    );
  }

  draft.experience.forEach((item, index) => {
    const at = `experience[${index}]`;
    if (!item.role.trim() && !item.company.trim()) {
      issues.push(`${at} has neither a role nor a company. Drop the entry or fill it from the original.`);
    }
    if (!isMonthOrEmpty(item.startDate) || !isMonthOrEmpty(item.endDate)) {
      issues.push(`${at} dates must be YYYY-MM or empty, got "${item.startDate}" / "${item.endDate}".`);
    }
    if (item.startDate && item.endDate && item.endDate < item.startDate) {
      issues.push(`${at}.endDate is before startDate.`);
    }
    if (item.current && item.endDate) {
      issues.push(`${at} is marked current, so endDate must be empty.`);
    }
    item.bullets.forEach((bullet, bulletIndex) => {
      if (/<[a-z/]/i.test(bullet)) issues.push(`${at}.bullets[${bulletIndex}] still contains HTML.`);
      if (/^[-•*▪·]/.test(bullet)) issues.push(`${at}.bullets[${bulletIndex}] still starts with a bullet character.`);
    });
  });

  draft.education.forEach((item, index) => {
    const at = `education[${index}]`;
    if (!item.degree.trim() && !item.institution.trim()) {
      issues.push(`${at} has neither a degree nor an institution.`);
    }
    if (!isMonthOrEmpty(item.startDate) || !isMonthOrEmpty(item.endDate)) {
      issues.push(`${at} dates must be YYYY-MM or empty.`);
    }
  });

  draft.certifications.forEach((item, index) => {
    if (!item.title.trim()) issues.push(`certifications[${index}].title is empty.`);
    if (!isMonthOrEmpty(item.date)) issues.push(`certifications[${index}].date must be YYYY-MM or empty.`);
  });

  draft.skills.forEach((item, index) => {
    if (!item.name.trim()) issues.push(`skills[${index}] is empty.`);
    // A "skill" that is really a sentence means a section was mis-mapped.
    if (item.name.length > 60) issues.push(`skills[${index}] is a sentence, not a skill: "${item.name.slice(0, 60)}".`);
  });

  return issues;
}

export function formatStructureReport(issues: string[]): string {
  if (issues.length === 0) return "STRUCTURE CHECK: clean.";
  return `STRUCTURE CHECK FAILED (${issues.length}):\n${issues.map((issue) => `- ${issue}`).join("\n")}`;
}
