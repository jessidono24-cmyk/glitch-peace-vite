'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  DREAM YOGA SYSTEM
//  Lucid dreaming preparation training embedded in gameplay.
//
//  Research basis:
//   • LaBerge & Rheingold (1990) Exploring the World of Lucid Dreaming
//     — reality testing frequency correlates with lucid dream onset
//   • Stumbrys et al. (2012) Induction of lucid dreams, Sleep Medicine Rev.
//     — MILD/WILD/SSILD techniques; habit formation through daily practice
//   • Hobson (2009) REM sleep and dreaming, Nature Rev. Neuroscience
//     — lucidity correlates with frontal lobe activation
//   • Tholey (1983) Techniques for inducing and manipulating lucid dreams
//     — critical reflection habit builds metacognitive muscle
//   • Voss et al. (2009) Lucid dreaming: a state of consciousness with
//     features of both waking and non-REM sleep, Sleep
//   • Tibetan Book of the Dead (Padmasambhava c.8th CE, Evans-Wentz 1927)
//     — dream yoga: maintaining awareness across sleep states
//   • Wangyal Rinpoche (1998) The Tibetan Yogas of Dream and Sleep
//     — recognition of the dream state through day-time awareness training
// ═══════════════════════════════════════════════════════════════════════

// Reality check prompts — ask during gameplay, building the daytime habit
// Research: LaBerge (1990) — 5-10× daily reality checks → ~40% lucid dream rate increase
const REALITY_CHECK_PROMPTS = [
  { q: 'Are you dreaming right now?',      hint: 'Check: can you change the numbers on screen with your mind?' },
  { q: 'Does this feel like a dream?',     hint: 'Dreams often feel completely real. Notice any strangeness.' },
  { q: 'When did you arrive here?',        hint: 'You often can\'t remember the beginning of a dream.' },
  { q: 'Can you read this twice?',         hint: 'Text shifts in dreams — re-reading reveals inconsistencies.' },
  { q: 'Count your fingers.',              hint: 'Extra or missing fingers are a classic dream sign.' },
  { q: 'Look away, then look back.',       hint: 'In dreams, objects often shift when attention moves away.' },
  { q: 'Is gravity working normally?',     hint: 'Dreams often alter physics — notice your body\'s weight.' },
  { q: 'Could you fly if you tried?',      hint: 'The question activates metacognitive awareness.' },
  { q: 'What were you doing 2 hours ago?', hint: 'If you can\'t recall, you may be dreaming.' },
  { q: 'Press your palm with a finger.',   hint: 'In dreams, fingers often pass through or sink into palms.' },
];

// Dream sign categories — tiles map to recurring dream motifs
// Research: Stumbrys et al. (2012) — personal dream signs are most reliable lucidity triggers
const TILE_DREAM_SIGNS = {
  4:  { sign: 'Peace Node',    motif: 'luminous spheres or lights',   category: 'form' },
  1:  { sign: 'Despair Field', motif: 'sinking, heaviness, darkness', category: 'feeling' },
  2:  { sign: 'Terror',        motif: 'pursuit, threat, alarm',        category: 'action' },
  6:  { sign: 'Insight',       motif: 'revelation, sudden knowing',    category: 'awareness' },
  11: { sign: 'Archetype',     motif: 'powerful figure, symbol',       category: 'character' },
  10: { sign: 'Glitch',        motif: 'reality malfunction, paradox',  category: 'context' },
  12: { sign: 'Teleport',      motif: 'sudden location shift',         category: 'context' },
  15: { sign: 'Memory',        motif: 'familiar scene, nostalgia',     category: 'context' },
  8:  { sign: 'Rage',          motif: 'explosive conflict, red haze',  category: 'feeling' },
  9:  { sign: 'Hopeless',      motif: 'paralysis, futility',           category: 'feeling' },
};

