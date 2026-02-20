/**
 * RPGMode.js — Phase M5: Role-Playing Game Mode (Active)
 *
 * Narrative-driven gameplay with dialogue trees, character stats,
 * and quest objectives. Live 12×12 tile grid with wandering shadow
 * enemies, stat-modulated hazard damage, and peace-node collection.
 * Builds on the emotional engine for branching outcomes.
 */

import GameMode from '../../core/interfaces/GameMode.js';
import { getDreamscapeTheme } from '../../systems/dreamscapes.js';
import { generateGrid } from '../../game/grid.js';
import { T, TILE_DEF } from '../../core/constants.js';

// ─── Character Stats ──────────────────────────────────────────────────────────
const BASE_STATS = {
  strength:   1,  // affects combat damage
  wisdom:     1,  // affects learning challenge rewards
  empathy:    1,  // affects emotional field coherence gains
  resilience: 1,  // affects HP recovery and relapse compassion
  clarity:    1,  // affects fog-of-war visibility range
};

// Stat growth: wisdom gains 1 point per N levels of experience
const WISDOM_GROWTH_DIVISOR  = 3;  // every 3 levels
const CLARITY_GROWTH_DIVISOR = 5;  // every 5 levels

// Default emotional effect magnitude for dialogue choices without explicit `amt`
const DEFAULT_EMOTION_EFFECT = 0.3;

// ─── RPG Grid Constants ───────────────────────────────────────────────────────
const RPG_GRID_SIZE      = 18;   // expanded tile count per side (was 12)
const RPG_SHADOW_COUNT   = 4;    // wandering glitch spirit enemies (was 3)
const RPG_SHADOW_MOVE_MS = 900;  // ms between shadow enemy steps
const RPG_TOP_OFFSET     = 58;   // px at top reserved for banner
const RPG_BOT_OFFSET     = 178;  // px at bottom reserved for dialogue box
const RPG_MIN_SPAWN_DIST = 5;    // min Manhattan distance from (1,1) for enemy spawn

// ─── Named Zones (18×18 grid divided into 4 quadrants + center) ───────────────
// Each zone: { name, x1, y1, x2, y2, description, music }
const RPG_ZONES = [
  { id: 'forest',    name: '🌲 Whispering Forest', x1: 0, y1: 0,  x2: 8,  y2: 8,  desc: 'Ancient trees hum old patterns' },
  { id: 'village',   name: '🏘 Pattern Village',   x1: 9, y1: 0,  x2: 17, y2: 8,  desc: 'Survivors who remember the peace' },
  { id: 'temple',    name: '⛩ Temple of Sigils',  x1: 0, y1: 9,  x2: 8,  y2: 17, desc: 'Sacred symbols hold the grid together' },
  { id: 'void_edge', name: '🌑 Void Edge',          x1: 9, y1: 9,  x2: 17, y2: 17, desc: 'The Glitch spreads here — be careful' },
  { id: 'center',   name: '✦ Convergence Point',  x1: 7, y1: 7,  x2: 10, y2: 10, desc: 'All paths meet here' },
];

