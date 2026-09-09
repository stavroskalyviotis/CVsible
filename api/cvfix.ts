import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./_lib/anthropic.js";
import type { CvDraft } from "./_lib/draftTypes.js";
import { formatReview, reviewDraft } from "./_lib/draftReview.js";
import { validateChanges } from "./_lib/cvFixChanges.js";
import { checkDailyLimit } from "./_lib/rateLimit.js";
import { resolveIdentifier } from "./_lib/identity.js";
import {
  CVFIX_DAILY_LIMIT,
  CVFIX_MAX_CHANGES,
  CVFIX_MAX_TOKENS,
  CVFIX_MODEL,
  MAX_JOB_AD_CHARS,
  MAX_RESUME_TEXT_CHARS,
} from "./_lib/constants.js";

export const config = { maxDuration: 60 };

const LANGUAGE_NAME: Record<"el" | "en", string> = { el: "Greek (Ελληνικά)", en: "English" };

/** Horizontal rule between the labelled blocks of a prompt. */
const SECTION_SEPARATOR = ["", "---", ""].join("\n\n");

interface CvFixRequestBody {
  draft?: unknown;
  source?: unknown;
  jobAd?: unknown;
  language?: unknown;
}

function buildSystemPrompt(language: "el" | "en"): string {
  return `You are CVfix, the revision engine inside the CVsible app.

A candidate has a CV and a report saying what is wrong with it. Your job is to propose the specific edits that fix it — not to rebuild the document, and not to hand back advice they have to act on themselves. You work only through the propose_changes tool and never speak to the candidate.

# What a change is

Each change names one place in the CV, quotes exactly what is there now, and gives the text that should replace it.

Paths you may use, and nothing else:
- \`summary\` — replace the professional summary.
- \`jobTitle\` — replace the headline title.
- \`experience[i].bullets[j]\` / \`education[i].bullets[j]\` / \`projects[i].bullets[j]\` — replace one bullet.
- \`experience[i].bullets\` / \`education[i].bullets\` / \`projects[i].bullets\` — add a new bullet to that entry. Send \`before\` as an empty string.
- \`skills\` — add one skill. Send \`before\` as an empty string and the skill name as \`after\`.

\`before\` must be copied character-for-character from the CV you were given. A change whose quote does not match is discarded unread, so do not paraphrase it, do not tidy it, and do not guess at it.

\`why\` is one short sentence, in ${LANGUAGE_NAME[language]}, addressed to the candidate: what this fixes. "Opens with an action verb instead of a noun." Not "improved for ATS".

# The one rule you never break

You may rewrite wording as freely as you like. You may not introduce a fact the candidate never gave you: no employer, technology, qualification, skill or figure that is absent from the SOURCE MATERIAL. If the job ad asks for something they never claimed, leave it out — a CV that wins an interview it cannot survive is worse than one that does not.

Numbers are where this goes wrong most often. If their text says no figures, your rewrites contain no figures. A server-side check verifies every change against the source and silently discards the ones that invent; those are wasted changes.

# What to fix

Start with everything the REPORT lists as blocking — those are measured, and the candidate sees the same measurements. Then keep going: a CV is rarely finished just because it stopped failing. Look for

- bullets that open with a noun or "Responsible for" instead of an action;
- bullets that describe duties rather than what actually happened as a result;
- results the candidate mentioned in their own words but the CV never states;
- a summary that lists adjectives instead of naming their strongest concrete proof;
- vocabulary from the job ad that truthfully describes what they already did;
- an entry with one thin bullet where their source material clearly supports a second.

Order your changes by how much they matter: the candidate reads from the top and may stop early.

Propose at most ${CVFIX_MAX_CHANGES}. Fewer real improvements beat a long list of rephrasings — every change costs the candidate a decision, so do not spend one on moving a comma.

Write all CV content in ${LANGUAGE_NAME[language]}, keeping proper nouns and technology names as they are.`;
}

const CHANGE_TOOL: Anthropic.Messages.Tool = {
  name: "propose_changes",
  description: "Propose the edits that fix this CV, most important first.",
  input_schema: {
    type: "object",
    properties: {
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "One of: summary, jobTitle, skills, experience[i].bullets[j], education[i].bullets[j], projects[i].bullets[j], or the same three without [j] to add a bullet.",
            },
            before: {
              type: "string",
              description: "The current text at that path, copied exactly. Empty string for an addition.",
            },
            after: { type: "string", description: "The replacement text." },
            why: { type: "string", description: "One short sentence for the candidate explaining what this fixes." },
          },
          required: ["path", "before", "after", "why"],
        },
      },
    },
    required: ["changes"],
  } as Anthropic.Messages.Tool["input_schema"],
};

function isDraft(value: unknown): value is CvDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CvDraft>;
  return (
    Array.isArray(candidate.experience) &&
    Array.isArray(candidate.education) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.skills)
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as CvFixRequestBody;
  const language = body.language === "en" ? "en" : "el";
  const jobAd = typeof body.jobAd === "string" ? body.jobAd.trim() : "";
  const source = typeof body.source === "string" ? body.source.trim() : "";

  if (!isDraft(body.draft)) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const draft = body.draft;

  if (source.length > MAX_RESUME_TEXT_CHARS || jobAd.length > MAX_JOB_AD_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  const rateLimit = await checkDailyLimit("cvfix", await resolveIdentifier(req), CVFIX_DAILY_LIMIT);
  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) {
      res.status(503).json({ error: "unavailable" });
      return;
    }
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit, resetInSeconds: rateLimit.resetInSeconds });
    return;
  }

  // The CV always vouches for itself: rewording what is already written is the
  // whole job. For an upload, the raw extraction is added, since it holds
  // detail the structured draft dropped.
  const grounds = [JSON.stringify(draft), source].filter(Boolean).join("\n");
  const review = reviewDraft(draft, grounds, jobAd);

  try {
    const client = getAnthropicClient();

    const parts = [`# THE CANDIDATE'S CV

${JSON.stringify(draft, null, 1)}`];

    parts.push(`# REPORT ON THAT CV

${formatReview(review)}`);

    if (jobAd) parts.push(`# THE JOB THEY ARE APPLYING FOR

${jobAd}`);
    if (source) {
      parts.push(`# SOURCE MATERIAL — everything the candidate has said about themselves

${source}`);
    }
    parts.push("Call propose_changes once, no commentary.");

    const response = await client.messages.create({
      model: CVFIX_MODEL,
      max_tokens: CVFIX_MAX_TOKENS,
      system: buildSystemPrompt(language),
      tools: [CHANGE_TOOL],
      tool_choice: { type: "tool", name: CHANGE_TOOL.name },
      messages: [{ role: "user", content: parts.join(SECTION_SEPARATOR) }],
    });

    if (response.stop_reason === "refusal") {
      res.status(422).json({ error: "refused" });
      return;
    }

    const use = response.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use",
    );
    if (!use) {
      res.status(502).json({ error: "no_draft" });
      return;
    }

    const proposed = (use.input as { changes?: unknown }).changes;
    const { changes, rejected } = validateChanges(proposed, draft, grounds);

    if (rejected.length > 0) {
      // Not an error for the candidate — but a run where most proposals are
      // discarded is worth seeing in the logs.
      console.warn("cvfix discarded changes", rejected);
    }

    res.status(200).json({
      changes: changes.slice(0, CVFIX_MAX_CHANGES),
      metrics: review.metrics,
      blocking: review.blocking.length,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("cvfix error", error);
    res.status(500).json({ error: "server_error" });
  }
}
