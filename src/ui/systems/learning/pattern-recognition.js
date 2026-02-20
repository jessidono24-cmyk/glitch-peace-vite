'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — pattern-recognition.js — Phase 6: Learning Systems
//  Detects mathematical patterns in gameplay and teaches them explicitly.
//  Fibonacci sequences, grid symmetry, combo chains, enemy patterns.
// ═══════════════════════════════════════════════════════════════════════

// ─── First 20 Fibonacci numbers for detection ─────────────────────────
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];
const FIB_SET   = new Set(FIBONACCI);

// ─── Pattern types with educational descriptions ───────────────────────
const PATTERN_TYPES = {
  fibonacci: {
    name: 'Fibonacci',
    symbol: 'φ',
    color: '#ffdd00',
    description: 'Nature\'s growth sequence: 1,1,2,3,5,8,13…',
    fact: 'Found in spirals of shells, sunflowers, and galaxies',
  },
  combo_chain: {
    name: 'Arithmetic',
    symbol: '∑',
    color: '#00ffaa',
    description: 'Equal increases form arithmetic sequences',
    fact: 'The foundation of multiplication and algebra',
  },
  symmetry: {
    name: 'Symmetry',
    symbol: '⟺',
    color: '#aa88ff',
    description: 'Mirror balance in both halves',
    fact: 'Sacred geometry builds on bilateral symmetry',
  },
  prime: {
    name: 'Prime',
    symbol: 'P',
    color: '#ff88cc',
    description: 'Numbers divisible only by 1 and themselves',
    fact: 'Prime numbers are the atoms of arithmetic',
  },
  power_of_two: {
    name: 'Powers of 2',
    symbol: '2ⁿ',
    color: '#88ccff',
    description: 'Each number doubles: 1,2,4,8,16,32…',
    fact: 'The language of computers and binary code',
  },
};

// ─── Check if a number is prime ────────────────────────────────────────
function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
  return true;
}

// ─── Check if a number is a power of 2 ────────────────────────────────
function isPowerOfTwo(n) { return n > 0 && (n & (n - 1)) === 0; }

export class PatternRecognition {
  constructor() {
    this._scoreHistory  = [];   // last 10 score values
    this._comboHistory  = [];   // last 6 combo chain lengths
    this._foundPatterns = [];   // { type, value, ts }
    this._activeBanner  = null; // { type, timer, description, fact }
    this._sessionCount  = 0;    // total patterns found this session
    this._allTimeCount  = this._loadCount();
    this._lastTrackedScore = -1; // for change-detection in checkScore()
  }

  // ─── Called each time score changes ──────────────────────────────
  onScoreChange(newScore) {
    this._scoreHistory.push(newScore);
    if (this._scoreHistory.length > 12) this._scoreHistory.shift();
    this._detectPatterns(newScore);
  }

  // ─── Call every frame — only runs detection when score changed ───
  checkScore(currentScore) {
    if (currentScore !== this._lastTrackedScore) {
      this._lastTrackedScore = currentScore;
      this.onScoreChange(currentScore);
    }
  }

  // ─── Called each time a combo hits ───────────────────────────────
  onCombo(comboLength) {
    this._comboHistory.push(comboLength);
    if (this._comboHistory.length > 8) this._comboHistory.shift();
    this._detectArithmetic();
  }

  // ─── Called with peace tiles collected (Fibonacci teaching) ──────
  onPeaceCollected(peaceCount) {
    if (FIB_SET.has(peaceCount)) {
      this._triggerBanner('fibonacci', peaceCount,
        `Peace count ${peaceCount} is a Fibonacci number!`);
    }
  }

  // ─── Detect patterns in score history ────────────────────────────
  _detectPatterns(score) {
    // Fibonacci detection
    if (FIB_SET.has(score % 100) && score > 0) {
      const fibIdx = FIBONACCI.indexOf(score % 100);
      if (fibIdx >= 2) this._triggerBanner('fibonacci', score, `Score contains φ${fibIdx}`);
    }

    // Prime score detection
    if (score > 1 && isPrime(score)) {
      this._triggerBanner('prime', score, `${score} is prime — divisible only by 1 and itself`);
    }

    // Power of 2 detection
    if (isPowerOfTwo(score) && score > 4) {
      this._triggerBanner('power_of_two', score, `${score} = 2^${Math.log2(score).toFixed(0)}`);
    }
  }

  // ─── Detect arithmetic sequences in combo history ────────────────
  _detectArithmetic() {
    const h = this._comboHistory;
    if (h.length < 3) return;
    const diffs = [];
    for (let i = 1; i < h.length; i++) diffs.push(h[i] - h[i-1]);
    // Check last 3 diffs for equality
    const last3 = diffs.slice(-3);
    if (last3.length === 3 && last3.every(d => d === last3[0]) && last3[0] !== 0) {
      this._triggerBanner('combo_chain', last3[0],
        `Combo diff +${last3[0]} — arithmetic sequence!`);
    }
  }

  // ─── Trigger a discovered pattern banner ─────────────────────────
  _triggerBanner(type, value, contextMsg) {
    // Don't spam — wait until previous expires
    if (this._activeBanner && this._activeBanner.timer > 60) return;

    const def = PATTERN_TYPES[type];
    if (!def) return;

    this._activeBanner = {
      type, value,
      name: def.name,
      symbol: def.symbol,
      color: def.color,
      description: def.description,
      fact: def.fact,
      context: contextMsg,
      timer: 180, // ~6 seconds at 30fps
      maxTimer: 180,
    };

    this._foundPatterns.push({ type, value, ts: Date.now() });
    this._sessionCount++;
    this._allTimeCount++;
    this._saveCount();
  }

  // ─── Called each frame ────────────────────────────────────────────
  tick() {
    if (this._activeBanner) {
      this._activeBanner.timer--;
      if (this._activeBanner.timer <= 0) this._activeBanner = null;
    }
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get activeBanner()   { return this._activeBanner; }
  get sessionCount()   { return this._sessionCount; }
  get allTimeCount()   { return this._allTimeCount; }

  // ─── Static Fibonacci explainer (for interlude screen) ───────────
  static fibonacciFact(n) {
    const idx = FIBONACCI.indexOf(n);
    if (idx < 0) return null;
    return {
      value: n,
      next: FIBONACCI[idx + 1] || n * 1.618,
      position: idx + 1,
      ratio: idx > 0 ? (n / FIBONACCI[idx - 1]).toFixed(5) : '—',
      desc: `φ (golden ratio) ≈ 1.61803…  ${FIBONACCI.slice(Math.max(0,idx-2), idx+3).join(' + ')} = ${n}`,
    };
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _saveCount() {
    try { localStorage.setItem('gp_patterns_found', String(this._allTimeCount)); } catch (_) {}
  }
  _loadCount() {
    try { return parseInt(localStorage.getItem('gp_patterns_found') || '0', 10); } catch (_) { return 0; }
  }
}

export const patternRecognition = new PatternRecognition();
