'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — boss-system.js — Phase M3.5: Multi-Phase Boss System
//  Three boss types, each with 3 distinct phases.
//
//  Design philosophy: bosses are mirrors, not monsters. Each represents a
//  psychological pattern that the player integrates by persisting through it.
//  They are not meant to be "defeated" in a violent sense — they DISSOLVE
//  when met with persistence, clarity, and conscious presence.
//
//  Research: Csikszentmihalyi (1990) Flow — optimal challenge calibration;
//            Schell (2008) Art of Game Design — escalating challenge arcs;
//            Jung (1953) Archetypes — shadow integration as core mechanic.
// ═══════════════════════════════════════════════════════════════════════
import { T } from '../core/constants.js';

// Damage values as named constants for ease of tuning
const AOE_BURST_DAMAGE = 18;

export const BOSS_TYPES = {
  fear_guardian: {
    name:  'FEAR GUARDIAN',
    quote: 'You have carried me long enough.',
    desc:  'The crystallised mountain of your avoidance',
    phases: [
      { label: 'AWAKENING',   speedMs: 340, hp: 400, color: '#ff00aa', glow: '#ff00aa', specialInterval: 2200, special: 'hazard_ring'  },
      { label: 'CHALLENGE',   speedMs: 230, hp: 350, color: '#ff4488', glow: '#ff2266', specialInterval: 1600, special: 'spawn_echo'   },
      { label: 'DISSOLUTION', speedMs: 150, hp: 260, color: '#ff88bb', glow: '#ff66aa', specialInterval: 1200, special: 'aoe_burst'    },
    ],
    reward: { score: 2000, archetype: 'dragon', msg: 'FEAR GUARDIAN DISSOLVES — dragon presence unlocked' },
  },
  void_keeper: {
    name:  'VOID KEEPER',
    quote: 'The space between is not empty.',
    desc:  'The guardian of the space between thoughts',
    phases: [
      { label: 'STILLNESS', speedMs: 380, hp: 360, color: '#8800ff', glow: '#8800ff', specialInterval: 2400, special: 'wall_seal'    },
      { label: 'PRESSURE',  speedMs: 260, hp: 300, color: '#aa44ff', glow: '#9922ff', specialInterval: 1800, special: 'hazard_ring'  },
      { label: 'RELEASE',   speedMs: 160, hp: 240, color: '#cc88ff', glow: '#bb66ff', specialInterval: 1300, special: 'aoe_burst'    },
    ],
    reward: { score: 2200, archetype: 'orb', msg: 'VOID KEEPER RELEASES — orb phase mastered' },
  },
  integration_master: {
    name:  'INTEGRATION MASTER',
    quote: 'All of it was always you.',
    desc:  'The synthesis of all your dreamscapes',
    phases: [
      { label: 'CONVERGENCE', speedMs: 340, hp: 500, color: '#ffdd00', glow: '#ffcc00', specialInterval: 2000, special: 'spawn_echo'  },
      { label: 'SYNTHESIS',   speedMs: 220, hp: 420, color: '#ffee44', glow: '#ffdd22', specialInterval: 1500, special: 'aoe_burst'   },
      { label: 'SOVEREIGNTY', speedMs: 155, hp: 360, color: '#ffffff', glow: '#ffff88', specialInterval: 1100, special: 'hazard_ring' },
    ],
    reward: { score: 3000, archetype: 'all', msg: 'INTEGRATION COMPLETE — SA · MCA · MNF · SC — sovereignty is yours' },
  },
};

export class BossSystem {
  constructor() {
    this._active          = false;
    this._bossTypeId      = null;
    this._phase           = 0;
    this._specialTimer    = 0;
    this._phaseMsg        = null;
    this._phaseMsgTimer   = 0;
    this._defeatHandled   = false;
  }

  // ─── Called once per frame when game.boss exists ──────────────────
  update(game, dt, sfxManager, showMsg, burstFn) {
    const b = game.boss;
    if (!b) return;

    if (b.hp <= 0) {
      if (!this._defeatHandled) {
        this._defeatHandled = true;
        this._handleBossDeath(game, sfxManager, showMsg, burstFn);
      }
      return;
    }
    this._defeatHandled = false;

    const bType  = BOSS_TYPES[b.type] || BOSS_TYPES.fear_guardian;
    const phases = bType.phases;
    const maxHp  = b.maxHp;

    // ── Phase transitions based on HP thirds ────────────────────────
    const hpPct   = b.hp / maxHp;
    const newPhase = hpPct > 0.66 ? 0 : hpPct > 0.33 ? 1 : 2;
    if (newPhase !== this._phase) {
      this._phase        = newPhase;
      const ph           = phases[newPhase];
      this._phaseMsgTimer = 150;
      this._phaseMsg     = '◈ ' + bType.name + '  ·  ' + ph.label;
      this._specialTimer  = ph.specialInterval;
      if (sfxManager) sfxManager.playBossPhase();
      game.shakeFrames   = 20;
      game.flashColor    = ph.color;
      game.flashAlpha    = 0.4;
      showMsg(ph.label + '!', ph.color, 100);
    }

    // ── Sync phase data onto boss object (used by renderer/enemy.js) ─
    const curPh      = phases[this._phase];
    b.phaseIdx       = this._phase;
    b.phaseLabel     = curPh.label;
    b.color          = curPh.color;
    b.glow           = curPh.glow;
    b.speedMs        = curPh.speedMs;

    // ── Special attack ───────────────────────────────────────────────
    this._specialTimer -= dt;
    if (this._specialTimer <= 0) {
      this._specialTimer = curPh.specialInterval;
      this._triggerSpecial(game, curPh.special, curPh.color, showMsg, burstFn);
    }

    // ── Phase banner ────────────────────────────────────────────────
    if (this._phaseMsgTimer > 0) {
      this._phaseMsgTimer--;
      window._bossPhaseBanner = {
        text:       this._phaseMsg,
        color:      curPh.color,
        alpha:      Math.min(1, this._phaseMsgTimer / 20),
        quote:      bType.quote,
      };
    } else {
      window._bossPhaseBanner = null;
    }
  }

