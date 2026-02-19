// ═══════════════════════════════════════════════════════════════════════
//  CAMPAIGN STORY - Phase 3
//  30-level narrative arc in 3 acts.
//  Each act has a different gameplay style and culminates in a boss.
// ═══════════════════════════════════════════════════════════════════════

// ─── ACT STRUCTURE ────────────────────────────────────────────────────────
//
//  Act 1: Awakening (Levels 1–10) — The Rift Dreamscape
//    Consciousness first stirs. Recognizing patterns. Learning the rules.
//
//  Act 2: Descent (Levels 11–20) — The Duat Dreamscape
//    Shadow work. Facing patterns of harm. The relapse compassion arc.
//
//  Act 3: Integration (Levels 21–30) — The Crystal Dreamscape
//    Synthesis. Lucid mastery. Return with insight.
//

const ACT_1_INTRO = {
  act: 1,
  title: 'AWAKENING',
  subtitle: 'The first stirrings of awareness',
  dreamscape: 'RIFT',
  playMode: 'PATTERN_TRAINING',
  colorTheme: '#00e5ff',
};

const ACT_2_INTRO = {
  act: 2,
  title: 'DESCENT',
  subtitle: 'Into shadow, into truth',
  dreamscape: 'DUAT',
  playMode: 'ARCADE',
  colorTheme: '#ffcc00',
};

const ACT_3_INTRO = {
  act: 3,
  title: 'INTEGRATION',
  subtitle: 'The return with understanding',
  dreamscape: 'CRYSTAL',
  playMode: 'ZEN_GARDEN',
  colorTheme: '#00ccee',
};

