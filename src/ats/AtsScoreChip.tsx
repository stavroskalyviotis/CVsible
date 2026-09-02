import { scoreBand } from "./analyze";
import { AtsScoreRing } from "./AtsScoreRing";
import "./AtsScoreRing.css";

/** Live ATS score in the builder toolbar. Clicking it opens the full CVscan
 *  report rather than a cut-down popover. */
export function AtsScoreChip({
  score,
  label,
  onClick,
}: {
  score: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`ats-chip-button ats-band-${scoreBand(score)}`} onClick={onClick}>
      <AtsScoreRing score={score} size={28} />
      <span className="ats-chip-label">{label}</span>
    </button>
  );
}
