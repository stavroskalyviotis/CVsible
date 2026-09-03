import type { Dictionary } from "../../i18n/translations";
import type { SkillItem } from "../../types";
import { createId } from "../../utils/id";
import { Icon } from "../Icon";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { RangeField, TextField } from "../ui/FormField";
import "./SkillsForm.css";

type SkillActions = {
  add: (item: SkillItem) => void;
  update: (id: string, patch: Partial<SkillItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

function capitalize(word: string): string {
  return word.charAt(0).toLocaleUpperCase("el") + word.slice(1);
}

export function SkillsForm({
  items,
  actions,
  dictionary,
  suggestions = [],
}: {
  items: SkillItem[];
  actions: SkillActions;
  dictionary: Dictionary;
  /** Job-ad keywords to offer as one-tap additions, shown only while the
   *  user hasn't added any skill of their own yet. */
  suggestions?: string[];
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.skills}</EmptyHint>}

      {items.length === 0 && suggestions.length > 0 && (
        <div className="skill-suggestions">
          <p className="skill-suggestions-label">{dictionary.skillSuggestions.label}</p>
          <div className="skill-suggestions-row">
            {suggestions.map((word) => (
              <button
                key={word}
                type="button"
                className="skill-suggestion-chip"
                onClick={() => actions.add({ id: createId(), name: capitalize(word), level: 70 })}
              >
                <Icon name="plus" size={12} />
                {capitalize(word)}
              </button>
            ))}
          </div>
        </div>
      )}

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
