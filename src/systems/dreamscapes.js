// ═══════════════════════════════════════════════════════════════════════
//  DREAMSCAPES - Visual and mechanical themes for each playable world
//  Each dreamscape changes the look, feel, and tile distribution.
// ═══════════════════════════════════════════════════════════════════════

import { T } from '../core/constants.js';

/**
 * DREAMSCAPE_THEMES defines each selectable world:
 *   bg       - canvas clear color (sky / deep background)
 *   ambient  - semi-transparent overlay tint drawn before tiles
 *   accent   - highlight colour used for UI / particles
 *   flavor   - short descriptive text shown in menu
 *   tileBias - tile-type overrides applied after grid generation
 *              { tileType: extraCount }  (can be negative to reduce)
 */
export const DREAMSCAPE_THEMES = {
  RIFT: {
    id: 'RIFT',
    label: 'The Rift',
    flavor: 'A fractured space\nwhere logic bends.',
    bg: '#03020f',
    ambient: 'rgba(0,180,255,0.04)',
    accent: '#00e5ff',
    tileBias: { [T.GLITCH]: 6, [T.TERROR]: 2 },
  },
  LODGE: {
    id: 'LODGE',
    label: 'The Lodge',
    flavor: 'A refuge where\ntime moves gently.',
    bg: '#060a04',
    ambient: 'rgba(0,255,100,0.05)',
    accent: '#00ff88',
    tileBias: { [T.PEACE]: 6, [T.MEM]: 4, [T.DESPAIR]: -4 },
  },
  WHEEL: {
    id: 'WHEEL',
    label: 'The Wheel',
    flavor: 'Cycles of attachment\nand release.',
    bg: '#04040e',
    ambient: 'rgba(80,0,200,0.05)',
    accent: '#8844ff',
    tileBias: { [T.HOPELESS]: 4, [T.INSIGHT]: 4, [T.ARCH]: 2 },
  },
  DUAT: {
    id: 'DUAT',
    label: 'The Duat',
    flavor: 'Shadow journey through\nthe Egyptian underworld.',
    bg: '#020402',
    ambient: 'rgba(255,180,0,0.04)',
    accent: '#ffcc00',
    tileBias: { [T.HIDDEN]: 8, [T.INSIGHT]: 4, [T.HARM]: 2 },
  },
  TOWER: {
    id: 'TOWER',
    label: 'The Tower',
    flavor: 'Hermetic order.\nSeven universal laws.',
    bg: '#050508',
    ambient: 'rgba(220,220,255,0.03)',
    accent: '#ddddff',
    tileBias: { [T.ARCH]: 4, [T.WALL]: 8, [T.COVER]: 4 },
  },
};

/** Returns the theme for a given dreamscape ID, falling back to RIFT. */
export function getDreamscapeTheme(id) {
  return DREAMSCAPE_THEMES[id] || DREAMSCAPE_THEMES.RIFT;
}

/** Returns all dreamscapes as an array (used by the menu). */
export function listDreamscapes() {
  return Object.values(DREAMSCAPE_THEMES);
}

// Maximum placement attempts per tile = abs(delta) * this factor.
// Chosen large enough to handle sparse grids but avoids infinite loops.
const BIAS_MAX_ATTEMPTS = 20;

/**
 * Apply tile bias for a dreamscape to an already-generated grid.
 * Adds or removes tiles of specific types by randomly placing / replacing them.
 */
export function applyDreamscapeBias(gameState, dreamscapeId) {
  const theme = getDreamscapeTheme(dreamscapeId);
  if (!theme.tileBias) return;

  const sz = gameState.gridSize;
  const grid = gameState.grid;
  if (!grid || !sz) return;

  for (const [tileType, delta] of Object.entries(theme.tileBias)) {
    const type = parseInt(tileType, 10);
    const count = Math.abs(delta);
    const add = delta > 0;

    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * BIAS_MAX_ATTEMPTS) {
      attempts++;
      const x = 1 + Math.floor(Math.random() * (sz - 2));
      const y = 1 + Math.floor(Math.random() * (sz - 2));
      const current = grid[y]?.[x];
      if (current === undefined) continue;

      if (add && current === T.VOID) {
        grid[y][x] = type;
        placed++;
      } else if (!add && current === type) {
        grid[y][x] = T.VOID;
        placed++;
      }
    }
  }
}
