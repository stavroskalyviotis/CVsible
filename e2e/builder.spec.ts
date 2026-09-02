import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test.describe("Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/builder");
    await expect(page.locator(".builder-preview")).toBeVisible();
  });

  test("loads with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.reload();
    await expect(page.locator(".builder-preview")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("typing a name updates the live preview", async ({ page }) => {
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Jane Smith");
    await expect(page.locator(".builder-preview")).toContainText("Jane Smith");
  });

  test("undo/redo buttons reflect and reverse an edit", async ({ page }) => {
    const undoButton = page.locator(".builder-undo-group button").first();
    const redoButton = page.locator(".builder-undo-group button").nth(1);

    await expect(undoButton).toBeDisabled();
    await expect(redoButton).toBeDisabled();

    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Jane Smith");
    await expect(undoButton).toBeEnabled();

    await undoButton.click();
    await expect(page.locator(".builder-preview")).not.toContainText("Jane Smith");
    await expect(redoButton).toBeEnabled();

    await redoButton.click();
    await expect(page.locator(".builder-preview")).toContainText("Jane Smith");
  });

  test("Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts undo and redo an edit", async ({ page }) => {
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Keyboard Test");
    await expect(page.locator(".builder-preview")).toContainText("Keyboard Test");

    // Blur the input so the shortcut isn't swallowed by the contentEditable/input guard.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Control+z");
    await expect(page.locator(".builder-preview")).not.toContainText("Keyboard Test");

    await page.keyboard.press("Control+Shift+z");
    await expect(page.locator(".builder-preview")).toContainText("Keyboard Test");
  });

  test("switching templates changes the preview without erroring", async ({ page }) => {
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Template Test");
    await page.locator(".accordion-header", { hasText: /appearance|εμφάνιση/i }).click();

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const templateButtons = page.locator(".template-card");
    const count = await templateButtons.count();
    expect(count).toBe(3); // aurora, meridian, atlas
    for (let i = 0; i < count; i++) {
      await templateButtons.nth(i).click();
      await expect(templateButtons.nth(i)).toHaveAttribute("aria-pressed", "true");
      // Some templates render the name in all-caps by design (see uppercaseForDisplay), so match case-insensitively.
      await expect(page.locator(".builder-preview")).toContainText(/template test/i);
    }
    expect(errors).toEqual([]);
  });

  test("exporting and re-importing the CV as JSON round-trips the data", async ({ page }) => {
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Round Trip Person");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(".builder-icon-button[aria-haspopup='menu']").click().then(() =>
        page.locator("[role='menuitem']", { hasText: /save as file|αποθήκευση ως αρχείο/i }).click(),
      ),
    ]);

    const savePath = join(test.info().outputDir, "exported-cv.json");
    await download.saveAs(savePath);
    const exported = JSON.parse(readFileSync(savePath, "utf8"));
    expect(exported.cv.personalInfo.fullName).toBe("Round Trip Person");

    // Start over, then re-import the file we just exported.
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".builder-icon-button[aria-haspopup='menu']").click();
    await page.locator("[role='menuitem']", { hasText: /new resume|νέο βιογραφικό/i }).click();
    await expect(page.locator(".builder-preview")).not.toContainText("Round Trip Person");

    await page.locator(".builder-icon-button[aria-haspopup='menu']").click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator("[role='menuitem']", { hasText: /open a file|άνοιγμα αρχείου/i }).click();
    const fileChooser = await fileChooserPromise;
    page.once("dialog", (dialog) => dialog.accept());
    await fileChooser.setFiles(savePath);

    await expect(page.locator(".builder-preview")).toContainText("Round Trip Person");
  });

  test("downloading the PDF produces a non-empty file with no console errors", async ({ page }) => {
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("PDF Export Test");

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      page.getByRole("button", { name: /download|λήψη/i }).click(),
    ]);

    const savePath = join(test.info().outputDir, "export-test.pdf");
    await download.saveAs(savePath);
    const stats = readFileSync(savePath);
    expect(stats.byteLength).toBeGreaterThan(1000);
    expect(errors).toEqual([]);
  });
});
