import { test, expect } from "@playwright/test";
import type { UserProfile } from "../src/types";
import {
  createFakeCvTable,
  createFakeProfileStore,
  mockCvsRestApi,
  mockProfileRestApi,
  mockSignedIn,
} from "./helpers/mockCloud";

function filledProfile(): UserProfile {
  return {
    personalInfo: {
      fullName: "Profile Person",
      jobTitle: "Barista",
      summary: "<p>Five years behind the bar.</p>",
      dateOfBirth: "",
      contacts: [
        { id: "p-email", type: "email", value: "profile@example.com", label: "" },
        { id: "p-phone", type: "phone", value: "+30 6900000000", label: "" },
      ],
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
        company: "Cafe No5",
        location: "Athens",
        startDate: "2019-01",
        endDate: "2021-02",
        current: false,
        description: "<ul><li>Served fifteen tables a shift.</li></ul>",
      },
    ],
    education: [],
    skills: [
      { id: "p-skill-1", name: "Latte art", level: 80, category: "" },
      { id: "p-skill-2", name: "POS systems", level: 70, category: "" },
    ],
    softSkills: [],
    languages: [{ id: "p-lang-1", name: "English", level: "Fluent" }],
    interests: [],
    certifications: [],
    projects: [],
  };
}

test.describe("Profile (signed out)", () => {
  test("asks the visitor to sign in instead of showing a profile", async ({ page }) => {
    await mockCvsRestApi(page, createFakeCvTable());
    await mockProfileRestApi(page, createFakeProfileStore());
    await page.goto("/#/profile");
    await expect(page.locator(".profile-signin")).toBeVisible();
    await expect(page.locator(".profile-meter")).toHaveCount(0);
  });
});

test.describe("Profile (signed in)", () => {
  test("shows an empty profile at 0% and lists what is missing", async ({ page }) => {
    await mockSignedIn(page, createFakeCvTable(), createFakeProfileStore());
    await page.goto("/#/profile");

    await expect(page.locator(".profile-meter-value")).toHaveText("0%");
    await expect(page.locator(".profile-missing-chip").first()).toBeVisible();
  });

  test("saves an edit and reflects it in the completeness meter", async ({ page }) => {
    const store = createFakeProfileStore();
    await mockSignedIn(page, createFakeCvTable(), store);
    await page.goto("/#/profile");

    await expect(page.locator(".profile-meter-value")).toHaveText("0%");
    await page.getByLabel("Full name", { exact: true }).fill("Written Once");

    await expect(page.locator(".profile-save-ok")).toBeVisible();
    await expect(page.locator(".profile-meter-value")).toHaveText("10%");

    await expect
      .poll(() => store.data?.personalInfo.fullName)
      .toBe("Written Once");
  });

  test("loads an existing profile and reports its completeness", async ({ page }) => {
    await mockSignedIn(page, createFakeCvTable(), createFakeProfileStore(filledProfile()));
    await page.goto("/#/profile");

    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Profile Person");
    // name, jobTitle, email, phone, summary, experience, languages = 7 of 10.
    await expect(page.locator(".profile-meter-value")).toHaveText("70%");
  });
});

test.describe("Profile in the builder", () => {
  test("a new CV starts with the profile's own details already filled in", async ({ page }) => {
    await mockSignedIn(page, createFakeCvTable(), createFakeProfileStore(filledProfile()));
    await page.goto("/#/my-cvs");

    await page.locator(".mycvs-new").click();
    await expect(page).toHaveURL(/#\/builder$/);
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Profile Person");
    await expect(page.locator(".builder-preview")).toContainText("Profile Person");
  });

  test("imports chosen roles from the profile into the CV", async ({ page }) => {
    await mockSignedIn(page, createFakeCvTable(), createFakeProfileStore(filledProfile()));
    await page.goto("/#/my-cvs");
    await page.locator(".mycvs-new").click();

    await page.locator(".accordion-header", { hasText: /work experience/i }).click();
    await page.locator(".psection-import").click();

    const dialog = page.locator(".pimport-modal");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".pimport-list li")).toHaveCount(2);

    // Everything starts ticked; drop the older role and import just the first.
    await dialog.locator(".pimport-list li", { hasText: "Waiter" }).locator("input").uncheck();
    await dialog.getByRole("button", { name: /import \(1\)/i }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page.locator(".builder-preview")).toContainText("Coffee Lab");
    await expect(page.locator(".builder-preview")).not.toContainText("Cafe No5");
  });

  test("offers to save a role written in the builder back to the profile", async ({ page }) => {
    const store = createFakeProfileStore(filledProfile());
    await mockSignedIn(page, createFakeCvTable(), store);
    await page.goto("/#/my-cvs");
    await page.locator(".mycvs-new").click();

    await page.locator(".accordion-header", { hasText: /work experience/i }).click();
    await page.locator(".add-button").last().click();
    await page.getByLabel("Role", { exact: true }).fill("Bar Manager");
    await page.getByLabel("Company", { exact: true }).fill("New Place");

    const banner = page.locator(".psection-saveback");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: /save to profile/i }).click();

    await expect(page.locator(".psection-saveback-done")).toBeVisible();
    await expect
      .poll(() => store.data?.experience.map((item) => item.company))
      .toContain("New Place");
  });
});