// ─── NPC Characters with dialogue trees ──────────────────────────────────────
const NPC_DATA = [
  {
    id: 'elder',
    symbol: '⊕',
    color: '#ffdd88',
    name: 'THE ELDER',
    zone: 'village',
    preferX: 13, preferY: 3,
    dialogue: [
      {
        id: 'start',
        speaker: 'ELDER',
        text: 'The Pattern Village stood for generations. Now the Glitch eats at our edges.',
        options: [
          { label: 'How do we stop it?', next: 'stop' },
          { label: 'Have others survived?', next: 'others' },
          { label: '[Listen quietly]', next: 'quiet', effect: { emotion: 'tender', amt: 0.3 } },
        ],
      },
      {
        id: 'stop',
        speaker: 'ELDER',
        text: 'Collect the peace nodes. Each one strengthens the pattern. It is slow work — but the only work that matters.',
        options: [{ label: 'I understand.', next: 'end', effect: { emotion: 'hope', amt: 0.4 } }],
      },
      {
        id: 'others',
        speaker: 'ELDER',
        text: 'The Seer remains in the Temple of Sigils. And a young one called Spark wanders the Forest still.',
        options: [{ label: 'I will find them.', next: 'end', effect: { emotion: 'hope', amt: 0.3 } }],
      },
      {
        id: 'quiet',
        speaker: 'ELDER',
        text: '...Your silence speaks compassion. That alone is healing.',
        options: [{ label: '...', next: 'end', effect: { emotion: 'tender', amt: 0.5 } }],
      },
      { id: 'end', speaker: null, text: null, options: [] },
    ],
  },
  {
    id: 'seer',
    symbol: '◉',
    color: '#88aaff',
    name: 'THE SEER',
    zone: 'temple',
    preferX: 3, preferY: 13,
    dialogue: [
      {
        id: 'start',
        speaker: 'SEER',
        text: 'Each sigil you decode restores one fragment of the original pattern. Do you read the old signs?',
        options: [
          { label: 'Teach me.', next: 'teach' },
          { label: 'I know some.', next: 'know', effect: { emotion: 'pride', amt: 0.2 } },
          { label: 'Not yet.', next: 'not_yet' },
        ],
      },
      {
        id: 'teach',
        speaker: 'SEER',
        text: 'The circle ◈ is presence. The triangle ▼ is descent. The star ✦ is integration. Read the grid as language.',
        options: [{ label: 'I will remember.', next: 'end', effect: { emotion: 'curiosity', amt: 0.6 } }],
      },
      {
        id: 'know',
        speaker: 'SEER',
        text: 'Then you carry the elder knowledge. Use it.',
        options: [{ label: 'I will.', next: 'end' }],
      },
      {
        id: 'not_yet',
        speaker: 'SEER',
        text: 'Then learn by walking. Every tile has meaning. You will understand in time.',
        options: [{ label: 'Thank you.', next: 'end', effect: { emotion: 'hope', amt: 0.2 } }],
      },
      { id: 'end', speaker: null, text: null, options: [] },
    ],
  },
  {
    id: 'spark',
    symbol: '⚡',
    color: '#ffff44',
    name: 'SPARK',
    zone: 'forest',
    preferX: 3, preferY: 3,
    dialogue: [
      {
        id: 'start',
        speaker: 'SPARK',
        text: 'Oh! Another one who can still walk through the Glitch! I thought I was the last!',
        options: [
          { label: 'You are not alone.', next: 'alone', effect: { emotion: 'joy', amt: 0.7 } },
          { label: 'What have you found out there?', next: 'found' },
        ],
      },
      {
        id: 'alone',
        speaker: 'SPARK',
        text: '...Thank you. I needed to hear that. The forest still sings, you know. If you listen, really listen.',
        options: [{ label: '[Listen]', next: 'end', effect: { emotion: 'tender', amt: 0.5 } }],
      },
      {
        id: 'found',
        speaker: 'SPARK',
        text: 'The center of the map — the Convergence Point — has more peace nodes than anywhere else. But it is surrounded by the Void Edge.',
        options: [{ label: 'Good to know.', next: 'end' }],
      },
      { id: 'end', speaker: null, text: null, options: [] },
    ],
  },
  {
    id: 'healer',
    symbol: '✚',
    color: '#88ffaa',
    name: 'THE HEALER',
    zone: 'village',
    preferX: 14, preferY: 5,
    dialogue: [
      {
        id: 'start',
        speaker: 'HEALER',
        text: 'I can strengthen your life force — but I need herbs from the forest first. Bring me four and I will do what I can.',
        options: [
          { label: 'I will gather them.', next: 'end', effect: { emotion: 'hope', amt: 0.3 } },
          { label: 'Are you well yourself?', next: 'self' },
        ],
      },
      {
        id: 'self',
        speaker: 'HEALER',
        text: 'Healing others IS my wellbeing. Do not worry for me.',
        options: [{ label: 'Understood.', next: 'end', effect: { emotion: 'tender', amt: 0.2 } }],
      },
      { id: 'end', speaker: null, text: null, options: [] },
    ],
  },
  {
    id: 'guardian',
    symbol: '⚔',
    color: '#ff8844',
    name: 'THE GUARDIAN',
    zone: 'void_edge',
    preferX: 14, preferY: 14,
    dialogue: [
      {
        id: 'start',
        speaker: 'GUARDIAN',
        text: 'The Void Edge tests those who dare enter. Prove yourself: collect three peace nodes before the sand runs out.',
        options: [
          { label: 'I accept the trial.', next: 'end', effect: { emotion: 'pride', amt: 0.3 } },
          { label: 'Why this test?', next: 'why' },
        ],
      },
      {
        id: 'why',
        speaker: 'GUARDIAN',
        text: 'Only the swiftest of spirit can reclaim what the Glitch devours. Speed IS compassion here.',
        options: [{ label: 'I understand.', next: 'end', effect: { emotion: 'hope', amt: 0.2 } }],
      },
      { id: 'end', speaker: null, text: null, options: [] },
    ],
  },
];

const INTRO_DIALOGUE = [
  {
    id: 'start',
    speaker: 'GUIDE',
    text: 'You wake in the pattern-space. Something fractured the grid.',
    options: [
      { label: 'What happened here?', next: 'explain' },
      { label: 'I remember... pieces.', next: 'memory', effect: { emotion: 'grief', amt: 0.3 } },
      { label: '[Stay silent]', next: 'silent', effect: { emotion: 'tender', amt: 0.2 } },
    ],
  },
  {
    id: 'explain',
    speaker: 'GUIDE',
    text: 'The Glitch spread. Peace nodes scattered. You carry the pattern that can restore them.',
    options: [
      { label: 'I will restore it.', next: 'end_intro', effect: { emotion: 'hope', amt: 0.5 } },
    ],
  },
  {
    id: 'memory',
    speaker: 'GUIDE',
    text: 'Memory is the first thing the Glitch steals. But not all of it — you still carry the feeling.',
    options: [
      { label: 'What do I do now?', next: 'end_intro', effect: { emotion: 'hope', amt: 0.3 } },
    ],
  },
  {
    id: 'silent',
    speaker: 'GUIDE',
    text: 'The silence speaks. I understand. When you are ready, the grid will answer.',
    options: [
      { label: '...', next: 'end_intro', effect: { emotion: 'tender', amt: 0.4 } },
    ],
  },
  {
    id: 'end_intro',
    speaker: null,
    text: null,
    options: [],
  },
];

