import type { CvData, SectionKey } from "../types";
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
