// Combo system: reset combo if too much time passes between actions
export function updateCombo(gameState, comboTimeout = 3000) {
  if (gameState.combo && gameState.comboTimer) {
    if (Date.now() - gameState.comboTimer > comboTimeout) {
      gameState.combo = 0;
      gameState.comboTimer = null;
    }
  }
}
// ═══════════════════════════════════════════════════════════
// PLAYER - Movement and state
// BASE LAYER v1.0 + Phase 2A Integration
// ═══════════════════════════════════════════════════════════

// Enhanced from: _archive/gp-v5-YOUR-BUILD/src/main.js (tile interactions)
import { T, TILE_DEF, PLAYER } from '../core/constants.js';
import { createParticles } from './particles.js';
import { createPowerup, applyPowerup } from '../systems/powerups.js';

const MEMORY_SCORE_BONUS = 200; // pts awarded for stepping on a T.MEM tile
const DESPAIR_PARTICLE_COLOR = '#4466ff'; // Blue burst when despair tile is resolved
const TERROR_PARTICLE_COLOR  = '#ff2222'; // Red burst when terror tile is resolved

export function createPlayer() {
  return {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    symbol: PLAYER.symbol,  // ◈ - fixed anchor
    color: PLAYER.OUTLINE   // Cyan - never changes
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
  const tileDef = TILE_DEF[tile] || {};

  if (tileDef.solid) {
    return false;
  }

  // Move player
  gameState.player.x = newX;
  gameState.player.y = newY;

  // Resolve tile interaction when stepping
  const stepped = tile;
  const def = tileDef;

  // Record dream sign for tile type (across sessions)
  gameState._lastTileType = stepped; // GridGameMode will record it

  // Peace: heal + collect
  if (stepped === T.PEACE) {
    // REVERSE mode: peace tiles deal damage instead of healing!
    if (gameState.mechanics?.reversedTiles) {
      const dmg = 8;
      gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
      gameState.grid[newY][newX] = T.VOID;
      gameState.peaceCollected = Math.min(
        (gameState.peaceTotal || 0),
        (gameState.peaceCollected || 0) + 1
      );
      if (gameState.emotionalField?.add) gameState.emotionalField.add('despair', 0.8);
      createParticles(gameState, newX, newY, '#ff3344', 12);
      return true;
    }
    const healAmt = 10;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmt);
    // Play heal sound when HP was below max before the collect
    if (gameState.player.hp - healAmt < gameState.player.maxHp) {
      try { window.AudioManager?.play('heal'); } catch(e) {}
    }
    // Build combo on peace collection: multiplier grows with streak (up to 4×)
    // Formula: 1 + min(3, (combo-1) × 0.2) — caps at 4× at combo=16 and beyond
    gameState.combo = (gameState.combo || 0) + 1;
    gameState.comboTimer = Date.now();
    const comboMul = 1 + Math.min(3, (gameState.combo - 1) * 0.2);
    const mul = (gameState.synergyMultiplier || 1.0) * (gameState.scoreMul || 1.0) * comboMul;
    gameState.score = (gameState.score || 0) + Math.round(150 * mul);
    // Guard: don't exceed peaceTotal to prevent over-collection
    const newCollected = (gameState.peaceCollected || 0) + 1;
    gameState.peaceCollected = gameState.peaceTotal > 0
      ? Math.min(newCollected, gameState.peaceTotal)
      : newCollected;
    gameState.grid[newY][newX] = T.VOID;
    if (gameState.emotionalField?.add) {
      gameState.emotionalField.add('joy', 1.2);
      gameState.emotionalField.add('hope', 0.6);
    }
    createParticles(gameState, newX, newY, 'healing', 18);
    // Play combo sound on streaks of 3+, peace otherwise
    if (gameState.combo >= 3) {
      try { window.AudioManager?.play('combo'); } catch (e) {}
    } else {
      try { window.AudioManager?.play('peace'); } catch (e) {}
    }
    return true;
  }

  // Power-up: collect and apply
  if (stepped === T.POWERUP) {
    if (Array.isArray(gameState.powerupNodes)) {
      const idx = gameState.powerupNodes.findIndex(p => p.x === newX && p.y === newY);
      if (idx !== -1) {
        const { type } = gameState.powerupNodes[idx];
        const powerupObj = createPowerup(type, newX, newY);
        applyPowerup(gameState, powerupObj);
        gameState.grid[newY][newX] = T.VOID;
        gameState.powerupNodes.splice(idx, 1);
        createParticles(gameState, newX, newY, '#00aaff', 16);
        try { window.AudioManager?.play('select'); } catch (e) {}
        return true;
      }
    }
  }

  // Insight: bonus score + trigger learning challenge (Phase 3)
  if (stepped === T.INSIGHT) {
    const mul = (gameState.synergyMultiplier || 1.0)
              * (gameState.scoreMul || 1.0)
              * (gameState.currentTemporalMods?.insightMul || 1.0);
    gameState.score = (gameState.score || 0) + Math.round(300 * mul);
    gameState.grid[newY][newX] = T.VOID;
    if (gameState.emotionalField?.add) gameState.emotionalField.add('curiosity', 2.0);
    createParticles(gameState, newX, newY, '#00eeff', 16);
    try { window.AudioManager?.play('select'); } catch (e) {}
    // Signal the mode to trigger a learning challenge (handled by GridGameMode)
    if (Math.random() < 0.6) gameState._triggerLearningChallenge = true;
    return true;
  }

  // Damage tiles (despair, terror, rage, trap, pain, harm)
  if (def && def.d > 0) {
    // REVERSE mode: hazard tiles heal instead of dealing damage
    if (gameState.mechanics?.reversedTiles) {
      const healAmt = Math.round(def.d * 0.8);
      gameState.player.hp = Math.min(gameState.player.maxHp || 100, (gameState.player.hp || 0) + healAmt);
      gameState.grid[newY][newX] = T.VOID;
      if (gameState.emotionalField?.add) gameState.emotionalField.add('awe', 0.8);
      createParticles(gameState, newX, newY, '#00ffcc', 12);
      return true;
    }
    const hazardMod = (gameState.hazardMul !== undefined ? gameState.hazardMul : 1.0)
                    * (gameState.emotionHazardMod || 1.0);
    const dmg = Math.max(1, Math.round(def.d * hazardMod));
    gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
    if (gameState.emotionalField?.add) {
      gameState.emotionalField.add('fear', 0.6);
      if (stepped === T.DESPAIR) gameState.emotionalField.add('despair', 1.0);
      if (stepped === T.RAGE) gameState.emotionalField.add('anger', 1.2);
    }
    // DESPAIR and TERROR tiles disappear after being stepped on.
    // Symbolically: facing despair and terror transforms them — they hurt but
    // walking through them removes their grip. The tile is consumed like the emotion.
    // Other hazards (HARM, RAGE, TRAP, PAIN, HOPELESS) remain — they represent
    // persistent external forces rather than internal emotional states.
    if (stepped === T.DESPAIR || stepped === T.TERROR) {
      gameState.grid[newY][newX] = T.VOID;
      createParticles(gameState, newX, newY, stepped === T.DESPAIR ? DESPAIR_PARTICLE_COLOR : TERROR_PARTICLE_COLOR, 16);
    } else {
      createParticles(gameState, newX, newY, 'damage', 12);
    }
    try { window.AudioManager?.play('damage'); } catch (e) {}
    return true;
  }

  // Glitch: random teleport
  if (stepped === T.GLITCH) {
    // find a random void tile
    for (let i = 0; i < 200; i++) {
      const rx = Math.floor(Math.random() * gameState.gridSize);
      const ry = Math.floor(Math.random() * gameState.gridSize);
      if (gameState.grid[ry] && gameState.grid[ry][rx] === T.VOID) {
        gameState.player.x = rx;
        gameState.player.y = ry;
        createParticles(gameState, rx, ry, 'aura', 14);
        try { window.AudioManager?.play('teleport'); } catch (e) {}
        break;
      }
    }
    return true;
  }

  // Teleport tile (force warp to safe spot)
  if (stepped === T.TELE) {
    // warp to a safe void near center or random
    const center = Math.floor(gameState.gridSize / 2);
    let tx = center, ty = center;
    for (let i = 0; i < 200; i++) {
      const rx = Math.floor(Math.random() * gameState.gridSize);
      const ry = Math.floor(Math.random() * gameState.gridSize);
      if (gameState.grid[ry] && gameState.grid[ry][rx] === T.VOID) { tx = rx; ty = ry; break; }
    }
    gameState.player.x = tx; gameState.player.y = ty;
    createParticles(gameState, tx, ty, '#00ccff', 18);
    try { window.AudioManager?.play('teleport'); } catch (e) {}
    return true;
  }

  // Trap: immobilize for 3 turns
  if (stepped === T.TRAP) {
    gameState.player.stunTurns = 3;
    if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', 0.8); // anxiety → fear
    createParticles(gameState, newX, newY, '#ff8800', 10);
    try { window.AudioManager?.play('damage'); } catch (e) {}
    return true;
  }

  // Hidden: reveal
  if (stepped === T.HIDDEN) {
    gameState.grid[newY][newX] = T.VOID;
    createParticles(gameState, newX, newY, '#8888ff', 6);
    try { window.AudioManager?.play('select'); } catch (e) {}
    return true;
  }

  // Pain: small damage + shame/grief emotion
  if (stepped === T.PAIN) {
    const dmg = (def && def.d) ? def.d : 4;
    gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
    if (gameState.emotionalField?.add) gameState.emotionalField.add('grief', 0.8); // pain → grief
    createParticles(gameState, newX, newY, '#880000', 10);
    return true;
  }

  // Hopeless: drains score and raises despair, small stun
  if (stepped === T.HOPELESS) {
    gameState.score = Math.max(0, (gameState.score || 0) - 100);
    if (gameState.emotionalField?.add) gameState.emotionalField.add('despair', 1.6);
    gameState.player.stunTurns = Math.max(gameState.player.stunTurns || 0, 1);
    gameState.grid[newY][newX] = T.VOID;
    createParticles(gameState, newX, newY, '#0066ff', 12);
    return true;
  }

  // Archetype: grant small permanent insight / score bonus
  if (stepped === T.ARCH) {
    const mul = gameState.synergyMultiplier || 1.0;
    gameState.score = (gameState.score || 0) + Math.round(500 * mul);
    gameState.grid[newY][newX] = T.VOID;
    if (gameState.emotionalField?.add) gameState.emotionalField.add('awe', 1.5);
    gameState.insightTokens = (gameState.insightTokens || 0) + 1;
    createParticles(gameState, newX, newY, '#ffee44', 20);
    try { window.AudioManager?.play('select'); } catch (e) {}
    return true;
  }

  // Memory: restores HP and triggers a brief pattern flash (memory training)
  if (stepped === T.MEM) {
    const healAmt = 6;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmt);
    gameState.grid[newY][newX] = T.VOID;
    if (gameState.emotionalField?.add) {
      gameState.emotionalField.add('grief', 0.6); // nostalgia → grief (bittersweet)
      gameState.emotionalField.add('hope', 0.4);
    }
    // Trigger memory flash: briefly reveal hidden tiles around the player
    const radius = 3;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const fx = newX + dx;
        const fy = newY + dy;
        if (fx >= 0 && fy >= 0 && fx < gameState.gridSize && fy < gameState.gridSize) {
          if (gameState.grid[fy]?.[fx] === T.HIDDEN) {
            gameState.grid[fy][fx] = T.VOID; // reveal hidden tiles in range
          }
        }
      }
    }
    // Award memory score bonus with score multipliers (same as other tiles)
    const memMul = (gameState.synergyMultiplier || 1.0) * (gameState.scoreMul || 1.0);
    gameState.score = (gameState.score || 0) + Math.round(MEMORY_SCORE_BONUS * memMul);
    gameState.memoryFlash = { x: newX, y: newY, radius, expiresMs: Date.now() + 800 };
    createParticles(gameState, newX, newY, '#66ccff', 14);
    try { window.AudioManager?.play('peace'); } catch (e) {}
    return true;
  }

  // Cover: grants temporary shield that reduces next damage
  if (stepped === T.COVER) {
    gameState.player.coverTurns = Math.max(gameState.player.coverTurns || 0, 3);
    gameState.grid[newY][newX] = T.VOID;
    if (gameState.emotionalField?.add) gameState.emotionalField.add('tender', 0.9); // safety → tender
    createParticles(gameState, newX, newY, '#446688', 12);
    try { window.AudioManager?.play('select'); } catch (e) {}
    // COVER tile triggers a body scan reminder (dream yoga)
    gameState._triggerBodyScan = true;
    return true;
  }

  // Default: allow stepping through
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
