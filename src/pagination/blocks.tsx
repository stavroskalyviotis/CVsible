import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { hasRichText, sanitizeRichText } from "../utils/richText";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { formatMonth, formatRange } from "./format";
import { sectionTitle } from "./blockMeta";
import type { BlockMeta, BlockSection } from "./blockMeta";
import { inlineSectionText } from "./sectionText";

const SECTION_ICON: Record<BlockSection, IconName> = {
  summary: "star",
  experience: "briefcase",
  education: "book",
  projects: "folder",
  certifications: "award",
  skills: "star",
  softSkills: "award",
  languages: "languages",
  interests: "heart",
};

export function SectionHeading({
  section,
  dictionary,
  showIcon,
  atsSafe,
  continuation = false,
}: {
  section: BlockSection;
  dictionary: Dictionary;
  showIcon: boolean;
  atsSafe: boolean;
  continuation?: boolean;
}) {
  return (
    <h2>
      {showIcon && <Icon name={SECTION_ICON[section]} size={13} />}
      {sectionTitle(section, dictionary, atsSafe)}
      {continuation && <span className="cv-continuation-tag"> ({dictionary.pagination.continued})</span>}
    </h2>
  );
}

function RichBlock({ html, className = "" }: { html: string; className?: string }) {
  if (!hasRichText(html)) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}

export function BlockContent({
  meta,
  data,
  dictionary,
  showIcon,
}: {
  meta: BlockMeta;
  data: CvData;
  dictionary: Dictionary;
  showIcon: boolean;
}) {
  const locale = dictionary.locale;

  if (meta.section === "summary") {
    return <RichBlock html={data.personalInfo.summary} className="cv-summary cv-rich" />;
  }

  if (meta.section === "experience") {
    const item = data.experience.find((entry) => entry.id === meta.itemId);
    if (!item) return null;
    return (
      <article className="cv-entry">
        <div className="cv-entry-head">
          <strong>{item.role}</strong>
          <span>{formatRange(item.startDate, item.endDate, item.current, locale, dictionary.placeholders.present)}</span>
        </div>
        {(item.company || item.location) && (
          <em>{[item.company, item.location].filter(Boolean).join(", ")}</em>
        )}
        <RichBlock html={item.description} className="cv-rich" />
      </article>
    );
  }

  if (meta.section === "education") {
    const item = data.education.find((entry) => entry.id === meta.itemId);
    if (!item) return null;
    return (
      <article className="cv-entry">
        <div className="cv-entry-head">
          <strong>{item.degree}</strong>
          <span>{formatRange(item.startDate, item.endDate, item.current, locale, dictionary.placeholders.present)}</span>
        </div>
        {(item.institution || item.location) && (
          <em>{[item.institution, item.location].filter(Boolean).join(", ")}</em>
        )}
        <RichBlock html={item.description} className="cv-rich" />
      </article>
    );
  }

  if (meta.section === "projects") {
    const item = data.projects.find((entry) => entry.id === meta.itemId);
    if (!item) return null;
    return (
      <article className="cv-entry">
        <strong className="cv-project-title">{item.title}</strong>
        {item.link && (
          <div className="cv-project-link">
            {showIcon && <Icon name="globe" size={11} />}
            <span>{item.link}</span>
          </div>
        )}
        <RichBlock html={item.description} className="cv-rich" />
      </article>
    );
  }

  if (meta.section === "certifications") {
    const item = data.certifications.find((entry) => entry.id === meta.itemId);
    if (!item) return null;
    return (
      <div className="cv-cert-row">
        <strong>{item.title}</strong>
        {(item.issuer || item.date) && (
          <em>{[item.issuer, formatMonth(item.date, locale)].filter(Boolean).join(", ")}</em>
        )}
      </div>
    );
  }

  const text = inlineSectionText(meta.section, data, dictionary);
  if (!text) return null;
  return <p className="cv-inline-list">{text}</p>;
}
