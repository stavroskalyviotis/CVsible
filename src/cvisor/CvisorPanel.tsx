import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import { Icon } from "../components/Icon";
import { TextAreaField } from "../components/ui/FormField";
import { THEME_PRESETS } from "../data/themeColors";
import { generateCv } from "./api";
import type { CvisorApplyResult, CvisorFillResult } from "./api";
import { mapCvisorErrorMessage } from "./errors";
import { QuickEntryList } from "./QuickEntryList";
import "./CvisorPanel.css";

type Step = "jobAd" | "facts" | "suggestions";
type ApiStatus = "idle" | "loading" | "error";

interface QuickExperience {
  [key: string]: string;
  role: string;
  company: string;
  note: string;
}

interface QuickEducation {
  [key: string]: string;
  degree: string;
  institution: string;
  note: string;
}

interface QuickCertification {
  [key: string]: string;
  title: string;
  issuer: string;
}

interface QuickProject {
  [key: string]: string;
  title: string;
  note: string;
}

const EMPTY_EXPERIENCE: QuickExperience = { role: "", company: "", note: "" };
const EMPTY_EDUCATION: QuickEducation = { degree: "", institution: "", note: "" };
const EMPTY_CERTIFICATION: QuickCertification = { title: "", issuer: "" };
const EMPTY_PROJECT: QuickProject = { title: "", note: "" };

function hasContent(item: Record<string, string>): boolean {
  return Object.values(item).some((value) => value.trim().length > 0);
}

function buildBackgroundText(
  dictionary: Dictionary,
  parts: {
    experience: QuickExperience[];
    education: QuickEducation[];
    skills: string;
    languages: string;
    certifications: QuickCertification[];
    projects: QuickProject[];
    extraNotes: string;
  },
): string {
  const blocks: string[] = [];
  const { sections } = dictionary;

  const experience = parts.experience.filter(hasContent);
  if (experience.length > 0) {
    blocks.push(
      `${sections.experience}:\n` +
        experience
          .map((item) => `- ${[item.role, item.company].filter(Boolean).join(" @ ")}${item.note ? `: ${item.note}` : ""}`)
          .join("\n"),
    );
  }

  const education = parts.education.filter(hasContent);
  if (education.length > 0) {
    blocks.push(
      `${sections.education}:\n` +
        education
          .map((item) => `- ${[item.degree, item.institution].filter(Boolean).join(", ")}${item.note ? `: ${item.note}` : ""}`)
          .join("\n"),
    );
  }

  if (parts.skills.trim()) {
    blocks.push(`${sections.skills}: ${parts.skills.trim()}`);
  }

  if (parts.languages.trim()) {
    blocks.push(`${sections.languages}: ${parts.languages.trim()}`);
  }

  const certifications = parts.certifications.filter(hasContent);
  if (certifications.length > 0) {
    blocks.push(
      `${sections.certifications}:\n` +
        certifications.map((item) => `- ${[item.title, item.issuer].filter(Boolean).join(", ")}`).join("\n"),
    );
  }

  const projects = parts.projects.filter(hasContent);
  if (projects.length > 0) {
    blocks.push(
      `${sections.projects}:\n` +
        projects.map((item) => `- ${item.title}${item.note ? `: ${item.note}` : ""}`).join("\n"),
    );
  }

  if (parts.extraNotes.trim()) {
    blocks.push(parts.extraNotes.trim());
  }

  return blocks.join("\n\n");
}

function toggleIn<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/** Keeps already-selected suggestions in place and appends fresh ones from a regenerate. */
function mergeSuggestions(previous: string[], fresh: string[], selected: Set<string>): string[] {
  const kept = previous.filter((name) => selected.has(name));
  const merged = [...kept];
  for (const name of fresh) {
    if (!merged.includes(name)) merged.push(name);
  }
  return merged;
}

