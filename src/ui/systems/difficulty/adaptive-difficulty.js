'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — adaptive-difficulty.js
//
//  Research basis:
//  • Csikszentmihalyi (1990) Flow: optimal challenge ≈ 4% above current skill
//  • Vygotsky's Zone of Proximal Development: scaffold just past current ability
//  • Piaget's cognitive development stages: sensorimotor → formal operations
//  • ESRB/PEGI age guidance: content suitability per age bracket
//  • Yerkes-Dodson law: performance peaks at moderate arousal (not too easy, not too hard)
//
//  5 Tiers:
//   TINY     (5-7 )  — emoji labels, no hazards, huge HP, slow enemies, big words
//   GENTLE   (8-11)  — reduced hazards, forgiving HP, friendly pace, common words
//   EXPLORER (12-15) — standard hazards, moderate challenge, richer vocabulary
//   STANDARD (16+)   — current "normal" profile, full hazard set
//   ADVANCED (any)   — hard profile, reduced HP/energy, faster enemies
//
//  Adaptive mode watches:
//   • deathRate  (deaths per dreamscape)
//   • comboRate  (average combo length)
//   • idleRatio  (time spent idle / total)
//  and nudges toward the Flow channel every 3 dreamscapes.
// ═══════════════════════════════════════════════════════════════════════

// ─── Tier definitions ─────────────────────────────────────────────────
export const DIFFICULTY_TIERS = {
  tiny: {
    label:        'TINY EXPLORER 🌱',
    ageHint:      '5 +',
    desc:         'Safe and playful — mostly peace nodes, very slow enemies, huge health',
    color:        '#aaffcc',
    // Grid: no hazards spawned in first 5 dreamscapes
    hazardMul:    0.0,      // hazard count multiplier
    dmgMul:       0.25,     // all damage × this
    eSpeedBase:   2000,     // ms between enemy moves (higher = slower)
    eSpeedMin:    1200,
    maxHpBonus:   100,      // added to base maxHp
    peaceCountMul:2.0,      // more peace nodes
    vocabTier:    'simple', // which word bank to use
    showEmoji:    true,     // show emoji alongside tile symbols
    uiScale:      1.25,     // font scale hint for renderer
  },
  gentle: {
    label:        'GENTLE JOURNEY 🌿',
    ageHint:      '8 +',
    desc:         'Reduced hazards, friendly pace, encouraging words',
    color:        '#88ddaa',
    hazardMul:    0.45,
    dmgMul:       0.45,
    eSpeedBase:   1400,
    eSpeedMin:    700,
    maxHpBonus:   50,
    peaceCountMul:1.5,
    vocabTier:    'common',
    showEmoji:    false,
    uiScale:      1.1,
  },
  explorer: {
    label:        'EXPLORER ⚡',
    ageHint:      '12 +',
    desc:         'Standard hazards, moderate challenge, growing vocabulary',
    color:        '#44bbff',
    hazardMul:    0.75,
    dmgMul:       0.7,
    eSpeedBase:   950,
    eSpeedMin:    400,
    maxHpBonus:   25,
    peaceCountMul:1.2,
    vocabTier:    'rich',
    showEmoji:    false,
    uiScale:      1.0,
  },
  standard: {
    label:        'STANDARD 🔷',
    ageHint:      '16 +',
    desc:         'Full experience — all hazards, normal pacing',
    color:        '#00ff88',
    hazardMul:    1.0,
    dmgMul:       1.0,
    eSpeedBase:   720,
    eSpeedMin:    210,
    maxHpBonus:   0,
    peaceCountMul:1.0,
    vocabTier:    'advanced',
    showEmoji:    false,
    uiScale:      1.0,
  },
  advanced: {
    label:        'ADVANCED 🔥',
    ageHint:      'any',
    desc:         'Intensified — faster enemies, amplified damage, rare peace nodes',
    color:        '#ff4422',
    hazardMul:    1.35,
    dmgMul:       1.45,
    eSpeedBase:   520,
    eSpeedMin:    150,
    maxHpBonus:   -20,
    peaceCountMul:0.8,
    vocabTier:    'advanced',
    showEmoji:    false,
    uiScale:      1.0,
  },
};

const TIER_ORDER = ['tiny', 'gentle', 'explorer', 'standard', 'advanced'];

// ─── Adaptive thresholds ──────────────────────────────────────────────
// If death rate is high AND combos are low → nudge down one tier
// If death rate is zero AND combos are high → nudge up one tier
const DEATH_RATE_HIGH  = 0.8;  // deaths per dreamscape → too hard
const DEATH_RATE_LOW   = 0.1;  // deaths per dreamscape → too easy
const COMBO_RATE_HIGH  = 5;    // avg combo → player is thriving
const COMBO_RATE_LOW   = 1.5;  // avg combo → player is struggling
const ADAPTIVE_WINDOW  = 3;    // dreamscapes between adaptive checks

const LS_KEY = 'gp_difficulty_profile';

