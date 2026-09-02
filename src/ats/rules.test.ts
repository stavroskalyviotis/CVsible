import { describe, it, expect } from "vitest";
import { isStopword, ACTION_VERBS_EN, ACTION_VERBS_EL } from "./rules";

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

describe("action verb lists", () => {
  it("contain only lowercase entries, matching how callers compare them", () => {
    ACTION_VERBS_EN.forEach((verb) => expect(verb).toBe(verb.toLowerCase()));
    ACTION_VERBS_EL.forEach((verb) => expect(verb).toBe(verb.toLowerCase()));
  });

  it("has no duplicate entries", () => {
    expect(new Set(ACTION_VERBS_EN).size).toBe(ACTION_VERBS_EN.length);
    expect(new Set(ACTION_VERBS_EL).size).toBe(ACTION_VERBS_EL.length);
  });
});
