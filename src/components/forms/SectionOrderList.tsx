import { useState } from "react";
import type { DragEvent } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import "./SectionOrderList.css";

export function SectionOrderList<T extends string>({
  items,
  labels,
  icons,
  onReorder,
  dragLabel,
}: {
  items: T[];
  labels: Record<T, string>;
  icons: Record<T, IconName>;
  onReorder: (source: T, target: T) => void;
  dragLabel: string;
}) {
  const [dragOverItem, setDragOverItem] = useState<T | null>(null);

  return (
    <ul className="section-order-list">
      {items.map((item) => (
        <li
          key={item}
          className={dragOverItem === item ? "section-order-drag-over" : ""}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverItem(item);
          }}
          onDragLeave={() => setDragOverItem((current) => (current === item ? null : current))}
          onDrop={(event) => {
            event.preventDefault();
            setDragOverItem(null);
            const source = event.dataTransfer.getData("text/plain") as T;
            if (source && source !== item) onReorder(source, item);
          }}
        >
          <span
            className="section-order-handle"
            draggable
            title={dragLabel}
            onDragStart={(event: DragEvent<HTMLSpanElement>) => {
              event.dataTransfer.setData("text/plain", item);
              event.dataTransfer.effectAllowed = "move";
            }}
          >
            <Icon name="grip" size={15} strokeWidth={2.4} />
          </span>
          <span className="section-order-icon">
            <Icon name={icons[item]} size={14} />
          </span>
          <span className="section-order-label">{labels[item]}</span>
        </li>
      ))}
    </ul>
  );
}
