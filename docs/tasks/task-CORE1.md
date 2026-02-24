# Task CORE1 — Fix The Fundamentals (AGAIN, Properly This Time)

## Context
Despite previous tasks, the following are STILL broken:
1. Opening screen is just black — no "consciousness simulation loading" text
2. Main menu still shows [GRID MODE] label
3. Main menu still has "SELECT MODE" and "SELECT DREAMSCAPE" as top-level items
4. Grid tiles still bleed into all game modes
5. Menu run order is still wrong (mode appears twice)
6. Canvas still doesn't fill the full screen

These must be fixed at the SOURCE level. Previous tasks likely wrote
the fix but it wasn't applied to the correct files, or was overwritten.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Opening: black screen → "CONSCIOUSNESS SIMULATION LOADING" fades in with soft tone → main menu
- [ ] Main menu items: START JOURNEY / CONTINUE / HOW TO PLAY / OPTIONS / HIGH SCORES only
- [ ] NO "GRID MODE" label anywhere on main menu
- [ ] NO "SELECT MODE" or "SELECT DREAMSCAPE" on main menu
- [ ] Navigation: Start Journey → 3 memory slots → MODE select → DREAMSCAPE → COSMOLOGY → Play
- [ ] Grid tiles (teal bordered squares) appear ONLY in Grid Navigator mode
- [ ] Canvas fills 100% of viewport — no black borders or voids
- [ ] Verified by running the game locally AND by PLAYTEST4

## Step 1 — Find the actual files being rendered

```bash
# Find main entry point
cat src/main.js | head -50

# Find where menus are drawn
grep -n "GRID MODE\|grid.mode\|grid_mode\|gridMode\|GRID-CLASSIC\|selectMode\|SELECT MODE\|selectDreamscape\|SELECT DREAMSCAPE" src/ui/menus.js | head -20

# Find where grid tiles are rendered
grep -n "drawGrid\|renderGrid\|drawTile\|GRID\|tileColor\|tile_color\|borderColor\|strokeRect" src/ui/renderer.js | head -30

# Find the phase machine
grep -n "phase\|setPhase\|currentPhase\|state\.phase" src/main.js | head -30
```

## Step 2 — Fix the opening sequence

In `src/ui/menus.js` or `src/main.js`, find the title/loading phase.

Add or replace the loading screen with:
```js
// LOADING SCREEN — must be the FIRST thing shown
function drawLoadingScreen(ctx, canvas, progress) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (progress > 0.1) {
    const alpha = Math.min(1, (progress - 0.1) * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#224433';
    ctx.font = Math.round(canvas.width * 0.022) + "px 'Share Tech Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('CONSCIOUSNESS SIMULATION LOADING', canvas.width / 2, canvas.height / 2);
    
    // Progress bar
    const bw = canvas.width * 0.25;
    const bx = (canvas.width - bw) / 2;
    const by = canvas.height / 2 + 40;
    ctx.fillStyle = '#112211';
    ctx.fillRect(bx, by, bw, 2);
    ctx.fillStyle = '#00aa66';
    ctx.fillRect(bx, by, bw * progress, 2);
    ctx.globalAlpha = 1;
  }
}
```

In the game startup, run this for 2.5 seconds before showing title:
```js
let _prog = 0;
const _loader = setInterval(() => {
  _prog = Math.min(1, _prog + 0.04);
  drawLoadingScreen(ctx, canvas, _prog);
  if (_prog >= 1) {
    clearInterval(_loader);
    setPhase('title');
  }
}, 80);
```

Make sure this runs BEFORE any other render call.

## Step 3 — Fix main menu items

In `src/ui/menus.js`, find the menu items array.
Search for it:
```bash
grep -n "menuItems\|MENU_ITEMS\|items =\|\[.*START\|START JOURNEY\|Select Mode\|Select Dreamscape" src/ui/menus.js | head -20
```

