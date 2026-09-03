import type { Dictionary } from "../i18n/translations";
import type { CvData, SectionKey } from "../types";
import { getTemplate, mainFlowSections, sidebarFlowSections, templateShowsPhoto } from "../templates/registry";
import { formatMonth, formatRange } from "../pagination/format";
import { inlineSectionText } from "../pagination/sectionText";
import { sectionTitle } from "../pagination/blockMeta";
import { buildPdfFilename } from "../utils/exportPdf";
import { plainText } from "../utils/richText";
import { FONT_STACKS } from "../data/fontStacks";
import { upperCaseForDisplay } from "../utils/text";
import type { ExtractedResume } from "./extractResume";

function richTextLines(html: string): string[] {
  const template = document.createElement("template");
  template.innerHTML = html;

  const items = Array.from(template.content.querySelectorAll("li"))
    .map((item) => (item.textContent ?? "").trim())
    .filter(Boolean);
  // Bullets are drawn as real "•" glyphs in the PDF, so mirror them here.
  if (items.length > 0) return items.map((item) => `• ${item}`);

  const text = plainText(html);
  return text ? text.split(/\n+/).map((line) => line.trim()).filter(Boolean) : [];
}

function sectionLines(section: SectionKey, data: CvData, dictionary: Dictionary): string[] {
  const locale = dictionary.locale;
  const lines: string[] = [];

  if (section === "experience") {
    data.experience.forEach((item) => {
      const range = formatRange(item.startDate, item.endDate, item.current, locale, dictionary.placeholders.present);
      lines.push([item.role, range].filter(Boolean).join(" "));
      const meta = [item.company, item.location].filter(Boolean).join(", ");
      if (meta) lines.push(meta);
      lines.push(...richTextLines(item.description));
    });
    return lines;
  }

  if (section === "education") {
    data.education.forEach((item) => {
      const range = formatRange(item.startDate, item.endDate, item.current, locale, dictionary.placeholders.present);
      lines.push([item.degree, range].filter(Boolean).join(" "));
      const meta = [item.institution, item.location].filter(Boolean).join(", ");
      if (meta) lines.push(meta);
      lines.push(...richTextLines(item.description));
    });
    return lines;
  }

  if (section === "projects") {
    data.projects.forEach((item) => {
      lines.push(item.title);
      if (item.link) lines.push(item.link);
      lines.push(...richTextLines(item.description));
    });
    return lines;
  }

  if (section === "certifications") {
    data.certifications.forEach((item) => {
      lines.push(item.title);
      const meta = [item.issuer, formatMonth(item.date, locale)].filter(Boolean).join(", ");
      if (meta) lines.push(meta);
    });
    return lines;
  }

  const inline = inlineSectionText(section, data, dictionary);
  if (inline) lines.push(inline);
  return lines;
}

function hasContent(section: SectionKey, data: CvData): boolean {
  return data[section].length > 0;
}

/** Renders the CV being edited into the same shape as an uploaded document, so
 *  a single analyser judges both. The line order mirrors what the exported PDF
 *  writes, which is what a parser will actually read. */
export function cvToExtractedResume(
  data: CvData,
  dictionary: Dictionary,
  pageCount: number,
): ExtractedResume {
  const template = getTemplate(data.template);
  const lines: string[] = [];

  const name = data.personalInfo.fullName.trim();
  if (name) lines.push(template.uppercaseName ? upperCaseForDisplay(name) : name);
  if (data.personalInfo.jobTitle.trim()) lines.push(data.personalInfo.jobTitle.trim());

  const contactParts = [
    data.personalInfo.dateOfBirth,
    ...data.personalInfo.contacts.filter((item) => item.value.trim()).map((item) => item.value.trim()),
  ].filter(Boolean);

  if (template.layout === "single") {
    if (contactParts.length > 0) lines.push(contactParts.join(" | "));
  } else {
    lines.push(dictionary.sections.personalInfo);
    lines.push(...contactParts);
  }

  const emit = (section: SectionKey) => {
    if (!hasContent(section, data)) return;
    const body = sectionLines(section, data, dictionary);
    if (body.length === 0) return;
    lines.push(sectionTitle(section, dictionary, template.atsSafe));
    lines.push(...body);
  };

  // The sidebar template prints its sidebar first, exactly as the PDF does.
  sidebarFlowSections(data.template, data.sectionOrder).forEach(emit);

  const summary = plainText(data.personalInfo.summary);
  if (summary) {
    lines.push(sectionTitle("summary", dictionary, template.atsSafe));
    lines.push(...richTextLines(data.personalInfo.summary));
  }

  mainFlowSections(data.template, data.sectionOrder).forEach(emit);

  const text = lines.join("\n");

  return {
    kind: "builder",
    fileName: buildPdfFilename(name, data.personalInfo.jobTitle),
    fileSize: 0,
    pageCount: Math.max(1, pageCount),
    text,
    lines,
    pageTexts: [text],
    hasTextLayer: text.replace(/\s/g, "").length >= 50,
    // A sidebar template puts two text columns on every page it renders.
    multiColumnPages: template.layout === "sidebar" ? Math.max(1, pageCount) : 0,
    imageCount: templateShowsPhoto(data.template, data.showPhoto) && data.photo ? 1 : 0,
    linkUrls: [],
    fonts: [FONT_STACKS[data.fontFamily].split(",")[0].replace(/"/g, "").trim()],
    title: name ? `${name} — CV` : "CV",
    author: name,
    producer: "CVsible",
  };
}
