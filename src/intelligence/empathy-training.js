// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — empathy-training.js — Phase 9: Intelligence Enhancement
//  Develops empathy by surfacing the emotional context behind enemy behaviors.
//  Non-judgmental: enemies are not "evil" — they embody learned survival patterns.
//
//  Research basis:
//    Perspective-taking reduces dehumanization and increases prosocial behavior
//    (Batson et al., 1997 — "Empathy and the Collective Good")
//    Compassion practice creates approach vs. avoidance toward suffering
//    (Klimecki et al., 2014 — compassion training, neural correlates)
//    Internal family systems: "no bad parts" — all behaviors serve a function
//    (Schwartz, 1995 — "Internal Family Systems Model")
// ═══════════════════════════════════════════════════════════════════════

// ─── Behavior → emotional context mapping ─────────────────────────────
const BEHAVIOR_EMOTION = {
  rush:       { label: 'Driven by Fear',       color: '#ff4444', insight: 'Fear can look exactly like aggression.' },
  seeker:     { label: 'Seeking Connection',   color: '#ff8844', insight: 'We pursue what we cannot name.' },
  patrol:     { label: 'Following Structure',  color: '#8888ff', insight: 'Some behaviors are learned, not chosen.' },
  orbit:      { label: 'Circling in Loops',    color: '#aaaaff', insight: 'Familiar loops feel safer than open space.' },
  sniper:     { label: 'Keeping Distance',     color: '#ffdd44', insight: 'Distance is a form of self-protection.' },
  tank:       { label: 'Heavily Defended',     color: '#cccccc', insight: 'Defenses grow where pain once lived.' },
  swarm:      { label: 'Seeking the Group',    color: '#44ffaa', insight: 'Belonging can become its own constraint.' },
  phantom:    { label: 'Not Fully Present',    color: '#aaddff', insight: 'Some states hover between worlds.' },
  healer:     { label: 'Compulsive Caring',    color: '#ffaacc', insight: 'Giving at cost to self is also a wound.' },
  mimic:      { label: 'Identity Searching',   color: '#ddaaff', insight: 'We learn who we are by mirroring others.' },
  boss:       { label: 'Overwhelmed',          color: '#ff00aa', insight: 'Even the most defended have a core.' },
  labyrinth:  { label: 'Trapped in Pattern',   color: '#cc8800', insight: `The maze you build is the one you're in.` },
  chase:      { label: 'Compelled to Pursue',  color: '#ff6644', insight: 'Pursuit masks an unfulfilled need to arrive.' },
  wander:     { label: 'Lost but Moving',      color: '#aaddff', insight: 'Wandering is searching without a map.' },
  adaptive:   { label: 'Learning to Survive',  color: '#88ffdd', insight: 'Adaptation is intelligence under pressure.' },
  scatter:    { label: 'Overwhelmed, Fleeing', color: '#ffdd88', insight: 'Overwhelm scatters what was whole.' },
};

// ─── Compassion phrases shown after enemy stun ───────────────────────
const COMPASSION_PHRASES = [
  'A pause in the chase.',
  'In stillness, both can breathe.',
  'Even this force needs rest.',
  'The storm, interrupted.',
  'Resistance met with presence.',
  'All pursuit pauses here.',
  'Space created — for both of you.',
  'A moment outside the pattern.',
];

// ─── Empathy reflections shown at interlude ───────────────────────────
const EMPATHY_REFLECTIONS = [
  'Every entity in this space is responding to its programming.',
  'What looks like threat is often unmet need in action.',
  'The adversary and the player share the same grid.',
  'Compassion does not require agreement — only recognition.',
  'Patterns that harm were once patterns that protected.',
  'Behind every defense is something worth protecting.',
  'The grid is a mirror. What you meet here lives in you too.',
];

const STORAGE_KEY = 'gp_empathy';

export class EmpathyTraining {
  constructor() {
    this._data              = this._load();
    this._witnessed         = new Set(this._data.witnessed || []);
    // Session counters
    this._sessionCompass    = 0;  // compassionate actions (stuns)
    this._sessionEncounters = 0;  // total encounters tracked
    // HUD flash state
    this._flashEmotion      = null; // { label, color, insight, timer }
    this._compassPhrase     = null; // { text, timer }
    this._reflectionIdx     = 0;
  }

  // ─── Called when freeze/stun is used on enemies ──────────────────
  onEnemyStunned(behavior) {
    this._sessionCompass++;
    this._sessionEncounters++;
    const emo = BEHAVIOR_EMOTION[behavior] || BEHAVIOR_EMOTION.rush;
    this._flashEmotion  = { ...emo, timer: 120 };
    this._compassPhrase = {
      text: COMPASSION_PHRASES[Math.floor(Math.random() * COMPASSION_PHRASES.length)],
      timer: 100,
    };
    if (!this._witnessed.has(behavior)) {
      this._witnessed.add(behavior);
      this._data.witnessed = [...this._witnessed];
      this._save();
    }
  }

  // ─── Called when enemy contact inflicts damage (encounter) ───────
  onEnemyEncounter(behavior) {
    this._sessionEncounters++;
    const emo = BEHAVIOR_EMOTION[behavior] || BEHAVIOR_EMOTION.rush;
    // Brief flash on first encounter with this behavior type
    if (!this._witnessed.has(behavior)) {
      this._flashEmotion = { ...emo, timer: 80 };
      this._witnessed.add(behavior);
      this._data.witnessed = [...this._witnessed];
      this._save();
    }
  }

  // ─── Tick (call each frame) ───────────────────────────────────────
  tick() {
    if (this._flashEmotion)  { this._flashEmotion.timer--;  if (this._flashEmotion.timer  <= 0) this._flashEmotion  = null; }
    if (this._compassPhrase) { this._compassPhrase.timer--; if (this._compassPhrase.timer <= 0) this._compassPhrase = null; }
  }

  // ─── Empathy score (0-100) ────────────────────────────────────────
  get empathyScore() {
    const witnessedRatio  = this._witnessed.size / Object.keys(BEHAVIOR_EMOTION).length;
    const compassionRatio = this._sessionEncounters > 0
      ? this._sessionCompass / this._sessionEncounters : 0;
    return Math.round(witnessedRatio * 60 + compassionRatio * 40);
  }

  // ─── Interlude reflection ─────────────────────────────────────────
  getReflection() {
    const r = EMPATHY_REFLECTIONS[this._reflectionIdx % EMPATHY_REFLECTIONS.length];
    this._reflectionIdx++;
    return r;
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get flashEmotion()       { return this._flashEmotion && this._flashEmotion.timer > 0 ? this._flashEmotion : null; }
  get flashAlpha()         { return this._flashEmotion ? Math.min(1, this._flashEmotion.timer / 20) : 0; }
  get compassPhrase()      { return this._compassPhrase && this._compassPhrase.timer > 0 ? this._compassPhrase : null; }
  get behaviorsWitnessed() { return this._witnessed.size; }
  get sessionCompass()     { return this._sessionCompass; }

  resetSession() {
    this._sessionCompass = 0; this._sessionEncounters = 0;
    this._flashEmotion = null; this._compassPhrase = null;
  }

  _save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch (_) {} }
  _load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (_) { return {}; }
  }
}

export const empathyTraining = new EmpathyTraining();
