# Task D2 — SelfReflection Prompt on Interlude Screen

## Goal
self-reflection.js generates dreamscape-specific reflection prompts.
Wire it so the interlude screen (shown after each dreamscape completion)
displays a reflection prompt and affirmation instead of a static message.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Interlude screen shows a reflection prompt specific to the
      completed dreamscape's emotion (e.g. "fear" dreamscape -> fear prompt)
- [ ] Prompt depth increases with revisits (surface -> mid -> deep)
- [ ] Affirmation line shown below prompt
- [ ] emergenceIndicators.record('reflection_depth', 1) called on display

## Scope — touch ONLY these files
- `src/main.js`
- `src/ui/menus.js`

Do NOT touch self-reflection.js or emergence-indicators.js.

---

## Exact Edits

### EDIT 1 — main.js: add imports
```js
import { selfReflection } from './systems/awareness/self-reflection.js';
import { emergenceIndicators } from './systems/awareness/emergence-indicators.js';
```

### EDIT 2 — main.js: expose on window:
```js
window._selfReflection = selfReflection;
window._emergenceIndicators = emergenceIndicators;
```

### EDIT 3 — main.js: when building interlude state (find where
interludeState is set before transitioning to 'interlude' phase):
```js
// Get reflection prompt for completed dreamscape
const ds = DREAMSCAPES[CFG.dreamIdx];
const emotion = ds?.emotion || 'neutral';
const prompt = selfReflection.getPrompt(emotion);
const affirmation = selfReflection.getAffirmation();

interludeState.reflectionPrompt = prompt.prompt;
interludeState.reflectionDepth = prompt.depth;
interludeState.affirmation = affirmation;

// Track for emergence indicators
if (window._emergenceIndicators) {
  window._emergenceIndicators.record('reflection_depth', 1);
  window._emergenceIndicators.record('dream_completion', 1);
  window._emergenceIndicators.tick?.();
}
```

### EDIT 4 — menus.js: in drawInterlude() function, find where the
interlude text/subtext is rendered. After the existing text, add the
reflection prompt and affirmation:

```js
// Reflection prompt (if present in interludeState)
if (interludeState.reflectionPrompt) {
  // Depth label
  const depthColor = {
    surface: '#446644', mid: '#4466aa', deep: '#884488'
  }[interludeState.reflectionDepth || 'surface'];

  ctx.font = '7px Courier New'; ctx.textAlign = 'center';
  ctx.fillStyle = depthColor;
  ctx.fillText((interludeState.reflectionDepth || 'surface').toUpperCase() + ' REFLECTION', w / 2, h / 2 + 30);

  ctx.font = '9px Courier New'; ctx.fillStyle = '#aaccaa';
  // Word-wrap the prompt (simple version: just display, truncate if needed)
  ctx.fillText(interludeState.reflectionPrompt, w / 2, h / 2 + 46);

  if (interludeState.affirmation) {
    ctx.font = '7px Courier New'; ctx.fillStyle = '#335533';
    ctx.fillText(interludeState.affirmation, w / 2, h / 2 + 62);
  }
}
```

Note: Check the actual signature of drawInterlude in menus.js and pass
interludeState if it isn't already accessible in scope.

## Verification
```bash
npm run build
```
Browser:
1. Complete a dreamscape -> interlude screen appears
2. Below the existing interlude text, a reflection prompt appears
3. Revisit same dreamscape type -> prompt goes deeper (mid -> deep)
4. Affirmation line visible below prompt

## Commit message
```
feat: D2 SelfReflection on interlude -- dreamscape-specific prompts live
```