Replace the items array with EXACTLY:
```js
const MAIN_MENU_ITEMS = [
  { id: 'start',       label: 'START JOURNEY' },
  { id: 'continue',    label: 'CONTINUE' },
  { id: 'how_to_play', label: 'HOW TO PLAY' },
  { id: 'options',     label: 'OPTIONS' },
  { id: 'high_scores', label: 'HIGH SCORES' },
];
```

Remove ANY item with id/label containing: 'mode', 'dreamscape', 'select', 'upgrade', 'upgrades'.

## Step 4 — Remove GRID MODE label

```bash
grep -n "GRID MODE\|GRID-CLASSIC\|grid mode\|grid_mode\|gridMode" src/ui/menus.js
```

For every match — DELETE that line or the block that renders it.
The label must not appear anywhere on the title or main menu.

## Step 5 — Fix navigation flow

Find the phase transitions. The correct flow is:
```
'loading' → 'title' → 'memory_select' → 'mode_select' → 'dreamscape_select' → 'cosmology_select' → 'playing'
```

```bash
grep -n "setPhase\|phase =\|'mode_select'\|'dreamscape_select'\|'playstyle'" src/main.js | head -30
```

Rules:
- 'mode_select' must appear EXACTLY ONCE in the forward flow
- 'playstyle_select' or 'playstyle' must be DELETED from the forward flow
- ESC from any select screen goes BACK one step
- 'playing' is only reached after cosmology_select

If mode_select appears after cosmology_select — remove the second occurrence.

## Step 6 — Fix canvas fullscreen (find the actual cause)

```bash
# Find ALL places canvas dimensions are set
grep -n "canvas\.width\|canvas\.height\|\.style\.width\|\.style\.height\|W =\|H =\|const W\|const H\|var W\|var H" src/main.js src/ui/renderer.js | head -40

# Find any fixed pixel values
grep -n "[0-9]\{3,4\}px\|width: [0-9]\{3\}\|height: [0-9]\{3\}" index.html src/main.js src/ui/renderer.js

# Check what index.html actually has now
cat index.html
```

The canvas must be sized by:
```js
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

And CSS must have:
```css
canvas { 
  position: fixed; 
  top: 0; left: 0; 
  width: 100vw !important; 
  height: 100vh !important; 
}
```

## Step 7 — Fix grid tile bleed (find the ACTUAL renderer dispatch)

```bash
# Find where grid is drawn in renderer
grep -n "function draw\|drawGrid\|drawTile\|for.*row\|for.*col\|tile\[" src/ui/renderer.js | head -30

# Find mode check
grep -n "modeId\|mode\.id\|currentMode\|state\.mode" src/ui/renderer.js | head -20
```

The grid drawing MUST be wrapped in a mode check:
```js
// In the main render function:
function render(ctx, canvas, state) {
  // Step 1: Draw mode-specific background (always)
  drawModeBackground(ctx, canvas, state);
  
  // Step 2: Draw grid ONLY if in grid/rpg mode
  const isGridMode = ['grid', 'rpg', 'grid_roguelike'].includes(state.modeId);
  if (isGridMode) {
    drawGrid(ctx, canvas, state);    // tiles, borders, everything grid
    drawGridEntities(ctx, state);    // player, enemies on grid
  } else {
    drawModeContent(ctx, canvas, state); // mode-specific content
  }
  
  // Step 3: HUD (only during gameplay)
  if (['playing', 'paused'].includes(state.phase)) {
    drawHUD(ctx, canvas, state);
  }
}
```

If `drawGrid` or `drawTiles` is called unconditionally (no mode check),
that is the bug. Wrap it.

## Step 8 — Verify each fix individually

After each fix, run:
```bash
npm run build && echo "✅ BUILD OK" || echo "❌ BUILD FAILED"
```

Do NOT proceed to next fix if build fails.

## Step 9 — Final run

After all 7 fixes:
```bash
npm run build
npx playwright test tests/playtest-full.js --timeout=300000
```

Check that:
- Loading screen appears ✓
- Main menu is clean ✓  
- Grid tiles absent in non-grid modes ✓
- Navigation flow correct ✓

## Commit message
```
fix: CORE1 fundamentals -- loading screen, clean menu, nav flow, grid isolation
```
