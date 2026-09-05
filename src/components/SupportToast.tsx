import { useEffect } from "react";
import type { Dictionary } from "../i18n/translations";
import { SUPPORT_URL } from "../lib/support";
import { Icon } from "./Icon";
import "./SupportToast.css";

const AUTO_DISMISS_MS = 12000;

export function SupportToast({
  dictionary,
  onDismiss,
}: {
  dictionary: Dictionary;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const [before, after] = dictionary.support.toastBody.split("{cta}");

  return (
    <div className="support-toast" role="status">
      <button
        type="button"
        className="support-toast-close"
        aria-label={dictionary.support.toastDismiss}
        onClick={onDismiss}
      >
        <Icon name="x" size={14} />
      </button>
      <p className="support-toast-title">{dictionary.support.toastTitle}</p>
      <p className="support-toast-body">
        {before}
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={onDismiss}>
          {dictionary.support.toastCta}
        </a>
        {after}
      </p>
    </div>
  );
}
