import { useCallback, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { CvPreview } from "../components/CvPreview";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import { normalizeCvData } from "../data/normalize";
import { loadCvData, saveCvData, setCurrentCloudId } from "../utils/storage";
import { AtsAxisCards } from "../ats/AtsAxisCards";
import { passesAts } from "../ats/analyze";
import type { AtsCheck } from "../ats/analyze";
import { analyzeResumeText } from "../ats/analyzeText";
import type { ResumeAnalysis } from "../ats/analyzeText";
import { cvToExtractedResume } from "../ats/cvToResume";
import { CvFixCard } from "../cvisor/CvFixCard";
import { CvFixWindow } from "../cvfix/CvFixWindow";
import { useCvisorJobAd } from "../cvisor/useCvisorJobAd";
import { ACCEPTED_RESUME_TYPES, extractResume, ResumeReadError } from "../ats/extractResume";
import type { ExtractedResume } from "../ats/extractResume";
import "./AtsScanPage.css";

const STATUS_ICON = { pass: "check", warn: "alert", fail: "x-circle", unknown: "more" } as const;

function format(template: string, value: string | number | undefined): string {
  return template.replace("{v}", String(value ?? ""));
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CheckRow({ check, dictionary }: { check: AtsCheck; dictionary: Dictionary }) {
  const copy = dictionary.ats.checks[check.id];
  return (
    <li className={`scan-check scan-check-${check.status}`}>
      <span className="scan-check-icon">
        <Icon name={STATUS_ICON[check.status]} size={13} strokeWidth={2.6} />
      </span>
      <span className="scan-check-body">
        <span className="scan-check-label">{copy.label}</span>
        <span className="scan-check-detail">
          {check.status === "unknown"
            ? dictionary.ats.notEvaluated
            : format(check.status === "pass" ? copy.ok : copy.bad, check.value)}
        </span>
      </span>
    </li>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="scan-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CheckGroup({
  title,
  tone,
  checks,
  dictionary,
}: {
  title: string;
  tone: "fail" | "warn" | "pass" | "unknown";
  checks: AtsCheck[];
  dictionary: Dictionary;
}) {
  if (checks.length === 0) return null;
  return (
    <div className="scan-check-group">
      <h3 className={`scan-group-title scan-group-${tone}`}>
        {title} <span className="scan-count">{checks.length}</span>
      </h3>
      <ul className="scan-check-list">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} dictionary={dictionary} />
        ))}
      </ul>
    </div>
  );
}

/** Renders the stored CV off-screen purely to learn how many pages it makes,
 *  so the builder source is measured rather than guessed. */
function HiddenPageCounter({
  data,
  dictionary,
  onPageCountChange,
}: {
  data: CvData;
  dictionary: Dictionary;
  onPageCountChange: (count: number) => void;
}) {
  return (
    <div aria-hidden="true" className="scan-offscreen">
      <CvPreview data={data} dictionary={dictionary} onPageCountChange={onPageCountChange} />
    </div>
  );
}

