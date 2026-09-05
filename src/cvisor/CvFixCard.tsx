import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import type { ParsedFields } from "../ats/parse";
import { Icon } from "../components/Icon";
import { saveCvData, setCurrentCloudId } from "../utils/storage";
import { runCvFix } from "./agent";
import type { CvFixResult } from "./agent";
import { mapCvisorErrorMessage } from "./errors";
import { draftToCvData } from "./importDraft";
import "./CvFixCard.css";

type Stage = "idle" | "running" | "done";

/** Offered on the CVscan report: rebuild the uploaded CV into an ATS-safe
 *  document without touching the candidate's wording. */
export function CvFixCard({
  resumeText,
  fields,
  dictionary,
  language,
  onOpenBuilder,
}: {
  resumeText: string;
  fields: ParsedFields;
  dictionary: Dictionary;
  language: LanguageCode;
  onOpenBuilder: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<CvFixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = dictionary.cvfix;

  const run = async () => {
    setError(null);
    setRound(0);
    setStage("running");
    try {
      const response = await runCvFix({ resumeText, language }, (current) => setRound(current));
      setResult(response);
      setStage("done");
    } catch (caught) {
      setError(mapCvisorErrorMessage(caught, dictionary));
      setStage("idle");
    }
  };

  const openInBuilder = () => {
    if (!result) return;
    saveCvData(draftToCvData(result.draft, fields));
    setCurrentCloudId(null);
    onOpenBuilder();
  };

  return (
    <section className={`cvfix-card ${stage === "done" ? "done" : ""}`}>
      <div className="cvfix-head">
        <span className="cvfix-badge">{copy.badge}</span>
        <h2>{stage === "done" ? copy.doneTitle : copy.title}</h2>
      </div>

      {stage === "idle" && (
        <>
          <p className="cvfix-body">{copy.body}</p>
          {error && <p className="cvfix-error">{error}</p>}
          <button type="button" className="cvfix-primary" onClick={() => void run()}>
            <Icon name="zap" size={15} />
            {copy.button}
          </button>
        </>
      )}

      {stage === "running" && (
        <div className="cvfix-running">
          <span className="cvfix-spinner" aria-hidden="true" />
          <span>
            {copy.running} {round > 0 && `· ${copy.runningRound} ${round}`}
          </span>
        </div>
      )}

      {stage === "done" && result && (
        <>
          <div className={`cvfix-verdict ${result.verified ? "ok" : "warn"}`}>
            <span className="cvfix-verdict-icon">
              <Icon name={result.verified ? "check" : "alert"} size={14} strokeWidth={2.6} />
            </span>
            <div>
              <strong>{result.verified ? copy.verified : copy.unverified}</strong>
              <p>{result.verified ? copy.verifiedHint : copy.unverifiedHint}</p>
            </div>
          </div>

          {result.draft.notes.length > 0 && (
            <>
              <h3>{copy.changesTitle}</h3>
              <ul className="cvfix-notes">
                {result.draft.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </>
          )}

          {result.issues.reworded.length > 0 && (
            <>
              <h3>{copy.rewordedTitle}</h3>
              <ul className="cvfix-notes cvfix-notes-warn">
                {result.issues.reworded.slice(0, 5).map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <p className="cvfix-hint">{copy.rewordedHint}</p>
            </>
          )}

          <div className="cvfix-actions">
            <p className="cvfix-hint">{copy.openBuilderHint}</p>
            <button type="button" className="cvfix-primary" onClick={openInBuilder}>
              <Icon name="arrow-right" size={15} />
              {copy.openBuilder}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
