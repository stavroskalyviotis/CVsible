import type { Dictionary } from "../../i18n/translations";
import type { LanguageItem } from "../../types";
import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { SelectField, TextField } from "../ui/FormField";

type LanguageActions = {
  add: (item: LanguageItem) => void;
  update: (id: string, patch: Partial<LanguageItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function LanguagesForm({
  items,
  actions,
  dictionary,
}: {
  items: LanguageItem[];
  actions: LanguageActions;
  dictionary: Dictionary;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.languages}</EmptyHint>}

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
            label={fields.languageName}
            value={item.name}
            placeholder={placeholders.languageName}
            onChange={(name) => actions.update(item.id, { name })}
          />
          <SelectField
            label={fields.languageLevel}
            value={item.level}
            options={dictionary.languageLevels}
            onChange={(level) => actions.update(item.id, { level })}
          />
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() => actions.add({ id: createId(), name: "", level: "" })}
      />
    </>
  );
}
