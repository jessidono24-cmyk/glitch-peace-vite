# Task MODES3 — De-Grid Non-Grid Modes + Critical Fixes
## Based on actual source code audit of main.js, play-modes.js, mode-manager.js

**Priority: CRITICAL**
**Branch: fix/modes3-degrid**

---

## Audit Summary (Already Complete)

Reading `main.js` lines 144, 555–640, 1240–1290 and `play-modes.js` lines 115–175:

**Root cause of grids appearing in ornithology/mycology/architecture:**

These three are `playModeId` values in `play-modes.js`. When selected from the mode menu, `gameMode` is set to `'ornithology'` etc. but the game loop has NO `if (gameMode === 'ornithology')` branch. The loop falls through to `drawGame()` (the grid renderer). `applyPlayMode()` seeds birds/mushrooms into the grid tiles, so the player sees a grid with bird emoji tiles. It's still a grid. Always was.

**Game loop explicitly handles:** `rhythm`, `shooter`, `constellation`, `meditation`, `coop` — these have proper `update/render` calls and `return` statements.

**Game loop does NOT handle:** `ornithology`, `mycology`, `architecture`, `rpg`, `alchemy` (as standalone modes), `learning_hub` — all fall through to grid.

---

## Fix 1: Remove Duplicate Modes from GAME_MODES

In `src/ui/menus.js`, find the `GAME_MODES` export array:

**Constellation:** Keep `id: 'constellation'` (ConstellationMode class, star navigation). Remove `id: 'skymap'` (play style variant, also renders a grid with star tiles). The `skymap` play style can remain in `play-modes.js` as an optional play style for Grid Classic — just remove it from GAME_MODES.

**Shooter:** Keep `id: 'shooter'` (ShooterMode class, working arena). Remove any second shooter entry (first person, twin stick, or duplicate). The working shooter is the keeper.

```bash
# Verify after edit:
node -e "
const src = require('fs').readFileSync('src/ui/menus.js', 'utf8');
const ids = [...src.matchAll(/id:\s*['\"](\w+)['\"][^}]*name:/g)].map(m => m[1]);
console.log('Mode IDs:', ids);
const dupes = ids.filter((id,i) => ids.indexOf(id) !== i);
console.log('Duplicates:', dupes.length ? dupes : 'none');
"
```

---

## Fix 2: Add "QUIT TO MAIN MENU" to Pause Menu

In `src/ui/menus.js`, add `'QUIT TO MENU'` as the last item in the pause options array.

In `src/main.js`, find the pause menu selection handler. There's already an `else` branch around line 1436 that does the quit logic. Make sure the index of `'QUIT TO MENU'` maps to that branch and that all modes clean up properly:

```js
// The quit branch should handle all gameModes:
else {
  if (gameMode === 'shooter') shooterMode.paused = false;
  // Add cleanup for other modes if they have paused state:
  // rhythmMode, constellationMode, meditationMode don't need explicit unpause
  sessionTracker.endSession(0, 0);
  gameMode = 'grid';
  window._placeholderMode = null;
  window._ornithWorld = null;
  window._mycelWorld = null;
  setPhase('title');
  CURSOR.menu = 0;
  CURSOR.pause = 0;
  game = null;
}
```

---

## Fix 3: Alchemy Freeze — Error Boundary

In `src/main.js` around line 1088 where `alchemySystem.tick()` is called:

```js
// Replace bare alchemySystem.tick() with:
try {
  alchemySystem.tick();
} catch(e) {
  console.error('[Alchemy] tick crashed:', e);
  window._alchemyDisabled = true;
}
```

Also find where the Three.js boss/alchemy renderer is called and wrap it:
```js
// Find boss-renderer-3d or void-nexus-3d render calls
// Wrap each in try/catch so a 3D crash doesn't freeze the whole game
```

If alchemy is selected as a standalone game mode (via GAME_MODES), it should show the placeholder (Fix 6 below) rather than launching into a freezing 3D scene.

---

## Fix 4: Ornithology — Free Space 2D World

