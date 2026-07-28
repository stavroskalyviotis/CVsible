import { useState } from "react";
import type { DragEvent, ReactNode } from "react";
import { Icon } from "../Icon";
import "./EntryCard.css";

export function EntryCard({
  id,
  onReorder,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  removeLabel,
  moveUpLabel,
  moveDownLabel,
  dragLabel,
  children,
}: {
  id: string;
  onReorder: (sourceId: string, targetId: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  removeLabel: string;
  moveUpLabel: string;
  moveDownLabel: string;
  dragLabel: string;
  children: ReactNode;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const sourceId = event.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== id) onReorder(sourceId, id);
  };

  return (
    <div
      className={`entry-card ${isDragOver ? "entry-card-drag-over" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="entry-card-handle" title={dragLabel} draggable onDragStart={handleDragStart}>
        <Icon name="grip" size={16} strokeWidth={2.6} />
      </div>
      <div className="entry-card-body">{children}</div>
      <div className="entry-card-actions">
        <button type="button" disabled={!canMoveUp} title={moveUpLabel} onClick={onMoveUp}>
          <Icon name="chevron-up" size={15} />
        </button>
        <button type="button" disabled={!canMoveDown} title={moveDownLabel} onClick={onMoveDown}>
          <Icon name="chevron-down" size={15} />
        </button>
        <button type="button" className="entry-card-remove" title={removeLabel} onClick={onRemove}>
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  );
}
