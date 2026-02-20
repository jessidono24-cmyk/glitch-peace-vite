'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — rhythm-mode.js — Phase M7 (Complete)
//
//  Full independent Rhythm Mode: 4 columns of falling notes.
//  Keys: A / S / D / F  (or 1/2/3/4, or ←↓↑→ arrow keys).
//  Beat window: ±80ms = PERFECT, ±180ms = GOOD, else MISS.
//  5-level progression; each level uses a different dreamscape palette.
//  Notes are generated from a procedural pattern seeded per-dreamscape.
// ═══════════════════════════════════════════════════════════════════════

import { GameMode } from './game-mode.js';
import { DREAMSCAPES } from '../core/constants.js';

// Column key bindings (two sets — keyboard row + arrow keys)
export const RHYTHM_KEYS = [
  ['a', 'arrowleft',  '1'],  // col 0
  ['s', 'arrowdown',  '2'],  // col 1
  ['d', 'arrowup',    '3'],  // col 2
  ['f', 'arrowright', '4'],  // col 3
];

const COLS         = 4;
const NOTE_SPEED   = 220;   // px per second
const HIT_Y_FRAC   = 0.82;  // hit zone at 82% of canvas height
const PERFECT_MS   = 80;
const GOOD_MS      = 180;
const NOTE_RADIUS  = 22;
const SPAWN_AHEAD  = 2500;  // ms before note should arrive, spawn it

// Dreamscape-to-palette map (col 0-3 colors)
const DS_PALETTES = [
  ['#00ff88','#00ddbb','#00aaff','#ffdd00'],  // void / grid default
  ['#ffaa00','#ff4422','#cc2244','#ff8800'],  // dragon
  ['#cc00ff','#ff00aa','#aa44ff','#ff44cc'],  // courtyard
  ['#00ffcc','#44ffaa','#00ddff','#88ffcc'],  // forest/ocean
  ['#ffffaa','#ffdd44','#ffaa22','#ff8844'],  // solar temple
];

// Simple pseudo-random note pattern generator
function _genPattern(seed, level) {
  const notes = [];
  let t = 500 + 200 * Math.max(0, 5 - level); // initial delay
  const bpm  = 80 + level * 8;
  const beatMs = 60000 / bpm;
  const totalBeats = 30 + level * 12; // notes per level
  let s = seed;
  // LCG (Linear Congruential Generator) with Numerical Recipes params: Xn+1 = (a·Xn + c) mod 2^32
  function lcg() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }
  for (let i = 0; i < totalBeats; i++) {
    const col    = Math.floor(lcg() * COLS);
    const type   = lcg() < 0.15 ? 'hold' : 'tap'; // 15% hold notes
    const holdMs = type === 'hold' ? (Math.floor(lcg() * 3) + 1) * beatMs : 0;
    notes.push({ col, arriveMs: t, type, holdMs, hit: null });
    // Vary spacing: sometimes two notes close together, sometimes a gap
    t += beatMs * (lcg() < 0.2 ? 0.5 : lcg() < 0.1 ? 2 : 1);
  }
  return notes;
}

export class RhythmMode extends GameMode {
  constructor(sharedSystems) {
    super(sharedSystems);
    this.name     = 'rhythm';
    this.isActive = false;

    this._notes      = [];   // { col, arriveMs, type, holdMs, hit, y }
    this._elapsed    = 0;    // ms into current level
    this._score      = 0;
    this._combo      = 0;
    this._maxCombo   = 0;
    this._streak     = [];   // last 10 results for grading
    this._level      = 1;
    this._dsIdx      = 0;
    this._palette    = DS_PALETTES[0];
    this._result     = null;
    this._hitFX      = [];   // { col, label, color, alpha, timer }
    this._levelComplete = false;
    this._levelCompleteTimer = 0;
    this._width      = 600;
    this._height     = 700;
    this._paused     = false;
    this._heldCols   = new Set(); // columns currently held
  }

  init(config = {}) {
    this.isActive    = true;
    this._level      = config.level || 1;
    this._dsIdx      = config.dsIdx || 0;
    this._score      = config.score || 0;
    this._combo      = 0;
    this._maxCombo   = 0;
    this._elapsed    = 0;
    this._result     = null;
    this._levelComplete = false;
    this._levelCompleteTimer = 0;
    this._hitFX      = [];
    this._heldCols   = new Set();
    this._paused     = false;

    const ds = DREAMSCAPES[this._dsIdx % DREAMSCAPES.length];
    const seed = this._dsIdx * 1337 + this._level * 73;
    this._notes   = _genPattern(seed, this._level);
    this._palette = DS_PALETTES[this._level % DS_PALETTES.length];
    this._dsName  = ds.name;
    this._dsColor = ds.bgColor || '#01010a';
    this._bpm     = 80 + this._level * 8;
    this._beatMs  = 60000 / this._bpm;

    // Beat track (visual background pulses)
    this._beatTimer  = 0;
    this._beatPulse  = 0;
  }

