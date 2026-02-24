# Task FIX5 — Fix RPGMode: Export generateGrid from grid.js

## Goal
RPGMode failed to wire in FIX2 because it imports `generateGrid` from
`game/grid.js` which doesn't export that function. This task adds the
missing export so RPGMode can be safely imported without breaking the build.

## Definition of Done
- [ ] `npm run build` passes
- [ ] RPGMode is importable without errors
- [ ] RPGMode appears as a selectable mode in the mode select screen
- [ ] Selecting RPG mode loads the RPG experience (NPC dialogue, 18×18 map)
- [ ] Existing grid mode gameplay unchanged

## Scope — touch ONLY these files
- `src/game/grid.js` (add export only — no logic changes)
- `src/modes/mode-manager.js` (add RPGMode import)

---

## Step 1 — Find the function in grid.js

Run this first:
```bash
grep -n "function\|export\|generateGrid\|generate" src/game/grid.js | head -30
```

This will show you what grid generation functions exist and what's
currently exported.

## Step 2 — Add the export

The function is almost certainly already defined in grid.js under a name
like `generateGrid`, `buildGrid`, `createGrid`, or `generate`. Find it
and add an export. Do NOT rewrite or modify the function logic at all.

If the function is defined as:
```js
function generateGrid(w, h, options) { ... }
```

Add at the bottom of the file:
```js
export { generateGrid };
```

If it's already a named function but not exported, just add the export
keyword:
```js
export function generateGrid(w, h, options) { ... }
```

If the function has a different name (e.g. `buildGrid`), export it under
the name RPGMode expects:
```js
export { buildGrid as generateGrid };
```

## Step 3 — Wire RPGMode in mode-manager.js

After the export is confirmed working (`npm run build` passes), add the
RPGMode import to mode-manager.js:

```js
import { RPGMode } from '../gameplay-modes/rpg-mode.js';
```

And register it:
```js
this.modes = {
  // ... existing modes ...
  'rpg': new RPGMode(),
};
```

## Verification
```bash
npm run build   # must pass clean
```
Browser:
1. Mode select screen shows RPG option
2. Selecting RPG loads the 18×18 map with NPC interactions
3. Grid roguelike mode still works exactly as before
4. No console errors

## Commit message
```
fix: FIX5 export generateGrid from grid.js -- RPGMode now wired
```
