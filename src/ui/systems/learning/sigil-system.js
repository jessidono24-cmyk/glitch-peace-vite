'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — sigil-system.js
//
//  A universal pattern-language database that spans alchemical symbols,
//  Norse runes, sacred geometry, and Egyptian hieroglyphs — demonstrating
//  that ALL writing and symbolic systems encode meaning through a finite
//  set of geometric primitives.
//
//  Evidence base:
//  ─────────────────────────────────────────────────────────────────────
//  1. C.G. Jung, Archetypes and the Collective Unconscious (1959)
//     — Cross-cultural geometric symbols appear in dreams, art, and
//       myth independent of cultural exposure (circle, cross, spiral).
//
//  2. Joseph Campbell, The Power of Myth (1988)
//     — Universal symbolic patterns (hero's circle, axis mundi) found in
//       every culture without documented contact.
//
//  3. Robert Lawlor, Sacred Geometry (1982)
//     — Geometric ratios (φ, √2, √3) underlie temple construction across
//       ancient Egypt, Greece, India, and Mesoamerica.
//
//  4. Florian Coulmas, The Writing Systems of the World (1989)
//     — All 3,000+ writing systems derive from one of ~12 geometric strokes:
//       dot, vertical line, horizontal line, curve, diagonal, cross, circle,
//       spiral, triangle, wedge, loop, zigzag.
//
//  5. Gardiner's Sign List (1927 / Egyptian) — 750+ hieroglyphs categorized
//     by geometric class (nature signs, body parts, geometric forms).
//
//  6. Elder Futhark rune meanings (Verelius 1675; modern consensus):
//     — Rune shapes encode phonetics + cosmological meaning simultaneously.
//
//  PATTERN READING RULES (universal across writing systems):
//  ─────────────────────────────────────────────────────────────────────
//  These 10 rules let you read ANY sigil without memorization:
//  1. HORIZONTAL LINE  → stability, earth, foundation, rest
//  2. VERTICAL LINE    → aspiration, spirit, axis mundi, connection
//  3. DIAGONAL up-right → growth, progression, evolution
//  4. DIAGONAL down-right → descent, grounding, integration
//  5. CIRCLE / CURVE   → unity, cycle, continuity, the feminine
//  6. CROSS (⊕)        → meeting point, the four directions, balance
//  7. TRIANGLE ▲ (up)  → fire, aspiration, masculine, sky
//  8. TRIANGLE ▽ (down) → water, receptivity, feminine, earth
//  9. SPIRAL           → time, evolution, the cosmos in motion
// 10. DOT ·            → origin, seed, the unmanifest point
// ═══════════════════════════════════════════════════════════════════════

