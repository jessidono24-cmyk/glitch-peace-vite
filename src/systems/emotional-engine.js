// GLITCH·PEACE Emotional Engine — Sprint 1: E1
// EmotionalField class: core emotional state, calculations, decay, synergy, realm inference
// (c) 2026 Glitch·Peace Project

/*
  EmotionalField — the core emotional engine for Glitch·Peace.
  - Tracks 10 base emotions, each with valence, arousal, coherence.
  - Provides live calculations for valence, coherence, distortion, synergy, dominant emotion.
  - Handles emotional decay, synergy detection, and realm inference (Mind/Purgatory/Heaven/Imagination/Hell).
  - Extensible for future emotion graph/cluster expansion.
*/

const BASE_EMOTIONS = [
  // id, display, valence, arousal, coherence
  { id: 'joy',        display: 'Joy',        valence: 1,   arousal: 0.7, coherence: 0.9 },
  { id: 'hope',       display: 'Hope',       valence: 0.8, arousal: 0.5, coherence: 0.8 },
  { id: 'trust',      display: 'Trust',      valence: 0.7, arousal: 0.4, coherence: 0.85 },
  { id: 'surprise',   display: 'Surprise',   valence: 0.2, arousal: 1.0, coherence: 0.5 },
  { id: 'fear',       display: 'Fear',       valence: -0.7,arousal: 0.9, coherence: 0.2 },
  { id: 'sadness',    display: 'Sadness',    valence: -1,  arousal: 0.3, coherence: 0.3 },
  { id: 'disgust',    display: 'Disgust',    valence: -0.8,arousal: 0.6, coherence: 0.1 },
  { id: 'anger',      display: 'Anger',      valence: -0.9,arousal: 0.8, coherence: 0.15 },
  { id: 'shame',      display: 'Shame',      valence: -0.95,arousal: 0.5, coherence: 0.05 },
  { id: 'anticipation',display: 'Anticipation',valence: 0.3,arousal: 0.8, coherence: 0.6 }
];

const EMOTIONAL_SYNERGY_STATES = [
  { id: 'FOCUSED_FORCE',   label: 'Focused Force',   test: f => f.coherence > 0.8 && f.valence > 0.5 },
  { id: 'CHAOS_BURST',     label: 'Chaos Burst',     test: f => f.distortion > 0.7 && f.coherence < 0.3 },
  { id: 'DEEP_INSIGHT',    label: 'Deep Insight',    test: f => f.coherence > 0.9 && f.valence > 0.7 },
  { id: 'NUMBNESS',        label: 'Numbness',        test: f => f.valence < -0.7 && f.coherence < 0.2 },
  { id: 'SERENITY',        label: 'Serenity',        test: f => f.valence > 0.8 && f.coherence > 0.8 },
  { id: 'TURBULENCE',      label: 'Turbulence',      test: f => f.distortion > 0.5 && f.valence < 0 },
  { id: 'EQUILIBRIUM',     label: 'Equilibrium',     test: f => Math.abs(f.valence) < 0.1 && f.coherence > 0.7 }
];

const REALM_LABELS = [
  { id: 'MIND',        label: 'Mind',        test: f => f.purgDepth < 0.2 },
  { id: 'PURGATORY',   label: 'Purgatory',   test: f => f.purgDepth >= 0.2 && f.purgDepth < 0.5 },
  { id: 'IMAGINATION', label: 'Imagination', test: f => f.purgDepth >= 0.5 && f.purgDepth < 0.7 },
  { id: 'HEAVEN',      label: 'Heaven',      test: f => f.purgDepth >= 0.7 && f.valence > 0.5 },
  { id: 'HELL',        label: 'Hell',        test: f => f.purgDepth >= 0.7 && f.valence <= 0.5 }
];

class EmotionalField {
  constructor(initial = {}) {
    // Each emotion: { id, value: 0-1 }
    this.emotions = {};
    BASE_EMOTIONS.forEach(e => {
      this.emotions[e.id] = typeof initial[e.id] === 'number' ? initial[e.id] : 0;
    });
    this.lastUpdate = Date.now();
    this.weekdayCoherenceMul = 1; // To be set by temporal system
  }

  // Get array of { id, value, ...meta }
  getEmotionArray() {
    return BASE_EMOTIONS.map(e => ({ ...e, value: this.emotions[e.id] }));
  }

  // Dominant emotion (highest value)
  getDominantEmotion() {
    let arr = this.getEmotionArray();
    let max = arr.reduce((a, b) => (a.value > b.value ? a : b));
    return max;
  }

