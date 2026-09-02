/** Deterministic review of a CVisor draft.
 *
 *  This is the agent's critic. Instead of asking the model to grade its own
 *  work, the server measures the draft against the rules a senior recruiter
 *  would apply and hands back a concrete fix list. The loop repeats until the
 *  blocking list is empty.
 */

import type { CvDraft } from "./draftTypes.js";
import { normalizeForMatch } from "./grounding.js";

const ACTION_VERBS_EN = [
  "achieved", "advised", "analysed", "analyzed", "architected", "automated", "built", "coached",
  "consolidated", "converted", "coordinated", "created", "cut", "delivered", "designed", "developed",
  "directed", "drove", "established", "expanded", "generated", "grew", "implemented", "improved",
  "increased", "influenced", "initiated", "introduced", "launched", "led", "maintained", "managed",
  "mentored", "migrated", "negotiated", "operated", "optimised", "optimized", "orchestrated", "owned",
  "planned", "prototyped", "rebuilt", "redesigned", "reduced", "refactored", "resolved", "restructured",
  "scaled", "secured", "shipped", "simplified", "standardised", "standardized", "streamlined",
  "supervised", "supported", "taught", "tested", "trained", "transformed", "wrote",
];

const ACTION_VERB_STEMS_EL = [
  "ανελαβ", "ανεπτυξ", "αναδιοργανωσ", "αναβαθμισ", "αναλυσ", "ανασχεδιασ", "αξιοποιησ", "απλοποιησ",
  "αυξησ", "βελτιωσ", "βελτιστοποιησ", "δημιουργησ", "διαχειριστ", "διηυθυν", "διοργανωσ",
  "εγκαταστησ", "εισηγαγ", "εκπαιδευσ", "εκπροσωπησ", "εξοικονομησ", "εξυπηρετησ", "επεβλεπ",
  "επιβλεπ", "επιταχυν", "επιλυσ", "εφαρμοσ", "καθιερωσ", "κατασκευασ", "κατεγραψ", "μειωσ",
  "μετεφερ", "οργανωσ", "παρακολουθησ", "παρεδωσ", "προωθησ", "συγκεντρωσ", "συνεργαστ", "σχεδιασ",
  "συντονισ", "συνεβαλ", "υλοποιησ", "υποστηριξ", "ηγηθηκ", "διδαξ", "εγραψ", "ελεγξ", "εκλεισ",
  "διαπραγματευτ", "διεκπεραιωσ", "τηρησ", "χειριστ", "λειτουργησ", "προγραμματισ",
];

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

export interface DraftReview {
  blocking: string[];
  advice: string[];
  missingKeywords: string[];
}

function startsWithActionVerb(bullet: string): boolean {
  const first = normalizeForMatch(bullet).split(" ")[0] ?? "";
  if (!first) return false;
  return ACTION_VERBS_EN.includes(first) || ACTION_VERB_STEMS_EL.some((stem) => first.startsWith(stem));
}

function findCliches(text: string): string[] {
  const normalized = normalizeForMatch(text);
  return CLICHES.filter((phrase) => normalized.includes(normalizeForMatch(phrase)));
}

function isMonthOrEmpty(value: string): boolean {
  return value === "" || MONTH_PATTERN.test(value);
}

/** Terms the job ad leans on that the candidate's own text supports but the
 *  draft has not used yet — safe, truthful wording upgrades. */
function missingKeywords(draft: CvDraft, source: string, jobAd: string): string[] {
  if (!jobAd.trim()) return [];

  const stop = new Set([
    "the", "and", "for", "with", "you", "your", "our", "are", "will", "have", "has", "that", "this",
    "from", "who", "what", "into", "not", "but", "all", "any", "can", "using", "use", "used", "work",
    "working", "role", "team", "teams", "job", "position", "company", "must", "should", "would",
    "about", "more", "other", "such", "than", "then", "them", "they", "their", "there", "been",
    "being", "also", "well", "years", "year", "experience", "skills", "strong", "good", "great",
    "και", "της", "του", "των", "τον", "την", "στο", "στη", "στην", "στον", "στα", "στις", "για",
    "απο", "που", "ειναι", "θα", "να", "με", "σε", "ως", "τα", "το", "οι", "ενα", "μια", "μας",
    "σας", "τους", "οπως", "κατα", "μετα", "πριν", "προς", "εργασια", "εμπειρια", "γνωση", "θεση",
    "εταιρεια", "ομαδα", "χρονια", "καλη", "αριστη", "πολυ", "ολα", "δεν", "αν", "ενω", "επισης",
  ]);

  const counts = new Map<string, number>();
  normalizeForMatch(jobAd)
    .split(" ")
    .forEach((word) => {
      if (word.length < 4 || stop.has(word) || /^\d+$/.test(word)) return;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });

  const draftText = normalizeForMatch(JSON.stringify(draft));
  const sourceText = normalizeForMatch(source);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => sourceText.includes(word) && !draftText.includes(word))
    .slice(0, 8);
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
      // Advice, not blocking: Greek verb morphology is too varied for a stem
      // list to be authoritative, and a false reject makes the agent burn a
      // round rewriting a perfectly good bullet.
      if (!startsWithActionVerb(text)) {
        advice.push(`${where} may not start with an action verb: "${text.slice(0, 60)}".`);
      }
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

  const sourceHasNumbers = /\d/.test(source.replace(/\b(19|20)\d{2}\b/g, ""));
  const draftBullets = [
    ...draft.experience.flatMap((item) => item.bullets),
    ...draft.projects.flatMap((item) => item.bullets),
  ];
  if (sourceHasNumbers && !draftBullets.some((bullet) => /\d/.test(bullet))) {
    advice.push(
      "the candidate's text contains figures but no bullet uses one. Surface the results they already mentioned.",
    );
  }

  return { blocking, advice, missingKeywords: missingKeywords(draft, source, jobAd) };
}

export function formatReview(review: DraftReview): string {
  const parts: string[] = [];

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
      "JOB-AD TERMS THE CANDIDATE'S OWN TEXT SUPPORTS BUT THE DRAFT DOES NOT USE — rewrite existing wording to use them where truthful, do not bolt them on:\n" +
        review.missingKeywords.map((word) => `- ${word}`).join("\n"),
    );
  }

  return parts.join("\n\n");
}
