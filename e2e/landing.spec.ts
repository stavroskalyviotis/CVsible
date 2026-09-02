import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads with no console errors and shows the primary CTA", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/#/");
    await expect(page.locator(".landing-cta").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("navigates to the builder from the primary CTA", async ({ page }) => {
    await page.goto("/#/");
    await page.locator(".landing-cta").first().click();
    await expect(page).toHaveURL(/#\/builder$/);
    await expect(page.locator(".builder-preview")).toBeVisible();
  });

  test("navigates to CVscan from the header", async ({ page }) => {
    await page.goto("/#/");
    await page.locator(".site-nav-link", { hasText: /ATS|Έλεγχος/ }).first().click();
    await expect(page).toHaveURL(/#\/ats$/);
  });

  test("switching the language changes visible text", async ({ page }) => {
    await page.goto("/#/");
    const heading = page.locator("h1").first();
    const before = await heading.textContent();

    const langSwitch = page.locator('[aria-label="Language"]').first();
    // Click whichever of GR/EN is not already active, regardless of the
    // browser-detected default language.
    await langSwitch.locator("button:not(.active)").first().click();

    await expect.poll(async () => heading.textContent()).not.toBe(before);
  });

  test("privacy and terms pages are reachable and render content", async ({ page }) => {
    await page.goto("/#/");
    await page.locator("footer button", { hasText: /privacy|απόρρητ/i }).click();
    await expect(page).toHaveURL(/#\/privacy$/);
    await expect(page.locator("main").first()).toContainText(/./);

    await page.goto("/#/terms");
    await expect(page.locator("body")).not.toContainText(/undefined|\[object Object\]/i);
  });
});
