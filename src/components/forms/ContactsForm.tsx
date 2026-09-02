import type { Dictionary } from "../../i18n/translations";
import type { ContactItem, ContactType } from "../../types";
import { createId } from "../../utils/id";
import { ContactIcon } from "../ContactIcon";
import { AddButton, EmptyHint } from "../ui/AccordionSection";
import { EntryCard } from "../ui/EntryCard";
import { TextField } from "../ui/FormField";
import "./ContactsForm.css";

type ContactActions = {
  add: (item: ContactItem) => void;
  update: (id: string, patch: Partial<ContactItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

const CONTACT_TYPES: ContactType[] = [
  "email",
  "phone",
  "location",
  "website",
  "linkedin",
  "github",
  "x",
  "custom",
];

const CONTACT_INPUT_TYPE: Record<ContactType, "text" | "email" | "tel" | "url"> = {
  email: "email",
  phone: "tel",
  location: "text",
  website: "url",
  linkedin: "url",
  github: "url",
  x: "url",
  custom: "text",
};

export function ContactsForm({
  items,
  actions,
  dictionary,
}: {
  items: ContactItem[];
  actions: ContactActions;
  dictionary: Dictionary;
}) {
  const { actions: actionLabels, contactTypes, contactPlaceholders } = dictionary;

  return (
    <>
      {items.length === 0 && <EmptyHint>{dictionary.emptyStates.contacts}</EmptyHint>}

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
          <div className="contact-row">
            <div className="contact-type-select">
              <span className="contact-type-icon">
                <ContactIcon type={item.type} size={14} />
              </span>
              <select
                aria-label={dictionary.fields.contactType}
                value={item.type}
                onChange={(e) => actions.update(item.id, { type: e.target.value as ContactType })}
              >
                {CONTACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {contactTypes[type]}
                  </option>
                ))}
              </select>
            </div>

            {item.type === "custom" && (
              <TextField
                label={dictionary.fields.customLabel}
                value={item.label}
                placeholder={dictionary.placeholders.customLabel}
                onChange={(label) => actions.update(item.id, { label })}
              />
            )}

            <TextField
              label={contactTypes[item.type]}
              value={item.value}
              placeholder={contactPlaceholders[item.type]}
              type={CONTACT_INPUT_TYPE[item.type]}
              onChange={(value) => actions.update(item.id, { value })}
            />
          </div>
        </EntryCard>
      ))}

      <AddButton
        label={actionLabels.addLink}
        onClick={() => actions.add({ id: createId(), type: "website", value: "", label: "" })}
      />
    </>
  );
}
