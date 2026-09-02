import type { CvData, SectionKey, TemplateId } from "../types";
import { TEMPLATE_IDS } from "../templates/registry";
import { createId } from "../utils/id";
import { createEmptyCvData, DEFAULT_SECTION_ORDER } from "./defaultData";

/** Shape of documents written by earlier versions, kept only so stored CVs
 *  and exported JSON files keep opening. */
interface LegacyFields {
  mainOrder?: unknown;
  sidebarOrder?: unknown;
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function withIds<T extends { id?: string }>(value: unknown, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => ({ ...(item as T), id: (item as T).id || createId() }));
}

function normalizeSectionOrder(stored: Partial<CvData> & LegacyFields): SectionKey[] {
  const candidate = Array.isArray(stored.sectionOrder)
    ? (stored.sectionOrder as SectionKey[])
    : [
        ...asArray<SectionKey>(stored.mainOrder, []),
        ...asArray<SectionKey>(stored.sidebarOrder, []),
      ];

  const seen = new Set<SectionKey>();
  const order = candidate.filter((section) => {
    if (!DEFAULT_SECTION_ORDER.includes(section) || seen.has(section)) return false;
    seen.add(section);
    return true;
  });

  // Any section the stored order never knew about is appended in default position.
  DEFAULT_SECTION_ORDER.forEach((section) => {
    if (!seen.has(section)) order.push(section);
  });

  return order;
}

function normalizeTemplate(value: unknown): TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId) ? (value as TemplateId) : "atlas";
}

export function normalizeCvData(stored: (Partial<CvData> & LegacyFields) | null | undefined): CvData {
  const base = createEmptyCvData();
  if (!stored || typeof stored !== "object") return base;

  return {
    ...base,
    ...stored,
    template: normalizeTemplate(stored.template),
    themeColor: typeof stored.themeColor === "string" ? stored.themeColor : base.themeColor,
    skillDisplay: stored.skillDisplay === "none" ? "none" : "text",
    showPhoto: typeof stored.showPhoto === "boolean" ? stored.showPhoto : base.showPhoto,
    photo: typeof stored.photo === "string" ? stored.photo : null,
    photoPosition:
      stored.photoPosition && typeof stored.photoPosition.x === "number"
        ? stored.photoPosition
        : base.photoPosition,
    personalInfo: {
      ...base.personalInfo,
      ...stored.personalInfo,
      contacts: withIds(stored.personalInfo?.contacts, base.personalInfo.contacts),
    },
    experience: withIds(stored.experience, base.experience),
    education: withIds(stored.education, base.education),
    skills: withIds(stored.skills, base.skills),
    softSkills: withIds(stored.softSkills, base.softSkills),
    languages: withIds(stored.languages, base.languages),
    interests: withIds(stored.interests, base.interests),
    certifications: withIds(stored.certifications, base.certifications),
    projects: withIds(stored.projects, base.projects),
    sectionOrder: normalizeSectionOrder(stored),
  };
}
