/** Deterministic review of a CVisor draft.
 *
 *  This is the agent's critic. Instead of asking the model to grade its own
 *  work, the server measures the draft against the rules a senior recruiter
 *  would apply and hands back a concrete fix list. The loop repeats until the
 *  blocking list is empty.
 *
 *  It measures the draft with the *same* modules the app's scan uses —
 *  actionVerbs and keywords — against the *same* thresholds. That is not a
 *  detail: while the verb check was advisory here, the agent could declare a
 *  draft finished and CVsible's own report would immediately criticise its
 *  verbs and keyword coverage. Anything the model can fix without inventing a
 *  fact blocks; anything that would need facts it was never given is advice.
 */

import { actionVerbRatio, startsWithActionVerb } from "./actionVerbs.js";
import type { CvDraft } from "./draftTypes.js";
import { normalizeForMatch } from "./grounding.js";
import { matchKeywords, sameTerm } from "./keywords.js";

/** Phrases that say nothing and that a recruiter reads as filler. */
const CLICHES = [
  "hard working", "hard-working", "team player", "self-motivated", "results-oriented",
  "responsible for", "duties included", "passion for", "think outside the box", "go-getter",
  "detail oriented", "detail-oriented", "excellent communication skills",
  "σκληρα εργατικ", "ομαδικο πνευμα", "παθος για", "υπευθυνος για", "ημουν υπευθυν",
  "ασχολουμουν με", "καθηκοντα μου", "εξαιρετικες επικοινωνιακες",
];

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MIN_BULLET_CHARS = 30;
const MAX_BULLET_CHARS = 210;
const MIN_SUMMARY_CHARS = 240;
const MAX_SUMMARY_CHARS = 900;

/** Mirrors ACTION_VERB_TARGET and KEYWORD_TARGET in src/ats/analyzeText.ts.
 *  These are the numbers the user is shown, so they are the numbers the agent
 *  has to clear before it is allowed to stop. Exported so the test can prove
 *  the two copies still agree. */
export const ACTION_VERB_TARGET = 0.5;
export const KEYWORD_TARGET = 0.6;

/** How many offending items to name in one message. Enough to act on, few
 *  enough that the review does not crowd out the draft in the next prompt. */
const MAX_LISTED = 6;

export interface DraftReview {
  blocking: string[];
  advice: string[];
  missingKeywords: string[];
  /** What the app's own scan will report for this draft. */
  metrics: {
    verbRatio: number;
    bulletCount: number;
    /** Null when there was no job ad to compare against. */
    keywordRatio: number | null;
  };
}

/** Every bullet in the draft, with the path the model needs to address it. */
function allBullets(draft: CvDraft): { where: string; text: string }[] {
  const found: { where: string; text: string }[] = [];
  const collect = (section: "experience" | "education" | "projects", items: { bullets: string[] }[]) => {
    items.forEach((item, index) => {
      item.bullets.forEach((bullet, bulletIndex) => {
        found.push({ where: `${section}[${index}].bullets[${bulletIndex}]`, text: bullet.trim() });
      });
    });
  };
  collect("experience", draft.experience);
  collect("education", draft.education);
  collect("projects", draft.projects);
  return found;
}

function findCliches(text: string): string[] {
  const normalized = normalizeForMatch(text);
  return CLICHES.filter((phrase) => normalized.includes(normalizeForMatch(phrase)));
}

function isMonthOrEmpty(value: string): boolean {
  return value === "" || MONTH_PATTERN.test(value);
}

/** Everything in the draft a keyword could legitimately appear in. Built from
 *  the fields rather than JSON.stringify so field names ("skills", "current")
 *  cannot themselves count as coverage. */
