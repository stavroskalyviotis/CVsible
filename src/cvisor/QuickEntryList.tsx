import { Icon } from "../components/Icon";
import "./QuickEntryList.css";

interface QuickField {
  key: string;
  placeholder: string;
  multiline?: boolean;
}

export function QuickEntryList<T extends Record<string, string>>({
  title,
  items,
  fields,
  addLabel,
  removeLabel,
  emptyTemplate,
  onChange,
}: {
  title: string;
  items: T[];
  fields: QuickField[];
  addLabel: string;
  removeLabel: string;
  emptyTemplate: T;
  onChange: (items: T[]) => void;
}) {
  const updateItem = (index: number, key: string, value: string) => {
    const next = items.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => onChange([...items, emptyTemplate]);

  return (
    <div className="cvisor-quick-section">
      <span className="cvisor-quick-heading">{title}</span>

      {items.map((item, index) => (
        <div className="cvisor-quick-row" key={index}>
          <div className="cvisor-quick-row-fields">
            {fields.map((field) =>
              field.multiline ? (
                <textarea
                  key={field.key}
                  rows={2}
                  value={item[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) => updateItem(index, field.key, event.target.value)}
                />
              ) : (
                <input
                  key={field.key}
                  type="text"
                  value={item[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) => updateItem(index, field.key, event.target.value)}
                />
              ),
            )}
          </div>
          <button
            type="button"
            className="cvisor-quick-row-remove"
            onClick={() => removeItem(index)}
            aria-label={removeLabel}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ))}

      <button type="button" className="cvisor-quick-add" onClick={addItem}>
        <Icon name="plus" size={13} />
        {addLabel}
      </button>
    </div>
  );
}
