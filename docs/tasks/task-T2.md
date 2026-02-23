# Task T2 — Wire temporal system into main.js

## Goal
Import the T1 temporal system singleton, refresh it on game start,
pass its modifiers into the game loop so they actually affect:
  1. Enemy step interval (speed)
  2. Insight token value when collected
  3. The coherenceMul passed to emotionalField.decay()
Show lunar phase + planetary day in the HUD banner line.

## Definition of Done
- [ ] `npm run build` passes clean
- [ ] `window._temporalSystem` accessible in console during play
- [ ] `window._temporalSystem.getModifiers()` returns sensible values
- [ ] Dreamscape banner line (top of HUD) shows lunar phase + planet name
- [ ] On Mars day (Tuesday), enemies are noticeably more aggressive
- [ ] On Mercury day (Wednesday), insight token messages show higher value
- [ ] No regressions in menus, pause, death screen

## Scope -- touch ONLY these files
- `src/main.js`       (import + wiring)
- `src/ui/renderer.js` (banner text only -- one line change)

Do NOT touch temporal-system.js, emotional-engine.js, state.js,
player.js, enemy.js, or any other file.

---

## EDIT 1 -- main.js: import the singleton

Add this import after the EmotionalField import line (which currently
reads `import { EmotionalField } from './systems/emotional-engine.js';`):

```js
import { temporalSystem } from './systems/temporal-system.js';
```

---

## EDIT 2 -- main.js: expose on window + refresh on game start

Add this line near the other window assignments at the top of the
runtime globals section (near `window._insightTokens` and
`window._emotionalField`):

```js
window._temporalSystem = temporalSystem;
```

Inside `startGame()`, after `emotionalField.reset();`, add:

```js
temporalSystem.refresh();
```

So that block reads:
```js
function startGame(dreamIdx) {
  resetUpgrades(); resetSession();
  emotionalField.reset();
  temporalSystem.refresh();     // <- new
  CFG.dreamIdx = dreamIdx || 0;
  // ... rest unchanged
```

---

## EDIT 3 -- main.js: use coherenceMul in emotional decay

In the playing section, find the emotional field decay block added in E2:
```js
const coherenceMul = matrixActive === 'B' ? 1.2 : 0.7;
emotionalField.decay(dt, coherenceMul);
```

Replace with:
```js
const tmods = temporalSystem.getModifiers();
const coherenceMul = (matrixActive === 'B' ? 1.2 : 0.7) * tmods.coherenceMul;
emotionalField.decay(dt, coherenceMul);
window._tmods = tmods;   // expose for renderer without circular import
```

---

## EDIT 4 -- main.js: scale enemy step interval with enemyMul

In enemy.js the enemy step timer is compared against a computed speed
value. We don't want to touch enemy.js -- instead we store the modifier
on the game object each frame so enemy.js can pick it up via
`g.temporalEnemyMul`.

After the `window._tmods = tmods;` line, add:

```js
if (game) game.temporalEnemyMul = tmods.enemyMul;
```

Then open `src/game/enemy.js` and find this line:
```js
const mSpeed = Math.max(d.eSpeedMin, baseSpeed) * (matrixActive === 'A' ? 0.65 : 1.0) * slowMul;
```
Replace with:
```js
const mSpeed = Math.max(d.eSpeedMin, baseSpeed) * (matrixActive === 'A' ? 0.65 : 1.0) * slowMul * (g.temporalEnemyMul ?? 1.0);
```

This is the ONLY change to enemy.js -- one line, no new imports.

---

## EDIT 5 -- main.js: scale insight token value on collection

Insight tokens are awarded inside player.js when the player steps on
an INSIGHT tile. We don't touch player.js -- instead pass the multiplier
via the game object, same pattern as purgDepth.

After `game.temporalEnemyMul = tmods.enemyMul;` add:

```js
game.insightMul = tmods.insightMul;
```

Then open `src/game/player.js` and find where the INSIGHT tile score is
calculated. It looks like:
```js
const pts = Math.round((300 + g.level * 50) * UPG.resonanceMultiplier);
```
Replace with:
```js
const pts = Math.round((300 + g.level * 50) * UPG.resonanceMultiplier * (g.insightMul ?? 1.0));
```

This is the ONLY change to player.js -- one line, no new imports.

---

## EDIT 6 -- renderer.js: show lunar + planet in the banner

In `drawHUD`, find the dreamscape banner line (near the top of the function):
```js
ctx.fillText(g.ds.name + '  ·  ' + g.ds.emotion, w / 2, 11);
```
Replace with:
```js
const tm = window._tmods;
const temporalSuffix = tm ? ('  |  ' + tm.lunarName + '  ' + tm.planetName) : '';
ctx.fillText(g.ds.name + '  ·  ' + g.ds.emotion + temporalSuffix, w / 2, 11);
```

All strings are plain ASCII. The `|` pipe character is safe.
If the banner text is too long at small canvas sizes, it will simply
clip -- that is acceptable for now.

---

## What NOT to do
- Do NOT import temporalSystem inside renderer.js -- use window._tmods
- Do NOT call temporalSystem.refresh() inside the game loop -- only on
  game start. Refresh is cheap but unnecessary every frame.
- Do NOT add a second import of temporalSystem anywhere
- Do NOT modify the temporal-system.js file created in T1
- The enemy.js and player.js changes are one line each -- no new
  imports, no new functions, no structural changes

---

## Verification
```bash
npm run build   # must pass clean
```

Browser checks:
1. Start game -- banner shows dreamscape name + lunar phase + planet
   e.g. "VOID STATE  ·  numbness  |  Waning Gibbous  Mars"
2. Open console: `window._temporalSystem.getModifiers()`
   Returns object with enemyMul, insightMul, coherenceMul, names
3. Check today's day of week -- if Tuesday, Mars day, enemies should
   feel slightly faster. If Wednesday, Mercury, insight tokens worth more.
4. Pause, resume, die -- no crashes, banners on non-game screens unchanged.

## Commit message
```
feat: T2 wire temporal system -- lunar/planetary modifiers active
```
