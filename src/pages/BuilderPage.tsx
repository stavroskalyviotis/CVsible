import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode, SectionKey } from "../types";
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
import { getTemplate } from "../templates/registry";
import { CvisorPanel } from "../cvisor/CvisorPanel";
import { applyDraft } from "../cvisor/agent";
import type { CvDraft } from "../cvisor/agent";
import { useCvisorJobAd } from "../cvisor/useCvisorJobAd";
import { AtsScoreChip } from "../ats/AtsScoreChip";
import { extractJobAdKeywords } from "../ats/analyze";
import { analyzeResumeText } from "../ats/analyzeText";
import { cvToExtractedResume } from "../ats/cvToResume";
import { downloadCvJson, readCvJson } from "../utils/cvFile";
import { getCurrentCloudId, setCurrentCloudId } from "../utils/storage";
import { AuthMenu } from "../auth/AuthMenu";
import { useAuth } from "../auth/useAuth";
import { isCloudConfigured } from "../lib/supabaseClient";
import { CloudCvError, createCv, updateCvData } from "../cloud/cvStore";
import { SupportBadge } from "../components/SupportBadge";
import { SupportToast } from "../components/SupportToast";
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

const SECTION_ICONS: Record<SectionKey, IconName> = {
  experience: "briefcase",
  education: "book",
  projects: "folder",
  certifications: "award",
  skills: "star",
  softSkills: "award",
  languages: "languages",
  interests: "heart",
};

