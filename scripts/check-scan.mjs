/* Uploads a file into the CVscan page and screenshots the report.

     node scripts/check-scan.mjs <baseUrl> <file>
*/

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:5199";
const FILE = resolve(process.argv[3] ?? ".pdf-check/atlas.pdf");
const OUT = ".pdf-check";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
const problems = [];
page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console: ${message.text()}`);
});

await page.goto(`${BASE}/#/ats`, { waitUntil: "networkidle" });
await page.setInputFiles('input[type="file"]', FILE);
await page.waitForSelector(".scan-verdict", { timeout: 30000 });
await page.waitForTimeout(800);

const summary = await page.evaluate(() => ({
  verdict: document.querySelector(".scan-verdict-text strong")?.textContent,
  score: document.querySelector(".ats-ring strong")?.textContent,
  facts: [...document.querySelectorAll(".scan-fact")].map((row) => [
    row.querySelector("dt")?.textContent,
    row.querySelector("dd")?.textContent,
  ]),
  failing: [...document.querySelectorAll(".scan-check-fail .scan-check-detail")].map((el) => el.textContent),
  warning: [...document.querySelectorAll(".scan-check-warn .scan-check-detail")].map((el) => el.textContent),
}));

console.log(JSON.stringify({ file: basename(FILE), ...summary }, null, 2));

await page.screenshot({ path: `${OUT}/scan-report.png`, fullPage: true });
await browser.close();

if (problems.length) problems.slice(0, 10).forEach((problem) => console.log(problem));
