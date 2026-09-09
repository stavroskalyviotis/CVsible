import { describe, it, expect } from "vitest";
import { reviewDraft, formatReview, ACTION_VERB_TARGET, KEYWORD_TARGET } from "./draftReview";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";
import * as appThresholds from "../../src/ats/analyzeText";

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

  /** The whole point of the critic is that the agent may not declare a draft
   *  finished while the report the candidate is about to read would criticise
   *  it. Before this blocked, CVisor returned CVs that CVsible's own scan then
   *  marked down for their verbs. */
  it("blocks when too few bullets open with an action verb to pass the app's own check", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [{ ...goodExperience(), bullets: ["This particular quarter was a busy one for the whole team overall."] }],
      }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("action verb"))).toBe(true);
    expect(review.metrics.verbRatio).toBe(0);
  });

  it("names the offending bullets so the fix is actionable", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [{ ...goodExperience(), bullets: ["This particular quarter was a busy one for the whole team overall."] }],
      }),
      "",
      "",
    );
    const issue = review.blocking.find((i) => i.includes("action verb")) ?? "";
    expect(issue).toContain("experience[0].bullets[0]");
  });

  /** Above the threshold the CV passes, so a round spent rewriting one line is
   *  a round not spent on something blocking. */
  it("only advises about a stray weak opener once the ratio clears the target", () => {
    const review = reviewDraft(
      draft({
        summary: GOOD_SUMMARY,
        experience: [
          {
            ...goodExperience(),
            bullets: [
              "Coordinated a team of six baristas across two shifts every single week.",
              "Reduced waste by rewriting the weekly ordering routine from scratch.",
              "This particular quarter was a busy one for the whole team overall.",
            ],
          },
        ],
      }),
      "",
      "",
    );
    expect(review.blocking.some((i) => i.includes("action verb"))).toBe(false);
    expect(review.advice.some((i) => i.includes("action verb"))).toBe(true);
    expect(review.metrics.verbRatio).toBeGreaterThanOrEqual(0.5);
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

/** "I fix things and the score doesn't move" came from these two sides
 *  measuring the same CV against different numbers. They are copies only
 *  because api/ cannot import from src/. */
describe("the agent is held to the thresholds the app reports", () => {
  it("uses the same action-verb target as the scan", () => {
    expect(ACTION_VERB_TARGET).toBe(appThresholds.ACTION_VERB_TARGET);
  });

  it("uses the same keyword target as the scan", () => {
    expect(KEYWORD_TARGET).toBe(appThresholds.KEYWORD_TARGET);
  });
});

describe("formatReview", () => {
  const metrics = { verbRatio: 0.75, bulletCount: 4, keywordRatio: 0.5 };

  it("says BLOCKING: none when there is nothing blocking", () => {
    const text = formatReview({ blocking: [], advice: [], missingKeywords: [], metrics });
    expect(text).toContain("BLOCKING: none.");
  });

  it("includes counts and every section when populated", () => {
    const text = formatReview({ blocking: ["b1"], advice: ["a1"], missingKeywords: ["k1"], metrics });
    expect(text).toContain("BLOCKING (1)");
    expect(text).toContain("WORTH IMPROVING");
    expect(text).toContain("k1");
  });

  /** The agent argues with opinions and complies with numbers, so the numbers
   *  the candidate will see go first. */
  it("opens with the measurements the candidate's report will show", () => {
    const text = formatReview({ blocking: [], advice: [], missingKeywords: [], metrics });
    expect(text).toContain("75% opening with an action verb");
    expect(text).toContain("50% job-ad coverage");
    expect(text.indexOf("MEASURED")).toBeLessThan(text.indexOf("BLOCKING"));
  });

  it("leaves out coverage when there was no job ad to compare against", () => {
    const text = formatReview({
      blocking: [],
      advice: [],
      missingKeywords: [],
      metrics: { verbRatio: 1, bulletCount: 2, keywordRatio: null },
    });
    expect(text).not.toContain("coverage");
  });
});
