// ═══════════════════════════════════════════════════════════════════════
//  HINDU COSMOLOGY DREAMSCAPE - Chakra Navigation System
//  Sterilized wisdom: Energy centers as gameplay mechanics
// ═══════════════════════════════════════════════════════════════════════

export const HINDU_CHAKRA_REALM = {
  id: 'chakra_realm',
  name: 'SEVEN ENERGY FIELDS',
  subtitle: 'Vertical navigation through consciousness layers',
  cosmology: 'hindu',
  
  // Core concept: 7 chakras as 7 vertical levels you navigate
  layers: [
    {
      name: 'Root Field',        // Muladhara
      color: '#cc0000',
      element: 'earth',
      keyword: 'survival',
      tiles: { peace: 5, hazard: 12, type: 'grounding' },
      mechanic: 'heavy_gravity', // Moves cost more energy
      wisdom: 'Foundation must be stable before ascent',
    },
    {
      name: 'Flow Field',        // Svadhisthana  
      color: '#ff6600',
      element: 'water',
      keyword: 'emotion',
      tiles: { peace: 6, hazard: 10, type: 'flowing' },
      mechanic: 'tile_drift', // Tiles slowly move
      wisdom: 'Emotions flow - resistance creates suffering',
    },
    {
      name: 'Power Field',       // Manipura
      color: '#ffdd00',
      element: 'fire',
      keyword: 'will',
      tiles: { peace: 7, hazard: 9, type: 'burning' },
      mechanic: 'energy_consumption', // Actions drain energy faster
      wisdom: 'Will without wisdom burns',
    },
    {
      name: 'Heart Field',       // Anahata
      color: '#00ff88',
      element: 'air',
      keyword: 'compassion',
      tiles: { peace: 10, hazard: 5, type: 'healing' },
      mechanic: 'enemy_pacification', // Enemies become neutral
      wisdom: 'Love dissolves barriers',
    },
    {
      name: 'Voice Field',       // Vishuddha
      color: '#00aaff',
      element: 'ether',
      keyword: 'truth',
      tiles: { peace: 8, hazard: 7, type: 'revealing' },
      mechanic: 'hidden_reveal', // All hidden tiles become visible
      wisdom: 'Speaking truth reveals hidden paths',
    },
    {
      name: 'Sight Field',       // Ajna
      color: '#6600ff',
      element: 'light',
      keyword: 'intuition',
      tiles: { peace: 6, hazard: 8, type: 'prescient' },
      mechanic: 'future_vision', // See 3 moves ahead
      wisdom: 'Insight precedes action',
    },
    {
      name: 'Unity Field',       // Sahasrara
      color: '#ffffff',
      element: 'consciousness',
      keyword: 'oneness',
      tiles: { peace: 15, hazard: 0, type: 'transcendent' },
      mechanic: 'ego_dissolution', // No self/other distinction
      wisdom: 'Separation was always illusion',
    },
  ],
  
  // Gameplay: Navigate vertically through layers
  gameplay: {
    mode: 'vertical_ascent',
    objective: 'Reach unity field',
    failure: 'Fall back to root',
    
    // Each layer completed unlocks next
    progression: 'sequential',
    
    // Can descend to heal/regroup
    descent_allowed: true,
    
    // Special: Kundalini energy rises as you ascend
    kundalini_meter: {
      starts: 0,
      max: 100,
      rises_on: 'layer_completion',
      effect: 'Unlocks higher perception',
    },
  },
  
  // Sterilized mantras as power-ups (just sound/vibration mechanics)
  mantras: [
    { sound: 'LAM', chakra: 0, effect: 'grounding_boost' },
    { sound: 'VAM', chakra: 1, effect: 'flow_state' },
    { sound: 'RAM', chakra: 2, effect: 'energy_surge' },
    { sound: 'YAM', chakra: 3, effect: 'healing_aura' },
    { sound: 'HAM', chakra: 4, effect: 'truth_sight' },
    { sound: 'OM',  chakra: 5, effect: 'unified_field' },
    { sound: 'AH',  chakra: 6, effect: 'transcendence' },
  ],
  
  // NO RELIGIOUS CONTENT - pure energy/vibration mechanics
  disclaimer: 'Chakras presented as energetic navigation metaphor, not spiritual doctrine',
};

// ═══════════════════════════════════════════════════════════════════════
//  BUDDHIST COSMOLOGY - Wheel of Becoming
// ═══════════════════════════════════════════════════════════════════════