export const CAMPAIGN_LEVELS = [
  // ──── ACT 1: AWAKENING ────
  {
    level: 1, act: 1,
    title: 'First Light',
    narrative: 'The pattern begins to move.\nMove toward the light.',
    dreamscape: 'RIFT',
    specialObjective: null,
    cosmology: null,
  },
  {
    level: 2, act: 1,
    title: 'Patterns Emerge',
    narrative: 'Every tile has its nature.\nLearn to read them.',
    dreamscape: 'RIFT',
    specialObjective: { type: 'no_hazards', label: 'Touch no hazard tiles' },
    cosmology: null,
  },
  {
    level: 3, act: 1,
    title: 'The First Impulse',
    narrative: 'Something pulls you toward danger.\nPause. Notice. Choose.',
    dreamscape: 'RIFT',
    specialObjective: null,
    cosmology: 'wu_wei_flow',
    mechanicsOverride: { impulseBuffer: true },
  },
  {
    level: 4, act: 1,
    title: 'What Lies Hidden',
    narrative: 'Not everything is visible.\nPatience reveals what haste cannot.',
    dreamscape: 'DUAT',
    specialObjective: { type: 'reveal_all_hidden', label: 'Reveal all hidden tiles' },
    cosmology: null,
  },
  {
    level: 5, act: 1,
    title: 'Act 1 Boss: THE PATTERN ECHO',
    narrative: 'Your own movement patterns\nhave become an adversary.',
    dreamscape: 'RIFT',
    isBossLevel: true,
    specialObjective: { type: 'defeat_boss', label: 'Collect all peace while boss roams' },
    cosmology: null,
  },
  {
    level: 6, act: 1,
    title: 'Memory Traces',
    narrative: 'You have been here before.\nThe path remembers you.',
    dreamscape: 'LODGE',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { patternEcho: true },
  },
  {
    level: 7, act: 1,
    title: 'The Body Knows',
    narrative: 'Your body holds wisdom\nyour mind has forgotten.',
    dreamscape: 'WILDERNESS',
    specialObjective: null,
    cosmology: 'chakra_realm',
  },
  {
    level: 8, act: 1,
    title: 'Cycles',
    narrative: 'Notice the loop.\nBreak it gently.',
    dreamscape: 'WHEEL',
    specialObjective: { type: 'no_revisit', label: 'Do not revisit the same tile twice' },
    cosmology: 'wheel_of_becoming',
  },
  {
    level: 9, act: 1,
    title: 'Still Point',
    narrative: 'In stillness, the pattern clarifies.\nDo nothing to achieve everything.',
    dreamscape: 'LODGE',
    specialObjective: { type: 'flow_bonus', label: 'Earn 500 flow bonus points' },
    cosmology: 'wu_wei_flow',
  },
  {
    level: 10, act: 1,
    title: 'Act 1 Complete: AWAKENED',
    narrative: 'You have begun to see.\nThe journey descends.',
    dreamscape: 'RIFT',
    isActComplete: true,
    specialObjective: null,
    cosmology: null,
  },

  // ──── ACT 2: DESCENT ────
  {
    level: 11, act: 2,
    title: 'Into Shadow',
    narrative: 'What you fear is what\nyou need to understand.',
    dreamscape: 'DUAT',
    specialObjective: null,
    cosmology: 'egyptian_duat',
  },
  {
    level: 12, act: 2,
    title: 'The Craving',
    narrative: 'The hazard tiles shine\nwith a terrible attractiveness.',
    dreamscape: 'DUAT',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { impulseBuffer: true, consequencePreview: true },
  },
  {
    level: 13, act: 2,
    title: 'Relapse',
    narrative: 'You fell. You always had\nthe chance to rise.',
    dreamscape: 'DUAT',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { compassionateRelapse: true },
  },
  {
    level: 14, act: 2,
    title: 'Dark Night',
    narrative: 'The light is dim.\nBut it has not gone out.',
    dreamscape: 'ABYSS',
    specialObjective: { type: 'survive_time', label: 'Survive 60 seconds', targetMs: 60000 },
    cosmology: null,
    mechanicsOverride: { visionRadius: 3 },
  },
  {
    level: 15, act: 2,
    title: 'Act 2 Boss: THE SHADOW SELF',
    narrative: 'It moves as you move.\nYour deepest patterns manifest.',
    dreamscape: 'DUAT',
    isBossLevel: true,
    specialObjective: { type: 'defeat_boss', label: 'Face your shadow' },
    cosmology: 'egyptian_duat',
  },
  {
    level: 16, act: 2,
    title: 'The Root',
    narrative: 'Everything begins\nwhere the pattern started.',
    dreamscape: 'DUAT',
    specialObjective: null,
    cosmology: 'chakra_realm',
  },
  {
    level: 17, act: 2,
    title: 'All Paths',
    narrative: 'There are always alternatives.\nSee them clearly.',
    dreamscape: 'TOWER',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { routeAlternatives: true },
  },
  {
    level: 18, act: 2,
    title: 'The Tipping Point',
    narrative: 'How close you came,\nhow many times.',
    dreamscape: 'DUAT',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { thresholdMonitor: true },
  },
  {
    level: 19, act: 2,
    title: 'Compassion Rising',
    narrative: 'Be as kind to yourself\nas you would be to another.',
    dreamscape: 'LODGE',
    specialObjective: null,
    cosmology: 'sufi_path',
  },
  {
    level: 20, act: 2,
    title: 'Act 2 Complete: DESCENDED',
    narrative: 'You have met your shadow.\nAnd survived.',
    dreamscape: 'DUAT',
    isActComplete: true,
    specialObjective: null,
    cosmology: null,
  },

  // ──── ACT 3: INTEGRATION ────
  {
    level: 21, act: 3,
    title: 'The Synthesis',
    narrative: 'Light and shadow both\nare part of the whole.',
    dreamscape: 'CRYSTAL',
    specialObjective: null,
    cosmology: 'hermetic_ladder',
  },
  {
    level: 22, act: 3,
    title: 'Dream Signs',
    narrative: 'You recognize the symbols\nthat appear in your sleep.',
    dreamscape: 'CRYSTAL',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { patternEcho: true, realityChecks: true },
  },
  {
    level: 23, act: 3,
    title: 'The Polarity Dance',
    narrative: 'Neither force nor surrender.\nThe middle path.',
    dreamscape: 'CRYSTAL',
    specialObjective: null,
    cosmology: 'tantric_union',
  },
  {
    level: 24, act: 3,
    title: 'Lucid Ground',
    narrative: 'You are aware that you are aware.\nThis is the practice.',
    dreamscape: 'CRYSTAL',
    specialObjective: { type: 'lucidity', label: 'Reach 75% lucidity', targetLucidity: 75 },
    cosmology: null,
    mechanicsOverride: { realityChecks: true },
  },
  {
    level: 25, act: 3,
    title: 'Act 3 Boss: THE PATTERN GUARDIAN',
    narrative: 'The final test:\nthe full pattern, fully seen.',
    dreamscape: 'CRYSTAL',
    isBossLevel: true,
    specialObjective: { type: 'defeat_boss', label: 'Defeat the guardian with full lucidity' },
    cosmology: 'i_ching_hexagrams',
  },
  {
    level: 26, act: 3,
    title: 'The World Tree',
    narrative: 'All realms connected.\nYou are the thread.',
    dreamscape: 'WILDERNESS',
    specialObjective: null,
    cosmology: 'world_tree',
  },
  {
    level: 27, act: 3,
    title: 'The Breath',
    narrative: 'Return to the body.\nBecome rooted in presence.',
    dreamscape: 'WILDERNESS',
    specialObjective: null,
    cosmology: null,
    mechanicsOverride: { breathingPauses: true },
  },
  {
    level: 28, act: 3,
    title: 'Recognition',
    narrative: 'You know this pattern.\nYou have always known.',
    dreamscape: 'CRYSTAL',
    specialObjective: null,
    cosmology: 'mayan_calendar',
  },
  {
    level: 29, act: 3,
    title: 'The Gift',
    narrative: 'What you found in the descent\nyou now offer to the world.',
    dreamscape: 'CRYSTAL',
    specialObjective: { type: 'collect_all_insights', label: 'Collect all insight tiles' },
    cosmology: null,
  },
  {
    level: 30, act: 3,
    title: 'INTEGRATION COMPLETE',
    narrative: 'The pattern was always here.\nNow you can see it in everything.',
    dreamscape: 'CRYSTAL',
    isFinalLevel: true,
    specialObjective: null,
    cosmology: 'chakra_realm',
  },
];

