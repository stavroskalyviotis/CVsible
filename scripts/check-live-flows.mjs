import { chromium } from "playwright-core";
import { resolve } from "node:path";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

const netLog = [];
page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/api/")) {
    let body = "";
    try {
      body = (await res.text()).slice(0, 500);
    } catch {
      body = "<unreadable>";
    }
    netLog.push(`${res.status()} ${url}\n  body: ${body}`);
  }
});
page.on("pageerror", (e) => netLog.push(`PAGEERROR: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") netLog.push(`CONSOLE ERROR: ${m.text()}`);
});

// 1. Landing page: is the sign-in button there?
await page.goto("https://cvsible.vercel.app/#/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const signInVisible = await page.getByRole("button", { name: /sign in with google/i }).isVisible().catch(() => false);
console.log("Sign-in button visible on landing:", signInVisible);

// 2. CVscan: upload a real file, run CVfix
await page.goto("https://cvsible.vercel.app/#/ats", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles(resolve(".pdf-check/aurora.pdf"));
await page.waitForTimeout(3000); // client-side extraction + analysis

const cvfixButton = page.getByRole("button", { name: /cvfix|αναδιάρθρωσ/i });
const cvfixVisible = await cvfixButton.isVisible().catch(() => false);
console.log("CVfix button visible after upload:", cvfixVisible);

if (cvfixVisible) {
  await cvfixButton.click();
  await page.waitForTimeout(15000);
  const errorText = await page.locator("text=/something went wrong|κάτι πήγε στραβά/i").first().textContent().catch(() => null);
  console.log("CVfix UI error shown:", errorText);
}

console.log("\n--- network/console log ---");
netLog.forEach((l) => console.log(l));

await browser.close();
