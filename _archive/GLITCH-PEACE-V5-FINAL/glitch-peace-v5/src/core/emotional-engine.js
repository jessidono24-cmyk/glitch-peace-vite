// ═══════════════════════════════════════════════════════════════════════
//  EMOTIONAL ENGINE - Mathematical Model
// ═══════════════════════════════════════════════════════════════════════

import { clamp } from './utils.js';
import { emotionRegistry } from "./emotion-registry.js";

// Emotion definitions (valence, arousal, coherence)
 const EMOTIONS = {
  awe:       { v: 0.7,  a: 0.6, c: 0.8,  col: '#ffcc00', desc: 'expansion' },
  grief:     { v: -0.4, a: 0.3, c: 0.7,  col: '#4488cc', desc: 'release' },
  anger:     { v: -0.6, a: 0.9, c: 0.5,  col: '#ff3344', desc: 'force' },
  curiosity: { v: 0.5,  a: 0.7, c: 0.9,  col: '#88ffaa', desc: 'exploration' },
  shame:     { v: -0.7, a: 0.6, c: 0.3,  col: '#664488', desc: 'contraction' },
  tender:    { v: 0.8,  a: 0.4, c: 0.95, col: '#ffaacc', desc: 'care' },
  fear:      { v: -0.5, a: 0.8, c: 0.4,  col: '#6655aa', desc: 'vigilance' },
  joy:       { v: 0.9,  a: 0.8, c: 0.85, col: '#ffee44', desc: 'expansion' },
  despair:   { v: -0.9, a: 0.4, c: 0.2,  col: '#223355', desc: 'collapse' },
  hope:      { v: 0.6,  a: 0.5, c: 0.8,  col: '#66ddaa', desc: 'possibility' },
};

// Emotional synergy configurations// ═══════════════════════════════════════════════════════════════════════
//  EMOTIONAL ENGINE - Registry-based (unbounded emotions + active-set cap)
//  Drop-in replacement for src/core/emotional-engine.js
// ═══════════════════════════════════════════════════════════════════════

import { clamp } from "./utils.js";
import { emotionRegistry } from "./emotion-registry.js";

// Emotional synergy configurations (keep yours; edit freely)
export const SYNERGIES = {
  focused_force: {
    check: (v) => v.anger > 3 && v.coherence > 0.7,
    effect: { damage: 1.5, precision: true },
    message: "Anger + Coherence → Focused Force",
    color: "#ff6600",
  },
  chaos_burst: {
    check: (v) => v.anger > 3 && v.coherence < 0.4,
    effect: { damage: 2.0, splash: true, selfDamage: 0.2 },
    message: "Anger + Chaos → Destructive Burst",
    color: "#ff0044",
  },
  deep_insight: {
    check: (v) => v.grief > 3 && v.curiosity > 2,
    effect: { insightGain: 2, hiddenReveal: true },
    message: "Grief + Curiosity → Deep Understanding",
    color: "#6688ff",
  },
  collapse_event: {
    check: (v) => v.shame > 3 && v.awe > 2,
    effect: { stunSelf: 2000, visionExpand: true },
    message: "Shame + Awe → Identity Collapse",
    color: "#8844aa",
  },
  protective: {
    check: (v) => v.tender > 3 && v.fear > 2,
    effect: { shieldBonus: 10, allyHeal: true },
    message: "Tenderness + Fear → Protective Instinct",
    color: "#ffaacc",
  },
  resonance: {
    check: (v) => v.joy > 5 && v.hope > 3,
    effect: { scoreMultiplier: 2, energyRegen: true },
    message: "Joy + Hope → Resonance Wave",
    color: "#ffee44",
  },
  dissolution: {
    check: (v) => v.despair > 5,
    effect: { visionBlur: true, moveSlow: 1.5 },
    message: "Despair Overwhelms",
    color: "#223355",
  },
};

export class EmotionalField {
  constructor() {
    this.values = {};
    this.activeSynergy = null;
    this.synergyTimer = 0;

    this.ensureRegistryKeys();
  }

