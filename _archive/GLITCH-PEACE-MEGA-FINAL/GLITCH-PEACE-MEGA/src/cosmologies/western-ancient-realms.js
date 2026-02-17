// ═══════════════════════════════════════════════════════════════════════
//  WESTERN & ANCIENT COSMOLOGIES - Sterilized Mythology as Game Mechanics
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
//  NORSE COSMOLOGY - Yggdrasil (World Tree Navigation)
// ═══════════════════════════════════════════════════════════════════════

export const NORSE_YGGDRASIL_REALM = {
  id: 'world_tree',
  name: 'NINE REALM TREE',
  subtitle: 'Vertical navigation through Norse cosmology',
  cosmology: 'norse',
  
  // 9 Realms as 9 interconnected levels
  realms: [
    {
      name: 'Asgard',
      level: 'crown',
      theme: 'Order & Structure',
      color: '#ffdd00',
      inhabitants: 'Architect beings',
      challenge: 'Maintain perfect order',
      wisdom: 'Structure without rigidity becomes prison',
    },
    {
      name: 'Vanaheim',
      level: 'upper',
      theme: 'Nature & Fertility',
      color: '#00ff88',
      inhabitants: 'Growth spirits',
      challenge: 'Balance growth and decay',
      wisdom: 'Abundance requires cycles',
    },
    {
      name: 'Alfheim',
      level: 'upper',
      theme: 'Light & Clarity',
      color: '#ffffff',
      inhabitants: 'Luminous entities',
      challenge: 'Navigate pure information',
      wisdom: 'Too much light blinds',
    },
    {
      name: 'Midgard',
      level: 'middle',
      theme: 'Human Experience',
      color: '#8844aa',
      inhabitants: 'Mortal consciousness',
      challenge: 'Navigate duality',
      wisdom: 'Middle path balances extremes',
    },
    {
      name: 'Jotunheim',
      level: 'middle',
      theme: 'Chaos & Giants',
      color: '#ff4400',
      inhabitants: 'Chaos forces',
      challenge: 'Survive entropy',
      wisdom: 'Chaos precedes new order',
    },
    {
      name: 'Svartalfheim',
      level: 'lower',
      theme: 'Craft & Shadow',
      color: '#332211',
      inhabitants: 'Shadow craftsmen',
      challenge: 'Face unconscious patterns',
      wisdom: 'Shadow work reveals hidden gifts',
    },
    {
      name: 'Nidavellir',
      level: 'lower',
      theme: 'Forging & Transformation',
      color: '#ff6600',
      inhabitants: 'Forge masters',
      challenge: 'Transmute suffering into strength',
      wisdom: 'Heat and pressure create diamonds',
    },
    {
      name: 'Niflheim',
      level: 'root',
      theme: 'Ice & Stillness',
      color: '#0044aa',
      inhabitants: 'Frozen potential',
      challenge: 'Move through paralysis',
      wisdom: 'Stillness is not death',
    },
    {
      name: 'Muspelheim',
      level: 'root',
      theme: 'Fire & Primordial Energy',
      color: '#ff0000',
      inhabitants: 'Raw force',
      challenge: 'Channel primal power',
      wisdom: 'Destruction clears space for creation',
    },
  ],
  
  gameplay: {
    mode: 'tree_navigation',
    structure: 'vertical_with_branches',
    
    // Can move up/down trunk or branch to adjacent realms
    // Each realm has different physics
    navigation: 'non-linear',
    
    // Ragnarok mechanic: World can end and restart
    ragnarok_cycle: {
      trigger: 'chaos_exceeds_order_by_threshold',
      effect: 'realm_reset_with_memory',
      rebirth: 'new_cycle_begins',
      carries_forward: 'wisdom_gained',
    },
  },
  
  // Runes as power system (symbols = code, not magic)
  runes: [
    { glyph: 'ᚠ', name: 'Fehu', meaning: 'Wealth/Energy', effect: 'resource_generation' },
    { glyph: 'ᚢ', name: 'Uruz', meaning: 'Strength', effect: 'endurance_boost' },
    { glyph: 'ᚦ', name: 'Thurisaz', meaning: 'Force', effect: 'breakthrough_power' },
    { glyph: 'ᚨ', name: 'Ansuz', meaning: 'Signal', effect: 'communication_clarity' },
    { glyph: 'ᚱ', name: 'Raidho', meaning: 'Journey', effect: 'movement_efficiency' },
    { glyph: 'ᚲ', name: 'Kenaz', meaning: 'Fire/Knowledge', effect: 'insight_illumination' },
    // ... (24 runes total, each a mechanic)
  ],
  
  disclaimer: 'Norse mythology presented as navigation framework, not religious belief',
};

