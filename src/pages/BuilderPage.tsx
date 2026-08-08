import { useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode, MainSectionOrderType, SidebarSectionType } from "../types";
import { useCvData } from "../hooks/useCvData";
import { usePreviewScale } from "../hooks/usePreviewScale";
import { CvPreview } from "../components/CvPreview";
import type { CvPreviewHandle } from "../components/CvPreview";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { AccordionSection } from "../components/ui/AccordionSection";
import { PersonalInfoForm } from "../components/forms/PersonalInfoForm";
import { SummaryForm } from "../components/forms/SummaryForm";
import { ExperienceForm } from "../components/forms/ExperienceForm";
import { EducationForm } from "../components/forms/EducationForm";
import { SkillsForm } from "../components/forms/SkillsForm";
import { LanguagesForm } from "../components/forms/LanguagesForm";
import { CertificationsForm } from "../components/forms/CertificationsForm";
import { ProjectsForm } from "../components/forms/ProjectsForm";
import { DesignForm } from "../components/forms/DesignForm";
import { SimpleNameListForm } from "../components/forms/SimpleNameListForm";
import { SectionOrderList } from "../components/forms/SectionOrderList";
import { createEmptyCvData } from "../data/defaultData";
import { createId } from "../utils/id";
import { CvisorPanel } from "../cvisor/CvisorPanel";
import type { CvisorApplyResult } from "../cvisor/api";
import { useCvisorJobAd } from "../cvisor/useCvisorJobAd";
import "./BuilderPage.css";

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
  | "projects"
  | "sectionOrder"
  | "design";

const SIDEBAR_ICONS: Record<SidebarSectionType, IconName> = {
  skills: "star",
  softSkills: "award",
  languages: "languages",
  interests: "heart",
};

const MAIN_ICONS: Record<MainSectionOrderType, IconName> = {
  experience: "briefcase",
  education: "book",
  projects: "folder",
  certifications: "award",
};

