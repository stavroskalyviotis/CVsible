import type { CvData } from "../types";
import type { CvDraft } from "./agent";

/** The inverse of applyDraft: the document as the agents see it.
 *
 *  CVfix addresses its changes at draft paths ("experience[0].bullets[1]"), so
 *  the CV has to be presented in the same shape it will be edited in. The two
 *  functions have to stay opposite: an index that means one entry here and a
 *  different one there would apply a change to the wrong job. */

/** Rich text carries its bullets as <li> elements; the plain-text fallback is
 *  for descriptions typed as paragraphs before the list button existed. */
export function htmlToBullets(html: string): string[] {
  const template = document.createElement("template");
  template.innerHTML = html;

  const items = Array.from(template.content.querySelectorAll("li"))
    .map((item) => (item.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (items.length > 0) return items;

  const text = (template.content.textContent ?? "").trim();
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function cvToDraft(data: CvData): CvDraft {
  return {
    jobTitle: data.personalInfo.jobTitle,
    summary: htmlToBullets(data.personalInfo.summary).join(" "),
    experience: data.experience.map((item) => ({
      role: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      bullets: htmlToBullets(item.description),
    })),
    education: data.education.map((item) => ({
      degree: item.degree,
      institution: item.institution,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      bullets: htmlToBullets(item.description),
    })),
    projects: data.projects.map((item) => ({
      title: item.title,
      link: item.link,
      bullets: htmlToBullets(item.description),
    })),
    certifications: data.certifications.map((item) => ({
      title: item.title,
      issuer: item.issuer,
      date: item.date,
    })),
    skills: data.skills.map((item) => ({ name: item.name, level: item.level })),
    softSkills: data.softSkills.map((item) => item.name),
    languages: data.languages.map((item) => ({ name: item.name, level: item.level })),
    interests: data.interests.map((item) => item.name),
    notes: [],
  };
}

/** Everything the candidate has ever told us about themselves, as one block of
 *  text. This is what the anti-fabrication check measures a rewrite against,
 *  so it has to include every field a fact could have been typed into. */
export function cvSourceText(data: CvData): string {
  const draft = cvToDraft(data);
  const lines: string[] = [];

  if (draft.jobTitle) lines.push(draft.jobTitle);
  if (draft.summary) lines.push(draft.summary);

  draft.experience.forEach((item) => {
    lines.push([item.role, item.company, item.location].filter(Boolean).join(" | "));
    lines.push(...item.bullets);
  });
  draft.education.forEach((item) => {
    lines.push([item.degree, item.institution, item.location].filter(Boolean).join(" | "));
    lines.push(...item.bullets);
  });
  draft.projects.forEach((item) => {
    lines.push([item.title, item.link].filter(Boolean).join(" | "));
    lines.push(...item.bullets);
  });
  draft.certifications.forEach((item) =>
    lines.push([item.title, item.issuer, item.date].filter(Boolean).join(" | ")),
  );

  if (draft.skills.length > 0) lines.push(draft.skills.map((item) => item.name).join(", "));
  if (draft.softSkills.length > 0) lines.push(draft.softSkills.join(", "));
  if (draft.languages.length > 0) lines.push(draft.languages.map((item) => item.name).join(", "));
  if (draft.interests.length > 0) lines.push(draft.interests.join(", "));

  return lines.filter((line) => line.trim()).join("\n");
}
