/* Drives the CVisor / CVfix step endpoints the way the browser does, timing
   each round, without needing a dev server.

     npx tsx scripts/try-agent.mjs agent
     npx tsx scripts/try-agent.mjs cvfix .pdf-check/aurora.txt
*/

import { readFileSync } from "node:fs";

// Load ANTHROPIC_API_KEY the same way Vercel would.
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const BACKGROUND = `Δούλεψα σερβιτόρος στο Blue Cafe στην Αθήνα από τον Μάρτιο 2021 μέχρι τον Ιούνιο 2023.
Εκπαίδευσα 4 καινούργιους, ανέβασα τις πωλήσεις των επιδορπίων 15%, έκλεινα το ταμείο κάθε βράδυ.
Μετά πήγα στο Nova Bistro ως υπεύθυνος βάρδιας, Ιούλιος 2023 μέχρι σήμερα, έχω 6 άτομα ομάδα.
Σπουδές: ΙΕΚ Τουριστικών Επαγγελμάτων 2019-2021.
Ξέρω Excel, POS συστήματα, εξυπηρέτηση πελατών, HACCP.
Αγγλικά καλά, λίγα ιταλικά.
Μου αρέσει η ορειβασία.`;

const JOB_AD = `Ζητείται Assistant Restaurant Manager για μπιστρό στο κέντρο.
Απαραίτητα: εμπειρία σε εστίαση, διαχείριση ομάδας, γνώση HACCP, αγγλικά.
Επιθυμητά: γνώση POS, εμπειρία σε inventory management, προσανατολισμός στις πωλήσεις.`;

const MAX_ROUNDS = 4;

function mockRes() {
  const out = {};
  return {
    payload: out,
    status(code) {
      out.status = code;
      return this;
    },
    json(body) {
      out.body = body;
      return this;
    },
  };
}

const mode = process.argv[2] ?? "agent";
const endpoint = mode === "agent" ? "../api/cvisor-step.ts" : "../api/cvfix.ts";
const { default: handler } = await import(endpoint);

const base =
  mode === "agent"
    ? { language: "el", jobAd: JOB_AD, background: BACKGROUND }
    : { language: "el", resumeText: readFileSync(process.argv[3], "utf8") };

let draft;
let last;

for (let round = 1; round <= MAX_ROUNDS; round++) {
  const started = Date.now();
  const res = mockRes();
  await handler({ method: "POST", headers: {}, body: { ...base, draft } }, res);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (res.payload.status !== 200) {
    console.log(`round ${round}: status ${res.payload.status}`, res.payload.body);
    break;
  }

  last = res.payload.body;
  draft = last.draft;
  const issues = Object.entries(last.issues)
    .filter(([, list]) => list.length > 0)
    .map(([key, list]) => `${key}:${list.length}`)
    .join(" ");
  console.log(`round ${round}: ${seconds}s done=${last.done} ${issues || "clean"}`);
  if (last.done) break;
}

console.log("\n--- final draft ---");
console.log(JSON.stringify(last?.draft, null, 2));
console.log("\n--- remaining issues ---");
console.log(JSON.stringify(last?.issues, null, 2));
