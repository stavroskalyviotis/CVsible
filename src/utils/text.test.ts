import { describe, it, expect } from "vitest";
import { upperCaseForDisplay } from "./text";

describe("upperCaseForDisplay", () => {
  it("uppercases and strips tonos from accented Greek vowels", () => {
    expect(upperCaseForDisplay("Σταύρος Καλυβιώτης")).toBe("ΣΤΑΥΡΟΣ ΚΑΛΥΒΙΩΤΗΣ");
  });

  it("preserves dialytika (diaeresis) unlike a plain accent strip", () => {
    expect(upperCaseForDisplay("Αϋλος")).toBe("ΑΫΛΟΣ");
  });

  it("passes non-Greek text through locale uppercasing", () => {
    expect(upperCaseForDisplay("john doe")).toBe("JOHN DOE");
  });
});
