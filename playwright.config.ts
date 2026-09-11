import { defineConfig, devices } from "@playwright/test";

/** `E2E_PREVIEW=1 npm run test:e2e` runs the same suite against the built app
 *  instead of the dev server, served by `vite preview` with the production
 *  security headers from vercel.json. That is the only way a Content-Security-
 *  Policy mistake surfaces before it reaches the deployed site — a blocked
 *  script or worker shows up as a failing flow, not as a silent console note.
 *  Its own port, so it never reuses a dev server left running on 5173. */
const preview = process.env.E2E_PREVIEW === "1";
const port = preview ? 5174 : 5173;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: preview
      ? `npm run build && npm run preview -- --port ${port} --strictPort`
      : `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: preview ? 120_000 : 30_000,
  },
});
