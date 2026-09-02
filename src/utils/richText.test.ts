import { describe, it, expect } from "vitest";
import { sanitizeRichText, plainText, hasRichText } from "./richText";

describe("sanitizeRichText", () => {
  it("keeps allowed formatting tags", () => {
    expect(sanitizeRichText("<p><b>Bold</b> and <i>italic</i></p>")).toBe("<p><b>Bold</b> and <i>italic</i></p>");
  });

  it("unwraps a disallowed tag but keeps its text content", () => {
    expect(sanitizeRichText('<script>alert(1)</script><p>safe</p>')).toBe("alert(1)<p>safe</p>");
  });

  it("strips all attributes, including event handlers, from allowed tags", () => {
    expect(sanitizeRichText('<p onclick="evil()" class="x">hi</p>')).toBe("<p>hi</p>");
  });

  it("keeps only the whitelisted, safe style declarations", () => {
    const out = sanitizeRichText('<span style="font-weight: bold; color: red; text-decoration: underline;">x</span>');
    expect(out).toBe('<span style="font-weight: bold; text-decoration: underline">x</span>');
  });

  it("drops an unrecognised style property or value entirely", () => {
    const out = sanitizeRichText('<span style="font-weight: 999; background: url(evil)">x</span>');
    expect(out).toBe("<span>x</span>");
  });

  it("recursively unwraps nested disallowed elements", () => {
    expect(sanitizeRichText('<div><font color="evil"><b>nested</b></font></div>')).toBe("<div><b>nested</b></div>");
  });

  it("neutralises an <iframe> by parsing its contents as inert text rather than markup", () => {
    // <iframe> switches the HTML tokenizer to RAWTEXT mode, so its payload can
    // never be parsed back into live elements/scripts — it comes out as escaped text.
    const out = sanitizeRichText('<div><iframe src="evil"><b>nested</b></iframe></div>');
    expect(out).not.toContain("<b>");
    expect(out).not.toContain("<iframe");
  });
});

describe("plainText", () => {
  it("strips tags and returns trimmed text content", () => {
    expect(plainText("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("returns an empty string for empty/markup-only input", () => {
    expect(plainText("<p></p>")).toBe("");
    expect(plainText("")).toBe("");
  });
});

describe("hasRichText", () => {
  it("is false for markup with no visible text", () => {
    expect(hasRichText("<p><br></p>")).toBe(false);
  });

  it("is true once there is visible text", () => {
    expect(hasRichText("<p>hi</p>")).toBe(true);
  });
});
