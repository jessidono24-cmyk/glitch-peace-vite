'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — coop-mode.js — Phase M8
//
//  Local 2-player co-operative mode on the same grid.
//  Player 1: Arrow keys.  Player 2: WASD.
//  Both players share a score but have individual health bars.
//  Dream ends when EITHER player's HP reaches 0, or all peace nodes
//  are collected.
//
//  Online mode (config.online = true):
//    Connects to the WebSocket relay at config.relayUrl (default:
//    ws://localhost:8765).  Local player is always P1; remote is P2.
//    P1 sends { type:'input', data:{key,dy,dx} } on every move.
//    Receives { type:'relay', from:'p2', data:{key,dy,dx} } from server.
// ═══════════════════════════════════════════════════════════════════════

import { T, DREAMSCAPES, CELL, GAP } from '../core/constants.js';
import { CFG, UPG, insightTokens, addInsightToken } from '../core/state.js';
import { rnd } from '../core/utils.js';
import { SZ, buildDreamscape, CW, CH } from '../game/grid.js';
import { stepEnemies } from '../game/enemy.js';
import { burst } from '../game/particles.js';
import { drawGame } from '../ui/renderer.js';

// ── Network relay client ─────────────────────────────────────────────────
const DEFAULT_RELAY_URL = 'ws://localhost:8765';

class RelayClient {
  constructor(url, roomId) {
    this._ws       = null;
    this._role     = null;
    this._ready    = false;     // true when peer has joined
    this._inQueue  = [];        // incoming messages from peer
    this._url      = url;
    this._roomId   = roomId;
    this._connect();
  }

  _connect() {
    try {
      this._ws = new WebSocket(this._url);
    } catch (_e) {
      console.warn('[CoopRelay] WebSocket unavailable');
      return;
    }
    this._ws.onopen = () => {
      this._send({ type: 'join', roomId: this._roomId });
    };
    this._ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch (_e) { return; }
      switch (msg.type) {
        case 'joined':
          this._role = msg.role;
          console.log(`[CoopRelay] joined as ${this._role} in room ${msg.roomId}`);
          break;
        case 'peer_joined':
          this._ready = true;
          console.log('[CoopRelay] peer joined — starting online co-op');
          break;
        case 'peer_left':
          this._ready = false;
          console.log('[CoopRelay] peer left');
          break;
        case 'relay':
          this._inQueue.push(msg);
          break;
      }
    };
    this._ws.onerror = (e) => console.warn('[CoopRelay] error', e.message || e);
    this._ws.onclose = () => { this._ready = false; };
  }

  _send(obj) {
    try {
      if (this._ws?.readyState === WebSocket.OPEN) this._ws.send(JSON.stringify(obj));
    } catch (_e) {}
  }

  sendInput(data) { this._send({ type: 'input', data }); }

  /** Drain incoming queue, return array of messages */
  drain() {
    const q = this._inQueue.splice(0);
    return q;
  }

  get isOnline()   { return this._ready; }
  get role()       { return this._role; }

  destroy() {
    try { this._ws?.close(); } catch (_e) {}
    this._ws = null;
  }
}


export class CoopMode {
  constructor(sharedSystems) {
    this.emotionalField = sharedSystems.emotionalField;
    this.sfxManager     = sharedSystems.sfxManager;
    this.name           = 'coop';
    this.isActive       = false;

    this.game     = null;
    this.p2       = null;    // second player object
    this.lastMoveP1 = 0;
    this.lastMoveP2 = 0;
    this.backgroundStars = [];
    this.visions         = [];
    this.hallucinations  = [];
    this.glitchFrames    = 0;
    this.glitchTimer     = 500;
    this.anomalyActive   = false;
    this.anomalyData     = { row: -1, col: -1, t: 0 };
    this._result         = null;
    this._dreamStartTime = 0;
    this._relay          = null;  // RelayClient instance (online co-op)
    this._online         = false; // true when connected to relay
    this._roomId         = null;
  }

