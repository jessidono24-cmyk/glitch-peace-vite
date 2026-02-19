// ═══════════════════════════════════════════════════════════════════════
//  SIGIL PATTERN DATABASE — Universal Visual Pattern Grammar
//
//  Research foundation:
//  • Arnheim, R. (1969). Visual Thinking. UC Press.
//      — Circles = unity/wholeness; lines = tension; spirals = growth (Gestalt)
//  • Gimbutas, M. (1991). The Language of the Goddess. Thames & Hudson.
//      — 30+ recurring symbols documented across 25,000+ neolithic artefacts
//  • Haarmann, H. (1996). Early Civilization and Literacy in Europe.
//      — Proto-writing systems globally share the same ~30 geometric primitives
//  • Leroi-Gourhan, A. (1965). Préhistoire de l'art occidental.
//      — Prehistoric cave art worldwide uses identical geometric vocabulary
//  • Henderson, J.L. (1984). Cultural Attitudes in Psychological Perspective.
//      — Jungian archetypes map directly to cross-cultural visual primitives
//
//  Core thesis: all symbolic systems (runic, alchemical, hieroglyphic, game)
//  are combinations of the same ~12 elemental visual primitives. Learning to
//  read the grammar unlocks all sigil traditions simultaneously.
// ═══════════════════════════════════════════════════════════════════════

// ─── UNIVERSAL PATTERN GRAMMAR ──────────────────────────────────────────
//  The 12 visual primitives that appear in every symbolic system on Earth.
//  Source: cross-cultural synthesis from Arnheim (1969), Gimbutas (1991),
//  Haarmann (1996).

