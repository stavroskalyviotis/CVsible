import type { CvData, ProfileListKey, UserProfile } from "../types";

/** Identity of an entry across the profile and a CV.
 *
 *  Two entries are "the same" when the facts that identify them match — not
 *  when every field does. A role reworded for one job ad is still the same
 *  job, so wording is deliberately left out of the key: otherwise every
 *  tailored CV would look like it holds new experience the profile is
 *  missing, and the save-to-profile prompt would never stop asking. */
export function entryKey(section: ProfileListKey, entry: unknown): string {
  const item = entry as Record<string, unknown>;
  const text = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase("el");

  switch (section) {
    case "experience":
      return [text(item.role), text(item.company), text(item.startDate)].join("|");
    case "education":
      return [text(item.degree), text(item.institution), text(item.startDate)].join("|");
    case "certifications":
      return [text(item.title), text(item.issuer)].join("|");
    case "projects":
      return text(item.title);
    default:
      // skills, softSkills, languages, interests are all name-keyed.
      return text(item.name);
  }
}

/** True once an entry carries enough to be worth remembering. Blank rows the
 *  user added but never filled in must never trigger a save-to-profile
 *  prompt, and must never be offered for import. */
export function isMeaningfulEntry(section: ProfileListKey, entry: unknown): boolean {
  return entryKey(section, entry).replace(/\|/g, "").length > 0;
}

/** Entries present in the CV that the profile has never seen. This is what
 *  the builder offers to save back, so the profile grows as the person works
 *  instead of going stale the moment they write something new. */
export function entriesMissingFromProfile<K extends ProfileListKey>(
  section: K,
  cv: CvData,
  profile: UserProfile | null,
): CvData[K] {
  if (!profile) return [] as unknown as CvData[K];
  const known = new Set(profile[section].map((entry) => entryKey(section, entry)));
  return (cv[section] as unknown[]).filter(
    (entry) => isMeaningfulEntry(section, entry) && !known.has(entryKey(section, entry)),
  ) as CvData[K];
}

/** Profile entries not yet in the CV — the ones worth offering in the import
 *  picker. Anything already in the document is left out rather than shown as
 *  a checkbox that would silently duplicate it. */
export function entriesAvailableToImport<K extends ProfileListKey>(
  section: K,
  profile: UserProfile,
  cv: CvData,
): UserProfile[K] {
  const present = new Set(cv[section].map((entry) => entryKey(section, entry)));
  return (profile[section] as unknown[]).filter(
    (entry) => isMeaningfulEntry(section, entry) && !present.has(entryKey(section, entry)),
  ) as UserProfile[K];
}
