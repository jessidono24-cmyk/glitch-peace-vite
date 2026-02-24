# Task WIRE1 — Full Wiring Audit + Connection Pass

**Run after: MODES2 + FEEDBACK1 + BOT1 complete**
**Recurrence: Run this task after every major feature sprint**
**Purpose: Ensure zero orphaned code — everything documented, implemented, or explicitly deferred**

---

## What This Task Is

The game has grown across many sprints. Systems get built but not connected. Files get imported but never called. Functions get stubbed but never filled. This task does one thing: find all of that and fix it.

This is NOT a feature task. Do not add new features. Wire what exists.

---

## Audit First — Full Sweep

Run each of these before touching any code. Produce a written inventory.

### A. Import vs. Usage Gap

```bash
# Find everything imported in main.js — then check if it's actually called
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/main.js', 'utf8');
const imports = src.match(/import\s+{[^}]+}\s+from/g) || [];
imports.forEach(i => console.log(i));
"

# For each imported symbol, check if it's called anywhere
grep -n "^import" src/main.js | while read line; do
  symbol=$(echo "$line" | grep -oP '(?<=\{ )[\w, ]+(?= \})')
  echo "=== $symbol ==="
  grep -n "$symbol" src/main.js | grep -v "^.*import" | head -5
done
```

### B. Exported but Never Imported

```bash
# Find all exports across the codebase
grep -rn "^export " src/ --include="*.js" | grep -v node_modules | grep -v "export default" | \
  sed 's/.*export //' | grep -oP '(?<=function |class |const )\w+' | sort > /tmp/all_exports.txt

# Find all imports
grep -rn "^import" src/ --include="*.js" | grep -v node_modules | \
  grep -oP '(?<=\{ )[^}]+' | tr ',' '\n' | tr -d ' ' | sort > /tmp/all_imports.txt

# What's exported but never imported anywhere?
comm -23 /tmp/all_exports.txt /tmp/all_imports.txt
```

### C. Window Globals Set but Never Read

```bash
# Systems often write to window._ but the renderer never reads them
grep -rn "window\._" src/main.js | grep -v "//.*window" | sort > /tmp/window_writes.txt
grep -rn "window\._" src/ui/renderer.js src/ui/menus.js 2>/dev/null | sort > /tmp/window_reads.txt
echo "=== SET but never READ ==="
comm -23 /tmp/window_writes.txt /tmp/window_reads.txt
```

### D. Stubs and TODOs

```bash
# Find all stubs, todos, and placeholder implementations
grep -rn "TODO\|FIXME\|STUB\|placeholder\|Coming Soon\|not yet\|// TODO\|// FIXME\|throw new Error.*not implemented" \
  src/ --include="*.js" | grep -v node_modules | head -60
```

### E. Systems Instantiated but Not Ticked

```bash
# Systems that are constructed but may not be in the game loop
grep -n "new \w\+(" src/main.js | grep -v "//.*new" | head -40
# Then manually check: is each of these called in the loop() function?
grep -n "\.tick\|\.update\|\.render\|\.step" src/main.js | head -40
```

### F. Game Loop Branches — Dead or Broken

```bash
# Find all gameMode branches in the loop
grep -n "gameMode ===\|gameMode ==\|case.*gameMode\|if.*gameMode" src/main.js | head -40

# For each branch, check that it calls .update() AND .render() AND returns/continues
# A branch that doesn't return will fall through to grid rendering
```

### G. HUD Data Set but Never Displayed

```bash
# Check what session data is being tracked vs what's shown in pause/HUD
grep -n "window\._emotion\|window\._purg\|window\._lucid\|window\._tmods\|window\._shooter\|window\._session" src/main.js | head -30
# Are all of these read in renderer.js or menus.js?
grep -n "_emotion\|_purg\|_lucid\|_tmods\|_shooter\|_session" src/ui/renderer.js src/ui/menus.js 2>/dev/null | head -30
```

### H. Event Handlers — Missing Connections

```bash
# Find all "on*" methods defined across systems
grep -rn "^\s*on[A-Z]\w*(" src/systems/ --include="*.js" | grep -v node_modules | head -30
# Are these called from main.js at the right moments?
grep -rn "on[A-Z]\w*(" src/main.js | head -30
```

---

## Produce a Written Inventory

Before touching ANY code, write this report to `docs/wiring-audit-YYYY-MM-DD.md`:

```markdown
# Wiring Audit — [DATE]

## CATEGORY A: Imports Never Used
[list each]

## CATEGORY B: Exports Never Imported
[list each]

## CATEGORY C: window._ Set But Never Read
[list each]

## CATEGORY D: Stubs / TODOs
[list each with file:line]

## CATEGORY E: Systems Not Ticked in Loop
[list each]

## CATEGORY F: Dead/Broken Game Loop Branches
[list each with what's missing]

## CATEGORY G: HUD Data Never Displayed
[list each]

## CATEGORY H: Event Handlers Never Called
[list each]

## PRIORITY ORDER FOR FIXING
P1 (blocks gameplay): [list]
P2 (data tracked but invisible): [list]
P3 (cleanup / dead code): [list]
```

---

## Fix Protocol

Work through the inventory in priority order. For each item:

### P1 — Blocks Gameplay (fix immediately)

