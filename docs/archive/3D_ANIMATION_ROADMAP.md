# 🌀 GLITCH·PEACE — 3D & Animation Roadmap

**Status:** Research & Exploration Phase  
**Date:** February 2026  
**Author:** Development session analysis  

---

## 🎯 Vision

GLITCH·PEACE currently renders as a 2D ASCII/tile canvas game. This document explores what it would take to introduce **3D environments**, **animated characters**, and **immersive visual effects** into the existing architecture — and where to start.

---

## 🔍 Current Architecture: What We're Working With

### Rendering Stack
- **Canvas 2D API** (`CanvasRenderingContext2D`) — tile drawing, text, particles, all 9 game modes
- **Vite + vanilla JS modules** — no framework, no bundled game engine
- **18,200 LOC** of game logic written for 2D tile-grid conceptual model
- ~140ms game loop at 60fps, modular mode system via `GameMode` interface

### What 3D Would Need to Plug Into
The modular `GameMode` interface already has a clean `render(gameState, ctx)` hook. Replacing `ctx` with a WebGL/Three.js renderer could work on a **per-mode basis without touching the rest of the game** — which is a huge advantage.

---

## 🗺️ Three Approaches (in order of effort/impact)

---

### 🅐 Approach 1: Canvas 2D + CSS/SVG Animation (Low effort, high immediate impact)

**What to do:** Add animated CSS sprites/SVG elements layered over the canvas, and CSS 3D transforms for perspective effects.

**Can implement NOW without engine changes:**
- CSS `transform: perspective(800px) rotateX(15deg)` on the canvas element for a faux-isometric tilt
- Animated tile sprites using CSS keyframes for the emotional field effects (tiles that pulse/glow/wave)
- Character SVG sprites layered over the canvas for the player and enemies
- CSS particle overlays for GLITCH effects (the "glitch" aesthetic is extremely CSS-achievable)
- WebGL shader post-processing with `<canvas>` filter for scan-line/CRT effects

**Example implementation point:**
```js
// In GridGameMode.render() after canvas draw:
// Inject a CSS overlay with animated character sprite at player position
const overlay = document.getElementById('sprite-layer');
const px = gameState.player.x * gameState.tileSize;
const py = gameState.player.y * gameState.tileSize;
overlay.style.transform = `translate(${px}px, ${py}px)`;
```

**Estimated effort:** 1–2 days for dramatic visual improvement  
**Risk:** Low — no engine changes, purely additive

---

### 🅑 Approach 2: Three.js Integration for Select Modes (Medium effort, high payoff)

**What to do:** Replace the 2D canvas renderer in specific modes with a **Three.js 3D scene** while keeping all game logic identical.

**The key insight:** The `GameMode.render(gameState, ctx)` signature can be overridden. A 3D mode can ignore `ctx` and use its own WebGL renderer.

**Recommended starting point — Constellation Mode:**
The Constellation mode already has a star-field conceptual model. Converting it to 3D is natural:
- Replace flat 2D grid with a **starfield sphere** (Three.js `Points` with sphere geometry)
- Player becomes a **camera/cursor** navigating the star sphere
- Star activation triggers line-drawing between stars (Three.js `Line` objects)
- Nebula particle effects on activation (Three.js `Points` system)

**Three.js setup:**
```bash
npm install three
```

```js
// ConstellationMode3D.js (new parallel mode)
import * as THREE from 'three';

export class ConstellationMode3D extends GameMode {
  init(gameState, canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    // Stars as 3D points in the scene
    // All existing game logic (peaceNodes, scoring, level progression) unchanged
  }
  
  render(gameState) {
    // 3D render — ignores the 2D ctx
    this.renderer.render(this.scene, this.camera);
  }
}
```

**Canvas sharing issue:** Three.js uses a WebGL context, but the main game uses 2D context on the same canvas. Solution: create a **second canvas** for 3D modes, swap visibility.

**Estimated effort:** 3–5 days per mode  
**Risk:** Medium — WebGL context management needs care, but no core logic changes

---

### 🅒 Approach 3: Animated Characters Using Web Animation API / Sprite Sheets (Medium effort)

**What to do:** Add animated character sprites for the player, enemies, and NPCs.

**Current state:** Player is the `◈` unicode symbol; enemies are `■`. Both are drawn as `ctx.fillText()`.

**Animation approach without 3D:**

1. **Sprite Sheet + Canvas drawImage:** Replace `ctx.fillText('◈', ...)` with `ctx.drawImage(spriteSheet, frameX, 0, 16, 16, px, py, tileSize, tileSize)` where `frameX` advances each frame. This is pure Canvas 2D — zero new dependencies.

