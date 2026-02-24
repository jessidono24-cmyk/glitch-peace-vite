# Task WIRE2 — Connect the Silent Systems: Session Data + Recovery + Cosmology

**Priority: HIGH — many systems run every frame but produce zero player-visible output**
**Branch: feat/wire2-silent-systems**

---

## Pre-Task Audit (Required)

Before doing anything else, audit the codebase and produce a report called AUDIT_REPORT_2.md with three sections:
1. ACTUALLY IMPLEMENTED — features that exist in code AND produce visible output in the browser. For each: file path, one sentence on what it does right now.
2. CODE EXISTS BUT BROKEN/UNWIRED — files with real logic that never get called. For each: file path, why it's broken, what it would need to work.
3. DOCUMENTED ONLY — things in .md files with zero corresponding code.
Do not count something as implemented just because a file exists. Check the import chain from src/main.js. If it's not reachable from main.js, it's not implemented.

---

## Context

The following systems tick every frame and compute real data but their output never reaches the player:

| System | What it computes | Variable set | Currently displayed? |
|--------|-----------------|--------------|---------------------|
| `sessionTracker` | wellness score 0–100 | `window._sessionWellness` | **No** — read in menus.js line 435 but the section it lives in is only shown when `window._shooterState` is set |
| `urgeManagement` | breath animation state | `window._breathState` | **No** — read in menus.js line 470 but the pause menu breath section is gated behind a condition that never fires |
| `cosmologies.js` / `chakraSystem` | cosmology id chosen by player | `CFG.chosenCosmology` | **No** — stored in CFG, passed to `g.cosmology` for display label only, never modifies gameplay |
| `selfReflection` | total reflections count | `window._reflections` | **No** — set line 1398, never read in renderer.js or menus.js |
| `sessionTracker` | dreamscapes completed | `window._dreamscapesThisSession` | **No** — set line 1410, never read |
| `emergenceIndicators` | all-time emergence count | `window._emergenceAllTime` | **No** — set line 1397, never read |
| `chakraSystem` | chakras awakened count | `window._chakraAwakened` | **No** — set line 1399, never read |
| `campaignManager` | tutorial hints array | `window._tutorialHints` | **No** — set line 1442, only `_currentTutorialHint` is read (the indexed single hint), the array itself isn't used |

---

## Fix 1: Session Wellness + Duration — Show in Pause Menu (Always)

**File: `src/ui/menus.js`**

Find the `drawPause` function. Currently the wellness/duration section is nested inside `if (window._shooterState)`. This means it only shows in the shooter. Move it outside so it shows for ALL modes.

Locate approximately line 425–470 in menus.js. The structure looks like:

```js
// Inside drawPause:
const ss = window._shooterState;
if (ss) {
  // shooter stats
}
const wellness = window._sessionWellness;
const duration = window._sessionDuration || '00:00';
```

Restructure so the wellness/duration block shows unconditionally. Use this layout at the top of the pause menu stats section:

```js
// Session line — always visible
const wellness   = window._sessionWellness ?? '--';
const duration   = window._sessionDuration   || '00:00';
const dreamsDone = window._dreamscapesThisSession ?? 0;
const emerge     = window._emergenceAllTime  ?? 0;

// Draw session bar
ctx.font = '12px monospace';
ctx.textAlign = 'center';
ctx.fillStyle = '#556677';
ctx.fillText(
  `SESSION ${duration}  ·  WELLNESS ${typeof wellness === 'number' ? Math.round(wellness) : '--'}  ·  DREAMSCAPES ${dreamsDone}  ·  EMERGENCE ${emerge}`,
  w / 2, pauseY + 28  // adjust pauseY to wherever the first line of stats begins
);
```

The exact `pauseY` value will depend on what's above it — find where other pause stats are drawn and place this line just below the mode label.

---

## Fix 2: Breath Circle — Show During Urge Tool Activation

**File: `src/ui/menus.js`**

`window._breathState` is set in main.js when the player activates the urge management tool (keyboard shortcut, lines ~2001–2008). The pause menu reads `window._breathState` at line 470 but the render block is likely gated. Find it and ensure it draws unconditionally when `breath.isActive === true`.

The breath state object has shape:
```js
{ isActive: true, radius: 0–1, cycles: number, phrase: string }
```

If the breath visualization block doesn't exist yet or is commented out, add it to `drawPause`:

```js
const breath = window._breathState;
if (breath?.isActive) {
  const cx = w / 2;
  const cy = h * 0.52;
  const maxR = Math.min(w, h) * 0.12;
  const r = maxR * (0.4 + breath.radius * 0.6);

  // Outer glow
  ctx.save();
  ctx.shadowColor = '#00ccff';
  ctx.shadowBlur  = 20;
  ctx.strokeStyle = `rgba(0, 180, 255, ${0.3 + breath.radius * 0.5})`;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Phrase label
  ctx.font      = '13px monospace';
  ctx.fillStyle = '#88ddff';
  ctx.textAlign = 'center';
  ctx.fillText(breath.phrase || '', cx, cy + maxR + 22);
  ctx.fillText(`Cycle ${breath.cycles}`, cx, cy + maxR + 40);
}
```

---

## Fix 3: Cosmology — Actually Modify Gameplay

**File: `src/main.js`** — in `initGame()` and/or `startGame()`

Currently `CFG.chosenCosmology` is stored but never used to change anything. The cosmology system runs (`chakraSystem.tick()`), but the chosen cosmology has zero effect on enemy speed, insight multipliers, tile spawn rates, or any mechanic.

