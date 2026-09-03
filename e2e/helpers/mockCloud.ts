import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import type { CvData } from "../../src/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Mirrors the .env.local loading trick in scripts/try-agent.mjs: Playwright
 *  doesn't read Vite's env files, so we read the same file the dev server
 *  itself is already using to derive the Supabase project ref. */
function readEnvVar(name: string): string {
  const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`).exec(line);
    if (match) return match[1].replace(/^["']|["']$/g, "");
  }
  throw new Error(`${name} not found in .env.local`);
}

const SUPABASE_URL = readEnvVar("VITE_SUPABASE_URL");
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
// Matches supabase-js's own default: `sb-${ref}-auth-token` (see
// @supabase/supabase-js/dist/index.mjs, SupabaseClient constructor).
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

export const MOCK_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "e2e-test@example.com",
  fullName: "E2E Test User",
};

function buildSession() {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: "e2e-fake-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "e2e-fake-refresh-token",
    user: {
      id: MOCK_USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: MOCK_USER.email,
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: { full_name: MOCK_USER.fullName, email: MOCK_USER.email },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

export interface CvRow {
  id: string;
  user_id: string;
  name: string;
  data: CvData;
  is_public: boolean;
  public_id: string | null;
  history: unknown[];
  updated_at: string;
  created_at: string;
}

export interface FakeCvTable {
  rows: Map<string, CvRow>;
  maxPerUser: number;
}

let idCounter = 0;

export function createFakeCvTable(maxPerUser = 10): FakeCvTable {
  return { rows: new Map(), maxPerUser };
}

export function addFakeCv(table: FakeCvTable, overrides: Partial<CvRow> = {}): CvRow {
  idCounter += 1;
  const now = new Date().toISOString();
  const row: CvRow = {
    id: `e2e-cv-${idCounter}`,
    user_id: MOCK_USER.id,
    name: `Test CV ${idCounter}`,
    data: MINIMAL_CV_DATA,
    is_public: false,
    public_id: null,
    history: [],
    updated_at: now,
    created_at: now,
    ...overrides,
  };
  table.rows.set(row.id, row);
  return row;
}

export const MINIMAL_CV_DATA: CvData = {
  template: "atlas",
  themeColor: "#a9435a",
  fontFamily: "sans",
  density: "comfortable",
  showPhoto: false,
  photo: null,
  photoPosition: { x: 50, y: 50 },
  skillDisplay: "text",
  personalInfo: {
    fullName: "Cloud Test Person",
    jobTitle: "QA Engineer",
    summary: "<p>Summary for a cloud-saved CV used in end-to-end tests.</p>",
    dateOfBirth: "",
    contacts: [{ id: "c1", type: "email", value: "cloud@example.com", label: "" }],
  },
  experience: [
    {
      id: "e1",
      role: "QA Engineer",
      company: "Test Co",
      location: "",
      startDate: "2022-01",
      endDate: "",
      current: true,
      description: "<ul><li>Wrote end-to-end tests.</li></ul>",
    },
  ],
  education: [],
  skills: [],
  softSkills: [],
  languages: [],
  interests: [],
  certifications: [],
  projects: [],
  sectionOrder: ["experience", "education", "projects", "certifications", "skills", "softSkills", "languages", "interests"],
};

/** Intercepts the REST/RPC calls cvStore.ts makes against Supabase's
 *  PostgREST API, backed by an in-memory fake `cvs` table. Does not require
 *  a signed-in session — PublicCvPage's fetchPublicCv() only needs this. */
export async function mockCvsRestApi(page: Page, table: FakeCvTable): Promise<void> {
  await page.route("**/rest/v1/cvs**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    if (method === "GET") {
      const rows = [...table.rows.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      await route.fulfill({ status: 200, json: rows });
      return;
    }

    if (method === "POST") {
      if (table.rows.size >= table.maxPerUser) {
        await route.fulfill({ status: 400, json: { message: "cv_limit_reached" } });
        return;
      }
      const body = request.postDataJSON() as { user_id: string; name: string; data: CvData };
      const row = addFakeCv(table, { user_id: body.user_id, name: body.name, data: body.data });
      await route.fulfill({ status: 201, json: row });
      return;
    }

    if (method === "PATCH") {
      const id = url.searchParams.get("id")?.replace(/^eq\./, "");
      const row = id ? table.rows.get(id) : undefined;
      if (row) {
        const patch = request.postDataJSON() as Partial<CvRow>;
        Object.assign(row, patch, { updated_at: new Date().toISOString() });
      }
      // updateCvData() chains .select() (Prefer: return=representation) so it can
      // detect a stale/deleted id from an empty result; other callers (rename,
      // history, publish) don't chain .select() and expect the plain 204 they'd
      // get from real PostgREST's default Prefer: return=minimal.
      const preferHeader = await request.headerValue("prefer");
      const wantsRepresentation = (preferHeader ?? "").includes("return=representation");
      if (wantsRepresentation) {
        await route.fulfill({ status: 200, json: row ? [row] : [] });
      } else {
        await route.fulfill({ status: 204, body: "" });
      }
      return;
    }

    if (method === "DELETE") {
      const id = url.searchParams.get("id")?.replace(/^eq\./, "");
      if (id) table.rows.delete(id);
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.continue();
  });

  await page.route("**/rest/v1/rpc/get_public_cv**", async (route) => {
    const body = route.request().postDataJSON() as { lookup_id: string };
    const row = [...table.rows.values()].find((item) => item.public_id === body.lookup_id);
    await route.fulfill({
      status: 200,
      json: row ? [{ name: row.name, data: row.data, updated_at: row.updated_at }] : [],
    });
  });

  await page.route("**/auth/v1/logout**", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });
}

/** Seeds a signed-in Supabase session before any page script runs (so
 *  AuthContext sees a user on first render), and wires up the REST/RPC
 *  mocks. Lets My CVs / share-link / application-tracker flows run without
 *  a real Supabase backend or a real Google login. */
export async function mockSignedIn(page: Page, table: FakeCvTable): Promise<void> {
  const session = buildSession();
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [STORAGE_KEY, JSON.stringify(session)],
  );
  await mockCvsRestApi(page, table);
}
