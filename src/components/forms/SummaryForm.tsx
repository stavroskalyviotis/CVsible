import type { Dictionary } from "../../i18n/translations";
import { CvisorImproveButton } from "../../cvisor/CvisorImproveButton";
import { RichTextEditor } from "../ui/RichTextEditor";

export function SummaryForm({
  summary,
  onChange,
  dictionary,
  jobAd,
}: {
  summary: string;
  onChange: (summary: string) => void;
  dictionary: Dictionary;
  jobAd: string;
}) {
  return (
    <>
      <RichTextEditor
        label={dictionary.fields.summary}
        value={summary}
        placeholder={dictionary.placeholders.summary}
        onChange={onChange}
        dictionary={dictionary}
      />
      <CvisorImproveButton
        section="summary"
        text={summary}
        jobAd={jobAd}
        language={dictionary.locale}
        dictionary={dictionary}
        onAccept={onChange}
      />
    </>
  );
}
