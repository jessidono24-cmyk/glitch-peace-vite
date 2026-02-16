# BUILD INSTRUCTIONS

## Current Status

✅ **Created:**
- `package.json` - Project config
- `vite.config.js` - Build setup
- `index.html` - Entry point
- `manifest.json` - PWA config
- `src/core/constants.js` - All constants
- `README.md` - Full documentation

## What You Need to Create

I've provided the **architecture and templates** below. Each file has:
1. Full structure
2. Function signatures
3. Implementation notes
4. Line count targets

---

## Step 1: Core Systems (Priority 1)

### `src/core/utils.js` (~80 lines)
```javascript
// Helper functions
export const rnd = n => Math.floor(Math.random() * n);
export const pick = arr => arr[rnd(arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (y1, x1, y2, x2) => Math.abs(y2-y1) + Math.abs(x2-x1);

// Canvas helpers
export function resizeCanvas(canvas, w, h, dpr) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${Math.min(w, window.innerWidth-16)}px`;
  canvas.style.height = 'auto';
}

// Local storage helpers
export const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  clear: (key) => localStorage.removeItem(key),
};
```

### `src/core/emotional-engine.js` (~250 lines)
```javascript
import { clamp } from './utils.js';

export const EMOTIONS = {
  awe:       { v: 0.7,  a: 0.6, c: 0.8,  col: '#ffcc00' },
  grief:     { v: -0.4, a: 0.3, c: 0.7,  col: '#4488cc' },
  anger:     { v: -0.6, a: 0.9, c: 0.5,  col: '#ff3344' },
  curiosity: { v: 0.5,  a: 0.7, c: 0.9,  col: '#88ffaa' },
  shame:     { v: -0.7, a: 0.6, c: 0.3,  col: '#664488' },
  tender:    { v: 0.8,  a: 0.4, c: 0.95, col: '#ffaacc' },
  fear:      { v: -0.5, a: 0.8, c: 0.4,  col: '#6655aa' },
  joy:       { v: 0.9,  a: 0.8, c: 0.85, col: '#ffee44' },
  despair:   { v: -0.9, a: 0.4, c: 0.2,  col: '#223355' },
  hope:      { v: 0.6,  a: 0.5, c: 0.8,  col: '#66ddaa' },
};

export class EmotionalField {
  constructor() {
    this.values = {};
    for (const em in EMOTIONS) this.values[em] = 0;
  }
  
  add(emotion, amount) {
    if (!EMOTIONS[emotion]) return;
    this.values[emotion] = clamp((this.values[emotion] || 0) + amount, 0, 10);
  }
  
  decay(rate) {
    for (const em in this.values) {
      this.values[em] = Math.max(0, this.values[em] - rate);
    }
  }
  
  calcDistortion() {
    let sum = 0;
    for (const [em, val] of Object.entries(this.values)) {
      const e = EMOTIONS[em];
      if (e) sum += val * e.a * (1 - e.c);
    }
    return clamp(sum / 10, 0, 1);
  }
  
  calcCoherence() {
    let s = 0, n = 0;
    for (const [em, val] of Object.entries(this.values)) {
      const e = EMOTIONS[em];
      if (e && val > 0) { s += e.c * val; n += val; }
    }
    return n > 0 ? s / n : 0.5;
  }
  
  checkSynergy() {
    const v = this.values;
    const c = this.calcCoherence();
    
    if (v.anger > 3 && c > 0.7) return 'focused_force';
    if (v.anger > 3 && c < 0.4) return 'chaos_burst';
    if (v.grief > 3 && v.curiosity > 2) return 'deep_insight';
    if (v.shame > 3 && v.awe > 2) return 'collapse_event';
    if (v.tender > 3 && v.fear > 2) return 'protective';
    if (v.joy > 5 && v.hope > 3) return 'resonance';
    if (v.despair > 5) return 'dissolution';
    
    return null;
  }
}
```

### `src/core/temporal-system.js` (~200 lines)
```javascript
export const LUNAR_PHASES = [
  { id: 0, name: 'New',         vis: 0.5, ins: 1.3, drm: 0.6, agg: 0.8 },
  { id: 1, name: 'WaxCres',     vis: 0.7, ins: 1.1, drm: 0.8, agg: 0.9 },
  { id: 2, name: '1stQuarter',  vis: 1.0, ins: 1.0, drm: 1.0, agg: 1.1 },
  { id: 3, name: 'WaxGib',      vis: 1.2, ins: 1.1, drm: 1.2, agg: 1.2 },
  { id: 4, name: 'Full',        vis: 1.3, ins: 1.4, drm: 1.5, agg: 1.4 },
  { id: 5, name: 'WanGib',      vis: 1.1, ins: 1.5, drm: 1.3, agg: 1.1 },
  { id: 6, name: 'LastQuarter', vis: 0.9, ins: 1.3, drm: 0.9, agg: 0.9 },
  { id: 7, name: 'WanCres',     vis: 0.6, ins: 1.2, drm: 0.7, agg: 0.7 },
];

