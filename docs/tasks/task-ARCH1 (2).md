# Task ARCH1 — Architecture Optimization: Canvas Sizing + ModeManager Wiring

**Run this FIRST. All other tasks depend on a correctly-sized canvas.**

---

## Audit First

Before touching any code, read these files completely:

```bash
cat src/main.js
cat src/game/grid.js
cat src/ui/renderer.js | head -60
cat src/modes/game-mode.js
cat src/modes/mode-manager.js
```

Produce a three-section report before proceeding:
1. **ACTUALLY IMPLEMENTED** — exists in code AND visibly functioning in browser
2. **CODE EXISTS BUT BROKEN/UNWIRED** — files exist but produce no visible output
3. **DOCUMENTED ONLY** — mentioned in .md files with no corresponding code

For each item: file path + one sentence on actual current state.
Do not count something as implemented just because a file exists.

---

## Root Cause

Every black bar and every non-grid mode rendering incorrectly has one root cause:

**`CW()` and `CH()` return grid pixel dimensions (~588×688px for medium grid),
not viewport dimensions. Every mode renders into a canvas sized for the grid.**

In `src/game/grid.js`:
```js
export function CW()  { return GP() + 48; }   // ≈588px, not the screen
export function CH()  { return GP() + 148; }  // ≈688px, not the screen
```

In `src/ui/renderer.js` near the top of `drawGame()`:
```js
const gp = sz * CELL + (sz - 1) * GAP;
const w = gp + 48, h = gp + 148;   // hardcoded grid dimensions
```

`resizeCanvas()` applies a CSS scale to stretch this, but the logical canvas
stays grid-sized. Non-grid modes never fill the screen.

**Secondary:** `ModeManager` and `GameMode` exist in `src/modes/` but `main.js`
ignores them, using raw `if (gameMode === 'x')` chains instead.

---

## Fix 1 — Add Viewport Functions to grid.js

Do NOT change or remove `CW()`/`CH()` — they are still needed for tile math.
Add two new exports alongside them:

```js
export function VW() { return window.innerWidth; }
export function VH() { return window.innerHeight; }
```

---

## Fix 2 — resizeCanvas() Uses Full Viewport

Find `resizeCanvas()` in `main.js`. Replace it entirely:

```js
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const logW = window.innerWidth;
  const logH = window.innerHeight;
  canvas.width  = Math.round(logW * dpr);
  canvas.height = Math.round(logH * dpr);
  canvas.style.width  = logW + 'px';
  canvas.style.height = logH + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
```

Also check `index.html` for size constraints on canvas or body:
```bash
grep -n "max-width\|max-height\|margin\|padding\|width\|height" index.html
```

Remove any `width`/`height` HTML attributes on the canvas element.
CSS for canvas should only be: `canvas { display: block; }`

---

## Fix 3 — drawGame() Uses Canvas Dimensions

In `src/ui/renderer.js`, find near the top of `drawGame()`:
```js
const gp = sz * CELL + (sz - 1) * GAP;
const w = gp + 48, h = gp + 148;
```

Keep `gp` (still used for tile layout). Replace only the `w` and `h` lines:
```js
const gp  = sz * CELL + (sz - 1) * GAP;
const dpr = window.devicePixelRatio || 1;
const w   = (ctx.canvas.width  / dpr) || gp + 48;
const h   = (ctx.canvas.height / dpr) || gp + 148;
```

Now check whether centering offsets for the grid already exist:
```bash
grep -n "offX\|offY\|offsetX\|offsetY\|(w - gp)\|(h - gp)" src/ui/renderer.js | head -20
```

If centering offsets already exist, they will automatically center the grid
in the full viewport — no further change needed.

If NO centering offsets exist, find where the first tile is drawn and add:
```js
const offX = Math.floor((w - gp) / 2);
const offY = Math.floor((h - gp) / 2 - 30);
// prefix all tile draw coordinates with + offX, + offY
```

Read the renderer carefully. Do not add offsets if they already exist.

---

## Fix 4 — Wire ModeManager into main.js Loop

Check if ModeManager is already imported:
```bash
grep -n "ModeManager\|mode-manager" src/main.js
```

**Step A** — If not imported, add at top of main.js:
```js
import { ModeManager } from './modes/mode-manager.js';
```

**Step B** — After existing mode instances are created, instantiate:
```js
const modeManager = new ModeManager(shooterSharedSystems);
```

**Step C** — Check if ModeManager.registerMode expects classes or instances:
```bash
grep -n "registerMode\|getModeInstance" src/modes/mode-manager.js
```

If it expects classes but we have instances, add this method to `mode-manager.js`:
```js
registerModeInstance(name, instance) {
  this.instances.set(name, instance);
  this.modes.set(name, instance.constructor);
}
```

Then register existing instances:
```js
modeManager.registerModeInstance('shooter',       shooterMode);
modeManager.registerModeInstance('constellation', constellationMode);
modeManager.registerModeInstance('meditation',    meditationMode);
modeManager.registerModeInstance('coop',          coopMode);
modeManager.registerModeInstance('rhythm',        rhythmMode);
```

