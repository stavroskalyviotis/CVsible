import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import { Icon } from "../components/Icon";
import { suggestSectionText } from "./api";
import type { CvisorSuggestContext, CvisorSuggestSection } from "./api";
import { mapCvisorErrorMessage } from "./errors";
import "./CvisorImproveButton.css";

type Status = "idle" | "loading" | "error";

export function CvisorImproveButton({
  section,
  text,
  jobAd,
  language,
  dictionary,
  context,
  onAccept,
}: {
  section: CvisorSuggestSection;
  text: string;
  jobAd: string;
  language: LanguageCode;
  dictionary: Dictionary;
  context?: CvisorSuggestContext;
  onAccept: (suggestion: string) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasText = text.replace(/<[^>]+>/g, "").trim().length > 0;

  const handleRun = async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const result = await suggestSectionText({
        section,
        text,
        jobAd: jobAd || undefined,
        language,
        context,
      });
      setSuggestion(result);
      setStatus("idle");
    } catch (error) {
      setSuggestion(null);
      setStatus("error");
      setErrorMessage(mapCvisorErrorMessage(error, dictionary));
    }
  };

  const handleAccept = () => {
    if (suggestion) onAccept(suggestion);
    setSuggestion(null);
  };

  return (
    <div className="cvisor-improve">
      {!suggestion && (
        <button type="button" className="cvisor-improve-trigger" onClick={handleRun} disabled={status === "loading"}>
          <Icon name="sparkles" size={14} />
          {status === "loading"
            ? hasText
              ? dictionary.cvisor.improving
              : dictionary.cvisor.generating
            : hasText
              ? dictionary.cvisor.improveButton
              : dictionary.cvisor.generateButton}
        </button>
      )}

      {status === "error" && errorMessage && <p className="cvisor-improve-error">{errorMessage}</p>}

      {suggestion && (
        <div className="cvisor-suggestion">
          <span className="cvisor-suggestion-label">{dictionary.cvisor.suggestionTitle}</span>
          <div className="cvisor-suggestion-preview" dangerouslySetInnerHTML={{ __html: suggestion }} />
          <div className="cvisor-suggestion-actions">
            <button type="button" className="cvisor-suggestion-accept" onClick={handleAccept}>
              {dictionary.cvisor.acceptSuggestion}
            </button>
            <button type="button" className="cvisor-suggestion-discard" onClick={() => setSuggestion(null)}>
              {dictionary.cvisor.discardSuggestion}
            </button>
            <button
              type="button"
              className="cvisor-suggestion-regenerate"
              onClick={handleRun}
              disabled={status === "loading"}
              title={dictionary.cvisor.regenerateSuggestion}
              aria-label={dictionary.cvisor.regenerateSuggestion}
            >
              <Icon name="refresh" size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