// ═══════════════════════════════════════════════════════════════════════
//  CELTIC COSMOLOGY - The Otherworld
// ═══════════════════════════════════════════════════════════════════════

export const CELTIC_OTHERWORLD_REALM = {
  id: 'celtic_otherworld',
  name: 'VEIL CROSSING',
  subtitle: 'Navigate between visible and invisible worlds',
  cosmology: 'celtic',
  
  // Celtic cosmology: This world and Otherworld overlap
  worlds: {
    thisworld: {
      name: 'Manifest Field',
      visibility: 'full',
      physics: 'normal',
      color: '#00aa44',
    },
    otherworld: {
      name: 'Subtle Field',
      visibility: 'partial',
      physics: 'inverted',
      color: '#aa00ff',
    },
  },
  
  gameplay: {
    mode: 'veil_navigation',
    
    // Two grids overlaid - toggle between them
    // Some tiles only exist in one world
    // Some enemies only visible in one world
    
    veil_toggle: 'press_key_to_shift',
    
    // Thin places: Where worlds overlap strongly
    thin_places: {
      locations: 'crossroads_and_boundaries',
      effect: 'both_worlds_visible',
      danger: 'dual_threats',
      opportunity: 'dual_resources',
    },
  },
  
  // Celtic calendar as temporal mechanic (secular seasons)
  wheel_of_year: [
    { name: 'Samhain', date: 'Nov 1', theme: 'Endings', effect: 'veil_thinnest' },
    { name: 'Yule', date: 'Dec 21', theme: 'Return of Light', effect: 'rebirth' },
    { name: 'Imbolc', date: 'Feb 1', theme: 'First Stirrings', effect: 'new_growth' },
    { name: 'Spring Equinox', date: 'Mar 21', theme: 'Balance', effect: 'equilibrium' },
    { name: 'Beltane', date: 'May 1', theme: 'Life Force', effect: 'vitality_peak' },
    { name: 'Summer Solstice', date: 'Jun 21', theme: 'Fullness', effect: 'maximum_power' },
    { name: 'Lughnasadh', date: 'Aug 1', theme: 'First Harvest', effect: 'reap_rewards' },
    { name: 'Autumn Equinox', date: 'Sep 21', theme: 'Balance', effect: 'preparation' },
  ],
  
  // Ogham alphabet as upgrade tree (just symbols)
  ogham: [
    { letter: 'ᚁ', tree: 'Birch', meaning: 'Beginnings', effect: 'fresh_start_bonus' },
    { letter: 'ᚂ', tree: 'Rowan', meaning: 'Protection', effect: 'ward_creation' },
    { letter: 'ᚃ', tree: 'Alder', meaning: 'Foundation', effect: 'stability' },
    // ... (20 ogham total)
  ],
  
  disclaimer: 'Celtic concepts as dimensional navigation metaphor, not pagan practice',
};

// ═══════════════════════════════════════════════════════════════════════
//  ZOROASTRIAN COSMOLOGY - Duality Battle
// ═══════════════════════════════════════════════════════════════════════

export const ZOROASTRIAN_DUALITY_REALM = {
  id: 'cosmic_duality',
  name: 'FIELD OF ETERNAL CHOICE',
  subtitle: 'Navigate the battle between order and chaos',
  cosmology: 'zoroastrian',
  
  // Asha (Truth/Order) vs Druj (Lie/Chaos)
  cosmic_forces: {
    asha: {
      name: 'Order Force',
      color: '#ffdd00',
      represents: ['truth', 'structure', 'light', 'life'],
      tiles_preference: 'geometric_patterns',
      enemy_behavior: 'predictable',
    },
    druj: {
      name: 'Chaos Force',
      color: '#440000',
      represents: ['deception', 'entropy', 'darkness', 'death'],
      tiles_preference: 'random_scatter',
      enemy_behavior: 'erratic',
    },
  },
  
  gameplay: {
    mode: 'eternal_struggle',
    
    // Grid constantly shifts between order and chaos
    // Player choices determine which force grows stronger
    
    choice_mechanic: {
      every_action: 'strengthens_one_force',
      collect_peace: 'feeds_order',
      destroy_enemies: 'feeds_chaos',
      balance_seeking: 'third_path',
    },
    
    // Field state changes based on dominant force
    field_states: [
      { dominance: 'order', grid: 'perfect_geometry', enemies: 'minimal' },
      { dominance: 'chaos', grid: 'complete_random', enemies: 'overwhelming' },
      { dominance: 'balanced', grid: 'organic_patterns', enemies: 'moderate' },
    ],
  },
  
  // Amesha Spentas (divine sparks) as character attributes
  divine_aspects: [
    { name: 'Good Mind', attribute: 'wisdom_stat' },
    { name: 'Righteousness', attribute: 'ethical_choices' },
    { name: 'Devotion', attribute: 'commitment_bonus' },
    { name: 'Dominion', attribute: 'authority_effect' },
    { name: 'Wholeness', attribute: 'integrity_shield' },
    { name: 'Immortality', attribute: 'life_extension' },
  ],
  
  disclaimer: 'Zoroastrian duality as choice-consequence system, not theology',
};

