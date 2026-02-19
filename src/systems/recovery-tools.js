// ═══════════════════════════════════════════════════════════════════════
//  RECOVERY TOOLS - Phase 2 Implementation
//  7 evidence-based tools for addiction recovery support
//  Only activates for modes with the corresponding mechanic flag.
// ═══════════════════════════════════════════════════════════════════════

import { T, TILE_DEF } from '../core/constants.js';

// ─── SHARED HELPERS ──────────────────────────────────────────────────────

/** Tile types that represent emotional/physical hazards */
const HAZARD_TILES = new Set([
  T.DESPAIR, T.TERROR, T.RAGE, T.TRAP, T.HARM, T.PAIN, T.HOPELESS,
]);

export function isHazardTile(tileType) {
  return HAZARD_TILES.has(tileType);
}

// ─── 1. IMPULSE BUFFER ───────────────────────────────────────────────────
//  Mandatory 1-second pause before stepping into a hazard tile.
//  Trains impulse control — the player must wait, can't rush in.

const IMPULSE_DELAY_MS = 1000;

/**
 * Call this before executing a move into (targetX, targetY).
 * Returns true  → move is BLOCKED (buffer counting down).
 * Returns false → move is ALLOWED (either not a hazard, or buffer elapsed).
 */
export function checkImpulseBuffer(gameState, targetX, targetY, now) {
  if (!gameState.mechanics?.impulseBuffer) return false;

  const tile = gameState.grid[targetY]?.[targetX];
  if (!isHazardTile(tile)) return false; // only hazards trigger the buffer

  if (!gameState._impulseBuffer) {
    // First time approaching this hazard — start the countdown
    gameState._impulseBuffer = {
      startMs: now,
      targetX,
      targetY,
    };
    return true; // blocked
  }

  // If player moved to a different target tile, reset
  if (gameState._impulseBuffer.targetX !== targetX || gameState._impulseBuffer.targetY !== targetY) {
    delete gameState._impulseBuffer;
    return false;
  }

  if (now - gameState._impulseBuffer.startMs >= IMPULSE_DELAY_MS) {
    delete gameState._impulseBuffer; // countdown done, allow the move
    return false;
  }

  return true; // still counting down
}

/**
 * Cancel the impulse buffer (e.g. player changed direction).
 */
export function cancelImpulseBuffer(gameState) {
  delete gameState._impulseBuffer;
}

// ─── 2. PATTERN ECHO ─────────────────────────────────────────────────────
//  Visual trail of the last N positions. Reveals movement loops.

const ECHO_LENGTH = 14;

/**
 * Record the current player position in the echo trail (call after each move).
 */
export function recordEchoPosition(gameState) {
  if (!gameState.mechanics?.patternEcho) return;
  if (!gameState.player) return;
  if (!gameState._echoTrail) gameState._echoTrail = [];

  const { x, y } = gameState.player;
  const last = gameState._echoTrail[gameState._echoTrail.length - 1];
  if (last && last.x === x && last.y === y) return; // skip duplicate

  gameState._echoTrail.push({ x, y, ms: Date.now() });
  if (gameState._echoTrail.length > ECHO_LENGTH) gameState._echoTrail.shift();
}

// ─── 3. CONSEQUENCE PREVIEW ──────────────────────────────────────────────
//  Shows the next 3 tiles ahead in the last-moved direction.
//  Danger tiles glow red, safe tiles glow green.

/**
 * Returns up to `steps` tiles ahead of the player in direction (dx, dy).
 * Each entry: { x, y, tileType, danger } where danger = 1.0 hazard, -1.0 benefit, 0 neutral.
 */
export function getConsequencePreview(gameState, dx, dy, steps = 3) {
  if (!gameState.mechanics?.consequencePreview) return [];
  if (!dx && !dy) return [];
  const result = [];
  let cx = gameState.player.x;
  let cy = gameState.player.y;
  for (let i = 0; i < steps; i++) {
    cx += dx;
    cy += dy;
    if (cx < 0 || cy < 0 || cx >= gameState.gridSize || cy >= gameState.gridSize) break;
    const tileType = gameState.grid[cy]?.[cx];
    if (tileType === undefined) break;
    const def = TILE_DEF[tileType] || {};
    if (def.solid) break; // wall blocks sight line
    result.push({
      x: cx,
      y: cy,
      tileType,
      danger: isHazardTile(tileType) ? 1.0 : (tileType === T.PEACE || tileType === T.INSIGHT || tileType === T.ARCH ? -1.0 : 0.0),
    });
  }
  return result;
}

