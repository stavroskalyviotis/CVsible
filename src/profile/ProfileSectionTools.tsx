import { useMemo, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode, ProfileListKey, UserProfile } from "../types";
import { Icon } from "../components/Icon";
import { createId } from "../utils/id";
import { describeEntry } from "./describeEntry";
import { entriesAvailableToImport, entriesMissingFromProfile } from "./matching";
import { ProfileImportDialog } from "./ProfileImportDialog";

type Entry = { id: string };

/** The two profile affordances a CV section gets: pull entries in, and push
 *  new ones back.
 *
 *  Both are explicit. Nothing is copied in either direction without a click:
 *  a CV is cut down for one job ad, so silently syncing it back would fill
 *  the profile with a tailored subset, and silently filling a CV from the
 *  profile would undo the cutting down. */
export function ProfileSectionTools<K extends ProfileListKey>({
  section,
  cv,
  profile,
  onImport,
  onSaveToProfile,
  dictionary,
  locale,
}: {
  section: K;
  cv: CvData;
  profile: UserProfile | null;
  onImport: (entries: CvData[K]) => void;
  onSaveToProfile: (entries: UserProfile[K]) => void;
  dictionary: Dictionary;
  locale: LanguageCode;
}) {
  const [isPicking, setIsPicking] = useState(false);
  const [savedBack, setSavedBack] = useState(false);
  const copy = dictionary.profile;

  const importable = useMemo(
    () => (profile ? (entriesAvailableToImport(section, profile, cv) as Entry[]) : []),
    [profile, section, cv],
  );

  const missing = useMemo(
    () => entriesMissingFromProfile(section, cv, profile) as Entry[],
    [section, cv, profile],
  );

  if (!profile) return null;

  const choices = importable.map((entry) =>
    describeEntry(section, entry as Record<string, unknown>, dictionary, locale),
  );

  const handleImport = (ids: string[]) => {
    const chosen = importable.filter((entry) => ids.includes(entry.id));
    // Fresh ids: the document owns its copy, so editing a bullet for this one
    // job ad never reaches back into the profile.
    onImport(chosen.map((entry) => ({ ...entry, id: createId() })) as CvData[K]);
    setIsPicking(false);
  };

  const handleSaveBack = () => {
    onSaveToProfile(missing.map((entry) => ({ ...entry, id: createId() })) as UserProfile[K]);
    // The banner disappears on its own once the profile state updates; this
    // only keeps the confirmation on screen long enough to be read.
    setSavedBack(true);
    window.setTimeout(() => setSavedBack(false), 2600);
  };

  return (
    <>
      <div className="psection-tools">
        {importable.length > 0 && (
          <button type="button" className="psection-import" onClick={() => setIsPicking(true)}>
            <Icon name="folder" size={13} />
            {copy.importButton}
          </button>
        )}

        {missing.length > 0 && !savedBack && (
          <span className="psection-saveback">
            {copy.saveBack.replace("{v}", String(missing.length))}
            <button type="button" onClick={handleSaveBack}>
              {copy.saveBackButton}
            </button>
          </span>
        )}

        {savedBack && (
          <span className="psection-saveback-done">
            <Icon name="check" size={13} strokeWidth={2.6} />
            {copy.saveBackDone}
          </span>
        )}
      </div>

      {isPicking && (
        <ProfileImportDialog
          title={dictionary.sections[section]}
          choices={choices}
          dictionary={dictionary}
          onCancel={() => setIsPicking(false)}
          onImport={handleImport}
        />
      )}
    </>
  );
}
