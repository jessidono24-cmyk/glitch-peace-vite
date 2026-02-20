'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — constellation-mode.js — Phase M6
//
//  Star-navigation puzzle mode. The grid is replaced by a dark star-field.
//  The player navigates between INSIGHT (star) nodes and ARCHETYPE (nexus)
//  nodes. When stepping on star nodes in sequence, constellation lines
//  appear. Collect all star nodes to reveal the full constellation and
//  complete the dreamscape.
//
//  Design:
//    - Grid rendered as dark sky with star-glow on special tiles
//    - Star connection lines drawn between visited nodes
//    - HUD shows constellation name + stars collected
//    - No enemies in default constellation mode
//    - Win condition: all INSIGHT/ARCHETYPE nodes collected
// ═══════════════════════════════════════════════════════════════════════

import { T, DREAMSCAPES, CELL, GAP, CONSTELLATION_NAMES } from '../core/constants.js';
import { UPG, insightTokens, addInsightToken } from '../core/state.js';
import { rnd, pick } from '../core/utils.js';
import { SZ, buildDreamscape, CW, CH } from '../game/grid.js';
import { burst } from '../game/particles.js';
import { getStarField } from '../rendering/three-layer.js';

const STAR_DREAMSCAPE_IDS = ['orb_escape', 'integration', 'void_nexus', 'cloud_city', 'crystal_cave'];

export class ConstellationMode {
  constructor(sharedSystems) {
    this.emotionalField = sharedSystems.emotionalField;
    this.sfxManager     = sharedSystems.sfxManager;
    this.name           = 'constellation';
    this.isActive       = false;

    this.game         = null;
    this.starNodes    = [];   // {y, x} of all star nodes on grid
    this.visitedNodes = [];   // ordered list of visited {y, x}
    this.connections  = [];   // [{from, to}] pairs for drawing lines
    this.constellationName = '';
    this.lastMove     = 0;
    this.backgroundStars = [];
    this.meditationTime  = 0; // ms spent in this mode
    this._deathPending   = false;
  }

  init(config) {
    this.isActive = true;
    this._deathPending = false;
    this.meditationTime  = 0;

    // Pick a star-themed dreamscape
    const dsId  = config.dreamscapeId ||
      STAR_DREAMSCAPE_IDS[rnd(STAR_DREAMSCAPE_IDS.length)];
    const dsIdx = DREAMSCAPES.findIndex(d => d.id === dsId);
    const ds    = DREAMSCAPES[Math.max(0, dsIdx)];

    const level = config.level || 1;
    const sz    = SZ();

    // Build base dreamscape
    this.game = buildDreamscape(ds, sz, level, 0, UPG.maxHp, UPG.maxHp, []);

    // Apply skymap: clear hazards, seed star nodes
    const g = this.game;
    for (let y = 0; y < sz; y++)
      for (let x = 0; x < sz; x++)
        if ([1,2,3,8,9,10,14,16].includes(g.grid[y][x])) g.grid[y][x] = 0;

    // Seed 8-12 star nodes (INSIGHT = star, ARCHETYPE = nexus/bright star)
    const total = 8 + rnd(5);
    let placed = 0, itr = 0;
    while (placed < total && itr < 9999) {
      itr++;
      const sy = rnd(sz), sx = rnd(sz);
      if (g.grid[sy][sx] === 0) {
        g.grid[sy][sx] = placed % 4 === 0 ? T.ARCHETYPE : T.INSIGHT;
        placed++;
      }
    }

    // Remove all enemies
    g.enemies = [];

    // Build ordered list of star positions
    this.starNodes = [];
    for (let y = 0; y < sz; y++)
      for (let x = 0; x < sz; x++)
        if (g.grid[y][x] === T.INSIGHT || g.grid[y][x] === T.ARCHETYPE)
          this.starNodes.push({ y, x });

    g.peaceLeft = this.starNodes.length; // win when all collected

    this.visitedNodes  = [];
    this.connections   = [];
    this.constellationName = pick(CONSTELLATION_NAMES);
    this.lastMove = 0;

    // Background stars
    const w = CW(), h = CH();
    this.backgroundStars = [];
    for (let i = 0; i < 80; i++)
      this.backgroundStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.4 + Math.random() * 1.8,
        a: 0.1 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
  }

