// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — strategic-thinking.js — Phase 9: Intelligence Enhancement
//  Develops multi-step planning and resource-management skills by tracking
//  the ratio of mindful vs. reactive gameplay decisions.
//
//  Research basis:
//    Executive function (planning, inhibition, mental flexibility) trainable
//    (Diamond & Ling, 2016 — "Conclusions about interventions, programs, and
//    approaches for improving executive functions that appear justified")
//    Strategic thinking games improve fluid intelligence transfer
//    (Green & Bavelier, 2012 — action game training and cognition)
//    Deliberate practice — conscious, effortful decision-making builds skill
//    (Ericsson, 1993 — "The Role of Deliberate Practice in the Acquisition
//    of Expert Performance")
// ═══════════════════════════════════════════════════════════════════════

// ─── Strategic coaching tips (by score bracket) ───────────────────────
const STRATEGY_TIPS = [
  { level:  0, tip: 'Hold movement keys briefly to preview your path before each move.' },
  { level: 15, tip: 'Insight tokens compound — buy upgrades that multiply later gains.' },
  { level: 25, tip: 'Matrix B + consequence preview is a powerful defensive combination.' },
  { level: 40, tip: 'Watch tile spread — DESPAIR and HOPELESS grow. Contain them with PEACE.' },
  { level: 55, tip: 'Matrix A heightens risk AND sharpens rewards. Use it deliberately.' },
  { level: 65, tip: 'Plan routes that chain multiple peace tiles in a single pass.' },
  { level: 75, tip: 'Environmental events have timing. Anticipate them before they trigger.' },
  { level: 88, tip: 'Expert: switch matrix mid-encounter to invert the engagement terms.' },
];

// ─── Insight token upgrade value weights (for ROI tracking) ──────────
const TOKEN_UPGRADE_VALUES = {
  maxhp: 30, speed: 25, magnet: 20, freeze: 20,
  aura:  15, energy: 20, rewind: 35, pulse:  30,
};

const STORAGE_KEY = 'gp_strategy';

export class StrategicThinking {
  constructor() {
    this._data             = this._load();
    // Session counters (reset on game start)
    this._mindfulMoves     = 0;  // moves with preview active OR impulse buffer used
    this._totalMoves       = 0;
    this._damageInA        = 0;  // damage events in Matrix A
    this._damageInB        = 0;  // damage events in Matrix B (should be fewer)
    this._tokensSpentValue = 0;  // cumulative strategic value of tokens spent
    this._impulseCancel    = 0;  // impulse buffer cancellations (changed mind)
    this._freezeUses       = 0;  // freeze ability activations
  }

  // ─── Move tracking ────────────────────────────────────────────────
  onMindfulMove()   { this._mindfulMoves++; this._totalMoves++; }
  onImpulsiveMove() { this._totalMoves++; }
  onImpulseCancel() { this._impulseCancel++; }  // paused, then changed mind

  // ─── Resource events ─────────────────────────────────────────────
  onDamage(matrixActive) {
    if (matrixActive === 'A') this._damageInA++;
    else this._damageInB++;
  }

  onTokenSpent(upgradeId) {
    this._tokensSpentValue += TOKEN_UPGRADE_VALUES[upgradeId] || 10;
  }

  onFreezeUsed() { this._freezeUses++; }

  // ─── Strategic depth score (0-100) ────────────────────────────────
  get strategicScore() {
    const mindfulRatio  = this._totalMoves > 0 ? this._mindfulMoves / this._totalMoves : 0;
    const totalDamage   = this._damageInA + this._damageInB;
    const matrixBalance = totalDamage > 0
      ? 1 - (this._damageInA / totalDamage) * 0.5   // lower A-damage = better matrix discipline
      : 0.6;
    const toolScore     = Math.min(1, (this._freezeUses * 8 + this._impulseCancel * 5) / 100);
    const tokenScore    = Math.min(1, this._tokensSpentValue / 80);
    return Math.round(
      mindfulRatio  * 35 +
      matrixBalance * 25 +
      toolScore     * 20 +
      tokenScore    * 20
    );
  }

  // ─── Coaching tip for current strategic level ─────────────────────
  get coachingTip() {
    const score = this.strategicScore;
    let best = STRATEGY_TIPS[0];
    for (const t of STRATEGY_TIPS) {
      if (score >= t.level) best = t;
      else break;
    }
    return best.tip;
  }

  get mindfulRatio() { return this._totalMoves > 0 ? this._mindfulMoves / this._totalMoves : 0; }
  get sessionMoves() { return this._totalMoves; }

  resetSession() {
    this._mindfulMoves = 0; this._totalMoves = 0;
    this._damageInA = 0; this._damageInB = 0;
    this._tokensSpentValue = 0;
    this._impulseCancel = 0; this._freezeUses = 0;
  }

  _save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch (_) {} }
  _load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (_) { return {}; }
  }
}

export const strategicThinking = new StrategicThinking();
