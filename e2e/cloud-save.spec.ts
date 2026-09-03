import { test, expect } from "@playwright/test";
import type { Dialog, Page } from "@playwright/test";
import { addFakeCv, createFakeCvTable, mockSignedIn } from "./helpers/mockCloud";

const CLOUD_ID_KEY = "cvsible:cloud-cv-id";

const openMenuAndSave = async (page: Page) => {
  await page.locator(".builder-icon-button[aria-haspopup='menu']").click();
  await page.getByRole("menuitem", { name: /save to my account|αποθήκευση στον λογαριασμό μου/i }).click();
};

/** Auto-answers every dialog raised during the save flow: accepts the name
 *  prompt (when one appears) with `promptAnswer`, and dismisses the final
 *  "saved"/error alert. Records each dialog's type in order for assertions. */
const trackDialogs = (page: Page, promptAnswer: string) => {
  const types: string[] = [];
  page.on("dialog", (dialog: Dialog) => {
    types.push(dialog.type());
    void dialog.accept(dialog.type() === "prompt" ? promptAnswer : undefined);
  });
  return types;
};

test.describe("Save to cloud", () => {
  test("first save on a brand-new CV prompts for a name and creates a cloud row", async ({ page }) => {
    const table = createFakeCvTable();
    await mockSignedIn(page, table);

    await page.goto("/#/builder");
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("New Person");

    const dialogTypes = trackDialogs(page, "My New CV");
    await openMenuAndSave(page);

    // The final "saved" alert fires only after createCv() resolves, so
    // waiting for both dialogs also guarantees the row write has landed.
    await expect.poll(() => dialogTypes.length).toBe(2);
    expect(dialogTypes).toEqual(["prompt", "alert"]);
    expect(table.rows.size).toBe(1);
    expect([...table.rows.values()][0].name).toBe("My New CV");
  });

  test("saving again on an already-saved CV updates it in place with no name prompt", async ({ page }) => {
    const table = createFakeCvTable();
    const row = addFakeCv(table, { name: "Existing CV" });
    await mockSignedIn(page, table);

    await page.goto("/#/builder");
    await page.evaluate(
      ({ key, id }) => localStorage.setItem(key, id),
      { key: CLOUD_ID_KEY, id: row.id },
    );
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Updated Person");

    const dialogTypes = trackDialogs(page, "unused");
    await openMenuAndSave(page);

    await expect.poll(() => dialogTypes.length).toBe(1);
    // No name prompt on an already-saved CV — only the final "saved" alert.
    expect(dialogTypes).toEqual(["alert"]);
    expect(table.rows.size).toBe(1);
    expect(table.rows.get(row.id)?.data.personalInfo.fullName).toBe("Updated Person");
  });

  test("a stale cloud id (e.g. the CV was deleted elsewhere) self-heals instead of silently losing the save", async ({
    page,
  }) => {
    const table = createFakeCvTable();
    await mockSignedIn(page, table);

    await page.goto("/#/builder");
    // Nothing in `table` has this id — mirrors a CV that was deleted (or
    // belonged to a stale/previous session) after the id was cached locally.
    await page.evaluate(
      ({ key, id }) => localStorage.setItem(key, id),
      { key: CLOUD_ID_KEY, id: "e2e-cv-does-not-exist" },
    );
    await page.getByLabel(/full name|ονοματεπώνυμο/i).fill("Recovered Person");

    const dialogTypes = trackDialogs(page, "Recovered CV");
    await openMenuAndSave(page);

    // The save must not silently no-op: a real row should now exist, and the
    // stale id must have prompted for a name just like a first-time save.
    await expect.poll(() => dialogTypes.length).toBe(2);
    expect(dialogTypes).toEqual(["prompt", "alert"]);
    expect(table.rows.size).toBe(1);
    const created = [...table.rows.values()][0];
    expect(created.name).toBe("Recovered CV");
    expect(created.data.personalInfo.fullName).toBe("Recovered Person");
    // ...and the stale id must have been replaced by the new row's real id.
    const storedId = await page.evaluate((key) => localStorage.getItem(key), CLOUD_ID_KEY);
    expect(storedId).toBe(created.id);
  });
});
