import type { Dictionary } from "../i18n/translations";
import type { AtsReport } from "./analyze";
import { scoreBand } from "./analyze";
import { AtsScoreRing } from "./AtsScoreRing";
import "./AtsAxisCards.css";

/** The three scores, side by side.
 *
 *  Shown together on purpose: the whole point of splitting them is that the
 *  reader can see at a glance which of the three is the problem, and the
 *  three answers lead to three different actions — fix the file, rewrite the
 *  content, or apply somewhere else. */
export function AtsAxisCards({ report, dictionary }: { report: AtsReport; dictionary: Dictionary }) {
  const copy = dictionary.ats;

  const axes = [
    { id: "format" as const, score: report.format.score, title: copy.axisFormat, hint: copy.axisFormatHint },
    { id: "content" as const, score: report.content.score, title: copy.axisContent, hint: copy.axisContentHint },
    {
      id: "match" as const,
      score: report.match?.score ?? null,
      title: copy.axisMatch,
      hint: report.match ? copy.axisMatchHint : copy.axisMatchNone,
    },
  ];

  return (
    <div className="ats-axes">
      {axes.map((axis) => (
        <section
          key={axis.id}
          className={`ats-axis ${axis.score === null ? "ats-axis-empty" : `ats-band-${scoreBand(axis.score)}`}`}
        >
          {axis.score === null ? (
            <span className="ats-axis-nodata" aria-hidden="true">
              —
            </span>
          ) : (
            <AtsScoreRing score={axis.score} size={58} />
          )}
          <div className="ats-axis-text">
            <strong>{axis.title}</strong>
            <span>{axis.hint}</span>
          </div>
        </section>
      ))}
    </div>
  );
}
