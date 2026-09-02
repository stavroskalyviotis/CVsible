import type { CSSProperties, ReactNode, Ref } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, SectionKey } from "../types";
import { ContactIcon } from "../components/ContactIcon";
import { Icon } from "../components/Icon";
import { upperCaseForDisplay } from "../utils/text";
import { contactHref, formatDateOfBirth } from "./contactLinks";
import { getTemplate, sidebarFlowSections, templateShowsPhoto } from "../templates/registry";
import { BlockContent, SectionHeading } from "./blocks";
import { inlineSectionText, skillText } from "./sectionText";
import type { PageBlock } from "./usePagination";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function CvPhoto({ data, alt }: { data: CvData; alt: string }) {
  if (data.photo) {
    return (
      <img
        className="cv-photo"
        src={data.photo}
        alt={alt}
        style={{ objectPosition: `${data.photoPosition.x}% ${data.photoPosition.y}%` }}
      />
    );
  }
  return (
    <div className="cv-photo cv-photo-placeholder">
      <span>{initials(alt) || "CV"}</span>
    </div>
  );
}

function SidebarSection({
  section,
  data,
  dictionary,
}: {
  section: SectionKey;
  data: CvData;
  dictionary: Dictionary;
}) {
  if (section === "skills") {
    if (data.skills.length === 0) return null;
    return (
      <section className="cv-side-section">
        <h2>{dictionary.sections.skills}</h2>
        <ul className="cv-skill-list">
          {data.skills.map((item) => (
            <li key={item.id}>{skillText(item.name, item.level, data.skillDisplay, dictionary)}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (section === "languages") {
    if (data.languages.length === 0) return null;
    return (
      <section className="cv-side-section">
        <h2>{dictionary.sections.languages}</h2>
        <ul className="cv-lang-list">
          {data.languages.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              {item.level && <em>{item.level}</em>}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (section !== "softSkills" && section !== "interests") return null;
  const items = section === "softSkills" ? data.softSkills : data.interests;
  if (items.length === 0) return null;
  return (
    <section className="cv-side-section">
      <h2>{dictionary.sections[section]}</h2>
      <p className="cv-side-inline">{inlineSectionText(section, data, dictionary)}</p>
    </section>
  );
}

function ContactList({ data, variant }: { data: CvData; variant: "stacked" | "inline" }) {
  const { personalInfo } = data;
  const contacts = personalInfo.contacts.filter((item) => item.value.trim());
  if (contacts.length === 0 && !personalInfo.dateOfBirth) return null;

  const withIcons = variant === "stacked";
  const entries: { key: string; icon: ReactNode; href: string | null; body: ReactNode }[] = [];

  if (personalInfo.dateOfBirth) {
    entries.push({
      key: "dob",
      icon: withIcons ? <Icon name="calendar" size={13} /> : null,
      href: null,
      body: formatDateOfBirth(personalInfo.dateOfBirth),
    });
  }

  contacts.forEach((item) => {
    entries.push({
      key: item.id,
      icon: withIcons ? <ContactIcon type={item.type} size={13} /> : null,
      href: contactHref(item),
      body: (
        <>
          {item.type === "custom" && item.label && <strong>{item.label}: </strong>}
          {item.value}
        </>
      ),
    });
  });

  return (
    <ul className={`cv-contact-list ${variant === "inline" ? "cv-contact-inline" : ""}`}>
      {entries.map((entry, index) => (
        <li key={entry.key}>
          {/* A real text node, not a ::before rule — generated content never
              reaches the PDF or a parser. */}
          {variant === "inline" && index > 0 && <span className="cv-contact-sep">{" | "}</span>}
          {entry.icon}
          {entry.href ? (
            <a href={entry.href} rel="noreferrer">
              {entry.body}
            </a>
          ) : (
            <span>{entry.body}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Name, title and contacts as the first thing in the reading order — this is
 *  what every resume parser looks for at the top of the document. */
export function CvHeader({
  data,
  dictionary,
  headerRef,
}: {
  data: CvData;
  dictionary: Dictionary;
  headerRef?: Ref<HTMLDivElement>;
}) {
  const { personalInfo } = data;
  const template = getTemplate(data.template);
  const showPhoto = templateShowsPhoto(data.template, data.showPhoto);
  const name = personalInfo.fullName || dictionary.placeholders.fullName;

  return (
    <header className="cv-header" ref={headerRef}>
      <div className="cv-header-text">
        <h1 className="cv-name">{template.uppercaseName ? upperCaseForDisplay(name) : name}</h1>
        {personalInfo.jobTitle && <p className="cv-role">{personalInfo.jobTitle}</p>}
        <ContactList data={data} variant="inline" />
      </div>
      {showPhoto && <CvPhoto data={data} alt={personalInfo.fullName} />}
    </header>
  );
}

function BlockList({
  page,
  data,
  dictionary,
  showIcons,
  atsSafe,
  sectionGap,
  entryGap,
  leadingGap,
}: {
  page: PageBlock[];
  data: CvData;
  dictionary: Dictionary;
  showIcons: boolean;
  atsSafe: boolean;
  sectionGap: number;
  entryGap: number;
  leadingGap: number;
}): ReactNode {
  return page.map((block, index) => {
    const marginTop =
      index === 0 ? leadingGap : block.meta.isSectionStart || block.needsContinuationHeading ? sectionGap : entryGap;

    if (block.meta.isSectionStart || block.needsContinuationHeading) {
      return (
        <section key={block.meta.key} className="cv-main-section" style={{ marginTop }}>
          <SectionHeading
            section={block.meta.section}
            dictionary={dictionary}
            showIcon={showIcons}
            atsSafe={atsSafe}
            continuation={block.needsContinuationHeading}
          />
          <BlockContent meta={block.meta} data={data} dictionary={dictionary} showIcon={showIcons} />
        </section>
      );
    }

    return (
      <div key={block.meta.key} style={{ marginTop }}>
        <BlockContent meta={block.meta} data={data} dictionary={dictionary} showIcon={showIcons} />
      </div>
    );
  });
}

export function CvPage({
  page,
  pageIndex,
  data,
  dictionary,
  themeStyle,
  sectionGap,
  entryGap,
  className = "",
  pageRef,
}: {
  page: PageBlock[];
  pageIndex: number;
  data: CvData;
  dictionary: Dictionary;
  themeStyle: CSSProperties;
  sectionGap: number;
  entryGap: number;
  className?: string;
  pageRef?: Ref<HTMLDivElement>;
}) {
  const template = getTemplate(data.template);
  const showIcons = template.layout === "sidebar";
  const isFirstPage = pageIndex === 0;

  const blocks = (
    <BlockList
      page={page}
      data={data}
      dictionary={dictionary}
      showIcons={showIcons}
      atsSafe={template.atsSafe}
      sectionGap={sectionGap}
      entryGap={entryGap}
      leadingGap={template.layout === "single" && isFirstPage ? sectionGap : 0}
    />
  );

  return (
    <div
      className={`cv-page cv-tpl-${template.id} ${className}`}
      style={themeStyle}
      lang={dictionary.locale}
      data-cv-page={pageIndex + 1}
      ref={pageRef}
    >
      {template.layout === "sidebar" ? (
        <>
          <aside className="cv-sidebar">
            {isFirstPage && (
              <>
                {templateShowsPhoto(data.template, data.showPhoto) && (
                  <CvPhoto data={data} alt={data.personalInfo.fullName} />
                )}
                <h1 className="cv-name">{data.personalInfo.fullName || dictionary.placeholders.fullName}</h1>
                {data.personalInfo.jobTitle && <p className="cv-role">{data.personalInfo.jobTitle}</p>}

                {(data.personalInfo.contacts.some((item) => item.value.trim()) ||
                  data.personalInfo.dateOfBirth) && (
                  <section className="cv-side-section">
                    <h2>{dictionary.sections.personalInfo}</h2>
                    <ContactList data={data} variant="stacked" />
                  </section>
                )}

                {sidebarFlowSections(data.template, data.sectionOrder).map((section) => (
                  <SidebarSection key={section} section={section} data={data} dictionary={dictionary} />
                ))}
              </>
            )}
          </aside>
          <main className="cv-main">{blocks}</main>
        </>
      ) : (
        <main className="cv-main">
          {isFirstPage && <CvHeader data={data} dictionary={dictionary} />}
          {blocks}
        </main>
      )}
    </div>
  );
}
