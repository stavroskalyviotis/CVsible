import { describe, it, expect } from "vitest";
import { analyzeResumeText } from "./analyzeText";
import type { ExtractedResume } from "./extractResume";

function baseResume(overrides: Partial<ExtractedResume> = {}): ExtractedResume {
  const lines = [
    "Jane Smith",
    "jane.smith@example.com | +30 210 1234567 | linkedin.com/in/janesmith",
    "Professional Summary",
    "Product-minded frontend engineer with six years of experience shipping accessible interfaces.",
    "Experience",
    "Senior Frontend Engineer, Acme Digital — 03/2022 - present",
    "• Delivered a checkout redesign that increased conversion by 18%",
    "• Led migration of 40 components to a shared design system",
    "Frontend Developer, Nova Labs — 09/2019 - 02/2022",
    "• Built the customer portal used by 30000 people",
    "• Reduced bundle size by 25% through code-splitting",
    "Education",
    "MSc Computer Science, National Technical University — 09/2017 - 06/2019",
    "Skills",
    "React, TypeScript, Node.js, GraphQL, Testing, CSS, Accessibility, Performance",
  ];
  const text = lines.join("\n");
  // Pad word count comfortably inside the 250-1200 "pass" band.
  const padding = Array.from({ length: 220 }, (_, i) => `word${i}`).join(" ");

  return {
    kind: "pdf",
    fileName: "jane-smith-cv.pdf",
    fileSize: 120_000,
    pageCount: 1,
    text: `${text}\n${padding}`,
    lines,
    pageTexts: [text],
    hasTextLayer: true,
    multiColumnPages: 0,
    imageCount: 0,
    linkUrls: [],
    fonts: ["Helvetica"],
    title: "Jane Smith",
    author: "Jane Smith",
    producer: "CVsible",
    ...overrides,
  };
}

describe("analyzeResumeText", () => {
  it("gives a well-formed resume a high, non-contradictory score", () => {
    const analysis = analyzeResumeText(baseResume(), "");
    expect(analysis.checks.some((check) => check.status === "fail")).toBe(false);
    expect(analysis.score).toBeGreaterThanOrEqual(70);
  });

  it("short-circuits to score 0 / fail when there is no text layer (scanned PDF)", () => {
    const analysis = analyzeResumeText(
      baseResume({ hasTextLayer: false, text: "", lines: [] }),
      "",
    );
    expect(analysis.score).toBe(0);
    expect(analysis.checks).toEqual([
      { id: "textLayer", status: "fail", weight: 3, value: 0 },
    ]);
  });

  it("never reports a score of 70+ ('good'/'excellent') when a check has failed", () => {
    // No email, no experience section -> multiple criticals fail.
    const analysis = analyzeResumeText(
      baseResume({
        lines: ["Jane Smith", "just a name, nothing else structured"],
        text: "Jane Smith just a name nothing else structured",
      }),
      "",
    );
    expect(analysis.checks.some((c) => c.status === "fail")).toBe(true);
    expect(analysis.score).toBeLessThanOrEqual(69);
  });

  it("flags a two-column layout as a hard fail (singleColumn)", () => {
    const analysis = analyzeResumeText(baseResume({ multiColumnPages: 1 }), "");
    const check = analysis.checks.find((c) => c.id === "singleColumn");
    expect(check?.status).toBe("fail");
    expect(analysis.score).toBeLessThanOrEqual(69);
  });

  it("flags letter-spaced headings (PDF extractor artifact) as spacedLetters fail", () => {
    const shattered = "S K I L L S A N D T O O L S U S E D";
    const analysis = analyzeResumeText(
      baseResume({ lines: [shattered, ...baseResume().lines], text: `${shattered}\n${baseResume().text}` }),
      "",
    );
    const check = analysis.checks.find((c) => c.id === "spacedLetters");
    expect(check?.status).toBe("fail");
  });

  it("computes a keyword match report against a job ad", () => {
    const jobAd = "Looking for a React and TypeScript engineer with GraphQL experience.";
    const analysis = analyzeResumeText(baseResume(), jobAd);
    expect(analysis.keywords).not.toBeNull();
    expect(analysis.keywords!.matched.length).toBeGreaterThan(0);
  });

  it("omits the keyword check entirely when no job ad is given", () => {
    const analysis = analyzeResumeText(baseResume(), "");
    expect(analysis.keywords).toBeNull();
    expect(analysis.checks.some((c) => c.id === "keywords")).toBe(false);
  });

  it("warns (not fails) when experience dates are present but only a single range", () => {
    const resume = baseResume({
      lines: ["Jane Smith", "Experience", "Role — 2022 - present", "Skills", "React"],
      text: "Jane Smith\nExperience\nRole — 2022 - present\nSkills\nReact",
    });
    const analysis = analyzeResumeText(resume, "");
    const check = analysis.checks.find((c) => c.id === "experienceDates");
    expect(check?.status).toBe("warn");
  });
});
