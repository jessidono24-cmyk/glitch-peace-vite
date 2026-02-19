// ═══════════════════════════════════════════════════════════════════════
//  ARCHITECTURE MODE — Spatial Construction Grid Mode
//  Players place structural tiles to complete building blueprints.
//  Earn points for matching patterns, structural integrity bonuses.
//  Inspired by modular construction, vernacular architecture, sacred geometry.
//  Research: embodied cognition (Lakoff & Johnson 1999) — spatial reasoning
//  engages proprioception and strengthens abstract pattern thinking.
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';

// ── Tile types ─────────────────────────────────────────────────────────
const ARCH_TILES = {
  EMPTY:    { bg: '#0d0d12', sy: '·', col: '#333' },
  WALL:     { bg: '#2a2035', sy: '█', col: '#8866cc' },
  FLOOR:    { bg: '#1a1a2e', sy: '░', col: '#4444aa' },
  WINDOW:   { bg: '#0a1a30', sy: '◻', col: '#4488ff' },
  ARCH:     { bg: '#2e1a1a', sy: '∩', col: '#cc6644' },
  PILLAR:   { bg: '#201828', sy: '│', col: '#9966cc' },
  ROOF:     { bg: '#1a2e1a', sy: '▲', col: '#44aa66' },
  GARDEN:   { bg: '#0a1a0a', sy: '✦', col: '#22cc44' },
  WATER:    { bg: '#081830', sy: '≈', col: '#2266cc' },
  SACRED:   { bg: '#201a30', sy: '⬡', col: '#cc88ff' }, // sacred geometry center
};

// Building archetypes — each is a pattern to complete for bonus
const BLUEPRINTS = [
  {
    name: 'Meditation Hall',
    icon: '🏛',
    pattern: [
      [null,   'WALL',  'WALL',  'WALL',  null  ],
      ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
      ['WALL', 'FLOOR', 'SACRED','FLOOR', 'WALL'],
      ['WALL', 'FLOOR', 'FLOOR', 'FLOOR', 'WALL'],
      [null,   'ARCH',  'FLOOR', 'ARCH',  null  ],
    ],
    bonus: 800,
    note: 'A space designed for stillness. The sacred center anchors intention.',
  },
  {
    name: 'Garden Court',
    icon: '🌿',
    pattern: [
      ['WALL',   'WINDOW', 'WALL',   'WINDOW', 'WALL'  ],
      ['GARDEN', 'FLOOR',  'WATER',  'FLOOR',  'GARDEN'],
      ['GARDEN', 'WATER',  'GARDEN', 'WATER',  'GARDEN'],
      ['GARDEN', 'FLOOR',  'WATER',  'FLOOR',  'GARDEN'],
      ['WALL',   'ARCH',   'FLOOR',  'ARCH',   'WALL'  ],
    ],
    bonus: 900,
    note: 'Biophilic design: water and greenery integrated into built space.',
  },
  {
    name: 'Watchtower',
    icon: '🗼',
    pattern: [
      [null,    'WALL',   'WINDOW', 'WALL',   null   ],
      ['WALL',  'FLOOR',  'FLOOR',  'FLOOR',  'WALL' ],
      ['WALL',  'PILLAR', 'FLOOR',  'PILLAR', 'WALL' ],
      ['WALL',  'FLOOR',  'FLOOR',  'FLOOR',  'WALL' ],
      ['ARCH',  'FLOOR',  'FLOOR',  'FLOOR',  'ARCH' ],
    ],
    bonus: 700,
    note: 'Visibility and boundary-setting as spatial metaphors for clarity.',
  },
  {
    name: 'Sanctuary',
    icon: '⛪',
    pattern: [
      [null,    null,   'ROOF',   null,    null  ],
      [null,   'WALL',  'WALL',  'WALL',   null  ],
      ['WALL', 'WINDOW','SACRED','WINDOW', 'WALL'],
      ['WALL', 'FLOOR', 'FLOOR', 'FLOOR',  'WALL'],
      [null,   'ARCH',  'FLOOR', 'ARCH',   null  ],
    ],
    bonus: 1000,
    note: 'Sacred architecture as vessel for transformed consciousness.',
  },
];

// Tile placement order in selector
const PLACEABLE = Object.keys(ARCH_TILES).filter(k => k !== 'EMPTY');

/**
 * ArchitectureMode — Spatial construction with blueprint matching.
 * Player navigates the grid and places tiles to complete blueprints.
 * Scoring: each placed tile (+10), matching a blueprint (+blueprint.bonus).
 */
