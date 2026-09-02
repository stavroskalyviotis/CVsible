import { describe, it, expect } from "vitest";
import { buildJsonFilename, readCvJson, CvFileError } from "./cvFile";
import { createEmptyCvData } from "../data/defaultData";

function jsonFile(content: unknown): File {
  return new File([JSON.stringify(content)], "cv.json", { type: "application/json" });
}

describe("buildJsonFilename", () => {
  it("produces an ASCII-safe filename for a Latin name", () => {
    expect(buildJsonFilename("Jane Smith")).toBe("CVsible-Jane-Smith.json");
  });

  it("falls back to 'cv' for an empty or symbols-only name", () => {
    expect(buildJsonFilename("")).toBe("CVsible-cv.json");
    expect(buildJsonFilename("!!!")).toBe("CVsible-cv.json");
  });

  it("falls back to 'cv' for a name in a non-Latin script (ASCII-only filenames by design)", () => {
    // Matches buildPdfFilename()'s identical [^a-zA-Z0-9]+ slug rule in utils/exportPdf.ts,
    // so JSON and PDF downloads behave consistently for the same CV.
    expect(buildJsonFilename("Σταύρος Καλυβιώτης")).toBe("CVsible-cv.json");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(buildJsonFilename("Jane   O'Brien-Smith")).toBe("CVsible-Jane-O-Brien-Smith.json");
  });
});

describe("readCvJson", () => {
  it("accepts the wrapped export format ({ app, version, cv })", () => {
    const data = createEmptyCvData();
    data.personalInfo.fullName = "Jane Smith";
    return readCvJson(jsonFile({ app: "cvsible", version: 1, exportedAt: "now", cv: data })).then((result) => {
      expect(result.personalInfo.fullName).toBe("Jane Smith");
    });
  });

  it("accepts a bare CvData object without the wrapper", () => {
    const data = createEmptyCvData();
    data.personalInfo.fullName = "Bare Object";
    return readCvJson(jsonFile(data)).then((result) => {
      expect(result.personalInfo.fullName).toBe("Bare Object");
    });
  });

  it("rejects invalid JSON", async () => {
    const file = new File(["not json"], "cv.json");
    await expect(readCvJson(file)).rejects.toBeInstanceOf(CvFileError);
  });

  it("rejects valid JSON that isn't a CV (no personalInfo or experience key)", async () => {
    await expect(readCvJson(jsonFile({ hello: "world" }))).rejects.toBeInstanceOf(CvFileError);
  });

  it("rejects a JSON array", async () => {
    await expect(readCvJson(jsonFile([1, 2, 3]))).rejects.toBeInstanceOf(CvFileError);
  });
});