export const PATTERN_GRAMMAR = [
  {
    id: 'dot',
    symbol: '·',
    name: 'The Point',
    meanings: ['focus', 'origin', 'seed', 'presence', 'the Now'],
    description: 'The primordial mark — a single point of attention. Universally the first act of symbol-making. Represents the seed state of potential before expansion.',
    traditions: ['universal', 'Hindu (bindu)', 'Buddhist (Adi-Buddha point)', 'Hermetic (monad)'],
    gameConnection: 'The origin point — where your journey begins on the grid.',
  },
  {
    id: 'circle',
    symbol: '○',
    name: 'The Circle',
    meanings: ['wholeness', 'cycle', 'eternity', 'protection', 'self', 'unity'],
    description: 'No beginning, no end — the circle is the most universal symbol of completeness. Found in sun worship, protective rings, mandalas, and wedding bands across every culture.',
    traditions: ['universal', 'Celtic (ouroboros)', 'Hindu (mandala)', 'Hermetic (monad)', 'Egyptian (sun disk)'],
    gameConnection: 'The peace node ◈ outer ring — completion, wholeness integrated.',
  },
  {
    id: 'cross',
    symbol: '+',
    name: 'The Cross',
    meanings: ['intersection', 'balance', 'four directions', 'crossroads', 'threshold', 'choice'],
    description: 'Two lines meeting — the point of decision. Represents the four cardinal directions, the four elements, and the moment of choosing a path. The ultimate threshold symbol.',
    traditions: ['universal', 'Christian', 'Native American (medicine wheel)', 'Hermetic (four elements)', 'Mayan'],
    gameConnection: 'The ⊕ unity tile — four paths meeting, all elements balanced.',
  },
  {
    id: 'spiral',
    symbol: '⊛',
    name: 'The Spiral',
    meanings: ['growth', 'journey', 'time', 'becoming', 'consciousness', 'unfolding'],
    description: 'The pattern of growth from a center. Found in galaxies, shells, DNA, and hurricanes. In neolithic art, the spiral appears as the path of the soul\'s journey through existence.',
    traditions: ['Celtic (triskelion)', 'Neolithic (Newgrange)', 'Mayan (consciousness symbol)', 'Greek (meander)'],
    gameConnection: 'The movement pattern across the grid — your spiral path of exploration.',
  },
  {
    id: 'triangle_up',
    symbol: '△',
    name: 'The Upward Triangle',
    meanings: ['fire', 'aspiration', 'will', 'ascent', 'masculine', 'active principle'],
    description: 'The shape of a flame — pointing skyward, reaching toward the transcendent. In Hermetic alchemy it represents Fire and Air; the active, masculine, outward-reaching force.',
    traditions: ['Hermetic (fire/air)', 'Hindu (Shiva yantra)', 'Masonic', 'Platonic (tetrahedron = fire)'],
    gameConnection: 'Aspiration tiles — upward movement, reaching for insight.',
  },
  {
    id: 'triangle_down',
    symbol: '▽',
    name: 'The Downward Triangle',
    meanings: ['water', 'receptivity', 'grounding', 'descent', 'feminine', 'the subconscious'],
    description: 'Pointing earthward — the vessel, the receptive womb. In alchemy, the chalice. Combined with △ it forms the hexagram (Star of David / Seal of Solomon) — the union of opposites.',
    traditions: ['Hermetic (water/earth)', 'Hindu (Shakti yantra)', 'Jewish (Star of David)', 'Pythagorean'],
    gameConnection: 'The ∇ hazard marker — danger below, the descending force to navigate.',
  },
  {
    id: 'wave',
    symbol: '≋',
    name: 'The Wave',
    meanings: ['flow', 'change', 'water', 'emotion', 'oscillation', 'the feminine current'],
    description: 'The pattern of water, sound, light, and emotion. The wave shape appears in Egyptian hieroglyphs for water (nw), in Chinese as 水 (water), and in the Celtic spiral pattern for the sea.',
    traditions: ['Egyptian (water hieroglyph 𓈖)', 'Chinese 水', 'Nordic (Laguz rune)', 'Taoist (water principle)'],
    gameConnection: 'The ≋ tile flow — emotional patterns, the current beneath the grid.',
  },
  {
    id: 'diamond',
    symbol: '◇',
    name: 'The Diamond',
    meanings: ['clarity', 'multi-perspective', 'crystallization', 'precision', 'the transformed self'],
    description: 'Carbon under pressure becomes diamond — the hardest substance, the most refractive. A square rotated 45°, the diamond represents the same stability transformed into dynamic perspective.',
    traditions: ['Alchemical (crystallization)', 'Buddhist (Vajra = diamond-thunderbolt)', 'Hindu (Indra\'s net)'],
    gameConnection: 'The core shape of the peace node ◈ — the individual pattern crystallized.',
  },
  {
    id: 'star',
    symbol: '☆',
    name: 'The Five-Pointed Star',
    meanings: ['spirit over matter', 'humanity', 'guidance', 'aspiration', 'the fifth element'],
    description: 'The pentagram — five points representing four elements plus spirit (quintessence). In Pythagoras\' Brotherhood, it symbolized health. Each point = a limb + head of the human body (Leonardo\'s Vitruvian Man).',
    traditions: ['Pythagorean (health)', 'Hermetic (quintessence)', 'Islamic (5 pillars)', 'Wiccan', 'American (Founding Fathers)'],
    gameConnection: 'The ☆ insight tile — spirit manifesting through matter, the fifth element activated.',
  },
  {
    id: 'line',
    symbol: '—',
    name: 'The Line',
    meanings: ['boundary', 'connection', 'division', 'path', 'will', 'direction'],
    description: 'The simplest extension of a point — a path between two states. A horizontal line = rest, horizon, the threshold between worlds. A vertical line = the axis mundi, the spine, will directed upward. Lines divide and connect simultaneously.',
    traditions: ['universal', 'Runic (staff = primary axis)', 'Chinese (yi jing trigrams)', 'I Ching'],
    gameConnection: 'The grid lines — the structure of the playing field itself.',
  },
  {
    id: 'chevron',
    symbol: '∧',
    name: 'The Chevron',
    meanings: ['upward direction', 'sky', 'aspiration', 'mountain', 'the ascending path'],
    description: 'V-shape or inverted V — the mountain, the flight of birds, the arrow of intention. In neolithic art (Gimbutas 1991), the chevron appears universally as a sky/bird symbol. The direction indicator: where attention and will are pointed.',
    traditions: ['Neolithic (bird/sky symbol)', 'Alchemical (modified triangle)', 'Runic (component of many staves)', 'Heraldic'],
    gameConnection: 'The directional arrows — movement intention, path of the player.',
  },
  {
    id: 'arc',
    symbol: '⌒',
    name: 'The Arc',
    meanings: ['the crescent', 'reflection', 'soul', 'the incomplete circle', 'receiving'],
    description: 'Half the circle — the bowl that catches light, the crescent moon, the bridge arch. An arc is a circle that has not yet closed: potential not yet fulfilled, the soul in its receptive phase.',
    traditions: ['Astrological (Moon ☽)', 'Alchemical (anima/receptive principle)', 'Islamic (crescent)', 'Celtic (cauldron)'],
    gameConnection: 'The curved paths — the receptive openings in the pattern.',
  },
];

