// ═══════════════════════════════════════════════════════════════════════
//  Tutorial Content v2 — first-timer friendly, covers all current systems
//  Updated to reflect: archetypes, matrix A/B, glitch pulse, shop, Z-undo,
//  dreamscapes, play modes, cosmologies, language challenges, sigils, and
//  the full age-accessible difficulty range.
// ═══════════════════════════════════════════════════════════════════════

export const TUTORIAL_PAGES = [
  {
    title: "Welcome to GLITCH·PEACE",
    body: [
      "GLITCH·PEACE is a pattern-recognition game for your mind.",
      "It's also a tool for recovery, learning, and awakening consciousness.",
      "You move a piece (◈) across a grid collecting peace nodes.",
      "Everything is forgiving — there's no wrong way to play.",
      "Press H anytime during play to return here."
    ]
  },
  {
    title: "Your First Steps — Movement",
    body: [
      "Use WASD or Arrow Keys to move one tile at a time.",
      "Your piece is the cyan ◈ symbol — it never changes.",
      "Your goal: collect all the green ● Peace tiles on the grid.",
      "When all peace tiles are collected, you advance to the next level.",
      "Press ESC to pause at any time. Your progress is saved."
    ]
  },
  {
    title: "The Grid — What Each Tile Does",
    body: [
      "■ VOID (dark): Empty space — safe to walk on.",
      "▓ WALL: Solid — you can't pass through.",
      "● PEACE (green): Heals you +10 HP, builds your score.",
      "✦ INSIGHT (gold): Triggers a learning challenge (+insight token).",
      "▲ HAZARD tiles (red/orange): Deal damage when stepped on.",
      "◉ GLITCH (purple): Teleports you to a random tile — use carefully!",
      "⊕ POWER-UP (blue): Collect for temporary abilities (SHIELD / SPEED / etc.).",
      "◎ COVER (teal): Triggers a grounding body-scan prompt.",
      "✧ HIDDEN: Revealed by archetypes or memory tiles."
    ]
  },
  {
    title: "Your Health, Score & Combo",
    body: [
      "Your HP bar is at the top left. Collect PEACE tiles to heal.",
      "Stepping on hazard tiles (RAGE, DESPAIR, etc.) reduces your HP.",
      "If HP reaches zero, you get one rescue (+15 HP) before game over.",
      "Build a COMBO by collecting peace tiles in a row — up to 4× bonus!",
      "Your combo resets after 3 seconds without collecting anything.",
      "Score = base points × combo multiplier × play mode modifier."
    ]
  },
  {
    title: "Special Controls — Archetype (J)",
    body: [
      "Press J to activate your Archetype power (12-second cooldown).",
      "Your archetype is determined by the Dreamscape you chose:",
      "  Dragon (Rift)  → Wall Jump: leap 2 tiles in any direction",
      "  Child (Lodge)  → Reveal: flash all hidden tiles for 3s",
      "  Orb (Wheel)    → Phase Walk: pass through walls for 10 moves",
      "  Captor (Duat)  → Rewind: undo your last 3 positions",
      "  Protector (Tower) → Shield Burst: absorb hits + stun enemies",
      "A cooldown bar shows when your power is ready again."
    ]
  },
  {
    title: "Special Controls — Matrix & Glitch Pulse",
    body: [
      "SHIFT — Toggle Matrix A (Erasure) ↔ Matrix B (Coherence):",
      "  Matrix B (green): energy recharges, calmer enemies.",
      "  Matrix A (red): energy drains, enemies 35% faster — high risk/reward.",
      "",
      "R — Fire Glitch Pulse (charges from ◈ peace collection):",
      "  Each peace node gives +15% charge. At 100%: fire!",
      "  Clears all hazard tiles in radius 3.",
      "  Stuns all enemies in radius 4 for 1.8 seconds.",
      "  Charge bar shown bottom-right."
    ]
  },
  {
    title: "Special Controls — Shop & Undo",
    body: [
      "U — Open Upgrade Shop (when you have ☆ insight tokens):",
      "  Spend tokens on permanent run upgrades:",
      "  HP Boost · Speed Boost · Vision Extend · Insight Lens",
      "  Score Lens · Rewind Charges · Phase Walk · Lucid Anchor",
      "  The shop also auto-opens every 5 levels as a reward.",
      "",
      "Z — Undo last move (in Puzzle mode only).",
      "H — Open this help screen from anywhere during play.",
      "M — Switch between Grid mode and Shooter mode.",
      "ESC — Pause / save game."
    ]
  },
  {
    title: "Dreamscapes — Choosing Your World",
    body: [
      "Each Dreamscape gives the grid a different look and tile distribution.",
      "  The Rift: chaotic, more hazards, high risk/reward",
      "  The Lodge: structured, more peace, safer",
      "  The Wheel: balanced insight and hazards",
      "  The Duat: hidden tiles, shadow self enemies, mystery",
      "  The Tower: walls, architecture, protection theme",
      "  The Wilderness: nature healing, more peace and memory tiles",
      "  The Abyss: cosmic void, more glitch and despair",
      "  The Crystal: geometric, many insight/arch tiles, high clarity"
    ]
  },
  {
    title: "Play Modes — 13 Ways to Play",
    body: [
      "Classic (ARCADE): Standard balanced gameplay.",
      "Zen Garden: No enemies, auto-heal, tiles respawn — pure exploration.",
      "Speedrun: 3-minute timer, faster movement, double score.",
      "Puzzle: 50-move limit, no enemies, Z to undo — think first.",
      "Survival Horror: Fog of war, permadeath risk, tension-focused.",
      "Roguelike: Scaling difficulty, no safety nets.",
      "Campaign: 30 levels in 3 narrative acts (Awakening · Descent · Integration).",
      "Pacifist: Enemies don't hurt you — stealth score for close passes.",
      "Ritual: Slower, breathing pauses between levels, ceremonial pacing.",
      "Reverse: PEACE deals damage, hazards heal — inverted logic.",
      "Daily Challenge: Same grid for all players each day (seeded).",
      "Boss Rush: Boss every level — for those who want intense encounters.",
      "Pattern Training: 45-minute therapeutic mode with reality checks."
    ]
  },
  {
    title: "Your Emotional State",
    body: [
      "The game tracks 10 emotions: joy, hope, fear, grief, anger, and more.",
      "Walking on colored tiles feeds your emotional field automatically.",
      "High coherence = clear mind = easier navigation.",
      "High distortion = purple/red screen overlay — emotional turbulence.",
      "Emotional synergies trigger score multipliers (e.g. joy + hope = 2×).",
      "The HUD shows: dominant emotion, coherence %, and distortion level.",
      "Emotions gradually fade over time — they don't trap you forever.",
      "This mirrors real emotional regulation: notice, don't suppress."
    ]
  },
  {
    title: "Learning Challenges",
    body: [
      "Step on ✦ INSIGHT tiles to trigger a timed quiz.",
      "Challenge types rotate: Vocabulary · Math · Memory · Sigil · Language.",
      "Language challenges use your chosen target language.",
      "  (Set your native and target language in Settings or Onboarding.)",
      "Correct answer: +250 pts, combo ++, +lucidity.",
      "Wrong answer: no penalty — learning is safe here.",
      "Sigil challenges teach universal pattern grammar across traditions:",
      "  Runes · Alchemical · Egyptian hieroglyphs · Planetary symbols."
    ]
  },
  {
    title: "Lucidity & Dream Yoga",
    body: [
      "A lucidity meter (0–100%) appears in the top-right corner.",
      "It rises from correct answers, reality checks, and insight collection.",
      "It falls from enemy hits and boss encounters.",
      "At 50%: 'HALF-LUCID' event. At 100%: 'FULLY LUCID' (+500 pts).",
      "◎ COVER tiles trigger a body-scan grounding prompt (+4 lucidity).",
      "The game asks 'Am I dreaming?' periodically in Pattern Training mode.",
      "Dream signs you encounter are saved across sessions (localStorage).",
      "Pausing for 60 seconds rewards +2 insights and +10 lucidity."
    ]
  },
  {
    title: "Enemies & Recovery Tools",
    body: [
      "Enemies appear based on difficulty. They can't hurt you in Zen/Puzzle.",
      "Enemy types: chase · wander · patrol · orbit · adaptive · predictive · rush.",
      "Bosses (◆) appear every 5th level — they have HP bars and deal 25 dmg.",
      "",
      "Recovery tools help you play mindfully:",
      "  Hazard Delay: 1-second pause before stepping on a dangerous tile.",
      "  Path Preview: shows what's 3 steps ahead in your current direction.",
      "  Pattern Echo: faint trail of your last 14 positions.",
      "  Session Reminders: gentle wellness checks at 20/45/90 minutes.",
      "Toggle these in Options → Recovery Tools."
    ]
  },
  {
    title: "Begin in Stillness",
    body: [
      "You don't need to understand everything to start. Just move.",
      "The grid will teach you through experience.",
      "Every action is feedback, not failure.",
      "Press ESC to pause, save, and explore options anytime.",
      "Press H to return to this tutorial from any gameplay screen.",
      "",
      "Begin in stillness. Emerge through pattern recognition.",
      "The path is the practice."
    ]
  }
];
