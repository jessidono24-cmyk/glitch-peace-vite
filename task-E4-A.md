# Task E4-A — Realm Inference: purgDepth computation + damage/heal modifiers

## Goal
Add `purgDepth` (0–1) to state.js, compute it each frame in main.js
from the emotional field, and apply it as mild damage/heal multipliers
in player.js. No renderer changes yet — that is E4-B.

## Definition of Done
- [ ] `npm run build` passes clean
- [ ] `window._purgDepth` exists in browser console during gameplay
- [ ] Its value rises after hitting hazard tiles, falls after peace tiles
- [ ] No visual changes — HUD looks identical to after E3

## Scope — touch ONLY these files
- `src/core/state.js`
- `src/main.js`
- `src/game/player.js` (two single-line replacements only)

Do NOT touch renderer.js, enemy.js, grid.js, constants.js, or emotional-engine.js.

---

## EDIT 1 — state.js: add purgDepth at the very end of the file

Append these two lines after the closing CURSOR block:

```js
export let purgDepth = 0.45;
export function setPurgDepth(v) { purgDepth = Math.max(0, Math.min(1, v)); }
```

---

## EDIT 2 — main.js: extend the state.js import

Find the import from `./core/state.js`. It currently ends with
`highScores, setHighScores }`. Add the two new names on a new line:

```js
         highScores, setHighScores,
         purgDepth, setPurgDepth } from './core/state.js';
```

---

## EDIT 3 — main.js: compute purgDepth each frame

In the playing section of the loop, directly after the emotional field
decay block (the block added in E2), add:

```js
  // Realm inference (E4-A)
  if (window._emotionalField) {
    const dist  = window._emotionalField.getDistortion?.() ?? 0.45;
    const val   = window._emotionalField.getValence?.()    ?? 0;
    const normV = (1 - val) / 2;
    let pd = dist * 0.7 + normV * 0.3;
    pd = matrixActive === 'A' ? Math.min(1, pd * 1.2) : pd * 0.85;
    setPurgDepth(pd);
    window._purgDepth = purgDepth;
  }
  if (game) {
    game.dmgMul  = purgDepth >= 0.8 ? 1.30 : purgDepth >= 0.5 ? 1.15 : 1.0;
    game.healMul = purgDepth <= 0.2 ? 1.25 : purgDepth <= 0.35 ? 1.10 : 1.0;
  }
```

---

## EDIT 4 — player.js: two single-line replacements

**Replacement A** — peace tile healing.
Find:
```js
g.hp = Math.min(UPG.maxHp, g.hp + 20);
```
Replace with:
```js
g.hp = Math.min(UPG.maxHp, g.hp + Math.round(20 * (g.healMul ?? 1)));
```

**Replacement B** — hazard tile damage.
Find:
```js
let dmg = Math.round(def.dmg * d.dmgMul * (matrixActive === 'A' ? 1.25 : 1));
```
Replace with:
```js
let dmg = Math.round(def.dmg * d.dmgMul * (matrixActive === 'A' ? 1.25 : 1) * (g.dmgMul ?? 1));
```

These are the ONLY two changes to player.js. No new imports, no new functions.

---

## Verification
```bash
npm run build   # must pass clean
```
Then in browser console during gameplay:
```js
window._purgDepth   // should return a number 0-1
```
Walk into hazard tiles — value rises. Collect peace — value falls.

## Commit message
```
feat: E4-A purgDepth computation and damage/heal modifiers
```