  ensureRegistryKeys() {
    for (const id of emotionRegistry.ids()) {
      if (this.values[id] == null) this.values[id] = 0;
    }
  }

  // Add emotion value
  // strictActive=true means only emotions in the active set can be recorded (extra safety)
  add(emotionId, amount, { strictActive = false } = {}) {
    this.ensureRegistryKeys();
    if (!emotionRegistry.canRecord(emotionId, { strict: strictActive })) return;
    this.values[emotionId] = clamp((this.values[emotionId] || 0) + amount, 0, 10);
  }

  // Decay all emotions over time
  decay(rate) {
    for (const em in this.values) {
      this.values[em] = Math.max(0, this.values[em] - rate);
    }
  }

  // Calculate world distortion (0–1)
  // Formula: Σ(value × arousal × (1 - coherence))
  calcDistortion({ activeOnly = true } = {}) {
    this.ensureRegistryKeys();
    let sum = 0;

    for (const [em, val] of Object.entries(this.values)) {
      if (activeOnly && !emotionRegistry.isActive(em)) continue;
      const e = emotionRegistry.get(em);
      if (!e) continue;

      sum += val * e.axes.arousal * (1 - e.axes.coherence);
    }
    return clamp(sum / 10, 0, 1);
  }

  // Calculate coherence (0–1)
  // Average coherence weighted by emotion intensity
  calcCoherence({ activeOnly = true } = {}) {
    this.ensureRegistryKeys();
    let sum = 0,
      weight = 0;

    for (const [em, val] of Object.entries(this.values)) {
      if (val <= 0) continue;
      if (activeOnly && !emotionRegistry.isActive(em)) continue;

      const e = emotionRegistry.get(em);
      if (!e) continue;

      sum += e.axes.coherence * val;
      weight += val;
    }
    return weight > 0 ? sum / weight : 0.5;
  }

  // Get average valence (-1..1)
  getValence({ activeOnly = true } = {}) {
    this.ensureRegistryKeys();
    let sum = 0,
      weight = 0;

    for (const [em, val] of Object.entries(this.values)) {
      if (val <= 0) continue;
      if (activeOnly && !emotionRegistry.isActive(em)) continue;

      const e = emotionRegistry.get(em);
      if (!e) continue;

      sum += e.axes.valence * val;
      weight += val;
    }
    return weight > 0 ? sum / weight : 0;
  }

  // Check for emotional synergies
  checkSynergy() {
    const v = this.values;
    const coherence = this.calcCoherence({ activeOnly: true });
    const checkData = { ...v, coherence };

    for (const [id, synergy] of Object.entries(SYNERGIES)) {
      if (synergy.check(checkData)) {
        return { id, ...synergy };
      }
    }
    return null;
  }

  // Update synergy state (call per frame or per tick)
  updateSynergy(dt) {
    if (this.synergyTimer > 0) {
      this.synergyTimer -= dt;
      if (this.synergyTimer <= 0) this.activeSynergy = null;
    }

    const synergy = this.checkSynergy();
    if (synergy && synergy.id !== this.activeSynergy) {
      this.activeSynergy = synergy.id;
      this.synergyTimer = 3000; // ms
      return synergy;
    }
    return null;
  }

  // Get dominant emotion id
  getDominant({ activeOnly = true } = {}) {
    let max = 0,
      dominant = null;
    for (const [em, val] of Object.entries(this.values)) {
      if (activeOnly && !emotionRegistry.isActive(em)) continue;
      if (val > max) {
        max = val;
        dominant = em;
      }
    }
    return dominant;
  }

  // Export state for saving
  export() {
    return {
      values: { ...this.values },
      activeSynergy: this.activeSynergy,
      packId: emotionRegistry.getActivePackId(),
      activeEmotionIds: emotionRegistry.getActiveIds(),
      activeLimit: emotionRegistry.getActiveLimit(),
    };
  }

