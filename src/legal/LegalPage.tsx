import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import type { LegalDoc } from "./legalContent";
import "./LegalPage.css";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LegalPage({
  dictionary,
  language,
  onLanguageChange,
  navigate,
  doc,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  navigate: (route: Exclude<Route, "public-cv">) => void;
  doc: LegalDoc;
}) {
  const [activeSlug, setActiveSlug] = useState(() => slugify(doc.sections[0]?.heading ?? ""));

  const jumpTo = (slug: string) => {
    setActiveSlug(slug);
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="legal-page">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "landing", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={<AuthMenu dictionary={dictionary} onOpenMyCvs={() => navigate("my-cvs")} />}
      />

      <div className="legal-shell">
        <aside className="legal-toc">
          <button type="button" className="legal-back" onClick={() => navigate("landing")}>
            <Icon name="arrow-left" size={14} />
            {dictionary.legal.backHome}
          </button>
          <nav aria-label={doc.title}>
            {doc.sections.map((section, index) => {
              const slug = slugify(section.heading);
              return (
                <button
                  key={slug}
                  type="button"
                  className={slug === activeSlug ? "active" : ""}
                  onClick={() => jumpTo(slug)}
                >
                  <span className="legal-toc-number">{String(index + 1).padStart(2, "0")}</span>
                  {section.heading}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="legal-main">
          <div className="legal-doc-head">
            <h1>{doc.title}</h1>
            <p className="legal-updated">{doc.updated}</p>
            <p className="legal-disclaimer">{dictionary.legal.disclaimer}</p>
          </div>

          {doc.sections.map((section, index) => {
            const slug = slugify(section.heading);
            return (
              <section key={slug} id={slug}>
                <h2>
                  <span className="legal-section-number">{String(index + 1).padStart(2, "0")}</span>
                  {section.heading}
                </h2>
                {section.body.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
