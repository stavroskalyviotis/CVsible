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
    expect(analysis.format.score).toBeGreaterThanOrEqual(70);
    expect(analysis.content.score).toBeGreaterThanOrEqual(70);
  });

  it("short-circuits to score 0 / fail when there is no text layer (scanned PDF)", () => {
    const analysis = analyzeResumeText(
      baseResume({ hasTextLayer: false, text: "", lines: [], imageCount: 3 }),
      "",
    );
    expect(analysis.format.score).toBe(0);
    expect(analysis.checks).toEqual([
      { id: "textLayer", axis: "format", status: "fail", weight: 3, value: 0 },
    ]);
  });

  /** A CV barely started is not a scanned image, and saying so sends the
   *  person looking for a file problem they do not have. */
  it("calls an all-but-empty document empty, not an image", () => {
    const analysis = analyzeResumeText(
      baseResume({ kind: "builder", hasTextLayer: false, text: "Jane", lines: ["Jane"], imageCount: 0 }),
      "",
    );
    expect(analysis.checks).toEqual([
      { id: "documentEmpty", axis: "format", status: "fail", weight: 3, value: 1 },
    ]);
  });

  it("calls a text-free PDF with no images empty rather than scanned", () => {
    const analysis = analyzeResumeText(
      baseResume({ hasTextLayer: false, text: "", lines: [], imageCount: 0 }),
      "",
    );
    expect(analysis.checks[0].id).toBe("documentEmpty");
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
    expect(Math.min(analysis.format.score, analysis.content.score)).toBeLessThanOrEqual(69);
  });

  it("flags a two-column layout as a hard fail (singleColumn)", () => {
    const analysis = analyzeResumeText(baseResume({ multiColumnPages: 1 }), "");
    const check = analysis.checks.find((c) => c.id === "singleColumn");
    expect(check?.status).toBe("fail");
    expect(analysis.format.score).toBeLessThanOrEqual(69);
  });

  it("marks singleColumn as unknown for a DOCX/TXT source instead of a false pass, and excludes it from scoring", () => {
    const clean = analyzeResumeText(baseResume({ kind: "docx", multiColumnPages: 0 }), "");
    const suspicious = analyzeResumeText(baseResume({ kind: "docx", multiColumnPages: 5 }), "");
    expect(clean.checks.find((c) => c.id === "singleColumn")?.status).toBe("unknown");
    expect(suspicious.checks.find((c) => c.id === "singleColumn")?.status).toBe("unknown");
    // multiColumnPages carries no real signal for a DOCX, so it must not move the score.
    expect(suspicious.format.score).toBe(clean.format.score);
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

describe("analyzeResumeText — the three axes", () => {
  it("files every check under exactly one axis", () => {
    const analysis = analyzeResumeText(baseResume(), "React TypeScript GraphQL engineer wanted");
    const axes = new Set(analysis.checks.map((check) => check.axis));
    expect([...axes].sort()).toEqual(["content", "format", "match"]);
    expect(analysis.format.checks.length + analysis.content.checks.length + analysis.match!.checks.length).toBe(
      analysis.checks.length,
    );
  });

  it("leaves the match axis null when no job ad was given", () => {
    const analysis = analyzeResumeText(baseResume(), "");
    expect(analysis.match).toBeNull();
    expect(analysis.checks.some((check) => check.axis === "match")).toBe(false);
  });

  it("reports the match axis as the plain coverage percentage", () => {
    const analysis = analyzeResumeText(baseResume(), "React TypeScript GraphQL engineer wanted");
    expect(analysis.match!.score).toBe(Math.round(analysis.match!.keywords.ratio * 100));
  });

  it("does not let a poor job-ad match move the CV's own score", () => {
    const withoutAd = analyzeResumeText(baseResume(), "");
    const withUnrelatedAd = analyzeResumeText(
      baseResume(),
      "Seeking a licensed heavy goods vehicle driver for regional haulage routes.",
    );
    expect(withUnrelatedAd.format.score).toBe(withoutAd.format.score);
    expect(withUnrelatedAd.content.score).toBe(withoutAd.content.score);
    expect(withUnrelatedAd.match!.score).toBeLessThan(withoutAd.format.score);
  });

  it("separates a broken file from a well-written one: format falls, content holds", () => {
    const clean = analyzeResumeText(baseResume(), "");
    const twoColumn = analyzeResumeText(baseResume({ multiColumnPages: 2 }), "");
    expect(twoColumn.format.score).toBeLessThan(clean.format.score);
    expect(twoColumn.content.score).toBe(clean.content.score);
  });
});

describe("analyzeResumeText — action verbs", () => {
  /** The regression this whole check exists for: these bullets all open with
   *  a real action verb, and the old fixed word list scored them at 0%. */
  it("credits bullets that open with verbs the old list had never heard of", () => {
    const bullets = [
      "• Coordinated a team of 6 engineers across two product squads",
      "• Executed the migration from MySQL to PostgreSQL with zero downtime",
      "• Performed code reviews on 40+ pull requests per month",
      "• Conducted user research interviews with 15 enterprise customers",
      "• Deployed the service to AWS using Terraform and GitHub Actions",
    ];
    const lines = ["Jane Smith", "jane@example.com", "Experience", "Engineer, Acme — 03/2022 - present", ...bullets];
    const analysis = analyzeResumeText(
      baseResume({ lines, text: lines.join("\n") }),
      "",
    );

    const check = analysis.checks.find((item) => item.id === "actionVerbs");
    expect(check?.value).toBe(100);
    expect(check?.status).toBe("pass");
  });

  it("credits the action nouns a Greek CV leads with", () => {
    const bullets = [
      "• Διαχείριση ομάδας 6 ατόμων σε δύο τμήματα",
      "• Ανάπτυξη εφαρμογών σε React και TypeScript",
      "• Εξυπηρέτηση πελατών σε καθημερινή βάση",
      "• Παρακολούθηση αποθέματος και παραγγελιών",
    ];
    const lines = ["Γιάννης Παπάς", "giannis@example.com", "Εμπειρία", "Υπεύθυνος, Acme — 03/2022 - σήμερα", ...bullets];
    const analysis = analyzeResumeText(baseResume({ lines, text: lines.join("\n") }), "");

    expect(analysis.checks.find((item) => item.id === "actionVerbs")?.value).toBe(100);
  });

  it("still warns when the bullets are duty lists rather than achievements", () => {
    const bullets = [
      "• Responsible for the weekly rota",
      "• Duties included cleaning the machines",
      "• My role was to greet customers",
      "• Various administrative tasks as needed",
    ];
    const lines = ["Jane Smith", "jane@example.com", "Experience", "Barista, Acme — 03/2022 - present", ...bullets];
    const analysis = analyzeResumeText(baseResume({ lines, text: lines.join("\n") }), "");

    const check = analysis.checks.find((item) => item.id === "actionVerbs");
    expect(check?.value).toBe(0);
    expect(check?.status).toBe("warn");
  });
});
