import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSuggestSystemPrompt, getAnthropicClient } from "./_lib/anthropic.js";
import { checkDailyLimit, getClientIdentifier } from "./_lib/rateLimit.js";
import { SUGGEST_SCHEMA, type SuggestResult } from "./_lib/schema.js";
import { CVISOR_MODEL, MAX_JOB_AD_CHARS, MAX_SECTION_TEXT_CHARS, SUGGEST_DAILY_LIMIT, SUGGEST_MAX_TOKENS } from "./_lib/constants.js";

const SECTION_LABELS: Record<string, string> = {
  summary: "Επαγγελματικό προφίλ / σύνοψη",
  experience: "Περιγραφή εργασιακής εμπειρίας",
  education: "Περιγραφή εκπαίδευσης",
  project: "Περιγραφή έργου",
};

const CONTEXT_FIELD_LABELS: Record<string, string> = {
  role: "Θέση",
  company: "Εταιρεία",
  degree: "Τίτλος σπουδών",
  institution: "Ίδρυμα",
  title: "Τίτλος",
};

const MAX_CONTEXT_VALUE_CHARS = 200;

interface SuggestRequestBody {
  section?: unknown;
  text?: unknown;
  jobAd?: unknown;
  language?: unknown;
  context?: unknown;
}

function sanitizeContext(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, string> = {};
  for (const key of Object.keys(CONTEXT_FIELD_LABELS)) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim().slice(0, MAX_CONTEXT_VALUE_CHARS);
    }
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as SuggestRequestBody;
  const language = body.language === "en" ? "en" : "el";
  const section = typeof body.section === "string" && body.section in SECTION_LABELS ? body.section : null;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const jobAd = typeof body.jobAd === "string" ? body.jobAd.trim() : "";
  const context = sanitizeContext(body.context);
  const hasContext = Object.keys(context).length > 0;

  if (!section || (!text && !hasContext && !jobAd)) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  if (text.length > MAX_SECTION_TEXT_CHARS || jobAd.length > MAX_JOB_AD_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  const identifier = getClientIdentifier(req);
  const rateLimit = await checkDailyLimit("suggest", identifier, SUGGEST_DAILY_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit });
    return;
  }

  try {
    const client = getAnthropicClient();

    const parts = [`ΕΝΟΤΗΤΑ: ${SECTION_LABELS[section]}`];
    if (hasContext) {
      const contextLine = Object.entries(context)
        .map(([key, value]) => `${CONTEXT_FIELD_LABELS[key]}: ${value}`)
        .join(", ");
      parts.push(`ΣΤΟΙΧΕΙΑ ΠΛΑΙΣΙΟΥ: ${contextLine}`);
    }
    if (jobAd) {
      parts.push(`ΣΤΟΧΟΣ (για στόχευση/τόνο, όχι για νέα γεγονότα):\n${jobAd}`);
    }
    parts.push(`ΤΡΕΧΟΝ ΚΕΙΜΕΝΟ:\n${text || "(κενό — δημιούργησε νέο περιεχόμενο από τα στοιχεία πλαισίου)"}`);

    const response = await client.messages.create({
      model: CVISOR_MODEL,
      max_tokens: SUGGEST_MAX_TOKENS,
      system: buildSuggestSystemPrompt(language),
      output_config: { format: { type: "json_schema", schema: SUGGEST_SCHEMA } },
      messages: [{ role: "user", content: parts.join("\n\n---\n\n") }],
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

    const data = JSON.parse(textBlock.text) as SuggestResult;
    res.status(200).json({ data, remaining: rateLimit.remaining });
  } catch (error) {
    console.error("cvisor-suggest error", error);
    res.status(500).json({ error: "server_error" });
  }
}
