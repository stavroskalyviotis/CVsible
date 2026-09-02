import { describe, it, expect } from "vitest";
import { formatMonth, formatRange } from "./format";

describe("formatMonth", () => {
  it("returns an empty string for an empty value", () => {
    expect(formatMonth("", "en")).toBe("");
  });

  it("formats a YYYY-MM value with a short month name", () => {
    expect(formatMonth("2022-03", "en")).toBe("Mar 2022");
  });

  it("falls back to the bare year when month is missing", () => {
    expect(formatMonth("2022", "en")).toBe("2022");
  });

  it("uses the Greek locale for Greek CVs", () => {
    // el-GR short month for March is "Μαρ" or "Μαρ."; assert it at least contains the year and differs from English.
    const el = formatMonth("2022-03", "el");
    const en = formatMonth("2022-03", "en");
    expect(el).toContain("2022");
    expect(el).not.toBe(en);
  });
});

describe("formatRange", () => {
  it("returns an empty string when both dates are empty", () => {
    expect(formatRange("", "", false, "en", "Present")).toBe("");
  });

  it("returns just the start label when there is no end and not current", () => {
    expect(formatRange("2022-03", "", false, "en", "Present")).toBe("Mar 2022");
  });

  it("uses the present label when current is true", () => {
    expect(formatRange("2022-03", "", true, "en", "Present")).toBe("Mar 2022 - Present");
  });

  it("joins start and end with a plain hyphen (ATS-parseable, not an en/em dash)", () => {
    const range = formatRange("2022-03", "2023-06", false, "en", "Present");
    expect(range).toBe("Mar 2022 - Jun 2023");
    expect(range).not.toMatch(/[–—]/);
  });
});
