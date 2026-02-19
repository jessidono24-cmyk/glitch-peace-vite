// ═══════════════════════════════════════════════════════════════════════
//  ARCHETYPES SYSTEM — 5 Archetypal Powers (ported from glitch-peace)
//
//  Original dreamscape archetypes (each named for its dreamscape character):
//    Dragon         — wall_jump   : leap 2 tiles in any direction
//    Child Guide    — reveal      : flash-reveal all HIDDEN tiles on grid
//    Orb            — phase_walk  : walk through 1 wall (10 move duration)
//    Captor-Teacher — rewind      : undo last 3 moves (temporal rewind)
//    Protector      — shield_burst: +shield + stun all enemies 1.5s
//
//  J key activates the current archetype power (charged from ARCH tiles).
//  Each archetype has a cooldown of 12s between uses.
// ═══════════════════════════════════════════════════════════════════════

import { T } from '../core/constants.js';

// ─── Archetype Definitions ──────────────────────────────────────────────────
export const ARCHETYPE_DEF = {
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    power: 'wall_jump',
    symbol: '🐉',
    color: '#ffaa00',
    activationMsg: 'DRAGON LEAP — wall jump active!',
    description: 'Leap 2 tiles in any unblocked direction',
  },
  child: {
    id: 'child',
    name: 'Child Guide',
    power: 'reveal',
    symbol: '✦',
    color: '#aaffcc',
    activationMsg: 'CHILD REVEALS THE PATH…',
    description: 'Flash-reveal all hidden tiles for 3 seconds',
  },
  orb: {
    id: 'orb',
    name: 'Orb',
    power: 'phase_walk',
    symbol: '◉',
    color: '#aaddff',
    activationMsg: 'ORB PHASE ACTIVE — pass through walls',
    description: 'Walk through walls for the next 10 moves',
  },
  captor: {
    id: 'captor',
    name: 'Captor-Teacher',
    power: 'rewind',
    symbol: '⟳',
    color: '#ffaadd',
    activationMsg: 'TEMPORAL REWIND — rewinding 3 moves',
    description: 'Undo your last 3 moves',
  },
  protector: {
    id: 'protector',
    name: 'Protector',
    power: 'shield_burst',
    symbol: '⬡',
    color: '#88ccff',
    activationMsg: 'PROTECT — shield active, enemies stunned!',
    description: 'Activate shield and stun all enemies for 1.5s',
  },
};

// ─── Archetype picked by dreamscape (fallback: orb) ──────────────────────
const DREAMSCAPE_ARCHETYPE = {
  RIFT: 'dragon',
  LODGE: 'child',
  WHEEL: 'orb',
  DUAT: 'captor',
  TOWER: 'protector',
  WILDERNESS: 'child',
  ABYSS: 'orb',
  CRYSTAL: 'captor',
  // Canonical dreamscapes
  NEIGHBORHOOD: 'child',      // Child Guide: familiar territory, memory reveals
  AZTEC: 'dragon',            // Dragon: leap through labyrinth walls
  ORB_ESCAPE: 'orb',          // Orb: phase-walk through dimensional portals
};

export function getArchetypeForDreamscape(dreamscapeId) {
  return DREAMSCAPE_ARCHETYPE[dreamscapeId] || 'orb';
}

// ─── Activation (called when player steps on ARCH tile or presses J) ────
/**
 * Activate the archetype power for the current dreamscape.
 * Stores activation state on gameState._archetype.
 */
export function activateArchetype(gameState) {
  const archetypeId = gameState._archetypeId || getArchetypeForDreamscape(gameState.currentDreamscape || 'RIFT');
  const def = ARCHETYPE_DEF[archetypeId];
  if (!def) return;

  // Cooldown check (12s)
  const now = Date.now();
  if (gameState._archetypeLastUsedMs && now - gameState._archetypeLastUsedMs < 12000) return;

  gameState._archetypeLastUsedMs = now;
  gameState._archetypeActive = { id: archetypeId, power: def.power, timer: 180, color: def.color };
  gameState._archetypeMsg = { text: def.activationMsg, color: def.color, expiresMs: now + 2500 };
  if (gameState.emotionalField?.add) gameState.emotionalField.add('awe', 1.0);

  // Execute power-specific effects
  const sz = gameState.gridSize;
  const px = gameState.player?.x ?? 0;
  const py = gameState.player?.y ?? 0;

  if (def.power === 'wall_jump') {
    // Leap 2 tiles in any unblocked direction
    const dirs = [[-2,0],[2,0],[0,-2],[0,2]];
    for (const [dy, dx] of dirs) {
      const ny = py + dy, nx = px + dx;
      if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && gameState.grid[ny]?.[nx] !== T.WALL) {
        gameState.player.y = ny;
        gameState.player.x = nx;
        break;
      }
    }

  } else if (def.power === 'reveal') {
    // Flash-reveal all hidden tiles for 3s
    if (!gameState._revealedHidden) gameState._revealedHidden = [];
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        if (gameState.grid[y]?.[x] === T.HIDDEN) {
          gameState.grid[y][x] = T.VOID; // temporarily reveal
          gameState._revealedHidden.push({ y, x, restoreMs: now + 3000 });
        }
      }
    }

  } else if (def.power === 'phase_walk') {
    // Allow walking through walls for 10 moves
    gameState._phaseWalkMoves = 10;

  } else if (def.power === 'rewind') {
    // Undo last 3 moves from history
    const history = gameState._archetypeHistory || [];
    const steps = Math.min(3, history.length);
    if (steps > 0) {
      const snap = history[history.length - steps];
      gameState.player.x = snap.x;
      gameState.player.y = snap.y;
      if (snap.grid) {
        for (let y = 0; y < sz; y++)
          for (let x = 0; x < sz; x++)
            if (gameState.grid[y]) gameState.grid[y][x] = snap.grid[y][x];
      }
      gameState._archetypeHistory = history.slice(0, history.length - steps);
    } else {
      gameState._archetypeMsg = { text: 'NO REWIND MEMORY', color: '#443344', expiresMs: now + 1500 };
    }

  } else if (def.power === 'shield_burst') {
    // Shield player + stun all enemies
    gameState._archetypeShield = { moves: 15, activatedMs: now };
    for (const e of (gameState.enemies || [])) {
      e.stunTimer = 1500;
      e.stunTurns = 3;
    }
    if (gameState.boss) gameState.boss.stunTimer = 2000;
  }
}