When `chosen === 'ornithology'` in the mode select handler, do NOT call `startGame()`. Create a free-space world instead.

**In mode select handler (main.js ~line 1261), add:**
```js
} else if (chosen === 'ornithology') {
  window._ornithWorld = createOrnithWorld(w, h);
  setPhase('playing');
  cancelAnimationFrame(animId); animId = requestAnimationFrame(loop);
```

**Add these functions to main.js (or a new `src/modes/ornithology-mode.js` imported into main.js):**

```js
function createOrnithWorld(w, h) {
  const SPECIES = [
    { emoji: '🐦', name: 'Sparrow',  speedBase: 70,  behavior: 'flock' },
    { emoji: '🦅', name: 'Hawk',     speedBase: 120, behavior: 'soar'  },
    { emoji: '🦆', name: 'Duck',     speedBase: 50,  behavior: 'wander'},
    { emoji: '🦜', name: 'Parrot',   speedBase: 90,  behavior: 'perch' },
    { emoji: '🦉', name: 'Owl',      speedBase: 40,  behavior: 'hunt'  },
    { emoji: '🕊️', name: 'Dove',    speedBase: 65,  behavior: 'flock' },
    { emoji: '🦚', name: 'Peacock',  speedBase: 30,  behavior: 'wander'},
  ];
  const birds = [];
  for (let i = 0; i < 14; i++) {
    const sp = SPECIES[i % SPECIES.length];
    birds.push({
      x: Math.random() * w, y: 80 + Math.random() * (h - 160),
      vx: (Math.random() - 0.5) * sp.speedBase,
      vy: (Math.random() - 0.5) * sp.speedBase * 0.4,
      species: sp, observed: false, observeTimer: 0,
    });
  }
  return { birds, playerX: w/2, playerY: h/2, observed: 0, notebook: [], target: 7 };
}

function updateOrnithWorld(world, dt, keys, w, h) {
  const spd = 200;
  if (keys['w'] || keys['ArrowUp'])    world.playerY = Math.max(40, world.playerY - spd*dt);
  if (keys['s'] || keys['ArrowDown'])  world.playerY = Math.min(h-40, world.playerY + spd*dt);
  if (keys['a'] || keys['ArrowLeft'])  world.playerX = Math.max(40, world.playerX - spd*dt);
  if (keys['d'] || keys['ArrowRight']) world.playerX = Math.min(w-40, world.playerX + spd*dt);

  for (const b of world.birds) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 0 || b.x > w)    { b.vx *= -1; b.x = Math.max(0, Math.min(w, b.x)); }
    if (b.y < 80 || b.y > h-60) { b.vy *= -1; b.y = Math.max(80, Math.min(h-60, b.y)); }
    b.vx += (Math.random()-0.5) * 30 * dt;
    b.vy += (Math.random()-0.5) * 15 * dt;
    const spd = Math.hypot(b.vx, b.vy);
    const max = b.species.speedBase;
    if (spd > max) { b.vx = b.vx/spd*max; b.vy = b.vy/spd*max; }

    if (!b.observed) {
      const dist = Math.hypot(b.x - world.playerX, b.y - world.playerY);
      if (dist < 90) {
        b.observeTimer += dt;
        if (b.observeTimer >= 1.5) {
          b.observed = true;
          world.observed++;
          world.notebook.push(b.species.name);
        }
      } else {
        b.observeTimer = Math.max(0, b.observeTimer - dt * 0.5);
      }
    }
  }
}

function renderOrnithWorld(ctx, world, w, h) {
  // Sky gradient — no grid
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#050e1a'); sky.addColorStop(0.5, '#0d2010'); sky.addColorStop(1, '#0a1808');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

  // Subtle horizon line
  ctx.strokeStyle = 'rgba(100,180,100,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h*0.6); ctx.lineTo(w, h*0.6); ctx.stroke();

  // Birds
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of world.birds) {
    ctx.globalAlpha = b.observed ? 0.35 : 1;
    ctx.font = '26px serif';
    ctx.fillText(b.species.emoji, b.x, b.y);
    if (!b.observed && b.observeTimer > 0) {
      ctx.globalAlpha = b.observeTimer / 1.5 * 0.8;
      ctx.strokeStyle = '#88ffaa'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 44 - b.observeTimer*8, 0, Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#88ffaa'; ctx.font = '10px monospace';
      ctx.fillText(b.species.name, b.x, b.y + 26);
    }
  }
  ctx.globalAlpha = 1;

  // Player (binoculars)
  ctx.font = '28px serif'; ctx.fillText('🔭', world.playerX, world.playerY);

  // HUD — top bar
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = '14px monospace';
  ctx.fillStyle = '#88ffaa';
  ctx.fillText(`🐦 ${world.observed}/${world.birds.length}  ·  Score: ${world.observed * 150}  ·  Lv.1`, w*0.25, 32);
  ctx.fillStyle = '#446644'; ctx.font = '12px monospace';
  ctx.fillText(`Notebook: ${world.observed} species`, w*0.25, 52);
  ctx.fillStyle = '#334433'; ctx.font = '11px monospace';
  ctx.fillText('WASD move  ·  approach birds slowly to observe  ·  ESC pause', w/2, h - 20);
  ctx.textAlign = 'center';
}
```