// ─── SIGIL DATABASE ──────────────────────────────────────────────────────
//  31 sigils across 6 traditions. Each can be decoded via PATTERN_GRAMMAR.
//  Sources: see file header.

export const SIGIL_DATABASE = [

  // ── GAME TILE SYMBOLS ────────────────────────────────────────────────
  {
    id: 'peace_node',    symbol: '◈', tradition: 'GLITCH·PEACE',
    name: 'Peace Node',
    primitives: ['circle', 'diamond'],
    meaning: 'Diamond (◇, crystallized pattern) held within circle (○, wholeness). Represents an individuated moment of consciousness (the crystallized self) integrated into the whole. Collecting it completes a fragment of the larger peace pattern.',
    lucidityGain: 5,
    gameConnection: 'Collect to advance',
  },
  {
    id: 'insight_star',  symbol: '☆', tradition: 'GLITCH·PEACE',
    name: 'Insight Star',
    primitives: ['star'],
    meaning: 'The pentagram — spirit above matter. Pythagoreans called it the symbol of health (hugieia). In the game, stepping here activates the fifth element: conscious awareness beyond the four elemental drives.',
    lucidityGain: 8,
    gameConnection: 'Triggers learning challenge',
  },
  {
    id: 'unity',         symbol: '⊕', tradition: 'GLITCH·PEACE',
    name: 'Unity Cross',
    primitives: ['circle', 'cross'],
    meaning: 'Circle + Cross — the oldest cosmological symbol on Earth (found in Neolithic Anatolia, ~6000 BCE). Also the astrological glyph for Earth itself. The four elements contained within the whole — complete equilibrium.',
    lucidityGain: 6,
    gameConnection: 'Cosmology activation tile',
  },
  {
    id: 'hazard',        symbol: '⚠', tradition: 'GLITCH·PEACE',
    name: 'Warning Triangle',
    primitives: ['triangle_up'],
    meaning: 'Upward triangle = fire/aspiration. Unchecked, the ascending force becomes danger — unbounded desire, impulsive action. The hazard tile is the shadow of the pentagram\'s fire point.',
    gameConnection: 'Hazard — impulse training',
  },
  {
    id: 'memory',        symbol: '◉', tradition: 'GLITCH·PEACE',
    name: 'Memory Eye',
    primitives: ['circle', 'dot'],
    meaning: 'A circle containing a point — the monad (Hermetic), the eye (Egyptian ḏrt), the Self gazing at itself. The dot is the origin; the surrounding circle is the container of memory. Stepping here reveals what was hidden.',
    lucidityGain: 10,
    gameConnection: 'Reveals hidden tiles in radius',
  },
  {
    id: 'terror',        symbol: '∇', tradition: 'GLITCH·PEACE',
    name: 'Descent Triangle',
    primitives: ['triangle_down'],
    meaning: 'The downward triangle = water/earth, the descending current. In alchemy, the symbol for Water; the dissolution of structure. The terror tile represents unprocessed emotion — the subconscious pull downward.',
    gameConnection: 'Terror tile — high damage',
  },
  {
    id: 'flow',          symbol: '≋', tradition: 'GLITCH·PEACE',
    name: 'Flow Wave',
    primitives: ['wave'],
    meaning: 'Triple wave — the Egyptian nw (primordial waters, U+13216), the Taoist water principle, the Norse Laguz rune. Three waves = conscious, subconscious, and superconscious currents in harmony. Healing energy.',
    lucidityGain: 4,
    gameConnection: 'Peace/healing tile',
  },
  {
    id: 'arch',          symbol: '◎', tradition: 'GLITCH·PEACE',
    name: 'Archetype Circle',
    primitives: ['circle', 'circle'],
    meaning: 'Double circle — the Hermetic principle of "As Above, So Below." The inner circle = personal self; outer = transpersonal archetype. Stepping here grants an Insight Token, representing archetypal pattern recognition.',
    lucidityGain: 12,
    gameConnection: 'Grants insight token',
  },

  // ── ELDER FUTHARK RUNES ──────────────────────────────────────────────
  // Source: Flowers, S. (1986). Runes and Magic. AMS Press.
  //         Thorsson, E. (1987). Runelore. Weiser Books.
  {
    id: 'fehu',   symbol: 'ᚠ', tradition: 'Elder Futhark (Germanic, ~150 CE)',
    name: 'Fehu — Cattle/Wealth',
    primitives: ['line', 'chevron'],
    meaning: 'Two upward strokes from a vertical staff — the horns of cattle, the symbol of mobile wealth. Represents circulating abundance, generosity, and the energy that moves rather than stagnates.',
  },
  {
    id: 'uruz',   symbol: 'ᚢ', tradition: 'Elder Futhark',
    name: 'Uruz — Aurochs/Primal Strength',
    primitives: ['triangle_down', 'line'],
    meaning: 'The arch of the aurochs horn — raw vital force, untamed strength, health, and the creative power of the wild. The shadow of order is primal chaos; Uruz is chaos channeled into vitality.',
  },
  {
    id: 'thurisaz', symbol: 'ᚦ', tradition: 'Elder Futhark',
    name: 'Thurisaz — Thorn/Giant',
    primitives: ['triangle_up', 'line'],
    meaning: 'A thorn upon a staff — protective and dangerous simultaneously. Named for the Norse giants (Þursar) and Thor\'s hammer. The threshold guardian: forces you to develop strength to pass.',
  },
  {
    id: 'ansuz',  symbol: 'ᚨ', tradition: 'Elder Futhark',
    name: 'Ansuz — God/Word',
    primitives: ['line', 'chevron', 'chevron'],
    meaning: 'The rune of Odin and divine inspiration. Two downward branches from a staff — the exhaled breath becoming word becoming world. Speech, wisdom, and the creative power of consciousness itself.',
  },
  {
    id: 'sowilo', symbol: 'ᛊ', tradition: 'Elder Futhark',
    name: 'Sowilo — Sun/Victory',
    primitives: ['wave', 'line'],
    meaning: 'The lightning bolt and the sun wheel — the victory of light, willpower, and clarity. The S-shape is the path of the sun across the sky seen from extreme northern latitudes. Wholeness, success, and solar will.',
  },
  {
    id: 'dagaz',  symbol: 'ᛞ', tradition: 'Elder Futhark',
    name: 'Dagaz — Dawn/Breakthrough',
    primitives: ['diamond', 'cross'],
    meaning: 'Two triangles meeting at their tips — the hourglass of time, the moment at the boundary between night and day. The paradox rune: breakthrough comes from holding opposites in balance until transformation occurs.',
  },
  {
    id: 'othala', symbol: 'ᛟ', tradition: 'Elder Futhark',
    name: 'Othala — Ancestral Home',
    primitives: ['diamond', 'line', 'line'],
    meaning: 'A diamond with two legs — the inherited land, ancestral wisdom, the home as sacred space. Represents the patterns we receive from those who came before, and our responsibility to pass wisdom forward.',
  },

  // ── ALCHEMICAL SYMBOLS ───────────────────────────────────────────────
  // Source: Principe, L. (2013). The Secrets of Alchemy. Univ. of Chicago Press.
  //         Jung, C.G. (1944). Psychology and Alchemy. Collected Works Vol 12.
  {
    id: 'sol',    symbol: '☉', tradition: 'Alchemical / Astrological',
    name: 'Sol — Gold/Solar Consciousness',
    primitives: ['circle', 'dot'],
    meaning: 'Circle with a central point — the monad made visible. In alchemy, gold: the perfected metal, the goal of transformation. In Jungian psychology, the symbol of the Self — the totality of the psyche organized around a conscious center.',
  },
  {
    id: 'luna',   symbol: '☽', tradition: 'Alchemical / Astrological',
    name: 'Luna — Silver/Reflective Mind',
    primitives: ['circle', 'arc'],
    meaning: 'The crescent — half the circle visible, half hidden. Silver: the reflective metal. The anima, the unconscious, memory, and the part of self that witnesses rather than acts. The light we see is reflected, not generated.',
  },
  {
    id: 'mercury_alch', symbol: '☿', tradition: 'Alchemical',
    name: 'Mercury — Mind/Transformation',
    primitives: ['circle', 'cross', 'arc'],
    meaning: 'Cross + circle + crescent — male, solar, and lunar principles unified. Mercury (Hermes) is the messenger between worlds. In alchemy: quicksilver, the liquid metal, the principle of transformation and communication.',
  },
  {
    id: 'fire_alch',    symbol: '🜂', tradition: 'Alchemical (Paracelsus)',
    name: 'Fire — Sulfur/Will',
    primitives: ['triangle_up'],
    meaning: 'Pure upward triangle — the fire triangle. In Paracelsian alchemy: Sulfur, the active principle, will, and soul. The ascending drive toward spiritual realization. At its shadow: addiction, compulsion, uncontrolled desire.',
  },
  {
    id: 'water_alch',   symbol: '🜄', tradition: 'Alchemical',
    name: 'Water — Mercury/Flow',
    primitives: ['triangle_down'],
    meaning: 'Pure downward triangle — the water triangle. In Paracelsian alchemy: Mercury, the fluid principle, the mind that flows between states. Emotional intelligence, the ability to contain and transmute.',
  },
  {
    id: 'earth_alch',   symbol: '🜃', tradition: 'Alchemical',
    name: 'Earth — Salt/Manifestation',
    primitives: ['triangle_down', 'line'],
    meaning: 'Water triangle crossed by a horizontal line — earth, the body, crystallized form. Salt: in alchemy the body, in Jungian terms the ego. The third principle: Spirit (sulfur) + Soul (mercury) = Body (salt).',
  },
  {
    id: 'air_alch',     symbol: '🜁', tradition: 'Alchemical',
    name: 'Air — Quintessence/Breath',
    primitives: ['triangle_up', 'line'],
    meaning: 'Fire triangle crossed by a horizontal line — air, the breath between worlds. The fourth element that carries the other three. In many traditions: prana, chi, pneuma — the life force that animates matter.',
  },

  // ── KEY EGYPTIAN HIEROGLYPHS ─────────────────────────────────────────
  // Source: Allen, J.P. (2000). Middle Egyptian. Cambridge Univ. Press.
  //         Budge, E.A.W. (1920). An Egyptian Hieroglyphic Dictionary.
  {
    id: 'ankh',   symbol: '𓋹', tradition: 'Ancient Egyptian (Gardiner S34)',
    name: 'Ankh — ꜥnḫ (Life)',
    primitives: ['circle', 'cross'],
    meaning: 'Cross surmounted by a circle (or oval representing a sandal strap). The Egyptian word ꜥnḫ means "life." Carried by gods to offer life to pharaohs. The loop is breath, the cross is the body — spirit animating matter. Same structure as ⊕.',
    lucidityGain: 7,
  },
  {
    id: 'eye_horus', symbol: '𓂀', tradition: 'Ancient Egyptian (Gardiner D4)',
    name: 'Wedjat — ḏrt n Ḥr (Eye of Horus)',
    primitives: ['circle', 'dot', 'wave'],
    meaning: 'The restored eye of Horus — ḏrt ḥr. Each fraction of the eye represents a fraction of the heqat (1/2, 1/4, 1/8...). Symbol of healing, royal protection, and sacred perception. The eye that was broken and made whole is the same as the self lost and recovered.',
    lucidityGain: 10,
  },
  {
    id: 'ra_sun',  symbol: '𓇳', tradition: 'Ancient Egyptian (Gardiner N6)',
    name: 'Ra — rꜥ (Solar Disk)',
    primitives: ['circle', 'dot'],
    meaning: 'The sun disk with internal dot — identical in structure to the alchemical ☉ Sol. Ra: the creative solar principle, consciousness itself, the self-created creator (khepri = "he who becomes"). In the Heliopolitan cosmology: the first being.',
    lucidityGain: 8,
  },
  {
    id: 'maat',    symbol: '𓆄', tradition: 'Ancient Egyptian (Gardiner H6)',
    name: 'Ma\'at Feather — mꜣꜥt (Truth/Harmony)',
    primitives: ['line', 'chevron'],
    meaning: 'The ostrich feather of Ma\'at — the measure of the heart in the weighing ceremony (Duat). The heart (ib) is weighed against this feather; if equal, the soul enters the Field of Reeds. Represents truth, justice, and cosmic harmony — the natural order (ꜣt) that holds the universe together.',
    lucidityGain: 9,
  },
  {
    id: 'khepri',  symbol: '𓆣', tradition: 'Ancient Egyptian (Gardiner L1)',
    name: 'Khepri — ḫprj (Becoming)',
    primitives: ['circle', 'spiral'],
    meaning: 'The scarab beetle rolling its ball — the verb ḫpr means "to become, to transform, to come into being." The scarab rolls dung into a ball and buries it; from this ball new beetles emerge. Symbol of self-creation, transformation through engagement with what is considered waste or darkness.',
    lucidityGain: 8,
  },
  {
    id: 'ib',      symbol: '𓇽', tradition: 'Ancient Egyptian (Gardiner F34)',
    name: 'Ib — ib (Heart-Mind)',
    primitives: ['circle', 'cross'],
    meaning: 'The heart vessel — ib. In Egyptian thought, the heart was the seat of intellect, will, and emotion (our "mind"). The brain was not considered significant. The ib is what thinks, decides, and remembers. Weighing the ib against Ma\'at\'s feather was the ultimate judgment.',
    lucidityGain: 6,
  },

  // ── PLANETARY SYMBOLS ────────────────────────────────────────────────
  // Source: Cornelius, G. & Devereux, P. (1996). The Secret Language of the Stars.
  {
    id: 'saturn',  symbol: '♄', tradition: 'Astrological / Alchemical',
    name: 'Saturn — Lead/Boundary',
    primitives: ['cross', 'arc'],
    meaning: 'Cross over a descending arc — the sickle of time. Saturn: the great teacher through limitation. Lead: heaviest metal, slowest to transform. In psychology: the superego, the internalized law, the pattern-boundary that defines the self.',
  },
  {
    id: 'jupiter', symbol: '♃', tradition: 'Astrological / Alchemical',
    name: 'Jupiter — Tin/Expansion',
    primitives: ['arc', 'cross'],
    meaning: 'An arc rising from a cross — the number 4 inverted, the crescent of the soul ascending above matter. Jupiter: abundance, wisdom, expansion beyond limitations. Tin: flexible, abundant, resonant. The force that enlarges rather than contracts.',
  },
  {
    id: 'venus',   symbol: '♀', tradition: 'Astrological / Alchemical',
    name: 'Venus — Copper/Beauty',
    primitives: ['circle', 'cross'],
    meaning: 'Circle above a cross — spirit (○) rising above matter (+). Copper: the beautiful metal, conductor of electricity and love. Venus: the principle of attraction, beauty, value, relationship. The handheld mirror of self-recognition.',
  },
];

