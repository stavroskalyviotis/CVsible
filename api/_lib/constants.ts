// The single-field "improve this text" endpoint is a small, well-bounded job.
export const CVISOR_SUGGEST_MODEL = "claude-haiku-4-5";

// Tried Haiku 4.5 here: it stalled inside the 4-round cap on a blocking
// summary-length fix and once re-added a skill the grounding check had
// already stripped as fabricated. This is the step that writes the
// candidate's actual words, so it stays on the model that reliably converges.
export const AGENT_MODEL = "claude-sonnet-5";
export const AGENT_MAX_TOKENS = 8000;

// Untangling an interleaved extraction into the right fields is reading
// comprehension, not composition, and it may not change a word — the small
// model does it well, backed by the verbatim/structure checks.
export const CVFIX_STRUCTURE_MODEL = "claude-haiku-4-5";

// Proposing rewrites is composition, and every proposal has to stay inside the
// grounding rules — same reasoning as AGENT_MODEL above.
export const CVFIX_MODEL = "claude-sonnet-5";
export const CVFIX_MAX_TOKENS = 8000;
export const CVFIX_DAILY_LIMIT = 8;
export const MAX_RESUME_TEXT_CHARS = 20000;

// Each change costs the candidate a yes/no decision, and a list nobody reads
// to the end is a list that gets dismissed wholesale.
export const CVFIX_MAX_CHANGES = 12;

export const AGENT_DAILY_LIMIT = 5;
export const SUGGEST_DAILY_LIMIT = 20;

// One call per job described, so the ceiling is generous — a candidate walking
// through five jobs is using it as intended, not abusing it.
export const FOLLOWUP_DAILY_LIMIT = 40;
export const FOLLOWUP_MAX_QUESTIONS = 3;
export const FOLLOWUP_MAX_TOKENS = 400;

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
