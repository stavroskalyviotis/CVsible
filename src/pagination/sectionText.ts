import type { Dictionary } from "../i18n/translations";
import type { CvData, SkillDisplay } from "../types";

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
