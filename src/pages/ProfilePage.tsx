import { useMemo, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import { useAuth } from "../auth/useAuth";
import { isCloudConfigured } from "../lib/supabaseClient";
import { AccordionSection } from "../components/ui/AccordionSection";
import { PersonalInfoForm } from "../components/forms/PersonalInfoForm";
import { SummaryForm } from "../components/forms/SummaryForm";
import { ExperienceForm } from "../components/forms/ExperienceForm";
import { EducationForm } from "../components/forms/EducationForm";
import { SkillsForm } from "../components/forms/SkillsForm";
import { LanguagesForm } from "../components/forms/LanguagesForm";
import { CertificationsForm } from "../components/forms/CertificationsForm";
import { ProjectsForm } from "../components/forms/ProjectsForm";
import { SimpleNameListForm } from "../components/forms/SimpleNameListForm";
import { profileCompleteness } from "../profile/completeness";
import { useProfile } from "../profile/useProfile";
import "./ProfilePage.css";

type SectionId =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "softSkills"
  | "languages"
  | "interests"
  | "certifications"
  | "projects";

function SaveIndicator({ status, dictionary }: { status: string; dictionary: Dictionary }) {
  const copy = dictionary.profile;
  if (status === "saving") {
    return (
      <span className="profile-save profile-save-busy">
        <span className="profile-save-spinner" aria-hidden="true" />
        {copy.saving}
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="profile-save profile-save-ok">
        <Icon name="check" size={13} strokeWidth={2.6} />
        {copy.saved}
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="profile-save profile-save-error">
        <Icon name="alert" size={13} />
        {copy.saveError}
      </span>
    );
  }
  return null;
}

export function ProfilePage({
  dictionary,
  language,
  onLanguageChange,
  navigate,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  navigate: (route: Exclude<Route, "public-cv">) => void;
}) {
  const { user, loading: authLoading } = useAuth();
  const profileController = useProfile();
  const { profile, status } = profileController;
  const [openSection, setOpenSection] = useState<SectionId>("personalInfo");
  const copy = dictionary.profile;

  const completeness = useMemo(() => (profile ? profileCompleteness(profile) : null), [profile]);

  const toggleSection = (section: SectionId) =>
    setOpenSection((current) => (current === section ? ("" as SectionId) : section));

  return (
    <div className="profile-page">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "landing", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={<AuthMenu dictionary={dictionary} onOpenMyCvs={() => navigate("my-cvs")} onOpenProfile={() => navigate("profile")} />}
      />

      <main className="profile-main">
        <div className="profile-head">
          <div>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <SaveIndicator status={status} dictionary={dictionary} />
        </div>

        {!isCloudConfigured && <p className="profile-error">{copy.loadError}</p>}

        {isCloudConfigured && !authLoading && !user && (
          <div className="profile-signin">
            <p>{copy.signInPrompt}</p>
            <AuthMenu dictionary={dictionary} />
          </div>
        )}

        {isCloudConfigured && user && status === "loading" && <p className="profile-status">{copy.loading}</p>}
        {isCloudConfigured && user && status === "error" && !profile && (
          <p className="profile-error">{copy.loadError}</p>
        )}

        {profile && completeness && (
          <>
            <section className="profile-meter">
              <div className="profile-meter-head">
                <strong>{copy.completeTitle}</strong>
                <span className="profile-meter-value">{completeness.percent}%</span>
              </div>
              <div
                className="profile-meter-track"
                role="progressbar"
                aria-valuenow={completeness.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={copy.completeTitle}
              >
                <div className="profile-meter-fill" style={{ width: `${completeness.percent}%` }} />
              </div>

              {completeness.missing.length === 0 ? (
                <p className="profile-meter-done">
                  <Icon name="check" size={14} strokeWidth={2.6} />
                  {copy.completeDone}
                </p>
              ) : (
                <>
                  <p className="profile-meter-hint">{copy.completeHint}</p>
                  <p className="profile-meter-missing">
                    <span>{copy.missingLabel}</span>
                    {completeness.missing.map((key) => (
                      <span key={key} className="profile-missing-chip">
                        {copy.checks[key]}
                      </span>
                    ))}
                  </p>
                </>
              )}

              <button type="button" className="profile-build-cta" onClick={() => navigate("my-cvs")}>
                <Icon name="arrow-right" size={14} />
                {copy.openBuilder}
              </button>
            </section>

            <div className="profile-sections">
              <AccordionSection
                title={dictionary.sections.personalInfo}
                icon="mail"
                open={openSection === "personalInfo"}
                onToggle={() => toggleSection("personalInfo")}
              >
                <PersonalInfoForm
                  personalInfo={profile.personalInfo}
                  photo={profile.photo}
                  photoPosition={profile.photoPosition}
                  showPhoto
                  photoToggle={false}
                  onChange={profileController.updatePersonalInfo}
                  onPhotoChange={profileController.setPhoto}
                  onPhotoPositionChange={profileController.setPhotoPosition}
                  onShowPhotoChange={() => {}}
                  contactActions={profileController.contacts}
                  dictionary={dictionary}
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.summary}
                icon="star"
                open={openSection === "summary"}
                onToggle={() => toggleSection("summary")}
              >
                <SummaryForm
                  summary={profile.personalInfo.summary}
                  onChange={(summary) => profileController.updatePersonalInfo({ summary })}
                  dictionary={dictionary}
                  jobAd=""
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.experience}
                icon="briefcase"
                open={openSection === "experience"}
                onToggle={() => toggleSection("experience")}
              >
                <ExperienceForm
                  items={profile.experience}
                  actions={profileController.experience}
                  dictionary={dictionary}
                  locale={dictionary.locale}
                  jobAd=""
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.education}
                icon="book"
                open={openSection === "education"}
                onToggle={() => toggleSection("education")}
              >
                <EducationForm
                  items={profile.education}
                  actions={profileController.education}
                  dictionary={dictionary}
                  locale={dictionary.locale}
                  jobAd=""
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.skills}
                icon="star"
                open={openSection === "skills"}
                onToggle={() => toggleSection("skills")}
              >
                <SkillsForm items={profile.skills} actions={profileController.skills} dictionary={dictionary} />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.softSkills}
                icon="award"
                open={openSection === "softSkills"}
                onToggle={() => toggleSection("softSkills")}
              >
                <SimpleNameListForm
                  items={profile.softSkills}
                  actions={profileController.softSkills}
                  fieldLabel={dictionary.fields.softSkillName}
                  placeholder={dictionary.placeholders.softSkillName}
                  emptyState={dictionary.emptyStates.softSkills}
                  addLabel={dictionary.actions.add}
                  removeLabel={dictionary.actions.remove}
                  moveUpLabel={dictionary.actions.moveUp}
                  moveDownLabel={dictionary.actions.moveDown}
                  dragLabel={dictionary.actions.dragReorder}
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.languages}
                icon="languages"
                open={openSection === "languages"}
                onToggle={() => toggleSection("languages")}
              >
                <LanguagesForm
                  items={profile.languages}
                  actions={profileController.languages}
                  dictionary={dictionary}
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.interests}
                icon="heart"
                open={openSection === "interests"}
                onToggle={() => toggleSection("interests")}
              >
                <SimpleNameListForm
                  items={profile.interests}
                  actions={profileController.interests}
                  fieldLabel={dictionary.fields.interestName}
                  placeholder={dictionary.placeholders.interestName}
                  emptyState={dictionary.emptyStates.interests}
                  addLabel={dictionary.actions.add}
                  removeLabel={dictionary.actions.remove}
                  moveUpLabel={dictionary.actions.moveUp}
                  moveDownLabel={dictionary.actions.moveDown}
                  dragLabel={dictionary.actions.dragReorder}
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.certifications}
                icon="award"
                open={openSection === "certifications"}
                onToggle={() => toggleSection("certifications")}
              >
                <CertificationsForm
                  items={profile.certifications}
                  actions={profileController.certifications}
                  dictionary={dictionary}
                  locale={dictionary.locale}
                />
              </AccordionSection>

              <AccordionSection
                title={dictionary.sections.projects}
                icon="folder"
                open={openSection === "projects"}
                onToggle={() => toggleSection("projects")}
              >
                <ProjectsForm
                  items={profile.projects}
                  actions={profileController.projects}
                  dictionary={dictionary}
                  jobAd=""
                />
              </AccordionSection>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
