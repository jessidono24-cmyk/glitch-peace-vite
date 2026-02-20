'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — chakra-system.js — Phase 10: Cosmology Integration
//  7 chakras as energetic states tied to the emotional field.
//  Completely sterilized framing: bioenergetic simulation, not dogma.
// ═══════════════════════════════════════════════════════════════════════

// ─── Chakra definitions ───────────────────────────────────────────────
export const CHAKRAS = [
  {
    id:       'root',
    name:     'Root',
    sanskrit: 'Muladhara',
    color:    '#cc2200',
    glow:     '#ff4400',
    position: 0,    // 0 = lowest
    element:  'Earth',
    emotions: ['fear', 'shame'],        // these block it
    virtues:  ['trust', 'safety'],      // these open it
    tile:     'VOID',
    desc:     'Grounding. Safety. Physical existence.',
    powerup:  'Reduces contact damage from enemies by 25%.',
  },
  {
    id:       'sacral',
    name:     'Sacral',
    sanskrit: 'Svadhisthana',
    color:    '#ff6600',
    glow:     '#ff8800',
    position: 1,
    element:  'Water',
    emotions: ['despair', 'hopeless'],
    virtues:  ['joy', 'flow'],
    tile:     'PEACE',
    desc:     'Creativity. Flow. Pleasure.',
    powerup:  'Peace tiles give +5 bonus HP.',
  },
  {
    id:       'solar',
    name:     'Solar Plexus',
    sanskrit: 'Manipura',
    color:    '#ffdd00',
    glow:     '#ffff44',
    position: 2,
    element:  'Fire',
    emotions: ['anger', 'rage'],
    virtues:  ['confidence', 'will'],
    tile:     'INSIGHT',
    desc:     'Personal power. Will. Confidence.',
    powerup:  'Insight tokens worth 1.5× score.',
  },
  {
    id:       'heart',
    name:     'Heart',
    sanskrit: 'Anahata',
    color:    '#00cc44',
    glow:     '#00ff88',
    position: 3,
    element:  'Air',
    emotions: ['grief', 'despair'],
    virtues:  ['love', 'compassion'],
    tile:     'MEMORY',
    desc:     'Love. Compassion. Connection.',
    powerup:  'Shield activates 1 combo sooner.',
  },
  {
    id:       'throat',
    name:     'Throat',
    sanskrit: 'Vishuddha',
    color:    '#0088ff',
    glow:     '#00aaff',
    position: 4,
    element:  'Sound',
    emotions: ['shame'],
    virtues:  ['truth', 'expression'],
    tile:     'ARCHETYPE',
    desc:     'Truth. Expression. Communication.',
    powerup:  'Archetype powers last 50% longer.',
  },
  {
    id:       'third_eye',
    name:     'Third Eye',
    sanskrit: 'Ajna',
    color:    '#4400ff',
    glow:     '#8844ff',
    position: 5,
    element:  'Light',
    emotions: ['confusion'],
    virtues:  ['clarity', 'intuition'],
    tile:     'INSIGHT',
    desc:     'Intuition. Clarity. Inner vision.',
    powerup:  'Hidden tiles visible at half range.',
  },
  {
    id:       'crown',
    name:     'Crown',
    sanskrit: 'Sahasrara',
    color:    '#cc00ff',
    glow:     '#ff00ff',
    position: 6,
    element:  'Consciousness',
    emotions: [],
    virtues:  ['wisdom', 'unity'],
    tile:     'TELEPORT',
    desc:     'Pure awareness. Unity. Liberation.',
    powerup:  'Score multiplier +0.2 permanently while open.',
  },
];

const STORAGE_KEY = 'gp_chakras';

// ─── Openness smoothing (lerp toward target each update) ─────────────
const OPENNESS_SMOOTH_RETAIN = 0.97; // retain this fraction of current openness
const OPENNESS_SMOOTH_TOWARD = 0.03; // move this fraction toward target
const OPENNESS_AWAKEN_THRESHOLD = 0.85; // chakra is "awakened" above this level
const VIRTUE_TO_EMOTION = {
  trust:      'trust', safety:    'hope',      joy:       'joy',
  flow:       'joy',   confidence:'trust',      will:      'trust',
  love:       'tenderness', compassion:'tenderness', truth: 'trust',
  expression: 'joy',   clarity:   'joy',        intuition:'joy',
  wisdom:     'hope',  unity:     'hope',
};

export class ChakraSystem {
  constructor() {
    this._openness  = new Array(7).fill(0.5);  // 0=blocked, 1=fully open
    this._awakened  = this._load();
    this._activePowerups = new Set();
    this._flashChakra = null;
    this._flashTimer  = 0;
  }

  // ─── Update chakra openness based on emotional field ─────────────
  update(emotionalField) {
    if (!emotionalField) return;
    const emotions = emotionalField.emotions || {};

    CHAKRAS.forEach((ch, i) => {
      // Blocking emotions close the chakra
      let blockVal = 0;
      for (const em of ch.emotions) blockVal = Math.max(blockVal, emotions[em] || 0);
      // Virtue emotions open it (map virtues to positive emotions)
      let openVal = 0;
      for (const v of ch.virtues) {
        const em = VIRTUE_TO_EMOTION[v];
        if (em) openVal = Math.max(openVal, emotions[em] || 0);
      }
      const target = Math.max(0.1, Math.min(1, 0.5 + openVal * 0.5 - blockVal * 0.4));
      this._openness[i] = this._openness[i] * OPENNESS_SMOOTH_RETAIN + target * OPENNESS_SMOOTH_TOWARD;

      // Awaken if consistently open
      if (this._openness[i] > OPENNESS_AWAKEN_THRESHOLD && !this._awakened.has(ch.id)) {
        this._awakened.add(ch.id);
        this._activePowerups.add(ch.id);
        this._flashChakra = ch;
        this._flashTimer  = 200;
        this._save();
      }
    });
  }

  // ─── Tick ─────────────────────────────────────────────────────────
  tick() {
    if (this._flashTimer > 0) {
      this._flashTimer--;
      if (this._flashTimer <= 0) this._flashChakra = null;
    }
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get openness() { return [...this._openness]; }

  getChakra(id) { return CHAKRAS.find(c => c.id === id); }

  isAwakened(id) { return this._awakened.has(id); }

  get flashChakra() { return this._flashTimer > 0 ? this._flashChakra : null; }
  get flashAlpha()  { return Math.min(1, this._flashTimer / 30); }

  // Dominant chakra (most open)
  get dominant() {
    let best = 0, idx = 3; // default heart
    this._openness.forEach((v, i) => { if (v > best) { best = v; idx = i; } });
    return CHAKRAS[idx];
  }

  // Color of dominant chakra for HUD tinting
  get dominantColor() { return this.dominant.color; }

  // Active powerups from awakened chakras
  get powerupsActive() { return [...this._activePowerups].map(id => this.getChakra(id)).filter(Boolean); }

  // Overall kundalini level 0-1 (average openness)
  get kundalini() { return this._openness.reduce((a, b) => a + b, 0) / 7; }

  get awakenedCount() { return this._awakened.size; }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._awakened])); } catch (_) {}
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_) { return new Set(); }
  }
}

export const chakraSystem = new ChakraSystem();
