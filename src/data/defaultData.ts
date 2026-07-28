import type { CvData } from "../types";
import { createId } from "../utils/id";
import { DEFAULT_THEME_COLOR } from "./themeColors";

export function createEmptyCvData(): CvData {
  return {
    themeColor: DEFAULT_THEME_COLOR,
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
    languages: [],
    certifications: [],
    projects: [],
  };
}