// ─── 4. ROUTE ALTERNATIVES ───────────────────────────────────────────────
//  Shows up to 3 safe adjacent moves when the intended route is dangerous.

const ALL_DIRS = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];

/**
 * Returns up to 3 safe (non-hazard, non-wall) adjacent tiles.
 */
export function getRouteAlternatives(gameState) {
  if (!gameState.mechanics?.routeAlternatives) return [];
  const { x, y } = gameState.player;
  const routes = [];
  for (const { dx, dy } of ALL_DIRS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= gameState.gridSize || ny >= gameState.gridSize) continue;
    const tile = gameState.grid[ny]?.[nx];
    const def = TILE_DEF[tile] || {};
    if (!def.solid && !isHazardTile(tile)) {
      routes.push({ x: nx, y: ny, dx, dy });
      if (routes.length >= 3) break;
    }
  }
  return routes;
}

// ─── 5. THRESHOLD MONITOR ────────────────────────────────────────────────
//  Detects near-miss events (player is adjacent to a hazard tile).
//  Logs to gameState._nearMissCount and feeds the emotional field.

const NEAR_MISS_DEBOUNCE_MS = 2500;

/**
 * Check if player is in a "near-miss" situation. Call once per update frame.
 */
export function checkThresholdMonitor(gameState) {
  if (!gameState.mechanics?.thresholdMonitor && !gameState.mechanics?.impulseBuffer) return;
  if (!gameState.player) return;

  const { x, y } = gameState.player;
  const now = Date.now();
  let nearMiss = false;

  for (const { dx, dy } of ALL_DIRS) {
    const ax = x + dx;
    const ay = y + dy;
    if (ax < 0 || ay < 0 || ax >= gameState.gridSize || ay >= gameState.gridSize) continue;
    if (isHazardTile(gameState.grid[ay]?.[ax])) { nearMiss = true; break; }
  }

  if (nearMiss) {
    if (!gameState._nearMissCount) gameState._nearMissCount = 0;
    if (!gameState._lastNearMissMs) gameState._lastNearMissMs = 0;
    if (now - gameState._lastNearMissMs > NEAR_MISS_DEBOUNCE_MS) {
      gameState._nearMissCount++;
      gameState._lastNearMissMs = now;
      if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', 0.3);
      // Visual near-miss flash stored for render
      gameState._nearMissFlashMs = now;
    }
  }
}

// ─── 6. SESSION MANAGER ──────────────────────────────────────────────────
//  Gentle wellness reminders and fatigue system.

const SESSION_MILESTONES = [
  { minutes: 20, message: "You've played 20 minutes · Take a breath 🌬", color: '#88ddff', severity: 'gentle' },
  { minutes: 45, message: '45 minutes played · Rest your eyes for a moment 👁', color: '#ffcc88', severity: 'moderate' },
  { minutes: 90, message: '90 minutes · Consider a real break 🌿', color: '#ff8888', severity: 'strong' },
];

/**
 * Update session timer and return an alert object if a new milestone was reached.
 */
export function updateSessionManager(gameState, deltaMs) {
  if (!gameState._sessionStartMs) gameState._sessionStartMs = Date.now();
  if (!gameState._sessionAlertsSent) gameState._sessionAlertsSent = new Set();

  const elapsedMs = Date.now() - gameState._sessionStartMs;
  const elapsedMinutes = elapsedMs / 60000;

  // Expose elapsed for HUD
  gameState._sessionElapsedMs = elapsedMs;

  for (const milestone of SESSION_MILESTONES) {
    if (elapsedMinutes >= milestone.minutes && !gameState._sessionAlertsSent.has(milestone.minutes)) {
      gameState._sessionAlertsSent.add(milestone.minutes);

      // Set alert for render system to display
      gameState._sessionAlert = {
        ...milestone,
        shownAtMs: Date.now(),
        durationMs: 5000,
      };

      // Fatigue system: diminishing score multiplier after 30 min
      if (elapsedMinutes >= 30 && !gameState._fatigueMulApplied) {
        gameState.scoreMul = Math.max(0.5, (gameState.scoreMul || 1.0) * 0.85);
        gameState._fatigueMulApplied = true;
      }
      return gameState._sessionAlert;
    }
  }

  // Expire displayed alert
  if (gameState._sessionAlert) {
    if (Date.now() - gameState._sessionAlert.shownAtMs > gameState._sessionAlert.durationMs) {
      delete gameState._sessionAlert;
    }
  }

  return null;
}