// ─── 10 Universal Pattern Rules ───────────────────────────────────────
export const PATTERN_RULES = [
  {
    id: 'horizontal',
    shape: '─',
    name: 'Horizontal Line',
    principle: 'stability · earth · foundation · rest',
    evidence: 'Egyptian ḥr-tp (horizon) uses two horizontal lines; Kanji 一 (one) is the fundamental horizontal; Hebrew aleph root stroke is horizontal.',
    examples: ['─ (dash)', '═ (double)', 'Aries ♈ base', 'Chinese 一 二 三'],
  },
  {
    id: 'vertical',
    shape: '│',
    name: 'Vertical Line',
    principle: 'aspiration · spirit · axis mundi · connection above and below',
    evidence: 'Egyptian djed pillar 𓊽 represents the spine of Osiris — stability and vertical regeneration. Norse Yggdrasil is the cosmic vertical axis. The number 1 is vertical in every numeral system.',
    examples: ['│ (pipe)', 'ǀ (vertical bar)', 'Kanji 十 center stroke', 'ꚧ (djed)'],
  },
  {
    id: 'diagonal-rise',
    shape: '╱',
    name: 'Rising Diagonal',
    principle: 'growth · evolution · progression · solar ascent',
    evidence: 'The sun\'s apparent rising motion from horizon creates the universal \'rise\' diagonal. Sanskrit diacritics use ascending strokes for elevated vowels. Ogham script (Celtic) uses rising strokes for \'higher\' letters.',
    examples: ['╱', 'Check mark √', 'Aleph ℵ upper stroke', 'Kana upstroke'],
  },
  {
    id: 'diagonal-fall',
    shape: '╲',
    name: 'Falling Diagonal',
    principle: 'grounding · integration · descent · internalizing',
    evidence: 'Chinese radicals for \'entering\' (入) and \'person\' (人) both use falling diagonals to represent downward integration. Hebrew dalet uses a falling stroke to mean \'door\' (grounding, entry).',
    examples: ['╲', 'Backslash \\', 'Chinese 人 人 入', 'Hebrew ד dalet'],
  },
  {
    id: 'circle',
    shape: '○',
    name: 'Circle / Curve',
    principle: 'unity · cycle · the cosmos · the eternal · the Self',
    evidence: 'Jung (1959): The circle (mandala) is the primary symbol of wholeness across cultures. Egyptian solar disk 𓇳 represents Ra. The zero ○ was independently invented in India, Maya, and Babylon. The ouroboros (serpent eating tail) predates writing in Egypt.',
    examples: ['○ ◯ ⭕', '𓇳 (sun disk)', 'Ouroboros', 'Enso (Zen brush circle)'],
  },
  {
    id: 'cross',
    shape: '✚',
    name: 'Cross',
    principle: 'meeting · the four directions · balance · integration of opposites',
    evidence: 'The cross predates Christianity by millennia: Egyptian ankh 𓋹 (life), Medicine Wheel (Lakota), Swastika (Sanskrit svastika = well-being), Greek cross as cosmogram. All represent the meeting of vertical (spirit) and horizontal (earth).',
    examples: ['✚ ✝ ⊕ 𓋹', 'Ankh 𓋹', 'Medicine Wheel', 'Buddhist dharma wheel'],
  },
  {
    id: 'triangle-up',
    shape: '▲',
    name: 'Upward Triangle',
    principle: 'fire · aspiration · masculine principle · sky · expansion',
    evidence: 'Alchemical symbol for Fire is ▲ (documented in Aristotle\'s Meteorologica, confirmed in Paracelsus). The Great Pyramid\'s triangular face was oriented to Orion\'s Belt (solar aspirations). Pythagorean fire = triangle (Timaeus).',
    examples: ['▲ △', 'Alchemical Fire 🔺', 'Om triangle', 'Sri Yantra upward triangles'],
  },
  {
    id: 'triangle-down',
    shape: '▽',
    name: 'Downward Triangle',
    principle: 'water · receptivity · feminine principle · earth · containment',
    evidence: 'Alchemical symbol for Water is ▽ (Paracelsus). Tantric yoni yantra uses downward triangle for the feminine creative principle. The Star of David ✡ combines ▲ + ▽ (fire + water, masculine + feminine).',
    examples: ['▽ ▼', 'Alchemical Water 🔻', 'Yoni yantra', 'Kabbalistic gevurah'],
  },
  {
    id: 'spiral',
    shape: '🌀',
    name: 'Spiral',
    principle: 'time · evolution · the cosmos in motion · growth inward and outward',
    evidence: 'Spirals appear in: Celtic La Tène art (Newgrange, 3200 BCE — pre-written language), Egyptian 𓇽 (plant unfolding), Fibonacci nautilus shells in nature, DNA double helix, galaxy arms. Campbell (1988): \'The spiral is the dance of creation.\'',
    examples: ['🌀 ⊛ ꩜', 'Celtic triple spiral', 'Fibonacci shell', 'Galaxy arms'],
  },
  {
    id: 'dot',
    shape: '·',
    name: 'Dot · Point',
    principle: 'origin · seed · the unmanifest · consciousness observing itself',
    evidence: 'The bindu (Sanskrit: dot) is the point from which all creation expands in tantric cosmology (Shiva Sutras, 9th century CE). In sacred geometry, all shapes begin from the point (Euclid Elements, Proposition I.1). Egyptian 𓐍 (punctum) marks divine presence.',
    examples: ['· ⋅ ∙ •', 'Hindu bindu', 'Decimal point', 'Braille cell origin'],
  },
];