**In the game loop, add BEFORE grid fallthrough:**
```js
// ── Ornithology: free-space bird watching ─────────────────────────
if (gameMode === 'ornithology') {
  if (!window._ornithWorld) window._ornithWorld = createOrnithWorld(w, h);
  updateOrnithWorld(window._ornithWorld, dt, keys, w, h);
  renderOrnithWorld(ctx, window._ornithWorld, w, h);
  drawAchievementPopup(ctx, w, h, achievementSystem.popup, ts);
  animId = requestAnimationFrame(loop);
  return;  // CRITICAL — prevents grid fallthrough
}
```

---

## Fix 5: Mycology — Graph/Node Network

Same pattern. No grid — a network of connected nodes on a dark background.

**In mode select handler:**
```js
} else if (chosen === 'mycology') {
  window._mycelWorld = createMycelWorld(w, h);
  setPhase('playing');
  cancelAnimationFrame(animId); animId = requestAnimationFrame(loop);
```

**Add `createMycelWorld`, `updateMycelWorld`, `renderMycelWorld` functions:**

```js
function createMycelWorld(w, h) {
  const count = 22;
  const nodes = Array.from({length: count}, (_, i) => ({
    id: i, x: 60 + Math.random()*(w-120), y: 80 + Math.random()*(h-180),
    connections: [], visited: false, pulsing: false, pulseT: 0,
    type: i < 3 ? 'hub' : 'node',
  }));
  // Seed a few starter connections
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(Math.random()*count), b = Math.floor(Math.random()*count);
    if (a !== b && !nodes[a].connections.includes(b)) {
      nodes[a].connections.push(b); nodes[b].connections.push(a);
    }
  }
  // Player starts at node 0
  nodes[0].visited = true;
  return { nodes, playerNodeId: 0, spores: count, connected: 1 };
}

function renderMycelWorld(ctx, world, w, h) {
  ctx.fillStyle = '#020a04'; ctx.fillRect(0, 0, w, h);
  const ns = world.nodes;

  // Draw edges
  for (const n of ns) {
    for (const cid of n.connections) {
      const c = ns[cid];
      const grad = ctx.createLinearGradient(n.x, n.y, c.x, c.y);
      grad.addColorStop(0, 'rgba(80,200,80,0.4)');
      grad.addColorStop(1, 'rgba(40,120,40,0.2)');
      ctx.strokeStyle = grad; ctx.lineWidth = n.visited && c.visited ? 2 : 0.5;
      ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    }
  }

  // Draw nodes
  for (const n of ns) {
    const r = n.type === 'hub' ? 14 : 8;
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
    ctx.fillStyle = n.id === world.playerNodeId ? '#88ffaa'
                  : n.visited ? 'rgba(60,160,60,0.8)' : 'rgba(30,70,30,0.6)';
    ctx.fill();
    if (n.id === world.playerNodeId) {
      ctx.strokeStyle = '#aaffcc'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // HUD
  ctx.textAlign = 'left'; ctx.font = '14px monospace'; ctx.fillStyle = '#88ffaa';
  ctx.fillText(`🍄 ${world.connected}/${world.nodes.length}  ·  Score: ${world.connected*100}  ·  Lv.1`, w*0.25, 32);
  ctx.fillStyle = '#336633'; ctx.font = '11px monospace';
  ctx.fillText('WASD navigate nodes  ·  grow the mycelium network  ·  ESC pause', w/2, h-20);
  ctx.textAlign = 'center';
}
```

