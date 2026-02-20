'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — achievements.js — SteamPack Achievement System
//
//  Steam-compatible achievement tracking with in-game popup notifications.
//  Achievements persist across sessions via localStorage.
//
//  References:
//    Valve (2024). Steamworks Achievements API. Valve Corporation.
//    Przybylski, A.K. et al. (2010). "Motivational, emotional, and behavioral
//      correlates of fear of missing out." Computers in Human Behavior.
//    Ryan, R.M. & Deci, E.L. (2000). "Self-determination theory and the
//      facilitation of intrinsic motivation." American Psychologist, 55(1).
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gp_achievements';

// ─── Achievement definitions (Steam-style) ────────────────────────────
export const ACHIEVEMENT_DEFS = [
  // ── Core milestones ─────────────────────────────────────────────────
  { id: 'first_breath',    name: 'First Breath',       desc: 'Begin your first journey',                   icon: '🌱', hidden: false },
  { id: 'first_peace',     name: 'Peace Found',         desc: 'Collect your first peace node',              icon: '◈',  hidden: false },
  { id: 'survivor',        name: 'Survivor',            desc: 'Complete a dreamscape without dying',        icon: '🏆', hidden: false },
  { id: 'dreamer',         name: 'Deep Dreamer',        desc: 'Complete 5 dreamscapes in one session',      icon: '✨', hidden: false },
  { id: 'architect',       name: 'Dream Architect',     desc: 'Complete all 18 dreamscapes',               icon: '🏛️', hidden: false },
  // ── Mode milestones ──────────────────────────────────────────────────
  { id: 'grid_master',     name: 'Grid Master',         desc: 'Reach level 10 in grid mode',               icon: '🗂️', hidden: false },
  { id: 'marksman',        name: 'Marksman',            desc: 'Reach wave 10 in shooter mode',             icon: '🔫', hidden: false },
  { id: 'constellation',   name: 'Star Navigator',      desc: 'Complete a constellation in skymap mode',   icon: '✦',  hidden: false },
  { id: 'meditator',       name: 'Inner Stillness',     desc: 'Play meditation mode for 3 minutes',        icon: '🌸', hidden: false },
  { id: 'coop_partner',    name: 'Together',            desc: 'Complete a dreamscape in co-op mode',       icon: '🤝', hidden: false },
  // ── Score milestones ─────────────────────────────────────────────────
  { id: 'score_1k',        name: 'Awakening',           desc: 'Reach 1,000 score',                         icon: '⭐', hidden: false },
  { id: 'score_10k',       name: 'Illuminated',         desc: 'Reach 10,000 score',                        icon: '⭐⭐', hidden: false },
  { id: 'score_50k',       name: 'Sovereign',           desc: 'Reach 50,000 score',                        icon: '👑', hidden: false },
  // ── Emotional milestones ─────────────────────────────────────────────
  { id: 'emotional_range', name: 'Full Spectrum',       desc: 'Experience 8 different emotional states',   icon: '🎭', hidden: false },
  { id: 'coherent',        name: 'Coherent Mind',       desc: 'Maintain coherence > 0.8 for 60 seconds',  icon: '💙', hidden: false },
  // ── Learning milestones ──────────────────────────────────────────────
  { id: 'vocab_10',        name: 'Word Weaver',         desc: 'Learn 10 vocabulary words',                 icon: '📚', hidden: false },
  { id: 'vocab_100',       name: 'Linguist',            desc: 'Learn 100 vocabulary words',               icon: '🌍', hidden: false },
  { id: 'pattern_seeker',  name: 'Pattern Seeker',      desc: 'Discover 5 patterns in one session',       icon: '🧩', hidden: false },
  // ── Alchemy & transformation ─────────────────────────────────────────
  { id: 'first_transmute', name: 'Alchemist',           desc: 'Perform your first transmutation',          icon: '⚗️', hidden: false },
  { id: 'philosopher',     name: "Philosopher's Stone", desc: "Achieve the Philosopher's Stone",           icon: '💎', hidden: true  },
  // ── Hidden achievements ──────────────────────────────────────────────
  { id: 'matrix_master',   name: 'Matrix Walker',       desc: 'Toggle matrix 50 times',                   icon: '🔀', hidden: true  },
  { id: 'no_damage',       name: 'Ghost',               desc: 'Complete a dreamscape without taking damage', icon: '👻', hidden: true  },
  { id: 'combo_x10',       name: 'Flow State',          desc: 'Achieve a ×10 combo',                      icon: '🌊', hidden: true  },
  { id: 'boss_slayer',     name: 'Dragon Tamer',        desc: 'Defeat a boss',                            icon: '🐉', hidden: true  },
  { id: 'speed_dreamer',   name: 'Speed Dreamer',       desc: 'Complete a dreamscape in under 90 seconds', icon: '⚡', hidden: true  },
  { id: 'sovereignty',     name: 'Sovereignty',         desc: 'Unlock all archetypes in one run',         icon: '👑', hidden: true  },
];

