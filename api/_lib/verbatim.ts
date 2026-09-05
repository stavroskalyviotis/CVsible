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

/** Very short prose fragments produce noise on a strict substring test, so
 *  only long enough bullets/summary text are checked this way. Labels (a
 *  role, a skill name, ...) are a different kind of field — they're supposed
 *  to be a single copied token or short phrase, so they're checked in full
 *  below with no length floor, regardless of how short they are. */
const MIN_CHECKED_PROSE_CHARS = 12;

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

/** Fields the system prompt calls out as "labels, not prose": copied as
 *  written, never reworded. Dates are deliberately excluded — converting
 *  them to YYYY-MM is an explicitly required reformatting, not a rewording. */
function collectLabels(draft: CvDraft): { field: string; value: string }[] {
  const entries: { field: string; value: string }[] = [];

  draft.experience.forEach((item, index) => {
    entries.push({ field: `experience[${index}].role`, value: item.role });
    entries.push({ field: `experience[${index}].company`, value: item.company });
    if (item.location) entries.push({ field: `experience[${index}].location`, value: item.location });
  });
  draft.education.forEach((item, index) => {
    entries.push({ field: `education[${index}].degree`, value: item.degree });
    entries.push({ field: `education[${index}].institution`, value: item.institution });
    if (item.location) entries.push({ field: `education[${index}].location`, value: item.location });
  });
  draft.projects.forEach((item, index) =>
    entries.push({ field: `projects[${index}].title`, value: item.title }),
  );
  draft.certifications.forEach((item, index) => {
    entries.push({ field: `certifications[${index}].title`, value: item.title });
    if (item.issuer) entries.push({ field: `certifications[${index}].issuer`, value: item.issuer });
  });
  draft.skills.forEach((item, index) => entries.push({ field: `skills[${index}]`, value: item.name }));
  draft.languages.forEach((item, index) => entries.push({ field: `languages[${index}]`, value: item.name }));

  return entries.filter((entry) => entry.value.trim().length > 0);
}

export function findVerbatimIssues(draft: CvDraft, source: string): VerbatimIssue[] {
  const haystack = normalizeForMatch(source);
  const notFound = (entry: { field: string; value: string }) => !haystack.includes(normalizeForMatch(entry.value));

  const proseIssues = collectProse(draft)
    .filter((entry) => normalizeForMatch(entry.value).length >= MIN_CHECKED_PROSE_CHARS)
    .filter(notFound);
  const labelIssues = collectLabels(draft).filter(notFound);

  return [...proseIssues, ...labelIssues].map((entry) => ({ field: entry.field, value: entry.value }));
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
