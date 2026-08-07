import type { Dictionary } from "../../i18n/translations";
import type { EducationItem, LanguageCode } from "../../types";
import { createId } from "../../utils/id";
import { CvisorImproveButton } from "../../cvisor/CvisorImproveButton";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { CheckboxField, FieldRow, TextField } from "../ui/FormField";
import { MonthYearField } from "../ui/MonthYearField";
import { RichTextEditor } from "../ui/RichTextEditor";

type EducationActions = {
  add: (item: EducationItem) => void;
  update: (id: string, patch: Partial<EducationItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function EducationForm({
  items,
  actions,
  dictionary,
  locale,
  jobAd,
}: {
  items: EducationItem[];
  actions: EducationActions;
  dictionary: Dictionary;
  locale: LanguageCode;
  jobAd: string;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.education}</EmptyHint>}

      {items.map((item, index) => (
        <EntryCard
          key={item.id}
          id={item.id}
          onReorder={actions.reorder}
          onRemove={() => actions.remove(item.id)}
          onMoveUp={() => actions.move(item.id, -1)}
          onMoveDown={() => actions.move(item.id, 1)}
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
          removeLabel={actionLabels.remove}
          moveUpLabel={actionLabels.moveUp}
          moveDownLabel={actionLabels.moveDown}
          dragLabel={actionLabels.dragReorder}
        >
          <TextField
            label={fields.degree}
            value={item.degree}
            placeholder={placeholders.degree}
            onChange={(degree) => actions.update(item.id, { degree })}
          />
          <FieldRow>
            <TextField
              label={fields.institution}
              value={item.institution}
              placeholder={placeholders.institution}
              onChange={(institution) => actions.update(item.id, { institution })}
            />
            <TextField
              label={fields.location}
              value={item.location}
              placeholder={placeholders.location}
              onChange={(location) => actions.update(item.id, { location })}
            />
          </FieldRow>
          <FieldRow>
            <MonthYearField
              label={fields.startDate}
              value={item.startDate}
              onChange={(startDate) => actions.update(item.id, { startDate })}
              locale={locale}
            />
            <MonthYearField
              label={fields.endDate}
              value={item.endDate}
              onChange={(endDate) => actions.update(item.id, { endDate })}
              disabled={item.current}
              locale={locale}
              minValue={item.startDate || undefined}
              minValueMessage={dictionary.dateValidation.endNotBeforeStart}
            />
          </FieldRow>
          <CheckboxField
            label={fields.current}
            checked={item.current}
            onChange={(current) => actions.update(item.id, { current, endDate: current ? "" : item.endDate })}
          />
          <RichTextEditor
            label={fields.description}
            value={item.description}
            placeholder={placeholders.educationDescription}
            onChange={(description) => actions.update(item.id, { description })}
            dictionary={dictionary}
          />
          <CvisorImproveButton
            section="education"
            text={item.description}
            jobAd={jobAd}
            language={dictionary.locale}
            dictionary={dictionary}
            context={{ degree: item.degree, institution: item.institution }}
            onAccept={(description) => actions.update(item.id, { description })}
          />
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() =>
          actions.add({
            id: createId(),
            degree: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          })
        }
      />
    </>
  );
}
