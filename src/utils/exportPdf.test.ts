import { describe, it, expect } from "vitest";
import { buildPdfFilename } from "./exportPdf";

describe("buildPdfFilename", () => {
  it("produces an ASCII-safe filename for a Latin name", () => {
    expect(buildPdfFilename("Jane Smith")).toBe("CVsible-Jane-Smith.pdf");
  });

  it("falls back to 'resume' for an empty name", () => {
    expect(buildPdfFilename("")).toBe("CVsible-resume.pdf");
  });

  it("falls back to 'resume' for a non-Latin-script name, consistently with buildJsonFilename", () => {
    expect(buildPdfFilename("Σταύρος Καλυβιώτης")).toBe("CVsible-resume.pdf");
  });
});
