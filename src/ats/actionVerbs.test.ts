import { describe, it, expect } from "vitest";
import { actionVerbRatio, startsWithActionVerb } from "./actionVerbs";

/** The exact bullets that used to score 0%: every one opens with a real
 *  action verb, and none of them was in the old fixed word list. */
const REGRESSION_EN = [
  "Coordinated a team of 6 engineers across two product squads",
  "Operated and monitored the production Kubernetes cluster daily",
  "Taught onboarding workshops for 20 new joiners each quarter",
  "Wrote the internal API documentation used by every team",
  "Executed the migration from MySQL to PostgreSQL with zero downtime",
  "Performed code reviews on 40+ pull requests per month",
  "Conducted user research interviews with 15 enterprise customers",
  "Collaborated with design to ship the new checkout flow",
  "Deployed the service to AWS using Terraform and GitHub Actions",
];

describe("startsWithActionVerb — English", () => {
  it.each(REGRESSION_EN)("accepts %s", (bullet) => {
    expect(startsWithActionVerb(bullet)).toBe(true);
  });

  it("matches every tense of the same verb from one stem", () => {
    expect(startsWithActionVerb("Manage the rota")).toBe(true);
    expect(startsWithActionVerb("Managed the rota")).toBe(true);
    expect(startsWithActionVerb("Managing the rota")).toBe(true);
  });

  it("still rejects the phrasings the rule exists to catch", () => {
    expect(startsWithActionVerb("Responsible for the weekly rota")).toBe(false);
    expect(startsWithActionVerb("Duties included cleaning the machines")).toBe(false);
    expect(startsWithActionVerb("My role was to greet customers")).toBe(false);
  });

  it("ignores a leading bullet glyph or list number", () => {
    expect(startsWithActionVerb("• Delivered the project on time")).toBe(true);
    expect(startsWithActionVerb("- Delivered the project on time")).toBe(true);
    expect(startsWithActionVerb("1. Delivered the project on time")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(startsWithActionVerb("DELIVERED the project")).toBe(true);
  });
});

describe("startsWithActionVerb — Greek", () => {
  it("accepts the first-person past forms", () => {
    expect(startsWithActionVerb("Ανέπτυξα εφαρμογές σε React")).toBe(true);
    expect(startsWithActionVerb("Υλοποίησα το νέο σύστημα παραγγελιών")).toBe(true);
    expect(startsWithActionVerb("Οργάνωσα το ετήσιο συνέδριο")).toBe(true);
    expect(startsWithActionVerb("Εκπαίδευσα 10 νέους υπαλλήλους")).toBe(true);
  });

  it("accepts the action nouns Greek CVs actually lead with", () => {
    expect(startsWithActionVerb("Διαχείριση ομάδας 6 ατόμων")).toBe(true);
    expect(startsWithActionVerb("Ανάπτυξη εφαρμογών σε TypeScript")).toBe(true);
    expect(startsWithActionVerb("Εξυπηρέτηση πελατών σε καθημερινή βάση")).toBe(true);
    expect(startsWithActionVerb("Επικοινωνία με προμηθευτές εξωτερικού")).toBe(true);
    expect(startsWithActionVerb("Παρακολούθηση αποθέματος και παραγγελιών")).toBe(true);
    expect(startsWithActionVerb("Σχεδίαση και υλοποίηση καμπάνιας")).toBe(true);
  });

  it("matches with the accents dropped, as an all-caps extraction gives them", () => {
    expect(startsWithActionVerb("ΔΙΑΧΕΙΡΙΣΗ ΟΜΑΔΑΣ")).toBe(true);
    expect(startsWithActionVerb("Διαχειριση ομαδας")).toBe(true);
  });

  it("rejects the Greek equivalent of 'responsible for'", () => {
    expect(startsWithActionVerb("Υπεύθυνος για το ταμείο")).toBe(false);
    expect(startsWithActionVerb("Καθήκοντα: καθαριότητα και παραγγελίες")).toBe(false);
  });
});

describe("actionVerbRatio", () => {
  it("scores a fully verb-led list at 1", () => {
    expect(actionVerbRatio(REGRESSION_EN)).toBe(1);
  });

  it("returns 0 for no lines rather than dividing by zero", () => {
    expect(actionVerbRatio([])).toBe(0);
  });

  it("reports the share, not a verdict", () => {
    expect(actionVerbRatio(["Delivered the project", "Responsible for the rota"])).toBe(0.5);
  });
});
