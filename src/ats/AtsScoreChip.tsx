import { scoreBand } from "./analyze";
import { AtsScoreRing } from "./AtsScoreRing";
import "./AtsScoreRing.css";

/** Live content score in the builder toolbar. Clicking it opens the full
 *  CVscan report rather than a cut-down popover.
 *
 *  Shows one axis, not a blend: the content score is the one that moves as
 *  the user writes. Format only changes when they pick a template that a
 *  parser cannot read, which is rare enough to be worth a flag rather than a
 *  permanent second number — `warn` raises that flag and the report explains
 *  it. */
export function AtsScoreChip({
  score,
  label,
  warn = false,
  warnLabel,
  onClick,
}: {
  score: number;
  label: string;
  warn?: boolean;
  warnLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`ats-chip-button ats-band-${scoreBand(score)}`}
      onClick={onClick}
      title={warn ? warnLabel : undefined}
    >
      <span className="ats-chip-ring">
        <AtsScoreRing score={score} size={28} />
        {warn && <span className="ats-chip-warn" aria-hidden="true" />}
      </span>
      <span className="ats-chip-label">{label}</span>
      {warn && warnLabel && <span className="ats-sr-only">{warnLabel}</span>}
    </button>
  );
}
