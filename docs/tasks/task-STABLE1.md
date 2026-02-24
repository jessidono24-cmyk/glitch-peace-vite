# Task STABLE1 — Grid Mode Rendering Isolation

## Goal
The grid canvas renderer is leaking into ALL game modes. Every mode
renders on top of a grid background because the grid drawing code runs
regardless of which mode is active. This task confines grid rendering
strictly to GridMode only.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Grid tiles (teal bordered squares) ONLY appear when GridMode is active
- [ ] Shooter mode shows a plain dark background (no grid)
- [ ] Constellation mode shows a plain dark background (no grid)
- [ ] Meditation mode shows a plain dark background (no grid)
- [ ] All other modes show a plain dark background (no grid)
- [ ] GridMode itself still works exactly as before

## Scope — touch ONLY these files
- `src/ui/renderer.js`
- `src/main.js` (only the section that calls render functions)

---

## Step 1 — Find where grid draws

```bash
grep -n "drawGrid\|drawTile\|drawCell\|grid\|TILE\|tileSize" src/ui/renderer.js | head -40
grep -n "currentMode\|modeId\|activeMode\|renderer\|draw\|render" src/main.js | head -40
```

Find the exact function names that draw the grid tiles.

---

## Step 2 — Find the mode-aware render call

In main.js or renderer.js, find where the render function is called
each frame. It will look something like:

```js
// In the game loop:
renderer.draw(state);
// or
draw(ctx, state);
// or
renderFrame(ctx, gameState);
```

---

## Step 3 — Wrap grid drawing in a mode check

Find the grid drawing code in renderer.js. Wrap it in a mode guard:

```js
// BEFORE:
function drawGrid(ctx, state) {
  // draws all the tiles...
}

// AFTER:
function drawGrid(ctx, state) {
  // Only draw grid when in grid mode
  const activeMode = state.modeId || state.mode || window._currentMode;
  if (activeMode !== 'grid' && activeMode !== 'grid_roguelike' && activeMode !== 'rpg') {
    return; // early exit — no grid for non-grid modes
  }
  // draws all the tiles...
}
```

Note: RPG mode gets the grid too since it's a grid-based RPG.
All other modes (shooter, constellation, meditation, rhythm, etc.) do NOT.

---

## Step 4 — Give non-grid modes a proper background

In renderer.js, find or create a `drawBackground(ctx, state)` function
that runs for ALL modes. For non-grid modes it should just clear to
the appropriate dark color:

```js
function drawBackground(ctx, canvas, state) {
  const modeId = state.modeId || state.mode || 'grid';
  
  // Mode-specific backgrounds
  const BG_COLORS = {
    'grid':          '#0a0a0f',  // near black with blue tint
    'rpg':           '#0a0a0f',
    'shooter':       '#000005',  // deep space black
    'constellation': '#000008',  // deep navy
    'meditation':    '#040810',  // very dark blue-green
    'rhythm':        '#080004',  // very dark purple
    'alchemy':       '#060402',  // very dark amber
    'ornithology':   '#020804',  // very dark forest green
    'mycology':      '#040200',  // very dark earth brown
    'architecture':  '#050508',  // very dark grey-blue
  };
  
  ctx.fillStyle = BG_COLORS[modeId] || '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

Make sure this is called at the START of every frame render, before
anything else is drawn.

---

## Verification
```bash
npm run build
```
Browser:
1. Start game → select Grid mode → teal grid tiles visible ✓
2. Switch to Shooter mode → plain dark space background, NO grid tiles ✓
3. Switch to Constellation mode → plain dark navy background, NO grid ✓
4. Switch back to Grid → grid reappears ✓
5. No console errors on any mode switch

## Commit message
```
fix: STABLE1 grid rendering isolated to GridMode only -- other modes get clean backgrounds
```