const ACH_MAP = new Map(ACHIEVEMENT_DEFS.map(a => [a.id, a]));

class AchievementSystem {
  constructor() {
    const saved = this._load();
    this._unlocked = new Set(saved.unlocked || []);
    this._counters  = saved.counters  || {};
    // In-game notification queue
    this._queue     = [];   // { id, ts } items waiting to display
    this._current   = null; // currently showing popup
    this._popupTimer = 0;   // countdown ms for current popup
    this.POPUP_DURATION = 4000; // ms
  }

  // ── Public API ────────────────────────────────────────────────────────

  /** Unlock an achievement (no-op if already unlocked). Returns true if newly unlocked. */
  unlock(id) {
    if (this._unlocked.has(id)) return false;
    const def = ACH_MAP.get(id);
    if (!def) return false;
    this._unlocked.add(id);
    this._queue.push(id);
    this._save();
    return true;
  }

  /** Increment a counter and check threshold unlocks. */
  increment(counterId, amount = 1) {
    this._counters[counterId] = (this._counters[counterId] || 0) + amount;
    this._checkCounters(counterId);
    this._save();
  }

  /** Check if an achievement is unlocked. */
  isUnlocked(id) { return this._unlocked.has(id); }

  /** Get count of unlocked achievements. */
  get unlockedCount() { return this._unlocked.size; }

  /** Get total achievement count. */
  get totalCount() { return ACHIEVEMENT_DEFS.length; }

  /** Get current popup data (or null). */
  get popup() { return this._current; }

  /** Get all unlocked achievement defs (for display). */
  getUnlocked() {
    return ACHIEVEMENT_DEFS.filter(a => this._unlocked.has(a.id));
  }

  /** Update popup timer each frame. */
  tick(dt) {
    if (this._current) {
      this._popupTimer -= dt;
      if (this._popupTimer <= 0) {
        this._current = null;
        this._popupTimer = 0;
      }
    }
    if (!this._current && this._queue.length > 0) {
      const id = this._queue.shift();
      const def = ACH_MAP.get(id);
      if (def) {
        this._current = { ...def, progress: 1.0 };
        this._popupTimer = this.POPUP_DURATION;
      }
    }
  }

  // ── Convenience event hooks ──────────────────────────────────────────

  onFirstMove()               { this.unlock('first_breath'); }
  onPeaceCollect()            { this.unlock('first_peace'); }
  onDreamscapeComplete(count) {
    this.unlock('survivor');
    if (count >= 5)  this.unlock('dreamer');
    if (count >= 18) this.unlock('architect');
  }
  onScoreUpdate(score) {
    if (score >= 1000)  this.unlock('score_1k');
    if (score >= 10000) this.unlock('score_10k');
    if (score >= 50000) this.unlock('score_50k');
  }
  onGridLevel(level)    { if (level >= 10) this.unlock('grid_master'); }
  onShooterWave(wave)   { if (wave >= 10)  this.unlock('marksman'); }
  onConstellationDone() { this.unlock('constellation'); }
  onMeditationTime(ms)  { if (ms >= 3 * 60 * 1000) this.unlock('meditator'); }
  onCoopDreamComplete() { this.unlock('coop_partner'); }
  onTransmutation()     { this.unlock('first_transmute'); }
  onPhilosopherStone()  { this.unlock('philosopher'); }
  onBossDefeated()      { this.unlock('boss_slayer'); }
  onCombo(n)            { if (n >= 10) this.unlock('combo_x10'); }
  onNoDamageDream()     { this.unlock('no_damage'); }
  onFastDream(seconds)  { if (seconds <= 90) this.unlock('speed_dreamer'); }
  onMatrixToggle() {
    this.increment('matrix_toggles');
    if ((this._counters.matrix_toggles || 0) >= 50) this.unlock('matrix_master');
  }
  onVocabLearned(total) {
    if (total >= 10)  this.unlock('vocab_10');
    if (total >= 100) this.unlock('vocab_100');
  }
  onPatternSessions(count) { if (count >= 5) this.unlock('pattern_seeker'); }
  onEmotionCount(n) { if (n >= 8) this.unlock('emotional_range'); }
  onCoherentStreak()  { this.unlock('coherent'); }
  onAllArchetypes()   { this.unlock('sovereignty'); }

  // ── Persistence ───────────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unlocked: [...this._unlocked],
        counters: this._counters,
      }));
    } catch (_) { /* storage full / private mode */ }
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }
}

export const achievementSystem = new AchievementSystem();