  update(dt, keys, _matrix, ts) {
    const g = this.game;
    if (!g) return null;

    // If completion overlay is up, wait for timer or ENTER press
    if (this._deathPending) {
      const cc = window._constellationComplete;
      if (!cc || cc.timer <= 0) {
        window._constellationComplete = null;
        return { phase: 'dead', data: { score: g.score, level: g.level, ds: g.ds } };
      }
      // Allow ENTER to skip early
      if (keys.has('Enter') || keys.has(' ')) {
        window._constellationComplete = null;
        return { phase: 'dead', data: { score: g.score, level: g.level, ds: g.ds } };
      }
      return null;
    }

    this.meditationTime += dt;

    const MOVE_DELAY = UPG.moveDelay * 1.2; // slightly slower, contemplative
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

          const prevY = g.player.y, prevX = g.player.x;
          g.player.y = ny; g.player.x = nx;
          this.lastMove = ts;
          this.sfxManager.resume();

          const tile = g.grid[ny][nx];
          if (tile === T.INSIGHT || tile === T.ARCHETYPE) {
            // Collect star node
            g.grid[ny][nx] = 0;
            g.peaceLeft    = Math.max(0, g.peaceLeft - 1);
            addInsightToken();

            const last = this.visitedNodes[this.visitedNodes.length - 1];
            if (last) this.connections.push({ from: last, to: { y: ny, x: nx } });
            this.visitedNodes.push({ y: ny, x: nx });

            this.sfxManager.playPeaceCollect();
            burst(g, nx, ny, '#00eeff', 12, 3);

            // Every 3 stars = constellation named
            if (this.visitedNodes.length % 3 === 0) {
              const idx = Math.floor(this.visitedNodes.length / 3 - 1) % CONSTELLATION_NAMES.length;
              window._constellationFlash = {
                name: CONSTELLATION_NAMES[idx],
                alpha: 0, timer: 180,
              };
              g.score += 300 + this.visitedNodes.length * 40;
            }

            // Win condition
            if (g.peaceLeft <= 0) {
              this.sfxManager.playDreamComplete && this.sfxManager.playDreamComplete();
              window._achievementQueue = window._achievementQueue || [];
              window._achievementQueue.push('constellation');
              // Calculate stars-based bonus using O(1) Set lookup
              const starSet = new Set(this.starNodes.map(s => s.y + ',' + s.x));
              const archetypeBonus = this.visitedNodes.filter(n => starSet.has(n.y + ',' + n.x)).length * 100;
              const completionScore = 2000 + archetypeBonus + this.visitedNodes.length * 150;
              g.score += completionScore;
              // Show rich completion overlay (renders on top for 4 s)
              window._constellationComplete = {
                name:         this.constellationName,
                stars:        this.visitedNodes.length,
                totalStars:   this.starNodes.length,
                timeMs:       this.meditationTime,
                score:        g.score,
                bonus:        completionScore,
                timer:        240, // frames
                alpha:        0,
              };
              this._deathPending = true;
              return null; // hold on complete screen before transition
            }
          }
          break;
        }
      }
    }

    // Tick particles
    if (g.particles) {
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.life--; p.alpha = p.life / p.maxLife;
        return p.life > 0;
      });
    }

    return null;
  }

  render(ctx, ts, renderData) {
    const g = this.game;
    if (!g) return;
    const sz = g.sz;
    const gp = sz * CELL + (sz - 1) * GAP;
    const w = gp + 48, h = gp + 148;
    const sx = (w - gp) / 2, sy = 110;

    // Deep space background
    ctx.fillStyle = '#01010a'; ctx.fillRect(0, 0, w, h);

    // 3D-C: Three.js volumetric star field (WebGL composited onto 2D canvas)
    try {
      const sf = getStarField(w, h);
      sf.update(ts);
      sf.composite(ctx, 0, 0);
    } catch (_e) {
      // Fallback: 2D canvas stars if WebGL unavailable
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
      grad.addColorStop(0, 'rgba(10,0,30,0.8)'); grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      for (const s of this.backgroundStars) {
        const a = s.a * (0.6 + 0.4 * Math.sin(ts * 0.0006 + s.phase));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Draw connection lines between visited star nodes
    ctx.strokeStyle = 'rgba(0,220,255,0.35)';
    ctx.lineWidth = 1.5;
    for (const conn of this.connections) {
      const fx = sx + conn.from.x * (CELL+GAP) + CELL/2;
      const fy = sy + conn.from.y * (CELL+GAP) + CELL/2;
      const tx = sx + conn.to.x   * (CELL+GAP) + CELL/2;
      const ty = sy + conn.to.y   * (CELL+GAP) + CELL/2;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke();
    }

    // Draw grid tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const tile = g.grid[y][x];
        const px = sx + x * (CELL+GAP), py = sy + y * (CELL+GAP);

        if (tile === T.WALL) {
          ctx.fillStyle = 'rgba(20,10,40,0.8)';
          ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 4); ctx.fill();
        } else if (tile === T.INSIGHT) {
          // Star node (INSIGHT)
          ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 18;
          ctx.fillStyle = '#00ccff';
          const r = 5 + 3*Math.sin(ts*0.005 + x + y);
          ctx.beginPath(); ctx.arc(px+CELL/2, py+CELL/2, r, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
          // Star rays
          ctx.strokeStyle = 'rgba(0,220,255,0.25)'; ctx.lineWidth = 1;
          for (let i=0;i<4;i++){
            const a=i*Math.PI/2 + ts*0.001;
            const rr = r + 6 + 3*Math.sin(ts*0.003+i);
            ctx.beginPath();
            ctx.moveTo(px+CELL/2 + Math.cos(a)*r, py+CELL/2 + Math.sin(a)*r);
            ctx.lineTo(px+CELL/2 + Math.cos(a)*rr, py+CELL/2 + Math.sin(a)*rr);
            ctx.stroke();
          }
        } else if (tile === T.ARCHETYPE) {
          // Nexus star (ARCHETYPE) — brighter
          ctx.shadowColor = '#ffee88'; ctx.shadowBlur = 22;
          ctx.fillStyle = '#ffdd44';
          const r = 7 + 4*Math.sin(ts*0.004 + x*1.3 + y*1.7);
          ctx.beginPath(); ctx.arc(px+CELL/2, py+CELL/2, r, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
          // 8-pointed star rays
          ctx.strokeStyle = 'rgba(255,220,50,0.3)'; ctx.lineWidth = 1.2;
          for (let i=0;i<8;i++){
            const a=i*Math.PI/4 + ts*0.0005;
            const rr = r + 8;
            ctx.beginPath();
            ctx.moveTo(px+CELL/2 + Math.cos(a)*r, py+CELL/2 + Math.sin(a)*r);
            ctx.lineTo(px+CELL/2 + Math.cos(a)*rr, py+CELL/2 + Math.sin(a)*rr);
            ctx.stroke();
          }
        }
      }
    }

    // Draw particles
    if (g.particles) {
      for (const p of g.particles) {
        ctx.globalAlpha = p.alpha || 0;
        ctx.fillStyle = p.color || '#00eeff';
        ctx.beginPath(); ctx.arc(sx + p.x, sy + p.y, p.r || 2, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Draw player
    {
      const px = sx + g.player.x*(CELL+GAP) + CELL/2;
      const py_ = sy + g.player.y*(CELL+GAP) + CELL/2;
      ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#aaddff';
      ctx.beginPath(); ctx.arc(px, py_, 8 + 2*Math.sin(ts*0.007), 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Player trail
      ctx.fillStyle = 'rgba(170,221,255,0.12)';
      ctx.beginPath(); ctx.arc(px, py_, 16, 0, Math.PI*2); ctx.fill();
    }

    // HUD
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, w, 100);
    ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 10;
    ctx.font = 'bold 14px Courier New';
    ctx.fillText('✦  CONSTELLATION MODE  ·  ' + this.constellationName, w/2, 24);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#667788'; ctx.font = '10px Courier New';
    ctx.fillText('navigate to star nodes  ·  connect the constellation', w/2, 42);

    const remain = g.peaceLeft || 0;
    const total  = this.starNodes.length;
    ctx.fillStyle = '#00ccff'; ctx.font = '11px Courier New';
    ctx.fillText('STARS CONNECTED: ' + (total - remain) + ' / ' + total, w/2, 62);

    // Progress bar
    const barW = 200, barX = w/2 - barW/2;
    ctx.fillStyle = 'rgba(0,150,200,0.2)'; ctx.fillRect(barX, 72, barW, 8);
    const prog = total > 0 ? (total - remain) / total : 0;
    ctx.fillStyle = '#00ccff'; ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 6;
    ctx.fillRect(barX, 72, barW * prog, 8);
    ctx.shadowBlur = 0;

    // Constellation flash
    const cf = window._constellationFlash;
    if (cf && cf.timer > 0) {
      cf.timer--;
      cf.alpha = cf.timer > 150 ? (180 - cf.timer) / 30 : cf.timer > 30 ? 1 : cf.timer / 30;
      ctx.globalAlpha = cf.alpha;
      ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 20;
      ctx.font = 'bold 16px Courier New';
      ctx.fillText(cf.name, w/2, h/2);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }

    // ── Constellation completion overlay ────────────────────────────
    const cc = window._constellationComplete;
    if (cc && cc.timer > 0) {
      cc.timer--;
      cc.alpha = cc.timer > 180 ? (240 - cc.timer) / 60 : cc.timer > 40 ? 1 : cc.timer / 40;
      ctx.globalAlpha = Math.min(1, cc.alpha);
      // Panel
      ctx.fillStyle = 'rgba(0,0,15,0.95)';
      ctx.fillRect(w/2 - 200, h/2 - 110, 400, 220);
      ctx.strokeStyle = 'rgba(0,238,255,0.6)'; ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 200, h/2 - 110, 400, 220);
      // Title
      ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 20;
      ctx.font = 'bold 20px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('✦  CONSTELLATION COMPLETE  ✦', w/2, h/2 - 78); ctx.shadowBlur = 0;
      // Name
      ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 12;
      ctx.font = 'bold 15px Courier New';
      ctx.fillText(cc.name, w/2, h/2 - 52); ctx.shadowBlur = 0;
      // Stats
      const statY = h/2 - 22;
      ctx.fillStyle = '#667788'; ctx.font = '11px Courier New';
      ctx.fillText('STARS CONNECTED:  ' + cc.stars + ' / ' + cc.totalStars, w/2, statY);
      ctx.fillText('SESSION TIME:  ' + Math.round(cc.timeMs / 1000) + 's', w/2, statY + 20);
      ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 8;
      ctx.font = 'bold 14px Courier New';
      ctx.fillText('SCORE BONUS  +' + cc.bonus, w/2, statY + 48); ctx.shadowBlur = 0;
      ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
      ctx.font = 'bold 18px Courier New';
      ctx.fillText('TOTAL  ' + String(cc.score).padStart(7,'0'), w/2, statY + 74); ctx.shadowBlur = 0;
      // Insight tokens reward line
      ctx.fillStyle = '#00eeff'; ctx.font = '10px Courier New';
      ctx.fillText('◆ ' + cc.stars + ' INSIGHT TOKENS EARNED', w/2, statY + 98);
      // Exit hint
      const blinkA = cc.timer < 80 ? 0.4 + 0.6 * Math.sin(cc.timer * 0.3) : 0.55;
      ctx.globalAlpha = cc.alpha * blinkA;
      ctx.fillStyle = '#334455'; ctx.font = '9px Courier New';
      ctx.fillText('press ENTER or wait…', w/2, h/2 + 100);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;

      // Auto-exit when timer expires
      if (cc.timer <= 0) {
        window._constellationComplete = null;
        return { phase: 'dead', data: { score: g.score, level: g.level, ds: g.ds } };
      }
    }

    // Footer
    ctx.fillStyle = '#334455'; ctx.font = '8px Courier New';
    ctx.fillText('↑↓←→ navigate  ·  ESC pause  ·  collect all stars to complete', w/2, h - 14);
    ctx.textAlign = 'left';
  }

  handleInput(key, action) {
    return false; // handled by keys set in main.js
  }

  cleanup() {
    this.isActive = false;
    this.game = null;
  }

  getState() {
    return {
      name: 'constellation',
      stars: this.visitedNodes.length,
      meditationTime: this.meditationTime,
    };
  }

  restoreState(state) {}
}
