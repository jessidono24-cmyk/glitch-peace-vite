# Task WIRE3 — Overlay Priority System + Mode-Specific HUD Isolation

**Priority: HIGH — 18 overlays can fire simultaneously; non-grid modes still show grid HUD**
**Branch: feat/wire3-overlay-hud**

---

## Pre-Task Audit (Required)

Before doing anything else, audit the codebase and produce a report called AUDIT_REPORT_2.md with three sections:
1. ACTUALLY IMPLEMENTED — features that exist in code AND produce visible output in the browser. For each: file path, one sentence on what it does right now.
2. CODE EXISTS BUT BROKEN/UNWIRED — files with real logic that never get called. For each: file path, why it's broken, what it would need to work.
3. DOCUMENTED ONLY — things in .md files with zero corresponding code.
Do not count something as implemented just because a file exists. Check the import chain from src/main.js. If it's not reachable from main.js, it's not implemented.

---

## Context

### Problem A: 18 Simultaneous Overlays

During grid gameplay, the following can all render at the same time with no priority system:
- Vocab word panel
- Sigil overlay
- Archetype dialogue
- Constellation flash
- Pattern banner
- EQ/IQ flash
- Empathy flash
- Reality check prompt (dream yoga)
- Tutorial hint
- Quest flash
- Alchemy flash
- Boss phase banner
- Play mode label
- Biome draw (direct call)
- Beat pulse visual
- Speedrun timer
- Moves remaining counter
- Impulse progress bar

The result is a wall of overlapping text and visuals that obscures the playfield.

### Problem B: Non-Grid Modes Show Grid HUD

The canvas HUD (`drawHUD` in `renderer.js`) currently draws the grid-specific bars (HP, energy, matrix A/B, insight tokens, dreamscape number, fog radius) in ALL modes. When the player is in Ornithology, they still see the grid HP bar even though there is no grid. The ornithology/mycology modes call `updateModeHUD()` in main.js but that only updates the DOM hud — the canvas HUD draws on top of everything regardless.

---

## Fix 1: Overlay Priority Queue

**File: `src/ui/renderer.js`**

Add a priority system at the top of the file (before `drawHUD`):

```js
// ── Overlay priority — only highest-priority active overlay shows ──────
// Lower number = higher priority (shown first)
const OVERLAY_PRIORITY = [
  'bossPhaseBanner',   // 1 — boss fight is the most critical
  'questFlash',        // 2 — quest milestone
  'achievementPopup',  // 3 — unlock
  'archetypeDialogue', // 4 — character speaks
  'patternBanner',     // 5 — pattern recognition insight
  'constellationFlash',// 6 — constellation discovered
  'alchemyFlash',      // 7 — transmutation
  'dreamYogaCheck',    // 8 — reality check
  'sigilActivation',   // 9 — sigil charge
  'tutorialHint',      // 10 — tutorial (lowest — suppress when anything else is active)
];

function getActiveOverlay() {
  const checks = {
    bossPhaseBanner:    () => window._bossPhaseBanner?.alpha > 0,
    questFlash:         () => window._questFlash?.timer > 0,
    achievementPopup:   () => false, // handled separately, keep separate
    archetypeDialogue:  () => window._archetypeDialogue?.timer > 0,
    patternBanner:      () => window._patternBanner?.timer > 0,
    constellationFlash: () => window._constellationFlash?.timer > 0,
    alchemyFlash:       () => window._alchemyFlash?.timer > 0,
    dreamYogaCheck:     () => window._dreamYoga?.checkActive,
    sigilActivation:    () => (window._sigilAlpha || 0) > 0.1,
    tutorialHint:       () => !!window._currentTutorialHint,
  };
  for (const key of OVERLAY_PRIORITY) {
    if (checks[key]?.()) return key;
  }
  return null;
}
```

Then in the section of `drawHUD` (or wherever overlays are drawn in sequence), replace the current "draw all" pattern with:

