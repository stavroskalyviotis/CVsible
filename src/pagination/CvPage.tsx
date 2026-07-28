import type { CSSProperties } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { ContactIcon } from "../components/ContactIcon";
import { BlockContent, SectionHeading } from "./mainBlocks";
import type { PageBlock } from "./useMainPagination";
import { ENTRY_GAP, SECTION_GAP } from "./useMainPagination";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function CvPage({
  page,
  pageIndex,
  data,
  dictionary,
  themeStyle,
  className = "",
}: {
  page: PageBlock[];
  pageIndex: number;
  data: CvData;
  dictionary: Dictionary;
  themeStyle: CSSProperties;
  className?: string;
}) {
  const { personalInfo } = data;
  const contacts = personalInfo.contacts.filter((item) => item.value.trim());

  return (
    <div className={`cv-page ${className}`} style={themeStyle} lang={dictionary.locale} data-cv-page={pageIndex + 1}>
      <aside className="cv-sidebar">
        {pageIndex === 0 && (
          <>
            {data.showPhoto &&
              (data.photo ? (
                <img className="cv-photo" src={data.photo} alt={personalInfo.fullName} />
              ) : (
                <div className="cv-photo cv-photo-placeholder">
                  <span>{initials(personalInfo.fullName) || "CV"}</span>
                </div>
              ))}

            <h1 className="cv-name">{personalInfo.fullName || dictionary.placeholders.fullName}</h1>
            {personalInfo.jobTitle && <p className="cv-role">{personalInfo.jobTitle}</p>}

            {contacts.length > 0 && (
              <section className="cv-side-section">
                <h2>{dictionary.sections.personalInfo}</h2>
                <ul className="cv-contact-list">
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

            {data.skills.length > 0 && (
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
            )}

            {data.languages.length > 0 && (
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
            )}
          </>
        )}
      </aside>

      <main className="cv-main">
        {page.map((block, index) => {
          const marginTop =
            index === 0 ? 0 : block.meta.isSectionStart || block.needsContinuationHeading ? SECTION_GAP : ENTRY_GAP;

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
