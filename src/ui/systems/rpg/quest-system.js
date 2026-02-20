'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — quest-system.js — Phase M5: RPG Quest Basics
//  Five main quests tracking player behaviour across sessions.
//  Quests are non-coercive: they surface as invitations, never demands.
//  Completing objectives rewards score, XP, and narrative insight.
//
//  Design law: quests must never shame-spiral. All completions are
//  celebrated; partial progress is honoured. No fail states, only
//  "not yet" states.
//
//  Research: Deci & Ryan (1985) SDT — intrinsic motivation via mastery;
//            Pink (2009) Drive — autonomy, mastery, purpose as reward loops;
//            Bandura (1977) Self-efficacy — micro-achievements build belief.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gp_quests';

export const QUEST_DEFS = [
  {
    id: 'first_light',
    name: 'FIRST LIGHT',
    emoji: '🌅',
    desc: 'Begin your journey — collect your first peace nodes and discover the matrix system.',
    objectives: [
      { id: 'collect_peace_5',   label: 'Collect 5 peace nodes',      max: 5  },
      { id: 'switch_matrix',     label: 'Switch matrix once',         max: 1  },
      { id: 'complete_dream_1',  label: 'Complete first dreamscape',  max: 1  },
    ],
    reward: { score: 500, xp: 40, msg: 'FIRST LIGHT COMPLETE — the path illuminates' },
  },
  {
    id: 'the_witness',
    name: 'THE WITNESS',
    emoji: '👁',
    desc: 'Develop awareness — pause, observe, and use the impulse buffer to preview consequences.',
    objectives: [
      { id: 'pause_5',           label: 'Pause 5 times',              max: 5  },
      { id: 'preview_moves_10',  label: 'Preview 10 moves',           max: 10 },
      { id: 'collect_insight_3', label: 'Collect 3 insight tokens',   max: 3  },
    ],
    reward: { score: 750, xp: 60, msg: 'THE WITNESS AWAKENS — awareness deepens' },
  },
  {
    id: 'the_body',
    name: 'THE BODY',
    emoji: '🌿',
    desc: 'Reconnect with the somatic — visit all four embodiment tile types.',
    objectives: [
      { id: 'body_scan_tile',    label: 'Step on BODY SCAN tile',     max: 1  },
      { id: 'breath_sync_tile',  label: 'Step on BREATH SYNC tile',   max: 1  },
      { id: 'energy_node_tile',  label: 'Step on ENERGY NODE tile',   max: 1  },
      { id: 'grounding_tile',    label: 'Step on GROUNDING tile',     max: 1  },
    ],
    reward: { score: 800, xp: 70, msg: 'THE BODY QUEST COMPLETE — somatic intelligence grows' },
  },
  {
    id: 'the_dreamer',
    name: 'THE DREAMER',
    emoji: '🌙',
    desc: 'Journey through the dreamscapes — complete 5 unique dreamscapes.',
    objectives: [
      { id: 'complete_dreams_5', label: 'Complete 5 dreamscapes',    max: 5  },
      { id: 'archetype_activate', label: 'Activate 3 archetypes',   max: 3  },
      { id: 'lucidity_50',       label: 'Reach 50% lucidity',        max: 1  },
    ],
    reward: { score: 1200, xp: 100, msg: 'THE DREAMER QUEST COMPLETE — lucidity expands' },
  },
  {
    id: 'the_sovereign',
    name: 'THE SOVEREIGN',
    emoji: '⚡',
    desc: 'Demonstrate mastery — survive a boss, complete the integration dreamscape.',
    objectives: [
      { id: 'boss_survived',     label: 'Survive a boss encounter',  max: 1  },
      { id: 'integration_done',  label: 'Complete Integration dreamscape', max: 1 },
      { id: 'combo_x4',          label: 'Achieve ×4 combo multiplier', max: 1 },
    ],
    reward: { score: 3000, xp: 200, msg: 'THE SOVEREIGN QUEST COMPLETE — SA · MCA · sovereignty is yours' },
  },
  {
    id: 'the_alchemist',
    name: 'THE ALCHEMIST',
    emoji: '⚗️',
    desc: 'Master the art of transmutation — complete 5 alchemical transmutations.',
    objectives: [
      { id: 'transmute_5',       label: 'Perform 5 transmutations',  max: 5  },
      { id: 'alchemy_elements_3', label: 'Use 3 different elements',  max: 3  },
    ],
    reward: { score: 1500, xp: 120, msg: 'THE ALCHEMIST COMPLETE — matter yields to intention' },
  },
  {
    id: 'the_great_work',
    name: 'THE GREAT WORK',
    emoji: '🔮',
    desc: 'Complete the Magnum Opus — achieve the Philosopher\'s Stone through all four classical elements.',
    objectives: [
      { id: 'philosopher_stone',  label: 'Forge the Philosopher\'s Stone', max: 1  },
      { id: 'aurora_phase',       label: 'Reach aurora alchemical phase',  max: 1  },
    ],
    reward: { score: 5000, xp: 350, msg: 'THE GREAT WORK COMPLETE — prima materia · the eternal gold' },
  },
];

