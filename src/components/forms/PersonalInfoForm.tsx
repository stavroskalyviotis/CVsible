import type { Dictionary } from "../../i18n/translations";
import type { ContactItem, PersonalInfo } from "../../types";
import { PhotoUpload } from "../PhotoUpload";
import { CheckboxField, FieldRow, TextField } from "../ui/FormField";
import { ContactsForm } from "./ContactsForm";

type ContactActions = {
  add: (item: ContactItem) => void;
  update: (id: string, patch: Partial<ContactItem>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
};

export function PersonalInfoForm({
  personalInfo,
  photo,
  showPhoto,
  onChange,
  onPhotoChange,
  onShowPhotoChange,
  contactActions,
  dictionary,
}: {
  personalInfo: PersonalInfo;
  photo: string | null;
  showPhoto: boolean;
  onChange: (patch: Partial<PersonalInfo>) => void;
  onPhotoChange: (photo: string | null) => void;
  onShowPhotoChange: (showPhoto: boolean) => void;
  contactActions: ContactActions;
  dictionary: Dictionary;
}) {
  const { fields, placeholders } = dictionary;

  return (
    <>
      <CheckboxField label={fields.showPhoto} checked={showPhoto} onChange={onShowPhotoChange} />

      {showPhoto && <PhotoUpload photo={photo} onChange={onPhotoChange} dictionary={dictionary} />}

      <FieldRow>
        <TextField
          label={fields.fullName}
          value={personalInfo.fullName}
          placeholder={placeholders.fullName}
          onChange={(fullName) => onChange({ fullName })}
        />
        <TextField
          label={fields.jobTitle}
          value={personalInfo.jobTitle}
          placeholder={placeholders.jobTitle}
          onChange={(jobTitle) => onChange({ jobTitle })}
        />
      </FieldRow>

      <ContactsForm items={personalInfo.contacts} actions={contactActions} dictionary={dictionary} />
    </>
  );
}
