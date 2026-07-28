import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { hasRichText, sanitizeRichText } from "../utils/richText";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { formatMonth, formatRange } from "./format";

export type MainSectionType = "summary" | "experience" | "education" | "projects" | "certifications";

export interface MainBlockMeta {
  key: string;
  section: MainSectionType;
  itemId: string | null;
  isSectionStart: boolean;
}

const SECTION_ICON: Record<MainSectionType, IconName> = {
  summary: "star",
  experience: "briefcase",
  education: "book",
  projects: "folder",
  certifications: "award",
};

export function buildMainBlockMetas(data: CvData): MainBlockMeta[] {
  const metas: MainBlockMeta[] = [];

  if (hasRichText(data.personalInfo.summary)) {
    metas.push({ key: "summary", section: "summary", itemId: null, isSectionStart: true });
  }

  data.experience.forEach((item, index) => {
    metas.push({ key: `experience-${item.id}`, section: "experience", itemId: item.id, isSectionStart: index === 0 });
  });

  data.education.forEach((item, index) => {
    metas.push({ key: `education-${item.id}`, section: "education", itemId: item.id, isSectionStart: index === 0 });
  });

  data.projects.forEach((item, index) => {
    metas.push({ key: `projects-${item.id}`, section: "projects", itemId: item.id, isSectionStart: index === 0 });
  });

  data.certifications.forEach((item, index) => {
    metas.push({
      key: `certifications-${item.id}`,
      section: "certifications",
      itemId: item.id,
      isSectionStart: index === 0,
    });
  });

  return metas;
}

export function sectionTitle(section: MainSectionType, dictionary: Dictionary): string {
  return dictionary.sections[section];
}

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
        <div className="cv-entry-head">
          <strong>{item.title}</strong>
          {item.link && <span>{item.link}</span>}
        </div>
        <RichBlock html={item.description} className="cv-rich" />
      </article>
    );
  }

  const item = data.certifications.find((entry) => entry.id === meta.itemId);
  if (!item) return null;
  return (
    <div className="cv-cert-row">
      <strong>{item.title}</strong>
      <span>{[item.issuer, formatMonth(item.date, locale)].filter(Boolean).join(" · ")}</span>
    </div>
  );
}