// ─── Save position to rewind history before each move ────────────────────
/** Call this in handleInput before movePlayer() when archetype is captor/rewind */
export function saveArchetypeHistory(gameState) {
  if (!gameState._archetypeHistory) gameState._archetypeHistory = [];
  if ((gameState._archetypeHistory.length || 0) >= 8) gameState._archetypeHistory.shift();
  const sz = gameState.gridSize;
  const gridSnap = gameState.grid?.map(row => [...row]) || [];
  gameState._archetypeHistory.push({
    x: gameState.player?.x ?? 0,
    y: gameState.player?.y ?? 0,
    grid: gridSnap,
  });
}

// ─── Update (called each frame from GridGameMode.update()) ──────────────
export function updateArchetypes(gameState, deltaTime) {
  const now = Date.now();

  // Restore hidden tiles after reveal timer expires
  if (gameState._revealedHidden?.length) {
    gameState._revealedHidden = gameState._revealedHidden.filter(r => {
      if (now >= r.restoreMs) {
        if (gameState.grid?.[r.y]?.[r.x] === T.VOID) {
          gameState.grid[r.y][r.x] = T.HIDDEN;
        }
        return false;
      }
      return true;
    });
  }

  // Phase walk: decrement on each move (handled in handleInput via _phaseWalkMoves)
  // Shield: decrement on each move (handled in handleInput via _archetypeShield.moves)

  // Clear expired archetype message
  if (gameState._archetypeMsg && now > gameState._archetypeMsg.expiresMs) {
    delete gameState._archetypeMsg;
  }
}

// ─── Render (called in GridGameMode.render()) ───────────────────────────
/** Renders archetype HUD indicator (cooldown bar + power name) and overlay messages */
export function renderArchetypeOverlay(gameState, ctx) {
  const now = Date.now();

  // Archetype activation message
  if (gameState._archetypeMsg && now < gameState._archetypeMsg.expiresMs) {
    const age = now - (gameState._archetypeMsg.expiresMs - 2500);
    const fade = Math.min(1, age / 300) * Math.min(1, (gameState._archetypeMsg.expiresMs - now) / 400);
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.save();
    ctx.globalAlpha = fade * 0.9;
    ctx.fillStyle = gameState._archetypeMsg.color;
    ctx.font = `bold ${Math.floor(w / 22)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = gameState._archetypeMsg.color;
    ctx.shadowBlur = 12;
    ctx.fillText(gameState._archetypeMsg.text, w / 2, h * 0.16);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Cooldown indicator bar (bottom-left)
  const archetypeId = gameState._archetypeId || getArchetypeForDreamscape(gameState.currentDreamscape || 'RIFT');
  const def = ARCHETYPE_DEF[archetypeId];
  if (!def) return;
  const lastUsed = gameState._archetypeLastUsedMs || 0;
  const cooldownMs = 12000;
  const elapsed = now - lastUsed;
  const readyFraction = lastUsed === 0 ? 1.0 : Math.min(1.0, elapsed / cooldownMs);

  const bx = 8, by = ctx.canvas.height - 48, bw = 80, bh = 8;
  ctx.save();
  ctx.fillStyle = '#111122';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = readyFraction >= 1.0 ? def.color : '#334';
  ctx.fillRect(bx, by, Math.round(bw * readyFraction), bh);
  ctx.strokeStyle = '#334455';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = readyFraction >= 1.0 ? def.color : '#556';
  ctx.font = `9px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`J ${def.name}${readyFraction >= 1.0 ? ' ✓' : ''}`, bx, by - 2);
  ctx.restore();

  // Phase walk remaining moves indicator
  if (gameState._phaseWalkMoves > 0) {
    ctx.save();
    ctx.fillStyle = '#aaddff';
    ctx.font = `10px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`PHASE ×${gameState._phaseWalkMoves}`, 8, ctx.canvas.height - 58);
    ctx.restore();
  }

  // Shield indicator
  if (gameState._archetypeShield) {
    ctx.save();
    ctx.fillStyle = '#88ccff';
    ctx.font = `10px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`SHIELD ×${gameState._archetypeShield.moves}`, 8, ctx.canvas.height - 70);
    ctx.restore();
  }
}
