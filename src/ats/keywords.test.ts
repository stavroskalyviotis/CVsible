import { describe, it, expect } from "vitest";
import { extractJobAdTerms, matchKeywords, sameTerm } from "./keywords";

describe("sameTerm", () => {
  it("matches a word with its own inflections", () => {
    expect(sameTerm("developer", "development")).toBe(true);
    expect(sameTerm("λογιστικη", "λογιστικης")).toBe(true);
    expect(sameTerm("report", "reporting")).toBe(true);
  });

  it("does not let a short prefix match everything", () => {
    expect(sameTerm("man", "management")).toBe(false);
    expect(sameTerm("cat", "catering")).toBe(false);
  });

  it("is symmetric", () => {
    expect(sameTerm("development", "developer")).toBe(sameTerm("developer", "development"));
  });

  it("still rejects unrelated words that happen to share a start", () => {
    expect(sameTerm("account", "accuracy")).toBe(false);
  });
});

describe("extractJobAdTerms", () => {
  it("returns nothing for an empty ad", () => {
    expect(extractJobAdTerms("")).toEqual([]);
  });

  it("drops stopwords and bare numbers", () => {
    const terms = extractJobAdTerms("We are looking for a barista with 3 years in a busy cafe");
    expect(terms).not.toContain("are");
    expect(terms).not.toContain("3");
    expect(terms).toContain("barista");
  });

  it("keeps a repeated two-word phrase whole and drops its parts", () => {
    const ad = "Customer service is everything. Strong customer service background required for customer service roles.";
    const terms = extractJobAdTerms(ad);
    expect(terms).toContain("customer service");
    expect(terms).not.toContain("customer");
    expect(terms).not.toContain("service");
  });

  it("does not promote a pairing that only happens once", () => {
    const terms = extractJobAdTerms("A barista who enjoys latte art and a calm morning shift");
    expect(terms.some((term) => term.includes(" "))).toBe(false);
  });

  it("ranks the terms the ad repeats first", () => {
    const terms = extractJobAdTerms("Excel Excel Excel and some powerpoint");
    expect(terms[0]).toBe("excel");
  });

  it("honours the limit", () => {
    const ad = Array.from({ length: 40 }, (_, index) => `skill${index}`).join(" ");
    expect(extractJobAdTerms(ad, 5)).toHaveLength(5);
  });
});

describe("matchKeywords", () => {
  it("returns null when no job ad was given — an unasked question is not a zero", () => {
    expect(matchKeywords("anything at all", "")).toBeNull();
    expect(matchKeywords("anything at all", "   ")).toBeNull();
  });

  it("counts an inflected form as covered", () => {
    const report = matchKeywords("Worked in development of internal tools", "developer developer wanted");
    expect(report?.matched).toContain("developer");
    expect(report?.missing).not.toContain("developer");
  });

  it("counts a Greek term in a different case as covered", () => {
    const report = matchKeywords("Σπουδές στη λογιστική", "Ζητείται γνώση λογιστικής, λογιστικής εμπειρίας");
    expect(report?.missing ?? []).not.toContain("λογιστικης");
  });

  it("does not count a phrase as covered when only one of its words appears", () => {
    const ad = "customer service required. customer service focus. customer service team.";
    const report = matchKeywords("I served customers daily", ad);
    expect(report?.missing).toContain("customer service");
  });

  it("counts a phrase that really is in the CV", () => {
    const ad = "customer service required. customer service focus. customer service team.";
    const report = matchKeywords("Delivered customer service in a busy cafe", ad);
    expect(report?.matched).toContain("customer service");
  });

  it("reports a ratio between 0 and 1 that matches the split", () => {
    const report = matchKeywords("barista latte", "barista latte espresso grinder");
    expect(report).not.toBeNull();
    const { matched, missing, ratio } = report!;
    expect(ratio).toBeCloseTo(matched.length / (matched.length + missing.length));
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });

  it("scores a CV that says none of it at zero", () => {
    const report = matchKeywords("Completely unrelated wording here", "kubernetes terraform postgres");
    expect(report?.ratio).toBe(0);
  });
});
