'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — meditation-mode.js — Phase M7
//
//  A full-screen breathing and awareness experience. No enemies, no
//  hazards — only somatic tiles (BODY_SCAN, BREATH_SYNC, ENERGY_NODE,
//  GROUNDING) and ambient dreamscape visuals.
//
//  Mechanics:
//    - Slow, contemplative movement through the grid
//    - Somatic tiles trigger breathing prompts and awareness phrases
//    - Animated breath circle guides inhale/exhale rhythm
//    - Session timer tracks meditation duration
//    - Gentle ambient particle effects
//    - ESC to exit back to title
//
//  Design philosophy:
//    Meditation mode is a safe space — no failure state, no death.
//    The player can simply be present with the dreamscape.
// ═══════════════════════════════════════════════════════════════════════

import { T, DREAMSCAPES, CELL, GAP } from '../core/constants.js';
import { UPG } from '../core/state.js';
import { rnd, pick } from '../core/utils.js';
import { SZ, buildDreamscape, CW, CH } from '../game/grid.js';
import { burst } from '../game/particles.js';

const SOMATIC_PHRASES = [
  'notice the ground beneath you…', 'feel your breath moving…', 'you are present…',
  'the body knows…', 'soften around the edges…', 'arrive in this moment…',
  'what do you notice?', 'breathe in awareness…', 'you are safe here…',
  'let the thought pass like clouds…', 'feel your heartbeat…', 'grounded. present. alive.',
];

const TILE_PHRASES = {
  [T.BODY_SCAN]:   ['scan from feet to crown…', 'what sensations are present?', 'the body speaks…'],
  [T.BREATH_SYNC]: ['follow the breath…', 'inhale four, hold four, exhale four…', 'one breath at a time…'],
  [T.ENERGY_NODE]: ['feel the aliveness…', 'energy moves through you…', 'light in the center…'],
  [T.GROUNDING]:   ['feet on earth…', 'roots going deep…', 'solid and present…'],
};

// Breath circle phases: [phase, duration_ms, color, label]
const BREATH_PHASES = [
  { label: 'INHALE',  dur: 4000, maxR: 52, minR: 20, color: '#00aaff' },
  { label: 'HOLD',    dur: 2000, maxR: 52, minR: 52, color: '#00ffaa' },
  { label: 'EXHALE',  dur: 6000, maxR: 52, minR: 20, color: '#aaaaff' },
  { label: 'REST',    dur: 2000, maxR: 20, minR: 20, color: '#6688aa' },
];

const MEDITATION_DREAMSCAPES = ['forest_sanctuary', 'mycelium_depths', 'deep_ocean', 'orb_escape'];

export class MeditationMode {
  constructor(sharedSystems) {
    this.emotionalField  = sharedSystems.emotionalField;
    this.sfxManager      = sharedSystems.sfxManager;
    this.name            = 'meditation';
    this.isActive        = false;

    this.game            = null;
    this.sessionMs       = 0;
    this.lastMove        = 0;
    this.backgroundStars = [];

    // Active phrase/prompt
    this.currentPhrase   = 'breathe…';
    this.phraseTimer     = 0;
    this.phraseAlpha     = 0;

    // Breath circle
    this.breathPhaseIdx  = 0;
    this.breathPhaseMs   = 0;
    this.breathRadius    = 20;

    // Ambient glow tiles pulse
    this._glowPhase      = 0;
  }

  init(config) {
    this.isActive      = true;
    this.sessionMs     = 0;
    this.lastMove      = 0;
    this.phraseTimer   = 0;
    this.phraseAlpha   = 0;
    this.breathPhaseIdx = 0;
    this.breathPhaseMs  = 0;
    this.breathRadius   = 20;
    this._glowPhase     = 0;
    this.currentPhrase  = pick(SOMATIC_PHRASES);

    const dsId  = config.dreamscapeId || pick(MEDITATION_DREAMSCAPES);
    const dsIdx = DREAMSCAPES.findIndex(d => d.id === dsId);
    const ds    = DREAMSCAPES[Math.max(0, dsIdx)];
    const sz    = SZ();

    this.game = buildDreamscape(ds, sz, 1, 0, UPG.maxHp, UPG.maxHp, []);
    const g = this.game;

    // Strip all hazards and enemies
    for (let y = 0; y < sz; y++)
      for (let x = 0; x < sz; x++)
        if ([1,2,3,8,9,10,14,16].includes(g.grid[y][x])) g.grid[y][x] = 0;
    g.enemies = [];

    // Seed extra somatic tiles
    const somaticTiles = [T.BODY_SCAN, T.BREATH_SYNC, T.ENERGY_NODE, T.GROUNDING];
    let n = 0, itr = 0;
    while (n < 12 && itr < 9999) {
      itr++;
      const sy = rnd(sz), sx = rnd(sz);
      if (g.grid[sy][sx] === 0) { g.grid[sy][sx] = somaticTiles[n % 4]; n++; }
    }

    // Also add peace nodes so player has something to "complete"
    let p = 0; itr = 0;
    while (p < 5 && itr < 9999) {
      itr++;
      const sy = rnd(sz), sx = rnd(sz);
      if (g.grid[sy][sx] === 0) { g.grid[sy][sx] = T.PEACE; p++; }
    }
    g.peaceLeft = p;

    // Background stars
    const w = CW(), h = CH();
    this.backgroundStars = [];
    for (let i = 0; i < 60; i++)
      this.backgroundStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.3 + Math.random() * 1.5,
        a: 0.05 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
  }

