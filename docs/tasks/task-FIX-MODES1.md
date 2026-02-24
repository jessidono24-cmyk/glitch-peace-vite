# Task FIX-MODES1 — Fix RPG, Ornithology, and Alchemy (Based on Screenshots)

Before doing anything else, audit the codebase and produce a report with three sections:
1. ACTUALLY IMPLEMENTED - features that exist in code AND are visibly functioning in the browser
2. CODE EXISTS BUT BROKEN/UNWIRED - files that exist but produce no visible output
3. DOCUMENTED ONLY - things mentioned in .md files that have no corresponding code

For each item, give the file path and one sentence on its actual current state.
Do not count something as implemented just because a file exists.

---

## Context from screenshots

Screenshot evidence of current state:
- RPG mode: renders the grid tile engine — shows colored tiles, PEACE/RAGE tiles, enemies
  It should show characters and dialogue, NOT grid tiles
- Ornithology: bird-watching mechanics work (species ID, notebook) BUT
  it renders on a grid tile background — should show a landscape/habitat background
  AND the HUD text at bottom is being clipped/obscured
- Alchemy: shows a single blue cylinder floating in black void, then freezes the entire game
  (user must kill the cmd process to recover)
- Canvas: content is smaller than the screen — black void on all sides

## Definition of Done
- [ ] `npm run build` passes
- [ ] RPG mode: NO grid tiles visible — shows character dialogue and scene instead
- [ ] Ornithology: NO grid tiles visible — shows natural landscape background
- [ ] Ornithology: HUD text not clipped — bird name/score visible at bottom
- [ ] Alchemy: does NOT freeze — something visible happens when entered
- [ ] Alchemy: freeze guard prevents game loop lockup
- [ ] Canvas content fills full screen — no black void borders
- [ ] All fixes verified by running the game locally

---

## PHASE 1: READ BEFORE FIXING

```bash
# Find all mode files
find src/ -name "*.js" | sort

# Find the alchemy mode file specifically
find src/ -name "*alchemy*" -o -name "*alch*" | grep -v node_modules

# Find the RPG mode file
find src/ -name "*rpg*" -o -name "*narrative*" | grep -v node_modules

# Find the ornithology mode file
find src/ -name "*ornith*" -o -name "*bird*" | grep -v node_modules

# Find where modes are dispatched/started
grep -n "alchemy\|rpg\|ornith\|_currentModeType\|modeType\|startMode\|_startSelected" src/main.js | head -30

# Find the canvas sizing issue
grep -n "canvas.width\s*=\|canvas.height\s*=" src/main.js | head -20
grep -n "W\s*=\|H\s*=\|const W\|let W\|var W" src/main.js | head -20
```

---

## FIX 1: Canvas Full Screen (black void borders)

The game content is rendering smaller than the viewport.
Find where W and H are set and make sure they always equal full viewport:

```bash
# Find the actual W/H values being used
grep -n "\bW\b\|\bH\b" src/main.js | grep "=" | grep -v "==" | head -20
grep -n "canvas.width\b" src/main.js | head -10
```

After resizeCanvas() runs, W and H must be updated too:
```js
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  W = window.innerWidth;   // ← these must be updated here
  H = window.innerHeight;  // ← not just once at init
}
```

Also check index.html for any max-width, max-height, or margin on canvas/body:
```bash
grep -n "max-width\|max-height\|margin\|padding\|transform\|scale" index.html
```

Remove any constraints that would limit canvas size.

---

## FIX 2: Alchemy Freeze

The alchemy mode freezes the entire game (user has to kill cmd).
This means there is either:
- An infinite while loop with no exit condition
- A synchronous operation that blocks the event loop
- An unhandled error that breaks the requestAnimationFrame cycle

```bash
# Read the alchemy mode file completely
cat src/modes/alchemy-mode.js 2>/dev/null || \
cat src/gameplay-modes/alchemy-mode.js 2>/dev/null || \
find src/ -name "*alchemy*" -exec cat {} \;
```

