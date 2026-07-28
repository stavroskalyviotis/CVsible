import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { hasRichText } from "../utils/richText";

export type MainSectionType = "summary" | "experience" | "education" | "projects" | "certifications";

export interface MainBlockMeta {
  key: string;
  section: MainSectionType;
  itemId: string | null;
  isSectionStart: boolean;
}

export function buildMainBlockMetas(data: CvData): MainBlockMeta[] {
  const metas: MainBlockMeta[] = [];

  if (hasRichText(data.personalInfo.summary)) {
    metas.push({ key: "summary", section: "summary", itemId: null, isSectionStart: true });
  }

  data.experience.forEach((item, index) => {
    metas.push({ key: `experience-${item.id}`, section: "experience", itemId: item.id, isSectionStart: index === 0 });
  });

  data.education.forEach((item, index) => {
    metas.push({ key: `education-${item.id}`, section: "education", itemId: item.id, isSectionStart: index === 0 });
  });

  data.projects.forEach((item, index) => {
    metas.push({ key: `projects-${item.id}`, section: "projects", itemId: item.id, isSectionStart: index === 0 });
  });

  data.certifications.forEach((item, index) => {
    metas.push({
      key: `certifications-${item.id}`,
      section: "certifications",
      itemId: item.id,
      isSectionStart: index === 0,
    });
  });

  return metas;
}

export function sectionTitle(section: MainSectionType, dictionary: Dictionary): string {
  return dictionary.sections[section];
}
