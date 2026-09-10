import type { Dictionary } from "../i18n/translations";
import type { UserProfile } from "../types";
import { plainText } from "../utils/richText";
import { formatMonth } from "../pagination/format";
import { educationStepIds, experienceStepIds } from "./interview";
import type { InterviewState } from "./interview";

/** Pre-fills the interview from the saved profile.
 *
 *  The point of the profile is that nothing is typed twice, so what is already
 *  known is filled in rather than asked. Answers the candidate has already
 *  given in this interview win: the profile is a starting point, not an
 *  authority, and quietly overwriting something they just typed would be the
 *  worst possible moment to be helpful.
 */

function period(startDate: string, endDate: string, current: boolean, dictionary: Dictionary): string {
  const locale = dictionary.locale;
  const from = startDate ? formatMonth(startDate, locale) : "";
  const to = current ? dictionary.placeholders.present : endDate ? formatMonth(endDate, locale) : "";
  return [from, to].filter(Boolean).join(" – ");
}

export function profileToInterview(
  profile: UserProfile,
  current: InterviewState,
  dictionary: Dictionary,
): InterviewState {
  const answers = { ...current.answers };

  const keep = (id: string, value: Record<string, string>) => {
    if (answers[id]) return;
    if (Object.values(value).every((entry) => !entry.trim())) return;
    answers[id] = value;
  };

  profile.experience.slice(0, 6).forEach((item, index) => {
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

    // Only the last profile job answers "is there another one?" with a no; the
    // rest have a next entry to walk to.
    const isLast = index === Math.min(profile.experience.length, 6) - 1;
    keep(ids.more, { value: isLast ? dictionary.cvisorChat.no : dictionary.cvisorChat.yes });
  });

  profile.education.slice(0, 6).forEach((item, index) => {
    const ids = educationStepIds(index);
    keep(ids.identity, {
      degree: item.degree,
      institution: item.institution,
      period: period(item.startDate, item.endDate, item.current, dictionary),
    });
    const isLast = index === Math.min(profile.education.length, 6) - 1;
    keep(ids.more, { value: isLast ? dictionary.cvisorChat.no : dictionary.cvisorChat.yes });
  });

  if (profile.skills.length > 0) {
    keep("skills", { value: profile.skills.map((item) => item.name).join(", ") });
  }

  if (profile.languages.length > 0) {
    keep("languages", {
      value: profile.languages.map((item) => (item.level ? `${item.name} (${item.level})` : item.name)).join(", "),
    });
  }

  // Carry each entry's substance, not just its name. A project reduced to its
  // title gives the agent nothing to write from, and it may not invent the
  // rest — so it would land in the CV as a bare heading.
  const extras = [
    ...profile.certifications.map((item) =>
      [item.title, item.issuer, item.date ? formatMonth(item.date, dictionary.locale) : ""]
        .filter(Boolean)
        .join(", "),
    ),
    ...profile.projects.map((item) =>
      [item.title, item.link, plainText(item.description)].filter(Boolean).join(" — "),
    ),
    ...profile.interests.map((item) => item.name),
  ].filter(Boolean);
  if (extras.length > 0) keep("extras", { value: extras.join("\n") });

  return { ...current, answers };
}

/** Whether importing would actually fill anything in. A button that visibly
 *  does nothing is worse than no button. */
export function profileHasAnything(profile: UserProfile): boolean {
  return (
    profile.experience.length > 0 ||
    profile.education.length > 0 ||
    profile.skills.length > 0 ||
    profile.languages.length > 0
  );
}
