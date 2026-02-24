# Task FIX4 — Minimum Font Size 10px + Menu Font Scaling

## Goal
All in-game and menu text is currently 6-9px which is unreadable. Enforce
a minimum readable size of 10px for body text and 14px for titles/headers,
scaled relative to the canvas but never below the minimum.

## Definition of Done
- [ ] `npm run build` passes
- [ ] No text anywhere in the game renders below 10px
- [ ] Title screen heading is at least 28px
- [ ] Pause/dead/interlude screen headings are at least 20px
- [ ] HUD labels are at least 11px
- [ ] Achievement/flash overlays are at least 12px
- [ ] Text is readable on a 1280x720 laptop screen without squinting

## Scope — touch ONLY these files
- `src/ui/renderer.js`
- `src/ui/menus.js`

---

## The Pattern to Apply Everywhere

Create a shared font sizing helper at the TOP of both files:

```js
// Add near top of file, after canvas/ctx references are established
function fs(base, canvas) {
  // base = ideal size at 1280px wide
  // Returns scaled size, never below base*0.75, never below 10
  const scale = Math.min(canvas.width / 1280, canvas.height / 720);
  return Math.max(Math.round(base * scale), Math.max(10, Math.round(base * 0.75)));
}
```

Then replace ALL hardcoded font declarations using this pattern:

```js
// BEFORE:
ctx.font = '6px Courier New';
ctx.font = '7px Courier New';
ctx.font = '8px Courier New';
ctx.font = '9px Courier New';

// AFTER (examples):
ctx.font = fs(11, canvas) + 'px Courier New';   // was 6-7px body
ctx.font = fs(13, canvas) + 'px Courier New';   // was 8-9px labels
```

## Size Reference Guide

Apply these base sizes (they scale up on larger screens):

| Element | Old size | New base size |
|---------|----------|---------------|
| Tiny labels (HUD) | 6-7px | 11px |
| Body text | 8-9px | 13px |
| UI labels | 9-10px | 14px |
| Subheadings | 10-12px | 16px |
| Screen headings | 12-14px | 20px |
| Title screen | 16-20px | 32px |
| GLITCH·PEACE logo | any | 40px |

## renderer.js — Specific targets
Search for every `ctx.font =` line. For each one:
1. Note the current size
2. Apply the size reference guide above
3. Replace with `fs(newBase, canvas) + 'px ...'`

## menus.js — Specific targets
Same process. Pay special attention to:
- Title screen: "WELCOME TO GLITCH·PEACE" → base 40px
- Subtitle/tagline → base 18px
- Menu option labels → base 16px
- Descriptive text under options → base 13px
- Footer hints like "[ENTER] select" → base 12px
- Pause screen "PAUSED" → base 32px
- Interlude screen dreamscape name → base 24px
- Dead screen → base 28px

## Verification
```bash
npm run build
```
Browser at 1280x720 (laptop):
1. Title screen — "GLITCH·PEACE" large and clear, no squinting needed
2. HUD during play — score, emotion, HP all readable
3. Achievement popup — text readable
4. Pause screen — text comfortable to read
5. Open DevTools console: no font below 10px visible anywhere

## Commit message
```
fix: FIX4 minimum font sizes -- all text 10px minimum, menus scale properly
```
