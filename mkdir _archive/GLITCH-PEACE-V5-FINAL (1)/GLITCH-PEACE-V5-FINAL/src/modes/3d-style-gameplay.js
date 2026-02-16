// ═══════════════════════════════════════════════════════════════════════
//  3D-STYLE GAMEPLAY MODES
//  Fable/Mass Effect/Elder Scrolls mechanics in 2D consciousness engine
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
//  MODE: MORAL CHOICE SYSTEM (Fable-inspired)
// ═══════════════════════════════════════════════════════════════════════

export const MORAL_CHOICE_MODE = {
  name: 'Path of Consequence',
  inspiration: 'Fable',
  
  core_mechanic: 'Every choice permanently alters your character and world',
  
  alignment_system: {
    axes: {
      compassion_cruelty: {
        range: [-100, 100],
        effects: {
          compassionate: {
            visual: 'player_glows_warm',
            npcs: 'trust_you',
            powers: 'healing_abilities',
            world: 'flowers_bloom',
          },
          cruel: {
            visual: 'player_darkens',
            npcs: 'fear_you',
            powers: 'destructive_abilities',
            world: 'decay_spreads',
          },
        },
      },
      selfless_selfish: {
        range: [-100, 100],
        effects: {
          selfless: {
            rewards: 'help_others_first',
            powers: 'protective_aura',
            reputation: 'hero_status',
          },
          selfish: {
            rewards: 'hoard_resources',
            powers: 'personal_power',
            reputation: 'feared_outcast',
          },
        },
      },
    },
  },
  
  consequence_tracking: {
    // Every tile you step on, every enemy you fight, every peace you collect
    // All choices tracked and create visible consequences
    
    butterfly_effects: [
      {
        choice: 'spare_enemy_life',
        immediate: 'enemy_flees',
        delayed: 'enemy_returns_as_ally_later',
        world_change: 'mercy_becomes_cultural_value',
      },
      {
        choice: 'destroy_enemy',
        immediate: 'gain_experience',
        delayed: 'enemy_faction_seeks_revenge',
        world_change: 'violence_normalizes',
      },
      {
        choice: 'collect_all_peace',
        immediate: 'level_complete',
        delayed: 'npcs_starve',
        world_change: 'scarcity_increases',
      },
      {
        choice: 'leave_some_peace',
        immediate: 'slower_progress',
        delayed: 'npcs_thrive',
        world_change: 'abundance_spreads',
      },
    ],
  },
  
  visual_morphing: {
    // Like Fable's morph system - your appearance reflects choices
    good_path: {
      aura: 'golden_glow',
      trails: 'light_particles',
      sound: 'harmonious_tones',
    },
    evil_path: {
      aura: 'dark_smoke',
      trails: 'shadow_tendrils',
      sound: 'dissonant_rumbles',
    },
    neutral_path: {
      aura: 'clear',
      trails: 'minimal',
      sound: 'ambient',
    },
  },
  
  renown_system: {
    // NPCs remember everything you do
    fame: 'How many know your name',
    reputation: 'What they think of you',
    
    titles_earned: [
      'The Compassionate',
      'The Destroyer',
      'The Balanced',
      'The Protector',
      'The Tyrant',
      // ... hundreds of possible titles
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODE: DIALOGUE WHEEL & RELATIONSHIP SYSTEM (Mass Effect-inspired)
// ═══════════════════════════════════════════════════════════════════════

export const DIALOGUE_RELATIONSHIP_MODE = {
  name: 'Resonance Diplomacy',
  inspiration: 'Mass Effect',
  
  dialogue_wheel: {
    // When encountering NPCs/enemies, enter dialogue mode
    // Wheel with 6 options radiating out
    
    positions: {
      top: 'Paragon Choice (compassionate)',
      top_right: 'Investigate (learn more)',
      right: 'Neutral Response',
      bottom_right: 'Tactical (pragmatic)',
      bottom: 'Renegade Choice (aggressive)',
      bottom_left: 'Charm/Intimidate',
    },
    
    // Different options available based on:
    skill_checks: {
      compassion_stat: 'unlocks_paragon_options',
      force_stat: 'unlocks_renegade_options',
      wisdom_stat: 'unlocks_investigation',
      charisma_stat: 'unlocks_persuasion',
    },
  },
  
  companion_system: {
    // NPCs can join you as squad mates
    // They have their own values and will approve/disapprove
    
    companions: [
      {
        name: 'The Guardian',
        archetype: 'protective',
        approves: ['sparing_lives', 'protecting_weak'],
        disapproves: ['cruelty', 'selfishness'],
        loyalty_bonuses: ['shield_strength', 'healing_aura'],
      },
      {
        name: 'The Pragmatist',
        archetype: 'tactical',
        approves: ['efficiency', 'strategic_thinking'],
        disapproves: ['wasted_resources', 'emotional_decisions'],
        loyalty_bonuses: ['critical_analysis', 'optimal_pathing'],
      },
      {
        name: 'The Rebel',
        archetype: 'chaotic',
        approves: ['breaking_rules', 'freedom'],
        disapproves: ['authority', 'conformity'],
        loyalty_bonuses: ['unpredictable_powers', 'chaos_magic'],
      },
    ],
    
    loyalty_missions: {
      // Special dreamscapes that explore companion backstory
      // Completion grants ultimate ability
      trigger: 'high_relationship_rating',
      reward: 'unique_power_unlock',
    },
  },
  
  romance_system: {
    // Optional: Deep bonds with NPCs
    // Purely emotional/intellectual connection (not sexual)
    
    bond_deepening: {
      stages: ['acquaintance', 'friend', 'trusted', 'bonded', 'soul_resonance'],
      mechanics: 'dialogue_choices_plus_actions',
      culmination: 'merged_consciousness_state',
    },
  },
  
  cosmic_consequences: {
    // Like ME3's war assets - your relationships determine final outcome
    
    alliance_strength: 'sum_of_all_relationships',
    final_challenge: 'requires_unified_field',
    
    endings: {
      low_resonance: 'face_darkness_alone',
      medium_resonance: 'allies_assist',
      high_resonance: 'collective_transcendence',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODE: OPEN WORLD EXPLORATION (Elder Scrolls-inspired)
// ═══════════════════════════════════════════════════════════════════════

export const OPEN_WORLD_MODE = {
  name: 'Infinite Dreamscape',
  inspiration: 'Elder Scrolls (Skyrim/Morrowind)',
  
  world_structure: {
    type: 'procedurally_infinite',
    generation: 'chunk_based',
    
    // No linear progression - go anywhere
    freedom: 'complete',
    level_scaling: 'zone_based', // Some areas dangerous, some safe
  },
  
  quest_system: {
    main_quest: {
      name: 'The Awakening Path',
      stages: 12,
      optional: true, // Can ignore completely
      completion: 'reveals_true_nature',
    },
    
    faction_quests: [
      {
        faction: 'Order of the Still Mind',
        philosophy: 'meditation_and_peace',
        questline: 'achieve_enlightenment',
        reward: 'stillness_powers',
      },
      {
        faction: 'Chaos Weavers',
        philosophy: 'transformation_through_disruption',
        questline: 'embrace_entropy',
        reward: 'chaos_magic',
      },
      {
        faction: 'The Balanced',
        philosophy: 'middle_way',
        questline: 'harmonize_opposites',
        reward: 'equilibrium_state',
      },
    ],
    
    side_quests: {
      count: 'infinite',
      generation: 'procedural',
      types: ['fetch', 'explore', 'protect', 'investigate', 'mediate'],
    },
  },
  
  skill_tree_system: {
    // Like Skyrim's constellation system
    // Skills improve through use, not XP
    
    skill_categories: [
      {
        name: 'Perception',
        skills: ['vision_range', 'hidden_detection', 'future_sight'],
        advancement: 'use_based',
      },
      {
        name: 'Movement',
        skills: ['speed', 'phasing', 'teleportation'],
        advancement: 'distance_traveled',
      },
      {
        name: 'Compassion',
        skills: ['healing', 'empathy', 'pacification'],
        advancement: 'help_others',
      },
      {
        name: 'Destruction',
        skills: ['damage', 'area_effect', 'disintegration'],
        advancement: 'defeat_enemies',
      },
      {
        name: 'Transmutation',
        skills: ['convert_hazards', 'create_peace', 'reality_warp'],
        advancement: 'transformation_actions',
      },
    ],
    
    perks: {
      // Unlock at skill milestones
      // Each tree has ~20 perks
      total_perks: 100,
      max_level: 'unlimited',
    },
  },
  
  discovery_system: {
    // Like Skyrim's location discovery
    // Procedurally generated points of interest
    
    locations: [
      'Ancient Meditation Sites',
      'Chaos Rifts',
      'Hidden Temples',
      'Consciousness Nodes',
      'Memory Fragments',
      'Dream Sanctuaries',
    ],
    
    rewards: 'unique_powers_and_lore',
  },
  
  crafting_system: {
    // Combine collected insights/patterns
    // Create custom abilities
    
    materials: 'insight_tokens_and_emotional_residue',
    recipes: 'discovered_through_experimentation',
    results: 'unique_player_powers',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODE: TWIN-STICK SHOOTER (Top-down combat)
// ═══════════════════════════════════════════════════════════════════════

export const TWIN_STICK_SHOOTER_MODE = {
  name: 'Consciousness Combat',
  genre: 'twin_stick_shooter',
  
  controls: {
    left_stick: 'movement_wasd',
    right_stick: 'aim_mouse_or_arrows',
    fire: 'automatic_when_aiming',
  },
  
  weapons: [
    {
      name: 'Peace Pulse',
      type: 'projectile',
      damage: 'converts_enemies_to_allies',
      fire_rate: 'slow',
      ammo: 'compassion_meter',
    },
    {
      name: 'Chaos Beam',
      type: 'continuous',
      damage: 'high_destruction',
      fire_rate: 'constant',
      ammo: 'rage_meter',
    },
    {
      name: 'Pattern Disruptor',
      type: 'area_effect',
      damage: 'scrambles_enemy_behavior',
      fire_rate: 'medium',
      ammo: 'insight_tokens',
    },
    {
      name: 'Void Cannon',
      type: 'charged_shot',
      damage: 'delete_from_existence',
      fire_rate: 'very_slow',
      ammo: 'despair_energy',
    },
  ],
  
  enemy_types: {
    swarmers: 'fast_weak_many',
    tanks: 'slow_strong_few',
    shooters: 'ranged_medium',
    elites: 'boss_level_minibosses',
  },
  
  powerups: {
    rate_of_fire_boost: 'temporary_rapid_fire',
    shield: 'invulnerability_window',
    multishot: 'bullet_spread',
    homing: 'auto_targeting',
  },
  
  wave_survival: {
    mode: 'endless_waves',
    scaling: 'exponential_difficulty',
    leaderboard: 'wave_reached',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODE: REAL-TIME STRATEGY (God-view tactical)
// ═══════════════════════════════════════════════════════════════════════

export const RTS_STRATEGY_MODE = {
  name: 'Consciousness Commander',
  genre: 'real_time_strategy',
  
  perspective: 'zoomed_out_god_view',
  
  units: {
    peace_seekers: {
      role: 'resource_gatherers',
      cost: 'low',
      abilities: ['collect_peace', 'heal'],
    },
    guardians: {
      role: 'defensive',
      cost: 'medium',
      abilities: ['protect', 'shield_allies'],
    },
    chaos_agents: {
      role: 'offensive',
      cost: 'medium',
      abilities: ['attack', 'disrupt'],
    },
    harmonizers: {
      role: 'support',
      cost: 'high',
      abilities: ['buff_allies', 'debuff_enemies'],
    },
  },
  
  resources: {
    peace: 'gathered_from_tiles',
    insight: 'gained_from_exploration',
    energy: 'regenerates_over_time',
  },
  
  base_building: {
    structures: [
      { name: 'Meditation Hub', produces: 'peace_seekers' },
      { name: 'Training Ground', produces: 'guardians' },
      { name: 'Chaos Forge', produces: 'chaos_agents' },
      { name: 'Harmony Sanctum', produces: 'harmonizers' },
    ],
    
    upgrades: 'tech_tree_research',
  },
  
  objectives: {
    skirmish: 'defeat_enemy_base',
    survival: 'defend_against_waves',
    domination: 'control_all_peace_nodes',
    enlightenment: 'achieve_perfect_harmony',
  },
  
  ai_opponents: {
    aggressive: 'rushes_early',
    defensive: 'turtles_and_booms',
    balanced: 'adapts_to_player',
    chaotic: 'unpredictable_random',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODE: TURN-BASED TACTICAL (XCOM-style)
// ═══════════════════════════════════════════════════════════════════════

export const TURN_BASED_TACTICAL_MODE = {
  name: 'Strategic Consciousness',
  genre: 'turn_based_tactics',
  
  squad_system: {
    size: 4, // Control 4 units
    classes: [
      { name: 'Sniper', range: 'long', damage: 'high', mobility: 'low' },
      { name: 'Scout', range: 'short', damage: 'low', mobility: 'high' },
      { name: 'Heavy', range: 'medium', damage: 'medium', mobility: 'low', defense: 'high' },
      { name: 'Support', range: 'medium', damage: 'low', healing: 'high' },
    ],
  },
  
  turn_structure: {
    player_phase: 'move_all_units',
    enemy_phase: 'enemies_respond',
    environment_phase: 'hazards_activate',
  },
  
  cover_system: {
    full_cover: '50% damage_reduction',
    half_cover: '25% damage_reduction',
    flanking: 'ignore_cover_bonus',
  },
  
  abilities: {
    per_unit: 3,
    cooldowns: 'turn_based',
    examples: [
      'Overwatch - shoot on enemy movement',
      'Suppress - reduce enemy accuracy',
      'Grenade - area damage',
      'Heal - restore HP',
      'Hack - disable enemy',
    ],
  },
  
  permadeath: {
    enabled: true,
    lost_units: 'permanent',
    replacements: 'recruit_new_rookies',
    veteran_bonuses: 'experienced_units_stronger',
  },
};

export const ALL_3D_STYLE_MODES = {
  MORAL_CHOICE_MODE,
  DIALOGUE_RELATIONSHIP_MODE,
  OPEN_WORLD_MODE,
  TWIN_STICK_SHOOTER_MODE,
  RTS_STRATEGY_MODE,
  TURN_BASED_TACTICAL_MODE,
};
