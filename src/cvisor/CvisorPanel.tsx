import { useEffect, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode } from "../types";
import { Icon } from "../components/Icon";
import { plainText } from "../utils/richText";
import { describeCv, runCvisorAgent } from "./agent";
import type { AgentResult, CvDraft } from "./agent";
import { mapCvisorErrorMessage } from "./errors";
import { DraftReview } from "./DraftReview";
import "./CvisorPanel.css";

type Stage = "input" | "running" | "review";

/** Walks through the descriptive steps while the agent loop runs server-side.
 *  The loop is one request, so this describes *what* is happening rather than
 *  pretending to track exact progress. Mounted only while running, so the step
 *  resets naturally on each run. */
function RunningView({ title, steps }: { title: string; steps: string[] }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, steps.length - 1)),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="cvisor-body cvisor-running">
      <span className="cvisor-spinner" aria-hidden="true" />
      <strong>{title}</strong>
      <ol className="cvisor-steps">
        {steps.map((label, index) => (
          <li key={label} className={index < step ? "done" : index === step ? "active" : ""}>
            {index < step ? <Icon name="check" size={13} strokeWidth={2.6} /> : <span className="dot" />}
            {label}
          </li>
        ))}
      </ol>
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
  currentCv,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  dictionary: Dictionary;
  language: LanguageCode;
  jobAd: string;
  onJobAdChange: (value: string) => void;
  currentCv: CvData;
  onApply: (draft: CvDraft) => void;
}) {
  const [stage, setStage] = useState<Stage>("input");
  const [background, setBackground] = useState("");
  const [includeExisting, setIncludeExisting] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = dictionary.cvisor;

  const existingCvText = describeCv(currentCv, plainText);
  const hasExisting = existingCvText.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stage !== "running") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, stage, onClose]);

  if (!open) return null;

  const run = async () => {
    if (!background.trim()) {
      setError(copy.emptyBackground);
      return;
    }
    setError(null);
    setStage("running");
    try {
      const response = await runCvisorAgent({
        jobAd,
        background,
        existingCv: includeExisting && hasExisting ? existingCvText : "",
        language,
      });
      setResult(response);
      setStage("review");
    } catch (caught) {
      setError(mapCvisorErrorMessage(caught, dictionary));
      setStage("input");
    }
  };

  return (
    <div className="cvisor-overlay" role="dialog" aria-modal="true" aria-label={copy.title}>
      <button
        type="button"
        className="cvisor-backdrop"
        aria-label={copy.close}
        onClick={() => stage !== "running" && onClose()}
      />

      <section className="cvisor-modal">
        <header className="cvisor-head">
          <div>
            <h2>
              <Icon name="sparkles" size={17} />
              {copy.title}
            </h2>
            {stage === "input" && <p>{copy.intro}</p>}
          </div>
          <button
            type="button"
            className="cvisor-close"
            aria-label={copy.close}
            disabled={stage === "running"}
            onClick={onClose}
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        {stage === "input" && (
          <div className="cvisor-body">
            <label className="cvisor-label" htmlFor="cvisor-goal">
              {copy.goalLabel}
            </label>
            <textarea
              id="cvisor-goal"
              rows={4}
              value={jobAd}
              placeholder={copy.goalPlaceholder}
              onChange={(event) => onJobAdChange(event.target.value)}
            />
            <p className="cvisor-hint">{copy.goalHint}</p>

            <label className="cvisor-label" htmlFor="cvisor-background">
              {copy.backgroundLabel}
            </label>
            <textarea
              id="cvisor-background"
              rows={10}
              value={background}
              placeholder={copy.backgroundPlaceholder}
              onChange={(event) => setBackground(event.target.value)}
            />
            <p className="cvisor-hint">{copy.backgroundHint}</p>

            {hasExisting && (
              <label className="cvisor-check">
                <input
                  type="checkbox"
                  checked={includeExisting}
                  onChange={(event) => setIncludeExisting(event.target.checked)}
                />
                <span>
                  {copy.includeExisting}
                  <em>{copy.includeExistingHint}</em>
                </span>
              </label>
            )}

            {error && <p className="cvisor-error">{error}</p>}

            <div className="cvisor-actions">
              <p className="cvisor-privacy">
                <Icon name="shield" size={13} />
                {copy.privacyNote}
              </p>
              <button type="button" className="cvisor-primary" onClick={() => void run()}>
                <Icon name="sparkles" size={15} />
                {copy.generateButton}
              </button>
            </div>
          </div>
        )}

        {stage === "running" && <RunningView title={copy.runningTitle} steps={copy.runningSteps} />}

        {stage === "review" && result && (
          <DraftReview
            result={result}
            dictionary={dictionary}
            onBack={() => setStage("input")}
            onApply={() => {
              onApply(result.draft);
              onClose();
              setStage("input");
            }}
          />
        )}
      </section>
    </div>
  );
}
