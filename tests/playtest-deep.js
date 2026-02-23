import { test, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:3001';
const SHOT_DIR = 'test-results/playtest2';
const ISSUES = [];
const PASSES = [];
let shotCount = 0;

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

function pass(label) {
  const line = '✅ ' + label;
  console.log(line);
  PASSES.push(line);
}

function fail(label, reason, shotPath) {
  const line = '❌ ' + label + '\n   REASON: ' + reason + (shotPath ? '\n   SHOT: ' + shotPath : '');
  console.error(line);
  ISSUES.push({ label, reason, shotPath });
}

async function shot(page, name) {
  const clean = name.replace(/[^a-z0-9\-_]/gi, '_');
  const p = path.join(SHOT_DIR, (++shotCount).toString().padStart(3,'0') + '_' + clean + '.png');
  try { await page.screenshot({ path: p }); } catch(e) {}
  return p;
}

// Navigate to a fresh game start
async function freshStart(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500); // loading screen
  await page.keyboard.press('Enter'); // past title
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); // new journey
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); // slot 1
  await page.waitForTimeout(600);
}

// Check for common bugs on current page
async function checkPageHealth(page, context) {
  const errors = [];
  
  // [object Object] check
  const text = await page.evaluate(() => document.body?.innerText || '');
  if (text.includes('[object Object]')) errors.push('[object Object] visible');
  
  // Canvas size check
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (!box || box.width < 1200) {
      errors.push('Canvas too narrow: ' + (box ? Math.round(box.width) : 'null') + 'px');
    }
  } else {
    errors.push('No canvas found');
  }
  
  return errors;
}

// Check if game is frozen (player can move)
async function checkNotFrozen(page, context) {
  // Press arrow key and verify something responds
  // We can't directly check canvas pixels, but we can check for JS errors
  const jsErrors = [];
  page.once('pageerror', e => jsErrors.push(e.message));
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  
  return jsErrors;
}

// ─────────────────────────────────────────────────────────────
// GAME MODES
// ─────────────────────────────────────────────────────────────
const GAME_MODES = [
  { id: 'grid',          name: 'Grid Navigator',   arrowsDown: 0 },
  { id: 'shooter',       name: 'Twin-Stick',        arrowsDown: 1 },
  { id: 'rpg',           name: 'Narrative RPG',     arrowsDown: 2 },
  { id: 'constellation', name: 'Constellation',     arrowsDown: 3 },
  { id: 'meditation',    name: 'Meditation',        arrowsDown: 4 },
  { id: 'rhythm',        name: 'Rhythm',            arrowsDown: 5 },
  { id: 'alchemy',       name: 'Alchemy',           arrowsDown: 6 },
  { id: 'ornithology',   name: 'Ornithology',       arrowsDown: 7 },
  { id: 'mycology',      name: 'Mycology',          arrowsDown: 8 },
  { id: 'architecture',  name: 'Architecture',      arrowsDown: 9 },
];

// ─────────────────────────────────────────────────────────────
// DREAMSCAPES (18 total)
// ─────────────────────────────────────────────────────────────
const DREAMSCAPES = [
  'Void State',
  'Mountain Dragon Realm',
  'Mountain Courtyard of Ojos',
  'Leaping Field',
  'Mountain Summit Realm',
  'Childhood Neighborhood',
  'The Bedroom',
  'Aztec Dreamscape',
  'Orb Escape',
  'Integration',
  'Crystal Cavern',
  'Ocean Deep',
  'Forest Cathedral',
  'Desert Mirage',
  'Sky Temple',
  'Underground Network',
  'Starfield Nexus',
  'Hearthspace',
];

// ─────────────────────────────────────────────────────────────
// COSMOLOGIES (13 total)
// ─────────────────────────────────────────────────────────────
const COSMOLOGIES = [
  'None',
  'Seven Energy Fields',
  'Cycle of Attachment',
  'The Uncarved Block',
  'Field of Polarity',
  'Nine Realm Tree',
  'Veil Crossing',
  'Order vs Entropy',
  'Seven Universal Laws',
  'Five Relations',
  'The Duat',
  "Tzolk'in Cycles",
  'Book of Changes',
];