// ─── INDEX MAPS ─────────────────────────────────────────────────────────

const _bySymbol = new Map(SIGIL_DATABASE.map(s => [s.symbol, s]));
const _byId     = new Map(SIGIL_DATABASE.map(s => [s.id,     s]));

/**
 * Return sigil data for a given Unicode symbol (e.g. '◈', 'ᚠ', '☉').
 * Returns null if not found.
 */
export function getSigilForSymbol(symbol) {
  return _bySymbol.get(symbol) || null;
}

/**
 * Return sigil data by id.
 */
export function getSigilById(id) {
  return _byId.get(id) || null;
}

/**
 * Given a set of primitive ids, return all sigils that use ALL of them.
 */
export function findSigilsByPrimitives(primitiveIds) {
  return SIGIL_DATABASE.filter(s =>
    primitiveIds.every(p => s.primitives.includes(p))
  );
}

// ─── SIGIL CHALLENGE GENERATOR ───────────────────────────────────────────
//  "What does this symbol mean?" — tests pattern grammar reading.
//  Returns a challenge object compatible with learning-modules format.

export function getSigilChallenge() {
  // Pick a random sigil that has a meaning field
  const eligible = SIGIL_DATABASE.filter(s => s.meaning && s.meaning.length > 30);
  const sigil = eligible[Math.floor(Math.random() * eligible.length)];

  // Generate a short correct-answer summary (first sentence of meaning)
  const correctMeaning = sigil.meaning.split('.')[0].trim();

  // Build distractors from other sigil meanings
  const distractors = [];
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  for (const other of shuffled) {
    if (other.id !== sigil.id) {
      const distractor = other.meaning.split('.')[0].trim();
      if (distractor !== correctMeaning && distractors.length < 3) {
        distractors.push(distractor);
      }
    }
    if (distractors.length >= 3) break;
  }

  // Pad if needed (shouldn't happen with 35 entries)
  while (distractors.length < 3) distractors.push('Unknown primordial force');

  const allOptions = [correctMeaning, ...distractors];
  // Fisher-Yates shuffle
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  const correctIndex = allOptions.indexOf(correctMeaning);

  return {
    type: 'sigil',
    prompt: `${sigil.symbol}  ${sigil.name} (${sigil.tradition.split('(')[0].trim()}) — this sigil means...`,
    options: allOptions.map(o => o.length > 55 ? o.slice(0, 52) + '…' : o),
    correct: correctIndex,
    fullMeaning: sigil.meaning,
    primitives: sigil.primitives,
    lucidityGain: sigil.lucidityGain || 5,
  };
}

