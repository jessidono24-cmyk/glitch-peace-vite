// ═══════════════════════════════════════════════════════════
// PLAYER - Movement and state
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

import { TILE_DEFS, TILE_TYPES, COLORS } from '../core/constants.js';

export function createPlayer() {
  return {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    symbol: '◈',
    color: COLORS.PLAYER  // NEVER changes - stable anchor
  };
}

export function movePlayer(gameState, dx, dy) {
  const newX = gameState.player.x + dx;
  const newY = gameState.player.y + dy;
  
  // Check bounds
  if (newX < 0 || newX >= gameState.gridSize || 
      newY < 0 || newY >= gameState.gridSize) {
    return false;
  }
  
  // Check solid tiles
  const tile = gameState.grid[newY][newX];
  const tileDef = TILE_DEFS[tile];
  
  if (tileDef.solid) {
    return false;
  }
  
  // Move player
  gameState.player.x = newX;
  gameState.player.y = newY;
  
  return true;
}

export function takeDamage(gameState, amount) {
  gameState.player.hp -= amount;
  if (gameState.player.hp < 0) {
    gameState.player.hp = 0;
  }
  return gameState.player.hp <= 0; // returns true if dead
}

export function heal(gameState, amount) {
  gameState.player.hp = Math.min(
    gameState.player.maxHp, 
    gameState.player.hp + amount
  );
}

// 🔌 LAYER 2 EXPANSION: Add player powers/abilities
// export function activatePower(gameState, powerType) { ... }
