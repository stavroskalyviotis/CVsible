import { describe, it, expect } from "vitest";
import { profileToInterview, removeImported, profileHasAnything } from "./profileToInterview";
import { EMPTY_INTERVIEW, educationStepIds, experienceStepIds } from "./interview";
import type { InterviewState } from "./interview";
import { createEmptyProfile } from "../data/defaultData";
import { dictionaries } from "../i18n/translations";
import type { UserProfile } from "../types";

const en = dictionaries.en;
const exp0 = experienceStepIds(0);
const exp1 = experienceStepIds(1);
const edu0 = educationStepIds(0);

function profile(): UserProfile {
  return {
    ...createEmptyProfile(),
    experience: [
      {
        id: "job-a",
        role: "Barista",
        company: "Coffee Lab",
        location: "Athens",
        startDate: "2022-03",
        endDate: "",
        current: true,
        description: "<ul><li>Ran the till.</li></ul>",
      },
      {
        id: "job-b",
        role: "Waiter",
        company: "Blue Cafe",
        location: "",
        startDate: "2020-01",
        endDate: "2022-02",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        id: "school-a",
        degree: "BSc Hospitality",
        institution: "AUTH",
        location: "",
        startDate: "2018-09",
        endDate: "2022-06",
        current: false,
        expectedGraduation: "",
        description: "",
      },
    ],
    skills: [
      { id: "s1", name: "Espresso", level: 80, category: "" },
      { id: "s2", name: "HACCP", level: 60, category: "" },
    ],
    languages: [{ id: "l1", name: "English", level: "Good" }],
    projects: [
      { id: "p1", title: "Coffee Tracker", link: "https://x.dev", description: "<p>An app I built.</p>" },
    ],
    certifications: [{ id: "c1", title: "HACCP", issuer: "EFET", date: "2023-05" }],
    interests: [{ id: "i1", name: "Cycling" }],
  };
}

const ALL = {
  experience: ["job-a", "job-b"],
  education: ["school-a"],
  skills: ["s1", "s2"],
  languages: ["l1"],
  projects: ["p1"],
  certifications: ["c1"],
  interests: ["i1"],
};

describe("profileToInterview", () => {
  it("brings over only the entries that were picked", () => {
    const { state } = profileToInterview(profile(), EMPTY_INTERVIEW, en, {
      experience: ["job-b"],
      skills: ["s2"],
    });

    // The chosen job takes the first slot, whatever its position in the profile.
    expect(state.answers[exp0.identity].role).toBe("Waiter");
    expect(state.answers[exp1.identity]).toBeUndefined();
    expect(state.answers.skills.value).toBe("HACCP");
    // Nothing was picked from these, so nothing was written.
    expect(state.answers[edu0.identity]).toBeUndefined();
    expect(state.answers.languages).toBeUndefined();
  });

  it("answers 'another one?' with a no only for the last entry brought over", () => {
    const { state } = profileToInterview(profile(), EMPTY_INTERVIEW, en, ALL);
    expect(state.answers[exp0.more].value).toBe(en.cvisorChat.yes);
    expect(state.answers[exp1.more].value).toBe(en.cvisorChat.no);
  });

  it("uses the job's own description as its story", () => {
    const { state } = profileToInterview(profile(), EMPTY_INTERVIEW, en, ALL);
    expect(state.answers[exp0.story].value).toBe("Ran the till.");
    // The second job has no description, so there is no story to fill in.
    expect(state.answers[exp1.story]).toBeUndefined();
  });

  /** A project reduced to its title gives the agent nothing to write from,
   *  and it may not invent the rest. */
  it("carries a project's link and description, and a certification's date", () => {
    const { state } = profileToInterview(profile(), EMPTY_INTERVIEW, en, ALL);
    expect(state.answers.extras.value).toContain("Coffee Tracker");
    expect(state.answers.extras.value).toContain("https://x.dev");
    expect(state.answers.extras.value).toContain("An app I built.");
    expect(state.answers.extras.value).toContain("EFET");
  });

  /** The profile is a starting point, not an authority. Overwriting something
   *  just typed would be the worst moment to be helpful. */
  it("never overwrites an answer already given", () => {
    const typed: InterviewState = {
      ...EMPTY_INTERVIEW,
      answers: { [exp0.identity]: { role: "Mine", company: "Mine Ltd", period: "" } },
    };
    const { state, imported } = profileToInterview(profile(), typed, en, ALL);
    expect(state.answers[exp0.identity].role).toBe("Mine");
    expect(imported[exp0.identity]).toBeUndefined();
  });

  it("reports exactly what it wrote", () => {
    const { state, imported } = profileToInterview(profile(), EMPTY_INTERVIEW, en, {
      skills: ["s1"],
    });
    expect(Object.keys(imported)).toEqual(["skills"]);
    expect(imported.skills).toEqual(state.answers.skills);
  });

  it("writes nothing when nothing was picked", () => {
    const { state, imported } = profileToInterview(profile(), EMPTY_INTERVIEW, en, {});
    expect(imported).toEqual({});
    expect(state.answers).toEqual({});
  });
});

describe("removeImported", () => {
  it("takes back everything the import wrote", () => {
    const { state, imported } = profileToInterview(profile(), EMPTY_INTERVIEW, en, ALL);
    expect(Object.keys(state.answers).length).toBeGreaterThan(0);
    expect(removeImported(state, imported).answers).toEqual({});
  });

  /** An imported job the candidate then corrected is their answer now, not
   *  the profile's — taking it away would be a second surprise on top of the
   *  one they were trying to fix. */
  it("leaves an imported answer that has since been edited", () => {
    const { state, imported } = profileToInterview(profile(), EMPTY_INTERVIEW, en, ALL);
    const edited: InterviewState = {
      ...state,
      answers: {
        ...state.answers,
        [exp0.identity]: { ...state.answers[exp0.identity], role: "Head Barista" },
      },
    };

    const after = removeImported(edited, imported).answers;
    expect(after[exp0.identity].role).toBe("Head Barista");
    expect(after[exp1.identity]).toBeUndefined();
  });

  it("leaves answers the import never touched", () => {
    const typed: InterviewState = {
      ...EMPTY_INTERVIEW,
      answers: { target: { value: "Barista in Athens" } },
    };
    const { state, imported } = profileToInterview(profile(), typed, en, ALL);
    expect(removeImported(state, imported).answers).toEqual(typed.answers);
  });
});

describe("profileHasAnything", () => {
  it("is false for a profile with nothing the interview can use", () => {
    expect(profileHasAnything(createEmptyProfile())).toBe(false);
    // Soft skills are the one list the interview never asks about.
    expect(
      profileHasAnything({ ...createEmptyProfile(), softSkills: [{ id: "x", name: "Teamwork" }] }),
    ).toBe(false);
  });

  it("is true as soon as one usable section has an entry", () => {
    expect(profileHasAnything(profile())).toBe(true);
  });
});
