import { test, expect } from "@playwright/test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "sample-resume.txt");

test.describe("CVscan (ATS check)", () => {
  test("loads with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/#/ats");
    await expect(page.locator(".scan-drop")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("uploading a text resume produces a score, a verdict, and parsed facts", async ({ page }) => {
    await page.goto("/#/ats");
    await page.setInputFiles('input[type="file"]', SAMPLE);

    await expect(page.locator(".scan-verdict")).toBeVisible({ timeout: 10_000 });
    const scoreText = await page.locator(".ats-ring strong, .scan-verdict strong").first().textContent();
    expect(scoreText?.trim()).not.toBe("");

    // The sample resume has an email, so that fact row should surface it.
    await expect(page.locator(".scan-fact", { hasText: /email|e-mail|ηλεκτρονικ/i })).toContainText(
      "jane.smith@example.com",
    );
  });

  test("entering a job ad computes matched/missing keywords", async ({ page }) => {
    await page.goto("/#/ats");
    await page.setInputFiles('input[type="file"]', SAMPLE);
    await expect(page.locator(".scan-verdict")).toBeVisible({ timeout: 10_000 });

    await page.locator("#scan-job-ad").fill("Looking for a React and GraphQL engineer with strong TypeScript skills.");
    await expect(page.locator(".scan-chip").first()).toBeVisible();
  });

  test("'change file' resets back to the upload screen", async ({ page }) => {
    await page.goto("/#/ats");
    await page.setInputFiles('input[type="file"]', SAMPLE);
    await expect(page.locator(".scan-verdict")).toBeVisible({ timeout: 10_000 });

    await page.locator(".scan-change").click();
    await expect(page.locator(".scan-drop")).toBeVisible();
  });

  test("a builder CV with warnings offers a CVisor CTA (not CVfix) and opens CVisor", async ({ page }) => {
    await page.goto("/#/builder");
    // Personal info is the section open by default — no need to toggle it.
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Jane Smith");
    await page.locator(".accordion-header", { hasText: /professional summary|επαγγελματικό προφίλ/i }).click();
    await page.locator(".rich-text-input").click();
    await page.keyboard.type(
      "Experienced engineer with a strong background in building scalable web applications.",
    );

    await page.locator(".ats-chip-button").click();
    await expect(page).toHaveURL(/#\/ats/);
    await page.getByRole("button", { name: /check the cv i.m building|έλεγξε το βιογραφικό που φτιάχνω/i }).click();
    await expect(page.locator(".scan-verdict")).toBeVisible();

    // Restructuring (CVfix) makes no sense for a CV that's already structured
    // in the builder — CVisor (content suggestions) is the correct CTA here.
    await expect(page.locator(".cvfix-card")).toHaveCount(0);
    const cta = page.locator(".scan-cta", { hasText: /cvisor/i });
    await expect(cta).toBeVisible();

    await cta.getByRole("button").click();
    await expect(page).toHaveURL(/#\/builder/);
    await expect(page.locator(".cvisor-overlay")).toBeVisible();
  });
});
