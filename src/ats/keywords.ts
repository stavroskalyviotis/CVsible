import { isStopword } from "./rules";

/** Keyword coverage between a CV and a job ad.
 *
 *  The old matcher took the twenty most frequent words of the ad and asked
 *  for an exact string match, which is why the number felt arbitrary:
 *  "developer" missed "development", "λογιστική" missed "λογιστικής", and a
 *  two-word requirement like "customer service" was counted as two unrelated
 *  words. Two changes fix most of that — a loose stem comparison, and
 *  treating repeated two-word phrases as single terms.
 *
 *  This still is not what a real ATS does (they weight by their own taxonomy
 *  of skills), but it is a defensible answer to "how much of what this ad
 *  asks for does my CV actually say". */

const COMBINING_MARKS = /[̀-ͯ]/g;
const WORD_SPLIT = /[^\p{L}\p{N}+#.]+/u;
/** Same class, global, for flattening a document into space-separated words
 *  so a two-word phrase can be found in it. */
const WORD_SPLIT_ALL = /[^\p{L}\p{N}+#.]+/gu;

/** Shortest shared opening that counts as the same word. Below this, "man"
 *  would match "management" and every short coincidence would score. Six also
 *  keeps "excel" (the software) from being satisfied by "excellent", while
 *  short technology names still match exactly. */
const MIN_STEM_OVERLAP = 6;

/** How many of the ad's terms are judged. Enough to be representative, few
 *  enough that the missing list stays a to-do list rather than a wall. */
const DEFAULT_TERM_LIMIT = 20;

export function normalizeKeyword(value: string): string {
  return value
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeKeyword(text).split(WORD_SPLIT).filter(Boolean);
}

function isContentWord(word: string): boolean {
  return word.length >= 3 && !isStopword(word) && !/^\d+$/.test(word);
}

function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a[index] === b[index]) index++;
  return index;
}

/** Same word, allowing for the endings each language adds.
 *
 *  Compares how far two words agree from the front rather than asking whether
 *  one contains the other: "developer" and "development" share a root but
 *  neither is a prefix of the other, and Greek cases ("λογιστική",
 *  "λογιστικής") behave the same way.
 *
 *  Deliberately blunt: no stemmer covers Greek inflection and English
 *  derivation at once, and a wrong "no" here reads to the user as the tool
 *  failing to see a word that is plainly on the page. */
export function sameTerm(a: string, b: string): boolean {
  if (a === b) return true;
  return commonPrefixLength(a, b) >= MIN_STEM_OVERLAP;
}

/** The terms a job ad leans on, most-repeated first.
 *
 *  Two-word phrases that the ad repeats are kept whole and their parts
 *  dropped, so "customer service" is one requirement rather than two. */
export function extractJobAdTerms(jobAd: string, limit = DEFAULT_TERM_LIMIT): string[] {
  const tokens = tokenize(jobAd);
  if (tokens.length === 0) return [];

  const unigrams = new Map<string, number>();
  tokens.forEach((word) => {
    if (isContentWord(word)) unigrams.set(word, (unigrams.get(word) ?? 0) + 1);
  });

  const bigrams = new Map<string, number>();
  for (let index = 0; index < tokens.length - 1; index++) {
    const first = tokens[index];
    const second = tokens[index + 1];
    // A word repeated back to back ("Excel Excel") is an artefact of how ads
    // are written, not a two-word requirement.
    if (first === second || !isContentWord(first) || !isContentWord(second)) continue;
    const phrase = `${first} ${second}`;
    bigrams.set(phrase, (bigrams.get(phrase) ?? 0) + 1);
  }

  // A phrase only earns its place by recurring; a single incidental pairing
  // of two words is not a requirement.
  const keptPhrases = [...bigrams.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([phrase]) => phrase);

  const claimed = new Set(keptPhrases.flatMap((phrase) => phrase.split(" ")));

  const keptWords = [...unigrams.entries()]
    .filter(([word]) => !claimed.has(word))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word);

  return [...keptPhrases, ...keptWords].slice(0, limit);
}

export interface KeywordReport {
  matched: string[];
  missing: string[];
  /** 0-1 share of the ad's terms the CV covers. */
  ratio: number;
}

function coversTerm(term: string, resumeTokens: string[], resumeText: string): boolean {
  if (term.includes(" ")) {
    // A phrase has to appear as a phrase; matching its words separately is
    // what made "customer service" look covered by "customer" alone.
    return resumeText.includes(term);
  }
  return resumeTokens.some((token) => sameTerm(token, term));
}

/** Null when there is no ad to compare against — an absent job ad is not a
 *  score of zero, it is simply not a question that was asked. */
export function matchKeywords(resumeText: string, jobAd: string, limit = DEFAULT_TERM_LIMIT): KeywordReport | null {
  if (!jobAd.trim()) return null;
  const terms = extractJobAdTerms(jobAd, limit);
  if (terms.length === 0) return null;

  const normalizedResume = ` ${normalizeKeyword(resumeText).replace(WORD_SPLIT_ALL, " ")} `;
  const resumeTokens = tokenize(resumeText);

  const matched = terms.filter((term) => coversTerm(term, resumeTokens, normalizedResume));
  const missing = terms.filter((term) => !coversTerm(term, resumeTokens, normalizedResume));

  return { matched, missing, ratio: matched.length / terms.length };
}
