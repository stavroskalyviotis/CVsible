import type { Dictionary } from "../../i18n/translations";
import { RichTextEditor } from "../ui/RichTextEditor";

export function SummaryForm({
  summary,
  onChange,
  dictionary,
}: {
  summary: string;
  onChange: (summary: string) => void;
  dictionary: Dictionary;
}) {
  return (
    <RichTextEditor
      label={dictionary.fields.summary}
      value={summary}
      placeholder={dictionary.placeholders.summary}
      onChange={onChange}
      dictionary={dictionary}
    />
  );
}
