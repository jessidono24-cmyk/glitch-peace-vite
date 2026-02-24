# Wiring Audit — 2026-02-24

Performed after: MODES2 + FEEDBACK1 + BOT1 complete.
Task ref: `docs/tasks/task-WIRE1.md`

---

## CATEGORY A: Imports Never Used

Found in `src/main.js` — imported but never called within the file.
The symbols may be used inside the exporting module itself or in other
files that import them directly; the main.js import is the dead one.

| Symbol | Source module | Status |
|--------|--------------|--------|
| `LANGUAGES` | `systems/learning/language-system.js` | **Removed** — `menus.js` imports its own copy |
| `DREAMSCAPE_COSMOLOGY` | `systems/cosmology/cosmologies.js` | **Removed** — used only inside `cosmologies.js` itself |
| `BOSS_TYPES` | `systems/boss-system.js` | **Removed** — used only inside `boss-system.js` |
| `QUEST_DEFS` | `systems/rpg/quest-system.js` | **Removed** — used only inside `quest-system.js` |
| `campaignStory` | `modes/campaign-story.js` | **Removed** — singleton never called from `main.js`; reserved for NARRATIVE1 |
| `TAROT_ARCHETYPES` | `systems/cosmology/tarot-archetypes.js` | **Removed** — reserved for COSMOLOGY1 |
| `getRandomArchetype` | `systems/cosmology/tarot-archetypes.js` | **Removed** — reserved for COSMOLOGY1 |

All removals confirmed: build passes, module count dropped from 1040 → 1038.

---

## CATEGORY B: Exports Never Imported

The following symbols are exported from their source files but never
imported by any other file in `src/`. They are internal-use exports or
reserved for future tasks.

| Symbol | Source | Notes |
|--------|--------|-------|
| `GAME_MODES`, `MODE_DREAMSCAPES`, `MAIN_MENU_N` | `ui/menus.js` | Used only inside menus.js or by index.html |
| `ARCHITECTURE_SUBMODES`, `LEARNING_HUB_DISCIPLINES` | gameplay-modes | Internal to each mode |
| `ELEMENTS` (alchemy) | `systems/alchemy-system.js` | Internal |
| `BREATH_PATTERNS` | `systems/cessation/urge-management.js` | Internal |
| Various `render*` helpers | `systems/integration/` | Consumed by the dashboard module only |
| `GridMode`, `GameStateManager`, `InputManager` | various | Scaffolding; reserved for future refactor |

No removals needed — these are intentional module-level exports for
future consumers or internal helpers.

---

## CATEGORY C: window._ Set But Never Read

All `window._X` globals set in `src/main.js` and cross-checked against
`src/ui/renderer.js`, `src/ui/menus.js`, `src/ui/hud.js`, and
`src/systems/integration/progress-dashboard.js`.

| Variable | Set in | Previously read in | Status |
|----------|--------|-------------------|--------|
| `window._rhythmTimeToNext` | `main.js:1023` | nowhere | **Wired** — beat countdown text added to HUD in `renderer.js` |
| `window._moveSpeedMPS` | `main.js:1195` | nowhere | **Wired** — pace stat added to pause-menu session line in `menus.js` |
| `window._emergenceAllTime` | `main.js:1390` | `progress-dashboard.js` ✓ | Already wired (dashboard only) |
| `window._chakraAwakened` | `main.js:1392` | `progress-dashboard.js` ✓ | Already wired |
| `window._trackerData` | `main.js:1398` | `progress-dashboard.js` ✓ | Already wired |
| `window._dreamscapesThisSession` | `main.js:1403` | `progress-dashboard.js` ✓ | Already wired |
| `window._campaignTotal` | `main.js:1441` | `progress-dashboard.js` ✓ | Already wired |
| `window._tutorialHints` | `main.js:1435` | nowhere directly | Acceptable — consumed indirectly via `window._currentTutorialHint` |