// ═══════════════════════════════════════════════════════════════════════
//  HERMETIC/OCCULT COSMOLOGY - Seven Principles
// ═══════════════════════════════════════════════════════════════════════

export const HERMETIC_PRINCIPLES_REALM = {
  id: 'hermetic_laws',
  name: 'SEVEN PRINCIPLE FIELD',
  subtitle: 'Master universal laws through gameplay',
  cosmology: 'hermetic',
  
  // Kybalion principles as game mechanics (secular physics)
  principles: [
    {
      name: 'Mentalism',
      law: 'All is mind',
      mechanic: 'perception_shapes_reality',
      gameplay: 'Your thoughts change tile types',
      implementation: 'Focus mode alters grid',
    },
    {
      name: 'Correspondence',
      law: 'As above, so below',
      mechanic: 'patterns_repeat_across_scales',
      gameplay: 'Macro patterns mirror micro patterns',
      implementation: 'Fractal level generation',
    },
    {
      name: 'Vibration',
      law: 'Nothing rests, everything vibrates',
      mechanic: 'frequency_determines_state',
      gameplay: 'Match frequency to pass through walls',
      implementation: 'Resonance-based phasing',
    },
    {
      name: 'Polarity',
      law: 'Everything has poles',
      mechanic: 'opposites_are_same_thing',
      gameplay: 'Convert hazards to peace by shifting pole',
      implementation: 'Polarity inversion power',
    },
    {
      name: 'Rhythm',
      law: 'Everything flows',
      mechanic: 'pendulum_swing_inevitable',
      gameplay: 'Ride the wave of change',
      implementation: 'Tidal mechanics',
    },
    {
      name: 'Cause & Effect',
      law: 'Every action has reaction',
      mechanic: 'deterministic_consequences',
      gameplay: 'See exact outcome before acting',
      implementation: 'Consequence preview system',
    },
    {
      name: 'Gender',
      law: 'Masculine/Feminine in everything',
      mechanic: 'generative_and_receptive_forces',
      gameplay: 'Balance active and passive strategies',
      implementation: 'Dual energy management',
    },
  ],
  
  gameplay: {
    mode: 'principle_mastery',
    
    // Each level focuses on one principle
    // Must understand and apply the principle to progress
    
    mastery_progression: 'sequential',
    final_test: 'apply_all_seven_simultaneously',
  },
  
  // Tree of Life (Kabbalah) as upgrade path (pure structure)
  sephiroth: [
    { id: 1, name: 'Crown', attribute: 'unity_consciousness' },
    { id: 2, name: 'Wisdom', attribute: 'creative_insight' },
    { id: 3, name: 'Understanding', attribute: 'analytical_depth' },
    { id: 4, name: 'Mercy', attribute: 'compassionate_action' },
    { id: 5, name: 'Severity', attribute: 'discerning_judgment' },
    { id: 6, name: 'Beauty', attribute: 'harmonic_balance' },
    { id: 7, name: 'Victory', attribute: 'persistent_will' },
    { id: 8, name: 'Splendor', attribute: 'intellectual_clarity' },
    { id: 9, name: 'Foundation', attribute: 'stable_base' },
    { id: 10, name: 'Kingdom', attribute: 'manifest_reality' },
  ],
  
  // Alchemy as transmutation system (chemistry metaphor)
  alchemical_process: {
    nigredo: 'Dissolution - Break down structures',
    albedo: 'Purification - Remove impurities',
    citrinitas: 'Yellowing - Illuminate patterns',
    rubedo: 'Reddening - Integrate wholeness',
  },
  
  disclaimer: 'Hermetic principles as physics simulation, not occult practice',
};