  // Import saved state
  import(data) {
    this.values = { ...(data?.values || {}) };
    this.activeSynergy = data?.activeSynergy || null;

    // Restore registry configuration if present
    try {
      if (data?.packId) emotionRegistry.setActivePack(data.packId);
      if (data?.activeLimit) emotionRegistry.setActiveLimit(data.activeLimit);
      if (Array.isArray(data?.activeEmotionIds) && data.activeEmotionIds.length) {
        const valid = data.activeEmotionIds.filter((id) => emotionRegistry.has(id));
        if (valid.length) {
          // overwrite active set (note: registry keeps this capped)
          emotionRegistry._activeEmotionIds = new Set(
            valid.slice(0, emotionRegistry.getActiveLimit())
          );
        }
      }
    } catch (_) {
      // ignore (e.g., pack not available yet)
    }

    this.ensureRegistryKeys();
  }

  // Reset to neutral state
  reset() {
    this.ensureRegistryKeys();
    for (const em in this.values) this.values[em] = 0;
    this.activeSynergy = null;
    this.synergyTimer = 0;
  }
}

// Helper function to get emotion effect on gameplay
export function getEmotionalModifiers(field) {
  const dist = field.calcDistortion({ activeOnly: true });
  const coh = field.calcCoherence({ activeOnly: true });
  const valence = field.getValence({ activeOnly: true });

  return {
    // Visual
    backgroundHue: valence > 0 ? "green" : "red",
    particleIntensity: 0.5 + dist * 0.5,
    visionClarity: 1 - dist * 0.3,

    // Gameplay
    moveSpeedMod: 1 - dist * 0.2,
    accuracyMod: coh,
    insightGainMod: 1 + coh * 0.5,
    hazardDamageMod: 1 + dist * 0.3,

    // UI
    hudStability: 1 - dist * 0.4,
    textReadability: coh,
  };
}
export const SYNERGIES = {
  focused_force: {
    check: (v) => v.anger > 3 && v.coherence > 0.7,
    effect: { damage: 1.5, precision: true },
    message: 'Anger + Coherence → Focused Force',
    color: '#ff6600',
  },
  chaos_burst: {
    check: (v) => v.anger > 3 && v.coherence < 0.4,
    effect: { damage: 2.0, splash: true, selfDamage: 0.2 },
    message: 'Anger + Chaos → Destructive Burst',
    color: '#ff0044',
  },
  deep_insight: {
    check: (v) => v.grief > 3 && v.curiosity > 2,
    effect: { insightGain: 2, hiddenReveal: true },
    message: 'Grief + Curiosity → Deep Understanding',
    color: '#6688ff',
  },
  collapse_event: {
    check: (v) => v.shame > 3 && v.awe > 2,
    effect: { stunSelf: 2000, visionExpand: true },
    message: 'Shame + Awe → Identity Collapse',
    color: '#8844aa',
  },
  protective: {
    check: (v) => v.tender > 3 && v.fear > 2,
    effect: { shieldBonus: 10, allyHeal: true },
    message: 'Tenderness + Fear → Protective Instinct',
    color: '#ffaacc',
  },
  resonance: {
    check: (v) => v.joy > 5 && v.hope > 3,
    effect: { scoreMultiplier: 2, energyRegen: true },
    message: 'Joy + Hope → Resonance Wave',
    color: '#ffee44',
  },
  dissolution: {
    check: (v) => v.despair > 5,
    effect: { visionBlur: true, moveSlow: 1.5 },
    message: 'Despair Overwhelms',
    color: '#223355',
  },
};

export class EmotionalField {
  constructor() {
    this.values = {};
    this.activeSynergy = null;
    this.synergyTimer = 0;

    // Initialize keys from registry
    this.ensureRegistryKeys();
  }

  ensureRegistryKeys() {
    for (const id of emotionRegistry.ids()) {
      if (this.values[id] == null) this.values[id] = 0;
    }
    // Optional: remove old keys not in registry
    // for (const id of Object.keys(this.values)) {
    //   if (!emotionRegistry.has(id)) delete this.values[id];
    // }
  }

