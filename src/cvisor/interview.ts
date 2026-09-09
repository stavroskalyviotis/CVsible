import type { Dictionary } from "../i18n/translations";

/** The CVisor interview.
 *
 *  The old CVisor asked for everything at once: two large empty textareas, one
 *  for the job and one for "everything about you". People filled them the way
 *  anyone fills a blank box — thinly — and the CV that came back was thin to
 *  match. No amount of prompt work fixes a bad answer to a bad question.
 *
 *  So the intake became a conversation with a fixed backbone: what you are
 *  aiming at, then each job, then studies, then skills. The backbone is ours
 *  because it is the same for everyone and a model rediscovering it each time
 *  is a model that forgets to ask about education. What the model does add is
 *  the follow-ups inside a job — the questions worth asking depend entirely on
 *  what you just said, and those are where the numbers and the scope come from.
 *
 *  Everything here is a pure function of the answers so far, which is what
 *  makes going back safe: nothing is "already asked", a step is simply one
 *  whose answer is missing.
 */

export type FieldKind = "text" | "longtext" | "month";

export interface StepField {
  /** Unique within the step. */
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  optional?: boolean;
}

export type StepId = string;

export interface Step {
  id: StepId;
  /** What CVisor asks, in the candidate's language. */
  prompt: string;
  hint?: string;
  /** One question may still collect a few tightly related facts: asking for a
   *  job title, an employer and a period on three separate screens is not
   *  conversation, it is a form with extra steps. */
  fields: StepField[];
  /** Offered as one-tap answers; the candidate can always type instead. */
  quickChoices?: string[];
  /** Which entry this belongs to, for the progress rail. */
  group: "target" | "experience" | "education" | "skills" | "extras";
  /** True when moving on without answering is allowed. */
  skippable: boolean;
}

export type StepAnswer = Record<string, string>;

export interface InterviewState {
  answers: Record<StepId, StepAnswer>;
  /** Follow-up questions the model wrote, keyed by the step that prompted
   *  them. Kept in state so going back does not re-ask them differently. */
  followUps: Record<StepId, string[]>;
}

export const EMPTY_INTERVIEW: InterviewState = { answers: {}, followUps: {} };

/** How many jobs and schools the interview will walk through before it stops
 *  offering another. Past this the CV is long enough that another entry costs
 *  more than it adds. */
const MAX_ENTRIES = 6;

/** A step the candidate explicitly passed on, recorded so it is not asked
 *  again. Distinct from unanswered, which is simply "not yet". */
export const SKIPPED = "__skipped__";

/** Note the marker is excluded: a skipped step is settled, but it did not
 *  produce an answer, and asking "what did you do there?" about a job the
 *  candidate declined to name is how the old flow felt broken. */
function answered(state: InterviewState, id: StepId): boolean {
  const answer = state.answers[id];
  if (!answer) return false;
  return Object.entries(answer).some(([field, value]) => field !== SKIPPED && value.trim().length > 0);
}

function visited(state: InterviewState, id: StepId): boolean {
  return answered(state, id) || state.answers[id]?.[SKIPPED] === "1";
}

export function experienceStepIds(index: number) {
  return {
    identity: `experience.${index}.identity`,
    story: `experience.${index}.story`,
    followUp: (order: number) => `experience.${index}.followUp.${order}`,
    more: `experience.${index}.more`,
  };
}

export function educationStepIds(index: number) {
  return {
    identity: `education.${index}.identity`,
    more: `education.${index}.more`,
  };
}

/** The id of the step whose answer a follow-up question belongs to. */
export function storyStepFor(followUpId: StepId): StepId | null {
  const match = /^experience\.(\d+)\.followUp\.\d+$/.exec(followUpId);
  return match ? experienceStepIds(Number(match[1])).story : null;
}

const YES = "yes";
const NO = "no";

function yesNo(dictionary: Dictionary): string[] {
  return [dictionary.cvisorChat.yes, dictionary.cvisorChat.no];
}

function saidNo(state: InterviewState, id: StepId, dictionary: Dictionary): boolean {
  const value = state.answers[id]?.value?.trim().toLocaleLowerCase();
  if (!value) return false;
  return value === dictionary.cvisorChat.no.toLocaleLowerCase() || value === NO;
}

