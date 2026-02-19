# 🌌 GLITCH·PEACE

**A Consciousness Awakening, Addiction Recovery, and Learning Enhancement Game**

[![Version](https://img.shields.io/badge/version-2.6.0-blue.svg)](https://github.com/jessidono24-cmyk/glitch-peace-vite)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/jessidono24-cmyk/glitch-peace-vite)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-16%2B-brightgreen.svg)](https://nodejs.org/)
[![LOC](https://img.shields.io/badge/lines-~22%2C500-purple.svg)](src/)
[![Modules](https://img.shields.io/badge/modules-62-blueviolet.svg)](src/)

> *Begin in stillness. Emerge through pattern recognition. Transform through play.*

A neurodivergent-friendly consciousness simulation game combining roguelike gameplay with evidence-based psychological techniques for consciousness awakening, addiction recovery, IQ/EQ development, dream yoga practice, and multilingual learning.

---

## 🎯 What Is GLITCH·PEACE?

GLITCH·PEACE is a **consciousness engine** disguised as a game. Far more than entertainment — it is a multidimensional transformation tool built on ~145KB of peer-reviewed research. Through gentle stress inoculation, pattern recognition training, and embodied play, it helps players:

- 🧠 **Awaken Consciousness** — Develop metacognition, reality testing, and lucid dreaming skills
- 🌱 **Support Recovery** — Rebuild executive function through impulse delay, consequence prediction, and compassionate relapse design
- 📚 **Enhance Learning** — 16-language progressive vocabulary challenges, mathematical reasoning, sigil pattern literacy
- 🧘 **Embody Awareness** — Dream yoga practice, somatic body scanning, breath integration
- ✨ **Experience Flow** — Adaptive challenge keeps you in the zone of proximal development
- 🎮 **Play Freely** — Age-accessible from age 5+ through hardcore nightmare mode; 13 play mode variations

### The Five Pillars

| Pillar | Mechanism | Evidence Base |
|--------|-----------|---------------|
| **Consciousness Awakening** | Pattern recognition, reality checks, lucidity meter | LaBerge (1985), Csikszentmihalyi (1990) |
| **Addiction Recovery** | Impulse buffer (1s delay), consequence preview (3-step), route alternatives, compassionate relapse | Prefrontal cortex restoration, Baumeister ego depletion model |
| **Learning Enhancement** | 16-language progressive vocab, math puzzles, memory challenges, sigil literacy | ZPD (Vygotsky), spaced repetition, implicit learning theory |
| **Embodiment & Dream Yoga** | Body scan on COVER tiles, lucidity meter, dream sign recognition (localStorage), pause rewards | Tibetan dream yoga, Gendlin focusing, polyvagal theory |
| **Consciousness Engine** | Emotional field (10 emotions), temporal system (lunar+weekday), world distortion, synergy multipliers | Penrose-Hameroff Orch-OR, CIA Gateway Process |

---

## ✨ What's Working Right Now (v2.6)

### 🎮 Two Complete Gameplay Modes

#### 1. Grid-Based Roguelike — All Systems Connected
**Gameplay:**
- Move with WASD/Arrow keys
- Collect ◈ peace nodes to advance levels
- Avoid or strategically use hazard tiles
- Collect ☆ ARCH tiles for archetype powers

**Key Controls:**
| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| **J** | Activate Archetype Power (Dragon/Child/Orb/Captor/Protector — per dreamscape) |
| **R** | Fire Glitch Pulse (charges from ◈ collection, clears hazards radius-3, stuns enemies) |
| **SHIFT** | Toggle Matrix A (Erasure/red) ↔ B (Coherence/green) |
| **U** | Open Upgrade Shop (when you have insight tokens) |
| ESC | Pause |
| M | Switch to Shooter mode |

**13 Play Mode Variations:**
Classic · Zen Garden · Speedrun · Puzzle · Survival Horror · Roguelike · Pattern Training · Boss Rush · Pacifist · Reverse · Campaign · Ritual · Daily Challenge

**11 Dreamscapes (each unique tiles + visual theme):**
The Rift · The Lodge · The Wheel · The Duat · The Tower · The Wilderness · The Abyss · The Crystal · Childhood Neighborhood · Aztec Chase Labyrinth · Orb Escape Event

**Enemy AI — 9 Behavior Types:**
`chase` · `wander` · `patrol` · `orbit` · `adaptive` · `predictive` · `rush` · `scatter` · hallucination phantoms (level 3+)

**5 Archetypes (J key, 12s cooldown):**
| Archetype | Dreamscape | Power |
|-----------|------------|-------|
| Dragon | The Rift | Wall Jump — leap 2 tiles in any direction |
| Child Guide | The Lodge / Wilderness | Reveal — flash-reveal all hidden tiles for 3s |
| Orb | The Wheel / Abyss | Phase Walk — pass through walls for 10 moves |
| Captor-Teacher | The Duat / Crystal | Rewind — undo last 3 moves (temporal rewind) |
| Protector | The Tower | Shield Burst — shield + stun all enemies 1.5s |

**Matrix A/B System (SHIFT):**
- **Matrix A — Erasure (red):** Enemies 35% faster, energy drains, damage +25%, more hostile
- **Matrix B — Coherence (green):** Energy regens, enemies normal speed, more peaceful

**Glitch Pulse (R key):**
- Charges +15% per peace node collected (100% = ready)
- Fires: clears all hazard tiles within radius 3, stuns all enemies within radius 4 for 1.8s

**All these systems are wired together:**
- Emotional field → world distortion overlay → hazard damage modifier
- Temporal system (lunar/weekday) → enemy count scaling, insight score
- Play mode → timer, move limit, fog-of-war, auto-heal, tile respawn
- Cosmology → tile biases, score multipliers, unique mechanics
- Difficulty → SPROUT (age 5+) through NIGHTMARE
- Language learning challenges on INSIGHT tiles
- Sigil pattern recognition challenges
- Lucidity meter (0-100) affected by play
- Dream sign recognition tracking (localStorage persistence)
- Combo multiplier (up to 4× at combo=16)
- PUZZLE undo (U — disabled when shop open), REVERSE polarity, RITUAL breathing pauses
- PACIFIST mode (no damage from enemies — stealth score instead)
- Boss encounters every 5th level (pulsing ◆, HP bar, 25 dmg)
- DESPAIR/HOPELESS tiles spread to adjacent void cells over time
- 8 upgrades purchasable with insight tokens (U key shop)
- 30-level campaign with narrative arc in 3 acts

#### 2. Twin-Stick Shooter
- Real-time WASD movement + mouse aim + hold LMB to shoot
- 4 weapon types (Spread · Laser · Missiles · Energy Orb), switch with 1-4
- Wave-based enemies with HP scaling
- Enemy types: Standard · Tank (150 HP, slow) · Zigzag (fast, oscillating)
- Dreamscape-themed visuals (background, player ship, bullet/enemy colors)
- Game over transitions to main PATTERN INCOMPLETE screen

### 🧠 All Core Systems Implemented

| System | Status | What It Does |
|--------|--------|--------------|
| Emotional Field Engine | ✅ | 10 emotions, 7 synergies, coherence/distortion metrics |
| Temporal System | ✅ | 8 lunar phases, 7 weekday harmonics, real-time modifiers |
| Realm Calculation | ✅ | 5 realms (MIND/HEAVEN/HELL/PURGATORY/IMAGINATION) |
| 12 Cosmology Systems | ✅ | Selection screen, mechanical modifiers, HUD display |
| Recovery Tools | ✅ | Impulse buffer, pattern echo, consequence preview, route alternatives, threshold monitor, session manager, relapse compassion |
| Dream Yoga | ✅ | Lucidity meter, dream sign DB (localStorage), body scan, reality checks, pause rewards |
| Learning Modules | ✅ | Vocab/math/memory/language/sigil quizzes on INSIGHT tiles |
| 16-Language System | ✅ | Progressive overload order, all 16 languages with vocab bank |
| Sigil Database | ✅ | 31 sigils across 6 traditions, 12 universal pattern primitives |
| Archetypes System | ✅ | 5 archetypes, J key, 12s cooldown, per-dreamscape |
| Matrix A/B | ✅ | SHIFT to toggle, energy bar, enemy speed modifier |
| Glitch Pulse | ✅ | R key, 100% charge = fire, clears hazards + stuns |
| Enemy AI Behaviors | ✅ | 9 types including hallucinations, boss phases |
| Tile Spread | ✅ | DESPAIR/HOPELESS tiles spread over time |
| Upgrade Shop | ✅ | 8 upgrades, insight token economy |
| Campaign Mode | ✅ | 30-level arc in 3 acts |
| Save/Load | ✅ | Persists cosmology, language, difficulty, progress |
| First-Run Onboarding | ✅ | Age group → native language → target language |
| Age-Accessible Difficulty | ✅ | SPROUT (age 5+) through NIGHTMARE |
| Particle System | ✅ | Dynamic VFX with object pooling, 300-particle live cap, pool capped at 200 |
| Audio Engine | ✅ | Procedural Web Audio API SFX, no external files |
| Modular Architecture | ✅ | Plugin system for unlimited gameplay modes |
| Level Transitions | ✅ | 3s readable overlay: fade-in, score earned, skip after 1.5s |
| Combo Multiplier HUD | ✅ | Live bottom-left canvas display, pulses on collect, capped at 4× |
| Synergy Banner | ✅ | Named emotional synergy popup (affect labeling — see RESEARCH §18) |
| Game-Over Overlay | ✅ | Compassionate PATTERN INCOMPLETE screen; ENTER restarts in-mode |
| Quest Notifications | ✅ | RPGMode quest completions surface as timed banner on grid |
| RPG Adventure Mode | ✅ | Live 12×12 walkable grid, 3 shadow enemies, stat-modulated damage, dialogue trees, quests |
| Stats Dashboard | ✅ | D key overlay: session time, emotional field bars, lucidity meter, language progress, **IQ/EQ/Empathy/Strategy scores** |
| Gamepad Support | ✅ | Left stick + D-pad → directional; A/B/X/Y → action keys; edge-detect press |
| Canvas Responsive | ✅ | Auto-scales to viewport while keeping square internal resolution |
| Canvas Accessibility | ✅ | `tabindex=0`, `role=application`, descriptive `aria-label` for screen readers |
| Shooter Boss Waves | ✅ | Every 5th wave: boss enemy with pulsing ring render and centered HP bar |
| Ornithology Mode | ✅ | Bird-watching grid: 16 species, 7 biomes, species ID challenges, field notebook |
| Mycology Mode | ✅ | Mushroom foraging: 12 species, 5 substrates, toxic ID challenges, mycelium networks |
| Architecture Mode | ✅ | Spatial construction: 10 tile types, 4 sacred-geometry blueprints, pattern matching |
| Constellation Mode | ✅ | Connect-the-stars meditation: 6 constellations, sequential activation, mythological lore |
| Alchemy Mode | ✅ | Hermetic lab: collect Fire/Water/Earth/Air, 8 transmutation reactions, Jungian lore overlays, particle effects |
| Rhythm Mode | ✅ | Beat-sync grid: drum machine (kick/snare/hihat), tiles pulse on beat, 4 BPM patterns, accuracy scoring |
| Audio Engine | ✅ | 13+ synthesized SFX: peace, damage, combo, level_complete, archetype, insight, bird, spore, build, heal, boss |
| Visual Polish | ✅ | GLITCH tile random color flicker, INSIGHT tile shimmer, peace node pulse glow, combo HUD |
| **Logic Puzzles** | ✅ | **Phase 9: Sequence challenge overlay after each dreamscape completion; IQ proxy score** |
| **Emotion Recognition** | ✅ | **Phase 9: Dominant emotion label flash (EQ labeling); EQ score tracking** |
| **Empathy Training** | ✅ | **Phase 9: Enemy behavior emotional context overlays; compassion phrases; empathy score** |
| **Strategic Thinking** | ✅ | **Phase 9: Mindful vs. reactive move tracking; matrix discipline; strategy score** |
| **Achievement System** | ✅ | **15 achievements earned through meaningful play; badge overlay on unlock; localStorage persistence** |

---

## 🚀 Quick Start

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
# Opens at http://localhost:3000/
```

**Build for production:**
```bash
npm run build
# Output in dist/ — deploy anywhere, no server needed
```

---

## 🗺️ Blueprint Completion Status

```
Phase 1: Foundation          [████████████████████] 100% ✅  (4,300 lines)
Phase 2: Recovery Tools      [████████████████████] 100% ✅  (+2,500 lines)
Phase 2.5: Dream Yoga        [████████████████████] 100% ✅  (+3,200 lines)
Phase 3: Learning Modules    [████████████████████] 100% ✅  (+1,800 lines)
Phase 4: Cosmology           [████████████████████] 100% ✅  (+1,200 lines)
Phase 5: Boss System         [████████████████████] 100% ✅  (+400 lines)
Phase 6: Dreamscape Expand   [████████████████████] 100% ✅  (11/11 canonical dreamscapes)
Phase 7: Upgrade Shop        [████████████████████] 100% ✅  (+700 lines)
Phase 8: Polish & Testing    [████████████████████]  90% 📋  (transitions, combo, synergy, audio, tile anims, gamepad, canvas, boss HP bar, accessibility)
Phase 9: Intelligence        [████████████████████] 100% ✅  (Logic Puzzles IQ, Emotion Recognition EQ, Empathy Training, Strategic Thinking — 4 modules)
Phase Language Learning      [████████████████████] 100% ✅  (16 langs + progressive overload)
Phase Archetypes             [████████████████████] 100% ✅  (5 archetypes, J key, 11 dreamscapes)
Phase Matrix A/B             [████████████████████] 100% ✅  (SHIFT toggle, energy)
Phase Enemy AI               [████████████████████] 100% ✅  (9 behaviors + hallucinations)
Phase Sigil Database         [████████████████████] 100% ✅  (31 sigils, 6 traditions)
Phase RPG Mode               [████████████████████] 100% ✅  (live 12×12 grid, shadow enemies, stat combat, dialogue, quests — Phase M5 active)
Phase Ornithology Mode       [████████████████████] 100% ✅  (16 birds, 7 biomes, ID challenges, notebook)
Phase Mycology Mode          [████████████████████] 100% ✅  (12 species, substrates, mycelium networks)
Phase Architecture Mode      [████████████████████] 100% ✅  (10 tiles, 4 blueprints, pattern matching)
Phase Constellation Mode     [████████████████████] 100% ✅  (6 constellations, lore, star-path activation)
Phase Alchemy Mode           [████████████████████] 100% ✅  (4 elements, 8 reactions, particle FX, Jungian lore)
Phase Rhythm Mode            [████████████████████] 100% ✅  (4 BPM patterns, drum machine, beat-sync tiles)
Phase Stats Dashboard        [████████████████████] 100% ✅  (D key overlay, emotional field, lucidity, language, IQ/EQ/Empathy/Strategy)
Phase Gamepad Support        [███████████████░░░░░]  75% ✅  (left stick + D-pad + 6 buttons wired; rumble pending)
Phase Achievements           [████████████████████] 100% ✅  (15 achievements, badge overlay, localStorage)
Phase Accessibility          [███████████████░░░░░]  60% 📋  (canvas aria-label + tabindex; WCAG AA audit pending)
────────────────────────────────────────────────────────────
Overall:  ~22,500 / 23,500 lines  ≈  92% of full vision complete

Remaining high-priority:
  - Multiplayer infrastructure
  - 80%+ test coverage
  - Full WCAG AA accessibility audit
  - Performance optimization (WebGL renderer candidate)
  - Gamepad rumble / vibration feedback
  - Integration metrics dashboard (cross-session analytics)
```

---

## 📋 What's Left (Roadmap)

### Immediate Next Steps
- [x] **11 canonical dreamscapes** — Childhood Neighborhood, Aztec Chase Labyrinth, Orb Escape Event ✅
- [x] **Constellation Mode** — connect-the-stars meditative puzzles ✅
- [x] **Ornithology Mode** — bird-watching with species ID challenges ✅
- [x] **Mycology Mode** — mushroom foraging with toxic ID challenges ✅
- [x] **Architecture Mode** — spatial construction with blueprints ✅
- [x] **Alchemy Mode** — Hermetic laboratory, 8 transmutation reactions ✅
- [x] **Rhythm Mode** — beat-synchronized grid, drum machine entrainment ✅
- [x] **Phase 8 Polish** — GLITCH flicker, INSIGHT shimmer, heal SFX ✅
- [x] **RPG Mode full grid rendering** — live 12×12 walkable grid, shadow enemies, stat combat ✅
- [x] **Stats Dashboard** — D key overlay, emotional field, lucidity, language progress, IQ/EQ/Empathy/Strategy ✅
- [x] **Gamepad Support** — left stick + D-pad + action buttons via InputManager.pollGamepad() ✅
- [x] **Shooter Boss Waves** — every 5th wave boss with pulsing HP bar ✅
- [x] **Canvas Responsive Sizing** — fits viewport on all screen sizes ✅
- [x] **Phase 9: Logic Puzzles** — sequence challenge overlay after each dreamscape, IQ proxy score ✅
- [x] **Phase 9: Emotion Recognition** — dominant emotion label flash, EQ score, matrix alignment tracking ✅
- [x] **Phase 9: Empathy Training** — enemy behavior emotional context overlays, compassion phrases ✅
- [x] **Phase 9: Strategic Thinking** — mindful vs. reactive move tracking, strategy score ✅
- [x] **Achievement System** — 15 achievements, badge overlay on unlock, localStorage persistence ✅
- [x] **Canvas Accessibility** — `tabindex=0`, `role=application`, descriptive `aria-label` ✅
- [ ] **Full test suite** — 80%+ coverage for core systems (Phase 8)
- [ ] **Performance audit** — memory leak checks, particle pooling, canvas optimization

### Medium Term
- [ ] **Co-op Mode** — shared emotional field, 2 players (Phase 4 from original roadmap)
- [ ] **Integration Dashboard** — unified metrics: lucidity score, language progress, session analytics
- [ ] **Multiplayer** — network infrastructure, lobby

### Steam Release Path (see section below)

---

## 🎮 Steam Release Pathway

GLITCH·PEACE is built in HTML5 Canvas / Vanilla JS — a strong foundation for a Steam release via **Electron** wrapper.

### Technical Path to Steam

| Step | Tool | Notes |
|------|------|-------|
| 1. Electron wrapper | [Electron](https://www.electronjs.org/) | Packages the web app as a native desktop app for Windows/Mac/Linux |
| 2. Steamworks SDK | [GreenWorks](https://github.com/nicedoc/greenworks) or `steamworks.js` | Achievements, cloud saves, leaderboards |
| 3. Steam Direct | $100 one-time fee | Required to list on Steam |
| 4. Steam Next Fest | Free (by application) | Great early visibility for indie games |
| 5. Revenue split | 70% developer / 30% Steam | Standard Valve terms |

### Why Steam Makes Sense for GLITCH·PEACE
- **Free to Play** — aligns with mission (accessibility first, no paywalls)
- **Steam achievements** map naturally to consciousness milestones (first lucid level, 100 peace nodes, full ARCH collection)
- **Steam cloud saves** means dream sign database persists across devices
- **Offline mode** — all gameplay is local, no server required
- **Workshop potential** — community-created dreamscapes/cosmologies

### Steam-Ready Requirements (Current Status)
| Requirement | Status |
|-------------|--------|
| Stable 60fps | ✅ (vite build, canvas 2D, no heavy deps) |
| Windows/Mac/Linux | 📋 (needs Electron wrapper — ~1 week) |
| Keyboard + gamepad | ✅ (gamepad API wired via InputManager.pollGamepad()) |
| Steam achievements | ✅ (15 in-game achievements; Steamworks SDK mapping ready) |
| Canvas accessibility | ✅ (aria-label, tabindex, role=application) |
| ESRB rating | 📋 (E10+ likely — mild fantasy themes, recovery content) |
| Store page assets | 📋 (screenshots, trailer, capsule art) |
| Localization | 🚧 (16 language vocab bank exists; UI localization needed) |

### Estimated Timeline to Steam Early Access
- **Phase 1** (now → 4 weeks): Complete remaining dreamscapes + constellation mode + Electron wrapper
- **Phase 2** (4 → 8 weeks): Test suite, gamepad support, Steam SDK integration
- **Phase 3** (8 → 12 weeks): Store page, achievements design, beta testing
- **Target**: Early Access release **Q2 2026** as a free game with optional supporter DLC

---

## 🔬 Research Foundation

GLITCH·PEACE is built on peer-reviewed scientific research. Every mechanic has a documented reason:

| Mechanic | Research Basis |
|----------|----------------|
| Impulse buffer (1s) | Baumeister et al. (2007): ego depletion; prefrontal cortex restoration via delay training |
| Consequence preview | Kahneman (2011): System 2 activation; future-self visualization techniques |
| Pattern echo trail | Habit loop awareness (Duhigg, 2012); loop detection in cognitive-behavioral therapy |
| Reality checks | LaBerge (1985/1990): MILD technique; critical awareness cultivation for lucid dreaming |
| Dream sign tracking | Tibetan Dream Yoga (Norbu, 1992); personal dream dictionary building |
| Body scan tiles | Gendlin (1982): Focusing; somatic marker hypothesis (Damasio, 1994) |
| Emotional field engine | Plutchik wheel of emotions; polyvagal theory (Porges, 1994) |
| Temporal system | Circadian biology (Czeisler, 1995); lunar phase effects on sleep (Cajochen et al., 2013) |
| 16-language progressive | Linguistic typology (Comrie, 1989); family-based learning transfer |
| Sigil database | Arnheim (1969) visual psychology; Gimbutas (1991) universal symbols; Leroi-Gourhan (1965) |
| Adaptive difficulty | Vygotsky ZPD; Csikszentmihalyi (1990) flow channel |
| Combo multiplier | Dopamine reward timing (Schultz, 1997); ethical variable-ratio design (King et al., 2019) |
| Synergy banner | Affect labeling (Lieberman et al., 2007); emotional intelligence training (Salovey & Mayer, 1990) |
| Transition overlay | Cognitive consolidation windows (Ericsson, 1995); SDT non-coercive feedback (Deci & Ryan, 1985) |
| Compassionate game-over | Non-punishment framing (Neff, 2003); relapse compassion (Linehan, 1993); neuroplasticity protection (McEwen, 2007) |

📖 **Full Research**: See [RESEARCH.md](RESEARCH.md) and [DREAM_YOGA.md](DREAM_YOGA.md) for complete citations (now 18 sections, v1.1).

---

## 🏗️ Technical Architecture

### Project Structure (42 modules, ~11,000 lines)

```
glitch-peace-vite/
├── src/
│   ├── core/                        # Foundation systems
│   │   ├── constants.js             # 17 tile types, 8 biomes, 6 difficulty tiers (incl. SPROUT age 5+)
│   │   ├── emotional-engine.js      # 10-emotion field, 7 synergies, coherence/distortion
│   │   ├── temporal-system.js       # 8 lunar phases, 7 weekday harmonics
│   │   ├── storage.js               # Save/load (cosmology, language, lucidity, insightTokens)
│   │   ├── utils.js                 # Seeded random (mulberry32), math helpers
│   │   └── game-engine/
│   │       ├── GameStateManager.js  # Centralized state
│   │       └── InputManager.js      # Keyboard/mouse/touch; keysPressed for discrete moves
│   ├── game/
│   │   ├── grid.js                  # Procedural generation, seeded DAILY mode, biome-aware
│   │   ├── player.js                # movePlayer, combo scoring (4× max), scoreMul, hazardMul
│   │   ├── enemy.js                 # 9 AI behaviors (chase/wander/patrol/orbit/adaptive/
│   │   │                            #   predictive/rush/scatter + hallucinations)
│   │   └── particles.js             # Dynamic particles
│   ├── gameplay-modes/
│   │   ├── ModeRegistry.js          # Plugin system for unlimited modes
│   │   ├── grid-based/
│   │   │   └── GridGameMode.js      # All systems wired: archetypes, matrix, glitch pulse,
│   │   │                            #   tile spread, fog-of-war, boss, campaign, learning...
│   │   └── shooter/
│   │       └── ShooterMode.js       # Twin-stick; TANK/ZIGZAG enemies; dreamscape themes
│   ├── systems/
│   │   ├── archetypes.js            # 5 archetypes (Dragon/Child/Orb/Captor/Protector)
│   │   ├── audio.js                 # Procedural SFX (Web Audio API, no external files)
│   │   ├── campaign.js              # 30-level narrative arc (3 acts)
│   │   ├── cosmologies.js           # 12 cosmologies + getCosmoModifiers()
│   │   ├── dream-yoga.js            # Lucidity meter, dream sign DB, body scan, pause rewards
│   │   ├── dreamscapes.js           # 11 dreamscapes with tile biases + visual themes
│   │   ├── languages.js             # 16 languages, progressive overload, vocab bank
│   │   ├── learning-modules.js      # 5 challenge types on INSIGHT tiles
│   │   ├── play-modes.js            # 13 play modes with full mechanical differentiation
│   │   ├── powerups.js              # SHIELD/SPEED/FREEZE/REGEN
│   │   ├── recovery-tools.js        # 7 recovery tools + reality checks
│   │   ├── sigils.js                # 31 sigils, 12 primitives, 6 traditions (evidence-based)
│   │   ├── undo.js                  # PUZZLE undo with deep state snapshot
│   │   └── upgrade-shop.js          # 8 upgrades, insight token economy
│   ├── ui/
│   │   ├── hud.js                   # HP bar (red < 25%), timer, insight tokens, near-miss count
│   │   ├── menus.js                 # Full menu system + onboarding + dreamscape/playmode/
│   │   │                            #   cosmology/language selection screens
│   │   └── tutorial-content.js      # Tutorial pages
│   └── main.js                      # Game loop, mode switching, GAME_OVER screen
└── tests/
    ├── smoke.spec.js                # Playwright smoke test
    └── interactive-tiles.spec.js    # Interactive tile tests
```

### Technology Stack

| Tool | Version | Role |
|------|---------|------|
| **Vite** | 7.3.1 | Build tool (559ms build time) |
| **Vanilla JS** | ES6+ modules | Zero framework overhead |
| **HTML5 Canvas 2D** | — | All rendering |
| **Web Audio API** | — | Procedural SFX (no audio files) |
| **localStorage** | — | Dream signs, save data, first-run prefs |
| **Playwright** | — | Browser automation tests |

**Build Stats:** 42 modules · 167KB (54KB gzip) · 559ms · 0 vulnerabilities

---

## ♿ Accessibility & Age Accessibility

### Difficulty Tiers

| Tier | Age | Description |
|------|-----|-------------|
| **Sprout ✿** | 5–7 | No enemies · zero damage · 2.5× peace rewards · auto-collect adjacent nodes · route hints always on |
| **Seedling ◇** | 8–12 | 1 very slow enemy · 0.3× damage · 1.8× peace · hints on |
| **Stillness** | 13+ | No enemies · 0.5× damage · 1.3× peace |
| **Presence** | 18+ | Normal — 1 enemy, standard damage |
| **Chaos** | — | 2 enemies · 1.5× damage |
| **Nightmare** | — | 4 enemies · 2× damage · permadeath |

### Neurodivergent-Friendly Features
- ✅ Pause anytime, no pressure
- ✅ Auto-save — never lose progress
- ✅ "PATTERN INCOMPLETE" not "You Died" — compassionate framing
- ✅ Relapse compassion: first lethal hit per level gives a second chance (+15 HP rescue)
- ✅ High contrast mode (options menu)
- ✅ Reduced motion mode
- ✅ Stable player identity (cyan ◈ never changes)
- ✅ Session reminders at 20/45/90 minutes
- ✅ Pause rewards: 10 min pause = +10 HP, 60 min = +2 insights
- ✅ All features optional and player-controlled

---

## 🌍 16-Language Progressive Learning System

| Language | Family | Script | Progressive Unlock |
|----------|--------|--------|-------------------|
| English | Germanic | Latin | Native baseline |
| German | Germanic | Latin | Germanic family first |
| Norwegian | Germanic | Latin | Germanic family |
| Dutch | Germanic | Latin | Germanic family |
| French | Romance | Latin | After Germanic |
| Spanish | Romance | Latin | Romance family |
| Portuguese | Romance | Latin | Romance family |
| Italian | Romance | Latin | Romance family |
| Latin | Italic | Latin | Classical bridge |
| Greek | Hellenic | Greek | After Latin/before Russian |
| Russian | Slavic | Cyrillic | Slavic family |
| Arabic | Semitic | Arabic | Semitic family |
| Egyptian Hieroglyphs | Afroasiatic | Hieroglyphic | With Arabic |
| Mandarin | Sino-Tibetan | Hanzi | East Asian cluster |
| Japanese | Japonic | Kana+Kanji | After Mandarin |
| Korean | Koreanic | Hangul | After Mandarin |

**Progressive Overload**: If your native language is English, unlocking order is:
German → Norwegian → Dutch → French → Spanish → Portuguese → Italian → Latin → Greek → Russian → Arabic → Egyptian → Mandarin → Japanese → Korean

---

## 🔯 Universal Sigil Pattern Database

31 sigils across 6 traditions, grounded in cross-cultural research:
- **Game sigils**: ◈ ☆ ⊕ ⚠ ◉ ∇ ≋ ◎ (GLITCH·PEACE tile symbols with documented meanings)
- **Elder Futhark runes**: ᚠ ᚢ ᚦ ᚨ ᛊ ᛞ ᛟ (with Proto-Germanic etymology)
- **Alchemical symbols**: ☉ ☽ ☿ 🜁 🜂 🜃 🜄 (Jungian psychological interpretation)
- **Egyptian hieroglyphs**: 𓋹 𓂀 𓇳 𓆄 𓆣 𓇽 (Gardiner sign list references)
- **Planetary symbols**: ♄ ♃ ♀

**12 Universal Pattern Primitives** (Arnheim/Gimbutas/Haarmann evidence-based):
dot · circle · cross · spiral · triangle · wave · diamond · star · line · chevron · arc · diamond

---

## 🎨 Design Principles (CANON — Non-Negotiable)

1. **Non-Coercive** — All features optional, player-controlled, no forced loops
2. **Safe Boundaries** — "Stop means stop"; ESC always works; pause is instant
3. **Compassionate Messaging** — "PATTERN INCOMPLETE" not "YOU DIED"
4. **Neurodivergent-First** — Accessibility is foundation, not afterthought
5. **Evidence-Based** — Every mechanic grounded in peer-reviewed research
6. **Multiple Intelligences** — Visual, logical, kinesthetic, interpersonal, intrapersonal pathways
7. **Emergent Complexity** — Simple rules × layered systems = infinite experience
8. **Cultural Respect** — Traditional wisdom honored and attributed, never appropriated
9. **Privacy Paramount** — All data local-first; dream signs/saves never transmitted
10. **Sterilized Wisdom** — Deep wisdom presented as simulation/exploration, not dogma
11. **Sovereign Codex** — Individual sovereignty always paramount; informed consent required

---

## 🤝 Contributing

### Areas Most Needed

- 🎮 **New gameplay modes** — Constellation (connect-the-stars meditation), Rhythm
- 🌍 **Dreamscape content** — Additional tile art, ambient music tracks, lore text for new dreamscapes
- 🧠 **Learning content** — More vocabulary per language (currently 12 concepts × 16 languages)
- 📊 **Test coverage** — Core system unit tests (currently ~10%)
- 🎮 **Gamepad support** — Gamepad API for controller play (needed for Steam)
- ♿ **Accessibility audit** — WCAG AA compliance review

### Code Standards
- ES6+ JavaScript modules (no TypeScript required)
- Canvas-based rendering (no DOM manipulation in game code)
- No external runtime dependencies (Vite only for build)
- 60fps target — profile before committing render-path changes
- Follow existing `gameState.*` pattern for new systems
- Add to `DIFF_CFG.sprout` / `DIFF_CFG.seedling` as needed for age accessibility

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Version | 2.4.0 |
| Lines of Code | ~17,000 |
| Target LOC | 23,500+ |
| Blueprint Completion | ~82% |
| Source Modules | 57 |
| Gameplay Modes (running) | 9 (Grid + Shooter + RPG + Ornithology + Mycology + Architecture + Constellation + Alchemy + Rhythm) |
| Gameplay Modes (designed) | 31+ |
| Languages | 16 |
| Dreamscapes | 11 |
| Cosmologies | 12 |
| Play Mode Variations | 13 |
| Enemy AI Behaviors | 9 |
| Archetypes | 5 |
| Sigils in Database | 31 |
| Audio SFX (synthesized) | 13 |
| Alchemical Reactions | 8 |
| Drum Beat Patterns | 4 |
| Bird Species | 16 |
| Mushroom Species | 12 |
| Blueprints | 4 |
| Constellations | 6 |
| Build Time | ~680ms |
| Bundle Size | 258KB (81KB gzip) |
| Vulnerabilities | 0 |

---

## 🙏 Acknowledgments

### Research Foundations
- Mihaly Csikszentmihalyi — Flow theory (optimal experience)
- Robert Monroe / CIA Gateway Process — Hemispheric synchronization
- Stephen LaBerge — Lucid dreaming (MILD technique, WILD)
- Tenzin Norbu Rinpoche — Tibetan Dream Yoga
- Eugene Gendlin — Focusing / somatic embodiment
- Stephen Porges — Polyvagal theory
- Howard Gardner — Multiple intelligences
- Lev Vygotsky — Zone of Proximal Development
- Rudolf Arnheim — Visual psychology
- Marija Gimbutas — Universal symbols in world cultures
- André Leroi-Gourhan — Cave art geometric vocabulary
- Thomas Allen — Middle Egyptian (hieroglyph transliteration standard)

### Built With ♥ For
- Consciousness explorers seeking genuine transformation
- People in recovery building new neural patterns
- Neurodivergent minds navigating unique paths
- Language learners building multilingual bridges
- Dream yoga practitioners developing awareness
- Children (5+) discovering the joy of pattern recognition

---

## 📄 License

MIT License — See [LICENSE](LICENSE)

**Personal project built with consciousness and care. Free forever.**

---

## 🔗 Links

- **Vite Repo (active dev)**: https://github.com/jessidono24-cmyk/glitch-peace-vite
- **Original Repo (reference)**: https://github.com/jessidono24-cmyk/glitch-peace
- **Issues**: https://github.com/jessidono24-cmyk/glitch-peace-vite/issues
- **Discussions**: https://github.com/jessidono24-cmyk/glitch-peace-vite/discussions

---

## 🚀 Get Started Now!

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

**On first launch:** Choose your age group and native language for a personalized experience.
**Grid mode:** J=Archetype · R=Glitch Pulse · SHIFT=Matrix A/B · WASD=Move
**Shooter mode:** WASD=Move · Mouse=Aim · LMB=Shoot · 1-4=Weapon · M=Switch

---

*Begin in stillness. Emerge through pattern recognition. Transform through play.* 🌌✨

**Made with ◈ for consciousness explorers everywhere.**

**A Consciousness Awakening, Addiction Recovery, and Learning Enhancement Game**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/jessidono24-cmyk/glitch-peace-vite)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/jessidono24-cmyk/glitch-peace-vite)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-16%2B-brightgreen.svg)](https://nodejs.org/)

> *Begin in stillness. Emerge through pattern recognition. Transform through play.*

A neurodivergent-friendly consciousness simulation game combining roguelike gameplay with evidence-based psychological techniques for consciousness awakening, addiction recovery, IQ/EQ development, and dream yoga practice.

---

## 🎯 What Is GLITCH·PEACE?

GLITCH·PEACE is a **consciousness engine** disguised as a game. Through gentle stress inoculation and pattern recognition training, it helps players:

- 🧠 **Awaken Consciousness** - Develop metacognition and awareness through gameplay
- 🌱 **Support Recovery** - Aid cessation of addictive behaviors with impulse training
- 📚 **Enhance Learning** - Boost language learning, mathematical thinking, and IQ/EQ
- 🧘 **Embody Awareness** - Practice dream yoga and somatic presence
- ✨ **Experience Flow** - Enter optimal states through adaptive challenge

### The Four Pillars

1. **Consciousness Awakening**
   - Pattern recognition training creates neuroplastic changes
   - Reality testing habits transfer to lucid dreaming
   - Metacognitive awareness through multiple perspectives

2. **Addiction Recovery**
   - Impulse delay training rebuilds executive function
   - Consequence forecasting enables better decisions
   - Compassionate relapse system reduces shame
   - Body awareness supports grounding

3. **Learning Enhancement**
   - Multiple intelligence pathways (visual, logical, kinesthetic, interpersonal)
   - Zone of Proximal Development (ZPD) adaptive difficulty
   - Immediate feedback leverages dopamine reward systems
   - Language and mathematical pattern recognition

4. **Embodiment & Dream Yoga**
   - Somatic awareness and body scanning
   - Reality check training for lucid dreaming
   - Breath integration and energy body work
   - Consciousness continuity across wake/dream states

---

## ✨ Current Features (v2.0)

### 🎮 Two Complete Gameplay Modes

#### 1. Grid-Based Roguelike (Classic Mode)
- **13 Play Mode Variations**: Classic, Zen, Speedrun, Puzzle, Horror, Roguelike, Pattern Training, Boss Rush, Pacifist, Reverse, Co-op, Ritual, Daily Challenge
- **Progressive Difficulty**: Adaptive challenge system
- **Peace Node Collection**: Strategic pathfinding
- **Hazard Avoidance**: Multiple tile types with unique effects
- **Level Progression**: Infinite procedural generation
- **Complete HUD**: Health, Score, Level, Objectives, Emotional State

#### 2. Twin-Stick Shooter (NEW in v2.0!)
- **Real-Time Action**: Fast-paced wave survival
- **4 Weapon Types**: Spread Shot, Laser, Missiles, Energy Orb
- **Wave System**: Progressive enemy difficulty
- **Combo Multiplier**: Skill-based scoring
- **Particle Effects**: Satisfying visual feedback
- **Switch Anytime**: Press **M** key to toggle between modes

### 🧠 Core Systems

- ✅ **Emotional Field Engine** - Tracks emotional coherence and distortion
- ✅ **Temporal System** - Circadian rhythm awareness, lunar phases, weekly patterns
- ✅ **Realm Calculation** - 5 realms (MIND, HEAVEN, HELL, PURGATORY, IMAGINATION)
- ✅ **12 Cosmology Systems** - Hindu, Buddhist, Tantric, Norse, Celtic, Taoist, Hermetic, and more
- ✅ **Particle System** - Dynamic visual effects
- ✅ **Save/Load System** - Persistent progress
- ✅ **Tutorial System** - Multi-page guided learning
- ✅ **Modular Architecture** - Plugin system for unlimited gameplay modes

### ♿ Neurodivergent-Friendly Features

- ✅ **Pause Anytime** - Full game freeze, no pressure
- ✅ **Auto-Save** - Never lose progress
- ✅ **Compassionate Messaging** - "Pattern incomplete" not "You died"
- ✅ **High Contrast Mode** - Visual accessibility
- ✅ **Reduced Motion Mode** - Sensory accommodation
- ✅ **Multiple Intelligence Pathways** - Various ways to engage
- ✅ **Stable Visual Anchors** - Player color never changes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- npm 8+ (comes with Node.js)
- Modern web browser

### Installation (3 Steps)

```bash
# 1. Clone the repository
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite

# 2. Install dependencies
npm install

# 3. Run the game
npm run dev
```

**That's it!** Opens automatically at `http://localhost:3000/`

### Build for Production

```bash
npm run build
```

Output in `dist/` folder - deploy anywhere!

📖 **Detailed Installation**: See [INSTALLATION.md](INSTALLATION.md) for comprehensive setup guide

---

## 🎮 How to Play

### Grid Mode (Default)
1. Click **NEW GAME**
2. Select a dreamscape (The Rift or The Lodge)
3. **Move**: WASD or Arrow keys
4. **Collect**: Peace nodes (green diamonds ◈)
5. **Avoid**: Hazard tiles (red with !)
6. **Objective**: Collect all peace nodes to advance

### Shooter Mode (Press M)
1. **Move**: WASD keys
2. **Aim**: Mouse cursor
3. **Shoot**: Hold left mouse button
4. **Switch Weapon**: Press 1, 2, 3, or 4
5. **Survive**: Defeat waves of enemies
6. **Score**: Build combos for maximum points

### Universal Controls
- **M** - Switch between Grid and Shooter modes
- **ESC** - Pause game
- **H** - Help/Tutorial

---

## 📚 Complete Documentation

We have comprehensive documentation for every aspect:

| Document | Purpose | Size |
|----------|---------|------|
| [README.md](README.md) | This file - Overview | 15KB |
| [INSTALLATION.md](INSTALLATION.md) | Setup guide | 9KB |
| [STATUS.md](STATUS.md) | Current project status | 10KB |
| [ROADMAP.md](ROADMAP.md) | Complete development plan | 12KB |
| [FEATURES.md](FEATURES.md) | All 75 features catalog | 11KB |
| [GAMEPLAY_MODES.md](GAMEPLAY_MODES.md) | All 31+ modes designed | 20KB |
| [RESEARCH.md](RESEARCH.md) | Scientific foundations | 30KB |
| [DREAM_YOGA.md](DREAM_YOGA.md) | Embodiment & lucid dreaming | 13KB |
| [CANON.md](CANON.md) | Design principles | - |

**Total Documentation**: 120KB+ of comprehensive guides

---

## 🗺️ Development Roadmap

### ✅ Completed (v2.0)

#### Phase 1: Modular Architecture (Complete)
- ✅ GameMode interface and plugin system
- ✅ InputManager for unified controls
- ✅ GameStateManager for centralized state
- ✅ ModeRegistry for dynamic loading
- ✅ GridGameMode wrapper preserving all features
- **LOC**: 1,085 lines

#### Phase 2: Shooter Mode (Complete)
- ✅ Twin-stick shooter implementation
- ✅ 4 weapon types with unique mechanics
- ✅ Wave-based enemy spawning
- ✅ Collision detection and particles
- ✅ Combo multiplier system
- ✅ Mode switching (M key)
- **LOC**: 630 lines

**Current Total**: 6,015 lines of code

### 🚧 In Progress

#### Phase 3: Campaign/Story Mode (2-3 weeks)
- Progressive narrative across 30 levels
- 3 acts with different gameplay styles
- Multiple endings based on choices
- Character progression
- **Estimated**: 1,500 lines

#### Phase 4: Freeplay & Co-op (1 week)
- Sandbox exploration mode
- Local co-op (2-4 players)
- Shared emotional field
- **Estimated**: 700 lines

### 📅 Future Phases

#### Phase 5: RPG Modes (3 weeks)
- Moral Choice System (Fable-style)
- Dialogue/Romance (Mass Effect-style)
- Open World (Elder Scrolls-style)
- **Estimated**: 2,900 lines

#### Phase 6: Strategy Modes (2 weeks)
- Real-Time Strategy (RTS)
- Turn-Based Tactics (XCOM-style)
- **Estimated**: 1,700 lines

#### Phase 7: Cosmology Integration (2+ weeks)
- 12 unique cosmology-based gameplay modes
- Each embodying different philosophical traditions
- **Estimated**: 1,500 lines

#### Phase 8: Advanced Features (Ongoing)
- Learning modules (language, math, memory)
- Complete recovery tools (7 tools)
- Boss system with multi-phase encounters
- Advanced dream yoga features
- **Estimated**: 6,000+ lines

**Target Total**: 23,500+ lines for complete vision

---

## 🔬 Research Foundation

GLITCH·PEACE is built on peer-reviewed scientific research:

- **Neuroscience**: Pattern recognition creates neuroplastic changes
- **CIA Gateway Process**: Hemispheric synchronization via binaural beats
- **Flow Psychology**: Csikszentmihalyi's optimal experience theory
- **Addiction Science**: Prefrontal cortex restoration and impulse control
- **Dream Research**: Reality testing and lucid dreaming techniques
- **Embodiment Science**: Somatic practices and interoception
- **Learning Science**: Zone of Proximal Development and scaffolding
- **Quantum Consciousness**: Penrose-Hameroff Orch-OR theory
- **Contemplative Neuroscience**: Meditation-induced brain changes
- **Polyvagal Theory**: Vagus nerve and emotional regulation

📖 **Full Research**: See [RESEARCH.md](RESEARCH.md) for 30KB of citations and integration details

---

## 🏗️ Technical Architecture

### Project Structure

```
glitch-peace-vite/
├── src/
│   ├── core/                   # Foundation systems
│   │   ├── constants.js        # Game constants
│   │   ├── emotional-engine.js # Emotional field tracking
│   │   ├── temporal-system.js  # Time-based effects
│   │   ├── game-engine/        # Core abstractions
│   │   │   ├── GameStateManager.js
│   │   │   └── InputManager.js
│   │   └── interfaces/
│   │       └── GameMode.js     # Base for all modes
│   ├── gameplay-modes/         # Pluggable game modes
│   │   ├── ModeRegistry.js
│   │   ├── grid-based/         # Roguelike mode
│   │   │   └── GridGameMode.js
│   │   └── shooter/            # Shooter mode
│   │       └── ShooterMode.js
│   ├── systems/                # Advanced features
│   │   ├── cosmologies.js      # 12 cosmology systems
│   │   ├── play-modes.js       # 13+ play variations
│   │   └── audio.js            # Sound system
│   ├── ui/                     # Interface components
│   │   ├── menus.js            # Menu system
│   │   └── hud.js              # HUD rendering
│   └── main.js                 # Game loop
├── docs/                       # Documentation
├── public/                     # Static assets
└── dist/                       # Production build
```

### Technology Stack

- **Build Tool**: Vite 7.3.1 (Fast, modern)
- **Language**: Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas 2D
- **Styling**: Pure CSS
- **State**: Custom game state manager
- **Input**: Custom input manager
- **Architecture**: Plugin-based modular system

### Build Stats

- **Build Time**: 348ms
- **Bundle Size**: 69KB (22KB gzipped)
- **Dependencies**: 47 packages
- **Vulnerabilities**: 0
- **Performance**: 60fps smooth gameplay

---

## 🎨 Design Principles

### CANON (Non-Negotiable)

1. **Non-Coercive Design** - All features optional, player-controlled
2. **Safe Boundaries** - "Stop means stop", immediate pause
3. **Compassionate Messaging** - No shame, only growth
4. **Neurodivergent-First** - Accessibility as foundation, not afterthought
5. **Evidence-Based** - All claims grounded in research
6. **Multiple Intelligences** - Visual, logical, kinesthetic, interpersonal, intrapersonal
7. **Emergent Complexity** - Simple rules × systems = infinite experiences
8. **Cultural Respect** - Traditional wisdom honored, not appropriated

### Ethical Framework

- **Privacy**: Minimal data collection, full transparency
- **Accessibility**: WCAG AAA standards where possible
- **Sustainability**: Energy-efficient code, small bundle size
- **Openness**: MIT licensed, extensible architecture

---

## 🤝 Contributing

We welcome contributions that align with our core mission!

### Areas for Contribution

- 🎮 New gameplay modes (RPG, strategy, cosmology-specific)
- 🧠 Learning modules (language, math, memory)
- 🌱 Recovery tools (impulse buffer, consequence preview)
- 🧘 Dream yoga features (reality checks, body awareness)
- 📚 Documentation improvements
- 🐛 Bug fixes and optimizations
- ♿ Accessibility enhancements

### Development Setup

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

### Code Standards

- ES6+ JavaScript
- Clear comments for expansion points
- Follow existing architecture patterns
- Test thoroughly before submitting
- Update documentation

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Version | 2.0.0 |
| Lines of Code | 6,015 |
| Target LOC | 23,500+ |
| Completion | 26% |
| Gameplay Modes | 2/31+ |
| Features | 21/75 (28%) |
| Documentation | 120KB+ |
| Build Time | 348ms |
| Bundle Size | 22KB gzipped |
| Dependencies | 47 |
| Vulnerabilities | 0 |

---

## 🎯 Success Metrics

### Consciousness Awakening
- Pattern recognition scores improve over sessions
- Emotional awareness tracking shows growth
- Players report increased mindfulness

### Addiction Recovery
- Impulse delay training shows improvement
- Consequence prediction accuracy increases
- Relapse compassion system reduces shame

### Learning Enhancement
- Language learning module scores improve
- Mathematical reasoning scores increase
- Memory test results show gains
- IQ/EQ proxy metrics trend upward

### Dream Yoga
- Reality checks performed in actual dreams
- Dream recall improves over 2 weeks
- Lucid dream frequency increases
- Body awareness scores improve

---

## 🙏 Acknowledgments

### Built With ♥ For

- Consciousness explorers seeking growth
- People in recovery building new patterns
- Neurodivergent individuals navigating unique paths
- Learners enhancing their cognitive capabilities
- Dream yoga practitioners developing awareness

### Research & Inspiration

- Mihaly Csikszentmihalyi (Flow theory)
- Robert Monroe (CIA Gateway Process)
- Stephen LaBerge (Lucid dreaming)
- Eugene Gendlin (Focusing/embodiment)
- Stephen Porges (Polyvagal theory)
- Howard Gardner (Multiple intelligences)
- Lev Vygotsky (Zone of Proximal Development)

### Special Thanks

To all who value:
- Neurodivergent accessibility
- Evidence-based approaches
- Compassionate design
- Personal sovereignty
- Consciousness evolution

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

**Personal project, built with consciousness and care.**

---

## 🔗 Links

- **Repository**: https://github.com/jessidono24-cmyk/glitch-peace-vite
- **Issues**: https://github.com/jessidono24-cmyk/glitch-peace-vite/issues
- **Discussions**: https://github.com/jessidono24-cmyk/glitch-peace-vite/discussions

---

## 🚀 Get Started Now!

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

**Start your consciousness journey today!** 🌌✨

---

**Made with ◈ for consciousness explorers**

*Begin in stillness. Emerge through pattern recognition. Transform through play.*
