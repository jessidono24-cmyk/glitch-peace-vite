// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — achievements.js — Phase 9: Intelligence Enhancement
//  15 achievements earned through meaningful gameplay milestones.
//  Non-exploitative: achievements reward consciousness, not grinding.
//  No time-pressure achievements, no pay-to-unlock, no FOMO mechanics.
//
//  Research basis:
//    Intrinsic motivation sustained by mastery, autonomy, purpose
//    (Deci & Ryan, 1985 — Self-Determination Theory)
//    Meaningful milestones support self-efficacy and identity formation
//    (Bandura, 1997 — "Self-Efficacy: The Exercise of Control")
// ═══════════════════════════════════════════════════════════════════════

// ─── Achievement definitions ──────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'first_peace',
    name: 'First Breath',
    desc: 'Collect your first ◈ Peace tile.',
    icon: '◈',
    color: '#00ff88',
    condition: (s) => (s.totalPeaceCollected || 0) >= 1,
  },
  {
    id: 'level_5',
    name: 'Pattern Seeker',
    desc: 'Reach Level 5.',
    icon: '★',
    color: '#ffdd44',
    condition: (s) => (s.level || 0) >= 5,
  },
  {
    id: 'combo_10',
    name: 'Flow State',
    desc: 'Reach a combo of 10 in a single level.',
    icon: '×',
    color: '#ffaa00',
    condition: (s) => (s._maxComboThisSession || 0) >= 10,
  },
  {
    id: 'lucid_50',
    name: 'Lucid Dreamer',
    desc: 'Reach 50% lucidity.',
    icon: '◆',
    color: '#00ffee',
    condition: (s) => (s._lucidityMeter || 0) >= 50,
  },
  {
    id: 'lucid_100',
    name: 'Fully Lucid',
    desc: 'Reach 100% lucidity — complete wakefulness within the dream.',
    icon: '◆◆',
    color: '#ffffff',
    condition: (s) => (s._lucidityMeter || 0) >= 100,
  },
  {
    id: 'challenge_5',
    name: 'Scholar of the Grid',
    desc: 'Complete 5 learning challenges.',
    icon: '◉',
    color: '#88ffdd',
    condition: (s) => (s._totalChallengesCompleted || 0) >= 5,
  },
  {
    id: 'challenge_20',
    name: 'Multilingual Mind',
    desc: 'Complete 20 language challenges.',
    icon: '◉◉',
    color: '#00ccff',
    condition: (s) => (s._totalChallengesCompleted || 0) >= 20,
  },
  {
    id: 'archetype_used',
    name: 'Archetype Awakened',
    desc: 'Activate your archetype power for the first time.',
    icon: '⚔',
    color: '#ffdd00',
    condition: (s) => (s._archetypeActivationCount || 0) >= 1,
  },
  {
    id: 'archetype_10',
    name: 'Mythic Presence',
    desc: 'Activate your archetype power 10 times.',
    icon: '⚔⚔',
    color: '#ffaa44',
    condition: (s) => (s._archetypeActivationCount || 0) >= 10,
  },
  {
    id: 'first_insight_token',
    name: 'Token of Knowing',
    desc: 'Earn your first insight token.',
    icon: '◆',
    color: '#00ffee',
    condition: (s) => (s._totalInsightTokensEarned || 0) >= 1,
  },
  {
    id: 'shop_upgrade',
    name: 'Deliberate Growth',
    desc: 'Purchase an upgrade from the shop.',
    icon: '⊕',
    color: '#00aaff',
    condition: (s) => (s._totalUpgradesPurchased || 0) >= 1,
  },
  {
    id: 'undo_used',
    name: 'Pattern Interrupted',
    desc: 'Use undo to reverse a choice.',
    icon: '↩',
    color: '#aaddff',
    condition: (s) => (s._totalUndoUses || 0) >= 1,
  },
  {
    id: 'pacifist_level',
    name: 'Still Waters',
    desc: 'Complete a level without taking any damage.',
    icon: '◈◈',
    color: '#88ffaa',
    condition: (s) => (s._noDamageThisLevel === true),
  },
  {
    id: 'all_dreamscapes',
    name: 'Navigator of Realms',
    desc: 'Play in 5 different dreamscapes.',
    icon: '⊙',
    color: '#aaaaff',
    condition: (s) => ((s._dreamscapesVisited?.size || s._dreamscapesVisitedCount || 0) >= 5),
  },
  {
    id: 'empathy_5',
    name: 'Witness',
    desc: 'Encounter 5 different enemy behavior types.',
    icon: '◎',
    color: '#ffaacc',
    condition: (s) => (s._empathyBehaviorsWitnessed || 0) >= 5,
  },
];

