import { describe, it, expect } from "vitest";
import { reviewStructure, formatStructureReport } from "./structureReview";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";

function draft(overrides: Partial<CvDraft>): CvDraft {
  return { ...EMPTY_DRAFT, ...overrides };
}

const VALID_EXPERIENCE = {
  role: "Software Engineer",
  company: "Acme",
  location: "",
  startDate: "2022-01",
  endDate: "2023-06",
  current: false,
  bullets: ["Shipped the checkout redesign."],
};

describe("reviewStructure", () => {
  it("is clean for a well-formed draft", () => {
    const issues = reviewStructure(draft({ experience: [VALID_EXPERIENCE] }));
    expect(issues).toEqual([]);
  });

  it("flags when both experience and education are empty", () => {
    const issues = reviewStructure(draft({}));
    expect(issues.some((i) => i.includes("both experience and education are empty"))).toBe(true);
  });

  it("flags a non-YYYY-MM date", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, startDate: "March 2022" }] }));
    expect(issues.some((i) => i.includes("dates must be YYYY-MM"))).toBe(true);
  });

  it("flags an invalid month number like 13", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, startDate: "2022-13" }] }));
    expect(issues.some((i) => i.includes("dates must be YYYY-MM"))).toBe(true);
  });

  it("flags endDate before startDate", () => {
    const issues = reviewStructure(
      draft({ experience: [{ ...VALID_EXPERIENCE, startDate: "2023-01", endDate: "2022-01" }] }),
    );
    expect(issues.some((i) => i.includes("endDate is before startDate"))).toBe(true);
  });

  it("flags current=true with a non-empty endDate", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, current: true, endDate: "2023-06" }] }));
    expect(issues.some((i) => i.includes("is marked current"))).toBe(true);
  });

  it("flags a bullet that still contains HTML", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, bullets: ["<b>bold</b> claim"] }] }));
    expect(issues.some((i) => i.includes("still contains HTML"))).toBe(true);
  });

  it("flags a bullet that still starts with a bullet character", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, bullets: ["• did a thing"] }] }));
    expect(issues.some((i) => i.includes("still starts with a bullet character"))).toBe(true);
  });

  it("flags a skill name that reads like a sentence", () => {
    const longSkill = "I am very skilled at using React and TypeScript in production every single day";
    const issues = reviewStructure(draft({ skills: [{ name: longSkill, level: 50 }] }));
    expect(issues.some((i) => i.includes("is a sentence, not a skill"))).toBe(true);
  });

  it("flags an experience entry with neither role nor company", () => {
    const issues = reviewStructure(draft({ experience: [{ ...VALID_EXPERIENCE, role: "", company: "" }] }));
    expect(issues.some((i) => i.includes("has neither a role nor a company"))).toBe(true);
  });
});

describe("formatStructureReport", () => {
  it("reports clean for no issues", () => {
    expect(formatStructureReport([])).toBe("STRUCTURE CHECK: clean.");
  });

  it("counts and lists issues", () => {
    const report = formatStructureReport(["issue one", "issue two"]);
    expect(report).toContain("STRUCTURE CHECK FAILED (2)");
    expect(report).toContain("issue one");
    expect(report).toContain("issue two");
  });
});
