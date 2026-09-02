import type { Density, SectionKey, TemplateId } from "../types";
import { DENSITY_SCALE } from "../data/density";

export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;

export type TemplateLayout = "sidebar" | "single";
export type PhotoSupport = "full" | "optional" | "none";

export interface TemplateMetrics {
  scale: number;
  /** Horizontal space the paginated flow may occupy. */
  contentWidth: number;
  /** Vertical space the flow may occupy on a page with no header. */
  capacity: number;
  sectionGap: number;
  entryGap: number;
  sidebarWidth: number;
  paddingX: number;
  paddingY: number;
}

export interface TemplateDefinition {
  id: TemplateId;
  layout: TemplateLayout;
  /** Sections this template renders in a sidebar rather than the main flow. */
  sidebarSections: SectionKey[];
  photoSupport: PhotoSupport;
  /** True when the rendered page is a single top-to-bottom column with no
   *  decorative constructs that confuse a resume parser. */
  atsSafe: boolean;
  /** Set the name in all caps. Applied in code rather than with
   *  text-transform so Greek loses its tonos correctly. */
  uppercaseName: boolean;
  paddingX: number;
  paddingY: number;
  sidebarWidth: number;
  sectionGap: number;
  entryGap: number;
}

const SIDEBAR_HOSTED: SectionKey[] = ["skills", "softSkills", "languages", "interests"];

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  aurora: {
    id: "aurora",
    layout: "sidebar",
    sidebarSections: SIDEBAR_HOSTED,
    photoSupport: "full",
    atsSafe: false,
    uppercaseName: false,
    paddingX: 30,
    paddingY: 32,
    sidebarWidth: 258,
    sectionGap: 16,
    entryGap: 10,
  },
  meridian: {
    id: "meridian",
    layout: "single",
    sidebarSections: [],
    photoSupport: "none",
    atsSafe: true,
    uppercaseName: true,
    paddingX: 58,
    paddingY: 52,
    sidebarWidth: 0,
    sectionGap: 18,
    entryGap: 11,
  },
  atlas: {
    id: "atlas",
    layout: "single",
    sidebarSections: [],
    photoSupport: "optional",
    atsSafe: true,
    uppercaseName: false,
    paddingX: 48,
    paddingY: 44,
    sidebarWidth: 0,
    sectionGap: 16,
    entryGap: 10,
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export function getTemplate(id: TemplateId): TemplateDefinition {
  return TEMPLATES[id] ?? TEMPLATES.aurora;
}

export function getTemplateMetrics(id: TemplateId, density: Density): TemplateMetrics {
  const template = getTemplate(id);
  const scale = DENSITY_SCALE[density];
  const paddingX = Math.round(template.paddingX * scale);
  const paddingY = Math.round(template.paddingY * scale);

  return {
    scale,
    contentWidth: PAGE_WIDTH_PX - template.sidebarWidth - paddingX * 2,
    capacity: PAGE_HEIGHT_PX - paddingY * 2,
    sectionGap: Math.round(template.sectionGap * scale),
    entryGap: Math.round(template.entryGap * scale),
    sidebarWidth: template.sidebarWidth,
    paddingX,
    paddingY,
  };
}

/** Sections rendered inside the main paginated flow, in user order. */
export function mainFlowSections(id: TemplateId, order: SectionKey[]): SectionKey[] {
  const template = getTemplate(id);
  if (template.layout === "single") return order;
  return order.filter((section) => !template.sidebarSections.includes(section));
}

/** Sections rendered in the sidebar, in user order. Empty for single-column templates. */
export function sidebarFlowSections(id: TemplateId, order: SectionKey[]): SectionKey[] {
  const template = getTemplate(id);
  if (template.layout === "single") return [];
  return order.filter((section) => template.sidebarSections.includes(section));
}

export function templateShowsPhoto(id: TemplateId, showPhoto: boolean): boolean {
  const support = getTemplate(id).photoSupport;
  if (support === "none") return false;
  return showPhoto;
}
