import { useEffect, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode } from "../types";
import { Icon } from "../components/Icon";
import { mapCvisorErrorMessage } from "../cvisor/errors";
import { requestCvFix } from "./api";
import { applyCvFixChanges } from "./applyChange";
import type { ChangeDecision, CvFixChange, CvFixResult } from "./types";
import "../cvisor/cvisorShared.css";
import "./CvFixWindow.css";

type Stage = "running" | "review" | "error";

function format(template: string, value: number): string {
  return template.replace("{0}", String(value));
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="cvfix-metric">
      <strong>{value}</strong>
      {label}
    </span>
  );
}

/** One proposal, shown as what it replaces and what it becomes.
 *
 *  The old/new pair is the whole point: "I fixed things and the score didn't
 *  move" was really "I could not see what it had done". Nothing is applied
 *  until the candidate says so, and skipping is as easy as accepting. */
function ChangeCard({
  change,
  decision,
  onDecide,
  copy,
}: {
  change: CvFixChange;
  decision: ChangeDecision;
  onDecide: (decision: ChangeDecision) => void;
  copy: Dictionary["cvfix"];
}) {
  const isAddition = change.before.length === 0;

  return (
    <li className={`cvfix-change ${decision}`}>
      <div className="cvfix-change-head">
        <span className="cvfix-change-where">{change.where}</span>
        {isAddition && <span className="cvfix-change-tag">{copy.addition}</span>}
      </div>

      {change.why && <p className="cvfix-change-why">{change.why}</p>}

      <div className="cvfix-diff">
        {!isAddition && (
          <p className="cvfix-diff-before">
            <span className="cvfix-diff-mark" aria-hidden="true">
              −
            </span>
            <span className="cvfix-sr-only">{copy.before}: </span>
            {change.before}
          </p>
        )}
        <p className="cvfix-diff-after">
          <span className="cvfix-diff-mark" aria-hidden="true">
            +
          </span>
          <span className="cvfix-sr-only">{copy.after}: </span>
          {change.after}
        </p>
      </div>

      <div className="cvfix-change-actions">
        <button
          type="button"
          className={`cvfix-decide skip ${decision === "skipped" ? "on" : ""}`}
          aria-pressed={decision === "skipped"}
          onClick={() => onDecide(decision === "skipped" ? "pending" : "skipped")}
        >
          {decision === "skipped" ? copy.skipped : copy.skip}
        </button>
        <button
          type="button"
          className={`cvfix-decide accept ${decision === "accepted" ? "on" : ""}`}
          aria-pressed={decision === "accepted"}
          onClick={() => onDecide(decision === "accepted" ? "pending" : "accepted")}
        >
          <Icon name="check" size={13} strokeWidth={2.8} />
          {decision === "accepted" ? copy.accepted : copy.accept}
        </button>
      </div>
    </li>
  );
}

/** One request's worth of state. Held together so a re-run replaces the lot
 *  atomically, and so nothing has to be pushed into it from an effect. */
interface Run {
  attempt: number;
  stage: Stage;
  result: CvFixResult | null;
  error: string | null;
  decisions: Record<string, ChangeDecision>;
}

const FRESH_RUN: Run = { attempt: 0, stage: "running", result: null, error: null, decisions: {} };

/** CVfix's own window. Mounted by the caller when it opens, so each opening
 *  starts a fresh run rather than showing the last one's decisions.
 *
 *  Deliberately not CVisor: CVisor builds a CV out of a conversation, CVfix
 *  edits the one that already exists. Sharing a window made them feel like one
 *  unpredictable thing. */
