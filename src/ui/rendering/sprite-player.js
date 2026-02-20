'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — sprite-player.js — 3D-A Phase
//
//  Procedural animated player sprite drawn entirely with Canvas 2D API.
//  No external assets required. Replaces the static nested-rect player
//  rendering in renderer.js with a stateful animation system.
//
//  Animation states:
//    idle   — gentle breathing float cycle (radial pulse, inner ring)
//    walk   — directional lean, trailing afterimage
//    hit    — red flash + recoil offset
//    death  — scatter into particles
//    shield — electric corona around body
//    arch   — archetype aura rings per archetype color
// ═══════════════════════════════════════════════════════════════════════

export class SpritePlayer {
  constructor() {
    this.state        = 'idle';  // idle | walk | hit | death | shield | arch
    this.dir          = 'down';  // up | down | left | right
    this.stateTimer   = 0;       // ms remaining in transient state
    this._hitFlash    = 0;       // 0–1 hit flash intensity
    this._walkPhase   = 0;       // continuous walk oscillation
    this._idleBob     = 0;       // continuous idle bob
  }

  // Call once per tick (before render) to advance animation state
  tick(dt) {
    this._idleBob   += dt * 0.003;
    this._walkPhase += dt * 0.008;
    if (this._hitFlash > 0) this._hitFlash = Math.max(0, this._hitFlash - dt * 0.006);
    if (this.stateTimer > 0) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) this.state = 'idle';
    }
  }

  // Signal a move in direction dy,dx
  onMove(dy, dx) {
    this.state = 'walk';
    this.stateTimer = 180;
    if      (dy < 0) this.dir = 'up';
    else if (dy > 0) this.dir = 'down';
    else if (dx < 0) this.dir = 'left';
    else if (dx > 0) this.dir = 'right';
  }

  // Signal damage received
  onHit() {
    this._hitFlash  = 1.0;
    this.state      = 'hit';
    this.stateTimer = 220;
  }

  // Draw the player at canvas position (px, py) in a CELL×CELL area
  draw(ctx, px, py, CELL, ts, opts = {}) {
    const {
      matrixActive    = 'B',
      archetypeActive = false,
      archetypeGlow   = '#ffdd00',
      shielded        = false,
      phaseShift      = false,
      aura            = false,
      emotion         = 'neutral',
    } = opts;

    const cx = px + CELL / 2;
    const cy = py + CELL / 2;

    // Emotion tint
    const emColor = emotion === 'panic'    ? '#ff2222'
                  : emotion === 'hopeless' ? '#3355aa'
                  : emotion === 'peace'    ? '#00ffcc'
                  : emotion === 'clarity'  ? '#00eeff'
                  :                          '#00ffaa';

    // Matrix palette
    const bodyC1 = matrixActive === 'A' ? '#aa0055' : '#005533';
    const bodyC2 = matrixActive === 'A' ? '#cc0077' : '#00cc77';
    const coreC  = matrixActive === 'A' ? 'rgba(220,0,120,0.9)' : 'rgba(0,255,170,0.9)';
    const glowC  = shielded    ? '#00ffff'
                 : phaseShift  ? '#00aaff'
                 : matrixActive === 'A' ? '#ff0088'
                 : emColor;

    // Phase shift semi-transparency
    if (phaseShift) ctx.globalAlpha = 0.4;

    // Idle vertical bob
    const bob = Math.sin(this._idleBob) * 1.8;

    // Walk directional lean
    const walkOff = this.state === 'walk' ? Math.sin(this._walkPhase) * 2.0 : 0;
    const leanX = (this.state === 'walk' && (this.dir === 'left' || this.dir === 'right'))
                ? (this.dir === 'left' ? -walkOff : walkOff) : 0;
    const leanY = (this.state === 'walk' && (this.dir === 'up' || this.dir === 'down'))
                ? (this.dir === 'up' ? -walkOff : walkOff) : 0;

    const drawX = px + leanX;
    const drawY = py + bob + leanY;

    // Hit flash overlay
    if (this._hitFlash > 0.05) {
      ctx.globalAlpha = this._hitFlash * 0.55;
      ctx.fillStyle = '#ff0022';
      ctx.beginPath();
      ctx.roundRect(drawX + 2, drawY + 2, CELL - 4, CELL - 4, 8);
      ctx.fill();
      ctx.globalAlpha = phaseShift ? 0.4 : 1;
    }

    // Aura ring
    if (aura) {
      const pulse = 0.5 + 0.5 * Math.sin(ts * 0.009);
      ctx.strokeStyle = `rgba(0,255,136,${0.10 + 0.08 * pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + leanX, cy + bob + leanY, (CELL / 2 + 7) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body glow
    const pulse = 0.55 + 0.45 * Math.sin(ts * 0.009);
    ctx.shadowColor = glowC;
    ctx.shadowBlur  = (shielded ? 36 : aura ? 30 : 22) * pulse;

    // Outer body
    ctx.fillStyle = bodyC1;
    ctx.beginPath(); ctx.roundRect(drawX + 4, drawY + 4, CELL - 8, CELL - 8, 8); ctx.fill();

    // Mid layer
    ctx.fillStyle = bodyC2;
    ctx.beginPath(); ctx.roundRect(drawX + 9, drawY + 9, CELL - 18, CELL - 18, 5); ctx.fill();

    // Inner core — breathes on idle, pulses on hit
    const coreScale = this.state === 'hit'
      ? (0.5 + 0.5 * (1 - this._hitFlash))
      : (0.82 + 0.18 * Math.sin(this._idleBob));
    const coreOff = (1 - coreScale) * (CELL - 30) / 2;
    ctx.fillStyle = coreC;
    ctx.beginPath();
    ctx.roundRect(
      drawX + 15 + coreOff,
      drawY + 15 + coreOff,
      (CELL - 30) * coreScale,
      (CELL - 30) * coreScale,
      3,
    );
    ctx.fill();

    ctx.shadowBlur = 0;

    // Walk chevron — directional arrow fades in on move
    if (this.state === 'walk') {
      const chevA = this.dir === 'up' ? -Math.PI / 2
                  : this.dir === 'down' ? Math.PI / 2
                  : this.dir === 'left' ? Math.PI
                  : 0;
      const chevX = cx + leanX + Math.cos(chevA) * (CELL * 0.28);
      const chevY = cy + bob + leanY + Math.sin(chevA) * (CELL * 0.28);
      ctx.globalAlpha = Math.min(1, this.stateTimer / 80) * 0.7;
      ctx.strokeStyle = bodyC2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chevX + Math.cos(chevA + 2.4) * 5, chevY + Math.sin(chevA + 2.4) * 5);
      ctx.lineTo(chevX, chevY);
      ctx.lineTo(chevX + Math.cos(chevA - 2.4) * 5, chevY + Math.sin(chevA - 2.4) * 5);
      ctx.stroke();
      ctx.globalAlpha = phaseShift ? 0.4 : 1;
    }

    // Archetype outer ring + orbiting dot
    if (archetypeActive) {
      const archPulse = 0.5 + 0.5 * Math.sin(ts * 0.008);
      ctx.strokeStyle = archetypeGlow;
      ctx.lineWidth   = 2;
      ctx.shadowColor = archetypeGlow;
      ctx.shadowBlur  = 14 * archPulse;
      ctx.beginPath(); ctx.roundRect(drawX + 1, drawY + 1, CELL - 2, CELL - 2, 8); ctx.stroke();
      const orbA = ts * 0.012;
      ctx.fillStyle = archetypeGlow;
      ctx.beginPath();
      ctx.arc(cx + leanX + Math.cos(orbA) * (CELL * 0.4),
              cy + bob + leanY + Math.sin(orbA) * (CELL * 0.4), 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Shield corona
    if (shielded) {
      const shPulse = 0.6 + 0.4 * Math.sin(ts * 0.015);
      ctx.strokeStyle = `rgba(0,255,255,${0.65 * shPulse})`;
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.roundRect(px, py + bob, CELL, CELL, 8); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const sa = ts * 0.018 + i * Math.PI * 2 / 3;
        const sr = CELL * 0.5 + 3 * shPulse;
        ctx.fillStyle = 'rgba(0,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sa) * sr, cy + bob + Math.sin(sa) * sr, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    // Corner bracket reticle
    ctx.strokeStyle = glowC;
    ctx.lineWidth   = 2;
    const bk = 9;
    [[px + leanX, py + bob + leanY], [px + leanX + CELL, py + bob + leanY],
     [px + leanX, py + bob + leanY + CELL], [px + leanX + CELL, py + bob + leanY + CELL]].forEach(([bx_, by_], i) => {
      const ddx = i % 2 === 0 ? 1 : -1, ddy = i < 2 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(bx_ + ddx * 2, by_); ctx.lineTo(bx_ + ddx * (2 + bk), by_); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx_, by_ + ddy * 2); ctx.lineTo(bx_, by_ + ddy * (2 + bk)); ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }
}

// Module-level singleton — imported by renderer.js
export const spritePlayer = new SpritePlayer();