### Fix A: Add freeze guard at top of update()
Find the update or tick function in alchemy mode:
```js
update(dt) {
  // FREEZE GUARD — must be first line
  if (!dt || dt > 0.5 || isNaN(dt)) return;
  
  // rest of update...
}
```

### Fix B: Find and fix any while loops
```bash
grep -n "while\s*(" src/modes/alchemy-mode.js 2>/dev/null || \
grep -rn "while\s*(" src/ --include="*alchemy*"
```

Every `while` loop must have a maximum iteration counter:
```js
let safety = 0;
while (condition) {
  safety++;
  if (safety > 10000) { console.warn('alchemy: safety break'); break; }
  // loop body
}
```

### Fix C: Wrap alchemy startup in try/catch in main.js
Find where alchemy mode is initialized:
```bash
grep -n "alchemy\|AlchemyMode\|new.*lchemy" src/main.js | head -10
```

Wrap it:
```js
try {
  _alchemyMode = new AlchemyMode(canvas, state);
  _alchemyMode.init();
} catch(e) {
  console.error('Alchemy init failed:', e);
  // Fall back to a safe state instead of freezing
  setPhase('title');
}
```

### Fix D: If alchemy has no real content yet, show placeholder
If the alchemy mode file exists but is empty/stub, replace it with
a working placeholder that doesn't freeze:

```js
// Minimal alchemy mode that won't freeze
export class AlchemyMode {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
    this.time = 0;
    this.initialized = false;
  }
  
  init() {
    this.initialized = true;
    this.bubbles = Array.from({length: 15}, () => ({
      x: Math.random() * this.canvas.width,
      y: this.canvas.height,
      vy: -(0.5 + Math.random() * 1.5),
      r: 3 + Math.random() * 8,
      wobble: Math.random() * Math.PI * 2,
    }));
  }
  
  update(dt) {
    if (!dt || dt > 0.5) return; // freeze guard
    this.time += dt;
    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.wobble += 0.05;
      b.x += Math.sin(b.wobble) * 0.3;
      if (b.y < -20) {
        b.y = this.canvas.height + 10;
        b.x = Math.random() * this.canvas.width;
      }
    });
  }
  
  render(ctx) {
    const c = this.canvas;
    // Dark lab background
    ctx.fillStyle = '#000d00';
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Bench
    ctx.fillStyle = '#2a1500';
    ctx.fillRect(0, c.height * 0.7, c.width, c.height * 0.08);
    
    // Bubbles rising
    this.bubbles.forEach(b => {
      ctx.strokeStyle = 'rgba(0,200,50,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Cauldron glow
    const glow = ctx.createRadialGradient(c.width/2, c.height*0.7, 0, c.width/2, c.height*0.7, c.height*0.3);
    glow.addColorStop(0, 'rgba(0,120,0,0.15)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Title
    ctx.fillStyle = '#00aa44';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALCHEMY — TRANSMUTATION CHAMBER', c.width/2, c.height * 0.15);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#006622';
    ctx.fillText('Mechanics in development — ESC to return', c.width/2, c.height * 0.2);
  }
  
  destroy() {}
}
```

---

## FIX 3: RPG Mode — Remove Grid Tiles, Show Scene

RPG mode is showing the grid tile engine. It must NOT show grid tiles.

```bash
# Find where RPG mode starts
grep -n "rpg\|RPG\|narrative\|story" src/main.js | head -20

# Find the RPG mode file
find src/ -name "*rpg*" | grep -v node_modules
cat src/modes/rpg-mode.js 2>/dev/null || find src/ -name "*rpg*" -exec cat {} \;
```

The root cause is one of:
A) RPG mode calls `startGame()` or `drawGame()` which renders the grid
B) RPG mode falls through to the default grid rendering path

**To find the bug:**
```bash
grep -n "startGame\|drawGame\|game\s*=" src/main.js | grep -i "rpg\|narrative" | head -10
# Also check the main loop's mode dispatch:
grep -n "case.*rpg\|'rpg'" src/main.js | head -10
```

