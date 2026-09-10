import type { CvData, SectionKey, UserProfile } from "../types";
import { createId } from "../utils/id";
import { DEFAULT_THEME_COLOR } from "./themeColors";

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "experience",
  "education",
  "projects",
  "certifications",
  "skills",
  "softSkills",
  "languages",
  "interests",
];

export function createEmptyCvData(): CvData {
  return {
    template: "atlas",
    themeColor: DEFAULT_THEME_COLOR,
    fontFamily: "sans",
    density: "comfortable",
    showPhoto: true,
    photo: null,
    photoPosition: { x: 50, y: 50 },
    skillDisplay: "text",
    personalInfo: {
      fullName: "",
      jobTitle: "",
      summary: "",
      dateOfBirth: "",
      contacts: [
        { id: createId(), type: "email", value: "", label: "" },
        { id: createId(), type: "phone", value: "", label: "" },
        { id: createId(), type: "location", value: "", label: "" },
      ],
    },
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    languages: [],
    interests: [],
    certifications: [],
    projects: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

/** A blank master profile. Seeded with the same three empty contact rows as a
 *  new CV, so the form looks familiar the first time someone opens it. */
export function createEmptyProfile(): UserProfile {
  return {
    personalInfo: {
      fullName: "",
      jobTitle: "",
      summary: "",
      dateOfBirth: "",
      contacts: [
        { id: createId(), type: "email", value: "", label: "" },
        { id: createId(), type: "phone", value: "", label: "" },
        { id: createId(), type: "location", value: "", label: "" },
      ],
    },
    photo: null,
    photoPosition: { x: 50, y: 50 },
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    languages: [],
    interests: [],
    certifications: [],
    projects: [],
  };
}

/** Whether a document holds anything the user would mind losing.
 *
 *  A freshly-created CV is not empty — it carries default contacts, a
 *  template and section order — so "is it the default one" cannot be answered
 *  by comparing objects. These three fields are what someone actually types
 *  first, and they are the test for whether replacing this CV needs asking. */
export function hasAnyContent(data: CvData): boolean {
  return (
    data.personalInfo.fullName.trim() !== "" ||
    data.experience.length > 0 ||
    data.education.length > 0
  );
}
