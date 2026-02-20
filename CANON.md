# GLITCH·PEACE — CANON.md
## The Permanent Source of Truth

> This document defines what is real in the project. When in doubt, refer here.

---

## 1. IDENTITY

- **Player color:** WHITE (#ffffff) outline, CYAN (#00e5ff) core — NEVER changes
- **Player symbol:** ◈
- **Game name:** GLITCH·PEACE (with middle dot)
- **Version:** v4 (Vite modular edition)

---

## 2. BASE LAYER (COMPLETE — DO NOT BREAK)

These files are the working foundation. Every expansion builds on them.

| File | Purpose |
|------|---------|
| `src/main.js` | State machine, game loop, input |
| `src/core/constants.js` | All tile types, colors, archetypes, dreamscapes |
| `src/core/state.js` | Runtime state, upgrades, phase |
| `src/core/utils.js` | Math helpers |
| `src/core/storage.js` | Save/load |
| `src/game/grid.js` | Grid generation, Fibonacci scaling |
| `src/game/player.js` | Movement, tile interactions, archetype powers |
| `src/game/enemy.js` | All AI behaviors |
| `src/game/particles.js` | VFX |
| `src/ui/renderer.js` | Canvas draw (game world + HUD) |
| `src/ui/menus.js` | Title, options, pause, dead, interlude, shop |

---

## 3. TILE TYPES (17)

```
VOID DESPAIR TERROR SELF_HARM PEACE WALL INSIGHT HIDDEN
RAGE HOPELESS GLITCH ARCHETYPE TELEPORT COVER TRAP MEMORY PAIN
```

---

## 4. DREAMSCAPES (10, in order)

1. VOID STATE
2. MOUNTAIN DRAGON REALM
3. MOUNTAIN COURTYARD OF OJOS
4. LEAPING FIELD
5. MOUNTAIN SUMMIT REALM
6. CHILDHOOD NEIGHBORHOOD
7. MODERN BEDROOM GUNFIGHT
8. AZTEC/MAYAN CHASE
9. ORB ESCAPE EVENT
10. DREAMSCAPE INTEGRATION

---

## 5. ARCHETYPES (5 base)

- DRAGON — wall_jump (J)
- CHILD GUIDE — reveal hidden tiles
- ORB/SHEEP — phase_walk through walls (J)
- CAPTOR-TEACHER — rewind last 3 moves (J)
- PROTECTOR — shield burst (J)

---

## 6. MATRIX SYSTEM

- **Matrix B (green):** Coherence — default, slower enemies, energy recharges
- **Matrix A (red):** Erasure — faster enemies, energy drains, damage amplified
- Toggle: SHIFT key

---

## 7. FIBONACCI PEACE SCALING

Peace nodes per level: `fibonacci(level + 2)` → 3, 5, 8, 13, 21, 34…

---

## 8. EXPANSION ROADMAP

### Phase 2 (Next)
- Emotional engine (10 emotions, synergies, field state)
- Temporal system (8 lunar phases, 7 weekday harmonics)
- Emotional HUD (dominant emotion, coherence, distortion bars)

### Phase 3
- Pattern recognition tools (7 recovery systems)
- Session manager (cessation machine)

### Phase 4
- Cosmology integration (Hindu Chakras first)
- Additional dreamscapes

### Phase 5+
- Audio engine, archetype fusion, multiplayer

---

## 9. DESIGN LAWS (never violate)

1. **No shame spirals** — relapse ≠ failure
2. **Sterilized wisdom** — no dogma, no metaphysical claims, simulation framing only
3. **Player identity is stable** — cyan/white never changes regardless of matrix
4. **Accessibility first** — reduced motion, high contrast, particle toggle always available
5. **Hearth is always reachable** — pause anytime, save on pause, no data loss
6. **Embodiment maximized** — learning through body, action, and experience (see EMBODIMENT.md)
7. **Effortless by design** — align with natural cognition, not against it (see EFFORTLESS_LEARNING.md)
8. **Sovereign codex compliance** — all research and features respect individual sovereignty (see SOVEREIGN_CODEX.md)
