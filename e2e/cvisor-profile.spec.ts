import { test, expect } from "@playwright/test";
import type { UserProfile } from "../src/types";
import { createFakeCvTable, createFakeProfileStore, mockSignedIn } from "./helpers/mockCloud";

function filledProfile(): UserProfile {
  return {
    personalInfo: {
      fullName: "Profile Person",
      jobTitle: "Barista",
      summary: "<p>Five years behind the bar.</p>",
      dateOfBirth: "",
      contacts: [{ id: "p-email", type: "email", value: "profile@example.com", label: "" }],
    },
    photo: null,
    photoPosition: { x: 50, y: 50 },
    experience: [
      {
        id: "p-exp-1",
        role: "Barista",
        company: "Coffee Lab",
        location: "Athens",
        startDate: "2021-03",
        endDate: "",
        current: true,
        description: "<ul><li>Ran the morning bar.</li></ul>",
      },
      {
        id: "p-exp-2",
        role: "Waiter",
        company: "Blue Cafe",
        location: "",
        startDate: "2019-01",
        endDate: "2021-02",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        id: "p-edu-1",
        degree: "BSc Hospitality",
        institution: "AUTH",
        location: "",
        startDate: "2015-09",
        endDate: "2019-06",
        current: false,
        expectedGraduation: "",
        description: "",
      },
    ],
    skills: [{ id: "p-s1", name: "Espresso", level: 80, category: "" }],
    softSkills: [],
    languages: [{ id: "p-l1", name: "English", level: "Good" }],
    interests: [],
    certifications: [],
    projects: [{ id: "p-p1", title: "Coffee Tracker", link: "", description: "<p>An app I built.</p>" }],
  };
}

test.describe("Filling CVisor from the profile", () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedIn(page, createFakeCvTable(), createFakeProfileStore(filledProfile()));
    await page.route("**/api/cvisor-followup", (route) => route.fulfill({ json: { questions: [] } }));
    await page.goto("/#/cvisor");
    await expect(page.locator(".cvisor-step-prompt")).toBeVisible();
  });

  /** It used to take everything with one click and offer no way back, which
   *  makes it a button you press once and then regret. */
  test("asks what should come over, section by section", async ({ page }) => {
    await page.locator(".cvisor-import button").click();

    const dialog = page.locator(".pfill-modal");
    await expect(dialog).toBeVisible();

    // Every section that has something in it, with what is ticked in it.
    const rows = dialog.locator(".pfill-sections li");
    await expect(rows.filter({ hasText: /work experience/i })).toContainText("2 of 2");
    await expect(rows.filter({ hasText: /education/i })).toContainText("1 of 1");

    // Drill into one and untick an entry.
    await rows.filter({ hasText: /work experience/i }).click();
    await expect(dialog.locator(".pfill-entries li")).toHaveCount(2);
    await dialog.locator(".pfill-entries li", { hasText: "Blue Cafe" }).locator("input").uncheck();
    await page.getByRole("button", { name: /^save$/i }).click();

    // Back on the list, the count reflects the choice.
    await expect(rows.filter({ hasText: /work experience/i })).toContainText("1 of 2");

    await page.getByRole("button", { name: /^fill in \d+$/i }).click();
    await expect(dialog).toHaveCount(0);

    // The kept job is in the CV; the unticked one is not.
    const preview = page.locator(".cvisor-preview");
    await expect(preview).toContainText("Coffee Lab");
    await expect(preview).not.toContainText("Blue Cafe");
  });

  test("select-all and none work inside a section", async ({ page }) => {
    await page.locator(".cvisor-import button").click();
    const dialog = page.locator(".pfill-modal");
    await dialog.locator(".pfill-sections li", { hasText: /work experience/i }).click();

    await page.getByRole("button", { name: /^none$/i }).click();
    await expect(dialog.locator(".pfill-entries input:checked")).toHaveCount(0);

    await page.getByRole("button", { name: /^select all$/i }).click();
    await expect(dialog.locator(".pfill-entries input:checked")).toHaveCount(2);
  });

  /** An import you cannot take back is one people hesitate to try. */
  test("the switch puts everything back the way it was", async ({ page }) => {
    await page.locator(".cvisor-import button").click();
    await page.getByRole("button", { name: /^fill in \d+$/i }).click();

    const preview = page.locator(".cvisor-preview");
    await expect(preview).toContainText("Coffee Lab");
    await expect(page.locator(".cvisor-import.filled")).toBeVisible();

    await page.locator(".cvisor-switch").click();

    await expect(preview).not.toContainText("Coffee Lab");
    await expect(page.locator(".cvisor-import.filled")).toHaveCount(0);
    // And it can be done again.
    await expect(page.locator(".cvisor-import button")).toBeVisible();
  });

  /** Importing answers most of the interview at once, so it is possible to
   *  reach the end without ever seeing those answers as questions. */
  test("offers a way back into the imported answers", async ({ page }) => {
    await page.locator(".cvisor-import button").click();
    await page.getByRole("button", { name: /^fill in \d+$/i }).click();

    // The import answers most of it. What is left is what the profile could
    // not supply — the second job has no description there, so it still gets
    // asked what she did.
    await page.locator(".cvisor-field textarea").fill("Barista in Athens");
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.locator(".cvisor-step-prompt")).toContainText(/what did you do as Waiter/i);

    for (let guard = 0; guard < 10; guard++) {
      if (await page.locator(".cvisor-ready").count()) break;
      const no = page.locator(".cvisor-choice").nth(1);
      const skip = page.getByRole("button", { name: /^skip$/i });
      if (await no.count()) {
        await no.click();
      } else if (await skip.count()) {
        await skip.click();
      } else {
        // A question that must be answered — the story steps are not skippable.
        await page.locator(".cvisor-field textarea, .cvisor-field input").first().fill("Served tables.");
        await page.getByRole("button", { name: /^continue$/i }).click();
      }
    }
    await expect(page.locator(".cvisor-ready")).toBeVisible();

    await page.getByRole("button", { name: /review the answers/i }).click();
    await expect(page.locator(".cvisor-step")).toBeVisible();
  });

  test("keeps an imported answer that has since been edited", async ({ page }) => {
    await page.locator(".cvisor-import button").click();
    await page.getByRole("button", { name: /^fill in \d+$/i }).click();
    await page.locator(".cvisor-field textarea").fill("Barista in Athens");
    await page.getByRole("button", { name: /^continue$/i }).click();

    // Step back until the first job's card is the one on screen.
    for (let guard = 0; guard < 14; guard++) {
      const back = page.locator(".cvisor-step-back, .cvisor-ready-actions .cvisor-step-back").first();
      if (!(await back.count())) break;
      await back.click();
      const role = page.locator(".cvisor-field input").first();
      if ((await role.count()) && (await role.inputValue()) === "Barista") break;
    }

    await page.locator(".cvisor-field input").first().fill("Head Barista");
    await page.getByRole("button", { name: /^continue$/i }).click();

    await page.locator(".cvisor-switch").click();
    // The edit is the candidate's answer now, so the undo leaves it alone.
    await expect(page.locator(".cvisor-preview")).toContainText("Head Barista");
    await expect(page.locator(".cvisor-preview")).not.toContainText("Blue Cafe");
  });
});
