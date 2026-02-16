// ENEMY AI - Simple chase behavior (BASE LAYER)
import { TILE_DEFS } from '../core/constants.js';

export function createEnemy(x, y, level) {
  return {
    x, y,
    speed: 600 - (level * 30),
    lastMove: Date.now(),
    stunned: false,
    stunnedUntil: 0
  };
}

export function updateEnemies(gameState) {
  if (gameState.state !== 'PLAYING') return;
  const now = Date.now();
  
  for (let enemy of gameState.enemies) {
    if (enemy.stunned && now < enemy.stunnedUntil) continue;
    enemy.stunned = false;
    
    if (now - enemy.lastMove < enemy.speed) continue;
    
    let dx = 0, dy = 0;
    if (gameState.player.x > enemy.x) dx = 1;
    else if (gameState.player.x < enemy.x) dx = -1;
    if (gameState.player.y > enemy.y) dy = 1;
    else if (gameState.player.y < enemy.y) dy = -1;
    
    if (dx !== 0 && dy !== 0) {
      if (Math.random() < 0.5) dy = 0;
      else dx = 0;
    }
    
    const newX = enemy.x + dx;
    const newY = enemy.y + dy;
    
    if (newX >= 0 && newX < gameState.gridSize && 
        newY >= 0 && newY < gameState.gridSize) {
      const tile = gameState.grid[newY][newX];
      if (!TILE_DEFS[tile].solid) {
        enemy.x = newX;
        enemy.y = newY;
        enemy.lastMove = now;
      }
    }
  }
}
