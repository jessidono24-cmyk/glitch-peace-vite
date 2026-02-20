'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — alchemy-system.js — Alchemical Transmutation Mechanic
//
//  Alchemy in GLITCH·PEACE models inner transformation: the same material
//  reality (tiles), viewed with a different frame (element), yields a
//  different experience (effect). This is Jungian nigredo→albedo→rubedo
//  expressed as gameplay.
//
//  Core mechanic:
//    1. Player collects ELEMENT SEEDS (Fire/Water/Earth/Air/Ether) by
//       stepping on element tiles (mapped from existing special tiles).
//    2. Combining 3 seeds of the same element performs a TRANSMUTATION:
//       nearby hazard tiles convert to PEACE or INSIGHT.
//    3. Combining 1 seed of each classical element (Fire+Water+Earth+Air)
//       initiates a PHILOSOPHER'S STONE moment: full HP restore + score burst.
//    4. Ether (5th element / quintessence) is earned by mindful sequences
//       (preview-assisted moves) and amplifies all reactions.
//
//  Design philosophy (Jung 1953; Paracelsus; Holmyard 1957):
//    The four classical elements are not outside us — they are modes of
//    our inner life: Fire = will/passion, Water = emotion/flow,
//    Earth = body/stability, Air = thought/communication.
//    Alchemy's goal was never gold — it was the perfection of the soul.
//    We honour this by making transmutation non-violent and healing-oriented.
//
//  References:
//    Jung, C.G. (1953). Psychology and Alchemy. Princeton UP.
//    Holmyard, E.J. (1957). Alchemy. Penguin.
//    Paracelsus (1536). Opus Paramirum (element theory).
//    Eliade, M. (1978). The Forge and the Crucible. Chicago UP.
// ═══════════════════════════════════════════════════════════════════════

import { T } from '../core/constants.js';
import { UPG } from '../core/state.js';

// ─── Element definitions ───────────────────────────────────────────────
export const ELEMENTS = {
  fire:  { name: 'FIRE',  symbol: '🔥', color: '#ff6600', glow: '#ff4400', desc: 'will · passion · transformation' },
  water: { name: 'WATER', symbol: '💧', color: '#00aaff', glow: '#0066ff', desc: 'emotion · flow · receptivity' },
  earth: { name: 'EARTH', symbol: '🌍', color: '#886644', glow: '#664422', desc: 'body · stability · endurance' },
  air:   { name: 'AIR',   symbol: '🌬️', color: '#aaddff', glow: '#88ccff', desc: 'thought · clarity · communication' },
  ether: { name: 'ETHER', symbol: '✦',  color: '#cc88ff', glow: '#aa44ff', desc: 'quintessence · presence · unity' },
};

// ─── Tile → element mapping (which existing tile produces which seed) ──
export const TILE_ELEMENT_MAP = {
  [T.ENERGY_NODE]:  'fire',    // active, energetic → fire
  [T.BREATH_SYNC]:  'water',   // flowing, rhythmic → water
  [T.GROUNDING]:    'earth',   // stable, rooted → earth
  [T.BODY_SCAN]:    'air',     // observing, scanning → air
  [T.INSIGHT]:      'ether',   // pure insight → ether/quintessence
};

// ─── Transmutation results ─────────────────────────────────────────────
const TRANSMUTATIONS = {
  fire:  { radius: 2, converts: [T.RAGE, T.TERROR, T.DESPAIR],  to: T.PEACE,   msg: 'FIRE TRANSMUTES — passion becomes peace',    color: '#ff6600' },
  water: { radius: 3, converts: [T.HOPELESS, T.DESPAIR, T.PAIN], to: T.PEACE,  msg: 'WATER TRANSMUTES — emotion becomes clarity',  color: '#00aaff' },
  earth: { radius: 2, converts: [T.TRAP, T.GLITCH, T.PAIN],     to: T.GROUNDING, msg: 'EARTH TRANSMUTES — fear becomes foundation', color: '#886644' },
  air:   { radius: 3, converts: [T.HIDDEN, T.TERROR, T.HOPELESS], to: T.INSIGHT, msg: 'AIR TRANSMUTES — shadow becomes insight',    color: '#aaddff' },
  ether: { radius: 4, converts: [T.SELF_HARM, T.RAGE, T.TERROR, T.DESPAIR, T.PAIN], to: T.PEACE, msg: 'ETHER TRANSMUTES — all is transformed', color: '#cc88ff' },
};

