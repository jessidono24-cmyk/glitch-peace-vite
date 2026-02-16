# Integration Map: Archive → Current Codebase

## Top 8 Reusable Modules (Priority)

### 1. **MenuSystem** (`_archive/glitch-peace-v5/src/ui/menus.js`)
- **What**: Full menu system with title, pause, options, tutorial, credits screens
- **Status**: Archive has complete implementation with multi-screen navigation
- **Current overlap**: main.js has basic MENU state but no structured MenuSystem
- **Merge priority**: **FIRST** — integrate before dreamscape selection
- **Why**: Menu navigation is foundational for all other screens

### 2. **Tutorial Content** (`_archive/glitch-peace-v5/src/ui/tutorial-content.js`)
- **What**: Structured tutorial pages with game rules, legend, colors, difficulty guide
- **Status**: Ready to integrate, no conflicts
- **Current overlap**: None in current codebase
- **Merge priority**: **HIGH** — integrates with MenuSystem.tutorial screen
- **Why**: supports onboarding and accessibility guidance

### 3. **Enhanced Constants** (`_archive/glitch-peace-v5/src/core/constants.js`)
- **What**: More complete tile definitions (17 tile types vs 6), difficulty configs, grid sizes, player colors
- **Status**: Superset of current constants.js
- **Current overlap**: Basic TILE_TYPES exist; archive version is much richer
- **Merge priority**: **HIGH** — merge gradually to avoid diff shock
- **Why**: Supports rich tile variety and difficulty scaling

### 4. **Emotional Engine** (`_archive/glitch-peace-v5/src/core/emotional-engine.js`)
- **What**: Player emotional state tracking (hope, fear, peace, glitch) with decay/growth
- **Status**: Archive only
- **Current overlap**: None
- **Merge priority**: **MEDIUM** — after core menu, before full gameplay loop
- **Why**: Emotional state is core GLITCH·PEACE mechanic (from CANON.md)

### 5. **Temporal System** (`_archive/glitch-peace-v5/src/core/temporal-system.js`)
- **What**: Time-based progression, epoch tracking, temporal buffs/debuffs
- **Status**: Archive only
- **Current overlap**: None
- **Merge priority**: **MEDIUM** — supports progression systems
- **Why**: Manages game pacing and long-form progression

### 6. **Grid Generation** (`_archive/glitch-peace-v5/src/game/grid.js`)
- **What**: Procedural level generation with difficulty scaling, sector-based placement
- **Status**: Archive has full algorithm; current version exists but simpler
- **Current overlap**: current/game/grid.js exists (basic version)
- **Merge priority**: **HIGH for gameplay loop** — after menus but core to level generation
- **Why**: Direct game loop dependency

### 7. **Player Mechanics** (`_archive/glitch-peace-v5/src/game/player.js`)
- **What**: Enhanced player state (position, health, recovery, ability tokens)
- **Status**: Current version is basic; archive is more feature-rich
- **Current overlap**: current/game/player.js exists
- **Merge priority**: **HIGH for gameplay loop** — tight to grid/game loop
- **Why**: Core gameplay mechanic

### 8. **Dreamscape Definitions** (MISSING in v5 archive)
- **What**: Dreamscape-specific modifiers, tile pools, difficulty curves per dreamscape
- **Status**: v5 has empty `/dreamscapes` folder; COMPLETE archive may have data structure
- **Current overlap**: None in current codebase
- **Merge priority**: **NEXT SLICE** (after menu + basic selection frame) — support menu selection UI
- **Why**: Enables different game modes/themes (core CANON concept)

---

## Merge Strategy

### Phase 1 (This Task): Menu + Dreamscape Selection Scaffold
- [x] A) Repo hygiene (done)
- [ ] B) Integrate MenuSystem to current main.js
- [ ] C) Integrate tutorial-content.js  
- [ ] D) Add "Dreamscape Select" screen (2+ placeholder dreamscapes)
- [ ] E) Update Playwright smoke test
- Target: Keep `npm run dev` working, all tests pass

### Phase 2 (Next): Gameplay Loop
- Integrate enhanced constants.js (tile defs, difficulty)
- Merge grid.js (procedural generation)
- Merge player.js (mechanics)
- Add emotional engine state tracking

### Phase 3: Progression & Depth
- Temporal system (epochs, pacing)
- Dreamscape-specific rules
- Recovery mechanics (accessibility)
- Cosmologies/meta-progression

---

## Ignored / Not in Top 8

- **Matter.js / Three.js** (physics, 3D rendering): Ship without 3D initially
- **Mega versions** in `_archive/GLITCH-PEACE-MEGA-FINAL/`: Reference only, likely duplicate/expanded experiments
- **Build artifacts** in version folders: Just scaffolding experiments

