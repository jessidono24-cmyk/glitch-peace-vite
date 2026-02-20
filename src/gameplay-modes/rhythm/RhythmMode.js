// ═══════════════════════════════════════════════════════════════════════
//  RHYTHM MODE — Beat-Synchronized Grid Mode
//  Players move to highlighted tiles in sync with a procedural drum beat.
//  Tiles pulse on the beat; landing on a pulse tile earns multiplied points.
//
//  DESIGN PHILOSOPHY:
//  Rhythm is one of the oldest non-pharmacological tools for altering
//  consciousness. Drumming synchronizes brainwaves (entrainment), reduces
//  cortisol, and increases group cohesion. In GLITCH·PEACE, rhythm serves
//  as a metacognitive timing tool: the player practices moving in
//  synchrony with external pulse — the opposite of impulsivity.
//
//  RESEARCH CITATIONS:
//  - Thaut, M.H. et al. (1997). Rhythmic Auditory Stimulation in movement
//    rehabilitation. Journal of Neurologic Rehabilitation, 11(1), 12–18.
//    RAS improves movement timing in neurological rehabilitation.
//  - Bittman, B. et al. (2001). Composite effects of group drumming music
//    therapy on modulation of neuroendocrine-immune parameters.
//    Alternative Therapies in Health and Medicine, 7(1), 38–47.
//    Group drumming reduces cortisol, increases DHEA and NK cell activity.
//  - Thaut, M.H. & Hoemberg, V. (2014). Handbook of Neurologic Music Therapy.
//    Oxford University Press.
//  - Csikszentmihalyi, M. (1990). Flow. Harper & Row.
//    Flow state requires matching challenge to skill — rhythm provides the
//    external scaffolding for this in GLITCH·PEACE.
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';
import * as THREE from 'three';

