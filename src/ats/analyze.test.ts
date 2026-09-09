import { describe, it, expect } from "vitest";
import { scoreBand, passesAts, hasStructuralFailure } from "./analyze";
import type { AtsAxisId, AtsCheck, AtsReport, AtsStatus } from "./analyze";

/** Job-ad term extraction lives in ./keywords.ts and is tested there. */

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
  function checksOf(axis: AtsAxisId, statuses: AtsStatus[]): AtsCheck[] {
    return statuses.map((status, index) => ({
      id: "email" as const,
      axis,
      status,
      weight: 1,
      value: index,
    }));
  }

  function report({
    format = [],
    content = [],
    match = [],
  }: {
    format?: AtsStatus[];
    content?: AtsStatus[];
    match?: AtsStatus[];
  }): AtsReport {
    const formatChecks = checksOf("format", format);
    const contentChecks = checksOf("content", content);
    const matchChecks = checksOf("match", match);
    return {
      format: { id: "format", score: 0, checks: formatChecks },
      content: { id: "content", score: 0, checks: contentChecks },
      match:
        match.length > 0
          ? { id: "match", score: 0, checks: matchChecks, keywords: { matched: [], missing: [], ratio: 0 } }
          : null,
      checks: [...formatChecks, ...contentChecks, ...matchChecks],
      keywords: null,
    };
  }

  it("passes when nothing failed, regardless of warnings", () => {
    expect(passesAts(report({ format: ["pass", "warn"], content: ["pass"] }))).toBe(true);
  });

  it("fails when a format check failed", () => {
    expect(passesAts(report({ format: ["pass", "fail"], content: ["pass"] }))).toBe(false);
  });

  it("fails when a content check failed", () => {
    expect(passesAts(report({ format: ["pass"], content: ["fail"] }))).toBe(false);
  });

  it("passes vacuously for an empty checklist", () => {
    expect(passesAts(report({}))).toBe(true);
  });

  it("is not dragged down by the job-ad match — a poor fit is not a broken CV", () => {
    expect(passesAts(report({ format: ["pass"], content: ["pass"], match: ["fail"] }))).toBe(true);
  });

});

describe("hasStructuralFailure", () => {
  function withCheck(id: AtsCheck["id"], status: AtsStatus): AtsReport {
    const check: AtsCheck = { id, axis: "format", status, weight: 3 };
    return {
      format: { id: "format", score: 0, checks: [check] },
      content: { id: "content", score: 0, checks: [] },
      match: null,
      checks: [check],
      keywords: null,
    };
  }

  it("is true when a layout decision defeats a parser", () => {
    expect(hasStructuralFailure(withCheck("singleColumn", "fail"))).toBe(true);
    expect(hasStructuralFailure(withCheck("spacedLetters", "fail"))).toBe(true);
  });

  /** Otherwise a brand-new, still-empty CV would raise the flag from the
   *  first second, and a flag that is always on says nothing. */
  it("stays quiet for gaps the author can see in their own form", () => {
    expect(hasStructuralFailure(withCheck("email", "fail"))).toBe(false);
    expect(hasStructuralFailure(withCheck("phone", "fail"))).toBe(false);
    expect(hasStructuralFailure(withCheck("headingsFound", "fail"))).toBe(false);
  });

  it("stays quiet for a document that is simply still empty", () => {
    expect(hasStructuralFailure(withCheck("textLayer", "fail"))).toBe(false);
  });

  it("stays quiet when the structural checks merely warn", () => {
    expect(hasStructuralFailure(withCheck("singleColumn", "warn"))).toBe(false);
    expect(hasStructuralFailure(withCheck("singleColumn", "unknown"))).toBe(false);
  });
});
