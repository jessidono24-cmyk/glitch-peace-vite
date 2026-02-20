'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — three-layer.js — 3D-C Phase
//
//  Thin Three.js rendering bridge for WebGL visual effects.
//  Creates a hidden WebGL canvas and composites it onto the main 2D
//  canvas via ctx.drawImage — the Render Bridge Pattern.
//
//  Used by:
//    ConstellationStarField — volumetric glow star field for M6
//    BossRenderer3D         — procedural 3D boss models (3D-D)
//    VoidNexus3D            — Void Nexus dreamscape pilot (3D-E)
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

export class ThreeLayer {
  constructor(width, height) {
    this.width  = width;
    this.height = height;

    // Hidden off-screen canvas — never appended to DOM
    this._canvas = document.createElement('canvas');
    this._canvas.width  = width;
    this._canvas.height = height;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha:  true,
      antialias: false, // keep perf friendly
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0); // transparent

    this.scene  = new THREE.Scene();
    this.camera = null; // set by subclass
  }

  resize(w, h) {
    this.width = w; this.height = h;
    this._canvas.width  = w;
    this._canvas.height = h;
    this.renderer.setSize(w, h, false);
    if (this.camera && this.camera.isOrthographicCamera) {
      this.camera.left  = -w / 2; this.camera.right  = w / 2;
      this.camera.top   =  h / 2; this.camera.bottom = -h / 2;
      this.camera.updateProjectionMatrix();
    } else if (this.camera && this.camera.isPerspectiveCamera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  // Render and composite onto a 2D canvas context at position (x, y)
  composite(ctx2d, x = 0, y = 0) {
    this.renderer.render(this.scene, this.camera);
    ctx2d.drawImage(this._canvas, x, y, this.width, this.height);
  }

  dispose() {
    this.renderer.dispose();
    while (this.scene.children.length) {
      const obj = this.scene.children[0];
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  ConstellationStarField — volumetric deep-space star field
//  Replaces the flat 2D circles with real WebGL particle glow
// ═══════════════════════════════════════════════════════════════════════

const _STAR_COUNT  = 800;
const _STAR_LAYERS = 3;   // depth layers for parallax

export class ConstellationStarField extends ThreeLayer {
  constructor(width, height) {
    super(width, height);

    // Orthographic camera matching canvas coordinates
    this.camera = new THREE.OrthographicCamera(
      -width / 2, width / 2, height / 2, -height / 2, 0.1, 1000
    );
    this.camera.position.z = 100;

    this._starSystems = [];
    this._nebula      = null;
    this._time        = 0;
    this._buildScene(width, height);
  }

  _buildScene(w, h) {
    // Background nebula — additive blended colour cloud
    const nebulaGeo = new THREE.PlaneGeometry(w, h);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color:       0x0a001a,
      transparent: true,
      opacity:     1,
    });
    this._nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    this._nebula.position.z = -10;
    this.scene.add(this._nebula);

    // Three depth-sorted star layers with decreasing brightness
    const layerCfg = [
      { count: 600, size: 1.4, opacity: 0.65, z: 0,  speed: 0.000015, color: 0xffffff },
      { count: 140, size: 2.2, opacity: 0.80, z: 5,  speed: 0.00003,  color: 0xaaddff },
      { count:  60, size: 3.5, opacity: 0.90, z: 15, speed: 0.00005,  color: 0x00eeff },
    ];

    for (const lc of layerCfg) {
      const positions = new Float32Array(lc.count * 3);
      const phases    = new Float32Array(lc.count);
      for (let i = 0; i < lc.count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * w;
        positions[i * 3 + 1] = (Math.random() - 0.5) * h;
        positions[i * 3 + 2] = 0;
        phases[i] = Math.random() * Math.PI * 2;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('phase',    new THREE.BufferAttribute(phases,    1));
      const mat = new THREE.PointsMaterial({
        color:        lc.color,
        size:         lc.size,
        transparent:  true,
        opacity:      lc.opacity,
        blending:     THREE.AdditiveBlending,
        depthWrite:   false,
        sizeAttenuation: false,
      });
      const points = new THREE.Points(geo, mat);
      points.position.z = lc.z;
      points.userData   = { speed: lc.speed, baseOpacity: lc.opacity };
      this.scene.add(points);
      this._starSystems.push(points);
    }
  }

  // Call each frame to update star twinkling and camera drift
  update(ts) {
    this._time = ts;
    // Very slow camera drift for parallax sensation
    this.camera.position.x = Math.sin(ts * 0.00008) * 8;
    this.camera.position.y = Math.cos(ts * 0.00006) * 5;

    // Animate star opacity twinkling via material opacity modulation
    for (const sys of this._starSystems) {
      const t = ts * sys.userData.speed;
      sys.material.opacity = sys.userData.baseOpacity *
        (0.7 + 0.3 * Math.sin(t * 1000 + sys.position.z));
    }
  }
}

// Module-level singleton — created lazily the first time constellation mode renders
let _starField = null;
export function getStarField(w, h) {
  if (!_starField) _starField = new ConstellationStarField(w, h);
  if (_starField.width !== w || _starField.height !== h) _starField.resize(w, h);
  return _starField;
}
