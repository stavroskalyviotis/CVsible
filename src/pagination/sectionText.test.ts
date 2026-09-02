import { describe, it, expect } from "vitest";
import { skillLevelLabel, skillText, languageText, inlineSectionText } from "./sectionText";
import { dictionaries } from "../i18n/translations";
import { createEmptyCvData } from "../data/defaultData";

const en = dictionaries.en;

describe("skillLevelLabel", () => {
  it("buckets 0-100 into the four documented bands", () => {
    expect(skillLevelLabel(0, en)).toBe(en.skillLevels[0]);
    expect(skillLevelLabel(25, en)).toBe(en.skillLevels[0]);
    expect(skillLevelLabel(26, en)).toBe(en.skillLevels[1]);
    expect(skillLevelLabel(50, en)).toBe(en.skillLevels[1]);
    expect(skillLevelLabel(51, en)).toBe(en.skillLevels[2]);
    expect(skillLevelLabel(75, en)).toBe(en.skillLevels[2]);
    expect(skillLevelLabel(76, en)).toBe(en.skillLevels[3]);
    expect(skillLevelLabel(100, en)).toBe(en.skillLevels[3]);
  });
});

describe("skillText", () => {
  it("appends the level label when display is 'text'", () => {
    expect(skillText("React", 90, "text", en)).toBe(`React (${en.skillLevels[3]})`);
  });

  it("returns just the name when display is 'none'", () => {
    expect(skillText("React", 90, "none", en)).toBe("React");
  });
});

describe("languageText", () => {
  it("appends the level in parentheses when given", () => {
    expect(languageText("English", "Native")).toBe("English (Native)");
  });

  it("returns just the name when level is empty", () => {
    expect(languageText("English", "")).toBe("English");
  });
});

describe("inlineSectionText", () => {
  it("joins skills, respecting skillDisplay", () => {
    const data = { ...createEmptyCvData(), skillDisplay: "none" as const, skills: [
      { id: "1", name: "React", level: 90 },
      { id: "2", name: "TypeScript", level: 60 },
    ] };
    expect(inlineSectionText("skills", data, en)).toBe("React, TypeScript");
  });

  it("joins languages with their level", () => {
    const data = { ...createEmptyCvData(), languages: [
      { id: "1", name: "English", level: "Native" },
      { id: "2", name: "Greek", level: "" },
    ] };
    expect(inlineSectionText("languages", data, en)).toBe("English (Native), Greek");
  });

  it("joins soft skills and interests as plain comma lists", () => {
    const data = {
      ...createEmptyCvData(),
      softSkills: [{ id: "1", name: "Teamwork" }, { id: "2", name: "Communication" }],
      interests: [{ id: "1", name: "Hiking" }],
    };
    expect(inlineSectionText("softSkills", data, en)).toBe("Teamwork, Communication");
    expect(inlineSectionText("interests", data, en)).toBe("Hiking");
  });

  it("returns an empty string for an empty section", () => {
    expect(inlineSectionText("skills", createEmptyCvData(), en)).toBe("");
  });
});
