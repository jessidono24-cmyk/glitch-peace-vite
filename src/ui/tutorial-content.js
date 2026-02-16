// ═══════════════════════════════════════════════════════════════════════
//  Tutorial Content v1 — concise, thorough, a little mystery
//  Ported from: _archive/glitch-peace-v5/src/ui/tutorial-content.js
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
      "Dreamscapes are themed realms with different rules:",
      "",
      "The Rift: fractured space, logic bends.",
      "The Lodge: refuge, time moves gently.",
      "",
      "More dreamscapes unlock later.",
      "Same win condition. Different feels.",
    ],
  },
];