export class QuestSystem {
  constructor() {
    const saved     = this._load();
    // progress[questId][objectiveId] = current count
    this._progress  = saved.progress || {};
    this._completed = new Set(saved.completed || []);
    this._flash     = null;  // current flash notification
    this._flashTimer = 0;
  }

  // ─── Event hooks (called from main.js) ───────────────────────────
  onPeaceCollect()      { this._inc('first_light',  'collect_peace_5', 1); }
  onMatrixSwitch()      { this._inc('first_light',  'switch_matrix',   1); }
  onDreamComplete(dsId) {
    this._inc('first_light',  'complete_dream_1', 1);
    this._inc('the_dreamer',  'complete_dreams_5', 1);
    if (dsId === 'integration') this._inc('the_sovereign', 'integration_done', 1);
  }
  onPause()             { this._inc('the_witness',  'pause_5',          1); }
  onPreviewMove()       { this._inc('the_witness',  'preview_moves_10', 1); }
  onInsightCollect()    { this._inc('the_witness',  'collect_insight_3', 1); }
  onBodyScanTile()      { this._inc('the_body',     'body_scan_tile',   1); }
  onBreathSyncTile()    { this._inc('the_body',     'breath_sync_tile', 1); }
  onEnergyNodeTile()    { this._inc('the_body',     'energy_node_tile', 1); }
  onGroundingTile()     { this._inc('the_body',     'grounding_tile',   1); }
  onArchetypeActivated(){ this._inc('the_dreamer',  'archetype_activate', 1); }
  onLucidityReached()   { this._inc('the_dreamer',  'lucidity_50',      1); }
  onBossSurvived()      { this._inc('the_sovereign','boss_survived',    1); }
  onComboX4()           { this._inc('the_sovereign','combo_x4',         1); }
  onTransmutation() {
    this._inc('the_alchemist',    'transmute_5',         1);
    this._inc('the_alchemist',    'alchemy_elements_3',  1);
  }
  onPhilosopherStone()  {
    this._inc('the_great_work',   'philosopher_stone',  1);
    this._inc('the_great_work',   'aurora_phase',       1);
  }
  onAuroraPhase()       { this._inc('the_great_work',   'aurora_phase',       1); }

  // ─── Core counter ────────────────────────────────────────────────
  _inc(questId, objId, amount) {
    const def = QUEST_DEFS.find(q => q.id === questId);
    if (!def || this._completed.has(questId)) return;
    const obj = def.objectives.find(o => o.id === objId);
    if (!obj) return;
    if (!this._progress[questId]) this._progress[questId] = {};
    const prev = this._progress[questId][objId] || 0;
    this._progress[questId][objId] = Math.min(obj.max, prev + amount);
    // Check for quest completion
    const allDone = def.objectives.every(o =>
      (this._progress[questId]?.[o.id] || 0) >= o.max
    );
    if (allDone) this._completeQuest(questId, def);
    this._save();
  }

  _completeQuest(questId, def) {
    this._completed.add(questId);
    this._flash      = { questId, def, reward: def.reward };
    this._flashTimer = 240; // ~4 s at 60fps
    window._questFlash = { text: def.reward.msg, color: '#ffdd88', alpha: 0, name: def.name, emoji: def.emoji, playSound: true };
    this._save();
  }

  // ─── Tick (called every frame) ───────────────────────────────────
  tick() {
    if (this._flashTimer > 0) {
      this._flashTimer--;
      if (window._questFlash) {
        // Fade in for first 30 frames, hold, then fade out over last 30 frames
        if (this._flashTimer > 210) window._questFlash.alpha = (240 - this._flashTimer) / 30; // 0→1 fade-in
        else if (this._flashTimer <= 30) window._questFlash.alpha = this._flashTimer / 30;     // 1→0 fade-out
        else window._questFlash.alpha = 1;
      }
      if (this._flashTimer === 0) {
        this._flash     = null;
        window._questFlash = null;
      }
    }
  }

  // ─── Accessors ───────────────────────────────────────────────────
  getProgress(questId) {
    const def = QUEST_DEFS.find(q => q.id === questId);
    if (!def) return null;
    return {
      ...def,
      done:        this._completed.has(questId),
      objectives:  def.objectives.map(o => ({
        ...o,
        current: Math.min(o.max, this._progress[questId]?.[o.id] || 0),
      })),
    };
  }

  getAllProgress() { return QUEST_DEFS.map(d => this.getProgress(d.id)); }

  get completedCount() { return this._completed.size; }
  get activeFlash()    { return this._flash; }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress:  this._progress,
        completed: [...this._completed],
      }));
    } catch (_) {}
  }
  _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; }
    catch (_) { return {}; }
  }
}

export const questSystem = new QuestSystem();
