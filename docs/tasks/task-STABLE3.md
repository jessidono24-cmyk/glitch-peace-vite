# Task STABLE3 — Full Screen Canvas + Readable Fonts

## Goal
Canvas doesn't fill the full screen and fonts are too small (6-9px).
This task ensures the game fills the entire viewport and all text is
comfortably readable at minimum 11px, using a cleaner typeface.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Canvas fills 100% of viewport on any screen size
- [ ] No text anywhere renders below 11px
- [ ] Title screen heading clearly readable without squinting
- [ ] HUD labels readable during gameplay
- [ ] Font changed to something more readable while keeping the aesthetic
- [ ] No scrollbars
- [ ] Resizing browser window resizes canvas correctly

## Scope — touch ONLY these files
- `index.html`
- `src/ui/renderer.js`
- `src/ui/menus.js`

---

## EDIT 1 — index.html: full screen CSS

Replace or add to the style block:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  background: #000;
}
canvas { display: block; width: 100vw; height: 100vh; }
```

---

## EDIT 2 — Canvas sizing in renderer.js or main.js

Find where canvas dimensions are set. Replace fixed values:
```js
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
```

---

## EDIT 3 — Font helper function

Add this near the top of BOTH renderer.js and menus.js:

```js
function fs(base) {
  // Scale font relative to canvas, never below 11px
  const scale = Math.min(canvas.width / 1280, canvas.height / 720);
  return Math.max(11, Math.round(base * Math.max(scale, 0.8))) + 'px ';
}
```

---

## EDIT 4 — Replace font string across both files

**Change the typeface** from `Courier New` to `'Courier Prime', 'Courier New', monospace`
This is more readable at small sizes while keeping the terminal aesthetic.

In index.html, add to the head:
```html
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
```

**Size reference — apply using fs() helper:**

| Element | Base size |
|---------|-----------|
| Tiny HUD labels | 11px |
| Body / bar labels | 13px |
| UI option text | 15px |
| Screen subheadings | 18px |
| Screen headings | 24px |
| Title / GLITCH·PEACE | 40px |

Replace ALL hardcoded font declarations:
```js
// BEFORE:
ctx.font = '8px Courier New';
// AFTER:
ctx.font = fs(13) + "'Courier Prime', monospace";
```

---

## Verification
```bash
npm run build
```
Browser at 1280x720:
1. Canvas fills entire screen edge to edge
2. GLITCH·PEACE title is large and clear
3. HUD labels during play are readable without leaning forward
4. Menu option text is comfortable to read
5. Resize browser → canvas adapts

## Commit message
```
fix: STABLE3 fullscreen canvas and readable fonts -- min 11px, Courier Prime
```
