import { test, expect } from "@playwright/test";
import { addFakeCv, createFakeCvTable, mockSignedIn } from "./helpers/mockCloud";

test.describe("My CVs — loading and error states", () => {
  test("shows a loading state before the CV list resolves", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Slow CV" });
    await mockSignedIn(page, table);

    // Override the GET after mockSignedIn's route so this one wins, and hold
    // the response open long enough to observe the intermediate "Loading…" state.
    await page.route("**/rest/v1/cvs**", async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({ status: 200, json: [...table.rows.values()] });
    });

    await page.goto("/#/my-cvs");
    await expect(page.locator(".mycvs-status")).toContainText(/loading/i);
    await expect(page.locator(".mycvs-list li")).toBeVisible({ timeout: 5000 });
  });

  test("shows a load error and no crash when the CV list request fails", async ({ page }) => {
    const table = createFakeCvTable();
    await mockSignedIn(page, table);

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.route("**/rest/v1/cvs**", async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      await route.fulfill({ status: 500, json: { message: "internal_error" } });
    });

    await page.goto("/#/my-cvs");
    await expect(page.locator(".mycvs-error")).toContainText(/couldn.t load/i);
    expect(errors).toEqual([]);
  });

  test("shows an action error and keeps the list intact when rename fails", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Stable CV" });
    await mockSignedIn(page, table);

    await page.route("**/rest/v1/cvs**", async (route) => {
      if (route.request().method() !== "PATCH") return route.fallback();
      await route.fulfill({ status: 500, json: { message: "internal_error" } });
    });

    await page.goto("/#/my-cvs");
    page.once("dialog", (dialog) => dialog.accept("New Name"));
    await page.locator(".mycvs-list li", { hasText: "Stable CV" }).getByRole("button", { name: /rename/i }).click();

    await expect(page.locator(".mycvs-error")).toContainText(/something went wrong/i);
    // The failed rename must not have silently applied client-side.
    await expect(page.locator(".mycvs-list li", { hasText: "Stable CV" })).toBeVisible();
  });
});
