'use strict';
import { T, TILE_DEF, GRID_SIZES, DIFF_CFG, CELL, GAP } from '../core/constants.js';
import { CFG } from '../core/state.js';
import { rnd, pick, fibonacci } from '../core/utils.js';

export function SZ()  { return GRID_SIZES[CFG.gridSize]; }
export function DIFF(){ return DIFF_CFG[CFG.difficulty]; }
export function GP()  { return SZ() * CELL + (SZ() - 1) * GAP; }
export function CW()  { return GP() + 48; }
export function CH()  { return GP() + 148; }

export function makeGrid(sz) {
  const g = Array.from({ length: sz }, () => new Array(sz).fill(T.VOID));
  const walls = Math.floor(sz * sz * 0.07);
  for (let i = 0; i < walls; i++) {
    const y = 1 + rnd(sz - 2), x = 1 + rnd(sz - 2);
    g[y][x] = T.WALL;
  }
  return g;
}

export function spawnTile(grid, count, type, sz, avoidCorner) {
  let n = 0, itr = 0;
  while (n < count && itr < 9999) {
    itr++;
    const y = rnd(sz), x = rnd(sz);
    if (grid[y][x] === T.VOID) {
      if (avoidCorner && y < 2 && x < 2) continue;
      grid[y][x] = type; n++;
    }
  }
}

export function buildDreamscape(ds, sz, level, prevScore, prevHp, maxHp, dreamHistory) {
  const d = DIFF();
  const grid = makeGrid(sz);
  grid[0][0] = T.VOID;
  if (sz > 1) { grid[0][1] = T.VOID; grid[1][0] = T.VOID; }

  // Fibonacci peace scaling
  const peaceCount = fibonacci(level + 2) + (sz - 13 > 0 ? sz - 13 : 0);
  const insCount   = 1 + Math.floor(level / 3);

  ds.hazardSet.forEach((type, i) => {
    const cnt = Math.round((ds.hazardCounts[i] || 4) * d.hazMul);
    spawnTile(grid, cnt, type, sz, true);
  });
  spawnTile(grid, peaceCount, T.PEACE,   sz, true);
  spawnTile(grid, insCount,   T.INSIGHT, sz, true);

  ds.specialTiles.forEach(type => spawnTile(grid, 2, type, sz, true));

  if (dreamHistory && dreamHistory.length > 0) spawnTile(grid, 3, T.MEMORY, sz, true);

  // Phase 2.6: Embodiment tiles — somatic engagement per dreamscape emotional context
  // GROUNDING appears in every dreamscape (1 tile) — universally helpful
  spawnTile(grid, 1, T.GROUNDING, sz, true);
  // BREATH_SYNC for high-arousal / anxiety / chaos dreamscapes
  if (['anxiety','panic','chaos','frustration'].includes(ds.emotion))
    spawnTile(grid, 1, T.BREATH_SYNC, sz, true);
  // ENERGY_NODE for high-effort / exhaustion / integration dreamscapes
  if (['exhaustion','integration','fear'].includes(ds.emotion))
    spawnTile(grid, 1, T.ENERGY_NODE, sz, true);
  // BODY_SCAN for inward / exploratory / numb dreamscapes
  if (['numbness','vulnerability','hope'].includes(ds.emotion))
    spawnTile(grid, 1, T.BODY_SCAN, sz, true);

  if (ds.id === 'aztec') {
    for (let i = 0; i < sz * 2; i++) {
      const y = 1 + rnd(sz - 2), x = 1 + rnd(sz - 2);
      if (grid[y][x] === T.VOID) grid[y][x] = T.WALL;
    }
  }

  const envBonus   = ds.id === 'bedroom' ? 2 : ds.id === 'summit' ? 1 : 0;
  const rawCount   = Math.min(ds.enemyCount + Math.floor(level * 0.5) + envBonus, 10);
  const enemyCount = Math.max(1, rawCount + (CFG.difficulty === 'hard' ? 2 : CFG.difficulty === 'easy' ? -1 : 0));
  const enemies    = [];
  const pad        = Math.max(2, Math.floor(sz / 5));

  for (let i = 0; i < enemyCount; i++) {
    let y, x, tr = 0;
    do { y = pad + rnd(sz - pad * 2); x = pad + rnd(sz - pad * 2); tr++; }
    while ((grid[y][x] !== T.VOID || (y < 2 && x < 2)) && tr < 400);
    enemies.push({
      y, x, timer: rnd(600), stunTimer: 0,
      behavior: ds.enemyBehavior,
      patrolAngle: Math.random() * Math.PI * 2,
      orbitAngle: Math.random() * Math.PI * 2,
      orbitR: 2 + rnd(3),
      prevY: y, prevX: x, momentum: [0, 0], type: 'hunter',
    });
  }

  // Note: bosses are spawned by boss-system.js in main.js (nextDreamscape)
  // The legacy boss below is removed to avoid conflicts with boss-system phase management.
  const boss = null;

  return {
    grid, enemies, boss, sz, level, ds,
    player: { y: 0, x: 0 },
    hp: prevHp !== undefined ? Math.min(maxHp, prevHp + 25) : maxHp,
    score: prevScore || 0,
    particles: [], trail: [], echos: [], contZones: [],
    shakeFrames: 0, peaceLeft: peaceCount, insightLeft: insCount,
    peaceTotal: peaceCount, peaceCollected: 0,
    msg: null, msgColor: '#fff', msgTimer: 0,
    flashColor: null, flashAlpha: 0,
    tileFlicker: [], resonanceWave: null, peaceStreak: 0,
    archetypeActive: false, archetypeType: null, archetypeTimer: 0,
    captureZones: [],
    environmentTimer: 800 + rnd(600), environmentActive: false,
    spreadTimer: 2000,
    moveHistory: [],
    slowMoves: false, speedBoost: false, emotionTimer: 0,
  };
}
