import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildFillSystemPrompt, getAnthropicClient } from "./_lib/anthropic.js";
import { checkDailyLimit, getClientIdentifier } from "./_lib/rateLimit.js";
import { buildFillSchema, type FillResult } from "./_lib/schema.js";
import {
  CVISOR_MODEL,
  FILL_DAILY_LIMIT,
  FILL_MAX_TOKENS,
  LANGUAGE_LEVELS,
  MAX_BACKGROUND_CHARS,
  MAX_JOB_AD_CHARS,
  THEME_COLOR_IDS,
} from "./_lib/constants.js";

const MAX_TIPS = 4;
const MAX_PREVIOUS_ITEMS = 30;
const MAX_BULLETS = 6;

interface FillRequestBody {
  jobAd?: unknown;
  background?: unknown;
  language?: unknown;
  previousSuggestions?: unknown;
}

interface PreviousSuggestions {
  skills: string[];
  softSkills: string[];
  interests: string[];
  jobTitles: string[];
}

function sanitizeStringArray(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of list) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
    if (result.length >= MAX_PREVIOUS_ITEMS) break;
  }
  return result;
}

function sanitizePreviousSuggestions(raw: unknown): PreviousSuggestions {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    skills: sanitizeStringArray(source.skills),
    softSkills: sanitizeStringArray(source.softSkills),
    interests: sanitizeStringArray(source.interests),
    jobTitles: sanitizeStringArray(source.jobTitles),
  };
}

function buildAvoidRepeatsBlock(previous: PreviousSuggestions): string {
  const lines: string[] = [];
  if (previous.jobTitles.length > 0) lines.push(`Τίτλοι: ${previous.jobTitles.join(", ")}`);
  if (previous.skills.length > 0) lines.push(`Δεξιότητες: ${previous.skills.join(", ")}`);
  if (previous.softSkills.length > 0) lines.push(`Ήπιες δεξιότητες: ${previous.softSkills.join(", ")}`);
  if (previous.interests.length > 0) lines.push(`Ενδιαφέροντα: ${previous.interests.join(", ")}`);
  if (lines.length === 0) return "";
  return `\n\n---\n\nΗΔΗ ΠΡΟΤΑΘΗΚΑΝ σε προηγούμενο γύρο (στα πεδία suggestedJobTitle/suggestedSkills/suggestedSoftSkills/suggestedInterests) — ΜΗΝ τα προτείνεις ξανά, ούτε παρόμοια ή συνώνυμά τους, δώσε ΔΙΑΦΟΡΕΤΙΚΕΣ ιδέες αυτή τη φορά:\n${lines.join("\n")}`;
}

function clampSkillLevel(level: number): number {
  if (!Number.isFinite(level)) return 50;
  return Math.min(100, Math.max(0, Math.round(level)));
}

function sanitizeTips(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim())
    .slice(0, MAX_TIPS);
}

function sanitizeBullets(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim().replace(/^[-•*]\s*/, ""))
    .slice(0, MAX_BULLETS);
}

function sanitizeNamedList(list: unknown, excludeNames: string[]): { name: string }[] {
  if (!Array.isArray(list)) return [];
  const excluded = new Set(excludeNames.map((name) => name.trim().toLowerCase()));
  const seen = new Set<string>();
  const result: { name: string }[] = [];
  for (const entry of list) {
    const name = entry && typeof entry === "object" && typeof (entry as { name?: unknown }).name === "string"
      ? (entry as { name: string }).name.trim()
      : "";
    if (!name) continue;
    const key = name.toLowerCase();
    if (excluded.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push({ name });
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as FillRequestBody;
  const language = body.language === "en" ? "en" : "el";
  const jobAd = typeof body.jobAd === "string" ? body.jobAd.trim() : "";
  const background = typeof body.background === "string" ? body.background.trim() : "";
  const previousSuggestions = sanitizePreviousSuggestions(body.previousSuggestions);

  if (!jobAd || !background) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  if (jobAd.length > MAX_JOB_AD_CHARS || background.length > MAX_BACKGROUND_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  const identifier = getClientIdentifier(req);
  const rateLimit = await checkDailyLimit("fill", identifier, FILL_DAILY_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit });
    return;
  }

  try {
    const client = getAnthropicClient();
    const schema = buildFillSchema(LANGUAGE_LEVELS[language], THEME_COLOR_IDS);

    const response = await client.messages.create({
      model: CVISOR_MODEL,
      max_tokens: FILL_MAX_TOKENS,
      system: buildFillSystemPrompt(language),
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: `ΣΤΟΧΟΣ:\n${jobAd}\n\n---\n\nΚΕΙΜΕΝΟ ΧΡΗΣΤΗ (εμπειρία, εκπαίδευση, δεξιότητες, background):\n${background}${buildAvoidRepeatsBlock(previousSuggestions)}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      res.status(422).json({ error: "refused" });
      return;
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(502).json({ error: "empty_response" });
      return;
    }

    const data = JSON.parse(textBlock.text) as FillResult;
    data.skills = data.skills.map((skill) => ({
      ...skill,
      level: clampSkillLevel(skill.level),
      relevant: skill.relevant !== false,
    }));
    data.experience = data.experience.map((item) => ({ ...item, bullets: sanitizeBullets(item.bullets) }));
    data.education = data.education.map((item) => ({ ...item, bullets: sanitizeBullets(item.bullets) }));
    data.projects = data.projects.map((item) => ({ ...item, bullets: sanitizeBullets(item.bullets) }));
    data.suggestedJobTitle = typeof data.suggestedJobTitle === "string" ? data.suggestedJobTitle.trim() : "";
    if (
      data.suggestedJobTitle &&
      previousSuggestions.jobTitles.some((title) => title.toLowerCase() === data.suggestedJobTitle.toLowerCase())
    ) {
      data.suggestedJobTitle = "";
    }

    const existingSkillNames = [...data.skills.map((skill) => skill.name), ...previousSuggestions.skills];
    const existingSoftSkillNames = [...data.softSkills.map((item) => item.name), ...previousSuggestions.softSkills];
    const existingInterestNames = [...data.interests.map((item) => item.name), ...previousSuggestions.interests];
    data.suggestedSkills = sanitizeNamedList(data.suggestedSkills, existingSkillNames);
    data.suggestedSoftSkills = sanitizeNamedList(data.suggestedSoftSkills, existingSoftSkillNames);
    data.suggestedInterests = sanitizeNamedList(data.suggestedInterests, existingInterestNames);
    data.experienceTips = data.experience.length === 0 ? sanitizeTips(data.experienceTips) : [];
    data.educationTips = data.education.length === 0 ? sanitizeTips(data.educationTips) : [];
    data.themeColor = (THEME_COLOR_IDS as readonly string[]).includes(data.themeColor)
      ? data.themeColor
      : THEME_COLOR_IDS[0];

    res.status(200).json({ data, remaining: rateLimit.remaining });
  } catch (error) {
    console.error("cvisor-fill error", error);
    res.status(500).json({ error: "server_error" });
  }
}
