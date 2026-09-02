import type { CvData, LanguageCode } from "../types";
import { createId } from "../utils/id";
import { CvisorApiError, postJson } from "./api";

/** Mirror of api/_lib/draftTypes.ts. */
export interface CvDraft {
  jobTitle: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }[];
  projects: { title: string; link: string; bullets: string[] }[];
  certifications: { title: string; issuer: string; date: string }[];
  skills: { name: string; level: number }[];
  softSkills: string[];
  languages: { name: string; level: string }[];
  interests: string[];
  notes: string[];
}

export interface AgentIssues {
  blocking: string[];
  advice: string[];
  missingKeywords: string[];
  fabrication: string[];
}

export interface AgentResult {
  draft: CvDraft;
  /** True when the final draft passed every server-side check. */
  verified: boolean;
  rounds: number;
  issues: AgentIssues;
  remaining: number;
}

export interface CvFixIssues {
  reworded: string[];
  structure: string[];
}

export interface CvFixResult {
  draft: CvDraft;
  verified: boolean;
  rounds: number;
  issues: CvFixIssues;
  remaining: number;
}

/** How many review rounds to allow before handing back whatever we have.
 *  Each round is one request, which keeps every call well inside the
 *  serverless duration limit and lets the UI report real progress. */
const MAX_ROUNDS = 4;

/** Feeds each round's draft back in until the server reports it clean. */
async function driveLoop<TIssues>(
  endpoint: string,
  params: Record<string, unknown>,
  onRound: ((round: number, done: boolean) => void) | undefined,
): Promise<{ draft: CvDraft; verified: boolean; rounds: number; issues: TIssues; remaining: number }> {
  let draft: CvDraft | undefined;
  let issues: TIssues | undefined;
  let remaining = 0;
  let done = false;
  let rounds = 0;

  while (rounds < MAX_ROUNDS) {
    rounds += 1;
    const step = await postJson<{ draft: CvDraft; done: boolean; issues: TIssues; remaining: number }>(
      endpoint,
      { ...params, draft },
    );
    draft = step.draft;
    issues = step.issues;
    remaining = step.remaining;
    done = step.done;
    onRound?.(rounds, done);
    if (done) break;
  }

  if (!draft || !issues) throw new CvisorApiError("server_error");
  return { draft, verified: done, rounds, issues, remaining };
}

export function runCvisorAgent(
  params: { jobAd: string; background: string; existingCv?: string; language: LanguageCode },
  onRound?: (round: number, done: boolean) => void,
): Promise<AgentResult> {
  return driveLoop<AgentIssues>("/api/cvisor-step", params, onRound);
}

export function runCvFix(
  params: { resumeText: string; language: LanguageCode },
  onRound?: (round: number, done: boolean) => void,
): Promise<CvFixResult> {
  return driveLoop<CvFixIssues>("/api/cvfix", params, onRound);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Bullets come back as plain strings; the editor stores rich text. */
function bulletsToHtml(bullets: string[]): string {
  const items = bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function summaryToHtml(summary: string): string {
  const text = summary.trim();
  return text ? `<p>${escapeHtml(text)}</p>` : "";
}

/** Folds an agent draft into the user's document, leaving everything the agent
 *  does not own — name, contacts, photo, template, styling — untouched. */
export function applyDraft(base: CvData, draft: CvDraft): CvData {
  return {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      jobTitle: draft.jobTitle || base.personalInfo.jobTitle,
      summary: summaryToHtml(draft.summary) || base.personalInfo.summary,
    },
    experience: draft.experience.map((item) => ({
      id: createId(),
      role: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      description: bulletsToHtml(item.bullets),
    })),
    education: draft.education.map((item) => ({
      id: createId(),
      degree: item.degree,
      institution: item.institution,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      description: bulletsToHtml(item.bullets),
    })),
    projects: draft.projects.map((item) => ({
      id: createId(),
      title: item.title,
      link: item.link,
      description: bulletsToHtml(item.bullets),
    })),
    certifications: draft.certifications.map((item) => ({
      id: createId(),
      title: item.title,
      issuer: item.issuer,
      date: item.date,
    })),
    skills: draft.skills.map((item) => ({ id: createId(), name: item.name, level: item.level })),
    softSkills: draft.softSkills.map((name) => ({ id: createId(), name })),
    languages: draft.languages.map((item) => ({ id: createId(), name: item.name, level: item.level })),
    interests: draft.interests.map((name) => ({ id: createId(), name })),
  };
}

/** Plain-text rendering of the current document, used as extra source material
 *  when the agent is asked to tailor an existing CV. */
export function describeCv(data: CvData, plainText: (html: string) => string): string {
  const lines: string[] = [];
  const { personalInfo } = data;

  if (personalInfo.jobTitle) lines.push(`Title: ${personalInfo.jobTitle}`);
  const summary = plainText(personalInfo.summary);
  if (summary) lines.push(`Summary: ${summary}`);

  data.experience.forEach((item) => {
    lines.push(
      `Experience: ${[item.role, item.company, item.location].filter(Boolean).join(" | ")} ${item.startDate}-${item.current ? "present" : item.endDate}`,
    );
    const body = plainText(item.description);
    if (body) lines.push(body);
  });

  data.education.forEach((item) => {
    lines.push(
      `Education: ${[item.degree, item.institution, item.location].filter(Boolean).join(" | ")} ${item.startDate}-${item.current ? "present" : item.endDate}`,
    );
    const body = plainText(item.description);
    if (body) lines.push(body);
  });

  data.projects.forEach((item) => {
    lines.push(`Project: ${item.title} ${item.link}`);
    const body = plainText(item.description);
    if (body) lines.push(body);
  });

  data.certifications.forEach((item) =>
    lines.push(`Certification: ${[item.title, item.issuer, item.date].filter(Boolean).join(" | ")}`),
  );

  if (data.skills.length > 0) lines.push(`Skills: ${data.skills.map((item) => item.name).join(", ")}`);
  if (data.softSkills.length > 0) lines.push(`Soft skills: ${data.softSkills.map((item) => item.name).join(", ")}`);
  if (data.languages.length > 0) {
    lines.push(`Languages: ${data.languages.map((item) => `${item.name} (${item.level})`).join(", ")}`);
  }
  if (data.interests.length > 0) lines.push(`Interests: ${data.interests.map((item) => item.name).join(", ")}`);

  return lines.join("\n");
}