export class ArchitectureMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'architecture',
      name: 'Architecture — Build & Create',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 140;
    this._grid = [];             // current construction state
    this._blueprintIdx = 0;      // active blueprint
    this._blueprintOffset = { x: 3, y: 3 }; // where blueprint is placed in grid
    this._selectedTile = 'WALL'; // currently selected tile type
    this._tileSelector = 0;      // index into PLACEABLE
    this._completedBlueprints = [];
    this._buildFlash = null;
    this._completionFlash = null;
  }

  init(gameState, canvas, ctx) {
    this.tileSize = Math.floor(canvas.width / (gameState.gridSize || 14));
    gameState.player = gameState.player || { x: 4, y: 4, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    gameState.score = gameState.score || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = BLUEPRINTS.length;
    this._blueprintIdx = 0;
    this._resetGrid(gameState);
    this._positionBlueprintMarkers(gameState);
  }

  _resetGrid(gameState) {
    const sz = gameState.gridSize || 14;
    this._grid = [];
    for (let y = 0; y < sz; y++) {
      this._grid[y] = [];
      for (let x = 0; x < sz; x++) {
        this._grid[y][x] = 'EMPTY';
      }
    }
  }

  _positionBlueprintMarkers(gameState) {
    const bp = BLUEPRINTS[this._blueprintIdx % BLUEPRINTS.length];
    const sz = gameState.gridSize || 14;
    // Center the 5×5 blueprint in the grid
    this._blueprintOffset = {
      x: Math.floor((sz - bp.pattern[0].length) / 2),
      y: Math.floor((sz - bp.pattern.length) / 2),
    };
  }

  update(gameState, deltaTime) {
    // Check for blueprint completion each frame
    this._checkBlueprintCompletion(gameState);
  }

  handleInput(gameState, input) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;

    const dir = input.getDirectionalInput();
    const sz = gameState.gridSize || 14;
    if (dir.x !== 0 || dir.y !== 0) {
      gameState.player.x = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
      gameState.player.y = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
      this.lastMoveTime = now;
      return;
    }

    // SPACE / Enter: place selected tile
    if (input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
      this._placeTile(gameState);
      this.lastMoveTime = now;
      return;
    }

    // Q: cycle tile selector backward
    if (input.isKeyPressed('q') || input.isKeyPressed('Q')) {
      this._tileSelector = (this._tileSelector - 1 + PLACEABLE.length) % PLACEABLE.length;
      this._selectedTile = PLACEABLE[this._tileSelector];
      this.lastMoveTime = now;
      return;
    }

    // E: cycle tile selector forward
    if (input.isKeyPressed('e') || input.isKeyPressed('E')) {
      this._tileSelector = (this._tileSelector + 1) % PLACEABLE.length;
      this._selectedTile = PLACEABLE[this._tileSelector];
      this.lastMoveTime = now;
      return;
    }

    // X: clear tile (set to EMPTY)
    if (input.isKeyPressed('x') || input.isKeyPressed('X')) {
      const px = gameState.player.x;
      const py = gameState.player.y;
      if (this._grid[py]?.[px] !== 'EMPTY') {
        this._grid[py][px] = 'EMPTY';
        this.lastMoveTime = now;
      }
      return;
    }
  }

  _placeTile(gameState) {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const prev = this._grid[py][px];
    this._grid[py][px] = this._selectedTile;
    if (prev === 'EMPTY') {
      gameState.score = (gameState.score || 0) + 10;
      this._buildFlash = { tile: this._selectedTile, x: px, y: py, at: Date.now() };
      try { window.AudioManager?.play('build'); } catch(e) {}
    }
  }

  _checkBlueprintCompletion(gameState) {
    if (this._completionFlash && Date.now() - this._completionFlash.at < 2500) return; // wait for flash to finish
    const bp = BLUEPRINTS[this._blueprintIdx % BLUEPRINTS.length];
    const ox = this._blueprintOffset.x;
    const oy = this._blueprintOffset.y;
    let matches = 0;
    let required = 0;
    for (let row = 0; row < bp.pattern.length; row++) {
      for (let col = 0; col < bp.pattern[row].length; col++) {
        const want = bp.pattern[row][col];
        if (want === null) continue;
        required++;
        const placed = this._grid[oy + row]?.[ox + col];
        if (placed === want) matches++;
      }
    }
    if (required > 0 && matches >= required) {
      // Blueprint complete!
      gameState.score = (gameState.score || 0) + bp.bonus;
      gameState.peaceCollected = (gameState.peaceCollected || 0) + 1;
      this._completedBlueprints.push(bp.name);
      this._completionFlash = { bp, at: Date.now() };
      try { window.AudioManager?.play('level_complete'); } catch(e) {}
      // Advance to next blueprint
      this._blueprintIdx++;
      this._resetGrid(gameState);
      this._positionBlueprintMarkers(gameState);
    }
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 14;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();
    const bp = BLUEPRINTS[this._blueprintIdx % BLUEPRINTS.length];
    const ox = this._blueprintOffset.x;
    const oy = this._blueprintOffset.y;

    // Background
    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, w, h);

    // Blueprint ghost overlay (what to build)
    for (let row = 0; row < bp.pattern.length; row++) {
      for (let col = 0; col < bp.pattern[row].length; col++) {
        const want = bp.pattern[row][col];
        if (want === null) continue;
        const gx = (ox + col) * ts;
        const gy = (oy + row) * ts;
        const placed = this._grid[oy + row]?.[ox + col];
        const matched = placed === want;
        ctx.save();
        ctx.globalAlpha = matched ? 0.06 : 0.22;
        ctx.fillStyle = matched ? '#00ff88' : '#6644cc';
        ctx.fillRect(gx + 2, gy + 2, ts - 4, ts - 4);
        // Show desired symbol dimly
        if (!matched) {
          ctx.globalAlpha = 0.35;
          const tileDef = ARCH_TILES[want];
          ctx.font = `${Math.floor(ts * 0.5)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = tileDef.col;
          ctx.fillText(tileDef.sy, gx + ts / 2, gy + ts / 2);
        }
        ctx.restore();
      }
    }

    // Render placed tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const tile = this._grid[y][x];
        const tileDef = ARCH_TILES[tile] || ARCH_TILES.EMPTY;
        ctx.fillStyle = tileDef.bg;
        ctx.fillRect(x * ts, y * ts, ts, ts);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * ts, y * ts, ts, ts);
        if (tile !== 'EMPTY' && tileDef.sy !== '·') {
          ctx.fillStyle = tileDef.col;
          ctx.font = `${Math.floor(ts * 0.55)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tileDef.sy, x * ts + ts / 2, y * ts + ts / 2);
        }
      }
    }

    // Build flash (tile placed)
    if (this._buildFlash && now - this._buildFlash.at < 300) {
      const fade = 1 - (now - this._buildFlash.at) / 300;
      ctx.save();
      ctx.globalAlpha = fade * 0.45;
      ctx.fillStyle = ARCH_TILES[this._buildFlash.tile]?.col || '#fff';
      ctx.fillRect(this._buildFlash.x * ts, this._buildFlash.y * ts, ts, ts);
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', gameState.player.x * ts + ts / 2, gameState.player.y * ts + ts / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Blueprint info panel (right side or bottom)
    const panelY = sz * ts + 4;
    if (panelY < h - 10) {
      ctx.fillStyle = '#111128';
      ctx.fillRect(0, panelY, w, h - panelY);
      ctx.fillStyle = '#8866cc';
      ctx.font = `bold ${Math.floor(w / 28)}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${bp.icon} ${bp.name}  (+${bp.bonus} pts)`, 8, panelY + 4);
      ctx.fillStyle = '#445566';
      ctx.font = `${Math.floor(w / 40)}px monospace`;
      // Word-aware truncation: fit blueprint note to available panel width
      let bpNote = bp.note;
      while (bpNote.length > 0 && ctx.measureText(bpNote).width > w - 16) {
        const lastSpace = bpNote.lastIndexOf(' ');
        bpNote = lastSpace > 0 ? bpNote.substring(0, lastSpace) + '…' : bpNote.substring(0, bpNote.length - 2) + '…';
      }
      ctx.fillText(bpNote, 8, panelY + 4 + Math.floor(w / 23));
    }

    // Tile selector
    const selW = Math.min(w, PLACEABLE.length * 36 + 16);
    const selX = (w - selW) / 2;
    const selY = h - 34;
    PLACEABLE.forEach((key, i) => {
      const sx = selX + i * 36 + 8;
      const tileDef = ARCH_TILES[key];
      const isSelected = key === this._selectedTile;
      ctx.fillStyle = isSelected ? '#2a2a44' : '#111118';
      ctx.fillRect(sx, selY, 30, 26);
      ctx.strokeStyle = isSelected ? '#8866cc' : '#333';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(sx, selY, 30, 26);
      ctx.fillStyle = isSelected ? tileDef.col : '#555';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tileDef.sy, sx + 15, selY + 13);
    });

    // Controls hint
    ctx.fillStyle = '#334455';
    ctx.font = `${Math.floor(w / 40)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Move: WASD  ·  Place: SPACE  ·  Cycle tile: Q/E  ·  Erase: X', w / 2, selY - 4);

    // HUD bar
    ctx.fillStyle = '#8866cc';
    ctx.font = `${Math.floor(w / 36)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${bp.icon} Blueprint: ${gameState.peaceCollected || 0}/${gameState.peaceTotal}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, 8, 6);

    // Blueprint completion flash
    if (this._completionFlash) {
      const age = now - this._completionFlash.at;
      const dur = 2500;
      if (age < dur) {
        const fade = Math.min(1, age / 300) * (age > dur - 500 ? (dur - age) / 500 : 1);
        ctx.save();
        ctx.globalAlpha = fade * 0.88;
        ctx.fillStyle = '#080820';
        ctx.fillRect(w * 0.05, h * 0.3, w * 0.9, h * 0.38);
        ctx.strokeStyle = '#8866cc';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.05, h * 0.3, w * 0.9, h * 0.38);
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#cc88ff';
        ctx.font = `bold ${Math.floor(w / 16)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#cc88ff';
        ctx.shadowBlur = 18;
        ctx.fillText(`${this._completionFlash.bp.icon} COMPLETE`, w / 2, h * 0.44);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#8866cc';
        ctx.font = `${Math.floor(w / 26)}px monospace`;
        ctx.fillText(`+${this._completionFlash.bp.bonus} pts  —  ${this._completionFlash.bp.name}`, w / 2, h * 0.54);
        ctx.restore();
      }
    }
  }
}
