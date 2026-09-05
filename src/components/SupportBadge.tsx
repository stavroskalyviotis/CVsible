import type { Dictionary } from "../i18n/translations";
import { SUPPORT_URL } from "../lib/support";
import { Icon } from "./Icon";
import "./SupportBadge.css";

export function SupportBadge({ dictionary }: { dictionary: Dictionary }) {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="support-badge"
      title={dictionary.support.badgeLabel}
      aria-label={dictionary.support.badgeLabel}
    >
      <Icon name="coffee" size={15} />
    </a>
  );
}