  update(dt, keys, _matrix, ts) {
    const g = this.game;
    if (!g) return null;

    this.sessionMs  += dt;
    this._glowPhase  = (this._glowPhase + dt * 0.001) % (Math.PI * 2);

    // Breath circle update
    const bp = BREATH_PHASES[this.breathPhaseIdx];
    this.breathPhaseMs += dt;
    const t01 = Math.min(this.breathPhaseMs / bp.dur, 1);
    if (bp.label === 'INHALE')
      this.breathRadius = bp.minR + (bp.maxR - bp.minR) * t01;
    else if (bp.label === 'EXHALE')
      this.breathRadius = bp.maxR - (bp.maxR - bp.minR) * t01;
    else
      this.breathRadius = bp.maxR;

    if (this.breathPhaseMs >= bp.dur) {
      this.breathPhaseMs = 0;
      this.breathPhaseIdx = (this.breathPhaseIdx + 1) % BREATH_PHASES.length;
    }

    // Phrase timer
    this.phraseTimer -= dt;
    if (this.phraseTimer <= 0) {
      this.currentPhrase = pick(SOMATIC_PHRASES);
      this.phraseTimer   = 5000 + Math.random() * 4000;
      this.phraseAlpha   = 0;
    }
    this.phraseAlpha = Math.min(1, this.phraseAlpha + dt * 0.001);

    // Player movement — very slow, contemplative
    const MOVE_DELAY = UPG.moveDelay * 2.0;
    const DIRS = {
      ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1],
      w:[-1,0], s:[1,0], a:[0,-1], d:[0,1],
      W:[-1,0], S:[1,0], A:[0,-1], D:[0,1],
    };

    if (ts - this.lastMove > MOVE_DELAY) {
      for (const [k,[dy,dx]] of Object.entries(DIRS)) {
        if (keys.has(k)) {
          const ny = g.player.y + dy, nx = g.player.x + dx;
          if (ny < 0 || ny >= g.sz || nx < 0 || nx >= g.sz) break;
          if (g.grid[ny][nx] === T.WALL) break;
          g.player.y = ny; g.player.x = nx;
          this.lastMove = ts;
          this.sfxManager.resume();

          const tile = g.grid[ny][nx];
          if (TILE_PHRASES[tile]) {
            this.currentPhrase = pick(TILE_PHRASES[tile]);
            this.phraseTimer   = 4000;
            this.phraseAlpha   = 0;
            this.sfxManager.playSomaticTile && this.sfxManager.playSomaticTile();
            g.grid[ny][nx] = 0; // consume tile (gently)
            if (this.emotionalField) this.emotionalField.addEmotion('hope', 0.04);
          }
          if (tile === T.PEACE) {
            g.grid[ny][nx] = 0;
            g.peaceLeft = Math.max(0, g.peaceLeft - 1);
            g.score += 100;
            this.sfxManager.playPeaceCollect();
            burst(g, nx, ny, '#00ff88', 8, 3);
            if (this.emotionalField) this.emotionalField.addEmotion('peace', 0.06);
          }
          if (tile === T.INSIGHT) {
            g.grid[ny][nx] = 0;
            g.score += 200;
            this.sfxManager.playInsightCollect && this.sfxManager.playInsightCollect();
            if (this.emotionalField) this.emotionalField.addEmotion('clarity', 0.05);
          }
          break;
        }
      }
    }

