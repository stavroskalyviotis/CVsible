import { describe, it, expect } from "vitest";
import { findVerbatimIssues, formatVerbatimReport } from "./verbatim";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";

function draft(overrides: Partial<CvDraft>): CvDraft {
  return { ...EMPTY_DRAFT, ...overrides };
}

const SOURCE =
  "Δούλεψα σερβιτόρος στο Blue Cafe από το 2021. Εκπαίδευσα 4 καινούργιους υπαλλήλους και ανέβασα τις πωλήσεις κατά 15%.";

describe("findVerbatimIssues", () => {
  it("accepts a summary that is a contiguous substring of the source once normalised", () => {
    const issues = findVerbatimIssues(
      draft({ summary: "Εκπαίδευσα 4 καινούργιους υπαλλήλους και ανέβασα τις πωλήσεις κατά 15%." }),
      SOURCE,
    );
    expect(issues).toEqual([]);
  });

  it("flags a bullet that has been reworded rather than merely re-punctuated", () => {
    const issues = findVerbatimIssues(
      draft({
        experience: [
          {
            role: "Σερβιτόρος",
            company: "Blue Cafe",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: ["Εκπαίδευσα τέσσερις νέους συναδέλφους."],
          },
        ],
      }),
      SOURCE,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe("experience[0].bullets[0]");
  });

  it("ignores fragments shorter than the minimum checked length", () => {
    const issues = findVerbatimIssues(
      draft({
        experience: [
          {
            role: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: ["Σωστό."],
          },
        ],
      }),
      SOURCE,
    );
    expect(issues).toEqual([]);
  });

  it("accepts a bullet split out of a longer verbatim sentence", () => {
    const issues = findVerbatimIssues(
      draft({
        experience: [
          {
            role: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: ["ανέβασα τις πωλήσεις κατά 15%"],
          },
        ],
      }),
      SOURCE,
    );
    expect(issues).toEqual([]);
  });

  it("does not check non-prose fields like company/role/institution", () => {
    const issues = findVerbatimIssues(
      draft({
        experience: [
          {
            role: "A role that was entirely invented and reworded",
            company: "A totally different company name here",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [],
          },
        ],
      }),
      SOURCE,
    );
    expect(issues).toEqual([]);
  });
});

describe("formatVerbatimReport", () => {
  it("reports clean when there are no issues", () => {
    expect(formatVerbatimReport([])).toContain("clean");
  });

  it("lists every issue with its field name", () => {
    const report = formatVerbatimReport([{ field: "summary", value: "reworded text" }]);
    expect(report).toContain("summary");
    expect(report).toContain("reworded text");
  });
});
