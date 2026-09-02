import { test, expect } from "@playwright/test";
import { addFakeCv, createFakeCvTable, mockCvsRestApi, mockSignedIn } from "./helpers/mockCloud";

// Mirrors src/cloud/cvStore.ts's MAX_CVS_PER_USER. Can't import that module
// directly: it pulls in supabaseClient.ts, which reads import.meta.env —
// a Vite-only global that doesn't exist under Playwright's Node runtime.
const MAX_CVS_PER_USER = 10;

test.describe("My CVs (signed out)", () => {
  test("prompts sign-in instead of listing CVs", async ({ page }) => {
    const table = createFakeCvTable();
    await mockCvsRestApi(page, table); // no session seeded
    await page.goto("/#/my-cvs");
    await expect(page.locator(".mycvs-signin")).toBeVisible();
    await expect(page.locator(".mycvs-list")).toHaveCount(0);
  });
});

test.describe("My CVs (signed in)", () => {
  test("lists saved CVs and opens one into the builder", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Marketing CV" });
    await mockSignedIn(page, table);

    await page.goto("/#/my-cvs");
    const row = page.locator(".mycvs-list li", { hasText: "Marketing CV" });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: /^open$/i }).click();
    await expect(page).toHaveURL(/#\/builder$/);
    await expect(page.locator(".builder-preview")).toContainText("Cloud Test Person");
  });

  test("shows the empty state with no saved CVs", async ({ page }) => {
    const table = createFakeCvTable();
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");
    await expect(page.locator(".mycvs-status")).toContainText(/haven.t saved/i);
  });

  test("renames a CV", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Old Name" });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    page.once("dialog", (dialog) => dialog.accept("New Name"));
    await page.locator(".mycvs-list li", { hasText: "Old Name" }).getByRole("button", { name: /rename/i }).click();

    await expect(page.locator(".mycvs-list li", { hasText: "New Name" })).toBeVisible();
  });

  test("duplicates a CV", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Original" });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    await page.locator(".mycvs-list li", { hasText: "Original" }).getByRole("button", { name: /duplicate/i }).click();
    await expect(page.locator(".mycvs-list li")).toHaveCount(2);
    await expect(page.locator(".mycvs-row-main strong", { hasText: "Original · Duplicate" })).toBeVisible();
  });

  test("deletes a CV after confirming", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Delete Me" });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".mycvs-list li", { hasText: "Delete Me" }).getByRole("button", { name: /delete/i }).click();

    await expect(page.locator(".mycvs-list li")).toHaveCount(0);
  });

  test("blocks creating/duplicating beyond the per-account CV limit", async ({ page }) => {
    // The "at limit" UI check compares against the real MAX_CVS_PER_USER
    // constant, not anything the server enforces, so the fake table needs
    // exactly that many rows for the limit UI to engage.
    const table = createFakeCvTable(MAX_CVS_PER_USER);
    for (let i = 0; i < MAX_CVS_PER_USER; i++) addFakeCv(table, { name: `CV ${i}` });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    await expect(page.locator(".mycvs-limit")).toBeVisible();
    await expect(page.locator(".mycvs-new")).toBeDisabled();
    await expect(page.locator(".mycvs-list li").first().getByRole("button", { name: /duplicate/i })).toBeDisabled();
  });

  test("turns on a public link and copies it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Shareable CV" });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    const row = page.locator(".mycvs-list li", { hasText: "Shareable CV" });
    await row.locator(".mycvs-share-toggle input").click();
    await expect(row.locator(".mycvs-share-toggle")).toContainText(/visible to anyone/i);

    await row.getByRole("button", { name: /copy link/i }).click();
    await expect(row.getByRole("button", { name: /link copied/i })).toBeVisible();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/#\/cv\/[a-f0-9]+$/);
  });

  test("adds and removes an application-tracker entry", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Tracked CV" });
    await mockSignedIn(page, table);
    await page.goto("/#/my-cvs");

    const row = page.locator(".mycvs-list li", { hasText: "Tracked CV" });
    await row.getByRole("button", { name: /application history/i }).click();

    const panel = row.locator(".cv-history-panel");
    await panel.locator("input").first().fill("Acme Corp");
    await panel.getByRole("button", { name: /^add$/i }).click();

    await expect(panel.locator(".cv-history-list")).toContainText("Acme Corp");

    await panel.locator(".cv-history-list").getByRole("button", { name: /remove/i }).click();
    await expect(panel.locator(".cv-history-empty")).toBeVisible();
  });

  test("deletes the account and returns to the landing page", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Doomed CV" });
    await mockSignedIn(page, table);
    await page.route("**/api/delete-account", async (route) => {
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto("/#/my-cvs");
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /delete account/i }).click();

    await expect(page).toHaveURL(/#\/$/);
  });
});
