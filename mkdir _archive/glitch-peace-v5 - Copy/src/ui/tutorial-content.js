// src/ui/tutorial-content.js
// ═══════════════════════════════════════════════════════════════════════
//  Tutorial Content v1 — concise, thorough, a little mystery
//  (Sterilized + universal + game-first)
// ═══════════════════════════════════════════════════════════════════════

export const TUTORIAL_PAGES = [
  {
    title: "How to Play",
    body: [
      "Move: WASD / Arrow keys.",
      "Goal: collect all ◈ PEACE nodes to clear the level.",
      "Hazards reduce HP. Walls block movement.",
      "Esc opens Pause (Save / Quit).",
      "",
      "Tip: small stable actions beat frantic ones.",
    ],
  },
  {
    title: "Tile Legend (Universal)",
    body: [
      "VOID: empty / neutral.",
      "WALL: boundary / obstacle.",
      "◈ PEACE: heal + points. clears when collected.",
      "◆ INSIGHT: points + token (future upgrades).",
      "Hazards (various): damage + distortion pressure.",
      "",
      "The grid is a matrix—fictional UI with symbolic flavor.",
    ],
  },
  {
    title: "Colors (Read Me Once)",
    body: [
      "Player color is LOCKED: cyan/white (identity never shifts).",
      "Green/teal cues: healing, clarity, safe progress.",
      "Cyan cues: insight, learning, signal alignment.",
      "Red cues: danger, overload, impact.",
      "Purple/blue cues: heaviness, fog, drag (not evil—just weight).",
      "",
      "High Contrast mode simplifies all of this if needed.",
    ],
  },
  {
    title: "Difficulty + Comfort",
    body: [
      "Options → GRID SIZE changes scale (small is faster, large is calmer).",
      "Options → DIFFICULTY changes damage scaling.",
      "Options → PARTICLES off = less stimulation.",
      "Options → INTENSITY down = less flash/shake impact.",
      "",
      "If anything feels too loud: lower intensity first.",
    ],
  },
  {
    title: "Dreamscapes (Teaser Map)",
    body: [
      "Future builds add themed realms (dreamscapes):",
      "",
      "Maze: surveillance corridors → pattern mastery.",
      "Bog: soft fog → regulation + slow clarity.",
      "Leaping Field: pursuit energy → timing + commitment.",
      "Lake/Lodge: refuge zone → restore and re-route.",
      "Summit: altitude logic → precision + unlocks.",
      "",
      "Same win condition. Different rulesets.",
    ],
  },
  {
    title: "Archetypes (Sterilized)",
    body: [
      "Archetypes are gameplay masks, not beliefs:",
      "",
      "Cartographer: reveals map fragments.",
      "Gatekeeper: reduces hazard spread.",
      "Lantern: increases visibility / clarity.",
      "Weaver: converts chaos into points slowly.",
      "Hearthkeeper: adds safe rest nodes.",
      "",
      "You choose them like classes—optional and reversible.",
    ],
  },
  {
    title: "Sacred Geometry (Harmless)",
    body: [
      "Geometry is used as icon-memory (not ritual):",
      "",
      "Triangle = choice / direction.",
      "Square = boundary / stability.",
      "Circle = continuity / breath loop.",
      "Spiral = progress over time.",
      "Vesica = overlap / integration.",
      "",
      "These can be purely aesthetic OR have small buffs later.",
    ],
  },
  {
    title: "Mythic Lore (Fully Fictional)",
    body: [
      "World-lore is a sterilized mix: no dogma, no claims.",
      "",
      "Hermetic principles become UI rules:",
      "• Rhythm = cycles (week + lunar vibe).",
      "• Polarity = risk vs reward choices.",
      "• Correspondence = patterns repeat across scales.",
      "• Cause/Effect = habits shape outcomes.",
      "",
      "Everything stays game-first, fun-first.",
    ],
  },
  {
    title: "Learning Layer (Invisible)",
    body: [
      "Later: optional micro-learning that feels like loot, not homework.",
      "",
      "You can collect “glyphs” that quietly teach:",
      "• languages (tiny word pairs)",
      "• physics (one intuition at a time)",
      "• math/logic (pattern puzzles)",
      "• psych/soc (choice outcomes)",
      "",
      "Always optional. Always low-stimulation.",
    ],
  },
  {
    title: "Mystery (Intentional)",
    body: [
      "Some systems stay hidden until you bump into them:",
      "",
      "• drifting biomes",
      "• rare symbols",
      "• quiet story fragments",
      "• special tiles that only appear under certain rhythms",
      "",
      "You don’t need to know everything to win.",
      "",
      "ENTER: return to title",
    ],
  },
];