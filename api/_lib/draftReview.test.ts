import { describe, it, expect } from "vitest";
import { reviewDraft, formatReview } from "./draftReview";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";

function draft(overrides: Partial<CvDraft>): CvDraft {
  return { ...EMPTY_DRAFT, ...overrides };
}

const GOOD_SUMMARY =
  "Product-minded backend engineer with six years of experience building resilient payment systems for high-growth marketplaces. " +
  "Led the migration to an event-driven architecture that cut checkout failures by a third, and mentored four junior engineers along the way. " +
  "Comfortable owning a service end to end, from design through on-call.";

const GOOD_BULLET = "Rebuilt the payment retry pipeline, cutting failed-charge incidents by 32% within two quarters.";

function goodExperience() {
  return {
    role: "Senior Backend Engineer",
    company: "Acme Payments",
    location: "Athens",
    startDate: "2021-03",
    endDate: "2023-06",
    current: false,
    bullets: [GOOD_BULLET],
  };
}

describe("reviewDraft — summary", () => {
  it("blocks an empty summary", () => {
    const review = reviewDraft(draft({}), "", "");
    expect(review.blocking.some((i) => i.includes("summary is empty"))).toBe(true);
  });

  it("blocks a summary under the minimum length", () => {
    const review = reviewDraft(draft({ summary: "Too short." }), "", "");
    expect(review.blocking.some((i) => i.includes("under the"))).toBe(true);
  });

  it("blocks a summary over the maximum length", () => {
    const review = reviewDraft(draft({ summary: "x ".repeat(500) }), "", "");
    expect(review.blocking.some((i) => i.includes("over the"))).toBe(true);
  });

  it("blocks cliché filler phrases in the summary", () => {
    const review = reviewDraft(
      draft({ summary: `${GOOD_SUMMARY} I am a hard working team player.` }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("empty filler"))).toBe(true);
  });

  it("accepts a well-formed summary with no blocking issues", () => {
    const review = reviewDraft(draft({ summary: GOOD_SUMMARY, experience: [goodExperience()] }), "", "");
    expect(review.blocking).toEqual([]);
  });
});

describe("reviewDraft — experience", () => {
  it("blocks when both experience and education are empty", () => {
    const review = reviewDraft(draft({ summary: GOOD_SUMMARY }), "", "");
    expect(review.blocking.some((i) => i.includes("both experience and education are empty"))).toBe(true);
  });

  it("blocks a missing role or company", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [{ ...goodExperience(), role: "" }] }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("experience[0].role is empty"))).toBe(true);
  });

  it("blocks zero bullets on an experience entry", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [{ ...goodExperience(), bullets: [] }] }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("has no bullets"))).toBe(true);
  });

  it("blocks a bullet under the minimum character length", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [{ ...goodExperience(), bullets: ["Too short."] }] }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("too short to say anything"))).toBe(true);
  });

  it("blocks a bullet that starts with a bullet character", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [{ ...goodExperience(), bullets: [`• ${GOOD_BULLET}`] }] }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("starts with a bullet character"))).toBe(true);
  });

  it("blocks a bullet containing HTML", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [{ ...goodExperience(), bullets: [`<b>${GOOD_BULLET}</b>`] }] }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("contains HTML"))).toBe(true);
  });

  it("blocks endDate before startDate", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [{ ...goodExperience(), startDate: "2023-01", endDate: "2022-01" }],
      }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("endDate is before startDate"))).toBe(true);
  });

  it("gives advice, not a block, when a bullet doesn't start with a recognisable action verb", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [{ ...goodExperience(), bullets: ["This particular quarter was a busy one for the whole team overall."] }],
      }),
      "",
      "",
    );
    expect(review.advice.some((i) => i.includes("action verb"))).toBe(true);
    expect(review.blocking.some((i) => i.includes("action verb"))).toBe(false);
  });
});

describe("reviewDraft — skills", () => {
  it("blocks duplicate skills", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [goodExperience()],
        skills: [
          { name: "React", level: 80 },
          { name: "react", level: 60 },
        ],
      }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("skills contains duplicates"))).toBe(true);
  });

  it("gives advice (not a block) for fewer than 5 skills", () => {
    const review = reviewDraft(
      draft({ summary: GOOD_SUMMARY, experience: [goodExperience()], skills: [{ name: "React", level: 80 }] }),
      "",
      "",
    );
    expect(review.advice.some((i) => i.includes("only 1 skills"))).toBe(true);
  });
});

describe("reviewDraft — missing keywords", () => {
  it("surfaces job-ad terms the candidate's own source supports but the draft omits", () => {
    const source = "Δούλεψα με kubernetes και docker σε production περιβάλλον για δύο χρόνια.";
    const jobAd = "Ζητείται μηχανικός με εμπειρία σε kubernetes, docker και terraform.";
    const review = reviewDraft(draft({ summary: GOOD_SUMMARY, experience: [goodExperience()] }), source, jobAd);
    expect(review.missingKeywords).toContain("kubernetes");
    expect(review.missingKeywords).toContain("docker");
    // terraform isn't in the candidate's own text, so it must never be suggested (would invite fabrication).
    expect(review.missingKeywords).not.toContain("terraform");
  });

  it("returns no missing keywords when no job ad is given", () => {
    const review = reviewDraft(draft({ summary: GOOD_SUMMARY, experience: [goodExperience()] }), "source text", "");
    expect(review.missingKeywords).toEqual([]);
  });
});

describe("formatReview", () => {
  it("says BLOCKING: none when there is nothing blocking", () => {
    const text = formatReview({ blocking: [], advice: [], missingKeywords: [] });
    expect(text).toContain("BLOCKING: none.");
  });

  it("includes counts and every section when populated", () => {
    const text = formatReview({ blocking: ["b1"], advice: ["a1"], missingKeywords: ["k1"] });
    expect(text).toContain("BLOCKING (1)");
    expect(text).toContain("WORTH IMPROVING");
    expect(text).toContain("k1");
  });
});
