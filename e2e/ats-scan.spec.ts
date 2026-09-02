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
});
