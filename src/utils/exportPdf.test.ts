import { describe, it, expect } from "vitest";
import { buildPdfFilename } from "./exportPdf";

describe("buildPdfFilename", () => {
  it("produces an ASCII-safe filename for a Latin name with no job title", () => {
    expect(buildPdfFilename("Jane Smith")).toBe("CVsible-Jane-Smith.pdf");
  });

  it("includes the job title when given one", () => {
    expect(buildPdfFilename("Jane Smith", "Product Manager")).toBe("CVsible-Jane-Smith-Product-Manager.pdf");
  });

  it("falls back to 'resume' for an empty name", () => {
    expect(buildPdfFilename("")).toBe("CVsible-resume.pdf");
  });

  it("falls back to 'resume' for a non-Latin-script name, consistently with buildJsonFilename", () => {
    expect(buildPdfFilename("Σταύρος Καλυβιώτης")).toBe("CVsible-resume.pdf");
  });

  it("drops a non-Latin-script job title instead of leaving a dangling separator", () => {
    expect(buildPdfFilename("Jane Smith", "Μηχανικός Λογισμικού")).toBe("CVsible-Jane-Smith.pdf");
  });
});
