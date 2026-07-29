import { useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import { useCvData } from "../hooks/useCvData";
import { usePreviewScale } from "../hooks/usePreviewScale";
import { CvPreview } from "../components/CvPreview";
import type { CvPreviewHandle } from "../components/CvPreview";
import { Icon } from "../components/Icon";
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
import { createEmptyCvData } from "../data/defaultData";
import "./BuilderPage.css";

type SectionId =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects"
  | "design";

export function BuilderPage({
  dictionary,
  language,
  onLanguageChange,
  onGoHome,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  onGoHome: () => void;
}) {
  const cv = useCvData();
  const { containerRef, scale } = usePreviewScale();
  const [openSection, setOpenSection] = useState<SectionId>("personalInfo");
  const [isDownloading, setIsDownloading] = useState(false);
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
    } finally {
      setIsDownloading(false);
    }
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
          <button type="button" className="builder-ghost-button" onClick={handleStartOver}>
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
              showPhoto={cv.data.showPhoto}
              onChange={cv.updatePersonalInfo}
              onPhotoChange={cv.setPhoto}
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
            title={dictionary.sections.languages}
            icon="languages"
            open={openSection === "languages"}
            onToggle={() => toggleSection("languages")}
          >
            <LanguagesForm items={cv.data.languages} actions={cv.languages} dictionary={dictionary} />
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
            <ProjectsForm items={cv.data.projects} actions={cv.projects} dictionary={dictionary} />
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.design}
            icon="star"
            open={openSection === "design"}
            onToggle={() => toggleSection("design")}
          >
            <DesignForm themeColor={cv.data.themeColor} onChange={cv.setThemeColor} dictionary={dictionary} />
          </AccordionSection>
        </div>

        <div className="builder-preview" ref={containerRef}>
          <div className="builder-preview-scaled" style={{ zoom: scale }}>
            <CvPreview data={cv.data} dictionary={dictionary} ref={previewRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
