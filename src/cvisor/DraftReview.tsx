import type { ReactNode } from "react";
import type { Dictionary } from "../i18n/translations";
import { Icon } from "../components/Icon";
import type { AgentResult } from "./agent";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="draft-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Entry({
  primary,
  secondary,
  dates,
  bullets,
}: {
  primary: string;
  secondary?: string;
  dates?: string;
  bullets?: string[];
}) {
  return (
    <article className="draft-entry">
      <div className="draft-entry-head">
        <strong>{primary}</strong>
        {dates && <span>{dates}</span>}
      </div>
      {secondary && <em>{secondary}</em>}
      {bullets && bullets.length > 0 && (
        <ul>
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function range(start: string, end: string, current: boolean, present: string): string {
  if (!start && !end && !current) return "";
  const tail = current ? present : end;
  return [start, tail].filter(Boolean).join(" - ");
}

/** Read-only presentation of what the agent produced, plus the audit trail from
 *  the server-side checks. Nothing is applied until the user says so. */
export function DraftReview({
  result,
  dictionary,
  onBack,
  onApply,
}: {
  result: AgentResult;
  dictionary: Dictionary;
  onBack: () => void;
  onApply: () => void;
}) {
  const copy = dictionary.cvisor;
  const { draft, issues } = result;
  const present = dictionary.placeholders.present;
  const remaining = [...issues.fabrication, ...issues.blocking];

  return (
    <>
      <div className="cvisor-body draft-body">
        <div className={`draft-verdict ${result.verified ? "ok" : "warn"}`}>
          <span className="draft-verdict-icon">
            <Icon name={result.verified ? "check" : "alert"} size={15} strokeWidth={2.6} />
          </span>
          <div>
            <strong>{result.verified ? copy.verified : copy.unverified}</strong>
            <p>{result.verified ? copy.verifiedHint : copy.unverifiedHint}</p>
            <span className="draft-rounds">
              {copy.checkedTimes} {result.rounds}
            </span>
          </div>
        </div>

        {draft.notes.length > 0 && (
          <Section title={copy.changesTitle}>
            <ul className="draft-notes">
              {draft.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </Section>
        )}

        {remaining.length > 0 && (
          <Section title={copy.issuesTitle}>
            <ul className="draft-notes draft-notes-warn">
              {remaining.slice(0, 8).map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </Section>
        )}

        {issues.missingKeywords.length > 0 && (
          <Section title={copy.keywordsTitle}>
            <div className="draft-chips">
              {issues.missingKeywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
            <p className="cvisor-hint">{copy.keywordsHint}</p>
          </Section>
        )}

        <div className="draft-preview">
          {draft.jobTitle && (
            <Section title={dictionary.fields.jobTitle}>
              <p className="draft-text">{draft.jobTitle}</p>
            </Section>
          )}

          {draft.summary && (
            <Section title={dictionary.sections.summary}>
              <p className="draft-text">{draft.summary}</p>
            </Section>
          )}

          {draft.experience.length > 0 && (
            <Section title={dictionary.sections.experience}>
              {draft.experience.map((item, index) => (
                <Entry
                  key={index}
                  primary={item.role}
                  secondary={[item.company, item.location].filter(Boolean).join(", ")}
                  dates={range(item.startDate, item.endDate, item.current, present)}
                  bullets={item.bullets}
                />
              ))}
            </Section>
          )}

          {draft.education.length > 0 && (
            <Section title={dictionary.sections.education}>
              {draft.education.map((item, index) => (
                <Entry
                  key={index}
                  primary={item.degree}
                  secondary={[item.institution, item.location].filter(Boolean).join(", ")}
                  dates={range(item.startDate, item.endDate, item.current, present)}
                  bullets={item.bullets}
                />
              ))}
            </Section>
          )}

          {draft.projects.length > 0 && (
            <Section title={dictionary.sections.projects}>
              {draft.projects.map((item, index) => (
                <Entry key={index} primary={item.title} secondary={item.link} bullets={item.bullets} />
              ))}
            </Section>
          )}

          {draft.certifications.length > 0 && (
            <Section title={dictionary.sections.certifications}>
              {draft.certifications.map((item, index) => (
                <Entry
                  key={index}
                  primary={item.title}
                  secondary={[item.issuer, item.date].filter(Boolean).join(", ")}
                />
              ))}
            </Section>
          )}

          {draft.skills.length > 0 && (
            <Section title={dictionary.sections.skills}>
              <p className="draft-text">{draft.skills.map((item) => item.name).join(", ")}</p>
            </Section>
          )}

          {draft.softSkills.length > 0 && (
            <Section title={dictionary.sections.softSkills}>
              <p className="draft-text">{draft.softSkills.join(", ")}</p>
            </Section>
          )}

          {draft.languages.length > 0 && (
            <Section title={dictionary.sections.languages}>
              <p className="draft-text">
                {draft.languages.map((item) => `${item.name} (${item.level})`).join(", ")}
              </p>
            </Section>
          )}

          {draft.interests.length > 0 && (
            <Section title={dictionary.sections.interests}>
              <p className="draft-text">{draft.interests.join(", ")}</p>
            </Section>
          )}
        </div>
      </div>

      <footer className="cvisor-foot">
        <button type="button" className="cvisor-ghost" onClick={onBack}>
          <Icon name="arrow-left" size={14} />
          {copy.back}
        </button>
        <div className="cvisor-foot-right">
          <p className="cvisor-hint">{copy.applyHint}</p>
          <button type="button" className="cvisor-primary" onClick={onApply}>
            <Icon name="check" size={15} strokeWidth={2.6} />
            {copy.apply}
          </button>
        </div>
      </footer>
    </>
  );
}
