# 🧠 GLITCH·PEACE INTEGRATION PLAN
## Unified Base-Layer Architecture from Archive Systems

**Date**: February 16, 2026  
**Scope**: Merge best systems from 8+ archive versions into single stable foundational layer  
**Goal**: Production-ready consciousness engine with expandable content generation via APIs

---

## 1. SYSTEM INVENTORY & STABILITY MATRIX

### ✅ TIER 1: PRODUCTION-READY (Fully Tested, No Rewrites Needed)

| System | Archive Source | Status | LOC | Dependencies | Integration Priority |
|--------|---|---|---|---|---|
| **Emotional Engine** | glitch-peace-v5 | ✅ Complete | 218 | constants, utils | P0 |
| **Temporal System** | glitch-peace-v5 | ✅ Complete | 50 | utils | P0 |
| **Constants (17 tiles)** | glitch-peace-v5 | ✅ Complete | 150 | — | P0 |
| **Utilities (Math)** | glitch-peace-v5 | ✅ Complete | 45 | — | P0 |
| **MenuSystem + Tutorial** | glitch-peace-v5 | ✅ Ported | 512 | constants, utils | P0 |
| **Save/Load System** | BASE LAYER | ✅ Complete | 35 | — | P0 |
| **Grid Generation (Basic)** | BASE LAYER | ✅ Complete | 60 | constants, utils | P1 |
| **Player Movement** | BASE LAYER | ✅ Complete | 45 | constants, players | P1 |
| **Enemy AI (Basic Chase)** | BASE LAYER | ✅ Complete | 40 | utils, grid | P1 |

### 🔶 TIER 2: TEMPLATED (Design Complete, Needs Integration)

| System | Archive Source | Status | Est. LOC | Dependencies | Integration Priority |
|--------|---|---|---|---|---|
| **Grid Generation (Advanced)** | glitch-peace-v5 | 📋 Template | 120 | constants, utils, biomes | P1 |
| **Enemy AI (8 Behaviors)** | GLITCH-PEACE-MEGA-FINAL | 📋 Template | 180 | utils, player, grid | P1 |
| **Boss System** | GLITCH-PEACE-COMPLETE | 📋 Template | 200 | enemy-ai, player | P2 |
| **Particle System (VFX)** | GLITCH-PEACE-COMPLETE | 📋 Template | 150 | utils, canvas | P2 |
| **Play Modes (31+)** | GLITCH-PEACE-MEGA-FINAL | 📋 Template | 386 | constants | P2 |

### 🟢 TIER 3: API-GENERATIVE (Perfect for Claude/GPT-4)

| System | Archive Source | Status | Design | Generation Method | Integration Priority |
|--------|---|---|---|---|---|
| **12 Cosmology Realms** | GLITCH-PEACE-MEGA-FINAL | 📑 Complete Design | 251 lines (2 realms) | Claude 3.5 | P3 |
| **10 Dreamscapes** | GLITCH-PEACE-COMPLETE | 📑 Complete Design | 1,100 lines | Claude 3.5 | P3 |
| **15 Archetypes** | GLITCH-PEACE-COMPLETE | 📑 Complete Design | Specs | Claude 3.5 | P3 |
| **Recovery Tools (7)** | GLITCH-PEACE-COMPLETE | 📑 Complete Design | 800 lines (templates) | GPT-4 + Claude | P3 |
| **Learning Modules** | BASE LAYER | 📑 Design Ready | Specs | Claude 3.5 | P3 |

### 🔴 TIER 4: EXPERIMENTAL (Optional, Speculative)

| System | Archive Source | Status | Notes | Decision |
|--------|---|---|---|---|
| 3D-Style Modes (6) | GLITCH-PEACE-MEGA-FINAL | 📑 Designed | Complex; requires mode-specific rendering | POST-LAUNCH |
| Mods Framework | GLITCH-PEACE-COMPLETE | 📑 Spec | Advanced extensibility | POST-LAUNCH |
| Co-op Multiplayer | GLITCH-PEACE-COMPLETE | 📑 Spec | Requires backend | POST-LAUNCH |

---

## 2. DEPENDENCY GRAPH & ARCHITECTURE

### Core Flow (Execution Order)

