# Task FIX1 — Full-Screen Canvas Sizing

## Goal
The game canvas is cramped into the upper-left of the screen instead of
filling the full viewport. Fix it so the game always fills the entire
browser window and resizes correctly when the window is resized.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Game canvas fills 100% of viewport width and height on load
- [ ] Resizing the browser window resizes the game correctly
- [ ] No scrollbars appear
- [ ] Text and UI elements scale proportionally (or at minimum are readable)
- [ ] No visual regression on title, pause, or gameplay screens

## Scope — touch ONLY these files
- `index.html`
- `src/ui/renderer.js`
- `src/main.js` (only if canvas is initialized there)

---

## Exact Edits

### EDIT 1 — index.html: ensure full-screen CSS
Find the `<style>` block (or add one). Make sure it contains:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
```

### EDIT 2 — Find where the canvas is created and sized.
It will look something like:
```js
canvas.width = 800;
canvas.height = 600;
// or
const W = 960, H = 640;
```

Replace with dynamic sizing:
```js
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // If your renderer uses W/H constants, update them here:
  // W = canvas.width; H = canvas.height;
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  // If game has a redraw function, call it here
});
```

### EDIT 3 — If renderer.js uses hardcoded W/H values for centering
text or drawing the grid, find them and replace with:
```js
const W = canvas.width;
const H = canvas.height;
```
These should be read fresh each frame from the canvas, not stored as
fixed constants.

### EDIT 4 — Font sizes
If text appears tiny, find the font size declarations in renderer.js.
Scale them relative to canvas size. For example:
```js
// Instead of:
ctx.font = '12px Courier New';
// Use:
const BASE = Math.min(canvas.width, canvas.height);
ctx.font = Math.round(BASE * 0.022) + 'px Courier New';
```
A BASE multiplier of 0.018-0.025 works well for body text.
Title text can use 0.04-0.06.

## Verification
```bash
npm run build
```
Browser:
1. Open game — canvas fills entire screen, no black bars on sides
2. Open DevTools → toggle device emulation → resize → canvas adapts
3. Title text is comfortably readable without squinting
4. Game grid fills most of the screen during play

## Commit message
```
fix: FIX1 full-screen canvas -- viewport fill and responsive text sizing
```
