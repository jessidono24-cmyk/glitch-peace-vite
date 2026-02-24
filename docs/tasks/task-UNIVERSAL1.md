# Task UNIVERSAL1 — Verify + Apply All Previous Tasks + Full Audit + Deduplication

## Context
Despite many merged PRs, the game still shows:
- Black screen on open (no "CONSCIOUSNESS SIMULATION LOADING" text)
- Main menu: [GRID MODE] label still present
- Main menu: SELECT MODE and SELECT DREAMSCAPE still top-level items
- Grid tiles bleeding into all non-grid game modes
- Canvas not filling full screen (black borders visible)
- Menus not taking up full screen

This task FIRST verifies what actually exists in the code, THEN applies
every fix directly, THEN does the deduplication and organization.

## The Rule
Read the actual file before writing any fix. Do not assume a previous
task was applied — confirm it by reading the source.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Opening: black screen → "CONSCIOUSNESS SIMULATION LOADING" fades in → main menu
- [ ] Main menu: START JOURNEY / CONTINUE / HOW TO PLAY / OPTIONS / HIGH SCORES only
- [ ] NO [GRID MODE] label anywhere on title/main menu screen
- [ ] NO SELECT MODE or SELECT DREAMSCAPE on main menu
- [ ] Navigation: Start Journey → memory slots → MODE → DREAMSCAPE → COSMOLOGY → Play
- [ ] NO playstyle screen in the navigation flow
- [ ] Grid tiles ONLY in Grid Navigator mode — absent from all other modes
- [ ] Canvas fills 100% of screen — no black bars on any side
- [ ] All menus fill full screen
- [ ] Font is readable (minimum 14px)
- [ ] _archive renamed to old-game-archive
- [ ] No duplicate files (README, main.js, renderer.js, menus.js, etc.)
- [ ] temp_index.html removed or merged
- [ ] README.md reflects all completed tasks
- [ ] PLAYTEST4 runs and shows 0 automated failures

---

## PHASE 1: READ THE ACTUAL SOURCE FILES

Before writing a single line of code, read these files completely:

```bash
cat index.html
cat src/main.js
cat src/ui/menus.js | head -200
cat src/ui/renderer.js | head -200
```

Then answer these questions by reading the code:

### Q1: What is the actual canvas sizing code?
```bash
grep -n "canvas.width\|canvas.height\|innerWidth\|innerHeight\|vw\|vh\|100%" index.html src/main.js src/ui/renderer.js | grep -v node_modules | head -30
```

### Q2: Where is the loading screen drawn (if anywhere)?
```bash
grep -n "loading\|LOADING\|consciousness simulation\|CONSCIOUSNESS" src/main.js src/ui/menus.js | head -20
```

### Q3: What are the actual main menu items in the code right now?
```bash
grep -n "GRID MODE\|grid.mode\|menuItems\|menu_items\|START JOURNEY\|SELECT MODE\|SELECT DREAMSCAPE\|CONTINUE\|HOW TO PLAY" src/ui/menus.js | head -30
```

### Q4: Where is the grid drawn and is it mode-gated?
```bash
grep -n "drawGrid\|drawTile\|drawTiles\|renderGrid\|strokeRect\|tile\b" src/ui/renderer.js | head -30
grep -n "modeId\|mode\.id\|currentMode\|state\.mode\b" src/ui/renderer.js | head -20
```

### Q5: What is the navigation flow?
```bash
grep -n "setPhase\|phase =\|'mode_select'\|'dreamscape'\|'playstyle'\|'cosmology'\|'memory'" src/main.js | head -40
```

### Q6: What font is being used and at what sizes?
```bash
grep -n "ctx\.font\|font.*px\|Courier\|Share Tech\|monospace" src/ui/renderer.js src/ui/menus.js | head -30
```

---

## PHASE 2: APPLY ALL FIXES (based on what Phase 1 reveals)

Work through each fix one at a time. After each fix: `npm run build`.
If build fails, revert that fix before continuing.

### FIX A: Canvas Full Screen