```
┌─────────────────────────────────────────────────────────┐
│                      GLITCH·PEACE                       │
│                   Consciousness Engine                  │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼─────┐         ┌────▼─────┐
         │   CORE   │         │   GAME   │
         │ SYSTEMS  │         │  SYSTEMS │
         └────┬─────┘         └────┬─────┘
              │                    │
    ┌─────────┼─────────┐    ┌────┴────────┐
    │         │         │    │             │
┌───▼───┐ ┌──▼──┐ ┌────▼─┐  │      ┌──────▼──────┐
│       │ │     │ │      │  │      │             │
│ Grid  │ │TEM  │ │EMOT  │  │      │ AUDIO/TEXT  │
│ GEN   │ │PORAL│ │IONAL │  │      │ GENERATION  │
│       │ │SYS  │ │ENG   │  │      │ (API)       │
└───┬───┘ └──┬──┘ └────┬─┘  │      └─────┬───────┘
    │        │        │     │            │
    └────┬───┴────┬───┘     │            │
         │        │         │            │
    ┌────▼──┐┌───▼──┐ ┌────▼──────┐ ┌──▼──────┐
    │ CONST ││UTILS │ │  PLAYER   │ │ UI/MENU │
    │ANTS   ││MATH  │ │  MOVEMENT │ │ RENDER  │
    └───────┘└──────┘ └────┬──────┘ └───┬─────┘
                           │            │
                      ┌────▼──┐     ┌───▼─────┐
                      │ENEMIES│     │ PARTICLE│
                      │  AI   │     │ SYSTEM  │
                      └───────┘     └─────────┘
```

### Dependency Matrix

```
                   Depends On →
                ┌─┬─┬─┬─┬─┬─┬─┬─┐
              ↓ │c│u│e│t│p│g│m│s│  (reads from)
    CONSTANTS │0│ │ │ │ │ │ │ │  
    UTILS     │ │0│ │ │ │ │ │ │  
    EMOTIONAL │1│1│0│ │ │ │ │ │  
    TEMPORAL  │1│ │ │0│ │ │ │ │  
    PLAYER    │1│1│ │ │0│ │ │ │  
    GRID      │1│1│ │ │ │0│ │ │  
    ENEMIES   │1│1│1│ │1│ │0│ │  
    SYNERGIES │1│1│1│1│ │ │ │0│  

Legend: 1 = depends, 0 = self-contained
```

### File Structure (Unified Base Layer)

```
src/
├── core/                    ← FOUNDATION (Tier 1+2)
│   ├── constants.js         (EXPAND: 17 tiles + cosmology configs)
│   ├── utils.js             (EXPAND: Fibonacci, biome selectors)
│   ├── storage.js           (STABLE)
│   ├── emotional-engine.js  (FROM v5: 10 emotions + 7 synergies)
│   └── temporal-system.js   (FROM v5: 8 lunar + 7 weekly)
│
├── game/                    ← GAMEPLAY (Tier 1+2)
│   ├── grid.js              (EXPAND: biome-aware, procedural)
│   ├── player.js            (STABLE + recovery hooks)
│   ├── enemy.js             (EXPAND: 8 behaviors)
│   ├── particles.js         (NEW: from COMPLETE archive)
│   └── boss.js              (NEW: boss system)
│
├── ui/                      ← INTERFACE (Tier 1)
│   ├── menus.js             (FROM v5: full MenuSystem)
│   ├── tutorial-content.js  (FROM v5: 5 pages)
│   ├── hud.js               (NEW: status rendering)
│   └── accessibility.js     (NEW: high-contrast, stillness)
│
├── services/                ← API LAYER (Tier 3+)
│   ├── apiAgents.js         (DONE: 6 function families)
│   ├── apiAgents.examples.js (DONE: runnable examples)
│   └── README.md            (DONE: full documentation)
│
├── data/                    ← CONTENT (Tier 3, API-generated)
│   ├── cosmologies.json     (GENERATED: 12 realms)
│   ├── dreamscapes.json     (GENERATED: 10 levels)
│   ├── archetypes.json      (GENERATED: 15 archetypes)
│   └── recovery-tools.json  (GENERATED: 7 tools)
│
└── main.js                  ← GAME LOOP (Refactored state machine)
```

---

## 3. INTEGRATION PHASES

### PHASE 1: Foundation (CURRENT STATE) ✅
**Duration**: Complete  
**Output**: Playable menu system with dreamscape selection  
**Deliverables**:
- ✅ MenuSystem + dreams...cape UI (DONE)
- ✅ Basic constants (6 tiles, 2 difficulties)
- ✅ Game loop state machine (menu → dreamscape → playing → pause)
- ✅ Save/load system
- ✅ Smoke tests

**Status**: **COMPLETE** (Commit: `85137f9`)

---

