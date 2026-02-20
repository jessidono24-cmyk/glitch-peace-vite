# Task E4 — Realm Inference (distortion → purgDepth → realm label + modifiers)

## Goal
Infer a "realm" each frame from the emotional field's distortion and
valence values. Expose `purgDepth` (0–1) to the game loop so it can
scale damage received and healing gained. Show the realm name in the
HUD footer bar, replacing the static controls hint with a split:
realm label on the left, controls hint compressed on the right.

## Definition of Done
- [ ] `npm run build` passes clean
- [ ] Title screen unchanged
- [ ] In gameplay, footer bar shows a realm name on the left side
      (MIND · COHERENCE by default at game start)
- [ ] After hitting several hazard tiles, realm shifts toward PURGATORY
- [ ] After collecting peace/insight tiles, realm shifts back toward MIND
- [ ] Damage from hazard tiles is visibly higher in PURGATORY/HELL
      (purgDepth ≥ 0.5 → +15% damage; purgDepth ≥ 0.8 → +30%)
- [ ] Healing from peace tiles is visibly higher in HEAVEN/IMAGINATION
      (purgDepth ≤ 0.2 → +25% healing)
- [ ] No regressions — menus, pause, death screen unchanged

## Scope

### Touch ONLY these files
- `src/core/state.js`  — add purgDepth export
- `src/main.js`        — compute purgDepth each frame, apply modifiers
- `src/ui/renderer.js` — show realm in footer bar

### Do NOT touch
- `src/systems/emotional-engine.js`
- `src/game/player.js`
- `src/game/enemy.js`
- Any other file

---

## The Five Realms

| Realm | purgDepth range | Distortion | Valence | Color |
|-------|----------------|------------|---------|-------|
| HEAVEN | 0.00–0.15 | very low | positive | `#aaffcc` |
| IMAGINATION | 0.15–0.35 | low | positive | `#aaddff` |
| MIND | 0.35–0.55 | moderate | neutral | `#00ff88` |
| PURGATORY | 0.55–0.75 | high | negative | `#ff8800` |
| HELL | 0.75–1.00 | very high | negative | `#ff2200` |

`purgDepth` is computed as:

```
distortion        = emotionalField.getDistortion()   // 0–1
valence           = emotionalField.getValence()       // -1 to +1
normalizedValence = (1 - valence) / 2                 // maps -1→1  to  1→0
purgDepth         = distortion * 0.7 + normalizedValence * 0.3
purgDepth         = clamp(purgDepth, 0, 1)
```

High distortion + negative valence → purgDepth near 1 → HELL.
Low distortion + positive valence → purgDepth near 0 → HEAVEN.

Matrix A amplifies purgDepth by ×1.2 (clamped to 1). Matrix B dampens
it by ×0.85.

---

## Exact Edits

### EDIT 1 — state.js: Export purgDepth

Add these two lines at the end of state.js (after the CURSOR block):

```js
// ─── Realm state (E4) ────────────────────────────────────────────────────
export let purgDepth = 0.45;   // starts in MIND territory
export function setPurgDepth(v) { purgDepth = v; }
```

---

### EDIT 2 — main.js: Import purgDepth + setPurgDepth

The existing import from `./core/state.js` is on lines 8–12. Add
`purgDepth, setPurgDepth` to that import. The line currently ends with
`highScores, setHighScores }`. Add the two new names:

```js
import { CFG, UPG, CURSOR, phase, setPhase, resetUpgrades, resetSession,
         checkOwned, matrixActive, setMatrix, matrixHoldTime, setMatrixHoldTime, addMatrixHoldTime,
         insightTokens, addInsightToken, spendInsightTokens,
         sessionRep, addSessionRep, dreamHistory, pushDreamHistory,
         highScores, setHighScores,
         purgDepth, setPurgDepth } from './core/state.js';   // ← added last line
```

---

### EDIT 3 — main.js: Add purgDepth computation to game loop

In the playing section, after the emotional field tick block (the block
added in E2 that calls `emotionalField.decay()`), add:

```js
  // ── Realm inference (E4) ────────────────────────────────────────────
  if (window._emotionalField) {
    const dist = window._emotionalField.getDistortion?.() ?? 0.45;
    const val  = window._emotionalField.getValence?.()    ?? 0;
    const normV = (1 - val) / 2;
    let pd = dist * 0.7 + normV * 0.3;
    if (matrixActive === 'A') pd = Math.min(1, pd * 1.2);
    else                      pd = pd * 0.85;
    setPurgDepth(Math.max(0, Math.min(1, pd)));
    window._purgDepth = purgDepth;   // expose for renderer without import
  }
```