All others (`_emotionField`, `_dreamYoga`, `_tmods`, `_sessionPatterns`,
`_questData`, `_alchemy`, `_iqData`, etc.) were already read in the
renderer or menus before this audit.

---

## CATEGORY D: Stubs / TODOs

| Location | Content |
|----------|---------|
| `src/systems/play-modes.js:90` | `// 11. CO-OP — Shared emotional field (placeholder — Phase M8)` |

Single entry. The co-op play-mode config is marked as a placeholder.
No code path reaches it during normal play; deferred to Phase M8.

---

## CATEGORY E: Systems Not Ticked in Loop

All constructed singletons checked against the game loop. Every system
that has a `tick()` or `update()` method is called:

| System | Called |
|--------|--------|
| `emotionalField` | `.decay()` + `.getDominantEmotion()` each frame ✓ |
| `dreamYoga` | `.tick(dt)` ✓ |
| `alchemySystem` | `.tick()` ✓ |
| `emergenceIndicators` | `.tick()` ✓ |
| `biomeSystem` | `.update(dt)` ✓ |
| `chakraSystem` | `.update()` + `.tick()` ✓ |
| `characterStats` | `.tick()` ✓ |
| `archetypeDialogue` | `.tick()` ✓ |
| `bossSystem` | `.update()` (conditional on `game.boss`) ✓ |
| `questSystem` | `.tick()` ✓ |
| `sessionTracker` | `.tick()` ✓ |
| `urgeManagement` | `.tick()` ✓ |
| `logicPuzzles` | `.tick()` ✓ |
| `strategicThinking` | `.tick?.()` ✓ |
| `empathyTraining` | `.tick?.()` ✓ |
| `emotionRecognition` | `.tick()` + `.observe()` ✓ |
| `sigilSystem` | `.tick()` ✓ |
| `vocabularyEngine` | `.tick()` ✓ |
| `patternRecognition` | `.tick()` + `.checkScore()` ✓ |
| `achievementSystem` | `.tick(dt)` ✓ |
| `spritePlayer` | `.tick(dt)` ✓ |
| `adaptiveDifficulty` | No `tick()` needed — settings-only object ✓ |
| `archetypeBot` | `.tick(ts, game)` — grid path only (see Category H) |

No unticked systems found.

---

## CATEGORY F: Dead or Broken Game Loop Branches

All GAME_MODES IDs from `src/ui/menus.js` checked against the loop:

| Mode ID | Loop handling | Issue |
|---------|--------------|-------|
| `grid-classic` | Fell through to grid renderer silently | **Fixed** — `gameMode` now normalised to `'grid'` in `_startSelectedMode()` |
| `fps` | `if (gameMode === 'fps')` ✓ | None |
| `rpg` | `if (gameMode === 'rpg')` ✓ | None |
| `ornithology` | `if (gameMode === 'ornithology')` ✓ | None |
| `mycology` | `if (gameMode === 'mycology')` ✓ | None |
| `architecture` | `if (gameMode === 'architecture')` ✓ | None |
| `constellation` | `NON_GRID_MODES` ✓ | None |
| `alchemy` | `if (gameMode === 'alchemy')` ✓ | None |
| `rhythm` | `NON_GRID_MODES` ✓ | None |
| `learning_hub` | `if (gameMode === 'learning_hub')` ✓ | None |
| `language_learning` | `if (gameMode === 'language_learning')` ✓ | None |

Extra modes (`shooter`, `meditation`, `coop`) are accessible only via
campaign or direct code paths; they are not in the public GAME_MODES
list and are all covered by the `NON_GRID_MODES` branch.

---

## CATEGORY G: HUD Data Never Displayed

Checked `window._emotion*`, `window._purg*`, `window._lucid*`,
`window._tmods*`, `window._shooter*`, `window._session*`:

