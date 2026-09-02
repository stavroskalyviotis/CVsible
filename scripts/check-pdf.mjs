/* Renders the builder in a real browser, downloads the PDF for each template
   and screenshots the preview. Run against a dev server:

     npm run dev
     node scripts/check-pdf.mjs [baseUrl]
*/

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:5173";
const OUT = join(process.cwd(), ".pdf-check");
const TEMPLATES = ["aurora", "meridian", "atlas"];

const SAMPLE = {
  themeColor: "#a9435a",
  fontFamily: "sans",
  density: "comfortable",
  showPhoto: false,
  photo: null,
  photoPosition: { x: 50, y: 50 },
  skillDisplay: "text",
  personalInfo: {
    fullName: "Σταύρος Καλυβιώτης",
    jobTitle: "Frontend Engineer",
    summary:
      "<p>Frontend engineer with six years building accessible product interfaces in React and TypeScript. Led the design-system rewrite that cut UI defects by 40%.</p>",
    dateOfBirth: "1997-04-12",
    contacts: [
      { id: "c1", type: "email", value: "stavros@example.com", label: "" },
      { id: "c2", type: "phone", value: "+30 694 000 0000", label: "" },
      { id: "c3", type: "location", value: "Αθήνα, Ελλάδα", label: "" },
      { id: "c4", type: "linkedin", value: "linkedin.com/in/stavros", label: "" },
    ],
  },
  experience: [
    {
      id: "e1",
      role: "Senior Frontend Engineer",
      company: "Acme Digital",
      location: "Αθήνα",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "<ul><li>Rebuilt the checkout flow in React, lifting conversion by 18%.</li><li>Owned the shared component library used by four product teams.</li></ul>",
    },
    {
      id: "e2",
      role: "Frontend Developer",
      company: "Nova Labs",
      location: "Θεσσαλονίκη",
      startDate: "2019-09",
      endDate: "2022-02",
      current: false,
      description: "<ul><li>Shipped the customer portal used by 30.000 users.</li></ul>",
    },
  ],
  education: [
    {
      id: "d1",
      degree: "MSc Computer Science",
      institution: "Εθνικό Μετσόβιο Πολυτεχνείο",
      location: "Αθήνα",
      startDate: "2017-09",
      endDate: "2019-06",
      current: false,
      description: "",
    },
  ],
  skills: [
    { id: "s1", name: "React", level: 90 },
    { id: "s2", name: "TypeScript", level: 85 },
    { id: "s3", name: "Node.js", level: 60 },
  ],
  softSkills: [
    { id: "f1", name: "Ομαδικότητα" },
    { id: "f2", name: "Επικοινωνία" },
  ],
  languages: [
    { id: "l1", name: "Ελληνικά", level: "Μητρική γλώσσα" },
    { id: "l2", name: "Αγγλικά", level: "Άριστο" },
  ],
  interests: [{ id: "i1", name: "Ορειβασία" }],
  certifications: [{ id: "t1", title: "AWS Certified Developer", issuer: "Amazon", date: "2023-05" }],
  projects: [
    {
      id: "p1",
      title: "CVsible",
      link: "https://cvsible.vercel.app",
      description: "<p>Open resume builder with an ATS-safe PDF pipeline.</p>",
    },
  ],
  sectionOrder: ["experience", "education", "projects", "certifications", "skills", "softSkills", "languages", "interests"],
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const problems = [];
page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console: ${message.text()}`);
});

for (const template of TEMPLATES) {
  await page.goto(`${BASE}/#/builder`, { waitUntil: "networkidle" });
  await page.evaluate(
    ([data, tpl]) => {
      localStorage.setItem("cvsible:cv-data", JSON.stringify({ ...data, template: tpl }));
    },
    [SAMPLE, template],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".cv-screen-page", { timeout: 15000 });
  await page.waitForTimeout(1200);

  await page.locator(".cv-screen-page").screenshot({ path: join(OUT, `${template}.png`) });

  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.getByRole("button", { name: /Λήψη PDF|Download PDF/i }).click();
  const download = await downloadPromise;
  await download.saveAs(join(OUT, `${template}.pdf`));
  console.log(`${template}: saved pdf + screenshot`);
}

await browser.close();

if (problems.length) {
  console.log("\nBrowser problems:");
  problems.slice(0, 20).forEach((problem) => console.log("  " + problem));
}
writeFileSync(join(OUT, "problems.txt"), problems.join("\n"));
