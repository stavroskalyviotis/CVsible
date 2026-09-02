import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import "./LandingPage.css";

const MOCK_CONTENT = {
  el: {
    name: "ΑΝΝΑ ΝΙΚΟΛΑΟΥ",
    role: "Product Designer",
    contacts: ["anna@mail.com", "Αθήνα, Ελλάδα"],
    skills: ["Figma", "Έρευνα χρηστών"],
    sectionTitle: "ΕΜΠΕΙΡΙΑ",
    entryTitle: "Senior Product Designer",
    entryMeta: "Northwind Labs · 2022 — Σήμερα",
    entryDesc: "Redesign της κύριας εφαρμογής, +24% ικανοποίηση χρηστών.",
  },
  en: {
    name: "JANE DOE",
    role: "Product Designer",
    contacts: ["jane@mail.com", "New York, USA"],
    skills: ["Figma", "User research"],
    sectionTitle: "EXPERIENCE",
    entryTitle: "Senior Product Designer",
    entryMeta: "Northwind Labs · 2022 — Present",
    entryDesc: "Redesigned the flagship app, +24% user satisfaction.",
  },
};

export function LandingPage({
  dictionary,
  language,
  onLanguageChange,
  navigate,
  onStart,
  onStartWithCvisor,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  navigate: (route: Exclude<Route, "public-cv">) => void;
  onStart: () => void;
  onStartWithCvisor: () => void;
}) {
  const { landing } = dictionary;
  const mock = MOCK_CONTENT[language];
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  return (
    <div className="landing">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "landing", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={<AuthMenu dictionary={dictionary} onOpenMyCvs={() => navigate("my-cvs")} />}
      />

      <main className="landing-hero">
        <div className="landing-copy">
          <span className="landing-badge">{landing.badge}</span>
          <h1>
            {landing.title} <span className="landing-highlight">{landing.titleHighlight}</span>
          </h1>
          <p className="landing-subtitle">{landing.subtitle}</p>
          <div className="landing-actions">
            <button type="button" className="landing-cta" onClick={onStart}>
              {landing.ctaStart}
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="landing-cta-secondary" onClick={onStartWithCvisor}>
              <Icon name="sparkles" size={16} />
              {dictionary.cvisor.tryButton}
            </button>
          </div>
        </div>

        <div className="landing-visual" aria-hidden="true">
          <div className="mock-resume">
            <div className="mock-sidebar">
              <div className="mock-avatar" />
              {mock.contacts.map((line) => (
                <span className="mock-contact-line" key={line}>
                  {line}
                </span>
              ))}
              <div className="mock-gap" />
              <span className="mock-side-heading">{language === "el" ? "ΔΕΞΙΟΤΗΤΕΣ" : "SKILLS"}</span>
              {mock.skills.map((skill) => (
                <div className="mock-skill" key={skill}>
                  <span>{skill}</span>
                  <div className="mock-skill-track">
                    <div className="mock-skill-fill" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mock-main">
              <strong className="mock-name">{mock.name}</strong>
              <span className="mock-role">{mock.role}</span>
              <div className="mock-divider" />
              <span className="mock-section-title">{mock.sectionTitle}</span>
              <strong className="mock-entry-title">{mock.entryTitle}</strong>
              <em className="mock-entry-meta">{mock.entryMeta}</em>
              <p className="mock-entry-desc">{mock.entryDesc}</p>
            </div>
          </div>
          <div className="landing-visual-badge">
            <strong>PDF</strong>
            <span>ready</span>
          </div>
        </div>
      </main>

      <section className="landing-paths">
        <h2>{landing.howItWorksTitle}</h2>
        <div className="landing-paths-grid">
          <article className="landing-path-card">
            <span className="landing-path-label">{landing.pathManualLabel}</span>
            <ol className="landing-path-steps">
              <li>
                <span className="step-number">1</span>
                <div>
                  <h3>{landing.step1Title}</h3>
                  <p>{landing.step1Body}</p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div>
                  <h3>{landing.step2Title}</h3>
                  <p>{landing.step2Body}</p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div>
                  <h3>{landing.step3Title}</h3>
                  <p>{landing.step3Body}</p>
                </div>
              </li>
            </ol>
            <button type="button" className="landing-cta landing-path-cta" onClick={onStart}>
              {landing.ctaStart}
              <span aria-hidden="true">→</span>
            </button>
          </article>

          <article className="landing-path-card landing-path-card-accent">
            <span className="landing-badge landing-cvisor-badge">{landing.cvisorBadge}</span>
            <p className="landing-path-intro">{landing.cvisorBody}</p>
            <ol className="landing-path-steps">
              <li>
                <span className="step-number">1</span>
                <div>
                  <h3>{landing.cvisorStep1Title}</h3>
                  <p>{landing.cvisorStep1Body}</p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div>
                  <h3>{landing.cvisorStep2Title}</h3>
                  <p>{landing.cvisorStep2Body}</p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div>
                  <h3>{landing.cvisorStep3Title}</h3>
                  <p>{landing.cvisorStep3Body}</p>
                </div>
              </li>
            </ol>
            <button type="button" className="landing-cta-secondary landing-path-cta" onClick={onStartWithCvisor}>
              <Icon name="sparkles" size={16} />
              {dictionary.cvisor.tryButton}
            </button>
          </article>
        </div>
      </section>

      <section className="landing-scan">
        <div className="landing-scan-copy">
          <span className="landing-badge landing-scan-badge">{landing.scanBadge}</span>
          <h2>{landing.scanTitle}</h2>
          <p>{landing.scanBody}</p>
          <button type="button" className="landing-cta" onClick={() => navigate("ats")}>
            <Icon name="shield" size={16} />
            {landing.scanCta}
          </button>
        </div>
        <div className="landing-scan-visual" aria-hidden="true">
          <div className="scan-mock">
            <div className="scan-mock-row">
              <span className="scan-mock-dot pass" />
              <span className="scan-mock-bar w70" />
            </div>
            <div className="scan-mock-row">
              <span className="scan-mock-dot fail" />
              <span className="scan-mock-bar w85" />
            </div>
            <div className="scan-mock-row">
              <span className="scan-mock-dot pass" />
              <span className="scan-mock-bar w60" />
            </div>
            <div className="scan-mock-row">
              <span className="scan-mock-dot warn" />
              <span className="scan-mock-bar w78" />
            </div>
            <div className="scan-mock-row">
              <span className="scan-mock-dot pass" />
              <span className="scan-mock-bar w52" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-features-head">
          <h2>{landing.featuresTitle}</h2>
          <p>{landing.featuresSubtitle}</p>
        </div>
        <div className="landing-features-grid">
          {(showAllFeatures ? landing.features : landing.features.slice(0, 6)).map((feature) => (
            <article key={feature.title}>
              <span className="feature-icon" aria-hidden="true">
                <Icon name={feature.icon as IconName} size={18} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
        {landing.features.length > 6 && (
          <button
            type="button"
            className="landing-features-toggle"
            onClick={() => setShowAllFeatures((value) => !value)}
          >
            {showAllFeatures ? landing.featuresLess : landing.featuresMore}
            <Icon name={showAllFeatures ? "chevron-up" : "chevron-down"} size={15} />
          </button>
        )}
      </section>

      <section className="landing-final-cta">
        <h2>{landing.finalCtaTitle}</h2>
        <p>{landing.finalCtaBody}</p>
        <button type="button" className="landing-cta" onClick={onStart}>
          {landing.ctaStart}
          <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="landing-footer">
        <p>{landing.footerNote}</p>
        <p className="landing-credit">
          {landing.madeBy}{" "}
          <a href="https://www.linkedin.com/in/stavros-kalyviotis/" target="_blank" rel="noopener noreferrer">
            Stavros Kalyviotis
          </a>
        </p>
        <p className="landing-legal-links">
          <button type="button" onClick={() => navigate("privacy")}>
            {dictionary.legal.privacyLink}
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => navigate("terms")}>
            {dictionary.legal.termsLink}
          </button>
        </p>
      </footer>
    </div>
  );
}
