import { test, expect } from "@playwright/test";

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
});