export const WEEK_DAYS = [
  { name: 'RadiantCore',    force: 0,   ins: 0.1, rel: 0.1, exp: 0.3, str: 0,   sig: 0.1, rad: 0.4 },
  { name: 'ReflectField',   force: 0,   ins: 0.5, rel: 0,   exp: 0,   str: 0.1, sig: 0.2, rad: 0 },
  { name: 'ActionVector',   force: 0.5, ins: -0.1, rel: -0.1, exp: 0.2, str: 0, sig: 0, rad: 0.1 },
  { name: 'PatternLogic',   force: 0,   ins: 0.4, rel: 0,   exp: 0,   str: 0.2, sig: 0.3, rad: 0 },
  { name: 'ExpansionArc',   force: 0.1, ins: 0.2, rel: 0.1, exp: 0.5, str: -0.1, sig: 0.1, rad: 0.2 },
  { name: 'RelationFlow',   force: -0.1, ins: 0.1, rel: 0.5, exp: 0.1, str: 0, sig: 0.1, rad: 0.1 },
  { name: 'StructureTrial', force: 0.2, ins: 0,   rel: -0.1, exp: -0.1, str: 0.5, sig: 0, rad: 0.1 },
];

export class TemporalSystem {
  constructor() {
    this.lunarIdx = 0;
    this.weekIdx = 0;
    this.lunarTimer = 0;
    this.weekTimer = 0;
    this.LUNAR_LEN = 3600;  // frames per phase
    this.WEEK_LEN = 7200;   // frames per day
  }
  
  advance(dt) {
    this.lunarTimer += dt;
    if (this.lunarTimer >= this.LUNAR_LEN) {
      this.lunarTimer = 0;
      this.lunarIdx = (this.lunarIdx + 1) % 8;
    }
    
    this.weekTimer += dt;
    if (this.weekTimer >= this.WEEK_LEN) {
      this.weekTimer = 0;
      this.weekIdx = (this.weekIdx + 1) % 7;
    }
  }
  
  getModifiers(emotionalField) {
    const lunar = LUNAR_PHASES[this.lunarIdx];
    const week = WEEK_DAYS[this.weekIdx];
    const dist = emotionalField.calcDistortion();
    const coh = emotionalField.calcCoherence();
    
    return {
      aggression: lunar.agg * (1 + week.force) * (1 + dist * 0.3),
      insight: lunar.ins * (1 + week.ins) * (1 + coh * 0.2),
      dreamPermeability: lunar.drm * (1 + week.exp * 0.2) * (1 + dist * 0.4),
      visibility: lunar.vis * (1 - dist * 0.2),
      structureWeight: 1 + week.str,
      relationBias: week.rel,
      radianceBonus: week.rad,
    };
  }
}
```

Continue this pattern for:
- `src/core/archetype-system.js`
- `src/core/biome-system.js`
- `src/core/pattern-recognition.js`

---

## Step 2: Game Systems (Priority 2)

Template for each file in `src/systems/`:

```javascript
// src/systems/grid-generation.js
import { T, TILE_DEF } from '../core/constants.js';
import { rnd, pick } from '../core/utils.js';

export function makeGrid(size) {
  const grid = Array.from({length: size}, () => new Array(size).fill(T.VOID));
  // Add walls (7% of tiles)
  // Clear spawn area (0,0)
  return grid;
}

export function spawnTile(grid, count, type, size, avoidCorner) {
  // Spawn count tiles of type in grid
  // Avoid corner if flag set
}

export function buildDreamscape(ds, size, level, prevScore, prevHp) {
  // 1. Make grid
  // 2. Calculate peace count (Fibonacci-inspired)
  // 3. Spawn hazards from ds.hazardSet
  // 4. Spawn special tiles
  // 5. Spawn enemies
  // 6. Add boss if level >= 6
  // 7. Return complete game state object
}
```

Similar templates for:
- `tile-system.js`
- `player-movement.js`
- `enemy-ai.js`
- `boss-system.js`
- `particle-system.js`
- `combat-system.js`

---

## Step 3: Dreamscapes (Priority 3)

Each dreamscape file follows this template:

```javascript
// src/dreamscapes/void.js
import { T } from '../core/constants.js';