export const ACT_INTROS = { 1: ACT_1_INTRO, 2: ACT_2_INTRO, 3: ACT_3_INTRO };

/**
 * Get the campaign level data for the given level number (1–30).
 * Returns null if beyond campaign.
 */
export function getCampaignLevel(level) {
  return CAMPAIGN_LEVELS.find(l => l.level === level) || null;
}

/**
 * Apply campaign-level data to gameState.
 * Sets dreamscape, cosmology, and any mechanic overrides.
 */
export function applyCampaignLevel(gameState, levelData) {
  if (!levelData) return;

  // Set dreamscape
  if (levelData.dreamscape) {
    gameState.currentDreamscape = levelData.dreamscape;
  }

  // Set cosmology
  if (levelData.cosmology !== undefined) {
    gameState.currentCosmology = levelData.cosmology;
  }

  // Apply mechanic overrides
  if (levelData.mechanicsOverride && gameState.mechanics) {
    Object.assign(gameState.mechanics, levelData.mechanicsOverride);
  }

  // Show narrative as a brief story prompt
  if (levelData.narrative) {
    gameState._campaignNarrative = {
      title: levelData.title,
      text: levelData.narrative,
      act: levelData.act,
      shownAtMs: Date.now(),
      durationMs: 5000,
    };
  }

  // Set special objective
  if (levelData.specialObjective) {
    gameState._campaignObjective = { ...levelData.specialObjective, progress: 0, completed: false };
  }
}

/**
 * Render campaign narrative overlay.
 */
export function renderCampaignNarrative(gameState, ctx) {
  const cn = gameState._campaignNarrative;
  if (!cn) return;

  const age = Date.now() - cn.shownAtMs;
  if (age > cn.durationMs) {
    delete gameState._campaignNarrative;
    return;
  }

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const fade = Math.min(1, age / 400) * (age > cn.durationMs - 800 ? (cn.durationMs - age) / 800 : 1);

  ctx.save();
  ctx.globalAlpha = fade * 0.92;
  ctx.fillStyle = 'rgba(2,4,12,0.94)';
  ctx.fillRect(0, h * 0.60, w, h * 0.36);

  ctx.globalAlpha = fade;

  // Act label
  ctx.fillStyle = '#445577';
  ctx.font = '8px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(`ACT ${cn.act}`, w / 2, h * 0.64);

  // Title
  ctx.fillStyle = '#aaccee';
  ctx.font = `bold ${Math.floor(w / 22)}px Courier New`;
  ctx.fillText(cn.title, w / 2, h * 0.70);

  // Narrative lines
  const lines = cn.text.split('\n');
  ctx.fillStyle = '#667799';
  ctx.font = `${Math.floor(w / 32)}px Courier New`;
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h * 0.78 + i * (h * 0.065));
  });

  ctx.restore();
}
