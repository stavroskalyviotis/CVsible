import { describe, it, expect } from "vitest";
import { normalizeForMatch, findGroundingIssues } from "./grounding";
import { EMPTY_DRAFT } from "./draftTypes";
import type { CvDraft } from "./draftTypes";

function draft(overrides: Partial<CvDraft>): CvDraft {
  return { ...EMPTY_DRAFT, ...overrides };
}

describe("normalizeForMatch", () => {
  it("lowercases, strips Greek tonos, and folds final-sigma to medial sigma", () => {
    // Folding ς -> σ means inflected forms match regardless of word position.
    expect(normalizeForMatch("Πληροφορικής")).toBe("πληροφορικησ");
  });

  it("collapses punctuation to single spaces but keeps + # . as token characters", () => {
    expect(normalizeForMatch("Node.js, React/Redux!")).toBe("node.js react redux");
  });
});

describe("findGroundingIssues — entities", () => {
  const source = "Δούλεψα στην Google ως Software Engineer στο τμήμα Πληροφορικής.";

  it("accepts a company name that appears verbatim", () => {
    const issues = findGroundingIssues(draft({ experience: [{ role: "Software Engineer", company: "Google", location: "", startDate: "", endDate: "", current: false, bullets: [] }] }), source);
    expect(issues).toEqual([]);
  });

  it("accepts a reordered/inflected multi-word entity whose tokens all appear in the source", () => {
    const issues = findGroundingIssues(
      draft({
        education: [
          { degree: "Πτυχίο Πληροφορικής", institution: "Τμήμα Πληροφορικής", location: "", startDate: "", endDate: "", current: false, bullets: [] },
        ],
      }),
      "Πτυχίο, Τμήμα Πληροφορικής, Google, Software Engineer.",
    );
    expect(issues).toEqual([]);
  });

  it("flags a company that never appears in the source, in any form", () => {
    const issues = findGroundingIssues(
      draft({
        experience: [{ role: "Engineer", company: "Microsoft", location: "", startDate: "", endDate: "", current: false, bullets: [] }],
      }),
      source,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ field: "experience[0].company", value: "Microsoft", kind: "entity" });
  });

  it("does not flag empty fields", () => {
    const issues = findGroundingIssues(
      draft({ experience: [{ role: "Engineer", company: "Google", location: "", startDate: "", endDate: "", current: false, bullets: [] }] }),
      source,
    );
    expect(issues).toEqual([]);
  });

  it("flags a fabricated jobTitle not present in the source", () => {
    const issues = findGroundingIssues(draft({ jobTitle: "Chief Astronaut" }), source);
    expect(issues).toEqual([{ field: "jobTitle", value: "Chief Astronaut", kind: "entity" }]);
  });

  it("flags a fabricated soft skill or interest not present in the source", () => {
    const issues = findGroundingIssues(draft({ softSkills: ["Ηγεσία ομάδας 50 ατόμων"], interests: ["Σκάκι"] }), source);
    expect(issues.map((issue) => issue.field).sort()).toEqual(["interests[0]", "softSkills[0]"]);
  });
});

describe("findGroundingIssues — narrative numbers", () => {
  // Includes "Manager" and "Acme" so the entity checks on those fields stay clean
  // and only the number-grounding behaviour under test produces issues.
  const source = "Manager στην Acme. Αύξησα τις πωλήσεις κατά 18% και εκπαίδευσα 4 νέους υπαλλήλους το 2022.";

  it("accepts a percentage that appears in the source", () => {
    const issues = findGroundingIssues(
      draft({ experience: [{ role: "Manager", company: "Acme", location: "", startDate: "", endDate: "", current: false, bullets: ["Αύξησα τις πωλήσεις κατά 18%."] }] }),
      source,
    );
    expect(issues).toEqual([]);
  });

  it("flags a fabricated percentage not present in the source", () => {
    const issues = findGroundingIssues(
      draft({ experience: [{ role: "Manager", company: "Acme", location: "", startDate: "", endDate: "", current: false, bullets: ["Αύξησα τις πωλήσεις κατά 45%."] }] }),
      source,
    );
    expect(issues).toEqual([{ field: "experience[0].bullets[0]", value: "45%", kind: "number" }]);
  });

  it("does not treat a bare 4-digit year as a fabricated figure", () => {
    const issues = findGroundingIssues(
      draft({ experience: [{ role: "Manager", company: "Acme", location: "", startDate: "", endDate: "", current: false, bullets: ["Ξεκίνησα το 2022 στην εταιρεία."] }] }),
      source,
    );
    expect(issues).toEqual([]);
  });

  it("flags a fabricated headcount number even though a different number for the same claim exists in the source", () => {
    const issues = findGroundingIssues(
      draft({ experience: [{ role: "Manager", company: "Acme", location: "", startDate: "", endDate: "", current: false, bullets: ["Εκπαίδευσα 10 νέους υπαλλήλους."] }] }),
      source,
    );
    expect(issues).toEqual([{ field: "experience[0].bullets[0]", value: "10", kind: "number" }]);
  });
});
