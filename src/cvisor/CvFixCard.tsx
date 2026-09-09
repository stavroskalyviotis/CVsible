import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode } from "../types";
import type { ParsedFields } from "../ats/parse";
import { Icon } from "../components/Icon";
import { runCvFixStructure } from "./agent";
import { mapCvisorErrorMessage } from "./errors";
import { draftToCvData } from "./importDraft";
import "./CvFixCard.css";

type Stage = "idle" | "running";

/** The CVfix entry point on the CVscan report.
 *
 *  An uploaded document has to be structured before it can be revised — the
 *  extraction is an interleaved mess of columns, and there is no "bullet 2 of
 *  role 1" to address a change at yet. That verbatim pass happens here; the
 *  rewriting, which the candidate approves change by change, happens in
 *  CvFixWindow afterwards. A CV built in CVsible is already structured and
 *  goes straight to the window. */
export function CvFixCard({
  resumeText,
  fields,
  dictionary,
  language,
  onStructured,
}: {
  resumeText: string;
  fields: ParsedFields;
  dictionary: Dictionary;
  language: LanguageCode;
  /** Called with the structured document, ready for the change window. */
  onStructured: (cv: CvData, reworded: string[]) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [round, setRound] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const copy = dictionary.cvfix;

  const run = async () => {
    setError(null);
    setRound(0);
    setStage("running");
    try {
      const response = await runCvFixStructure({ resumeText, language }, (current) => setRound(current));
      onStructured(draftToCvData(response.draft, fields), response.issues.reworded);
      setStage("idle");
    } catch (caught) {
      setError(mapCvisorErrorMessage(caught, dictionary));
      setStage("idle");
    }
  };

  return (
    <section className="cvfix-card">
      <div className="cvfix-head">
        <span className="cvfix-badge">{copy.badge}</span>
        <h2>{copy.title}</h2>
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
    </section>
  );
}
