'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — emergence-indicators.js — Phase 8: Awareness Features
//  Tracks subtle signs of consciousness awakening through gameplay.
//  Non-prescriptive: observations without interpretation or judgment.
// ═══════════════════════════════════════════════════════════════════════

// ─── Emergence indicators (awakening signs) ───────────────────────────
const INDICATOR_DEFS = {
  pause_frequency: {
    label:    'Willful Pause',
    desc:     'You pause during intense moments rather than reacting automatically.',
    threshold: 3,   // 3+ pauses per session = indicator present
  },
  reflection_depth: {
    label:    'Deepening Inquiry',
    desc:     'You are receiving deeper reflection prompts with each visit.',
    threshold: 3,   // 3+ dreamscapes at mid/deep depth
  },
  pattern_noticing: {
    label:    'Pattern Awareness',
    desc:     'You are noticing mathematical patterns in the game structures.',
    threshold: 3,   // 3+ patterns found in session
  },
  matrix_mastery: {
    label:    'Dual Awareness',
    desc:     'You fluidly switch between matrix states (A/B) with clear intention.',
    threshold: 5,   // 5+ matrix switches per session
  },
  insight_accumulation: {
    label:    'Insight Magnetism',
    desc:     'Insight tiles appear and you are drawn to them.',
    threshold: 3,   // 3+ insights collected per session
  },
  peace_chain: {
    label:    'Flow State',
    desc:     'You are collecting peace tiles in rapid succession.',
    threshold: 4,   // combo of 4+ peace tiles
  },
  dream_completion: {
    label:    'Dreamscape Integration',
    desc:     'You have completed multiple dreamscapes in a single session.',
    threshold: 3,   // 3+ dreamscapes completed
  },
  vocabulary_growth: {
    label:    'Word Wisdom',
    desc:     'You are absorbing vocabulary across many contexts.',
    threshold: 8,   // 8+ words learned in session
  },
};

// ─── Emergence level thresholds (emergenceLevel 0-1) ─────────────────
const LEVEL_THRESHOLDS = {
  STIRRING:    0.15,
  NOTICING:    0.35,
  WITNESSING:  0.55,
  INTEGRATING: 0.75,
  AWAKE:       0.95,
};

const STORAGE_KEY = 'gp_emergence';

export class EmergenceIndicators {
  constructor() {
    this._counts     = Object.fromEntries(Object.keys(INDICATOR_DEFS).map(k => [k, 0]));
    this._allTime    = this._load();
    this._active     = new Set();    // indicators currently met
    this._newFlash   = null;         // { label, desc } — flash on first activation
    this._flashTimer = 0;
  }

  // ─── Increment an indicator ───────────────────────────────────────
  record(key, amount = 1) {
    if (!(key in this._counts)) return;
    this._counts[key] += amount;
    this._checkActivation(key);
  }

  // ─── Check if indicator threshold crossed ────────────────────────
  _checkActivation(key) {
    const def = INDICATOR_DEFS[key];
    if (!def) return;
    if (this._counts[key] >= def.threshold && !this._active.has(key)) {
      this._active.add(key);
      // First time EVER?
      if (!this._allTime.has(key)) {
        this._allTime.add(key);
        this._save();
        this._newFlash  = def;
        this._flashTimer = 240; // ~8 seconds
      }
    }
  }

  // ─── Tick ─────────────────────────────────────────────────────────
  tick() {
    if (this._flashTimer > 0) {
      this._flashTimer--;
      if (this._flashTimer <= 0) this._newFlash = null;
    }
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get activeIndicators() {
    return [...this._active].map(k => ({ key: k, ...INDICATOR_DEFS[k] }));
  }

  get newFlash()    { return this._flashTimer > 0 ? this._newFlash : null; }
  get flashAlpha()  { return Math.min(1, this._flashTimer / 30); }

  get sessionScore() { return this._active.size; }           // 0-8
  get allTimeCount() { return this._allTime.size; }          // 0-8

  // Returns 0-1 emergence progress
  get emergenceLevel() { return this._allTime.size / Object.keys(INDICATOR_DEFS).length; }

  get levelLabel() {
    const e = this.emergenceLevel;
    if (e < LEVEL_THRESHOLDS.STIRRING)    return 'Dreaming';
    if (e < LEVEL_THRESHOLDS.NOTICING)    return 'Stirring';
    if (e < LEVEL_THRESHOLDS.WITNESSING)  return 'Noticing';
    if (e < LEVEL_THRESHOLDS.INTEGRATING) return 'Witnessing';
    if (e < LEVEL_THRESHOLDS.AWAKE)       return 'Integrating';
    return 'Awake';
  }

  resetSession() {
    this._counts  = Object.fromEntries(Object.keys(INDICATOR_DEFS).map(k => [k, 0]));
    this._active  = new Set();
    this._newFlash = null;
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._allTime])); } catch (_) {}
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_) { return new Set(); }
  }
}

export const emergenceIndicators = new EmergenceIndicators();
