# Task E2 — Wire EmotionalField into main.js

## Goal
Instantiate the EmotionalField from E1 in main.js and call it correctly
each game tick, so emotions decay, distortion updates, and the old
`UPG.emotion` string stub is replaced by the real engine.

## Definition of Done
- [ ] `npm run build` passes with zero errors
- [ ] Title screen still renders on first load
- [ ] Starting a game and walking into a DESPAIR tile updates
      `emotionalField.getDominant()` to `'despair'`
- [ ] Walking into PEACE tiles updates it toward `'peace'`
- [ ] No duplicate imports — check with `grep -n "EmotionalField" src/main.js`
      (should appear exactly twice: import line + instantiation line)

## Scope

### Touch ONLY these files
- `src/main.js` — 4 surgical edits described below
- `src/game/player.js` — 1 surgical edit (replace setEmotion stub)

### Do NOT touch
- `src/systems/emotional-engine.js` (E1 file — already complete)
- `src/core/state.js`
- `src/ui/renderer.js`
- `src/core/constants.js`
- Any other file

---

## Exact Edits

### EDIT 1 — main.js: Add import at line 22 (after the last existing import)

Add this line immediately after the `drawUpgradeShop…` import block,
before the blank line that starts the canvas setup section:

```js
import { EmotionalField } from './systems/emotional-engine.js';
```

The import block will now end like:
```js
import { drawTitle, drawDreamSelect, drawOptions, drawHighScores,
         drawUpgradeShop, drawPause, drawInterlude, drawDead } from './ui/menus.js';
import { EmotionalField } from './systems/emotional-engine.js';   // ← NEW
```

---

### EDIT 2 — main.js: Declare the field instance near the other globals (around line 40)

After the line `let interludeState = { text:'', subtext:'', timer:0, ds:null };`
add:

```js
// ─── Emotional field (E1) ────────────────────────────────────────────────
let emotionalField = new EmotionalField();
window._emotionalField = emotionalField;   // lets renderer read it without circular import
```

---

### EDIT 3 — main.js: Reset the field on game start

Inside `startGame()`, after `resetUpgrades(); resetSession();` add:

```js
emotionalField.reset();
```

So `startGame` begins:
```js
function startGame(dreamIdx) {
  resetUpgrades(); resetSession();
  emotionalField.reset();          // ← NEW
  CFG.dreamIdx = dreamIdx || 0;
  // … rest unchanged
```

---

### EDIT 4 — main.js: Tick the field each frame in the playing section

Find this line in the loop (currently line 211):
```js
if (game.emotionTimer > 0) { game.emotionTimer--; if (game.emotionTimer <= 0) { game.slowMoves = false; UPG.emotion = 'neutral'; } }
```

REPLACE it with:
```js
// ── Emotional field tick ──────────────────────────────────────────────
const coherenceMul = matrixActive === 'B' ? 1.2 : 0.7;
emotionalField.decay(dt, coherenceMul);
UPG.emotion = emotionalField.getDominant();          // keep old string for renderer compat
game.slowMoves = (UPG.emotion === 'hopeless' || UPG.emotion === 'despair');
```

This replaces the old timer-based stub entirely. The old `game.emotionTimer`
field can stay on the game object — it just won't be read anymore.

---

### EDIT 5 — player.js: Replace setEmotion stub to call the real engine

Open `src/game/player.js`. Find the `setEmotion` function:
```js
export function setEmotion(g, em) {
  UPG.emotion = em; UPG.emotionTimer = 120;
  g.emotionTimer = 120; g.slowMoves = (em === 'hopeless' || em === 'despair');
}
```

REPLACE with:
```js
export function setEmotion(g, em) {
  // Push the emotion event into the EmotionalField if available
  if (window._emotionalField) {
    window._emotionalField.add(em, 0.6);   // 0.6 = moderate intensity
  }
  // Keep legacy fields for any renderer code still reading them
  UPG.emotion = em;
  g.slowMoves = (em === 'hopeless' || em === 'despair');
}
```

---

## What NOT to do
- Do NOT add a second `new EmotionalField()` anywhere
- Do NOT import EmotionalField inside player.js — use window._emotionalField
- Do NOT remove the `UPG.emotion` string assignment — renderer still reads it
- Do NOT add emotionalField to state.js — keep it local to main.js for now
- Do NOT call `emotionalField.decay()` more than once per frame

---

## Verification steps after editing

```bash
npm run build        # must pass clean

# Manual smoke test in browser:
# 1. Load title screen — should look identical to before
# 2. Start game — no console errors
# 3. Walk into a DESPAIR tile
# 4. Open browser console, type: window._emotionalField.getDominant()
#    → should return 'despair' or whichever emotion is dominant
# 5. Walk to PEACE tiles for a few seconds
#    → getDominant() should shift toward 'peace'
# 6. ESC → pause → resume → no crash
```

## Commit message
```
feat: E2 wire EmotionalField into main.js game loop
```
