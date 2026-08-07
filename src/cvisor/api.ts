import type { LanguageCode } from "../types";

// Shapes used once content is applied to the real CV (matches the app's own data model).
export interface CvisorFillItem {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CvisorEducationItem {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CvisorSkillItem {
  name: string;
  level: number;
}

export interface CvisorNamedItem {
  name: string;
}

export interface CvisorLanguageItem {
  name: string;
  level: string;
}

export interface CvisorCertificationItem {
  title: string;
  issuer: string;
  date: string;
}

export interface CvisorProjectItem {
  title: string;
  link: string;
  description: string;
}

// Shapes returned directly by CVisor, before the user picks which bullets/suggestions to keep.
export interface CvisorSuggestedExperience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface CvisorSuggestedEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface CvisorSuggestedProject {
  title: string;
  link: string;
  bullets: string[];
}

export interface CvisorFillSkillItem {
  name: string;
  level: number;
  relevant: boolean;
}

export interface CvisorFillResult {
  summary: string;
  suggestedJobTitle: string;
  experience: CvisorSuggestedExperience[];
  education: CvisorSuggestedEducation[];
  skills: CvisorFillSkillItem[];
  softSkills: CvisorNamedItem[];
  languages: CvisorLanguageItem[];
  interests: CvisorNamedItem[];
  certifications: CvisorCertificationItem[];
  projects: CvisorSuggestedProject[];
  suggestedSkills: CvisorNamedItem[];
  suggestedSoftSkills: CvisorNamedItem[];
  suggestedInterests: CvisorNamedItem[];
  experienceTips: string[];
  educationTips: string[];
  themeColor: string;
}

export interface CvisorApplyResult {
  summary: string;
  jobTitle?: string;
  experience: CvisorFillItem[];
  education: CvisorEducationItem[];
  skills: CvisorSkillItem[];
  softSkills: CvisorNamedItem[];
  languages: CvisorLanguageItem[];
  interests: CvisorNamedItem[];
  certifications: CvisorCertificationItem[];
  projects: CvisorProjectItem[];
  themeColor?: string;
}

export type CvisorErrorCode =
  | "missing_fields"
  | "text_too_long"
  | "rate_limited"
  | "refused"
  | "empty_response"
  | "server_error"
  | "network_error"
  | "method_not_allowed";

export class CvisorApiError extends Error {
  code: CvisorErrorCode;
  constructor(code: CvisorErrorCode) {
    super(code);
    this.code = code;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CvisorApiError("network_error");
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const code =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error: unknown }).error as CvisorErrorCode)
        : "server_error";
    throw new CvisorApiError(code);
  }

  return (await response.json()) as T;
}

export interface CvisorPreviousSuggestions {
  skills: string[];
  softSkills: string[];
  interests: string[];
  jobTitles: string[];
}

export async function generateCv(params: {
  jobAd: string;
  background: string;
  language: LanguageCode;
  previousSuggestions?: CvisorPreviousSuggestions;
}): Promise<CvisorFillResult> {
  const response = await postJson<{ data: CvisorFillResult }>("/api/cvisor-fill", params);
  return response.data;
}

export type CvisorSuggestSection = "summary" | "experience" | "education" | "project";

export interface CvisorSuggestContext {
  role?: string;
  company?: string;
  degree?: string;
  institution?: string;
  title?: string;
}

export async function suggestSectionText(params: {
  section: CvisorSuggestSection;
  text: string;
  jobAd?: string;
  language: LanguageCode;
  context?: CvisorSuggestContext;
}): Promise<string> {
  const response = await postJson<{ data: { suggestion: string } }>("/api/cvisor-suggest", params);
  return response.data.suggestion;
}
