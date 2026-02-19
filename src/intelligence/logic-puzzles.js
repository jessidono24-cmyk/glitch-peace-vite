// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — logic-puzzles.js — Phase 9: Intelligence Enhancement
//  Develops cognitive IQ through passive observation of strategic play and
//  number-sequence challenges surfaced after each dreamscape completion.
//
//  Research basis:
//    Fluid intelligence trainable via working-memory & pattern tasks
//    (Jaeggi et al., 2008; Colom et al., 2013)
//    Mathematical sequence recognition builds numerical reasoning
//    (Dehaene, 1999 — "The Number Sense")
// ═══════════════════════════════════════════════════════════════════════

// ─── Sequence challenge library ───────────────────────────────────────
const SEQUENCES = [
  { seq: [1, 1, 2, 3, 5],    next: 8,  name: 'Fibonacci', fact: 'Fibonacci numbers appear in spirals, galaxies, and peace-tile scoring.' },
  { seq: [2, 4, 8, 16, 32],  next: 64, name: 'Powers of 2', fact: 'Each doubling is a "bit" — the language of digital systems.' },
  { seq: [1, 4, 9, 16, 25],  next: 36, name: 'Perfect Squares', fact: 'Square numbers form the grid of space itself.' },
  { seq: [3, 6, 9, 12, 15],  next: 18, name: 'Multiples of 3', fact: 'Trinities appear in mathematics, nature, and symbol systems.' },
  { seq: [1, 3, 6, 10, 15],  next: 21, name: 'Triangle Numbers', fact: 'Triangle numbers are sums of consecutive integers: 1+2+3+…' },
  { seq: [2, 3, 5, 7, 11],   next: 13, name: 'Prime Numbers', fact: 'Primes are divisible only by 1 and themselves — irreducible truths.' },
  { seq: [0, 1, 1, 2, 3],    next: 5,  name: 'Fibonacci (offset)', fact: 'Even starting from 0, the same ratio emerges.' },
  { seq: [1, 2, 4, 7, 11],   next: 16, name: 'Lazy Caterer', fact: 'Maximum pieces from N straight cuts through a circle.' },
  { seq: [4, 7, 10, 13, 16], next: 19, name: 'Arithmetic +3', fact: 'Constant-difference sequences are arithmetic progressions.' },
  { seq: [1, 8, 27, 64, 125], next: 216, name: 'Perfect Cubes', fact: 'Cube numbers represent three-dimensional space.' },
];

// ─── Cognitive coaching tips ──────────────────────────────────────────
const COGNITIVE_TIPS = [
  'Hold movement keys to preview consequences — plan 3 steps ahead.',
  'Fibonacci peace values reward streaks. Each collection compounds.',
  'Enemy AI has patterns. Watch two cycles before engaging.',
  'Matrix B slows enemies and heals — switch proactively, not reactively.',
  'Consequence preview is a planning tool, not just a warning.',
  'Use impulse buffer intentionally: pause, observe, then decide.',
  'The grid is a spatial puzzle. Map it mentally before moving.',
  'Insight tokens compound. Early upgrades multiply later rewards.',
  'Observe 3 enemy moves to detect their AI pattern before committing.',
  'Hazard tiles spread over time — contain them by collecting PEACE.',
];

const STORAGE_KEY         = 'gp_logic_iq';
const CHALLENGE_FADE_IN   = 30;   // frames to fade in
const CHALLENGE_HOLD      = 240;  // frames to display
const CHALLENGE_FADE_OUT  = 30;   // frames to fade out
const CHALLENGE_TOTAL     = CHALLENGE_FADE_IN + CHALLENGE_HOLD + CHALLENGE_FADE_OUT;

export class LogicPuzzles {
  constructor() {
    this._data            = this._load();
    this._challengesSeen  = this._data.challengesSeen || 0;
    // Session metrics
    this._previewUses     = 0;  // moves with consequence preview active
    this._impulseUses     = 0;  // moves that went through impulse buffer
    this._patternsMapped  = 0;
    this._matrixFlips     = 0;
    this._totalMoves      = 0;
    // Active sequence challenge
    this._challenge       = null; // { seq, next, name, fact, timer }
    this._tipIdx          = Math.floor(Math.random() * COGNITIVE_TIPS.length);
  }

  // ─── Called on each player move ────────────────────────────────────
  onMove(usedPreview, impulseActive) {
    this._totalMoves++;
    if (usedPreview)   this._previewUses++;
    if (impulseActive) this._impulseUses++;
  }

  // ─── Called on matrix switch ──────────────────────────────────────
  onMatrixSwitch() {
    this._matrixFlips++;
    this._tipIdx = (this._tipIdx + 1) % COGNITIVE_TIPS.length;
  }

  // ─── Called when pattern-recognition discovers a pattern ─────────
  onPatternDiscovered() { this._patternsMapped++; }

  // ─── Called at dreamscape completion to surface a sequence ───────
  onDreamscapeComplete() {
    const def = SEQUENCES[this._challengesSeen % SEQUENCES.length];
    this._challenge = { ...def, timer: CHALLENGE_TOTAL };
    this._challengesSeen++;
    this._data.challengesSeen = this._challengesSeen;
    this._save();
  }

  // ─── Tick (call each frame while playing) ────────────────────────
  tick() {
    if (this._challenge && this._challenge.timer > 0) {
      this._challenge.timer--;
      if (this._challenge.timer <= 0) this._challenge = null;
    }
  }

  // ─── IQ-proxy score: strategic behavior ratio (0-100) ─────────────
  get iqScore() {
    if (this._totalMoves === 0) return 50;
    const previewRatio  = Math.min(1, this._previewUses / this._totalMoves);
    const impulseRatio  = Math.min(1, this._impulseUses / Math.max(1, this._totalMoves * 0.08));
    const patternBonus  = Math.min(25, this._patternsMapped * 5);
    const flipBonus     = Math.min(15, this._matrixFlips * 2);
    return Math.round(Math.min(100, 25 + previewRatio * 35 + impulseRatio * 15 + patternBonus + flipBonus));
  }

  // ─── Active challenge accessors ───────────────────────────────────
  get activeChallenge() {
    return this._challenge && this._challenge.timer > 0 ? this._challenge : null;
  }

  get challengeAlpha() {
    if (!this._challenge || this._challenge.timer <= 0) return 0;
    const t = this._challenge.timer;
    if (t > CHALLENGE_HOLD + CHALLENGE_FADE_OUT) return (CHALLENGE_TOTAL - t) / CHALLENGE_FADE_IN;
    if (t < CHALLENGE_FADE_OUT) return t / CHALLENGE_FADE_OUT;
    return 1;
  }

  get currentTip()     { return COGNITIVE_TIPS[this._tipIdx]; }
  get challengesSeen() { return this._challengesSeen; }

  resetSession() {
    this._previewUses = 0; this._impulseUses = 0;
    this._patternsMapped = 0; this._matrixFlips = 0;
    this._totalMoves = 0; this._challenge = null;
  }

  _save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch (_) {} }
  _load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (_) { return {}; }
  }
}

export const logicPuzzles = new LogicPuzzles();
