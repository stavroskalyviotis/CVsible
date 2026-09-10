import type { Dictionary } from "../../i18n/translations";
import { Icon } from "../Icon";
import "./CharCounter.css";

/** How close to the ceiling before the count is worth looking at. Below this
 *  it is noise; a counter that shouts from the first character teaches people
 *  to ignore it. */
const NOTICE_RATIO = 0.8;

/** The count next to a field the API will reject if it is too long.
 *
 *  Quiet until it matters: grey while there is room, amber once the end is in
 *  sight, and an explicit error once past it — where the number alone is not
 *  enough, because the reason the request will fail has to be readable, not
 *  inferred from a colour. */
export function CharCounter({
  value,
  max,
  dictionary,
}: {
  value: string;
  max: number;
  dictionary: Dictionary;
}) {
  const used = value.length;
  const over = used > max;
  const near = !over && used >= max * NOTICE_RATIO;
  const locale = dictionary.locale === "el" ? "el-GR" : "en-GB";

  return (
    <p className={`char-counter ${over ? "over" : near ? "near" : ""}`}>
      {over && (
        <span className="char-counter-flag">
          <Icon name="alert" size={12} strokeWidth={2.6} />
          {dictionary.charCounter.tooLong.replace("{0}", (used - max).toLocaleString(locale))}
        </span>
      )}
      <span className="char-counter-count">
        {used.toLocaleString(locale)}
        <span aria-hidden="true"> / </span>
        <span className="char-counter-max">{max.toLocaleString(locale)}</span>
      </span>
    </p>
  );
}
