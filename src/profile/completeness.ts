import type { UserProfile } from "../types";
import { hasRichText } from "../utils/richText";
import { isMeaningfulEntry } from "./matching";

/** Every item the meter tracks, in the order it is worth filling them in. */
export const PROFILE_CHECKS = [
  "name",
  "jobTitle",
  "email",
  "phone",
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "photo",
] as const;

export type ProfileCheckKey = (typeof PROFILE_CHECKS)[number];

/** The number of skills below which the profile still counts as thin. Matches
 *  the bar the CVisor critic applies to a finished draft. */
const MIN_SKILLS = 5;

function hasContact(profile: UserProfile, type: "email" | "phone"): boolean {
  return profile.personalInfo.contacts.some((item) => item.type === type && item.value.trim().length > 0);
}

function countMeaningful(profile: UserProfile, section: "experience" | "education" | "skills" | "languages"): number {
  return profile[section].filter((entry) => isMeaningfulEntry(section, entry)).length;
}

export interface ProfileCompleteness {
  /** 0-100, one equal share per check. */
  percent: number;
  done: ProfileCheckKey[];
  missing: ProfileCheckKey[];
}

/** How much of the master profile is filled in.
 *
 *  Deliberately a flat count of equally weighted checks: a meter that weights
 *  its items invites arguing with the number instead of filling the gap it
 *  names, and every item here is one a CV genuinely wants. */
export function profileCompleteness(profile: UserProfile): ProfileCompleteness {
  const passed: Record<ProfileCheckKey, boolean> = {
    name: profile.personalInfo.fullName.trim().length > 0,
    jobTitle: profile.personalInfo.jobTitle.trim().length > 0,
    email: hasContact(profile, "email"),
    phone: hasContact(profile, "phone"),
    summary: hasRichText(profile.personalInfo.summary),
    experience: countMeaningful(profile, "experience") > 0,
    education: countMeaningful(profile, "education") > 0,
    skills: countMeaningful(profile, "skills") >= MIN_SKILLS,
    languages: countMeaningful(profile, "languages") > 0,
    photo: profile.photo !== null,
  };

  const done = PROFILE_CHECKS.filter((key) => passed[key]);
  const missing = PROFILE_CHECKS.filter((key) => !passed[key]);

  return {
    percent: Math.round((done.length / PROFILE_CHECKS.length) * 100),
    done,
    missing,
  };
}
