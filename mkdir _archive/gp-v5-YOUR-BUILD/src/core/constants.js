// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE v5 - CONSTANTS & DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

// Tile Types
export const T = {
  VOID: 0,
  DESPAIR: 1,
  TERROR: 2,
  HARM: 3,
  PEACE: 4,
  WALL: 5,
  INSIGHT: 6,
  HIDDEN: 7,
  RAGE: 8,
  HOPELESS: 9,
  GLITCH: 10,
  ARCH: 11,
  TELE: 12,
  COVER: 13,
  TRAP: 14,
  MEM: 15,
  PAIN: 16,
};

// Tile Definitions (damage, spread, push, colors, symbols)
export const TILE_DEF = {
  [T.VOID]:     { d: 0,  s: 0, p: 0, bg: '#06060f', bd: 'rgba(255,255,255,0.04)', g: null,      sy: '' },
  [T.DESPAIR]:  { d: 8,  s: 1, p: 0, bg: '#0d0d55', bd: '#1a1aff', g: '#2233ff', sy: '↓' },
  [T.TERROR]:   { d: 20, s: 0, p: 0, bg: '#500000', bd: '#cc1111', g: '#ff2222', sy: '!' },
  [T.HARM]:     { d: 14, s: 0, p: 0, bg: '#360000', bd: '#880000', g: '#aa0000', sy: '✕' },
  [T.PEACE]:    { d: 0,  s: 0, p: 0, bg: '#002810', bd: '#00ff88', g: '#00ffcc', sy: '◈' },
  [T.WALL]:     { d: 0,  s: 0, p: 0, bg: '#0e0e18', bd: '#252535', g: null,      sy: '' },
  [T.INSIGHT]:  { d: 0,  s: 0, p: 0, bg: '#001a18', bd: '#00ddbb', g: '#00ffee', sy: '◆' },
  [T.HIDDEN]:   { d: 0,  s: 0, p: 0, bg: '#04040a', bd: 'rgba(0,200,100,0.08)', g: null, sy: '' },
  [T.RAGE]:     { d: 18, s: 0, p: 2, bg: '#3a0010', bd: '#cc0044', g: '#ff0066', sy: '▲' },
  [T.HOPELESS]: { d: 12, s: 1, p: 0, bg: '#002040', bd: '#0044cc', g: '#0066ff', sy: '~' },
  [T.GLITCH]:   { d: 5,  s: 0, p: 0, bg: '#1a0a1a', bd: '#aa00ff', g: '#dd00ff', sy: '?' },
  [T.ARCH]:     { d: 0,  s: 0, p: 0, bg: '#0a1a0a', bd: '#ffdd00', g: '#ffee44', sy: '☆' },
  [T.TELE]:     { d: 0,  s: 0, p: 0, bg: '#001820', bd: '#00aaff', g: '#00ccff', sy: '⇒' },
  [T.COVER]:    { d: 0,  s: 0, p: 0, bg: '#101018', bd: '#446688', g: null,      sy: '▪' },
  [T.TRAP]:     { d: 16, s: 0, p: 1, bg: '#1a0800', bd: '#cc6600', g: '#ff8800', sy: '×' },
  [T.MEM]:      { d: 0,  s: 0, p: 0, bg: '#06060a', bd: 'rgba(100,200,150,0.2)', g: null, sy: '·' },
  [T.PAIN]:     { d: 6,  s: 0, p: 0, bg: '#200808', bd: '#661111', g: '#880000', sy: '·' },
};

// Player Colors (FIXED - never changes)
export const PLAYER = {
  CORE: '#ffffff',      // White core
  OUTLINE: '#00e5ff',   // Cyan outline
  GLOW: '#00ccff',      // Cyan glow
};

// Grid Sizes
export const CELL = 42;
export const GAP = 2;
export const GRID_SIZES = {
  small: 10,
  medium: 13,
  large: 17,
};

// Difficulty Configurations
export const DIFF_CFG = {
  easy: {
    eSpeedBase: 1000,
    eSpeedMin: 400,
    dmgMul: 0.5,
    hazMul: 0.6,
  },
  normal: {
    eSpeedBase: 750,
    eSpeedMin: 220,
    dmgMul: 1.0,
    hazMul: 1.0,
  },
  hard: {
    eSpeedBase: 550,
    eSpeedMin: 160,
    dmgMul: 1.5,
    hazMul: 1.4,
  },
};

// Session Modes
export const SESSION_MODES = {
  UNLIMITED: {
    name: 'Unlimited Exploration',
    desc: 'No time limits · Full experience',
    timeWarnings: false,
    fatigue: false,
    sessionLimit: null,
  },
  
  TIMED: {
    name: 'Timed Practice',
    desc: 'Structured session · Set duration',
    timeWarnings: true,
    fatigue: true,
    sessionLimit: 30, // minutes
    bonusOnCompletion: true,
  },
  
  PATTERN_TRAINING: {
    name: 'Pattern Recognition Focus',
    desc: 'Recovery tool · Enhanced awareness',
    timeWarnings: true,
    fatigue: true,
    sessionLimit: 45,
    // Recovery tools enabled
    hazardPull: true,
    impulseBuffer: true,
    consequencePreview: true,
    patternEcho: true,
    routeAlternatives: true,
  },
};

// Vision Words (floating text)
export const VISION_WORDS = [
  'memory…', 'choice…', 'echo…', 'void…', 'self…',
  'signal…', 'fragment…', 'persist…', 'clarity…', 'dissolve…',
  'boundary…', 'witness…', 'anchor…', 'pattern…', 'emergence…',
  'dragon…', 'guide…', 'orb…', 'fear…', 'hope…',
  'breath…', 'pause…', 'notice…', 'release…', 'return…',
];

// Emotional synergy messages
export const SYNERGY_MESSAGES = {
  focused_force: 'Anger + Coherence → Focused Force',
  chaos_burst: 'Anger + Chaos → Destructive Burst',
  deep_insight: 'Grief + Curiosity → Deep Understanding',
  collapse_event: 'Shame + Awe → Identity Collapse',
  protective: 'Tenderness + Fear → Protective Instinct',
  resonance: 'Joy + Hope → Resonance Wave',
  dissolution: 'Despair Overwhelms',
};

// Exit affirmations (cessation machine)
export const EXIT_MESSAGES = [
  'Thank you for playing.\nYou made the choice to stop—that takes strength.',
  'Your progress is saved.\nTake care of yourself.',
  'Returning to reality.\nYou are more than this simulation.',
  'Session complete.\nYour wellbeing matters most.',
  'You played well.\nNow rest well.',
  'The pattern is visible.\nYou have the tools.',
  'Consciousness persists.\nBe gentle with yourself.',
];
