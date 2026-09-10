import type { Dictionary } from "../i18n/translations";
import type { ProfileListKey, UserProfile } from "../types";
import { plainText } from "../utils/richText";
import { formatMonth } from "../pagination/format";
import { educationStepIds, experienceStepIds } from "./interview";
import type { InterviewState, StepAnswer, StepId } from "./interview";

/** Pre-fills the interview from the saved profile.
 *
 *  The point of the profile is that nothing is typed twice, so what is already
 *  known is filled in rather than asked. Two rules make that safe to undo:
 *
 *  Answers the candidate has already given in this interview always win. The
 *  profile is a starting point, not an authority, and quietly overwriting
 *  something they just typed would be the worst possible moment to be helpful.
 *
 *  And everything it wrote is handed back, so removing it later is exact —
 *  an import that cannot be taken back is one people hesitate to try.
 */

/** Which entries of each section to bring in, by id. A section absent from
 *  the record contributes nothing. */
export type ProfileSelection = Partial<Record<ProfileListKey, string[]>>;

export interface ProfileFillResult {
  state: InterviewState;
  /** Exactly what was written, so an undo removes that and nothing else. */
  imported: Record<StepId, StepAnswer>;
}

/** The sections the interview has somewhere to put. Soft skills are absent
 *  because it never asks about them. */
export const FILLABLE_SECTIONS: ProfileListKey[] = [
  "experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "projects",
  "interests",
];

/** How many entries of a section the interview can take. Past this the CV is
 *  long enough that another entry costs more than it adds. */
const MAX_ENTRIES = 6;

function period(startDate: string, endDate: string, current: boolean, dictionary: Dictionary): string {
  const locale = dictionary.locale;
  const from = startDate ? formatMonth(startDate, locale) : "";
  const to = current ? dictionary.placeholders.present : endDate ? formatMonth(endDate, locale) : "";
  return [from, to].filter(Boolean).join(" – ");
}

function chosen<T extends { id: string }>(entries: T[], ids: string[] | undefined): T[] {
  if (!ids) return [];
  return entries.filter((entry) => ids.includes(entry.id));
}

export function profileToInterview(
  profile: UserProfile,
  current: InterviewState,
  dictionary: Dictionary,
  selection: ProfileSelection,
): ProfileFillResult {
  const answers = { ...current.answers };
  const imported: Record<StepId, StepAnswer> = {};

  const keep = (id: StepId, value: StepAnswer) => {
    if (answers[id]) return;
    if (Object.values(value).every((entry) => !entry.trim())) return;
    answers[id] = value;
    imported[id] = value;
  };

  const experience = chosen(profile.experience, selection.experience).slice(0, MAX_ENTRIES);
  experience.forEach((item, index) => {
    const ids = experienceStepIds(index);
    keep(ids.identity, {
      role: item.role,
      company: item.company,
      period: period(item.startDate, item.endDate, item.current, dictionary),
    });

    // The description is the candidate's own account of the job, which is
    // exactly what the story step asks for — so it is an answer, not a hint.
    const story = plainText(item.description);
    if (story) keep(ids.story, { value: story });

    // Only the last one answers "is there another?" with a no; the rest have
    // a next entry to walk to.
    keep(ids.more, {
      value: index === experience.length - 1 ? dictionary.cvisorChat.no : dictionary.cvisorChat.yes,
    });
  });

  const education = chosen(profile.education, selection.education).slice(0, MAX_ENTRIES);
  education.forEach((item, index) => {
    const ids = educationStepIds(index);
    keep(ids.identity, {
      degree: item.degree,
      institution: item.institution,
      period: period(item.startDate, item.endDate, item.current, dictionary),
    });
    keep(ids.more, {
      value: index === education.length - 1 ? dictionary.cvisorChat.no : dictionary.cvisorChat.yes,
    });
  });

  const skills = chosen(profile.skills, selection.skills);
  if (skills.length > 0) keep("skills", { value: skills.map((item) => item.name).join(", ") });

  const languages = chosen(profile.languages, selection.languages);
  if (languages.length > 0) {
    keep("languages", {
      value: languages.map((item) => (item.level ? `${item.name} (${item.level})` : item.name)).join(", "),
    });
  }

  // Carry each entry's substance, not just its name. A project reduced to its
  // title gives the agent nothing to write from, and it may not invent the
  // rest — so it would land in the CV as a bare heading.
  const extras = [
    ...chosen(profile.certifications, selection.certifications).map((item) =>
      [item.title, item.issuer, item.date ? formatMonth(item.date, dictionary.locale) : ""]
        .filter(Boolean)
        .join(", "),
    ),
    ...chosen(profile.projects, selection.projects).map((item) =>
      [item.title, item.link, plainText(item.description)].filter(Boolean).join(" — "),
    ),
    ...chosen(profile.interests, selection.interests).map((item) => item.name),
  ].filter(Boolean);
  if (extras.length > 0) keep("extras", { value: extras.join("\n") });

  return { state: { ...current, answers }, imported };
}

/** Removes what an import wrote, leaving anything since edited by hand.
 *
 *  Comparing values rather than just forgetting the ids is what makes the undo
 *  safe to reach for: a job the candidate corrected after importing it is
 *  their answer now, not the profile's, and taking it away would be a second
 *  surprise on top of the one they were trying to fix. */
export function removeImported(
  state: InterviewState,
  imported: Record<StepId, StepAnswer>,
): InterviewState {
  const answers = { ...state.answers };

  Object.entries(imported).forEach(([id, value]) => {
    const present = answers[id];
    if (!present) return;
    const untouched =
      Object.keys(value).length === Object.keys(present).length &&
      Object.entries(value).every(([field, entry]) => present[field] === entry);
    if (untouched) delete answers[id];
  });

  return { ...state, answers };
}

/** Whether importing would fill anything in. A button that visibly does
 *  nothing is worse than no button. */
export function profileHasAnything(profile: UserProfile): boolean {
  return FILLABLE_SECTIONS.some((section) => profile[section].length > 0);
}
