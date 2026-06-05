import { defineConfig, devices } from "@playwright/test";

const port = Number(
  process.env.PLAYWRIGHT_WEB_PORT ?? process.env.PORT ?? 5173,
);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const apiBaseUrl =
  process.env.PLAYWRIGHT_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `PORT=${port} pnpm dev`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      PORT: String(port),
      // API_BASE_URL is consumed by the Node-side test helpers (e2e/utils);
      // VITE_API_BASE_URL is what the browser app reads via import.meta.env.
      API_BASE_URL: apiBaseUrl,
      VITE_API_BASE_URL: apiBaseUrl,
      // Keep the dev-only devtools panel out of the e2e DOM.
      VITE_DISABLE_DEVTOOLS: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Commented out for faster testing - uncomment when needed
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});