export function BuilderPage({
  dictionary,
  language,
  onLanguageChange,
  onGoHome,
  autoOpenCvisor = false,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  onGoHome: () => void;
  autoOpenCvisor?: boolean;
}) {
  const cv = useCvData();
  const { containerRef, scale } = usePreviewScale();
  const [openSection, setOpenSection] = useState<SectionId>("personalInfo");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCvisorOpen, setIsCvisorOpen] = useState(autoOpenCvisor);
  const [jobAd, setJobAd] = useCvisorJobAd();
  const previewRef = useRef<CvPreviewHandle>(null);

  const toggleSection = (id: SectionId) => setOpenSection((current) => (current === id ? ("" as SectionId) : id));

  const handleStartOver = () => {
    if (window.confirm(dictionary.nav.startOverConfirm)) {
      cv.replaceAll(createEmptyCvData());
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await previewRef.current?.exportPdf();
    } catch {
      window.alert(dictionary.nav.downloadError);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApplyCvisor = (result: CvisorApplyResult) => {
    cv.replaceAll({
      ...cv.data,
      personalInfo: {
        ...cv.data.personalInfo,
        summary: result.summary,
        jobTitle: result.jobTitle ?? cv.data.personalInfo.jobTitle,
      },
      experience: result.experience.map((item) => ({ id: createId(), ...item })),
      education: result.education.map((item) => ({ id: createId(), ...item })),
      skills: result.skills.map((item) => ({ id: createId(), ...item })),
      softSkills: result.softSkills.map((item) => ({ id: createId(), ...item })),
      languages: result.languages.map((item) => ({ id: createId(), ...item })),
      interests: result.interests.map((item) => ({ id: createId(), ...item })),
      certifications: result.certifications.map((item) => ({ id: createId(), ...item })),
      projects: result.projects.map((item) => ({ id: createId(), ...item })),
      themeColor: result.themeColor ?? cv.data.themeColor,
    });
    setOpenSection("summary");
  };

  const sidebarLabels: Record<SidebarSectionType, string> = {
    skills: dictionary.sections.skills,
    softSkills: dictionary.sections.softSkills,
    languages: dictionary.sections.languages,
    interests: dictionary.sections.interests,
  };

  const mainLabels: Record<MainSectionOrderType, string> = {
    experience: dictionary.sections.experience,
    education: dictionary.sections.education,
    projects: dictionary.sections.projects,
    certifications: dictionary.sections.certifications,
  };

  return (
    <div className="builder">
      <header className="builder-topbar">
        <button type="button" className="builder-brand" onClick={onGoHome}>
          <span className="builder-brand-mark">CV</span>
          {dictionary.nav.brand}
        </button>

        <div className="builder-topbar-actions">
          <div className="builder-lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={language === "el" ? "active" : ""}
              onClick={() => onLanguageChange("el")}
            >
              EL
            </button>
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => onLanguageChange("en")}
            >
              EN
            </button>
          </div>
          <div className="builder-topbar-buttons">
            <button type="button" className="builder-cvisor-button" onClick={() => setIsCvisorOpen(true)}>
              <Icon name="sparkles" size={15} />
              {dictionary.cvisor.brand}
            </button>
            <button type="button" className="builder-ghost-button" onClick={handleStartOver}>
              <Icon name="refresh" size={14} />
              {dictionary.nav.startOver}
            </button>
            <button
              type="button"
              className="builder-primary-button"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Icon name="download" size={16} />
              {isDownloading ? dictionary.nav.downloading : dictionary.nav.download}
            </button>
          </div>
        </div>
      </header>

      <div className="builder-body">
        <div className="builder-panel">
          <AccordionSection
            title={dictionary.sections.personalInfo}
            icon="mail"
            open={openSection === "personalInfo"}
            onToggle={() => toggleSection("personalInfo")}
          >
            <PersonalInfoForm
              personalInfo={cv.data.personalInfo}
              photo={cv.data.photo}
              photoPosition={cv.data.photoPosition}
              showPhoto={cv.data.showPhoto}
              onChange={cv.updatePersonalInfo}
              onPhotoChange={cv.setPhoto}
              onPhotoPositionChange={cv.setPhotoPosition}
              onShowPhotoChange={cv.setShowPhoto}
              contactActions={cv.contacts}
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
              summary={cv.data.personalInfo.summary}
              onChange={(summary) => cv.updatePersonalInfo({ summary })}
              dictionary={dictionary}
              jobAd={jobAd}
            />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.experience}
            icon="briefcase"
            open={openSection === "experience"}
            onToggle={() => toggleSection("experience")}
          >
            <ExperienceForm
              items={cv.data.experience}
              actions={cv.experience}
              dictionary={dictionary}
              locale={dictionary.locale}
              jobAd={jobAd}
            />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.education}
            icon="book"
            open={openSection === "education"}
            onToggle={() => toggleSection("education")}
          >
            <EducationForm
              items={cv.data.education}
              actions={cv.education}
              dictionary={dictionary}
              locale={dictionary.locale}
              jobAd={jobAd}
            />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.skills}
            icon="star"
            open={openSection === "skills"}
            onToggle={() => toggleSection("skills")}
          >
            <SkillsForm items={cv.data.skills} actions={cv.skills} dictionary={dictionary} />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.softSkills}
            icon="award"
            open={openSection === "softSkills"}
            onToggle={() => toggleSection("softSkills")}
          >
            <SimpleNameListForm
              items={cv.data.softSkills}
              actions={cv.softSkills}
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
            <LanguagesForm items={cv.data.languages} actions={cv.languages} dictionary={dictionary} />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.interests}
            icon="heart"
            open={openSection === "interests"}
            onToggle={() => toggleSection("interests")}
          >
            <SimpleNameListForm
              items={cv.data.interests}
              actions={cv.interests}
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
              items={cv.data.certifications}
              actions={cv.certifications}
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
            <ProjectsForm items={cv.data.projects} actions={cv.projects} dictionary={dictionary} jobAd={jobAd} />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sectionOrder.title}
            icon="layout"
            open={openSection === "sectionOrder"}
            onToggle={() => toggleSection("sectionOrder")}
          >
            <p className="design-label">{dictionary.sectionOrder.sidebarTitle}</p>
            <SectionOrderList
              items={cv.data.sidebarOrder}
              labels={sidebarLabels}
              icons={SIDEBAR_ICONS}
              onReorder={cv.reorderSidebarSection}
              dragLabel={dictionary.actions.dragReorder}
            />
            <p className="design-label">{dictionary.sectionOrder.mainTitle}</p>
            <SectionOrderList
              items={cv.data.mainOrder}
              labels={mainLabels}
              icons={MAIN_ICONS}
              onReorder={cv.reorderMainSection}
              dragLabel={dictionary.actions.dragReorder}
            />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.design}
            icon="type"
            open={openSection === "design"}
            onToggle={() => toggleSection("design")}
          >
            <DesignForm
              themeColor={cv.data.themeColor}
              onColorChange={cv.setThemeColor}
              density={cv.data.density}
              onDensityChange={cv.setDensity}
              fontFamily={cv.data.fontFamily}
              onFontFamilyChange={cv.setFontFamily}
              dictionary={dictionary}
            />
          </AccordionSection>
        </div>

        <div className="builder-preview" ref={containerRef}>
          <div className="builder-preview-scaled" style={{ zoom: scale }}>
            <CvPreview data={cv.data} dictionary={dictionary} ref={previewRef} />
          </div>
        </div>
      </div>

      <CvisorPanel
        open={isCvisorOpen}
        onClose={() => setIsCvisorOpen(false)}
        dictionary={dictionary}
        language={language}
        jobAd={jobAd}
        onJobAdChange={setJobAd}
        onApply={handleApplyCvisor}
      />
    </div>
  );
}