2. **Procedural animation with Canvas 2D paths:** Draw characters as vector shapes (circles, bezier curves) and animate properties like `rotation`, `scale`, `wobble`. The emotional field system already provides a `distortion` float we could use to modulate character visual distortion.

3. **CSS + DOM overlays:** Characters as absolutely-positioned `<div>` elements with CSS animations. The canvas handles the world; DOM handles characters.

**Emotional field integration:** The `EmotionalField.calcDistortion()` float (0–1) is already calculated every frame. It can directly drive:
- Character wobble/distortion amplitude
- Particle emission rate  
- Color tint saturation
- Tile pulse frequency

```js
// In any mode's render():
const distortion = gameState.emotionalField.calcDistortion();
const wobble = Math.sin(Date.now() * 0.01) * distortion * 3;
ctx.save();
ctx.translate(px + tileSize/2 + wobble, py + tileSize/2);
ctx.rotate(wobble * 0.1);
// draw character
ctx.restore();
```

**Estimated effort:** 1–3 days for character animation pass  
**Risk:** Low

---

## 🎮 Best First Implementation: Constellation Mode → Three.js

**Why Constellation Mode?**
1. Conceptually already 3D (stars in space)
2. No complex collision detection or tile grid logic to port
3. `peaceCollected/peaceTotal` mechanic maps directly to 3D without changes
4. The existing `ConstellationMode.js` (418 LOC) is self-contained
5. Visual impact is maximum: going from ASCII dots to actual star-sphere would be stunning

**What it unlocks:** Proves the `GameMode` interface can support 3D renderers. Then Alchemy, RPG, and Ornithology can follow the same pattern.

---

## 🏗️ Architecture for Phased 3D Introduction

```
glitch-peace-vite/
├── src/
│   ├── gameplay-modes/
│   │   ├── constellation/
│   │   │   ├── ConstellationMode.js      ← existing 2D (keep)
│   │   │   └── Constellation3DMode.js    ← NEW Three.js version
│   │   └── rpg/
│   │       ├── RPGMode.js                ← existing 2D (keep)
│   │       └── RPG3DMode.js              ← future 3D RPG
│   ├── rendering/                         ← NEW module
│   │   ├── WebGLRenderer.js              ← Three.js wrapper
│   │   ├── SpriteAnimator.js             ← canvas sprite sheet animation
│   │   ├── ParticleSystem3D.js           ← Three.js particles
│   │   └── PostProcessing.js             ← CRT/glitch shader effects
│   └── assets/
│       ├── sprites/                       ← character sprite sheets
│       └── models/                        ← GLTF 3D models (future)
```

**Mode registry:** The `ModeRegistry.js` can simply register `constellation-3d` alongside `constellation`. The game mode selection menu would offer both. This is **zero risk to existing gameplay**.

---

## 🎨 Visual Directions to Explore

### Option A: Low-Poly Aesthetic
- Three.js geometries with flat/toon shading
- Matches the ASCII/glitch aesthetic
- Aligns with "consciousness simulation" brand
- Easy to generate programmatically (no asset pipeline needed)

### Option B: Glitch Art / Datamoshing
- CSS/WebGL shader effects: `chromatic aberration`, `pixel displacement`, `RGB split`
- The "GLITCH" in GLITCH·PEACE demands visual glitch aesthetics
- Implementable today with CSS filters or custom GLSL shaders on a WebGL canvas
- Libraries: `glsl-canvas`, Babylon.js post-processing stack, or custom GLSL via `gl-react`

### Option C: Dream-like Volumetric Effects
- Three.js `FogExp2`, `ShaderMaterial` with noise functions
- Dreamscape-specific fog colors and density
- RIFT dreamscape: electric cyan fog; LODGE: warm amber; DUAT: deep purple
- Maps directly to existing `getDreamscapeTheme()` color palettes

---

## ⚠️ Technical Considerations

### WebGL Context Conflict
The main game uses `canvas.getContext('2d')`. Three.js requires `canvas.getContext('webgl')`. **A single canvas cannot have both contexts simultaneously.**

**Solutions:**
1. **Two canvases:** `<canvas id="canvas-2d">` for existing modes, `<canvas id="canvas-3d" style="display:none">` for 3D modes. Swap visibility on mode switch.
2. **Full migration:** Eventually migrate all rendering to Three.js (with `CanvasTexture` for 2D-style elements). High effort but clean long-term.
3. **Hybrid WebGL 2D:** Use Three.js `OrthographicCamera` with `PlaneGeometry` tiles — renders as 2D but with shader effects. Preserves all existing tile logic with zero game changes while enabling shaders.

