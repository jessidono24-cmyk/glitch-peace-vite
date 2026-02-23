// @ts-check
import { defineConfig } from '@playwright/test';

const baseURL = process.env.PW_BASE_URL || 'http://localhost:3001/';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.{js,ts}', '**/playtest-full.js', '**/playtest-deep.js', '**/playtest-combo.js'],
  timeout: 3_600_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'node ./node_modules/.bin/vite --port 3001',
    url: 'http://localhost:3001/',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
