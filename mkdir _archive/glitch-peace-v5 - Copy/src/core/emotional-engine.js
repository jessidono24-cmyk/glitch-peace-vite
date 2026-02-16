// ═══════════════════════════════════════════════════════════════════════
//  EMOTIONAL ENGINE - Mathematical Model
// ═══════════════════════════════════════════════════════════════════════

import { clamp } from './utils.js';

// Emotion definitions (valence, arousal, coherence)
export const EMOTIONS = {
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

// Emotional synergy configurations
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
    for (const em in EMOTIONS) {
      this.values[em] = 0;
    }
    this.activeSynergy = null;
    this.synergyTimer = 0;
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
