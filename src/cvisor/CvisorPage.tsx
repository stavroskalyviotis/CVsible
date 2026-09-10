import { useMemo, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData, LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { CvPreview } from "../components/CvPreview";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import { usePreviewScale } from "../hooks/usePreviewScale";
import { useProfile } from "../profile/useProfile";
import { saveCvData, setCurrentCloudId } from "../utils/storage";
import { applyDraft, runCvisorAgent } from "./agent";
import type { AgentResult } from "./agent";
import { requestFollowUps } from "./followUps";
import { mapCvisorErrorMessage } from "./errors";
import {
  EMPTY_INTERVIEW,
  SKIPPED,
  buildSteps,
  currentStep,
  experienceStepIds,
  hasEnoughToBuild,
  interviewTarget,
  interviewToBackground,
} from "./interview";
import type { InterviewState, Step, StepAnswer, StepId } from "./interview";
import { interviewToPreviewCv, isPreviewEmpty } from "./interviewPreview";
import { profileToInterview } from "./profileToInterview";
import { StepCard } from "./StepCard";
import "./cvisorShared.css";
import "./CvisorPage.css";

type Phase = "interview" | "building" | "done";

const GROUPS = ["target", "experience", "education", "skills", "extras"] as const;

/** The rail down the side of the conversation. Not a percentage: the number of
 *  questions depends on how many jobs you have, so a bar would either lie or
 *  jump backwards every time you say "yes, there was another one". */
function ProgressRail({ group, dictionary }: { group: Step["group"] | null; dictionary: Dictionary }) {
  const copy = dictionary.cvisorChat;
  const labels: Record<(typeof GROUPS)[number], string> = {
    target: copy.groupTarget,
    experience: copy.groupExperience,
    education: copy.groupEducation,
    skills: copy.groupSkills,
    extras: copy.groupExtras,
  };
  const activeIndex = group ? GROUPS.indexOf(group) : GROUPS.length;

  return (
    <ol className="cvisor-rail">
      {GROUPS.map((id, index) => (
        <li
          key={id}
          className={index < activeIndex ? "done" : index === activeIndex ? "active" : ""}
          aria-current={index === activeIndex ? "step" : undefined}
        >
          <span className="cvisor-rail-dot">
            {index < activeIndex && <Icon name="check" size={11} strokeWidth={3} />}
          </span>
          {labels[id]}
        </li>
      ))}
    </ol>
  );
}

export function CvisorPage({
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
  const copy = dictionary.cvisorChat;
  const { profile } = useProfile();
  const { containerRef: previewContainerRef, scale: previewScale } = usePreviewScale();

  const [state, setState] = useState<InterviewState>(EMPTY_INTERVIEW);
  const [phase, setPhase] = useState<Phase>("interview");
  const [isAsking, setIsAsking] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedProfile, setImportedProfile] = useState(false);

  /** Which earlier question is being looked at again. Page state, not
   *  interview state: the interview records what has been answered, and where
   *  the candidate is standing in it is a different question. */
  const [revisiting, setRevisiting] = useState<StepId | null>(null);

  const steps = buildSteps(state, dictionary);
  const nextUnanswered = currentStep(state, dictionary);
  const step = revisiting ? (steps.find((item) => item.id === revisiting) ?? nextUnanswered) : nextUnanswered;

  const stepIndex = step ? steps.findIndex((item) => item.id === step.id) : steps.length;
  const previousAnswered = steps
    .slice(0, stepIndex === -1 ? steps.length : stepIndex)
    .reverse()
    .find((item) => state.answers[item.id]);

  const previewCv = useMemo(
    () => interviewToPreviewCv(state, profile ? { fullName: profile.personalInfo.fullName } : undefined),
    [state, profile],
  );

  /** After a job is described, ask the model what is missing from it. The
   *  interview carries on regardless if that call fails — the backbone
   *  question was the important one. */
  const fetchFollowUps = async (storyStepId: string, answer: StepAnswer) => {
    const match = /^experience\.(\d+)\.story$/.exec(storyStepId);
    if (!match) return;
    const identity = state.answers[experienceStepIds(Number(match[1])).identity] ?? {};

    setIsAsking(true);
    try {
      const questions = await requestFollowUps({
        role: identity.role ?? "",
        company: identity.company ?? "",
        story: answer.value ?? "",
        jobAd: interviewTarget(state),
        language,
      });
      if (questions.length > 0) {
        setState((current) => ({ ...current, followUps: { ...current.followUps, [storyStepId]: questions } }));
      }
    } finally {
      setIsAsking(false);
    }
  };

  const submit = (answer: StepAnswer) => {
    if (!step) return;
    setState((current) => ({ ...current, answers: { ...current.answers, [step.id]: answer } }));
    // Answering lands you back at the front of the interview, wherever you had
    // stepped back to.
    setRevisiting(null);
    if (/^experience\.\d+\.story$/.test(step.id)) void fetchFollowUps(step.id, answer);
  };

  const skipStep = () => {
    if (!step) return;
    setState((current) => ({ ...current, answers: { ...current.answers, [step.id]: { [SKIPPED]: "1" } } }));
    setRevisiting(null);
  };

  /** The answer stays put — going back shows the question again with what was
   *  typed still in the box, so a small correction does not mean retyping the
   *  lot. Follow-ups already fetched are kept too: re-asking a different
   *  question every time you step back would be maddening. */
  const goBack = () => {
    if (previousAnswered) setRevisiting(previousAnswered.id);
  };

  const importFromProfile = () => {
    if (!profile) return;
    setState((current) => profileToInterview(profile, current, dictionary));
    setImportedProfile(true);
  };

  const build = async () => {
    setError(null);
    setPhase("building");
    try {
      const response = await runCvisorAgent({
        jobAd: interviewTarget(state),
        background: interviewToBackground(state, dictionary),
        language,
      });
      setResult(response);
      setPhase("done");
    } catch (caught) {
      setError(mapCvisorErrorMessage(caught, dictionary));
      setPhase("interview");
    }
  };

  const openInBuilder = () => {
    if (!result) return;
    const base: CvData = profile
      ? { ...previewCv, personalInfo: { ...previewCv.personalInfo, ...profile.personalInfo } }
      : previewCv;
    saveCvData(applyDraft(base, result.draft));
    setCurrentCloudId(null);
    navigate("builder");
  };

  const restart = () => {
    if (!window.confirm(copy.restartConfirm)) return;
    setState(EMPTY_INTERVIEW);
    setRevisiting(null);
    setResult(null);
    setPhase("interview");
    setImportedProfile(false);
  };

  const canBuild = hasEnoughToBuild(state);

  return (
    <div className="cvisor-page">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "cvisor", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={
          <AuthMenu
            dictionary={dictionary}
            onOpenMyCvs={() => navigate("my-cvs")}
            onOpenProfile={() => navigate("profile")}
          />
        }
      />

      <main className="cvisor-main">
        <section className="cvisor-talk">
          <header className="cvisor-talk-head">
            <h1>
              <Icon name="sparkles" size={19} />
              {copy.title}
            </h1>
            <p>{copy.intro}</p>
          </header>

          <ProgressRail group={step?.group ?? null} dictionary={dictionary} />

          {profile && !importedProfile && phase === "interview" && (
            <div className="cvisor-import">
              <div>
                <strong>{copy.importProfile}</strong>
                <span>{copy.importProfileHint}</span>
              </div>
              <button type="button" className="cvisor-ghost" onClick={importFromProfile}>
                <Icon name="download" size={14} />
                {copy.importProfile}
              </button>
            </div>
          )}

          {importedProfile && phase === "interview" && (
            <p className="cvisor-imported">
              <Icon name="check" size={13} strokeWidth={2.8} />
              {copy.importedProfile}
            </p>
          )}

          {error && <p className="cvisor-error">{error}</p>}

          {phase === "interview" && step && (
            <StepCard
              key={step.id}
              step={step}
              initial={state.answers[step.id]}
              dictionary={dictionary}
              canGoBack={previousAnswered !== undefined}
              onBack={goBack}
              onSkip={skipStep}
              onSubmit={submit}
            />
          )}

          {phase === "interview" && !step && (
            <div className="cvisor-ready">
              <h2>{copy.readyTitle}</h2>
              <p>{copy.readyBody}</p>
              {!canBuild && <p className="cvisor-not-enough">{copy.notEnough}</p>}
              <button type="button" className="cvisor-primary" onClick={() => void build()} disabled={!canBuild}>
                <Icon name="sparkles" size={15} />
                {copy.buildButton}
              </button>
            </div>
          )}

          {isAsking && phase === "interview" && (
            <p className="cvisor-asking">
              <span className="cvisor-spinner small" aria-hidden="true" />
              {copy.thinking}
            </p>
          )}

          {phase === "building" && (
            <div className="cvisor-ready">
              <span className="cvisor-spinner" aria-hidden="true" />
              <h2>{dictionary.cvisor.runningTitle}</h2>
              <p>{dictionary.cvisor.runningSteps[0]}</p>
            </div>
          )}

          {phase === "done" && result && (
            <div className="cvisor-ready">
              <h2>{result.verified ? dictionary.cvisor.verified : dictionary.cvisor.unverified}</h2>
              <p>{result.verified ? dictionary.cvisor.verifiedHint : dictionary.cvisor.unverifiedHint}</p>

              {/* The loop gives up after a fixed number of rounds and hands back
                  whatever it has. The grounding check reports rather than
                  strips, so anything still listed here is in the draft the
                  candidate is about to apply — saying "review it" without
                  showing what would be worse than saying nothing. */}
              {result.issues.fabrication.length > 0 && (
                <div className="cvisor-outstanding">
                  <h3>{dictionary.cvisor.fabricationTitle}</h3>
                  <div className="cvisor-chips">
                    {result.issues.fabrication.map((issue) => (
                      <span key={`${issue.field}:${issue.value}`}>{issue.value}</span>
                    ))}
                  </div>
                  <p>{dictionary.cvisor.fabricationHint}</p>
                </div>
              )}

              {result.issues.blocking.length > 0 && (
                <p className="cvisor-outstanding-count">
                  {dictionary.cvisor.blockingLeft.replace("{0}", String(result.issues.blocking.length))}
                </p>
              )}

              <button type="button" className="cvisor-primary" onClick={openInBuilder}>
                <Icon name="arrow-right" size={15} />
                {dictionary.cvisor.apply}
              </button>
            </div>
          )}

          {Object.keys(state.answers).length > 0 && phase === "interview" && (
            <button type="button" className="cvisor-restart" onClick={restart}>
              {copy.restart}
            </button>
          )}
        </section>

        {/* The frame is always mounted, empty or not: it is what the scale hook
            measures itself against, and a page that appears only once there is
            something on it cannot be measured before it appears. Watching a
            blank sheet fill in is also the better version of the empty state. */}
        <section className="cvisor-preview">
          <h2 className="cvisor-preview-title">{copy.previewTitle}</h2>
          {isPreviewEmpty(previewCv) && <p className="cvisor-preview-empty">{copy.previewEmpty}</p>}
          <div className="cvisor-preview-frame" ref={previewContainerRef}>
            <div className="cvisor-preview-scaled" style={{ zoom: previewScale }}>
              <CvPreview data={previewCv} dictionary={dictionary} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
