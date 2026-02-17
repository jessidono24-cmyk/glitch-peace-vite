// ═══════════════════════════════════════════════════════════
// GRID GENERATION
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

import { T, DIFFICULTY } from '../core/constants.js';
import { random, randomChoice, distance } from '../core/utils.js';

export function generateGrid(gameState) {
  const sz = gameState.gridSize;
  const diff = DIFFICULTY[gameState.settings.difficulty];
  
  // Initialize empty grid
  gameState.grid = Array(sz).fill(null).map(() => 
    Array(sz).fill(T.VOID)
  );
  
  // Border walls removed - player can move freely
  
  // Add internal walls
  const wallCount = Math.floor(sz * 1.5);
  for (let i = 0; i < wallCount; i++) {
    const x = random(2, sz-3);
    const y = random(2, sz-3);
    gameState.grid[y][x] = T.WALL;
  }
  
  // Add hazard tiles
  const hazardTypes = [
    T.DESPAIR, 
    T.TERROR, 
    T.PAIN
  ];
  const hazardCount = Math.floor(sz * sz * 0.08 * diff.hazardMul);
  
  for (let i = 0; i < hazardCount; i++) {
    const x = random(1, sz-2);
    const y = random(1, sz-2);
    if (gameState.grid[y][x] === T.VOID) {
      gameState.grid[y][x] = randomChoice(hazardTypes);
    }
  }
  
  // Place player in safe spot
  let placed = false;
  while (!placed) {
    const x = random(3, sz-4);
      const y = random(3, sz-4);
      const tile = gameState.grid[y][x];
      if (tile === T.VOID) {
      gameState.player.x = x;
      gameState.player.y = y;
      placed = true;
    }
  }
  
  // Place peace nodes (simple scaling - Fibonacci in Layer 2)
  gameState.peaceTotal = Math.floor(
    (gameState.level * 2 + 5) * diff.peaceMul
  );
  gameState.peaceCollected = 0;
  gameState.peaceNodes = [];
  
  for (let i = 0; i < gameState.peaceTotal; i++) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const x = random(2, sz-3);
      const y = random(2, sz-3);
      const dist = distance(x, y, gameState.player.x, gameState.player.y);
      
      if (gameState.grid[y][x] === T.VOID && dist > 3) {
        gameState.grid[y][x] = T.PEACE;
        gameState.peaceNodes.push({x, y});
        placed = true;
      }
      attempts++;
    }
  }
}


