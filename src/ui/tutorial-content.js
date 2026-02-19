// ═══════════════════════════════════════════════════════════════════════
//  Tutorial Content v5 — first-timer friendly, covers all current systems
//  Updated to reflect: archetypes, matrix A/B, glitch pulse, shop, Z-undo,
//  dreamscapes, play modes, cosmologies, language challenges, sigils,
//  Ornithology, Mycology, Architecture, Constellation, Alchemy, Rhythm modes,
//  RPG Adventure (Phase M5 active), Stats Dashboard (D key), gamepad.
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
    title: "Special Controls — Shop, Undo & Dashboard",
    body: [
      "U — Open Upgrade Shop (when you have ☆ insight tokens):",
      "  Spend tokens on permanent run upgrades:",
      "  HP Boost · Speed Boost · Vision Extend · Insight Lens",
      "  Score Lens · Rewind Charges · Phase Walk · Lucid Anchor",
      "  The shop also auto-opens every 5 levels as a reward.",
      "",
      "D — Toggle live Stats Dashboard overlay:",
      "  Shows: session time, emotional field bars, lucidity meter,",
      "  language learning progress, current mode/dreamscape info.",
      "  Press D or ESC to close.",
      "",
      "Z — Undo last move (in Puzzle mode only).",
      "H — Open this help screen from anywhere during play.",
      "M — Cycle through all 9 game modes.",
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
      "  The Crystal: geometric, many insight/arch tiles, high clarity",
      "  Childhood Neighborhood: memory-rich, nostalgic, fewer hazards, more cover",
      "  Aztec Chase Labyrinth: dense walls, ancient traps, a labyrinth to navigate",
      "  Orb Escape Event: portal-heavy, phase-shifting, teleport and glitch dominate"
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
  },
  {
    title: "🐦 Ornithology Mode",
    body: [
      "Press M to switch to Ornithology Mode from the grid.",
      "Move through biome tiles (forest, wetland, urban, tundra, ocean) to observe birds.",
      "Each ✦ glowing icon is a bird sighting — walk over it to observe.",
      "Rare birds (★★★ or more) trigger a species ID challenge.",
      "Answer 1-2-3-4 to choose the correct species within 12 seconds.",
      "Build your Field Notebook: track how many species you've observed.",
      "Rarer birds award more points and knowledge.",
      "",
      "Grounded in attention restoration theory: nature observation restores directed attention and reduces cognitive fatigue."
    ]
  },
  {
    title: "🍄 Mycology Mode",
    body: [
      "Press M to switch to Mycology Mode.",
      "Move through forest substrates (oak, pine, deadwood, meadow) to forage mushrooms.",
      "🍄 Green glow = edible · Red glow when near = TOXIC — step carefully!",
      "Walking onto a toxic mushroom deals damage and triggers a mandatory ID challenge.",
      "Answer 1-2-3-4 to identify the toxic species. Knowledge protects you next time.",
      "Step on 🕸 Mycelium Network nodes to reveal underground connections between species.",
      "Build your species log: safe foraged, toxic encountered, species identified.",
      "",
      "Inspired by Suzanne Simard's 'wood wide web' research (1997):",
      "underground fungal networks support and communicate between trees."
    ]
  },
  {
    title: "🏛 Architecture Mode",
    body: [
      "Press M to switch to Architecture Mode.",
      "Navigate the construction grid and place tiles to match a Blueprint.",
      "Controls: WASD = move · SPACE = place selected tile · Q/E = cycle tile · X = erase",
      "Current tile shown in the selector bar at the bottom.",
      "The ghost overlay shows what the blueprint needs at each position.",
      "Complete the full blueprint for a large bonus!",
      "Blueprints include: Meditation Hall · Garden Court · Watchtower · Sanctuary",
      "Each completed blueprint advances to the next design challenge.",
      "",
      "Grounded in embodied cognition: spatial construction strengthens",
      "abstract pattern thinking through physical-metaphor reasoning."
    ]
  },
  {
    title: "✦ Constellation Mode",
    body: [
      "Press M to switch to Constellation Mode.",
      "Navigate the dark star field to find and activate ✦ star tiles.",
      "Activate stars in sequence (numbered 1, 2, 3...) to trace the constellation.",
      "Each activated star draws a glowing line connecting to the previous.",
      "Complete all stars to unlock the constellation's mythological lore.",
      "Press any key or move after the lore to advance to the next constellation.",
      "Constellations: Orion · The Pleiades · Ursa Major · Cassiopeia · Scorpius · Andromeda",
      "",
      "Night-sky gazing as restorative practice (Kaplan 1989).",
      "Cross-cultural mythologies as shared archetypes (Jung 1968)."
    ]
  },
  {
    title: "⚗ Alchemy Mode — The Great Work",
    body: [
      "Press M to switch to Alchemy Mode.",
      "You are in a Hermetic laboratory. Four elemental tiles are scattered across the floor:",
      "  🜂 Fire (Sulfur / Will)  ·  🜄 Water (Mercury / Mind)",
      "  🜃 Earth (Salt / Body)   ·  🜁 Air (Quintessence / Breath)",
      "Walk over elements to collect them (up to 4 in your inventory).",
      "Walk to the ⚗ Athanor (crucible) to combine — the best available reaction fires.",
      "8 reactions: Solutio · Calcinatio · Coagulatio · Sublimatio · Sol · Luna · Mercury · Philosopher's Stone",
      "Rare reactions show full Jungian/Hermetic lore.",
      "",
      "Research: Jung (1944) Psychology and Alchemy; Principe (2013) The Secrets of Alchemy.",
      "Alchemy = projection of psychic transformation processes."
    ]
  },
  {
    title: "♩ Rhythm Mode — Beat Synchrony",
    body: [
      "Press M to switch to Rhythm Mode.",
      "The grid pulses to a drum machine beat (kick, snare, hihat, accent).",
      "When tiles flash/glow — MOVE ONTO THEM to score an on-beat hit!",
      "Land on beat: +points with combo multiplier (up to ×4).",
      "Off beat: no penalty — just the streak resets. Keep trying.",
      "BPM increases with level: 60 (Resting Pulse) → 80 → 100 → 120 (Activation).",
      "The beat visualizer bar at the bottom shows the 16-step sequence.",
      "Aim for high accuracy % — awarded as bonus at level complete.",
      "",
      "Research: Thaut et al. (1997) Rhythmic Auditory Stimulation (RAS);",
      "Bittman et al. (2001) drumming reduces cortisol, increases NK-cell activity."
    ]
  },
  {
    title: "⚔ RPG Adventure Mode",
    body: [
      "Press M until you reach RPG Adventure mode.",
      "You walk through a 12×12 tile grid — same WASD/Arrow movement.",
      "Collect green ◈ Peace nodes to advance levels.",
      "  Each peace node earns score (wisdom-boosted) and feeds quest progress.",
      "  Collect all peace nodes → new level with refreshed grid.",
      "Avoid purple ◌ Shadow Enemies — touching one deals HP damage.",
      "  They wander toward you; your Resilience stat reduces their damage.",
      "",
      "Character Stats (shown in top-left panel):",
      "  STR Strength  · WIS Wisdom (score bonus) · EMP Empathy",
      "  RES Resilience (damage reduction) · CLR Clarity (vision range)",
      "Stats grow as you level up and complete quests.",
      "",
      "Dialogue: on first entry, a story prompt appears at the bottom.",
      "  ↑/↓ to select a response, ENTER to confirm.",
      "  Each choice subtly shifts your emotional field.",
      "",
      "Press D for the Stats Dashboard · U for the Upgrade Shop."
    ]
  },
  {
    title: "📊 Stats Dashboard (D Key)",
    body: [
      "Press D at any time during gameplay to open the Stats Dashboard.",
      "Press D or ESC to close it.",
      "",
      "The Dashboard shows:",
      "  Session time · Current level · Score · Insight tokens · Combo",
      "",
      "  Emotional Field: top 5 active emotions with percentage bars.",
      "    Emotions shift based on tiles you step on and archetypes used.",
      "    High coherence (joy/hope/gratitude) boosts score multipliers.",
      "",
      "  Lucidity Meter: rises during focused play and dream-yoga practice.",
      "    High lucidity (70%+) is associated with metacognitive awareness.",
      "",
      "  Language Learning: shows your selected language pair and",
      "    total number of vocabulary/translation challenges completed.",
      "",
      "  Current Mode: active game mode, play variation, and dreamscape.",
      "",
      "The dashboard never pauses the game — it overlays transparently."
    ]
  }
];
