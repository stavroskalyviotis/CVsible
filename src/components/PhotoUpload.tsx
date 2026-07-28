import { useRef } from "react";
import type { Dictionary } from "../i18n/translations";
import { readPhotoAsDataUrl } from "../utils/photo";
import { Icon } from "./Icon";
import "./PhotoUpload.css";

export function PhotoUpload({
  photo,
  onChange,
  dictionary,
}: {
  photo: string | null;
  onChange: (photo: string | null) => void;
  dictionary: Dictionary;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readPhotoAsDataUrl(file);
    onChange(dataUrl);
  };

  return (
    <div className="photo-upload">
      {photo ? (
        <img src={photo} alt="" className="photo-upload-preview" />
      ) : (
        <div className="photo-upload-preview photo-upload-placeholder">
          <Icon name="upload" size={20} />
        </div>
      )}
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
