import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/mobile-live-audit.spec.js',
  timeout: 90_000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-live-report', open: 'never' }]],
  use: {
    baseURL: process.env.MARCHY_BASE_URL || 'https://marchy-khalil.onrender.com',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
