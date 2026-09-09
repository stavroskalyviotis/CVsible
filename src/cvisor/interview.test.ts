import { describe, it, expect } from "vitest";
import {
  EMPTY_INTERVIEW,
  SKIPPED,
  buildSteps,
  currentStep,
  educationStepIds,
  experienceStepIds,
  hasEnoughToBuild,
  interviewToBackground,
  interviewTarget,
  isComplete,
  storyStepFor,
} from "./interview";
import type { InterviewState } from "./interview";
import { dictionaries } from "../i18n/translations";

const en = dictionaries.en;
const exp0 = experienceStepIds(0);
const exp1 = experienceStepIds(1);
const edu0 = educationStepIds(0);

function answer(state: InterviewState, id: string, value: Record<string, string>): InterviewState {
  return { ...state, answers: { ...state.answers, [id]: value } };
}

function skip(state: InterviewState, id: string): InterviewState {
  return answer(state, id, { [SKIPPED]: "1" });
}

/** Walks the interview to the point where one job has been described. */
function withOneJob(state: InterviewState = EMPTY_INTERVIEW): InterviewState {
  let next = answer(state, "target", { value: "Barista at a specialty coffee shop" });
  next = answer(next, exp0.identity, { role: "Barista", company: "Coffee Lab", period: "2022 – now" });
  next = answer(next, exp0.story, { value: "Made coffee, ran the till, trained two new people." });
  return next;
}

describe("currentStep", () => {
  it("opens by asking what the CV is for", () => {
    expect(currentStep(EMPTY_INTERVIEW, en)?.id).toBe("target");
  });

  it("moves on once a step is answered", () => {
    const state = answer(EMPTY_INTERVIEW, "target", { value: "Barista" });
    expect(currentStep(state, en)?.id).toBe(exp0.identity);
  });

  /** Skipping has to be different from not-yet-answered, or the interview
   *  loops forever on a question the candidate declined. */
  it("treats an explicit skip as settled", () => {
    const state = skip(EMPTY_INTERVIEW, "target");
    expect(currentStep(state, en)?.id).toBe(exp0.identity);
  });

  it("does not ask about a job before knowing which job", () => {
    const state = answer(EMPTY_INTERVIEW, "target", { value: "Barista" });
    const ids = buildSteps(state, en).map((step) => step.id);
    expect(ids).toContain(exp0.identity);
    expect(ids).not.toContain(exp0.story);
  });

  it("asks what you did once it knows where", () => {
    const state = answer(answer(EMPTY_INTERVIEW, "target", { value: "Barista" }), exp0.identity, {
      role: "Barista",
      company: "Coffee Lab",
      period: "",
    });
    expect(currentStep(state, en)?.id).toBe(exp0.story);
  });

  it("names the job in the question it asks about it", () => {
    const state = answer(answer(EMPTY_INTERVIEW, "target", { value: "x" }), exp0.identity, {
      role: "Shift Supervisor",
      company: "Coffee Lab",
      period: "",
    });
    expect(currentStep(state, en)?.prompt).toContain("Shift Supervisor");
  });
});

describe("follow-up questions", () => {
  it("asks the ones the model wrote, in order, after the story", () => {
    const state: InterviewState = {
      ...withOneJob(),
      followUps: { [exp0.story]: ["How many drinks an hour at peak?", "Did you ever cover for the manager?"] },
    };
    const ids = buildSteps(state, en).map((step) => step.id);
    expect(ids).toContain(exp0.followUp(0));
    expect(ids).toContain(exp0.followUp(1));
    expect(ids.indexOf(exp0.followUp(0))).toBeGreaterThan(ids.indexOf(exp0.story));
    expect(currentStep(state, en)?.prompt).toBe("How many drinks an hour at peak?");
  });

  it("asks none when the model had nothing to add", () => {
    const state = withOneJob();
    expect(currentStep(state, en)?.id).toBe(exp0.more);
  });

  it("knows which story a follow-up belongs to", () => {
    expect(storyStepFor(exp1.followUp(2))).toBe(exp1.story);
    expect(storyStepFor("target")).toBeNull();
  });
});

