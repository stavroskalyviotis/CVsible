/** Accented Greek capitals and the plain letter they become in all-caps text.
 *  Dialytika is deliberately preserved — ΑΫΛΟΣ keeps its diaeresis. */
const GREEK_TONOS: Record<string, string> = {
  Ά: "Α",
  Έ: "Ε",
  Ή: "Η",
  Ί: "Ι",
  Ό: "Ο",
  Ύ: "Υ",
  Ώ: "Ω",
};

/** Uppercases the way a typographer would: Greek loses its tonos, everything
 *  else follows the locale. Browsers only do this when the element's `lang`
 *  says Greek, which is the UI language here rather than the CV's language,
 *  so the templates apply it explicitly instead of via text-transform. */
export function upperCaseForDisplay(value: string): string {
  return value.toLocaleUpperCase("el").replace(/[ΆΈΉΊΌΎΏ]/g, (char) => GREEK_TONOS[char] ?? char);
}
