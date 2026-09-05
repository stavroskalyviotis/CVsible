import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./_lib/anthropic.js";
import { buildDraftSchema, buildPatchSchema, isEmptyDraft, mergeDraft } from "./_lib/draftTypes.js";
import type { CvDraft } from "./_lib/draftTypes.js";
import { formatStructureReport, reviewStructure } from "./_lib/structureReview.js";
import { findVerbatimIssues, formatVerbatimReport } from "./_lib/verbatim.js";
import { sanitizeDraft } from "./_lib/sanitizeDraft.js";
import { checkDailyLimit } from "./_lib/rateLimit.js";
import { resolveIdentifier } from "./_lib/identity.js";
import {
  CVFIX_DAILY_LIMIT,
  CVFIX_MAX_TOKENS,
  CVFIX_MODEL,
  LANGUAGE_LEVELS,
  MAX_RESUME_TEXT_CHARS,
  MAX_ROUNDS_PER_CV,
} from "./_lib/constants.js";

export const config = { maxDuration: 60 };

const LANGUAGE_NAME: Record<"el" | "en", string> = { el: "Greek (Ελληνικά)", en: "English" };

/** Horizontal rule between the labelled blocks of a prompt. */
const SECTION_SEPARATOR = ["", "---", ""].join("\n\n");

interface CvFixRequestBody {
  resumeText?: unknown;
  language?: unknown;
  draft?: unknown;
}

function buildSystemPrompt(language: "el" | "en"): string {
  return `You are CVfix, part of the CVsible app.

A candidate has uploaded a CV that a hiring system cannot read properly — usually because it is laid out in columns, uses decorative headings, or buries its structure in a table. Your job is to move their content into a clean, machine-readable structure.

# The absolute constraint

You are a restructurer, not a writer. **Do not change a single word.** Every sentence, phrase and bullet you output must be copied character-for-character from the CV you were given.

You may:
- Split a run-on paragraph into separate bullets, cutting at sentence or clause boundaries.
- Move text into the correct field: a role name into role, an employer into company, a date into startDate/endDate.
- Drop leading bullet glyphs, stray punctuation and layout artefacts.
- Reorder entries into reverse-chronological order.
- Omit text that belongs nowhere (page numbers, headers, "References available on request").

You may not:
- Rephrase, summarise, expand, translate or "improve" anything.
- Add a fact, a number, a skill or an adjective that is not already there.
- Merge two different sentences into one new sentence.

A server-side checker compares every line you produce against the original text and rejects your draft if the wording drifted. There is no way around it, so do not try to polish anything.

# Reading a broken CV

The text you receive was extracted in the parser's own reading order, which for a two-column CV means the columns are interleaved and lines are out of sequence. Untangle it: sidebar contact details and skills will be mixed into the main flow. Use judgement about what belongs where, but never invent the connection — if you cannot tell which employer a bullet belongs to, attach it to the nearest role that makes sense, or leave it out.

# Dates

Convert whatever format the CV uses into YYYY-MM. "March 2022", "03/2022" and "2022" all become 2022-03 / 2022-03 / 2022-01. This is a format conversion, not a rewording, and it is required. A role with no end date and wording that implies the present gets current: true and an empty endDate.

# Fields that are labels, not prose

jobTitle, role, company, institution, degree, skill names, language names and certification titles are labels. Copy them as written. If the CV lists skills as one comma-separated line, split that line into individual skills.

Skill levels live in their own field, so strip a trailing parenthetical level from the name: "React (Expert)" becomes the name "React" with level 90, "Node.js (Advanced)" becomes "Node.js" with level 75. Map basic/βασικό to 25, intermediate/μέτριο to 50, advanced/προχωρημένο to 75, expert/άριστο to 90. A skill with no stated level gets 50. Language levels stay as written.

# How you work

You work one step at a time and make exactly one tool call per turn, with no commentary.

- Asked for a draft: call **save_draft** with the complete restructured CV.
- Given a draft and a review: call **patch_draft** with only the fields that need changing, clearing every issue the review names.

The reviews come from a deterministic checker that diffs your output against the original text, so fix exactly what it names.

The CV is written in ${LANGUAGE_NAME[language]}; keep it in that language.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as CvFixRequestBody;
  const language = body.language === "en" ? "en" : "el";
  const resumeText = typeof body.resumeText === "string" ? body.resumeText.trim() : "";
  const previous = body.draft && typeof body.draft === "object" ? (body.draft as CvDraft) : null;

  if (!resumeText) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  if (resumeText.length > MAX_RESUME_TEXT_CHARS) {
    res.status(400).json({ error: "text_too_long" });
    return;
  }

  // Every round of a run — not just the opening one — is charged here. A
  // client-supplied `draft` is not proof of a prior legitimate call, so it
  // must never skip this check; the multiplier just keeps a single CV's
  // refinement rounds from crowding out its own daily budget.
  const rateLimit = await checkDailyLimit(
    "cvfix",
    await resolveIdentifier(req),
    CVFIX_DAILY_LIMIT * MAX_ROUNDS_PER_CV,
  );
  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) {
      res.status(503).json({ error: "unavailable" });
      return;
    }
    res.status(429).json({ error: "rate_limited", limit: rateLimit.limit, resetInSeconds: rateLimit.resetInSeconds });
    return;
  }

  const languageLevels = LANGUAGE_LEVELS[language];

  const buildReport = (draft: CvDraft) => {
    const verbatim = findVerbatimIssues(draft, resumeText);
    const structure = reviewStructure(draft);
    return {
      verbatim,
      structure,
      text: `${formatVerbatimReport(verbatim)}

${formatStructureReport(structure)}`,
      done: verbatim.length === 0 && structure.length === 0,
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
          description: "Store the complete restructured CV.",
          input_schema: buildDraftSchema(languageLevels) as Anthropic.Messages.Tool["input_schema"],
        };

    const parts = [`# ORIGINAL CV TEXT, as a parser reads it

${resumeText}`];
    if (isRefine) {
      parts.push(`# CURRENT DRAFT

${JSON.stringify(previous, null, 1)}`);
      parts.push(`# REVIEW OF THAT DRAFT

${buildReport(previous).text}`);
      parts.push("Call patch_draft once, sending only the fields you are changing. One tool call, no commentary.");
    } else {
      parts.push("Restructure it. Call save_draft once, no commentary.");
    }

    const response = await client.messages.create({
      model: CVFIX_MODEL,
      max_tokens: CVFIX_MAX_TOKENS,
      system: buildSystemPrompt(language),
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
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

    const incoming = sanitizeDraft(use.input, languageLevels);
    let draft: CvDraft;

    if (isRefine) {
      draft = mergeDraft(previous, use.input as Record<string, unknown>, incoming);
    } else {
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
        reworded: report.verbatim.map((issue) => issue.value),
        structure: report.structure,
      },
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("cvfix error", error);
    res.status(500).json({ error: "server_error" });
  }
}