  update(dt, _keys, _matrix, _ts) {
    if (!this.isActive || this._paused) return null;
    if (this._result) return this._result;

    // Level complete hold
    if (this._levelComplete) {
      this._levelCompleteTimer -= dt;
      if (this._levelCompleteTimer <= 0) {
        if (this._level >= 5) {
          this._result = { phase: 'dead', data: { score: this._score, level: this._level, ds: { name: this._dsName, id: 'rhythm' } } };
          return this._result;
        }
        this._level++;
        this._dsIdx = (this._dsIdx + 1) % DREAMSCAPES.length;
        this.init({ level: this._level, dsIdx: this._dsIdx, score: this._score });
      }
      return null;
    }

    this._elapsed  += dt;

    // Beat pulse for background
    this._beatTimer += dt;
    if (this._beatTimer >= this._beatMs) {
      this._beatTimer -= this._beatMs;
      this._beatPulse = 1.0;
      this.sfxManager.resume();
    } else {
      this._beatPulse = Math.max(0, this._beatPulse - dt * 0.004);
    }

    // Age hit FX
    for (const fx of this._hitFX) { fx.timer -= dt; fx.alpha = Math.max(0, fx.timer / 400); }
    this._hitFX = this._hitFX.filter(f => f.timer > 0);

    // Auto-miss notes that have passed the hit zone
    for (const n of this._notes) {
      if (n.hit !== null) continue;
      const rel = this._elapsed - n.arriveMs;
      if (rel > GOOD_MS + 60) {
        n.hit = 'miss';
        this._combo = 0;
        this._addHitFX(n.col, 'MISS', '#ff3333');
        this.sfxManager.resume();
      }
    }

    // Check level complete (all notes resolved)
    const allDone = this._notes.every(n => n.hit !== null);
    if (allDone) {
      this._levelComplete = true;
      this._levelCompleteTimer = 2000;
    }

    return null;
  }

  // Called from keydown handler in main.js
  pressCol(col) {
    if (this._paused || this._levelComplete) return;
    // Find nearest unresolved note in this column within hit window
    let best = null, bestDist = Infinity;
    for (const n of this._notes) {
      if (n.hit !== null || n.col !== col) continue;
      const rel = this._elapsed - n.arriveMs;
      const dist = Math.abs(rel);
      if (dist < GOOD_MS + 60 && dist < bestDist) {
        best = n; bestDist = dist;
      }
    }
    if (!best) {
      // No note — empty press
      this._combo = 0;
      return;
    }
    const rel  = this._elapsed - best.arriveMs;
    const dist = Math.abs(rel);
    let grade, pts;
    if (dist <= PERFECT_MS) {
      grade = 'PERFECT'; pts = 300 + this._combo * 10;
      this.sfxManager.playPeaceCollect?.();
    } else if (dist <= GOOD_MS) {
      grade = 'GOOD';    pts = 150 + this._combo * 5;
    } else {
      grade = 'LATE';    pts = 50;
    }
    best.hit = grade.toLowerCase();
    this._score += pts;
    this._combo++;
    this._maxCombo = Math.max(this._maxCombo, this._combo);
    this._addHitFX(col, grade + (this._combo > 2 ? ' ×' + this._combo : ''),
      grade === 'PERFECT' ? '#00ff88' : grade === 'GOOD' ? '#ffdd00' : '#aaaaaa');
  }

  _addHitFX(col, label, color) {
    this._hitFX.push({ col, label, color, alpha: 1.0, timer: 400 });
  }