  add(emotionId, amount, { strictActive = false } = {}) {
    // Ensure registry keys exist even if packs changed
    this.ensureRegistryKeys();

    if (!emotionRegistry.canRecord(emotionId, { strict: strictActive })) return;
    this.values[emotionId] = clamp((this.values[emotionId] || 0) + amount, 0, 10);
  }

  decay(rate) {
    for (const em in this.values) {
      this.values[em] = Math.max(0, this.values[em] - rate);
    }
  }

  calcDistortion({ activeOnly = true } = {}) {
    this.ensureRegistryKeys();

    let sum = 0;
    for (const [em, val] of Object.entries(this.values)) {
      if (activeOnly && !emotionRegistry.isActive(em)) continue;

      const e = emotionRegistry.get(em);
      if (!e) continue;

      const a = e.axes.arousal;
      const c = e.axes.coherence;
      sum += val * a * (1 - c);
    }
    return clamp(sum / 10, 0, 1);
  }

  calcCoherence({ activeOnly = true } = {}) {
    this.ensureRegistryKeys();

    let sum = 0, weight = 0;
    for (const [em, val] of Object.entries(this.values)) {
      if (val <= 0) continue;
      if (activeOnly && !emotionRegistry.isActive(em)) continue;

      const e = emotionRegistry.get(em);
      if (!e) continue;

      sum += e.axes.coherence * val;
      weight += val;
    }
    return weight > 0 ? sum / weight : 0.5;
  }
  constructor() {
    this.values = {};
    for (const em in EMOTIONS) {
      this.values[em] = 0;
    }
    this.activeSynergy = null;
    this.synergyTimer = 0;
  }
   getValence({ activeOnly = true } = {}) {
    let sum = 0, weight = 0;
    for (const [em, val] of Object.entries(this.values)) {
      if (val <= 0) continue;
      if (activeOnly && !emotionRegistry.isActive(em)) continue;

      const e = emotionRegistry.get(em);
      if (!e) continue;

      sum += e.axes.valence * val;
      weight += val;
    }
    return weight > 0 ? sum / weight : 0;
  }

  export() {
    return {
      values: { ...this.values },
      activeSynergy: this.activeSynergy,
      packId: emotionRegistry.getActivePackId(),
      activeEmotionIds: emotionRegistry.getActiveIds(),
      activeLimit: emotionRegistry.getActiveLimit(),
    };
  }

  import(data) {
    this.values = { ...(data?.values || {}) };
    this.activeSynergy = data?.activeSynergy || null;

    // restore registry configuration if present
    try {
      if (data?.packId) emotionRegistry.setActivePack(data.packId);
      if (data?.activeLimit) emotionRegistry.setActiveLimit(data.activeLimit);
      if (Array.isArray(data?.activeEmotionIds) && data.activeEmotionIds.length) {
        // keep only valid ids
        const valid = data.activeEmotionIds.filter((id) => emotionRegistry.has(id));
        if (valid.length) {
          // overwrite active set
          emotionRegistry._activeEmotionIds = new Set(valid.slice(0, emotionRegistry.getActiveLimit()));
        }
      }
    } catch (_) {
      // ignore if pack not available yet
    }

    this.ensureRegistryKeys();
  }

  reset() {
    this.ensureRegistryKeys();
    for (const em in this.values) this.values[em] = 0;
    this.activeSynergy = null;
    this.synergyTimer = 0;
  }
}

