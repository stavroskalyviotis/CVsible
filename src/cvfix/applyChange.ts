import type { CvData, EducationItem, ExperienceItem, ProjectItem } from "../types";
import { bulletsToHtml, escapeHtml } from "../cvisor/agent";
import { htmlToBullets } from "../cvisor/cvToDraft";
import { createId } from "../utils/id";
import type { CvFixChange } from "./types";

/** Applies an accepted CVfix change to the document.
 *
 *  Changes are addressed by draft path, so this is the mirror of
 *  src/cvisor/cvToDraft.ts — index i here must mean the same entry it meant
 *  when the change was proposed. Everything the change does not name is left
 *  exactly as it was, ids included, so accepting one edit never disturbs the
 *  rest of the CV or its undo history.
 *
 *  A path that no longer resolves returns the data unchanged rather than
 *  throwing: the candidate may have edited the CV in another tab while the
 *  proposals sat on screen, and losing an edit is worse than losing a fix.
 */

type BulletSection = "experience" | "education" | "projects";
type BulletEntry = ExperienceItem | EducationItem | ProjectItem;

const BULLET_PATH = /^(experience|education|projects)\[(\d+)\]\.bullets\[(\d+)\]$/;
const BULLET_ADD_PATH = /^(experience|education|projects)\[(\d+)\]\.bullets$/;

function replaceAt<T>(items: T[], index: number, next: T): T[] {
  return items.map((item, position) => (position === index ? next : item));
}

/** Rewrites one entry's description from its bullet list. Descriptions typed
 *  as plain paragraphs become a real list here, which is what the path was
 *  claiming they were anyway — and what a parser reads as bullets. */
function withBullets(entry: BulletEntry, bullets: string[]): BulletEntry {
  return { ...entry, description: bulletsToHtml(bullets) };
}

function updateBullets(
  data: CvData,
  section: BulletSection,
  entryIndex: number,
  update: (bullets: string[]) => string[] | null,
): CvData {
  const items = data[section] as BulletEntry[];
  const entry = items[entryIndex];
  if (!entry) return data;

  const next = update(htmlToBullets(entry.description));
  if (!next) return data;

  return { ...data, [section]: replaceAt(items, entryIndex, withBullets(entry, next)) } as CvData;
}

export function applyCvFixChange(data: CvData, change: CvFixChange): CvData {
  const after = change.after.trim();
  if (!after) return data;

  if (change.path === "jobTitle") {
    return { ...data, personalInfo: { ...data.personalInfo, jobTitle: after } };
  }

  if (change.path === "summary") {
    return { ...data, personalInfo: { ...data.personalInfo, summary: `<p>${escapeHtml(after)}</p>` } };
  }

  if (change.path === "skills") {
    // Never add a skill the CV already lists under a different capitalisation.
    const exists = data.skills.some((skill) => skill.name.toLocaleLowerCase() === after.toLocaleLowerCase());
    if (exists) return data;
    return {
      ...data,
      skills: [...data.skills, { id: createId(), name: after, level: 50, category: "" }],
    };
  }

  const replace = BULLET_PATH.exec(change.path);
  if (replace) {
    const [, section, entryIndex, bulletIndex] = replace;
    return updateBullets(data, section as BulletSection, Number(entryIndex), (bullets) => {
      const index = Number(bulletIndex);
      if (index >= bullets.length) return null;
      return bullets.map((bullet, position) => (position === index ? after : bullet));
    });
  }

  const add = BULLET_ADD_PATH.exec(change.path);
  if (add) {
    const [, section, entryIndex] = add;
    return updateBullets(data, section as BulletSection, Number(entryIndex), (bullets) => [...bullets, after]);
  }

  return data;
}

/** Applies changes in the order they were proposed.
 *
 *  Order matters and is not incidental: a replacement is addressed at a bullet
 *  index, and an addition shifts nothing but appends, so replacements stay
 *  valid. Two changes to the same bullet cannot both arrive — the server drops
 *  the second — so no accepted change is ever measured against text another
 *  accepted change has already replaced. */
export function applyCvFixChanges(data: CvData, changes: CvFixChange[]): CvData {
  return changes.reduce(applyCvFixChange, data);
}
