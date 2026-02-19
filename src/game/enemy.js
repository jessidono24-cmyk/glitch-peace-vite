// ENEMY AI — 9 behavior types (ported & adapted from glitch-peace)
// Behaviors: chase (default), wander, patrol, orbit, adaptive, predictive, rush, scatter, hallucination
import { T, DIFF_CFG } from '../core/constants.js';

// ─── Tuning Constants ──────────────────────────────────────────────────────
const HALLUCINATION_SPAWN_RATE = 0.0004; // probability per frame × level to spawn a phantom
const HALLUCINATION_MAX_COUNT  = 3;      // max simultaneous phantoms on screen
const HALLUCINATION_MIN_LEVEL  = 3;      // level at which phantoms first appear

// ─── Behaviours ────────────────────────────────────────────────────────────
// chase       — direct pathfinding toward player (default)
// wander      — random walk, short-range chase burst when player is close
// patrol      — sinusoidal path, pivots toward player if within 5 tiles
// orbit       — circles the player at a set radius
// adaptive    — increases speed each hit (same as chase_fast)
// predictive  — aims 1 step ahead of player's movement direction
// rush        — beelines; no wall-deflection fallback (charges through on miss)
// scatter     — runs away from the player (used by fearful enemy types)
// ───────────────────────────────────────────────────────────────────────────