In `index.html`, ensure the `<style>` block contains:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100vw !important;
  height: 100vh !important;
  display: block;
}
```

In `src/main.js`, find where canvas is created/sized. Replace or add:
```js
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
```

If W/H constants are used throughout for drawing, also set:
```js
// After resizeCanvas:
let W = canvas.width;
let H = canvas.height;
// Update them inside resizeCanvas too
```

### FIX B: Loading Screen

Find exactly where the game first starts rendering (look for the first
`requestAnimationFrame` or game loop start in `src/main.js`).

BEFORE the game loop or title phase is set, insert:

```js
// Loading screen — runs once on startup
const FONT = "'Share Tech Mono', monospace";
let _loadProgress = 0;
const _loadInterval = setInterval(() => {
  _loadProgress = Math.min(1, _loadProgress + 0.04);
  
  // Draw loading screen
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (_loadProgress > 0.1) {
    const alpha = Math.min(1, (_loadProgress - 0.1) * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#1a4433';
    ctx.font = Math.round(canvas.width * 0.022) + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText(
      'CONSCIOUSNESS SIMULATION LOADING',
      canvas.width / 2,
      canvas.height / 2
    );
    // Progress bar
    const bw = canvas.width * 0.25;
    const bx = (canvas.width - bw) / 2;
    const by = canvas.height / 2 + 50;
    ctx.fillStyle = '#0a2211';
    ctx.fillRect(bx, by, bw, 2);
    ctx.fillStyle = '#00aa66';
    ctx.fillRect(bx, by, bw * _loadProgress, 2);
    ctx.globalAlpha = 1;
  }
  
  if (_loadProgress >= 1) {
    clearInterval(_loadInterval);
    // START the actual game here — set to title phase
    if (typeof setPhase === 'function') setPhase('title');
    else if (typeof setState === 'function') setState({ phase: 'title' });
    // Whatever the game uses to transition to title
  }
}, 80);
```

Make sure the game loop does NOT start until after loading completes.

### FIX C: Clean Main Menu Items

In `src/ui/menus.js`, find the array or block that defines main menu items.

**Search:**
```bash
grep -n "items\|options\|menu\[" src/ui/menus.js | grep -i "=\s*\[" | head -10
```

**Replace with exactly these items:**
```js
const MAIN_MENU_ITEMS = [
  { id: 'start',       label: 'START JOURNEY' },
  { id: 'continue',    label: 'CONTINUE' },
  { id: 'how_to_play', label: 'HOW TO PLAY' },
  { id: 'options',     label: 'OPTIONS' },
  { id: 'high_scores', label: 'HIGH SCORES' },
];
```

Then find and delete (or comment out) every line that draws or references:
- "GRID MODE" or "GRID-CLASSIC"
- "SELECT MODE" as a menu item
- "SELECT DREAMSCAPE" as a menu item
- "UPGRADES" as a menu item

```bash
grep -n "GRID.MODE\|GRID-CLASSIC\|Select Mode\|Select Dreamscape\|UPGRADES\|upgrade" src/ui/menus.js
```

Delete those render lines.

### FIX D: Navigation Flow

Find every `setPhase(` call in `src/main.js` and map the full flow:

```bash
grep -n "setPhase\|phase\s*=" src/main.js | head -50
```

The correct forward flow must be exactly:
```
loading → title → memory_select → mode_select → dreamscape_select → cosmology_select → playing
```

Fix rules:
- If `playstyle_select` or `playstyle` appears in the forward flow → remove it
- If `mode_select` appears more than once in forward flow → remove the duplicate
- If `dreamscape_select` appears before `mode_select` → swap them
- ESC/back from each step returns to the previous step

### FIX E: Grid Tile Isolation

In `src/ui/renderer.js`, find the main render function.

```bash
grep -n "^function render\|^export function render\|function draw\b\|requestAnimationFrame" src/ui/renderer.js | head -10
```

Find where grid tiles are drawn. It will be something like:
```js
drawGrid(ctx, state);
// or
for (let row...) { for (let col...) { drawTile(...) } }
```

Wrap it in a mode check:
```js
const gridModes = ['grid', 'rpg', 'grid_roguelike', 'grid-classic'];
const isGridMode = gridModes.includes(state.modeId || state.mode?.id || state.currentMode || '');

if (isGridMode) {
  drawGrid(ctx, state); // or whatever the grid draw call is
}
```

If you cannot find `state.modeId`, search for how the mode is stored:
```bash
grep -n "modeId\|\.mode\b\|currentMode\|activeMode\|selectedMode" src/core/state.js src/main.js | head -20
```

Use whatever property name stores the current mode.

### FIX F: Font Overhaul

In `index.html`, add to `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

At the top of both `src/ui/renderer.js` AND `src/ui/menus.js`, add:
```js
const FONT = "'Share Tech Mono', monospace";
function fs(base) {
  const scale = Math.min(canvas.width / 1280, canvas.height / 720);
  return Math.max(14, Math.round(base * Math.max(scale, 0.85)));
}
```

Replace ALL occurrences of `ctx.font = ` in both files:
```bash
grep -n "ctx\.font\s*=" src/ui/renderer.js src/ui/menus.js | wc -l
```

For each one, replace `Courier New` or `monospace` with `FONT` and 
wrap the px size in `fs()`. Example:
- `ctx.font = '8px Courier New'` → `ctx.font = fs(14) + 'px ' + FONT`
- `ctx.font = '12px monospace'` → `ctx.font = fs(16) + 'px ' + FONT`
- `ctx.font = '20px Courier New'` → `ctx.font = fs(20) + 'px ' + FONT`

### FIX G: HUD Hidden on Menu Screens

Find where HUD is rendered:
```bash
grep -n "drawHUD\|drawBottomBar\|HEALTH\|LEVEL\|SCORE" src/ui/renderer.js | head -20
```

Wrap HUD drawing:
```js
const GAMEPLAY_PHASES = ['playing', 'paused'];
if (GAMEPLAY_PHASES.includes(state.phase)) {
  drawHUD(ctx, canvas, state);
  drawBottomBar(ctx, canvas, state);
}
```

---

## PHASE 3: DEDUPLICATION + ORGANIZATION

Run AFTER all fixes pass `npm run build`.

### 3A: Find all duplicates
```bash
# All README files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" -iname "readme*" | sort

# All identical-named .js files in different locations
find . -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*.js" | \
  xargs -I{} basename {} | sort | uniq -d

# All .md files with duplicate names
find . -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*.md" | \
  xargs -I{} basename {} | sort | uniq -d
```

### 3B: Rename _archive
```bash
mv _archive old-game-archive 2>/dev/null || echo "_archive already renamed or missing"

cat > old-game-archive/README.md << 'EOF'
# Old Game Archive

Pre-v4 game versions. Reference only. Do not import from these files.
Active codebase is entirely in src/.
EOF

# Update any references
grep -rln "_archive" . --include="*.js" --include="*.json" --include="*.html" | \
  grep -v node_modules | grep -v .git | \
  xargs sed -i 's/_archive/old-game-archive/g' 2>/dev/null
```

### 3C: Remove temp_index.html
```bash
if [ -f temp_index.html ]; then
  diff index.html temp_index.html
  # If they're the same or temp is subset: delete
  rm temp_index.html && echo "Removed temp_index.html"
fi
```

### 3D: Consolidate loose .md files
```bash
mkdir -p docs/tasks docs/vision docs/archive

# Move task files
find . -maxdepth 1 -name "task-*.md" -exec mv {} docs/tasks/ \;
find . -maxdepth 1 -name "PLAYTEST*_REPORT.md" -exec mv {} docs/tasks/ \;

# Move vision/design docs (not README)
for f in CANON.md GAMEPLAY_MODES.md ARCHITECTURE.md ROADMAP.md FEATURES.md \
          GAME_PLAN.md VISION.md SOVEREIGN_CODEX.md; do
  [ -f "$f" ] && mv "$f" docs/vision/ && echo "Moved $f to docs/vision/"
done

# Archive everything else that's a loose .md (not README)
for f in *.md; do
  [ "$f" = "README.md" ] && continue
  [ -f "$f" ] && mv "$f" docs/archive/ && echo "Archived $f"
done
```

### 3E: Update README
```bash
cat > README.md << 'READMEEOF'
# GLITCH·PEACE

**A consciousness engine disguised as a video game.**

> v4 · Vite + Three.js · 12 play modes · 18 dreamscapes · 13 cosmologies

GLITCH·PEACE is a therapeutic gaming system built on peer-reviewed research
in psychology, neuroscience, biology, and philosophy. It models consciousness
emergence, emotional regulation, and pattern recognition through play.

## Quick Start
```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

## Play Modes
| Mode | Description |
|------|-------------|
| Grid Navigator | Tile-based tactical — mapping internal terrain |
| Twin-Stick Shooter | Confrontation through combat |
| First Person | Full 3D immersion through dreamscapes |
| Narrative RPG | Identity formation through story |
| Constellation | Connect stars correctly to pass levels |
| Meditation | Stillness, breath, particle visualization |
| Rhythm | Music theory drills and entrainment |
| Alchemy | Rustic chem lab — transmutation mechanics |
| Ornithology | Real bird watching with awe/dread effects |
| Mycology | Fungal networks with perceived effects |
| Architecture | Construction, Engineering, Sacred Geometry, Crafts, AI |
| Learning Hub | Language, Mathematics, Physics, Biology, Psychology + more |

## Completed Tasks
W1·W2 · FIX1-7 · ARCH1-5 · STABLE1-3 · UI1-4 · VIS1 ·
PLAYTEST1-4 · RESEARCH1-2 · MODES1 · CLEANUP1 · AUDIT1 · UNIVERSAL1

## Research
All mechanics mapped to peer-reviewed sources → `docs/research/INDEX.md`

## Structure
```
src/          — all game code
docs/
  research/   — 10-30 peer-reviewed sources per field
  vision/     — CANON, GAMEPLAY_MODES, ROADMAP
  tasks/      — all agent task files
  archive/    — superseded design docs
old-game-archive/ — pre-v4 versions (reference only)
tests/        — Playwright test suite
```
READMEEOF
echo "README.md written"
```

---

## PHASE 4: FINAL VERIFICATION

```bash
# Build
npm run build && echo "✅ BUILD PASSES" || echo "❌ BUILD FAILED — DO NOT COMMIT"

# Check for _archive references remaining
grep -rn "_archive" . --include="*.js" --include="*.json" --include="*.html" | \
  grep -v node_modules | grep -v .git | grep -v old-game-archive

# Confirm grid mode label gone from menus.js
grep -n "GRID MODE\|GRID-CLASSIC\|grid.mode" src/ui/menus.js

# Confirm canvas sized correctly
grep -n "innerWidth\|innerHeight" src/main.js

# Confirm loading screen exists
grep -n "CONSCIOUSNESS SIMULATION\|loadProgress\|loading" src/main.js

# Run playwright
npx playwright test tests/playtest-full.js --timeout=300000
```

If ANYTHING in Phase 4 fails — fix it before committing.

---

## Commit message
```
fix: UNIVERSAL1 -- applied all previous tasks, loading screen, clean menu, grid isolation, full screen, dedup, archive renamed
```
