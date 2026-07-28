import type { Dictionary } from "../../i18n/translations";
import type { SkillItem } from "../../types";
import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { RangeField, TextField } from "../ui/FormField";

type SkillActions = {
  add: (item: SkillItem) => void;
  update: (id: string, patch: Partial<SkillItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function SkillsForm({
  items,
  actions,
  dictionary,
}: {
  items: SkillItem[];
  actions: SkillActions;
  dictionary: Dictionary;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.skills}</EmptyHint>}

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
            label={fields.skillName}
            value={item.name}
            placeholder={placeholders.skillName}
            onChange={(name) => actions.update(item.id, { name })}
          />
          <RangeField
            label={fields.skillLevel}
            value={item.level}
            onChange={(level) => actions.update(item.id, { level })}
          />
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() => actions.add({ id: createId(), name: "", level: 70 })}
      />
    </>
  );
}