function saidYes(state: InterviewState, id: StepId, dictionary: Dictionary): boolean {
  const value = state.answers[id]?.value?.trim().toLocaleLowerCase();
  if (!value) return false;
  return value === dictionary.cvisorChat.yes.toLocaleLowerCase() || value === YES;
}

/** Every step the interview will ask, given what has been answered so far.
 *
 *  Recomputed rather than stored: an interview that remembers its own plan
 *  gets it wrong the moment somebody goes back and changes an answer. */
export function buildSteps(state: InterviewState, dictionary: Dictionary): Step[] {
  const copy = dictionary.cvisorChat;
  const steps: Step[] = [];

  steps.push({
    id: "target",
    prompt: copy.targetPrompt,
    hint: copy.targetHint,
    group: "target",
    skippable: true,
    fields: [{ name: "value", label: copy.targetLabel, kind: "longtext", placeholder: copy.targetPlaceholder }],
  });

  // ------------------------------------------------------------- experience
  for (let index = 0; index < MAX_ENTRIES; index++) {
    const ids = experienceStepIds(index);

    // The second job onwards is only asked for after a yes.
    if (index > 0) {
      const previous = experienceStepIds(index - 1).more;
      if (!saidYes(state, previous, dictionary)) break;
    }

    steps.push({
      id: ids.identity,
      prompt: index === 0 ? copy.firstRolePrompt : copy.nextRolePrompt,
      hint: index === 0 ? copy.firstRoleHint : undefined,
      group: "experience",
      skippable: index === 0,
      fields: [
        { name: "role", label: copy.roleLabel, kind: "text", placeholder: copy.rolePlaceholder },
        { name: "company", label: copy.companyLabel, kind: "text", placeholder: copy.companyPlaceholder },
        { name: "period", label: copy.periodLabel, kind: "text", placeholder: copy.periodPlaceholder, optional: true },
      ],
    });

    // Nothing typed about this job means nothing to ask about it.
    if (!answered(state, ids.identity)) break;

    steps.push({
      id: ids.story,
      prompt: copy.storyPrompt.replace("{0}", state.answers[ids.identity]?.role || copy.thisJob),
      hint: copy.storyHint,
      group: "experience",
      skippable: false,
      fields: [{ name: "value", label: copy.storyLabel, kind: "longtext", placeholder: copy.storyPlaceholder }],
    });

    if (!answered(state, ids.story)) break;

    (state.followUps[ids.story] ?? []).forEach((question, order) => {
      steps.push({
        id: ids.followUp(order),
        prompt: question,
        group: "experience",
        skippable: true,
        fields: [{ name: "value", label: copy.answerLabel, kind: "longtext", placeholder: copy.followUpPlaceholder }],
      });
    });

    steps.push({
      id: ids.more,
      prompt: copy.moreRolesPrompt,
      group: "experience",
      skippable: false,
      quickChoices: yesNo(dictionary),
      fields: [{ name: "value", label: copy.answerLabel, kind: "text" }],
    });

    if (!visited(state, ids.more) || saidNo(state, ids.more, dictionary)) break;
  }

  // -------------------------------------------------------------- education
  const experienceSettled = steps.every((step) => step.group !== "experience" || visited(state, step.id));
  if (experienceSettled) {
    for (let index = 0; index < MAX_ENTRIES; index++) {
      const ids = educationStepIds(index);
      if (index > 0 && !saidYes(state, educationStepIds(index - 1).more, dictionary)) break;

      steps.push({
        id: ids.identity,
        prompt: index === 0 ? copy.firstSchoolPrompt : copy.nextSchoolPrompt,
        hint: index === 0 ? copy.firstSchoolHint : undefined,
        group: "education",
        skippable: true,
        fields: [
          { name: "degree", label: copy.degreeLabel, kind: "text", placeholder: copy.degreePlaceholder },
          { name: "institution", label: copy.institutionLabel, kind: "text", placeholder: copy.institutionPlaceholder },
          { name: "period", label: copy.periodLabel, kind: "text", placeholder: copy.periodPlaceholder, optional: true },
        ],
      });

      if (!answered(state, ids.identity)) break;

      steps.push({
        id: ids.more,
        prompt: copy.moreSchoolsPrompt,
        group: "education",
        skippable: false,
        quickChoices: yesNo(dictionary),
        fields: [{ name: "value", label: copy.answerLabel, kind: "text" }],
      });

      if (!visited(state, ids.more) || saidNo(state, ids.more, dictionary)) break;
    }
  }

  const educationSettled = steps.every((step) => step.group !== "education" || visited(state, step.id));
  if (experienceSettled && educationSettled) {
    steps.push({
      id: "skills",
      prompt: copy.skillsPrompt,
      hint: copy.skillsHint,
      group: "skills",
      skippable: true,
      fields: [{ name: "value", label: copy.skillsLabel, kind: "longtext", placeholder: copy.skillsPlaceholder }],
    });

    steps.push({
      id: "languages",
      prompt: copy.languagesPrompt,
      hint: copy.languagesHint,
      group: "skills",
      skippable: true,
      fields: [{ name: "value", label: copy.languagesLabel, kind: "text", placeholder: copy.languagesPlaceholder }],
    });

    steps.push({
      id: "extras",
      prompt: copy.extrasPrompt,
      hint: copy.extrasHint,
      group: "extras",
      skippable: true,
      fields: [{ name: "value", label: copy.extrasLabel, kind: "longtext", placeholder: copy.extrasPlaceholder }],
    });
  }

  return steps;
}

