import { useEffect, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import { Icon } from "../components/Icon";
import type { ImportChoice } from "./describeEntry";
import "./ProfileImportDialog.css";

export function ProfileImportDialog({
  title,
  choices,
  dictionary,
  onCancel,
  onImport,
}: {
  title: string;
  choices: ImportChoice[];
  dictionary: Dictionary;
  onCancel: () => void;
  onImport: (ids: string[]) => void;
}) {
  const copy = dictionary.profile;
  // Everything starts ticked: the common case is "bring it all in", and
  // unticking the two that do not belong is less work than ticking six.
  const [selected, setSelected] = useState<string[]>(() => choices.map((choice) => choice.id));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  return (
    <div className="pimport-overlay" role="dialog" aria-modal="true" aria-label={copy.importTitle}>
      <button type="button" className="pimport-backdrop" aria-label={copy.importCancel} onClick={onCancel} />

      <section className="pimport-modal">
        <header className="pimport-head">
          <div>
            <h2>{copy.importTitle}</h2>
            <p>{title}</p>
          </div>
          <button type="button" className="pimport-close" aria-label={copy.importCancel} onClick={onCancel}>
            <Icon name="x" size={17} />
          </button>
        </header>

        {choices.length === 0 ? (
          <p className="pimport-empty">{copy.importEmpty}</p>
        ) : (
          <>
            <div className="pimport-bulk">
              <span>{copy.importSubtitle}</span>
              <div>
                <button type="button" onClick={() => setSelected(choices.map((choice) => choice.id))}>
                  {copy.importAll}
                </button>
                <button type="button" onClick={() => setSelected([])}>
                  {copy.importClear}
                </button>
              </div>
            </div>

            <ul className="pimport-list">
              {choices.map((choice) => (
                <li key={choice.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(choice.id)}
                      onChange={() => toggle(choice.id)}
                    />
                    <span className="pimport-entry">
                      <strong>{choice.title}</strong>
                      {choice.subtitle && <em>{choice.subtitle}</em>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <footer className="pimport-actions">
          <button type="button" className="pimport-cancel" onClick={onCancel}>
            {copy.importCancel}
          </button>
          <button
            type="button"
            className="pimport-confirm"
            disabled={selected.length === 0}
            onClick={() => onImport(selected)}
          >
            <Icon name="plus" size={14} />
            {copy.importConfirm.replace("{v}", String(selected.length))}
          </button>
        </footer>
      </section>
    </div>
  );
}
