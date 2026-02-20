// ═══════════════════════════════════════════════════════════════════════
//  ALCHEMY MODE — Hermetic Laboratory Grid Mode
//  Players collect elemental tiles and combine them at the Athanor
//  (crucible) to perform alchemical transmutations.
//
//  DESIGN PHILOSOPHY:
//  Alchemy is not about turning lead into gold — it is about turning
//  unconscious patterns into conscious understanding. The Philosopher's
//  Stone is self-knowledge. Each transmutation mirrors a psychological
//  operation described by Jung's "Psychology and Alchemy" (1944).
//
//  RESEARCH CITATIONS:
//  - Jung, C.G. (1944). Psychology and Alchemy. CW Vol 12.
//    "Alchemy is a projection of psychic transformation processes."
//  - Principe, L. (2013). The Secrets of Alchemy. Univ. of Chicago Press.
//    Historical synthesis of Paracelsian three-principles theory.
//  - Hillman, J. (1983). Healing Fiction. Station Hill Press.
//    Alchemical imagination as psychological healing practice.
//  - Paracelsus (1493–1541): Three Principles — Sulfur (Will/Soul),
//    Mercury (Mind/Fluidity), Salt (Body/Manifestation).
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';
import * as THREE from 'three';

// ── Elemental tile types ─────────────────────────────────────────────────
export const ELEMENTS = {
  FIRE:  { id: 'FIRE',  symbol: '🜂', name: 'Fire — Sulfur',    color: '#ff6622', bg: '#2a0800', glow: '#ff4400', desc: 'The ascending will. Active, outward, solar. Paracelsian Sulfur: spirit and soul.' },
  WATER: { id: 'WATER', symbol: '🜄', name: 'Water — Mercury',  color: '#22aaff', bg: '#001830', glow: '#00aaff', desc: 'The descending flow. Receptive, inward, lunar. Paracelsian Mercury: mind and transformation.' },
  EARTH: { id: 'EARTH', symbol: '🜃', name: 'Earth — Salt',     color: '#88aa44', bg: '#0a1800', glow: '#88cc44', desc: 'The crystallized body. The vessel that holds spirit and soul. Paracelsian Salt: body and manifestation.' },
  AIR:   { id: 'AIR',   symbol: '🜁', name: 'Air — Quintessence', color: '#ccddff', bg: '#0d1020', glow: '#aabbff', desc: 'The breath between worlds. Carrier of the other three. Prana, chi, pneuma — the animating force.' },
};

// ── Alchemical reactions ─────────────────────────────────────────────────
// Each reaction: inputs (sorted), result product, Jung/Paracelsus lore
export const REACTIONS = [
  {
    id: 'solutio',
    inputs: ['FIRE', 'WATER'],
    product: { symbol: '🜎', name: 'Solutio', color: '#44ffcc' },
    points: 300,
    statBoost: { clarity: 1 },
    lore: 'SOLUTIO — Dissolution. Fire meets Water and all rigid forms dissolve. In Jungian psychology: the ego releasing its grip, consciousness returning to the unconscious to be renewed. The relief after holding too tight.',
    audio: 'insight',
  },
  {
    id: 'calcinatio',
    inputs: ['FIRE', 'EARTH'],
    product: { symbol: '🜔', name: 'Calcinatio', color: '#ff8844' },
    points: 280,
    statBoost: { resilience: 1 },
    lore: 'CALCINATIO — Calcination. The burning away of impurities. In Jungian terms: the confrontation with shadow material — the parts of the self denied or repressed. Fire transforms Earth into ash; from ash, new life.',
    audio: 'insight',
  },
  {
    id: 'coagulatio',
    inputs: ['WATER', 'EARTH'],
    product: { symbol: '⚗', name: 'Coagulatio', color: '#aacc66' },
    points: 260,
    statBoost: { wisdom: 1 },
    lore: 'COAGULATIO — Coagulation. The return to form after dissolution — but a new, more refined form. Water and Earth create the vessel. Insight crystallized into embodied wisdom. The learning becomes the body.',
    audio: 'insight',
  },
  {
    id: 'sublimatio',
    inputs: ['AIR', 'EARTH'],
    product: { symbol: '🜇', name: 'Sublimatio', color: '#bbccff' },
    points: 320,
    statBoost: { clarity: 1 },
    lore: 'SUBLIMATIO — Sublimation. The dense rises to become subtle. Air carries Earth upward — the mundane becomes transcendent. In depth psychology: the transformation of base drives (aggression, desire) into creative energy.',
    audio: 'insight',
  },
  {
    id: 'sol',
    inputs: ['AIR', 'FIRE'],
    product: { symbol: '☉', name: 'Sol — Gold', color: '#ffdd44' },
    points: 500,
    statBoost: { wisdom: 2 },
    lore: 'SOL — Solar Gold. The perfected masculine principle: active consciousness, will expressed through clarity. The alchemical gold is not material wealth but the integrated, luminous Self. The center of the Jungian psyche made visible.',
    audio: 'level_complete',
  },
  {
    id: 'luna',
    inputs: ['AIR', 'WATER'],
    product: { symbol: '☽', name: 'Luna — Silver', color: '#ccddff' },
    points: 500,
    statBoost: { empathy: 2 },
    lore: 'LUNA — Lunar Silver. The perfected feminine principle: receptive consciousness, the witness that reflects. Silver does not generate light but transforms it. The anima/animus reconciled; the self that observes without judgment.',
    audio: 'level_complete',
  },
  {
    id: 'mercury_compound',
    inputs: ['FIRE', 'WATER', 'EARTH'],
    product: { symbol: '☿', name: 'Mercury Vivus', color: '#aa88ff' },
    points: 800,
    statBoost: { wisdom: 1, clarity: 1, resilience: 1 },
    lore: 'MERCURIUS VIVUS — Living Mercury. The threefold union of Sulfur (Fire), Mercury (Water), and Salt (Earth) — the three Paracelsian principles completing their cycle. The quicksilver that passes between all states: messenger between worlds, transformer of all it touches.',
    audio: 'archetype',
  },
  {
    id: 'philosophers_stone',
    inputs: ['FIRE', 'WATER', 'EARTH', 'AIR'],
    product: { symbol: '🜍', name: "Philosopher's Stone", color: '#ff88ff' },
    points: 2000,
    statBoost: { wisdom: 3, clarity: 3, resilience: 2, empathy: 2 },
    lore: "THE PHILOSOPHER'S STONE — The lapis philosophorum. The goal of the Great Work (Opus Magnum). Not a thing to be found, but a transformation to be undergone. Jung: 'The stone is a symbol of the Self — the unified psyche that has integrated its shadow, its anima/animus, and the collective unconscious.' You have completed the Great Work.",
    audio: 'alchemy_discover',
    levelComplete: true,
  },
];

