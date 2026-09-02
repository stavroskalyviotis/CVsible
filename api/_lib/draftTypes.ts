/** The structure the CVisor agent fills in, and the JSON schema the model is
 *  forced to follow when it calls the save_draft tool. */

export interface DraftEntry {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface DraftEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface DraftProject {
  title: string;
  link: string;
  bullets: string[];
}

export interface DraftCertification {
  title: string;
  issuer: string;
  date: string;
}

export interface CvDraft {
  jobTitle: string;
  summary: string;
  experience: DraftEntry[];
  education: DraftEducation[];
  projects: DraftProject[];
  certifications: DraftCertification[];
  skills: { name: string; level: number }[];
  softSkills: string[];
  languages: { name: string; level: string }[];
  interests: string[];
  /** Short notes on the editorial choices made, shown to the candidate. */
  notes: string[];
}

export const EMPTY_DRAFT: CvDraft = {
  jobTitle: "",
  summary: "",
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  softSkills: [],
  languages: [],
  interests: [],
  notes: [],
};

const MONTH = { type: "string", description: "YYYY-MM, or empty string if unknown." } as const;

const BULLETS = {
  type: "array",
  maxItems: 5,
  items: { type: "string" },
  description: "Plain text, no HTML, no leading dash or bullet character.",
} as const;

export const DRAFT_FIELDS = [
  "jobTitle",
  "summary",
  "experience",
  "education",
  "projects",
  "certifications",
  "skills",
  "softSkills",
  "languages",
  "interests",
  "notes",
] as const;

export type DraftField = (typeof DRAFT_FIELDS)[number];

export function isEmptyDraft(draft: CvDraft): boolean {
  return (
    draft.summary.trim() === "" &&
    draft.experience.length === 0 &&
    draft.education.length === 0 &&
    draft.projects.length === 0 &&
    draft.skills.length === 0
  );
}

/** Applies a patch on top of the current draft, keeping every field the model
 *  did not mention. `sanitized` is the patch after normalisation; `raw` is used
 *  only to tell "absent" apart from "deliberately emptied". */
export function mergeDraft(current: CvDraft, raw: Record<string, unknown>, sanitized: CvDraft): CvDraft {
  const merged = { ...current };
  DRAFT_FIELDS.forEach((field) => {
    if (raw[field] === undefined) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (merged as any)[field] = sanitized[field];
  });
  return merged;
}

function draftProperties(languageLevels: string[]) {
  return {
    jobTitle: { type: "string" },
    summary: { type: "string" },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "company", "location", "startDate", "endDate", "current", "bullets"],
        properties: {
          role: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          startDate: MONTH,
          endDate: MONTH,
          current: { type: "boolean" },
          bullets: BULLETS,
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["degree", "institution", "location", "startDate", "endDate", "current", "bullets"],
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          location: { type: "string" },
          startDate: MONTH,
          endDate: MONTH,
          current: { type: "boolean" },
          bullets: BULLETS,
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "link", "bullets"],
        properties: {
          title: { type: "string" },
          link: { type: "string" },
          bullets: BULLETS,
        },
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "issuer", "date"],
        properties: {
          title: { type: "string" },
          issuer: { type: "string" },
          date: MONTH,
        },
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "level"],
        properties: {
          name: { type: "string" },
          level: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Use 50 unless the candidate stated their level.",
          },
        },
      },
    },
    softSkills: { type: "array", items: { type: "string" } },
    languages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "level"],
        properties: {
          name: { type: "string" },
          level: { type: "string", enum: languageLevels },
        },
      },
    },
    interests: { type: "array", items: { type: "string" } },
    notes: {
      type: "array",
      maxItems: 6,
      items: { type: "string" },
      description:
        "Short notes, in the CV's language, on the substantive choices you made. Shown to the candidate. Do not describe the tools you used.",
    },
  };
}

export function buildDraftSchema(languageLevels: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: [...DRAFT_FIELDS],
    properties: draftProperties(languageLevels),
  };
}

/** Same shape, nothing required — the agent sends only what it is changing. */
export function buildPatchSchema(languageLevels: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: draftProperties(languageLevels),
  };
}
