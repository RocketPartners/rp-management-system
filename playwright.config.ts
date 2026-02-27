import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing the onboarding workflow
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://rp-management-system.test',

    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',

    // Record video only when test fails
    video: 'retain-on-failure',

    // Take screenshot only when test fails
    screenshot: 'only-on-failure',

    // Maximum time each action can take
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  // Note: Start the Laravel server manually with: php artisan serve
  // webServer: {
  //   command: 'php artisan serve',
  //   url: 'http://localhost:8000/login',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
