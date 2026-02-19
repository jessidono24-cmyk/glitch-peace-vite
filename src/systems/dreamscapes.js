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
  WILDERNESS: {
    id: 'WILDERNESS',
    label: 'The Wilderness',
    flavor: 'Nature heals.\nThe forest remembers.',
    bg: '#020802',
    ambient: 'rgba(0,200,50,0.04)',
    accent: '#44ff88',
    tileBias: { [T.PEACE]: 8, [T.MEM]: 6, [T.COVER]: 4, [T.TERROR]: -4 },
  },
  ABYSS: {
    id: 'ABYSS',
    label: 'The Abyss',
    flavor: 'Empty cosmic silence.\nAll patterns dissolve.',
    bg: '#000002',
    ambient: null,
    accent: '#2233aa',
    tileBias: { [T.VOID]: 0, [T.GLITCH]: 8, [T.DESPAIR]: 4, [T.PEACE]: -3 },
  },
  CRYSTAL: {
    id: 'CRYSTAL',
    label: 'The Crystal',
    flavor: 'Geometric perfection.\nEvery pattern has order.',
    bg: '#000608',
    ambient: 'rgba(100,220,255,0.04)',
    accent: '#00ccee',
    tileBias: { [T.INSIGHT]: 8, [T.ARCH]: 4, [T.MEM]: 4, [T.WALL]: 4 },
  },
  // ── Canonical dreamscapes from glitch-peace lore ─────────────────────
  NEIGHBORHOOD: {
    id: 'NEIGHBORHOOD',
    label: 'Childhood Neighborhood',
    flavor: 'Familiar streets, faded\nmemories, hidden doors.',
    bg: '#04030a',
    ambient: 'rgba(255,200,80,0.03)',
    accent: '#ffcc55',
    // Lots of memory tiles (nostalgia), cover tiles (comfort), fewer hazards
    tileBias: { [T.MEM]: 10, [T.COVER]: 6, [T.PEACE]: 4, [T.TERROR]: -4, [T.RAGE]: -2 },
  },
  AZTEC: {
    id: 'AZTEC',
    label: 'Aztec Chase Labyrinth',
    flavor: 'Stone corridors,\nancient pursuit.',
    bg: '#060200',
    ambient: 'rgba(200,80,0,0.05)',
    accent: '#ff6600',
    // Dense walls forming maze-like corridors; enemies more numerous; insight tiles (hidden knowledge)
    tileBias: { [T.WALL]: 12, [T.INSIGHT]: 6, [T.HARM]: 4, [T.TRAP]: 4, [T.PEACE]: -2 },
  },
  ORB_ESCAPE: {
    id: 'ORB_ESCAPE',
    label: 'Orb Escape Event',
    flavor: 'Phase between worlds.\nThe orb remembers the way.',
    bg: '#000108',
    ambient: 'rgba(160,100,255,0.06)',
    accent: '#aa66ff',
    // Teleport tiles and glitch portals dominate; many hidden tiles; peace sparse
    tileBias: { [T.TELE]: 8, [T.GLITCH]: 6, [T.HIDDEN]: 8, [T.ARCH]: 4, [T.PEACE]: -3 },
  },
  // ── 12th Dreamscape: The Mirror ──────────────────────────────────────────
  // The self-reflection world. Every tile seen is part of the self.
  // Research: Jungian shadow integration — what we reject in ourselves
  // mirrors what we encounter in the external world (Jung, 1951 Aion §14).
  // COVER tiles (safe self-knowledge) + MEM tiles (memory integration) +
  // reduced HARM/TERROR — this is a gentle confrontation, not punishment.
  MIRROR: {
    id: 'MIRROR',
    label: 'The Mirror',
    flavor: 'Every shadow you\nmeet is your own.',
    bg: '#040210',
    ambient: 'rgba(200,180,255,0.04)',
    accent: '#cc99ff',
    tileBias: { [T.COVER]: 6, [T.MEM]: 8, [T.INSIGHT]: 6, [T.HARM]: -4, [T.TERROR]: -3, [T.GLITCH]: 4 },
  },

  // ── 13th Dreamscape: Mountain Dragon Realm ────────────────────────────────
  // The fear guardian realm. A jagged mountain world where a dragon patrols.
  // Lots of walls forming narrow canyons; TERROR and HARM tiles dominant;
  // but also rich in INSIGHT — the dragon guards hidden wisdom.
  MOUNTAIN_DRAGON: {
    id: 'MOUNTAIN_DRAGON',
    label: 'Mountain Dragon Realm',
    flavor: 'Ancient guardian circles.\nWisdom hidden in stone.',
    bg: '#050202',
    ambient: 'rgba(255,50,10,0.04)',
    accent: '#ff5500',
    tileBias: { [T.WALL]: 14, [T.TERROR]: 6, [T.HARM]: 4, [T.INSIGHT]: 8, [T.PEACE]: -2 },
  },

  // ── 14th Dreamscape: Summit Realm ────────────────────────────────────────
  // Multi-plane vertical world at the top of consciousness.
  // Sparse tiles, pure energy — ARCH (archetype) tiles abundant,
  // few enemies, but each hazard is more intense at altitude.
  SUMMIT: {
    id: 'SUMMIT',
    label: 'The Summit',
    flavor: 'Above all planes.\nPattern and silence merge.',
    bg: '#020308',
    ambient: 'rgba(180,220,255,0.05)',
    accent: '#aaddff',
    tileBias: { [T.ARCH]: 10, [T.INSIGHT]: 6, [T.VOID]: 0, [T.WALL]: -4, [T.HOPELESS]: -3, [T.PEACE]: 4 },
  },

  // ── 15th Dreamscape: Leaping Field ────────────────────────────────────────
  // Orb mobility theme — open expanse, teleport nodes everywhere.
  // Research: spatial navigation (O'Keefe, 1971) — open-field exploration
  // activates place cells and builds cognitive maps for real-world navigation.
  LEAPING_FIELD: {
    id: 'LEAPING_FIELD',
    label: 'The Leaping Field',
    flavor: 'Open sky, no walls.\nEvery step a flight.',
    bg: '#020608',
    ambient: 'rgba(0,180,255,0.04)',
    accent: '#00ccff',
    tileBias: { [T.TELE]: 10, [T.PEACE]: 8, [T.GLITCH]: 4, [T.WALL]: -8, [T.TRAP]: -3 },
  },

  // ── 16th Dreamscape: The Integration ──────────────────────────────────────
  // All dualities resolved. Harmony of all tile types — small amounts
  // of everything, balanced. The final dreamscape of the arc.
  // Research: psychological integration (Rogers, 1961) — the fully
  // functioning person holds contradictions without fragmentation.
  INTEGRATION: {
    id: 'INTEGRATION',
    label: 'The Integration',
    flavor: 'All patterns held.\nNothing left unresolved.',
    bg: '#030308',
    ambient: 'rgba(100,255,180,0.05)',
    accent: '#66ffcc',
    tileBias: { [T.PEACE]: 4, [T.INSIGHT]: 4, [T.MEM]: 4, [T.ARCH]: 4, [T.DESPAIR]: -2, [T.TERROR]: -2, [T.HARM]: -2 },
  },

  // ── 17th Dreamscape: Modern Bedroom ───────────────────────────────────────
  // The chaos-cover dream. Interior space with furniture-like walls,
  // chaotic glitch presence. A familiar yet unsettling setting.
  // Research: Hartmann (1995) — anxiety dream frequency linked to
  // current life stress; working through bedroom dreams reduces stress.
  BEDROOM: {
    id: 'BEDROOM',
    label: 'The Bedroom',
    flavor: 'Familiar walls shift.\nNothing stays still.',
    bg: '#03030a',
    ambient: 'rgba(80,0,120,0.05)',
    accent: '#9955ff',
    tileBias: { [T.WALL]: 10, [T.COVER]: 8, [T.GLITCH]: 6, [T.MEM]: 6, [T.PEACE]: -2 },
  },

  // ── 18th Dreamscape: Void State ───────────────────────────────────────────
  // Pure dissolution. Almost entirely void — a meditative emptiness
  // with rare, precious peace nodes. Tests equanimity.
  // Research: cessation meditation (Mahasi Sayadaw, 1971) — the void
  // state (nirodha) is experienced as profound stillness and insight.
  VOID_STATE: {
    id: 'VOID_STATE',
    label: 'Void State',
    flavor: 'Nothing stirs.\nEverything is possible.',
    bg: '#000001',
    ambient: null,
    accent: '#334466',
    tileBias: { [T.VOID]: 0, [T.PEACE]: -4, [T.INSIGHT]: -3, [T.GLITCH]: -4, [T.ARCH]: -3, [T.WALL]: -8 },
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
