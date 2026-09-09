import { describe, it, expect } from "vitest";
import {
  skillLevelLabel,
  skillText,
  languageText,
  inlineSectionText,
  skillGroups,
  skillItemGroups,
} from "./sectionText";
import type { SkillItem } from "../types";
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
      { id: "1", name: "React", level: 90, category: "" },
      { id: "2", name: "TypeScript", level: 60, category: "" },
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

function skill(name: string, category = "", level = 90): SkillItem {
  return { id: name, name, level, category };
}

describe("skillItemGroups", () => {
  it("keeps everything in one unnamed group when nobody used a category", () => {
    const groups = skillItemGroups([skill("React"), skill("TypeScript")]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("");
    expect(groups[0].items.map((item) => item.name)).toEqual(["React", "TypeScript"]);
  });

  it("groups by category in the order the categories first appear", () => {
    const groups = skillItemGroups([
      skill("HACCP", "Kitchen"),
      skill("Excel", "Office"),
      skill("Sauces", "Kitchen"),
    ]);
    expect(groups.map((group) => group.category)).toEqual(["Kitchen", "Office"]);
    expect(groups[0].items.map((item) => item.name)).toEqual(["HACCP", "Sauces"]);
  });

  /** Otherwise a stray space silently splits one heading into two. */
  it("treats categories that differ only in surrounding space as one", () => {
    const groups = skillItemGroups([skill("HACCP", "Kitchen"), skill("Sauces", " Kitchen ")]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("Kitchen");
  });

  it("keeps the category as typed, since it is printed as a heading", () => {
    expect(skillItemGroups([skill("HACCP", "Front of House")])[0].category).toBe("Front of House");
  });

  it("puts the uncategorised skills last, whatever order they were typed in", () => {
    const groups = skillItemGroups([skill("Driving"), skill("HACCP", "Kitchen"), skill("First aid")]);
    expect(groups.map((group) => group.category)).toEqual(["Kitchen", ""]);
    expect(groups[1].items.map((item) => item.name)).toEqual(["Driving", "First aid"]);
  });

  it("has nothing to group when there are no skills", () => {
    expect(skillItemGroups([])).toEqual([]);
  });
});

describe("skillGroups", () => {
  it("renders one comma-separated line per category", () => {
    const data = {
      ...createEmptyCvData(),
      skillDisplay: "none" as const,
      skills: [skill("HACCP", "Kitchen"), skill("Sauces", "Kitchen"), skill("Excel", "Office")],
    };
    expect(skillGroups(data, en)).toEqual([
      { category: "Kitchen", text: "HACCP, Sauces" },
      { category: "Office", text: "Excel" },
    ]);
  });

  /** The uncategorised case has to stay byte-identical to the old single line,
   *  because that is what every existing CV renders. */
  it("collapses to the one plain line when no category is set", () => {
    const data = {
      ...createEmptyCvData(),
      skillDisplay: "none" as const,
      skills: [skill("React"), skill("TypeScript")],
    };
    expect(skillGroups(data, en)).toEqual([{ category: "", text: "React, TypeScript" }]);
    expect(skillGroups(data, en)[0].text).toBe(inlineSectionText("skills", data, en));
  });

  it("still spells out the level inside a category", () => {
    const data = {
      ...createEmptyCvData(),
      skillDisplay: "text" as const,
      skills: [skill("HACCP", "Kitchen", 90)],
    };
    expect(skillGroups(data, en)).toEqual([{ category: "Kitchen", text: `HACCP (${en.skillLevels[3]})` }]);
  });

  it("returns nothing for an empty skill list", () => {
    expect(skillGroups(createEmptyCvData(), en)).toEqual([]);
  });
});
