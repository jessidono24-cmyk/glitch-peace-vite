# Task PLAYTEST3 — Fix Loop: Run Until Zero Failures

## Goal
This task runs AFTER PLAYTEST2 generates its first report.
The agent reads the report, fixes every failure, rebuilds, reruns the
test, and repeats until PLAYTEST2_REPORT.md shows zero automated failures.

This task does NOT end until the report is clean.

## Definition of Done
- [ ] PLAYTEST2_REPORT.md shows `Automated failures: 0`
- [ ] `npm run build` passes
- [ ] All 10 modes load and play for 10 seconds without crashing or freezing
- [ ] All 18 dreamscapes load in grid mode
- [ ] All 13 cosmologies load
- [ ] No console errors on any combination
- [ ] No [object Object] anywhere
- [ ] Canvas fills full screen in every mode

---

## The Loop

Repeat this cycle until the report shows 0 failures:

```
1. Read PLAYTEST2_REPORT.md
2. Fix one failure
3. npm run build  (must pass before continuing)
4. Run: npx playwright test tests/playtest-deep.js
5. Go to step 1
```

Never batch fixes speculatively. Fix one thing, verify it builds,
rerun the test, then fix the next thing.

---

## How to Read the Report

```bash
cat PLAYTEST2_REPORT.md
```

Look for lines starting with ❌. Each one has:
- The mode/dreamscape/cosmology that failed
- The reason
- A screenshot path

Open the screenshot:
```bash
# The screenshots are in test-results/playtest2/
ls test-results/playtest2/
```

---

## Fix Playbook by Failure Type

### "CRASH" — mode threw a JavaScript error

```bash
# Find the mode file
grep -rn "alchemy\|shooter\|ornithology\|mycology\|architecture\|rhythm\|constellation\|meditation\|rpg" src/modes/ src/gameplay-modes/ | grep -i "export\|class\|function init\|function update" | head -20
```

Open the mode file. Find the function that crashes.
Common causes:
- Accessing `.x` or `.y` on undefined object
- `null.property` — add null check: `if (!obj) return;`
- Missing import
- Calling a function that doesn't exist yet

Fix: add null/undefined guards around the crash point.

### "frozen after Xms" — game loop stopped

Find the mode's update function:
```bash
grep -n "update\|tick\|loop\|while\|setInterval" src/modes/[mode-name].js 2>/dev/null || \
grep -rn "update\|tick" src/gameplay-modes/ | grep -i "[mode-name]" | head -10
```

Add freeze guard at top of update():
```js
update(dt) {
  if (!dt || dt > 1.0 || dt < 0) return; // safety guard
  // ... rest of update
}
```

Also check for `while` loops that could be infinite:
```bash
grep -n "while" src/modes/[mode-name].js
```
Every `while` must have a guaranteed exit condition.

### "[object Object] visible"

```bash
grep -n "Object\]\|toString\|+ state\|+ cosmo\|+ playstyle\|+ emotion" src/ui/renderer.js src/ui/menus.js | head -20
```

Find every place state properties are concatenated into strings.
Fix each one:
```js
// BEFORE (causes [object Object]):
ctx.fillText('Mode: ' + state.cosmology, x, y);

// AFTER:
ctx.fillText('Mode: ' + (state.cosmology?.name || state.cosmology?.id || ''), x, y);
```

### "Canvas too narrow: Xpx"

The mode is rendering in a sub-section of the screen.
Find its rendering origin:
```bash
grep -n "offsetX\|startX\|areaX\|gameX\|panelX\|= 400\|= 500\|= 600" src/modes/[mode-name].js src/gameplay-modes/[mode-name]-mode.js 2>/dev/null | head -10
```

Replace hardcoded x offsets:
```js
// BEFORE:
const gameX = 480;
const gameW = 800;

// AFTER:
const gameX = canvas.width * 0.02;
const gameW = canvas.width * 0.96;
```

### "console errors: Cannot read properties of undefined"

This is almost always an uninitialized state property.
The error will name the property. Find where that property
should be initialized:
```bash
grep -rn "emergenceLevel\|cosmology\|playstyle\|dreamscape\|playerName" src/core/state.js src/core/gameState.js 2>/dev/null | head -20
```

Add default value in state initialization:
```js
const DEFAULT_STATE = {
  emergenceLevel: 'DORMANT',
  cosmology: null,
  dreamscape: 'Void State',
  playerName: 'Wanderer',
  // ... etc
};
```

### "Dreamscape X: CRASH" — dreamscape-specific crash

Dreamscapes are usually data configs, not code.
Find the dreamscape definition:
```bash
grep -rn "Mountain Dragon\|Void State\|Leaping Field\|Childhood" src/data/ src/dreamscapes/ src/core/ | head -20
```

The crash is likely a missing property in the dreamscape config.
Add any missing fields with safe defaults.

### "Cosmology X: CRASH"

Same as dreamscape crash — find the cosmology data:
```bash
grep -rn "Seven Energy\|Uncarved Block\|Nine Realm\|Book of Changes" src/data/ src/cosmologies/ | head -20
```

Add missing properties with defaults.

---

## Alchemy Mode — Special Case

Alchemy has a known freeze issue. If it still appears after UI4:

```bash
# Find alchemy mode file
find src -name "*alchemy*" -type f
cat [alchemy-file-path]
```

Look specifically for:
1. Any `while` loop in the transmutation/reaction logic
2. Any recursive function without a base case
3. Any `await` in the game loop (game loops must be synchronous)
4. Any state machine that can enter an unhandled state

Fix by adding a maximum iteration guard:
```js
let safetyCounter = 0;
while (condition) {
  safetyCounter++;
  if (safetyCounter > 10000) {
    console.warn('Alchemy: safety break triggered');
    break;
  }
  // ... loop body
}
```

---

## Architecture Mode — Special Case

Architecture mode shows a nearly empty screen with one tile.
The game area is only rendering in the right portion.

```bash
find src -name "*architecture*" -type f
```

The mode likely has a hardcoded grid that isn't scaling to canvas size.
Find the grid dimensions and rendering offset, make them canvas-relative.

---

## Mycology + Ornithology — Special Case

Both modes render content only in the right half of the screen.
The left half is black.

```bash
find src -name "*mycology*" -name "*ornithology*" -type f
grep -rn "offsetX\|areaX\|startX\|left\|RIGHT_PANEL\|PANEL_X" src/ | grep -i "mycol\|ornith" | head -10
```

These modes likely have a two-panel layout where the left panel
is intentionally empty or was designed for a sidebar.
Either:
a) Remove the left panel entirely and expand game area to full width
b) Or fill the left panel with relevant content (species info, notebook, etc.)

Option (a) is faster. Option (b) is better. Use (a) for now.

---

## After Every Fix — Verify Build

```bash
npm run build
```

If build fails, fix the build error before running tests.
Never run tests against a broken build.

---

## Stopping Condition

The loop ends when this command produces output with 0 failures:

```bash
grep "Automated failures: 0" PLAYTEST2_REPORT.md
```

If that grep returns a result, the task is complete.

---

## Final Commit

When all failures are resolved:

```bash
git add -A
git commit -m "fix: PLAYTEST3 complete -- all modes/dreamscapes/cosmologies passing, zero failures"
git push
```

Then post the contents of PLAYTEST2_REPORT.md as a summary.
