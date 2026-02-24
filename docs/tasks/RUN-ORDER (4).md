# GLITCH·PEACE — Master Run Order
## Updated: 2026-02-24 (post full gap analysis)

---

## ✅ COMPLETED

| Task | What it did |
|------|-------------|
| ARCH1 | Viewport/canvas fix, ModeManager wiring |
| RESEARCH-LANG1 | Language learning research doc |
| LANG1a | FSRS scheduler + language content data layer |
| LANG1b | Language mode + wiring into main.js/menus.js |
| MODES2 | Mode launch fixes (partial) |
| WIRE1 | Full wiring audit (36 minutes ago per GitHub) |

---

## 🔲 RUN ORDER — Correct Sequence

```
STEP 1:  task-MODES3.md     → de-grid modes, placeholders, quit-to-menu, alchemy fix
STEP 2:  task-WIRE2.md      → wire 18 orphaned window._ vars to UI (not yet written)
STEP 3:  task-WIRE3.md      → fix dead ModeManager/GridMode, consolidate architecture
STEP 4:  task-FEEDBACK1.md  → close consciousness loops (needs data pipeline first)
STEP 5:  task-BOT1.md       → archetype voices (needs stable modes + loops)
```

See GAP-ANALYSIS-COMPLETE.md for full explanation of why this order.

---

## STEP 1 — MODES3 (Push This Now)

**File:** `docs/tasks/task-MODES3.md`
**Branch:** `fix/modes3-degrid`

Fixes:
- Ornithology → free-space 2D world (birds float, no grid)
- Mycology → graph/node network (no grid)
- RPG/Architecture/etc → styled full-screen placeholders (NOT a grid)
- Duplicate constellation + shooter entries removed
- Alchemy freeze → error boundary added
- Quit to Main Menu added to pause
- Options "ARCH4" label → "TIMEZONE"

---

## STEP 2 — WIRE2 (Write After MODES3 Merges)

**18 orphaned window._ variables** — computed every frame but never shown to player:

| Variable | Should display in |
|----------|------------------|
| `_sessionWellness` | Pause menu header |
| `_sessionDuration` | Pause menu header |
| `_shooterState` | Shooter mode HUD |
| `_trackerData` | Interlude screen |
| `_learnStats` | Interlude screen |
| `_tutorialHints` | HUD tooltip |
| `_emergenceAllTime` | Stats/profile screen |
| `_dreamscapesThisSession` | Interlude |
| `_reflections` | Pause patterns tab |
| `_breathState` | HUD breath indicator |
| `_campaignTotal` | Title screen |
| `_questData` | Quest panel overlay |
| `_moveSpeedMPS` | Flow state indicator |
| `_rhythmTimeToNext` | Rhythm HUD only |
| `_chakraAwakened` | Cosmology overlay |
| `_achieveDefs` | Achievements screen |
| `_achievementQueue` | Achievement popup |
| `_meditationTime` | Meditation HUD |

---

## STEP 3 — WIRE3 (After WIRE2)

Dead code cleanup:
- `ModeManager` (237 lines) — instantiated but never used in loop. Either wire it in or remove it.
- `GridMode` class (438 lines) — exists but current grid runs through `startGame()` + `drawGame()` directly. Wire GridMode in or remove it.
- `mode-manager.js` + `game-mode.js` — both fully built, both bypassed. 675 lines running nowhere.

---

## STEP 4 — FEEDBACK1 (After WIRE2+WIRE3)

Close the consciousness feedback loops. Research doc already written.
Needs the data pipeline working first (WIRE2) so the loop closures have signals to work with.

---

## STEP 5 — BOT1 (After FEEDBACK1)

Archetype voice system. Research doc already written.

---

## Key Reference Documents

| File | Contents |
|------|---------|
| `GAP-ANALYSIS-COMPLETE.md` | Full macro/meso/micro gap analysis |
| `research-feedback-loops.md` | Science + design for FEEDBACK1 |
| `research-ai-characters.md` | Archetype bot design for BOT1 |
| `task-MODES3.md` | Current task to run |
| `task-FEEDBACK1.md` | Future task |
| `task-BOT1.md` | Future task |
