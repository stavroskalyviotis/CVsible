import type { Dictionary } from "../i18n/translations";
import type { CvData, SectionKey, TemplateId } from "../types";
import { hasRichText } from "../utils/richText";
import { mainFlowSections } from "../templates/registry";

export type BlockSection = "summary" | SectionKey;

export interface BlockMeta {
  key: string;
  section: BlockSection;
  /** Set for sections that paginate one entry at a time. */
  itemId: string | null;
  isSectionStart: boolean;
}

/** Sections whose entries are laid out one below the other and may split across pages. */
const ENTRY_SECTIONS: SectionKey[] = ["experience", "education", "projects", "certifications"];

/** Sections rendered as a single compact block that never splits. */
const ATOMIC_SECTIONS: SectionKey[] = ["skills", "softSkills", "languages", "interests"];

function entriesOf(data: CvData, section: SectionKey): { id: string }[] {
  switch (section) {
    case "experience":
      return data.experience;
    case "education":
      return data.education;
    case "projects":
      return data.projects;
    case "certifications":
      return data.certifications;
    case "skills":
      return data.skills;
    case "softSkills":
      return data.softSkills;
    case "languages":
      return data.languages;
    case "interests":
      return data.interests;
  }
}

export function sectionHasContent(data: CvData, section: BlockSection): boolean {
  if (section === "summary") return hasRichText(data.personalInfo.summary);
  return entriesOf(data, section).length > 0;
}

export function buildBlockMetas(data: CvData, template: TemplateId): BlockMeta[] {
  const metas: BlockMeta[] = [];

  if (hasRichText(data.personalInfo.summary)) {
    metas.push({ key: "summary", section: "summary", itemId: null, isSectionStart: true });
  }

  mainFlowSections(template, data.sectionOrder).forEach((section) => {
    const items = entriesOf(data, section);
    if (items.length === 0) return;

    if (ATOMIC_SECTIONS.includes(section)) {
      metas.push({ key: section, section, itemId: null, isSectionStart: true });
      return;
    }

    if (!ENTRY_SECTIONS.includes(section)) return;
    items.forEach((item, index) => {
      metas.push({ key: `${section}-${item.id}`, section, itemId: item.id, isSectionStart: index === 0 });
    });
  });

  return metas;
}

/** ATS-safe templates use the canonical heading wording parsers look for;
 *  the designed template keeps the friendlier product copy. */
export function sectionTitle(section: BlockSection, dictionary: Dictionary, atsSafe: boolean): string {
  return atsSafe ? dictionary.atsSections[section] : dictionary.sections[section];
}
