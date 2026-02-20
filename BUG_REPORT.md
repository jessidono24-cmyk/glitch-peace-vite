# GLITCH·PEACE Bug Report
**Testing Session:** 2026-02-20 (updated 2026-06-10)
**Version:** v2.1  
**Tester:** Automated gameplay testing (Playwright + code analysis)  
**Session Duration:** Extended testing across all major systems  

---

## Main Menu

![Main Menu](https://github.com/user-attachments/assets/a2d74d75-2366-426d-ac98-3b2fec92a702)

---

## Summary

| ID | Severity | Status | Description |
|----|----------|--------|-------------|
| BUG-001 | 🔴 Major | Open | `interactive-tiles.spec.js` test always fails — game never reaches PLAYING state |
| BUG-002 | 🔴 Major | Open | FREEZE powerup doesn't freeze enemies |
| BUG-003 | 🟠 Medium | **Resolved** | ESC key during PAUSE doesn't resume game — code now handles this correctly when on 'pause' screen |
| BUG-004 | 🟠 Medium | Open | H key (help/tutorial) returns to PAUSE menu, not PLAYING |
| BUG-005 | 🟡 Minor | Open | "Z: Undo" shown in controls hint even when undo is disabled |
| BUG-006 | 🟡 Minor | Open | "U: Shop" hint gives no indication that insight tokens are required |
| BUG-007 | 🟡 Minor | Open | "R: Pulse" hint gives no indication that 100% charge is required |
| BUG-008 | 🟡 Minor | Open | `renderHUD()` shows total peace nodes, not remaining |
| BUG-009 | 🟠 Medium | Open | "Co-operative Field" play mode listed as selectable but is unimplemented (FUTURE) |
| BUG-010 | 🟡 Minor | Open | Menu descriptions are truncated with no way to view full text |
| BUG-011 | 💙 Cosmetic | Open | GLITCH·PEACE title watermark bleeds through menu selection screens |
| BUG-012 | 🟡 Minor | Open | HUD objective always shows "◈" symbol even in non-grid modes |
| BUG-013 | 🔴 Major | Open | `movePlayer` (src/game/player.js) crashes when called in non-grid modes |
| BUG-014 | 🟡 Minor | Open | "BKSP back" hint is ambiguous (Backspace abbreviation unclear) |
| BUG-015 | 🟡 Minor | Open | RESUME in pause menu calls `menuSystem.open('title')` unnecessarily |
| BUG-016 | 🟡 Minor | Open | No feedback when U/R/Z key actions cannot be performed |
| BUG-017 | 🟡 Minor | Open | `renderHUD()` initial objective shows peaceTotal not remaining |
| BUG-018 | 🟠 Medium | Open | RPG mode is a skeleton: shows `[Phase M5 skeleton]` in console, no quests, score never advances |
| BUG-019 | 🟠 Medium | Open | Shooter HUD shows `◈ ×0` instead of wave/enemy count; wave data is in `modeState.waveNumber` only |
| BUG-020 | 🟡 Minor | Open | Alchemy mode: 2-step mechanic (collect elements → transmute) undiscoverable; random movement yields score 0 |
| BUG-021 | 🟡 Minor | Open | Specialty mode node positions (`_birdSightings`, `_stars`, `_elements`) stored only on mode instance, invisible via `window.GlitchPeaceGame` |
| BUG-022 | 🟡 Minor | Open | Pause menu navigation: navigating into a sub-screen (OPTIONS/CREDITS/HIGH SCORES) prevents ESC-to-resume |

---

## Detailed Bug Reports

---

### BUG-001 🔴 `interactive-tiles.spec.js` test always fails

**File:** `tests/interactive-tiles.spec.js:17`  
**Reproducible:** 100% — fails on every run

**Description:**  
The interactive tiles test tries to reach `PLAYING` state from the title menu by pressing Enter up to 6 times. However, the new game setup flow now requires **5 Enter presses total** to get through the title menu plus all 4 selection screens after choosing NEW GAME:
1. NEW GAME (title menu selection)
2. Dreamscape selection (e.g., "The Rift")
3. Play Mode selection (e.g., "Classic Arcade")
4. Cosmology selection (e.g., "No Cosmology")
5. Game Mode selection (e.g., "Grid Classic")

Additionally, the game shows a MESSAGE_PAUSE tip on level start, requiring one more Space/Enter press to dismiss before state becomes `PLAYING`. The test loop retries state checks between each press but the timing between presses (200ms each) is too short for some screens to render and be dismissed. The test was written for an older 2-screen flow and gets stuck at `MENU_DREAMSCAPE` → `playmode` screen without ever reaching `PLAYING`.

**Steps to reproduce:**
```bash
npx playwright test tests/interactive-tiles.spec.js
```

**Expected:** Test reaches PLAYING state and proceeds to test tile interactions.  
**Actual:** `Timeout 5000ms exceeded while waiting for state === 'PLAYING'` — stuck at `MENU_DREAMSCAPE`.

**Evidence:**
```
Error: expect(received).toBe(expected) // Object.is equality
Expected: "PLAYING"
Received: "MENU_DREAMSCAPE"
```

---

### BUG-002 🔴 FREEZE powerup doesn't freeze enemies

**Files:**  
- `src/systems/powerups.js:53-59` (applies wrong stun properties)  
- `src/game/enemy.js:112-114` (checks different properties)

**Description:**  
The FREEZE powerup (`effect: 'stun_enemies'`) is completely non-functional. There is a **mismatch between how the freeze is applied vs. how it is checked**:

`applyPowerup()` sets **per-enemy** properties:
```js
enemy.stunned = true;       // ← sets this
enemy.stunnedUntil = until; // ← and this
```

But `updateEnemies()` checks **different** properties:
```js
if (e.stunTimer > 0) { ... }    // ← checks this (never set by FREEZE)
if (e.stunTurns > 0) continue;  // ← or this (never set by FREEZE)
```

The global freeze guard in `enemy.js` that `applyPowerup` intended to use:
```js
// gameState._freezeUntilMs is a timestamp set by the FREEZE powerup (powerups.js)
if (gameState._freezeUntilMs && now < gameState._freezeUntilMs) return;
```
…is never set by `applyPowerup`. The comment is stale — the implementation was changed but the code path was not updated.

**Steps to reproduce:**
1. Start a game (any mode with enemies)
2. Collect a FREEZE powerup (❄ tile)
3. Observe enemies: they continue moving normally despite the powerup being active

**Expected:** Enemies freeze for 5 seconds when FREEZE powerup is collected.  
**Actual:** Enemies continue moving normally. The FREEZE powerup has no effect.

**Code evidence:**
```js
// powerups.js — sets .stunned per enemy
for (const enemy of gameState.enemies) {
  enemy.stunned = true;            // never checked by updateEnemies
  enemy.stunnedUntil = until;      // never checked by updateEnemies
}
// Does NOT set: gameState._freezeUntilMs  (what updateEnemies actually checks)

// enemy.js — only checks unrelated properties
if (e.stunTimer > 0) { e.stunTimer -= 16; continue; }   // set by stunTimer only
if (e.stunTurns > 0) continue;                           // set by stunTurns only
if (gameState._freezeUntilMs && now < ...) return;       // NEVER SET by applyPowerup
```

---

### BUG-003 🟠 ESC key during PAUSE doesn't resume game

**Files:** `src/ui/menus.js:80-110`, `src/main.js` (keydown handler)

**Description:**  
When the game is paused (state = `PAUSED`), pressing **ESC does not resume gameplay**. The game stays in the paused state indefinitely until the player navigates to the "RESUME" menu item with arrow keys and presses Enter. This is inconsistent with universal game conventions where ESC is used to both open and close the pause menu.

**Steps to reproduce:**
1. Start a game and reach PLAYING state
2. Press ESC → game pauses (state = `PAUSED`)
3. Press ESC again
4. Observe: game remains in `PAUSED` state, no state change

**Expected:** ESC during PAUSE → game resumes (returns to PLAYING)  
**Actual:** ESC during PAUSE → nothing happens (game stays PAUSED)

**Root cause:**  
In `menus.js:handleKey()`, the ESC handler does not include a case for the `'pause'` screen:
```js
if (k === 'Escape') {
  if (this.screen === 'options' || ...) { ... }  // handles other screens
  // 'pause' screen is NOT handled → falls through to `return { consumed: false }`
}
```
And in `main.js`, the ESC handler only transitions from PLAYING→PAUSED:
```js
if (game.state === 'PLAYING') {
  if (e.key === 'Escape') {
    game.state = 'PAUSED';  // only one direction
    ...
  }
}
```
There is no handler to go PAUSED→PLAYING via ESC.

---

### BUG-004 🟠 H key (help/tutorial) returns to PAUSE menu, not PLAYING

**Files:** `src/main.js` (H key handler), `src/ui/menus.js:86-91`

**Description:**  
Pressing **H** during gameplay opens the in-game tutorial while pausing the game. This is intentional. However, when **ESC** is pressed from the tutorial, the game returns to the **pause menu** (requiring another RESUME action) instead of returning directly to playing.

The return path is: H → Tutorial → ESC → PAUSE menu → ENTER on RESUME → PLAYING  
Expected return path: H → Tutorial → ESC → PLAYING

**Steps to reproduce:**
1. Start a game and enter PLAYING state
2. Press H → game pauses, tutorial opens
3. Press ESC to close tutorial
4. Observe: game shows the PAUSE menu, not the game screen

**Root cause:**
```js
// main.js H key handler
if (e.key === 'h' || e.key === 'H') {
  game.state = 'PAUSED';
  menuSystem._tutorialReturnScreen = 'pause'; // ← forces return to pause menu
  menuSystem.open('tutorial');
}
// Should be 'game' or similar to directly resume after tutorial
```

---

### BUG-005 🟡 "Z: Undo" shown in controls hint even when undo is disabled

**File:** `src/main.js` (controls hint map, line ~580), `src/gameplay-modes/grid-based/GridGameMode.js:1670`

**Description:**  
The controls hint for the grid game mode always shows **"Z: Undo"** regardless of whether undo functionality is enabled. Undo only works when `gameState.mechanics?.undoEnabled` is true (only in PUZZLE mode). In all other modes (ARCADE, ZEN, SPEEDRUN, etc.), pressing Z does nothing silently.

**Evidence:**
```js
// GridGameMode.handleInput — undo only works in PUZZLE mode
if (gameState.mechanics?.undoEnabled && (input.isKeyPressed('z') || input.isKeyPressed('Z'))) {
  undoGameMove(gameState);
```
But controls hint is hardcoded as always showing "Z: Undo" for the grid mode.

---

### BUG-006 🟡 "U: Shop" hint gives no indication that insight tokens are required

**File:** `src/gameplay-modes/grid-based/GridGameMode.js:1624-1631`

**Description:**  
The controls hint shows **"U: Shop"** but the upgrade shop only opens when the player has at least 1 insight token (`gameState.insightTokens > 0`). Pressing U without tokens does nothing and provides no feedback. New players will repeatedly press U wondering why nothing happens.

```js
if (input.isKeyPressed('u') || input.isKeyPressed('U')) {
  if (gameState._shopOpen) {
    closeUpgradeShop(gameState);
  } else if ((gameState.insightTokens || 0) > 0) {
    openUpgradeShop(gameState);
  }
  // No else: no message, no sound, no feedback when tokens = 0
}
```

---

### BUG-007 🟡 "R: Pulse" hint gives no indication that 100% charge is required

**File:** `src/gameplay-modes/grid-based/GridGameMode.js:1592-1622`

**Description:**  
The controls hint shows **"R: Pulse"** (Glitch Pulse) but the pulse only fires when `glitchPulseCharge >= 100`. At game start, charge is 0. Pressing R with a partial or empty charge does nothing with no feedback.

The charge bar is visible in the HUD (rendered on canvas), but there's no indication in the controls hint that a full charge is needed.

---

### BUG-008 🟡 `renderHUD()` shows total peace nodes, not remaining

**File:** `src/ui/hud.js:183`

**Description:**  
The `renderHUD()` function generates the initial HUD HTML with an incorrect objective display. It shows **total** peace nodes instead of **remaining** nodes:

```js
// BUG: uses game.peaceTotal (total) not remaining
`◈ ×${Math.max(0, (game.peaceTotal || 0) - (game.peaceCollected || 0))}`  // updateHUD (correct)
`◈ ×${game.peaceTotal}`  // renderHUD (incorrect) — shows total, not remaining
```

The `updateHUD()` function (called every frame) correctly shows remaining nodes, so this bug only affects the initial render before the first frame update. However, `renderHUD()` is the canonical HTML generator and should match the intended display.

---

### BUG-009 🟠 "Co-operative Field" play mode is unimplemented but selectable

**Files:** `src/systems/play-modes.js:287-310`, `src/ui/menus.js`

**Description:**  
The "Co-operative Field" play mode appears in the play mode selection menu and is fully selectable. Its description explicitly says *"(FUTURE)"*:
```js
desc: "Two players, shared emotional field (FUTURE)",
```
The mode defines `playerCount: 2`, `sharedEmotionalField: true`, and `reviveSystem: true`, but none of these mechanics are implemented in the game engine. Selecting it starts a standard single-player game that ignores all co-op mechanics entirely.

**Expected:** Mode should be disabled/greyed out, or removed from the selection until implemented.  
**Actual:** Mode is listed and selectable, misleading players with "FUTURE" in the description.

---

### BUG-010 🟡 Menu descriptions are truncated with no way to view full text

**Description:**  
In the dreamscape, play mode, and cosmology selection screens, description text is truncated to fit available space, ending with "..." mid-sentence. Examples:
- The Duat: "Shadow journey through the Egyptian un..."
- Reverse Polarity: "Peace hurts, hazards heal - everything i..."
- Co-operative Field: "Two players, shared emotional field (FUT..."

There is no tooltip, secondary info panel, or way to scroll/expand to see the full description.

**Affected screens:** Dreamscape selection, Play mode selection, Cosmology selection

---

### BUG-011 💙 GLITCH·PEACE title watermark bleeds through selection screens

**Description:**  
The GLITCH·PEACE game logo/title is visible as a faint watermark through the dreamscape, play mode, and cosmology selection screens. The text appears behind the list items with reduced opacity.

**Screenshots:** Visible in screenshots during testing (dreamscape, playmode, cosmology screens).

**Affected screens:** Dreamscape selection, Play mode selection, Cosmology selection

---

### BUG-012 🟡 HUD objective always shows "◈" symbol in non-grid modes

**File:** `src/ui/hud.js:40`

**Description:**  
The HTML HUD's objective display always uses the "◈" (peace tile) symbol:
```js
let objParts = [`◈ ×${Math.max(0, (game.peaceTotal || 0) - (game.peaceCollected || 0))}`];
```
In non-grid modes:
- **Ornithology:** shows "◈ ×7" when it should show "🐦 ×7" (birds to observe)
- **Shooter:** shows "◈ ×0" when it should show wave/enemy count
- Other modes similarly repurpose peaceTotal/peaceCollected but always get the ◈ symbol

Note: Each game mode renders its own objective display on the canvas correctly, creating a duplicate display where the HTML HUD shows the wrong symbol/context.

---

### BUG-013 🔴 `movePlayer` (src/game/player.js) crashes in non-grid modes

**File:** `src/game/player.js:46`

**Description:**  
The `movePlayer` function in `src/game/player.js` assumes `gameState.grid` is a populated 2D array:
```js
const tile = gameState.grid[newY][newX];  // crashes if grid is empty/null
```
In non-grid game modes (ornithology, shooter, RPG, etc.), `gameState.grid` is either `null`, an empty array `[]`, or structured differently. Calling `movePlayer` in these modes throws:
```
TypeError: Cannot read properties of undefined (reading '1')
```

This affects:
1. The `interactive-tiles.spec.js` test which imports and directly calls `movePlayer` on `window.GlitchPeaceGame` — if any other mode was recently run, the test will crash
2. The fallback input handler in `main.js:531-534` which calls `movePlayer(game, dx, dy)` directly (though the fallback should only activate if `currentMode.handleInput` is absent)

---

### BUG-014 🟡 "BKSP back" navigation hint is ambiguous

**File:** `src/ui/menus.js` (cosmology/playmode draw methods)

**Description:**  
The navigation hint on cosmology and play mode selection screens shows **"BKSP back"** as the back action. The abbreviation "BKSP" is non-standard and may be unclear to users unfamiliar with keyboard terminology. The hint should read **"Backspace: back"** or use a standard keyboard symbol (⌫).

**Affected screens:** Play mode selection, Cosmology selection, Game mode selection

---

### BUG-015 🟡 RESUME in pause menu calls `menuSystem.open('title')` unnecessarily

**File:** `src/ui/menus.js:436`

**Description:**  
The RESUME action in the pause menu:
```js
{ label: 'RESUME', action: () => this.onQuitToTitle({ to: 'playing' }) }
```
...calls `onQuitToTitle({ to: 'playing' })` which sets `game.state = 'PLAYING'` correctly, but **also calls `menuSystem.open('title')`**, setting the internal menu screen state to `'title'` instead of leaving it in `'pause'`. This is benign visually (game renders correctly since state is PLAYING), but is a semantic error — resuming from pause shouldn't call `onQuitToTitle` at all.

Additionally, `recordSession(game)` is called on resume, which is incorrect — sessions should only be recorded on actual game end, not resume.

---

### BUG-016 🟡 No feedback when U/R/Z key actions cannot be performed

**File:** `src/gameplay-modes/grid-based/GridGameMode.js:1592-1675`

**Description:**  
When the player presses action keys that currently have no effect, there is **no visual or audio feedback**:

- **R (Glitch Pulse):** Does nothing when charge < 100 — no message, no sound
- **U (Upgrade Shop):** Does nothing when insight tokens = 0 — no message, no sound  
- **Z (Undo):** Does nothing outside PUZZLE mode — no message, no sound

Players pressing these keys receive no indication of *why* the action failed or *how* to unlock it.

---

### BUG-017 🟡 HUD shows "◈ ×0" as objective in shooter mode

*(Subset of BUG-012 specific to shooter)*

**File:** `src/ui/hud.js:40`

**Description:**  
In shooter mode, the HTML HUD objective shows "◈ ×0" (0 peace nodes), which is meaningless for a wave-based shooter. The shooter mode tracks waves and enemy counts, not peace node collection. The objective display should show wave count or enemies remaining.

---

### BUG-018 🟠 RPG mode is a skeleton — no progression

**Console output:** `[RPGMode] Initializing RPG mode (Phase M5 skeleton)`

**Description:**  
The RPG Adventure mode (`rpg`) starts successfully (state = PLAYING) and shows the correct controls hint, but it is explicitly a Phase M5 skeleton. From live testing:
- `g.peaceTotal = 0` and `g.peaceCollected = 0` — no standard level progression
- `g.modeState` contains only `{ modeName, stats, quests }` — the quests array is empty
- Movement works (player moves around the grid), but no scoring occurs
- Level never advances above 1
- Score stays 0 indefinitely

**Affected:** `src/gameplay-modes/rpg/RPGMode.js`

**Expected:** RPG mode should present quests, NPC dialogue, and a path to level advancement.  
**Actual:** Mode runs but does nothing. No quests, no NPCs, no scoring.

---

### BUG-019 🟠 Shooter HUD shows `◈ ×0` instead of wave/enemy info

*(Extends BUG-017 — confirmed in live testing)*

**File:** `src/ui/hud.js:40`, `src/gameplay-modes/shooter/ShooterMode.js`

**Description:**  
The shooter's HTML HUD objective reads `◈ ×0`. The actual wave data is tracked in `g.modeState.waveNumber` and `g.modeState.score`, but the HTML HUD only reads from `g.peaceTotal`/`g.peaceCollected` (both 0 in shooter mode). The canvas overlay drawn by ShooterMode itself shows the correct wave info, creating a split rendering where:

- HTML HUD: `OBJECTIVE ◈ ×0` (wrong/useless)
- Canvas overlay: correct wave/enemy count (correct but inaccessible to screen readers / test automation)

**Steps to reproduce:**
1. Start game → select shooter mode
2. Observe HUD in top-left area
3. See `OBJECTIVE ◈ ×0` when enemies are actively chasing the player

---

### BUG-020 🟡 Alchemy mode mechanic is undiscoverable from controls hint

**File:** `src/gameplay-modes/alchemy/AlchemyMode.js`

**Description:**  
The alchemy mode controls hint reads: `WASD: Move · Collect elements (🜂🜄🜃🜁) · Walk to ⚗ Athanor to transmute`. The Athanor transmutation altar position is not marked on screen except as a small canvas symbol. During 24 moves of random exploration, score remained 0 and `peaceCollected` stayed 0. The 2-step mechanic (collect 4 elemental tiles → walk to altar) is not communicated clearly enough for new players to discover. No onscreen arrow, map marker, or first-run tutorial teaches this flow.

**Evidence from live testing:**
```json
{ "started": true, "initial": { "peaceTotal": 8, "score": 0 },
  "gameplay": { "level": 1, "score": 0, "collected": 0, "state": "PLAYING" } }
```

---

### BUG-021 🟡 Specialty mode node data inaccessible via `window.GlitchPeaceGame`

**Files:** `src/gameplay-modes/ornithology/OrnithologyMode.js`, `src/gameplay-modes/constellation/ConstellationMode.js`, `src/gameplay-modes/mycology/MycologyMode.js`

**Description:**  
The specialty game modes (ornithology, mycology, architecture, constellation, alchemy) store their interactable node positions on the **mode instance** (`this._birdSightings`, `this._stars`, `this._mushrooms`, `this._elements`) rather than on the shared `gameState` object (`window.GlitchPeaceGame`). The `currentMode` variable that holds the instance is module-scoped in `main.js` and not exposed globally.

**Impact:**
- External automation, save/load features, and debugging tools cannot read node positions
- Test suites cannot directly navigate to nodes without implementing BFS over all grid positions
- The interactive-tiles test cannot be extended to specialty modes without internal API changes

**Suggested fix:** Expose `game.modeNodes = currentMode._getNodes?.() ?? []` as a standardised array during gameplay, or store node positions directly on `gameState`.

---

### BUG-022 🟡 ESC-to-resume blocked after navigating pause sub-screens

**File:** `src/main.js` (lines 507-515), `src/ui/menus.js`

**Description:**  
When the pause menu is freshly opened (ESC from PLAYING), pressing ESC resumes correctly because `menuSystem.screen === 'pause'`. However, if the player navigates to a sub-screen within the pause menu (e.g., OPTIONS, CREDITS, HIGH SCORES) and then presses ESC to close that sub-screen, the menu navigates to the `title` screen — but `game.state` remains `PAUSED`. Now `menuSystem.screen === 'title'` (not `'pause'`), so the ESC-resume guard in `main.js` no longer fires. The game is stuck in PAUSED state until the player manually selects RESUME.

**Steps to reproduce:**
1. Start a game (PLAYING state)
2. Press ESC → pause menu (screen='pause', sel=0)
3. Arrow down to OPTIONS → press Enter
4. Press ESC to close OPTIONS → screen becomes 'title', game still PAUSED
5. Press ESC again — game does NOT resume

**Expected:** ESC always resumes gameplay from any pause sub-screen.  
**Actual:** ESC gets stuck after opening a pause sub-screen; player must select RESUME manually.

---

## Environment

- **Browser:** Chromium (Playwright headless)
- **Vite dev server:** v7.3.1 on port 3002
- **Node.js environment:** Linux (runner)
- **Game version:** v2.1 · 9 modes · 18 dreamscapes · 17 play styles

## Testing Coverage

| System | Tested | Notes |
|--------|--------|-------|
| Main menu navigation | ✅ | All menu items accessible |
| Onboarding flow | ✅ | Works, ESC skips correctly |
| Dreamscape selection | ✅ | 18 dreamscapes listed |
| Play mode selection | ✅ | 16+ modes listed (COOP is FUTURE) |
| Cosmology selection | ✅ | 13 cosmologies listed |
| Game mode selection | ✅ | 9 modes available |
| Grid game mode (ARCADE) | ✅ | Core gameplay works — reached Level 6, Score 71,040 |
| Peace node collection | ✅ | Score/combo/HP all correct |
| Level completion | ✅ | Advances correctly (BFS-navigated levels 1–6) |
| Enemy behavior | ✅ | Chase AI works |
| Tile interactions | ✅ | DESPAIR/TERROR/TRAP/etc. work |
| SHIELD powerup | ✅ | Enemy damage absorption works |
| FREEZE powerup | ❌ | BUG-002: does not freeze enemies |
| SPEED powerup | ✅ (partial) | Not fully tested |
| REGEN powerup | ✅ (partial) | Not fully tested |
| Pause/resume flow | 🔶 | BUG-022: ESC blocked after sub-screen navigation; direct resume (fresh pause) works |
| Tutorial system | ✅ | Pages navigable, returns to pause |
| Options menu | ✅ | Settings toggle works |
| High scores | ✅ | Records and displays correctly |
| Credits screen | ✅ | Opens and closes |
| Shooter game mode | ✅ | Starts, wave system initialises (8 enemies wave 1), HUD BUG-019 |
| RPG game mode | 🔶 | Starts but is Phase M5 skeleton — no quests, no progression (BUG-018) |
| Ornithology mode | ✅ | Starts, player movement works, bird observations require grid sweep |
| Mycology mode | ✅ | Starts, forage mechanic initialises correctly |
| Architecture mode | ✅ | Starts, tile placement controls hint shown |
| Constellation mode | ✅ | Starts, star navigation works, player moves correctly |
| Alchemy mode | ✅ | Starts, 2-step element→transmute mechanic (BUG-020) |
| Rhythm mode | ✅ | Starts, collected 19/32 beat tiles in 24 moves, Score 2050 |
| Controls hint accuracy | ❌ | BUG-005/006/007: misleading hints |
| Save/load system | ✅ | localStorage persistence works |
| Emotional field | ✅ | Updates on tile interactions |
| Realm name display | ✅ | NEUTRAL/MIND/HEAVEN updates correctly |
| Matrix A/B toggle | ✅ | SHIFT toggles correctly |
| Archetype system (J) | 🔶 | Partially tested |
| Stats dashboard (D) | ✅ | Toggles correctly |
| Glitch Pulse (R) | 🔶 | Requires 100% charge to test |
| Upgrade shop (U) | 🔶 | Requires insight tokens to test |
| Undo system (Z) | 🔶 | Only works in PUZZLE mode |
| DESPAIR/HOPELESS tile spread | ✅ (code review) | Spreads every 4s |
| Hallucination system | ✅ (code review) | Level 3+ only |
| Boss encounters | 🔶 | Every 5th level, not fully tested |

---

## Notes

- **Score calculation verified:** ARCADE mode 1.2× multiplier + combo multiplier works correctly (2 peace nodes → 180 + 216 = 396 + 500 level bonus = 896 ✓)
- **Emotional field verified:** Joy from peace collection → realm changes from MIND to HEAVEN
- **Save system works:** localStorage stores level/score/HP/dreamscape correctly
- **High scores work:** Top scores tracked and retrievable via leaderboard.js
- **Controls hint updates per mode:** Each game mode shows appropriate controls (confirmed for grid, shooter, ornithology modes)

---

## Comprehensive Mode Test Report (2026-06-10)

All 9 gameplay modes were tested via Playwright automation using BFS grid navigation (for grid-classic) and systematic keyboard sweeps (for specialty modes). Tests ran at http://localhost:3001/ with Vite dev server.

```json
{
  "testDate": "2026-06-10",
  "gameVersion": "v2.1",
  "modesTestedCount": 9,
  "screenshotsTaken": 5,
  "modes": {
    "grid-classic": {
      "index": 0,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Move · J: Archetype · SHIFT: Matrix · R: Pulse (charge needed) · H: Help · D: Stats · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×2 · Emotional: NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "BFS navigation to peace nodes (avoiding WALL tiles, maintaining HP). Advanced from Level 1 → Level 6.",
      "finalLevel": 6,
      "finalScore": 71040,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": [],
      "notes": "Fully functional. Level completion log confirms levels 1-6 generated and completed. Enemy AI and scoring work correctly."
    },
    "shooter": {
      "index": 1,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD: Move · Mouse: Aim · LMB: Shoot · 1-4: Weapon · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×0 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "Wave 1 started with 8 enemies. Player moves with WASD; shooting requires mouse (not keyboard-testable in automation). Score stays 0 without mouse shooting.",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": ["BUG-019"],
      "notes": "Mode starts correctly. Console: '[ShooterMode] Wave 1 started - 8 enemies'. Objective ◈ ×0 is misleading (BUG-019). Shooting mechanic requires mouse input unavailable in keyboard-only automation."
    },
    "rpg": {
      "index": 2,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Move · Walk to ◈ Peace nodes · ↑/↓+ENTER: Dialogue · U: Shop · D: Stats · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×0 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "Mode loads as 'Phase M5 skeleton'. Player movement works on grid. No quests, no NPCs, no scoring. modeState contains only { modeName, stats, quests } with empty quests.",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": ["BUG-018"],
      "notes": "Console: '[RPGMode] Initializing RPG mode (Phase M5 skeleton)'. No game progression possible. Objective ◈ ×0. Dialogue system hint shown but no NPC dialogue exists."
    },
    "ornithology": {
      "index": 3,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Move to observe birds · 1-4: Answer challenges · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×7 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "Mode initialised with peaceTotal=7 bird sightings. Player movement works via keyboard with 180ms moveDelay. Bird positions stored on mode instance (this._birdSightings) — inaccessible externally (BUG-021).",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": ["BUG-021"],
      "notes": "Correctly uses standard peaceCollected/peaceTotal for tracking. HUD ◈ symbol is wrong for a bird mode (BUG-012). 1-4 challenge keys appear but no challenges triggered in limited test."
    },
    "mycology": {
      "index": 4,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Forage mushrooms · 1-4: Identify toxic species · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "Mode initialised for mushroom foraging. Player movement works. Mushroom positions stored on mode instance (this._mushrooms). No collection in limited test.",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": [],
      "notes": "Mode starts cleanly. Console: '[Phase 1] Game mode initialized: Mycology — Forest Foraging'. Same external-inaccessibility pattern as ornithology."
    },
    "architecture": {
      "index": 5,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD: Move · SPACE: Place tile · Q/E: Cycle tiles · X: Erase · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "Mode initialised for tile-placement building. Unique controls: SPACE places, Q/E cycle tile types, X erases. Player movement works. Score requires deliberate tile placement not tested.",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": [],
      "notes": "Console: '[Phase 1] Game mode initialized: Architecture — Build & Create'. Distinct control scheme confirmed."
    },
    "constellation": {
      "index": 6,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Navigate to stars · Activate in sequence · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×6 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "6 stars to activate in sequence. Player movement confirmed working (150ms moveDelay). Stars stored on mode instance (this._stars). Random movement did not activate any stars in limited test.",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": [],
      "notes": "Console: '[Phase 1] Game mode initialized: Constellation — Stars & Myth'. Player starts near first star. Mode-instance-only node positions (BUG-021 pattern)."
    },
    "alchemy": {
      "index": 7,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD: Move · Collect elements (🜂🜄🜃🜁) · Walk to ⚗ Athanor to transmute · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "8 elements to collect then transmute at Athanor altar. 24 moves of random play yielded score=0, collected=0. 2-step mechanic undiscoverable (BUG-020).",
      "finalLevel": 1,
      "finalScore": 0,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": ["BUG-020"],
      "notes": "Console: '[Phase 1] Game mode initialized: Alchemy — The Great Work'. Athanor position stored on mode instance. Element symbols (🜂🜄🜃🜁) shown in controls hint are a nice touch."
    },
    "rhythm": {
      "index": 8,
      "started": true,
      "startState": "PLAYING",
      "controlsHint": "WASD/Arrows: Move to pulsing tiles ON THE BEAT · Build streak for ×multiplier · M: Switch Mode · ESC: Pause",
      "hud": "Health 100/100 · Level 1 · Score 0 · Objective ◈ ×32 → ◈ ×13 · NEUTRAL · MIND · RIFT · arcade · New Void Harmony",
      "gameplay": "32 beat tiles to collect. 24 key presses collected 19/32 tiles and scored 2050 points. Tiles pulse on beat and are triggered by movement — most responsive mode.",
      "finalLevel": 1,
      "finalScore": 2050,
      "finalState": "PLAYING",
      "crashes": 0,
      "newBugs": [],
      "notes": "Console: '[Phase 1] Game mode initialized: Rhythm — Beat Synchrony'. Best-performing specialty mode in random movement tests. Beat-tile collection strongly responsive."
    }
  },
  "summary": {
    "allModesStart": true,
    "modesWithProgression": ["grid-classic", "rhythm"],
    "modesSkeletonOrIncomplete": ["rpg"],
    "modesWithHUDBugs": ["shooter", "rpg"],
    "modesWithNodeAccessibilityIssue": ["ornithology", "mycology", "constellation", "alchemy"],
    "crashes": 0,
    "newBugsFound": ["BUG-018", "BUG-019", "BUG-020", "BUG-021", "BUG-022"],
    "resolvedBugs": ["BUG-003"]
  }
}
```