```js
// ── Single overlay slot (priority queue) ─────────────────────────────
const activeOverlay = getActiveOverlay();

// Draw ONLY the winning overlay:
if (activeOverlay === 'bossPhaseBanner') {
  // existing boss phase banner code
} else if (activeOverlay === 'questFlash') {
  // existing quest flash code
} else if (activeOverlay === 'archetypeDialogue') {
  // existing archetype dialogue code
} else if (activeOverlay === 'patternBanner') {
  // existing pattern banner code
} else if (activeOverlay === 'constellationFlash') {
  // existing constellation flash code
} else if (activeOverlay === 'alchemyFlash') {
  // existing alchemy flash code
} else if (activeOverlay === 'dreamYogaCheck') {
  // existing dream yoga reality check code
} else if (activeOverlay === 'sigilActivation') {
  // existing sigil code
} else if (activeOverlay === 'tutorialHint') {
  // existing tutorial hint code
}

// Items that are ALWAYS shown (not part of overlay slot):
// - Achievement popup (separate layer, top-right corner, self-contained)
// - Beat pulse (background visual, not text overlay)
// - Speedrun timer (always relevant when active)
// - Moves remaining counter (always relevant when active)
// - Impulse progress bar (always relevant when active)
// - Vocab word (persistent learning display — show in a fixed bottom-left zone)
```

**Important**: Do NOT remove any existing overlay draw code — just wrap each in the `if (activeOverlay === '...')` check above. If a block was previously unconditional, it becomes part of the queue. Achievement popup, speedrun timer, moves counter, and impulse bar remain unconditional since they're spatially isolated.

---

## Fix 2: Vocab Word — Move to Fixed Zone

**File: `src/ui/renderer.js`**

The vocab word panel currently appears in the overlay slot area and collides with everything. Move it to a fixed bottom-left position that doesn't conflict with other overlays.

Find the vocab word draw section (currently reads `window._vocabWord`). Change its draw coordinates to:

```js
const vocabWord = window._vocabWord;
if (vocabWord) {
  const vx = 12;
  const vy = h - 56;  // fixed bottom-left, above the instruction bar
  // ... existing draw code, just change the x/y coordinates to vx/vy
}
```

This positions it far from the center where overlays fight for attention.

---

## Fix 3: Mode-Aware Canvas HUD

**File: `src/ui/renderer.js`** — `drawHUD` function

The canvas HUD currently draws the full grid HUD (HP bar, energy, matrix A/B, insight tokens) regardless of game mode. Add a mode gate at the start of the grid-specific section:

```js
// Find the function signature:
export function drawHUD(ctx, game, ts, phase, UPG) {
  if (!game || phase !== 'playing') return;
  const w = ctx.canvas.width / (window.devicePixelRatio || 1);
  const h = ctx.canvas.height / (window.devicePixelRatio || 1);

  // ── NEW: Mode check — non-grid modes skip the grid HUD ────────────────
  const nonGridModes = new Set(['shooter', 'constellation', 'meditation', 'coop',
                                 'rhythm', 'ornithology', 'mycology', 'alchemy',
                                 'architecture', 'rpg', 'learning_hub', 'language_learning', 'fps']);
  const isNonGrid = nonGridModes.has(game._currentModeType || '');

  if (isNonGrid) {
    // Non-grid modes: draw minimal overlay only
    // - Emotional field row (consciousness engine — relevant in all modes)
    drawEmotionRow(ctx, w, window._emotionField || null);
    // - Lunar/temporal info (top-right corner)
    const tm = window._tmods;
    if (tm) {
      ctx.font = fs(10, ctx.canvas) + 'px ' + FONT;
      ctx.fillStyle = '#445566';
      ctx.textAlign = 'right';
      ctx.fillText((tm.lunarName || '') + ' · ' + (tm.planetName || ''), w - 12, 24);
    }
    // - Achievement popup
    drawAchievementPopup(ctx, w, h, window._achievementSystem?.popup, ts);
    return; // skip all grid-specific HUD
  }

  // ... existing grid HUD code continues unchanged below this point
```

**Important**: `game._currentModeType` must be set correctly. In main.js, when launching non-grid modes, the init calls already set `_currentModeType` (e.g. `updateHUD({ state: 'PLAYING', _currentModeType: 'ornithology', ... })`). But `drawHUD` in renderer.js receives the `game` object, which may not have `_currentModeType` set for non-grid modes. 