**The fix:** Make sure RPG mode has its OWN render function that draws
a scene, NOT the grid. If RPG mode currently falls through to grid rendering,
add an explicit early return with RPG rendering:

```js
// In the main game loop, find the mode dispatch:
if (_currentModeType === 'rpg') {
  // Draw RPG scene — NOT the grid
  drawRPGScene(ctx, canvas, state);
  return; // ← critical: stop here, don't fall through to drawGame()
}
```

A minimal RPG scene renderer:
```js
function drawRPGScene(ctx, canvas, state) {
  // Dark interior background
  ctx.fillStyle = '#0d0800';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Ambient glow
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.height * 0.5);
  grad.addColorStop(0, 'rgba(180,100,0,0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Scene text
  const scene = state.rpgScene || {
    location: 'The Void Between Worlds',
    description: 'You stand at a threshold. The dreamscape waits.',
    choices: ['Step forward', 'Look around', 'Rest here'],
  };
  
  ctx.fillStyle = '#cc8800';
  ctx.font = '28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(scene.location, canvas.width/2, canvas.height * 0.2);
  
  ctx.fillStyle = '#886644';
  ctx.font = '18px monospace';
  ctx.fillText(scene.description, canvas.width/2, canvas.height * 0.35);
  
  // Choices
  scene.choices.forEach((choice, i) => {
    const y = canvas.height * 0.5 + i * 50;
    const selected = (state.rpgChoice === i);
    ctx.fillStyle = selected ? '#ffaa33' : '#886644';
    ctx.font = '20px monospace';
    ctx.fillText((selected ? '▶ ' : '  ') + '[' + (i+1) + '] ' + choice, canvas.width/2, y);
  });
  
  ctx.fillStyle = '#334422';
  ctx.font = '14px monospace';
  ctx.fillText('1/2/3 to choose · ESC to pause', canvas.width/2, canvas.height * 0.85);
}
```

---

## FIX 4: Ornithology — Remove Grid Background, Fix HUD Clip

```bash
# Find ornithology mode file
find src/ -name "*ornith*" | grep -v node_modules
cat src/modes/ornithology-mode.js 2>/dev/null || \
find src/ -name "*ornith*" -exec cat {} \;
```

**Problem 1: Grid tiles showing behind ornithology**
Same issue as RPG — ornithology is probably not fully preventing the grid from rendering.

Check the mode dispatch in the main loop:
```bash
grep -n "ornith\|'ornithology'" src/main.js | head -15
```

Make sure ornithology has a `return` BEFORE `drawGame()` is reached.

**Problem 2: HUD text clipped at bottom**
The bird name + score text is rendering at the very bottom and getting cut off.

Find where the bottom HUD bar renders in ornithology:
```bash
grep -n "fillText\|canvas.height\|bottom\|HUD\|score\|name" src/modes/ornithology-mode.js 2>/dev/null | head -20
```

Move any text from `canvas.height - X` upward by at least 60px:
```js
// BEFORE (clipping):
ctx.fillText(birdName, canvas.width/2, canvas.height - 10);

// AFTER (visible):
ctx.fillText(birdName, canvas.width/2, canvas.height - 80);
```

Also move the bottom HUD bar up:
```js
// The bottom HUD bar should be at canvas.height - 60, not canvas.height - 10
const HUD_Y = canvas.height - 60;
```

---

## Verification

After each fix: `npm run build && echo "BUILD OK"`

Final check:
```bash
npm run build
```

Then play each mode and confirm:
- [ ] Alchemy: opens to dark lab scene, does NOT freeze
- [ ] RPG: shows scene text and choices, NO colored grid tiles
- [ ] Ornithology: shows natural background, bird HUD fully visible at bottom
- [ ] Canvas: no black void borders — content fills screen

## Commit message
```
fix: FIX-MODES1 -- alchemy freeze guard, RPG removes grid, ornithology background + HUD fix
```
