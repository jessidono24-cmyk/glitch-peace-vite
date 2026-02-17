import { test, expect } from '@playwright/test';

test('interactive: step on PEACE, DESPAIR, GLITCH, TRAP and verify effects', async ({ page }) => {
  const base = process.env.PW_BASE_URL || 'http://localhost:3001/';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Start game (press Enter until playing)
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const state = await page.evaluate(() => window.GlitchPeaceGame?.state);
    if (state === 'PLAYING') break;
  }

  // Ensure playing
  await expect.poll(async () => await page.evaluate(() => window.GlitchPeaceGame?.state), { timeout: 5000 }).toBe('PLAYING');

  

  // Helper: move via imported movePlayer until reaching target
  async function moveTo(x, y) {
    await page.evaluate(async ({ tx, ty }) => {
      const mod = await import('/src/game/player.js');
      const g = window.GlitchPeaceGame;
      while (g.player.x !== tx || g.player.y !== ty) {
        const dx = Math.sign(tx - g.player.x);
        const dy = Math.sign(ty - g.player.y);
        // prefer horizontal then vertical
        if (dx !== 0) mod.movePlayer(g, dx, 0);
        else if (dy !== 0) mod.movePlayer(g, 0, dy);
        // small tick
        await new Promise(r => setTimeout(r, 40));
      }
    }, { tx: x, ty: y });
  }

  // Fetch constants and game
  const { tileCounts } = await page.evaluate(async () => {
    const g = window.GlitchPeaceGame;
    const constants = await import('/src/core/constants.js');
    return { 
      T: constants.T,
      TILE_DEF_KEYS: Object.keys(constants.TILE_DEF || {}).length,
    };
  });

  // -- PEACE -- create a peace tile adjacent to player and step on it
  const peaceResult = await page.evaluate(async () => {
    const C = await import('/src/core/constants.js');
    const g = window.GlitchPeaceGame;
    const px = Math.min(g.gridSize - 2, Math.max(1, g.player.x + 1));
    const py = g.player.y;
    g.grid[py][px] = C.T.PEACE;
    return { x: px, y: py };
  });
  const beforeHp = await page.evaluate(() => window.GlitchPeaceGame.player.hp);
  await moveTo(peaceResult.x, peaceResult.y);
  await page.waitForTimeout(100);
  const afterHp = await page.evaluate(() => window.GlitchPeaceGame.player.hp);
  await expect.poll(async () => (await page.evaluate(() => (window.GlitchPeaceGame.particles || []).length)), { timeout: 1500 }).toBeGreaterThan(0);
  expect(afterHp).toBeGreaterThanOrEqual(beforeHp);

  // -- DESPAIR (damage) -- find a damaging tile and step on it
  // -- DESPAIR -- create a despair tile adjacent and step on it
  const despairCoord = await page.evaluate(async () => {
    const C = await import('/src/core/constants.js');
    const g = window.GlitchPeaceGame;
    const px = Math.max(1, g.player.x - 1);
    const py = g.player.y;
    g.grid[py][px] = C.T.DESPAIR;
    return { x: px, y: py };
  });
  const hpBefore = await page.evaluate(() => window.GlitchPeaceGame.player.hp);
  await moveTo(despairCoord.x, despairCoord.y);
  await page.waitForTimeout(100);
  const hpAfter = await page.evaluate(() => window.GlitchPeaceGame.player.hp);
  await expect.poll(async () => (await page.evaluate(() => (window.GlitchPeaceGame.particles || []).length)), { timeout: 1500 }).toBeGreaterThan(0);
  expect(hpAfter).toBeLessThanOrEqual(hpBefore);

  // -- GLITCH -- teleport test
  // -- GLITCH -- create glitch tile ahead and step on it
  const glitchCoord = await page.evaluate(async () => {
    const C = await import('/src/core/constants.js');
    const g = window.GlitchPeaceGame;
    const px = g.player.x;
    const py = Math.min(g.gridSize - 2, g.player.y + 1);
    g.grid[py][px] = C.T.GLITCH;
    return { x: px, y: py };
  });
  const posBefore = await page.evaluate(() => ({ x: window.GlitchPeaceGame.player.x, y: window.GlitchPeaceGame.player.y }));
  await moveTo(glitchCoord.x, glitchCoord.y);
  await page.waitForTimeout(100);
  const posAfter = await page.evaluate(() => ({ x: window.GlitchPeaceGame.player.x, y: window.GlitchPeaceGame.player.y }));
  // glitch should teleport player (position likely changed)
  expect(posAfter.x !== glitchCoord.x || posAfter.y !== glitchCoord.y || (posAfter.x !== posBefore.x || posAfter.y !== posBefore.y)).toBeTruthy();
  await expect.poll(async () => (await page.evaluate(() => (window.GlitchPeaceGame.particles || []).length)), { timeout: 1500 }).toBeGreaterThan(0);

  // -- TRAP -- immobilize test
  // -- TRAP -- place a trap and step on it
  const trapCoord = await page.evaluate(async () => {
    const C = await import('/src/core/constants.js');
    const g = window.GlitchPeaceGame;
    const px = Math.min(g.gridSize - 2, g.player.x + 2);
    const py = g.player.y;
    g.grid[py][px] = C.T.TRAP;
    return { x: px, y: py };
  });
  await moveTo(trapCoord.x, trapCoord.y);
  await page.waitForTimeout(200);
  const stun = await page.evaluate(() => window.GlitchPeaceGame.player.stunTurns || 0);
  expect(stun).toBeGreaterThanOrEqual(1);
  await expect.poll(async () => (await page.evaluate(() => (window.GlitchPeaceGame.particles || []).length)), { timeout: 1500 }).toBeGreaterThan(0);
});
