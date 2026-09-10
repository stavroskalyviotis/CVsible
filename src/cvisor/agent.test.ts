import { describe, it, expect, vi, beforeEach } from "vitest";
import { EMPTY_DRAFT } from "../../api/_lib/draftTypes";
import type { CvDraft } from "./agent";

const postJson = vi.fn();
vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return { ...actual, postJson: (...args: unknown[]) => postJson(...args) };
});

const { runCvisorAgent } = await import("./agent");

interface Issues {
  blocking: string[];
  advice: string[];
  missingKeywords: string[];
  fabrication: { field: string; value: string }[];
}

function step(overrides: { done?: boolean; blocking?: string[]; draft?: Partial<CvDraft> } = {}) {
  return {
    draft: { ...EMPTY_DRAFT, ...overrides.draft } as CvDraft,
    done: overrides.done ?? false,
    issues: {
      blocking: overrides.blocking ?? ["summary is too short."],
      advice: [],
      missingKeywords: [],
      fabrication: [],
    } satisfies Issues,
    remaining: 4,
  };
}

const params = { jobAd: "", background: "Barista at Coffee Lab.", language: "en" as const };

describe("the CVisor round loop", () => {
  beforeEach(() => postJson.mockReset());

  it("stops as soon as the server reports the draft clean", async () => {
    postJson.mockResolvedValueOnce(step({ done: true }));

    const result = await runCvisorAgent(params);
    expect(result.verified).toBe(true);
    expect(result.rounds).toBe(1);
    expect(postJson).toHaveBeenCalledTimes(1);
  });

  it("feeds each round's draft back into the next one", async () => {
    postJson
      .mockResolvedValueOnce(step({ draft: { jobTitle: "Round one" } }))
      .mockResolvedValueOnce(step({ done: true, blocking: [], draft: { jobTitle: "Round two" } }));

    const result = await runCvisorAgent(params);
    expect(result.draft.jobTitle).toBe("Round two");
    // The second request carries the first round's draft.
    expect((postJson.mock.calls[1][1] as { draft?: CvDraft }).draft?.jobTitle).toBe("Round one");
  });

  /** The cap exists so a draft that will not converge cannot bill forever.
   *  Running out is not an error — the CV is still handed over, flagged. */
  it("gives up after the cap and hands back what it has, unverified", async () => {
    let counter = 0;
    postJson.mockImplementation(() => {
      counter += 1;
      // A different complaint each round, so the stall check never fires.
      return Promise.resolve(step({ blocking: [`issue ${counter}`] }));
    });

    const result = await runCvisorAgent(params);
    expect(result.verified).toBe(false);
    expect(result.rounds).toBe(4);
    expect(result.issues.blocking).toEqual(["issue 4"]);
  });

  /** Some blocking issues cannot be fixed from what the candidate gave — no
   *  rewrite invents a date they never mentioned. Re-reading an identical
   *  complaint costs a full model call to reach the same answer. */
  it("stops early when a round changes nothing the critic measures", async () => {
    postJson.mockResolvedValue(step({ blocking: ["experience[0] has no dates."] }));

    const result = await runCvisorAgent(params);
    expect(result.verified).toBe(false);
    // Round one produced the complaint, round two repeated it verbatim.
    expect(result.rounds).toBe(2);
    expect(postJson).toHaveBeenCalledTimes(2);
  });

  it("keeps going while the complaint list is still shrinking", async () => {
    postJson
      .mockResolvedValueOnce(step({ blocking: ["a", "b", "c"] }))
      .mockResolvedValueOnce(step({ blocking: ["a", "b"] }))
      .mockResolvedValueOnce(step({ blocking: ["a"] }))
      .mockResolvedValueOnce(step({ done: true, blocking: [] }));

    const result = await runCvisorAgent(params);
    expect(result.verified).toBe(true);
    expect(result.rounds).toBe(4);
  });

  it("reports each round to the caller as it happens", async () => {
    postJson.mockResolvedValueOnce(step()).mockResolvedValueOnce(step({ done: true, blocking: [] }));

    const seen: [number, boolean][] = [];
    await runCvisorAgent(params, (round, done) => seen.push([round, done]));
    expect(seen).toEqual([
      [1, false],
      [2, true],
    ]);
  });
});
