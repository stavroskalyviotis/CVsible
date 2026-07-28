import type { Dictionary } from "../../i18n/translations";
import type { CertificationItem, LanguageCode } from "../../types";
import { createId } from "../../utils/id";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { FieldRow, TextField } from "../ui/FormField";
import { MonthYearField } from "../ui/MonthYearField";

type CertificationActions = {
  add: (item: CertificationItem) => void;
  update: (id: string, patch: Partial<CertificationItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function CertificationsForm({
  items,
  actions,
  dictionary,
  locale,
}: {
  items: CertificationItem[];
  actions: CertificationActions;
  dictionary: Dictionary;
  locale: LanguageCode;
}) {
  const { fields, placeholders, actions: actionLabels } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.certifications}</EmptyHint>}

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
            label={fields.certTitle}
            value={item.title}
            placeholder={placeholders.certTitle}
            onChange={(title) => actions.update(item.id, { title })}
          />
          <FieldRow>
            <TextField
              label={fields.certIssuer}
              value={item.issuer}
              placeholder={placeholders.certIssuer}
              onChange={(issuer) => actions.update(item.id, { issuer })}
            />
            <MonthYearField
              label={fields.certDate}
              value={item.date}
              onChange={(date) => actions.update(item.id, { date })}
              locale={locale}
            />
          </FieldRow>
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.add}
        onClick={() => actions.add({ id: createId(), title: "", issuer: "", date: "" })}
      />
    </>
  );
}
