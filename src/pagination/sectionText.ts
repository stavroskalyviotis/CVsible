import type { Dictionary } from "../i18n/translations";
import type { CvData, SkillDisplay, SkillItem } from "../types";

/** Buckets the 0-100 slider into a word a human (and a parser) can read. */
export function skillLevelLabel(level: number, dictionary: Dictionary): string {
  const labels = dictionary.skillLevels;
  if (level <= 25) return labels[0];
  if (level <= 50) return labels[1];
  if (level <= 75) return labels[2];
  return labels[3];
}

export function skillText(name: string, level: number, display: SkillDisplay, dictionary: Dictionary): string {
  if (display === "none") return name;
  return `${name} (${skillLevelLabel(level, dictionary)})`;
}

export function languageText(name: string, level: string): string {
  return level ? `${name} (${level})` : name;
}

export interface SkillGroup {
  /** Empty for skills the user never sorted into a category. */
  category: string;
  /** The skills of that category, comma-separated. */
  text: string;
}

export interface SkillItemGroup {
  category: string;
  items: SkillItem[];
}

/** Skills bucketed by category, in the order the categories first appear, with
 *  the uncategorised ones last.
 *
 *  Categories are compared trimmed but kept as typed, so "Kitchen " and
 *  "Kitchen" are one group and the heading keeps the user's capitalisation.
 *  When nothing is categorised this is a single group with an empty category,
 *  which is what makes the plain one-line rendering fall out unchanged. */
export function skillItemGroups(skills: SkillItem[]): SkillItemGroup[] {
  if (skills.length === 0) return [];

  const byCategory = new Map<string, SkillItem[]>();
  skills.forEach((item) => {
    const category = item.category.trim();
    const existing = byCategory.get(category);
    if (existing) existing.push(item);
    else byCategory.set(category, [item]);
  });

  return [...byCategory.entries()]
    // The unsorted pile belongs after the named groups, wherever it was typed.
    .sort(([a], [b]) => (a === "" ? 1 : 0) - (b === "" ? 1 : 0))
    .map(([category, items]) => ({ category, items }));
}

/** The same grouping, flattened to text for the single-column templates.
 *  "Kitchen: HACCP, Sauces" on its own line is what a parser handles best — the
 *  category reads as a label, and the skills stay a comma-separated list. */
export function skillGroups(data: CvData, dictionary: Dictionary): SkillGroup[] {
  return skillItemGroups(data.skills).map(({ category, items }) => ({
    category,
    text: items.map((item) => skillText(item.name, item.level, data.skillDisplay, dictionary)).join(", "),
  }));
}

/** Comma-separated rendering used by the single-column templates. A parser reads
 *  this as one clean keyword line instead of a grid of disconnected labels. */
export function inlineSectionText(
  section: "skills" | "softSkills" | "languages" | "interests",
  data: CvData,
  dictionary: Dictionary,
): string {
  switch (section) {
    case "skills":
      return data.skills.map((item) => skillText(item.name, item.level, data.skillDisplay, dictionary)).join(", ");
    case "languages":
      return data.languages.map((item) => languageText(item.name, item.level)).join(", ");
    case "softSkills":
      return data.softSkills.map((item) => item.name).join(", ");
    case "interests":
      return data.interests.map((item) => item.name).join(", ");
  }
}