/** Create a new enemy instance */
export function createEnemy(x, y, level, behavior = 'chase') {
  const baseSpeed = Math.max(220, 600 - level * 25);
  return {
    x, y, level,
    behavior,
    speed: baseSpeed,       // ms between moves (lower = faster)
    lastMove: 0,
    stunTurns: 0,           // grid-mode stun counter
    stunTimer: 0,           // ms-mode stun timer
    hp: 30 + level * 3,
    maxHp: 30 + level * 3,
    dmg: 10,
    color: '#ff6600',
    symbol: '■',
    isBoss: false,
    // patrol / orbit state
    patrolAngle: Math.random() * Math.PI * 2,
    orbitAngle: Math.random() * Math.PI * 2,
    orbitR: 3 + Math.floor(Math.random() * 3),
    // speed-adaptation (adaptive behaviour)
    hitsOnPlayer: 0,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function canStep(gameState, y, x) {
  const sz = gameState.gridSize;
  return x >= 0 && x < sz && y >= 0 && y < sz && gameState.grid[y]?.[x] !== T.WALL;
}

function tryStep(e, ny, nx, gameState) {
  if (canStep(gameState, ny, nx)) { e.y = ny; e.x = nx; return true; }
  return false;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Hallucination helper ───────────────────────────────────────────────────
// Each call may spawn a hallucination phantom on the grid that chases the
// player. Phantoms are stored in gameState._hallucinations and cause 8 dmg on
// contact (they're not real enemies — just visual/damage pressure).
function tickHallucinations(gameState, now) {
  if (!gameState._hallucinations) gameState._hallucinations = [];
  const sz = gameState.gridSize;
  const level = gameState.level || 1;

  // Spawn new one occasionally (level 3+)
  if (level >= HALLUCINATION_MIN_LEVEL && Math.random() < HALLUCINATION_SPAWN_RATE * level && gameState._hallucinations.length < HALLUCINATION_MAX_COUNT) {
    for (let i = 0; i < 40; i++) {
      const hy = 1 + Math.floor(Math.random() * (sz - 2));
      const hx = 1 + Math.floor(Math.random() * (sz - 2));
      if (gameState.grid[hy]?.[hx] === T.VOID) {
        gameState._hallucinations.push({ y: hy, x: hx, timer: 0, life: 4000 + Math.random() * 4000, bornAt: now });
        break;
      }
    }
  }

  // Tick existing
  gameState._hallucinations = gameState._hallucinations.filter(h => {
    h.life -= 16; // assume ~60fps tick
    if (h.life <= 0) return false;
    h.timer += 16;
    if (h.timer >= 450) {
      h.timer = 0;
      const tdx = gameState.player.x - h.x;
      const tdy = gameState.player.y - h.y;
      const dy = tdy > 0 ? 1 : tdy < 0 ? -1 : 0;
      const dx = tdx > 0 ? 1 : tdx < 0 ? -1 : 0;
      const ny = h.y + dy, nx = h.x + dx;
      if (canStep(gameState, ny, nx)) { h.y = ny; h.x = nx; }
      // Hit player
      if (h.y === gameState.player.y && h.x === gameState.player.x) {
        gameState.player.hp = Math.max(0, (gameState.player.hp || 0) - 8);
        if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', 0.4);
        return false; // phantom consumed on hit
      }
    }
    return true;
  });
}

// ─── Main Update ────────────────────────────────────────────────────────────
export function updateEnemies(gameState) {
  if (gameState.state !== 'PLAYING') return;
  const now = Date.now();
  const sz  = gameState.gridSize;
  const diff = gameState.settings?.difficulty || 'normal';
  const dcfg = DIFF_CFG[diff] || DIFF_CFG.normal;
  // Global freeze check:
  // gameState._freezeUntilMs is a timestamp set by the FREEZE powerup (powerups.js)
  // when acquired. All enemy movement is suspended until Date.now() passes that timestamp.
  if (gameState._freezeUntilMs && now < gameState._freezeUntilMs) return;

  // Hallucinations (level 3+, spawned probabilistically)
  tickHallucinations(gameState, now);

  // Matrix modifier: Matrix A = enemies 35% faster
  const matrixMul = gameState.matrixActive === 'A' ? 0.65 : 1.0;

  for (const e of gameState.enemies) {
    // Stun (ms-based)
    if (e.stunTimer > 0) { e.stunTimer -= 16; continue; }
    // Stun (turn-based)
    if (e.stunTurns > 0) continue;

    const baseInterval = Math.max(dcfg.eSpeedMin || 200, e.speed);
    const interval = Math.round(baseInterval * matrixMul);
    if (now - (e.lastMove || 0) < interval) continue;
    e.lastMove = now;

    const tdx  = gameState.player.x - e.x;
    const tdy  = gameState.player.y - e.y;
    const dist = Math.abs(tdx) + Math.abs(tdy);
    const beh  = e.behavior || 'chase';

    if (beh === 'wander' || dist > sz * 0.75) {
      // Random walk; short-range chase burst when player close
      if (dist < 4) {
        const pref = dist < 4
          ? (Math.abs(tdy) >= Math.abs(tdx)
              ? [[tdy > 0 ? 1 : -1, 0], [0, tdx > 0 ? 1 : -1]]
              : [[0, tdx > 0 ? 1 : -1], [tdy > 0 ? 1 : -1, 0]])
          : [];
        let moved = false;
        for (const [dy, dx] of pref) {
          if (tryStep(e, e.y + dy, e.x + dx, gameState)) { moved = true; break; }
        }
        if (!moved) _randomStep(e, gameState);
      } else {
        _randomStep(e, gameState);
      }

    } else if (beh === 'patrol') {
      e.patrolAngle += (Math.random() - 0.5) * 0.4;
      const dy = clamp(Math.round(Math.sin(e.patrolAngle)), -1, 1);
      const dx = clamp(Math.round(Math.cos(e.patrolAngle)), -1, 1);
      if (!tryStep(e, e.y + dy, e.x + dx, gameState)) _randomStep(e, gameState);
      // Pivot toward player if close
      if (dist < 5 && Math.random() < 0.7) {
        const pdy = tdy > 0 ? 1 : tdy < 0 ? -1 : 0;
        const pdx = tdx > 0 ? 1 : tdx < 0 ? -1 : 0;
        tryStep(e, e.y + pdy, e.x + pdx, gameState);
      }

    } else if (beh === 'orbit') {
      e.orbitAngle += 0.25;
      const tx = gameState.player.x + Math.round(Math.cos(e.orbitAngle) * e.orbitR);
      const ty = gameState.player.y + Math.round(Math.sin(e.orbitAngle) * e.orbitR);
      const dy = ty - e.y > 0 ? 1 : ty - e.y < 0 ? -1 : 0;
      const dx = tx - e.x > 0 ? 1 : tx - e.x < 0 ? -1 : 0;
      tryStep(e, e.y + dy, e.x + dx, gameState);

    } else if (beh === 'adaptive' || beh === 'chase_fast') {
      // Speeds up each time it hits the player
      _chaseStep(e, tdx, tdy, gameState, true);

    } else if (beh === 'predictive') {
      // Aims one step ahead of the player's last movement direction
      let ptx = gameState.player.x, pty = gameState.player.y;
      const ld = gameState._lastDir;
      if (ld) { ptx += ld.x; pty += ld.y; }
      const cx = ptx - e.x, cy = pty - e.y;
      const pref = Math.abs(cy) >= Math.abs(cx)
        ? [[cy > 0 ? 1 : -1, 0], [0, cx > 0 ? 1 : -1]]
        : [[0, cx > 0 ? 1 : -1], [cy > 0 ? 1 : -1, 0]];
      let moved = false;
      for (const [dy, dx] of pref) {
        if (tryStep(e, e.y + dy, e.x + dx, gameState)) { moved = true; break; }
      }
      if (!moved) _randomStep(e, gameState);

    } else if (beh === 'rush') {
      // Beeline; no fallback — pure direct charge
      _chaseStep(e, tdx, tdy, gameState, false);

    } else if (beh === 'scatter') {
      // Flees from player
      const pref = Math.abs(tdy) >= Math.abs(tdx)
        ? [[tdy > 0 ? -1 : 1, 0], [0, tdx > 0 ? -1 : 1]]
        : [[0, tdx > 0 ? -1 : 1], [tdy > 0 ? -1 : 1, 0]];
      let moved = false;
      for (const [dy, dx] of pref) {
        if (tryStep(e, e.y + dy, e.x + dx, gameState)) { moved = true; break; }
      }
      if (!moved) _randomStep(e, gameState);

    } else {
      // Default: direct chase
      _chaseStep(e, tdx, tdy, gameState, true);
    }
  }
}

function _chaseStep(e, tdx, tdy, gameState, withFallback) {
  const pref = Math.abs(tdy) >= Math.abs(tdx)
    ? [[tdy > 0 ? 1 : -1, 0], [0, tdx > 0 ? 1 : -1]]
    : [[0, tdx > 0 ? 1 : -1], [tdy > 0 ? 1 : -1, 0]];
  let moved = false;
  for (const [dy, dx] of pref) {
    if (tryStep(e, e.y + dy, e.x + dx, gameState)) { moved = true; break; }
  }
  if (!moved && withFallback) _randomStep(e, gameState);
}

function _randomStep(e, gameState) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
  for (const [dy, dx] of dirs) {
    if (tryStep(e, e.y + dy, e.x + dx, gameState)) break;
  }
}
