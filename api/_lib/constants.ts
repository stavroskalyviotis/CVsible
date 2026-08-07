export const CVISOR_MODEL = "claude-haiku-4-5";

export const FILL_DAILY_LIMIT = 5;
export const SUGGEST_DAILY_LIMIT = 20;
export const RATE_LIMIT_TTL_SECONDS = 26 * 60 * 60;

export const MAX_JOB_AD_CHARS = 6000;
export const MAX_BACKGROUND_CHARS = 8000;
export const MAX_SECTION_TEXT_CHARS = 4000;

export const FILL_MAX_TOKENS = 3800;
export const SUGGEST_MAX_TOKENS = 700;

export const LANGUAGE_LEVELS: Record<"el" | "en", string[]> = {
  el: ["Βασικό", "Μέτριο", "Καλό", "Πολύ καλό", "Άριστο", "Μητρική γλώσσα"],
  en: ["Basic", "Intermediate", "Good", "Fluent", "Excellent", "Native"],
};

export const THEME_COLOR_IDS = ["berry", "teal", "navy", "plum", "forest", "slate"] as const;
