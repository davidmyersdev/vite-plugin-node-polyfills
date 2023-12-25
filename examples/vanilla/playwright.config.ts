import { defineConfig, devices } from '@playwright/test'

const webServerCommand = process.env.WEB_SERVER_COMMAND || 'pnpm dev'
const webServerUrl = process.env.WEB_SERVER_URL || 'http://localhost:5173'

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './test/e2e',
  use: {
    baseURL: webServerUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: webServerCommand,
    stdout: 'ignore',
    url: webServerUrl,
  },
  workers: process.env.CI ? 1 : undefined,
})
