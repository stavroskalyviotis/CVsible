import { describe, it, expect } from "vitest";
import { extractJobAdKeywords, scoreBand, passesAts } from "./analyze";
import type { AtsReport } from "./analyze";

describe("extractJobAdKeywords", () => {
  it("ranks by frequency, tie-broken alphabetically", () => {
    const jobAd = "react react react vue vue angular";
    expect(extractJobAdKeywords(jobAd, 3)).toEqual(["react", "vue", "angular"]);
  });

  it("drops stopwords and pure numbers", () => {
    const jobAd = "the team needs someone with 5 years of react experience";
    const terms = extractJobAdKeywords(jobAd);
    expect(terms).not.toContain("the");
    expect(terms).not.toContain("5");
    expect(terms).not.toContain("experience");
    expect(terms).toContain("react");
  });

  it("drops words shorter than 3 characters", () => {
    const terms = extractJobAdKeywords("go ci ui css react");
    expect(terms).not.toContain("go");
    expect(terms).not.toContain("ci");
    expect(terms).not.toContain("ui");
    expect(terms).toContain("css");
  });

  it("respects the limit parameter", () => {
    const jobAd = "alpha beta gamma delta epsilon zeta";
    expect(extractJobAdKeywords(jobAd, 2)).toHaveLength(2);
  });

  it("handles an empty job ad", () => {
    expect(extractJobAdKeywords("")).toEqual([]);
  });
});

describe("scoreBand", () => {
  it("bands scores at the documented thresholds", () => {
    expect(scoreBand(100)).toBe("excellent");
    expect(scoreBand(85)).toBe("excellent");
    expect(scoreBand(84)).toBe("good");
    expect(scoreBand(70)).toBe("good");
    expect(scoreBand(69)).toBe("fair");
    expect(scoreBand(50)).toBe("fair");
    expect(scoreBand(49)).toBe("poor");
    expect(scoreBand(0)).toBe("poor");
  });
});

describe("passesAts", () => {
  function report(statuses: Array<"pass" | "warn" | "fail">): AtsReport {
    return {
      score: 0,
      keywords: null,
      checks: statuses.map((status, index) => ({
        id: "email" as const,
        status,
        weight: 1,
        value: index,
      })),
    };
  }

  it("passes when nothing failed, regardless of warnings", () => {
    expect(passesAts(report(["pass", "warn", "pass"]))).toBe(true);
  });

  it("fails when any check failed", () => {
    expect(passesAts(report(["pass", "fail", "pass"]))).toBe(false);
  });

  it("passes vacuously for an empty checklist", () => {
    expect(passesAts(report([]))).toBe(true);
  });
});
