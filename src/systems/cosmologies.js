// ═══════════════════════════════════════════════════════════════════════
//  COSMOLOGY REALMS - 12 World Wisdom Traditions as Game Mechanics
//  Sterilized, secular, pattern-based integration of world traditions
//  Merged from GLITCH-PEACE-MEGA-FINAL archive
// ═══════════════════════════════════════════════════════════════════════

// ─── EASTERN REALMS ─────────────────────────────────────────────────────

export const COSMOLOGIES = {
  
  // ────────────────────────────────────────────────────────────────────
  // 1. HINDU CHAKRA SYSTEM - Energy centers as vertical exploration
  // ────────────────────────────────────────────────────────────────────
  chakra: {
    id: 'chakra_realm',
    name: 'SEVEN ENERGY FIELDS',
    subtitle: 'Vertical navigation through consciousness layers',
    tradition: 'Hindu',
    
    layers: [
      { name: 'Root Field', color: '#cc0000', element: 'earth', keyword: 'survival', mechanic: 'heavy_gravity' },
      { name: 'Flow Field', color: '#ff6600', element: 'water', keyword: 'emotion', mechanic: 'tile_drift' },
      { name: 'Power Field', color: '#ffdd00', element: 'fire', keyword: 'will', mechanic: 'energy_consumption' },
      { name: 'Heart Field', color: '#00ff88', element: 'air', keyword: 'compassion', mechanic: 'enemy_pacification' },
      { name: 'Voice Field', color: '#00aaff', element: 'ether', keyword: 'truth', mechanic: 'hidden_reveal' },
      { name: 'Sight Field', color: '#6600ff', element: 'light', keyword: 'intuition', mechanic: 'future_vision' },
      { name: 'Unity Field', color: '#ffffff', element: 'consciousness', keyword: 'oneness', mechanic: 'ego_dissolution' },
    ],
    
    gameplay: { mode: 'vertical_ascent', progression: 'sequential', descent_allowed: true },
    disclaimer: 'Chakras presented as energetic navigation metaphor, not spiritual doctrine',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 2. BUDDHIST WHEEL OF BECOMING - Cycle breaking through insight
  // ────────────────────────────────────────────────────────────────────
  wheel: {
    id: 'wheel_of_becoming',
    name: 'CYCLE OF ATTACHMENT',
    subtitle: 'Navigate the 12 links of dependent origination',
    tradition: 'Buddhist',
    
    links: [
      { name: 'Ignorance', symbol: '👤', effect: 'reduced_vision' },
      { name: 'Formation', symbol: '🔨', effect: 'habit_patterns' },
      { name: 'Consciousness', symbol: '👁️', effect: 'perception_filters' },
      { name: 'Name & Form', symbol: '🎭', effect: 'identity_attachment' },
      { name: 'Six Sense Bases', symbol: '👂', effect: 'sensory_overload' },
      { name: 'Contact', symbol: '🤝', effect: 'reactive_impulse' },
      { name: 'Feeling', symbol: '❤️', effect: 'emotional_pull' },
      { name: 'Craving', symbol: '🔥', effect: 'desire_spiral' },
      { name: 'Clinging', symbol: '⛓️', effect: 'attachment_pain' },
      { name: 'Becoming', symbol: '🌀', effect: 'identity_loop' },
      { name: 'Birth', symbol: '🌱', effect: 'new_suffering' },
      { name: 'Aging & Death', symbol: '💀', effect: 'entropy' },
    ],
    
    gameplay: { mode: 'circular_navigation', cycles_to_escape: 3 },
    truths: ['Patterns cause friction', 'Friction has sources', 'Friction ceases', 'Path exists to cessation'],
    disclaimer: 'Buddhist concepts presented as pattern mechanics, not religious practice',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 3. TAOIST WU WEI - Effortless action through flow state
  // ────────────────────────────────────────────────────────────────────
  wu_wei: {
    id: 'wu_wei_flow',
    name: 'THE UNCARVED BLOCK',
    subtitle: 'Effortless action through natural rhythm',
    tradition: 'Taoist',
    
    principles: ['wu wei (non-forcing)', 'yin yang balance', 'flow state', 'natural order'],
    
    gameplay: {
      mode: 'flow_state_mechanics',
      effortless: 'less input = more efficient',
      timing: 'match natural rhythms for bonuses',
      taoFlowMeter: { optimal: 'gentle_movement', penalty: 'forced_action' },
    },
    
    yin_yang: {
      yin: { passive_power: true, receptive: true, color: '#000000' },
      yang: { active_power: true, assertive: true, color: '#ffffff' },
      balance: 'neither dominates',
    },
    
    disclaimer: 'Taoism presented as flow-state mechanics, not religious philosophy',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 4. TANTRIC UNION - Polarity balance mechanics
  // ────────────────────────────────────────────────────────────────────
  tantra: {
    id: 'tantric_union',
    name: 'FIELD OF POLARITY',
    subtitle: 'Masculine/Feminine energy balance',
    tradition: 'Tantric',
    
    polarities: {
      shiva: { name: 'Stillness Pole', color: '#0088ff', mechanic: 'freeze_enemies' },
      shakti: { name: 'Movement Pole', color: '#ff0088', mechanic: 'rapid_change' },
    },
    
    gameplay: {
      mode: 'balance_polarities',
      balance_meter: { center: 50, optimal_range: [40, 60] },
      union_trigger: 'balance = 50 for 10 seconds',
    },
    
    disclaimer: 'Tantra presented as complementary-force physics, not sexual practice',
  },
  
  // ─── WESTERN & ANCIENT REALMS ──────────────────────────────────────────
  
  // ────────────────────────────────────────────────────────────────────
  // 5. NORSE YGGDRASIL - Nine realms tree navigation
  // ────────────────────────────────────────────────────────────────────
  yggdrasil: {
    id: 'world_tree',
    name: 'NINE REALM TREE',
    subtitle: 'Vertical navigation through Norse cosmology',
    tradition: 'Norse',
    
    realms: [
      { name: 'Asgard', color: '#ffdd00', theme: 'Order & Structure', level: 'crown' },
      { name: 'Vanaheim', color: '#00ff88', theme: 'Nature & Fertility', level: 'upper' },
      { name: 'Alfheim', color: '#ffffff', theme: 'Light & Clarity', level: 'upper' },
      { name: 'Midgard', color: '#8844aa', theme: 'Human Experience', level: 'middle' },
      { name: 'Jotunheim', color: '#ff4400', theme: 'Chaos & Giants', level: 'middle' },
      { name: 'Svartalfheim', color: '#332211', theme: 'Craft & Shadow', level: 'lower' },
      { name: 'Nidavellir', color: '#ff6600', theme: 'Forging & Transformation', level: 'lower' },
      { name: 'Niflheim', color: '#0044aa', theme: 'Ice & Stillness', level: 'root' },
      { name: 'Muspelheim', color: '#ff0000', theme: 'Fire & Primordial Energy', level: 'root' },
    ],
    
    gameplay: { mode: 'tree_navigation', structure: 'vertical_with_branches' },
    ragnarok: { trigger: 'chaos exceeds order', effect: 'realm_reset_with_memory' },
    disclaimer: 'Norse mythology presented as navigation framework, not religious belief',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 6. CELTIC OTHERWORLD - Veil crossing mechanics
  // ────────────────────────────────────────────────────────────────────
  celtic: {
    id: 'celtic_otherworld',
    name: 'VEIL CROSSING',
    subtitle: 'Navigate between visible and invisible worlds',
    tradition: 'Celtic',
    
    worlds: {
      thisworld: { name: 'Manifest Field', visibility: 'full', physics: 'normal', color: '#00aa44' },
      otherworld: { name: 'Subtle Field', visibility: 'shimmering', physics: 'dreamy', color: '#00aaff' },
    },
    
    gameplay: { mode: 'veil_navigation', crossing_cost: 'emotional_energy' },
    disclaimer: 'Celtic cosmology presented as parallel-world mechanics, not spiritual practice',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 7. ZOROASTRIAN DUALITY - Order vs Chaos eternal struggle
  // ────────────────────────────────────────────────────────────────────
  zoroastrian: {
    id: 'zoroastrian_duality',
    name: 'ORDER VERSUS ENTROPY',
    subtitle: 'Eternal struggle between Ahura Mazda and Angra Mainyu',
    tradition: 'Zoroastrian',
    
    forces: {
      order: { name: 'Ahura Mazda', color: '#ffdddd', principle: 'creation' },
      entropy: { name: 'Angra Mainyu', color: '#333333', principle: 'destruction' },
    },
    
    gameplay: { mode: 'force_balance', victory: 'order prevails but entropy returns' },
    disclaimer: 'Zoroastrianism presented as pattern mechanics, not religious doctrine',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 8. HERMETIC PRINCIPLES - Seven Universal Laws as gameplay rules
  // ────────────────────────────────────────────────────────────────────
  hermetic: {
    id: 'hermetic_laws',
    name: 'SEVEN UNIVERSAL LAWS',
    subtitle: 'Reality governed by immutable cosmic principles',
    tradition: 'Hermetic',
    
    laws: [
      { name: 'Mentalism', principle: 'Mind creates reality' },
      { name: 'Correspondence', principle: 'As above, so below' },
      { name: 'Vibration', principle: 'Everything vibrates' },
      { name: 'Polarity', principle: 'Opposites are degrees of same thing' },
      { name: 'Rhythm', principle: 'Cycles eternal' },
      { name: 'Cause & Effect', principle: 'Nothing happens by chance' },
      { name: 'Gender', principle: 'Masculine/feminine in all things' },
    ],
    
    gameplay: { mode: 'apply_laws', consequences: 'breaking_law_creates_penalty' },
    disclaimer: 'Hermetic principles presented as gameplay mechanics, not occult doctrine',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 9. CONFUCIAN HARMONY - Five relations as social mechanics
  // ────────────────────────────────────────────────────────────────────
  confucian: {
    id: 'confucian_harmony',
    name: 'FIVE RELATIONS',
    subtitle: 'Harmony through proper relationship balance',
    tradition: 'Confucian',
    
    relations: [
      { pair: 'Ruler-Subject', virtue: 'righteous authority' },
      { pair: 'Father-Son', virtue: 'loving protection' },
      { pair: 'Husband-Wife', virtue: 'partnership' },
      { pair: 'Elder-Younger', virtue: 'respect & care' },
      { pair: 'Friend-Friend', virtue: 'loyalty & trust' },
    ],
    
    gameplay: { mode: 'balance_relations', harmony: 'all_relations_strong', chaos: 'broken_bonds' },
    disclaimer: 'Confucianism presented as relationship-mechanics framework',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 10. EGYPTIAN DUAT - Underworld journey and shadow work
  // ────────────────────────────────────────────────────────────────────
  egyptian: {
    id: 'egyptian_duat',
    name: 'THE DUAT',
    subtitle: 'Journey through the Egyptian underworld',
    tradition: 'Egyptian',
    
    regions: [
      { name: 'Hall of Two Truths', challenge: 'face shadow self' },
      { name: 'Lake of Fire', challenge: 'consume fear' },
      { name: 'Serpent Gate', challenge: 'protect inner truth' },
      { name: 'Field of Reeds', challenge: 'maintain balance' },
    ],
    
    gameplay: { mode: 'shadow_journey', judgment: 'heart_weighed_against_truth' },
    disclaimer: 'Egyptian cosmology presented as metaphorical shadow-work mechanics',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 11. MAYAN TZOLK'IN - Sacred calendar mechanics
  // ────────────────────────────────────────────────────────────────────
  mayan: {
    id: 'mayan_calendar',
    name: 'TZOLK\'IN CYCLES',
    subtitle: '260-day sacred calendar as game progression',
    tradition: 'Mayan',
    
    kin_numbers: 20,
    day_names: ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat', 'Muluc', 'Oc',
                 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau'],
    
    gameplay: { mode: 'cyclical_progression', each_day: 'different_challenge', completion: '260_days' },
    disclaimer: 'Mayan calendar presented as cyclical game mechanism, not spiritual doctrine',
  },
  
  // ────────────────────────────────────────────────────────────────────
  // 12. I CHING - 64 hexagrams as situational mechanics
  // ────────────────────────────────────────────────────────────────────
  i_ching: {
    id: 'i_ching_hexagrams',
    name: 'BOOK OF CHANGES',
    subtitle: '64 Hexagrams - infinite adaptability',
    tradition: 'I Ching',
    
    hexagrams: 64,
    principles: ['Change is constant', 'Adaptation key', 'Reading situations', 'Finding opportunity'],
    
    gameplay: {
      mode: 'situational_response',
      reading: 'hexagram changes based on player actions',
      wisdom: 'interpret situation and respond appropriately',
    },
    
    disclaimer: 'I Ching presented as oracle-mechanics framework, not divination',
  },
};

// Helper to get cosmology
export function getCosmology(id) {
  return Object.values(COSMOLOGIES).find(c => c.id === id);
}

// Get list of all cosmologies
export function getAvailableCosmologies() {
  return Object.entries(COSMOLOGIES).map(([key, cosmo]) => ({
    id: cosmo.id,
    name: cosmo.name,
    tradition: cosmo.tradition,
    subtitle: cosmo.subtitle,
  }));
}

// Get all cosmologies by tradition
export function getCosmoloniesByTradition(tradition) {
  return Object.values(COSMOLOGIES).filter(c => c.tradition === tradition);
}
