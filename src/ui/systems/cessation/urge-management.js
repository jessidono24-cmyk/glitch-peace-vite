'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — urge-management.js — Phase 7: Cessation Tools
//  Breathing mechanics and mindful pause for urge surfing.
//  All interventions are optional, gentle, non-prescriptive.
// ═══════════════════════════════════════════════════════════════════════

// ─── Breathing patterns ───────────────────────────────────────────────
export const BREATH_PATTERNS = {
  box: {
    name: 'Box Breathing',
    desc: 'Used by Navy SEALs and therapists to calm the nervous system.',
    phases: [
      { label: 'INHALE',  duration: 4, color: '#00ffaa' },
      { label: 'HOLD',    duration: 4, color: '#ffdd00' },
      { label: 'EXHALE',  duration: 4, color: '#00aaff' },
      { label: 'HOLD',    duration: 4, color: '#aa88ff' },
    ],
  },
  '4-7-8': {
    name: '4-7-8 Breath',
    desc: 'Calms anxiety by extending the exhale phase.',
    phases: [
      { label: 'INHALE',  duration: 4,  color: '#00ffaa' },
      { label: 'HOLD',    duration: 7,  color: '#ffdd00' },
      { label: 'EXHALE',  duration: 8,  color: '#00aaff' },
    ],
  },
  coherent: {
    name: 'Coherent Breathing',
    desc: '5 breaths per minute — induces heart rate variability.',
    phases: [
      { label: 'INHALE',  duration: 6,  color: '#00ffaa' },
      { label: 'EXHALE',  duration: 6,  color: '#00aaff' },
    ],
  },
};

// ─── Grounding phrases for urge surfing ───────────────────────────────
const URGE_SURF_PROMPTS = [
  'Notice the urge without acting on it.',
  'Urges are waves — they peak and then pass.',
  'You are larger than any urge.',
  'Observe it like weather passing through.',
  'What does the urge feel like in the body?',
  'Give it 3 minutes. Urges rarely last longer.',
  'Name it: "I notice an urge to ___".',
  'You have ridden this wave before.',
];

export class UrgeManagement {
  constructor() {
    this.isActive      = false;
    this.patternKey    = 'box';
    this.phaseIdx      = 0;
    this.phaseProgress = 0;     // 0 → 1 within current phase
    this.cycleCount    = 0;
    this.surfPhrase    = null;
    this._elapsed      = 0;     // seconds in current phase
  }

  // ─── Start a breathing session ────────────────────────────────────
  start(patternKey) {
    this.patternKey    = patternKey || 'box';
    this.isActive      = true;
    this.phaseIdx      = 0;
    this.phaseProgress = 0;
    this._elapsed      = 0;
    this.cycleCount    = 0;
    this.surfPhrase    = URGE_SURF_PROMPTS[Math.floor(Math.random() * URGE_SURF_PROMPTS.length)];
  }

  stop() {
    this.isActive = false;
    this._elapsed = 0;
    this.phaseProgress = 0;
    this.phaseIdx = 0;
  }

  // ─── Tick — call with dt in seconds ──────────────────────────────
  tick(dt) {
    if (!this.isActive) return;
    const pattern = BREATH_PATTERNS[this.patternKey];
    const phase   = pattern.phases[this.phaseIdx];

    this._elapsed      += dt;
    this.phaseProgress  = Math.min(1, this._elapsed / phase.duration);

    if (this._elapsed >= phase.duration) {
      this._elapsed = 0;
      this.phaseIdx = (this.phaseIdx + 1) % pattern.phases.length;
      if (this.phaseIdx === 0) {
        this.cycleCount++;
        this.surfPhrase = URGE_SURF_PROMPTS[Math.floor(Math.random() * URGE_SURF_PROMPTS.length)];
      }
    }
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get currentPhase() {
    const pattern = BREATH_PATTERNS[this.patternKey];
    return pattern.phases[this.phaseIdx];
  }

  get currentPatternDef() {
    return BREATH_PATTERNS[this.patternKey];
  }

  // Returns a 0-1 value for the breathing circle radius animation
  get breathRadius() {
    const phase = this.currentPhase;
    if (phase.label === 'INHALE')  return 0.3 + 0.7 * this.phaseProgress;
    if (phase.label === 'EXHALE')  return 1.0 - 0.7 * this.phaseProgress;
    return this.phaseIdx % 2 === 1 ? 1.0 : 0.3; // HOLD at inhaled or exhaled size
  }
}

export const urgeManagement = new UrgeManagement();
