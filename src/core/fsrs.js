'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — fsrs.js
//  FSRS-5 (Free Spaced Repetition Scheduler, version 5)
//
//  Research basis:
//  - Ye, D. (2024). "FSRS v5: An Open-Source Optimized Spaced Repetition
//    Algorithm Achieving ~90% Retention". GitHub: open-spaced-repetition/fsrs5
//  - Ebbinghaus, H. (1885). Über das Gedächtnis. Duncker & Humblot.
//  - Leitner, S. (1972). So lernt man lernen. Herder.
//  - SM-2 (Wozniak 1987) achieves ~47% retention due to fixed intervals;
//    FSRS-5 models forgetting curves per-card using D/S/R parameters.
//
//  Per-card state:
//    D — Difficulty  (1–10): intrinsic card hardness; persists across reviews
//    S — Stability   (days): how long until 90% retention decays to 70%
//    R — Retrievability (0–1): current estimated recall probability
//
//  Rating scale (matches Anki FSRS):
//    1 = Again (complete failure)
//    2 = Hard  (correct with significant difficulty)
//    3 = Good  (correct with some effort)
//    4 = Easy  (perfect recall)
// ═══════════════════════════════════════════════════════════════════════

// ─── FSRS-5 default weights (from open-spaced-repetition research) ─────
const W = [
  0.4072, 1.1829, 3.1262, 15.4722,   // w0–w3: initial stability by rating
  7.2102, 0.5316,  1.0651,  0.0589,  // w4–w7
  1.5330, 0.1544,  1.0048,  1.9813,  // w8–w11
  0.0953, 0.2975,  2.2042,  0.2407,  // w12–w15
  2.9466, 0.5034,  0.6567,            // w16–w18
];

const DECAY        = -0.5;
const FACTOR       = Math.pow(0.9, 1 / DECAY) - 1;  // ≈ 19/81 for 90% benchmark
const TARGET_R     = 0.9;   // target retrievability (90%)

// ─── Card state ──────────────────────────────────────────────────────
/**
 * Create a fresh card state for a new word.
 * @returns {{ d: number, s: number, r: number, reps: number, lapses: number,
 *             lastReview: number|null, nextReview: number }}
 */
export function newCard() {
  return {
    d: 5,           // default difficulty
    s: 0,           // stability (set on first review)
    r: 0,           // retrievability (0 before first review)
    reps: 0,        // total review count
    lapses: 0,      // number of forgetting events
    lastReview: null,
    nextReview: Date.now(),  // due immediately
  };
}

// ─── Retrievability ──────────────────────────────────────────────────
/**
 * Estimate current recall probability given stability (days) and elapsed days.
 * R(t) = (1 + FACTOR * t/S) ^ DECAY   — power forgetting curve (FSRS-5 eq. 2)
 * @param {number} s - Stability in days
 * @param {number} t - Elapsed days since last review
 * @returns {number} Retrievability 0–1
 */
export function calcR(s, t) {
  if (s <= 0) return 0;
  return Math.pow(1 + FACTOR * t / s, DECAY);
}

// ─── Initial stability after first review ────────────────────────────
/**
 * Stability after the very first review (no prior history).
 * @param {1|2|3|4} rating
 * @returns {number} Stability in days
 */
function _initStability(rating) {
  return Math.max(0.1, W[rating - 1]);  // w0=Again, w1=Hard, w2=Good, w3=Easy
}

// ─── Initial difficulty ──────────────────────────────────────────────
/**
 * Difficulty after first review.
 * D0 = w4 − (rating − 3) * w5   (clamped 1–10)
 * @param {1|2|3|4} rating
 * @returns {number} Difficulty 1–10
 */
function _initDifficulty(rating) {
  return Math.min(10, Math.max(1, W[4] - (rating - 3) * W[5]));
}

// ─── Difficulty update ───────────────────────────────────────────────
/**
 * Update difficulty after a subsequent review.
 * @param {number} d - Current difficulty
 * @param {1|2|3|4} rating
 * @returns {number} New difficulty 1–10
 */
