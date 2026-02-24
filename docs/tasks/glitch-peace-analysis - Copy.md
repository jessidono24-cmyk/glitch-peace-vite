# GLITCH·PEACE — Dual Repo Analysis & Merge Architecture

## Overview of the Two Repos

### glitch-peace (PRIMARY — the "finished" repo)
- **Status**: v2.4.0 — 100% of original blueprint vision complete
- **Scale**: ~16,500 lines across 57 JS modules
- **Tech**: Vite + vanilla JS + Three.js + Tone.js + Electron
- **Architecture**: Flat module system — files import each other directly
- **Strength**: Deep, battle-tested systems. Everything actually works.
- **Weakness**: Accumulated complexity; no formal plugin/registry pattern; session mgr bugs

### glitch-peace-vite (EXPERIMENTAL — the "clean skeleton" repo)
- **Status**: v1.0 "Base Layer" — only Layer 1 (core gameplay) complete
- **Scale**: ~1,000 lines
- **Tech**: Vite + vanilla JS + Playwright tests
- **Architecture**: Clean layered expansion system with `// 🔌 LAYER N EXPANSION` hooks
- **Strength**: Clean structure, test suite, expansion scaffolding, CANON.md governance doc
- **Weakness**: 95% of glitch-peace features NOT yet built here

---

## What Each Repo Has

### glitch-peace HAS that glitch-peace-vite DOESN'T
| System | Detail |
|--------|--------|
| Emotional Engine | 10-emotion field, valence/arousal/coherence, 7 synergy patterns |
| Temporal System | 8 lunar phases × 7 planetary days |
| Biome System | 8 emotion-driven visual overlays |
| Dream Yoga | Lucidity meter, reality checks, dream sign tracking |
| Boss System | 3 bosses × 3 phases each |
| 18 Dreamscapes | All complete |
| 21 Play Modes | All complete including Rhythm + Nightmare |
| 15 Archetypes | With selector UI |
| RPG System | STR/INT/WIS/VIT, XP, level, quests |
| Alchemy System | 5 elements, Philosopher's Stone, Great Work |
| Constellation Mode | Three.js star field, completion rewards |
| Full Rhythm Mode | 4-column note-fall, beat timing, grades |
| Co-op / Online | WebSocket relay, synergy, revival |
| Cosmologies | 12 frameworks mapped |
| Learning Systems | 19-language vocab, sigils, spaced repetition |
| 3D Layer | Animated sprites, iso view, Three.js boss models, Void Nexus scene |
| Music Engine | Tone.js: drone/pad/melody, 13 emotion maps |
| Steam/Electron | electron-updater, crashreporter, NSIS, gamepad |
| 17 SFX | All procedural audio wired |
| Session Tracking | Urge management, wellness monitor |

### glitch-peace-vite HAS that glitch-peace DOESN'T (or does better)
| Feature | Detail |
|---------|--------|
| Test Suite | Playwright tests in `/tests/` + test-results |
| CANON.md | Formal governance document (design laws) |
| Clean Expansion Hooks | `// 🔌 LAYER N EXPANSION` markers |
| AGENT_TASKS.md | Structured AI coding workflow |
| Tools directory | `/tools/` — build/debug utilities |
| _archive folder | Version history preserved |
| .env.example | Proper env var management |
| Clean SCSS | Structured styling separate from JS |
| ModeRegistry pattern | Plugin-style mode registration (implied by architecture) |

---

## The Core Architecture Scaffold (Both Repos)

Both repos share the same underlying conceptual scaffold. Here it is, extracted:

```
LAYER 0: Bootstrap
  index.html → main.js → game loop (requestAnimationFrame)

LAYER 1: Core Engine
  constants.js   — tile defs, colors, enums, config
  state.js       — single source of truth (CFG, UPG, player state)
  utils.js       — math helpers, RNG, grid helpers
  storage.js     — localStorage save/load

LAYER 2: Game Primitives
  grid.js        — level generation, tile placement
  player.js      — movement, HP, matrix toggle, archetype power
  enemy.js       — AI behaviors (chase, patrol, orbit, adaptive...)
  particles.js   — VFX burst system

LAYER 3: Rendering
  renderer.js    — canvas draw loop, tile rendering, HUD
  menus.js       — title/pause/death/options screens
  [Three.js layer] — 3D overlay, composited over canvas

LAYER 4: Game Modes
  grid-mode.js   — tactical tile-based gameplay
  shooter-mode.js — twin-stick action
  rhythm-mode.js — note-fall music game
  coop-mode.js   — 2-player + online relay
  constellation-mode.js — star-node navigation

LAYER 5: Systems
  emotional-engine.js   — 10-emotion field
  temporal-system.js    — lunar × planetary harmonics
  biome-system.js       — emotion → visual overlay
  play-modes.js         — 21 play style modifiers
  campaign-manager.js   — narrative arc, dreamscape progression

LAYER 6: Subsystems
  dream-yoga.js         — lucidity meter, reality checks
  boss-system.js        — multi-phase boss logic
  alchemy-system.js     — element seeds → transmutation
  rpg-system.js         — STR/INT/WIS/VIT, XP, quests

LAYER 7: Support Systems
  learning/             — vocab, sigils, spaced repetition
  cessation/            — session tracker, urge management
  awareness/            — self-reflection, emergence indicators
  cosmology/            — 12 frameworks, chakra, tarot
  intelligence/         — IQ/EQ proxy metrics

LAYER 8: Output/Platform
  audio/music-engine.js — Tone.js procedural music
  audio/sfx.js          — 17 procedural SFX
  electron/main.js      — desktop wrapper
  server/relay.js       — WebSocket co-op relay
```

---

## The Merge Strategy

The repos aren't really two separate games — they're the same game at radically different completion stages, with glitch-peace-vite being a planned architectural restart that was never fully built.