// Lucidity affirmations shown when reaching milestones
const LUCIDITY_AFFIRMATIONS = [
  'You are building the awareness muscle that transfers to your dreams.',
  'Each reality check in waking life primes the dreaming mind to ask the same question.',
  'Dream signs recognised here will surface as triggers in tonight\'s sleep.',
  'Awareness of the present moment is the same skill as awareness within a dream.',
  'The gap between waking and dreaming is only the volume of your attention.',
  'You have always been the dreamer — this game reminds you to remember.',
];

// Interval range for reality checks (milliseconds)
const RC_INTERVAL_MIN = 4 * 60 * 1000;  // 4 minutes minimum
const RC_INTERVAL_MAX = 9 * 60 * 1000;  // 9 minutes maximum
const RC_DISPLAY_MS   = 12000;           // show prompt for 12 seconds

// Lucidity change rates per event
const LUC_INSIGHT_GAIN  = 4;   // insight tile
const LUC_PEACE_GAIN    = 1;   // peace node
const LUC_HAZARD_LOSE   = 2;   // hazard damage
const LUC_DREAM_DECAY   = 0.3; // per second passive decay
const LUC_RC_GAIN       = 8;   // per reality check acknowledgement

export class DreamYogaSystem {
  constructor() {
    this._lucidity     = this._load('gp_lucidity', 30);   // 0-100
    this._lucidityMax  = 100;
    this._rcTimer      = this._nextInterval();
    this._rcActive     = false;
    this._rcPrompt     = null;
    this._rcAlpha      = 0;
    this._rcFade       = 0;  // > 0 = fading out
    this._dreamSigns   = this._load('gp_dream_signs', {});
    this._sessionSigns = {};
    this._totalChecks  = this._load('gp_rc_total', 0);
    this._sessionChecks = 0;
    this._lastAffirmation = '';
    this._milestones   = this._load('gp_lucid_milestones', 0);
  }

  get lucidity()      { return Math.round(this._lucidity); }
  get lucidityPct()   { return this._lucidity / this._lucidityMax; }
  get rcActive()      { return this._rcActive; }
  get rcPrompt()      { return this._rcPrompt; }
  get rcAlpha()       { return Math.max(0, Math.min(1, this._rcAlpha)); }
  get topDreamSign()  {
    const entries = Object.entries(this._dreamSigns);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    return TILE_DREAM_SIGNS[top[0]] || null;
  }
  get totalChecks()   { return this._totalChecks; }
  get sessionChecks() { return this._sessionChecks; }

  // ── Called every frame (dt in ms) ──────────────────────────────────
  tick(dt) {
    const dtSec = dt / 1000;

    // Passive lucidity decay (simulates forgetting without practice)
    this._lucidity = Math.max(0, this._lucidity - LUC_DREAM_DECAY * dtSec);

    // Reality check interval countdown
    if (!this._rcActive) {
      this._rcTimer -= dt;
      if (this._rcTimer <= 0) this._triggerRealityCheck();
    } else {
      // Fade logic
      if (this._rcFade > 0) {
        this._rcFade -= dt;
        this._rcAlpha = Math.max(0, this._rcFade / 800);
        if (this._rcFade <= 0) { this._rcActive = false; this._rcPrompt = null; }
      } else {
        // Fade in
        this._rcAlpha = Math.min(1, this._rcAlpha + dtSec * 3);
        // Auto-dismiss after RC_DISPLAY_MS — gives reduced bonus (habit builds through conscious act)
        this._rcAutoTimer = (this._rcAutoTimer || 0) + dt;
        if (this._rcAutoTimer >= RC_DISPLAY_MS) this._autoAcknowledgeRealityCheck();
      }
    }
  }

  // ── Tile step event ─────────────────────────────────────────────────
  onTileStep(tileType) {
    const sign = TILE_DREAM_SIGNS[tileType];
    if (sign) {
      const key = String(tileType);
      this._dreamSigns[key]   = (this._dreamSigns[key]   || 0) + 1;
      this._sessionSigns[key] = (this._sessionSigns[key] || 0) + 1;
      this._save('gp_dream_signs', this._dreamSigns);
    }
  }

