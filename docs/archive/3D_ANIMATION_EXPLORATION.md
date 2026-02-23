# GLITCH·PEACE — 3D & Character Animation Exploration
*Architecture analysis, candidate surfaces, technology options, and phased implementation roadmap*

---

## 1. Where We Are Now — Rendering Architecture Snapshot

The entire game renders onto a single `<canvas>` element via the Canvas 2D API.
Every visual — tiles, player, enemies, boss, HUD, particles, fog of war, constellation
lines — is drawn in `src/ui/renderer.js` through calls like
`ctx.fillRect`, `ctx.arc`, `ctx.beginPath / ctx.stroke`.

Key structural facts for 3D migration planning:

| Property | Current state |
|----------|---------------|
| Renderer | Canvas 2D (`CanvasRenderingContext2D`) |
| Coordinate space | Flat grid — tile (col, row) → pixel (sx + x*(CELL+GAP), sy + y*(CELL+GAP)) |
| Player | Nested rounded-rect brackets (pure 2D, no sprite) |
| Enemies | Filled rounded-rect + triangle icon + dot (pure 2D) |
| Boss | Concentric arcs + phase label (pure 2D) |
| Particles | Canvas `arc` dots |
| Background | Radial gradient + scanlines + star dots |
| Frame loop | `requestAnimationFrame` in `main.js` → `loop()` → `drawGame()` |
| Canvas element | Single `<canvas id="c">` in `index.html` |
| Game logic | Fully decoupled from rendering (grid.js / player.js / enemy.js) |
| Vite build | Pure ESM, no framework, no WebGL currently |

**Critical insight**: Because game **logic** (grid, player, enemies, score, damage) is
completely decoupled from the **renderer**, we can layer in 3D rendering without
touching any game logic. The renderer is the only file that needs surgery.

---

## 2. Areas Ripe for 3D or Character Animation

Ranked by visual impact vs implementation cost:

### 2A — HIGH IMPACT / MEDIUM COST
#### The Player Character
Currently: three nested rounded-rects with glowing bracket corners.
3D opportunity: replace with a simple **3D character model** (low-poly humanoid or
orb-being) rendered via WebGL into the tile cell's screen-space bounding box.
The character could animate:
- `idle` — breathing float cycle
- `walk` — 4-directional step animation triggered each move
- `hit` — recoil + flash when damage taken
- `shield` — glowing energy dome wraps model
- `archetype` — aura rings expand around figure per archetype color
- `death` — dissolve/scatter into particles

Implementation path: **Three.js `WebGLRenderer` in a hidden canvas** composited
onto the main 2D canvas via `ctx.drawImage`. The 3D canvas renders only the
player cell at the appropriate world position. This keeps 100% of existing code
intact — the 3D canvas is just an image source for the 2D compositor.

#### Boss Fights
Currently: concentric arcs with phase label.
3D opportunity: bosses are already the most dramatic moment. A **full 3D boss model**
with phase-specific animations (looming, charging, dissolving) would radically
elevate the experience. The tile the boss occupies could be replaced with a
`WebGLRenderer` sub-canvas that shows the 3D model from a fixed top-down
perspective, matching the grid aesthetic.

Each boss type maps naturally to a 3D concept:
- `fear_guardian` → towering shadowy sentinel, one glowing eye
- `void_sovereign` → abstract black hole / crystalline void mass
- `despair_weaver` → woven tendrils of dark fabric slowly contracting

---

### 2B — HIGH IMPACT / LOW COST
#### Tile Animations (CSS/Canvas upgrades)
Currently: tiles animate via `Math.sin(ts * rate)` pulses on 2D shapes.
3D-adjacent opportunity: add **Z-axis elevation illusion** to tiles using:
- `ctx.transform` skew + perspective to simulate isometric tilt per tile
- Depth-sorted rendering (tiles further from player appear slightly smaller)
- A "rise and fall" Y offset on PEACE tiles using 2D trickery that reads as 3D