// ─── Sample Quest ──────────────────────────────────────────────────────────────
const SAMPLE_QUESTS = [
  {
    id: 'restore_peace',
    title: 'Restore the Pattern',
    description: 'Collect all peace nodes on level 1.',
    objectives: [{ type: 'collect_peace', target: 1 }],
    reward: { score: 300, insight: 1, emotion: { joy: 0.8 } },
    completed: false,
  },
  {
    id: 'first_challenge',
    title: 'Open Your Mind',
    description: 'Complete your first learning challenge.',
    objectives: [{ type: 'complete_challenge', target: 1 }],
    reward: { score: 150, insight: 2, emotion: { hope: 0.5 } },
    completed: false,
  },
  // ── Phase 2 Quests ──────────────────────────────────────────────────────────
  {
    id: 'elders_mission',
    title: "Elder's Mission",
    description: 'Find the Temple of Echoes — collect 5 SHRINE tiles.',
    objectives: [{ type: 'collect_shrine', target: 5 }],
    reward: { score: 500, insight: 2, emotion: { hope: 0.6 } },
    completed: false,
  },
  {
    id: 'seers_vision',
    title: "Seer's Vision",
    description: 'Collect all SIGIL tiles on this level to unlock the sigil library.',
    objectives: [{ type: 'collect_sigil', target: 3 }],
    reward: { score: 400, insight: 3, emotion: { curiosity: 0.8 } },
    completed: false,
  },
  {
    id: 'sparks_discovery',
    title: "Spark's Discovery",
    description: 'Spark reveals a hidden map section — collect 3 PEACE nodes.',
    objectives: [{ type: 'collect_peace', target: 3 }],
    reward: { score: 250, insight: 1, emotion: { joy: 0.5 } },
    completed: false,
  },
  {
    id: 'healers_request',
    title: "Healer's Request",
    description: 'Bring 4 HERB items to the Healer for a max HP reward.',
    objectives: [{ type: 'collect_herb', target: 4 }],
    reward: { score: 350, insight: 1, emotion: { tender: 0.7 }, maxHp: 20 },
    completed: false,
  },
  {
    id: 'guardians_trial',
    title: "Guardian's Trial",
    description: 'Collect 3 PEACE nodes within 30 seconds!',
    objectives: [{ type: 'timed_peace', target: 3, timeLimit: 30 }],
    reward: { score: 600, insight: 2, emotion: { pride: 0.9 } },
    completed: false,
    _timerActive: false,
    _timerStart: 0,
    _timedCount: 0,
  },
];

// ─── RPGMode Class ─────────────────────────────────────────────────────────────
export default class RPGMode extends GameMode {
  constructor() {
    super();
    this.name = 'RPG Adventure';
    this.type = 'rpg';

    // Character stats
    this.stats = { ...BASE_STATS };

    // Dialogue state
    this._dialogueActive = false;
    this._dialogueTree = null;
    this._currentNodeId = null;
    this._dialogueSel = 0;

    // Quest log
    this._quests = SAMPLE_QUESTS.map(q => ({ ...q, completed: false }));
    this._questProgress = {};

    // Intro shown?
    this._introShown = false;

    // RPG live walkable grid
    this._rpgState        = null;
    this._shadowEnemies   = [];
    this._shadowMoveAccMs = 0;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  init(gameState, canvas, ctx) {
    console.log('[RPGMode] Initializing RPG mode — dialogue, quests, stats, shadow enemies active');
    this.canvas = canvas;
    this.ctx = ctx;

    // Carry progression from shared gameState
    this.stats.wisdom   = Math.min(10, 1 + Math.floor((gameState.level || 1) / WISDOM_GROWTH_DIVISOR));
    this.stats.clarity  = Math.min(10, 1 + Math.floor((gameState.level || 1) / CLARITY_GROWTH_DIVISOR));

    // Show intro dialogue on first entry
    if (!this._introShown) {
      this._introShown = true;
      this._startDialogue(INTRO_DIALOGUE, 'start', gameState);
    }

    gameState.modeState = {
      modeName: this.name,
      stats: this.stats,
      quests: this._quests,
    };

    // Build the live walkable RPG grid
    this._initRpgGrid(gameState);
  }

  update(gameState, deltaTime) {
    // While dialogue is active, block normal gameplay
    if (this._dialogueActive) return;

    // Quest tracking — peace collection
    const peaceCollected = gameState.peaceCollected || 0;
    this._checkQuestProgress('restore_peace', 'collect_peace', peaceCollected, gameState);
    this._checkQuestProgress('sparks_discovery', 'collect_peace', peaceCollected, gameState);

    // Quest tracking — learning challenges
    const challengesComplete = gameState._totalChallengesCompleted || 0;
    this._checkQuestProgress('first_challenge', 'complete_challenge', challengesComplete, gameState);

    // Phase 2 quest tracking
    this._checkQuestProgress('elders_mission', 'collect_shrine', gameState._shrineCount || 0, gameState);
    this._checkQuestProgress('seers_vision', 'collect_sigil', gameState._sigilCount || 0, gameState);
    this._checkQuestProgress('healers_request', 'collect_herb', gameState._herbCount || 0, gameState);
    this._checkGuardiansTrial(gameState, deltaTime);

    // Advance shadow enemies on a timer
    this._shadowMoveAccMs += (deltaTime || 0);
    if (this._shadowMoveAccMs >= RPG_SHADOW_MOVE_MS) {
      this._shadowMoveAccMs -= RPG_SHADOW_MOVE_MS;
      this._moveShadows();
    }

    gameState.modeState = {
      modeName: this.name,
      stats: this.stats,
      quests: this._quests,
      dialogueActive: this._dialogueActive,
    };
  }

  handleInput(gameState, input) {
    // Dialogue navigation
    if (this._dialogueActive) {
      const node = this._currentNode();
      if (!node || !node.options.length) return;

      if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('w') || input.isKeyPressed('W')) {
        this._dialogueSel = Math.max(0, this._dialogueSel - 1);
      }
      if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('s') || input.isKeyPressed('S')) {
        this._dialogueSel = Math.min(node.options.length - 1, this._dialogueSel + 1);
      }
      if (input.isKeyPressed('Enter') || input.isKeyPressed(' ')) {
        this._selectDialogueOption(gameState);
      }
      return;
    }