In main.js, in the non-grid mode branches of the loop, ensure `game` (or `modeGame`) has `_currentModeType` set:

```js
// In the ornithology section (~line 945):
if (gameMode === 'ornithology') {
  modeGame._currentModeType = 'ornithology';  // ADD THIS LINE
  ornithologyMode.update(modeGame, dt);
  // ...
}
// Repeat for mycology, alchemy, architecture, rpg, learning_hub, language_learning, fps
```

If `drawHUD` is called with `modeGame` in non-grid paths, this propagates correctly.

---

## Fix 4: Non-Grid Mode HUD — Mode-Specific Status Line

For non-grid modes, after the minimal overlay return in Fix 3, add a mode-specific status line at the top of the canvas. This replaces the grid HP bar with something relevant to the active mode:

```js
if (isNonGrid) {
  drawEmotionRow(ctx, w, window._emotionField || null);
  const tm = window._tmods;
  if (tm) { /* temporal line, as above */ }

  // Mode-specific status line — top-center
  const modeType = game._currentModeType;
  const modeStatus = {
    ornithology:       () => `BIRDS OBSERVED: ${window._ornithWorld?.observed || 0} / ${window._ornithWorld?.birds?.length || 0}`,
    mycology:          () => `NODES CONNECTED: ${window._mycelWorld?.connected || 0} / ${window._mycelWorld?.nodes?.length || 0}`,
    meditation:        () => `MEDITATION: ${window._meditationTime ? Math.round(window._meditationTime) + 's' : '--'}`,
    shooter:           () => { const s = window._shooterState; return s ? `WAVE ${s.wave}  HP ${s.health}  SCORE ${s.score}` : ''; },
    rhythm:            () => { const rtt = window._rhythmTimeToNext; return `BEAT IN: ${rtt ? rtt.toFixed(1) + 's' : '--'}`; },
    alchemy:           () => { const a = window._alchemySystem; return a ? `PHASE ${a.phase || 1}  TRANS ${a.transmutations || 0}` : ''; },
    constellation:     () => `STARS CONNECTED`,
    architecture:      () => `ARCHITECTURE MODE`,
    rpg:               () => { const q = window._questData; return q?.activeQuest ? `QUEST: ${q.activeQuest.name}` : 'RPG MODE'; },
    learning_hub:      () => { const ls = window._learnStats; return ls ? `WORDS ${ls.words}  PATTERNS ${ls.patterns}` : 'LEARNING'; },
    language_learning: () => { const ls = window._learnStats; return ls ? `WORDS LEARNED: ${ls.words}` : 'LANGUAGE'; },
  };

  const statusFn = modeStatus[modeType];
  if (statusFn) {
    ctx.font = fs(13, ctx.canvas) + 'px ' + FONT;
    ctx.fillStyle = '#667788';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(statusFn(), w / 2, 8);
    ctx.textBaseline = 'alphabetic';
  }

  drawAchievementPopup(ctx, w, h, window._achievementSystem?.popup, ts);
  return;
}
```

---

## Verification Checklist

```
[ ] npm run build — zero errors
[ ] Grid mode: trigger multiple overlays quickly (collect pattern, meet archetype, get quest flash)
[ ] Only ONE overlay shows at a time — they queue, not stack
[ ] Vocab word always appears bottom-left, never overlaps center overlays
[ ] Speedrun timer still shows when active (not gated by overlay queue)
[ ] Moves remaining still shows when active (not gated by overlay queue)
[ ] Impulse progress bar still shows (not gated)
[ ] Ornithology mode: NO grid HP bar visible, NO matrix A/B, NO insight tokens
[ ] Ornithology mode: shows "BIRDS OBSERVED: X / Y" at top-center
[ ] Mycology mode: shows "NODES CONNECTED: X / Y" at top-center
[ ] Shooter mode: shows wave/HP/score at top-center
[ ] All modes: emotion field row still visible at bottom
[ ] All modes: lunar/temporal info in top-right corner
[ ] Grid mode: full HUD still shows (HP bar, energy, matrix, insight tokens)
[ ] Achievement popups still appear in all modes
[ ] All previously working features still work
```

## Commit message
```
feat: WIRE3 overlay priority system + mode-aware HUD isolation
```
