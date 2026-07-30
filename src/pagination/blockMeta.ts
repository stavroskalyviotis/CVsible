import type { Dictionary } from "../i18n/translations";
import type { CvData, MainSectionOrderType } from "../types";
import { hasRichText } from "../utils/richText";

export type MainSectionType = "summary" | "experience" | "education" | "projects" | "certifications";

export interface MainBlockMeta {
  key: string;
  section: MainSectionType;
  itemId: string | null;
  isSectionStart: boolean;
}

function pushSectionMetas(metas: MainBlockMeta[], section: MainSectionOrderType, data: CvData): void {
  const items: { id: string }[] =
    section === "experience"
      ? data.experience
      : section === "education"
        ? data.education
        : section === "projects"
          ? data.projects
          : data.certifications;

  items.forEach((item, index) => {
    metas.push({ key: `${section}-${item.id}`, section, itemId: item.id, isSectionStart: index === 0 });
  });
}

export function buildMainBlockMetas(data: CvData): MainBlockMeta[] {
  const metas: MainBlockMeta[] = [];

  if (hasRichText(data.personalInfo.summary)) {
    metas.push({ key: "summary", section: "summary", itemId: null, isSectionStart: true });
  }

  data.mainOrder.forEach((section) => pushSectionMetas(metas, section, data));

  return metas;
}

export function sectionTitle(section: MainSectionType, dictionary: Dictionary): string {
  return dictionary.sections[section];
}
