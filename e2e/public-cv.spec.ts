import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addFakeCv, createFakeCvTable, mockCvsRestApi } from "./helpers/mockCloud";

test.describe("Public CV page", () => {
  test("shows 'not found' for an unknown link, with no console errors", async ({ page }) => {
    const table = createFakeCvTable();
    await mockCvsRestApi(page, table);

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/#/cv/does-not-exist");
    await expect(page.locator(".public-cv-status")).toContainText(/no longer active|never existed/i);
    expect(errors).toEqual([]);
  });

  test("renders a shared CV and lets the visitor download the PDF", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Shared CV", is_public: true, public_id: "abc123" });
    await mockCvsRestApi(page, table);

    await page.goto("/#/cv/abc123");
    await expect(page.locator(".public-cv-preview")).toContainText("Cloud Test Person");

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      page.getByRole("button", { name: /download pdf/i }).click(),
    ]);
    const savePath = join(test.info().outputDir, "public-cv.pdf");
    await download.saveAs(savePath);
    expect(readFileSync(savePath).byteLength).toBeGreaterThan(1000);
  });

  test("'build your own' returns to the landing page", async ({ page }) => {
    const table = createFakeCvTable();
    addFakeCv(table, { name: "Shared CV", is_public: true, public_id: "abc123" });
    await mockCvsRestApi(page, table);

    await page.goto("/#/cv/abc123");
    await expect(page.locator(".public-cv-preview")).toBeVisible();
    await page.getByRole("button", { name: /build your own/i }).click();
    await expect(page).toHaveURL(/#\/$/);
  });
});