// ─── 7. RELAPSE COMPASSION ───────────────────────────────────────────────
//  Non-punitive handling of "death". Player gets a second chance
//  at reduced HP on their first lethal hit per level.

/**
 * Call when player HP reaches 0. Returns true if player was rescued (second chance).
 * Mutates gameState.player.hp to rescue value.
 */
export function applyRelapseCompassion(gameState) {
  if (!gameState.mechanics?.compassionateRelapse) return false;
  if (gameState._compassionUsedThisLevel) return false;

  // Second chance: restore to 15 HP with a mercy particle
  gameState.player.hp = 15;
  gameState._compassionUsedThisLevel = true;

  // Compassionate message stored for HUD overlay
  gameState._compassionMessage = {
    text: 'Pattern interrupted — returning to safety',
    subtext: 'One more chance · You can do this',
    shownAtMs: Date.now(),
    durationMs: 3000,
    color: '#88aaff',
  };

  if (gameState.emotionalField?.add) {
    gameState.emotionalField.add('tender', 1.0);
    gameState.emotionalField.add('hope', 0.8);
  }

  return true;
}

/**
 * Reset relapse compassion state at level start.
 */
export function resetRelapseCompassion(gameState) {
  delete gameState._compassionUsedThisLevel;
  delete gameState._compassionMessage;
}

// ─── DREAM YOGA: REALITY CHECK ───────────────────────────────────────────
//  Periodic "Am I dreaming?" prompt that cultivates metacognitive awareness.

const REALITY_CHECK_INTERVAL_MS = 5 * 60 * 1000; // every 5 min during play

/**
 * Check whether a reality check prompt should be shown.
 * Returns a prompt object, or null.
 */
export function checkRealityCheck(gameState) {
  if (!gameState.mechanics?.realityChecks) return null;
  if (!gameState._lastRealityCheckMs) gameState._lastRealityCheckMs = Date.now() + 30000; // first check after 30s

  if (Date.now() - gameState._lastRealityCheckMs < REALITY_CHECK_INTERVAL_MS) return null;

  gameState._lastRealityCheckMs = Date.now();
  gameState._realityCheckPrompt = {
    question: 'Am I dreaming right now?',
    hint: 'Look at your hands · Notice where you are · Feel your breath',
    shownAtMs: Date.now(),
    durationMs: 8000,
  };
  return gameState._realityCheckPrompt;
}

// ─── RENDER HELPERS ──────────────────────────────────────────────────────
//  All visual overlays for recovery tools are rendered here.

/**
 * Draw all active recovery tool overlays onto the canvas.
 * Call after rendering tiles/entities but before HUD.
 */
