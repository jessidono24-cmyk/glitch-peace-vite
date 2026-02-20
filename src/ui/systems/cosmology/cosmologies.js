'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  COSMOLOGY REALMS — 12 World Wisdom Traditions as Gameplay Mechanics
//  Ported from glitch-peace-vite / GLITCH-PEACE-MEGA-FINAL
//  Each tradition sterilised — presented as pattern mechanics, not dogma.
//  All origins credited; closed practices excluded.
//
//  Research basis:
//   • Coomaraswamy (1943) The Dance of Shiva — Hindu cosmology
//   • Buddhaghosa (c.430 CE) Visuddhimagga — Buddhist wheel
//   • Laozi (c.4th BCE) Tao Te Ching — Wu Wei
//   • Calverley (1983) Faulkner Egyptian Book of the Dead — Duat
//   • Crossley-Holland (1980) Norse Myths — Yggdrasil
//   • MacKillop (1998) Celtic Mythology — Otherworld
//   • Boyce (1975) History of Zoroastrianism
//   • Three Initiates (1908) Kybalion — Hermetic Principles
//   • Lü Buwei (c.239 BCE) Lüshi Chunqiu — Confucian
//   • Legge (1899) I Ching translation
//   • Thompson (1971) Maya History and Religion — Tzolk'in
// ═══════════════════════════════════════════════════════════════════════