const STORAGE_KEY = 'gp_alchemy';
const SEEDS_PER_TRANSMUTE = 3;
const PHILOSOPHER_ELEMENTS = ['fire', 'water', 'earth', 'air'];

export class AlchemySystem {
  constructor() {
    const saved = this._load();
    // Seeds collected this session
    this._seeds = { fire: 0, water: 0, earth: 0, air: 0, ether: 0 };
    // Permanent transmutation count (cross-session)
    this._transmutations     = saved.transmutations || 0;
    this._philosopherStones  = saved.philosopherStones || 0;
    // Flash/banner for HUD
    this._flash      = null;
    this._flashTimer = 0;
    // Ether charge from mindful moves
    this._etherCharge = 0;
    // Phase of the Great Work
    this._phase = 'nigredo'; // nigredo → albedo → rubedo → aurora
    // Track which classical elements have been transmuted this session
    // (for the proper Philosopher's Stone: one of each fire/water/earth/air)
    this._classicElementsUsed = new Set();
  }

  // ─── Step on a tile that yields an element seed ──────────────────────
  onElementTile(tileType, count = 1) {
    const element = TILE_ELEMENT_MAP[tileType];
    if (!element) return null;
    this._seeds[element] = (this._seeds[element] || 0) + count;
    this._updatePhase();
    return { element, seeds: this._seeds[element], elementDef: ELEMENTS[element] };
  }

  // ─── Mindful move accumulates ether charge ────────────────────────────
  onMindfulMove() {
    this._etherCharge = Math.min(3, this._etherCharge + 0.25);
    if (this._etherCharge >= 3 && this._seeds.ether < 3) {
      this._seeds.ether++;
      this._etherCharge = 0;
    }
  }

  // ─── Attempt transmutation of the given element ───────────────────────
  tryTransmute(element, game, burstFn, showMsg) {
    if (!game || !ELEMENTS[element]) return false;
    if (this._seeds[element] < SEEDS_PER_TRANSMUTE) return false;

    const spec = TRANSMUTATIONS[element];
    const px = game.player.x, py = game.player.y;
    const sz = game.sz;
    let changed = 0;

    for (let dy = -spec.radius; dy <= spec.radius; dy++) {
      for (let dx = -spec.radius; dx <= spec.radius; dx++) {
        const ny = py + dy, nx = px + dx;
        if (ny < 0 || ny >= sz || nx < 0 || nx >= sz) continue;
        if (spec.converts.includes(game.grid[ny][nx])) {
          game.grid[ny][nx] = spec.to;
          changed++;
          if (burstFn && changed <= 8) burstFn(game, nx, ny, spec.color, 5, 1.5); // per-tile sparkle
        }
      }
    }

    this._seeds[element] -= SEEDS_PER_TRANSMUTE;
    this._transmutations++;
    // Record which classical element was used (for Philosopher's Stone tracking)
    if (PHILOSOPHER_ELEMENTS.includes(element)) this._classicElementsUsed.add(element);
    this._save();

    if (changed > 0) {
      showMsg(spec.msg, spec.color, 100);
      if (burstFn) burstFn(game, px, py, spec.color, 24, 6);
      game.score = (game.score || 0) + 800 + changed * 50;
      this._flash = { text: ELEMENTS[element].symbol + '  ' + spec.msg, color: spec.color, name: ELEMENTS[element].name };
      this._flashTimer = 180;
      window._alchemyFlash = { ...this._flash, alpha: 0, playSound: true };
    } else {
      showMsg('TRANSMUTATION READY — no matching hazards nearby', spec.color, 60);
    }

    // Check for Philosopher's Stone: one of each classic element used in this session
    if (this._checkPhilosopherStone(game, showMsg)) return true;

    this._updatePhase();
    return true;
  }