const STORAGE_KEY      = 'gp_achievements';
const BADGE_DURATION   = 4000;   // ms to display badge overlay
const BADGE_FADE_IN_MS = 400;
const BADGE_FADE_OUT_MS = 600;

export class AchievementSystem {
  constructor() {
    this._unlocked = new Set(this._load());
    this._badge    = null;  // { name, desc, icon, color, shownAtMs }
    this._queue    = [];    // badges waiting to be shown
  }

  /**
   * Check all achievements against current game state.
   * Call once per frame (or on significant events) in update().
   * @param {Object} gameState
   */
  check(gameState) {
    for (const ach of ACHIEVEMENTS) {
      if (this._unlocked.has(ach.id)) continue;
      try {
        if (ach.condition(gameState)) {
          this._unlock(ach);
        }
      } catch (_) {}
    }

    // Advance badge queue if current badge expired
    if (this._badge) {
      const age = Date.now() - this._badge.shownAtMs;
      if (age >= BADGE_DURATION) {
        this._badge = null;
        if (this._queue.length) {
          this._badge = { ...this._queue.shift(), shownAtMs: Date.now() };
        }
      }
    } else if (this._queue.length) {
      this._badge = { ...this._queue.shift(), shownAtMs: Date.now() };
    }
  }

  /**
   * Render an achievement badge overlay in the top-right corner.
   * Call after the main game render, before the stats dashboard.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w - canvas width
   * @param {number} h - canvas height
   */
  renderBadge(ctx, w, h) {
    if (!this._badge) return;
    const { name, desc, icon, color, shownAtMs } = this._badge;
    const age = Date.now() - shownAtMs;

    // Fade in / hold / fade out
    const fadeIn  = Math.min(1, age / BADGE_FADE_IN_MS);
    const fadeOut = age > BADGE_DURATION - BADGE_FADE_OUT_MS
      ? (BADGE_DURATION - age) / BADGE_FADE_OUT_MS
      : 1;
    const alpha = Math.max(0, fadeIn * fadeOut);
    if (alpha <= 0) return;

    const BW = Math.min(240, Math.floor(w * 0.44));
    const BH = 64;
    const bx = w - BW - 12;
    const by = 14;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Panel
    ctx.fillStyle = 'rgba(4,8,22,0.95)';
    ctx.fillRect(bx, by, BW, BH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, BW, BH);

    // Glow border
    ctx.strokeStyle = `${color}44`;
    ctx.strokeRect(bx + 3, by + 3, BW - 6, BH - 6);

    // Icon
    ctx.fillStyle = color;
    ctx.font      = '22px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.fillText(icon, bx + 12, by + BH / 2 - 8);
    ctx.shadowBlur  = 0;

    // "ACHIEVEMENT" label
    ctx.fillStyle = `${color}bb`;
    ctx.font      = 'bold 8px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('ACHIEVEMENT UNLOCKED', bx + 42, by + 14);

    // Achievement name
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 12px Courier New';
    ctx.fillText(name.slice(0, 22), bx + 42, by + 30);

    // Description
    ctx.fillStyle = '#8899aa';
    ctx.font      = '9px Courier New';
    // Word-wrap to 2 lines
    const words = desc.split(' ');
    let line1 = '', line2 = '';
    for (const w_ of words) {
      if ((line1 + w_).length < 32) line1 += (line1 ? ' ' : '') + w_;
      else line2 += (line2 ? ' ' : '') + w_;
    }
    ctx.fillText(line1.slice(0, 34), bx + 42, by + 44);
    if (line2) ctx.fillText(line2.slice(0, 34), bx + 42, by + 54);

    ctx.restore();
  }

  // ─── Accessors ────────────────────────────────────────────────────
  get unlockedCount() { return this._unlocked.size; }
  get totalCount()    { return ACHIEVEMENTS.length; }
  isUnlocked(id)      { return this._unlocked.has(id); }

  /** Returns all definitions with their unlocked status */
  getAll() {
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: this._unlocked.has(a.id) }));
  }

  _unlock(ach) {
    this._unlocked.add(ach.id);
    this._save();
    this._queue.push(ach);
  }

  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._unlocked])); } catch (_) {}
  }
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }
}

export const achievementSystem = new AchievementSystem();