// ── Rhythm patterns ───────────────────────────────────────────────────────
// Patterns are 16-step sequences (4/4 time, 4 beats × 4 subdivisions)
// 1 = beat active, 0 = rest
// For each instrument: kick, snare, hihat, accent
const PATTERNS = [
  {
    name: 'Resting Pulse',
    bpm: 60,
    color: '#00aaff',
    glow: '#0066cc',
    description: 'Slow, steady — matching resting heart rate. Deeply calming.',
    kick:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    accent: [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0],
  },
  {
    name: 'Steady Walk',
    bpm: 80,
    color: '#44ffaa',
    glow: '#22cc88',
    description: 'Walking tempo — activating, present-moment movement.',
    kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    hihat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    accent: [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
  },
  {
    name: 'Flow State',
    bpm: 100,
    color: '#ffdd44',
    glow: '#ccaa22',
    description: 'Flow tempo — effortful but achievable. The sweet spot.',
    kick:   [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
    snare:  [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0],
    hihat:  [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1],
    accent: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
  },
  {
    name: 'Activation',
    bpm: 120,
    color: '#ff8844',
    glow: '#cc5522',
    description: '120 BPM — typical pop/dance tempo. Peak activation.',
    kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0],
    snare:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    hihat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    accent: [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
  },
];

// ── Beat window parameters ────────────────────────────────────────────────
const BEAT_WINDOW_MS      = 180; // time window to "hit" a beat (centered on beat onset)
const TILE_PULSE_DURATION = 300; // ms a pulse tile stays highlighted

// ── Combo multiplier constants ────────────────────────────────────────────
const MAX_MULTIPLIER          = 4;   // maximum score multiplier
const HITS_PER_MULTIPLIER_TIER = 3;  // every N consecutive hits raises tier
const MULTIPLIER_INCREMENT    = 0.5; // +0.5× per tier above 1

// ── Tile types ────────────────────────────────────────────────────────────
const TILE_TYPES = {
  EMPTY: { bg: '#05050f', color: '#112' },
  BEAT:  { bg: '#0a1a30', color: '#00aaff' },   // default beat tile
  KICK:  { bg: '#1a0800', color: '#ff6622' },   // kick drum pulse
  SNARE: { bg: '#001a08', color: '#44ff88' },   // snare pulse
  HIHAT: { bg: '#001820', color: '#88ddff' },   // hihat pulse
  PLUS:  { bg: '#1a1000', color: '#ffdd44' },   // bonus accent tile
};

/**
 * RhythmMode — Beat-synchronized movement puzzle.
 *
 * Tiles on the grid pulse in sync with a drum machine.
 * The player must step on a pulsing tile *during* its window.
 * Landing on beat: +points, combo++.
 * Landing off beat: no penalty (no punishment, just no reward).
 *
 * BPM adapts as the player levels up:
 * Level 1–2: 60 BPM (Resting Pulse)
 * Level 3–4: 80 BPM (Steady Walk)
 * Level 5–6: 100 BPM (Flow State)
 * Level 7+: 120 BPM (Activation)
 */
export class RhythmMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'rhythm',
      name: 'Rhythm — Beat Synchrony',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 80; // fast — rhythm requires quick response
    this._beatGrid = [];        // { type, pulsing, pulseAt, score }
    this._pattern = PATTERNS[0];
    this._beatStep = 0;
    this._lastBeatMs = 0;
    this._msPerStep = 0;
    this._beatHits = 0;         // consecutive on-beat hits (combo)
    this._bestCombo = 0;
    this._totalOnBeat = 0;
    this._totalAttempts = 0;
    this._lastPlayerMove = 0;
    this._scoreMultiplier = 1;
    this._patternFlash = null;  // { text, color, at }
    this._levelCompletePending = false;
    // Note: _audioCtx and _gainNode reserved for future direct Web Audio API integration
    this._audioCtx = null;
    this._gainNode = null;

    // Three.js 3D waveform visualizer (initialized lazily in init())
    this._3d = null;
  }

  init(gameState, canvas, ctx) {
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
    this.canvas = canvas;
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    gameState.score = gameState.score || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = 32; // 32 on-beat hits = level complete
    this._beatHits = 0;
    this._bestCombo = 0;
    this._totalOnBeat = 0;
    this._totalAttempts = 0;
    this._scoreMultiplier = 1;

    // Select pattern based on level
    const lvl = gameState.level || 1;
    const pidx = Math.min(PATTERNS.length - 1, Math.floor((lvl - 1) / 2));
    this._pattern = PATTERNS[pidx];
    this._msPerStep = 60000 / this._pattern.bpm / 4; // 16th-note duration
    this._beatStep = 0;
    this._lastBeatMs = Date.now();

    this._buildBeatGrid(gameState);
    this._initDrumAudio();
    this._init3DWaveform(canvas);
  }

  onResize(canvas, gameState) {
    if (!gameState) return;
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
  }

  _buildBeatGrid(gameState) {
    const sz = gameState.gridSize || 12;
    this._beatGrid = [];
    for (let y = 0; y < sz; y++) {
      this._beatGrid[y] = [];
      for (let x = 0; x < sz; x++) {
        // Assign beat tile types in a structured pattern
        const isKick  = (x + y) % 4 === 0;
        const isSnare = (x + y) % 4 === 2;
        const isHihat = (x % 2 === 0 && y % 2 === 1);
        const isPlus  = x === Math.floor(sz / 2) && y === Math.floor(sz / 2);
        const type = isPlus ? 'PLUS' : isKick ? 'KICK' : isSnare ? 'SNARE' : isHihat ? 'HIHAT' : 'BEAT';
        this._beatGrid[y][x] = { type, pulsing: false, pulseAt: 0, lastHit: 0 };
      }
    }
  }

  _initDrumAudio() {
    // Drum audio is handled via window.AudioManager synthesized sounds in _onBeatStep.
    // The sequencer advances in update() using elapsed-time comparison.
  }

  cleanup() {
    // No persistent timers to clear — sequencer runs in update() via elapsed-time checks.
    this._beatStep = 0;
    this._lastBeatMs = 0;
    this._cleanup3DWaveform();
  }

  update(gameState, deltaTime) {
    const now = Date.now();
    const stepElapsed = now - this._lastBeatMs;

    // Advance beat step
    if (stepElapsed >= this._msPerStep) {
      this._lastBeatMs = now;
      this._beatStep = (this._beatStep + 1) % 16;
      this._onBeatStep(gameState, this._beatStep, now);
    }

    // Fade pulsing tiles
    const sz = gameState.gridSize || 12;
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const cell = this._beatGrid[y]?.[x];
        if (cell?.pulsing && now - cell.pulseAt > TILE_PULSE_DURATION) {
          cell.pulsing = false;
        }
      }
    }
  }

  _onBeatStep(gameState, step, now) {
    const p = this._pattern;
    const sz = gameState.gridSize || 12;

    // Play drum sounds
    if (p.kick[step])   { try { window.AudioManager?.play('combo'); } catch(e) {} }
    if (p.snare[step])  { try { window.AudioManager?.play('select'); } catch(e) {} }
    if (p.hihat[step])  { try { window.AudioManager?.play('move'); } catch(e) {} }
    if (p.accent[step]) { try { window.AudioManager?.play('insight'); } catch(e) {} }

    // Pulse the 3D waveform on any active beat step
    if (p.kick[step] || p.snare[step] || p.accent[step]) this._triggerWavePulse();

    // Pulse tiles that match this step's active instruments
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const cell = this._beatGrid[y]?.[x];
        if (!cell) continue;
        const shouldPulse =
          (cell.type === 'KICK'  && p.kick[step])   ||
          (cell.type === 'SNARE' && p.snare[step])  ||
          (cell.type === 'HIHAT' && p.hihat[step])  ||
          (cell.type === 'PLUS'  && p.accent[step]) ||
          (cell.type === 'BEAT'  && (p.kick[step] || p.snare[step]));
        if (shouldPulse) {
          cell.pulsing = true;
          cell.pulseAt = now;
        }
      }
    }
  }

  handleInput(gameState, input) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;
    if (this._levelCompletePending) return;

    const dir = input.getDirectionalInput();
    if (dir.x === 0 && dir.y === 0) return;

    const sz = gameState.gridSize || 12;
    const nx = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
    const ny = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
    gameState.player.x = nx;
    gameState.player.y = ny;
    this.lastMoveTime = now;
    this._totalAttempts++;

    // Check if this move landed on a pulsing tile
    const cell = this._beatGrid[ny]?.[nx];
    if (cell?.pulsing) {
      // ON BEAT!
      this._beatHits++;
      this._totalOnBeat++;
      gameState.peaceCollected = (gameState.peaceCollected || 0) + 1;
      const mul = Math.min(MAX_MULTIPLIER, 1 + Math.floor(this._beatHits / HITS_PER_MULTIPLIER_TIER) * MULTIPLIER_INCREMENT);
      const pts = Math.round(100 * mul * (gameState.level || 1));
      gameState.score = (gameState.score || 0) + pts;
      this._scoreMultiplier = mul;
      if (this._beatHits > this._bestCombo) this._bestCombo = this._beatHits;
      cell.lastHit = now;
      this._patternFlash = {
        text: this._beatHits >= 8 ? `🔥 ON BEAT! ×${mul.toFixed(1)}` : `✓ ON BEAT! ×${mul.toFixed(1)}`,
        color: this._pattern.color,
        at: now,
      };
      try { window.AudioManager?.play('peace'); } catch(e) {}
    } else {
      // Off beat — no penalty, just break streak
      if (this._beatHits > 0) {
        this._patternFlash = { text: 'Off beat — try again', color: '#446688', at: now };
      }
      this._beatHits = 0;
      this._scoreMultiplier = 1;
      try { window.AudioManager?.play('nav'); } catch(e) {}
    }

    // Level complete
    if ((gameState.peaceCollected || 0) >= gameState.peaceTotal) {
      this._levelCompletePending = true;
      setTimeout(() => this._onLevelComplete(gameState), 400);
    }
  }

  _onLevelComplete(gameState) {
    this._levelCompletePending = false;
    const accuracy = this._totalAttempts > 0
      ? Math.round(100 * this._totalOnBeat / this._totalAttempts)
      : 0;
    gameState.score = (gameState.score || 0) + accuracy * 10 * (gameState.level || 1);
    gameState.level = (gameState.level || 1) + 1;

    // Advance pattern if needed
    const pidx = Math.min(PATTERNS.length - 1, Math.floor((gameState.level - 1) / 2));
    this._pattern = PATTERNS[pidx];
    this._msPerStep = 60000 / this._pattern.bpm / 4;
    this._beatStep = 0;
    this._lastBeatMs = Date.now();

    this._totalOnBeat = 0;
    this._totalAttempts = 0;
    this._beatHits = 0;
    this._buildBeatGrid(gameState);
    gameState.peaceCollected = 0;
    try { window.AudioManager?.play('level_complete'); } catch(e) {}
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 12;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();
    const p = this._pattern;

    // Background — deep dark with subtle grid
    ctx.fillStyle = '#040408';
    ctx.fillRect(0, 0, w, h);

    // Beat phase indicator (subtle background pulse)
    const stepFrac = Math.max(0, 1 - (now - this._lastBeatMs) / this._msPerStep);
    if (p.kick[this._beatStep] || p.snare[this._beatStep]) {
      ctx.save();
      ctx.globalAlpha = stepFrac * 0.04;
      ctx.fillStyle = p.color;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(this._xOff || 0, this._yOff || 0);

    // Render beat tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const cell = this._beatGrid[y]?.[x];
        if (!cell) continue;
        const tileType = TILE_TYPES[cell.type] || TILE_TYPES.BEAT;
        const px = x * ts;
        const py = y * ts;

        if (cell.pulsing) {
          const pulseAge = now - cell.pulseAt;
          const fade = Math.max(0, 1 - pulseAge / TILE_PULSE_DURATION);
          ctx.save();
          ctx.fillStyle = tileType.color;
          ctx.globalAlpha = 0.15 + fade * 0.55;
          ctx.fillRect(px, py, ts, ts);
          ctx.shadowColor = tileType.color;
          ctx.shadowBlur = 12 * fade;
          ctx.strokeStyle = tileType.color;
          ctx.lineWidth = 2 * fade;
          ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          ctx.fillStyle = tileType.bg;
          ctx.fillRect(px, py, ts, ts);
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, ts, ts);
        }

        // "Just hit" glow
        if (now - cell.lastHit < 400) {
          const hitFade = 1 - (now - cell.lastHit) / 400;
          ctx.save();
          ctx.globalAlpha = hitFade * 0.55;
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 16;
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // Player
    ctx.save();
    const playerCell = this._beatGrid[gameState.player.y]?.[gameState.player.x];
    const onBeat = playerCell?.pulsing || false;
    ctx.fillStyle = onBeat ? '#00ff88' : '#00e5ff';
    ctx.shadowColor = onBeat ? '#00ff88' : '#00e5ff';
    ctx.shadowBlur = onBeat ? 18 : 10;
    ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', gameState.player.x * ts + ts / 2, gameState.player.y * ts + ts / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();

    // Beat visualizer bar (bottom strip)
    this._renderBeatBar(ctx, w, h, now);

    // HUD
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.font = `${Math.floor(w / 34)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const acc = this._totalAttempts > 0 ? Math.round(100 * this._totalOnBeat / this._totalAttempts) : 0;
    ctx.fillText(`♩ ${p.name} · ${p.bpm} BPM · Streak: ${this._beatHits} · Best: ${this._bestCombo} · Acc: ${acc}% · Score: ${gameState.score || 0}`, 8, 6);
    ctx.restore();

    // Combo multiplier (bottom left)
    if (this._scoreMultiplier > 1) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`×${this._scoreMultiplier.toFixed(1)}`, 10, h - 52);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Pattern flash
    if (this._patternFlash) {
      const age = now - this._patternFlash.at;
      const dur = 1200;
      if (age < dur) {
        const fade = Math.min(1, age / 100) * (age > 800 ? (dur - age) / 400 : 1);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = this._patternFlash.color;
        ctx.shadowColor = this._patternFlash.color;
        ctx.shadowBlur = 10;
        ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._patternFlash.text, w / 2, h * 0.14);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        this._patternFlash = null;
      }
    }

    // On-beat counter
    ctx.save();
    ctx.fillStyle = '#334455';
    ctx.font = `${Math.floor(w / 38)}px monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`On-beat: ${gameState.peaceCollected || 0} / ${gameState.peaceTotal}  Lv.${gameState.level || 1}`, w - 8, 6);
    ctx.restore();

    // Three.js 3D waveform visualizer overlay
    this._render3DWaveform(1 / 60);
  }

  _renderBeatBar(ctx, w, h, now) {
    const barH = 36;
    const barY = h - barH - 2;
    const p = this._pattern;
    const stepW = Math.floor(w / 16);

    ctx.fillStyle = 'rgba(4,4,12,0.9)';
    ctx.fillRect(0, barY, w, barH);

    for (let i = 0; i < 16; i++) {
      const sx = i * stepW + 2;
      const isCurrent = i === this._beatStep;
      const hasKick  = p.kick[i];
      const hasSnare = p.snare[i];
      const hasHihat = p.hihat[i];
      const hasAccent= p.accent[i];

      // Step background
      ctx.fillStyle = isCurrent ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(sx, barY + 2, stepW - 4, barH - 4);

      // Instrument dots
      const dotY = barY + barH / 2;
      if (hasKick)   { ctx.fillStyle = TILE_TYPES.KICK.color;  ctx.beginPath(); ctx.arc(sx + 8, dotY - 8,  3, 0, Math.PI*2); ctx.fill(); }
      if (hasSnare)  { ctx.fillStyle = TILE_TYPES.SNARE.color; ctx.beginPath(); ctx.arc(sx + 8, dotY,     3, 0, Math.PI*2); ctx.fill(); }
      if (hasHihat)  { ctx.fillStyle = TILE_TYPES.HIHAT.color; ctx.beginPath(); ctx.arc(sx + 8, dotY + 8, 2, 0, Math.PI*2); ctx.fill(); }
      if (hasAccent) { ctx.fillStyle = TILE_TYPES.PLUS.color;  ctx.beginPath(); ctx.arc(sx + 8, dotY - 4, 4, 0, Math.PI*2); ctx.fill(); }

      // Current step highlight
      if (isCurrent) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, barY + 2, stepW - 4, barH - 4);
      }
    }
  }

  // ── Three.js 3D waveform visualizer ──────────────────────────────────────

  /**
   * Create a semi-transparent WebGL overlay canvas and build a Three.js scene
   * containing a 3D waveform ribbon that pulses with the beat.
   * The ribbon sits in the upper portion of the screen, behind the grid.
   */
  _init3DWaveform(canvas) {
    if (this._3d) return; // already initialised

    const WAVE_POINTS = 64; // number of vertices along the waveform

    const overlay = document.createElement('canvas');
    overlay.id = 'rhythm-3d-overlay';
    overlay.width  = canvas.width;
    overlay.height = canvas.height;
    overlay.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      `width:${canvas.width}px`, `height:${canvas.height}px`,
      'pointer-events:none', 'z-index:4',
    ].join(';');

    const parent = canvas.parentElement || document.body;
    parent.style.position = parent.style.position || 'relative';
    parent.appendChild(overlay);

    const renderer = new THREE.WebGLRenderer({ canvas: overlay, alpha: true, antialias: true });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const aspect = canvas.width / canvas.height;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x112233, 1.5));
    const dlight = new THREE.DirectionalLight(0xffffff, 0.8);
    dlight.position.set(0, 5, 5);
    scene.add(dlight);

    // Build the waveform as a BufferGeometry line
    const positions = new Float32Array(WAVE_POINTS * 3);
    const waveGeo   = new THREE.BufferGeometry();
    waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const waveMat  = new THREE.LineBasicMaterial({ color: 0x00aaff, linewidth: 2 });
    const waveLine = new THREE.Line(waveGeo, waveMat);
    scene.add(waveLine);

    // Mirror line (reflected)
    const positions2 = new Float32Array(WAVE_POINTS * 3);
    const waveGeo2   = new THREE.BufferGeometry();
    waveGeo2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
    const waveMat2  = new THREE.LineBasicMaterial({ color: 0x00aaff, linewidth: 1, transparent: true, opacity: 0.35 });
    const waveLine2 = new THREE.Line(waveGeo2, waveMat2);
    scene.add(waveLine2);

    // Beat flash point light
    const beatLight = new THREE.PointLight(0x00aaff, 0, 6);
    beatLight.position.set(0, 0, 2);
    scene.add(beatLight);

    this._3d = { renderer, scene, camera, waveLine, waveLine2, beatLight, WAVE_POINTS, overlay, _phase: 0, _beatPulse: 0 };
  }

  /**
   * Called on every render frame.  Updates the waveform geometry to simulate
   * a live audio waveform that pulses in time with the rhythm pattern.
   * @param {number} dt  delta-time in seconds
   */
  _render3DWaveform(dt) {
    if (!this._3d) return;
    const { renderer, scene, camera, waveLine, waveLine2, beatLight, WAVE_POINTS } = this._3d;
    const p = this._pattern || PATTERNS[0];

    // Advance phase proportional to BPM
    this._3d._phase += dt * (p.bpm / 60) * Math.PI * 2 * 0.5;

    // Beat pulse decay
    if (this._3d._beatPulse > 0) this._3d._beatPulse = Math.max(0, this._3d._beatPulse - dt * 4);
    beatLight.intensity = this._3d._beatPulse * 3;

    // Update waveform line positions
    const pos  = waveLine.geometry.attributes.position;
    const pos2 = waveLine2.geometry.attributes.position;
    const span = 8; // x-range [-4, +4]
    for (let i = 0; i < WAVE_POINTS; i++) {
      const t  = i / (WAVE_POINTS - 1); // 0..1
      const x  = (t - 0.5) * span;
      const ph = this._3d._phase + t * Math.PI * 4;
      // Composite waveform: fundamental + harmonics
      const y  = (Math.sin(ph) * 0.5
               + Math.sin(ph * 2.0 + 0.5) * 0.25
               + Math.sin(ph * 3.7 + 1.2) * 0.12)
               * (0.6 + this._3d._beatPulse * 0.8);
      pos.setXYZ(i, x, y, 0);
      pos2.setXYZ(i, x, -y * 0.5, 0.5);
    }
    pos.needsUpdate  = true;
    pos2.needsUpdate = true;

    // Tint line colour to match current pattern
    const patternColor = new THREE.Color(p.color || '#00aaff');
    waveLine.material.color.set(patternColor);
    waveLine2.material.color.set(patternColor);
    beatLight.color.set(patternColor);

    renderer.render(scene, camera);
  }

  /** Trigger a visual pulse on the waveform when the beat fires. */
  _triggerWavePulse() {
    if (this._3d) this._3d._beatPulse = 1.0;
  }

  /** Remove the Three.js overlay and dispose GPU resources. */
  _cleanup3DWaveform() {
    if (!this._3d) return;
    const { renderer, overlay } = this._3d;
    renderer.dispose();
    if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    this._3d = null;
  }
}
