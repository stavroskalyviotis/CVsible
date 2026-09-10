import { useState } from "react";
import type { FormEvent } from "react";
import type { Dictionary } from "../i18n/translations";
import { Icon } from "../components/Icon";
import type { Step, StepAnswer, StepField } from "./interview";
import { CharCounter } from "../components/ui/CharCounter";

/** One question.
 *
 *  Keyed by step id from the parent, so every question arrives with its own
 *  fresh state and there is no chance of one step's typing bleeding into the
 *  next — the failure that makes a wizard feel haunted.
 */
export function StepCard({
  step,
  initial,
  dictionary,
  canGoBack,
  onBack,
  onSkip,
  onSubmit,
}: {
  step: Step;
  /** What was typed here before, when the candidate has stepped back. */
  initial?: StepAnswer;
  dictionary: Dictionary;
  canGoBack: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: (answer: StepAnswer) => void;
}) {
  const copy = dictionary.cvisorChat;
  const [values, setValues] = useState<StepAnswer>(() =>
    Object.fromEntries(step.fields.map((field) => [field.name, initial?.[field.name] ?? ""])),
  );

  const isOverLength = (field: StepField) =>
    field.maxLength !== undefined && (values[field.name] ?? "").length > field.maxLength;

  const hasAnything = Object.values(values).some((value) => value.trim().length > 0);
  // Blocked rather than truncated: silently cutting someone's pasted ad in
  // half is worse than telling them it is too long.
  const isTooLong = step.fields.some(isOverLength);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!hasAnything || isTooLong) return;
    onSubmit(values);
  };

  const answerWith = (value: string) => onSubmit({ value });

  return (
    <form className="cvisor-step" onSubmit={submit}>
      <h2 className="cvisor-step-prompt">{step.prompt}</h2>
      {step.hint && <p className="cvisor-step-hint">{step.hint}</p>}

      {step.quickChoices ? (
        <div className="cvisor-choices">
          {step.quickChoices.map((choice) => (
            <button key={choice} type="button" className="cvisor-choice" onClick={() => answerWith(choice)}>
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <div className="cvisor-step-fields">
          {step.fields.map((field) => (
            <label key={field.name} className="cvisor-field">
              <span>
                {field.label}
                {field.optional && <em>{` · ${copy.skip.toLocaleLowerCase()}`}</em>}
              </span>
              {field.kind === "longtext" ? (
                <textarea
                  rows={4}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  autoFocus={field === step.fields[0]}
                  aria-invalid={isOverLength(field) || undefined}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  autoFocus={field === step.fields[0]}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              )}
              {field.maxLength !== undefined && (
                <CharCounter value={values[field.name] ?? ""} max={field.maxLength} dictionary={dictionary} />
              )}
            </label>
          ))}
        </div>
      )}

      <div className="cvisor-step-actions">
        {canGoBack && (
          <button type="button" className="cvisor-step-back" onClick={onBack}>
            <Icon name="arrow-left" size={14} />
            {copy.back}
          </button>
        )}
        <div className="cvisor-step-forward">
          {step.skippable && (
            <button type="button" className="cvisor-ghost" onClick={onSkip}>
              {copy.skip}
            </button>
          )}
          {!step.quickChoices && (
            <button type="submit" className="cvisor-primary" disabled={!hasAnything || isTooLong}>
              {copy.next}
              <Icon name="arrow-right" size={15} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
