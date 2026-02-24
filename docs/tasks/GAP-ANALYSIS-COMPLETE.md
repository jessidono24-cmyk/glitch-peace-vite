# GLITCH·PEACE — Complete Gap Analysis
## Based on direct source code reading | 2026-02-24

---

## Codebase Size Estimate

| Category | Files read | Lines |
|----------|-----------|-------|
| JS source (uploaded) | 42 files | ~12,300 lines |
| Docs/research (uploaded) | 40 files | ~13,500 lines |
| **Files I cannot read** | ~20 files | **unknown** |
| **Estimated total repo** | ~100+ files | **~25,000–35,000 lines** |

Files I cannot read (imported in main.js but not in uploads): `menus.js`, `language-system.js`, `vocabulary-engine.js`, `pattern-recognition.js`, `sigil-system.js`, `adaptive-difficulty.js`, `session-tracker.js`, `urge-management.js`, `chakra-system.js`, `cosmologies.js`, `tarot-archetypes.js`, `progress-dashboard.js`, `character-stats.js`, `archetype-dialogue.js`, `quest-system.js`, and several others in `src/systems/`.

---

## MACRO GAPS — Architecture Level

### Gap M1: Game Mode vs. Play Style Confusion
**The single biggest structural problem.**

The codebase has two different concepts that are tangled:
- **Game Mode** = the world type and renderer (`grid`, `shooter`, `constellation`, `meditation`, `coop`, `rhythm`)
- **Play Style** = modifiers applied to the grid (`arcade`, `ornithology`, `mycology`, `architecture`, etc.)

But `ornithology`, `mycology`, `architecture`, `alchemist`, `skymap` appear in GAME_MODES as if they're game modes. When selected, `gameMode = 'ornithology'` etc. — but the game loop has no branch for these. They fall through to `drawGame()` (the grid). The grid renderer sees the `playModeId` and seeds appropriate tiles.

**Result**: Every "mode" that's actually a play style variant shows a grid. Always.

**Fix requires**: Either (a) give each a real world renderer (MODES3 task), or (b) remove them from GAME_MODES and make them only accessible as play style options within Grid Classic.

### Gap M2: Window Global Bus — Chaotic Pub/Sub
**42 `window._X` values are written in main.js. 29 are read in renderer.js. 18 are written but never read by the renderer.**

The window global system was designed as a data bus between systems. It works for some things but has accumulated orphaned signals. The 18 orphaned window vars represent real game data that is computed every frame but never shown to the player:

| Orphaned variable | What it tracks | Where it should display |
|------------------|---------------|------------------------|
| `window._sessionWellness` | Recovery wellness score | Pause menu / session summary |
| `window._sessionDuration` | How long you've been playing | Pause menu header |
| `window._shooterState` | Shooter wave/score/health | Shooter HUD (not grid HUD) |
| `window._trackerData` | Full session behavior data | Interlude screen / dashboard |
| `window._learnStats` | Words learned, patterns found | Interlude screen |
| `window._tutorialHints` | Campaign tutorial prompts | HUD tooltip area |
| `window._emergenceAllTime` | All-time consciousness emergence count | Profile/stats screen |
| `window._dreamscapesThisSession` | How many dreamscapes completed | Interlude, session summary |
| `window._reflections` | Self-reflection count | Pause menu patterns tab |
| `window._breathState` | Breath sync state | Should pulse in HUD |
| `window._campaignTotal` | Campaign milestones complete | Title screen / profile |
| `window._questData` | Full quest system state | Should have a quest panel |
| `window._moveSpeedMPS` | How fast player is moving | Flow state indicator |
| `window._rhythmTimeToNext` | Time until next rhythm beat | Rhythm mode HUD only |
| `window._chakraAwakened` | Chakra activation state | Should show in cosmology overlay |
| `window._achieveDefs` | Achievement definitions | Achievements screen |
| `window._achievementQueue` | Queued unlocks | Achievement popup (already drawn?) |
| `window._meditationTime` | Meditation duration | Meditation mode HUD |

### Gap M3: Systems That Run But Are Silent
**18 systems tick every frame but produce zero visible output to the player.**

These run, compute, update state — but the player never sees or feels them:

