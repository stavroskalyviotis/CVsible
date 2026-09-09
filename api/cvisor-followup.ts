import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./_lib/anthropic.js";
import { checkDailyLimit } from "./_lib/rateLimit.js";
import { resolveIdentifier } from "./_lib/identity.js";
import {
  CVISOR_SUGGEST_MODEL,
  FOLLOWUP_DAILY_LIMIT,
  FOLLOWUP_MAX_QUESTIONS,
  FOLLOWUP_MAX_TOKENS,
  MAX_JOB_AD_CHARS,
  MAX_SECTION_TEXT_CHARS,
} from "./_lib/constants.js";

/** The one part of the CVisor interview the model drives.
 *
 *  The backbone — target, each job, studies, skills — is ours, because it is
 *  the same for everybody and a model rediscovering it every time is a model
 *  that forgets to ask about education. What cannot be scripted is what to ask
 *  *inside* a job: "how many covers a night?" is the right question for a
 *  waiter and nonsense for an accountant. Those follow-ups are where the
 *  numbers and the scope come from, and a CV without them reads as a list of
 *  duties.
 */
export const config = { maxDuration: 30 };

const LANGUAGE_NAME: Record<"el" | "en", string> = { el: "Greek (Ελληνικά)", en: "English" };

interface FollowUpBody {
  role?: unknown;
  company?: unknown;
  story?: unknown;
  jobAd?: unknown;
  language?: unknown;
}

function buildSystemPrompt(language: "el" | "en"): string {
  return `You are the interviewer inside CVsible's CVisor.

Someone has just described a job they did, in their own words. You ask at most ${FOLLOWUP_MAX_QUESTIONS} short follow-up questions that will make their CV concrete.

# What makes a good question here

The candidate is not a writer and is not trying to impress you. They will answer in a few words on a phone. So:

- Ask for the thing that is missing, not for more of what they already said. If they mentioned training people, ask how many. If they mentioned a busy period, ask how busy.
- Chase numbers, scale and outcomes: how many, how often, how much, what changed. These are what turn "handled the till" into a bullet worth reading, and they are the one thing you can never supply for them later.
- Ask about responsibility they may not think to mention: standing in for a manager, being trusted with opening or closing, training others, fixing something that was broken.
- One fact per question. Never stack two questions into one sentence.
- Under 12 words each. A long question gets a short answer.
- Never ask something they have already answered, and never ask them to rate themselves.
- If their description is genuinely complete, return fewer questions. Zero is a valid answer and a better one than padding.

Where a job ad is given, prefer questions about the parts of their work that ad cares about — but only where their own description suggests there is something there. Do not fish for experience they have not hinted at.

Write the questions in ${LANGUAGE_NAME[language]}, in the second person, plainly. No preamble, no "could you please".`;
}

const TOOL: Anthropic.Messages.Tool = {
  name: "ask",
  description: "The follow-up questions to put to the candidate.",
  input_schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: { type: "string" },
        description: `At most ${FOLLOWUP_MAX_QUESTIONS} short questions. An empty list is fine.`,
      },
    },
    required: ["questions"],
  } as Anthropic.Messages.Tool["input_schema"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as FollowUpBody;
  const language = body.language === "en" ? "en" : "el";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const story = typeof body.story === "string" ? body.story.trim() : "";
  const jobAd = typeof body.jobAd === "string" ? body.jobAd.trim() : "";

  if (!story) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  if (story.length > MAX_SECTION_TEXT_CHARS || jobAd.length > MAX_JOB_AD_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  const rateLimit = await checkDailyLimit("followup", await resolveIdentifier(req), FOLLOWUP_DAILY_LIMIT);
  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) {
      res.status(503).json({ error: "unavailable" });
      return;
    }
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit, resetInSeconds: rateLimit.resetInSeconds });
    return;
  }

  try {
    const client = getAnthropicClient();

    const parts = [`THE JOB: ${[role, company].filter(Boolean).join(" at ") || "(not named)"}`];
    parts.push(`WHAT THEY SAID ABOUT IT:\n${story}`);
    if (jobAd) parts.push(`THE JOB THEY ARE APPLYING FOR:\n${jobAd}`);
    parts.push("Call ask once, no commentary.");

    const response = await client.messages.create({
      model: CVISOR_SUGGEST_MODEL,
      max_tokens: FOLLOWUP_MAX_TOKENS,
      system: buildSystemPrompt(language),
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [{ role: "user", content: parts.join("\n\n") }],
    });

    const use = response.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use",
    );

    const raw = use ? (use.input as { questions?: unknown }).questions : null;
    const questions = Array.isArray(raw)
      ? raw
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, FOLLOWUP_MAX_QUESTIONS)
      : [];

    res.status(200).json({ questions, remaining: rateLimit.remaining });
  } catch (error) {
    // A failed follow-up must never block the interview: the backbone question
    // is the one that matters, and these are a bonus on top of it.
    console.error("cvisor-followup error", error);
    res.status(200).json({ questions: [], remaining: rateLimit.remaining });
  }
}