// Update getEmotionalModifiers to use registry-backed methods
export function getEmotionalModifiers(field) {
  const dist = field.calcDistortion({ activeOnly: true });
  const coh = field.calcCoherence({ activeOnly: true });
  const valence = field.getValence({ activeOnly: true });

  return {
    backgroundHue: valence > 0 ? "green" : "red",
    particleIntensity: 0.5 + dist * 0.5,
    visionClarity: 1 - dist * 0.3,
    moveSpeedMod: 1 - dist * 0.2,
    accuracyMod: coh,
    insightGainMod: 1 + coh * 0.5,
    hazardDamageMod: 1 + dist * 0.3,
    hudStability: 1 - dist * 0.4,
    textReadability: coh,
  };
}
  // Add emotion value
  add(emotion, amount) {
    if (!EMOTIONS[emotion]) return;
    this.values[emotion] = clamp((this.values[emotion] || 0) + amount, 0, 10);
  }
  
  // Decay all emotions over time
  decay(rate) {
    for (const em in this.values) {
      this.values[em] = Math.max(0, this.values[em] - rate);
    }
  }
  
  // Calculate world distortion (0-1)
  // Formula: Σ(arousal × (1 - coherence))
  calcDistortion() {
    let sum = 0;
    for (const [em, val] of Object.entries(this.values)) {
      const e = EMOTIONS[em];
      if (e) sum += val * e.a * (1 - e.c);
    }
    return clamp(sum / 10, 0, 1);
  }
  
  // Calculate coherence (0-1)
  // Average coherence weighted by emotion intensity
  calcCoherence() {
    let sum = 0, weight = 0;
    for (const [em, val] of Object.entries(this.values)) {
      const e = EMOTIONS[em];
      if (e && val > 0) {
        sum += e.c * val;
        weight += val;
      }
    }
    return weight > 0 ? sum / weight : 0.5;
  }
  
  // Check for emotional synergies
  checkSynergy() {
    const v = this.values;
    const coherence = this.calcCoherence();
    const checkData = { ...v, coherence };
    
    for (const [id, synergy] of Object.entries(SYNERGIES)) {
      if (synergy.check(checkData)) {
        return { id, ...synergy };
      }
    }
    
    return null;
  }
  
  // Update synergy state
  updateSynergy(dt) {
    if (this.synergyTimer > 0) {
      this.synergyTimer -= dt;
      if (this.synergyTimer <= 0) {
        this.activeSynergy = null;
      }
    }
    
    const synergy = this.checkSynergy();
    if (synergy && synergy.id !== this.activeSynergy) {
      this.activeSynergy = synergy.id;
      this.synergyTimer = 3000; // 3 seconds
      return synergy;
    }
    
    return null;
  }
  
  // Get dominant emotion
  getDominant() {
    let max = 0, dominant = null;
    for (const [em, val] of Object.entries(this.values)) {
      if (val > max) {
        max = val;
        dominant = em;
      }
    }
    return dominant;
  }
  
  // Get average valence (positive/negative)
  getValence() {
    let sum = 0, weight = 0;
    for (const [em, val] of Object.entries(this.values)) {
      const e = EMOTIONS[em];
      if (e && val > 0) {
        sum += e.v * val;
        weight += val;
      }
    }
    return weight > 0 ? sum / weight : 0;
  }
  
  // Export state for saving
  export() {
    return { values: { ...this.values }, activeSynergy: this.activeSynergy };
  }
  
  // Import saved state
  import(data) {
    this.values = { ...data.values };
    this.activeSynergy = data.activeSynergy || null;
  }
  
  // Reset to neutral state
  reset() {
    for (const em in this.values) {
      this.values[em] = 0;
    }
    this.activeSynergy = null;
    this.synergyTimer = 0;
  }
}

// Helper function to get emotion effect on gameplay
export function getEmotionalModifiers(field) {
  const dist = field.calcDistortion();
  const coh = field.calcCoherence();
  const valence = field.getValence();
  
  return {
    // Visual
    backgroundHue: valence > 0 ? 'green' : 'red',
    particleIntensity: 0.5 + dist * 0.5,
    visionClarity: 1 - dist * 0.3,
    
    // Gameplay
    moveSpeedMod: 1 - (dist * 0.2), // High distortion slows
    accuracyMod: coh, // High coherence = better accuracy
    insightGainMod: 1 + coh * 0.5, // Coherence increases insight
    hazardDamageMod: 1 + dist * 0.3, // Distortion increases damage taken
    
    // UI
    hudStability: 1 - dist * 0.4,
    textReadability: coh,
  };
}
