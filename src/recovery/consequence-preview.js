'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — consequence-preview.js — Phase 4
//  Pattern Recognition: Ghost path showing projected outcomes
// ═══════════════════════════════════════════════════════════════════════

/**
 * ConsequencePreview shows ghost tiles 3 moves ahead
 * - Only active while holding a movement key
 * - Shows projected HP change
 * - Helps player anticipate hazards
 */

// ARCH5 COGNITIVE_ARCHITECTURE.md: working memory limit (7±2, conservative cap = 3)
const MAX_PREVIEW_DEPTH = 3;

export class ConsequencePreview {
  constructor() {
    this.active = false;
    this.direction = null;
    this.ghostPath = [];  // Array of {y, x, tile, hpDelta}
    this.projectedHP = 0;
  }

  /**
   * Calculate HP change for a tile
   * @param {number} tileType - Tile ID
   * @param {Object} game - Game state
   * @returns {number} HP delta
   */
  calculateHPDelta(tileType, game) {
    const dmgMul = game.dmgMul || 1.0;
    const healMul = game.healMul || 1.0;

    switch (tileType) {
      case 1: return -8 * dmgMul;   // DESPAIR
      case 2: return -20 * dmgMul;  // TERROR
      case 3: return -14 * dmgMul;  // SELF_HARM
      case 4: return 20 * healMul;  // PEACE
      case 8: return -18 * dmgMul;  // RAGE
      case 9: return -12 * dmgMul;  // HOPELESS
      case 14: return -16 * dmgMul; // TRAP
      case 16: return -6 * dmgMul;  // PAIN
      default: return 0;
    }
  }

  /**
   * Update ghost path projection
   * @param {Array} direction - [dy, dx]
   * @param {Object} game - Game state with grid, player position
   * @param {number} steps - Number of steps to project (default 3)
   */
  update(direction, game, steps = 3) {
    if (!direction || !game) {
      this.active = false;
      this.ghostPath = [];
      return;
    }

    this.active = true;
    this.direction = direction;
    this.ghostPath = [];

    const [dy, dx] = direction;
    let currentHP = game.hp;
    let py = game.player.y;
    let px = game.player.x;
    const sz = game.sz;
    // ARCH5: cap depth at MAX_PREVIEW_DEPTH (working memory limit)
    const depth = Math.min(steps, MAX_PREVIEW_DEPTH);

    for (let i = 0; i < depth; i++) {
      const ny = py + dy;
      const nx = px + dx;

      // Check bounds
      if (ny < 0 || ny >= sz || nx < 0 || nx >= sz) {
        break;
      }

      const tile = game.grid[ny][nx];

      // Check if blocked by wall
      if (tile === 5) {
        break;
      }

      const hpDelta = this.calculateHPDelta(tile, game);
      currentHP += hpDelta;

      this.ghostPath.push({
        y: ny,
        x: nx,
        tile: tile,
        hpDelta: hpDelta,
        projectedHP: currentHP
      });

      py = ny;
      px = nx;
    }

    this.projectedHP = currentHP;
  }

  /**
   * Deactivate preview
   */
  deactivate() {
    this.active = false;
    this.direction = null;
    this.ghostPath = [];
    this.projectedHP = 0;
  }

  /**
   * Get ghost path for rendering
   * @returns {Array}
   */
  getGhostPath() {
    return this.active ? this.ghostPath : [];
  }

  /**
   * Get total HP delta
   * @param {number} currentHP - Current HP
   * @returns {number}
   */
  getTotalDelta(currentHP) {
    if (!this.active || this.ghostPath.length === 0) {
      return 0;
    }
    return this.projectedHP - currentHP;
  }

  /**
   * Check if preview is active
   * @returns {boolean}
   */
  isActive() {
    return this.active && this.ghostPath.length > 0;
  }
}
