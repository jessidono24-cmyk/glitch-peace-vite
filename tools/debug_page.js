import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));
  page.on('requestfailed', req => console.log('[REQ FAILED]', req.url(), req.failure().errorText || ''));

  const url = process.env.PW_BASE_URL || 'http://localhost:3002/';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const shotPath = 'tools/debug-screenshot.png';
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log('Saved screenshot to', shotPath);

  const pixels = await page.evaluate(() => {
    const c = document.getElementById('canvas');
    if (!c) return { err: 'no-canvas' };
    const ctx = c.getContext('2d');
    if (!ctx) return { err: 'no-ctx' };
    try {
      const p0 = ctx.getImageData(0,0,1,1).data;
      const w = Math.max(1, Math.floor(c.width/2));
      const h = Math.max(1, Math.floor(c.height/2));
      const pc = ctx.getImageData(w,h,1,1).data;
      return { p0: Array.from(p0), center: Array.from(pc) };
    } catch (e) {
      return { err: e.message };
    }
  });

  console.log('Pixel sample:', pixels);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });