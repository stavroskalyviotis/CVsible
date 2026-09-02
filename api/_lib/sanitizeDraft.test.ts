import { describe, it, expect } from "vitest";
import { sanitizeDraft } from "./sanitizeDraft";

const LEVELS = ["Βασικό", "Καλό", "Πολύ καλό", "Άριστο", "Μητρική γλώσσα"];

describe("sanitizeDraft", () => {
  it("returns an empty-but-valid draft for garbage input", () => {
    const draft = sanitizeDraft(null, LEVELS);
    expect(draft.summary).toBe("");
    expect(draft.experience).toEqual([]);
  });

  it("trims strings and strips HTML from the summary", () => {
    const draft = sanitizeDraft({ summary: "  <b>Hello</b> world  " }, LEVELS);
    expect(draft.summary).toBe("Hello world");
  });

  it("normalises YYYY-MM dates from common model mistakes", () => {
    const draft = sanitizeDraft(
      {
        experience: [
          { role: "A", company: "B", startDate: "2022-3", endDate: "06/2023", current: false, bullets: [] },
        ],
      },
      LEVELS,
    );
    expect(draft.experience[0].startDate).toBe("2022-03");
    expect(draft.experience[0].endDate).toBe("2023-06");
  });

  it("defaults a bare year to January", () => {
    const draft = sanitizeDraft(
      { experience: [{ role: "A", company: "B", startDate: "2020", current: false, bullets: [] }] },
      LEVELS,
    );
    expect(draft.experience[0].startDate).toBe("2020-01");
  });

  it("drops unparseable dates rather than passing them through", () => {
    const draft = sanitizeDraft(
      { experience: [{ role: "A", company: "B", startDate: "not a date", current: false, bullets: [] }] },
      LEVELS,
    );
    expect(draft.experience[0].startDate).toBe("");
  });

  it("forces endDate empty when current is true, even if the model set one", () => {
    const draft = sanitizeDraft(
      { experience: [{ role: "A", company: "B", startDate: "2022-01", endDate: "2023-01", current: true, bullets: [] }] },
      LEVELS,
    );
    expect(draft.experience[0].endDate).toBe("");
    expect(draft.experience[0].current).toBe(true);
  });

  it("strips leading bullet characters and HTML from bullets, and caps at 5", () => {
    const draft = sanitizeDraft(
      {
        experience: [
          {
            role: "A",
            company: "B",
            bullets: ["- one", "• two <b>bold</b>", "* three", "four", "five", "six (dropped)"],
          },
        ],
      },
      LEVELS,
    );
    expect(draft.experience[0].bullets).toEqual(["one", "two bold", "three", "four", "five"]);
  });

  it("dedupes skills case-insensitively and clamps level to 0-100", () => {
    const draft = sanitizeDraft(
      {
        skills: [
          { name: "React", level: 500 },
          { name: "react", level: 10 },
          { name: "TypeScript", level: -5 },
          { name: "SQL", level: "not-a-number" },
        ],
      },
      LEVELS,
    );
    expect(draft.skills).toEqual([
      { name: "React", level: 100 },
      { name: "TypeScript", level: 0 },
      { name: "SQL", level: 50 },
    ]);
  });

  it("falls back an out-of-enum language level to the middle of the allowed list", () => {
    const draft = sanitizeDraft({ languages: [{ name: "Ισπανικά", level: "Fluent-ish" }] }, LEVELS);
    expect(draft.languages[0].level).toBe(LEVELS[Math.floor(LEVELS.length / 2)]);
  });

  it("keeps a valid language level unchanged", () => {
    const draft = sanitizeDraft({ languages: [{ name: "Αγγλικά", level: "Άριστο" }] }, LEVELS);
    expect(draft.languages[0].level).toBe("Άριστο");
  });

  it("dedupes soft skills and interests case-insensitively, preserving first-seen casing", () => {
    const draft = sanitizeDraft(
      { softSkills: ["Ομαδικότητα", "ΟΜΑΔΙΚΌΤΗΤΑ", "Επικοινωνία"] },
      LEVELS,
    );
    expect(draft.softSkills).toEqual(["Ομαδικότητα", "Επικοινωνία"]);
  });

  it("caps arrays at the maximum list length", () => {
    const many = Array.from({ length: 60 }, (_, i) => `skill-${i}`);
    const draft = sanitizeDraft({ interests: many }, LEVELS);
    expect(draft.interests).toHaveLength(40);
  });

  it("caps notes at 6 entries", () => {
    const notes = Array.from({ length: 10 }, (_, i) => `note ${i}`);
    const draft = sanitizeDraft({ notes }, LEVELS);
    expect(draft.notes).toHaveLength(6);
  });
});