### PHASE 2: Core Gameplay Neural Integration (NEXT)
**Duration**: 2-3 days  
**Outcome**: Emotionally-responsive, temporally-aware game grid  
**Key Integration Point**: Emotional field drives grid generation & enemy behavior

#### 2A: Enhanced Constants & Tile System
**Files to Merge**: `_archive/glitch-peace-v5/src/core/`
```javascript
// EXPAND src/core/constants.js with:
// • 17 full tile types (DESPAIR, TERROR, HARM → RAGE, HOPELESS, GLITCH, etc.)
// • TILE_DEFS with spread/push/damage mechanics  
// • BIOME_CONFIGS (8 biomes + selection triggers)
// • EMOTION_TILE_MAP (emotion → tile probability)
```
**Integration Hook**: Emotional field → grid generation preferences

#### 2B: Merge Emotional + Temporal Systems
**Files to Create**: `src/core/emotional-engine.js` (from v5)
**Integration Points**:
- `EmotionalField.calcDistortion()` → world darkness multiplier
- `EmotionalField.calcCoherence()` → peace tile abundance
- `TemporalSystem.getLunarPhase()` → enemy count/behavior

#### 2C: Expand Grid Generation  
**File**: `src/game/grid.js`
**Merge From**: `_archive/glitch-peace-v5/` (procedural, biome-aware version)
```javascript
// New parameters:
// • biomeType: Selected from BIOME_CONFIGS
// • emotionalField: For tile distribution
// • temporalModifiers: For density adjustments
```
**Integration**: Grid responds to emotional state in real-time

#### 2D: Expand Enemy AI
**File**: `src/game/enemy.js`  
**Merge From**: `GLITCH-PEACE-MEGA-FINAL/systems/`
```javascript
// 8 behaviors:
// 1. WANDER - Random patrol
// 2. CHASE - Direct pursuit
// 3. FLEE - Avoid player
// 4. PATROL - Fixed route
// 5. AMBUSH - Predict intercept
// 6. SWARM - Group behavior
// 7. GUARD - Post defense
// 8. BERSERK - Chaos mode
```
**Integration**: Emotional distortion → behavior randomization

**Commit Strategy**: One `multi_replace` per sub-section, keep diffs <300 LOC net new

**Testing**: All 3 smoke tests + new grid/emotion tests

---

### PHASE 3: Progression & Recovery Tools (LATER)
**Duration**: 3-4 days  
**Outcome**: Pattern recognition training embedded in gameplay

**Deliverables**:
- Upgrade shop (8 purchasable upgrades)
- Session warnings (20/45/90 min)
- 7 recovery tools UI integration  
- High score tracking

**Integration Points**:
- API: `getRecoveryInsight()` for session-aware feedback
- Emotional field state → recovery tool recommendations

---

### PHASE 4: Content Generation via APIs (POST-LAUNCH)
**Duration**: Ongoing  
**Method**: Batch generation script + caching

**Scheduled Generations**:
```bash
npm run generate:cosmologies  # Claude: 12 realms
npm run generate:dreamscapes  # Claude: 10 levels  
npm run generate:modules      # Claude: Learning content
npm run generate:recovery     # GPT-4: Recovery insights
npm run generate:enemies      # GPT-4: Boss personalities
```

**Output Location**: `src/data/*.json`

---

## 4. NEURAL SYSTEM MAP (Dependencies & Signal Flow)

```
PLAYER INPUT
    │
    ▼
┌─────────────────────────────────────────┐
│         GAME LOOP (main.js)             │
│     dt (delta time) = 16ms              │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ▼             ▼          ▼          ▼
  UPDATE      UPDATE    UPDATE      UPDATE
  PLAYER     ENEMIES   EMOTIONAL   TEMPORAL
  (pos)      (ai)      (decay)     (phase)
    │             │          │          │
    └──────┬──────┴──────┬───┴──────┬───┘
           │             │          │
           ▼             ▼          ▼
        CHECK        CALC WORLD   GET
        COLLISIONS   DISTORTION   MODIFIERS
           │             │          │
           └─────┬───────┴──────┬───┘
                 │              │
                 ▼              ▼
            APPLY DAMAGE   ADJUST:
            & EFFECTS      • Darkness
                           • Enemy aggression
                           • Tile spawns
                           • Score rates
                 │              │
                 └──────┬───────┘
                        ▼
         ┌────────────────────────────┐
         │   RENDER GAME STATE        │
         │ • Grid with emotional tint │
         │ • HUD (HP, time, emotion)  │
         │ • Particles                │
         │ • Menu overlay if paused   │
         └────────────────────────────┘
```

