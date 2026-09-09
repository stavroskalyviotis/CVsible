import type { Dictionary } from "../../i18n/translations";
import type { SkillItem } from "../../types";
import { createId } from "../../utils/id";
import { Icon } from "../Icon";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { FieldRow, RangeField, SuggestField, TextField } from "../ui/FormField";
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

/** The categories already in use, in the order they were introduced. Offered
 *  back to the user so the second "Kitchen" is picked, not retyped — a typo
 *  there silently splits one heading into two. */
function usedCategories(items: SkillItem[]): string[] {
  const seen: string[] = [];
  items.forEach((item) => {
    const category = item.category.trim();
    if (category && !seen.includes(category)) seen.push(category);
  });
  return seen;
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
  const categories = usedCategories(items);
  // Someone filling in "Kitchen: five things" types the category once, not five
  // times, so a new row starts in the same category as the row above it.
  const nextCategory = items.length > 0 ? items[items.length - 1].category : "";

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
                onClick={() => actions.add({ id: createId(), name: capitalize(word), level: 70, category: "" })}
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
          <FieldRow>
            <TextField
              label={fields.skillName}
              value={item.name}
              placeholder={placeholders.skillName}
              onChange={(name) => actions.update(item.id, { name })}
            />
            <SuggestField
              label={fields.skillCategory}
              value={item.category}
              placeholder={placeholders.skillCategory}
              suggestions={categories}
              onChange={(category) => actions.update(item.id, { category })}
            />
          </FieldRow>
          <RangeField
            label={fields.skillLevel}
            value={item.level}
            onChange={(level) => actions.update(item.id, { level })}
          />
        </EntryCard>
      ))}

      {items.length > 0 && <p className="skill-category-hint">{dictionary.skillCategoryHint}</p>}

      <AddButton
        label={actionLabels.add}
        onClick={() => actions.add({ id: createId(), name: "", level: 70, category: nextCategory })}
      />
    </>
  );
}
