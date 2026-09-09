import { describe, it, expect } from "vitest";
import * as apiCopy from "./actionVerbs.js";
import * as source from "../../src/ats/actionVerbs";

/** The bug this guards against: the analyser and the CVisor critic each kept
 *  their own action-verb list, the lists drifted, and a CV whose every bullet
 *  opened with a real verb was reported as having none. The copy in api/_lib
 *  exists only because the serverless build cannot import from src/ — so the
 *  one thing that must never happen is the two going out of sync silently. */
describe("api/_lib/actionVerbs is in sync with src/ats/actionVerbs", () => {
  it("has identical English stems", () => {
    expect(apiCopy.ACTION_STEMS_EN).toEqual(source.ACTION_STEMS_EN);
  });

  it("has identical Greek stems", () => {
    expect(apiCopy.ACTION_STEMS_EL).toEqual(source.ACTION_STEMS_EL);
  });

  it("judges the same bullets the same way", () => {
    const samples = [
      "Coordinated a team of six",
      "Executed the database migration",
      "Deployed the service to production",
      "Διαχείριση ομάδας 6 ατόμων",
      "Ανέπτυξα εφαρμογές σε React",
      "Responsible for the weekly rota",
      "Υπεύθυνος για το ταμείο",
    ];

    samples.forEach((sample) => {
      expect(apiCopy.startsWithActionVerb(sample)).toBe(source.startsWithActionVerb(sample));
    });
  });
});
