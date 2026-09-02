import type { CvDraft } from "./draftTypes.js";
import { normalizeForMatch } from "./grounding.js";

/** CVfix restructures a CV without rewriting it. That promise is only worth
 *  something if it is enforced, so every piece of prose it outputs must still
 *  be a contiguous run of the original text once punctuation and spacing are
 *  normalised away. Splitting a paragraph into bullets keeps that property;
 *  rephrasing does not.
 */

export interface VerbatimIssue {
  field: string;
  value: string;
}

/** Very short fragments are structural labels rather than prose, and a strict
 *  substring test on them produces noise rather than signal. */
const MIN_CHECKED_CHARS = 12;

function collectProse(draft: CvDraft): { field: string; value: string }[] {
  const entries: { field: string; value: string }[] = [];

  if (draft.summary) entries.push({ field: "summary", value: draft.summary });

  draft.experience.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) =>
      entries.push({ field: `experience[${index}].bullets[${bulletIndex}]`, value: bullet }),
    ),
  );
  draft.education.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) =>
      entries.push({ field: `education[${index}].bullets[${bulletIndex}]`, value: bullet }),
    ),
  );
  draft.projects.forEach((item, index) =>
    item.bullets.forEach((bullet, bulletIndex) =>
      entries.push({ field: `projects[${index}].bullets[${bulletIndex}]`, value: bullet }),
    ),
  );

  return entries;
}

export function findVerbatimIssues(draft: CvDraft, source: string): VerbatimIssue[] {
  const haystack = normalizeForMatch(source);

  return collectProse(draft)
    .filter((entry) => normalizeForMatch(entry.value).length >= MIN_CHECKED_CHARS)
    .filter((entry) => !haystack.includes(normalizeForMatch(entry.value)))
    .map((entry) => ({ field: entry.field, value: entry.value }));
}

export function formatVerbatimReport(issues: VerbatimIssue[]): string {
  if (issues.length === 0) {
    return "VERBATIM CHECK: clean, every sentence still matches the original wording.";
  }
  const lines = issues.map(
    (issue) =>
      `- ${issue.field} has been reworded and no longer matches the original: "${issue.value.slice(0, 110)}". Copy the candidate's own wording instead.`,
  );
  return `VERBATIM CHECK FAILED (${issues.length}) — you rewrote text you were only allowed to move:\n${lines.join("\n")}`;
}