// ─── Sigil database ───────────────────────────────────────────────────
// Each sigil includes: symbol, tradition, pattern composition,
// decoded meaning, and cross-cultural parallels.
export const SIGIL_DATABASE = [
  // ── Alchemical symbols ──────────────────────────────────────────────
  {
    id: 'fire',
    symbol: '🔺', unicode: '△', tradition: 'Alchemical (European, c. 1300–1700)',
    patterns: ['triangle-up'],
    meaning: 'fire · will · transformation · upward aspiration',
    crossCultural: 'Sanskrit Agni (fire deity uses upward triangle). Aztec Xiuhcoatl fire-serpent\'s head is triangular. Egyptian 𓇯 (flame) uses upward-pointing form.',
    inGame: 'Appears at archetype and transformation tiles.',
  },
  {
    id: 'water',
    symbol: '🔻', unicode: '▽', tradition: 'Alchemical (European)',
    patterns: ['triangle-down'],
    meaning: 'water · intuition · receptivity · the unconscious',
    crossCultural: 'Taoist yin (water, valley, receptive). Egyptian hieroglyph for \'flood\' is wavy horizontal. Hebrew mem (מ) = water, drawn as a wave.',
    inGame: 'Appears at emotional healing and insight tiles.',
  },
  {
    id: 'earth',
    symbol: '⊕', unicode: '⊕', tradition: 'Alchemical / Astronomical',
    patterns: ['cross', 'circle'],
    meaning: 'earth · grounding · the meeting of all directions · the physical realm',
    crossCultural: 'The circle-cross (⊕) is the astronomical Earth symbol. Native American medicine wheels use this form. Aztec calendar stone is a circle-cross cosmogram.',
    inGame: 'Appears at VOID tiles (the ground beneath).',
  },
  {
    id: 'sun',
    symbol: '☉', unicode: '☉', tradition: 'Alchemical / Astronomical',
    patterns: ['circle', 'dot'],
    meaning: 'gold · consciousness · the Self · illumination · the centre',
    crossCultural: 'Egyptian Ra-disk (𓇳) is dot-in-circle. Hindu Aum diagram places bindu in the circle. Aztec sun stone has a face at the centre-point.',
    inGame: 'Appears at PEACE and ARCHETYPE tiles (awakened consciousness).',
  },
  {
    id: 'moon',
    symbol: '☽', unicode: '☽', tradition: 'Alchemical / Astronomical',
    patterns: ['circle'],
    meaning: 'silver · reflection · cycles · the unconscious · the feminine',
    crossCultural: 'Islamic crescent ☽. Egyptian Khonsu (moon god) uses crescent headdress. Maya Ix Chel (moon goddess) is depicted with crescent. The crescent is derived from a partially-obscured circle.',
    inGame: 'Appears at MEMORY and GLITCH tiles (reflective and liminal states).',
  },
  {
    id: 'mercury',
    symbol: '☿', unicode: '☿', tradition: 'Alchemical / Astronomical',
    patterns: ['circle', 'cross', 'triangle-up'],
    meaning: 'communication · mind · quicksilver · the messenger between worlds',
    crossCultural: 'Mercury = Hermes (Greek) = Thoth (Egyptian 𓅭𓏏𓀭) = the divine communicator across Greco-Roman-Egyptian traditions. All are depicted with winged feet or staff (vertical line of mediation).',
    inGame: 'Appears at TELEPORT tiles (communication across space).',
  },
  // ── Norse Runes (Elder Futhark, c. 200–800 CE) ─────────────────────
  {
    id: 'fehu',
    symbol: 'ᚠ', unicode: 'ᚠ', tradition: 'Elder Futhark Runes (Germanic)',
    patterns: ['vertical', 'diagonal-rise'],
    meaning: 'cattle · wealth · abundance · energy in motion',
    crossCultural: 'The ox/bull as wealth is universal: Egyptian 𓃑 (bull), Phoenician aleph (ox head = wealth and leadership), Hebrew aleph (א) retains this root. All encode \'vital force\' through the upward-angled strokes from a vertical base.',
    inGame: 'Appears at PEACE tiles (collecting peace as abundance).',
  },
  {
    id: 'uruz',
    symbol: 'ᚢ', unicode: 'ᚢ', tradition: 'Elder Futhark Runes',
    patterns: ['vertical', 'diagonal-fall', 'horizontal'],
    meaning: 'aurochs · primal strength · raw power · breakthrough',
    crossCultural: 'The aurochs (wild ox) was the apex strength-symbol of early Germanic peoples. The arch shape (curve from high to low) recurs in Sanskrit \'u\' (energy seed syllable). Arabic waw (و) shares the curved-from-vertical form.',
    inGame: 'Appears when player first survives a hazard tile.',
  },
  {
    id: 'ansuz',
    symbol: 'ᚨ', unicode: 'ᚨ', tradition: 'Elder Futhark Runes',
    patterns: ['vertical', 'diagonal-rise', 'diagonal-fall'],
    meaning: 'god · divine breath · wisdom · the spoken word',
    crossCultural: 'Ansuz = Odin (Norse). Egyptian Hu (𓌀𓅱) = divine utterance. Sanskrit Vāc = the sacred word. Hebrew aleph (א) = divine breath. All encode \'word\' or \'divine communication\' through forked-from-vertical patterns.',
    inGame: 'Appears when the vocabulary word is a wisdom-type word.',
  },
  {
    id: 'algiz',
    symbol: 'ᛉ', unicode: 'ᛉ', tradition: 'Elder Futhark Runes',
    patterns: ['vertical', 'diagonal-rise'],
    meaning: 'protection · elk · guardian · the outstretched hands reaching upward',
    crossCultural: 'The \'Y-on-vertical\' form appears in the Egyptian ḏꜣ (protect) sign. In Christianity it became the pax crux (peace cross ☮). The upward fork = opening oneself to divine protection.',
    inGame: 'Appears at COVER tiles (protective shield).',
  },
  // ── Sacred geometry ─────────────────────────────────────────────────
  {
    id: 'ankh',
    symbol: '𓋹', unicode: '𓋹', tradition: 'Ancient Egyptian (from Old Kingdom, c. 3100 BCE)',
    patterns: ['cross', 'circle'],
    meaning: 'life · the merging of spirit (loop) and matter (cross)',
    crossCultural: 'The ankh is the cross (earth/four directions) surmounted by a circle/loop (spirit/eternity). This exact combination recurs in the Coptic cross, the Celtic cross (⊗), and the Taoist cosmic diagram. The loop represents eternal life; the T-bar represents the earthly plane.',
    inGame: 'Core sigil of the GLITCH·PEACE healing system.',
  },
  {
    id: 'maát',
    symbol: '𓌀𓈖𓏏', unicode: '𓌀', tradition: 'Ancient Egyptian',
    patterns: ['horizontal', 'triangle-up', 'vertical'],
    meaning: 'truth · cosmic order · justice · the feather (light as a feather = truthful life)',
    crossCultural: 'The heart of the deceased was weighed against Maꜥat\'s feather in the Hall of Two Truths. The feather sigil = lightness = truth across Tibetan Bardo teachings (light = liberation), Japanese Zen brushwork (lightness of stroke = truth of mind).',
    inGame: 'Appears at INSIGHT tiles (truth-seeking).',
  },
  {
    id: 'kheper',
    symbol: '𓆣', unicode: '𓆣', tradition: 'Ancient Egyptian (Scarab)',
    patterns: ['circle', 'spiral'],
    meaning: 'transformation · becoming · the ever-rolling sun · emergence',
    crossCultural: 'The scarab beetle rolls dung into a sphere and was seen as the sun being rolled across the sky. The verb ḫpr means \'to become\', \'to transform\'. This rolling-circle motif = cyclical transformation. Tibetan prayer wheels encode the same concept. DNA helicase \'rolls\' the genetic code.',
    inGame: 'Appears on ARCHETYPE tiles and GLITCH tiles (transformation events).',
  },
  // ── Geometric sigils ────────────────────────────────────────────────
  {
    id: 'vesica_piscis',
    symbol: '◈', unicode: '◈', tradition: 'Sacred Geometry (universal)',
    patterns: ['circle', 'cross'],
    meaning: 'the intersection of two worlds · the birth canal · the eye of creation',
    crossCultural: 'The vesica piscis (two overlapping circles) is found in: Euclidean geometry (the first construction), Gothic cathedral windows, the yin-yang ☯ (two fish), Hindu Shri Chakra, and the Christian ichthys fish. The ◈ shape is the diamond formed at their intersection.',
    inGame: 'PEACE tile symbol (◈) — the precious node of harmony.',
  },
  {
    id: 'sri_yantra',
    symbol: '🔯', unicode: '✡', tradition: 'Hindu Tantra / Kabbalah (independent origin)',
    patterns: ['triangle-up', 'triangle-down', 'circle'],
    meaning: 'the integration of all opposites · creation through polarity · cosmic totality',
    crossCultural: 'The Sri Yantra (India, ~7th century CE) uses nine interlocking triangles (5 downward ▽ + 4 upward ▲). The Star of David (Kabbalistic, ✡) uses the same ▲+▽ integration. These were independently derived from the same geometric necessity: two triangles ▲▽ describe all polarity.',
    inGame: 'Appears at matrix switch moments (Matrix A + Matrix B = integration).',
  },
];