This is pure Canvas 2D math, no WebGL needed, and could be toggled as a
"visual style" option in OPTIONS → VISUAL MODE.

#### Character Sprites (Animated 2D)
If full 3D is too early, **animated sprite sheets** are the natural intermediate step:
- Draw character frames offline (or generate with AI art tools)
- Load as `<img>` elements, draw subregion per animation frame with `ctx.drawImage`
- Sprite frames: idle (4), walk_up/down/left/right (4 each), hit (2), death (6)
- Total: ~22 frames per character at 32×32 or 64×64 px
- Zero impact on game logic; only renderer.js changes

The existing player rendering block (lines 459–494 of renderer.js) is already
self-contained and can be swapped for a sprite draw in one change.

---

### 2C — MEDIUM IMPACT / HIGH COST
#### Isometric Grid View
The GAP_ANALYSIS.md blueprint (LAYER 6) already identifies **isometric/tactical view**
as a P4 goal. This would transform the top-down grid into a 2.5D iso projection
(similar to early Fallout / Diablo). Every tile cell gets a 3D-looking box face.

Implementation: the tile coordinate math in `renderer.js` (the `px / py` calculation)
is the only thing that changes — `iso_x = (x - y) * TILE_W / 2`, `iso_y = (x + y) * TILE_H / 2`.
All hit-testing, movement, and logic remains grid-based (row, col).

**Pilot approach**: add `CFG.viewMode = 'iso'` boolean and a second rendering path
in `drawGame()` that uses iso coordinates. Can be toggled live without restart.

#### Constellation Mode — 3D Star Field
Constellation mode already has a procedurally generated star field. Converting this
to a **WebGL particle system** (Three.js `Points` + custom shader) would give:
- Stars with volumetric glow (additive blending)
- Parallax depth (star layers at different Z)
- Constellation lines with animated glow shader
- Camera drift as player moves (slow 3D pan)

The constellation mode's canvas is already completely separate from the grid renderer —
it's the cleanest place to introduce WebGL with zero risk to the core game.

---

### 2D — LONG-TERM / ARCHITECTURAL
#### Full 3D Dreamscape Environments
The most ambitious interpretation: replace the flat grid entirely with a 3D environment
for select dreamscapes. The player navigates a 3D space and PEACE/INSIGHT tiles exist
as collectible objects at 3D coordinates.

Candidate dreamscapes for 3D pilots (their themes align naturally with 3D spaces):
- **Mountain Dragon Realm** → rocky canyon with 3D cliff faces, dragon circling
- **Deep Ocean** → volumetric water effect, bioluminescent particles rising
- **Crystal Cave** → reflective gem geometry with real-time reflections
- **Void Nexus** → black hole event horizon shader, spiraling tile objects
- **Ancient Structure** → stone columns, sacred geometry — perfect for iso 3D

This path requires a proper **scene graph** (Three.js or Babylon.js), and is 2–3 months
of work from the current codebase state.

#### Character Dialogue with Animated Portraits
The blueprint (GAP_ANALYSIS LAYER 6) calls out a **dialogue/visual novel mode** as P3.
The archetype system already has 5 characters with names, colors, and activation messages.
Adding **animated character portraits** (2D PNG sprite faces with idle/talking/emotion
animation) to the interlude and archetype dialogue screens would bring significant character
life without 3D geometry.

Archetypes with ready narrative identities:
- DRAGON — ancient fire guardian, scaled face, amber eyes
- CHILD GUIDE — luminous child silhouette, star-light halo
- ORB / SHEEP — abstract geometric orb that morphs with emotion
- CAPTOR-TEACHER — masked figure, dual-tone cloak
- PROTECTOR — armored sentinel with light-blue shield glow

---

## 3. Technology Stack Options

### Option A — Three.js (Recommended First Step)
**Why**: Easiest WebGL entry point; massive ecosystem; works in Vite with zero config.

