'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  PLAY MODES SYSTEM — 13 radically different gameplay experiences
//  Ported + extended from glitch-peace-vite / GLITCH-PEACE-MEGA-FINAL
//  Each mode changes multipliers, mechanics, and gameplay feel.
// ═══════════════════════════════════════════════════════════════════════

export const PLAY_MODES = {

  // 1. CLASSIC ARCADE — Traditional survival
  arcade: {
    id: 'arcade', name: 'Classic Arcade', emoji: '🕹️',
    desc: 'Traditional survival gameplay — balanced challenge',
    config: { peaceMul: 1.0, hazardMul: 1.0, insightMul: 1.0, scoreMul: 1.2, enemySpeed: 1.0, timeLimit: null },
    mechanics: { enemyBehavior: 'chase', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 2. ZEN GARDEN — Meditative, no enemies
  zen: {
    id: 'zen', name: 'Zen Garden', emoji: '🌸',
    desc: 'Peaceful exploration — no enemies, no hazard damage, infinite peace',
    config: { peaceMul: 1.5, hazardMul: 0.0, insightMul: 2.0, scoreMul: 0.5, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: null, reverseMode: false, autoHeal: 1, slowMul: 1.0 },
  },

  // 3. SPEEDRUN — Race against time
  speedrun: {
    id: 'speedrun', name: 'Speedrun', emoji: '⚡',
    desc: 'Complete dreamscapes as fast as possible — 3-minute timer',
    config: { peaceMul: 0.8, hazardMul: 1.2, insightMul: 0.5, scoreMul: 2.0, enemySpeed: 1.3, timeLimit: 180 },
    mechanics: { enemyBehavior: 'aggressive', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 4. PUZZLE — Strategic planning, limited moves
  puzzle: {
    id: 'puzzle', name: 'Puzzle Master', emoji: '🧩',
    desc: 'No enemies — but only 50 moves to collect all peace nodes',
    config: { peaceMul: 1.0, hazardMul: 0.8, insightMul: 1.5, scoreMul: 1.5, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: 50, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 5. SURVIVAL HORROR — High stakes, permadeath
  horror: {
    id: 'horror', name: 'Survival Horror', emoji: '💀',
    desc: 'High damage, fast enemies — permadeath; maximum score multiplier',
    config: { peaceMul: 0.5, hazardMul: 1.8, insightMul: 0.8, scoreMul: 3.0, enemySpeed: 1.4, timeLimit: null },
    mechanics: { enemyBehavior: 'hunt', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 6. ROGUELIKE — Procedural, no saves
  roguelike: {
    id: 'roguelike', name: 'Roguelike Descent', emoji: '🎲',
    desc: 'Randomised dreamscape sequence — harder with each dream',
    config: { peaceMul: 0.7, hazardMul: 1.3, insightMul: 1.2, scoreMul: 1.0, enemySpeed: 1.1, timeLimit: null },
    mechanics: { enemyBehavior: 'random', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 7. PATTERN TRAINING — Therapeutic recovery support
  training: {
    id: 'training', name: 'Pattern Training', emoji: '🌱',
    desc: 'Therapeutic mode — slow enemies, all recovery tools active, gentle hazards',
    config: { peaceMul: 1.3, hazardMul: 0.6, insightMul: 1.5, scoreMul: 0.8, enemySpeed: 0.6, timeLimit: null },
    mechanics: { enemyBehavior: 'passive', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 8. BOSS RUSH — All bosses, no breaks
  bosses: {
    id: 'bosses', name: 'Boss Rush', emoji: '🐉',
    desc: 'All dreamscapes spawn a boss immediately — maximum challenge',
    config: { peaceMul: 2.0, hazardMul: 0.5, insightMul: 3.0, scoreMul: 5.0, enemySpeed: 1.5, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0, forceBoss: true },
  },

  // 9. PACIFIST — Navigate without harming enemies
  pacifist: {
    id: 'pacifist', name: 'Pacifist Path', emoji: '☮️',
    desc: 'Avoid all enemies — score bonus for never touching them',
    config: { peaceMul: 1.5, hazardMul: 0.4, insightMul: 2.0, scoreMul: 2.0, enemySpeed: 1.2, timeLimit: null },
    mechanics: { enemyBehavior: 'patrol', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 10. REVERSE — Peace hurts, hazards heal
  reverse: {
    id: 'reverse', name: 'Reverse Polarity', emoji: '🔄',
    desc: 'Everything inverted — peace tiles damage, hazard tiles heal',
    config: { peaceMul: 1.0, hazardMul: 1.0, insightMul: 1.0, scoreMul: 1.5, enemySpeed: 1.0, timeLimit: null },
    mechanics: { enemyBehavior: 'chase', zenMode: false, moveLimit: null, reverseMode: true, autoHeal: 0, slowMul: 1.0 },
  },

  // 11. CO-OP — Shared emotional field (placeholder — Phase M8)
  coop: {
    id: 'coop', name: 'Co-op Field (soon)', emoji: '🤝',
    desc: 'Two players, shared emotional field — coming in Phase M8',
    config: { peaceMul: 1.2, hazardMul: 1.2, insightMul: 1.0, scoreMul: 1.0, enemySpeed: 1.1, timeLimit: null },
    mechanics: { enemyBehavior: 'split', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0 },
  },

  // 12. RITUAL — Slow, ceremonial, intentional
  ritual: {
    id: 'ritual', name: 'Ritual Practice', emoji: '🕯️',
    desc: 'Slow motion — intentional movement, extended enemy intervals',
    config: { peaceMul: 1.0, hazardMul: 1.0, insightMul: 1.5, scoreMul: 1.0, enemySpeed: 0.45, timeLimit: null },
    mechanics: { enemyBehavior: 'orbit', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 0.55 },
  },

  // 13. DAILY CHALLENGE — Seeded random daily
  daily: {
    id: 'daily', name: 'Daily Challenge', emoji: '📅',
    desc: 'New seeded configuration every 24 hours — unique each day',
    config: { peaceMul: 1.0, hazardMul: 1.0, insightMul: 1.0, scoreMul: 1.0, enemySpeed: 1.0, timeLimit: 600 },
    mechanics: { enemyBehavior: 'random', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0, daily: true },
  },

  // 14. ORNITHOLOGY — Bird-watching / nature observation
  ornithology: {
    id: 'ornithology', name: 'Bird Watching', emoji: '🐦',
    desc: 'Track bird migrations — somatic tiles become habitat spots; no hazards; meditative observation',
    config: { peaceMul: 1.8, hazardMul: 0.0, insightMul: 3.0, scoreMul: 1.2, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: null, reverseMode: false, autoHeal: 1, slowMul: 0.75, ornithology: true },
  },

  // 15. MYCOLOGY — Mycelium network mapping
  mycology: {
    id: 'mycology', name: 'Mycelium Network', emoji: '🍄',
    desc: 'Map the fungal network — hazard tiles become energy nodes; slow meditative pace; deep healing',
    config: { peaceMul: 2.0, hazardMul: 0.0, insightMul: 2.5, scoreMul: 1.0, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 0.45, mycology: true },
  },

  // 16. ARCHITECTURE — Sacred builder mode
  architecture: {
    id: 'architecture', name: 'Sacred Architecture', emoji: '🏛️',
    desc: 'Build sacred structures — GROUNDING tiles are foundations; INSIGHT unlocks blueprints; 80-move budget',
    config: { peaceMul: 1.0, hazardMul: 0.0, insightMul: 2.0, scoreMul: 1.5, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: 80, reverseMode: false, autoHeal: 0, slowMul: 0.7, architecture: true },
  },

  // 17. ALCHEMIST — Elemental transmutation mode
  alchemist: {
    id: 'alchemist', name: 'Alchemist', emoji: '⚗️',
    desc: 'Collect elemental seeds from somatic tiles and transmute hazards into peace — the Great Work in action',
    config: { peaceMul: 1.2, hazardMul: 0.4, insightMul: 2.0, scoreMul: 1.8, enemySpeed: 0.75, timeLimit: null },
    mechanics: { enemyBehavior: 'passive', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 0.85, alchemist: true },
  },

  // 18. SKYMAP — Constellation navigation (Phase M6)
  skymap: {
    id: 'skymap', name: 'Constellation Path', emoji: '✦',
    desc: 'Navigate by star constellations — connect STAR tiles to reveal sacred patterns; meditative star-gazing pace',
    config: { peaceMul: 1.5, hazardMul: 0.0, insightMul: 2.5, scoreMul: 1.3, enemySpeed: 0.0, timeLimit: null },
    mechanics: { enemyBehavior: 'none', zenMode: true, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 0.6, skymap: true },
  },

  // 19. RITUAL SPACE — Somatic + alchemy fusion (Phase M6.5)
  ritual_space: {
    id: 'ritual_space', name: 'Ritual Space', emoji: '🕯️',
    desc: 'Somatic-alchemical practice — element seeds ×2, half hazard damage, transmutation enabled; intentional movement',
    config: { peaceMul: 1.4, hazardMul: 0.3, insightMul: 2.2, scoreMul: 1.6, enemySpeed: 0.5, timeLimit: null },
    mechanics: { enemyBehavior: 'wander', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 0.7, ritual_space: true, alchemist: true },
  },

  // 20. NIGHTMARE — Maximum difficulty, no mercy
  nightmare: {
    id: 'nightmare', name: 'Nightmare', emoji: '🌑',
    desc: 'Maximum intensity — 2× damage, fast predictive enemies, no healing from peace, max score reward',
    config: { peaceMul: 0.4, hazardMul: 2.0, insightMul: 1.0, scoreMul: 5.0, enemySpeed: 1.65, timeLimit: null },
    mechanics: { enemyBehavior: 'predictive', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0, nightmare: true },
  },

  // 21. RHYTHM — Beat-synchronised movement scoring
  rhythm: {
    id: 'rhythm', name: 'Rhythm Flow', emoji: '🎵',
    desc: 'Move in sync with the beat for bonus score — 80 BPM pulse, on-beat movement ×2 score',
    config: { peaceMul: 1.3, hazardMul: 0.8, insightMul: 1.5, scoreMul: 1.8, enemySpeed: 0.9, timeLimit: null },
    mechanics: { enemyBehavior: 'patrol', zenMode: false, moveLimit: null, reverseMode: false, autoHeal: 0, slowMul: 1.0, rhythm: true },
  },
};

// Ordered list for options cycling
export const PLAY_MODE_LIST = Object.keys(PLAY_MODES);

// Apply mode settings to an initialised game object
export function applyPlayMode(game, modeId) {
  const mode = PLAY_MODES[modeId] || PLAY_MODES.arcade;
  const cfg  = mode.config;
  const mech = mode.mechanics;

  // Daily challenge: seed with today's date to get deterministic modifiers
  if (mech.daily) {
    const seed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10) % 1000;
    const rngVal = (x) => 0.5 + 0.5 * Math.sin(seed * x);
    cfg.hazardMul  = 0.6 + rngVal(2.1) * 1.4;
    cfg.peaceMul   = 0.7 + rngVal(3.7) * 1.0;
    cfg.enemySpeed = 0.6 + rngVal(5.3) * 1.2;
  }

  game.playModeId      = mode.id;
  game.playModeName    = mode.name;
  game.dmgMul          = typeof cfg.hazardMul  === 'number' ? cfg.hazardMul  : 1.0;
  game.insightMulMode  = typeof cfg.insightMul === 'number' ? cfg.insightMul : 1.0;
  game.scoreMulMode    = typeof cfg.scoreMul   === 'number' ? cfg.scoreMul   : 1.0;
  game.enemySpeedMul   = typeof cfg.enemySpeed === 'number' ? cfg.enemySpeed : 1.0;
  game.zenMode         = !!mech.zenMode;
  game.autoHealRate    = mech.autoHeal || 0;
  game.reverseMode     = !!mech.reverseMode;
  game.ritualSlowMul   = mech.slowMul || 1.0;
  game.forceBoss       = !!mech.forceBoss;

  // Move limit (puzzle mode)
  if (mech.moveLimit) {
    game.moveLimit = mech.moveLimit;
    game.movesRemaining = mech.moveLimit;
  }

  // Speedrun countdown (convert seconds to ms)
  if (cfg.timeLimit) {
    game.speedrunTimer  = cfg.timeLimit * 1000;
    game.speedrunActive = true;
  }

  // Zen mode: remove all enemies and hazard damage
  if (game.zenMode) {
    game.enemies = [];
    game.dmgMul  = 0;
  }

  // Force boss spawn in Boss Rush — use proper boss system type
  if (game.forceBoss && !game.boss) {
    const sz = game.sz;
    const totalHp = 1010 + game.level * 40; // matches fear_guardian total
    game.boss = {
      y: Math.floor(sz / 2), x: Math.floor(sz / 2),
      hp: totalHp, maxHp: totalHp,
      timer: 0, stunTimer: 0, phase: 'chase', phaseTimer: 600, type: 'fear_guardian',
      phaseIdx: 0, phaseLabel: 'AWAKENING', color: '#ff00aa', glow: '#ff00aa', speedMs: 340,
    };
  }

  // ── Ornithology: clear hazards, add habitat spots ──────────────────
  if (mech.ornithology && game.grid) {
    const sz = game.sz;
    const habTiles = [17, 18, 19, 20]; // somatic tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        if ([1,2,3,8,9,10,14,16].includes(v)) game.grid[y][x] = 0; // clear hazards
      }
    }
    // Seed habitat spots
    let hab = 0, itr = 0;
    while (hab < 6 && itr < 999) {
      itr++;
      const hy = Math.floor(Math.random() * sz), hx = Math.floor(Math.random() * sz);
      if (game.grid[hy][hx] === 0) { game.grid[hy][hx] = habTiles[hab % habTiles.length]; hab++; }
    }
    game.playModeLabel = '🐦  BIRD WATCHING  ·  observe · be still · notice';
  }

  // ── Mycology: replace hazards with energy/breath tiles ────────────
  if (mech.mycology && game.grid) {
    const sz = game.sz;
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        if ([1,2,3,8,9,10,14,16].includes(v)) {
          game.grid[y][x] = Math.random() < 0.5 ? 19 : 18; // ENERGY_NODE or BREATH_SYNC
        }
      }
    }
    game.playModeLabel = '🍄  MYCELIUM  ·  grow · connect · integrate';
  }

  // ── Architecture: replace hazards with GROUNDING / COVER ──────────
  if (mech.architecture && game.grid) {
    const sz = game.sz;
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        if ([1,2,3,8,9,14,16].includes(v)) {
          game.grid[y][x] = Math.random() < 0.6 ? 20 : 13; // GROUNDING or COVER
        }
      }
    }
    game.playModeLabel = '🏛️  ARCHITECTURE  ·  build · ground · endure';
  }

  // ── Alchemist: seed element tiles from somatic pool; keep some hazards ─
  if (mech.alchemist && game.grid) {
    const sz = game.sz;
    // Replace SELF_HARM/RAGE with somatic element tiles (gentler hazard set)
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        if (v === 3 || v === 8) { // SELF_HARM or RAGE → element seed tiles
          const pick = [17, 18, 19, 20][Math.floor(Math.random() * 4)];
          game.grid[y][x] = pick;
        }
      }
    }
    // Seed extra somatic tiles as element sources
    let el = 0, itr = 0;
    const elTiles = [19, 18, 20, 17]; // ENERGY_NODE, BREATH_SYNC, GROUNDING, BODY_SCAN
    while (el < 8 && itr < 999) {
      itr++;
      const ey = Math.floor(Math.random() * sz), ex = Math.floor(Math.random() * sz);
      if (game.grid[ey][ex] === 0) { game.grid[ey][ex] = elTiles[el % elTiles.length]; el++; }
    }
    game.playModeLabel = '⚗️  ALCHEMIST  ·  collect · transmute · the Great Work';
  }

  // ── Skymap: clear all hazards; seed INSIGHT + ARCHETYPE as star nodes ─
  if (mech.skymap && game.grid) {
    const sz = game.sz;
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        if ([1,2,3,8,9,10,14,16].includes(v)) game.grid[y][x] = 0; // clear all hazards
      }
    }
    // Seed constellation star nodes (INSIGHT) and archetype nodes (ARCHETYPE)
    let stars = 0, itr = 0;
    while (stars < 10 && itr < 999) {
      itr++;
      const starY = Math.floor(Math.random() * sz), sx = Math.floor(Math.random() * sz);
      if (game.grid[starY][sx] === 0) {
        game.grid[starY][sx] = stars % 3 === 0 ? 11 : 6; // ARCHETYPE or INSIGHT
        stars++;
      }
    }
    game.playModeLabel = '✦  CONSTELLATION PATH  ·  navigate · connect · skymap';
  }

  // ── Ritual Space: somatic + alchemy hybrid ─────────────────────────────
  if (mech.ritual_space && game.grid) {
    const sz = game.sz;
    const elTiles = [17, 18, 19, 20]; // T.BODY_SCAN, T.BREATH_SYNC, T.ENERGY_NODE, T.GROUNDING (somatic, each maps to an element)
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = game.grid[y][x];
        // Replace the most severe hazards with somatic/element tiles; keep mild hazards
        if (v === 3 || v === 8) { // SELF_HARM, RAGE → somatic element tile
          game.grid[y][x] = elTiles[Math.floor(Math.random() * elTiles.length)];
        }
      }
    }
    // Seed extra somatic element tiles (more than alchemist alone)
    let el = 0, itr2 = 0;
    const elCycle = [19, 18, 20, 17, 19, 18]; // ENERGY_NODE, BREATH_SYNC, GROUNDING, BODY_SCAN ×2 (element tiles; 12 total)
    while (el < 12 && itr2 < 999) {
      itr2++;
      const ey = Math.floor(Math.random() * sz), ex = Math.floor(Math.random() * sz);
      if (game.grid[ey][ex] === 0) { game.grid[ey][ex] = elCycle[el % elCycle.length]; el++; }
    }
    game.playModeLabel = '🕯️  RITUAL SPACE  ·  somatic · alchemical · seeds ×2';
    // Double element seed yield flag (checked in main.js during tile step)
    game.ritualSeedMultiplier = 2;
  }

  // ── Nightmare: ultra-hard — scale spread timer, reinforce enemy count ──
  if (mech.nightmare && game.grid) {
    // Halve spread timer so DESPAIR/HOPELESS spread twice as fast
    game.spreadTimer = 1000;
    // Peace tiles don't heal in nightmare mode
    game.nightmareMode = true;
    game.playModeLabel = '🌑  NIGHTMARE  ·  no mercy · maximum intensity';
  }

  // ── Rhythm: seed beat state for on-beat scoring bonus ──────────────────
  if (mech.rhythm) {
    // 80 BPM = 750ms per beat
    game.rhythmBpm     = 80;
    game.rhythmBeatMs  = 750;
    game.rhythmTimer   = 750; // countdown to next beat
    game.rhythmWindow  = 140; // ±140ms counts as "on beat"
    game.rhythmStreak  = 0;
    game.playModeLabel = '🎵  RHYTHM FLOW  ·  move on the beat · bonus ×2';
  }

  return game;
}

export function getPlayModeMeta(modeId) {
  const m = PLAY_MODES[modeId] || PLAY_MODES.arcade;
  return { id: m.id, name: m.name, emoji: m.emoji, desc: m.desc };
}