function draftText(draft: CvDraft): string {
  return [
    draft.jobTitle,
    draft.summary,
    ...draft.experience.flatMap((item) => [item.role, item.company, item.location, ...item.bullets]),
    ...draft.education.flatMap((item) => [item.degree, item.institution, item.location, ...item.bullets]),
    ...draft.projects.flatMap((item) => [item.title, ...item.bullets]),
    ...draft.certifications.flatMap((item) => [item.title, item.issuer]),
    ...draft.skills.map((item) => item.name),
    ...draft.languages.map((item) => item.name),
    ...draft.softSkills,
    ...draft.interests,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Does the candidate's own text support this term? Only these are safe to
 *  demand: asking for a term the source never mentions is asking the model to
 *  make something up, which the grounding check would then reject anyway. */
function sourceSupports(term: string, source: string, sourceTokens: string[]): boolean {
  if (term.includes(" ")) return source.includes(term);
  return sourceTokens.some((token) => sameTerm(token, term));
}

interface KeywordGap {
  /** Ad terms the source supports but the draft does not use. Fixable. */
  supported: string[];
  /** Everything the draft is missing, fixable or not. */
  missing: string[];
  ratio: number | null;
}

function keywordGap(draft: CvDraft, source: string, jobAd: string): KeywordGap {
  const report = matchKeywords(draftText(draft), jobAd);
  if (!report) return { supported: [], missing: [], ratio: null };

  const normalizedSource = ` ${normalizeForMatch(source)} `;
  const sourceTokens = normalizeForMatch(source).split(" ").filter(Boolean);
  const supported = report.missing.filter((term) => sourceSupports(term, normalizedSource, sourceTokens));

  return { supported, missing: report.missing, ratio: report.ratio };
}

export function reviewDraft(draft: CvDraft, source: string, jobAd: string): DraftReview {
  const blocking: string[] = [];
  const advice: string[] = [];

  const summary = draft.summary.trim();
  if (summary.length === 0) {
    blocking.push("summary is empty. Write a 3-5 line professional summary.");
  } else if (summary.length < MIN_SUMMARY_CHARS) {
    blocking.push(
      `summary is ${summary.length} characters, under the ${MIN_SUMMARY_CHARS} minimum. Expand it using facts already present in the candidate's text.`,
    );
  } else if (summary.length > MAX_SUMMARY_CHARS) {
    blocking.push(`summary is ${summary.length} characters, over the ${MAX_SUMMARY_CHARS} maximum. Tighten it.`);
  }

  const summaryCliches = findCliches(summary);
  if (summaryCliches.length > 0) {
    blocking.push(`summary contains empty filler: ${summaryCliches.join(", ")}. Replace with specifics.`);
  }

  if (draft.experience.length === 0 && draft.education.length === 0) {
    blocking.push("both experience and education are empty. Extract everything the candidate listed.");
  }

  draft.experience.forEach((item, index) => {
    const at = `experience[${index}]`;
    if (!item.role.trim()) blocking.push(`${at}.role is empty.`);
    if (!item.company.trim()) blocking.push(`${at}.company is empty.`);
    if (!item.startDate && !item.endDate) {
      advice.push(`${at} has no dates. Add them if the candidate's text states them.`);
    }
    if (!isMonthOrEmpty(item.startDate) || !isMonthOrEmpty(item.endDate)) {
      blocking.push(`${at} dates must be YYYY-MM or empty, got "${item.startDate}" / "${item.endDate}".`);
    }
    if (item.startDate && item.endDate && item.endDate < item.startDate) {
      blocking.push(`${at}.endDate is before startDate.`);
    }
    if (item.current && item.endDate) {
      blocking.push(`${at} is marked current, so endDate must be empty.`);
    }
    if (item.bullets.length === 0) {
      blocking.push(`${at} has no bullets. Add what the candidate said about this role.`);
    } else if (item.bullets.length === 1 && item.bullets[0].length < 120) {
      advice.push(
        `${at} has a single short bullet. Add a second only if the candidate's text supports one — never pad.`,
      );
    }

    item.bullets.forEach((bullet, bulletIndex) => {
      const where = `${at}.bullets[${bulletIndex}]`;
      const text = bullet.trim();
      if (/^[-•*•]/.test(bullet)) blocking.push(`${where} starts with a bullet character. Remove it.`);
      if (/<[a-z/]/i.test(bullet)) blocking.push(`${where} contains HTML. Use plain text.`);
      if (text.length < MIN_BULLET_CHARS) blocking.push(`${where} is too short to say anything (${text.length} chars).`);
      if (text.length > MAX_BULLET_CHARS) blocking.push(`${where} is ${text.length} chars, over ${MAX_BULLET_CHARS}. Split or trim it.`);
      const cliches = findCliches(text);
      if (cliches.length > 0) blocking.push(`${where} contains filler: ${cliches.join(", ")}.`);
    });
  });

  draft.education.forEach((item, index) => {
    const at = `education[${index}]`;
    if (!item.degree.trim()) blocking.push(`${at}.degree is empty.`);
    if (!item.institution.trim()) blocking.push(`${at}.institution is empty.`);
    if (!isMonthOrEmpty(item.startDate) || !isMonthOrEmpty(item.endDate)) {
      blocking.push(`${at} dates must be YYYY-MM or empty.`);
    }
  });

  draft.certifications.forEach((item, index) => {
    if (!isMonthOrEmpty(item.date)) blocking.push(`certifications[${index}].date must be YYYY-MM or empty.`);
  });

  const skillNames = draft.skills.map((skill) => normalizeForMatch(skill.name));
  if (new Set(skillNames).size !== skillNames.length) {
    blocking.push("skills contains duplicates. Keep one entry per skill.");
  }
  if (draft.skills.length < 5) {
    advice.push(`only ${draft.skills.length} skills. Include every skill the candidate named, without inventing any.`);
  }

  // ---------------------------------------------------- the app's own checks
  // Below here the draft is measured exactly as CVsible's scan will measure it
  // moments later. Falling short of these is what used to produce a "finished"
  // CV whose report immediately complained about its verbs and its coverage.

  const bullets = allBullets(draft);
  const verbRatio = actionVerbRatio(bullets.map((bullet) => bullet.text));
  const weakOpeners = bullets.filter((bullet) => !startsWithActionVerb(bullet.text));

  if (bullets.length > 0 && verbRatio < ACTION_VERB_TARGET) {
    blocking.push(
      `only ${Math.round(verbRatio * 100)}% of bullets open with an action verb; the report shown to the candidate requires at least ${ACTION_VERB_TARGET * 100}%. Rewrite these to start with a past-tense action verb (Greek: first person singular past, e.g. "Ανέπτυξα", never a noun like "Διαχείριση"):\n` +
        weakOpeners
          .slice(0, MAX_LISTED)
          .map((bullet) => `  - ${bullet.where}: "${bullet.text.slice(0, 70)}"`)
          .join("\n"),
    );
  } else if (weakOpeners.length > 0) {
    // Above target overall, so not worth a round of its own — but still the
    // first thing a recruiter's eye snags on.
    advice.push(
      `these bullets do not open with an action verb: ${weakOpeners.slice(0, MAX_LISTED).map((bullet) => bullet.where).join(", ")}.`,
    );
  }

  const gap = keywordGap(draft, source, jobAd);
  if (gap.ratio !== null && gap.ratio < KEYWORD_TARGET && gap.supported.length > 0) {
    blocking.push(
      `the draft covers ${Math.round(gap.ratio * 100)}% of the job ad's terms, under the ${KEYWORD_TARGET * 100}% the candidate's report calls a match. Every term below is in the ad AND in the candidate's own text, so using it is truthful, not padding — work each into wording that already exists rather than bolting on a list: ${gap.supported.slice(0, MAX_LISTED).join(", ")}.`,
    );
  } else if (gap.ratio !== null && gap.ratio < KEYWORD_TARGET) {
    // Nothing honest left to do: the ad wants things this candidate never
    // claimed. That is a fact about the fit, not a defect in the draft.
    advice.push(
      `coverage of the job ad is ${Math.round(gap.ratio * 100)}%, but the remaining terms are absent from the candidate's own text. Do not add them.`,
    );
  }

  const sourceHasNumbers = /\d/.test(source.replace(/\b(19|20)\d{2}\b/g, ""));
  if (sourceHasNumbers && !bullets.some((bullet) => /\d/.test(bullet.text))) {
    advice.push(
      "the candidate's text contains figures but no bullet uses one. Surface the results they already mentioned.",
    );
  }

  return {
    blocking,
    advice,
    missingKeywords: gap.supported.length > 0 ? gap.supported : gap.missing.slice(0, MAX_LISTED),
    metrics: { verbRatio, bulletCount: bullets.length, keywordRatio: gap.ratio },
  };
}

export function formatReview(review: DraftReview): string {
  const parts: string[] = [];

  // Leading with the measurements makes the blocking items read as
  // consequences of a number rather than as opinions to be negotiated.
  const { verbRatio, bulletCount, keywordRatio } = review.metrics;
  const measured = [`${bulletCount} bullets`, `${Math.round(verbRatio * 100)}% opening with an action verb`];
  if (keywordRatio !== null) measured.push(`${Math.round(keywordRatio * 100)}% job-ad coverage`);
  parts.push(`MEASURED (this is what the candidate's own report will show): ${measured.join(", ")}.`);

  if (review.blocking.length > 0) {
    parts.push(`BLOCKING (${review.blocking.length}) — the draft cannot be submitted until these are fixed:\n` +
      review.blocking.map((issue) => `- ${issue}`).join("\n"));
  } else {
    parts.push("BLOCKING: none.");
  }

  if (review.advice.length > 0) {
    parts.push(`WORTH IMPROVING:\n${review.advice.map((issue) => `- ${issue}`).join("\n")}`);
  }

  if (review.missingKeywords.length > 0) {
    parts.push(
      "JOB-AD TERMS THE DRAFT DOES NOT USE — rewrite existing wording to use the ones the candidate's text supports, and leave the rest alone:\n" +
        review.missingKeywords.map((word) => `- ${word}`).join("\n"),
    );
  }

  return parts.join("\n\n");
}