Add cosmology modifiers in `initGame()`, immediately after `applyPlayMode(g, ...)` (around line 570):

```js
// ── Cosmology modifiers ────────────────────────────────────────────────
if (CFG.chosenCosmology) {
  const COSMO_MODS = {
    // Hindu chakras — ascending levels, more insight reward
    'hindu_chakra':      { insightMul: 1.4, enemyMul: 1.0, healMul: 1.1 },
    // Buddhist wheel — impermanence: enemies faster, peace tiles more valuable
    'buddhist_wheel':    { insightMul: 1.6, enemyMul: 1.2, healMul: 0.9 },
    // Norse yggdrasil — nine realms, high challenge
    'norse_yggdrasil':   { insightMul: 1.3, enemyMul: 1.3, healMul: 1.0 },
    // Hermetic — as above so below: modifiers mirror each other
    'hermetic':          { insightMul: 1.2, enemyMul: 1.2, healMul: 1.2 },
    // Taoist wu wei — low resistance: enemies slower, flow rewarded
    'taoist_wu_wei':     { insightMul: 1.1, enemyMul: 0.8, healMul: 1.3 },
    // Gnostic veil — hidden challenge
    'gnostic_veil':      { insightMul: 1.5, enemyMul: 1.1, healMul: 0.8 },
    // Order vs entropy
    'order_entropy':     { insightMul: 1.2, enemyMul: 1.4, healMul: 0.9 },
    // Seven universal laws
    'seven_laws':        { insightMul: 1.3, enemyMul: 1.1, healMul: 1.1 },
  };

  const cosmoKey = Object.keys(COSMO_MODS).find(k =>
    CFG.chosenCosmology?.toLowerCase().includes(k.split('_')[0])
  ) || null;

  if (cosmoKey) {
    const mod = COSMO_MODS[cosmoKey];
    g.insightMulMode  = (g.insightMulMode  || 1) * mod.insightMul;
    g.enemySpeedMul   = (g.enemySpeedMul   || 1) * mod.enemyMul;
    g.autoHealRate    = (g.autoHealRate    || 0) + (mod.healMul - 1) * 0.05;
    g._cosmologyActive = cosmoKey; // store for HUD display
  }
}
```

**Then expose it to the HUD** — in the section where `window._chakra` and cosmology label are set (main.js ~line 1389), add:

```js
window._cosmologyMod = game?._cosmologyActive || CFG.chosenCosmology || null;
```

**In `src/ui/renderer.js`**, find where the cosmology/realm label is drawn in the HUD (near `window._chakra` read, around line 1599). Below the existing chakra line, add one line showing the active cosmology modifier:

```js
const cosmoMod = window._cosmologyMod;
if (cosmoMod) {
  ctx.font      = fs(10, ctx.canvas) + 'px ' + FONT;
  ctx.fillStyle = '#aa88ff';
  ctx.textAlign = 'right';
  ctx.fillText(cosmoMod.replace(/_/g, ' ').toUpperCase(), w - 12, 78);
}
```

---

## Fix 4: Reflections Count — Show in Dashboard

**File: `src/ui/renderer.js`** — inside `drawDashboard()`

Find the dashboard row list (~line 1783). `window._reflections` is set but the dashboard currently reads `window._selfReflection?.totalReflections`. Check line 1794:

```js
row('REFLECTIONS', window._selfReflection?.totalReflections ?? '--', '#88ccff', y);
```

If this already reads `window._selfReflection` directly (not `window._reflections`), confirm the `selfReflection` object is being set on window. In main.js line 317: `window._selfReflection = selfReflection;` — verify this line exists. If it doesn't, add it with the other system window assignments (~line 305–318).

---

## Fix 5: Dashboard — Fix Viewport Size

**File: `src/ui/renderer.js`** and/or `src/main.js`

The dashboard (`drawDashboard`) is called with `CW()` and `CH()` which return the grid cell size, not the canvas viewport. This means the dashboard draws inside a tiny tile instead of fullscreen.

Find the call site (main.js or renderer.js):
```bash
grep -n "drawDashboard\|_dashboardOpen" src/main.js src/ui/renderer.js
```

Replace the call with canvas viewport dimensions:
```js
// Wrong:
drawDashboard(ctx, CW(), CH());
// Correct:
drawDashboard(ctx, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
```

If `drawDashboard` is in renderer.js and called from there, make sure it uses `ctx.canvas.width / (window.devicePixelRatio || 1)` for width and height.

---

## Verification Checklist

```
[ ] npm run build — zero errors
[ ] Open game → start a session → press ESC
[ ] Pause menu shows: SESSION 00:XX · WELLNESS [number] · DREAMSCAPES [n] · EMERGENCE [n]
[ ] Wellness line appears in ALL modes, not just shooter
[ ] Press the urge tool key (check main.js for what key activates urgeManagement.start)
[ ] Breath circle pulses on pause screen when urge tool is active
[ ] Start a new game with a cosmology selected (e.g. Norse Yggdrasil)
[ ] During play, HUD shows cosmology name in top-right area
[ ] Enemy speed / insight multiplier differs from "No Cosmology" run (compare HUD values)
[ ] Press H key → dashboard opens FULLSCREEN (not inside a tiny grid box)
[ ] Dashboard shows REFLECTIONS value (not '--')
[ ] All previously working features still work
```

## Commit message
```
feat: WIRE2 silent systems -- session data, breath tool, cosmology modifiers, dashboard fix
```
