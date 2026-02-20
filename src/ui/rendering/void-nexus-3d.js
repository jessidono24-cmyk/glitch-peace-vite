'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — void-nexus-3d.js — 3D-E Phase
//
//  Full 3D rendering pilot for the VOID NEXUS dreamscape.
//  Replaces the flat 2D grid with a Three.js top-down scene when
//  CFG.viewMode === 'iso' AND the active dreamscape is 'void_nexus'.
//
//  Scene design:
//    - Infinite space background (deep black + additive star particles)
//    - Tile objects at (col, row) grid positions as 3D geometry:
//        VOID     — flat invisible floor plane (barely visible grid lines)
//        PEACE    — rising crystalline pillar (green emissive)
//        INSIGHT  — spinning octahedron (cyan emissive)
//        WALL     — obsidian slab (dark, slightly reflective)
//        ARCHETYPE— golden pulsing sphere
//        HAZARD   — red/orange jagged cluster
//    - Player — glowing orb that floats above the floor
//    - Camera — orthographic top-down with slight 15° tilt (iso feel)
//    - Event horizon shader effect on Void Nexus boss tile
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { ThreeLayer } from './three-layer.js';
import { T } from '../core/constants.js';

const TILE_STEP = 1.1; // world units per grid step
const FLOOR_Y   = 0;   // y coordinate of tile top surface

// Tile type → geometry + material factory
function _tileMesh(tileType) {
  switch (tileType) {
    case T.WALL: {
      const g = new THREE.BoxGeometry(0.9, 0.55, 0.9);
      const m = new THREE.MeshPhongMaterial({ color: 0x0d0d1a, emissive: 0x040410, shininess: 80 });
      return new THREE.Mesh(g, m);
    }
    case T.PEACE: {
      const g = new THREE.CylinderGeometry(0.15, 0.22, 0.55, 6);
      const m = new THREE.MeshPhongMaterial({ color: 0x004422, emissive: 0x00ff88, emissiveIntensity: 0.7 });
      return new THREE.Mesh(g, m);
    }
    case T.INSIGHT: {
      const g = new THREE.OctahedronGeometry(0.30, 0);
      const m = new THREE.MeshPhongMaterial({ color: 0x003344, emissive: 0x00eeff, emissiveIntensity: 0.8 });
      return new THREE.Mesh(g, m);
    }
    case T.ARCHETYPE: {
      const g = new THREE.SphereGeometry(0.28, 10, 10);
      const m = new THREE.MeshPhongMaterial({ color: 0x443300, emissive: 0xffdd44, emissiveIntensity: 0.9 });
      return new THREE.Mesh(g, m);
    }
    case T.RAGE: case T.TRAP: case T.DESPAIR: {
      const g = new THREE.DodecahedronGeometry(0.28, 0);
      const m = new THREE.MeshPhongMaterial({ color: 0x220000, emissive: 0xff2200, emissiveIntensity: 0.6 });
      return new THREE.Mesh(g, m);
    }
    default:
      return null; // VOID/empty tiles — no mesh
  }
}

export class VoidNexus3D extends ThreeLayer {
  constructor(width, height) {
    super(width, height);

    // Top-down camera with slight tilt for iso feel
    const aspect = width / height;
    const vp     = 6;
    this.camera = new THREE.OrthographicCamera(
      -vp * aspect, vp * aspect, vp, -vp, 0.1, 200
    );
    this.camera.position.set(0, 14, 8);
    this.camera.lookAt(0, 0, 0);

    this._tileMeshes = new Map(); // key: `${y},${x}` → mesh
    this._playerOrb  = null;
    this._grid       = null;
    this._sz         = 0;
    this._buildLighting();
    this._buildFloor();
    this._buildBackground();
  }

  _buildLighting() {
    // Ambient — deep purple-blue space fill
    this.scene.add(new THREE.AmbientLight(0x080818, 3.5));

    // Primary directional light (top-left-front) with shadow casting
    const dirL = new THREE.DirectionalLight(0x6622ff, 1.8);
    dirL.position.set(6, 14, 8);
    dirL.castShadow = true;
    dirL.shadow.mapSize.width  = 512;
    dirL.shadow.mapSize.height = 512;
    dirL.shadow.camera.near    = 0.5;
    dirL.shadow.camera.far     = 40;
    dirL.shadow.camera.left    = -10;
    dirL.shadow.camera.right   =  10;
    dirL.shadow.camera.top     =  10;
    dirL.shadow.camera.bottom  = -10;
    this.scene.add(dirL);
    this._dirLight = dirL;

    // Secondary rim light (back-right) — cyan accent
    const rimL = new THREE.DirectionalLight(0x00eeff, 0.7);
    rimL.position.set(-8, 5, -6);
    this.scene.add(rimL);

    // Rotating point light at grid centre — warm glow on tiles
    const pointL = new THREE.PointLight(0x00ffaa, 2.5, 14, 2);
    pointL.position.set(0, 4, 0);
    this.scene.add(pointL);
    this._pointLight = pointL;

    // Second roving point light (pink/magenta)
    const roveL = new THREE.PointLight(0xff44cc, 1.2, 10, 2);
    roveL.position.set(4, 3, -4);
    this.scene.add(roveL);
    this._roveLight = roveL;
  }