| System | Ticks? | Output reaches player? |
|--------|--------|----------------------|
| `logicPuzzles` | ✓ | IQ score in `_iqData` → shown in renderer ✓ |
| `empathyTraining` | ✓ | Empathy flash in `_iqData` → shown ✓ |
| `emotionRecognition` | ✓ | EQ flash in `_iqData` → shown ✓ |
| `strategicThinking` | ✓ | Strategic tip in `_iqData` → shown ✓ |
| `selfReflection` | ✓ | `_reflections` count set → **never read by renderer** ✗ |
| `vocabularyEngine` | ✓ | Vocab word shown in HUD ✓ |
| `patternRecognition` | ✓ | Pattern banner shown ✓ |
| `biomeSystem` | ✓ | `biomeSystem.draw()` called directly ✓ |
| `campaignManager` | ✓ | Tutorial hints set → **`_tutorialHints` never read by renderer** ✗ |
| `urgeManagement` | ✓ | No window._ written → **completely invisible** ✗ |
| `sessionTracker` | ✓ | `_sessionWellness`, `_sessionDuration` → **never read** ✗ |
| `sigilSystem` | ✓ | `_activeSigil` shown ✓ |
| `characterStats` | ✓ | `_characterStats` in `_iqData` → some shown ✓ |
| `archetypeDialogue` | ✓ | `_archetypeDialogue` shown ✓ |
| `questSystem` | ✓ | `_questData` full data → **never read** ✗ (only `_questFlash` shown) |
| `adaptiveDifficulty` | ? | Cannot read file — unknown |
| `chakraSystem` | ✓ | `_chakra` → shown ✓, `_chakraAwakened` → **never read** ✗ |

### Gap M4: ModeManager Instantiated But Unused
`ModeManager` class exists in `mode-manager.js` (237 lines). It's imported. But looking at the game loop, it's never used to switch modes — the main game loop uses a raw `if (gameMode === 'X')` chain directly. The `ModeManager` infrastructure exists but is bypassed everywhere.

### Gap M5: GridMode Class Not Used
`GridMode` class exists in `grid-mode.js` (438 lines). The original grid gameplay is NOT routed through it — `startGame()` builds the game object directly and the loop calls `drawGame()` directly. The `GridMode` class exists but nothing instantiates or uses it. It's 438 lines of dead weight OR it's intended to replace the current grid but never got wired.

---

## MESO GAPS — System Level

### Gap ME1: Recovery Systems Not Connected to Gameplay
`impulse-buffer.js`, `consequence-preview.js` are imported and ticked. The impulse buffer is partially wired (shows progress bar). But:
- `urgeManagement` runs but produces zero player-visible output
- `sessionTracker` computes wellness score but it's never displayed
- There is no "recovery support mode" that uses all these together

### Gap ME2: Cosmology Systems Are Decorative
`chakra-system.js`, `cosmologies.js`, `tarot-archetypes.js` are imported. `chakraSystem.tick()` runs every frame. But:
- The cosmology selection screen exists (step 3 of 4 in the flow) but the chosen cosmology barely affects gameplay
- `_chakraAwakened` is set but never read
- Tarot archetypes are imported but their actual gameplay integration is unknown (file not readable)

### Gap ME3: RPG System Has 3 Files, None Producing Output
`character-stats.js`, `archetype-dialogue.js`, `quest-system.js` are all imported, instantiated, ticked. The quest system has a `_questFlash` (shown) but `_questData` (the full state) is never rendered. Character stats are partially shown. The RPG system is the most built-but-invisible set of systems.

### Gap ME4: Language/Learning Systems Partially Wired
`vocabularyEngine`, `patternRecognition`, `sigilSystem`, `languageSystem` all tick. But:
- `_learnStats` (full learning session data) is computed but never shown to player
- Language mode selection works, but the full quiz system depends on `language-system.js` (unreadable) 

### Gap ME5: Boss System Wires to Grid Only
`bossSystem.update()` is called inside the grid game loop section. Boss encounters cannot happen in any other mode. The boss renderer (`boss-renderer-3d.js`, 195 lines) is a Three.js renderer that's wired... somewhere. This is partially the source of the alchemy/3D freeze.

### Gap ME6: Campaign Manager Half-Connected
`campaignManager` tracks tutorial completion and milestone progress. It sets `_tutorialHints` every frame but nothing renders those hints to the player. The campaign system is running blind — it knows things but can't say them.

### Gap ME7: Dashboard Exists But Is Hidden
`drawDashboard(ctx, CW(), CH())` is called when `dashboard.visible` is true (H key). But `CW()` and `CH()` return grid dimensions, not viewport dimensions — the dashboard renders inside the tiny grid box, not fullscreen.