export function BuilderPage({
  dictionary,
  language,
  onLanguageChange,
  onGoHome,
  onOpenScan,
  onOpenMyCvs,
  autoOpenCvisor = false,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  onGoHome: () => void;
  onOpenScan: () => void;
  onOpenMyCvs: () => void;
  autoOpenCvisor?: boolean;
}) {
  const cv = useCvData();
  const { user } = useAuth();
  const { containerRef, scale } = usePreviewScale();
  const [openSection, setOpenSection] = useState<SectionId>("personalInfo");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCvisorOpen, setIsCvisorOpen] = useState(autoOpenCvisor);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [showSupportToast, setShowSupportToast] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [jobAd, setJobAd] = useCvisorJobAd();
  const previewRef = useRef<CvPreviewHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // The live score runs the same analyser the CVscan page uses, so the number
  // in the toolbar and the full report can never disagree.
  const atsReport = useMemo(
    () => analyzeResumeText(cvToExtractedResume(cv.data, dictionary, pageCount), jobAd),
    [cv.data, dictionary, pageCount, jobAd],
  );
  const handlePageCountChange = useCallback((count: number) => setPageCount(count), []);

  // Only offered while the Skills section is still empty — once the user has
  // added anything of their own, the suggestions would just be clutter.
  const suggestedSkills = useMemo(() => {
    if (cv.data.skills.length > 0 || !jobAd.trim()) return [];
    return extractJobAdKeywords(jobAd, 8);
  }, [cv.data.skills.length, jobAd]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      if (!meta || event.key.toLowerCase() !== "z") return;
      if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) return;
      event.preventDefault();
      if (event.shiftKey) cv.redo();
      else cv.undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cv]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isMenuOpen]);

  const toggleSection = (id: SectionId) => setOpenSection((current) => (current === id ? ("" as SectionId) : id));

  const handleStartOver = () => {
    setIsMenuOpen(false);
    if (window.confirm(dictionary.nav.startOverConfirm)) {
      cv.replaceAll(createEmptyCvData());
      setCurrentCloudId(null);
    }
  };

  const handleExportJson = () => {
    setIsMenuOpen(false);
    downloadCvJson(cv.data);
  };

  const handleImportFile = async (file: File) => {
    try {
      const imported = await readCvJson(file);
      if (window.confirm(dictionary.nav.importConfirm)) {
        cv.replaceAll(imported);
        setCurrentCloudId(null);
        setOpenSection("personalInfo");
      }
    } catch {
      window.alert(dictionary.nav.importError);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await previewRef.current?.exportPdf();
      setShowSupportToast(true);
    } catch {
      window.alert(dictionary.nav.downloadError);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsMenuOpen(false);
    let existingId = getCurrentCloudId();
    setIsSavingToCloud(true);
    try {
      if (existingId) {
        try {
          await updateCvData(existingId, cv.data);
        } catch (error) {
          // The cloud id we had on file no longer resolves to a real, accessible
          // row (deleted elsewhere, or from a stale/previous session) — forget it
          // and fall through to creating a fresh CV instead of silently no-oping.
          if (error instanceof CloudCvError && error.code === "not_found") {
            setCurrentCloudId(null);
            existingId = null;
          } else {
            throw error;
          }
        }
      }
      if (!existingId) {
        const name = window.prompt(dictionary.nav.saveToCloudPromptTitle, cv.data.personalInfo.fullName || "");
        if (name === null) return;
        const created = await createCv(user.id, name.trim() || dictionary.myCvsPage.untitled, cv.data);
        setCurrentCloudId(created.id);
      }
      window.alert(dictionary.nav.savedToCloud);
    } catch (error) {
      if (error instanceof CloudCvError && error.code === "limit_reached") {
        window.alert(dictionary.nav.cloudLimitReached);
      } else {
        window.alert(dictionary.nav.saveToCloudError);
      }
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleApplyCvisor = (draft: CvDraft) => {
    cv.replaceAll(applyDraft(cv.data, draft));
    setOpenSection("summary");
  };

  const sectionLabels: Record<SectionKey, string> = {
    experience: dictionary.sections.experience,
    education: dictionary.sections.education,
    projects: dictionary.sections.projects,
    certifications: dictionary.sections.certifications,
    skills: dictionary.sections.skills,
    softSkills: dictionary.sections.softSkills,
    languages: dictionary.sections.languages,
    interests: dictionary.sections.interests,
  };

  return (
    <div className="builder">
      <header className="builder-topbar">
        <button type="button" className="builder-brand" onClick={onGoHome}>
          <span className="builder-brand-mark">CV</span>
          {dictionary.nav.brand}
        </button>

        <div className="builder-topbar-actions">
          <div className="builder-undo-group">
            <button
              type="button"
              className="builder-icon-button"
              title={dictionary.nav.undo}
              aria-label={dictionary.nav.undo}
              disabled={!cv.canUndo}
              onClick={() => cv.undo()}
            >
              <Icon name="undo" size={16} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="builder-icon-button"
              title={dictionary.nav.redo}
              aria-label={dictionary.nav.redo}
              disabled={!cv.canRedo}
              onClick={() => cv.redo()}
            >
              <Icon name="redo" size={16} strokeWidth={2.2} />
            </button>
          </div>
          {isCloudConfigured && <AuthMenu dictionary={dictionary} onOpenMyCvs={onOpenMyCvs} />}
          <div className="builder-lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={language === "el" ? "active" : ""}
              onClick={() => onLanguageChange("el")}
            >
              GR
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
            <AtsScoreChip score={atsReport.score} label={dictionary.siteNav.scan} onClick={onOpenScan} />
            <button type="button" className="builder-cvisor-button" onClick={() => setIsCvisorOpen(true)}>
              <Icon name="sparkles" size={15} />
              {dictionary.cvisor.brand}
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

            <div className="builder-menu" ref={menuRef}>
              <button
                type="button"
                className="builder-icon-button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                title={dictionary.nav.menu}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <Icon name="more" size={18} strokeWidth={2.6} />
              </button>

              {isMenuOpen && (
                <div className="builder-menu-pop" role="menu">
                  {user && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleSaveToCloud()}
                      disabled={isSavingToCloud}
                    >
                      <Icon name="upload" size={15} />
                      {isSavingToCloud ? dictionary.nav.savingToCloud : dictionary.nav.saveToCloud}
                    </button>
                  )}
                  {user && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenMyCvs();
                      }}
                    >
                      <Icon name="folder" size={15} />
                      {dictionary.siteNav.myCvs}
                    </button>
                  )}
                  <button type="button" role="menuitem" onClick={handleExportJson}>
                    <Icon name="download" size={15} />
                    {dictionary.nav.exportJson}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Icon name="upload" size={15} />
                    {dictionary.nav.importJson}
                  </button>
                  <button type="button" role="menuitem" className="danger" onClick={handleStartOver}>
                    <Icon name="refresh" size={15} />
                    {dictionary.nav.startOver}
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleImportFile(file);
              }}
            />
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
              photoSupported={getTemplate(cv.data.template).photoSupport !== "none"}
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
            <SkillsForm
              items={cv.data.skills}
              actions={cv.skills}
              dictionary={dictionary}
              suggestions={suggestedSkills}
            />
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
            <p className="design-label">{dictionary.sectionOrder.hint}</p>
            <SectionOrderList
              items={cv.data.sectionOrder}
              labels={sectionLabels}
              icons={SECTION_ICONS}
              onReorder={cv.reorderSection}
              dragLabel={dictionary.actions.dragReorder}
            />
            {cv.data.template === "aurora" && (
              <p className="design-hint">{dictionary.sectionOrder.sidebarHint}</p>
            )}
          </AccordionSection>

          <AccordionSection
            title={dictionary.sections.design}
            icon="type"
            open={openSection === "design"}
            onToggle={() => toggleSection("design")}
          >
            <DesignForm
              template={cv.data.template}
              onTemplateChange={cv.setTemplate}
              themeColor={cv.data.themeColor}
              onColorChange={cv.setThemeColor}
              density={cv.data.density}
              onDensityChange={cv.setDensity}
              fontFamily={cv.data.fontFamily}
              onFontFamilyChange={cv.setFontFamily}
              skillDisplay={cv.data.skillDisplay}
              onSkillDisplayChange={cv.setSkillDisplay}
              dictionary={dictionary}
            />
          </AccordionSection>
        </div>

        <div className="builder-preview" ref={containerRef}>
          <div className="builder-preview-scaled" style={{ zoom: scale }}>
            <CvPreview
              data={cv.data}
              dictionary={dictionary}
              onPageCountChange={handlePageCountChange}
              ref={previewRef}
            />
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
        currentCv={cv.data}
        onApply={handleApplyCvisor}
      />

      <SupportBadge dictionary={dictionary} />
      {showSupportToast && (
        <SupportToast dictionary={dictionary} onDismiss={() => setShowSupportToast(false)} />
      )}
    </div>
  );
}
