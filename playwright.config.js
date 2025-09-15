// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  //reporter: [['html', { open: 'never' }]],
  reporter: [['json', { outputFile: 'test-results.json' }]],
  globalTeardown: './utils/send-result.js',


  use: {
    trace: 'on',
    screenshot:'on',
    video: 'on',
    baseURL:'https://app.affooh.com'},

  /* Configure projects for major browsers */
  projects: [
   {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
}

  ],

  
});