// ─── Vocabulary tier for sigils (which sigils are shown when) ─────────
export const SIGIL_TIERS = {
  simple:   ['ankh', 'fire', 'water', 'sun', 'moon'],
  common:   ['ankh', 'fire', 'water', 'earth', 'sun', 'moon', 'mercury', 'fehu', 'maát'],
  rich:     SIGIL_DATABASE.map(s => s.id).slice(0, 12),
  advanced: SIGIL_DATABASE.map(s => s.id),
};

// ─── SigilSystem class ────────────────────────────────────────────────
class SigilSystem {
  constructor() {
    this._seen   = new Set();
    this._active = null;  // currently displayed sigil
    this._alpha  = 0;
    this._timer  = 0;
    this._FADE_IN  = 30;
    this._HOLD     = 80;
    this._FADE_OUT = 30;
    this._load();
  }

  get activeSigil() { return this._active; }
  get displayAlpha() { return this._alpha; }
  get totalSeen()   { return this._seen.size; }

  /** Call when player lands on insight/archetype/peace tile */
  onSpecialTile(tileType, vocabTier = 'advanced') {
    const pool = SIGIL_TIERS[vocabTier] || SIGIL_TIERS.advanced;
    const available = pool.filter(id => {
      const s = SIGIL_DATABASE.find(x => x.id === id);
      return s && this._isTileRelevant(s, tileType);
    });
    if (!available.length) return null;
    // Prefer unseen sigils
    const unseen = available.filter(id => !this._seen.has(id));
    const id = unseen.length ? unseen[Math.floor(Math.random() * unseen.length)]
                              : available[Math.floor(Math.random() * available.length)];
    return this._show(id);
  }

