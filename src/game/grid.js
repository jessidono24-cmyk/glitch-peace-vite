// ═══════════════════════════════════════════════════════════
// GRID GENERATION
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

import { T, DIFFICULTY, DIFF_CFG } from '../core/constants.js';
import { random, randomChoice, distance, fibonacci, createSeededRandom, getDailySeed } from '../core/utils.js';

export function generateGrid(gameState) {
  const sz = gameState.gridSize;
  const diff = DIFF_CFG[gameState.settings.difficulty] || DIFF_CFG.normal;

  // DAILY mode: use a deterministic seeded random for reproducible level
  let seededRng = null;
  if (gameState.playMode === 'DAILY' || gameState.playMode === 'daily') {
    const seed = getDailySeed() + gameState.level * 1000;
    seededRng = createSeededRandom(seed);
  }
  const rng = seededRng
    ? (min, max) => Math.floor(seededRng() * (max - min + 1)) + min
    : random;
  const rngChoice = seededRng
    ? (arr) => arr[Math.floor(seededRng() * arr.length)]
    : randomChoice;

  // Play-mode multipliers (set by applyMode) override difficulty defaults when present
  const hazardMulBase = diff.hazardMul !== undefined ? diff.hazardMul : 1.0;
  const peaceMulBase = diff.peaceMul !== undefined ? diff.peaceMul : 1.0;
  const hazardMul = (gameState.hazardMul !== undefined ? gameState.hazardMul : hazardMulBase);
  const peaceMul  = (gameState.peaceMul  !== undefined ? gameState.peaceMul  : peaceMulBase);
  
  // Initialize empty grid
  gameState.grid = Array(sz).fill(null).map(() => 
    Array(sz).fill(T.VOID)
  );
  
  // Border walls removed - player can move freely
  
  // Add internal walls
  const wallCount = Math.floor(sz * 1.5);
  for (let i = 0; i < wallCount; i++) {
    const x = rng(2, sz-3);
    const y = rng(2, sz-3);
    gameState.grid[y][x] = T.WALL;
  }
  
  // Add hazard tiles
  const hazardTypes = [
    T.DESPAIR, 
    T.TERROR, 
    T.PAIN
  ];
  const hazardCount = Math.floor(sz * sz * 0.08 * hazardMul);
  
  for (let i = 0; i < hazardCount; i++) {
    const x = rng(1, sz-2);
    const y = rng(1, sz-2);
    if (gameState.grid[y][x] === T.VOID) {
      gameState.grid[y][x] = rngChoice(hazardTypes);
    }
  }
  
  // Always spawn player at (1,1) (top-left after border)
  gameState.player.x = 1;
  gameState.player.y = 1;
  
  // Place peace nodes (Fibonacci scaling, scaled by peaceMul)
  const fibSeq = fibonacci(gameState.level + 2);
  gameState.peaceTotal = Math.max(1, Math.floor(fibSeq[fibSeq.length - 1] * peaceMul));
  gameState.peaceCollected = 0;
  gameState.peaceNodes = [];
  
  for (let i = 0; i < gameState.peaceTotal; i++) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const x = rng(2, sz-3);
      const y = rng(2, sz-3);
      const dist = distance(x, y, gameState.player.x, gameState.player.y);
      if (gameState.grid[y][x] === T.VOID && dist > 3) {
        gameState.grid[y][x] = T.PEACE;
        gameState.peaceNodes.push({x, y});
        placed = true;
      }
      attempts++;
    }
  }

  // Place power-ups (1-2 per level; disabled if play mode says no powerups)
  const powerupsEnabled = gameState.mechanics?.powerupsEnabled !== false;
  const powerupCount = powerupsEnabled ? Math.max(1, Math.floor(gameState.level / 2) + 1) : 0;
  gameState.powerupNodes = [];
  const powerupTypes = ['SHIELD', 'SPEED', 'FREEZE', 'REGEN'];
  for (let i = 0; i < powerupCount; i++) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const x = rng(2, sz-3);
      const y = rng(2, sz-3);
      const dist = distance(x, y, gameState.player.x, gameState.player.y);
      if (gameState.grid[y][x] === T.VOID && dist > 3) {
        gameState.grid[y][x] = T.POWERUP;
        const type = rngChoice(powerupTypes);
        gameState.powerupNodes.push({x, y, type});
        placed = true;
      }
      attempts++;
    }
  }
}


