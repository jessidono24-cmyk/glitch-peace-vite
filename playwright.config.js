// @ts-check
import { defineConfig } from '@playwright/test';

const baseURL = process.env.PW_BASE_URL || 'http://localhost:3001/';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    baseURL,
  },
  webServer: {
    command: 'node ./node_modules/.bin/vite --port 3001',
    url: 'http://localhost:3001/',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
