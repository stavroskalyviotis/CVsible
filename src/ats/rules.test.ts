import { describe, it, expect } from "vitest";
import { isStopword } from "./rules";
import { ACTION_STEMS_EL, ACTION_STEMS_EN } from "./actionVerbs";

describe("isStopword", () => {
  it("recognises English stopwords", () => {
    expect(isStopword("the")).toBe(true);
    expect(isStopword("with")).toBe(true);
    expect(isStopword("experience")).toBe(true);
  });

  it("recognises Greek stopwords in their accented form", () => {
    expect(isStopword("και")).toBe(true);
    expect(isStopword("εμπειρία")).toBe(true);
  });

  it("also recognises Greek stopwords with the tonos dropped (all-caps job ads lose accents)", () => {
    expect(isStopword("εμπειρια")).toBe(true);
    expect(isStopword("εταιρεια")).toBe(true);
  });

  it("does not flag ordinary content words", () => {
    expect(isStopword("javascript")).toBe(false);
    expect(isStopword("react")).toBe(false);
    expect(isStopword("λογιστικη")).toBe(false);
  });

  it("is case-sensitive (callers are expected to lowercase first)", () => {
    expect(isStopword("The")).toBe(false);
  });
});

describe("action verb stems", () => {
  it("contain only lowercase entries, matching how callers compare them", () => {
    ACTION_STEMS_EN.forEach((stem) => expect(stem).toBe(stem.toLowerCase()));
    ACTION_STEMS_EL.forEach((stem) => expect(stem).toBe(stem.toLowerCase()));
  });

  it("has no duplicate entries", () => {
    expect(new Set(ACTION_STEMS_EN).size).toBe(ACTION_STEMS_EN.length);
    expect(new Set(ACTION_STEMS_EL).size).toBe(ACTION_STEMS_EL.length);
  });

  it("stores Greek stems without accents, so matching never has to guess", () => {
    ACTION_STEMS_EL.forEach((stem) => expect(stem).toBe(stem.normalize("NFD").replace(/[̀-ͯ]/g, "")));
  });

  it("has no stem that is a prefix of another, which would be dead weight", () => {
    for (const list of [ACTION_STEMS_EN, ACTION_STEMS_EL]) {
      const redundant = list.filter((stem) => list.some((other) => other !== stem && stem.startsWith(other)));
      expect(redundant).toEqual([]);
    }
  });
});
