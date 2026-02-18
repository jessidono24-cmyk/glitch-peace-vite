// ═══════════════════════════════════════════════════════════════════════
//  Tutorial Content v1 — concise, thorough, a little mystery
//  Ported from: _archive/glitch-peace-v5/src/ui/tutorial-content.js
// ═══════════════════════════════════════════════════════════════════════

export const TUTORIAL_PAGES = [
  {
    title: "Welcome to GLITCH·PEACE",
    body: [
      "This is a consciousness simulation and pattern recognition game.",
      "Move across a grid, collect peace, avoid hazards, and manage your emotions.",
      "Every action shapes your mind and the world around you.",
      "New: Power-ups, combos, undo, Fibonacci scaling, and a dynamic HUD!"
    ]
  },
  {
    title: "Movement & Controls",
    body: [
      "Use WASD or Arrow Keys to move one tile at a time.",
      "Press ESC to pause and access options.",
      "Navigate the grid safely and thoughtfully."
    ]
  },
  {
    title: "The Grid: Tiles & Power-Ups",
    body: [
      "Black tiles (VOID): Safe, empty space.",
      "Gray tiles (WALL): Solid barriers, can't pass through.",
      "Green tiles (PEACE ●): Heal you and increase score.",
      "Red tiles (DESPAIR •, RAGE !, PAIN •): Damage you emotionally.",
      "Blue tiles (TERROR ↓, TELEPORT ↓): Special movement effects.",
      "Purple tiles (GLITCH ?): Random teleport.",
      "Gold/Blue icons: POWER-UPS! Collect for temporary abilities:",
      "  🛡 SHIELD: Absorb damage.",
      "  ⚡ SPEED: Move faster.",
      "  ❄ FREEZE: Stun enemies.",
      "  💚 REGEN: Heal over time.",
      "Other special tiles: INSIGHT, MEMORY, COVER, HIDDEN."
    ]
  },
  {
    title: "Your Emotional State & HUD",
    body: [
      "The game tracks 10 emotions: joy, fear, anger, hope, and more.",
      "Stepping on colored tiles affects your emotional field.",
      "HUD (top of screen) shows: health, level, score, objective, power-ups, combo, and emotions.",
      "Dominant emotion, coherence %, and distortion are always visible.",
      "High coherence = focused mind. Low distortion = clear thinking.",
      "Emotions interact and create synergies."
    ]
  },
    {
      title: "Combo System & Scoring",
      body: [
        "Perform consecutive successful actions (collecting peace, power-ups, etc.) to build your combo.",
        "Higher combos grant bonus score.",
        "Combo resets if you wait too long or take damage.",
        "Watch the HUD for your current combo multiplier!"
      ]
    },
    {
      title: "Undo System",
      body: [
        "Press Z to undo your last move.",
        "You can undo up to 50 moves back.",
        "Use undo to recover from mistakes or experiment with new strategies."
      ]
    },
    {
      title: "Fibonacci Scaling: Peace Nodes",
      body: [
        "The number of PEACE tiles per level now follows the Fibonacci sequence.",
        "Higher levels = more peace, but also more hazards.",
        "This creates a natural, non-linear difficulty curve."
      ]
    },
  {
    title: "Time-Based Modifiers",
    body: [
      "The game responds to real-world time: day/night, lunar phase, day of week.",
      "Different times give different bonuses and penalties.",
      "Set your timezone in the Options menu.",
      "Temporal hints are shown in the HUD."
    ]
  },
  {
    title: "Choosing Your Dreamscape",
    body: [
      "The Rift: Chaotic, more hazards, high risk/reward.",
      "The Lodge: Structured, safer, more peace tiles.",
      "Each dreamscape has unique visuals and tile distribution.",
      "Select your dreamscape at the start of each run."
    ]
  },
  {
    title: "Survival & Mastery",
    body: [
      "Collect PEACE tiles to heal.",
      "Avoid clusters of damage tiles.",
      "Use TELEPORT tiles strategically.",
      "Watch your emotional coherence.",
      "High distortion makes navigation harder.",
      "Balance exploration and safety."
    ]
  },
  {
    title: "Customize Your Experience",
    body: [
      "Particles: Toggle visual effects on or off.",
      "High Contrast: Easier-to-see colors.",
      "Reduced Motion: Gentler animations.",
      "Audio: Toggle sound effects.",
      "Difficulty: Adjust enemy count and damage.",
      "Grid Size: Choose small, medium, or large playfields."
    ]
  },
  {
    title: "Begin in Stillness",
    body: [
      "This is the BASE LAYER. More features are coming soon.",
      "Start simple, learn the patterns.",
      "Use power-ups, combos, and undo to master the grid.",
      "Begin in stillness. Emerge through pattern recognition."
    ]
  }
];
