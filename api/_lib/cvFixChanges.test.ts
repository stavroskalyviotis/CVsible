import { describe, it, expect } from "vitest";
import { parsePath, readPath, describeLocation, validateChanges } from "./cvFixChanges";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";

function draft(overrides: Partial<CvDraft> = {}): CvDraft {
  return {
    ...EMPTY_DRAFT,
    jobTitle: "Barista",
    summary: "Barista with two years behind a busy espresso bar.",
    experience: [
      {
        role: "Barista",
        company: "Coffee Lab",
        location: "Athens",
        startDate: "2022-03",
        endDate: "",
        current: true,
        bullets: ["Was responsible for the till and the morning rota."],
      },
    ],
    ...overrides,
  };
}

/** Everything the candidate has told us. A replacement may reword this; it may
 *  not go outside it. */
const SOURCE =
  "Barista at Coffee Lab in Athens since March 2022. I handled the till and the morning rota, and trained 3 new staff.";

function proposal(overrides: Record<string, unknown> = {}) {
  return {
    path: "experience[0].bullets[0]",
    before: "Was responsible for the till and the morning rota.",
    after: "Ran the till and set the morning rota for a team of two.",
    why: "Opens with an action verb instead of 'was responsible for'.",
    ...overrides,
  };
}

describe("parsePath", () => {
  it("reads the paths CVfix is allowed to touch", () => {
    expect(parsePath("jobTitle")).toEqual({ kind: "jobTitle" });
    expect(parsePath("summary")).toEqual({ kind: "summary" });
    expect(parsePath("skills")).toEqual({ kind: "skillAdd" });
    expect(parsePath("experience[0].bullets[2]")).toEqual({
      kind: "bullet",
      section: "experience",
      entry: 0,
      bullet: 2,
    });
    expect(parsePath("projects[1].bullets")).toEqual({ kind: "bulletAdd", section: "projects", entry: 1 });
  });

  it("refuses anything else, rather than guessing what was meant", () => {
    ["", "personalInfo.fullName", "experience[0]", "experience[].bullets[0]", "languages[0]", "__proto__"].forEach(
      (path) => expect(parsePath(path)).toBeNull(),
    );
  });
});

describe("readPath", () => {
  it("returns what the CV currently says", () => {
    expect(readPath(draft(), { kind: "jobTitle" })).toBe("Barista");
    expect(readPath(draft(), { kind: "bullet", section: "experience", entry: 0, bullet: 0 })).toContain("till");
  });

  it("returns null for an entry or bullet that is not there", () => {
    expect(readPath(draft(), { kind: "bullet", section: "experience", entry: 9, bullet: 0 })).toBeNull();
    expect(readPath(draft(), { kind: "bullet", section: "experience", entry: 0, bullet: 9 })).toBeNull();
    expect(readPath(draft(), { kind: "bulletAdd", section: "projects", entry: 0 })).toBeNull();
  });
});

describe("describeLocation", () => {
  it("names the place the way the candidate would", () => {
    expect(describeLocation(draft(), { kind: "bullet", section: "experience", entry: 0, bullet: 0 })).toBe(
      "Barista · Coffee Lab",
    );
  });

  it("uses degree and institution for education", () => {
    const withSchool = draft({
      education: [
        {
          degree: "BSc Computer Science",
          institution: "AUTH",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: ["Studied things."],
        },
      ],
    });
    expect(describeLocation(withSchool, { kind: "bullet", section: "education", entry: 0, bullet: 0 })).toBe(
      "BSc Computer Science · AUTH",
    );
  });
});

describe("validateChanges", () => {
  it("keeps a well-formed rewrite and reports where it lands", () => {
    const { changes, rejected } = validateChanges([proposal()], draft(), SOURCE);
    expect(rejected).toEqual([]);
    expect(changes).toHaveLength(1);
    expect(changes[0].where).toBe("Barista · Coffee Lab");
    expect(changes[0].before).toBe("Was responsible for the till and the morning rota.");
    expect(changes[0].after).toContain("Ran the till");
  });

  /** The candidate is about to accept this on the strength of the "before"
   *  shown next to it. If that quote is not what their CV actually says, the
   *  change is editing a document we are not holding. */
  it("drops a change whose quoted original does not match the CV", () => {
    const { changes, rejected } = validateChanges(
      [proposal({ before: "Something this CV never said." })],
      draft(),
      SOURCE,
    );
    expect(changes).toEqual([]);
    expect(rejected[0].reason).toBe("stale");
  });

  it("forgives whitespace differences in the quote", () => {
    const { changes } = validateChanges(
      [proposal({ before: "Was responsible   for the till\nand the morning rota." })],
      draft(),
      SOURCE,
    );
    expect(changes).toHaveLength(1);
  });

  /** The single most damaging failure mode: a rewrite that reads beautifully
   *  and claims something the candidate never did. */
  it("drops a rewrite that invents a fact", () => {
    const { changes, rejected } = validateChanges(
      [proposal({ after: "Ran the till and lifted daily revenue by 40% across the branch." })],
      draft(),
      SOURCE,
    );
    expect(changes).toEqual([]);
    expect(rejected[0].reason).toBe("fabricated");
  });

  it("allows a figure the candidate did give", () => {
    const { changes, rejected } = validateChanges(
      [proposal({ after: "Ran the till and trained 3 new staff on the morning rota." })],
      draft(),
      SOURCE,
    );
    expect(rejected).toEqual([]);
    expect(changes).toHaveLength(1);
    expect(changes[0].after).toContain("3 new staff");
  });

  it("drops a no-op and an empty replacement", () => {
    const noop = validateChanges([proposal({ after: proposal().before })], draft(), SOURCE);
    expect(noop.rejected[0].reason).toBe("unchanged");

    const empty = validateChanges([proposal({ after: "   " })], draft(), SOURCE);
    expect(empty.rejected[0].reason).toBe("empty");
  });

  it("drops a change aimed at a path that is not editable", () => {
    const { rejected } = validateChanges([proposal({ path: "personalInfo.fullName" })], draft(), SOURCE);
    expect(rejected[0].reason).toBe("unknown_path");
  });

  it("drops a change aimed at an entry the CV does not have", () => {
    const { rejected } = validateChanges([proposal({ path: "experience[7].bullets[0]" })], draft(), SOURCE);
    expect(rejected[0].reason).toBe("not_found");
  });

  /** Two edits to one bullet cannot both be applied, and the second was
   *  written against text the first replaces. */
  it("keeps only the first proposal for a given location", () => {
    const { changes, rejected } = validateChanges(
      [proposal(), proposal({ after: "Managed the till and the rota single-handedly." })],
      draft(),
      SOURCE,
    );
    expect(changes).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });

  it("accepts several additions to the same list", () => {
    const { changes } = validateChanges(
      [
        { path: "experience[0].bullets", before: "", after: "Trained two new staff on the espresso bar.", why: "" },
        { path: "experience[0].bullets", before: "", after: "Set the morning rota for the Athens branch.", why: "" },
      ],
      draft(),
      SOURCE,
    );
    expect(changes).toHaveLength(2);
    expect(changes[0].before).toBe("");
  });

  it("returns nothing when the model sent something that is not a list", () => {
    expect(validateChanges(null, draft(), SOURCE)).toEqual({ changes: [], rejected: [] });
    expect(validateChanges({ path: "summary" }, draft(), SOURCE).changes).toEqual([]);
  });
});
