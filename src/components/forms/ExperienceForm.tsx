import type { Dictionary } from "../../i18n/translations";
import type { ExperienceItem, LanguageCode } from "../../types";
import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { CheckboxField, FieldRow, TextField } from "../ui/FormField";
import { MonthYearField } from "../ui/MonthYearField";
import { RichTextEditor } from "../ui/RichTextEditor";

type ExperienceActions = {
  add: (item: ExperienceItem) => void;
  update: (id: string, patch: Partial<ExperienceItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function ExperienceForm({
  items,
  actions,
  dictionary,
  locale,
}: {
  items: ExperienceItem[];
  actions: ExperienceActions;
  dictionary: Dictionary;
  locale: LanguageCode;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.experience}</EmptyHint>}

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
          <FieldRow>
            <TextField
              label={fields.role}
              value={item.role}
              placeholder={placeholders.role}
              onChange={(role) => actions.update(item.id, { role })}
            />
            <TextField
              label={fields.company}
              value={item.company}
              placeholder={placeholders.company}
              onChange={(company) => actions.update(item.id, { company })}
            />
          </FieldRow>
          <TextField
            label={fields.location}
            value={item.location}
            placeholder={placeholders.location}
            onChange={(location) => actions.update(item.id, { location })}
          />
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
            placeholder={placeholders.experienceDescription}
            onChange={(description) => actions.update(item.id, { description })}
            dictionary={dictionary}
          />
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() =>
          actions.add({
            id: createId(),
            role: "",
            company: "",
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