  // Valence: weighted sum
  get valence() {
    let arr = this.getEmotionArray();
    let sum = arr.reduce((acc, e) => acc + e.value * e.valence, 0);
    let total = arr.reduce((acc, e) => acc + e.value, 0) || 1;
    return sum / total;
  }

  // Coherence: weighted sum
  get coherence() {
    let arr = this.getEmotionArray();
    let sum = arr.reduce((acc, e) => acc + e.value * e.coherence, 0);
    let total = arr.reduce((acc, e) => acc + e.value, 0) || 1;
    return sum / total;
  }

  // Distortion: Σ(emotion × arousal × (1-coherence)) / 10
  get distortion() {
    let arr = this.getEmotionArray();
    let sum = arr.reduce((acc, e) => acc + e.value * e.arousal * (1 - e.coherence), 0);
    return sum / arr.length;
  }

  // PurgDepth: normalized distortion (0-1)
  get purgDepth() {
    return Math.max(0, Math.min(1, this.distortion));
  }

  // Synergy state (first match)
  get synergy() {
    for (let s of EMOTIONAL_SYNERGY_STATES) {
      if (s.test(this)) return s;
    }
    return null;
  }

  // Realm label (first match)
  get realm() {
    for (let r of REALM_LABELS) {
      if (r.test(this)) return r;
    }
    return REALM_LABELS[0];
  }

  // Decay all emotions toward zero (or baseline), scaled by weekdayCoherenceMul
  // ARCH5 Research: Per-emotion decay rates based on Plutchik (1980) and
  // Gross (1998) emotion regulation — high-arousal, low-coherence emotions
  // decay faster (they burn themselves out). High-coherence positive emotions
  // decay more slowly (they reinforce neural patterns that sustain themselves).
  // Baumeister (1998) ego depletion: shame/anger decay fastest (highest metabolic cost).
  // ARCH5 EMBODIMENT.md: flow state slows decay 40% — coherence > 0.7 = sustained encoding.
  decay(dt = null) {
    let now = Date.now();
    let elapsed = dt || (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
    // Detect flow state: high coherence = slower emotional burn-through
    const inFlow = this.coherence > 0.7;
    const flowMul = inFlow ? 0.6 : 1.0; // Decay 40% slower in flow
    const baseRate = 0.05 * this.weekdayCoherenceMul * flowMul; // per second
    // Per-emotion decay rate multipliers (research-tuned):
    // Low coherence + high arousal = fast decay; high coherence = slow decay
    const EMOTION_DECAY_MUL = {
      shame:        2.0,  // Baumeister: shame is metabolically expensive, self-extinguishes
      anger:        1.8,  // Gross (1998): anger high arousal = rapid energy depletion
      disgust:      1.6,  // Plutchik: disgust fades without continuous reinforcement
      fear:         1.4,  // LeDoux (1994): fear circuits auto-regulate after threat passes
      sadness:      0.7,  // Nolen-Hoeksema (1991): sadness is persistent / ruminative
      surprise:     1.8,  // Plutchik: surprise is transient by nature — peaks then drops
      anticipation: 0.9,  // Moderate persistence — feeds forward momentum
      trust:        0.6,  // Rotter (1971): trust is stable once established
      hope:         0.65, // Snyder (2000): hope maintains without external reinforcement
      joy:          0.8,  // Fredrickson (2001): positive emotions broaden-and-build, slower decay
    };
    for (let id in this.emotions) {
      const mul = EMOTION_DECAY_MUL[id] ?? 1.0;
      const rate = baseRate * mul;
      if (this.emotions[id] > 0) {
        this.emotions[id] = Math.max(0, this.emotions[id] - rate * elapsed);
      } else if (this.emotions[id] < 0) {
        this.emotions[id] = Math.min(0, this.emotions[id] + rate * elapsed);
      }
    }
  }

  // Set emotion value (0-1)
  setEmotion(id, value) {
    if (this.emotions.hasOwnProperty(id)) {
      this.emotions[id] = Math.max(-1, Math.min(1, value));
    }
  }

  // Add to emotion (clamped)
  addEmotion(id, delta) {
    if (this.emotions.hasOwnProperty(id)) {
      this.setEmotion(id, this.emotions[id] + delta);
    }
  }

  // Set all emotions (object)
  setAll(emotionObj) {
    for (let id in emotionObj) {
      this.setEmotion(id, emotionObj[id]);
    }
  }

  // Export state
  toJSON() {
    return { ...this.emotions };
  }

  // Import state
  fromJSON(obj) {
    for (let id in obj) {
      this.setEmotion(id, obj[id]);
    }
  }
}

// Export for use in game loop
export { EmotionalField, BASE_EMOTIONS, EMOTIONAL_SYNERGY_STATES, REALM_LABELS };