  // ─── Check if player has completed Great Work cycle ───────────────────
  _checkPhilosopherStone(game, showMsg) {
    if (!game) return false;
    // Primary trigger: all 4 classical elements (fire/water/earth/air) used in
    // the same session — the Jungian "coniunctio" of all opposing principles.
    // Fallback trigger: every 8th transmutation for single-element play styles.
    const allFourUsed = PHILOSOPHER_ELEMENTS.every(el => this._classicElementsUsed.has(el));
    const fallbackHit = this._transmutations >= 8 && this._transmutations % 8 === 0;
    if (allFourUsed || fallbackHit) {
      // Reset element-used history so the cycle can repeat
      this._classicElementsUsed.clear();
      game.hp = UPG.maxHp;
      game.score = (game.score || 0) + 5000;
      this._philosopherStones++;
      this._save();
      showMsg('◈ PHILOSOPHER\'S STONE — the Great Work complete · full restore', '#ffdd00', 220);
      this._flash = { text: '◈ PHILOSOPHER\'S STONE — PRIMA MATERIA', color: '#ffdd00', name: 'GREAT WORK' };
      this._flashTimer = 300;
      window._alchemyFlash = { ...this._flash, alpha: 0, playSound: true, stone: true };
      return true;
    }
    return false;
  }

  // ─── Great Work phase: nigredo → albedo → rubedo → aurora ─────────────
  _updatePhase() {
    const total = Object.values(this._seeds).reduce((s, v) => s + v, 0);
    if (total < 4) this._phase = 'nigredo';
    else if (total < 9) this._phase = 'albedo';
    else if (total < 16) this._phase = 'rubedo';
    else this._phase = 'aurora';
  }

  // ─── Tick ─────────────────────────────────────────────────────────────
  tick() {
    if (this._flashTimer > 0) {
      this._flashTimer--;
      if (window._alchemyFlash) {
        if (this._flashTimer > 150) window._alchemyFlash.alpha = (180 - this._flashTimer) / 30;
        else if (this._flashTimer <= 30) window._alchemyFlash.alpha = this._flashTimer / 30;
        else window._alchemyFlash.alpha = 1;
      }
      if (this._flashTimer === 0) { this._flash = null; window._alchemyFlash = null; }
    }
  }

  // ─── Reset session (keep permanent counts) ────────────────────────────
  resetSession() {
    this._seeds     = { fire: 0, water: 0, earth: 0, air: 0, ether: 0 };
    this._etherCharge = 0;
    this._phase     = 'nigredo';
    this._classicElementsUsed = new Set();
  }

  // ─── Accessors ────────────────────────────────────────────────────────
  get seeds()           { return { ...this._seeds }; }
  get phase()           { return this._phase; }
  get transmutations()  { return this._transmutations; }
  get philosopherStones(){ return this._philosopherStones; }

  // Seeds display object for HUD
  get seedsDisplay() {
    return Object.entries(this._seeds)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${ELEMENTS[k].symbol}×${v}`)
      .join('  ');
  }

  // Classic elements used this session (for dashboard)
  get classicElementsUsed() { return this._classicElementsUsed.size; }

  // ─── Persistence ──────────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        transmutations:    this._transmutations,
        philosopherStones: this._philosopherStones,
      }));
    } catch (_) {}
  }
  _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; }
    catch (_) { return {}; }
  }
}

export const alchemySystem = new AlchemySystem();
