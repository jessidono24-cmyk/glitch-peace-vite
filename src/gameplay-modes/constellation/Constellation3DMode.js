/**
 * Constellation3DMode.js
 *
 * Three.js 3D starfield version of Constellation Mode.
 * Shares all game-logic (peaceCollected, scoring, lore, level progression)
 * with ConstellationMode.js — only the renderer is replaced.
 *
 * Architecture: uses a second <canvas id="canvas-3d"> so the main 2D
 * canvas context is never disturbed. main.js shows/hides them on mode switch.
 *
 * Controls: same WASD/Arrow navigation as the 2D version.
 */

import * as THREE from 'three';
import { ConstellationMode } from './ConstellationMode.js';

// ── Tuning constants ────────────────────────────────────────────────────────
const STAR_SPHERE_RADIUS = 18;   // radius of the background star sphere
const BG_STAR_COUNT      = 800;  // decorative background stars
const CAMERA_DISTANCE    = 22;   // default camera Z distance
const GRID_SCALE         = 0.28; // scale factor: grid-tile → world unit
const FOG_COLOR          = 0x03050f;
const AMBIENT_INTENSITY  = 0.3;

export class Constellation3DMode extends ConstellationMode {
  constructor(config = {}) {
    super({ ...config, type: 'constellation-3d', name: 'Constellation 3D — Stars & Myth' });

    // Three.js objects
    this._renderer3d     = null;
    this._scene          = null;
    this._camera         = null;
    this._canvas3d       = null;
    this._canvas2d       = null; // original 2D canvas (hidden while 3D is active)

    // Mesh pools (reused across constellation loads)
    this._starMeshes     = [];    // activated-star sprites
    this._lineMeshes     = [];    // connection lines
    this._bgStarPoints   = null;  // Points object for bg star-field
    this._nebulaMesh     = null;  // nebula particle cloud
    this._playerMesh     = null;  // player marker
    this._nameLabel      = null;  // canvas2d DOM label overlay
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init(gameState, canvas, ctx) {
    // Run the full 2D init to populate _stars, _bgStars, grid state, etc.
    super.init(gameState, canvas, ctx);

    this._canvas2d = canvas;

    // Get or create the 3D canvas
    this._canvas3d = document.getElementById('canvas-3d');
    if (!this._canvas3d) {
      this._canvas3d = document.createElement('canvas');
      this._canvas3d.id = 'canvas-3d';
      this._canvas3d.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        display:block;image-rendering:pixelated;background:#000;z-index:1;
      `;
      document.getElementById('app')?.appendChild(this._canvas3d);
    }
    this._canvas3d.width  = canvas.width;
    this._canvas3d.height = canvas.height;

    // Hide 2D canvas, show 3D canvas
    canvas.style.display = 'none';
    this._canvas3d.style.display = 'block';

    this._initThree(canvas.width, canvas.height);
    this._build3DScene(gameState);
  }

  _initThree(w, h) {
    // Renderer
    this._renderer3d = new THREE.WebGLRenderer({ canvas: this._canvas3d, antialias: true });
    this._renderer3d.setSize(w, h);
    this._renderer3d.setClearColor(FOG_COLOR);

    // Scene
    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.FogExp2(FOG_COLOR, 0.012);

    // Camera
    this._camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
    this._camera.position.set(0, 0, CAMERA_DISTANCE);

    // Ambient light
    this._scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY));

    // Background star sphere
    this._buildBgStarSphere();
  }

  _buildBgStarSphere() {
    if (this._bgStarPoints) {
      this._scene.remove(this._bgStarPoints);
      this._bgStarPoints.geometry.dispose();
    }
    const positions = new Float32Array(BG_STAR_COUNT * 3);
    const colors    = new Float32Array(BG_STAR_COUNT * 3);
    for (let i = 0; i < BG_STAR_COUNT; i++) {
      // Fibonacci sphere for uniform distribution
      const phi   = Math.acos(1 - 2 * (i + 0.5) / BG_STAR_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = STAR_SPHERE_RADIUS * (0.85 + 0.15 * Math.random());
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = brightness;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true });
    this._bgStarPoints = new THREE.Points(geo, mat);
    this._scene.add(this._bgStarPoints);
  }

  /** Convert grid [x,y] to Three.js world XY (centred at 0,0) */
  _gridToWorld(gx, gy, gridSz) {
    const half = (gridSz - 1) / 2;
    return [(gx - half) * GRID_SCALE, -(gy - half) * GRID_SCALE];
  }

  _buildNebula() {
    if (this._nebulaMesh) {
      this._scene.remove(this._nebulaMesh);
      this._nebulaMesh.geometry.dispose();
      this._nebulaMesh.material.dispose();
    }
    const COUNT = 2000;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);

    // Nebula color palette: purples, blues, teals
    const palette = [
      [0.55, 0.20, 0.90], // purple
      [0.25, 0.40, 0.95], // blue
      [0.15, 0.75, 0.85], // teal
      [0.60, 0.30, 0.80], // violet
      [0.35, 0.55, 1.00], // cornflower
    ];

    for (let i = 0; i < COUNT; i++) {
      // Gaussian distribution (Box-Muller transform).
      // Add epsilon to prevent Math.log(0) when Math.random() returns exactly 0.
      const u = Math.random() + 1e-10;
      const v = Math.random() + 1e-10;
      const r = Math.sqrt(-2 * Math.log(u));
      const theta = 2 * Math.PI * v;
      positions[i * 3]     = r * Math.cos(theta) * 3.5;
      positions[i * 3 + 1] = r * Math.sin(theta) * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const col = palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i * 3]     = col[0] * brightness;
      colors[i * 3 + 1] = col[1] * brightness;
      colors[i * 3 + 2] = col[2] * brightness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    this._nebulaMesh = new THREE.Points(geo, mat);
    this._scene.add(this._nebulaMesh);
  }

  _build3DScene(gameState) {
    // Remove old star / line meshes
    for (const m of this._starMeshes)  { this._scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    for (const m of this._lineMeshes)  { this._scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    if (this._playerMesh) { this._scene.remove(this._playerMesh); this._playerMesh.geometry.dispose(); this._playerMesh.material.dispose(); }
    this._starMeshes  = [];
    this._lineMeshes  = [];

    const sz  = gameState.gridSize || 12;
    const constellationColor = this._safeConstellationColor();

    // ── Nebula particle cloud ────────────────────────────────────────────
    this._buildNebula();

    // ── Star sprites ─────────────────────────────────────────────────────
    for (const star of this._stars) {
      const [wx, wy] = this._gridToWorld(star.x, star.y, sz);
      const geo = new THREE.SphereGeometry(star.activated ? 0.12 : 0.09, 8, 8);
      const color = star.activated ? new THREE.Color(constellationColor) : new THREE.Color(0x88aacc);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, wy, 0);
      mesh.userData.star = star;
      // Glow halo
      const haloGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const haloMat = new THREE.MeshBasicMaterial({
        color: star.activated ? new THREE.Color(constellationColor) : new THREE.Color(0x334455),
        transparent: true,
        opacity: 0.18,
      });
      mesh.add(new THREE.Mesh(haloGeo, haloMat));
      this._scene.add(mesh);
      this._starMeshes.push(mesh);
    }

    // ── Connection lines ─────────────────────────────────────────────────
    this._rebuildLines(gameState, sz, { color: constellationColor });

    // ── Player marker ────────────────────────────────────────────────────
    const [px, py] = this._gridToWorld(gameState.player.x, gameState.player.y, sz);
    const pGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this._playerMesh = new THREE.Mesh(pGeo, pMat);
    this._playerMesh.position.set(px, py, 0.05);
    this._scene.add(this._playerMesh);
  }

  _rebuildLines(gameState, sz, c) {
    for (const m of this._lineMeshes) { this._scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
    this._lineMeshes = [];
    for (const conn of this._connections) {
      const [x1, y1] = this._gridToWorld(conn.x1, conn.y1, sz);
      const [x2, y2] = this._gridToWorld(conn.x2, conn.y2, sz);
      const pts = [new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(conn.color || c.color), transparent: true, opacity: 0.7 });
      const line = new THREE.Line(geo, mat);
      this._scene.add(line);
      this._lineMeshes.push(line);
    }
  }

  _currentConstellationColor() {
    return this._safeConstellationColor();
  }

  // ── Update & Input (delegated to parent, then 3D sync) ─────────────────────

  handleInput(gameState, input) {
    super.handleInput(gameState, input);
    // After parent updates player position, rebuild scene incrementally
    const sz = gameState.gridSize || 12;
    const color = this._safeConstellationColor();
    if (this._playerMesh) {
      const [px, py] = this._gridToWorld(gameState.player.x, gameState.player.y, sz);
      this._playerMesh.position.set(px, py, 0.05);
    }
    // Update star glow for newly activated stars
    const INACTIVE_HEX = 0x88aacc; // matches inactive star color in _build3DScene
    for (let i = 0; i < this._starMeshes.length; i++) {
      const mesh = this._starMeshes[i];
      const star = mesh.userData.star;
      if (!star.activated) continue;
      if (mesh.material.color.getHex() !== INACTIVE_HEX) continue; // already updated
      mesh.material.color.set(new THREE.Color(color));
      mesh.material.needsUpdate = true;
      mesh.geometry.dispose();
      mesh.geometry = new THREE.SphereGeometry(0.12, 8, 8);
    }
    // Rebuild lines after each step
    this._rebuildLines(gameState, sz, { color });
  }

  _safeConstellationColor() {
    // Cycle through known constellation colors for 3D rendering
    const COLORS = ['#88ccff', '#aabbff', '#ccaaff', '#ffccaa', '#ff8888', '#88ffcc'];
    return COLORS[this._constellationIdx % COLORS.length];
  }
  generateLevel(gameState) {
    super.generateLevel?.(gameState);
    if (this._scene) this._build3DScene(gameState);
  }

  // ── Render — Three.js, no 2D ctx used ──────────────────────────────────────

  render(gameState, _ctx) {
    if (!this._renderer3d || !this._scene || !this._camera) return;

    const now = Date.now();

    // Slow background rotation
    if (this._bgStarPoints) {
      this._bgStarPoints.rotation.y = now * 0.00003;
      this._bgStarPoints.rotation.x = now * 0.000012;
    }

    // Slowly rotate nebula
    if (this._nebulaMesh) {
      this._nebulaMesh.rotation.y += 0.0002;
      this._nebulaMesh.rotation.z += 0.0001;
    }

    // Gentle camera bob
    this._camera.position.y = Math.sin(now * 0.0004) * 0.15;

    // Pulse activated stars
    for (const mesh of this._starMeshes) {
      if (mesh.userData.star.activated) {
        const pulse = 0.1 + 0.03 * Math.sin(now * 0.004 + mesh.userData.star.starIdx);
        mesh.scale.setScalar(1 + pulse);
      }
    }

    this._renderer3d.render(this._scene, this._camera);

    // Lore overlay — drawn on the 2D canvas (brief 2D pass over 3D)
    if (this._loreShowing || this._completionFlash) {
      this._renderLoreOverlay2D(gameState);
    }
  }

  /** Minimal 2D lore overlay on the main 2D canvas */
  _renderLoreOverlay2D(gameState) {
    const canvas = this._canvas2d;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const now = Date.now();
    const w = canvas.width;
    const h = canvas.height;

    // Make the 2D canvas visible momentarily for text overlay
    canvas.style.display = 'block';
    canvas.style.zIndex  = '2'; // above 3D canvas
    ctx2d.clearRect(0, 0, w, h);

    if (this._loreShowing) {
      const age  = now - this._loreShowing.shownAtMs;
      const fade = Math.min(1, age / 500);
      ctx2d.save();
      ctx2d.globalAlpha = fade;

      // Semi-transparent scrim
      ctx2d.fillStyle = 'rgba(5,5,20,0.82)';
      ctx2d.fillRect(0, 0, w, h);

      // Constellation name
      ctx2d.fillStyle = this._loreShowing.color || '#88ccff';
      ctx2d.shadowColor = this._loreShowing.color || '#88ccff';
      ctx2d.shadowBlur  = 18;
      ctx2d.font        = `bold ${Math.floor(w / 18)}px monospace`;
      ctx2d.textAlign   = 'center';
      ctx2d.fillText(`${this._loreShowing.symbol}  ${this._loreShowing.name}`, w / 2, h * 0.3);
      ctx2d.shadowBlur  = 0;

      // Lore text (word-wrapped)
      ctx2d.fillStyle = '#cce8ff';
      ctx2d.font = `${Math.floor(w / 42)}px monospace`;
      const words = this._loreShowing.text.split(' ');
      const lineW = w * 0.72;
      let line = '', lineY = h * 0.43;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx2d.measureText(test).width > lineW && line) {
          ctx2d.fillText(line.trim(), w / 2, lineY);
          lineY += 20;
          line = word + ' ';
        } else {
          line = test;
        }
      }
      if (line) ctx2d.fillText(line.trim(), w / 2, lineY);

      if (age > 1000) {
        ctx2d.fillStyle = '#445566';
        ctx2d.font = `${Math.floor(w / 48)}px monospace`;
        ctx2d.fillText('Move or SPACE to continue', w / 2, h * 0.8);
      }
      ctx2d.restore();
    } else {
      // No lore — hide 2D canvas so 3D shows through
      canvas.style.display = 'none';
      canvas.style.zIndex  = '1';
    }
  }

  // ── Dispose ─────────────────────────────────────────────────────────────────

  dispose() {
    // Restore 2D canvas visibility
    if (this._canvas2d) {
      this._canvas2d.style.display = 'block';
      this._canvas2d.style.zIndex  = '1';
    }
    if (this._canvas3d) {
      this._canvas3d.style.display = 'none';
    }
    if (this._renderer3d) {
      this._renderer3d.dispose();
      this._renderer3d = null;
    }
    this._scene = null;
    this._camera = null;
    this._starMeshes  = [];
    this._lineMeshes  = [];
    this._playerMesh  = null;
    this._bgStarPoints = null;
    if (this._nebulaMesh) {
      this._nebulaMesh.geometry.dispose();
      this._nebulaMesh.material.dispose();
      this._nebulaMesh = null;
    }
  }
}

export default Constellation3DMode;
