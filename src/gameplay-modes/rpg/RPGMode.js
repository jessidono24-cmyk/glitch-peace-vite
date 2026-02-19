/**
 * RPGMode.js — Phase M5: Role-Playing Game Mode (Skeleton)
 *
 * Narrative-driven gameplay with dialogue trees, character stats,
 * and quest objectives. Builds on the emotional engine for branching
 * outcomes tied to the player's emotional state.
 *
 * README status: 📋 Planned — scaffold in place, not yet active.
 */

import GameMode from '../../core/interfaces/GameMode.js';
import { getDreamscapeTheme } from '../../systems/dreamscapes.js';

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

// ─── Sample Dialogue Tree ─────────────────────────────────────────────────────
// Each node: { id, speaker, text, options: [{ label, next, effect }] }
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
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  init(gameState, canvas, ctx) {
    console.log('[RPGMode] Initializing RPG mode (Phase M5 skeleton)');
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
  }

  update(gameState, deltaTime) {
    // While dialogue is active, block normal gameplay
    if (this._dialogueActive) return;

    // Quest tracking — peace collection
    const peaceCollected = gameState.peaceCollected || 0;
    this._checkQuestProgress('restore_peace', 'collect_peace', peaceCollected, gameState);

    // Quest tracking — learning challenges
    const challengesComplete = gameState._totalChallengesCompleted || 0;
    this._checkQuestProgress('first_challenge', 'complete_challenge', challengesComplete, gameState);

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

    // Dark overlay for RPG atmosphere
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
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

    // ── Active quest summary ───────────────────────────────────────────
    const activeQuests = this._quests.filter(q => !q.completed);
    if (activeQuests.length) {
      ctx.fillStyle = '#667099';
      ctx.font = '11px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(`▸ ${activeQuests[0].title}`, w / 2, h / 2 - 60);
      ctx.fillStyle = '#445566';
      ctx.font = '10px Courier New';
      ctx.fillText(activeQuests[0].description, w / 2, h / 2 - 44);
    }

    // ── Mode description ───────────────────────────────────────────────
    ctx.fillStyle = '#334455';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Narrative · Dialogue · Quests · Character Stats', w / 2, h / 2 + 10);
    ctx.fillStyle = '#222233';
    ctx.fillText('(Full RPG grid rendering activates in Phase M5)', w / 2, h / 2 + 30);
    ctx.fillStyle = '#445566';
    ctx.fillText('Press M to return to Grid mode', w / 2, h / 2 + 52);
    ctx.textAlign = 'left';

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
      // Stat growth on quest completion
      this.stats.wisdom = Math.min(10, this.stats.wisdom + 1);
      gameState._questCompleted = quest.title;
    }
  }

  _renderQuestLog(ctx) {
    const active = this._quests.filter(q => !q.completed);
    if (!active.length) return;

    const x = this.canvas.width - 180;
    const y = 10;
    ctx.fillStyle = 'rgba(5,5,20,0.75)';
    ctx.fillRect(x, y, 172, 18 + active.length * 18);
    ctx.fillStyle = '#445566';
    ctx.font = '9px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('QUESTS', x + 6, y + 12);
    active.forEach((q, i) => {
      ctx.fillStyle = '#667099';
      ctx.fillText(`◇ ${q.title}`, x + 6, y + 28 + i * 18);
    });
    ctx.textAlign = 'left';
  }
}
