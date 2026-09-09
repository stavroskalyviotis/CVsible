import type { Dictionary } from "../i18n/translations";
import type { LanguageCode, ProfileListKey } from "../types";
import { formatMonth, formatRange } from "../pagination/format";

export interface ImportChoice {
  id: string;
  title: string;
  subtitle: string;
}

/** One line per entry, in the same words the CV would print, so what a
 *  checkbox brings in is obvious before it is brought in. */
export function describeEntry(
  section: ProfileListKey,
  entry: Record<string, unknown>,
  dictionary: Dictionary,
  locale: LanguageCode,
): ImportChoice {
  const text = (value: unknown) => String(value ?? "").trim();
  const id = text(entry.id);

  switch (section) {
    case "experience":
      return {
        id,
        title: [text(entry.role), text(entry.company)].filter(Boolean).join(" · "),
        subtitle: formatRange(
          text(entry.startDate),
          text(entry.endDate),
          Boolean(entry.current),
          locale,
          dictionary.placeholders.present,
        ),
      };
    case "education":
      return {
        id,
        title: [text(entry.degree), text(entry.institution)].filter(Boolean).join(" · "),
        subtitle: formatRange(
          text(entry.startDate),
          text(entry.endDate),
          Boolean(entry.current),
          locale,
          dictionary.placeholders.present,
        ),
      };
    case "certifications":
      return {
        id,
        title: text(entry.title),
        subtitle: [text(entry.issuer), formatMonth(text(entry.date), locale)].filter(Boolean).join(" · "),
      };
    case "projects":
      return { id, title: text(entry.title), subtitle: text(entry.link) };
    case "languages":
      return { id, title: text(entry.name), subtitle: text(entry.level) };
    default:
      return { id, title: text(entry.name), subtitle: "" };
  }
}
