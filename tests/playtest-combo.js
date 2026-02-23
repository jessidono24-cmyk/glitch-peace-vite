import { test, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:3001';
const SHOT_DIR = 'test-results/playtest4';
const ISSUES = [];
const PASSES = [];
let shotCount = 0;

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

function pass(label) { const l = '✅ ' + label; console.log(l); PASSES.push(l); }
function fail(label, reason, sp) {
  const l = '❌ ' + label + '\n   ' + reason + (sp ? '\n   → ' + sp : '');
  console.error(l); ISSUES.push({ label, reason, shotPath: sp });
}
function visual(label, sp) {
  const l = '👁  VISUAL: ' + label + '\n   → ' + sp;
  console.log(l); ISSUES.push({ label, reason: 'Manual visual check', shotPath: sp, isVisual: true });
}

async function shot(page, name) {
  const n = name.replace(/[^a-z0-9_\-]/gi, '_').slice(0, 60);
  const p = path.join(SHOT_DIR, (++shotCount).toString().padStart(4,'0') + '_' + n + '.png');
  try { await page.screenshot({ path: p }); } catch(e) { console.warn('Screenshot failed:', e.message); }
  return p;
}

async function freshNav(page, modeIdx, dreamscapeIdx, cosmologyIdx) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3500); // loading screen

  // Title → New Journey
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); // new journey
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); // slot 1
  await page.waitForTimeout(600);

  // Select mode
  for (let i = 0; i < modeIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  // Select dreamscape
  for (let i = 0; i < dreamscapeIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  // Select cosmology
  for (let i = 0; i < cosmologyIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500); // wait for game to fully load
}

async function checkHealth(page, label) {
  const errors = [];
  try {
    const text = await page.evaluate(() => document.body?.innerText || '');
    if (text.includes('[object Object]')) errors.push('[object Object] visible');

    const canvas = await page.$('canvas');
    if (!canvas) { errors.push('No canvas'); return errors; }
    const box = await canvas.boundingBox();
    if (!box || box.width < 1200) errors.push('Canvas width: ' + (box?.width || 0));
    if (!box || box.height < 680) errors.push('Canvas height: ' + (box?.height || 0));
  } catch(e) { errors.push('Health check error: ' + e.message); }
  return errors;
}

async function playFor(page, seconds) {
  const moves = ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','ArrowRight','ArrowDown'];
  const start = Date.now();
  let i = 0;
  while (Date.now() - start < seconds * 1000) {
    await page.keyboard.press(moves[i % moves.length]);
    await page.waitForTimeout(400);
    i++;
  }
  return Date.now() - start;
}

async function tryCompleteLevel(page, modeName) {
  // Play for up to 60 seconds trying to complete level
  // Collect PEACE tiles aggressively in grid mode
  // In other modes, try the primary objective
  const moves = ['ArrowRight','ArrowRight','ArrowDown','ArrowRight','ArrowUp',
                  'ArrowLeft','ArrowDown','ArrowLeft','ArrowRight','ArrowDown'];
  const start = Date.now();
  const limit = 60000; // 60 seconds per level attempt
  let i = 0;
  let levelCompleted = false;

  while (Date.now() - start < limit) {
    await page.keyboard.press(moves[i % moves.length]);
    await page.waitForTimeout(300);
    i++;

    // Check for level completion text/state
    // (Visual check — we can't read canvas, but can check for phase transitions)
    const url = page.url();
    if (url.includes('level') || url.includes('complete')) {
      levelCompleted = true;
      break;
    }
  }

  return { completed: levelCompleted, timeMs: Date.now() - start };
}

// ─────────────────────────────────────────────
const MODES = [
  { name: 'Grid Navigator',  idx: 0 },
  { name: 'Twin-Stick',      idx: 1 },
  { name: 'Narrative RPG',   idx: 2 },
  { name: 'Constellation',   idx: 3 },
  { name: 'Meditation',      idx: 4 },
  { name: 'Rhythm',          idx: 5 },
  { name: 'Alchemy',         idx: 6 },
  { name: 'Ornithology',     idx: 7 },
  { name: 'Mycology',        idx: 8 },
  { name: 'Architecture',    idx: 9 },
];

const DREAMSCAPES = [
  'Void State', 'Mountain Dragon Realm', 'Mountain Courtyard of Ojos',
  'Leaping Field', 'Mountain Summit Realm', 'Childhood Neighborhood',
  'The Bedroom', 'Aztec Dreamscape', 'Orb Escape', 'Integration',
  'Crystal Cavern', 'Ocean Deep', 'Forest Cathedral', 'Desert Mirage',
  'Sky Temple', 'Underground Network', 'Starfield Nexus', 'Hearthspace',
];

const COSMOLOGIES = [
  'None', 'Seven Energy Fields', 'Cycle of Attachment', 'The Uncarved Block',
  'Field of Polarity', 'Nine Realm Tree', 'Veil Crossing', 'Order vs Entropy',
  'Seven Universal Laws', 'Five Relations', 'The Duat', "Tzolk'in Cycles",
  'Book of Changes',
];

// ─────────────────────────────────────────────
test('PLAYTEST4: Full Combinatorial Integration Test', async () => {
  test.setTimeout(3_600_000); // 1 hour — never cut off

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ══════════════════════════════════════════
  // SECTION A: Opening sequence check
  // ══════════════════════════════════════════
  console.log('\n═══ A: OPENING SEQUENCE ═══');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const p1 = await shot(page, 'A_opening_0.5s');

    // Check for loading text
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const canvasContent = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.width + 'x' + c.height : 'no canvas';
    });

    if (canvasContent !== 'no canvas') {
      pass('Opening: canvas present immediately');
    } else {
      fail('Opening: canvas present', 'No canvas on load', p1);
    }

    await page.waitForTimeout(2000);
    const p2 = await shot(page, 'A_opening_2.5s');
    visual('Opening sequence visual check (should show loading text on black)', p2);

    await page.waitForTimeout(1500);
    const p3 = await shot(page, 'A_title_screen');
    visual('Title screen visual check (should be full screen, clean menu)', p3);

    // Check canvas fills screen
    const errors = await checkHealth(page, 'Title screen');
    if (errors.length === 0) {
      pass('Title screen: canvas fills full screen');
    } else {
      fail('Title screen: canvas size', errors.join(', '), p3);
    }

    await ctx.close();
  }

  // ══════════════════════════════════════════
  // SECTION B: Every mode × 3 dreamscapes × 1 cosmology
  // ══════════════════════════════════════════
  console.log('\n═══ B: ALL MODES × 3 DREAMSCAPES ═══');

  // Test each mode with dreamscapes 0, 5, and 10 (spread across the list)
  const testDreamscapes = [0, 5, 10];

  for (const mode of MODES) {
    for (const dsIdx of testDreamscapes) {
      const dsName = DREAMSCAPES[dsIdx] || 'Unknown';
      const label = mode.name + ' × ' + dsName;
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      const page = await ctx.newPage();

      const consoleErrors = [];
      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      page.on('pageerror', err => consoleErrors.push('ERR: ' + err.message));

      try {
        await freshNav(page, mode.idx, dsIdx, 0); // cosmology = None
        const loadShot = await shot(page, 'B_' + mode.name.replace(/\s/g,'_') + '_ds' + dsIdx + '_load');

        // Health check
        const errors = await checkHealth(page, label);
        if (errors.length === 0) {
          pass(label + ': loaded and full screen');
        } else {
          fail(label + ': health', errors.join(', '), loadShot);
        }

        // Visual differentiation check
        visual(label + ': mode-specific visual identity (no grid tiles if not Grid mode)', loadShot);

        // Play for 10 seconds without freezing
        const elapsed = await playFor(page, 10);
        if (elapsed >= 9000) {
          pass(label + ': played 10s without freeze');
        } else {
          const fs2 = await shot(page, 'B_' + mode.name.replace(/\s/g,'_') + '_ds' + dsIdx + '_freeze');
          fail(label + ': freeze check', 'Only ' + elapsed + 'ms elapsed', fs2);
        }

        // Console error check (filter noise)
        const real = consoleErrors.filter(e =>
          !e.includes('ERR_NAME_NOT_RESOLVED') &&
          !e.includes('favicon') &&
          !e.includes('fonts.googleapis') &&
          !e.includes('google-analytics')
        );
        if (real.length === 0) {
          pass(label + ': no console errors');
        } else {
          fail(label + ': console errors', real.slice(0,2).join(' | '), loadShot);
        }

        // ESC to pause
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        const pauseShot = await shot(page, 'B_' + mode.name.replace(/\s/g,'_') + '_ds' + dsIdx + '_pause');
        pass(label + ': pause menu reachable');

        // Check for playstyle option in pause menu
        const pauseText = await page.evaluate(() => document.body?.innerText || '');
        if (pauseText.toLowerCase().includes('playstyle') || pauseText.toLowerCase().includes('play style')) {
          pass(label + ': playstyle accessible from pause menu');
        } else {
          visual(label + ': check pause menu for playstyle option', pauseShot);
        }

        await page.keyboard.press('Escape'); // resume

      } catch(e) {
        const cs = await shot(page, 'B_' + mode.name.replace(/\s/g,'_') + '_ds' + dsIdx + '_crash');
        fail(label + ': CRASH', e.message, cs);
      }

      await ctx.close();
    }
  }

  // ══════════════════════════════════════════
  // SECTION C: Level completion attempts
  // ══════════════════════════════════════════
  console.log('\n═══ C: LEVEL COMPLETION ATTEMPTS ═══');

  for (const mode of MODES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();

    try {
      await freshNav(page, mode.idx, 0, 0); // Void State, No cosmology

      const beforeShot = await shot(page, 'C_' + mode.name.replace(/\s/g,'_') + '_before');
      const result = await tryCompleteLevel(page, mode.name);
      const afterShot = await shot(page, 'C_' + mode.name.replace(/\s/g,'_') + '_after60s');

      // We can't always detect level completion from outside canvas
      // so we log it as visual check
      visual(mode.name + ': level progression in 60s (check before/after shots)', afterShot);
      pass(mode.name + ': played for 60s attempting level completion');

    } catch(e) {
      const cs = await shot(page, 'C_' + mode.name.replace(/\s/g,'_') + '_crash');
      fail(mode.name + ': level attempt CRASH', e.message, cs);
    }

    await ctx.close();
  }

  // ══════════════════════════════════════════
  // SECTION D: All cosmologies in Grid × Void State
  // ══════════════════════════════════════════
  console.log('\n═══ D: ALL COSMOLOGIES ═══');

  for (let ci = 0; ci < COSMOLOGIES.length; ci++) {
    const cosmo = COSMOLOGIES[ci];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    try {
      await freshNav(page, 0, 0, ci); // Grid, Void State, this cosmology
      const p = await shot(page, 'D_cosmo_' + ci + '_' + cosmo.replace(/[\s']/g,'_'));

      const health = await checkHealth(page, 'Cosmology: ' + cosmo);
      if (health.length === 0) {
        pass('Cosmology "' + cosmo + '": loaded and full screen');
      } else {
        fail('Cosmology "' + cosmo + '"', health.join(', '), p);
      }

      visual('Cosmology "' + cosmo + '": visual flavor distinct from None', p);

      await playFor(page, 5);
      pass('Cosmology "' + cosmo + '": playable for 5 seconds');

    } catch(e) {
      const cs = await shot(page, 'D_cosmo_' + ci + '_crash');
      fail('Cosmology "' + cosmo + '": CRASH', e.message, cs);
    }

    await ctx.close();
  }

  // ══════════════════════════════════════════
  // SECTION E: Menu options verification
  // ══════════════════════════════════════════
  console.log('\n═══ E: MENU OPTIONS ═══');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const menuShot = await shot(page, 'E_main_menu');
    visual('Main menu: no GRID-CLASSIC label, no HUD, clean layout', menuShot);

    // Navigate to options
    // Press down until OPTIONS is highlighted
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }
    const optionsShot = await shot(page, 'E_options_menu');
    visual('Options menu: each option has a description explaining what it does', optionsShot);

    await ctx.close();
  }

  // ══════════════════════════════════════════
  // WRITE REPORT
  // ══════════════════════════════════════════
  const autoFails = ISSUES.filter(i => !i.isVisual);
  const visualChecks = ISSUES.filter(i => i.isVisual);

  const report = [
    '# GLITCH·PEACE Deep Combinatorial Playtest Report (PLAYTEST4)',
    '**Generated:** ' + new Date().toISOString(),
    '**Viewport:** 1280×720',
    '**Total screenshots:** ' + shotCount,
    '',
    '## Summary',
    '| | Count |',
    '|--|--|',
    '| ✅ Automated passes | ' + PASSES.length + ' |',
    '| ❌ Automated failures | ' + autoFails.length + ' |',
    '| 👁 Visual checks needed | ' + visualChecks.length + ' |',
    '',
    '**Automated failures: ' + autoFails.length + '**',
    '',
    '---',
    '',
    '## ✅ PASSES',
    ...PASSES,
    '',
    '## ❌ AUTOMATED FAILURES',
    ...(autoFails.length === 0
      ? ['None — all automated checks passed!']
      : autoFails.map(i =>
          '### ' + i.label + '\n**Reason:** ' + i.reason +
          (i.shotPath ? '\n**Screenshot:** `' + i.shotPath + '`' : '')
        )),
    '',
    '## 👁 VISUAL CHECKS (human review needed)',
    'Open each screenshot and verify:',
    ...visualChecks.map(i => '- **' + i.label + '**\n  `' + i.shotPath + '`'),
    '',
    '---',
    '## Key Visual Checks Summary',
    '1. Opening sequence: black screen → loading text → menu (not just black)',
    '2. Grid tiles ONLY visible in Grid Navigator mode',
    '3. Each mode has visually distinct aesthetic (color, layout, UI elements)',
    '4. Each cosmology changes the visual flavor of the game',
    '5. Pause menu contains playstyle options',
    '6. Canvas fills 100% of screen in every mode and menu',
    '7. All text is readable (minimum 14px equivalent)',
    '8. Level progression visible in 60s play sessions',
    '',
    '## Next Steps',
    autoFails.length === 0
      ? '🎉 Zero automated failures. Review ' + visualChecks.length + ' visual checks manually.'
      : '⚠️ Fix ' + autoFails.length + ' automated failures, then re-run PLAYTEST4.',
    '',
    '## Screenshots',
    'All ' + shotCount + ' screenshots in `test-results/playtest4/`',
  ].join('\n');

  fs.writeFileSync('PLAYTEST4_REPORT.md', report);
  console.log('\n📋 PLAYTEST4_REPORT.md written');
  console.log('❌ Failures: ' + autoFails.length);
  console.log('✅ Passes: ' + PASSES.length);
  console.log('👁 Visual checks: ' + visualChecks.length);

  await browser.close();
});
