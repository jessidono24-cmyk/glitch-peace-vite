# Task STABLE2 — Fix [object Object] Bug + HUD Declutter

## Goal
The HUD top bar shows `[object Object]` because something isn't being
converted to a display string. The top bar also has too much text showing
simultaneously. This task fixes the bug and reduces HUD text to only
what's essential during active play.

## Definition of Done
- [ ] `npm run build` passes  
- [ ] `[object Object]` never appears anywhere on screen
- [ ] Top HUD shows maximum 4 items simultaneously
- [ ] Active emotion name displays correctly (not as object)
- [ ] Cosmology/playstyle display correctly if selected
- [ ] Dreamscape name displays correctly
- [ ] Double popup (same notification appearing twice) is fixed
- [ ] Bottom HUD: Level, Score, Objective only — no duplicate bars

## Scope — touch ONLY these files
- `src/ui/renderer.js`
- `src/ui/menus.js` (HUD sections only)

---

## Step 1 — Find the [object Object] source

```bash
grep -n "object Object\|\\.name\|\\.label\|\\.id\|toString\|String(" src/ui/renderer.js | head -30
grep -n "cosmology\|playstyle\|emotion\|dreamscape" src/ui/renderer.js | head -30
```

The bug is caused by rendering an object directly instead of a property
of that object. Find every place in renderer.js where something is
drawn to the canvas that could be an object. The fix is always:

```js
// WRONG — renders [object Object]:
ctx.fillText(state.cosmology, x, y);
ctx.fillText(state.emotion, x, y);

// CORRECT:
ctx.fillText(state.cosmology?.name || state.cosmology?.id || state.cosmology || '', x, y);
ctx.fillText(state.emotion?.label || state.emotion?.name || state.emotion || '', x, y);
```

Apply this pattern to every HUD text render that touches objects.

---

## Step 2 — HUD information hierarchy

**Top bar (maximum 4 items, left to right):**
```
[DREAMSCAPE NAME]    [SCORE]    [LEVEL]    [LUNAR PHASE · PLANET DAY]
```

Remove from top bar:
- Emotion name (show as icon or color only, not text)
- Cosmology name (visible in pause menu, not HUD)
- Playstyle name (visible in pause menu, not HUD)
- [object Object] (obviously)
- Any duplicate of bottom bar info

**Left side HUD (vertical stack, max 3 bars):**
```
HP bar
Energy bar  
Lucidity bar (only if > 0)
```

Remove from left side:
- Emotion label text (keep the bar, remove the word)
- Any bars that are always 0

**Right side HUD (max 2 items):**
```
[Archetype power indicator]
[Matrix A/B toggle state]
```

**Bottom bar (simple, always visible):**
```
HEALTH [bar]    |    LEVEL [n]  SCORE [n]  OBJECTIVE [n]    |    [MODE NAME]
```

---

## Step 3 — Fix double popup

Find where achievement/notification popups are drawn. There should be
ONE render location for popups. Search for:

```bash
grep -n "popup\|notification\|achievement\|flash\|ANTICIPATION" src/ui/renderer.js | head -20
```

If the same popup is drawn in two places, remove one. The popup queue
should draw from a single array, once per frame.

---

## Step 4 — Emotion as color/icon not text

Instead of writing "ANTICIPATION" as text in the HUD during gameplay,
communicate emotion through:
- The color of the player's energy bar
- A subtle color shift in the background vignette (biome system)
- A small icon (1-2 emoji characters max) in the corner

Only show the emotion name as text when it CHANGES (flash it briefly,
then fade). Don't keep it displayed permanently.

```js
// Emotion flash on change (show for 2 seconds, then hide)
if (state.emotionChanged) {
  state.emotionFlashTimer = 2.0;
  state.emotionChanged = false;
}
if (state.emotionFlashTimer > 0) {
  const alpha = Math.min(1, state.emotionFlashTimer);
  ctx.globalAlpha = alpha;
  ctx.fillText(currentEmotionLabel, x, y);
  ctx.globalAlpha = 1;
  state.emotionFlashTimer -= dt;
}
```

---

## Verification
```bash
npm run build
```
Browser:
1. Start any mode → no `[object Object]` anywhere on screen
2. Top bar shows: dreamscape name, score, level, lunar phase — nothing else
3. Move into TERROR tile → emotion bar color changes, brief "FEAR" flash, 
   then disappears — NOT permanently displayed
4. Achievement unlocks → popup appears ONCE, not twice
5. Bottom bar: Health, Level, Score, Objective — clean and readable

## Commit message
```
fix: STABLE2 object bug fixed, HUD decluttered to essential info only
```
