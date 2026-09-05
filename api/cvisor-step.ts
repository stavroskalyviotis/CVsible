import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./_lib/anthropic.js";
import {
  buildAgentSystemPrompt,
  buildDraftUserMessage,
  buildRefineUserMessage,
} from "./_lib/agentPrompt.js";
import {
  buildDraftSchema,
  buildPatchSchema,
  isEmptyDraft,
  mergeDraft,
} from "./_lib/draftTypes.js";
import type { CvDraft } from "./_lib/draftTypes.js";
import { formatReview, reviewDraft } from "./_lib/draftReview.js";
import { findGroundingIssues } from "./_lib/grounding.js";
import { sanitizeDraft } from "./_lib/sanitizeDraft.js";
import { checkDailyLimit } from "./_lib/rateLimit.js";
import { resolveIdentifier } from "./_lib/identity.js";
import {
  AGENT_MAX_TOKENS,
  AGENT_MODEL,
  AGENT_DAILY_LIMIT,
  LANGUAGE_LEVELS,
  MAX_BACKGROUND_CHARS,
  MAX_JOB_AD_CHARS,
  MAX_ROUNDS_PER_CV,
} from "./_lib/constants.js";

/** One model turn per request.
 *
 *  The agent loop lives in the client rather than here: a single serverless
 *  invocation cannot reliably hold three or four Sonnet turns inside the
 *  platform's duration limit, and splitting it also lets the UI show real
 *  progress instead of a five-second-lie spinner.
 */
export const config = { maxDuration: 60 };

interface StepRequestBody {
  jobAd?: unknown;
  background?: unknown;
  existingCv?: unknown;
  language?: unknown;
  draft?: unknown;
}

function groundingReport(issues: ReturnType<typeof findGroundingIssues>): string {
  if (issues.length === 0) return "FABRICATION CHECK: clean, every fact traces back to the candidate.";
  const lines = issues.map((issue) =>
    issue.kind === "number"
      ? `- ${issue.field} contains the figure "${issue.value}", which the candidate never wrote. Remove it or replace it with what they did say.`
      : `- ${issue.field} is "${issue.value}", which does not appear in the candidate's text. Remove it or correct it to what they wrote.`,
  );
  return `FABRICATION CHECK FAILED (${issues.length}) — these must go:\n${lines.join("\n")}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as StepRequestBody;
  const language = body.language === "en" ? "en" : "el";
  const jobAd = typeof body.jobAd === "string" ? body.jobAd.trim() : "";
  const background = typeof body.background === "string" ? body.background.trim() : "";
  const existingCv = typeof body.existingCv === "string" ? body.existingCv.trim() : "";
  const previous = body.draft && typeof body.draft === "object" ? (body.draft as CvDraft) : null;

  if (!background && !existingCv) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  if (jobAd.length > MAX_JOB_AD_CHARS || background.length > MAX_BACKGROUND_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  // Every round of a run — not just the opening one — is charged here. A
  // client-supplied `draft` is not proof of a prior legitimate call, so it
  // must never skip this check; the multiplier just keeps a single CV's
  // refinement rounds from crowding out its own daily budget.
  const rateLimit = await checkDailyLimit(
    "agent",
    await resolveIdentifier(req),
    AGENT_DAILY_LIMIT * MAX_ROUNDS_PER_CV,
  );
  if (!rateLimit.allowed) {
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit, resetInSeconds: rateLimit.resetInSeconds });
    return;
  }

  const source = [background, existingCv].filter(Boolean).join("\n");
  const languageLevels = LANGUAGE_LEVELS[language];

  const buildReport = (draft: CvDraft) => {
    const review = reviewDraft(draft, source, jobAd);
    const grounding = findGroundingIssues(draft, source);
    return {
      review,
      grounding,
      text: `${groundingReport(grounding)}\n\n${formatReview(review)}`,
      done: review.blocking.length === 0 && grounding.length === 0,
    };
  };

  try {
    const client = getAnthropicClient();
    const isRefine = previous !== null;

    const tool: Anthropic.Messages.Tool = isRefine
      ? {
          name: "patch_draft",
          description: "Replace only the fields you are changing.",
          input_schema: buildPatchSchema(languageLevels) as Anthropic.Messages.Tool["input_schema"],
        }
      : {
          name: "save_draft",
          description: "Store the complete draft CV.",
          input_schema: buildDraftSchema(languageLevels) as Anthropic.Messages.Tool["input_schema"],
        };

    const userMessage = isRefine
      ? buildRefineUserMessage(jobAd, background, existingCv, previous, buildReport(previous).text)
      : buildDraftUserMessage(jobAd, background, existingCv);

    const response = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: AGENT_MAX_TOKENS,
      system: buildAgentSystemPrompt(language, existingCv.length > 0),
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: userMessage }],
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

    const incoming = sanitizeDraft(use.input, languageLevels);
    let draft: CvDraft;

    if (isRefine) {
      draft = mergeDraft(previous, use.input as Record<string, unknown>, incoming);
    } else {
      // An empty draft means the model was cut off mid-call; there is nothing
      // worth handing back.
      if (isEmptyDraft(incoming)) {
        res.status(502).json({ error: "no_draft" });
        return;
      }
      draft = incoming;
    }

    const report = buildReport(draft);

    res.status(200).json({
      draft,
      done: report.done,
      issues: {
        blocking: report.review.blocking,
        advice: report.review.advice,
        missingKeywords: report.review.missingKeywords,
        fabrication: report.grounding.map((issue) => `${issue.field}: ${issue.value}`),
      },
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("cvisor-step error", error);
    res.status(500).json({ error: "server_error" });
  }
}
