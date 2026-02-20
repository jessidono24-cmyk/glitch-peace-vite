'use strict';
import { CFG } from '../core/state.js';
import { CELL, GAP } from '../core/constants.js';
import { rnd } from '../core/utils.js';

export function burst(game, gx, gy, color, count, speed) {
  if (!CFG.particles || !game) return;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + Math.random() * 0.6;
    const spd   = speed * (0.6 + Math.random() * 0.8);
    game.particles.push({
      x: gx * (CELL + GAP) + CELL / 2,
      y: gy * (CELL + GAP) + CELL / 2,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1,
      r: 2 + Math.random() * 3,
      color,
      life: 20 + rnd(16), maxLife: 36,
    });
  }
}

export function resonanceWave(game, cx, cy, color) {
  if (!CFG.particles || !game) return;
  game.resonanceWave = {
    x: cx * (CELL + GAP) + CELL / 2,
    y: cy * (CELL + GAP) + CELL / 2,
    r: 0, maxR: 200, color, alpha: 0.55,
  };
}

export function addEcho(game, matrixActive) {
  if (!CFG.particles) return;
  game.echos.push({
    x: game.player.x * (CELL + GAP) + CELL / 2,
    y: game.player.y * (CELL + GAP) + CELL / 2,
    life: 30, maxLife: 30, size: CELL * 0.38,
    color: matrixActive === 'A' ? 'rgba(200,0,80,0.35)' : 'rgba(0,255,136,0.3)',
  });
}