function _nextDifficulty(d, rating) {
  const dd = -W[6] * (rating - 3);
  return Math.min(10, Math.max(1, d + dd * ((10 - d) / 9)));
}

// ─── Stability after recall (successful review) ──────────────────────
/**
 * Stability after a successful review.
 * @param {number} d - Current difficulty
 * @param {number} s - Current stability
 * @param {number} r - Current retrievability
 * @param {1|2|3|4} rating
 * @returns {number} New stability in days
 */
function _recallStability(d, s, r, rating) {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus   = rating === 4 ? W[16] : 1;
  return s * (
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s, -W[9]) *
    (Math.exp((1 - r) * W[10]) - 1) *
    hardPenalty * easyBonus + 1
  );
}

// ─── Stability after forgetting (lapse) ─────────────────────────────
/**
 * Stability after a failed review (rating = 1).
 * @param {number} d - Current difficulty
 * @param {number} s - Current stability
 * @param {number} r - Current retrievability
 * @returns {number} New stability in days
 */
function _forgetStability(d, s, r) {
  return (
    W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp((1 - r) * W[14])
  );
}

// ─── Interval scheduling ─────────────────────────────────────────────
/**
 * Next review interval (days) to maintain TARGET_R retrievability.
 * t = S * (R^(1/DECAY) - 1) / FACTOR
 * @param {number} s - Stability in days
 * @returns {number} Days until next review (floored, min 1)
 */
export function nextInterval(s) {
  const t = s * (Math.pow(TARGET_R, 1 / DECAY) - 1) / FACTOR;
  return Math.max(1, Math.floor(t));
}

// ─── Core review function ────────────────────────────────────────────
/**
 * Process a review and return updated card state plus feedback.
 * @param {Object} card - Card state from newCard()
 * @param {1|2|3|4} rating - User rating
 * @returns {{ card: Object, interval: number, dsrText: string }}
 */
export function review(card, rating) {
  const now = Date.now();
  const elapsedDays = card.lastReview
    ? (now - card.lastReview) / 86_400_000
    : 0;

  let d, s, r;

  if (card.reps === 0) {
    // First review
    d = _initDifficulty(rating);
    s = _initStability(rating);
    r = 1;
  } else {
    // Subsequent review
    r = calcR(card.s, elapsedDays);
    d = _nextDifficulty(card.d, rating);
    if (rating === 1) {
      s = _forgetStability(card.d, card.s, r);
    } else {
      s = _recallStability(card.d, card.s, r, rating);
    }
    s = Math.max(0.1, s);
  }

  const lapses   = card.lapses + (rating === 1 ? 1 : 0);
  const reps     = card.reps + 1;
  const interval = nextInterval(s);
  const nextReview = now + interval * 86_400_000;

  const updatedCard = { d, s, r, reps, lapses, lastReview: now, nextReview };
  const dsrText = `D${d.toFixed(1)} S${s.toFixed(1)}d R${Math.round(r * 100)}% · next ${interval}d`;

  return { card: updatedCard, interval, dsrText };
}

// ─── Session helpers ─────────────────────────────────────────────────
/**
 * Select due cards from a deck for a review session.
 * @param {Object} deck - Map of id → card
 * @param {number} [limit=20] - Max cards to return
 * @returns {string[]} Array of card IDs that are due
 */
export function getDueCards(deck, limit = 20) {
  const now = Date.now();
  return Object.entries(deck)
    .filter(([, c]) => c.nextReview <= now)
    .sort(([, a], [, b]) => a.nextReview - b.nextReview)
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * Session retention rate (correct answers / total, excluding Again).
 * @param {number[]} ratings - Array of ratings from session
 * @returns {number} 0–1
 */
export function sessionRetention(ratings) {
  if (!ratings.length) return 0;
  const correct = ratings.filter(r => r >= 2).length;
  return correct / ratings.length;
}
