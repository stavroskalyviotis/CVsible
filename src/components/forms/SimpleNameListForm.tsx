import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { TextField } from "../ui/FormField";

interface NameItem {
  id: string;
  name: string;
}

type NameListActions = {
  add: (item: NameItem) => void;
  update: (id: string, patch: Partial<NameItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function SimpleNameListForm({
  items,
  actions,
  fieldLabel,
  placeholder,
  emptyState,
  addLabel,
  removeLabel,
  moveUpLabel,
  moveDownLabel,
  dragLabel,
}: {
  items: NameItem[];
  actions: NameListActions;
  fieldLabel: string;
  placeholder: string;
  emptyState: string;
  addLabel: string;
  removeLabel: string;
  moveUpLabel: string;
  moveDownLabel: string;
  dragLabel: string;
}) {
  return (
    <>
      {items.length === 0 && <EmptyHint>{emptyState}</EmptyHint>}

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
          removeLabel={removeLabel}
          moveUpLabel={moveUpLabel}
          moveDownLabel={moveDownLabel}
          dragLabel={dragLabel}
        >
          <TextField
            label={fieldLabel}
            value={item.name}
            placeholder={placeholder}
            onChange={(name) => actions.update(item.id, { name })}
          />
        </EntryCard>
      ))}

      <AddButton label={addLabel} onClick={() => actions.add({ id: createId(), name: "" })} />
    </>
  );
}