    // Tick particles
    if (g.particles) {
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.03;
        p.life--; p.alpha = p.life / p.maxLife;
        return p.life > 0;
      });
    }

    // Expose meditation time for achievement system
    window._meditationTime = this.sessionMs;

    return null; // no death in meditation mode
  }

  render(ctx, ts, renderData) {
    const g = this.game;
    if (!g) return;
    const sz = g.sz;
    const gp = sz * CELL + (sz - 1) * GAP;
    const w = gp + 48, h = gp + 148;
    const gridX = (w - gp) / 2, gridY = 110;

    // Soft background
    ctx.fillStyle = g.ds.bgColor || '#010a06'; ctx.fillRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.8);
    grad.addColorStop(0, (g.ds.bgAccent || '#003316') + '44');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    // Background stars
    for (const s of this.backgroundStars) {
      const a = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0005 + s.phase));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw grid
    const SOMATIC_COLORS = {
      [T.BODY_SCAN]:   { bg:'#020a06', glow:'#00aa44' },
      [T.BREATH_SYNC]: { bg:'#020812', glow:'#6688ff' },
      [T.ENERGY_NODE]: { bg:'#0a0820', glow:'#cc44ff' },
      [T.GROUNDING]:   { bg:'#060402', glow:'#886644' },
      [T.PEACE]:       { bg:'#002810', glow:'#00ffcc' },
      [T.INSIGHT]:     { bg:'#001a18', glow:'#00ffee' },
    };

    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const tile = g.grid[y][x];
        const px = gridX + x*(CELL+GAP), py = gridY + y*(CELL+GAP);

        if (tile === 0) continue; // skip void

        const col = SOMATIC_COLORS[tile];
        if (col) {
          const pulse = 0.5 + 0.5 * Math.sin(ts * 0.003 + x * 1.3 + y * 1.1);
          ctx.shadowColor = col.glow; ctx.shadowBlur = 10 + 8*pulse;
          ctx.fillStyle = col.bg;
          ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 6); ctx.fill();
          ctx.strokeStyle = col.glow; ctx.lineWidth = 1;
          ctx.globalAlpha = 0.4 + 0.4*pulse;
          ctx.beginPath(); ctx.roundRect(px+0.5, py+0.5, CELL-1, CELL-1, 6); ctx.stroke();
          ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        } else if (tile === T.WALL) {
          ctx.fillStyle = 'rgba(10,8,20,0.7)';
          ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 3); ctx.fill();
        }
      }
    }

    // Particles
    if (g.particles) {
      for (const p of g.particles) {
        ctx.globalAlpha = p.alpha || 0;
        ctx.fillStyle = p.color || '#00ff88';
        ctx.beginPath(); ctx.arc(gridX + p.x, gridY + p.y, p.r||2, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Player — soft orb
    {
      const px = gridX + g.player.x*(CELL+GAP) + CELL/2;
      const py_ = gridY + g.player.y*(CELL+GAP) + CELL/2;
      const pulseR = 8 + 3*Math.sin(ts*0.005);
      ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#00ff88';
      ctx.beginPath(); ctx.arc(px, py_, pulseR, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,255,136,0.08)';
      ctx.beginPath(); ctx.arc(px, py_, 24, 0, Math.PI*2); ctx.fill();
    }

    // ── HUD ────────────────────────────────────────────────────────────
    ctx.textAlign = 'center';
    // Top bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, w, 100);
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
    ctx.font = 'bold 13px Courier New';
    ctx.fillText('🌸  MEDITATION MODE', w/2, 22);
    ctx.shadowBlur = 0;

    // Session timer
    const mins  = Math.floor(this.sessionMs / 60000);
    const secs  = Math.floor((this.sessionMs % 60000) / 1000);
    ctx.fillStyle = '#334455'; ctx.font = '10px Courier New';
    ctx.fillText('SESSION: ' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0'), w/2, 40);

    // Dreamscape name
    ctx.fillStyle = '#2a4a2a'; ctx.font = '9px Courier New';
    ctx.fillText(g.ds.name + '  ·  ' + g.ds.subtitle, w/2, 56);

    // Breath circle
    const bp = BREATH_PHASES[this.breathPhaseIdx];
    const cx = w - 70, cy = 55;
    ctx.shadowColor = bp.color; ctx.shadowBlur = 12;
    ctx.strokeStyle = bp.color; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(cx, cy, this.breathRadius, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = bp.color;
    ctx.beginPath(); ctx.arc(cx, cy, this.breathRadius, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.fillStyle = bp.color; ctx.font = '8px Courier New';
    ctx.fillText(bp.label, cx, cy + 4);

    // Awareness phrase
    ctx.globalAlpha = this.phraseAlpha * 0.75;
    ctx.fillStyle = '#00ff88'; ctx.font = 'italic 11px Courier New';
    ctx.fillText(this.currentPhrase, w/2, h/2 + 80);
    ctx.globalAlpha = 1;

    // Footer
    ctx.fillStyle = '#222a22'; ctx.font = '8px Courier New';
    ctx.fillText('↑↓←→ move  ·  somatic tiles activate breathing tools  ·  ESC to exit', w/2, h - 14);
    ctx.textAlign = 'left';
  }

  handleInput(key, action) {
    return false;
  }

  cleanup() {
    this.isActive = false;
    this.game     = null;
  }

  getState() {
    return { name: 'meditation', sessionMs: this.sessionMs };
  }

  restoreState(state) {}
}