### Recommended: Two-Canvas Architecture
```html
<!-- index.html -->
<canvas id="canvas" aria-label="GLITCH·PEACE game canvas"></canvas>
<canvas id="canvas-3d" style="display:none;position:absolute;top:0;left:0;"></canvas>
```

The `GameMode.init(gameState, canvas, ctx)` signature already passes `canvas` — 3D modes can use `document.getElementById('canvas-3d')` instead, and `main.js` flips visibility during mode switch.

---

## 🎯 Recommended Implementation Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Emotional distortion character wobble (Canvas 2D) | 0.5 day | High |
| 2 | CSS CRT/scanline shader on game canvas | 0.5 day | High |
| 3 | Player & enemy sprite animation (Canvas 2D drawImage) | 1–2 days | High |
| 4 | Constellation Mode → Three.js 3D starfield | 3–4 days | Very High |
| 5 | Three.js post-processing (glitch, bloom, chromatic) | 2 days | High |
| 6 | Alchemy Mode → Three.js particle transmutation | 3–4 days | High |
| 7 | RPG Mode → 3D isometric grid with character sprites | 5–7 days | Very High |

---

## 📦 Dependencies to Evaluate

| Package | Purpose | Size | Risk |
|---------|---------|------|------|
| `three` | 3D rendering engine | 160KB gzip | Low (mature, stable) |
| `@react-three/fiber` | React bindings | N/A (no React) | Skip |
| `@tweenjs/tween.js` | Smooth animations | 3KB | Very low |
| `glsl-canvas` | Inline GLSL shaders on canvas | 8KB | Low |
| `pixi.js` | WebGL 2D renderer (faster than canvas) | 200KB | Medium |

**Recommendation for first step:** Just `three` (or even just `tween.js` for animation without 3D). No other dependencies needed.

---

## 🔬 Research Links

- [Three.js Journey](https://threejs-journey.com/) — best Three.js course
- [WebGL Fundamentals](https://webglfundamentals.org/) — low-level WebGL
- [Shadertoy](https://www.shadertoy.com/) — glitch shaders inspiration (search "glitch", "datamosh", "CRT")
- [three.js + Canvas 2D co-existence](https://discourse.threejs.org/t/using-threejs-with-html5-canvas-2d-context/26758)
- [Kenney.nl](https://kenney.nl/assets) — free 2D/3D sprite packs (MIT licensed) for prototype character art

---

## 💡 Quick Win: Add Distortion Animation Today

The simplest 3D-like effect that can be added in ~30 minutes with zero dependencies:

```js
// In main.js render() — add to PLAYING state after mode.render():
if (game.emotionalField) {
  const distortion = game.emotionalField.calcDistortion?.() ?? 0;
  const chaos = game.emotionalField.calcDistortion?.() ?? 0;
  if (chaos > 0.3) {
    // CSS class that triggers a CRT scanline/glitch animation
    canvas.classList.toggle('glitch-heavy', chaos > 0.7);
    canvas.classList.toggle('glitch-medium', chaos > 0.3 && chaos <= 0.7);
  } else {
    canvas.classList.remove('glitch-heavy', 'glitch-medium');
  }
}
```

```css
/* In index.html <style> or a CSS file */
@keyframes glitch-anim {
  0% { transform: translate(0, 0) skewX(0deg); filter: hue-rotate(0deg); }
  25% { transform: translate(-2px, 1px) skewX(-1deg); filter: hue-rotate(15deg); }
  50% { transform: translate(2px, -1px) skewX(1deg); filter: hue-rotate(-15deg); }
  75% { transform: translate(-1px, 2px) skewX(0.5deg); filter: hue-rotate(30deg); }
  100% { transform: translate(0, 0) skewX(0deg); filter: hue-rotate(0deg); }
}
canvas.glitch-medium { animation: glitch-anim 0.15s infinite; }
canvas.glitch-heavy  { animation: glitch-anim 0.06s infinite; filter: hue-rotate(45deg) saturate(2); }
```

This requires zero new dependencies, uses the existing `EmotionalField` data, and creates a dramatic living visual effect that reinforces the "consciousness engine" theme.

---

*Document prepared during comprehensive play-testing session, February 2026.*  
*Next step: Implement the CSS glitch effect (30 min) and evaluate Three.js for Constellation Mode (1 sprint).*
