import type { CSSProperties, Ref } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, SidebarSectionType } from "../types";
import { getDensityMetrics } from "../data/density";
import { ContactIcon } from "../components/ContactIcon";
import { Icon } from "../components/Icon";
import { BlockContent, SectionHeading } from "./mainBlocks";
import type { PageBlock } from "./useMainPagination";

function formatDateOfBirth(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function SidebarSection({
  section,
  data,
  dictionary,
}: {
  section: SidebarSectionType;
  data: CvData;
  dictionary: Dictionary;
}) {
  if (section === "skills") {
    if (data.skills.length === 0) return null;
    return (
      <section className="cv-side-section">
        <h2>{dictionary.sections.skills}</h2>
        <ul className="cv-skill-list">
          {data.skills.map((skill) => (
            <li key={skill.id}>
              <span>{skill.name}</span>
              <div className="cv-skill-track">
                <div className="cv-skill-fill" style={{ width: `${skill.level}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (section === "softSkills") {
    if (data.softSkills.length === 0) return null;
    return (
      <section className="cv-side-section">
        <h2>{dictionary.sections.softSkills}</h2>
        <div className="cv-chip-list">
          {data.softSkills.map((item) => (
            <span key={item.id}>{item.name}</span>
          ))}
        </div>
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

  if (data.interests.length === 0) return null;
  return (
    <section className="cv-side-section">
      <h2>{dictionary.sections.interests}</h2>
      <div className="cv-chip-list">
        {data.interests.map((item) => (
          <span key={item.id}>{item.name}</span>
        ))}
      </div>
    </section>
  );
}

export function CvPage({
  page,
  pageIndex,
  data,
  dictionary,
  themeStyle,
  className = "",
  pageRef,
}: {
  page: PageBlock[];
  pageIndex: number;
  data: CvData;
  dictionary: Dictionary;
  themeStyle: CSSProperties;
  className?: string;
  pageRef?: Ref<HTMLDivElement>;
}) {
  const { personalInfo } = data;
  const contacts = personalInfo.contacts.filter((item) => item.value.trim());
  const { sectionGap, entryGap } = getDensityMetrics(data.density);

  return (
    <div
      className={`cv-page ${className}`}
      style={themeStyle}
      lang={dictionary.locale}
      data-cv-page={pageIndex + 1}
      ref={pageRef}
    >
      <aside className="cv-sidebar">
        {pageIndex === 0 && (
          <>
            {data.showPhoto &&
              (data.photo ? (
                <img
                  className="cv-photo"
                  src={data.photo}
                  alt={personalInfo.fullName}
                  style={{ objectPosition: `${data.photoPosition.x}% ${data.photoPosition.y}%` }}
                />
              ) : (
                <div className="cv-photo cv-photo-placeholder">
                  <span>{initials(personalInfo.fullName) || "CV"}</span>
                </div>
              ))}

            <h1 className="cv-name">{personalInfo.fullName || dictionary.placeholders.fullName}</h1>
            {personalInfo.jobTitle && <p className="cv-role">{personalInfo.jobTitle}</p>}

            {(contacts.length > 0 || personalInfo.dateOfBirth) && (
              <section className="cv-side-section">
                <h2>{dictionary.sections.personalInfo}</h2>
                <ul className="cv-contact-list">
                  {personalInfo.dateOfBirth && (
                    <li>
                      <Icon name="calendar" size={13} />
                      <span>{formatDateOfBirth(personalInfo.dateOfBirth)}</span>
                    </li>
                  )}
                  {contacts.map((item) => (
                    <li key={item.id}>
                      <ContactIcon type={item.type} size={13} />
                      <span>
                        {item.type === "custom" && item.label && <strong>{item.label}: </strong>}
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.sidebarOrder.map((section) => (
              <SidebarSection key={section} section={section} data={data} dictionary={dictionary} />
            ))}
          </>
        )}
      </aside>

      <main className="cv-main">
        {page.map((block, index) => {
          const marginTop =
            index === 0 ? 0 : block.meta.isSectionStart || block.needsContinuationHeading ? sectionGap : entryGap;

          if (block.meta.isSectionStart || block.needsContinuationHeading) {
            return (
              <section key={block.meta.key} className="cv-main-section" style={{ marginTop }}>
                <SectionHeading
                  section={block.meta.section}
                  dictionary={dictionary}
                  continuation={block.needsContinuationHeading}
                />
                <BlockContent meta={block.meta} data={data} dictionary={dictionary} />
              </section>
            );
          }

          return (
            <div key={block.meta.key} style={{ marginTop }}>
              <BlockContent meta={block.meta} data={data} dictionary={dictionary} />
            </div>
          );
        })}
      </main>
    </div>
  );
}