  render(ctx, ts, renderData) {
    if (!this.isActive) return;
    const w = this._width, h = this._height;

    // Background
    ctx.fillStyle = this._dsColor || '#01010a';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.09)';
      ctx.fillRect(0, y, w, 1);
    }

    // Background stars from renderData
    if (renderData?.backgroundStars) {
      for (const s of renderData.backgroundStars) {
        ctx.globalAlpha = s.a * (0.3 + 0.2 * Math.sin(ts * 0.0008 + s.phase));
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x * w / 600, s.y * h / 700, s.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const colW  = w / (COLS + 2);
    const startX = colW;
    const hitY  = Math.round(h * HIT_Y_FRAC);

    // Beat pulse overlay
    if (this._beatPulse > 0) {
      ctx.fillStyle = `rgba(100,255,180,${this._beatPulse * 0.06})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Lane backgrounds
    for (let c = 0; c < COLS; c++) {
      const lx = Math.round(startX + c * colW);
      ctx.fillStyle = `rgba(20,30,20,0.35)`;
      ctx.fillRect(lx, 0, colW - 4, h);
      // Lane glow at bottom
      const grd = ctx.createLinearGradient(lx, hitY - 40, lx, hitY + 40);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(0.5, this._palette[c] + '44');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(lx, hitY - 40, colW - 4, 80);
    }

    // Hit zone line
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(startX, hitY); ctx.lineTo(startX + COLS * colW - 4, hitY); ctx.stroke();

    // Hit zone circles
    for (let c = 0; c < COLS; c++) {
      const cx = Math.round(startX + c * colW + (colW - 4) / 2);
      const col = this._palette[c];
      ctx.strokeStyle = col + '88';
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(cx, hitY, NOTE_RADIUS + 2, 0, Math.PI*2); ctx.stroke();
      // Key label
      ctx.fillStyle = col + 'aa';
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(['A','S','D','F'][c], cx, hitY + NOTE_RADIUS + 18);
    }

    // Draw notes
    const now = this._elapsed;
    for (const n of this._notes) {
      if (n.hit !== null) continue;
      const rel = now - n.arriveMs; // negative = approaching
      // y position: at arriveMs, note is at hitY. Before that, above.
      const noteY = hitY + (rel / 1000) * NOTE_SPEED;
      if (noteY < -NOTE_RADIUS * 2 || noteY > h + NOTE_RADIUS * 2) continue;
      const cx = Math.round(startX + n.col * colW + (colW - 4) / 2);
      const col = this._palette[n.col];

      if (n.type === 'hold') {
        // Hold note: elongated rectangle
        const tailY = noteY - (n.holdMs / 1000) * NOTE_SPEED;
        ctx.fillStyle = col + '55';
        ctx.fillRect(cx - NOTE_RADIUS * 0.6, tailY, NOTE_RADIUS * 1.2, noteY - tailY);
      }
      // Main note circle
      const proximity = 1 - Math.min(1, Math.abs(rel) / 500);
      ctx.shadowColor  = col;
      ctx.shadowBlur   = 8 + proximity * 12;
      ctx.fillStyle    = col;
      ctx.beginPath(); ctx.arc(cx, noteY, NOTE_RADIUS, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur   = 0;
      // Inner shine
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(cx - 6, noteY - 6, NOTE_RADIUS * 0.35, 0, Math.PI*2); ctx.fill();
    }

    // Hit FX
    for (const fx of this._hitFX) {
      const cx = Math.round(startX + fx.col * colW + (colW - 4) / 2);
      ctx.globalAlpha = fx.alpha;
      ctx.fillStyle   = fx.color;
      ctx.font        = 'bold 13px Courier New';
      ctx.textAlign   = 'center';
      ctx.shadowColor = fx.color; ctx.shadowBlur = 8;
      ctx.fillText(fx.label, cx, hitY - NOTE_RADIUS - 14 - (1 - fx.alpha) * 30);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // HUD
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 14px Courier New';
    ctx.fillText('RHYTHM FLOW', 14, 22);
    ctx.fillStyle = '#445544'; ctx.font = '9px Courier New';
    ctx.fillText(this._dsName || '', 14, 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px Courier New';
    ctx.fillText(this._score.toString(), w - 14, 22);
    ctx.fillStyle = '#00ffcc'; ctx.font = '10px Courier New';
    ctx.fillText('COMBO ×' + this._combo, w - 14, 36);

    // Level / BPM
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334433'; ctx.font = '9px Courier New';
    ctx.fillText('LEVEL ' + this._level + '  ·  ' + this._bpm + ' BPM', w / 2, 20);

    // Beat pulse dot
    const pulseR = 4 + this._beatPulse * 5;
    ctx.fillStyle = `rgba(0,255,136,${0.4 + this._beatPulse * 0.6})`;
    ctx.beginPath(); ctx.arc(w / 2, 30, pulseR, 0, Math.PI*2); ctx.fill();

    // Level complete overlay
    if (this._levelComplete) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, w, h);
      ctx.textAlign = 'center';
      const scoreGrade = this._maxCombo > 20 ? 'S' : this._maxCombo > 12 ? 'A' : this._maxCombo > 6 ? 'B' : 'C';
      ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 20;
      ctx.font = 'bold 26px Courier New'; ctx.fillText('LEVEL COMPLETE', w/2, h/2 - 60);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Courier New';
      ctx.fillText('SCORE  ' + this._score, w/2, h/2 - 20);
      ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 32px Courier New';
      ctx.fillText('GRADE  ' + scoreGrade, w/2, h/2 + 20);
      ctx.fillStyle = '#334433'; ctx.font = '10px Courier New';
      if (this._level < 5) ctx.fillText('loading next dreamscape…', w/2, h/2 + 60);
      else                  ctx.fillText('journey complete', w/2, h/2 + 60);
    }

    ctx.textAlign = 'left';
  }

  // Resize canvas dimensions the mode renders at
  resize(w, h) { this._width = w; this._height = h; }

  getResult() { return this._result; }

  setSizes(w, h) { this._width = w; this._height = h; }
}
