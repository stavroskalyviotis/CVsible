import { describe, it, expect } from "vitest";
import { normalizeCvData } from "./normalize";
import { createEmptyCvData, DEFAULT_SECTION_ORDER } from "./defaultData";

describe("normalizeCvData", () => {
  it("returns a fresh empty CV for null/undefined input", () => {
    expect(normalizeCvData(null).personalInfo.fullName).toBe("");
    expect(normalizeCvData(undefined).template).toBe("atlas");
  });

  it("falls back to a safe default template for an unknown/corrupt value", () => {
    const result = normalizeCvData({ template: "not-a-real-template" as never });
    expect(result.template).toBe("atlas");
  });

  it("keeps a valid template", () => {
    const result = normalizeCvData({ template: "aurora" });
    expect(result.template).toBe("aurora");
  });

  it("assigns ids to list items that arrived without one", () => {
    const result = normalizeCvData({
      experience: [
        { role: "Engineer", company: "Acme", location: "", startDate: "", endDate: "", current: false, description: "" } as never,
      ],
    });
    expect(result.experience[0].id).toBeTruthy();
  });

  it("keeps an existing id instead of generating a new one", () => {
    const result = normalizeCvData({
      experience: [
        { id: "keep-me", role: "Engineer", company: "Acme", location: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    });
    expect(result.experience[0].id).toBe("keep-me");
  });

  it("migrates legacy mainOrder/sidebarOrder into sectionOrder", () => {
    const result = normalizeCvData({
      mainOrder: ["education", "experience"],
      sidebarOrder: ["skills"],
    } as never);
    expect(result.sectionOrder.slice(0, 3)).toEqual(["education", "experience", "skills"]);
  });

  it("appends any section the stored order never mentioned, in default position", () => {
    const result = normalizeCvData({ sectionOrder: ["skills"] });
    expect(result.sectionOrder).toContain("languages");
    expect(new Set(result.sectionOrder).size).toBe(DEFAULT_SECTION_ORDER.length);
  });

  it("drops duplicate and unknown entries from a corrupt sectionOrder", () => {
    const result = normalizeCvData({ sectionOrder: ["skills", "skills", "not-a-section" as never] });
    expect(result.sectionOrder.filter((s) => s === "skills")).toHaveLength(1);
    expect(result.sectionOrder).not.toContain("not-a-section");
  });

  it("defaults skillDisplay to 'text' unless explicitly 'none'", () => {
    expect(normalizeCvData({ skillDisplay: "none" }).skillDisplay).toBe("none");
    expect(normalizeCvData({ skillDisplay: "garbage" as never }).skillDisplay).toBe("text");
    expect(normalizeCvData({}).skillDisplay).toBe("text");
  });

  it("round-trips a fully-populated CV without losing sectionOrder integrity", () => {
    const original = createEmptyCvData();
    original.experience.push({
      id: "e1", role: "Engineer", company: "Acme", location: "", startDate: "2022-01", endDate: "", current: true, description: "",
    });
    const result = normalizeCvData(original);
    expect(result.experience).toHaveLength(1);
    expect(result.sectionOrder).toEqual(original.sectionOrder);
  });
});