  // ── Gameplay events ─────────────────────────────────────────────────
  onInsightCollect()  {
    this._lucidity = Math.min(this._lucidityMax, this._lucidity + LUC_INSIGHT_GAIN);
  }
  onPeaceCollect()    {
    this._lucidity = Math.min(this._lucidityMax, this._lucidity + LUC_PEACE_GAIN);
  }
  onHazardHit()       {
    this._lucidity = Math.max(0, this._lucidity - LUC_HAZARD_LOSE);
  }
  onMatrixSwitch()    {
    // Switching between matrices builds meta-awareness
    this._lucidity = Math.min(this._lucidityMax, this._lucidity + 2);
  }

  // ── Reality check acknowledgement (player presses Y or any key) ────
  acknowledgeRealityCheck() {
    if (!this._rcActive) return;
    this._rcFade  = 800;
    this._rcAutoTimer = 0;
    this._totalChecks++;
    this._sessionChecks++;
    this._lucidity = Math.min(this._lucidityMax, this._lucidity + LUC_RC_GAIN);
    this._save('gp_rc_total', this._totalChecks);
    this._rcTimer  = this._nextInterval(); // schedule next

    // Milestone at 5, 15, 30 checks
    const prev = this._milestones;
    if (this._totalChecks >= 5  && prev < 1) { this._milestones = 1; this._save('gp_lucid_milestones', 1); }
    if (this._totalChecks >= 15 && prev < 2) { this._milestones = 2; this._save('gp_lucid_milestones', 2); }
    if (this._totalChecks >= 30 && prev < 3) { this._milestones = 3; this._save('gp_lucid_milestones', 3); }
  }

  // ── Auto-dismiss (timeout) — half lucidity gain; habit requires conscious act ──
  _autoAcknowledgeRealityCheck() {
    if (!this._rcActive) return;
    this._rcFade      = 800;
    this._rcAutoTimer = 0;
    this._lucidity    = Math.min(this._lucidityMax, this._lucidity + Math.floor(LUC_RC_GAIN / 2));
    this._rcTimer     = this._nextInterval();
  }

  // ── Session reset ────────────────────────────────────────────────────
  resetSession() {
    this._sessionSigns  = {};
    this._sessionChecks = 0;
    this._rcAutoTimer   = 0;
    this._rcTimer       = this._nextInterval();
    this._rcActive      = false;
    this._rcPrompt      = null;
    this._rcAlpha       = 0;
    this._rcFade        = 0;
  }

  // ── Get affirmation for interlude screen ─────────────────────────────
  getInterludeAffirmation() {
    const pool = LUCIDITY_AFFIRMATIONS.filter(a => a !== this._lastAffirmation);
    this._lastAffirmation = pool[Math.floor(Math.random() * pool.length)];
    return this._lastAffirmation;
  }

  // ── Get session summary for journal ─────────────────────────────────
  getSessionSummary() {
    const topSign = this.topDreamSign;
    return {
      lucidity:     this.lucidity,
      checks:       this._sessionChecks,
      totalChecks:  this._totalChecks,
      topSign:      topSign ? topSign.motif : null,
      milestones:   this._milestones,
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────
  _triggerRealityCheck() {
    const pool = REALITY_CHECK_PROMPTS;
    this._rcPrompt   = pool[Math.floor(Math.random() * pool.length)];
    this._rcActive   = true;
    this._rcAlpha    = 0;
    this._rcFade     = 0;
    this._rcAutoTimer = 0;
  }

  _nextInterval() {
    return RC_INTERVAL_MIN + Math.random() * (RC_INTERVAL_MAX - RC_INTERVAL_MIN);
  }

  _load(key, def) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
  }
  _save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
}

export const dreamYoga = new DreamYogaSystem();