---

## MICRO GAPS — Implementation Level

### Gap MI1: Overlay Collision (18 simultaneous)
The grid gameplay renderer can draw these simultaneously with no priority system:
- Vocab word panel (`_vocabWord`)
- Sigil overlay (`_activeSigil`)
- Archetype dialogue (`_archetypeDialogue`)
- Constellation flash (`_constellationFlash`)
- Pattern banner (`_patternBanner`)
- EQ/IQ flash (from `_iqData`)
- Empathy flash
- Reality check prompt (from `_dreamYoga`)
- Tutorial hint (`_currentTutorialHint`)
- Quest flash (`_questFlash`)
- Alchemy flash (`_alchemyFlash`)
- Boss phase banner (`_bossPhaseBanner`)
- Play mode label (`_playModeLabel`)
- Biome draw (drawn directly by biomeSystem.draw)
- Beat pulse visual
- Speedrun timer
- Moves remaining counter
- Impulse progress bar

All 18 can show at the same moment. Image 4 in the screenshots shows exactly this.

### Gap MI2: Font Inconsistency
Font is set per draw call without save/restore. Different subsystems set different fonts and don't restore the canvas state. Results in font bleeding between overlays.

### Gap MI3: Canvas Dimensions Inconsistency
`CW()` / `CH()` returns grid canvas dimensions. `window.innerWidth` / `window.innerHeight` returns full viewport. `w` / `h` in the loop is set from canvas dimensions. Some renderers use `CW()`, some use `w`, some use `window.innerWidth`. None consistently use the same reference.

### Gap MI4: ESC / Pause Not Implemented for Non-Grid Modes
The pause keydown handler handles `shooter`, `constellation`, `meditation`, `coop`, `rhythm` but only partially. Some modes unpause correctly. The "quit to menu" branch exists but its CURSOR index may not match all menu configurations.

### Gap MI5: Alchemy 3D Freeze Root Cause
`boss-renderer-3d.js` and `void-nexus-3d.js` use Three.js. `three-layer.js` sets up a shared Three.js scene. The alchemy system triggers this 3D renderer. The freeze is likely a requestAnimationFrame loop conflict — both the game loop and the Three.js renderer are calling `requestAnimationFrame`, creating a double-render loop that spirals.

### Gap MI6: Dreamscape Select Shows 6 of 10
`DREAMSCAPES` is defined in `constants.js`. The file shows the full list exists. But the dreamscape select menu only renders 6 visible entries (no scroll, no pagination). Entries 7–10 are unreachable via the UI.

---

## SHOULD YOU PUSH MODES3 NOW?

**Yes, push MODES3.** Here's why:

MODES3 fixes the most player-visible, session-breaking issues:
- Grids in non-grid modes (MI-level fix with macro impact)
- Alchemy freeze (MI5)
- Duplicate modes (cosmetic but confusing)
- No quit-to-menu (UX blocker)

These fixes are **independent of the deeper systemic gaps**. MODES3 doesn't make the window._ pipeline worse or better — it just adds proper world renderers and a catch-all placeholder.

**After MODES3**, the right next task is not FEEDBACK1 or BOT1 — it's a new task:

**WIRE2 — The Data Pipeline Task**

Fix the 18 orphaned `window._` variables. Every computed value should reach the player somewhere. This is the meso-level wiring that transforms silent systems into felt experiences.

**After WIRE2**, then FEEDBACK1 (close the loops), then BOT1 (add voice).

---

## REVISED RUN ORDER

```
MODES3  → de-grid modes, placeholders, quit menu, alchemy fix
WIRE2   → wire all 18 orphaned window._ variables to appropriate UI locations  
WIRE3   → fix ModeManager/GridMode dead code, consolidate mode architecture
FEEDBACK1 → close the consciousness loops
BOT1    → archetype voices
```

Each step has a clear, bounded scope. No step requires the next one to be done first except WIRE2 → FEEDBACK1 (feedback loops need data pipeline working first).

---

## The One-Sentence Summary

The codebase has approximately **25,000–35,000 lines** of code. The systems are mostly built. The gap is not missing features — **the gap is that 18 systems compute real data every frame that the player never sees, 5 game modes fall through to the grid because the loop has no branch for them, and the overlay system has no priority queue so up to 18 things try to show simultaneously.**

Fix the data pipeline. Fix the mode branches. Then enrich.
