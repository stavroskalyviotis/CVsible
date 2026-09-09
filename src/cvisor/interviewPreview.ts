import type { CvData, PersonalInfo } from "../types";
import { createEmptyCvData } from "../data/defaultData";
import { bulletsToHtml } from "./agent";
import { educationStepIds, experienceStepIds } from "./interview";
import type { InterviewState } from "./interview";

/** The CV as it stands mid-interview, for the panel beside the questions.
 *
 *  It shows the candidate's own words, unedited — the polished version is what
 *  the agent produces at the end. That is the point: watching your answers land
 *  in a document is what makes the next question worth answering, and a preview
 *  that quietly improved your wording would be promising something the final
 *  step might not deliver.
 */

const MAX_ENTRIES = 6;

/** Free-text periods ("March 2022 – now", "2018-2022", "από το 2020") are what
 *  people actually type. Only the years are recoverable here; the agent parses
 *  dates properly when it writes the real CV, so a wrong guess in the preview
 *  is corrected before it reaches the document. */
export function parsePeriod(text: string): { startDate: string; endDate: string; current: boolean } {
  const value = text.trim();
  if (!value) return { startDate: "", endDate: "", current: false };

  const months = [...value.matchAll(/\b(19|20)\d{2}[-/](0[1-9]|1[0-2])\b/g)].map((match) =>
    match[0].replace("/", "-"),
  );
  const years = [...value.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => match[0]);

  const stamps = months.length > 0 ? months : years.map((year) => `${year}-01`);
  const current = /present|now|current|σήμερα|τώρα|current/i.test(value) || stamps.length === 1;

  return {
    startDate: stamps[0] ?? "",
    endDate: current ? "" : (stamps[1] ?? ""),
    current: current && Boolean(stamps[0]),
  };
}

/** Splits a free-text list on commas, semicolons and newlines — however the
 *  candidate happened to separate them. */
export function splitList(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "English (good)" carries its level in brackets; anything else is a bare name. */
function parseLanguage(text: string): { name: string; level: string } {
  const match = /^(.*?)\s*[([]([^)\]]+)[)\]]\s*$/.exec(text.trim());
  if (match) return { name: match[1].trim(), level: match[2].trim() };
  return { name: text.trim(), level: "" };
}

let previewId = 0;
/** Stable enough for a preview that is rebuilt on every keystroke: React only
 *  needs these to be unique within one render. */
function nextId(): string {
  previewId += 1;
  return `preview-${previewId}`;
}

export function interviewToPreviewCv(state: InterviewState, personalInfo?: Partial<PersonalInfo>): CvData {
  const base = createEmptyCvData();
  const data: CvData = {
    ...base,
    // Single column and plain headings: the preview should not show something
    // the report would then flag as unreadable.
    template: "atlas",
    showPhoto: false,
    personalInfo: { ...base.personalInfo, ...personalInfo },
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };

  for (let index = 0; index < MAX_ENTRIES; index++) {
    const ids = experienceStepIds(index);
    const identity = state.answers[ids.identity];
    if (!identity?.role?.trim() && !identity?.company?.trim()) continue;

    const bullets: string[] = [];
    const story = state.answers[ids.story]?.value?.trim();
    if (story) bullets.push(story);
    (state.followUps[ids.story] ?? []).forEach((_question, order) => {
      const answer = state.answers[ids.followUp(order)]?.value?.trim();
      if (answer) bullets.push(answer);
    });

    const period = parsePeriod(identity.period ?? "");
    data.experience.push({
      id: nextId(),
      role: identity.role ?? "",
      company: identity.company ?? "",
      location: "",
      ...period,
      description: bulletsToHtml(bullets),
    });
  }

  for (let index = 0; index < MAX_ENTRIES; index++) {
    const identity = state.answers[educationStepIds(index).identity];
    if (!identity?.degree?.trim() && !identity?.institution?.trim()) continue;

    const period = parsePeriod(identity.period ?? "");
    data.education.push({
      id: nextId(),
      degree: identity.degree ?? "",
      institution: identity.institution ?? "",
      location: "",
      ...period,
      expectedGraduation: "",
      description: "",
    });
  }

  splitList(state.answers.skills?.value ?? "").forEach((name) => {
    data.skills.push({ id: nextId(), name, level: 70, category: "" });
  });

  splitList(state.answers.languages?.value ?? "").forEach((entry) => {
    const { name, level } = parseLanguage(entry);
    if (name) data.languages.push({ id: nextId(), name, level });
  });

  // The job title is the candidate's most recent role until the agent writes a
  // better one — an empty headline makes the preview look broken.
  if (!data.personalInfo.jobTitle) {
    data.personalInfo.jobTitle = data.experience[0]?.role ?? "";
  }

  // No summary is drawn: nothing the candidate typed is one yet, and inventing
  // it here would be the preview making a promise the final step has to keep.
  return data;
}

/** True when there is nothing to draw yet, so the panel can say so rather than
 *  showing an empty page. */
export function isPreviewEmpty(data: CvData): boolean {
  return (
    data.experience.length === 0 &&
    data.education.length === 0 &&
    data.skills.length === 0 &&
    data.languages.length === 0
  );
}
