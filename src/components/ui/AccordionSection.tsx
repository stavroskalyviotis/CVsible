import type { ReactNode } from "react";
import type { IconName } from "../Icon";
import { Icon } from "../Icon";
import "./AccordionSection.css";

export function AccordionSection({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: IconName;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`accordion ${open ? "accordion-open" : ""}`}>
      <button type="button" className="accordion-header" onClick={onToggle}>
        <span className="accordion-icon">
          <Icon name={icon} size={16} />
        </span>
        <span className="accordion-title">{title}</span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </section>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="add-button" onClick={onClick}>
      <Icon name="plus" size={15} />
      {label}
    </button>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="empty-hint">{children}</p>;
}
