import { describe, it, expect } from "vitest";
import { applyCvFixChange, applyCvFixChanges } from "./applyChange";
import { cvToDraft, htmlToBullets } from "../cvisor/cvToDraft";
import { createEmptyCvData } from "../data/defaultData";
import type { CvData } from "../types";
import type { CvFixChange } from "./types";

function cv(): CvData {
  const base = createEmptyCvData();
  return {
    ...base,
    personalInfo: { ...base.personalInfo, jobTitle: "Barista", summary: "<p>Two years behind an espresso bar.</p>" },
    experience: [
      {
        id: "exp-1",
        role: "Barista",
        company: "Coffee Lab",
        location: "Athens",
        startDate: "2022-03",
        endDate: "",
        current: true,
        description: "<ul><li>Was responsible for the till.</li><li>Made the rota.</li></ul>",
      },
    ],
    skills: [{ id: "skill-1", name: "Espresso", level: 70, category: "" }],
  };
}

function change(overrides: Partial<CvFixChange> = {}): CvFixChange {
  return {
    id: "c1",
    path: "experience[0].bullets[0]",
    where: "Barista · Coffee Lab",
    before: "Was responsible for the till.",
    after: "Ran the till through every morning rush.",
    why: "Opens with an action verb.",
    ...overrides,
  };
}

describe("applyCvFixChange", () => {
  it("replaces the bullet the change names and leaves its sibling alone", () => {
    const next = applyCvFixChange(cv(), change());
    const bullets = htmlToBullets(next.experience[0].description);
    expect(bullets).toEqual(["Ran the till through every morning rush.", "Made the rota."]);
  });

  /** Accepting a fix must not look like a delete-and-recreate to the rest of
   *  the app — the entry keeps its identity, and so does undo. */
  it("keeps the entry's id", () => {
    const next = applyCvFixChange(cv(), change());
    expect(next.experience[0].id).toBe("exp-1");
    expect(next.experience[0].company).toBe("Coffee Lab");
  });

  it("appends a bullet when the path has no index", () => {
    const next = applyCvFixChange(
      cv(),
      change({ path: "experience[0].bullets", before: "", after: "Trained two new staff." }),
    );
    expect(htmlToBullets(next.experience[0].description)).toEqual([
      "Was responsible for the till.",
      "Made the rota.",
      "Trained two new staff.",
    ]);
  });

  it("replaces the summary and the job title", () => {
    const withSummary = applyCvFixChange(cv(), change({ path: "summary", after: "Barista who runs a busy bar." }));
    expect(withSummary.personalInfo.summary).toBe("<p>Barista who runs a busy bar.</p>");

    const withTitle = applyCvFixChange(cv(), change({ path: "jobTitle", after: "Barista & Shift Lead" }));
    expect(withTitle.personalInfo.jobTitle).toBe("Barista & Shift Lead");
  });

  it("escapes text going into rich-text fields", () => {
    const next = applyCvFixChange(cv(), change({ path: "summary", after: "Worked <b>hard</b> & fast." }));
    expect(next.personalInfo.summary).toBe("<p>Worked &lt;b&gt;hard&lt;/b&gt; &amp; fast.</p>");
  });

  it("adds a skill, but not one already listed under different casing", () => {
    const added = applyCvFixChange(cv(), change({ path: "skills", before: "", after: "Latte art" }));
    expect(added.skills.map((skill) => skill.name)).toEqual(["Espresso", "Latte art"]);

    const duplicate = applyCvFixChange(cv(), change({ path: "skills", before: "", after: "espresso" }));
    expect(duplicate.skills).toHaveLength(1);
  });

  /** The proposals can sit on screen while the CV is edited elsewhere. A stale
   *  path must be a no-op, never a crash and never an edit to the wrong line. */
  it("ignores a path that no longer resolves", () => {
    const data = cv();
    expect(applyCvFixChange(data, change({ path: "experience[9].bullets[0]" }))).toBe(data);
    expect(applyCvFixChange(data, change({ path: "experience[0].bullets[9]" }))).toBe(data);
    expect(applyCvFixChange(data, change({ path: "personalInfo.fullName" }))).toBe(data);
    expect(applyCvFixChange(data, change({ after: "   " }))).toBe(data);
  });

  it("turns a description typed as paragraphs into real bullets", () => {
    const data = cv();
    const plain: CvData = {
      ...data,
      experience: [{ ...data.experience[0], description: "<p>Was responsible for the till.</p>" }],
    };
    const next = applyCvFixChange(plain, change());
    expect(next.experience[0].description).toBe("<ul><li>Ran the till through every morning rush.</li></ul>");
  });
});

describe("applyCvFixChanges", () => {
  it("applies several changes across the CV", () => {
    const next = applyCvFixChanges(cv(), [
      change(),
      change({ id: "c2", path: "experience[0].bullets[1]", before: "Made the rota.", after: "Set the weekly rota." }),
      change({ id: "c3", path: "skills", before: "", after: "Latte art" }),
    ]);

    expect(htmlToBullets(next.experience[0].description)).toEqual([
      "Ran the till through every morning rush.",
      "Set the weekly rota.",
    ]);
    expect(next.skills).toHaveLength(2);
  });

  /** Replacements are addressed by index, so an addition applied first must not
   *  shift what a later replacement points at. */
  it("keeps replacement indexes valid when an addition comes first", () => {
    const next = applyCvFixChanges(cv(), [
      change({ id: "add", path: "experience[0].bullets", before: "", after: "Trained two new staff." }),
      change(),
    ]);
    expect(htmlToBullets(next.experience[0].description)).toEqual([
      "Ran the till through every morning rush.",
      "Made the rota.",
      "Trained two new staff.",
    ]);
  });

  it("returns the document untouched when nothing was accepted", () => {
    const data = cv();
    expect(applyCvFixChanges(data, [])).toBe(data);
  });
});

/** The paths CVfix uses are indexes into the draft, so the two conversions have
 *  to agree about what index 0 is. */
describe("cvToDraft round-trips the paths applyChange resolves", () => {
  it("sees the same bullets applyChange edits", () => {
    const draft = cvToDraft(cv());
    expect(draft.experience[0].bullets).toEqual(["Was responsible for the till.", "Made the rota."]);
    expect(draft.jobTitle).toBe("Barista");
    expect(draft.summary).toBe("Two years behind an espresso bar.");
  });

  it("reflects an applied change on the next pass", () => {
    const draft = cvToDraft(applyCvFixChange(cv(), change()));
    expect(draft.experience[0].bullets[0]).toBe("Ran the till through every morning rush.");
  });
});
