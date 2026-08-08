import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import { Icon } from "../components/Icon";
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
  onStart,
  onStartWithCvisor,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  onStart: () => void;
  onStartWithCvisor: () => void;
}) {
  const { landing } = dictionary;
  const mock = MOCK_CONTENT[language];

  return (
    <div className="landing">
      <header className="landing-topbar">
        <span className="landing-brand">
          <span className="landing-brand-mark" aria-hidden="true">
            CV
          </span>
          CVsible
        </span>
        <div className="landing-lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={language === "el" ? "active" : ""}
            onClick={() => onLanguageChange("el")}
          >
            EL
          </button>
          <button
            type="button"
            className={language === "en" ? "active" : ""}
            onClick={() => onLanguageChange("en")}
          >
            EN
          </button>
        </div>
      </header>

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

      <section className="landing-features">
        <article>
          <span className="feature-icon" aria-hidden="true">
            ⚡
          </span>
          <h3>{landing.feature1Title}</h3>
          <p>{landing.feature1Body}</p>
        </article>
        <article>
          <span className="feature-icon" aria-hidden="true">
            🎨
          </span>
          <h3>{landing.feature2Title}</h3>
          <p>{landing.feature2Body}</p>
        </article>
        <article>
          <span className="feature-icon" aria-hidden="true">
            ⬇
          </span>
          <h3>{landing.feature3Title}</h3>
          <p>{landing.feature3Body}</p>
        </article>
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
      </footer>
    </div>
  );
}