**In game loop:**
```js
// ── Mycology: graph/node network ─────────────────────────────────────
if (gameMode === 'mycology') {
  if (!window._mycelWorld) window._mycelWorld = createMycelWorld(w, h);
  // updateMycelWorld handles player movement between nodes
  renderMycelWorld(ctx, window._mycelWorld, w, h);
  animId = requestAnimationFrame(loop);
  return;
}
```

---

## Fix 6: All Other Unhandled Modes — Styled Full-Screen Placeholders (Not Grid)

For every mode in GAME_MODES that has no dedicated renderer yet (RPG, Architecture, Learning Hub, etc.):

**In mode select handler, add a catch-all AFTER all specifically handled modes:**
```js
} else {
  // Mode in menu but renderer not yet built
  window._placeholderMode = { id: chosen, name: GAME_MODES[CURSOR.modesel].name };
  setPhase('playing');
  cancelAnimationFrame(animId); animId = requestAnimationFrame(loop);
}
```

**In the game loop, add BEFORE the grid section (the grid section should be LAST):**
```js
// ── Placeholder for modes not yet rendered ───────────────────────────
if (window._placeholderMode && !['grid','shooter','constellation','meditation','coop','rhythm','ornithology','mycology'].includes(gameMode)) {
  const pm = window._placeholderMode;
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, w, h);
  const PCOLORS = { rpg:'#cc8844', architecture:'#8844cc', alchemy:'#44ccbb', learning_hub:'#4488cc', language:'#4488ff' };
  ctx.fillStyle = PCOLORS[pm.id] || '#44cc88';
  ctx.font = `${Math.max(18, Math.floor(h*0.045))}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pm.name.toUpperCase(), w/2, h/2 - 44);
  ctx.fillStyle = '#445';
  ctx.font = `${Math.max(13, Math.floor(h*0.022))}px monospace`;
  ctx.fillText('Coming Soon', w/2, h/2 + 10);
  ctx.fillStyle = '#334';
  ctx.font = '13px monospace';
  ctx.fillText('ESC to return', w/2, h/2 + 55);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  animId = requestAnimationFrame(loop);
  return;  // CRITICAL — prevents grid fallthrough
}
```

---

## Fix 7: Options "ARCH4" Label

In `src/ui/menus.js`:
```bash
grep -n "ARCH4" src/ui/menus.js
```
Replace the `'ARCH4: ...'` string with `'TIMEZONE (UTC)'`.

---

## Verification Checklist

```
[ ] GAME_MODES: exactly ONE constellation entry, ONE shooter entry
[ ] Ornithology → birds floating freely on sky background, ZERO grid tiles visible
[ ] Mycology → dark background with connected nodes and glowing edges, ZERO grid tiles
[ ] RPG → full-screen placeholder (brown/orange), ESC returns to menu
[ ] Architecture → full-screen placeholder (purple), ESC returns
[ ] Alchemy → does NOT freeze (error boundary in place)
[ ] Pause menu has "QUIT TO MAIN MENU" as last item
[ ] QUIT TO MAIN MENU works from all game modes (grid, shooter, constellation, ornithology, mycology, all placeholders)
[ ] Options shows "TIMEZONE" not "ARCH4"
[ ] npm run build — zero errors
[ ] All previously working modes (grid, shooter, constellation, rhythm, meditation) still work
```
