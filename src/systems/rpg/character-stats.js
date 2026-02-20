'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — character-stats.js — Phase M5: RPG Basics
//  Simple stat system derived from player gameplay behaviours.
//
//  STR (Strength)     → enemy encounters, containment, freeze usage
//  INT (Intelligence) → insight collection, pattern discovery
//  WIS (Wisdom)       → mindful moves, impulse buffer usage, pauses
//  VIT (Vitality)     → HP management, hazard survival, embodiment tiles
//
//  Stats accumulate across ALL sessions via localStorage.
//  Level-up rewards are cosmetic / narrative (no power inflation).
//  Research: Bandura (1977) self-efficacy; Deci & Ryan (1985) SDT.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY  = 'gp_char_stats';
const LEVEL_BASE   = 100;   // XP needed for level 1 → 2
const LEVEL_GROWTH = 1.4;   // each level requires 40% more XP
const STAT_CAP     = 99;

// Level-up flavour lines per stat (index = level reached - 2)
const LEVEL_MSGS = [
  'Your awareness deepens.', 'A new clarity emerges.', 'The path reveals itself.',
  'Patterns begin to sing.', 'The observer strengthens.', 'Integration accelerates.',
  'Sovereignty expands.',    'The dreamer remembers.',   'You are the dreamscape.',
];

export class CharacterStats {
  constructor() {
    const d      = this._load();
    this.str     = d.str   || 1;
    this.int     = d.int   || 1;
    this.wis     = d.wis   || 1;
    this.vit     = d.vit   || 1;
    this.level   = d.level || 1;
    this.xp      = d.xp    || 0;
    this.xpToNext = this._calcXpToNext(this.level);
    this._levelUpMsg = null;  // shown in HUD for ~90 frames
    this._levelUpTimer = 0;
  }

  // ─── Stat increment calls (from main.js) ─────────────────────────
  onInsightCollect()   { this.int = Math.min(STAT_CAP, this.int + 0.15); this._gainXp(5); }
  onPatternDiscovered(){ this.int = Math.min(STAT_CAP, this.int + 0.25); this._gainXp(8); }
  onMindfulMove()      { this.wis = Math.min(STAT_CAP, this.wis + 0.05); this._gainXp(2); }
  onPauseUsed()        { this.wis = Math.min(STAT_CAP, this.wis + 0.10); this._gainXp(3); }
  onFreezeUsed()       { this.str = Math.min(STAT_CAP, this.str + 0.20); this._gainXp(6); }
  onContainmentUsed()  { this.str = Math.min(STAT_CAP, this.str + 0.15); this._gainXp(5); }
  onHazardSurvived()   { this.vit = Math.min(STAT_CAP, this.vit + 0.08); this._gainXp(3); }
  onEmbodimentTile()   { this.vit = Math.min(STAT_CAP, this.vit + 0.12); this._gainXp(4); }
  onDreamComplete()    { this._gainXp(50); this._save(); }

  resetSession() { /* stats persist — only per-session cosmetics reset here */ this._levelUpMsg = null; this._levelUpTimer = 0; }

  tick() {
    if (this._levelUpTimer > 0) {
      this._levelUpTimer--;
      if (this._levelUpTimer === 0) this._levelUpMsg = null;
    }
  }

  // ─── XP + levelling ──────────────────────────────────────────────
  _gainXp(n) {
    this.xp += n;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = this._calcXpToNext(this.level);
      this._levelUpMsg = LEVEL_MSGS[Math.max(0, this.level - 2) % LEVEL_MSGS.length];
      this._levelUpTimer = 120;
      this._save(); // persist immediately on level-up
    }
  }

  _calcXpToNext(lvl) { return Math.floor(LEVEL_BASE * Math.pow(LEVEL_GROWTH, lvl - 1)); }

  // ─── Accessors ───────────────────────────────────────────────────
  get levelUpMsg()   { return this._levelUpTimer > 0 ? this._levelUpMsg : null; }
  get xpPercent()    { return this.xp / this.xpToNext; }
  get statSummary()  {
    return `STR ${Math.floor(this.str)}  INT ${Math.floor(this.int)}  WIS ${Math.floor(this.wis)}  VIT ${Math.floor(this.vit)}`;
  }
  get statObj() {
    return { str: Math.floor(this.str), int: Math.floor(this.int),
             wis: Math.floor(this.wis), vit: Math.floor(this.vit),
             level: this.level, xp: this.xp, xpPct: this.xpPercent,
             levelUpMsg: this.levelUpMsg };
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        str: this.str, int: this.int, wis: this.wis, vit: this.vit,
        level: this.level, xp: this.xp,
      }));
    } catch (_) {}
  }
  _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; }
    catch (_) { return {}; }
  }
}

export const characterStats = new CharacterStats();
