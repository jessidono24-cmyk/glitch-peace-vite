// ═══════════════════════════════════════════════════════════════════════
//  PLAY MODES SYSTEM - 13+ Radically Different Gameplay Experiences
//  Merged from GLITCH-PEACE-MEGA-FINAL archive
// ═══════════════════════════════════════════════════════════════════════

export const PLAY_MODES = {
  
  // ────────────────────────────────────────────────────────────────────
  // 1. CLASSIC ARCADE - Traditional survival
  // ────────────────────────────────────────────────────────────────────
  ARCADE: {
    id: 'arcade',
    name: "Classic Arcade",
    desc: "Traditional survival gameplay",
    config: {
      peaceMul: 1.0,
      hazardMul: 1.0,
      insightMul: 1.0,
      scoreMul: 1.2,
      enemySpeed: 1.0,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'chase',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 2. ZEN GARDEN - Meditative, no enemies
  // ────────────────────────────────────────────────────────────────────
  ZEN_GARDEN: {
    id: 'zen',
    name: "Zen Garden",
    desc: "Peaceful exploration with no threats",
    config: {
      peaceMul: 1.5,
      hazardMul: 0.0,
      insightMul: 2.0,
      scoreMul: 0.5,
      enemySpeed: 0.0,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'none',
      tileRespawn: true,
      powerupsEnabled: false,
      bossEnabled: false,
      autoHeal: 1, // HP per second
      infinitePeace: true,
      patternEcho: true,         // show movement trail
      realityChecks: true,       // gentle awareness prompts
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 3. SPEEDRUN - Race against time
  // ────────────────────────────────────────────────────────────────────
  SPEEDRUN: {
    id: 'speedrun',
    name: "Speedrun Challenge",
    desc: "Complete levels as fast as possible",
    config: {
      peaceMul: 0.8,
      hazardMul: 1.2,
      insightMul: 0.5,
      scoreMul: 2.0,
      enemySpeed: 1.3,
      gridSize: 'small',
      timeLimit: 180, // 3 minutes
    },
    mechanics: {
      enemyBehavior: 'aggressive',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: false,
      timerBonus: true,
      moveSpeedBoost: 1.2,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 4. PUZZLE MODE - Strategic planning
  // ────────────────────────────────────────────────────────────────────
  PUZZLE: {
    id: 'puzzle',
    name: "Puzzle Master",
    desc: "Limited moves, maximum strategy",
    config: {
      peaceMul: 1.0,
      hazardMul: 0.8,
      insightMul: 1.5,
      scoreMul: 1.5,
      enemySpeed: 0.0,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'none',
      tileRespawn: false,
      powerupsEnabled: false,
      bossEnabled: false,
      moveLimit: 50,
      showOptimalPath: true,
      undoEnabled: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 5. SURVIVAL HORROR - High stakes
  // ────────────────────────────────────────────────────────────────────
  SURVIVAL_HORROR: {
    id: 'horror',
    name: "Survival Horror",
    desc: "One life, darkness, relentless enemies",
    config: {
      peaceMul: 0.5,
      hazardMul: 1.5,
      insightMul: 0.8,
      scoreMul: 3.0,
      enemySpeed: 0.8,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'hunt',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      permadeath: true,
      limitedVision: 4,
      stamina: true,
      hidingSpots: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 6. ROGUELIKE - Procedural death
  // ────────────────────────────────────────────────────────────────────
  ROGUELIKE: {
    id: 'roguelike',
    name: "Roguelike Descent",
    desc: "Procedural levels, permanent upgrades",
    config: {
      peaceMul: 0.7,
      hazardMul: 1.3,
      insightMul: 1.2,
      scoreMul: 1.0,
      enemySpeed: 1.1,
      gridSize: 'random',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'random',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      permadeath: true,
      randomTileEffects: true,
      metaProgression: true,
      eliteEnemies: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 7. PATTERN TRAINING - Addiction recovery
  // ────────────────────────────────────────────────────────────────────
  PATTERN_TRAINING: {
    id: 'training',
    name: "Pattern Recognition Training",
    desc: "Therapeutic mode for addiction recovery",
    config: {
      peaceMul: 1.3,
      hazardMul: 0.7,
      insightMul: 1.5,
      scoreMul: 0.8,
      enemySpeed: 0.7,
      gridSize: 'medium',
      timeLimit: 45,
    },
    mechanics: {
      enemyBehavior: 'passive',
      tileRespawn: true,
      powerupsEnabled: true,
      bossEnabled: false,
      hazardPull: true,
      impulseBuffer: true,
      consequencePreview: true,
      patternEcho: true,
      routeAlternatives: true,
      compassionateRelapse: true,
      thresholdMonitor: true,
      realityChecks: true,
      sessionBreaks: [15, 30],
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 8. BOSS RUSH - All bosses
  // ────────────────────────────────────────────────────────────────────
  BOSS_RUSH: {
    id: 'bosses',
    name: "Boss Rush",
    desc: "All bosses, no breaks, ultimate challenge",
    config: {
      peaceMul: 2.0,
      hazardMul: 0.5,
      insightMul: 3.0,
      scoreMul: 5.0,
      enemySpeed: 1.5,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'none',
      tileRespawn: true,
      powerupsEnabled: true,
      bossEnabled: true,
      bossOnly: true,
      bossHealthScaling: 1.5,
      noPeaceRequirement: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 9. PACIFIST - No combat
  // ────────────────────────────────────────────────────────────────────
  PACIFIST: {
    id: 'pacifist',
    name: "Pacifist Path",
    desc: "Avoid all enemies, pure navigation",
    config: {
      peaceMul: 1.5,
      hazardMul: 0.3,
      insightMul: 2.0,
      scoreMul: 2.0,
      enemySpeed: 1.2,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'patrol',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: false,
      noCombat: true,
      scoreForStealth: true,
      enemyVisionCones: true,
      hidingSpots: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 10. REVERSE MODE - Inverted mechanics
  // ────────────────────────────────────────────────────────────────────
  REVERSE: {
    id: 'reverse',
    name: "Reverse Polarity",
    desc: "Peace hurts, hazards heal - everything inverted",
    config: {
      peaceMul: 1.0,
      hazardMul: 1.0,
      insightMul: 1.0,
      scoreMul: 1.5,
      enemySpeed: 1.0,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'chase',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      reversedTiles: true,
      reversedControls: false,
      mindfuck: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 11. CO-OP (Future)
  // ────────────────────────────────────────────────────────────────────
  COOP: {
    id: 'coop',
    name: "Co-operative Field",
    desc: "Two players, shared emotional field — coming soon",
    disabled: true,
    config: {
      peaceMul: 1.2,
      hazardMul: 1.2,
      insightMul: 1.0,
      scoreMul: 1.0,
      enemySpeed: 1.1,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'split',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      playerCount: 2,
      sharedEmotionalField: true,
      reviveSystem: true,
      teamScoring: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 12. RITUAL MODE - Ceremonial gameplay
  // ────────────────────────────────────────────────────────────────────
  RITUAL: {
    id: 'ritual',
    name: "Ritual Practice",
    desc: "Slow, intentional, ceremonial gameplay",
    config: {
      peaceMul: 1.0,
      hazardMul: 1.0,
      insightMul: 1.5,
      scoreMul: 1.0,
      enemySpeed: 0.5,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'orbit',
      tileRespawn: true,
      powerupsEnabled: false,
      bossEnabled: true,
      slowMotion: 0.7,
      breathingPauses: true,
      intentionalMovement: true,
      sacredGeometry: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 13. DAILY CHALLENGE - Seeded daily
  // ────────────────────────────────────────────────────────────────────
  DAILY: {
    id: 'daily',
    name: "Daily Challenge",
    desc: "New procedural challenge every 24 hours",
    config: {
      peaceMul: 'random',
      hazardMul: 'random',
      insightMul: 'random',
      scoreMul: 1.0,
      enemySpeed: 'random',
      gridSize: 'random',
      timeLimit: 600,
    },
    mechanics: {
      enemyBehavior: 'random',
      tileRespawn: 'random',
      powerupsEnabled: 'random',
      bossEnabled: 'random',
      seed: 'daily',
      leaderboard: true,
      oneAttempt: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 15. CAMPAIGN - 30-level narrative arc in 3 acts
  // ────────────────────────────────────────────────────────────────────
  CAMPAIGN: {
    id: 'campaign',
    name: "Campaign",
    desc: "30-level story: Awakening · Descent · Integration",
    config: {
      peaceMul: 1.0,
      hazardMul: 1.0,
      insightMul: 1.5,
      scoreMul: 1.2,
      enemySpeed: 1.0,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'chase',
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      compassionateRelapse: true,
      patternEcho: true,
      realityChecks: false, // enabled per-level by campaign data
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 16. NIGHTMARE 🌑 - Unforgiving maximum difficulty
  //  2× damage multiplier, predictive "hunt" enemies, 5× score reward.
  //  No compassion, no recovery tools. Not for the faint of heart.
  //  Research: optimal challenge theory (Csikszentmihalyi, 1990) —
  //  high difficulty produces peak-flow when skill matches challenge.
  // ────────────────────────────────────────────────────────────────────
  NIGHTMARE: {
    id: 'nightmare',
    name: "🌑 Nightmare",
    desc: "2× damage · predictive enemies · 5× score · no mercy",
    config: {
      peaceMul: 0.6,
      hazardMul: 2.0,
      insightMul: 0.8,
      scoreMul: 5.0,
      enemySpeed: 1.6,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'hunt',   // predictive pathfinding
      tileRespawn: false,
      powerupsEnabled: false,
      bossEnabled: true,
      permadeath: true,        // one life
      limitedVision: 5,        // fog of war
      impulseBuffer: false,
      consequencePreview: false,
      compassionateRelapse: false,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 17. RHYTHM_FLOW 🎵 - Move on the beat for bonus score
  //  80 BPM metronome tick. Move ON the beat → ×2 score per node.
  //  Miss the beat → no bonus (still safe, just fewer points).
  //  Research: beat-synchronised movement (Thaut et al., 2015) improves
  //  motor precision and emotional regulation.
  // ────────────────────────────────────────────────────────────────────
  RHYTHM_FLOW: {
    id: 'rhythm_flow',
    name: "🎵 Rhythm Flow",
    desc: "Move on the beat (80 BPM) for ×2 score bonus",
    config: {
      peaceMul: 1.2,
      hazardMul: 0.8,
      insightMul: 1.5,
      scoreMul: 2.0,
      enemySpeed: 0.9,
      gridSize: 'medium',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'chase',
      tileRespawn: true,
      powerupsEnabled: true,
      bossEnabled: false,
      rhythmMode: true,        // enable BPM beat-sync scoring
      rhythmBpm: 80,           // 80 BPM = 750ms beat interval
      beatBonusMul: 2.0,       // score multiplier when moving on beat
      patternEcho: true,
    }
  },
};

// Helper to get mode config
// Accepts both the outer key ('ARCADE') and the inner id ('arcade')
export function getModeConfig(modeName) {
  if (!modeName) return PLAY_MODES.ARCADE;
  return PLAY_MODES[modeName]
    || PLAY_MODES[String(modeName).toUpperCase()]
    || Object.values(PLAY_MODES).find(m => m.id === modeName)
    || PLAY_MODES.ARCADE;
}

// Apply mode settings to game
/**
 * Get today's Daily Challenge seed — a deterministic integer derived from the
 * ISO date string (YYYY-MM-DD). Same seed for all players on the same calendar day.
 * Uses a simple djb2-style hash so no external dependency is needed.
 * @returns {number} Seed in range [0, 2^31)
 */
export function getDailyChallengeSeed() {
  const dateStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    // djb2: hash * 33 XOR charCode
    hash = ((hash << 5) + hash) ^ dateStr.charCodeAt(i);
    hash = hash & 0x7fffffff; // keep positive 31-bit integer
  }
  return hash;
}

export function applyMode(game, mode) {
  const cfg = getModeConfig(mode);
  if (!cfg) return game;

  // Apply config multipliers
  game.peaceMul = typeof cfg.config.peaceMul === 'string' ? 1.0 : cfg.config.peaceMul;
  game.hazardMul = typeof cfg.config.hazardMul === 'string' ? 1.0 : cfg.config.hazardMul;
  game.insightMul = typeof cfg.config.insightMul === 'string' ? 1.0 : cfg.config.insightMul;
  game.scoreMul = cfg.config.scoreMul;
  
  // Apply mechanics
  if (!game.mechanics) game.mechanics = {};
  Object.assign(game.mechanics, cfg.mechanics);

  // Daily Challenge: apply deterministic seed so tile layout is reproducible for the day
  if (cfg.mechanics?.seed === 'daily') {
    game._dailySeed = getDailyChallengeSeed();
    // Use seed to deterministically pick multipliers for 'random' fields
    const rng = (offset = 0) => {
      const s = (game._dailySeed + offset) & 0x7fffffff;
      return (s % 100) / 100; // 0.0–0.99
    };
    if (typeof cfg.config.peaceMul  === 'string') game.peaceMul   = 0.5 + rng(1);
    if (typeof cfg.config.hazardMul === 'string') game.hazardMul  = 0.5 + rng(2);
    if (typeof cfg.config.insightMul === 'string') game.insightMul = 0.5 + rng(3);
  }
  
  // Apply special rules
  if (cfg.mechanics.permadeath) {
    game.maxLives = 1;
  }
  
  if (cfg.mechanics.limitedVision) {
    game.visionRadius = cfg.mechanics.limitedVision;
  }
  
  if (cfg.mechanics.moveLimit) {
    game.movesRemaining = cfg.mechanics.moveLimit;
  }

  if (cfg.mechanics.moveSpeedBoost) {
    // Grid move delay is halved by speed multiplier (faster = lower delay)
    game.moveSpeedBoost = cfg.mechanics.moveSpeedBoost;
  }

  if (cfg.config.timeLimit) {
    game.mechanics.timeLimit = cfg.config.timeLimit;
  }
  
  return game;
}

// Get list of all available modes
export function getAvailableModes() {
  return Object.keys(PLAY_MODES).map(key => ({
    id: PLAY_MODES[key].id,
    name: PLAY_MODES[key].name,
    desc: PLAY_MODES[key].desc,
    disabled: PLAY_MODES[key].disabled || false,
  }));
}
