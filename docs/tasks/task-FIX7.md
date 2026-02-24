# Task FIX7 — Rewrite README to Reflect Actual Current State

## Goal
The README.md still shows "BASE LAYER v1.0" with a 6-tile, simple-chase-AI
description. This is completely wrong and misleads anyone who clones the
repo. Rewrite it to accurately reflect what the game actually is and does
right now, with a live changelog section that gets updated as features complete.

## Definition of Done
- [ ] README accurately describes the current game (not base layer v1.0)
- [ ] All implemented features listed with ✅
- [ ] Broken/in-progress features listed with 🔧
- [ ] Planned features listed with 📋
- [ ] Changelog section exists and will be updated per task going forward
- [ ] Clone + run instructions are correct and complete
- [ ] No mention of "BASE LAYER v1.0" or the old 6-tile description

## Scope — touch ONLY this file
- `README.md`

---

## Full README content to write:

```markdown
# GLITCH·PEACE

**A consciousness-awakening game disguised as a puzzle-action experience.**

Begin in stillness. Emerge through pattern recognition.

> v2.0-alpha | February 2026 | JavaScript + Vite

---

## What This Is

GLITCH·PEACE is a multi-modal browser game built around four interlocking
purposes:

1. **Consciousness emergence** — meta-awareness through interactive play
2. **Addiction cessation support** — gentle stress inoculation, no shame spirals
3. **Learning acceleration** — embodied language and pattern recognition
4. **Intelligence enhancement** — IQ and EQ development through gameplay

It is not a simple game. It is a consciousness engine that looks like a game.

---

## Quick Start

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

Opens at `http://localhost:3000`

---

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| SHIFT | Toggle Matrix A/B |
| J | Archetype power |
| X | Alchemy transmutation |
| Y | Acknowledge reality check |
| H | Integration dashboard |
| ESC | Pause |

---

## What's Currently Implemented ✅

### Core Gameplay
- ✅ 17 tile types with full rendering
- ✅ 10 dreamscapes with unique behaviors and emotional themes
- ✅ 5 archetypes with power system (Dragon, Child Guide, Orb, Captor-Teacher, Protector)
- ✅ Matrix A/B toggle (Coherence vs Erasure)
- ✅ Enemy AI (wander, patrol, orbit, chase, adaptive, predictive, rush, scatter)
- ✅ Boss system with 3-phase transitions and special attacks
- ✅ Fibonacci peace scaling
- ✅ Upgrade shop (insight token economy)
- ✅ Full HUD (HP, energy, matrix, score, level, combo, emotion, coherence)
- ✅ Particle system (burst, resonance wave, trail, echo)
- ✅ Mobile controls (d-pad)
- ✅ Save/load + high scores
- ✅ Full-screen responsive canvas

### Game Modes
- ✅ Grid Roguelike (consciousness navigation)
- ✅ Twin-stick Shooter
- ✅ Constellation (2D + Three.js 3D)
- ✅ Rhythm mode
- ✅ Meditation mode
- ✅ Local Co-op
- 🔧 RPG Mode (NPC dialogue, 18×18 map) — wiring in progress

### Consciousness Systems (Wired)
- ✅ Emotional Field (10 emotions, synergies, distortion)
- ✅ Temporal System (8 lunar phases, 7 planetary days)
- ✅ Biome System (emotion-driven visual overlays)
- ✅ Dream Yoga (lucidity tracking, reality checks)
- ✅ Alchemy System (5 elements, transmutation, Philosopher's Stone)
- ✅ Achievement System (26 achievements, popup notifications)
- ✅ Emergence Indicators (8 awakening signs)
- ✅ Self-Reflection (dreamscape-specific prompts on interlude)
- ✅ Integration Dashboard (H key — live IQ/EQ/lucidity/emergence view)
- ✅ Impulse Buffer (hazard prevention)
- ✅ Consequence Preview (3-move ghost path)
- ✅ Session Tracker + Urge Management
- ✅ Chakra System
- ✅ Tone.js ambient music

### Intelligence Systems (Wired)
- ✅ Emotion Recognition (EQ tracking, flash labels)
- ✅ Empathy Training (enemy stun → compassion phrases)
- ✅ Logic Puzzles (IQ tracking)
- ✅ Strategic Thinking (decision quality scoring)

### Rendering
- ✅ Animated SpritePlayer (breathing, directional lean, hit flash)
- ✅ Campaign Manager (first-visit tutorial hints)
- ✅ 3D VoidNexus dreamscape (Three.js)
- ✅ Procedural SFX (Web Audio API, no files needed)

---

## In Progress 🔧

- 🔧 RPGMode full wiring (generateGrid export)
- 🔧 Research integration (psychology/neuroscience applied to systems)
- 🔧 Leaderboard (Supabase — needs credentials)
- 🔧 AI procedural content (needs server + API keys)

---

## Planned 📋

- 📋 Ornithology game mode (independent, non-grid)
- 📋 Mycology game mode (independent, non-grid)
- 📋 Narrative/RPG standalone mode
- 📋 First-person shooter mode
- 📋 Godot rebuild for 3D graphics fidelity
- 📋 Online co-op
- 📋 Steam integration

---

## Design Laws (CANON)

1. No shame spirals — relapse ≠ failure
2. Sterilized wisdom — no dogma, simulation framing only
3. Player identity is stable — cyan/white never changes
4. Accessibility first — reduced motion, high contrast always available
5. Hearth is always reachable — pause anytime, no data loss
6. Embodiment maximized — learning through body, action, experience
7. Effortless by design — align with natural cognition
8. Sovereign codex compliance — individual sovereignty always respected

See `CANON.md`, `SOVEREIGN_CODEX.md`, `EMBODIMENT.md` in docs/ for full principles.

---

## Project Structure

```
src/
├── main.js                    # Game loop, state machine
├── core/                      # Constants, state, utils, storage
├── game/                      # Grid, player, enemy, particles
├── modes/                     # ModeManager + all game modes
├── gameplay-modes/            # Extended mode implementations
├── systems/                   # Emotional engine, temporal, biome,
│                              # alchemy, dream-yoga, achievements,
│                              # boss, emergence, self-reflection
├── intelligence/              # Emotion recognition, empathy,
│   ├── cognitive/             # logic puzzles, strategic thinking
│   └── emotional/
├── recovery/                  # Impulse buffer, consequence preview,
│                              # session tracker, urge management
├── audio/                     # SFX manager (procedural Web Audio)
└── ui/                        # Renderer, menus
docs/                          # CANON, ARCHITECTURE, SOVEREIGN_CODEX,
                               # EMBODIMENT, research foundations
```

---

## Changelog

### 2026-02-20
- Full-screen responsive canvas (FIX1)
- Gameplay-modes directory wired into ModeManager (FIX2)
- Duplicate src/ui/ tree removed (FIX3)
- Minimum font size 10px enforced everywhere (FIX4)
- RPGMode generateGrid export (FIX5)
- _archive excluded from Vite scan (FIX6)

### Earlier (2026-02-19 to 2026-02-20)
- All W/S/I/R/D tasks completed (EventBus, all consciousness systems wired,
  intelligence systems wired, SpritePlayer, CampaignManager, Dashboard)
- Emotional engine, temporal system, impulse buffer, consequence preview,
  SFX manager all wired (E1-E4, T1-T2, Phase 4-5)

---

## License

MIT — Personal project, all rights reserved.

---

**Made with ◈ for consciousness explorers**
```

## Verification
View README on GitHub main page — it should now accurately describe the game.

## Commit message
```
docs: FIX7 rewrite README -- accurate current state, changelog, full feature list
```
