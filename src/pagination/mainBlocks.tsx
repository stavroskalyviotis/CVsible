import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { hasRichText, sanitizeRichText } from "../utils/richText";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { formatMonth, formatRange } from "./format";
import { sectionTitle } from "./blockMeta";
import type { MainBlockMeta, MainSectionType } from "./blockMeta";

const SECTION_ICON: Record<MainSectionType, IconName> = {
  summary: "star",
  experience: "briefcase",
  education: "book",
  projects: "folder",
  certifications: "award",
};

export function SectionHeading({
  section,
  dictionary,
  continuation = false,
}: {
  section: MainSectionType;
  dictionary: Dictionary;
  continuation?: boolean;
}) {
  return (
    <h2>
      <Icon name={SECTION_ICON[section]} size={13} />
      {sectionTitle(section, dictionary)}
      {continuation && <span className="cv-continuation-tag"> ({dictionary.pagination.page.toLowerCase()})</span>}
    </h2>
  );
}

function RichBlock({ html, className = "" }: { html: string; className?: string }) {
  if (!hasRichText(html)) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}

export function BlockContent({ meta, data, dictionary }: { meta: MainBlockMeta; data: CvData; dictionary: Dictionary }) {
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
        {(item.company || item.location) && <em>{[item.company, item.location].filter(Boolean).join(" · ")}</em>}
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
          <em>{[item.institution, item.location].filter(Boolean).join(" · ")}</em>
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
            <Icon name="globe" size={11} />
            <span>{item.link}</span>
          </div>
        )}
        <RichBlock html={item.description} className="cv-rich" />
      </article>
    );
  }

  const item = data.certifications.find((entry) => entry.id === meta.itemId);
  if (!item) return null;
  return (
    <div className="cv-cert-row">
      <strong>{item.title}</strong>
      {(item.issuer || item.date) && (
        <em>{[item.issuer, formatMonth(item.date, locale)].filter(Boolean).join(" · ")}</em>
      )}
    </div>
  );
}
