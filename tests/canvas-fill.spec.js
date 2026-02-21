import { test, expect } from '@playwright/test';

test('canvas fills full 1280x720 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();

  expect(box.x).toBeCloseTo(0, 0);
  expect(box.y).toBeCloseTo(0, 0);
  expect(box.width).toBeGreaterThanOrEqual(1270);
  expect(box.height).toBeGreaterThanOrEqual(710);
});

test('canvas fills full 1920x1080 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();

  expect(box.x).toBeCloseTo(0, 0);
  expect(box.y).toBeCloseTo(0, 0);
  expect(box.width).toBeGreaterThanOrEqual(1900);
  expect(box.height).toBeGreaterThanOrEqual(1060);
});

test('canvas resizes correctly on window resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Resize viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForFunction(() => {
    const c = document.getElementById('c');
    return c && c.style.width === '1920px';
  });

  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();

  expect(box.width).toBeGreaterThanOrEqual(1900);
  expect(box.height).toBeGreaterThanOrEqual(1060);
});

test('no scrollbars visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check overflow is hidden (no scrollbars)
  const overflow = await page.evaluate(() => ({
    bodyOverflow: window.getComputedStyle(document.body).overflow,
    htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
    hasScrollbar: document.body.scrollHeight > window.innerHeight ||
                  document.body.scrollWidth > window.innerWidth,
  }));
  expect(overflow.hasScrollbar).toBe(false);
});
