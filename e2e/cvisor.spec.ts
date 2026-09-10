import { test, expect } from "@playwright/test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "sample-resume.txt");

/** The follow-up call is the one part of the interview the model drives, so it
 *  is stubbed rather than skipped — the questions have to arrive in the right
 *  place, and a run without them proves nothing about that. */
async function stubFollowUps(page: import("@playwright/test").Page, questions: string[]) {
  await page.route("**/api/cvisor-followup", (route) => route.fulfill({ json: { questions } }));
}

const CONTINUE = /^(continue|συνέχεια)$/i;

test.describe("CVisor", () => {
  test.beforeEach(async ({ page }) => {
    await stubFollowUps(page, []);
    await page.goto("/#/cvisor");
    await expect(page.locator(".cvisor-step-prompt")).toBeVisible();
  });

  test("loads with no console errors and opens on a single question", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.reload();
    await expect(page.locator(".cvisor-step-prompt")).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("each answer lands in the CV beside the questions", async ({ page }) => {
    await page.locator(".cvisor-field textarea").fill("Barista at a specialty coffee shop");
    await page.getByRole("button", { name: CONTINUE }).click();

    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await inputs.nth(2).fill("March 2022 - present");
    await page.getByRole("button", { name: CONTINUE }).click();

    // The preview shows the job before a word of it has been written up.
    const preview = page.locator(".cvisor-preview");
    await expect(preview).toContainText("Coffee Lab");
    await expect(preview).toContainText("Barista");
  });

  /** The catch-all question mixes certifications, projects and interests, and
   *  only the agent sorts them into sections — so the preview cannot draw
   *  them. Leaving them invisible reads as lost, which is exactly how it was
   *  reported. */
  test("confirms the catch-all answers it cannot draw on the page", async ({ page }) => {
    await page.locator(".cvisor-field textarea").fill("Barista");
    await page.getByRole("button", { name: CONTINUE }).click();
    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await page.getByRole("button", { name: CONTINUE }).click();
    await page.locator(".cvisor-field textarea").fill("Made coffee and ran the till every morning.");
    await page.getByRole("button", { name: CONTINUE }).click();

    for (let guard = 0; guard < 12; guard++) {
      const prompt = (await page.locator(".cvisor-step-prompt").textContent()) ?? "";
      if (/anything else|κάτι άλλο που αξίζει/i.test(prompt)) break;
      const skip = page.getByRole("button", { name: /^(skip|προσπέραση)$/i });
      const no = page.locator(".cvisor-choice").nth(1);
      if (await no.count()) await no.click();
      else if (await skip.count()) await skip.click();
      else break;
    }

    await page.locator(".cvisor-field textarea").fill("Coffee Tracker — an app I built\nHACCP certification 2023");
    await page.getByRole("button", { name: CONTINUE }).click();

    const pending = page.locator(".cvisor-preview-pending");
    await expect(pending).toContainText("Coffee Tracker");
    await expect(pending).toContainText("HACCP certification 2023");
  });

  test("goes back to a previous answer without losing it", async ({ page }) => {
    await page.locator(".cvisor-field textarea").fill("Barista at a specialty coffee shop");
    await page.getByRole("button", { name: CONTINUE }).click();
    await expect(page.locator(".cvisor-field input").first()).toBeVisible();

    await page.locator(".cvisor-step-back").click();
    await expect(page.locator(".cvisor-field textarea")).toHaveValue("Barista at a specialty coffee shop");
  });

  test("asks the model's follow-up after a job is described", async ({ page }) => {
    await stubFollowUps(page, ["How many people did you train?"]);

    await page.locator(".cvisor-field textarea").fill("Barista");
    await page.getByRole("button", { name: CONTINUE }).click();

    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await page.getByRole("button", { name: CONTINUE }).click();

    await page.locator(".cvisor-field textarea").fill("Made coffee, ran the till, trained new starters.");
    await page.getByRole("button", { name: CONTINUE }).click();

    await expect(page.locator(".cvisor-step-prompt")).toHaveText("How many people did you train?");
  });

  /** A failed follow-up must never strand the interview: the backbone question
   *  has already been answered and the next one is ours to ask. */
  test("carries on when the follow-up call fails", async ({ page }) => {
    await page.route("**/api/cvisor-followup", (route) => route.fulfill({ status: 500, json: { error: "server_error" } }));

    await page.locator(".cvisor-field textarea").fill("Barista");
    await page.getByRole("button", { name: CONTINUE }).click();

    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await page.getByRole("button", { name: CONTINUE }).click();

    await page.locator(".cvisor-field textarea").fill("Made coffee and ran the till every morning.");
    await page.getByRole("button", { name: CONTINUE }).click();

    // Straight on to "was there another job?", which is a yes/no.
    await expect(page.locator(".cvisor-choice")).toHaveCount(2);
  });

  test("skipping a question moves on instead of asking it again", async ({ page }) => {
    const first = await page.locator(".cvisor-step-prompt").textContent();
    await page.getByRole("button", { name: /^(skip|προσπέραση)$/i }).click();
    await expect(page.locator(".cvisor-step-prompt")).not.toHaveText(first ?? "");
  });

  test("reaches the build step, and refuses to build from nothing", async ({ page }) => {
    // Skip every question there is: the interview should end, but with nothing
    // to write from, so building must stay disabled rather than invent a CV.
    for (let guard = 0; guard < 12; guard++) {
      const skip = page.getByRole("button", { name: /^(skip|προσπέραση)$/i });
      const no = page.locator(".cvisor-choice").nth(1);
      if (await skip.count()) await skip.click();
      else if (await no.count()) await no.click();
      else break;
    }

    await expect(page.locator(".cvisor-ready")).toBeVisible();
    await expect(page.getByRole("button", { name: /build my cv|φτιάξε το βιογραφικό/i })).toBeDisabled();
  });

  /** The loop is capped, so it can hand back a draft that never came clean.
   *  Telling someone "review what's left" while showing them nothing is worse
   *  than saying nothing at all — the grounding check reports rather than
   *  strips, so a survivor is in the CV they are about to apply. */
  test("names what it could not fix when it runs out of rounds", async ({ page }) => {
    await page.route("**/api/cvisor-step", (route) =>
      route.fulfill({
        json: {
          draft: {
            jobTitle: "Barista",
            summary: "A summary.",
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            skills: [],
            softSkills: [],
            languages: [],
            interests: [],
            notes: [],
          },
          done: false,
          issues: {
            blocking: ["experience[0].bullets[0] is too short.", "summary is too short."],
            advice: [],
            missingKeywords: [],
            fabrication: [{ field: "skills[3]", value: "Kubernetes" }],
          },
          metrics: { verbRatio: 0.2, bulletCount: 3, keywordRatio: null },
          remaining: 4,
        },
      }),
    );

    await page.locator(".cvisor-field textarea").fill("Barista");
    await page.getByRole("button", { name: CONTINUE }).click();
    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await page.getByRole("button", { name: CONTINUE }).click();
    await page.locator(".cvisor-field textarea").fill("Made coffee and ran the till every morning.");
    await page.getByRole("button", { name: CONTINUE }).click();

    for (let guard = 0; guard < 12; guard++) {
      const skip = page.getByRole("button", { name: /^(skip|προσπέραση)$/i });
      const no = page.locator(".cvisor-choice").nth(1);
      if (await skip.count()) await skip.click();
      else if (await no.count()) await no.click();
      else break;
    }

    await page.getByRole("button", { name: /build my cv|φτιάξε το βιογραφικό/i }).click();

    // It gives up rather than looping forever, and says so.
    await expect(page.locator(".cvisor-ready")).toContainText(/some issues remain|έμειναν εκκρεμότητες/i, {
      timeout: 20_000,
    });

    // The invented fact is named, by value — not by its internal field path.
    await expect(page.locator(".cvisor-chips")).toContainText("Kubernetes");
    await expect(page.locator(".cvisor-outstanding")).not.toContainText("skills[3]");

    // And the rest is counted rather than dumped as raw checker output.
    await expect(page.locator(".cvisor-outstanding-count")).toContainText("2");

    // The CV is still usable — this is a warning, not a dead end.
    await expect(page.getByRole("button", { name: /apply|εφάρμοσ/i })).toBeEnabled();
  });
});

test.describe("Finding CVisor", () => {
  /** CVfix belongs on the report — it fixes the CV the report is about. But
   *  "or start from scratch" used to open an empty builder, wasting the one
   *  place on that page where starting over is what the reader wants. */
  test("the report offers CVfix for this CV and CVisor for a fresh one", async ({ page }) => {
    await page.goto("/#/ats");
    await page.setInputFiles('input[type="file"]', SAMPLE);
    await expect(page.locator(".scan-verdict")).toBeVisible({ timeout: 10_000 });

    await expect(page.locator(".cvfix-card")).toBeVisible();
    await page.getByRole("button", { name: /start with cvisor|ξεκίνα με τον cvisor/i }).click();
    await expect(page).toHaveURL(/#\/cvisor/);
  });

  test("the builder keeps a way through to CVisor", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-icon-button[aria-haspopup='menu']").click();
    await page.locator("[role='menuitem']", { hasText: /cvisor/i }).click();
    await expect(page).toHaveURL(/#\/cvisor/);
  });

  /** From its own page CVisor writes straight to storage, so there is no undo
   *  to fall back on the way there was when it lived inside the builder. */
  test("asks before replacing a CV that already has something in it", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "cvsible:cv-data",
        JSON.stringify({ personalInfo: { fullName: "Work In Progress" } }),
      );
    });
    await page.route("**/api/cvisor-followup", (route) => route.fulfill({ json: { questions: [] } }));
    await page.route("**/api/cvisor-step", (route) =>
      route.fulfill({
        json: {
          draft: {
            jobTitle: "Barista",
            summary: "s",
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            skills: [],
            softSkills: [],
            languages: [],
            interests: [],
            notes: [],
          },
          done: true,
          issues: { blocking: [], advice: [], missingKeywords: [], fabrication: [] },
          metrics: { verbRatio: 1, bulletCount: 2, keywordRatio: null },
          remaining: 4,
        },
      }),
    );

    await page.goto("/#/cvisor");
    await page.locator(".cvisor-field textarea").fill("Barista");
    await page.getByRole("button", { name: CONTINUE }).click();
    const inputs = page.locator(".cvisor-field input");
    await inputs.nth(0).fill("Barista");
    await inputs.nth(1).fill("Coffee Lab");
    await page.getByRole("button", { name: CONTINUE }).click();
    await page.locator(".cvisor-field textarea").fill("Made coffee and ran the till every morning.");
    await page.getByRole("button", { name: CONTINUE }).click();
    for (let guard = 0; guard < 12; guard++) {
      const skip = page.getByRole("button", { name: /^(skip|προσπέραση)$/i });
      const no = page.locator(".cvisor-choice").nth(1);
      if (await skip.count()) await skip.click();
      else if (await no.count()) await no.click();
      else break;
    }
    await page.getByRole("button", { name: /build my cv|φτιάξε το βιογραφικό/i }).click();
    await expect(page.locator(".cvisor-ready")).toContainText(/passed|πέρασε/i, { timeout: 20_000 });

    // Declining leaves the work in place and goes nowhere.
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /apply|εφάρμοσ/i }).click();
    await expect(page).toHaveURL(/#\/cvisor/);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /apply|εφάρμοσ/i }).click();
    await expect(page).toHaveURL(/#\/builder/);
  });
});
