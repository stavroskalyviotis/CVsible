import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// wcag2a/wcag2aa/wcag21aa are the standard baseline; best-practice rules are
// left out since they're opinionated rather than compliance-relevant.
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa"];

async function auditPage(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations;
}

function describeViolations(violations: import("axe-core").Result[]): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `  - ${node.target.join(" ")}`).join("\n"),
    )
    .join("\n\n");
}

function assertNoViolations(violations: import("axe-core").Result[]): void {
  expect(violations.length, violations.length > 0 ? describeViolations(violations) : "").toBe(0);
}

test.describe("Accessibility (axe-core, WCAG 2.0/2.1 A/AA)", () => {
  test("landing page", async ({ page }) => {
    await page.goto("/#/");
    const violations = await auditPage(page);
    assertNoViolations(violations);
  });

  test("builder page", async ({ page }) => {
    await page.goto("/#/builder");
    await expect(page.locator(".builder-preview")).toBeVisible();
    const violations = await auditPage(page);
    assertNoViolations(violations);
  });

  test("CVscan page", async ({ page }) => {
    await page.goto("/#/ats");
    const violations = await auditPage(page);
    assertNoViolations(violations);
  });

  test("privacy policy page", async ({ page }) => {
    await page.goto("/#/privacy");
    const violations = await auditPage(page);
    assertNoViolations(violations);
  });

  test("terms of use page", async ({ page }) => {
    await page.goto("/#/terms");
    const violations = await auditPage(page);
    assertNoViolations(violations);
  });
});
