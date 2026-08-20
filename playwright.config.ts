import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;

/**
 * Runs against a PRODUCTION build, not `next dev`.
 *
 * Dev injects a <nextjs-portal> devtools overlay that registers as a
 * focusable element with no focus ring — it fails the keyboard invariant
 * and does not exist in production. Testing the dev server tests a
 * different artefact than the one that ships.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
