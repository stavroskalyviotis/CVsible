import { describe, it, expect } from "vitest";
import { EMPTY_DRAFT, isEmptyDraft, mergeDraft } from "./draftTypes";

describe("isEmptyDraft", () => {
  it("is true for the empty draft", () => {
    expect(isEmptyDraft(EMPTY_DRAFT)).toBe(true);
  });

  it("is false once a summary is set", () => {
    expect(isEmptyDraft({ ...EMPTY_DRAFT, summary: "hello" })).toBe(false);
  });

  it("is false once experience has an entry, even with an empty summary", () => {
    expect(
      isEmptyDraft({
        ...EMPTY_DRAFT,
        experience: [{ role: "A", company: "B", location: "", startDate: "", endDate: "", current: false, bullets: [] }],
      }),
    ).toBe(false);
  });
});

describe("mergeDraft", () => {
  it("keeps fields the patch never mentioned", () => {
    const current = { ...EMPTY_DRAFT, summary: "existing summary", jobTitle: "Engineer" };
    const merged = mergeDraft(current, { summary: "new summary" }, { ...EMPTY_DRAFT, summary: "new summary" });
    expect(merged.summary).toBe("new summary");
    expect(merged.jobTitle).toBe("Engineer");
  });

  it("applies a deliberate empty-out when the raw patch explicitly sent the field", () => {
    const current = { ...EMPTY_DRAFT, jobTitle: "Engineer" };
    const merged = mergeDraft(current, { jobTitle: "" }, { ...EMPTY_DRAFT, jobTitle: "" });
    expect(merged.jobTitle).toBe("");
  });

  it("does not touch fields absent from raw even if sanitized happens to differ", () => {
    const current = { ...EMPTY_DRAFT, skills: [{ name: "React", level: 80 }] };
    // sanitized carries EMPTY_DRAFT's skills ([]), but raw never mentioned "skills" at all.
    const merged = mergeDraft(current, { summary: "x" }, { ...EMPTY_DRAFT, summary: "x", skills: [] });
    expect(merged.skills).toEqual([{ name: "React", level: 80 }]);
  });
});
