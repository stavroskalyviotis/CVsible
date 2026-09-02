/* Screenshots a page (and optional clicks) for visual review.

     node scripts/shot.mjs <url> <out.png> [width] [height] [clickSelector...]
*/

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [url, out, width = "1500", height = "1000", ...clicks] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node scripts/shot.mjs <url> <out.png> [w] [h] [selector...]");
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: +width, height: +height } });
const problems = [];
page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console: ${message.text()}`);
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

for (const selector of clicks) {
  await page.locator(selector).first().click();
  await page.waitForTimeout(600);
}

await page.screenshot({ path: out, fullPage: clicks.length === 0 });
await browser.close();

if (problems.length) problems.slice(0, 15).forEach((problem) => console.log(problem));
console.log("saved", out);