export const BUDDHIST_WHEEL_REALM = {
  id: 'wheel_of_becoming',
  name: 'CYCLE OF ATTACHMENT',
  subtitle: 'Navigate the 12 links of dependent origination',
  cosmology: 'buddhist',
  
  // 12 Nidanas as 12 interconnected rooms
  links: [
    { name: 'Ignorance',       symbol: '👤', effect: 'reduced_vision', escape: 'awareness' },
    { name: 'Formation',       symbol: '🔨', effect: 'habit_patterns', escape: 'mindfulness' },
    { name: 'Consciousness',   symbol: '👁️', effect: 'perception_filters', escape: 'clarity' },
    { name: 'Name & Form',     symbol: '🎭', effect: 'identity_attachment', escape: 'non-self' },
    { name: 'Six Sense Bases', symbol: '👂', effect: 'sensory_overload', escape: 'equanimity' },
    { name: 'Contact',         symbol: '🤝', effect: 'reactive_impulse', escape: 'pause' },
    { name: 'Feeling',         symbol: '❤️', effect: 'emotional_pull', escape: 'observation' },
    { name: 'Craving',         symbol: '🔥', effect: 'desire_spiral', escape: 'release' },
    { name: 'Clinging',        symbol: '⛓️', effect: 'attachment_pain', escape: 'letting_go' },
    { name: 'Becoming',        symbol: '🌀', effect: 'identity_loop', escape: 'impermanence' },
    { name: 'Birth',           symbol: '🌱', effect: 'new_suffering', escape: 'acceptance' },
    { name: 'Aging & Death',   symbol: '💀', effect: 'entropy', escape: 'cessation' },
  ],
  
  gameplay: {
    mode: 'circular_navigation',
    objective: 'Break the cycle',
    
    // Each link creates a different challenge
    // Escape condition: Find the specific "escape" for each link
    // Example: In "Craving" room, collecting peace increases craving (reverse mechanic)
    //          Escape: Must choose NOT to collect peace (practice release)
    
    wheel_rotation: 'clockwise',
    cycles_to_escape: 3, // Must go around 3 times understanding each link
    
    // Special: Suffering meter increases with each cycle
    dukkha_meter: {
      starts: 0,
      increases: 'on_clinging_actions',
      decreases: 'on_release_actions',
      escape_threshold: 0, // Must reach zero to break free
    },
  },
  
  // Four Noble Truths as gameplay guidance (sterilized)
  truths: [
    'Patterns cause friction',
    'Friction has identifiable sources',
    'Friction can cease',
    'Path exists to cessation',
  ],
  
  // Eightfold Path as upgrade tree (secular ethics/pragmatism)
  path_upgrades: [
    { name: 'Right View', effect: 'see_patterns_clearly' },
    { name: 'Right Intention', effect: 'reduce_reactivity' },
    { name: 'Right Speech', effect: 'communication_clarity' },
    { name: 'Right Action', effect: 'ethical_momentum' },
    { name: 'Right Livelihood', effect: 'sustainable_energy' },
    { name: 'Right Effort', effect: 'balanced_intensity' },
    { name: 'Right Mindfulness', effect: 'awareness_stability' },
    { name: 'Right Concentration', effect: 'focus_depth' },
  ],
  
  disclaimer: 'Buddhist concepts presented as pattern recognition mechanics, not religious practice',
};

// ═══════════════════════════════════════════════════════════════════════
//  TANTRIC COSMOLOGY - Union of Opposites
// ═══════════════════════════════════════════════════════════════════════

export const TANTRIC_UNION_REALM = {
  id: 'tantric_union',
  name: 'FIELD OF POLARITY',
  subtitle: 'Masculine/Feminine energy balance mechanics',
  cosmology: 'tantra',
  
  // Shiva/Shakti as complementary forces (NOT sexual - pure energy)
  polarities: {
    shiva: {
      name: 'Stillness Pole',
      color: '#0088ff',
      qualities: ['awareness', 'structure', 'containment'],
      tiles: 'stable_grid',
      mechanic: 'freeze_enemies',
    },
    shakti: {
      name: 'Movement Pole',
      color: '#ff0088',
      qualities: ['energy', 'transformation', 'flow'],
      tiles: 'dynamic_chaos',
      mechanic: 'rapid_change',
    },
  },
  
  gameplay: {
    mode: 'balance_polarities',
    
    // Grid split vertically: Left = Shiva, Right = Shakti
    // Player must balance time in each side
    // Too much stillness = stagnation
    // Too much movement = chaos
    
    balance_meter: {
      center: 50,
      shiva_pull: 'left',
      shakti_pull: 'right',
      optimal_range: [40, 60],
    },
    
    // Union occurs when balance is perfect
    union_state: {
      trigger: 'balance = 50 for 10 seconds',
      effect: 'transcendent_power',
      duration: 30,
      visual: 'merged_colors',
    },
  },
  
  // Five elements (pancha mahabhuta) as tile types
  elements: [
    { name: 'Earth', stable: true, heavy: true },
    { name: 'Water', flowing: true, adaptive: true },
    { name: 'Fire', transforming: true, consuming: true },
    { name: 'Air', mobile: true, invisible: true },
    { name: 'Ether', spacious: true, subtle: true },
  ],
  
  disclaimer: 'Tantra presented as complementary-force physics, not sexual practice',
};

// Additional cosmologies continue in next file...
// (Taoist, Norse, Celtic, Zoroastrian, Confucian, Hermetic)
