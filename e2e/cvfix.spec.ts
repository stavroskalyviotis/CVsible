import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "sample-resume.txt");

const CHANGES = [
  {
    id: "c1",
    path: "experience[0].bullets[0]",
    where: "Barista · Coffee Lab",
    before: "Was responsible for the till and the orders.",
    after: "Ran the till and placed the daily orders for the shop.",
    why: "Opens with an action verb instead of 'was responsible for'.",
  },
  {
    id: "c2",
    path: "experience[0].bullets",
    where: "Barista · Coffee Lab",
    before: "",
    after: "Trained two new starters on the espresso machine.",
    why: "You mentioned it but the CV never said so.",
  },
];

async function stubCvFix(page: Page, changes = CHANGES) {
  await page.route("**/api/cvfix", (route) =>
    route.fulfill({
      json: { changes, metrics: { verbRatio: 0.33, bulletCount: 3, keywordRatio: 0.45 }, blocking: 2, remaining: 7 },
    }),
  );
}

async function seedCv(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cvsible:cv-data",
      JSON.stringify({
        personalInfo: { fullName: "Maria P", jobTitle: "Barista", summary: "<p>Hard working.</p>" },
        experience: [
          {
            id: "e1",
            role: "Barista",
            company: "Coffee Lab",
            location: "",
            startDate: "2022-03",
            endDate: "",
            current: true,
            description: "<ul><li>Was responsible for the till and the orders.</li></ul>",
          },
        ],
      }),
    );
  });
}

test.describe("CVfix", () => {
  test.beforeEach(async ({ page }) => {
    await seedCv(page);
    await stubCvFix(page);
  });

  /** The complaint that started this: CVfix used to appear only for uploads,
   *  and it opened CVisor rather than a window of its own. */
  test("is reachable from the builder toolbar and opens its own window", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");

    await page.locator(".builder-cvisor-button").click();
    await expect(page.locator(".cvfix-window")).toBeVisible();
    // Its own window, not CVisor's, and it stays on this page.
    await expect(page.locator(".cvisor-step")).toHaveCount(0);
    await expect(page).toHaveURL(/#\/builder/);
  });

  test("shows what each change replaces, and the numbers it is moving", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-cvisor-button").click();

    const first = page.locator(".cvfix-change").first();
    await expect(first.locator(".cvfix-diff-before")).toContainText("Was responsible for the till");
    await expect(first.locator(".cvfix-diff-after")).toContainText("Ran the till");
    await expect(first).toContainText("action verb");

    // An addition has nothing to strike through.
    const second = page.locator(".cvfix-change").nth(1);
    await expect(second.locator(".cvfix-diff-before")).toHaveCount(0);

    await expect(page.locator(".cvfix-metrics")).toContainText("33%");
    await expect(page.locator(".cvfix-metrics")).toContainText("45%");
  });

  test("applies only the changes that were accepted", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-cvisor-button").click();

    // Nothing is pre-accepted, so applying is refused until something is picked.
    await expect(page.getByRole("button", { name: /pick at least one|διάλεξε τουλάχιστον/i })).toBeDisabled();

    await page.locator(".cvfix-change").first().locator(".cvfix-decide.accept").click();
    await page.getByRole("button", { name: /apply 1 change$|εφαρμογή 1 αλλαγής/i }).click();

    await expect(page.locator(".cvfix-window")).toHaveCount(0);
    const preview = page.locator(".builder-preview");
    await expect(preview).toContainText("Ran the till and placed the daily orders");
    // The one that was left pending must not have been applied.
    await expect(preview).not.toContainText("Trained two new starters");
  });

  test("one undo puts the CV back the way it was", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-cvisor-button").click();

    await page.getByRole("button", { name: /select all|επιλογή όλων/i }).click();
    await page.getByRole("button", { name: /apply 2 changes|εφαρμογή 2 αλλαγών/i }).click();

    const preview = page.locator(".builder-preview");
    await expect(preview).toContainText("Trained two new starters");

    await page.locator(".builder-undo-group button").first().click();
    await expect(preview).toContainText("Was responsible for the till");
    await expect(preview).not.toContainText("Trained two new starters");
  });

  test("says so plainly when there is nothing to propose", async ({ page }) => {
    await stubCvFix(page, []);
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-cvisor-button").click();

    await expect(page.locator(".cvfix-window")).toContainText(/nothing worth proposing|δεν βρήκα κάτι/i);
    await expect(page.locator(".cvfix-change")).toHaveCount(0);
  });

  /** An upload has to be untangled into fields before anything can be
   *  addressed at "bullet 2 of role 1", so it goes through the verbatim
   *  structuring pass first and only then reaches the change window. */
  test("an uploaded CV is structured first, then reviewed change by change", async ({ page }) => {
    await page.route("**/api/cvfix-structure", (route) =>
      route.fulfill({
        json: {
          draft: {
            jobTitle: "Barista",
            summary: "Hard working.",
            experience: [
              {
                role: "Barista",
                company: "Coffee Lab",
                location: "",
                startDate: "2022-03",
                endDate: "",
                current: true,
                bullets: ["Was responsible for the till and the orders."],
              },
            ],
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
          issues: { reworded: [], structure: [] },
          remaining: 7,
        },
      }),
    );

    await page.goto("/#/ats");
    await page.setInputFiles('input[type="file"]', SAMPLE);
    await expect(page.locator(".scan-verdict")).toBeVisible({ timeout: 10_000 });

    await page.locator(".cvfix-card button").click();
    await expect(page.locator(".cvfix-window")).toBeVisible();
    await expect(page.locator(".cvfix-change").first()).toContainText("Ran the till");

    await page.locator(".cvfix-change").first().locator(".cvfix-decide.accept").click();
    await page.getByRole("button", { name: /apply 1 change$|εφαρμογή 1 αλλαγής/i }).click();

    // The fixed CV lands in the editor, where it can be looked at.
    await expect(page).toHaveURL(/#\/builder/);
    await expect(page.locator(".builder-preview")).toContainText("Ran the till and placed the daily orders");
  });

  test("offers a job ad and re-runs against it", async ({ page }) => {
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");
    await page.locator(".builder-cvisor-button").click();

    await expect(page.locator(".cvfix-target-row")).toContainText(/no job ad|χωρίς αγγελία/i);

    let sentAd = "";
    await page.route("**/api/cvfix", async (route) => {
      sentAd = (route.request().postDataJSON() as { jobAd?: string }).jobAd ?? "";
      await route.fulfill({
        json: { changes: CHANGES, metrics: { verbRatio: 0.5, bulletCount: 3, keywordRatio: 0.8 }, blocking: 0, remaining: 6 },
      });
    });

    await page.locator(".cvfix-target-edit").click();
    await page.locator("#cvfix-job-ad").fill("Specialty coffee shop seeking a barista with latte art.");
    await page.getByRole("button", { name: /run again|ξανατρέξ/i }).click();

    await expect(page.locator(".cvfix-metrics")).toContainText("80%");
    expect(sentAd).toContain("latte art");
  });
});