class AdaptiveDifficulty {
  constructor() {
    this._tierKey      = 'standard';
    this._autoAdapt    = true;
    this._ageGroup     = 'adult'; // 'child5', 'child8', 'teen12', 'teen16', 'adult'
    this._window       = [];      // ring buffer of dreamscape stats
    this._nudges       = 0;       // total adaptive nudges applied
    this._load();
  }

  // ── Public API ────────────────────────────────────────────────────────

  get tier()        { return DIFFICULTY_TIERS[this._tierKey]; }
  get tierKey()     { return this._tierKey; }
  get autoAdapt()   { return this._autoAdapt; }
  get ageGroup()    { return this._ageGroup; }

  /** Call once at profile creation / options change */
  setTier(key) {
    if (!DIFFICULTY_TIERS[key]) return;
    this._tierKey = key;
    this._save();
  }

  setAutoAdapt(on) { this._autoAdapt = on; this._save(); }

  /**
   * Map age (numeric or group string) to a recommended starting tier.
   * Research: Piaget stage 2 (7-12) → concrete operations, can handle rules;
   * Piaget stage 3 (12+) → formal operations, abstract thinking.
   */
  setAgeGroup(age) {
    const n = parseInt(age, 10);
    if (!isNaN(n)) {
      if (n < 8)       this._ageGroup = 'child5';
      else if (n < 12) this._ageGroup = 'child8';
      else if (n < 16) this._ageGroup = 'teen12';
      else if (n < 20) this._ageGroup = 'teen16';
      else             this._ageGroup = 'adult';
    } else {
      this._ageGroup = age;
    }
    // Set default tier for age group if not manually overridden
    const defaults = {
      child5: 'tiny', child8: 'gentle', teen12: 'explorer',
      teen16: 'standard', adult: 'standard',
    };
    if (!this._manualTier) this._tierKey = defaults[this._ageGroup] || 'standard';
    this._save();
  }

  /**
   * Record stats after each dreamscape for adaptive logic.
   * @param {{ deaths:number, combos:number, dreamscapesPlayed:number }} stats
   */
  recordDreamscape(stats) {
    this._window.push({ ...stats, ts: Date.now() });
    if (this._window.length > 10) this._window.shift();
    if (this._autoAdapt && this._window.length >= ADAPTIVE_WINDOW) {
      this._adaptTier();
    }
    this._save();
  }

  /**
   * Returns DIFF_CFG-compatible object for the current tier.
   * Merges with the global easy/normal/hard CFG difficulty selected in options.
   */
  getDiffCfg(baseDifficulty = 'normal') {
    const t = this.tier;
    const baseDmg = baseDifficulty === 'hard' ? 1.45 : baseDifficulty === 'easy' ? 0.55 : 1.0;
    return {
      eSpeedBase: t.eSpeedBase,
      eSpeedMin:  t.eSpeedMin,
      dmgMul:     t.dmgMul * baseDmg,
      hazMul:     t.hazardMul,
      peaceCountMul: t.peaceCountMul,
      maxHpBonus:    t.maxHpBonus,
      vocabTier:     t.vocabTier,
      showEmoji:     t.showEmoji,
      uiScale:       t.uiScale,
    };
  }

  /** Filter hazard counts for tiny/gentle tiers */
  filterHazards(hazardCounts) {
    const mul = this.tier.hazardMul;
    if (mul >= 1.0) return hazardCounts;
    return hazardCounts.map(n => Math.max(0, Math.round(n * mul)));
  }

  // ── Internal ─────────────────────────────────────────────────────────

  _adaptTier() {
    const recent = this._window.slice(-ADAPTIVE_WINDOW);
    const avgDeaths = recent.reduce((s, r) => s + (r.deaths || 0), 0) / recent.length;
    const avgCombos = recent.reduce((s, r) => s + (r.combos || 0), 0) / recent.length;
    const idx = TIER_ORDER.indexOf(this._tierKey);

    let nudge = 0;
    if (avgDeaths >= DEATH_RATE_HIGH && avgCombos <= COMBO_RATE_LOW) nudge = -1; // too hard
    else if (avgDeaths <= DEATH_RATE_LOW && avgCombos >= COMBO_RATE_HIGH) nudge = +1; // too easy

    const newIdx = Math.max(0, Math.min(TIER_ORDER.length - 1, idx + nudge));
    if (newIdx !== idx) {
      this._tierKey = TIER_ORDER[newIdx];
      this._nudges++;
    }
  }

  _save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        tier: this._tierKey, auto: this._autoAdapt,
        age: this._ageGroup, nudges: this._nudges,
        window: this._window.slice(-5),
      }));
    } catch {}
  }

  _load() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (d) {
        this._tierKey   = DIFFICULTY_TIERS[d.tier] ? d.tier : 'standard';
        this._autoAdapt = d.auto !== false;
        this._ageGroup  = d.age || 'adult';
        this._nudges    = d.nudges || 0;
        this._window    = d.window || [];
      }
    } catch {}
  }
}

export const adaptiveDifficulty = new AdaptiveDifficulty();