The goal is **one unified repo** that has:
- All systems from glitch-peace (nothing lost)
- Clean architecture + tests from glitch-peace-vite
- CANON.md governance
- Proper env management and tooling

### Recommended Approach: Transplant & Scaffold

Rather than merging commit histories, the cleanest path is:

**Step 1: Use glitch-peace-vite as the new foundation**
Take its clean scaffold, CANON.md, test suite, tools dir, SCSS, and expansion hook pattern. This is the skeleton.

**Step 2: Migrate glitch-peace systems in layers**
Bring systems over in the exact layer order defined above. Each layer gets its own PR/commit. The `// 🔌 LAYER N EXPANSION` hooks already define exactly where each piece plugs in.

**Step 3: Write tests as you go**
glitch-peace-vite has Playwright already configured. Each migrated system gets tests — something the main repo never had.

---

## Migration Checklist (Layer by Layer)

### ✅ Already in glitch-peace-vite (Layer 1)
- [x] constants.js (6 tile types)
- [x] utils.js
- [x] storage.js
- [x] grid.js
- [x] player.js (basic movement)
- [x] enemy.js (basic chase AI)
- [x] particles.js

### 🔄 Needs Migration — Layer 2 (Expand Core)
- [ ] Expand constants.js → 21 tile types, all enums
- [ ] Expand state.js → CFG, UPG, full player profile
- [ ] Expand grid.js → 18 dreamscape generators
- [ ] Expand player.js → matrix toggle, archetype, alchemy
- [ ] Expand enemy.js → 9 AI behaviors

### 🔄 Needs Migration — Layer 3 (Rendering)
- [ ] renderer.js → full HUD, overlays, biome tinting
- [ ] menus.js → all screens (archetype selector, dreamscape select, etc.)
- [ ] sprite-player.js → animated player
- [ ] three-layer.js → WebGL bridge
- [ ] boss-renderer-3d.js
- [ ] void-nexus-3d.js

### 🔄 Needs Migration — Layer 4 (Modes)
- [ ] grid-mode.js (full)
- [ ] shooter-mode.js
- [ ] rhythm-mode.js (M7)
- [ ] coop-mode.js (M8)
- [ ] constellation-mode.js (M6)
- [ ] play-modes.js (21 modifiers)

### 🔄 Needs Migration — Layer 5 (Systems)
- [ ] emotional-engine.js
- [ ] temporal-system.js
- [ ] biome-system.js
- [ ] campaign-manager.js
- [ ] boss-system.js

### 🔄 Needs Migration — Layer 6 (Subsystems)
- [ ] dream-yoga.js
- [ ] alchemy-system.js
- [ ] rpg-system.js (M5)
- [ ] quest-system.js

### 🔄 Needs Migration — Layer 7 (Support)
- [ ] learning/ (all 4 subsystems)
- [ ] cessation/ (all 3 subsystems)
- [ ] awareness/ (all 3 subsystems)
- [ ] cosmology/ (all 3 subsystems)
- [ ] intelligence/

### 🔄 Needs Migration — Layer 8 (Platform)
- [ ] audio/music-engine.js (Tone.js)
- [ ] audio/sfx.js
- [ ] electron/main.js + preload.js
- [ ] server/relay.js
- [ ] gamepad support

---

## Key Structural Decisions

### 1. One `state.js` to rule them all
Both repos use a central state object. The merged version should have a single, well-typed state schema that every system reads from. glitch-peace has CFG + UPG split — keep that pattern.

### 2. EventBus over direct imports
glitch-peace-vite hints at this with its expansion hooks. The merged repo should introduce a lightweight EventBus (100 lines) so systems like the emotional engine, biome system, and music engine can react to game events without being directly coupled to the game loop.

### 3. ModeRegistry
glitch-peace manages modes ad-hoc. The clean approach: a `ModeRegistry` where each mode registers itself with `{ id, init, tick, render, destroy }`. The main loop just calls the active mode's hooks.

### 4. Keep CANON.md as law
The 11 Design Laws in CANON.md from glitch-peace-vite are not just documentation — they're constraints that every new feature must pass. Make this the governing document.

### 5. test/ coverage targets
Priority test coverage for: state transitions, emotional engine calculations, grid generation determinism, score multiplier math (the most common bug category), and dreamscape progression.

---

## Files That Don't Belong in Either Repo
glitch-peace has many personal documents committed to root (docx files, spiritual practice documents, task files). These should be moved out of the repo entirely — they have no place in game source code and muddy the commit history. A separate private repo or local folder is more appropriate.

---

## Suggested New Repo Structure

```
glitch-peace/  (unified)
├── src/
│   ├── core/              # constants, state, utils, storage
│   ├── game/              # grid, player, enemy, particles
│   ├── rendering/         # renderer, menus, three-layer, sprites
│   ├── modes/             # grid, shooter, rhythm, coop, constellation
│   ├── systems/
│   │   ├── emotional-engine.js
│   │   ├── temporal-system.js
│   │   ├── biome-system.js
│   │   ├── play-modes.js
│   │   ├── campaign-manager.js
│   │   ├── boss-system.js
│   │   ├── alchemy-system.js
│   │   ├── dream-yoga.js
│   │   ├── rpg-system.js
│   │   ├── learning/
│   │   ├── cessation/
│   │   ├── awareness/
│   │   └── cosmology/
│   ├── audio/             # music-engine, sfx
│   └── intelligence/
├── electron/              # desktop wrapper
├── server/                # relay.js
├── tests/                 # Playwright test suite
├── tools/                 # build/debug utilities
├── public/sfx/
├── docs/                  # research docs only
├── CANON.md               # Design laws (inviolable)
├── AGENT_TASKS.md         # AI coding workflow
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

