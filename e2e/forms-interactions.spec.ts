import { test, expect } from "@playwright/test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { simulateHtml5Drag } from "./helpers/dragDrop";

const AVATAR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "avatar.png");

test.describe("Rich text editor", () => {
  test("bold/italic/underline/bullet-list toolbar buttons format the summary", async ({ page }) => {
    await page.goto("/#/builder");
    await page.locator(".accordion-header", { hasText: /professional summary|επαγγελματικό προφίλ/i }).click();

    const editor = page.locator(".rich-text-input");
    await editor.click();
    await page.keyboard.type("Hello world");
    await page.keyboard.press("Control+a");

    const [boldBtn, italicBtn, underlineBtn, bulletBtn] = [
      page.locator(".rich-text-toolbar button").nth(0),
      page.locator(".rich-text-toolbar button").nth(1),
      page.locator(".rich-text-toolbar button").nth(2),
      page.locator(".rich-text-toolbar button").nth(3),
    ];

    await boldBtn.click();
    await expect(editor.locator("b, strong")).toContainText("Hello world");
    await expect(boldBtn).toHaveClass(/active/);

    await page.keyboard.press("Control+a");
    await italicBtn.click();
    await expect(editor.locator("i, em")).toContainText("Hello world");

    await page.keyboard.press("Control+a");
    await underlineBtn.click();
    await expect(editor.locator("u")).toContainText("Hello world");

    // Bullet list operates on the current block, no need to re-select.
    await bulletBtn.click();
    await expect(editor.locator("ul li")).toContainText("Hello world");

    // The formatted HTML should also have reached the live preview.
    await expect(page.locator(".builder-preview")).toContainText("Hello world");
  });
});

test.describe("Photo upload", () => {
  test("uploads a photo, drags to reposition it, then removes it", async ({ page }) => {
    await page.goto("/#/builder");
    await page.setInputFiles(".photo-upload input[type='file']", AVATAR);

    const preview = page.locator(".photo-upload-preview");
    await expect(preview).toBeVisible();
    await expect(page.locator(".photo-upload-preview-wrap")).toHaveClass(/photo-upload-draggable/);

    const box = await page.locator(".photo-upload-preview-wrap").boundingBox();
    if (!box) throw new Error("photo preview has no bounding box");
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    const before = await preview.evaluate((el) => (el as HTMLElement).style.objectPosition);
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x + 30, center.y + 20, { steps: 5 });
    await page.mouse.up();
    const after = await preview.evaluate((el) => (el as HTMLElement).style.objectPosition);
    expect(after).not.toBe(before);

    await page.getByRole("button", { name: /remove photo|αφαίρεση φωτογραφίας/i }).click();
    await expect(page.locator(".photo-upload-placeholder")).toBeVisible();
  });
});

test.describe("Entry drag-reorder", () => {
  test("dragging an experience entry's handle onto another reorders them", async ({ page }) => {
    await page.goto("/#/builder");
    await page.locator(".accordion-header", { hasText: /work experience|εργασιακή εμπειρία/i }).click();

    const addLabel = /^add$|^προσθήκη$/i;
    await page.locator(".add-button", { hasText: addLabel }).click();
    await page.locator(".add-button", { hasText: addLabel }).click();

    const cards = page.locator(".entry-card");
    await expect(cards).toHaveCount(2);
    await cards.nth(0).getByPlaceholder(/job title|τίτλος θέσης/i).fill("First Entry");
    await cards.nth(1).getByPlaceholder(/job title|τίτλος θέσης/i).fill("Second Entry");

    const roleInput = (card: import("@playwright/test").Locator) => card.getByPlaceholder(/job title|τίτλος θέσης/i);
    await expect(roleInput(cards.nth(0))).toHaveValue("First Entry");
    await expect(roleInput(cards.nth(1))).toHaveValue("Second Entry");

    // The drop zone (onDragOver/onDrop) is the .entry-card container itself, not the handle.
    await simulateHtml5Drag(cards.nth(0).locator(".entry-card-handle"), cards.nth(1));

    await expect(roleInput(cards.nth(0))).toHaveValue("Second Entry");
    await expect(roleInput(cards.nth(1))).toHaveValue("First Entry");
  });

  test("dragging a section handle onto another reorders the CV's section order", async ({ page }) => {
    await page.goto("/#/builder");
    await page.locator(".accordion-header", { hasText: /section order|σειρά ενοτήτων/i }).click();

    const items = page.locator(".section-order-list li");
    const firstLabel = await items.nth(0).locator(".section-order-label").textContent();
    const secondLabel = await items.nth(1).locator(".section-order-label").textContent();
    expect(firstLabel).not.toBe(secondLabel);

    await simulateHtml5Drag(items.nth(0).locator(".section-order-handle"), items.nth(1));

    await expect(items.nth(0).locator(".section-order-label")).toHaveText(secondLabel!);
    await expect(items.nth(1).locator(".section-order-label")).toHaveText(firstLabel!);
  });
});

test.describe("Skills form", () => {
  test("adding a skill sets a default level and reflects it in the preview", async ({ page }) => {
    await page.goto("/#/builder");
    await page.locator(".accordion-header", { hasText: /^skills$|^δεξιότητες$/i }).click();

    await page.locator(".add-button", { hasText: /^add$|^προσθήκη$/i }).click();
    await page.getByPlaceholder(/e\.g\. figma|π\.χ\. figma/i).fill("Playwright");

    await expect(page.locator('input[type="range"]')).toHaveValue("70");
    await expect(page.locator(".builder-preview")).toContainText("Playwright");
  });

  test("with an empty skills list and a job ad set, suggests matching skills to add with one tap", async ({
    page,
  }) => {
    await page.goto("/#/builder");
    await page.evaluate(() => {
      localStorage.setItem("cvsible:cvisor-job", "Senior React Developer with Python and Kubernetes experience");
    });
    await page.reload();
    await page.locator(".accordion-header", { hasText: /^skills$|^δεξιότητες$/i }).click();

    const chip = page.locator(".skill-suggestion-chip", { hasText: /react/i });
    await expect(chip).toBeVisible();
    await chip.click();

    await expect(page.locator(".entry-card")).toHaveCount(1);
    await expect(page.getByPlaceholder(/e\.g\. figma|π\.χ\. figma/i)).toHaveValue("React");
    // Once a skill exists, the suggestions are no longer useful clutter.
    await expect(page.locator(".skill-suggestions")).toHaveCount(0);
  });
});

test.describe("Template photo support", () => {
  test("Meridian shows a note instead of the photo uploader", async ({ page }) => {
    await page.goto("/#/builder");
    await page.locator(".accordion-header", { hasText: /appearance|εμφάνιση/i }).click();
    await page.locator(".template-card", { hasText: /meridian/i }).click();

    await page.locator(".accordion-header", { hasText: /personal|προσωπικ/i }).click();
    await page.getByLabel(/show photo|εμφάνιση φωτογραφίας/i).check();

    await expect(page.locator(".photo-upload-note")).toContainText(/does not show a photo|δεν εμφανίζει φωτογραφία/i);
    await expect(page.locator(".photo-upload")).toHaveCount(0);
  });
});
