// ═══════════════════════════════════════════════════════════
// CONSTANTS - All game enums and definitions
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

export const TILE_TYPES = {
  VOID: 0,
  WALL: 1,
  PEACE: 2,
  DESPAIR: 3,
  TERROR: 4,
  SELF_HARM: 5
  
  // 🔌 LAYER 2 EXPANSION: Add more tiles
  // RAGE: 6,
  // INSIGHT: 7,
  // HOPELESS: 8,
  // GLITCH: 9,
  // etc.
};

export const TILE_DEFS = {
  [TILE_TYPES.VOID]: {
    symbol: '·',
    bg: '#000',
    border: '#111',
    glow: null,
    dmg: 0,
    heal: 0,
    solid: false
  },
  [TILE_TYPES.WALL]: {
    symbol: '█',
    bg: '#222',
    border: '#444',
    glow: null,
    dmg: 0,
    heal: 0,
    solid: true
  },
  [TILE_TYPES.PEACE]: {
    symbol: '●',
    bg: '#002200',
    border: '#00ff88',
    glow: '#00ff88',
    dmg: 0,
    heal: 20,
    score: 150,
    collect: true
  },
  [TILE_TYPES.DESPAIR]: {
    symbol: '▓',
    bg: '#220000',
    border: '#440000',
    glow: null,
    dmg: 8,
    heal: 0
  },
  [TILE_TYPES.TERROR]: {
    symbol: '▲',
    bg: '#330000',
    border: '#880000',
    glow: null,
    dmg: 20,
    heal: 0
  },
  [TILE_TYPES.SELF_HARM]: {
    symbol: '✕',
    bg: '#440000',
    border: '#aa0000',
    glow: null,
    dmg: 14,
    heal: 0
  }
};

export const DIFFICULTY = {
  STILLNESS: {
    name: 'Stillness',
    enemyCount: 0,
    hazardMul: 0.5,
    peaceMul: 1.2,
    desc: 'No enemies. Pure exploration.'
  },
  BALANCED: {
    name: 'Balanced',
    enemyCount: 3,
    hazardMul: 1.0,
    peaceMul: 1.0,
    desc: 'Standard challenge.'
  }
  
  // 🔌 LAYER 2 EXPANSION: Add more difficulties
  // CONTEMPLATIVE: {...},
  // TRIAL: {...}
};

export const GRID_SIZES = {
  SMALL: 10,
  MEDIUM: 14,
  LARGE: 20
};

export const COLORS = {
  PLAYER: '#00e5ff',  // NEVER changes - stable anchor
  PEACE: '#00ff88',
  ENEMY: '#ff6600',
  DAMAGE: '#ff0000',
  UI_PRIMARY: '#00ff88',
  UI_SECONDARY: '#00aa66',
  BG: '#000'
};

export const SETTINGS_OPTIONS = {
  gridSize: ['10×10', '14×14', '20×20'],
  difficulty: ['Stillness', 'Balanced'],
  highContrast: ['Off', 'On'],
  reducedMotion: ['Off', 'On'],
  particles: ['Off', 'On']
};