**Step D** — Verify update/render signatures of each mode match ModeManager:
```bash
grep -n "update(dt\|render(ctx" src/modes/shooter-mode.js src/modes/constellation-mode.js src/modes/meditation-mode.js src/modes/coop-mode.js src/modes/rhythm-mode.js 2>/dev/null | head -20
```

**Step E** — In `loop()`, replace the repeated if-chain for non-grid modes:
```js
// FIND (repeated 5 times):
if (gameMode === 'rhythm') { ... animId = requestAnimationFrame(loop); return; }
if (gameMode === 'shooter') { ... animId = requestAnimationFrame(loop); return; }
// etc.

// REPLACE WITH:
const NON_GRID_MODES = new Set(['shooter', 'constellation', 'meditation', 'coop', 'rhythm']);
if (NON_GRID_MODES.has(gameMode)) {
  const w = window.innerWidth, h = window.innerHeight;
  if (gameMode === 'rhythm') rhythmMode.setSizes(w, h); // rhythm needs sizes
  modeManager.switchMode(gameMode);
  const result = modeManager.update(dt, keys, matrixActive, ts);
  modeManager.render(ctx, ts, { w, h, DPR });
  drawAchievementPopup(ctx, w, h, achievementSystem.popup, ts);
  if (result?.phase === 'dead') {
    deadGame = result.data || { score: 0, level: 1, ds: { name: gameMode.toUpperCase() } };
    game = null;
    setPhase('dead');
  }
  animId = requestAnimationFrame(loop);
  return;
}
```

NOTE: keep rhythm mode's special column key handling in the keydown listener.
Only the update/render dispatch in the loop is replaced here.

---

## Fix 5 — Non-Grid Modes Use Viewport Internally

Find any CW()/CH() calls inside non-grid mode files:
```bash
grep -rn "CW()\|CH()" src/modes/ | grep -v "grid-mode" | grep -v node_modules
```

Replace:
- `CW()` → `window.innerWidth`
- `CH()` → `window.innerHeight`

---

## Fix 6 — Alchemy Freeze Guard

Find the alchemy mode file (not alchemy-system.js):
```bash
find src/ -name "*alchemy*" | grep -v "alchemy-system" | grep -v node_modules
cat [found file]
```

Add freeze guard as the absolute first line of `update()`:
```js
update(dt, keys, matrixActive, ts) {
  if (!dt || dt > 500 || isNaN(dt)) return null; // FREEZE GUARD
  // rest of update...
}
```

Find any `while` loops and add safety counters:
```js
let _safety = 0;
while (condition) {
  if (++_safety > 10000) { console.warn('[alchemy] safety break'); break; }
}
```

Wrap alchemy init in try/catch:
```js
try {
  alchemyMode.init(config);
} catch (e) {
  console.error('[alchemy] init failed:', e);
  setPhase('title');
}
```

---

## Fix 7 — RPG Mode: Stop Grid Fallthrough

Check whether RPG has its own mode file or falls through to grid:
```bash
find src/ -name "*rpg*" | grep -v node_modules
grep -n "rpg\|'rpg'" src/main.js | head -15
```

If RPG calls `startGame()` it runs the full grid engine. Fix with an explicit
early return before `drawGame()` is reached. Add to `loop()`:

```js
if (gameMode === 'rpg') {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.fillStyle = '#0d0800';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#cc8800';
  ctx.font = '28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(game?.rpgScene?.location || 'THE VOID BETWEEN WORLDS', w/2, h*0.2);
  ctx.fillStyle = '#886644';
  ctx.font = '18px monospace';
  ctx.fillText(game?.rpgScene?.description || 'You stand at a threshold.', w/2, h*0.35);
  ctx.fillStyle = '#334422';
  ctx.font = '14px monospace';
  ctx.fillText('ESC to pause', w/2, h*0.85);
  animId = requestAnimationFrame(loop);
  return; // critical: stop before drawGame()
}
```

---

## Fix 8 — Ornithology HUD Text Clip

```bash
find src/ -name "*ornith*" | grep -v node_modules
```

In the ornithology mode file, find text drawn at `canvas.height - N` where N < 80.
Move it upward — the bottom HUD bar is ~60px, all content must stay above `canvas.height - 70`:

```js
// BEFORE (clipped):
ctx.fillText(text, x, canvas.height - 10);
// AFTER (visible):
ctx.fillText(text, x, canvas.height - 90);
```

---

## Verification

```bash
npm run build && echo "BUILD OK"
```

Play each mode and confirm:
- [ ] Main menu: fills full screen, no black bars
- [ ] Options / High Scores / How to Play: fill full screen  
- [ ] Grid mode: grid tiles centered in full viewport, no black void borders
- [ ] Shooter: fills full screen
- [ ] Constellation: fills full screen
- [ ] Meditation: fills full screen
- [ ] Rhythm: fills full screen
- [ ] Alchemy: does NOT freeze the game, something renders
- [ ] RPG: no colored grid tiles visible
- [ ] Ornithology: natural background, bird HUD fully visible at bottom

## Commit Message
```
fix: ARCH1 — viewport canvas sizing, ModeManager wiring, mode freeze guards
```

---
**NEXT TASK: RESEARCH-LANG1** (can run in parallel with ARCH1 — it's docs only)
**THEN: LANG1** (requires ARCH1 complete first)