describe("walking through several jobs", () => {
  it("asks about another job after a yes", () => {
    const state = answer(withOneJob(), exp0.more, { value: en.cvisorChat.yes });
    expect(currentStep(state, en)?.id).toBe(exp1.identity);
  });

  it("moves to education after a no", () => {
    const state = answer(withOneJob(), exp0.more, { value: en.cvisorChat.no });
    expect(currentStep(state, en)?.id).toBe(edu0.identity);
  });

  /** Someone with no work history should still get a CV out of this. */
  it("goes to education when the first job is skipped altogether", () => {
    let state = answer(EMPTY_INTERVIEW, "target", { value: "Barista" });
    state = skip(state, exp0.identity);
    expect(currentStep(state, en)?.id).toBe(edu0.identity);
  });

  it("stops offering more jobs eventually", () => {
    let state = answer(EMPTY_INTERVIEW, "target", { value: "x" });
    for (let index = 0; index < 8; index++) {
      const ids = experienceStepIds(index);
      state = answer(state, ids.identity, { role: `Role ${index}`, company: "Co", period: "" });
      state = answer(state, ids.story, { value: "Did things there for a while." });
      state = answer(state, ids.more, { value: en.cvisorChat.yes });
    }
    const experienceSteps = buildSteps(state, en).filter((step) => step.group === "experience");
    const identities = experienceSteps.filter((step) => step.id.endsWith(".identity"));
    expect(identities.length).toBeLessThanOrEqual(6);
  });
});

describe("the tail of the interview", () => {
  function throughEducation(): InterviewState {
    let state = answer(withOneJob(), exp0.more, { value: en.cvisorChat.no });
    state = answer(state, edu0.identity, { degree: "BSc Hospitality", institution: "AUTH", period: "2018–2022" });
    return answer(state, edu0.more, { value: en.cvisorChat.no });
  }

  it("asks skills, then languages, then extras", () => {
    let state = throughEducation();
    expect(currentStep(state, en)?.id).toBe("skills");
    state = answer(state, "skills", { value: "Espresso, HACCP" });
    expect(currentStep(state, en)?.id).toBe("languages");
    state = answer(state, "languages", { value: "English (good)" });
    expect(currentStep(state, en)?.id).toBe("extras");
  });

  it("is complete once the last question is settled", () => {
    let state = throughEducation();
    state = answer(state, "skills", { value: "Espresso" });
    state = answer(state, "languages", { value: "English" });
    expect(isComplete(state, en)).toBe(false);
    state = skip(state, "extras");
    expect(isComplete(state, en)).toBe(true);
    expect(currentStep(state, en)).toBeNull();
  });
});

describe("interviewToBackground", () => {
  it("labels each answer so the agent knows what it is looking at", () => {
    let state: InterviewState = {
      ...withOneJob(),
      followUps: { [exp0.story]: ["How many people did you train?"] },
    };
    state = answer(state, exp0.followUp(0), { value: "Two, over three months." });
    state = answer(state, exp0.more, { value: en.cvisorChat.no });
    state = answer(state, edu0.identity, { degree: "BSc Hospitality", institution: "AUTH", period: "2018–2022" });
    state = answer(state, "skills", { value: "Espresso, HACCP" });

    const background = interviewToBackground(state, en);
    expect(background).toContain("Job: Barista | Coffee Lab | 2022 – now");
    expect(background).toContain("Made coffee, ran the till");
    // The follow-up is kept with its question, so the answer keeps its meaning.
    expect(background).toContain("How many people did you train? — Two, over three months.");
    expect(background).toContain("Studied: BSc Hospitality | AUTH | 2018–2022");
    expect(background).toContain("Skills: Espresso, HACCP");
  });

  it("leaves out entries that were never filled in", () => {
    const background = interviewToBackground(withOneJob(), en);
    expect(background).not.toContain("Studied");
    expect(background).not.toContain("Skills:");
  });

  it("is empty for an interview that has not started", () => {
    expect(interviewToBackground(EMPTY_INTERVIEW, en)).toBe("");
  });
});

describe("interviewTarget", () => {
  it("returns the job ad or role, and an empty string when skipped", () => {
    expect(interviewTarget(withOneJob())).toBe("Barista at a specialty coffee shop");
    expect(interviewTarget(skip(EMPTY_INTERVIEW, "target"))).toBe("");
  });
});

describe("hasEnoughToBuild", () => {
  it("needs a job that has been described, or some studies", () => {
    expect(hasEnoughToBuild(EMPTY_INTERVIEW)).toBe(false);
    // A job title with nothing said about it is not enough to write from.
    const bare = answer(EMPTY_INTERVIEW, exp0.identity, { role: "Barista", company: "Coffee Lab", period: "" });
    expect(hasEnoughToBuild(bare)).toBe(false);
    expect(hasEnoughToBuild(withOneJob())).toBe(true);
  });

  it("accepts studies alone, for someone with no work history yet", () => {
    const state = answer(EMPTY_INTERVIEW, edu0.identity, {
      degree: "BSc Hospitality",
      institution: "AUTH",
      period: "",
    });
    expect(hasEnoughToBuild(state)).toBe(true);
  });
});