export function AtsScanPage({
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
  const [uploaded, setUploaded] = useState<ExtractedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jobAd, setJobAd] = useCvisorJobAd();
  const [copied, setCopied] = useState(false);

  const [builderData, setBuilderData] = useState<CvData | null>(null);
  const [builderPages, setBuilderPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** The document CVfix is reviewing, once one has been chosen. For an upload
   *  this is the structured version; `extraSource` keeps the raw extraction
   *  available, since it holds detail the structuring dropped. */
  const [fixTarget, setFixTarget] = useState<{ cv: CvData; extraSource?: string } | null>(null);

  const storedCv = useMemo(() => {
    const stored = loadCvData<Partial<CvData>>();
    if (!stored) return null;
    const normalized = normalizeCvData(stored);
    const hasContent =
      normalized.personalInfo.fullName.trim() !== "" ||
      normalized.experience.length > 0 ||
      normalized.education.length > 0;
    return hasContent ? normalized : null;
  }, []);

  const handleBuilderPages = useCallback((count: number) => setBuilderPages(count), []);

  // Either an uploaded document, or the stored CV rendered into the same shape.
  // Derived rather than stored, so the builder source re-measures itself when
  // the off-screen preview reports a new page count.
  const resume: ExtractedResume | null = useMemo(() => {
    if (uploaded) return uploaded;
    if (builderData) return cvToExtractedResume(builderData, dictionary, builderPages);
    return null;
  }, [uploaded, builderData, builderPages, dictionary]);

  const analysis: ResumeAnalysis | null = useMemo(
    () => (resume ? analyzeResumeText(resume, jobAd) : null),
    [resume, jobAd],
  );

  const readFile = async (file: File) => {
    setIsBusy(true);
    setError(null);
    setBuilderData(null);
    try {
      setUploaded(await extractResume(file));
    } catch (caught) {
      const code = caught instanceof ResumeReadError ? caught.message : "unreadable";
      setError(
        code === "too-large"
          ? dictionary.ats.errorTooLarge
          : code === "unsupported"
            ? dictionary.ats.errorUnsupported
            : dictionary.ats.errorUnreadable,
      );
      setUploaded(null);
    } finally {
      setIsBusy(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  const reset = () => {
    setUploaded(null);
    setBuilderData(null);
    setError(null);
  };

  const copyText = async () => {
    if (!resume) return;
    await navigator.clipboard.writeText(resume.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const passes = analysis ? passesAts(analysis) : false;

  return (
    <div className="scan-page">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "ats", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={
          <AuthMenu
            dictionary={dictionary}
            onOpenMyCvs={() => navigate("my-cvs")}
            onOpenProfile={() => navigate("profile")}
          />
        }
      />

      {builderData && (
        <HiddenPageCounter
          data={builderData}
          dictionary={dictionary}
          onPageCountChange={handleBuilderPages}
        />
      )}

      <main className="scan-main">
        <header className="scan-intro">
          <h1>{dictionary.ats.title}</h1>
          <p>{dictionary.ats.subtitle}</p>
        </header>

        {!resume && (
          <section className="scan-input">
            <div
              className={`scan-drop ${isDragging ? "dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <span className="scan-drop-icon">
                <Icon name="upload" size={26} />
              </span>
              <strong>{isDragging ? dictionary.ats.dropActive : dictionary.ats.dropTitle}</strong>
              <span className="scan-drop-hint">{dictionary.ats.dropHint}</span>
              <button
                type="button"
                className="scan-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                {isBusy ? dictionary.ats.analyzing : dictionary.ats.browse}
              </button>
              <span className="scan-supported">{dictionary.ats.supported}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_RESUME_TYPES}
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void readFile(file);
                }}
              />
            </div>

            {error && <p className="scan-error">{error}</p>}

            {storedCv && (
              <div className="scan-alt">
                <span className="scan-or">{dictionary.ats.orUpload}</span>
                <button type="button" className="scan-secondary" onClick={() => setBuilderData(storedCv)}>
                  <Icon name="file-text" size={15} />
                  {dictionary.ats.useMyCv}
                </button>
                <p className="scan-hint">{dictionary.ats.useMyCvHint}</p>
              </div>
            )}

            <p className="scan-privacy">
              <Icon name="shield" size={14} />
              {dictionary.ats.privacy}
            </p>
          </section>
        )}

        {resume && analysis && (
          <>
            {/* No single blended score here: the three axes below answer
                three different questions, and averaging them produced a
                number that needed a caption to explain what it meant. What
                stays is the verdict, which is not a score at all — it is
                whether anything critical failed. */}
            <section className={`scan-verdict ${passes ? "passes" : "fails"}`}>
              <span className={`scan-verdict-mark ${passes ? "ok" : "bad"}`} aria-hidden="true">
                <Icon name={passes ? "check" : "alert"} size={30} strokeWidth={2.4} />
              </span>
              <div className="scan-verdict-text">
                <strong>{passes ? dictionary.ats.verdictPass : dictionary.ats.verdictFail}</strong>
                <span>{passes ? dictionary.ats.verdictPassHint : dictionary.ats.verdictFailHint}</span>
                <span className="scan-source">
                  {resume.kind === "builder" ? dictionary.ats.sourceBuilder : resume.fileName}
                </span>
              </div>
              <button type="button" className="scan-secondary scan-change" onClick={reset}>
                <Icon name="refresh" size={14} />
                {dictionary.ats.changeFile}
              </button>
            </section>

            <AtsAxisCards report={analysis} dictionary={dictionary} />

            <section className="scan-card">
              <label className="scan-label" htmlFor="scan-job-ad">
                {dictionary.ats.jobAdLabel}
              </label>
              <textarea
                id="scan-job-ad"
                className="scan-textarea"
                rows={4}
                value={jobAd}
                placeholder={dictionary.ats.jobAdPlaceholder}
                onChange={(event) => setJobAd(event.target.value)}
              />
              <p className="scan-hint">{dictionary.ats.jobAdHint}</p>
            </section>

            <div className="scan-columns">
              <section className="scan-card">
                <h2>{dictionary.ats.checksTitle}</h2>
                <CheckGroup
                  title={dictionary.ats.blocking}
                  tone="fail"
                  checks={analysis.checks.filter((check) => check.status === "fail")}
                  dictionary={dictionary}
                />
                <CheckGroup
                  title={dictionary.ats.warnings}
                  tone="warn"
                  checks={analysis.checks.filter((check) => check.status === "warn")}
                  dictionary={dictionary}
                />
                <CheckGroup
                  title={dictionary.ats.passing}
                  tone="pass"
                  checks={analysis.checks.filter((check) => check.status === "pass")}
                  dictionary={dictionary}
                />
                <CheckGroup
                  title={dictionary.ats.notEvaluatedGroupTitle}
                  tone="unknown"
                  checks={analysis.checks.filter((check) => check.status === "unknown")}
                  dictionary={dictionary}
                />
              </section>

              <div className="scan-side">
                <section className="scan-card">
                  <h2>{dictionary.ats.parsedTitle}</h2>
                  <p className="scan-hint scan-hint-top">{dictionary.ats.parsedHint}</p>
                  <dl className="scan-facts">
                    <FactRow
                      label={dictionary.ats.parsedName}
                      value={analysis.fields.name ?? dictionary.ats.notFound}
                    />
                    <FactRow
                      label={dictionary.ats.parsedEmail}
                      value={analysis.fields.emails.join(", ") || dictionary.ats.notFound}
                    />
                    <FactRow
                      label={dictionary.ats.parsedPhone}
                      value={analysis.fields.phones.join(", ") || dictionary.ats.notFound}
                    />
                    <FactRow
                      label={dictionary.ats.parsedLinks}
                      value={analysis.fields.urls.join("\n") || dictionary.ats.notFound}
                    />
                    <FactRow
                      label={dictionary.ats.parsedSections}
                      value={
                        analysis.fields.sections.map((section) => section.heading).join(" · ") ||
                        dictionary.ats.notFound
                      }
                    />
                    <FactRow
                      label={dictionary.ats.parsedDates}
                      value={analysis.fields.dateRanges.join(" · ") || dictionary.ats.notFound}
                    />
                  </dl>
                </section>

                <section className="scan-card">
                  <h2>{dictionary.ats.documentTitle}</h2>
                  <dl className="scan-facts">
                    <FactRow label={dictionary.ats.docType} value={resume.kind.toUpperCase()} />
                    <FactRow label={dictionary.ats.docPages} value={String(resume.pageCount)} />
                    <FactRow label={dictionary.ats.docWords} value={String(analysis.fields.wordCount)} />
                    <FactRow
                      label={dictionary.ats.docCharacters}
                      value={String(resume.text.length)}
                    />
                    <FactRow
                      label={dictionary.ats.docTextLayer}
                      value={resume.hasTextLayer ? dictionary.ats.yes : dictionary.ats.no}
                    />
                    <FactRow label={dictionary.ats.docColumns} value={String(resume.multiColumnPages)} />
                    <FactRow label={dictionary.ats.docImages} value={String(resume.imageCount)} />
                    {resume.fileSize > 0 && (
                      <FactRow label={dictionary.ats.docSize} value={formatBytes(resume.fileSize)} />
                    )}
                    {resume.fonts.length > 0 && (
                      <FactRow label={dictionary.ats.docFonts} value={resume.fonts.join(", ")} />
                    )}
                    {resume.title && <FactRow label={dictionary.ats.docMetaTitle} value={resume.title} />}
                    {resume.author && <FactRow label={dictionary.ats.docMetaAuthor} value={resume.author} />}
                    {resume.producer && (
                      <FactRow label={dictionary.ats.docProducer} value={resume.producer} />
                    )}
                  </dl>
                </section>
              </div>
            </div>

            <section className="scan-card">
              <h2>{dictionary.ats.keywordsTitle}</h2>
              {analysis.keywords ? (
                <>
                  {analysis.keywords.missing.length > 0 && (
                    <>
                      <p className="scan-keywords-label">{dictionary.ats.keywordsMissing}</p>
                      <div className="scan-chip-row">
                        {analysis.keywords.missing.map((keyword) => (
                          <span key={keyword} className="scan-chip scan-chip-missing">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {analysis.keywords.matched.length > 0 && (
                    <>
                      <p className="scan-keywords-label">{dictionary.ats.keywordsCovered}</p>
                      <div className="scan-chip-row">
                        {analysis.keywords.matched.map((keyword) => (
                          <span key={keyword} className="scan-chip scan-chip-matched">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="scan-hint scan-hint-top">{dictionary.ats.noJobAd}</p>
              )}
            </section>

            <section className="scan-card">
              <div className="scan-card-head">
                <h2>{dictionary.ats.textTitle}</h2>
                <button type="button" className="scan-ghost" onClick={() => void copyText()}>
                  <Icon name={copied ? "check" : "file-text"} size={14} />
                  {copied ? dictionary.ats.copied : dictionary.ats.copyText}
                </button>
              </div>
              <p className="scan-hint scan-hint-top">{dictionary.ats.textHint}</p>
              {resume.pageTexts.map((pageText, index) => (
                <div key={index} className="scan-page-text">
                  {resume.pageTexts.length > 1 && (
                    <span className="scan-page-label">
                      {dictionary.ats.pageLabel} {index + 1}
                    </span>
                  )}
                  <pre>{pageText || "—"}</pre>
                </div>
              ))}
            </section>

            {/* CVfix is offered on every report, not only a failing one. It
                used to appear for uploads only, and a passing CV was sent to
                CVisor instead — which rebuilds from scratch rather than fixing
                what is here, and is why acting on the report so often failed to
                move it. An upload needs the verbatim structuring pass first;
                the builder's own CV is already structured. */}
            {resume.kind !== "builder" ? (
              <CvFixCard
                resumeText={resume.text}
                fields={analysis.fields}
                dictionary={dictionary}
                language={language}
                onStructured={(cv) => setFixTarget({ cv, extraSource: resume.text })}
              />
            ) : (
              builderData && (
                <section className="scan-cta">
                  <div>
                    <h2>{dictionary.ats.fixCtaTitle}</h2>
                    <p>{dictionary.ats.fixCtaBody}</p>
                  </div>
                  <button
                    type="button"
                    className="scan-primary"
                    onClick={() => setFixTarget({ cv: builderData })}
                  >
                    <Icon name="zap" size={15} />
                    {dictionary.ats.fixCtaButton}
                  </button>
                </section>
              )
            )}

            <section className="scan-cta">
              <div>
                <h2>{dictionary.ats.buildTitle}</h2>
                <p>{dictionary.ats.buildBody}</p>
              </div>
              <button type="button" className="scan-primary" onClick={() => navigate("builder")}>
                {dictionary.ats.buildButton}
              </button>
            </section>
          </>
        )}
      </main>

      {fixTarget && (
        <CvFixWindow
          onClose={() => setFixTarget(null)}
          cv={fixTarget.cv}
          extraSource={fixTarget.extraSource}
          jobAd={jobAd}
          onJobAdChange={setJobAd}
          language={language}
          dictionary={dictionary}
          onApply={(next) => {
            // The report is read-only; the fixed CV belongs in the editor,
            // where it can be looked at before it goes anywhere.
            saveCvData(next);
            setCurrentCloudId(null);
            navigate("builder");
          }}
        />
      )}
    </div>
  );
}