export function CvFixWindow({
  onClose,
  cv,
  jobAd,
  onJobAdChange,
  language,
  dictionary,
  extraSource,
  onApply,
}: {
  onClose: () => void;
  cv: CvData;
  jobAd: string;
  /** Given when the caller stores the job ad, which lets CVfix be re-run
   *  against a different one without leaving the window. */
  onJobAdChange?: (value: string) => void;
  language: LanguageCode;
  dictionary: Dictionary;
  /** Raw text of an uploaded file, when the CV came from one. */
  extraSource?: string;
  onApply: (next: CvData, accepted: number) => void;
}) {
  const copy = dictionary.cvfix;

  const [run, setRun] = useState<Run>(FRESH_RUN);
  const [adDraft, setAdDraft] = useState(jobAd);
  const [isEditingAd, setIsEditingAd] = useState(false);

  useEffect(() => {
    let cancelled = false;

    requestCvFix({ cv, jobAd, language, extraSource })
      .then((response) => {
        if (cancelled) return;
        setRun((current) => ({
          ...current,
          stage: "review",
          result: response,
          // Nothing is pre-accepted: a screen of ticked boxes is a screen
          // nobody reads, and this is the candidate's CV, not ours.
          decisions: Object.fromEntries(
            response.changes.map((change) => [change.id, "pending" as ChangeDecision]),
          ),
        }));
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setRun((current) => ({ ...current, stage: "error", error: mapCvisorErrorMessage(caught, dictionary) }));
      });

    return () => {
      cancelled = true;
    };
    // Keyed on the attempt, not on the CV: re-requesting because a character
    // changed underneath would discard decisions already made. Callers mount
    // this component when it opens, so mounting is the first attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.attempt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const rerun = () => setRun((current) => ({ ...FRESH_RUN, attempt: current.attempt + 1 }));

  const { stage, result, error } = run;
  const decisions = run.decisions;
  const changes = result?.changes ?? [];
  const accepted = changes.filter((change) => decisions[change.id] === "accepted");

  const apply = () => {
    onApply(applyCvFixChanges(cv, accepted), accepted.length);
    onClose();
  };

  const acceptAll = () => {
    setRun((current) => ({
      ...current,
      decisions: Object.fromEntries(changes.map((change) => [change.id, "accepted" as ChangeDecision])),
    }));
  };

  const metrics = result?.metrics;

  return (
    <div className="cvfix-overlay" role="dialog" aria-modal="true" aria-label={copy.windowTitle}>
      <button type="button" className="cvfix-backdrop" aria-label={copy.close} onClick={onClose} />

      <section className="cvfix-window">
        <header className="cvfix-window-head">
          <div>
            <h2>
              <Icon name="zap" size={17} />
              {copy.windowTitle}
            </h2>
            {metrics && (
              <div className="cvfix-metrics">
                <Metric label={copy.metricVerbs} value={`${Math.round(metrics.verbRatio * 100)}%`} />
                {metrics.keywordRatio !== null && (
                  <Metric label={copy.metricCoverage} value={`${Math.round(metrics.keywordRatio * 100)}%`} />
                )}
                <Metric label={copy.metricBullets} value={String(metrics.bulletCount)} />
              </div>
            )}
          </div>
          <button type="button" className="cvfix-close" aria-label={copy.close} onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </header>

        {stage === "running" && (
          <div className="cvfix-window-body cvfix-window-centred">
            <span className="cvisor-spinner" aria-hidden="true" />
            <strong>{copy.scanning}</strong>
            <p>{copy.windowIntro}</p>
          </div>
        )}

        {stage === "error" && (
          <div className="cvfix-window-body cvfix-window-centred">
            <p className="cvfix-error">{error}</p>
            <button type="button" className="cvisor-ghost" onClick={rerun}>
              {copy.rerun}
            </button>
          </div>
        )}

        {stage === "review" && changes.length === 0 && (
          <div className="cvfix-window-body cvfix-window-centred">
            <span className="cvfix-clear-mark">
              <Icon name="check" size={22} strokeWidth={2.8} />
            </span>
            <strong>{copy.noChangesTitle}</strong>
            <p>{copy.noChangesBody}</p>
          </div>
        )}

        {stage === "review" && (
          <div className="cvfix-window-body cvfix-target">
            {isEditingAd ? (
              <>
                <label className="cvfix-target-label" htmlFor="cvfix-job-ad">
                  {copy.targetLabel}
                </label>
                <textarea
                  id="cvfix-job-ad"
                  rows={5}
                  value={adDraft}
                  placeholder={copy.targetPlaceholder}
                  onChange={(event) => setAdDraft(event.target.value)}
                />
                <div className="cvfix-target-actions">
                  <button type="button" className="cvisor-ghost" onClick={() => setIsEditingAd(false)}>
                    {copy.cancel}
                  </button>
                  <button
                    type="button"
                    className="cvisor-primary"
                    onClick={() => {
                      onJobAdChange?.(adDraft);
                      setIsEditingAd(false);
                      rerun();
                    }}
                  >
                    {copy.rerun}
                  </button>
                </div>
              </>
            ) : (
              <p className="cvfix-target-row">
                <span>{jobAd.trim() ? copy.targetSet : copy.targetNone}</span>
                {onJobAdChange && (
                  <button
                    type="button"
                    className="cvfix-target-edit"
                    onClick={() => {
                      setAdDraft(jobAd);
                      setIsEditingAd(true);
                    }}
                  >
                    {jobAd.trim() ? copy.targetChange : copy.targetAdd}
                  </button>
                )}
              </p>
            )}
          </div>
        )}

        {stage === "review" && changes.length > 0 && (
          <div className="cvfix-window-body">
            <p className="cvfix-review-hint">{copy.reviewHint}</p>
            <ul className="cvfix-changes">
              {changes.map((change) => (
                <ChangeCard
                  key={change.id}
                  change={change}
                  decision={decisions[change.id] ?? "pending"}
                  onDecide={(decision) =>
                    setRun((current) => ({
                      ...current,
                      decisions: { ...current.decisions, [change.id]: decision },
                    }))
                  }
                  copy={copy}
                />
              ))}
            </ul>
          </div>
        )}

        {stage === "review" && changes.length > 0 && (
          <footer className="cvfix-window-foot">
            <button type="button" className="cvisor-ghost" onClick={acceptAll}>
              {copy.acceptAll}
            </button>
            <div className="cvfix-foot-right">
              <button type="button" className="cvisor-ghost" onClick={onClose}>
                {copy.cancel}
              </button>
              <button type="button" className="cvisor-primary" onClick={apply} disabled={accepted.length === 0}>
                {accepted.length === 0
                  ? copy.applyNone
                  : accepted.length === 1
                    ? copy.applyOne
                    : format(copy.applyCount, accepted.length)}
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}