export function renderRecoveryOverlays(gameState, ctx, tileSize) {
  // 1. Pattern Echo trail
  if (gameState._echoTrail && gameState._echoTrail.length > 0) {
    const trail = gameState._echoTrail;
    const now = Date.now();
    for (let i = 0; i < trail.length; i++) {
      const step = trail[i];
      const age = Math.max(0, 1 - (now - step.ms) / 4000); // fade over 4s
      const idx = i / trail.length; // 0=oldest, 1=newest
      const alpha = age * 0.45 * (0.2 + idx * 0.8);
      if (alpha < 0.02) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(
        step.x * tileSize + tileSize * 0.25,
        step.y * tileSize + tileSize * 0.25,
        tileSize * 0.5,
        tileSize * 0.5,
      );
      ctx.restore();
    }
  }

  // 2. Consequence preview
  if (gameState._consequencePreview && gameState._consequencePreview.length > 0) {
    gameState._consequencePreview.forEach((cell, i) => {
      const alpha = 0.38 - i * 0.08;
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cell.danger > 0 ? '#ff2244' : (cell.danger < 0 ? '#00ff88' : '#8888ff');
      ctx.fillRect(cell.x * tileSize, cell.y * tileSize, tileSize, tileSize);
      ctx.restore();
    });
  }

  // 3. Route alternatives
  if (gameState._routeAlternatives && gameState._routeAlternatives.length > 0) {
    gameState._routeAlternatives.forEach(route => {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#44ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        route.x * tileSize + 2,
        route.y * tileSize + 2,
        tileSize - 4,
        tileSize - 4,
      );
      ctx.restore();
    });
  }

  // 4. Impulse buffer countdown ring on target tile
  if (gameState._impulseBuffer) {
    const { targetX, targetY, startMs } = gameState._impulseBuffer;
    const elapsed = Date.now() - startMs;
    const progress = Math.min(1, elapsed / IMPULSE_DELAY_MS);
    const cx = targetX * tileSize + tileSize / 2;
    const cy = targetY * tileSize + tileSize / 2;
    const r = tileSize * 0.42;

    // Warning flash background
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(targetX * tileSize, targetY * tileSize, tileSize, tileSize);
    ctx.restore();

    // Countdown ring (arc fills clockwise over 1 second)
    ctx.save();
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();

    // Countdown number
    const remaining = Math.ceil((IMPULSE_DELAY_MS - elapsed) / 1000);
    ctx.fillStyle = '#ffee00';
    ctx.font = `bold ${Math.floor(tileSize * 0.5)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(remaining, cx, cy);
    ctx.restore();
  }

  // 5. Near-miss flash (brief red border on player tile)
  if (gameState._nearMissFlashMs && gameState.player) {
    const age = Date.now() - gameState._nearMissFlashMs;
    if (age < 500) {
      const alpha = (1 - age / 500) * 0.6;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff3344';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        gameState.player.x * tileSize,
        gameState.player.y * tileSize,
        tileSize,
        tileSize,
      );
      ctx.restore();
    }
  }

  // 6. Compassion message overlay
  if (gameState._compassionMessage) {
    const { text, subtext, shownAtMs, durationMs, color } = gameState._compassionMessage;
    const age = Date.now() - shownAtMs;
    if (age < durationMs) {
      const fadeOut = age > durationMs - 800 ? (durationMs - age) / 800 : 1.0;
      const fadeIn = Math.min(1, age / 400);
      const alpha = fadeIn * fadeOut;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.save();
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle = 'rgba(5,5,20,0.85)';
      ctx.fillRect(0, h * 0.35, w, h * 0.32);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillText(text, w / 2, h * 0.46);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#b0b0cc';
      ctx.font = `${Math.floor(w / 28)}px monospace`;
      ctx.fillText(subtext, w / 2, h * 0.54);
      ctx.restore();
    }
  }

  // 7. Session alert banner (top-center, gentle)
  if (gameState._sessionAlert) {
    const { message, color, shownAtMs, durationMs } = gameState._sessionAlert;
    const age = Date.now() - shownAtMs;
    if (age < durationMs) {
      const fadeIn = Math.min(1, age / 300);
      const fadeOut = age > durationMs - 600 ? (durationMs - age) / 600 : 1.0;
      const alpha = fadeIn * fadeOut;
      const w = ctx.canvas.width;
      ctx.save();
      ctx.globalAlpha = alpha * 0.92;
      ctx.fillStyle = 'rgba(5,5,20,0.80)';
      ctx.fillRect(0, 0, w, 36);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `${Math.floor(w / 38)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, w / 2, 18);
      ctx.restore();
    }
  }

  // 8. Reality check prompt (full-screen gentle overlay)
  if (gameState._realityCheckPrompt) {
    const { question, hint, shownAtMs, durationMs } = gameState._realityCheckPrompt;
    const age = Date.now() - shownAtMs;
    if (age < durationMs) {
      const fadeIn = Math.min(1, age / 500);
      const fadeOut = age > durationMs - 1000 ? (durationMs - age) / 1000 : 1.0;
      const alpha = fadeIn * fadeOut;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = 'rgba(5,5,30,0.9)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#aaccff';
      ctx.font = `bold ${Math.floor(w / 14)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#aaccff';
      ctx.shadowBlur = 20;
      ctx.fillText(question, w / 2, h / 2 - 18);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#7788aa';
      ctx.font = `${Math.floor(w / 30)}px monospace`;
      ctx.fillText(hint, w / 2, h / 2 + 22);
      ctx.restore();
    } else {
      delete gameState._realityCheckPrompt;
    }
  }
}
