'use strict';
import { T } from '../core/constants.js';
import { CFG, UPG } from '../core/state.js';
import { rnd, pick, clamp } from '../core/utils.js';
import { DIFF_CFG } from '../core/constants.js';
import { burst } from './particles.js';

export function stepEnemies(game, dt, keys, matrixActive, hallucinations, showMsg, setEmotion) {
  const g = game;
  const sz = g.sz;
  const d = DIFF_CFG[CFG.difficulty];
  if (!g || g.hp <= 0) return;

  if (UPG.freeze && UPG.freezeTimer > 0) { UPG.freezeTimer -= dt; return; }

  const slowMul   = g.slowMoves ? 1.5 : 1.0;
  const baseSpeed = d.eSpeedBase - g.level * 30;
  const mSpeed    = Math.max(d.eSpeedMin, baseSpeed) * (matrixActive === 'A' ? 0.65 : 1.0) * slowMul * (g.temporalEnemyMul ?? 1.0);

  // Hallucinations (level 3+)
  if (g.level >= 3) {
    hallucinations.splice(0, hallucinations.length, ...hallucinations.filter(h => h.life > 0));
    if (Math.random() < 0.0006 * g.level && hallucinations.length < 3) {
      const y = rnd(sz), x = rnd(sz);
      if (g.grid[y][x] === T.VOID) hallucinations.push({ y, x, timer: 0, life: 5000 + rnd(4000) });
    }
    for (const h of hallucinations) {
      h.life -= dt; h.timer += dt;
      if (h.timer > 450) {
        h.timer = 0;
        const tdx = g.player.x - h.x, tdy = g.player.y - h.y;
        const dy = tdy > 0 ? 1 : tdy < 0 ? -1 : 0, dx = tdx > 0 ? 1 : tdx < 0 ? -1 : 0;
        const ny = h.y + dy, nx = h.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz) { h.y = ny; h.x = nx; }
        if (h.y === g.player.y && h.x === g.player.x) {
          h.life = 0;
          if (UPG.shield && UPG.shieldTimer > 0) {
            showMsg('SHIELD HELD vs PHANTOM!', '#00ffcc', 35);
          } else {
            g.hp = Math.max(0, g.hp - 8);
            g.shakeFrames = 4; g.flashColor = '#8800ff'; g.flashAlpha = 0.18;
            showMsg('CHAOS PHANTOM!', '#aa00ff', 35);
          }
        }
      }
    }
  }

  // Boss
  if (g.boss && g.boss.hp > 0) {
    const b = g.boss; b.timer += dt; b.phaseTimer -= dt;
    if (b.phaseTimer <= 0) { b.phase = b.phase === 'chase' ? 'orbit' : 'chase'; b.phaseTimer = 400 + rnd(300); }
    // Use phase-specific speed from boss-system if available, fallback to 280ms
    if (b.timer > (b.speedMs || 280)) {
      b.timer = 0;
      let tx = g.player.x, ty = g.player.y;
      if (g.level >= 8) {
        tx += keys.has('ArrowRight') || keys.has('d') ? 1 : keys.has('ArrowLeft') || keys.has('a') ? -1 : 0;
        ty += keys.has('ArrowDown')  || keys.has('s') ? 1 : keys.has('ArrowUp')   || keys.has('w') ? -1 : 0;
      }
      const bdy = ty - b.y, bdx = tx - b.x;
      const dy = bdy > 0 ? 1 : bdy < 0 ? -1 : 0, dx = bdx > 0 ? 1 : bdx < 0 ? -1 : 0;
      if (dy && b.y + dy >= 0 && b.y + dy < sz && g.grid[b.y + dy][b.x] !== T.WALL) b.y += dy;
      else if (dx && b.x + dx >= 0 && b.x + dx < sz && g.grid[b.y][b.x + dx] !== T.WALL) b.x += dx;
      if (b.y === g.player.y && b.x === g.player.x) {
        const dmg = Math.round(40 * d.dmgMul * (matrixActive === 'A' ? 1.3 : 1));
        g.hp = Math.max(0, g.hp - dmg);
        g.shakeFrames = 14; g.flashColor = '#ff00aa'; g.flashAlpha = 0.45;
        burst(g, g.player.x, g.player.y, '#ff00aa', 22, 5);
        showMsg('BOSS! -' + dmg, '#ff00aa', 50);
      }
    }
  }

  // Regular enemies
  for (const e of g.enemies) {
    if (e.stunTimer > 0) { e.stunTimer -= dt; continue; }
    e.timer += dt;
    if (e.timer < mSpeed) continue;
    e.timer = 0; e.prevY = e.y; e.prevX = e.x;

    const beh  = e.behavior || g.ds.enemyBehavior;
    const tdx  = g.player.x - e.x, tdy = g.player.y - e.y;
    const dist = Math.abs(tdx) + Math.abs(tdy);
    let moved  = false;

    if (beh === 'random' || dist > sz * 0.7) {  // 'random' = roguelike/daily default wander; fallback when far from player
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
      for (const [dy, dx] of dirs) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
      }
    } else if (beh === 'wander' || beh === 'passive' || beh === 'none') {
      // passive/none: gentle random wander only (training mode, alchemist, zen fallback)
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
      for (const [dy, dx] of dirs) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
      }
    } else if (beh === 'patrol') {
      e.patrolAngle += (Math.random() - 0.5) * 0.4;
      const dy = Math.round(Math.sin(e.patrolAngle)), dx = Math.round(Math.cos(e.patrolAngle));
      const ny = e.y + clamp(dy, -1, 1), nx = e.x + clamp(dx, -1, 1);
      if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; }
      if (dist < 5 && Math.random() < 0.7) {
        const pdy = tdy > 0 ? 1 : tdy < 0 ? -1 : 0, pdx = tdx > 0 ? 1 : tdx < 0 ? -1 : 0;
        const ny2 = e.y + pdy, nx2 = e.x + pdx;
        if (ny2 >= 0 && ny2 < sz && nx2 >= 0 && nx2 < sz && g.grid[ny2][nx2] !== T.WALL) { e.y = ny2; e.x = nx2; }
      }
    } else if (beh === 'orbit') {
      e.orbitAngle += 0.25;
      const tx = g.player.x + Math.round(Math.cos(e.orbitAngle) * e.orbitR);
      const ty = g.player.y + Math.round(Math.sin(e.orbitAngle) * e.orbitR);
      const dy = ty - e.y > 0 ? 1 : ty - e.y < 0 ? -1 : 0;
      const dx = tx - e.x > 0 ? 1 : tx - e.x < 0 ? -1 : 0;
      if (e.y + dy >= 0 && e.y + dy < sz && e.x + dx >= 0 && e.x + dx < sz && g.grid[e.y + dy][e.x + dx] !== T.WALL) { e.y += dy; e.x += dx; }
    } else if (beh === 'chase_fast' || beh === 'adaptive' || beh === 'predictive' || beh === 'hunt' || beh === 'aggressive') {
      let tx = g.player.x, ty = g.player.y;
      if ((beh === 'predictive' && g.level >= 7) || beh === 'hunt') {
        tx += keys.has('ArrowRight') || keys.has('d') ? 1 : keys.has('ArrowLeft') || keys.has('a') ? -1 : 0;
        ty += keys.has('ArrowDown')  || keys.has('s') ? 1 : keys.has('ArrowUp')   || keys.has('w') ? -1 : 0;
      }
      const cx = tx - e.x, cy = ty - e.y;
      const pref = Math.abs(cy) >= Math.abs(cx)
        ? [[cy > 0 ? 1 : -1, 0], [0, cx > 0 ? 1 : -1]]
        : [[0, cx > 0 ? 1 : -1], [cy > 0 ? 1 : -1, 0]];
      for (const [dy, dx] of pref) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
      }
      if (!moved) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
        for (const [dy, dx] of dirs) {
          const ny = e.y + dy, nx = e.x + dx;
          if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; break; }
        }
      }
    } else if (beh === 'rush') {
      const pref = Math.abs(tdy) >= Math.abs(tdx)
        ? [[tdy > 0 ? 1 : -1, 0], [0, tdx > 0 ? 1 : -1]]
        : [[0, tdx > 0 ? 1 : -1], [tdy > 0 ? 1 : -1, 0]];
      for (const [dy, dx] of pref) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
      }
      if (!moved) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
        for (const [dy, dx] of dirs) {
          const ny = e.y + dy, nx = e.x + dx;
          if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; break; }
        }
      }
    } else if (beh === 'scatter') {
      const pref = Math.abs(tdy) >= Math.abs(tdx)
        ? [[tdy > 0 ? -1 : 1, 0], [0, tdx > 0 ? -1 : 1]]
        : [[0, tdx > 0 ? -1 : 1], [tdy > 0 ? -1 : 1, 0]];
      for (const [dy, dx] of pref) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
      }
      if (!moved) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
        for (const [dy, dx] of dirs) {
          const ny = e.y + dy, nx = e.x + dx;
          if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; break; }
        }
      }
    } else if (beh === 'labyrinth') {
      // Aztec: hugs walls (right-hand rule approximation) and closes in when near player
      if (dist < 4) {
        const pref = Math.abs(tdy) >= Math.abs(tdx)
          ? [[tdy > 0 ? 1 : -1, 0], [0, tdx > 0 ? 1 : -1]]
          : [[0, tdx > 0 ? 1 : -1], [tdy > 0 ? 1 : -1, 0]];
        for (const [dy, dx] of pref) {
          const ny = e.y + dy, nx = e.x + dx;
          if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; break; }
        }
      }
      if (!moved) {
        // Follow the wall: prefer directions that have a wall to the right
        e.patrolAngle += (Math.random() < 0.35 ? (Math.random() - 0.5) * 1.2 : 0);
        const dy = Math.round(Math.sin(e.patrolAngle)), dx = Math.round(Math.cos(e.patrolAngle));
        const ny = e.y + clamp(dy, -1, 1), nx = e.x + clamp(dx, -1, 1);
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; moved = true; }
        if (!moved) {
          e.patrolAngle += Math.PI * 0.5; // turn 90° when blocked
          const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
          for (const [dy2, dx2] of dirs) {
            const ny2 = e.y + dy2, nx2 = e.x + dx2;
            if (ny2 >= 0 && ny2 < sz && nx2 >= 0 && nx2 < sz && g.grid[ny2][nx2] !== T.WALL) { e.y = ny2; e.x = nx2; break; }
          }
        }
      }
    } else {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
      for (const [dy, dx] of dirs) {
        const ny = e.y + dy, nx = e.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) { e.y = ny; e.x = nx; break; }
      }
    }

    // Hit player
    if (e.y === g.player.y && e.x === g.player.x) {
      if (UPG.shield && UPG.shieldTimer > 0) {
        e.stunTimer = 1300;
        showMsg('SHIELD HELD!', '#00ffcc', 38);
        burst(g, g.player.x, g.player.y, '#00ffcc', 14, 3);
      } else {
        const dmg = Math.round(22 * d.dmgMul * (matrixActive === 'A' ? 1.3 : 1));
        g.hp = Math.max(0, g.hp - dmg);
        g.shakeFrames = 8; g.flashColor = '#ff2200'; g.flashAlpha = 0.35;
        burst(g, g.player.x, g.player.y, '#ff4400', 16, 4);
        e.stunTimer = 900; UPG.shieldCount = 0; UPG.comboCount = 0;
        showMsg('HIT! -' + dmg, '#ff4400', 40);
        setEmotion(g, 'panic');
      }
    }
    for (const cz of g.captureZones) {
      if (Math.abs(e.x - g.player.x) <= cz.r && Math.abs(e.y - g.player.y) <= cz.r) {
        if (UPG.shield && UPG.shieldTimer > 0) {
          showMsg('SHIELDED vs CAPTURE!', '#00ffcc', 25);
        } else {
          g.hp = Math.max(0, g.hp - 5);
          showMsg('CAPTURED!', '#ff0044', 25);
        }
      }
    }
    // Containment zones (player-placed via C key): stun enemies inside
    // Radius 3 tiles matches the visual rendering (3.5 × cell+gap circle, ~3 tile effective radius)
    const CONT_ZONE_STUN_RADIUS = 3;
    if (g.contZones) {
      for (const cz of g.contZones) {
        if (Math.abs(e.x - cz.x) <= CONT_ZONE_STUN_RADIUS && Math.abs(e.y - cz.y) <= CONT_ZONE_STUN_RADIUS) {
          e.stunTimer = Math.max(e.stunTimer, 800);
        }
      }
    }
  }
  g.captureZones = g.captureZones.filter(c => { c.timer--; return c.timer > 0; });
  if (g.contZones) g.contZones = g.contZones.filter(c => { c.timer -= dt; return c.timer > 0; });
}
