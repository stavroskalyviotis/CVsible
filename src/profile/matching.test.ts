import { describe, it, expect } from "vitest";
import { createEmptyCvData, createEmptyProfile } from "../data/defaultData";
import { createId } from "../utils/id";
import { entriesAvailableToImport, entriesMissingFromProfile, entryKey, isMeaningfulEntry } from "./matching";
import type { CvData, ExperienceItem, UserProfile } from "../types";

function role(patch: Partial<ExperienceItem> = {}): ExperienceItem {
  return {
    id: createId(),
    role: "Barista",
    company: "Coffee Lab",
    location: "Athens",
    startDate: "2020-03",
    endDate: "",
    current: true,
    description: "",
    ...patch,
  };
}

function cvWith(experience: ExperienceItem[]): CvData {
  return { ...createEmptyCvData(), experience };
}

function profileWith(experience: ExperienceItem[]): UserProfile {
  return { ...createEmptyProfile(), experience };
}

describe("entryKey", () => {
  it("identifies a role by what it is, not by how it is worded", () => {
    const a = role({ description: "<ul><li>Served customers</li></ul>" });
    const b = role({ id: createId(), description: "<ul><li>Ran the bar single-handed</li></ul>" });
    expect(entryKey("experience", a)).toBe(entryKey("experience", b));
  });

  it("treats a different employer as a different entry", () => {
    expect(entryKey("experience", role())).not.toBe(entryKey("experience", role({ company: "Other Cafe" })));
  });

  it("ignores case and surrounding whitespace", () => {
    expect(entryKey("skills", { name: "  React " })).toBe(entryKey("skills", { name: "react" }));
  });
});

describe("isMeaningfulEntry", () => {
  it("rejects a row with nothing identifying in it", () => {
    expect(isMeaningfulEntry("experience", role({ role: "", company: "", startDate: "" }))).toBe(false);
    expect(isMeaningfulEntry("skills", { name: "   " })).toBe(false);
  });

  it("accepts a row with any identifying field filled", () => {
    expect(isMeaningfulEntry("experience", role({ role: "", startDate: "" }))).toBe(true);
    expect(isMeaningfulEntry("skills", { name: "React" })).toBe(true);
  });
});

describe("entriesMissingFromProfile", () => {
  it("finds entries the CV has and the profile does not", () => {
    const shared = role();
    const extra = role({ company: "Other Cafe" });
    const missing = entriesMissingFromProfile("experience", cvWith([shared, extra]), profileWith([shared]));
    expect(missing.map((item) => item.company)).toEqual(["Other Cafe"]);
  });

  it("does not report a reworded copy of something the profile already has", () => {
    const inProfile = role({ description: "<p>original</p>" });
    const tailored = role({ id: createId(), description: "<p>tailored for this ad</p>" });
    expect(entriesMissingFromProfile("experience", cvWith([tailored]), profileWith([inProfile]))).toHaveLength(0);
  });

  it("ignores blank rows", () => {
    const blank = role({ role: "", company: "", startDate: "" });
    expect(entriesMissingFromProfile("experience", cvWith([blank]), profileWith([]))).toHaveLength(0);
  });

  it("reports nothing until the profile has loaded", () => {
    expect(entriesMissingFromProfile("experience", cvWith([role()]), null)).toHaveLength(0);
  });
});

describe("entriesAvailableToImport", () => {
  it("offers only what the CV does not already carry", () => {
    const shared = role();
    const other = role({ company: "Other Cafe" });
    const available = entriesAvailableToImport("experience", profileWith([shared, other]), cvWith([shared]));
    expect(available.map((item) => item.company)).toEqual(["Other Cafe"]);
  });

  it("offers everything when the CV section is empty", () => {
    expect(entriesAvailableToImport("experience", profileWith([role(), role({ company: "B" })]), cvWith([]))).toHaveLength(2);
  });

  it("never offers a blank profile row", () => {
    const blank = role({ role: "", company: "", startDate: "" });
    expect(entriesAvailableToImport("experience", profileWith([blank]), cvWith([]))).toHaveLength(0);
  });
});