---

### EDIT 4 — main.js: Apply purgDepth modifiers to damage and healing

`purgDepth` modifies two things that live in `player.js` via callbacks,
but we don't want to touch player.js. Instead, expose the modifiers
on the `game` object each frame so player.js can read them when it
applies damage/healing. Add this right after the realm inference block:

```js
  // purgDepth modifiers on game object (read by player.js tile effects)
  if (game) {
    game.purgDepth     = purgDepth;
    game.dmgMul        = purgDepth >= 0.8 ? 1.30
                       : purgDepth >= 0.5 ? 1.15
                       : 1.0;
    game.healMul       = purgDepth <= 0.2 ? 1.25
                       : purgDepth <= 0.35 ? 1.10
                       : 1.0;
  }
```

Then open `src/game/player.js` and find the PEACE tile healing line:
```js
g.hp = Math.min(UPG.maxHp, g.hp + 20);
```
Replace with:
```js
g.hp = Math.min(UPG.maxHp, g.hp + Math.round(20 * (g.healMul ?? 1)));
```

And find where hazard tile damage is applied (the general hazard else-if block):
```js
let dmg = Math.round(def.dmg * d.dmgMul * (matrixActive === 'A' ? 1.25 : 1));
```
Replace with:
```js
let dmg = Math.round(def.dmg * d.dmgMul * (matrixActive === 'A' ? 1.25 : 1) * (g.dmgMul ?? 1));
```

(This is the ONLY change to player.js — two one-line replacements,
no new imports, no new functions.)

---

### EDIT 5 — renderer.js: Show realm in footer bar

Add this helper above `drawHUD` (after the `drawEmotionRow` function
added in E3):

```js
function realmLabel(pd) {
  if (pd === undefined || pd === null) pd = 0.45;
  if (pd < 0.15) return { name: 'HEAVEN',      color: '#aaffcc' };
  if (pd < 0.35) return { name: 'IMAGINATION', color: '#aaddff' };
  if (pd < 0.55) return { name: 'MIND',        color: '#00ff88' };
  if (pd < 0.75) return { name: 'PURGATORY',   color: '#ff8800' };
  return                 { name: 'HELL',        color: '#ff2200' };
}
```

Then inside `drawHUD`, find the footer section (the last block, around
line 365 of the original file — line numbers will have shifted with E3):

```js
  ctx.fillStyle = '#1a1a2a'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  ctx.fillText('WASD/ARROWS · SHIFT=matrix · ESC=pause · J=arch · R=pulse · Q=freeze · C=contain', w / 2, h - 11);
  ctx.textAlign = 'left';
```

Replace those three lines with:

```js
  // Realm label (left) + controls hint (right)
  const rl = realmLabel(window._purgDepth ?? 0.45);
  ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = rl.color; ctx.shadowColor = rl.color; ctx.shadowBlur = 5;
  ctx.fillText('◈ ' + rl.name, 14, h - 11);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a1a2a'; ctx.font = '7px Courier New'; ctx.textAlign = 'right';
  ctx.fillText('WASD · SHIFT=MTX · ESC=pause · J · R · Q · C', w - 10, h - 11);
  ctx.textAlign = 'left';
```

---

## What NOT to do
- Do NOT add a second `setPurgDepth` call anywhere else in main.js
- Do NOT import purgDepth inside renderer.js — use `window._purgDepth`
- Do NOT add `purgDepth` to the UPG object in state.js — it lives as its
  own top-level export so systems can import it cleanly later
- Do NOT change the enemy damage calculation in enemy.js — only tile
  damage (from player.js stepping on tiles) is affected by purgDepth
- The two player.js edits touch only single lines — no new functions,
  no new imports

---

## Verification steps after editing

```bash
npm run build   # must pass

# Manual browser test:
# 1. Start game → footer shows "◈ MIND" in green (default purgDepth ~0.45)
# 2. Walk into 4–5 DESPAIR or TERROR tiles in a row
#    → footer shifts to "◈ PURGATORY" in orange
# 3. Collect 4–5 PEACE tiles in a row
#    → footer shifts back toward MIND or IMAGINATION
# 4. Verify PURGATORY damage feels slightly higher (harder to survive)
# 5. Verify HEAVEN/IMAGINATION healing from peace tiles is slightly more
# 6. Open console → type: window._purgDepth
#    → should return a number between 0 and 1
# 7. Title / pause / death screens: footer unchanged (no realm label there)
```

## Commit message
```
feat: E4 realm inference — purgDepth, five realms, damage/heal modifiers
```