```bash
npm install three
```

Size: ~160 KB gzipped — acceptable for current 113 KB game bundle.

Integration pattern:
```js
// src/rendering/three-layer.js (new file)
import * as THREE from 'three';

export class ThreeLayer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(...);  // match grid top-down view
  }

  // Called from drawGame() after 2D grid is drawn
  compositeOnto(ctx2d, x, y, w, h) {
    this.renderer.render(this.scene, this.camera);
    ctx2d.drawImage(this.renderer.domElement, x, y, w, h);
  }
}
```

The `<canvas>` used by Three.js can be hidden (`display:none`) — we only use its
pixel data as a texture/image source that gets composited onto the main 2D canvas.

### Option B — PixiJS (Best for Sprite Animation)
**Why**: Optimized for 2D sprite rendering with WebGL acceleration; perfect for
character animation without going full 3D.

```bash
npm install pixi.js
```

PixiJS can replace the `canvas-2d` tile draw loop entirely, giving hardware-accelerated
sprite batching. This is the lowest-risk path to animated characters.

### Option C — Babylon.js (Full 3D Engine)
**Why**: More powerful than Three.js for a full game (built-in physics, PBR materials,
animation system, scene inspector). Higher learning curve. Best reserved for when
the full 3D dreamscape vision is pursued.

```bash
npm install @babylonjs/core
```

### Option D — Custom WebGL Shader Layer
For specific visual effects (void nexus event horizon, crystal cave reflections, glitch
distortion), **custom WebGL fragment shaders** via raw WebGL or `ogl` (tiny WebGL lib,
~10 KB) could be used without bringing in a full 3D engine. This is ideal for the
Matrix A glitch effect and dreamscape-specific background environments.

### Option E — CSS 3D Transforms (No WebGL)
For the isometric grid illusion and tile depth effects, pure **CSS perspective +
transform-style: preserve-3d** on DOM elements could achieve a tile-stacking effect.
Requires switching from canvas to DOM-based tile rendering — higher HTML complexity
but no WebGL knowledge needed.

---

## 4. Concrete First Steps (Ordered by Risk/Reward)

### Step 1 — Animated Sprite System for Player (Week 1–2)
**Files touched**: `src/ui/renderer.js`, add `src/rendering/sprite-player.js`
**Zero logic changes**. Create a `SpritePlayer` class that:
1. Loads a sprite sheet PNG (or SVG frames) via `<img>` preload
2. Exposes `draw(ctx, px, py, direction, state, ts)` method
3. Replaces the existing player rendering block in `drawGame()`
Can fall back to existing rendering if sprite not loaded.
**Deliverable**: Player character has walk/idle/hit animations.

### Step 2 — Three.js Constellation Star Field (Week 2–3)
**Files touched**: `src/modes/constellation-mode.js`, add `src/rendering/three-layer.js`
1. `npm install three` (check for vulnerabilities first)
2. Create `ThreeLayer` class with orthographic camera matching grid bounds
3. Replace background star rendering in constellation mode with Three.js `Points`
4. Add volumetric star glow via `AdditiveBlending` + `PointsMaterial`
5. Constellation lines become `THREE.Line` with animated shader opacity
**Deliverable**: Constellation mode has a genuine 3D star field.

### Step 3 — Isometric Grid Pilot (Week 3–4)
**Files touched**: `src/ui/renderer.js`, `src/core/state.js` (add `CFG.viewMode`)
1. Add `viewMode: 'flat'` to CFG (default = current flat view)
2. Add `viewMode: 'iso'` option in OPTIONS menu
3. When `viewMode === 'iso'`, use isometric coordinate transform:
   - `iso_x = (x - y) * (CELL + GAP) / 2`
   - `iso_y = (x + y) * (CELL + GAP) / 4`