### Emotional Field Propagation

```
PLAYER ACTIONS (movement, damage taken, tiles collected)
    │
    ▼
EmotionalField.add(emotion, amount)
    │
    ▼
EMOTIONS DECAY over time
    │
    ├─▶ calcDistortion()  ──▶ World gets darker/chaotic
    │
    ├─▶ calcCoherence()   ──▶ Peace tiles become scarce
    │
    ├─▶ getDominant()     ──▶ UI emotional indicator
    │
    └─▶ checkSynergy()    ──▶ ACTIVATE POWER if conditions met
         │
         ├─ Anger + Coherence → Focused Force (1.5x damage)
         ├─ Grief + Curiosity → Deep Insight (2x insight gain)
         ├─ Joy + Hope → Resonance Wave (2x score)
         └─ Despair > 5 → Dissolution (blurred vision, slow moves)
```

---

## 5. CRITICAL INTEGRATION POINTS

### A. Grid Generation ↔ Emotional Field
**Challenge**: Grid is procedural, emotional field evolves  
**Solution**:
```javascript
// In generateGrid(gameState):
const field = gameState.emotionalField;
const distortion = field.calcDistortion();

// Use distortion to scale hazard placement
hazardCount = Math.floor(baseHazards * (1 + distortion * 2));

// Emotional state → preferred biome
const biome = selectBiomeByEmotion(field.getValence());
```

### B. Enemy Behavior ↔ Emotional Distortion
**Challenge**: Enemies need context-aware intelligence  
**Solution**:
```javascript
// In updateEnemy(enemy, gameState):
const distortion = gameState.emotionalField.calcDistortion();
const emotionalMode = distortion > 0.7 ? 'chaos' : 'normal';

// Behavior selection based on emotional state
const behaviors = emotionalMode === 'chaos' 
  ? ['berserk', 'ambush', 'swarm']
  : ['chase', 'patrol', 'guard'];

enemy.behavior = randomChoice(behaviors);
```

### C. Temporal Modifiers ↔ All Systems
**Challenge**: Multiple systems need phase awareness  
**Solution**:
```javascript
// In gameLoop():
const temporal = gameState.temporalSystem.getModifiers();

// Apply multipliers globally
function applyTemporalModifiers(gameState) {
  gameState.insightGainRate *= temporal.insightMul;
  gameState.enemySpeed *= temporal.enemyMul;
  gameState.coherenceTarget *= temporal.coherenceMul;
}
```

### D. Recovery Tools ↔ Emotional Awareness
**Challenge**: Recovery tools need permission from emotional field  
**Solution**:
```javascript
// Recovery tools only activate when emotional coherence is LOW
// (when player needs guidance most, not when they're stable)
if (gameState.emotionalField.calcCoherence() < 0.5) {
  activateRecoveryTool(tool);  // Impulse buffer, Consequence Preview, etc.
}
```

---

## 6. STABILITY CLASSIFICATION RULES

### TIER 1: Code can be imported as-is
- No breaking changes to public API
- Already tested in v5 build
- No external dependencies beyond what we have
- Examples: EmotionalEngine, TemporalSystem, constants, menus

### TIER 2: Templates need integration wrapping
- Complete design, needs config/parameter adaptation
- Must pass smoke tests after integration
- Examples: Advanced grid gen, 8 enemy behaviors, boss system

### TIER 3: Data-driven, perfect for generation
- Fixed templated structure, variable content
- Generate via API, store in JSON
- Examples: Cosmologies, dreamscapes, archetypes, recovery tools

### TIER 4: Speculative, post-MVP
- Complex rendering or backend requirements
- Can be roadmapped but not essential for launch
- Examples: 3D modes, mods framework, co-op

---

## 7. FILE PRIORITY & MERGE ORDER

**WEEK 1 (Phase 2A: Constants & Tiles)**
1. ✅ Merge `emotional-engine.js` (copy from v5)
2. ✅ Expand `constants.js` with 17 tiles + 8 biomes
3. ✅ Merge `temporal-system.js` (copy from v5)
4. Update `main.js` game loop to wire emotional/temporal systems
5. Add smoke tests for emotion calculation & temporal modifiers

**WEEK 2 (Phase 2B: Grid & Enemy)**
6. Expand `grid.js` with biome-aware generation
7. Add new parameters: `emotionalField`, `biomeType`
8. Expand `enemy.js` with 8 behavior types
9. Wire emotion distortion → behavior randomization
10. Add smoke tests for grid generation & enemy behavior