export const COSMOLOGIES = {

  // ───────────────────────────────────────────────────────────
  // 1. HINDU CHAKRA SYSTEM — Energy centres as vertical layers
  // ───────────────────────────────────────────────────────────
  chakra: {
    id: 'chakra_realm', name: 'SEVEN ENERGY FIELDS', emoji: '🌈',
    subtitle: 'Vertical navigation through consciousness layers',
    tradition: 'Hindu', color: '#ff6600',
    layers: [
      { name: 'Root Field',   color: '#cc0000', element: 'earth',        keyword: 'survival',   mechanic: 'heavy_gravity' },
      { name: 'Flow Field',   color: '#ff6600', element: 'water',        keyword: 'emotion',    mechanic: 'tile_drift' },
      { name: 'Power Field',  color: '#ffdd00', element: 'fire',         keyword: 'will',       mechanic: 'energy_consumption' },
      { name: 'Heart Field',  color: '#00ff88', element: 'air',          keyword: 'compassion', mechanic: 'enemy_pacification' },
      { name: 'Voice Field',  color: '#00aaff', element: 'ether',        keyword: 'truth',      mechanic: 'hidden_reveal' },
      { name: 'Sight Field',  color: '#6600ff', element: 'light',        keyword: 'intuition',  mechanic: 'future_vision' },
      { name: 'Unity Field',  color: '#ffffff', element: 'consciousness', keyword: 'oneness',   mechanic: 'ego_dissolution' },
    ],
    gameplay: { mode: 'vertical_ascent', progression: 'sequential', descent_allowed: true },
    dreamscapeAffinity: ['integration', 'summit'],
    disclaimer: 'Chakras presented as energetic navigation metaphor, not spiritual doctrine',
  },

  // ───────────────────────────────────────────────────────────
  // 2. BUDDHIST WHEEL OF BECOMING — Cycle breaking through insight
  // ───────────────────────────────────────────────────────────
  wheel: {
    id: 'wheel_of_becoming', name: 'CYCLE OF ATTACHMENT', emoji: '☸️',
    subtitle: 'Navigate the 12 links of dependent origination',
    tradition: 'Buddhist', color: '#ff8800',
    links: [
      { name: 'Ignorance',      symbol: '👤', effect: 'reduced_vision' },
      { name: 'Formation',      symbol: '🔨', effect: 'habit_patterns' },
      { name: 'Consciousness',  symbol: '👁️',  effect: 'perception_filters' },
      { name: 'Name & Form',    symbol: '🎭', effect: 'identity_attachment' },
      { name: 'Six Senses',     symbol: '👂', effect: 'sensory_overload' },
      { name: 'Contact',        symbol: '🤝', effect: 'reactive_impulse' },
      { name: 'Feeling',        symbol: '❤️',  effect: 'emotional_pull' },
      { name: 'Craving',        symbol: '🔥', effect: 'desire_spiral' },
      { name: 'Clinging',       symbol: '⛓️',  effect: 'attachment_pain' },
      { name: 'Becoming',       symbol: '🌀', effect: 'identity_loop' },
      { name: 'Birth',          symbol: '🌱', effect: 'new_suffering' },
      { name: 'Aging & Death',  symbol: '💀', effect: 'entropy' },
    ],
    gameplay: { mode: 'circular_navigation', cycles_to_escape: 3 },
    truths: ['Patterns cause friction', 'Friction has sources', 'Friction ceases', 'A path to cessation exists'],
    dreamscapeAffinity: ['courtyard', 'neighborhood'],
    disclaimer: 'Buddhist concepts presented as pattern mechanics, not religious practice',
  },

  // ───────────────────────────────────────────────────────────
  // 3. TAOIST WU WEI — Effortless action through flow state
  // ───────────────────────────────────────────────────────────
  wu_wei: {
    id: 'wu_wei_flow', name: 'THE UNCARVED BLOCK', emoji: '☯️',
    subtitle: 'Effortless action through natural rhythm',
    tradition: 'Taoist', color: '#ffffff',
    principles: ['wu wei (non-forcing)', 'yin yang balance', 'flow state', 'natural order'],
    gameplay: { mode: 'flow_state_mechanics', effortless: 'less input = more efficient' },
    yin_yang: {
      yin: { passive_power: true, receptive: true, color: '#000000' },
      yang: { active_power: true, assertive: true, color: '#ffffff' },
      balance: 'neither dominates',
    },
    dreamscapeAffinity: ['leaping_field', 'orb_escape'],
    disclaimer: 'Taoism presented as flow-state mechanics, not religious philosophy',
  },

  // ───────────────────────────────────────────────────────────
  // 4. TANTRIC — Polarity balance mechanics
  // ───────────────────────────────────────────────────────────
  tantra: {
    id: 'tantric_union', name: 'FIELD OF POLARITY', emoji: '⚡',
    subtitle: 'Complementary-force balance — stillness meets movement',
    tradition: 'Tantric', color: '#cc00ff',
    polarities: {
      shiva: { name: 'Stillness Pole', color: '#0088ff', mechanic: 'freeze_enemies' },
      shakti: { name: 'Movement Pole', color: '#ff0088', mechanic: 'rapid_change' },
    },
    gameplay: { mode: 'balance_polarities', balance_meter: { center: 50, optimal_range: [40, 60] } },
    dreamscapeAffinity: ['bedroom', 'integration'],
    disclaimer: 'Tantra presented as complementary-force physics, not sexual practice',
  },

  // ───────────────────────────────────────────────────────────
  // 5. NORSE YGGDRASIL — Nine realms tree navigation
  // ───────────────────────────────────────────────────────────
  yggdrasil: {
    id: 'world_tree', name: 'NINE REALM TREE', emoji: '🌳',
    subtitle: 'Navigate nine Norse realms across the world tree',
    tradition: 'Norse', color: '#44bb00',
    realms: [
      { name: 'Asgard',       color: '#ffdd00', theme: 'Order & Structure',        level: 'crown' },
      { name: 'Vanaheim',     color: '#00ff88', theme: 'Nature & Fertility',        level: 'upper' },
      { name: 'Alfheim',      color: '#ffffff', theme: 'Light & Clarity',           level: 'upper' },
      { name: 'Midgard',      color: '#8844aa', theme: 'Human Experience',          level: 'middle' },
      { name: 'Jotunheim',    color: '#ff4400', theme: 'Chaos & Giants',            level: 'middle' },
      { name: 'Svartalfheim', color: '#332211', theme: 'Craft & Shadow',            level: 'lower' },
      { name: 'Nidavellir',   color: '#ff6600', theme: 'Forging & Transformation',  level: 'lower' },
      { name: 'Niflheim',     color: '#0044aa', theme: 'Ice & Stillness',           level: 'root' },
      { name: 'Muspelheim',   color: '#ff0000', theme: 'Fire & Primordial Energy',  level: 'root' },
    ],
    gameplay: { mode: 'tree_navigation', structure: 'vertical_with_branches' },
    ragnarok: { trigger: 'chaos exceeds order', effect: 'realm_reset_with_memory' },
    dreamscapeAffinity: ['summit', 'mountain_dragon'],
    disclaimer: 'Norse mythology presented as navigation framework, not religious belief',
  },

  // ───────────────────────────────────────────────────────────
  // 6. CELTIC OTHERWORLD — Veil crossing mechanics
  // ───────────────────────────────────────────────────────────
  celtic: {
    id: 'celtic_otherworld', name: 'VEIL CROSSING', emoji: '🍀',
    subtitle: 'Navigate between visible and invisible worlds',
    tradition: 'Celtic', color: '#00cc44',
    worlds: {
      thisworld: { name: 'Manifest Field', visibility: 'full', physics: 'normal', color: '#00aa44' },
      otherworld: { name: 'Subtle Field',  visibility: 'shimmering', physics: 'dreamy', color: '#00aaff' },
    },
    gameplay: { mode: 'veil_navigation', crossing_cost: 'emotional_energy' },
    dreamscapeAffinity: ['orb_escape', 'leaping_field'],
    disclaimer: 'Celtic cosmology presented as parallel-world mechanics, not spiritual practice',
  },

  // ───────────────────────────────────────────────────────────
  // 7. ZOROASTRIAN DUALITY — Order vs Chaos eternal struggle
  // ───────────────────────────────────────────────────────────
  zoroastrian: {
    id: 'zoroastrian_duality', name: 'ORDER VERSUS ENTROPY', emoji: '⚖️',
    subtitle: 'Eternal pattern — creation vs dissolution',
    tradition: 'Zoroastrian', color: '#ffaa00',
    forces: {
      order:   { name: 'Ahura Mazda', color: '#ffdddd', principle: 'creation' },
      entropy: { name: 'Angra Mainyu', color: '#333333', principle: 'dissolution' },
    },
    gameplay: { mode: 'force_balance', victory: 'order prevails but entropy returns' },
    dreamscapeAffinity: ['bedroom', 'void'],
    disclaimer: 'Zoroastrianism presented as pattern mechanics, not religious doctrine',
  },

  // ───────────────────────────────────────────────────────────
  // 8. HERMETIC — Seven Universal Laws as gameplay rules
  // ───────────────────────────────────────────────────────────
  hermetic: {
    id: 'hermetic_laws', name: 'SEVEN UNIVERSAL LAWS', emoji: '🔮',
    subtitle: 'As above so below — laws governing all pattern',
    tradition: 'Hermetic', color: '#aa88ff',
    laws: [
      { name: 'Mentalism',      principle: 'Mind creates reality' },
      { name: 'Correspondence', principle: 'As above, so below' },
      { name: 'Vibration',      principle: 'Everything vibrates' },
      { name: 'Polarity',       principle: 'Opposites are degrees of the same thing' },
      { name: 'Rhythm',         principle: 'Cycles are eternal' },
      { name: 'Cause & Effect', principle: 'Nothing happens by chance' },
      { name: 'Gender',         principle: 'Masculine/feminine in all things' },
    ],
    gameplay: { mode: 'apply_laws', consequences: 'breaking_law_creates_friction' },
    dreamscapeAffinity: ['void', 'integration'],
    disclaimer: 'Hermetic principles presented as gameplay mechanics, not occult doctrine',
  },

  // ───────────────────────────────────────────────────────────
  // 9. CONFUCIAN HARMONY — Five relationships as social mechanics
  // ───────────────────────────────────────────────────────────
  confucian: {
    id: 'confucian_harmony', name: 'FIVE RELATIONS', emoji: '🤲',
    subtitle: 'Harmony through proper relationship balance',
    tradition: 'Confucian', color: '#ffcc44',
    relations: [
      { pair: 'Ruler-Subject',  virtue: 'righteous authority' },
      { pair: 'Parent-Child',   virtue: 'loving protection' },
      { pair: 'Partners',       virtue: 'partnership' },
      { pair: 'Elder-Younger',  virtue: 'respect & care' },
      { pair: 'Friend-Friend',  virtue: 'loyalty & trust' },
    ],
    gameplay: { mode: 'balance_relations', harmony: 'all_relations_strong', chaos: 'broken_bonds' },
    dreamscapeAffinity: ['neighborhood', 'courtyard'],
    disclaimer: 'Confucianism presented as relationship-mechanics framework',
  },

  // ───────────────────────────────────────────────────────────
  // 10. EGYPTIAN DUAT — Underworld journey and shadow work
  // ───────────────────────────────────────────────────────────
  egyptian: {
    id: 'egyptian_duat', name: 'THE DUAT', emoji: '𓂀',
    subtitle: 'Journey through the Egyptian underworld — shadow integration',
    tradition: 'Egyptian', color: '#cc9900',
    regions: [
      { name: 'Hall of Two Truths', challenge: 'face shadow self',    symbol: '⚖️' },
      { name: 'Lake of Fire',       challenge: 'transmute fear',      symbol: '🔥' },
      { name: 'Serpent Gate',       challenge: 'protect inner truth', symbol: '🐍' },
      { name: 'Field of Reeds',     challenge: 'maintain balance',    symbol: '🌾' },
    ],
    gameplay: { mode: 'shadow_journey', judgment: 'heart_weighed_against_truth' },
    hieroglyphs: { ankh: 'life', djed: 'stability', was: 'power', eye_ra: 'protection' },
    dreamscapeAffinity: ['aztec', 'void'],
    disclaimer: 'Egyptian cosmology presented as metaphorical shadow-work mechanics',
  },

  // ───────────────────────────────────────────────────────────
  // 11. MAYAN TZOLK'IN — 260-day sacred calendar
  // ───────────────────────────────────────────────────────────
  mayan: {
    id: 'mayan_calendar', name: "TZOLK'IN CYCLES", emoji: '🗓️',
    subtitle: '260-day sacred calendar as game progression',
    tradition: 'Mayan', color: '#ff8800',
    kin_numbers: 20,
    day_names: ['Imix','Ik','Akbal','Kan','Chicchan','Cimi','Manik','Lamat','Muluc','Oc',
                'Chuen','Eb','Ben','Ix','Men','Cib','Caban','Etznab','Cauac','Ahau'],
    gameplay: { mode: 'cyclical_progression', each_day: 'different_challenge', completion: '260_days' },
    dreamscapeAffinity: ['aztec'],
    disclaimer: 'Mayan calendar presented as cyclical game mechanism, not spiritual doctrine',
  },

  // ───────────────────────────────────────────────────────────
  // 12. I CHING — 64 hexagrams as situational mechanics
  // ───────────────────────────────────────────────────────────
  i_ching: {
    id: 'i_ching_hexagrams', name: 'BOOK OF CHANGES', emoji: '☰',
    subtitle: '64 Hexagrams — infinite adaptability through reading situations',
    tradition: 'I Ching', color: '#88aaff',
    hexagrams: 64,
    principles: ['Change is constant', 'Adaptation is key', 'Reading situations', 'Finding opportunity in difficulty'],
    sample_hexagrams: [
      { num: 1,  name: 'Qian', meaning: 'The Creative — Heaven, pure yang force' },
      { num: 2,  name: 'Kun',  meaning: 'The Receptive — Earth, pure yin force' },
      { num: 11, name: 'Tai',  meaning: 'Peace — heaven and earth in harmony' },
      { num: 29, name: 'Kan',  meaning: 'The Abysmal — water, danger, depth' },
      { num: 63, name: 'Ji Ji', meaning: 'After Completion — transition' },
    ],
    gameplay: { mode: 'situational_response', reading: 'hexagram reflects player actions', wisdom: 'respond to situation appropriately' },
    dreamscapeAffinity: ['integration', 'void'],
    disclaimer: 'I Ching presented as situational-mechanics framework, not divination',
  },
};

// Map dreamscape id → cosmological theme for display
export const DREAMSCAPE_COSMOLOGY = {
  void:             'hermetic',
  mountain_dragon:  'yggdrasil',
  courtyard:        'wheel',
  leaping_field:    'wu_wei',
  summit:           'chakra',
  neighborhood:     'confucian',
  bedroom:          'zoroastrian',
  aztec:            'mayan',
  orb_escape:       'celtic',
  integration:      'i_ching',
};

export function getCosmology(id) {
  return Object.values(COSMOLOGIES).find(c => c.id === id) || null;
}

export function getCosmologyForDreamscape(dreamscapeId) {
  const key = DREAMSCAPE_COSMOLOGY[dreamscapeId];
  return key ? COSMOLOGIES[key] : null;
}

export function getAvailableCosmologies() {
  return Object.entries(COSMOLOGIES).map(([key, c]) => ({
    key, id: c.id, name: c.name, emoji: c.emoji, tradition: c.tradition, subtitle: c.subtitle, color: c.color,
  }));
}
