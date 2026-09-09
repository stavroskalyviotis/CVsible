import { test, expect } from "@playwright/test";

/** A page wider than the phone is what forces the pinch-zoom-and-pan reading
 *  that makes a site feel broken on mobile, and it is easy to reintroduce by
 *  adding one control to a header. These widths are the common narrow ones:
 *  320 is the smallest phone still in use, 360 the Android median, 390 the
 *  current iPhone. */
const NARROW = [320, 360, 390];

const PAGES = [
  ["landing", "/#/"],
  ["ATS check", "/#/ats"],
  ["builder", "/#/builder"],
  ["CVisor", "/#/cvisor"],
  ["my CVs", "/#/my-cvs"],
  ["profile", "/#/profile"],
  ["privacy", "/#/privacy"],
] as const;

test.describe("Narrow screens", () => {
  for (const width of NARROW) {
    for (const [name, route] of PAGES) {
      test(`${name} fits ${width}px wide without sideways scrolling`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        await page.waitForTimeout(400);

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      });
    }
  }

  test("the builder toolbar keeps its actions reachable on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/#/builder");
    await page.waitForSelector(".cv-page");

    // Every control a thumb has to hit stays at a usable size.
    const heights = await page.evaluate(() =>
      [...document.querySelectorAll(".builder-topbar button")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.height > 0)
        .map((r) => Math.round(r.height)),
    );
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(30);

    // Two rows, not three: the toolbar must not eat the screen.
    const toolbar = await page.locator(".builder-topbar").boundingBox();
    expect(toolbar!.height).toBeLessThan(140);
  });

  test("the site header's menu opens and lists the sections", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/#/");
    await expect(page.locator(".site-nav")).toBeHidden();

    await page.locator(".site-burger").click();
    const nav = page.locator(".site-nav");
    await expect(nav).toBeVisible();
    await expect(nav.locator(".site-nav-link")).toHaveCount(4);

    const box = await nav.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(360);
  });
});
