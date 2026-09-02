import { scoreBand } from "./analyze";
import "./AtsScoreRing.css";

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AtsScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const band = scoreBand(score);
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <span className={`ats-ring ats-band-${band}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <circle cx="32" cy="32" r={RADIUS} className="ats-ring-track" />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          className="ats-ring-value"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <strong style={{ fontSize: size * 0.3 }}>{score}</strong>
    </span>
  );
}
