# Task D3 — EmergenceIndicators Flash Overlay + Record Hooks

## Goal
emergence-indicators.js tracks 8 awakening signs (pause_frequency,
pattern_noticing, matrix_mastery, etc.) and fires a flash when one
is first activated. Wire the record() calls and render the flash.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Matrix switches increment 'matrix_mastery' counter
- [ ] Peace chain combos increment 'peace_chain'
- [ ] Insight collects increment 'insight_accumulation'
- [ ] After 5 matrix switches, "Dual Awareness" flash appears briefly
- [ ] emergenceIndicators.levelLabel available in console
- [ ] Dashboard (D1) shows emergence level correctly

## Scope — touch ONLY these files
- `src/main.js`
- `src/game/player.js`
- `src/ui/renderer.js`

Do NOT touch emergence-indicators.js.

---

## Exact Edits

### EDIT 1 — main.js: (already imported in D2 -- skip if already done)
If not yet imported:
```js
import { emergenceIndicators } from './systems/awareness/emergence-indicators.js';
window._emergenceIndicators = emergenceIndicators;
```

### EDIT 2 — main.js: in playing loop, add tick:
```js
emergenceIndicators.tick?.();
```

### EDIT 3 — main.js: on matrix toggle:
```js
emergenceIndicators.record('matrix_mastery', 1);
```

### EDIT 4 — main.js: on dreamscape completion:
```js
emergenceIndicators.record('dream_completion', 1);
```

### EDIT 5 — player.js: in PEACE tile collection, track chain/combo:
```js
if (window._emergenceIndicators) {
  window._emergenceIndicators.record('peace_chain', 1);
  window._emergenceIndicators.record('insight_accumulation', 0); // no-op, just peace
}
```

### EDIT 6 — player.js: in INSIGHT tile collection:
```js
if (window._emergenceIndicators) {
  window._emergenceIndicators.record('insight_accumulation', 1);
}
```

### EDIT 7 — renderer.js: add emergence flash renderer above drawHUD:

```js
function drawEmergenceFlash(ctx, w, h) {
  const ei = window._emergenceIndicators;
  if (!ei) return;
  const flash = ei.newFlash;
  if (!flash) return;
  const alpha = ei.flashAlpha ?? 0;
  if (alpha < 0.02) return;

  ctx.globalAlpha = alpha * 0.9;
  ctx.textAlign = 'center';
  ctx.font = '7px Courier New'; ctx.fillStyle = '#ffaa44';
  ctx.fillText('EMERGENCE INDICATOR', w / 2, h / 2 + 80);
  ctx.font = 'bold 10px Courier New';
  ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffdd88'; ctx.shadowBlur = 8;
  ctx.fillText(flash.label || '', w / 2, h / 2 + 96);
  ctx.shadowBlur = 0;
  ctx.font = '7px Courier New'; ctx.fillStyle = '#886633';
  ctx.fillText(flash.desc || '', w / 2, h / 2 + 110);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
```

Call inside drawGame() before HUD:
```js
drawEmergenceFlash(ctx, w, h);
```

## Verification
```bash
npm run build
```
Browser:
1. Toggle matrix 5 times -> "Dual Awareness" flash appears briefly
3. `window._emergenceIndicators.levelLabel` -> 'Dreaming' or 'Stirring'
4. `window._emergenceIndicators.emergenceLevel` -> 0-1 number

## Commit message
```
feat: D3 EmergenceIndicators wired -- awakening sign tracking and flash live
```