// ─── PATTERN GRAMMAR RENDERER ────────────────────────────────────────────
//  Renders a concise "Pattern Reading" overlay for a given sigil.
//  Called by the learning overlay in GridGameMode.

/**
 * Decode a sigil into its component primitives and return a multi-line
 * description for the challenge explanation panel.
 * @param {string} sigilId
 * @returns {string[]} array of explanation lines
 */
export function decodeSigilPrimitives(sigilId) {
  const sigil = getSigilById(sigilId);
  if (!sigil) return ['Pattern unknown.'];

  const lines = [`${sigil.symbol}  ${sigil.name}`, `Tradition: ${sigil.tradition}`];
  lines.push('');
  lines.push('Pattern Primitives:');
  for (const pid of sigil.primitives) {
    const prim = PATTERN_GRAMMAR.find(p => p.id === pid);
    if (prim) {
      lines.push(`  ${prim.symbol} ${prim.name} — ${prim.meanings.slice(0, 3).join(', ')}`);
    }
  }
  lines.push('');
  // Wrap meaning at ~50 chars
  const words = sigil.meaning.split(' ');
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).length > 50) { lines.push(line.trim()); line = w; }
    else { line += ' ' + w; }
  }
  if (line.trim()) lines.push(line.trim());

  return lines;
}
