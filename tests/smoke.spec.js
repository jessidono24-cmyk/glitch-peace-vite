import { test, expect } from '@playwright/test';

test('smoke: game loads and canvas renders something', async ({ page }) => {
  // Update port if your Vite dev server uses a different one.
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  const canvas = page.locator('canvas');
  await expect(canvas).toHaveCount(1);

  await page.waitForTimeout(300);

  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThan(50);
  expect(box.height).toBeGreaterThan(50);
});