  // ─── Special attacks ──────────────────────────────────────────────
  _triggerSpecial(game, special, color, showMsg, burstFn) {
    const sz = game.sz, px = game.player.x, py = game.player.y;

    if (special === 'hazard_ring') {
      let spawned = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const dist = Math.abs(dy) + Math.abs(dx);
          if (dist >= 3 && dist <= 4) {
            const ny = py + dy, nx = px + dx;
            if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && game.grid[ny][nx] === 0) {
              game.grid[ny][nx] = T.DESPAIR;
              spawned++;
            }
          }
        }
      }
      if (spawned > 0) showMsg('HAZARD RING!', color, 55);

    } else if (special === 'spawn_echo') {
      const ey = 1 + Math.floor(Math.random() * (sz - 2));
      const ex = 1 + Math.floor(Math.random() * (sz - 2));
      if (game.grid[ey][ex] === 0) {
        game.enemies.push({
          y: ey, x: ex, timer: 0, stunTimer: 0,
          behavior: 'rush', patrolAngle: 0, orbitAngle: 0,
          orbitR: 2, prevY: ey, prevX: ex, momentum: [0, 0], type: 'echo',
        });
        showMsg('ECHO SPAWNED!', color, 50);
      }

    } else if (special === 'aoe_burst') {
      if (game.boss && Math.abs(py - game.boss.y) + Math.abs(px - game.boss.x) <= 4) {
        game.hp = Math.max(1, game.hp - AOE_BURST_DAMAGE);
        game.shakeFrames = 10;
        game.flashColor  = color;
        game.flashAlpha  = 0.38;
        showMsg('AoE BURST! -18', color, 55);
      }

    } else if (special === 'wall_seal') {
      let n = 0, itr = 0;
      while (n < 3 && itr < 500) {
        itr++;
        const dy = Math.round((Math.random() - 0.5) * 8);
        const dx = Math.round((Math.random() - 0.5) * 8);
        const ny = py + dy, nx = px + dx;
        if (ny > 0 && ny < sz - 1 && nx > 0 && nx < sz - 1 && game.grid[ny][nx] === 0) {
          game.grid[ny][nx] = T.WALL; n++;
        }
      }
      if (n > 0) showMsg('WALLS SEAL!', color, 50);
    }
  }

  // ─── Boss defeated ────────────────────────────────────────────────
  _handleBossDeath(game, sfxManager, showMsg, burstFn) {
    if (!game.boss) return;
    const bType  = BOSS_TYPES[game.boss.type] || BOSS_TYPES.fear_guardian;
    const reward = bType.reward;
    game.score  += reward.score;
    if (sfxManager) sfxManager.playLevelComplete();
    showMsg(reward.msg, '#ffdd00', 220);
    window._bossPhaseBanner = null;
    // Dramatic death burst
    if (burstFn) {
      burstFn(game, game.player.x, game.player.y, '#ffdd00', 40, 7);
      burstFn(game, game.boss.x, game.boss.y, bType.phases[2].color, 30, 5);
    }
    // Scatter PEACE tiles as reward
    const sz = game.sz;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const ny = game.player.y + dy, nx = game.player.x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && game.grid[ny][nx] === 0 && Math.random() < 0.5) {
          game.grid[ny][nx] = T.PEACE; // scatter PEACE tiles as reward
        }
      }
    }
    this._active = false;
    this._phase  = 0;
  }

  // ─── Spawn a boss into a game ────────────────────────────────────
  spawnBossForGame(game, bossTypeId) {
    const id     = bossTypeId || 'fear_guardian';
    const bType  = BOSS_TYPES[id] || BOSS_TYPES.fear_guardian;
    const ph     = bType.phases[0];
    const sz     = game.sz;
    const totalHp = bType.phases.reduce((s, p) => s + p.hp, 0);
    this._active         = true;
    this._bossTypeId     = id;
    this._phase          = 0;
    this._defeatHandled  = false;
    this._specialTimer   = ph.specialInterval;
    this._phaseMsgTimer  = 0;
    game.boss = {
      y: Math.min(sz - 2, Math.floor(sz * 0.6)),
      x: Math.min(sz - 2, Math.floor(sz * 0.6)),
      hp: totalHp, maxHp: totalHp,
      timer: 0, stunTimer: 0,
      phase: 'chase', phaseTimer: 800,
      type: id,
      phaseIdx: 0, phaseLabel: ph.label,
      color: ph.color, glow: ph.glow, speedMs: ph.speedMs,
    };
    return game.boss;
  }

  reset() {
    this._active         = false;
    this._bossTypeId     = null;
    this._phase          = 0;
    this._specialTimer   = 0;
    this._phaseMsg       = null;
    this._phaseMsgTimer  = 0;
    this._defeatHandled  = false;
    window._bossPhaseBanner = null;
  }

  get isActive()     { return this._active; }
  get currentPhase() { return this._phase; }
}

export const bossSystem = new BossSystem();