// ── Athanor (crucible) tile ───────────────────────────────────────────────
const ATHANOR = { symbol: '⚗', color: '#aa6622', glow: '#dd8833' };

// ── Hermetic symbols for lab decoration ───────────────────────────────────
const HERMETIC_DECOR = ['☿', '☉', '☽', '♄', '♃', '♂', '♀'];

// ── Max inventory size ───────────────────────────────────────────────────
const MAX_INVENTORY = 4; // can hold up to all 4 elements simultaneously

// ── Element respawn timing ───────────────────────────────────────────────
const ELEMENT_RESPAWN_MIN_MS = 5000;
const ELEMENT_RESPAWN_RAND_MS = 5000; // + random(0, 5000)

// ── Level complete delays ────────────────────────────────────────────────
const LEVEL_COMPLETE_DELAY_STONE_MS = 3500;   // extra wait for Philosopher's Stone drama
const LEVEL_COMPLETE_DELAY_DEFAULT_MS = 800;

// ── Wisdom multiplier constants ──────────────────────────────────────────
const MAX_WISDOM_MULTIPLIER = 3;
const WISDOM_MULTIPLIER_FACTOR = 0.3; // +30% score per wisdom point above 1

// ── Alchemist stat labels ────────────────────────────────────────────────
const STAT_LABELS = {
  wisdom: 'WIS', clarity: 'CLR', resilience: 'RES', empathy: 'EMP',
};

/**
 * AlchemyMode — A transmutation laboratory.
 *
 * Grid layout:
 *   - Elemental tiles (FIRE/WATER/EARTH/AIR) scattered across the lab
 *   - Athanor (crucible) tiles where elements are combined
 *   - Hermetic decorative symbols (static, flavor-only)
 *   - Player moves to collect elements, then moves to crucible to combine
 *
 * Inventory mechanic:
 *   - Player can hold up to 4 elements simultaneously
 *   - Each collection step toward a reaction
 *   - Crucible triggers best available reaction from current inventory
 *
 * Learning:
 *   - Rare reactions (Sol, Luna, Mercury, Stone) show full lore overlay
 *   - All reactions show a brief banner with the compound name
 *
 * Consciousness connection:
 *   - Each element maps to a Jungian/Paracelsian psychological principle
 *   - Transmutation = psychological transformation
 *   - Philosopher's Stone = integration of the Self
 */
