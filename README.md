# 🌌 GLITCH·PEACE

**A consciousness simulation / roguelike built with Vite — v4 Vite Edition**

[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/jessidono24-cmyk/glitch-peace-vite)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](https://nodejs.org/)

> *Begin in stillness. Emerge through pattern recognition. Transform through play.*

---

## 🚀 Quick Start

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev        # opens http://localhost:3000
```

---

## 🎮 What Is GLITCH·PEACE?

GLITCH·PEACE is a **consciousness engine** disguised as a game — a Vite + vanilla-JS browser game combining roguelike gameplay with psychological techniques for awareness, recovery, and learning. One persistent consciousness engine drives every mode.

### Architecture (ARCH1-5)

```
CAMPAIGN (10-chapter life progression)
  └── GAME MODES  (symbolic universes, each with own rules + aesthetics)
        ├── Grid Roguelike · Shooter · RPG/Narrative
        ├── Constellation · Rhythm · Meditation
        ├── Alchemy · Ornithology · Mycology · Architecture
              └── DREAMSCAPES (symbolic environments per mode)
                    └── COSMOLOGIES (Hindu/Norse/Hermetic/Tarot/Buddhist)
                          └── PLAYSTYLES (Balanced/Lucid/Warrior/Sage/Healer/Explorer)
                                └── ONE CONSCIOUSNESS ENGINE
                                      (emotional field + temporal + emergence +
                                       dream yoga + alchemy — always running,
                                       never resets on mode switch)
```

---

## 🕹️ Gameplay Modes

| Mode | Description |
|------|-------------|
| 🗂️ Grid Classic | Tactical tile navigation — original roguelike |
| 🔫 Shooter | Fast-paced arena combat, wave survival |
| ⚔ RPG Adventure | Dialogue trees, character stats, named zones, quest log |
| 🦅 Ornithology | Observe birds, answer challenges |
| 🍄 Mycology | Forage mushrooms, identify species |
| 🏛 Architecture | Place tiles, design structures (SPACE/Q/E) |
| ✦ Constellation | Connect star nodes, meditative puzzle |
| ⚗ Alchemy | Collect elements, transmute at Athanor |
| 🎵 Rhythm | Move to beat tiles, build streak |
| 🌌 Constellation 3D | Three.js WebGL 3D starfield + nebula |

---

## 🧠 Core Systems

| System | What it does |
|--------|-------------|
| **Emotional Field** | 10 emotions; distortion, realm tints, synergy multipliers |
| **Temporal System** | Real-world lunar phase + planetary day → enemy/insight modifiers |
| **Dream Yoga** | Lucidity meter, body scan tiles, dream sign tracking, reality checks |
| **Adaptive Difficulty** | SPROUT through NIGHTMARE; auto-adjusts to player performance |
| **Campaign Manager** | 10-chapter life progression, tutorial hints, dreamscape unlocks |
| **Cosmologies** | Hindu/Norse/Hermetic/Tarot/Buddhist flavour layers |
| **Play Modes** | Balanced/Lucid/Warrior/Sage/Healer/Explorer playstyle modifiers |
| **Achievement System** | Persistent achievements across sessions |
| **Music Engine** | Tone.js procedural ambient score tied to emotional state |
| **Language Learning** | 16-language progressive vocabulary on INSIGHT tiles |
| **RPG Stats** | Strength/Wisdom/Empathy/Resilience/Clarity grow with play |

---

## ⌨️ Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| J | Activate Archetype Power |
| R | Fire Glitch Pulse |
| SHIFT | Toggle Matrix A (erasure) ↔ B (coherence) |
| U | Upgrade Shop |
| I | Toggle isometric 3D tilt |
| M | Switch to Shooter mode |
| ESC | Pause |

---

## 🔧 Development

```bash
npm run dev          # Vite dev server (localhost:3000)
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

**Stack:** Vite 7, vanilla JS ES modules, Canvas 2D, Three.js (3D mode), Tone.js (music), Matter.js (physics in shooter)

---

## 📁 Repository Structure

```
src/
├── core/          constants, state, storage, event-bus, utils
├── game/          grid, player, enemies, particles
├── ui/            renderer, menus, HUD
├── rendering/     sprite-player, 3D layers
├── systems/       temporal, emotional, dream-yoga, cosmologies, difficulty, campaign...
├── modes/         mode-manager, grid-mode, shooter, constellation, meditation, rhythm
├── gameplay-modes/ alchemy, architecture, mycology, ornithology, rpg, grid-based
├── intelligence/  cognitive + emotional training modules
├── audio/         music-engine, sfx-manager
└── recovery/      impulse-buffer, consequence-preview
```

---

## 📜 Changelog

### 2026-02-20
- [FIX4] 10px minimum font floor in renderer.js (F constants) and menus.js
- [FIX5] Export `generateGrid` from grid.js; register RPGMode in ModeManager
- [FIX6] `_archive/` properly excluded from Vite and added to .gitignore
- [FIX7] README rewritten to reflect actual v4 Vite Edition state
- [ARCH1] Navigation hierarchy: Mode → Dreamscape → Cosmology → Playstyle
- [ARCH2] One consciousness engine persists across all mode switches
- [ARCH3] Campaign mode: 10-chapter life progression (campaign-story.js)
- [ARCH4] Local timezone offset setting for temporal systems
- [ARCH5] Research tuning applied to emotional, temporal, and difficulty systems

---

## 📄 License

MIT — free forever.

*Made with ◈ for consciousness explorers everywhere.*
