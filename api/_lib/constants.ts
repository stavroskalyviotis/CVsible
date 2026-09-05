// The single-field "improve this text" endpoint is a small, well-bounded job.
export const CVISOR_SUGGEST_MODEL = "claude-haiku-4-5";

// Tried Haiku 4.5 here: it stalled inside the 4-round cap on a blocking
// summary-length fix and once re-added a skill the grounding check had
// already stripped as fabricated. This is the step that writes the
// candidate's actual words, so it stays on the model that reliably converges.
export const AGENT_MODEL = "claude-sonnet-5";
export const AGENT_MAX_TOKENS = 8000;

// CVfix never writes prose, it untangles an interleaved extraction into the
// right fields — reading comprehension, not composition, so the small model
// is enough, backed by the same verbatim/structure checks.
export const CVFIX_MODEL = "claude-haiku-4-5";
export const CVFIX_MAX_TOKENS = 8000;
export const CVFIX_DAILY_LIMIT = 8;
export const MAX_RESUME_TEXT_CHARS = 20000;

export const AGENT_DAILY_LIMIT = 5;
export const SUGGEST_DAILY_LIMIT = 20;

// Mirrors MAX_ROUNDS in src/cvisor/agent.ts. Every step of a CVfix/CVisor run
// — not just the opening one — is charged against the daily limit below, so
// the true per-identifier ceiling is DAILY_LIMIT * MAX_ROUNDS_PER_CV calls; a
// caller cannot get unlimited free calls by fabricating a "draft" field.
export const MAX_ROUNDS_PER_CV = 4;
export const RATE_LIMIT_TTL_SECONDS = 26 * 60 * 60;

export const MAX_JOB_AD_CHARS = 6000;
export const MAX_BACKGROUND_CHARS = 8000;
export const MAX_SECTION_TEXT_CHARS = 4000;

export const SUGGEST_MAX_TOKENS = 700;

export const LANGUAGE_LEVELS: Record<"el" | "en", string[]> = {
  el: ["Βασικό", "Μέτριο", "Καλό", "Πολύ καλό", "Άριστο", "Μητρική γλώσσα"],
  en: ["Basic", "Intermediate", "Good", "Fluent", "Excellent", "Native"],
};