export const VOID = {
  id: 'void',
  name: 'VOID STATE',
  subtitle: 'raw survival · awakening',
  matrixDefault: 'B',
  bgColor: '#03030a',
  bgAccent: '#001a0a',
  emotion: 'numbness',
  archetype: null,
  hazardSet: [T.DESPAIR, T.TERROR, T.HARM],
  hazardCounts: [4, 3, 2],
  specialTiles: [],
  enemyBehavior: 'wander',
  enemyCount: 2,
  environmentEvent: null,
  narrative: 'the void holds you… begin',
  completionText: 'you surfaced from the void…',
};
```

Create 10 files following constants.js definitions.

---

## Step 4: UI (Priority 4)

### `src/ui/draw-game.js` (~600 lines)
Main rendering function. Draws:
- Background (biome colors)
- Stars
- Scanlines
- Grid tiles (with shimmer, sparkle, glow)
- Enemies
- Boss
- Player (white core, cyan outline)
- Particles
- Effects (flash, shake, vignette)

### `src/ui/draw-hud.js` (~300 lines)
HUD elements:
- HP bar
- Energy bar
- Glitch pulse charge
- Archetype indicator
- Score
- Temporal info (lunar + week)
- Matrix indicator
- Distortion/Coherence meters

### Other UI files
- `draw-menus.js` - Title, options, pause, etc.
- `draw-guide.js` - H key overlay
- `tutorial.js` - 4-phase tutorial
- `mobile-controls.js` - Touch handling

---

## Step 5: Recovery Tools (Priority 5)

Each recovery tool is a module with:
- State object
- init() function
- update(dt) function
- draw(ctx) function
- Optional UI overlay

Example:
```javascript
// src/recovery/hazard-pull.js
export class HazardPull {
  constructor() {
    this.active = false;
    this.intensity = 0;
  }
  
  calculate(player, grid) {
    // Find nearby hazard tiles
    // Calculate pull force based on proximity
    // Return intensity value
  }
  
  draw(ctx, player, intensity) {
    // Visual drift effect
    // Subtle screen lean
    // Optional warning message
  }
}
```

---

## Step 6: Main Entry Point

### `src/main.js` (~150 lines)
```javascript
import { EmotionalField } from './core/emotional-engine.js';
import { TemporalSystem } from './core/temporal-system.js';
// ... import all systems

// Initialize canvas
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// Initialize systems
const emotionalField = new EmotionalField();
const temporal = new TemporalSystem();
// ... init other systems

// Game state
let game = null;
let phase = 'title';

// Main loop
function loop(timestamp) {
  const dt = timestamp - prevTime;
  prevTime = timestamp;
  
  // Update systems
  temporal.advance(dt);
  emotionalField.decay(0.001 * dt);
  
  // Phase-specific logic
  if (phase === 'title') drawTitle();
  else if (phase === 'playing') updateGame(dt);
  // ... other phases
  
  requestAnimationFrame(loop);
}

// Start
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(loop);
```

---

## Quick Start Template

**Copy this to get started faster:**

```bash
# 1. You already have:
# - package.json
# - vite.config.js
# - index.html
# - src/core/constants.js
# - README.md

# 2. Create remaining files using templates above

# 3. Minimal working version (just to test build):
# Create src/main.js with:
console.log('GLITCH·PEACE v5 loading...');
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#00ff88';
ctx.font = '20px Courier New';
ctx.fillText('System Online', 20, 40);
document.getElementById('loading').classList.add('hidden');

# 4. Test:
npm install
npm run dev

# 5. If that works, you're ready to expand!
```

---

## Complete File Checklist

### Core (7 files)
- [x] constants.js
- [ ] utils.js
- [ ] emotional-engine.js
- [ ] temporal-system.js
- [ ] archetype-system.js
- [ ] biome-system.js
- [ ] pattern-recognition.js

### Systems (7 files)
- [ ] grid-generation.js
- [ ] tile-system.js
- [ ] player-movement.js
- [ ] enemy-ai.js
- [ ] boss-system.js
- [ ] particle-system.js
- [ ] combat-system.js

### Dreamscapes (11 files)
- [ ] index.js (exports)
- [ ] void.js
- [ ] dragon-realm.js
- [ ] courtyard.js
- [ ] leaping-field.js
- [ ] summit.js
- [ ] neighborhood.js
- [ ] bedroom.js
- [ ] aztec.js
- [ ] orb-escape.js
- [ ] integration.js

### UI (6 files)
- [ ] draw-game.js
- [ ] draw-hud.js
- [ ] draw-menus.js
- [ ] draw-guide.js
- [ ] tutorial.js
- [ ] mobile-controls.js

### Progression (4 files)
- [ ] upgrade-shop.js
- [ ] high-scores.js
- [ ] session-manager.js
- [ ] save-system.js

### Recovery (7 files)
- [ ] hazard-pull.js
- [ ] impulse-buffer.js
- [ ] consequence-preview.js
- [ ] pattern-echo.js
- [ ] route-discovery.js
- [ ] relapse-compassion.js
- [ ] threshold-monitor.js

### Accessibility (5 files)
- [ ] settings.js
- [ ] intensity-control.js
- [ ] high-contrast.js
- [ ] stillness-mode.js
- [ ] safety-boundaries.js

### Entry
- [ ] main.js

**TOTAL: 48 files**

---

## Next Steps

1. **Start with minimal main.js** (test build works)
2. **Add core systems** (emotional, temporal)
3. **Add one dreamscape** (void.js)
4. **Add basic rendering** (draw-game.js)
5. **Test gameplay loop**
6. **Expand incrementally**

The templates above give you the structure. Fill in implementation details based on v4 logic + the new systems we designed.

**You have all the architecture. Now build!** 🚀