function allIndexesSelected(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function bulletsToDescription(bullets: string[], selected: Set<number>): string {
  const chosen = bullets.filter((_, index) => selected.has(index));
  if (chosen.length === 0) return "";
  return `<ul>${chosen.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`;
}

function ChipSection({
  title,
  names,
  selected,
  onToggle,
}: {
  title: string;
  names: string[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  if (names.length === 0) return null;
  return (
    <div className="cvisor-chip-section">
      <span className="cvisor-chip-heading">{title}</span>
      <div className="cvisor-chip-row">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            className={`cvisor-chip ${selected.has(name) ? "cvisor-chip-active" : ""}`}
            onClick={() => onToggle(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function BulletItemCard({
  heading,
  bullets,
  selected,
  onToggleBullet,
}: {
  heading: string;
  bullets: string[];
  selected: Set<number>;
  onToggleBullet: (index: number) => void;
}) {
  return (
    <div className="cvisor-item-card">
      <strong className="cvisor-item-card-heading">{heading}</strong>
      {bullets.length > 0 && (
        <ul className="cvisor-bullet-list">
          {bullets.map((bullet, index) => (
            <li key={index} className={selected.has(index) ? "" : "cvisor-bullet-off"}>
              <label>
                <input type="checkbox" checked={selected.has(index)} onChange={() => onToggleBullet(index)} />
                <span>{bullet}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CvisorPanel({
  open,
  onClose,
  dictionary,
  language,
  jobAd,
  onJobAdChange,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  dictionary: Dictionary;
  language: LanguageCode;
  jobAd: string;
  onJobAdChange: (value: string) => void;
  onApply: (result: CvisorApplyResult) => void;
}) {
  const [step, setStep] = useState<Step>("jobAd");
  const [experienceRows, setExperienceRows] = useState<QuickExperience[]>([EMPTY_EXPERIENCE]);
  const [educationRows, setEducationRows] = useState<QuickEducation[]>([EMPTY_EDUCATION]);
  const [certificationRows, setCertificationRows] = useState<QuickCertification[]>([]);
  const [projectRows, setProjectRows] = useState<QuickProject[]>([]);
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const [apiStatus, setApiStatus] = useState<ApiStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CvisorFillResult | null>(null);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [softSkillSuggestions, setSoftSkillSuggestions] = useState<string[]>([]);
  const [interestSuggestions, setInterestSuggestions] = useState<string[]>([]);
  const [seenJobTitles, setSeenJobTitles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<Set<string>>(new Set());
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [keptOwnSkills, setKeptOwnSkills] = useState<Set<string>>(new Set());
  const [applyColor, setApplyColor] = useState(true);
  const [applyJobTitle, setApplyJobTitle] = useState(false);
  const [keepSummary, setKeepSummary] = useState(false);
  const [lockedJobTitle, setLockedJobTitle] = useState<string | null>(null);
  const [lockedThemeColor, setLockedThemeColor] = useState<string | null>(null);
  const [lockedSummary, setLockedSummary] = useState<string | null>(null);

  const [experienceBulletSelection, setExperienceBulletSelection] = useState<Set<number>[]>([]);
  const [educationBulletSelection, setEducationBulletSelection] = useState<Set<number>[]>([]);
  const [projectBulletSelection, setProjectBulletSelection] = useState<Set<number>[]>([]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasAnyBackground =
    experienceRows.some(hasContent) ||
    educationRows.some(hasContent) ||
    certificationRows.some(hasContent) ||
    projectRows.some(hasContent) ||
    skills.trim().length > 0 ||
    languages.trim().length > 0 ||
    extraNotes.trim().length > 0;

  const runGenerate = async () => {
    setApiStatus("loading");
    setErrorMessage(null);
    try {
      const background = buildBackgroundText(dictionary, {
        experience: experienceRows,
        education: educationRows,
        skills,
        languages,
        certifications: certificationRows,
        projects: projectRows,
        extraNotes,
      });
      const data = await generateCv({
        jobAd,
        background,
        language,
        previousSuggestions: {
          skills: skillSuggestions,
          softSkills: softSkillSuggestions,
          interests: interestSuggestions,
          jobTitles: seenJobTitles,
        },
      });
      setResult(data);
      setSkillSuggestions((prev) => mergeSuggestions(prev, data.suggestedSkills.map((s) => s.name), selectedSkills));
      setSoftSkillSuggestions((prev) =>
        mergeSuggestions(prev, data.suggestedSoftSkills.map((s) => s.name), selectedSoftSkills),
      );
      setInterestSuggestions((prev) =>
        mergeSuggestions(prev, data.suggestedInterests.map((s) => s.name), selectedInterests),
      );
      setKeptOwnSkills(new Set(data.skills.map((s) => s.name)));
      setExperienceBulletSelection(data.experience.map((item) => allIndexesSelected(item.bullets.length)));
      setEducationBulletSelection(data.education.map((item) => allIndexesSelected(item.bullets.length)));
      setProjectBulletSelection(data.projects.map((item) => allIndexesSelected(item.bullets.length)));
      if (data.suggestedJobTitle) {
        setSeenJobTitles((prev) => (prev.includes(data.suggestedJobTitle) ? prev : [...prev, data.suggestedJobTitle]));
      }
      if (!hasGeneratedOnce) {
        setApplyColor(true);
        setApplyJobTitle(false);
        setKeepSummary(false);
        setHasGeneratedOnce(true);
      }
      setStep("suggestions");
      setApiStatus("idle");
    } catch (error) {
      setErrorMessage(mapCvisorErrorMessage(error, dictionary));
      setApiStatus("error");
    }
  };

  const resetAndClose = () => {
    setStep("jobAd");
    setResult(null);
    setHasGeneratedOnce(false);
    setSkillSuggestions([]);
    setSoftSkillSuggestions([]);
    setInterestSuggestions([]);
    setSeenJobTitles([]);
    setSelectedSkills(new Set());
    setSelectedSoftSkills(new Set());
    setSelectedInterests(new Set());
    setKeptOwnSkills(new Set());
    setLockedJobTitle(null);
    setLockedThemeColor(null);
    setLockedSummary(null);
    setKeepSummary(false);
    setExperienceBulletSelection([]);
    setEducationBulletSelection([]);
    setProjectBulletSelection([]);
    onClose();
  };

  const handleApply = () => {
    if (!result) return;

    const mergedSkills = [
      ...result.skills.filter((skill) => keptOwnSkills.has(skill.name)).map((skill) => ({ name: skill.name, level: skill.level })),
      ...skillSuggestions.filter((name) => selectedSkills.has(name)).map((name) => ({ name, level: 60 })),
    ];
    const mergedSoftSkills = [
      ...result.softSkills,
      ...softSkillSuggestions.filter((name) => selectedSoftSkills.has(name)).map((name) => ({ name })),
    ];
    const mergedInterests = [
      ...result.interests,
      ...interestSuggestions.filter((name) => selectedInterests.has(name)).map((name) => ({ name })),
    ];
    const chosenJobTitle = lockedJobTitle ?? result.suggestedJobTitle;
    const chosenThemeId = lockedThemeColor ?? result.themeColor;
    const themeHex = THEME_PRESETS.find((preset) => preset.id === chosenThemeId)?.color;
    const chosenSummary = lockedSummary ?? result.summary;

    onApply({
      summary: chosenSummary,
      jobTitle: applyJobTitle && chosenJobTitle ? chosenJobTitle : undefined,
      experience: result.experience.map((item, index) => ({
        role: item.role,
        company: item.company,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
        description: bulletsToDescription(item.bullets, experienceBulletSelection[index] ?? new Set()),
      })),
      education: result.education.map((item, index) => ({
        degree: item.degree,
        institution: item.institution,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
        description: bulletsToDescription(item.bullets, educationBulletSelection[index] ?? new Set()),
      })),
      skills: mergedSkills,
      softSkills: mergedSoftSkills,
      languages: result.languages,
      interests: mergedInterests,
      certifications: result.certifications,
      projects: result.projects.map((item, index) => ({
        title: item.title,
        link: item.link,
        description: bulletsToDescription(item.bullets, projectBulletSelection[index] ?? new Set()),
      })),
      themeColor: applyColor ? themeHex : undefined,
    });

    resetAndClose();
  };

  const c = dictionary.cvisor;
  const { placeholders, actions, sections } = dictionary;

  const displayedJobTitle = result ? (lockedJobTitle ?? result.suggestedJobTitle) : "";
  const displayedThemeId = result ? (lockedThemeColor ?? result.themeColor) : undefined;
  const displayedSummary = result ? (lockedSummary ?? result.summary) : "";
  const themeHexPreview = THEME_PRESETS.find((preset) => preset.id === displayedThemeId)?.color;

  const showExperienceTips = !experienceRows.some(hasContent) && (result?.experienceTips.length ?? 0) > 0;
  const showEducationTips = !educationRows.some(hasContent) && (result?.educationTips.length ?? 0) > 0;

  return createPortal(
    <div
      className="cvisor-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) resetAndClose();
      }}
    >
      <div className="cvisor-modal" role="dialog" aria-modal="true" aria-label={c.modalTitle}>
        <header className="cvisor-modal-header">
          <span className="cvisor-modal-title">
            <Icon name="sparkles" size={18} />
            {c.modalTitle}
          </span>
          <button type="button" className="cvisor-modal-close" onClick={resetAndClose} aria-label={c.close}>
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className="cvisor-stepper">
          {(["jobAd", "facts", "suggestions"] as Step[]).map((s, index) => {
            const order: Step[] = ["jobAd", "facts", "suggestions"];
            const stateClass =
              step === s ? "cvisor-step-active" : index < order.indexOf(step) ? "cvisor-step-done" : "cvisor-step-pending";
            const label = s === "jobAd" ? c.stepJobAdTitle : s === "facts" ? c.stepFactsTitle : c.stepSuggestionsTitle;
            return (
              <div className="cvisor-step-group" key={s}>
                <div className={`cvisor-step ${stateClass}`}>
                  <span className="cvisor-step-dot">{index + 1}</span>
                  <span className="cvisor-step-label">{label}</span>
                </div>
                {index < 2 && <span className="cvisor-step-connector" />}
              </div>
            );
          })}
        </div>

        {step === "jobAd" && (
          <div className="cvisor-modal-body">
            <p className="cvisor-modal-intro">{c.modalIntro}</p>
            <TextAreaField
              label={c.jobAdLabel}
              value={jobAd}
              onChange={onJobAdChange}
              placeholder={c.jobAdPlaceholder}
              rows={8}
            />
            <p className="cvisor-modal-privacy">{c.privacyNote}</p>
            <div className="cvisor-modal-actions">
              <button type="button" className="cvisor-modal-cancel" onClick={resetAndClose}>
                {c.cancelButton}
              </button>
              <button
                type="button"
                className="cvisor-modal-generate"
                onClick={() => setStep("facts")}
                disabled={!jobAd.trim()}
              >
                {c.continueButton}
              </button>
            </div>
          </div>
        )}

        {step === "facts" && (
          <div className="cvisor-modal-body">
            <p className="cvisor-quick-intro">{c.quickIntro}</p>

            <QuickEntryList
              title={sections.experience}
              items={experienceRows}
              onChange={setExperienceRows}
              addLabel={actions.add}
              removeLabel={actions.remove}
              emptyTemplate={EMPTY_EXPERIENCE}
              fields={[
                { key: "role", placeholder: placeholders.role },
                { key: "company", placeholder: placeholders.company },
                { key: "note", placeholder: c.quickNoteExperiencePlaceholder, multiline: true },
              ]}
            />

            <QuickEntryList
              title={sections.education}
              items={educationRows}
              onChange={setEducationRows}
              addLabel={actions.add}
              removeLabel={actions.remove}
              emptyTemplate={EMPTY_EDUCATION}
              fields={[
                { key: "degree", placeholder: placeholders.degree },
                { key: "institution", placeholder: placeholders.institution },
                { key: "note", placeholder: c.quickNoteEducationPlaceholder, multiline: true },
              ]}
            />

            <TextAreaField
              label={sections.skills}
              value={skills}
              onChange={setSkills}
              placeholder={c.skillsQuickPlaceholder}
              rows={4}
            />

            <TextAreaField
              label={sections.languages}
              value={languages}
              onChange={setLanguages}
              placeholder={c.languagesQuickPlaceholder}
              rows={3}
            />

            <QuickEntryList
              title={sections.certifications}
              items={certificationRows}
              onChange={setCertificationRows}
              addLabel={actions.add}
              removeLabel={actions.remove}
              emptyTemplate={EMPTY_CERTIFICATION}
              fields={[
                { key: "title", placeholder: placeholders.certTitle },
                { key: "issuer", placeholder: placeholders.certIssuer },
              ]}
            />

            <QuickEntryList
              title={sections.projects}
              items={projectRows}
              onChange={setProjectRows}
              addLabel={actions.add}
              removeLabel={actions.remove}
              emptyTemplate={EMPTY_PROJECT}
              fields={[
                { key: "title", placeholder: placeholders.projectTitle },
                { key: "note", placeholder: c.quickNoteProjectPlaceholder, multiline: true },
              ]}
            />

            <TextAreaField
              label={c.extraNotesLabel}
              value={extraNotes}
              onChange={setExtraNotes}
              placeholder={c.extraNotesPlaceholder}
              rows={2}
            />

            {apiStatus === "error" && errorMessage && <p className="cvisor-modal-error">{errorMessage}</p>}
            <p className="cvisor-modal-privacy">{c.privacyNote}</p>

            <div className="cvisor-modal-actions">
              <button type="button" className="cvisor-modal-cancel" onClick={() => setStep("jobAd")}>
                {c.backButton}
              </button>
              <button
                type="button"
                className="cvisor-modal-generate"
                onClick={runGenerate}
                disabled={apiStatus === "loading" || !hasAnyBackground}
              >
                <Icon name="sparkles" size={15} />
                {apiStatus === "loading" ? c.generating : c.generateSuggestionsButton}
              </button>
            </div>
          </div>
        )}

        {step === "suggestions" && result && (
          <div className="cvisor-modal-body">
            <p className="cvisor-modal-review-note">{c.reviewNote}</p>

            <div className="cvisor-summary-block">
              <div className="cvisor-review-summary" dangerouslySetInnerHTML={{ __html: displayedSummary }} />
              <label className="cvisor-toggle-row">
                <input
                  type="checkbox"
                  checked={keepSummary}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setKeepSummary(checked);
                    setLockedSummary(checked ? displayedSummary : null);
                  }}
                />
                <span>{c.keepSummaryLabel}</span>
              </label>
            </div>

            {result.experience.length > 0 && (
              <div className="cvisor-chip-section">
                <span className="cvisor-chip-heading">{sections.experience}</span>
                {result.experience.map((item, index) => (
                  <BulletItemCard
                    key={index}
                    heading={[item.role, item.company].filter(Boolean).join(" @ ") || sections.experience}
                    bullets={item.bullets}
                    selected={experienceBulletSelection[index] ?? new Set()}
                    onToggleBullet={(bulletIndex) =>
                      setExperienceBulletSelection((prev) =>
                        prev.map((set, i) => (i === index ? toggleIn(set, bulletIndex) : set)),
                      )
                    }
                  />
                ))}
              </div>
            )}

            {showExperienceTips && (
              <div className="cvisor-tips-box">
                <span className="cvisor-tips-hint">{c.experienceTipsHint}</span>
                <ul>
                  {result.experienceTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.education.length > 0 && (
              <div className="cvisor-chip-section">
                <span className="cvisor-chip-heading">{sections.education}</span>
                {result.education.map((item, index) => (
                  <BulletItemCard
                    key={index}
                    heading={[item.degree, item.institution].filter(Boolean).join(", ") || sections.education}
                    bullets={item.bullets}
                    selected={educationBulletSelection[index] ?? new Set()}
                    onToggleBullet={(bulletIndex) =>
                      setEducationBulletSelection((prev) =>
                        prev.map((set, i) => (i === index ? toggleIn(set, bulletIndex) : set)),
                      )
                    }
                  />
                ))}
              </div>
            )}

            {showEducationTips && (
              <div className="cvisor-tips-box">
                <span className="cvisor-tips-hint">{c.educationTipsHint}</span>
                <ul>
                  {result.educationTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.projects.length > 0 && (
              <div className="cvisor-chip-section">
                <span className="cvisor-chip-heading">{sections.projects}</span>
                {result.projects.map((item, index) => (
                  <BulletItemCard
                    key={index}
                    heading={item.title || sections.projects}
                    bullets={item.bullets}
                    selected={projectBulletSelection[index] ?? new Set()}
                    onToggleBullet={(bulletIndex) =>
                      setProjectBulletSelection((prev) =>
                        prev.map((set, i) => (i === index ? toggleIn(set, bulletIndex) : set)),
                      )
                    }
                  />
                ))}
              </div>
            )}

            {result.skills.length > 0 && (
              <div className="cvisor-chip-section">
                <span className="cvisor-chip-heading">{c.ownSkillsTitle}</span>
                <ul className="cvisor-own-skills-list">
                  {result.skills.map((skill) => (
                    <li key={skill.name} className={skill.relevant ? "" : "cvisor-own-skill-flagged"}>
                      <label>
                        <input
                          type="checkbox"
                          checked={keptOwnSkills.has(skill.name)}
                          onChange={() => setKeptOwnSkills((prev) => toggleIn(prev, skill.name))}
                        />
                        <span>{skill.name}</span>
                      </label>
                      {skill.relevant ? (
                        <span className="cvisor-badge cvisor-badge-good" title={c.relevantBadge}>
                          ✓
                        </span>
                      ) : (
                        <span className="cvisor-badge cvisor-badge-warn">{c.notRelevantBadge}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="cvisor-review-counts">
              <li>
                {sections.softSkills}: <strong>{result.softSkills.length}</strong>
              </li>
              <li>
                {sections.languages}: <strong>{result.languages.length}</strong>
              </li>
              <li>
                {sections.certifications}: <strong>{result.certifications.length}</strong>
              </li>
              <li>
                {sections.interests}: <strong>{result.interests.length}</strong>
              </li>
            </ul>

            {displayedJobTitle && (
              <label className="cvisor-toggle-row">
                <input
                  type="checkbox"
                  checked={applyJobTitle}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setApplyJobTitle(checked);
                    setLockedJobTitle(checked ? displayedJobTitle : null);
                  }}
                />
                <span>
                  {c.suggestedJobTitleLabel}: <strong>{displayedJobTitle}</strong>
                </span>
              </label>
            )}

            <ChipSection
              title={c.suggestedSkillsTitle}
              names={skillSuggestions}
              selected={selectedSkills}
              onToggle={(name) => setSelectedSkills((prev) => toggleIn(prev, name))}
            />
            <ChipSection
              title={c.suggestedSoftSkillsTitle}
              names={softSkillSuggestions}
              selected={selectedSoftSkills}
              onToggle={(name) => setSelectedSoftSkills((prev) => toggleIn(prev, name))}
            />
            <ChipSection
              title={c.suggestedInterestsTitle}
              names={interestSuggestions}
              selected={selectedInterests}
              onToggle={(name) => setSelectedInterests((prev) => toggleIn(prev, name))}
            />

            <div className="cvisor-theme-section">
              <span className="cvisor-chip-heading">{c.themeSectionTitle}</span>
              <label className="cvisor-toggle-row">
                <input
                  type="checkbox"
                  checked={applyColor}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setApplyColor(checked);
                    setLockedThemeColor(checked ? (displayedThemeId ?? null) : null);
                  }}
                />
                <span className="cvisor-theme-swatch" style={{ background: themeHexPreview }} />
                <span>{c.applyColorLabel}</span>
              </label>
            </div>

            <p className="cvisor-edit-elsewhere-note">{c.editElsewhereNote}</p>

            {apiStatus === "error" && errorMessage && <p className="cvisor-modal-error">{errorMessage}</p>}

            <div className="cvisor-modal-actions cvisor-modal-actions-wrap">
              <button type="button" className="cvisor-modal-cancel" onClick={() => setStep("facts")}>
                {c.backButton}
              </button>
              <button
                type="button"
                className="cvisor-modal-cancel"
                onClick={runGenerate}
                disabled={apiStatus === "loading"}
              >
                <Icon name="sparkles" size={14} />
                {apiStatus === "loading" ? c.generating : c.regenerateButton}
              </button>
              <button type="button" className="cvisor-modal-generate" onClick={handleApply}>
                {c.applyButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