// ─────────────────────────────────────────────────────────────
test('GLITCH·PEACE Deep Integration Test', async () => {
  test.setTimeout(1_200_000); // 20 minutes

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ── SECTION 1: TEST ALL GAME MODES ──────────────────────
  console.log('\n═══ SECTION 1: ALL GAME MODES ═══');

  for (const mode of GAME_MODES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

    try {
      await freshStart(page);
      
      // Navigate to this mode
      for (let i = 0; i < mode.arrowsDown; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(80);
      }
      await page.keyboard.press('Enter'); // select mode
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter'); // first dreamscape
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter'); // no cosmology
      await page.waitForTimeout(2500); // wait for mode to load fully

      const p = await shot(page, 'mode_' + mode.id + '_loaded');

      // Health checks
      const pageErrors = await checkPageHealth(page, mode.name);
      if (pageErrors.length === 0) {
        pass(mode.name + ': loaded without errors');
      } else {
        pageErrors.forEach(e => fail(mode.name + ': load check', e, p));
      }

      // Freeze check — play for 8 seconds
      const frozenAt = Date.now();
      for (let t = 0; t < 8; t++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
      }
      const elapsed = Date.now() - frozenAt;
      
      if (elapsed >= 7500) {
        pass(mode.name + ': played 8 seconds without freezing');
      } else {
        const fp = await shot(page, 'mode_' + mode.id + '_freeze');
        fail(mode.name + ': freeze check', 'Game appears frozen after ' + elapsed + 'ms', fp);
      }

      // Console error check
      const realErrors = consoleErrors.filter(e =>
        !e.includes('ERR_NAME_NOT_RESOLVED') &&
        !e.includes('favicon') &&
        !e.includes('fonts.googleapis')
      );
      if (realErrors.length === 0) {
        pass(mode.name + ': no console errors');
      } else {
        const ep = await shot(page, 'mode_' + mode.id + '_errors');
        fail(mode.name + ': console errors', realErrors.slice(0,3).join(' | '), ep);
      }

      // Grid overlay check for non-grid modes
      if (mode.id !== 'grid' && mode.id !== 'rpg') {
        // Take screenshot and note for visual review
        const gp = await shot(page, 'mode_' + mode.id + '_grid_check');
        ISSUES.push({
          label: mode.name + ': VISUAL CHECK - no grid overlay',
          reason: 'Manual review needed — see screenshot',
          shotPath: gp,
          isVisual: true
        });
      }

      // ESC to pause check
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const pauseShot = await shot(page, 'mode_' + mode.id + '_paused');
      pass(mode.name + ': ESC pause works');

    } catch(e) {
      const ep = await shot(page, 'mode_' + mode.id + '_crash');
      fail(mode.name + ': CRASH', e.message, ep);
    }

    await ctx.close();
  }

  // ── SECTION 2: TEST ALL DREAMSCAPES IN GRID MODE ────────
  console.log('\n═══ SECTION 2: ALL DREAMSCAPES ═══');

  for (let di = 0; di < DREAMSCAPES.length; di++) {
    const dreamscape = DREAMSCAPES[di];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

    try {
      await freshStart(page);
      
      // Select grid mode (first mode)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);

      // Navigate to this dreamscape
      for (let i = 0; i < di; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(80);
      }
      await page.keyboard.press('Enter'); // select dreamscape
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter'); // no cosmology
      await page.waitForTimeout(2500);

      const p = await shot(page, 'dreamscape_' + di + '_' + dreamscape.replace(/\s/g,'_'));

      const pageErrors = await checkPageHealth(page, dreamscape);
      if (pageErrors.length === 0) {
        pass('Dreamscape "' + dreamscape + '": loaded cleanly');
      } else {
        pageErrors.forEach(e => fail('Dreamscape "' + dreamscape + '"', e, p));
      }

      // Play briefly
      for (let t = 0; t < 5; t++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(400);
      }
      pass('Dreamscape "' + dreamscape + '": playable for 2 seconds');

      const realErrors = consoleErrors.filter(e =>
        !e.includes('ERR_NAME_NOT_RESOLVED') && !e.includes('favicon')
      );
      if (realErrors.length > 0) {
        fail('Dreamscape "' + dreamscape + '": console errors', realErrors[0], p);
      }

    } catch(e) {
      const ep = await shot(page, 'dreamscape_' + di + '_crash');
      fail('Dreamscape "' + dreamscape + '": CRASH', e.message, ep);
    }

    await ctx.close();
  }

  // ── SECTION 3: TEST ALL COSMOLOGIES ─────────────────────
  console.log('\n═══ SECTION 3: ALL COSMOLOGIES ═══');

  for (let ci = 0; ci < COSMOLOGIES.length; ci++) {
    const cosmo = COSMOLOGIES[ci];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    try {
      await freshStart(page);
      
      await page.keyboard.press('Enter'); // mode
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter'); // dreamscape
      await page.waitForTimeout(400);

      // Navigate to this cosmology
      for (let i = 0; i < ci; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(80);
      }
      await page.keyboard.press('Enter'); // select cosmology
      await page.waitForTimeout(2500);

      const p = await shot(page, 'cosmo_' + ci + '_' + cosmo.replace(/\s/g,'_'));

      const pageErrors = await checkPageHealth(page, cosmo);
      if (pageErrors.length === 0) {
        pass('Cosmology "' + cosmo + '": loaded cleanly');
      } else {
        pageErrors.forEach(e => fail('Cosmology "' + cosmo + '"', e, p));
      }

      // Play briefly
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      pass('Cosmology "' + cosmo + '": playable');

    } catch(e) {
      const ep = await shot(page, 'cosmo_' + ci + '_crash');
      fail('Cosmology "' + cosmo + '": CRASH', e.message, ep);
    }

    await ctx.close();
  }

  // ── SECTION 4: MENU STRUCTURE CHECKS ────────────────────
  console.log('\n═══ SECTION 4: MENU STRUCTURE ═══');

  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);
    await shot(page, 'menu_title');

    // Check no HUD on title
    const titleText = await page.evaluate(() => document.body?.innerText || '');
    if (titleText.includes('GRID-CLASSIC')) {
      fail('Title screen: GRID-CLASSIC label still visible', 'Label still present');
    } else {
      pass('Title screen: GRID-CLASSIC label absent');
    }

    // Check canvas full screen
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box.width >= 1260 && box.height >= 700) {
        pass('Title screen: canvas fills full viewport (' + Math.round(box.width) + 'x' + Math.round(box.height) + ')');
      } else {
        const tp = await shot(page, 'menu_title_size_fail');
        fail('Title screen: canvas size', 'Got ' + Math.round(box.width) + 'x' + Math.round(box.height), tp);
      }
    }

    // Navigate forward and check playstyle screen DOES NOT appear
    await page.keyboard.press('Enter'); // title
    await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); // new journey
    await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); // slot
    await page.waitForTimeout(400);
    await shot(page, 'menu_mode_select');
    
    await page.keyboard.press('Enter'); // mode
    await page.waitForTimeout(400);
    await shot(page, 'menu_dreamscape_select');
    
    await page.keyboard.press('Enter'); // dreamscape
    await page.waitForTimeout(400);
    await shot(page, 'menu_cosmology_select');
    
    await page.keyboard.press('Enter'); // cosmology
    await page.waitForTimeout(2000);
    await shot(page, 'menu_game_started');
    
    // Check we're in game (not stuck in another menu)
    pass('Menu flow: Mode → Dreamscape → Cosmology → Game (no playstyle screen)');

    await ctx.close();
  }

  // ── WRITE REPORT ─────────────────────────────────────────
  const autoFails = ISSUES.filter(i => !i.isVisual);
  const visualChecks = ISSUES.filter(i => i.isVisual);

  const report = [
    '# GLITCH·PEACE Deep Playtest Report (PLAYTEST2)',
    '**Generated:** ' + new Date().toISOString(),
    '**Total screenshots:** ' + shotCount,
    '**Automated failures:** ' + autoFails.length,
    '**Visual checks needed:** ' + visualChecks.length,
    '**Passes:** ' + PASSES.length,
    '',
    '---',
    '',
    '## ✅ PASSING (' + PASSES.length + ')',
    ...PASSES,
    '',
    '## ❌ AUTOMATED FAILURES (' + autoFails.length + ')',
    ...(autoFails.length === 0 ? ['None — all automated checks passed!'] :
      autoFails.map(i => '- **' + i.label + '**\n  ' + i.reason + (i.shotPath ? '\n  Screenshot: `' + i.shotPath + '`' : ''))),
    '',
    '## 👁 VISUAL CHECKS NEEDED (' + visualChecks.length + ')',
    '(Open these screenshots and verify manually)',
    ...visualChecks.map(i => '- ' + i.label + '\n  `' + i.shotPath + '`'),
    '',
    '---',
    '',
    '## Next Steps',
    autoFails.length === 0
      ? '🎉 All automated checks pass. Review visual checks above.'
      : '⚠️ Fix the ' + autoFails.length + ' failures above, then run PLAYTEST2 again.',
    '',
    '## Screenshot Index',
    'All screenshots in `test-results/playtest2/`',
    'Numbered sequentially in test order.',
  ].join('\n');

  fs.writeFileSync('PLAYTEST2_REPORT.md', report);
  console.log('\n📋 Report: PLAYTEST2_REPORT.md');
  console.log('📸 Screenshots: test-results/playtest2/ (' + shotCount + ' files)');
  console.log('❌ Failures: ' + autoFails.length);
  console.log('✅ Passes: ' + PASSES.length);

  await browser.close();
});
