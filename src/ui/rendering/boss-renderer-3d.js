'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — boss-renderer-3d.js — 3D-D Phase
//
//  Renders boss encounters as Three.js 3D models composited onto the
//  2D game canvas using the Render Bridge pattern.
//
//  Boss types and their 3D geometry:
//    fear_guardian   — tall sentinel: tapered cylinder torso, box shoulders,
//                      single glowing amber eye sphere
//    void_sovereign  — crystalline fractured icosahedron + ring orbits
//    despair_weaver  — multiple woven tube-spline arms rotating slowly
//
//  The 3D model is drawn into a small (~90×90 px) off-screen Three.js
//  canvas then composited over the boss's screen position in drawGame().
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { ThreeLayer } from './three-layer.js';

const BOSS_CANVAS_SIZE = 92; // px square for boss cell render

// Per-boss-type scene builder
const BOSS_BUILDERS = {
  fear_guardian:  _buildFearGuardian,
  void_sovereign: _buildVoidSovereign,
  despair_weaver: _buildDespairWeaver,
};

function _buildFearGuardian(scene) {
  const group = new THREE.Group();
  // Torso — tapered cylinder
  const torsoGeo = new THREE.CylinderGeometry(0.28, 0.40, 1.2, 8);
  const torsoMat = new THREE.MeshPhongMaterial({ color: 0x220000, emissive: 0x440000, shininess: 60 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  group.add(torso);
  // Head — box
  const headGeo = new THREE.BoxGeometry(0.55, 0.5, 0.55);
  const headMat = new THREE.MeshPhongMaterial({ color: 0x110000, emissive: 0x330000 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.88;
  group.add(head);
  // Eye — glowing amber sphere
  const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0, 0.9, 0.28);
  eye.name = 'eye';
  group.add(eye);
  // Wings — flat planes
  const wingGeo = new THREE.PlaneGeometry(0.7, 0.9);
  const wingMat = new THREE.MeshPhongMaterial({ color: 0x330000, emissive: 0x110000, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(side * 0.62, 0.1, 0);
    wing.rotation.z = side * 0.45;
    group.add(wing);
  }
  // Ambient light (red tint)
  scene.add(new THREE.AmbientLight(0x220000, 0.6));
  scene.add(new THREE.DirectionalLight(0xff4400, 1.5));
  return group;
}

function _buildVoidSovereign(scene) {
  const group = new THREE.Group();
  // Core — wireframe icosahedron
  const coreGeo = new THREE.IcosahedronGeometry(0.6, 0);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);
  // Inner glow — solid sphere
  const glowGeo = new THREE.SphereGeometry(0.38, 12, 12);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x440088, transparent: true, opacity: 0.7 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.name = 'glow';
  group.add(glow);
  // Orbiting rings
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.75 + i * 0.12, 0.025, 6, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: 0.55 - i * 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = (i * Math.PI) / 3;
    ring.name = 'ring' + i;
    group.add(ring);
  }
  scene.add(new THREE.AmbientLight(0x110022, 0.8));
  scene.add(new THREE.PointLight(0xaa00ff, 2, 5));
  return group;
}

function _buildDespairWeaver(scene) {
  const group = new THREE.Group();
  // Central body — dark sphere
  const bodyGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x001122, emissive: 0x000811 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));
  // Tentacle arms — elongated capsules
  for (let i = 0; i < 6; i++) {
    const armGeo = new THREE.CapsuleGeometry(0.06, 0.8, 4, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: 0x003344, emissive: 0x001122, transparent: true, opacity: 0.85 });
    const arm = new THREE.Mesh(armGeo, armMat);
    const a = (i / 6) * Math.PI * 2;
    arm.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.3 - 0.1, 0);
    arm.rotation.z = a + Math.PI / 2;
    arm.name = 'arm' + i;
    group.add(arm);
  }
  scene.add(new THREE.AmbientLight(0x001122, 0.9));
  scene.add(new THREE.PointLight(0x0066aa, 1.2, 4));
  return group;
}

class BossSceneCache {
  constructor(bossType) {
    this.layer  = new ThreeLayer(BOSS_CANVAS_SIZE, BOSS_CANVAS_SIZE);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    this.camera.position.set(0, 0.6, 3.2);
    this.camera.lookAt(0, 0, 0);
    this.layer.camera = this.camera;
    this.group  = null;
    const builder = BOSS_BUILDERS[bossType] || BOSS_BUILDERS.fear_guardian;
    this.group = builder(this.layer.scene);
    this.layer.scene.add(this.group);
    this.type = bossType;
  }

  animate(ts, bossHpFrac, bossPhase) {
    if (!this.group) return;
    const t = ts * 0.001;
    const type = this.type;
    if (type === 'fear_guardian') {
      this.group.rotation.y = t * 0.6;
      const eye = this.group.getObjectByName('eye');
      if (eye) {
        eye.material.color.setHex(bossPhase === 'rage' ? 0xff2200 : 0xff8800);
        const s = 0.8 + 0.4 * Math.sin(t * 4);
        eye.scale.setScalar(s);
      }
    } else if (type === 'void_sovereign') {
      this.group.rotation.y = t * 0.4;
      const glow = this.group.getObjectByName('glow');
      if (glow) { glow.material.opacity = 0.5 + 0.3 * Math.sin(t * 3); }
      for (let i = 0; i < 3; i++) {
        const ring = this.group.getObjectByName('ring' + i);
        if (ring) ring.rotation.z = t * (0.5 + i * 0.3);
      }
      // Flash red at low HP
      if (bossHpFrac < 0.3) this.group.rotation.x = Math.sin(t * 8) * 0.15;
    } else if (type === 'despair_weaver') {
      for (let i = 0; i < 6; i++) {
        const arm = this.group.getObjectByName('arm' + i);
        if (arm) {
          const a = (i / 6) * Math.PI * 2 + t * 0.7;
          arm.position.x = Math.cos(a) * (0.55 + 0.1 * Math.sin(t * 2 + i));
          arm.position.y = Math.sin(a) * (0.3  + 0.05 * Math.sin(t * 1.5 + i)) - 0.1;
          arm.rotation.z = a + Math.PI / 2;
        }
      }
    }
  }
}

// Cache one scene per boss type (avoid rebuilding every frame)
const _cache = {};
function _getScene(bossType) {
  if (!_cache[bossType]) _cache[bossType] = new BossSceneCache(bossType);
  return _cache[bossType];
}

/**
 * drawBoss3D — composite a 3D boss model over the boss tile cell.
 * Call from renderer.js after the 2D boss tile is drawn.
 *
 * @param {CanvasRenderingContext2D} ctx  — main 2D canvas context
 * @param {number} px                    — left edge of boss tile in canvas px
 * @param {number} py                    — top  edge of boss tile in canvas px
 * @param {number} CELL                  — cell size in px
 * @param {number} ts                    — timestamp (ms)
 * @param {object} boss                  — boss state {type, hp, maxHp, phase}
 */
export function drawBoss3D(ctx, px, py, CELL, ts, boss) {
  if (!boss || !boss.type) return;
  try {
    const sc  = _getScene(boss.type);
    const hpF = boss.maxHp > 0 ? boss.hp / boss.maxHp : 0;
    sc.animate(ts, hpF, boss.phase || 'chase');
    sc.layer.composite(ctx,
      px + CELL / 2 - BOSS_CANVAS_SIZE / 2,
      py + CELL / 2 - BOSS_CANVAS_SIZE / 2,
    );
  } catch (_e) {
    // WebGL unavailable or context lost — silently fall back to 2D boss rendering
  }
}
