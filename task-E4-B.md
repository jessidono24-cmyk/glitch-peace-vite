# Task E4-B — Realm Inference: realm label in renderer footer

## Goal
Show the current realm name (HEAVEN / IMAGINATION / MIND / PURGATORY / HELL)
in the HUD footer bar. Reads `window._purgDepth` set by E4-A.
No logic changes — display only.

## Definition of Done
- [ ] `npm run build` passes clean with zero Unicode/JSON errors
- [ ] Footer bar shows realm name on the left, controls hint on the right
- [ ] Realm name and color change as purgDepth changes during play
- [ ] No special characters in the new JS code (ASCII only)

## Scope — touch ONLY this file
- `src/ui/renderer.js`

Do NOT touch any other file.

---

## IMPORTANT — ASCII-only rule
The previous build produced a "Bad Unicode escape in JSON" error.
Every string literal in the new code must use plain ASCII.
Do NOT use: diamond symbols, middle dots, arrow glyphs, or any
non-ASCII character in the new code added by this task.
The existing code already has these characters and they are fine —
just do not add any new ones.

---

## EDIT 1 — add realmLabel helper above drawHUD

Insert this function directly above the `function drawHUD(` line:

```js
function realmLabel(pd) {
  if (pd === undefined || pd === null) pd = 0.45;
  if (pd < 0.15) return { name: 'HEAVEN',      color: '#aaffcc' };
  if (pd < 0.35) return { name: 'IMAGINATION', color: '#aaddff' };
  if (pd < 0.55) return { name: 'MIND',        color: '#00ff88' };
  if (pd < 0.75) return { name: 'PURGATORY',   color: '#ff8800' };
  return               { name: 'HELL',          color: '#ff2200' };
}
```

---

## EDIT 2 — replace footer drawing block inside drawHUD

Find this block near the bottom of drawHUD:

```js
  ctx.fillStyle = '#1a1a2a'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  ctx.fillText('WASD/ARROWS · SHIFT=matrix · ESC=pause · J=arch · R=pulse · Q=freeze · C=contain', w / 2, h - 11);
  ctx.textAlign = 'left';
```

Replace with:

```js
  const rl = realmLabel(window._purgDepth);
  ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = rl.color; ctx.shadowColor = rl.color; ctx.shadowBlur = 5;
  ctx.fillText(rl.name, 14, h - 11);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a1a2a'; ctx.font = '7px Courier New'; ctx.textAlign = 'right';
  ctx.fillText('WASD SHIFT=MTX ESC=pause J R Q C', w - 10, h - 11);
  ctx.textAlign = 'left';
```

Note: all string literals here are plain ASCII — no special characters.

---

## Verification
```bash
npm run build   # must pass with zero errors or warnings about Unicode
```
Browser check:
- Footer left side shows realm name in color
- Hit hazard tiles until PURGATORY appears (orange)
- Collect peace tiles — shifts back toward MIND (green)
- Title / pause / dead screens: no realm label (those screens don't call drawHUD)

## Commit message
```
feat: E4-B realm label in HUD footer
```
