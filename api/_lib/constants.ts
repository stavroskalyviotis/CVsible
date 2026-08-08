// The fill flow asks the model to follow many simultaneous structural rules
// (bullets, relevance flags, neutral levels, avoid-repeat, conditional tips)
// against a large schema — Haiku 4.5 was unreliable at holding all of that
// together consistently, so this one call uses a stronger model. The much
// simpler single-field "improve/generate" endpoint stays on Haiku.
export const CVISOR_FILL_MODEL = "claude-sonnet-5";
export const CVISOR_SUGGEST_MODEL = "claude-haiku-4-5";

export const FILL_DAILY_LIMIT = 5;
export const SUGGEST_DAILY_LIMIT = 20;
export const RATE_LIMIT_TTL_SECONDS = 26 * 60 * 60;

export const MAX_JOB_AD_CHARS = 6000;
export const MAX_BACKGROUND_CHARS = 8000;
export const MAX_SECTION_TEXT_CHARS = 4000;

export const FILL_MAX_TOKENS = 4500;
export const SUGGEST_MAX_TOKENS = 700;

export const LANGUAGE_LEVELS: Record<"el" | "en", string[]> = {
  el: ["Βασικό", "Μέτριο", "Καλό", "Πολύ καλό", "Άριστο", "Μητρική γλώσσα"],
  en: ["Basic", "Intermediate", "Good", "Fluent", "Excellent", "Native"],
};

export const THEME_COLOR_IDS = ["berry", "teal", "navy", "plum", "forest", "slate"] as const;