  init(config) {
    this.isActive  = true;
    this._result   = null;
    this._dreamStartTime = performance.now();
    this._showInstructions = true;
    this._instructionsTimer = 6000;
    this._synergyFlash   = 0;   // synergy bonus display timer
    this._synergyMsg     = '';
    this._p2Dead         = false;
    this._p2ReviveTimer  = 0;   // countdown until P2 permanently removed
    this._level          = 1;

    // ── Online relay setup ─────────────────────────────────────────────
    if (this._relay) { this._relay.destroy(); this._relay = null; }
    this._online = !!(config.online);
    if (this._online) {
      const url    = config.relayUrl || DEFAULT_RELAY_URL;
      const roomId = config.roomId   || Math.random().toString(36).slice(2,8).toUpperCase();
      this._relay  = new RelayClient(url, roomId);
      this._roomId = roomId;
      console.log(`[CoopMode] online — room ${roomId}  relay ${url}`);
    }

    const dsIdx = config.dreamIdx || CFG.dreamIdx || 0;
    const ds    = DREAMSCAPES[dsIdx % DREAMSCAPES.length];
    const sz    = SZ();

    this.game = buildDreamscape(ds, sz, this._level, 0, UPG.maxHp, UPG.maxHp, []);
    const g   = this.game;

    // P1 starts top-left, P2 starts bottom-right
    g.player.y = 0; g.player.x = 0;
    g.player.hp = UPG.maxHp;
    g.player.maxHp = UPG.maxHp;

    this.p2 = {
      y: sz - 1, x: sz - 1,
      hp: UPG.maxHp, maxHp: UPG.maxHp,
      lastArchetype: null,
      name: 'P2',
    };

    // Give P2 starting position clear
    g.grid[sz-1][sz-1] = T.VOID;
    g.grid[sz-1][sz-2] = T.VOID;
    g.grid[sz-2][sz-1] = T.VOID;

    this.lastMoveP1 = 0;
    this.lastMoveP2 = 0;
    this.glitchFrames = 0; this.glitchTimer = 500;
    this.anomalyActive = false;
    this.visions = []; this.hallucinations = [];

    // Background stars
    const w = CW(), h = CH();
    this.backgroundStars = [];
    for (let i = 0; i < 30; i++)
      this.backgroundStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        a: Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
      });
  }

  _movePlayer(player, dy, dx, ts, lastMoveRef) {
    const g = this.game;
    if (ts - lastMoveRef < UPG.moveDelay) return lastMoveRef;
    const ny = player.y + dy, nx = player.x + dx;
    if (ny < 0 || ny >= g.sz || nx < 0 || nx >= g.sz) return lastMoveRef;
    if (g.grid[ny][nx] === T.WALL) return lastMoveRef;
    const tile = g.grid[ny][nx];

    player.y = ny; player.x = nx;

    // Peace collect
    if (tile === T.PEACE) {
      g.grid[ny][nx] = T.VOID;
      g.peaceLeft = Math.max(0, g.peaceLeft - 1);
      g.score += 100;
      addInsightToken();
      this.sfxManager.resume(); this.sfxManager.playPeaceCollect();
    }
    // Insight
    if (tile === T.INSIGHT) {
      g.grid[ny][nx] = T.VOID;
      g.score += 150;
      this.sfxManager.resume(); this.sfxManager.playInsightCollect && this.sfxManager.playInsightCollect();
    }
    // Somatic tiles — shared healing
    if ([T.BODY_SCAN, T.BREATH_SYNC, T.ENERGY_NODE, T.GROUNDING].includes(tile)) {
      g.grid[ny][nx] = T.VOID;
      const heal = 8;
      // Heal both players (co-op synergy)
      g.player.hp = Math.min(UPG.maxHp, (g.player.hp||UPG.maxHp) + heal);
      this.p2.hp  = Math.min(UPG.maxHp, this.p2.hp + heal);
      this.sfxManager.resume(); this.sfxManager.playSomaticTile && this.sfxManager.playSomaticTile();
    }
    // Hazard damage
    const HAZARD_DMG = { [T.DESPAIR]:8, [T.TERROR]:20, [T.SELF_HARM]:14, [T.RAGE]:18,
      [T.HOPELESS]:12, [T.GLITCH]:5, [T.TRAP]:16, [T.PAIN]:6 };
    if (HAZARD_DMG[tile] !== undefined) {
      player.hp -= HAZARD_DMG[tile];
      this.sfxManager.resume(); this.sfxManager.playDamage();
      g.shakeFrames = 5;
    }
    return ts;
  }

  update(dt, keys, _matrix, ts) {
    const g = this.game;
    if (!g || this._result) return this._result;

    // Tick down instructions overlay
    if (this._showInstructions) {
      this._instructionsTimer -= dt;
      if (this._instructionsTimer <= 0) this._showInstructions = false;
    }

    this.glitchTimer -= dt;
    if (this.glitchTimer <= 0) { this.glitchFrames = 2 + rnd(4); this.glitchTimer = 500 + rnd(700); }
    if (this.anomalyActive) { this.anomalyData.t--; if (this.anomalyData.t <= 0) this.anomalyActive = false; }

    // P1 movement: Arrow keys
    const P1_DIRS = {
      ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1],
    };
    for (const [k,[dy,dx]] of Object.entries(P1_DIRS)) {
      if (keys.has(k)) {
        const prevT = this.lastMoveP1;
        this.lastMoveP1 = this._movePlayer(g.player, dy, dx, ts, this.lastMoveP1);
        // Relay P1 input to online peer
        if (this._online && this._relay && this.lastMoveP1 !== prevT) {
          this._relay.sendInput({ key: k, dy, dx });
        }
        break;
      }
    }

    // P2 movement: WASD (local) OR relayed from online peer
    if (this._online && this._relay) {
      // Process incoming peer messages as P2 movement
      for (const msg of this._relay.drain()) {
        if (msg.type === 'relay' && msg.data) {
          const { dy, dx } = msg.data;
          if (dy !== undefined && dx !== undefined) {
            this.lastMoveP2 = this._movePlayer(this.p2, dy, dx, ts, this.lastMoveP2);
          }
        }
      }
    } else {
      // Local P2 movement: WASD
      const P2_DIRS = {
        w:[-1,0], s:[1,0], a:[0,-1], d:[0,1],
        W:[-1,0], S:[1,0], A:[0,-1], D:[0,1],
      };
      for (const [k,[dy,dx]] of Object.entries(P2_DIRS)) {
        if (keys.has(k)) {
          this.lastMoveP2 = this._movePlayer(this.p2, dy, dx, ts, this.lastMoveP2);
          break;
        }
      }
    }

    // Step enemies (target nearest player)
    if (g.enemies.length > 0) {
      // Temporarily set player to nearest for AI step
      const origY = g.player.y, origX = g.player.x;
      const d1 = Math.abs(g.enemies[0].y - g.player.y) + Math.abs(g.enemies[0].x - g.player.x);
      const d2 = Math.abs(g.enemies[0].y - this.p2.y)  + Math.abs(g.enemies[0].x - this.p2.x);
      if (d2 < d1) { g.player.y = this.p2.y; g.player.x = this.p2.x; }

      const _msg = (t, c) => { g.msg = t; g.msgColor = c; g.msgTimer = 40; };
      stepEnemies(g, dt, keys, _matrix || 'B', this.hallucinations, _msg, () => {});

      // Check damage to p2
      for (const e of g.enemies) {
        if (e.y === this.p2.y && e.x === this.p2.x) {
          this.p2.hp -= 15;
          this.sfxManager.resume(); this.sfxManager.playDamage();
          g.shakeFrames = 5;
        }
      }

      g.player.y = origY; g.player.x = origX;
    }

    // Particles
    if (g.particles) {
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.life--; p.alpha = p.life / p.maxLife;
        return p.life > 0;
      });
    }

    // Check end conditions
    if (!this._p2Dead && this.p2.hp <= 0) {
      // P2 is downed — start revival countdown (P1 can revive by standing adjacent)
      this._p2Dead = true;
      this._p2ReviveTimer = 5000; // 5 seconds to revive
      g.msg = 'P2 DOWN!  P1 STAND ADJACENT TO REVIVE…'; g.msgColor = '#ff8844'; g.msgTimer = 180;
    }
    if (this._p2Dead) {
      this._p2ReviveTimer -= dt;
      // Check if P1 is adjacent to P2 for revival
      const adj = Math.abs(g.player.y - this.p2.y) + Math.abs(g.player.x - this.p2.x) <= 1;
      if (adj) {
        this.p2.hp = Math.round(UPG.maxHp * 0.5);
        this._p2Dead = false;
        burst(g, this.p2.x, this.p2.y, '#ff8844', 20, 4);
        g.msg = 'P2 REVIVED!'; g.msgColor = '#ffcc44'; g.msgTimer = 90;
        g.score += 500;
      } else if (this._p2ReviveTimer <= 0) {
        // No revival — P1 alone
        g.msg = 'P2 LOST — P1 CONTINUES ALONE'; g.msgColor = '#443322'; g.msgTimer = 120;
        this._p2Dead = false; this.p2.hp = 0; // disable P2
      }
    }
    if (g.player.hp <= 0) {
      this.sfxManager.playDeath && this.sfxManager.playDeath();
      this._result = { phase: 'dead', data: { score: g.score, level: g.level, ds: g.ds } };
      return this._result;
    }
    if (g.peaceLeft <= 0) {
      this._level++;
      window._achievementQueue = window._achievementQueue || [];
      window._achievementQueue.push('coop_partner');
      g.score += 1500 + this._level * 300;
      // Advance to next level (re-init with new dreamscape)
      if (this._level > 5) {
        this._result = { phase: 'dead', data: { score: g.score, level: g.level, ds: g.ds } };
        return this._result;
      }
      const nextDsIdx = (CFG.dreamIdx + this._level) % DREAMSCAPES.length;
      const nextDs = DREAMSCAPES[nextDsIdx];
      const sz2 = SZ();
      const prevScore = g.score;
      const prevHp    = g.player.hp;
      this.game = buildDreamscape(nextDs, sz2, this._level, 0, prevHp, UPG.maxHp, []);
      this.game.score = prevScore;
      this.game.player.y = 0; this.game.player.x = 0;
      this.p2.y = sz2 - 1; this.p2.x = sz2 - 1;
      this.game.grid[sz2-1][sz2-1] = T.VOID;
      this.game.msg = '⬆ LEVEL ' + this._level + '  COOP ADVANCE!';
      this.game.msgColor = '#ffcc44'; this.game.msgTimer = 120;
      return null;
    }

    // ── Synergy bonus: both players on adjacent tiles ──────────────────
    if (this.p2.hp > 0 && !this._p2Dead) {
      const dist = Math.abs(g.player.y - this.p2.y) + Math.abs(g.player.x - this.p2.x);
      if (dist <= 1) {
        // Players adjacent — sync heal and score boost (5 HP/sec = 0.005 per ms)
        g.player.hp = Math.min(UPG.maxHp, (g.player.hp||UPG.maxHp) + 0.005 * dt);
        this.p2.hp  = Math.min(UPG.maxHp, this.p2.hp  + 0.005 * dt);
        if (this._synergyFlash <= 0 && Math.random() < 0.01) {
          g.score += 50;
          this._synergyMsg = '✦ SYNERGY BONUS +50';
          this._synergyFlash = 80;
        }
      }
    }
    if (this._synergyFlash > 0) this._synergyFlash--;

    return null;
  }

  render(ctx, ts, renderData) {
    const g = this.game;
    if (!g) return;

    // Use the main renderer for grid visual
    drawGame(ctx, ts, g, 'B', this.backgroundStars, this.visions,
      this.hallucinations, this.anomalyActive, this.anomalyData,
      this.glitchFrames, window.devicePixelRatio || 1, []);

    const sz  = g.sz;
    const gp  = sz * CELL + (sz-1) * GAP;
    const w   = gp + 48, h = gp + 148;
    const sx  = (w - gp) / 2, sy = 110;

    // Draw P2
    {
      const px = sx + this.p2.x*(CELL+GAP) + CELL/2;
      const py_ = sy + this.p2.y*(CELL+GAP) + CELL/2;
      ctx.shadowColor = '#ff8844'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff8844';
      ctx.beginPath(); ctx.arc(px, py_, 7 + 2*Math.sin(ts*0.007), 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Co-op HUD overlay
    ctx.textAlign = 'center';
    // P1 HP bar (left)
    const p1hp = Math.max(0, g.player.hp || 0);
    const p1pct = p1hp / UPG.maxHp;
    ctx.fillStyle = '#223322'; ctx.fillRect(8, 4, 100, 10);
    ctx.fillStyle = p1pct > 0.5 ? '#00ff88' : p1pct > 0.25 ? '#ffaa00' : '#ff2244';
    ctx.fillRect(8, 4, 100 * p1pct, 10);
    ctx.fillStyle = '#aaffcc'; ctx.font = '8px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('P1  ' + Math.ceil(p1hp), 8, 22);

    // P2 HP bar (right)
    const p2hp  = Math.max(0, this.p2.hp);
    const p2pct = p2hp / UPG.maxHp;
    ctx.fillStyle = '#332220'; ctx.fillRect(w - 108, 4, 100, 10);
    ctx.fillStyle = p2pct > 0.5 ? '#ff8844' : p2pct > 0.25 ? '#ffaa00' : '#ff2244';
    ctx.fillRect(w - 108, 4, 100 * p2pct, 10);
    ctx.fillStyle = '#ffccaa'; ctx.textAlign = 'right';
    ctx.fillText('P2  ' + Math.ceil(p2hp), w - 8, 22);

    // Mode label
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334455'; ctx.font = '8px Courier New';
    ctx.fillText('🤝  CO-OP  ·  P1=ARROWS  P2=WASD  ·  shared score  ·  LVL ' + this._level, w/2, h - 14);
    ctx.textAlign = 'left';

    // ── Synergy flash banner ──────────────────────────────────────────
    if (this._synergyFlash > 0) {
      const sa = Math.min(1, this._synergyFlash / 20);
      ctx.globalAlpha = sa;
      ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 10;
      ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(this._synergyMsg, w/2, h/2 - 40);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textAlign = 'left';
    }

    // ── P2 revival countdown bar ──────────────────────────────────────
    if (this._p2Dead && this._p2ReviveTimer > 0) {
      const revFrac = this._p2ReviveTimer / 5000;
      ctx.fillStyle = 'rgba(255,100,50,0.3)'; ctx.fillRect(w - 160, 30, 150, 10);
      ctx.fillStyle = '#ff6622'; ctx.fillRect(w - 160, 30, 150 * revFrac, 10);
      ctx.fillStyle = '#ffaa88'; ctx.font = '8px Courier New'; ctx.textAlign = 'right';
      ctx.fillText('REVIVE P2  ' + Math.ceil(this._p2ReviveTimer / 1000) + 's', w - 8, 42);
      ctx.textAlign = 'left';
    }

    // ── Co-op instructions overlay (shown for first 6 seconds) ──────────
    if (this._showInstructions) {
      const fade = Math.min(1, this._instructionsTimer / 800); // fade out last 800ms
      const fadeIn = Math.min(1, (6000 - this._instructionsTimer) < 400 ? (6000 - this._instructionsTimer) / 400 : 1);
      const a = Math.min(fade, fadeIn);
      ctx.globalAlpha = a * 0.92;
      ctx.fillStyle = '#010a08';
      ctx.fillRect(w/2 - 175, h/2 - 100, 350, 200);
      ctx.strokeStyle = '#ffcc44'; ctx.lineWidth = 1.5;
      ctx.strokeRect(w/2 - 175, h/2 - 100, 350, 200);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 12;
      ctx.font = 'bold 16px Courier New';
      ctx.fillText('🤝  CO-OP MODE', w/2, h/2 - 74);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaffcc'; ctx.font = '10px Courier New';
      ctx.fillText('TWO PLAYERS · ONE DREAMSCAPE · SHARED SCORE', w/2, h/2 - 52);
      ctx.fillStyle = '#556677'; ctx.font = '9px Courier New';
      ctx.fillText('─────────────────────────────────', w/2, h/2 - 36);
      ctx.fillStyle = '#00ff88'; ctx.font = 'bold 11px Courier New';
      ctx.fillText('PLAYER 1', w/2 - 80, h/2 - 16);
      ctx.fillStyle = '#ff8844'; ctx.fillText('PLAYER 2', w/2 + 80, h/2 - 16);
      ctx.fillStyle = '#aaccaa'; ctx.font = '10px Courier New';
      ctx.fillText('Arrow Keys', w/2 - 80, h/2 + 2);
      ctx.fillStyle = '#cc9977'; ctx.fillText('W A S D', w/2 + 80, h/2 + 2);
      ctx.fillStyle = '#667788'; ctx.font = '8px Courier New';
      ctx.fillText('Collect ◈ PEACE tiles to advance the dreamscape', w/2, h/2 + 24);
      ctx.fillText('Somatic tiles heal BOTH players · Hazards damage individually', w/2, h/2 + 38);
      ctx.fillText("If either player's HP reaches 0, the journey ends", w/2, h/2 + 52);
      ctx.fillStyle = '#334455';
      ctx.fillText('ESC to return to title', w/2, h/2 + 72);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  handleInput(key, action) {
    return false;
  }

  cleanup() {
    this.isActive = false;
    this.game = null;
    this.p2   = null;
    if (this._relay) { this._relay.destroy(); this._relay = null; }
  }

  getState() {
    return {
      name: 'coop',
      score: this.game ? this.game.score : 0,
    };
  }

  restoreState(state) {}
}
