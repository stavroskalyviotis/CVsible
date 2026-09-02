export function formatMonth(value: string, locale: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(locale === "el" ? "el-GR" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatRange(
  start: string,
  end: string,
  current: boolean,
  locale: string,
  presentLabel: string,
): string {
  const startLabel = formatMonth(start, locale);
  const endLabel = current ? presentLabel : formatMonth(end, locale);
  if (!startLabel && !endLabel) return "";
  if (!endLabel) return startLabel;
  // A plain hyphen, not an en/em dash: date-range parsers in ATS software are
  // written against "Mar 2022 - Present".
  return `${startLabel} - ${endLabel}`;
}
