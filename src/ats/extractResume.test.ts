import { zipSync, strToU8 } from "fflate";
import { describe, it, expect } from "vitest";
import { extractResume } from "./extractResume";

function docxFile(documentXml: string): File {
  const zipped = zipSync({ "word/document.xml": strToU8(documentXml) });
  return new File([zipped], "resume.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

describe("extractResume — docx", () => {
  it("decodes XML entities left over from stripping tags", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>R&amp;D Engineer &lt;Senior&gt; &quot;Team Lead&quot;</w:t></w:r></w:p></w:body></w:document>`;
    const resume = await extractResume(docxFile(xml));
    expect(resume.text).toBe('R&D Engineer <Senior> "Team Lead"');
  });

  it("does not leave a literal double-escaped ampersand", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>Sales &amp;amp; Marketing</w:t></w:r></w:p></w:body></w:document>`;
    const resume = await extractResume(docxFile(xml));
    expect(resume.text).toBe("Sales &amp; Marketing");
  });
});
