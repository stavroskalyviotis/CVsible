import { describe, it, expect } from "vitest";
import * as apiKeywords from "./keywords.js";
import * as sourceKeywords from "../../src/ats/keywords";
import { isStopword as apiIsStopword } from "./rules.js";
import { isStopword as sourceIsStopword } from "../../src/ats/rules";

/** These copies exist only because the serverless build cannot import from
 *  src/. They back the agent's exit condition, so if they drift the agent
 *  starts declaring a draft finished by a different standard than the one the
 *  app applies to it a second later — which is exactly the "I fixed things and
 *  the score did not move" complaint. */
describe("api/_lib/keywords is in sync with src/ats/keywords", () => {
  const jobAd = `We are hiring a Customer Service Representative.
    You will handle customer service enquiries, process refunds in Excel,
    and support the customer service team. Excellent Greek and English.
    Εμπειρία σε λογιστική και εξυπηρέτηση πελατών απαραίτητη.`;

  it("extracts the same terms from the same ad", () => {
    expect(apiKeywords.extractJobAdTerms(jobAd)).toEqual(sourceKeywords.extractJobAdTerms(jobAd));
  });

  it("scores the same CV against the same ad identically", () => {
    const resume = "Handled customer service enquiries and refunds. Advanced Excel. Λογιστική.";
    expect(apiKeywords.matchKeywords(resume, jobAd)).toEqual(sourceKeywords.matchKeywords(resume, jobAd));
  });

  it("agrees on which words are the same term", () => {
    const pairs: [string, string][] = [
      ["developer", "development"],
      ["excel", "excellent"],
      ["λογιστικη", "λογιστικης"],
      ["react", "react"],
      ["man", "management"],
    ];
    pairs.forEach(([a, b]) => {
      expect(apiKeywords.sameTerm(a, b)).toBe(sourceKeywords.sameTerm(a, b));
    });
  });

  it("agrees on stopwords", () => {
    ["the", "και", "εμπειρια", "εμπειρία", "kubernetes"].forEach((word) => {
      expect(apiIsStopword(word)).toBe(sourceIsStopword(word));
    });
  });
});