  _buildFloor() {
    // Normal-mapped standard material floor (no texture — procedural normals via vertex colours)
    const planeGeo = new THREE.PlaneGeometry(30, 30, 20, 20);
    // Add slight randomized height noise to give the floor natural normals
    const pos = planeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, (Math.random() - 0.5) * 0.04);
    }
    planeGeo.computeVertexNormals();
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x010108,
      metalness: 0.4,
      roughness: 0.75,
      envMapIntensity: 0.5,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // Subtle wire grid on top of the floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x0a0a28, 0x06060f);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }

  _buildSkybox() {
    // Procedural deep-space skybox — large sphere with inside face
    const skyGeo = new THREE.SphereGeometry(90, 20, 20);
    // Gradient-like colouring: mix of very dark purples via vertex colours
    const colArr = new Float32Array(skyGeo.attributes.position.count * 3);
    for (let i = 0; i < skyGeo.attributes.position.count; i++) {
      const y = skyGeo.attributes.position.getY(i);
      const t = (y + 90) / 180; // 0 = bottom, 1 = top
      colArr[i*3]   = 0.01 + t * 0.04;  // R
      colArr[i*3+1] = 0.00 + t * 0.01;  // G
      colArr[i*3+2] = 0.05 + t * 0.12;  // B (blue-purple at top)
    }
    skyGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
    const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Distant nebula haze — large translucent ring
    const nebulaGeo = new THREE.TorusGeometry(35, 12, 8, 32);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x220044, transparent: true, opacity: 0.08,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.rotation.x = Math.PI / 4;
    nebula.position.y = 15;
    this.scene.add(nebula);
    this._nebula = nebula;
  }

  _buildBackground() {
    this._buildSkybox();

    // Close-field additive star particles (mid-distance)
    const count = 400;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 60;
      pos[i*3+1] = 2 + Math.random() * 30;
      pos[i*3+2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.05,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  // Sync 3D scene with the current game grid
  syncGrid(grid, sz) {
    if (this._sz !== sz || this._grid !== grid) {
      // Rebuild all tile meshes
      for (const m of this._tileMeshes.values()) {
        this.scene.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      }
      this._tileMeshes.clear();

      for (let y = 0; y < sz; y++) {
        for (let x = 0; x < sz; x++) {
          const tileType = grid[y][x];
          const mesh     = _tileMesh(tileType);
          if (!mesh) continue;
          // Position: centre grid at origin
          mesh.position.x = (x - (sz - 1) / 2) * TILE_STEP;
          mesh.position.z = (y - (sz - 1) / 2) * TILE_STEP;
          mesh.position.y = tileType === T.WALL ? 0.28 : 0.25;
          this.scene.add(mesh);
          this._tileMeshes.set(`${y},${x}`, mesh);
        }
      }
      this._grid = grid;
      this._sz   = sz;
    }

    // Update live tile changes (collected PEACE/INSIGHT → remove mesh)
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const key  = `${y},${x}`;
        const mesh = this._tileMeshes.get(key);
        if (!mesh) continue;
        if (grid[y][x] === T.VOID || grid[y][x] === 0) {
          this.scene.remove(mesh);
          mesh.geometry.dispose();
          mesh.material.dispose();
          this._tileMeshes.delete(key);
        }
      }
    }
  }

  // Sync player orb position
  syncPlayer(playerY, playerX, sz) {
    if (!this._playerOrb) {
      const geo = new THREE.SphereGeometry(0.25, 12, 12);
      const mat = new THREE.MeshPhongMaterial({ color: 0x005533, emissive: 0x00ffaa, emissiveIntensity: 1.0 });
      this._playerOrb = new THREE.Mesh(geo, mat);
      // Glow halo
      const haloGeo = new THREE.SphereGeometry(0.38, 8, 8);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.12 });
      this._playerOrb.add(new THREE.Mesh(haloGeo, haloMat));
      this.scene.add(this._playerOrb);
    }
    this._playerOrb.position.x = (playerX - (sz - 1) / 2) * TILE_STEP;
    this._playerOrb.position.z = (playerY - (sz - 1) / 2) * TILE_STEP;
    this._playerOrb.position.y = 0.55;
  }

  // Animate spinning tiles + player bob
  animate(ts) {
    const t = ts * 0.001;
    for (const [key, mesh] of this._tileMeshes.entries()) {
      // Spin INSIGHT octahedra and ARCHETYPE spheres
      if (mesh.geometry.type === 'OctahedronGeometry') mesh.rotation.y = t * 1.5;
      if (mesh.geometry.type === 'SphereGeometry' &&
          mesh.material.emissive.getHex() === 0xffdd44) {
        mesh.rotation.y = t * 0.8;
        mesh.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3);
      }
      // Peace pillars gentle height pulse
      if (mesh.geometry.type === 'CylinderGeometry') {
        mesh.position.y = 0.25 + 0.04 * Math.sin(t * 2);
      }
    }
    // Player orb bob
    if (this._playerOrb) {
      this._playerOrb.position.y = 0.55 + 0.08 * Math.sin(t * 4);
      this._playerOrb.rotation.y = t * 2;
    }
    // Roving light orbit
    if (this._roveLight) {
      this._roveLight.position.x = Math.cos(t * 0.7) * 6;
      this._roveLight.position.z = Math.sin(t * 0.7) * 6;
      this._roveLight.position.y = 2 + Math.sin(t * 0.5) * 1.5;
    }
    // Directional light slow sweep
    if (this._dirLight) {
      this._dirLight.position.x = 6 + Math.sin(t * 0.18) * 3;
    }
    // Nebula slow rotation
    if (this._nebula) {
      this._nebula.rotation.z = t * 0.05;
    }
    // Gentle camera orbit
    this.camera.position.x = Math.sin(t * 0.12) * 1.2;
    this.camera.lookAt(0, 0, 0);
  }
}

// Lazily created singleton
let _voidScene = null;
export function getVoidNexus3D(w, h) {
  if (!_voidScene) _voidScene = new VoidNexus3D(w, h);
  if (_voidScene.width !== w || _voidScene.height !== h) _voidScene.resize(w, h);
  return _voidScene;
}