// ═══════════════════════════════════════════════════════════════════════
//  CONFUCIAN COSMOLOGY - Social Harmony System
// ═══════════════════════════════════════════════════════════════════════

export const CONFUCIAN_HARMONY_REALM = {
  id: 'five_relations',
  name: 'FIELD OF RELATIONSHIPS',
  subtitle: 'Navigate social dynamics and ethical choices',
  cosmology: 'confucian',
  
  // Five Cardinal Relationships as gameplay systems
  relationships: [
    { type: 'Ruler-Subject', dynamic: 'authority_responsibility', mechanic: 'leadership_ethics' },
    { type: 'Parent-Child', dynamic: 'nurture_filial_piety', mechanic: 'generational_transfer' },
    { type: 'Husband-Wife', dynamic: 'partnership_balance', mechanic: 'complementary_roles' },
    { type: 'Elder-Younger', dynamic: 'mentorship_respect', mechanic: 'knowledge_sharing' },
    { type: 'Friend-Friend', dynamic: 'mutual_trust', mechanic: 'reciprocal_support' },
  ],
  
  gameplay: {
    mode: 'social_navigation',
    
    // NPCs represent different relationship types
    // Your choices affect social harmony meter
    
    harmony_meter: {
      range: [-100, 100],
      optimal: 75,
      effects: {
        high: 'cooperative_gameplay',
        low: 'conflictual_gameplay',
      },
    },
  },
  
  // Five Virtues as stat system
  virtues: [
    { name: 'Ren', meaning: 'Benevolence', stat: 'compassion_rating' },
    { name: 'Yi', meaning: 'Righteousness', stat: 'ethical_integrity' },
    { name: 'Li', meaning: 'Propriety', stat: 'social_grace' },
    { name: 'Zhi', meaning: 'Wisdom', stat: 'discernment' },
    { name: 'Xin', meaning: 'Trustworthiness', stat: 'reliability_score' },
  ],
  
  disclaimer: 'Confucian ethics as social dynamics engine, not moral prescription',
};

// ═══════════════════════════════════════════════════════════════════════
//  TAOIST COSMOLOGY - Wu Wei (Effortless Action)
// ═══════════════════════════════════════════════════════════════════════

export const TAOIST_WUWEI_REALM = {
  id: 'way_of_flow',
  name: 'NON-ACTION FIELD',
  subtitle: 'Win by not forcing - flow with the Tao',
  cosmology: 'taoist',
  
  gameplay: {
    mode: 'effortless_action',
    
    // Core mechanic: The LESS you act, the more you achieve
    // Forcing creates resistance
    // Flowing creates effortless progress
    
    effort_meter: {
      forced_actions: 'create_resistance',
      flowing_actions: 'no_resistance',
      wu_wei_state: 'actions_happen_through_you',
    },
    
    // Yin/Yang as dynamic balance
    yin_yang: {
      yin: { qualities: ['receptive', 'soft', 'dark', 'rest'], color: '#000000' },
      yang: { qualities: ['active', 'hard', 'light', 'movement'], color: '#ffffff' },
      balance_point: 'taiji',
      gameplay: 'alternate_between_states',
    },
  },
  
  // Five Phases (Wu Xing) as cycle mechanics
  five_phases: [
    { phase: 'Wood', season: 'spring', direction: 'east', grows: 'Fire', controls: 'Earth' },
    { phase: 'Fire', season: 'summer', direction: 'south', grows: 'Earth', controls: 'Metal' },
    { phase: 'Earth', season: 'transition', direction: 'center', grows: 'Metal', controls: 'Water' },
    { phase: 'Metal', season: 'autumn', direction: 'west', grows: 'Water', controls: 'Wood' },
    { phase: 'Water', season: 'winter', direction: 'north', grows: 'Wood', controls: 'Fire' },
  ],
  
  // Taijitu (Yin-Yang symbol) as map layout
  map_structure: 'circular_duality',
  
  disclaimer: 'Taoist concepts as flow-state mechanics, not religious practice',
};

export const ALL_COSMOLOGY_REALMS = [
  NORSE_YGGDRASIL_REALM,
  CELTIC_OTHERWORLD_REALM,
  ZOROASTRIAN_DUALITY_REALM,
  HERMETIC_PRINCIPLES_REALM,
  CONFUCIAN_HARMONY_REALM,
  TAOIST_WUWEI_REALM,
];
