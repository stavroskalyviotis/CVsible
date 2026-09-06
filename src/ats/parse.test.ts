import { describe, it, expect } from "vitest";
import {
  normalize,
  findSections,
  parseResume,
  EMAIL_PATTERN,
  URL_PATTERN,
  DATE_RANGE_PATTERN,
} from "./parse";
import type { ExtractedResume } from "./extractResume";

function resume(lines: string[], overrides: Partial<ExtractedResume> = {}): ExtractedResume {
  const text = lines.join("\n");
  return {
    kind: "txt",
    fileName: "cv.txt",
    fileSize: text.length,
    pageCount: 1,
    text,
    lines,
    pageTexts: [text],
    hasTextLayer: true,
    multiColumnPages: 0,
    imageCount: 0,
    linkUrls: [],
    fonts: [],
    title: "",
    author: "",
    producer: "",
    ...overrides,
  };
}

describe("normalize", () => {
  it("lowercases and strips Greek diacritics, including dialytika", () => {
    expect(normalize("ΕΜΠΕΙΡΊΑ")).toBe("εμπειρια");
    // NFD + combining-mark strip removes the dialytika along with the tonos,
    // unlike upperCaseForDisplay() in utils/text.ts which preserves it.
    expect(normalize("Προϋπηρεσία")).toBe("προυπηρεσια");
  });

  it("collapses whitespace and trims", () => {
    expect(normalize("  Skills   Section  ")).toBe("skills section");
  });
});

describe("EMAIL_PATTERN", () => {
  it("matches a plain email address", () => {
    expect("stavros@example.com".match(EMAIL_PATTERN)?.[0]).toBe("stavros@example.com");
  });

  it("does not swallow surrounding punctuation", () => {
    const match = "Contact: stavros@example.com, phone below".match(EMAIL_PATTERN);
    expect(match?.[0]).toBe("stavros@example.com");
  });
});

describe("PHONE_PATTERN + digit-length filter (mirrors parseResume)", () => {
  it("accepts a Greek mobile number", () => {
    const fields = parseResume(resume(["Τηλέφωνο: +30 694 000 0000"]));
    expect(fields.phones).toContain("+30 694 000 0000");
  });

  it("rejects a bare 4-digit year matched incidentally", () => {
    const fields = parseResume(resume(["Established 2019"]));
    expect(fields.phones).toEqual([]);
  });
});

describe("URL_PATTERN", () => {
  it("matches linkedin/github handles without a scheme", () => {
    expect("linkedin.com/in/stavros".match(URL_PATTERN)?.[0]).toBe("linkedin.com/in/stavros");
    expect("github.com/stav".match(URL_PATTERN)?.[0]).toBe("github.com/stav");
  });

  it("matches full https URLs", () => {
    expect("https://cvsible.com".match(URL_PATTERN)?.[0]).toBe("https://cvsible.com");
  });
});

describe("DATE_RANGE_PATTERN", () => {
  it("matches a month/year to month/year range", () => {
    const match = "03/2022 - 06/2023".match(DATE_RANGE_PATTERN);
    expect(match?.[0]).toBe("03/2022 - 06/2023");
  });

  it("matches a year range to 'present'", () => {
    const match = "2022 - present".match(DATE_RANGE_PATTERN);
    expect(match?.[0]).toBe("2022 - present");
  });

  it("matches the Greek 'σήμερα'", () => {
    const match = "2022 - σήμερα".match(DATE_RANGE_PATTERN);
    expect(match?.[0]).toBe("2022 - σήμερα");
  });
});

describe("findSections", () => {
  it("finds canonical English headings", () => {
    const sections = findSections(["John Doe", "Work Experience", "Did stuff", "Education", "MSc"]);
    expect(sections.map((s) => s.key)).toEqual(["experience", "education"]);
  });

  it("finds Greek headings ignoring accents/case", () => {
    const sections = findSections(["Στάυρος", "ΕΡΓΑΣΙΑΚΗ ΕΜΠΕΙΡΙΑ", "κάτι", "Δεξιότητες"]);
    expect(sections.map((s) => s.key)).toEqual(["experience", "skills"]);
  });

  it("does not treat a body sentence merely mentioning 'experience' as a heading", () => {
    const sections = findSections(["I have 5 years of experience building products end to end for clients."]);
    expect(sections).toEqual([]);
  });

  it("ignores headings longer than 45 characters", () => {
    const longLine = "experience " + "x".repeat(40);
    const sections = findSections([longLine]);
    expect(sections).toEqual([]);
  });

  it("only reports the first occurrence of each heading key", () => {
    const sections = findSections(["Experience", "role one", "Experience", "role two"]);
    expect(sections).toHaveLength(1);
  });

  it("tolerates a trailing colon", () => {
    const sections = findSections(["Skills:"]);
    expect(sections.map((s) => s.key)).toEqual(["skills"]);
  });
});

describe("parseResume", () => {
  it("extracts emails, phones, urls and date ranges together", () => {
    const fields = parseResume(
      resume([
        "Jane Smith",
        "jane@example.com | +30 210 1234567 | linkedin.com/in/jane",
        "Experience",
        "Senior Engineer, Acme — 03/2022 - present",
        "• Shipped the new checkout flow",
        "• Reduced latency by 30%",
      ]),
    );

    expect(fields.emails).toEqual(["jane@example.com"]);
    expect(fields.phones.length).toBeGreaterThan(0);
    expect(fields.urls).toContain("linkedin.com/in/jane");
    expect(fields.dateRanges.length).toBeGreaterThan(0);
    expect(fields.bulletLines).toHaveLength(2);
  });

  it("guesses the candidate name from the first short line before any heading", () => {
    const fields = parseResume(resume(["Jane Smith", "Senior Product Designer", "Experience", "..."]));
    expect(fields.name).toBe("Jane Smith");
  });

  it("does not guess a name from a line containing digits or an @", () => {
    const fields = parseResume(resume(["jane@example.com", "+30 210 1234567", "Experience"]));
    expect(fields.name).toBeNull();
  });

  it("counts words using whitespace splitting", () => {
    const fields = parseResume(resume(["one two three"]));
    expect(fields.wordCount).toBe(3);
  });

  it("merges link annotations (linkUrls) into the urls list", () => {
    const fields = parseResume(resume(["no urls in text"], { linkUrls: ["https://example.com/cv"] }));
    expect(fields.urls).toContain("https://example.com/cv");
  });
});
