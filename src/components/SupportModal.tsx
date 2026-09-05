import { useEffect } from "react";
import type { Dictionary } from "../i18n/translations";
import { SUPPORT_URL } from "../lib/support";
import { Icon } from "./Icon";
import { SupportQr } from "./SupportQr";
import "./SupportModal.css";

export function SupportModal({
  dictionary,
  onDismiss,
}: {
  dictionary: Dictionary;
  onDismiss: () => void;
}) {
  const copy = dictionary.support;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <div className="support-overlay" role="dialog" aria-modal="true" aria-label={copy.modalTitle}>
      <button type="button" className="support-backdrop" aria-label={copy.modalClose} onClick={onDismiss} />

      <section className="support-modal">
        <button type="button" className="support-modal-close" aria-label={copy.modalClose} onClick={onDismiss}>
          <Icon name="x" size={16} />
        </button>

        <div className="support-modal-banner">
          <span className="support-modal-emoji" aria-hidden="true">
            🎉
          </span>
          <h2>{copy.modalTitle}</h2>
        </div>

        <div className="support-modal-body">
          <p>{copy.modalBody}</p>

          <div className="support-modal-qr-card">
            <SupportQr size={112} />
            <span>{copy.qrHint}</span>
          </div>

          <div className="support-modal-actions">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="support-modal-primary"
              onClick={onDismiss}
            >
              <Icon name="coffee" size={16} />
              {copy.primaryButton}
            </a>
            <button type="button" className="support-modal-secondary" onClick={onDismiss}>
              {copy.secondaryButton}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
