import { useEffect, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode, ProfileListKey, UserProfile } from "../types";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { describeEntry } from "../profile/describeEntry";
import type { ImportChoice } from "../profile/describeEntry";
import { FILLABLE_SECTIONS } from "./profileToInterview";
import type { ProfileSelection } from "./profileToInterview";
import "./ProfileFillDialog.css";

const SECTION_ICONS: Record<ProfileListKey, IconName> = {
  experience: "briefcase",
  education: "book",
  skills: "star",
  softSkills: "award",
  languages: "languages",
  interests: "heart",
  certifications: "award",
  projects: "folder",
};

/** Picking what comes over from the profile, one section at a time.
 *
 *  "Fill in from my profile" used to take everything and offer no way back,
 *  which makes it a button you press once and then regret. Two levels rather
 *  than one long list: the sections are the decision most people actually
 *  make ("bring my jobs, not my interests"), and the entries inside one are a
 *  decision worth making with that section's contents in front of you rather
 *  than scrolling past six others.
 */
export function ProfileFillDialog({
  profile,
  dictionary,
  locale,
  onCancel,
  onFill,
}: {
  profile: UserProfile;
  dictionary: Dictionary;
  locale: LanguageCode;
  onCancel: () => void;
  onFill: (selection: ProfileSelection) => void;
}) {
  const copy = dictionary.profileFill;
  const sectionLabels = dictionary.sections;

  const sections = FILLABLE_SECTIONS.filter((section) => profile[section].length > 0);

  // Everything starts ticked: the common case is "bring it all in", and
  // unticking the two that do not belong is less work than ticking six.
  const [selection, setSelection] = useState<ProfileSelection>(() =>
    Object.fromEntries(
      sections.map((section) => [section, (profile[section] as { id: string }[]).map((entry) => entry.id)]),
    ),
  );
  const [openSection, setOpenSection] = useState<ProfileListKey | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Escape backs out one level at a time, so a stray press inside a
      // section does not throw away the choices made in the others.
      if (openSection) setOpenSection(null);
      else onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSection, onCancel]);

  const entriesOf = (section: ProfileListKey): ImportChoice[] =>
    (profile[section] as unknown as Record<string, unknown>[]).map((entry) =>
      describeEntry(section, entry, dictionary, locale),
    );

  const chosenIn = (section: ProfileListKey) => selection[section] ?? [];
  const total = sections.reduce((sum, section) => sum + chosenIn(section).length, 0);

  const setSection = (section: ProfileListKey, ids: string[]) =>
    setSelection((current) => ({ ...current, [section]: ids }));

  const toggleEntry = (section: ProfileListKey, id: string) => {
    const ids = chosenIn(section);
    setSection(section, ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id]);
  };

  const heading = openSection ? sectionLabels[openSection] : copy.title;

  return (
    <div className="pfill-overlay" role="dialog" aria-modal="true" aria-label={copy.title}>
      <button type="button" className="pfill-backdrop" aria-label={copy.cancel} onClick={onCancel} />

      <section className="pfill-modal">
        <header className="pfill-head">
          {openSection && (
            <button type="button" className="pfill-back" aria-label={copy.back} onClick={() => setOpenSection(null)}>
              <Icon name="arrow-left" size={17} />
            </button>
          )}
          <div>
            <h2>{heading}</h2>
            {!openSection && <p>{copy.intro}</p>}
          </div>
          <button type="button" className="pfill-close" aria-label={copy.cancel} onClick={onCancel}>
            <Icon name="x" size={17} />
          </button>
        </header>

        {!openSection ? (
          <>
            <ul className="pfill-sections">
              {sections.map((section) => {
                const picked = chosenIn(section).length;
                const available = profile[section].length;
                return (
                  <li key={section}>
                    <button type="button" onClick={() => setOpenSection(section)}>
                      <span className="pfill-section-icon">
                        <Icon name={SECTION_ICONS[section]} size={15} />
                      </span>
                      <span className="pfill-section-name">{sectionLabels[section]}</span>
                      <span className={`pfill-section-count ${picked === 0 ? "none" : ""}`}>
                        {copy.chosenOf.replace("{0}", String(picked)).replace("{1}", String(available))}
                      </span>
                      <Icon name="arrow-right" size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <footer className="pfill-foot">
              <button type="button" className="cvisor-ghost" onClick={onCancel}>
                {copy.cancel}
              </button>
              <button
                type="button"
                className="cvisor-primary"
                disabled={total === 0}
                onClick={() => onFill(selection)}
              >
                {total === 0 ? copy.fillNone : copy.fill.replace("{0}", String(total))}
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className="pfill-bulk">
              <button
                type="button"
                onClick={() =>
                  setSection(
                    openSection,
                    (profile[openSection] as { id: string }[]).map((entry) => entry.id),
                  )
                }
              >
                {copy.selectAll}
              </button>
              <button type="button" onClick={() => setSection(openSection, [])}>
                {copy.selectNone}
              </button>
            </div>

            <ul className="pfill-entries">
              {entriesOf(openSection).map((choice) => (
                <li key={choice.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={chosenIn(openSection).includes(choice.id)}
                      onChange={() => toggleEntry(openSection, choice.id)}
                    />
                    <span>
                      <strong>{choice.title}</strong>
                      {choice.subtitle && <em>{choice.subtitle}</em>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <footer className="pfill-foot">
              <button type="button" className="cvisor-primary" onClick={() => setOpenSection(null)}>
                {copy.save}
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