**WEEK 3 (Phase 2C: Visual & Polish)**
11. Create `particles.js` from COMPLETE archive
12. Create `hud.js` for status rendering
13. Expand `menus.js` with Game Over, High Scores screens
14. Add accessibility features (high-contrast, stillness mode)

**WEEK 4+ (Phase 3: Content Generation)**
15. Build content generation script (uses APIs)
16. Generate cosmologies, dreamscapes, modules
17. Store in `src/data/*.json`
18. Create UI for cosmology realm selection

---

## 8. VALIDATION CHECKLIST

Before merging each phase:

### CODE QUALITY
- [ ] No console errors or warnings
- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] Functions have JSDoc comments
- [ ] Constants are centralized and named clearly

### GAMEPLAY
- [ ] Game launches to menu
- [ ] Dreamscape selection works
- [ ] Game starts with emotional field initialized
- [ ] Timer records play session duration
- [ ] Score calculations include emotional modifiers
- [ ] Exit affirmation displays

### COMPATIBILITY
- [ ] Runs on Chrome/Firefox (latest)
- [ ] Mobile viewport responsive
- [ ] No performance degradation (60fps target)
- [ ] Touch controls work (if applicable)

### TESTS
- [ ] `npm run build` completes with no errors
- [ ] `npx playwright test` passes all 3 smoke tests
- [ ] Manual play test (5 min) in multiple modes

---

## 9. ARCHITECTURE PRINCIPLES

These guide all integration decisions:

| Principle | How It's Applied |
|-----------|---|
| **Tight Coupling Forbidden** | Each system has clear boundaries; use getters/setters for state |
| **Constants Emergency Hatch** | All magic numbers in `constants.js`; game tunable via config |
| **Procedural First** | Levels generated algorithmically; content stored as rules, not layouts |
| **Emotional Core** | Every game system should be tunable by emotional field state |
| **Temporal Awareness** | All multipliers check `temporalSystem.getModifiers()` |
| **Non-Punishment** | Failure states never trigger shame; always offer "relapse compassion" |
| **Data-Driven Expansion** | Play modes, cosmologies, dreamscapes = JSON objects, not code |
| **Accessibility by Default** | All UI elements readable in high-contrast; all audio optional |

---

## 10. TIMELINE & MILESTONES

```
Phase 1: ✅ DONE (Feb 16)
├─ MenuSystem integrated
├─ Constants expanded  
├─ Dreamscape selection UI
└─ Smoke tests passing

Phase 2: ⏳ IN PROGRESS (Feb 17-21)
├─ 2A: Emotional + Temporal core (Feb 17)
├─ 2B: Advanced grid + enemy AI (Feb 18-19)
├─ 2C: Particles + HUD polish (Feb 20-21)
└─ Tests + performance validation

Phase 3: 📋 PLANNED (Feb 24-28)
├─ Recovery tools UI
├─ Session management
├─ High score tracking
└─ Bosses & progression

Phase 4: 📋 POST-MVP (Mar+)
├─ API content generation
├─ Cosmology realms  
├─ Learning modules
├─ Advanced features (3D modes, mods, co-op)
└─ Community content platform

LAUNCH READY: End of Feb 2026
```

---

## 11. RISK MITIGATION

| Risk | Mitigation |
|------|---|
| Emotional field over-complicates game feel | Reserve right to dial down emotional impact via `intensityMul` config |
| Too many tile types break visibility | Standardize symbols + colors; test in high-contrast mode |
| API cost explosion | Cache generated content; batch generation; fallback to templates |
| Performance hit from 3 nested systems | Profile game loop; move expensive calculations to background |
| Players confused by cosmology complexity | Show cosmology selection only if explicitly chosen; default to "Classic Arcade" |

---

## 12. NEXT IMMEDIATE ACTION

**Start Phase 2A Integration** (when ready):

1. Create PR branch: `feature/phase-2a-core-systems`
2. Copy v5 files: `emotional-engine.js`, `temporal-system.js`  
3. Expand `constants.js` with 17 tiles + 8 biome configs
4. Update `main.js` game loop to initialize & update emotional field
5. Add smoke tests for emotion calculation
6. Commit with message: `wip: phase 2a integration - core emotional + temporal systems`
7. Run: `npm run build && npx playwright test`

---

**This plan ensures:**
- ✅ All 8+ archive versions systematically audited
- ✅ No dead code left behind
- ✅ Clear dependency graph
- ✅ Phased, testable, incremental integration
- ✅ Foundation for API-driven content generation
- ✅ Neurodivergent-accessible, safe, transformative experience