| Data | Display location | Status |
|------|-----------------|--------|
| `_emotionField` realm/coherence/valence | `renderer.js` drawHUD ✓ | Wired |
| `_dreamYoga` lucidity % | `renderer.js` drawHUD LUC bar ✓ | Wired |
| `_purgDepth` | `renderer.js` purgDepth bar ✓ | Wired |
| `_tmods` lunarName / planetName | `renderer.js` header text ✓ | Wired |
| `_shooterState` | `menus.js` pause header ✓ | Wired |
| `_sessionWellness` / `_sessionDuration` | `menus.js` pause stats ✓ | Wired |
| `_sessionPatterns` | `menus.js` pause patterns line ✓ | Wired |
| `_moveSpeedMPS` | was unread | **Wired** — added to pause session line |

---

## CATEGORY H: Event Handlers Never Called

| Handler | Defined in | Called from main.js |
|---------|-----------|---------------------|
| `characterStats.onInsightCollect()` | `character-stats.js:43` | Line 1127 ✓ |
| `characterStats.onPatternDiscovered()` | `character-stats.js:44` | Via `logicPuzzles.onPatternDiscovered()` → characterStats not wired directly — deferred |
| `characterStats.onMindfulMove()` | `character-stats.js:45` | Line 1120 ✓ |
| `characterStats.onPauseUsed()` | `character-stats.js:46` | Line 2067 ✓ |
| `characterStats.onFreezeUsed()` | `character-stats.js:47` | Line 2106 ✓ |
| `characterStats.onContainmentUsed()` | `character-stats.js:48` | Line 2141 ✓ |
| `characterStats.onHazardSurvived()` | `character-stats.js:49` | Line 1133 ✓ |
| `characterStats.onEmbodimentTile()` | `character-stats.js:50` | Line 1128 ✓ |
| `characterStats.onDreamComplete()` | `character-stats.js:51` | Line 696 ✓ |
| `archetypeBot.tick()` | `archetype-bot.js` | Grid path only (line 1513) — not called for NON_GRID_MODES |
| `archetypeBot.onTileEvent()` | `archetype-bot.js:94` | Grid path only (line 1083) — not called for NON_GRID_MODES |

**`archetypeBot` gap**: The bot tick and tile events are wired only in
the grid-mode path. Non-grid modes (shooter, constellation, meditation,
coop, rhythm) receive no bot messages. Deferred to WIRE1-FOLLOWUP as the
bot uses `game.ds?.name` and `game._recentTiles` which are undefined in
non-grid contexts.

---

## PRIORITY ORDER FOR FIXING

### P1 (blocks gameplay — fixed in this pass)
- [x] `grid-classic` gameMode not normalised → fixed: `gameMode = 'grid'` added to `_startSelectedMode()`

### P2 (data tracked but invisible — fixed in this pass)
- [x] `window._rhythmTimeToNext` — wired to beat-countdown text in `renderer.js`
- [x] `window._moveSpeedMPS` — wired to pace display in pause menu `menus.js`

### P3 (dead code cleanup — fixed in this pass)
- [x] Removed 7 unused named imports from `src/main.js`
  - `LANGUAGES`, `DREAMSCAPE_COSMOLOGY`, `BOSS_TYPES`, `QUEST_DEFS`
  - `campaignStory`, `TAROT_ARCHETYPES`, `getRandomArchetype`

### Deferred (WIRE1-FOLLOWUP)
- [ ] `archetypeBot.tick()` for non-grid modes (needs null-safe `g` wrapper)
- [ ] `characterStats.onPatternDiscovered()` not wired to pattern detection events
- [ ] CO-OP play-mode placeholder (Phase M8)
- [ ] `window._tutorialHints` direct display (currently only `_currentTutorialHint` is used)

---

## Verification

Build passes: `npm run build` — 1038 modules transformed (down from 1040
before unused-import removal).

All GAME_MODES IDs have explicit or documented loop handling.

Next scheduled audit: Monday 2026-03-02 09:00 UTC (see `.github/workflows/wiring-audit.md`).
