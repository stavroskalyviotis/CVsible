import type { CvData } from "../types";
import { createId } from "../utils/id";
import { DEFAULT_THEME_COLOR } from "./themeColors";

export function createEmptyCvData(): CvData {
  return {
    themeColor: DEFAULT_THEME_COLOR,
    fontFamily: "sans",
    density: "comfortable",
    showPhoto: true,
    photo: null,
    personalInfo: {
      fullName: "",
      jobTitle: "",
      summary: "",
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
    sidebarOrder: ["skills", "softSkills", "languages", "interests"],
    mainOrder: ["experience", "education", "projects", "certifications"],
  };
}
