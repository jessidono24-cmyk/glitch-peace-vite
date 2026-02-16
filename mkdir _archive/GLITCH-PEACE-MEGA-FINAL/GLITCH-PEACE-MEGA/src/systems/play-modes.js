// ═══════════════════════════════════════════════════════════════════════
//  ULTIMATE PLAY MODES - Beyond 2D Gaming
//  10+ completely different gameplay experiences in one game
// ═══════════════════════════════════════════════════════════════════════

export const PLAY_MODES = {
  
  // ────────────────────────────────────────────────────────────────────
  // 1. CLASSIC ARCADE - Traditional survival
  // ────────────────────────────────────────────────────────────────────
  ARCADE: {
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
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 3. SPEEDRUN - Race against time
  // ────────────────────────────────────────────────────────────────────
  SPEEDRUN: {
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
      timerBonus: true, // Faster = more points
      moveSpeedBoost: 1.2,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 4. PUZZLE MODE - Strategic planning
  // ────────────────────────────────────────────────────────────────────
  PUZZLE: {
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
      moveLimit: 50, // Only 50 moves per level
      showOptimalPath: true,
      undoEnabled: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 5. SURVIVAL HORROR - High stakes, limited resources
  // ────────────────────────────────────────────────────────────────────
  SURVIVAL_HORROR: {
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
      permadeath: true, // One death = game over
      limitedVision: 4, // Can only see 4 tiles around you
      stamina: true, // Sprinting drains stamina
      hidingSpots: true, // Cover tiles hide you
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 6. ROGUELIKE - Procedural death
  // ────────────────────────────────────────────────────────────────────
  ROGUELIKE: {
    name: "Roguelike Descent",
    desc: "Procedural levels, permanent upgrades",
    config: {
      peaceMul: 0.7,
      hazardMul: 1.3,
      insightMul: 1.2,
      scoreMul: 1.0,
      enemySpeed: 1.1,
      gridSize: 'random', // Changes each level
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'random', // Different each room
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      permadeath: true,
      randomTileEffects: true, // Tiles have random effects
      metaProgression: true, // Permanent unlocks between runs
      eliteEnemies: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 7. PATTERN TRAINING - Addiction recovery tool
  // ────────────────────────────────────────────────────────────────────
  PATTERN_TRAINING: {
    name: "Pattern Recognition Training",
    desc: "Therapeutic mode for addiction recovery",
    config: {
      peaceMul: 1.3,
      hazardMul: 0.7,
      insightMul: 1.5,
      scoreMul: 0.8,
      enemySpeed: 0.7,
      gridSize: 'medium',
      timeLimit: 45, // 45 minute session
    },
    mechanics: {
      enemyBehavior: 'passive',
      tileRespawn: true,
      powerupsEnabled: true,
      bossEnabled: false,
      // Recovery tools active:
      hazardPull: true, // Craving simulation
      impulseBuffer: true, // Delay training
      consequencePreview: true, // Future vision
      patternEcho: true, // Loop detection
      routeAlternatives: true, // Flexibility
      compassionateRelapse: true, // Non-punitive
      sessionBreaks: [15, 30], // Mandatory breaks
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 8. BOSS RUSH - Fight all bosses back-to-back
  // ────────────────────────────────────────────────────────────────────
  BOSS_RUSH: {
    name: "Boss Rush",
    desc: "All bosses, no breaks, ultimate challenge",
    config: {
      peaceMul: 2.0, // More healing between bosses
      hazardMul: 0.5, // Fewer hazards
      insightMul: 3.0, // High rewards
      scoreMul: 5.0,
      enemySpeed: 1.5,
      gridSize: 'large',
      timeLimit: null,
    },
    mechanics: {
      enemyBehavior: 'none', // Only bosses
      tileRespawn: true,
      powerupsEnabled: true,
      bossEnabled: true,
      bossOnly: true, // Every level is a boss
      bossHealthScaling: 1.5,
      noPeaceRequirement: true, // Just defeat boss
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 9. PACIFIST - No combat allowed
  // ────────────────────────────────────────────────────────────────────
  PACIFIST: {
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
      noCombat: true, // Touching enemy = instant fail
      scoreForStealth: true, // Bonus for not being seen
      enemyVisionCones: true,
      hidingSpots: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 10. REVERSE MODE - Collect hazards, avoid peace
  // ────────────────────────────────────────────────────────────────────
  REVERSE: {
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
      reversedTiles: true, // Peace = damage, Hazards = heal
      reversedControls: false, // Not THAT evil
      mindfuck: true, // Visual inversions
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 11. CO-OP (Future) - Two players, shared field
  // ────────────────────────────────────────────────────────────────────
  COOP: {
    name: "Co-operative Field",
    desc: "Two players, shared emotional field",
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
      enemyBehavior: 'split', // Target both players
      tileRespawn: false,
      powerupsEnabled: true,
      bossEnabled: true,
      playerCount: 2,
      sharedEmotionalField: true, // One person's emotions affect both
      reviveSystem: true, // Can revive fallen partner
      teamScoring: true,
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 12. RITUAL MODE - Ceremonial, slow, meaningful
  // ────────────────────────────────────────────────────────────────────
  RITUAL: {
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
      enemyBehavior: 'orbit', // Move in patterns
      tileRespawn: true, // Tiles slowly respawn
      powerupsEnabled: false,
      bossEnabled: true,
      slowMotion: 0.7, // Everything 30% slower
      breathingPauses: true, // Mandatory breath before collection
      intentionalMovement: true, // Hold direction to confirm
      sacredGeometry: true, // Bonus for geometric patterns
    }
  },

  // ────────────────────────────────────────────────────────────────────
  // 13. DAILY CHALLENGE - New challenge every day
  // ────────────────────────────────────────────────────────────────────
  DAILY: {
    name: "Daily Challenge",
    desc: "New procedural challenge every 24 hours",
    config: {
      peaceMul: 'random', // Changes daily
      hazardMul: 'random',
      insightMul: 'random',
      scoreMul: 1.0,
      enemySpeed: 'random',
      gridSize: 'random',
      timeLimit: 600, // 10 minutes
    },
    mechanics: {
      enemyBehavior: 'random',
      tileRespawn: 'random',
      powerupsEnabled: 'random',
      bossEnabled: 'random',
      seed: 'daily', // Same for everyone each day
      leaderboard: true, // Compare scores
      oneAttempt: true, // Only one try per day
    }
  },

};

// Helper to get mode config
export function getModeConfig(modeName) {
  return PLAY_MODES[modeName] || PLAY_MODES.ARCADE;
}

// Apply mode settings to game
export function applyMode(game, mode) {
  const cfg = getModeConfig(mode);
  
  // Apply config multipliers
  game.peaceMul = cfg.config.peaceMul;
  game.hazardMul = cfg.config.hazardMul;
  game.insightMul = cfg.config.insightMul;
  game.scoreMul = cfg.config.scoreMul;
  
  // Apply mechanics
  Object.assign(game.mechanics, cfg.mechanics);
  
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
  
  return game;
}
