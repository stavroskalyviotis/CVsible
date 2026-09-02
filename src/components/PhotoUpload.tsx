import { useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import { readPhotoAsDataUrl } from "../utils/photo";
import { Icon } from "./Icon";
import "./PhotoUpload.css";

const DEFAULT_POSITION = { x: 50, y: 50 };

export function PhotoUpload({
  photo,
  position = DEFAULT_POSITION,
  onChange,
  onPositionChange,
  dictionary,
}: {
  photo: string | null;
  position?: { x: number; y: number };
  onChange: (photo: string | null) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  dictionary: Dictionary;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readPhotoAsDataUrl(file);
    onChange(dataUrl);
    onPositionChange?.(DEFAULT_POSITION);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!photo || !onPositionChange) return;
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    dragState.current = { startX: event.clientX, startY: event.clientY, posX: position.x, posY: position.y };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !onPositionChange) return;
    const size = previewRef.current?.clientWidth || 1;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    const nextX = Math.min(100, Math.max(0, dragState.current.posX - (dx / size) * 100));
    const nextY = Math.min(100, Math.max(0, dragState.current.posY - (dy / size) * 100));
    onPositionChange({ x: nextX, y: nextY });
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
    setDragging(false);
  };

  return (
    <div className="photo-upload">
      <div
        ref={previewRef}
        className={`photo-upload-preview-wrap ${photo ? "photo-upload-draggable" : ""} ${dragging ? "photo-upload-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClick={() => {
          if (!photo) inputRef.current?.click();
        }}
        title={photo ? dictionary.actions.dragToReposition : dictionary.actions.uploadPhoto}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            className="photo-upload-preview"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            draggable={false}
          />
        ) : (
          <div className="photo-upload-preview photo-upload-placeholder">
            <Icon name="upload" size={20} />
          </div>
        )}
      </div>
      <div className="photo-upload-actions">
        <button type="button" onClick={() => inputRef.current?.click()}>
          {dictionary.actions.uploadPhoto}
        </button>
        {photo && (
          <button type="button" className="photo-upload-remove" onClick={() => onChange(null)}>
            {dictionary.actions.removePhoto}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