export class AlchemyMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'alchemy',
      name: 'Alchemy — The Great Work',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 160;
    this._labGrid = [];          // ELEMENT_KEY | 'ATHANOR' | 'DECOR' | 'EMPTY'
    this._decorSymbols = [];     // { x, y, symbol }
    this._athanors = [];         // { x, y }
    this._elementSpawns = [];    // { x, y, element, collected }
    this._inventory = [];        // array of ELEMENT keys (max MAX_INVENTORY)
    this._reactionFlash = null;  // { reaction, shownAtMs }
    this._loreShowing = null;    // { text, name, color, shownAtMs }
    this._alchemistStats = { wisdom: 1, clarity: 1, resilience: 1, empathy: 1 };
    this._totalTransmutations = 0;
    this._completedReactions = new Set();
    this._labParticles = [];     // { x, y, color, vx, vy, life, maxLife }

    // Three.js 3D beaker overlay
    this._3d = null;  // initialized lazily in init()
  }

  init(gameState, canvas, ctx) {
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
    this.canvas = canvas;
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    gameState.score = gameState.score || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = REACTIONS.length;
    this._inventory = [];
    this._alchemistStats = gameState._alchemistStats || { wisdom: 1, clarity: 1, resilience: 1, empathy: 1 };
    this._totalTransmutations = gameState._totalTransmutations || 0;
    this._completedReactions = gameState._completedReactions || new Set();
    this._labParticles = [];
    this._buildLab(gameState);
    // Initialize Three.js 3D beaker overlay (idempotent)
    this._init3D(canvas);
  }

  onResize(canvas, gameState) {
    if (!gameState) return;
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
  }

  _buildLab(gameState) {
    const sz = gameState.gridSize || 12;
    this._labGrid = [];
    this._athanors = [];
    this._elementSpawns = [];
    this._decorSymbols = [];

    // Empty grid
    for (let y = 0; y < sz; y++) {
      this._labGrid[y] = [];
      for (let x = 0; x < sz; x++) {
        this._labGrid[y][x] = 'EMPTY';
      }
    }

    const placed = new Set();
    const _mark = (x, y, type) => {
      this._labGrid[y][x] = type;
      placed.add(`${x},${y}`);
    };
    const _free = (x, y) => !placed.has(`${x},${y}`) && x > 0 && y > 0 && x < sz - 1 && y < sz - 1;

    // Place 1–2 Athanors (crucibles) — fixed positions, roughly centered
    const athanorPositions = [
      { x: Math.floor(sz / 2), y: Math.floor(sz / 2) },
      { x: Math.floor(sz / 2) + 2, y: Math.floor(sz / 2) - 1 },
    ];
    const athanorCount = gameState.level > 3 ? 2 : 1;
    for (let i = 0; i < athanorCount; i++) {
      const { x, y } = athanorPositions[i];
      if (_free(x, y)) {
        _mark(x, y, 'ATHANOR');
        this._athanors.push({ x, y });
      }
    }

    // Place elemental spawns — 3 of each element scaled by level
    const eleCount = Math.min(4, 2 + Math.floor(gameState.level * 0.4));
    const eleKeys = Object.keys(ELEMENTS);
    let attempts = 0;
    for (const ek of eleKeys) {
      let placed_count = 0;
      attempts = 0;
      while (placed_count < eleCount && attempts < 120) {
        attempts++;
        const x = 1 + Math.floor(Math.random() * (sz - 2));
        const y = 1 + Math.floor(Math.random() * (sz - 2));
        if (!_free(x, y)) continue;
        _mark(x, y, ek);
        this._elementSpawns.push({ x, y, element: ek, collected: false });
        placed_count++;
      }
    }

    // Place hermetic decoration symbols (aesthetic, walkable)
    const decorCount = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < decorCount; i++) {
      attempts = 0;
      while (attempts < 60) {
        attempts++;
        const x = Math.floor(Math.random() * sz);
        const y = Math.floor(Math.random() * sz);
        if (placed.has(`${x},${y}`)) continue;
        const sym = HERMETIC_DECOR[Math.floor(Math.random() * HERMETIC_DECOR.length)];
        this._decorSymbols.push({ x, y, symbol: sym });
        break; // decor doesn't block, so no _mark
      }
    }

    // Start player away from center
    gameState.player.x = 1;
    gameState.player.y = 1;
    gameState.peaceCollected = this._completedReactions.size;
  }

  update(gameState, deltaTime) {
    // Update lab particles
    for (let i = this._labParticles.length - 1; i >= 0; i--) {
      const p = this._labParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.001; // gentle gravity
      p.life -= deltaTime;
      if (p.life <= 0) this._labParticles.splice(i, 1);
    }
    // Cap particles
    if (this._labParticles.length > 80) {
      this._labParticles.splice(0, this._labParticles.length - 80);
    }
  }

  handleInput(gameState, input) {
    // Dismiss lore with any key
    if (this._loreShowing) {
      const dir = input.getDirectionalInput();
      const any = dir.x !== 0 || dir.y !== 0 || input.isKeyPressed(' ') || input.isKeyPressed('Enter');
      if (any && Date.now() - this._loreShowing.shownAtMs > 800) {
        this._loreShowing = null;
      }
      return;
    }

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;

    const dir = input.getDirectionalInput();
    if (dir.x === 0 && dir.y === 0) return;
    const sz = gameState.gridSize || 12;
    gameState.player.x = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
    gameState.player.y = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
    this.lastMoveTime = now;
    try { window.AudioManager?.play('move'); } catch(e) {}

    this._checkCollection(gameState);
    this._checkAthanor(gameState);
  }

  _checkCollection(gameState) {
    const { x, y } = gameState.player;
    const spawn = this._elementSpawns.find(s => !s.collected && s.x === x && s.y === y);
    if (!spawn) return;

    if (this._inventory.length >= MAX_INVENTORY) {
      // Inventory full — flash message
      gameState._alchemyMsg = { text: 'INVENTORY FULL — Go to the Athanor ⚗', color: '#ffaa44', at: Date.now() };
      return;
    }

    spawn.collected = true;
    this._labGrid[y][x] = 'EMPTY';
    this._inventory.push(spawn.element);

    const ele = ELEMENTS[spawn.element];
    gameState._alchemyMsg = { text: `Collected ${ele.symbol} ${ele.name.split(' — ')[0]}`, color: ele.color, at: Date.now() };
    gameState.score = (gameState.score || 0) + 25;
    try { window.AudioManager?.play('select'); } catch(e) {}

    // Spawn collection particles
    this._spawnParticles(x, y, ele.glow, 8);

    // Respawn element after a delay (to keep the lab populated)
    setTimeout(() => this._respawnElement(gameState, spawn.element), ELEMENT_RESPAWN_MIN_MS + Math.random() * ELEMENT_RESPAWN_RAND_MS);
  }

  _checkAthanor(gameState) {
    const { x, y } = gameState.player;
    const isAthanor = this._athanors.some(a => a.x === x && a.y === y);
    if (!isAthanor || this._inventory.length === 0) return;

    // Find the best matching reaction
    const reaction = this._findBestReaction();
    if (!reaction) {
      gameState._alchemyMsg = { text: `Inventory: [${this._inventory.map(e => ELEMENTS[e].symbol).join(' ')}] — Collect more elements`, color: '#aa6622', at: Date.now() };
      return;
    }

    // Consume used elements
    const used = [...reaction.inputs];
    for (const ek of used) {
      const idx = this._inventory.indexOf(ek);
      if (idx !== -1) this._inventory.splice(idx, 1);
    }

    // Apply reaction
    this._applyReaction(gameState, reaction);
  }

  _findBestReaction() {
    // Try largest reactions first (Philosopher's Stone > Mercury > Sol/Luna > others)
    const sorted = [...REACTIONS].sort((a, b) => b.inputs.length - a.inputs.length || b.points - a.points);
    for (const rxn of sorted) {
      const inv = [...this._inventory];
      let can = true;
      for (const needed of rxn.inputs) {
        const idx = inv.indexOf(needed);
        if (idx === -1) { can = false; break; }
        inv.splice(idx, 1);
      }
      if (can) return rxn;
    }
    return null;
  }

  _applyReaction(gameState, reaction) {
    const pts = reaction.points * (1 + Math.min(MAX_WISDOM_MULTIPLIER, (this._alchemistStats.wisdom - 1) * WISDOM_MULTIPLIER_FACTOR)) * (gameState.level || 1);
    gameState.score = (gameState.score || 0) + Math.round(pts);
    this._totalTransmutations++;
    gameState._totalTransmutations = this._totalTransmutations;

    // Apply stat boosts
    if (reaction.statBoost) {
      for (const [stat, amt] of Object.entries(reaction.statBoost)) {
        this._alchemistStats[stat] = Math.min(10, (this._alchemistStats[stat] || 1) + amt);
      }
      gameState._alchemistStats = { ...this._alchemistStats };
    }

    // Mark completed
    if (!this._completedReactions.has(reaction.id)) {
      this._completedReactions.add(reaction.id);
      gameState.peaceCollected = this._completedReactions.size;
    }

    // Spawn transmutation particles
    const athanorPos = this._athanors.find(a => a.x === gameState.player.x && a.y === gameState.player.y) ||
                       this._athanors[0];
    if (athanorPos) {
      this._spawnParticles(athanorPos.x, athanorPos.y, reaction.product.color, 24);
    }

    // Spawn Three.js element particles in the 3D beaker overlay
    this._spawn3DParticles(reaction.inputs, reaction.product.color);

    // Flash banner
    this._reactionFlash = { reaction, shownAtMs: Date.now() };
    try { window.AudioManager?.play(reaction.audio || 'insight'); } catch(e) {}

    // Show lore for rare reactions (Sol, Luna, Mercury, Stone)
    if (reaction.inputs.length >= 2 && reaction.points >= 500) {
      setTimeout(() => {
        this._loreShowing = {
          name: reaction.product.name,
          text: reaction.lore,
          color: reaction.product.color,
          shownAtMs: Date.now(),
        };
      }, 1200); // brief delay so banner shows first
    }

    // Emotional field update
    if (gameState.emotionalField?.add) {
      gameState.emotionalField.add('awe', 1.5);
      gameState.emotionalField.add('joy', 0.8);
    }

    // Level complete: Philosopher's Stone OR all reactions discovered
    if (reaction.levelComplete || this._completedReactions.size >= REACTIONS.length) {
      setTimeout(() => this._onLevelComplete(gameState), reaction.levelComplete ? LEVEL_COMPLETE_DELAY_STONE_MS : LEVEL_COMPLETE_DELAY_DEFAULT_MS);
    }
  }

  _respawnElement(gameState, elementKey) {
    const sz = gameState.gridSize || 12;
    let attempts = 0;
    while (attempts < 80) {
      attempts++;
      const x = 1 + Math.floor(Math.random() * (sz - 2));
      const y = 1 + Math.floor(Math.random() * (sz - 2));
      const tile = this._labGrid[y]?.[x];
      if (tile !== 'EMPTY') continue;
      if (this._athanors.some(a => a.x === x && a.y === y)) continue;
      this._labGrid[y][x] = elementKey;
      this._elementSpawns.push({ x, y, element: elementKey, collected: false });
      break;
    }
  }

  _spawnParticles(gx, gy, color, count) {
    const ts = this.tileSize;
    const cx = gx * ts + ts / 2;
    const cy = gy * ts + ts / 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 0.3 + Math.random() * 0.6;
      this._labParticles.push({
        x: cx + (Math.random() - 0.5) * ts * 0.4,
        y: cy + (Math.random() - 0.5) * ts * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 800 + Math.random() * 600,
        maxLife: 1400,
      });
    }
  }

  _onLevelComplete(gameState) {
    gameState.score = (gameState.score || 0) + 1000 * (gameState.level || 1);
    gameState.level = (gameState.level || 1) + 1;
    this._completedReactions.clear();
    this._inventory = [];
    this._buildLab(gameState);
    gameState.peaceCollected = 0;
    try { window.AudioManager?.play('level_complete'); } catch(e) {}
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 12;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();

    // Background — dark hermetic chamber
    ctx.fillStyle = '#080610';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this._xOff || 0, this._yOff || 0);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(80,40,120,0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= sz; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * ts); ctx.lineTo(sz * ts, y * ts); ctx.stroke();
    }
    for (let x = 0; x <= sz; x++) {
      ctx.beginPath(); ctx.moveTo(x * ts, 0); ctx.lineTo(x * ts, sz * ts); ctx.stroke();
    }

    // Hermetic decor symbols (background, subtle)
    for (const d of this._decorSymbols) {
      const pulse = 0.08 + 0.04 * Math.sin(now / 2000 + d.x + d.y);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#9966cc';
      ctx.font = `${Math.floor(ts * 0.5)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.symbol, d.x * ts + ts / 2, d.y * ts + ts / 2);
      ctx.restore();
    }

    // Athanor tiles
    for (const a of this._athanors) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 600 + a.x);
      ctx.save();
      ctx.fillStyle = `rgba(60,30,10,${0.6 + pulse * 0.2})`;
      ctx.fillRect(a.x * ts, a.y * ts, ts, ts);
      ctx.shadowColor = ATHANOR.glow;
      ctx.shadowBlur = 8 + pulse * 8;
      ctx.fillStyle = ATHANOR.color;
      ctx.font = `${Math.floor(ts * 0.62)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ATHANOR.symbol, a.x * ts + ts / 2, a.y * ts + ts / 2);
      // Label if player is near
      const dist = Math.abs(gameState.player.x - a.x) + Math.abs(gameState.player.y - a.y);
      if (dist <= 2) {
        ctx.fillStyle = '#aa6622';
        ctx.font = `${Math.floor(ts * 0.22)}px monospace`;
        ctx.fillText('ATHANOR', a.x * ts + ts / 2, a.y * ts + ts - 4);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Element tiles
    for (const sp of this._elementSpawns) {
      if (sp.collected) continue;
      const ele = ELEMENTS[sp.element];
      const pulse = 0.55 + 0.45 * Math.sin(now / 700 + sp.x * 1.3 + sp.y * 0.7);
      const px = sp.x * ts + ts / 2;
      const py = sp.y * ts + ts / 2;
      ctx.save();
      ctx.fillStyle = ele.bg;
      ctx.fillRect(sp.x * ts, sp.y * ts, ts, ts);
      ctx.shadowColor = ele.glow;
      ctx.shadowBlur = 6 + pulse * 10;
      ctx.globalAlpha = 0.6 + pulse * 0.35;
      ctx.fillStyle = ele.color;
      ctx.font = `${Math.floor(ts * 0.65)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ele.symbol, px, py);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Lab particles
    for (const p of this._labParticles) {
      const fade = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = fade * 0.8;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + fade * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', gameState.player.x * ts + ts / 2, gameState.player.y * ts + ts / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();

    // ── Inventory panel (bottom) ──────────────────────────────────────────
    this._renderInventory(ctx, w, h, now);

    // ── HUD bar (top) ────────────────────────────────────────────────────
    ctx.save();
    ctx.fillStyle = '#9966cc';
    ctx.font = `${Math.floor(w / 36)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const statsStr = Object.entries(STAT_LABELS)
      .map(([k, l]) => `${l}${this._alchemistStats[k]}`)
      .join(' · ');
    ctx.fillText(`⚗ Transmutations: ${this._totalTransmutations}  ·  ${statsStr}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, 8, 6);
    ctx.restore();

    // ── Reaction flash banner ─────────────────────────────────────────────
    if (this._reactionFlash) {
      const age = now - this._reactionFlash.shownAtMs;
      const dur = 2500;
      if (age < dur) {
        const fade = Math.min(1, age / 250) * (age > dur - 500 ? (dur - age) / 500 : 1);
        const rxn = this._reactionFlash.reaction;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = `rgba(0,0,0,${fade * 0.88})`;
        ctx.fillRect(0, h * 0.36, w, h * 0.26);
        ctx.strokeStyle = rxn.product.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.08, h * 0.36, w * 0.84, h * 0.26);
        ctx.fillStyle = rxn.product.color;
        ctx.font = `bold ${Math.floor(w / 14)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = rxn.product.color;
        ctx.shadowBlur = 20;
        ctx.fillText(`${rxn.product.symbol} ${rxn.product.name}`, w / 2, h * 0.46);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#aa88cc';
        ctx.font = `${Math.floor(w / 32)}px monospace`;
        ctx.fillText(`+${Math.round(rxn.points * (gameState.level || 1))} pts`, w / 2, h * 0.57);
        ctx.restore();
      } else {
        this._reactionFlash = null;
      }
    }

    // ── Alchemic message (inventory full, etc.) ───────────────────────────
    if (gameState._alchemyMsg) {
      const age = now - gameState._alchemyMsg.at;
      if (age < 2200) {
        const fade = Math.min(1, age / 200) * (age > 1700 ? (2200 - age) / 500 : 1);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = gameState._alchemyMsg.color;
        ctx.font = `${Math.floor(w / 28)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = gameState._alchemyMsg.color;
        ctx.shadowBlur = 8;
        ctx.fillText(gameState._alchemyMsg.text, w / 2, h * 0.22);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._alchemyMsg;
      }
    }

    // ── Lore overlay ─────────────────────────────────────────────────────
    if (this._loreShowing) {
      this._renderLore(ctx, w, h, now);
    }

    // ── Reactions discovered panel (right edge, compact) ─────────────────
    this._renderDiscoveryLog(ctx, w, h, now);

    // ── Three.js 3D beaker overlay ────────────────────────────────────────
    this._render3DOverlay((Date.now() - now) / 1000 || 0.016);
  }

  _renderInventory(ctx, w, h, now) {
    const slotW = 52;
    const slotH = 46;
    const totalW = MAX_INVENTORY * slotW + (MAX_INVENTORY - 1) * 4 + 16;
    const startX = (w - totalW) / 2;
    const startY = h - slotH - 8;

    ctx.fillStyle = 'rgba(8,4,20,0.88)';
    ctx.fillRect(startX - 4, startY - 4, totalW + 8, slotH + 8);
    ctx.strokeStyle = '#443355';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX - 4, startY - 4, totalW + 8, slotH + 8);

    for (let i = 0; i < MAX_INVENTORY; i++) {
      const sx = startX + i * (slotW + 4);
      const ele = this._inventory[i] ? ELEMENTS[this._inventory[i]] : null;
      ctx.fillStyle = ele ? ele.bg : 'rgba(30,20,40,0.6)';
      ctx.fillRect(sx, startY, slotW, slotH);
      ctx.strokeStyle = ele ? ele.color : '#332244';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, startY, slotW, slotH);
      if (ele) {
        const pulse = 0.7 + 0.3 * Math.sin(now / 500 + i);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = ele.color;
        ctx.shadowColor = ele.glow;
        ctx.shadowBlur = 6;
        ctx.font = `${Math.floor(slotH * 0.55)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ele.symbol, sx + slotW / 2, startY + slotH / 2 - 6);
        ctx.shadowBlur = 0;
        ctx.font = `${Math.floor(slotH * 0.2)}px monospace`;
        ctx.fillStyle = '#aa88cc';
        ctx.fillText(ele.name.split(' — ')[0].substring(0, 7), sx + slotW / 2, startY + slotH - 8);
        ctx.restore();
      } else {
        ctx.fillStyle = '#332244';
        ctx.font = `${Math.floor(slotH * 0.4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('·', sx + slotW / 2, startY + slotH / 2);
      }
    }
    // Label
    ctx.fillStyle = '#664466';
    ctx.font = `${Math.floor(w / 42)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('INVENTORY — Walk to ⚗ Athanor to transmute', w / 2, startY - 6);
  }

  _renderDiscoveryLog(ctx, w, h, now) {
    const completed = REACTIONS.filter(r => this._completedReactions.has(r.id));
    if (!completed.length) return;
    const logX = w - 110;
    const logY = 28;
    ctx.fillStyle = 'rgba(5,2,15,0.80)';
    ctx.fillRect(logX, logY, 104, 16 + completed.length * 20);
    ctx.strokeStyle = '#443355';
    ctx.lineWidth = 1;
    ctx.strokeRect(logX, logY, 104, 16 + completed.length * 20);
    ctx.fillStyle = '#664466';
    ctx.font = `${Math.floor(w / 42)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('DISCOVERED', logX + 4, logY + 2);
    completed.forEach((r, i) => {
      ctx.fillStyle = r.product.color;
      ctx.font = `${Math.floor(w / 38)}px monospace`;
      ctx.fillText(`${r.product.symbol} ${r.product.name.substring(0, 10)}`, logX + 4, logY + 18 + i * 20);
    });
  }

  _renderLore(ctx, w, h, now) {
    const age = now - this._loreShowing.shownAtMs;
    const fade = Math.min(1, age / 500);
    ctx.save();
    ctx.globalAlpha = fade * 0.97;
    ctx.fillStyle = '#03010a';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = fade;

    // Compound name
    ctx.fillStyle = this._loreShowing.color;
    ctx.font = `bold ${Math.floor(w / 12)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = this._loreShowing.color;
    ctx.shadowBlur = 28;
    ctx.fillText(this._loreShowing.name, w / 2, h * 0.20);
    ctx.shadowBlur = 0;

    // Lore text (word-wrapped)
    ctx.fillStyle = '#bb99cc';
    ctx.font = `${Math.floor(w / 30)}px monospace`;
    const words = this._loreShowing.text.split(' ');
    const lineW = w * 0.80;
    let line = '';
    let lineY = h * 0.35;
    const lineH = Math.floor(w / 25);
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > lineW && line) {
        ctx.fillText(line.trim(), w / 2, lineY);
        lineY += lineH;
        line = word + ' ';
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line.trim(), w / 2, lineY);

    // Alchemical sigils as decorative border
    ctx.globalAlpha = fade * 0.15;
    ctx.fillStyle = this._loreShowing.color;
    ctx.font = `${Math.floor(w / 18)}px monospace`;
    for (let i = 0; i < 8; i++) {
      ctx.fillText(HERMETIC_DECOR[i % HERMETIC_DECOR.length], w * 0.08 + i * w * 0.11, h * 0.88);
    }

    // Continue prompt
    if (age > 1000) {
      ctx.globalAlpha = fade * (0.5 + 0.5 * Math.sin(now / 600));
      ctx.fillStyle = '#665577';
      ctx.font = `${Math.floor(w / 36)}px monospace`;
      ctx.fillText('Move or SPACE to continue', w / 2, h * 0.82);
    }
    ctx.restore();
  }

  /** Clean up Three.js resources when this mode is unloaded. */
  cleanup() {
    this._cleanup3D();
  }

  // ── Three.js 3D beaker overlay ──────────────────────────────────────────

  /**
   * Initialise a small Three.js scene that renders a glass beaker above the
   * Athanor (crucible) tile and spawns coloured element-particle spheres
   * whenever a transmutation fires.  The WebGL canvas is overlaid on top of
   * the 2D game canvas with pointer-events:none so it never blocks input.
   */
  _init3D(canvas) {
    if (this._3d) return; // already initialised

    // Overlay <canvas> matching the game canvas size
    const overlay = document.createElement('canvas');
    overlay.id = 'alchemy-3d-overlay';
    overlay.width  = canvas.width;
    overlay.height = canvas.height;
    overlay.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      `width:${canvas.width}px`, `height:${canvas.height}px`,
      'pointer-events:none', 'z-index:5',
    ].join(';');

    const parent = canvas.parentElement || document.body;
    parent.style.position = parent.style.position || 'relative';
    parent.appendChild(overlay);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: overlay, alpha: true, antialias: true });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.setClearColor(0x000000, 0);

    // Scene
    const scene = new THREE.Scene();

    // Camera — orthographic-ish perspective, looks down at lab center
    const aspect = canvas.width / canvas.height;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);

    // Ambient + directional light
    scene.add(new THREE.AmbientLight(0x334455, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Beaker geometry — a cylinder with open top, tinted glass material
    const beakerGeo  = new THREE.CylinderGeometry(0.5, 0.6, 1.4, 32, 1, true);
    const beakerMat  = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff, transparent: true, opacity: 0.35,
      roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide,
    });
    const beaker = new THREE.Mesh(beakerGeo, beakerMat);
    beaker.position.set(0, 0, 0);
    scene.add(beaker);

    // Beaker bottom disc
    const bottomGeo = new THREE.CircleGeometry(0.6, 32);
    const bottomMat = new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const bottom = new THREE.Mesh(bottomGeo, bottomMat);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.set(0, -0.7, 0);
    scene.add(bottom);

    // Liquid fill inside beaker (starts empty)
    const liquidGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.01, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0x222244, transparent: true, opacity: 0.7 });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(0, -0.6, 0);
    scene.add(liquid);

    // Element particles pool
    const elemParticles = [];

    this._3d = { renderer, scene, camera, beaker, liquid, elemParticles, overlay };
  }

  /**
   * Spawn Three.js element-particle spheres when a transmutation fires.
   * Call this from _performTransmutation / wherever reactions complete.
   * @param {string[]} elementIds  e.g. ['FIRE', 'WATER']
   * @param {string} productColor  hex string
   */
  _spawn3DParticles(elementIds, productColor) {
    if (!this._3d) return;
    const { scene, elemParticles, liquid, liquidMat } = this._3d;

    // Update liquid colour
    if (liquid) {
      liquid.material.color.set(new THREE.Color(productColor || '#446688'));
      liquid.material.opacity = 0.8;
      // Animate liquid rise
      liquid._targetY = -0.4;
    }

    for (const id of elementIds) {
      const el = ELEMENTS[id];
      if (!el) continue;
      const geo  = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 8, 8);
      const mat  = new THREE.MeshPhysicalMaterial({
        color: el.color, emissive: el.glow, emissiveIntensity: 0.8,
        transparent: true, opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      // Start inside beaker
      mesh.position.set(
        (Math.random() - 0.5) * 0.6,
        -0.3 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.6,
      );
      mesh._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        0.02 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.04,
      );
      mesh._life = 2.0; // seconds
      scene.add(mesh);
      elemParticles.push(mesh);
    }
  }

  /**
   * Render the Three.js overlay.  Called at the end of every render() frame.
   * @param {number} dt  delta time in seconds
   */
  _render3DOverlay(dt) {
    if (!this._3d) return;
    const { renderer, scene, camera, beaker, liquid, elemParticles } = this._3d;

    // Gently rotate beaker
    beaker.rotation.y += 0.4 * dt;

    // Animate liquid fill
    if (liquid._targetY !== undefined) {
      liquid.position.y += (liquid._targetY - liquid.position.y) * dt * 2;
      if (Math.abs(liquid.position.y - liquid._targetY) < 0.01) {
        liquid.position.y = liquid._targetY;
        delete liquid._targetY;
      }
    }

    // Update element particles
    for (let i = elemParticles.length - 1; i >= 0; i--) {
      const p = elemParticles[i];
      p._life -= dt;
      if (p._life <= 0) {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        elemParticles.splice(i, 1);
        continue;
      }
      p.position.add(p._vel);
      p._vel.y -= 0.001; // light gravity
      p.material.opacity = Math.min(0.9, p._life);
    }

    renderer.render(scene, camera);
  }

  /** Tear down the Three.js overlay when the mode is unloaded. */
  _cleanup3D() {
    if (!this._3d) return;
    const { renderer, overlay } = this._3d;
    renderer.dispose();
    if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    this._3d = null;
  }
}
