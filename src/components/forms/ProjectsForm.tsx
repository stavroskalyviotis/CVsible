import type { Dictionary } from "../../i18n/translations";
import type { ProjectItem } from "../../types";
import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { TextField } from "../ui/FormField";
import { RichTextEditor } from "../ui/RichTextEditor";

type ProjectActions = {
  add: (item: ProjectItem) => void;
  update: (id: string, patch: Partial<ProjectItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function ProjectsForm({
  items,
  actions,
  dictionary,
}: {
  items: ProjectItem[];
  actions: ProjectActions;
  dictionary: Dictionary;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.projects}</EmptyHint>}

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
            label={fields.projectTitle}
            value={item.title}
            placeholder={placeholders.projectTitle}
            onChange={(title) => actions.update(item.id, { title })}
          />
          <TextField
            label={fields.projectLink}
            value={item.link}
            placeholder={placeholders.projectLink}
            onChange={(link) => actions.update(item.id, { link })}
          />
          <RichTextEditor
            label={fields.description}
            value={item.description}
            placeholder={placeholders.projectDescription}
            onChange={(description) => actions.update(item.id, { description })}
            dictionary={dictionary}
          />
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() => actions.add({ id: createId(), title: "", link: "", description: "" })}
      />
    </>
  );
}
