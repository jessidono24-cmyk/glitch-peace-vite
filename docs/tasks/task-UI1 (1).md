# Task UI1 — Full Screen + Loading Screen + Font Overhaul

## Goal
The game renders in roughly the right 40% of the screen with a massive
black void on the left. Menus also don't fill the screen. Font is hard
to read. This task fixes all three.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Canvas fills 100% of screen — no black void on any side
- [ ] Loading screen appears for ~2 seconds on first open
- [ ] ALL menus fill the full screen
- [ ] Font changed to 'Share Tech Mono' (more readable than Courier)
- [ ] Minimum font size 14px everywhere
- [ ] Title "GLITCH·PEACE" at least 48px
- [ ] Menu option text at least 20px
- [ ] HUD labels at least 13px
- [ ] No scrollable menus anywhere

## Scope — touch ONLY these files
- `index.html`
- `src/ui/renderer.js`
- `src/ui/menus.js`
- `src/main.js` (canvas init only)

---

## EDIT 1 — index.html

```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100vw !important;
      height: 100vh !important;
      display: block;
    }
  </style>
</head>
```

---

## EDIT 2 — Find the offset bug

```bash
grep -n "canvas.width\|canvas.height\|const W\|const H\|var W\|var H\|W =\|H =" src/main.js | head -20
grep -n "canvas.style\|offsetLeft\|margin\|padding\|left:" src/ui/renderer.js | head -20
```

Find and replace ALL hardcoded canvas dimensions:
```js
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Update any global W/H constants used for drawing:
  W = canvas.width;
  H = canvas.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
```

---

## EDIT 3 — Font helper (add to TOP of renderer.js AND menus.js)

```js
const FONT = "'Share Tech Mono', monospace";
function fs(base) {
  const scale = Math.min(canvas.width / 1280, canvas.height / 720);
  return Math.max(14, Math.round(base * Math.max(scale, 0.85)));
}
```

Replace every `ctx.font = ...` line using these base sizes:
| Element | Base px |
|---------|---------|
| HUD tiny labels | 13 |
| Bar labels | 15 |
| Body / descriptions | 17 |
| Menu options | 20 |
| Section headings | 28 |
| Screen titles | 36 |
| GLITCH·PEACE logo | 52 |

Example: `ctx.font = fs(20) + 'px ' + FONT;`

---

## EDIT 4 — Fix menus to use full canvas width

Every menu must use canvas-relative positioning. Find hardcoded values:
```bash
grep -n "= 300\|= 400\|= 600\|= 800\|= 960\|centerX\|panelX\|menuX" src/ui/menus.js | head -20
```

Replace all fixed positions with:
```js
const cx = canvas.width / 2;        // horizontal center
const top = canvas.height * 0.15;   // menu starts at 15% from top
const itemH = canvas.height * 0.07; // each item 7% of height
const panelW = canvas.width * 0.65; // panel is 65% of screen width
```

---

## EDIT 5 — Loading screen (add to main.js startup)

```js
function drawLoadingScreen(progress) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  
  ctx.fillStyle = '#00ff88';
  ctx.font = fs(52) + 'px ' + FONT;
  ctx.fillText('GLITCH·PEACE', canvas.width / 2, canvas.height * 0.42);
  
  ctx.fillStyle = '#224433';
  ctx.font = fs(16) + 'px ' + FONT;
  ctx.fillText('a consciousness engine', canvas.width / 2, canvas.height * 0.52);
  
  const bw = canvas.width * 0.28, bh = 3;
  const bx = (canvas.width - bw) / 2, by = canvas.height * 0.65;
  ctx.fillStyle = '#001a11';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(bx, by, bw * progress, bh);
}

// Run before title phase:
let _loadProg = 0;
const _loadTimer = setInterval(() => {
  _loadProg = Math.min(1, _loadProg + 0.05);
  drawLoadingScreen(_loadProg);
  if (_loadProg >= 1) { clearInterval(_loadTimer); setPhase('title'); }
}, 80);
```

---

## Verification
1. Full screen — no black void anywhere ✓
2. Loading bar fills screen for ~2s ✓
3. Menu options are readable at arm's length ✓
4. Font is Share Tech Mono (cleaner than Courier) ✓

## Commit message
```
fix: UI1 fullscreen + Share Tech Mono font + loading screen
```
