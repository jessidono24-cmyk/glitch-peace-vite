# GLITCH·PEACE — AGENT_TASKS.md
## Task Queue for VS Code Agent

> Read CANON.md first. Then pick ONE task. Commit after each task passes.
> Never edit constants.js tile IDs or player colors without explicit instruction.

---

## ✅ COMPLETE (Base Layer v4)

- [x] Vite project structure
- [x] All 17 tile types with full rendering
- [x] 10 dreamscapes with unique behaviors
- [x] 5 archetypes with power system
- [x] Matrix A/B toggle
- [x] Enemy AI (wander, patrol, orbit, chase_fast, adaptive, predictive, rush, scatter, labyrinth)
- [x] Boss system (level 6+ on summit/integration)
- [x] Particle system (burst, resonance wave, trail, echo)
- [x] Fibonacci peace scaling
- [x] Upgrade shop (8 upgrades, insight token economy)
- [x] Full HUD (HP, energy, matrix, score, level, combo)
- [x] Menu system (title, options, dreamselect, pause, dead, interlude, shop)
- [x] Save/load + high scores
- [x] Mobile controls (d-pad)
- [x] Hallucinations (level 3+)
- [x] Environment events (gravity shift, loop reset, rapid spawn, etc.)
- [x] Tile spread (despair/hopeless spread)

---

## 🔲 PHASE 2 — Emotional Engine

### Task E1: Create `src/systems/emotional-engine.js`
```
10 base emotions: awe, grief, anger, curiosity, shame, tenderness, fear, joy, despair, hope
Each has: { valence, arousal, coherence }
Functions:
  - addEmotion(name, amount)
  - decayEmotions(dt, coherenceMul)
  - getDominant() → string
  - getDistortion() → 0-1
  - getCoherence() → 0-1
  - getValence() → -1 to 1
  - getSynergy() → null | 'FOCUSED_FORCE' | 'CHAOS_BURST' | 'DEEP_INSIGHT' | etc.
Export: class EmotionalField
```

### Task E2: Wire EmotionalField into main.js
```
- Import EmotionalField
- Instantiate at game start
- Call addEmotion from player.js tile interactions (already stubbed with setEmotion calls)
- Call decayEmotions(dt, coherenceMul) in game loop
- Export field reference for HUD
```

### Task E3: Add Emotional HUD row to renderer.js
```
Below energy bar, show:
- Dominant emotion name (colored by type)
- Coherence bar (blue)
- Distortion bar (red/orange)
- Synergy label if active (gold, pulsing)
```

---

## 🔲 PHASE 3 — Temporal System

### Task T1: Create `src/systems/temporal-system.js`
```
8 lunar phases with: { name, insightMul, enemyMul, fogRadius, description }
7 weekday harmonics with: { planet, coherenceMul, themes[] }
Functions:
  - getCurrentPhase() → phase object
  - getCurrentDay() → day object
  - getModifiers() → { enemyMul, insightMul, coherenceMul }
Export: singleton TemporalSystem
```

### Task T2: Wire temporal modifiers into game loop
```
- enemy spawn speed scaled by enemyMul
- insight token value scaled by insightMul  
- emotion decay scaled by coherenceMul
- Show phase/day name in HUD footer
```

---

## 🔲 PHASE 4 — Pattern Recognition Tools

### Task P1: Create `src/recovery/impulse-buffer.js`
```
- When player moves toward a hazard tile, start a 1-second hold timer
- Show progress bar
- Instant move for safe tiles
- Cancel if player releases key
```

### Task P2: Create `src/recovery/consequence-preview.js`
```
- Ghost path 3 moves ahead in current direction
- Show projected HP change
- Only while holding move key (not yet released)
```

---

## 🔲 PHASE 5 — Audio

### Task A1: Create `src/audio/sfx-manager.js`
```
Using Web Audio API (no external libraries):
- peace_collect: chime arpeggio
- damage: harsh buzz
- matrix_switch: tone shift
- level_complete: chord
- enemy_hit: thud
All sounds procedural (oscillators), no files required.
```

---

## ⚠️ RULES FOR AGENT

1. **One task at a time.** Finish, test, commit, then move on.
2. **Never duplicate imports.** Check what's already exported from constants.js before adding new ones.
3. **No new state in main.js** — add to state.js then import.
4. **Test the title screen first** — if title doesn't render, nothing else works.
5. **Walls must be visible** — if walls go invisible, check `T.WALL` → `TILE_DEF[5]` mapping.
6. **Commit message format:** `feat: [task id] description` e.g. `feat: E1 emotional engine`