    // Normal grid movement — apply stat-based outcome modifiers
    // Clarity stat extends how far ahead traps are "sensed" (stored on gameState for grid renderer)
    gameState._rpgClarityRange = 1 + Math.floor(this.stats.clarity / 2);
    // Resilience stat reduces hazard damage (applied as a multiplier stored for takeDamage)
    gameState._rpgResilienceMul = Math.max(0.2, 1 - (this.stats.resilience - 1) * 0.1);
    // Wisdom stat grants bonus insight tokens on learning challenges
    gameState._rpgWisdomBonus = Math.floor(this.stats.wisdom / 3);

    // Move the RPG grid player
    const dir = input.getDirectionalInput ? input.getDirectionalInput() : { x: 0, y: 0 };
    if (dir.x !== 0 || dir.y !== 0) {
      this._moveRpgPlayer(dir.x, dir.y, gameState);
    }
  }

  render(gameState, ctx) {
    const theme = getDreamscapeTheme(gameState.currentDreamscape || 'LODGE');
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = theme.bg || '#0d0d18';
    ctx.fillRect(0, 0, w, h);
    if (theme.ambient) {
      ctx.fillStyle = theme.ambient;
      ctx.fillRect(0, 0, w, h);
    }

    // Dark overlay for RPG atmosphere — keep subtle so grid is visible
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, h);

    // ── Live walkable RPG grid ───────────────────────────────────────────
    const ts      = Math.floor((h - RPG_TOP_OFFSET - RPG_BOT_OFFSET) / RPG_GRID_SIZE);
    const gridPxW = ts * RPG_GRID_SIZE;
    const gx      = Math.floor((w - gridPxW) / 2);
    this._renderRpgGrid(ctx, gx, RPG_TOP_OFFSET, ts);

    // Thin additional scrim so text overlays stay fully legible
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, w, h);

    // ── Stats panel (top-left) ──────────────────────────────────────────
    const stats = this.stats;
    const statLabels = [
      ['STR', stats.strength,  '#ff6666'],
      ['WIS', stats.wisdom,    '#ffdd88'],
      ['EMP', stats.empathy,   '#88ffcc'],
      ['RES', stats.resilience,'#aaffaa'],
      ['CLR', stats.clarity,   '#88ccff'],
    ];
    ctx.font = '10px Courier New';
    ctx.textAlign = 'left';
    statLabels.forEach(([label, val, col], i) => {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(10, 10 + i * 18, 80, 16);
      ctx.fillStyle = col;
      ctx.fillText(`${label} ${val}`, 14, 22 + i * 18);
    });

    // ── Mode banner ────────────────────────────────────────────────────
    ctx.fillStyle = theme.accent || '#00ff88';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.shadowColor = theme.accent || '#00ff88';
    ctx.shadowBlur = 8;
    ctx.fillText('⚔  RPG ADVENTURE  ⚔', w / 2, 28);
    ctx.shadowBlur = 0;

    // ── Level / XP info ────────────────────────────────────────────────
    const lvl  = gameState.level || 1;
    const xp   = (gameState.score || 0);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '12px Courier New';
    ctx.fillText(`Level ${lvl}  ·  XP: ${xp}`, w / 2, 50);

    // ── Peace collection progress bar (just above dialogue) ───────────
    if (this._rpgState) {
      const pct  = this._rpgState.peaceTotal > 0
        ? this._rpgState.peaceCollected / this._rpgState.peaceTotal : 0;
      const barW = Math.floor(w * 0.40);
      const barX = Math.floor((w - barW) / 2);
      const barY = h - RPG_BOT_OFFSET + 8;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, 8);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(barX, barY, Math.floor(barW * pct), 8);
      ctx.fillStyle = '#445566';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(`◈ ${this._rpgState.peaceCollected}/${this._rpgState.peaceTotal}  peace nodes`, w / 2, barY + 20);
      ctx.textAlign = 'left';
    }

    // Render dialogue overlay if active
    if (this._dialogueActive) {
      this._renderDialogue(ctx);
    }

    // Render quest log (top-right corner)
    this._renderQuestLog(ctx);
  }

  // ── Dialogue System ──────────────────────────────────────────────────────────

  _startDialogue(tree, startId, gameState) {
    this._dialogueActive = true;
    this._dialogueTree = tree;
    this._currentNodeId = startId;
    this._dialogueSel = 0;
    gameState._dialogueActive = true;
  }

  _currentNode() {
    if (!this._dialogueTree) return null;
    return this._dialogueTree.find(n => n.id === this._currentNodeId) || null;
  }

  _selectDialogueOption(gameState) {
    const node = this._currentNode();
    if (!node || !node.options.length) return;

    const chosen = node.options[this._dialogueSel];

    // Apply emotional effect from choice
    if (chosen.effect && gameState.emotionalField?.add) {
      gameState.emotionalField.add(chosen.effect.emotion, chosen.effect.amt ?? DEFAULT_EMOTION_EFFECT);
    }

    // Advance to next node
    const next = chosen.next;
    const nextNode = this._dialogueTree.find(n => n.id === next);
    if (!nextNode || nextNode.text === null) {
      // End of branch — close dialogue
      this._dialogueActive = false;
      gameState._dialogueActive = false;
      // Mark NPC as talked-to so dialogue doesn't auto-retrigger immediately
      if (this._currentNPC) {
        this._currentNPC.dialogueDone = true;
        // Re-enable after 8s so player can revisit
        const npc = this._currentNPC;
        setTimeout(() => { npc.dialogueDone = false; }, 8000);
        this._currentNPC = null;
      }
      return;
    }
    this._currentNodeId = next;
    this._dialogueSel = 0;
  }

  _renderDialogue(ctx) {
    const node = this._currentNode();
    if (!node || node.text === null) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const boxW = w * 0.84;
    const boxH = 170;
    const bx = (w - boxW) / 2;
    const by = h - boxH - 24;

    // Box background
    ctx.fillStyle = 'rgba(5,5,20,0.94)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = '#334466';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    // Speaker name
    if (node.speaker) {
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(node.speaker, bx + 14, by + 22);
    }

    // Dialogue text
    ctx.fillStyle = '#ccd6ee';
    ctx.font = '13px Courier New';
    ctx.fillText(node.text, bx + 14, by + 46);

    // Options
    node.options.forEach((opt, i) => {
      const isSelected = i === this._dialogueSel;
      ctx.fillStyle = isSelected ? '#00ff88' : '#667099';
      ctx.font = isSelected ? 'bold 12px Courier New' : '12px Courier New';
      ctx.fillText(`${isSelected ? '▶ ' : '  '}${opt.label}`, bx + 24, by + 80 + i * 22);
    });

    ctx.fillStyle = '#334466';
    ctx.font = '9px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText('↑/↓ select · ENTER choose', bx + boxW - 10, by + boxH - 8);
    ctx.textAlign = 'left';
  }

  // ── Quest System ─────────────────────────────────────────────────────────────

  _checkQuestProgress(questId, objectiveType, currentValue, gameState) {
    const quest = this._quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    const obj = quest.objectives.find(o => o.type === objectiveType);
    if (!obj) return;

    if (currentValue >= obj.target) {
      quest.completed = true;
      // Apply reward
      if (quest.reward.score) gameState.score = (gameState.score || 0) + quest.reward.score;
      if (quest.reward.insight) gameState.insightTokens = (gameState.insightTokens || 0) + quest.reward.insight;
      if (quest.reward.emotion && gameState.emotionalField?.add) {
        for (const [emo, amt] of Object.entries(quest.reward.emotion)) {
          gameState.emotionalField.add(emo, amt);
        }
      }
      // Max HP reward (Healer's Request)
      if (quest.reward.maxHp && gameState.player) {
        gameState.player.maxHp = (gameState.player.maxHp || 100) + quest.reward.maxHp;
        gameState.player.hp   = Math.min(gameState.player.hp || 0, gameState.player.maxHp);
      }
      // Stat growth on quest completion
      this.stats.wisdom = Math.min(10, this.stats.wisdom + 1);
      gameState._questCompleted = quest.title;
    }
  }

  _checkGuardiansTrial(gameState, deltaTime) {
    const quest = this._quests.find(q => q.id === 'guardians_trial');
    if (!quest || quest.completed) return;

    const obj = quest.objectives[0];
    const peaceCollected = gameState.peaceCollected || 0;

    // Start the timer on the first peace node collected (once per attempt)
    if (!quest._timerActive && peaceCollected > (quest._baseCount || 0)) {
      quest._timerActive = true;
      quest._timerStart = Date.now();
      quest._baseCount = peaceCollected - 1; // count from just before this node
    }

    if (quest._timerActive) {
      const elapsed = (Date.now() - quest._timerStart) / 1000;
      const gained = peaceCollected - quest._baseCount;
      if (gained >= obj.target) {
        // Mark complete by faking the target for the generic checker
        const q2 = { ...quest, objectives: [{ type: 'timed_peace', target: obj.target }] };
        quest.completed = true;
        if (quest.reward.score) gameState.score = (gameState.score || 0) + quest.reward.score;
        if (quest.reward.insight) gameState.insightTokens = (gameState.insightTokens || 0) + quest.reward.insight;
        if (quest.reward.emotion && gameState.emotionalField?.add) {
          for (const [emo, amt] of Object.entries(quest.reward.emotion)) {
            gameState.emotionalField.add(emo, amt);
          }
        }
        this.stats.wisdom = Math.min(10, this.stats.wisdom + 1);
        gameState._questCompleted = quest.title;
      } else if (elapsed > obj.timeLimit) {
        // Trial failed — reset for retry
        quest._timerActive = false;
        quest._baseCount = peaceCollected; // new baseline for next attempt
        gameState._questFailed = "Guardian's Trial — time ran out!";
      }
    }
  }

  _renderQuestLog(ctx) {
    const active = this._quests.filter(q => !q.completed);
    if (!active.length) return;

    const x = this.canvas.width - 190;
    const y = 62; // below mode banner, avoid overlap
    const panelH = 18 + active.length * 18;
    ctx.fillStyle = 'rgba(5,5,20,0.88)';
    ctx.fillRect(x, y, 180, panelH);
    ctx.strokeStyle = 'rgba(0,255,136,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 180, panelH);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('📋 QUESTS', x + 6, y + 12);
    active.forEach((q, i) => {
      ctx.fillStyle = '#88ffcc';
      ctx.fillText(`◇ ${q.title}`, x + 6, y + 28 + i * 18);
    });
    ctx.textAlign = 'left';
  }

  // ── RPG Grid System ──────────────────────────────────────────────────────────

  /**
   * Create a fresh local RPG grid state and populate it with generateGrid().
   * Uses a private _rpgState so it never touches the shared gameState grid.
   */
  _initRpgGrid(gameState) {
    this._rpgState = {
      grid: [],
      player: { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈' },
      enemies: [],
      particles: [],
      gridSize: RPG_GRID_SIZE,
      peaceNodes: [],
      peaceCollected: 0,
      peaceTotal: 0,
      settings: { difficulty: gameState.settings?.difficulty || 'normal' },
      level: gameState.level || 1,
      playMode: 'ARCADE',   // avoid DAILY seed in RPG world
      hazardMul: 0.6,       // gentler world
      peaceMul: 1.2,
    };
    generateGrid(this._rpgState);

    // Place NPCs at their preferred positions (or nearest VOID cell)
    this._npcs = NPC_DATA.map(npc => {
      let px = npc.preferX, py = npc.preferY;
      // Find a walkable cell near the preferred position
      for (let r = 0; r <= 4; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = Math.max(0, Math.min(RPG_GRID_SIZE - 1, px + dx));
            const ny = Math.max(0, Math.min(RPG_GRID_SIZE - 1, py + dy));
            if (this._rpgState.grid[ny]?.[nx] === T.VOID) {
              px = nx; py = ny;
              break;
            }
          }
        }
      }
      return { ...npc, x: px, y: py, dialogueDone: false };
    });

    // Set current zone
    this._currentZone = null;
    this._updateCurrentZone(1, 1);

    // Spawn wandering glitch-spirit enemies away from spawn point and NPCs
    this._shadowEnemies = [];
    for (let i = 0; i < RPG_SHADOW_COUNT; i++) {
      let ex, ey, attempts = 0;
      do {
        ex = Math.floor(Math.random() * RPG_GRID_SIZE);
        ey = Math.floor(Math.random() * RPG_GRID_SIZE);
        attempts++;
      } while (
        attempts < 80 && (
          this._rpgState.grid[ey]?.[ex] !== T.VOID ||
          Math.abs(ex - 1) + Math.abs(ey - 1) < RPG_MIN_SPAWN_DIST ||
          this._npcs.some(n => Math.abs(n.x - ex) + Math.abs(n.y - ey) < 3)
        )
      );
      const enemyHp = 15 + i * 5;
      this._shadowEnemies.push({ x: ex, y: ey, maxHp: enemyHp, hp: enemyHp });
    }
  }

  /** Update which named zone the player is in; show message on zone entry */
  _updateCurrentZone(px, py) {
    const zone = RPG_ZONES.find(z => px >= z.x1 && px <= z.x2 && py >= z.y1 && py <= z.y2)
                 || RPG_ZONES[4]; // fallback to center
    if (!this._currentZone || this._currentZone.id !== zone.id) {
      this._currentZone = zone;
      this._zoneMsg = { text: zone.name, desc: zone.desc, shownAtMs: Date.now(), durationMs: 2500 };
    }
  }

  /**
   * Move the RPG player one step and apply tile effects.
   */
  _moveRpgPlayer(dx, dy, gameState) {
    if (!this._rpgState) return;
    const st  = this._rpgState;
    const nx  = st.player.x + dx;
    const ny  = st.player.y + dy;

    if (nx < 0 || nx >= RPG_GRID_SIZE || ny < 0 || ny >= RPG_GRID_SIZE) return;
    const tile = st.grid[ny]?.[nx];
    const def  = TILE_DEF[tile];
    if (!def || def.solid) return;

    st.player.x = nx;
    st.player.y = ny;

    // Zone transition check
    this._updateCurrentZone(nx, ny);

    // NPC proximity: auto-trigger dialogue if player steps adjacent to an NPC
    if (this._npcs && !this._dialogueActive) {
      for (const npc of this._npcs) {
        if (!npc.dialogueDone && Math.abs(npc.x - nx) + Math.abs(npc.y - ny) <= 1) {
          this._startDialogue(npc.dialogue, 'start', gameState);
          this._currentNPC = npc;
          break;
        }
      }
    }

    // Hazard: apply resilience-reduced damage to shared player HP
    if (def.d > 0) {
      const dmg = Math.max(1, Math.round(def.d * (gameState._rpgResilienceMul ?? 1)));
      gameState.player.hp = Math.max(0, (gameState.player.hp || 100) - dmg);
      if (gameState.player.hp <= 0 && gameState.state !== 'GAME_OVER') {
        gameState.state    = 'GAME_OVER';
        gameState._gameOverAt = Date.now();
      }
    }

    // Collect peace node
    if (tile === T.PEACE) {
      st.grid[ny][nx] = T.VOID;
      st.peaceCollected++;
      const bonus = 100 * (1 + this.stats.wisdom);
      gameState.score = (gameState.score || 0) + bonus;
      gameState.peaceCollected = (gameState.peaceCollected || 0) + 1;
      this._checkQuestProgress('restore_peace', 'collect_peace', gameState.peaceCollected, gameState);
      try { window.AudioManager?.play('peace'); } catch (_) {}

      // All peace nodes collected → advance level
      if (st.peaceCollected >= st.peaceTotal) {
        gameState.level = (gameState.level || 1) + 1;
        // Wisdom grows cumulatively (persistent stat); clarity recalculates
        // from level (tracking cognitive range as a level-derived capability).
        this.stats.wisdom   = Math.min(10, this.stats.wisdom + 1 + Math.floor(gameState.level / WISDOM_GROWTH_DIVISOR));
        this.stats.clarity  = Math.min(10, 1 + Math.floor(gameState.level / CLARITY_GROWTH_DIVISOR));
        this._initRpgGrid(gameState);
      }
    }

    // Collect insight token
    if (tile === T.INSIGHT) {
      st.grid[ny][nx] = T.VOID;
      const tokens = 1 + (gameState._rpgWisdomBonus ?? 0);
      gameState.insightTokens = (gameState.insightTokens || 0) + tokens;
      gameState._totalChallengesCompleted = (gameState._totalChallengesCompleted || 0) + 1;
      this._checkQuestProgress('first_challenge', 'complete_challenge', gameState._totalChallengesCompleted, gameState);
    }

    // Collect archetype tile → strength + empathy gain
    if (tile === T.ARCH) {
      st.grid[ny][nx] = T.VOID;
      this.stats.strength = Math.min(10, this.stats.strength + 1);
      this.stats.empathy  = Math.min(10, this.stats.empathy  + 1);
    }

    // Check shadow-enemy collision
    for (const e of this._shadowEnemies) {
      if (e.x === nx && e.y === ny) {
        const dmg = Math.max(2, Math.round(8 * (gameState._rpgResilienceMul ?? 1)));
        gameState.player.hp = Math.max(0, (gameState.player.hp || 100) - dmg);
      }
    }
  }

  /**
   * Advance each shadow enemy one step (70% chase, 30% random).
   */
  _moveShadows() {
    if (!this._rpgState) return;
    const st = this._rpgState;
    const px = st.player.x;
    const py = st.player.y;
    const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];

    for (const e of this._shadowEnemies) {
      let dx = 0, dy = 0;
      if (Math.random() < 0.7) {
        // Chase player
        if (Math.abs(px - e.x) >= Math.abs(py - e.y)) dx = px > e.x ? 1 : -1;
        else                                            dy = py > e.y ? 1 : -1;
      } else {
        [dx, dy] = DIRS[Math.floor(Math.random() * 4)];
      }
      const nx = e.x + dx;
      const ny = e.y + dy;
      if (nx >= 0 && nx < RPG_GRID_SIZE && ny >= 0 && ny < RPG_GRID_SIZE) {
        const def = TILE_DEF[st.grid[ny]?.[nx]];
        if (def && !def.solid) { e.x = nx; e.y = ny; }
      }
    }
  }

  /**
   * Render the live RPG grid tiles, shadow enemies, and player.
   */
  _renderRpgGrid(ctx, gx, gy, ts) {
    if (!this._rpgState || ts < 1) return;
    const st  = this._rpgState;
    const now = Date.now();

    ctx.save();
    for (let y = 0; y < RPG_GRID_SIZE; y++) {
      for (let x = 0; x < RPG_GRID_SIZE; x++) {
        const tile = st.grid[y]?.[x];
        const def  = TILE_DEF[tile] ?? TILE_DEF[0];
        const px   = gx + x * ts;
        const py   = gy + y * ts;

        ctx.fillStyle = def.bg || '#060612';
        ctx.fillRect(px, py, ts, ts);

        ctx.strokeStyle = def.bd || 'rgba(255,255,255,0.05)';
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(px, py, ts, ts);

        if (def.sy && ts > 8) {
          if (tile === T.PEACE) {
            const pulse = 0.65 + 0.35 * Math.sin(now / 700 + x + y);
            ctx.globalAlpha  = pulse;
            ctx.shadowColor  = def.g || '#00ffcc';
            ctx.shadowBlur   = 6;
          }
          ctx.fillStyle    = def.g || def.bd || '#fff';
          ctx.font         = `${Math.floor(ts * 0.55)}px monospace`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.sy, px + ts / 2, py + ts / 2);
          ctx.shadowBlur   = 0;
          ctx.globalAlpha  = 1;
        }
      }
    }

    // Shadow enemies
    for (const e of this._shadowEnemies) {
      const ex = gx + e.x * ts + ts / 2;
      const ey = gy + e.y * ts + ts / 2;
      ctx.shadowColor  = '#aa00ff';
      ctx.shadowBlur   = 8;
      ctx.fillStyle    = '#7722bb';
      ctx.beginPath();
      ctx.arc(ex, ey, ts * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur   = 0;
      ctx.fillStyle    = '#dd88ff';
      ctx.font         = `${Math.floor(ts * 0.38)}px monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◌', ex, ey);
    }

    // NPCs — render with their unique color + symbol + name label
    if (this._npcs) {
      const npPulse = 0.7 + 0.3 * Math.sin(now / 800);
      for (const npc of this._npcs) {
        const nx2 = gx + npc.x * ts + ts / 2;
        const ny2 = gy + npc.y * ts + ts / 2;
        // Glow
        ctx.save();
        ctx.globalAlpha = npPulse;
        ctx.shadowColor = npc.color || '#ffdd88';
        ctx.shadowBlur  = 10;
        ctx.fillStyle   = npc.color || '#ffdd88';
        ctx.font        = `bold ${Math.floor(ts * 0.6)}px monospace`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.symbol || '⊕', nx2, ny2);
        ctx.shadowBlur  = 0;
        // Name tag above (only if tile size allows)
        if (ts > 12) {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          const tagW = Math.min(55, npc.name.length * 5.5 + 6);
          ctx.fillRect(nx2 - tagW / 2, ny2 - ts - 12, tagW, 12);
          ctx.fillStyle = npc.color || '#ffdd88';
          ctx.font = `7px Courier New`;
          ctx.fillText(npc.name.slice(0, 10), nx2, ny2 - ts - 4);
        }
        ctx.restore();
      }
    }

    // Player
    const plx  = gx + st.player.x * ts + ts / 2;
    const ply  = gy + st.player.y * ts + ts / 2;
    const glow = 0.78 + 0.22 * Math.sin(now / 500);
    ctx.globalAlpha  = glow;
    ctx.shadowColor  = '#00ff88';
    ctx.shadowBlur   = 14;
    ctx.fillStyle    = '#00ff88';
    ctx.font         = `bold ${Math.floor(ts * 0.65)}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', plx, ply);
    ctx.shadowBlur   = 0;
    ctx.globalAlpha  = 1;

    ctx.restore();

    // Zone name overlay (bottom of grid, fades in/out)
    if (this._zoneMsg) {
      const zm = this._zoneMsg;
      const age = Date.now() - zm.shownAtMs;
      if (age < zm.durationMs) {
        const alpha = age < 400
          ? age / 400
          : Math.max(0, 1 - (age - zm.durationMs + 600) / 600);
        const w = ctx.canvas.width;
        const zoneY = gy + RPG_GRID_SIZE * ts + 10;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(gx, zoneY, ts * RPG_GRID_SIZE, 30);
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 13px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(zm.text, w / 2, zoneY + 12);
        ctx.fillStyle = '#558899';
        ctx.font = '9px Courier New';
        ctx.fillText(zm.desc, w / 2, zoneY + 25);
        ctx.restore();
      } else {
        this._zoneMsg = null;
      }
    }
  }
}