/** The step to show: the first one with no answer and no explicit skip. */
export function currentStep(state: InterviewState, dictionary: Dictionary): Step | null {
  return buildSteps(state, dictionary).find((step) => !visited(state, step.id)) ?? null;
}

export function isComplete(state: InterviewState, dictionary: Dictionary): boolean {
  return currentStep(state, dictionary) === null;
}

/** Everything the candidate has said, as the block of source material the
 *  agent works from. Labelled, because "Coffee Lab" on its own line tells the
 *  model nothing about whether it is an employer or a school. */
export function interviewToBackground(state: InterviewState, dictionary: Dictionary): string {
  const copy = dictionary.cvisorChat;
  const lines: string[] = [];

  for (let index = 0; index < MAX_ENTRIES; index++) {
    const ids = experienceStepIds(index);
    const identity = state.answers[ids.identity];
    if (!identity || !identity.role?.trim()) continue;

    lines.push(
      `${copy.sourceJob}: ${[identity.role, identity.company, identity.period].filter(Boolean).join(" | ")}`,
    );
    const story = state.answers[ids.story]?.value?.trim();
    if (story) lines.push(story);

    (state.followUps[ids.story] ?? []).forEach((question, order) => {
      const answer = state.answers[ids.followUp(order)]?.value?.trim();
      if (answer) lines.push(`${question} — ${answer}`);
    });
  }

  for (let index = 0; index < MAX_ENTRIES; index++) {
    const identity = state.answers[educationStepIds(index).identity];
    if (!identity || !identity.degree?.trim()) continue;
    lines.push(
      `${copy.sourceStudy}: ${[identity.degree, identity.institution, identity.period].filter(Boolean).join(" | ")}`,
    );
  }

  const skills = state.answers.skills?.value?.trim();
  if (skills) lines.push(`${copy.sourceSkills}: ${skills}`);

  const languages = state.answers.languages?.value?.trim();
  if (languages) lines.push(`${copy.sourceLanguages}: ${languages}`);

  const extras = state.answers.extras?.value?.trim();
  if (extras) lines.push(`${copy.sourceExtras}: ${extras}`);

  return lines.join("\n");
}

export function interviewTarget(state: InterviewState): string {
  return state.answers.target?.value?.trim() ?? "";
}

/** Enough to be worth sending: a job with something said about it, or studies.
 *  Below this the agent has nothing to build from and would have to invent. */
export function hasEnoughToBuild(state: InterviewState): boolean {
  const firstRole = state.answers[experienceStepIds(0).identity];
  const firstStory = state.answers[experienceStepIds(0).story]?.value?.trim();
  const firstSchool = state.answers[educationStepIds(0).identity];
  return Boolean((firstRole?.role?.trim() && firstStory) || firstSchool?.degree?.trim());
}
