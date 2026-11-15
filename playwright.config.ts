import { defineConfig, devices } from '@playwright/test';

// By default the tests run against a fresh static build, served like on Netlify. It is much faster than `next dev`.
// Set E2E_DEV_SERVER=1 (npm run test:dev) to run against the dev server on port 3000.
const DEV_SERVER = !!process.env.E2E_DEV_SERVER;
// Separate port and build directory, so a running `next dev` keeps working
const STATIC_PORT = 3100;
const STATIC_DIR = '.next-test';
const baseURL = DEV_SERVER ? 'http://localhost:3000' : `http://localhost:${STATIC_PORT}`;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: DEV_SERVER
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
      }
    : {
        command: 'next build && node tests/static-server.mjs',
        url: baseURL,
        // Always build, so the tests never run against an old build
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
          NEXT_DIST_DIR: STATIC_DIR,
          STATIC_DIR,
          PORT: String(STATIC_PORT),
          // Root redirect of public/_redirects
          ROOT_REDIRECT: '/hu/',
        },
      },
});