**Game loop branch not calling render:**
```js
// Pattern: mode has update() but not render() called
if (gameMode === 'meditation') {
  meditationMode.update(dt, keys, matrixActive, ts);
  // MISSING: meditationMode.render(ctx, ts, { w, h, DPR });   ← add this
  animId = requestAnimationFrame(loop);
  return;
}
```

**Mode crashes on init (silent error):**
```js
// Wrap all mode.init() calls
try {
  modeInstance.init(config);
} catch (e) {
  console.error(`[${modeName}] init failed:`, e);
  // Show placeholder instead of freezing
  gameMode = 'placeholder';
  window._placeholderMode = modeName;
}
```

**Missing `return` after non-grid mode render (falls through to drawGame):**
```js
if (gameMode === 'shooter') {
  shooterMode.render(ctx, ts, { w, h, DPR });
  animId = requestAnimationFrame(loop);
  return;  // ← THIS RETURN IS CRITICAL. Without it, drawGame() runs too.
}
```

### P2 — Data Tracked But Invisible (wire to display)

**window._ writes with no corresponding reads:**

For each unread `window._X`:
1. Find where X would logically appear (HUD, pause menu, interlude screen)
2. Add a read in that renderer
3. Keep it simple — even a small text label counts as "wired"

Example pattern:
```js
// In renderer.js drawHUD():
const luc = window._dreamYoga?.lucidity || 0;
if (luc > 0) {
  ctx.fillStyle = '#8888ff';
  ctx.font = '11px monospace';
  ctx.fillText(`LUC ${Math.round(luc)}`, x, y);
}
```

**EmotionalField data not in HUD:**

The emotional field tracks valence/coherence/distortion/realm. If these aren't visible:
```js
// In renderer.js, add to drawHUD():
const ef = window._efState; // must be set in main.js loop
if (ef) {
  // Realm label (already exists? confirm)
  // Coherence bar (small, below energy bar)
  // Dominant emotion (text, colored)
}
```

**Session patterns not in pause menu:**
- `window._sessionPatterns` → should appear in a "Patterns" tab in pause
- If pause menu doesn't have a Patterns tab, add one (simple: just show the data as text)

### P3 — Dead Code Cleanup

For exported symbols that are never imported anywhere:
- If the system is planned but unbuilt: add a comment `// Reserved for [TASK_ID]`
- If the system is genuinely abandoned: remove the export (and the function if nothing internal uses it)
- Do NOT remove anything that a future task document references — check `docs/tasks/` first

For TODOs that are simple (one-liner fixes):
- Fix them inline
- If complex, create a new task file `docs/tasks/task-WIRE-FOLLOWUP.md` listing them

---

## Game Loop Completeness Check

After fixes, verify the game loop handles every registered mode:

```bash
# Get all mode IDs from GAME_MODES
node -e "
const { GAME_MODES } = await import('./src/ui/menus.js');
GAME_MODES.forEach(m => console.log(m.id));
" 2>/dev/null

# For each ID, confirm there's a branch in main.js loop:
# grep -n "gameMode === 'EACH_ID'" src/main.js
```

Every mode ID must have either:
1. A `if (gameMode === 'X') { ... update ... render ... return; }` branch, OR
2. A documented reason it routes through the grid renderer (only `grid` and `grid_*` variants should do this)

---

## Scheduled Recurrence

This task should run automatically:
- After every completed feature sprint (MODES2, FEEDBACK1, BOT1, etc.)
- Before any new major feature begins
- As a scheduled GitHub Action (weekly, Monday mornings)

To schedule as agentic workflow, add to `.github/workflows/wiring-audit.md`:
```yaml
---
trigger:
  schedule: "0 9 * * 1"  # Monday 9am UTC
permissions:
  contents: write
  pull-requests: write
---
Run the wiring audit task from docs/tasks/task-WIRE1.md.
Write the audit report to docs/wiring-audit-{date}.md.
If any P1 issues are found, open a PR with fixes.
If only P2/P3 issues, open a PR with the audit report only (no code changes).
```

---

## Verification

After completing all fixes:

```bash
# Build must pass
npm run build

# Run manual smoke test for each mode:
# For each entry in GAME_MODES, verify:
# [ ] Mode launches without freeze
# [ ] Mode renders something (not black screen, not grid for non-grid modes)
# [ ] ESC pauses properly
# [ ] No console errors on launch

# Verify HUD data pipeline:
# [ ] LUC bar visible during Grid Classic
# [ ] Emotion/realm label visible in HUD or pause
# [ ] Session patterns in pause menu
# [ ] Temporal system (planet/phase) visible somewhere

# Commit message:
# feat: WIRE1 wiring audit — [N] connections fixed, [M] dead code removed
```

---

## Future Approach After WIRE1

Once this audit is clean, the development philosophy shifts:

**One combination at a time.** Each new feature, refinement, or story addition targets a specific:
- Game mode (e.g. Grid Classic)
- Dreamscape (e.g. Void State)  
- Cosmology (e.g. Hindu Chakras)
- Play style (e.g. Classic Arcade)

This combination is fully built, tested, and verified before moving to the next. No more "add it everywhere at once" — scope tightly, ship clean.

Track this in `docs/COMBINATION_ROADMAP.md` (create when WIRE1 is complete).