4. Draw tile faces as parallelograms using `ctx.beginPath() + ctx.moveTo/lineTo`
5. Depth-sort: render bottom rows first (painter's algorithm)
**Deliverable**: Toggle between flat grid and isometric view in settings.

### Step 4 — Three.js Boss Model (Month 2)
1. Create low-poly 3D boss models using Three.js `BoxGeometry` / `SphereGeometry` /
   `TubeGeometry` procedurally (no external 3D asset files needed initially)
2. Phase-specific materials: emissive color, wireframe overlay at low HP
3. Boss tile renders the Three.js canvas composited over the 2D grid tile
4. Animations: idle orbit, charge pulse, death shatter using `THREE.AnimationMixer`

### Step 5 — Full 3D Dreamscape Pilot (Month 3+)
Pilot: **Void Nexus** dreamscape (already the most abstract / visual)
1. Three.js scene replacing the 2D grid entirely for this dreamscape
2. Tile objects placed at 3D positions matching grid row/col coordinates
3. Player character navigates the 3D space via same WASD input
4. Grid logic unchanged — only rendering layer is 3D

---

## 5. Architecture: The Render Bridge Pattern

The key insight for a zero-disruption 3D introduction is the **Render Bridge**:

```
Game Logic Layer (unchanged)          Render Layer (extended)
──────────────────────────────────    ──────────────────────────────────────
grid.js     → game state array         drawGame(ctx, ...)
player.js   → player {x, y, hp}         ├── 2D base: tiles, fog, HUD
enemy.js    → enemies [{x, y, ...}]     ├── RenderBridge.draw2D(ctx, game)
boss-system → boss {x, y, hp}          └── RenderBridge.draw3D(threeCanvas)
                                              ↓
                                         ctx.drawImage(threeCanvas, ...)
```

`RenderBridge` is a new singleton in `src/rendering/render-bridge.js` that:
- Holds the `ThreeLayer` instance
- Receives game state each frame from `drawGame()`
- Knows which entities to render in 3D (player, boss, specific tile types)
- Returns a composited image region for `drawGame()` to blit onto the 2D canvas

This pattern means:
- Game logic is 100% untouched
- 2D rendering continues unchanged for most elements
- 3D is additive overlay, not a replacement
- Can be feature-flagged: `CFG.render3D = false` disables the 3D layer entirely

---

## 6. Character Design — Archetypes as 3D Characters

The 5 existing archetypes have strong enough identities to become animated characters:

| Archetype | 3D Character Concept | Animation Set |
|-----------|---------------------|---------------|
| **DRAGON** | Low-poly Eastern dragon, sinuous body, ember eyes | Coil idle, wing spread on activation, leap on power use |
| **CHILD GUIDE** | Small luminous child, robes of light | Float bounce, point/gesture on reveal, wave on completion |
| **ORB / SHEEP** | Geometric dodecahedron morphing to lamb form | Slow rotation idle, phase-shift glow pulse, teleport dissolve |
| **CAPTOR-TEACHER** | Masked dual-face (one kind, one stern), hooded | Slow turn idle, loop gesture (rewind), unfold arms on completion |
| **PROTECTOR** | Armored sentinel, shield glowing | Stance hold, shield slam on activation, step forward on stun |

**Minimal 3D implementation** (avoids external assets):
Each archetype character can be built entirely from **Three.js primitive geometry**:
- Dragon: several tapered cylinders joined with bones, emissive amber material
- Child: sphere (head) + cylinder (body) + cone (gown), `#aaffcc` emissive
- Orb: `IcosahedronGeometry` with `wireframe: true` + inner solid glow sphere
- Captor: flat `BoxGeometry` with dual-material face texture (drawn to canvas)
- Protector: `BoxGeometry` torso + `CylinderGeometry` shield disc

---

## 7. Dreamscape-Specific 3D Opportunities

| Dreamscape | 3D/Animation Opportunity | Priority |
|-----------|--------------------------|----------|
| **Void Nexus** | Black hole shader (GLSL fragment), event-horizon tidal distortion | P1 pilot |
| **Crystal Cave** | Reflective `MeshPhysicalMaterial` gem tiles with env map | P2 |
| **Deep Ocean** | Vertex-animated water plane, rising bioluminescent particles | P2 |
| **Mountain Dragon Realm** | Rocky terrain height map, dragon 3D figure circling overhead | P2 |
| **Ancient Structure** | Procedural stone column geometry, sacred geometry floor patterns | P3 |
| **Forest Sanctuary** | Particle tree canopy, dappled light shader | P3 |
| **Solar Temple** | Sun bloom shader, radial heat-distortion ripple | P3 |
| **Cloud City** | Layered cloud plane with parallax scroll, atmospheric haze | P3 |
| **Constellation Mode** | ✅ Star-field Three.js pilot (first target, see Step 2 above) | P1 |

---

## 8. Blueprint Completion Check

Cross-referencing GAP_ANALYSIS.md LAYER 1 (Perception / Visual Modes):

| Blueprint Item | Status | 3D Exploration Relevance |
|---------------|--------|--------------------------|
| **Flow-field orb world** (continuous 2D physics) | ❌ P3 in blueprint | Could be a Three.js physics mode — `cannon-es` for soft-body tiles |
| **First-person raycasting mode** | ❌ P4 in blueprint | Three.js perspective camera + GLSL raycast shader — clean path |
| **Isometric/tactical view** | ❌ P4 in blueprint | **PROMOTED to P2** — canvas transform math only, no WebGL |
| **Dialogue/visual novel mode** | ❌ P3 in blueprint | Animated 2D portraits first; 3D talking heads later |
| **Side-scrolling platformer** | ❌ P3 in blueprint | Leaping Field dreamscape with physics — PixiJS or Three.js |

Additionally from the blueprint:
- **Weather system** (P3) — rain/fog/storm: easiest done with Three.js particle system
- **8 Biome system** (P2) — biome-specific 3D environments would define each biome
- **10 additional archetypes** (P2) — each new archetype gets a 3D character on intro

---

## 9. Security & Dependency Audit Plan

Before installing any 3D library, run advisory scan:
```bash
# For Three.js (npm ecosystem)
# Use the gh-advisory-database tool before: npm install three
# three@latest = 0.x.x — check for known CVEs

# For PixiJS
# pixi.js@latest — check for known CVEs
```

No external network calls; all 3D rendering is client-side CPU/GPU.
No additional attack surface beyond current Vite dev server.

---

## 10. Summary: Recommended Phased Roadmap

```
Phase 3D-A  (Week 1-2)   █████░░░░░░░░░░░░░░░
  Animated sprites for player (walk/idle/hit)
  Files: renderer.js + src/rendering/sprite-player.js (new)
  No new dependencies; pure canvas drawImage

Phase 3D-B  (Week 3-4)   ████████░░░░░░░░░░░░
  Isometric grid view toggle (CFG.viewMode)
  Files: renderer.js + state.js + menus.js
  No new dependencies; pure canvas math

Phase 3D-C  (Month 2)    ████████████░░░░░░░░
  Three.js constellation star field
  New dep: three (~160 KB gz)
  Files: constellation-mode.js + src/rendering/three-layer.js (new)

Phase 3D-D  (Month 2-3)  ████████████████░░░░
  Three.js boss 3D model (procedural geometry)
  RenderBridge pattern established
  Files: src/rendering/render-bridge.js (new) + renderer.js

Phase 3D-E  (Month 3+)   ████████████████████
  Full 3D dreamscape pilot (Void Nexus)
  Archetype character models (5 archetypes)
  Per-dreamscape 3D environments
```

---

*Document status: Research & architecture complete. Implementation ready to begin with Phase 3D-A.*
*Last updated: February 2026 — GLITCH·PEACE v2.2.0*