  /** Returns the current pattern rules for the active sigil */
  getPatternRules() {
    if (!this._active) return [];
    const sigil = SIGIL_DATABASE.find(s => s.id === this._active.id);
    if (!sigil) return [];
    return sigil.patterns.map(pid => PATTERN_RULES.find(r => r.id === pid)).filter(Boolean);
  }

  /** Advance the display animation each frame */
  tick() {
    if (this._timer <= 0) { this._alpha = 0; this._active = null; return; }
    this._timer--;
    const total = this._FADE_IN + this._HOLD + this._FADE_OUT;
    const elapsed = total - this._timer;
    if (elapsed < this._FADE_IN) {
      this._alpha = elapsed / this._FADE_IN;
    } else if (elapsed < this._FADE_IN + this._HOLD) {
      this._alpha = 1;
    } else {
      this._alpha = 1 - (elapsed - this._FADE_IN - this._HOLD) / this._FADE_OUT;
    }
  }

  // ── Internal ────────────────────────────────────────────────────────

  _isTileRelevant(sigil, tileType) {
    // INSIGHT (6), ARCHETYPE (11) → wisdom sigils
    if (tileType === 6 || tileType === 11) return true;
    // PEACE (4) → peace/unity sigils
    if (tileType === 4) return ['sun', 'ankh', 'vesica_piscis', 'fehu'].includes(sigil.id);
    // MEMORY (15) → reflective sigils
    if (tileType === 15) return ['moon', 'algiz', 'maát'].includes(sigil.id);
    // GLITCH (10) → transformation sigils
    if (tileType === 10) return ['kheper', 'mercury', 'uruz'].includes(sigil.id);
    return true;
  }

  _show(id) {
    const sigil = SIGIL_DATABASE.find(s => s.id === id);
    if (!sigil) return null;
    this._seen.add(id);
    this._active = sigil;
    this._timer  = this._FADE_IN + this._HOLD + this._FADE_OUT;
    this._save();
    return sigil;
  }

  _save() {
    try { localStorage.setItem('gp_sigils_seen', JSON.stringify([...this._seen])); } catch {}
  }

  _load() {
    try {
      const d = JSON.parse(localStorage.getItem('gp_sigils_seen') || 'null');
      if (Array.isArray(d)) this._seen = new Set(d);
    } catch {}
  }
}

export const sigilSystem = new SigilSystem();
