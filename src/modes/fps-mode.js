'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — fps-mode.js — First Person Shooter Mode
//
//  After mastering Twin-Stick, the camera shifts to first-person.
//  Player navigates 3D corridors through dreamscapes using Three.js.
//  Consciousness themes: full immersion, embodiment, facing shadows.
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

export class FPSMode {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = { x: 0, y: 0, z: 0, yaw: 0 };
    this.keys = {};
    this.walls = [];
    this.enemies = [];
    this.initialized = false;
    this._score = 0;
    this._health = 100;
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 5, 30);

    // Camera (first person)
    this.camera = new THREE.PerspectiveCamera(
      75, this.canvas.width / this.canvas.height, 0.1, 100
    );
    this.camera.position.set(0, 0.8, 0);

    // Renderer (reuse existing canvas)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambient = new THREE.AmbientLight(0x111111);
    this.scene.add(ambient);
    const point = new THREE.PointLight(0x00ff88, 1, 15);
    point.position.set(0, 2, 0);
    this.scene.add(point);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x001100 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(50, 50);
    const ceilMat = new THREE.MeshLambertMaterial({ color: 0x000a00 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3;
    this.scene.add(ceil);

    // Generate corridor maze
    this.generateMaze();
    this.initialized = true;
  }

  generateMaze() {
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x003322 });
    const wallGeo = new THREE.BoxGeometry(1, 3, 1);

    // Dreamscape corridor layout
    const layout = [
      '##########',
      '#........#',
      '#.##.##..#',
      '#.#....#.#',
      '#.#.##.#.#',
      '#...#....#',
      '#####.####',
      '#........#',
      '#....#...#',
      '##########',
    ];

    layout.forEach((row, z) => {
      row.split('').forEach((cell, x) => {
        if (cell === '#') {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(x - 5, 1.5, z - 5);
          this.scene.add(wall);
          this.walls.push({ x: x - 5, z: z - 5 });
        }
      });
    });

    // Place player at start position
    this.player.x = -4;
    this.player.z = -4;
  }

  update(dt, keys) {
    if (!this.initialized) return;
    if (dt > 0.1) return; // safety guard against large dt spikes

    const speed = 4 * dt;
    const turnSpeed = 2 * dt;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.player.yaw += turnSpeed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.player.yaw -= turnSpeed;

    const dx = Math.sin(this.player.yaw) * speed;
    const dz = Math.cos(this.player.yaw) * speed;

    const prevX = this.player.x;
    const prevZ = this.player.z;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      this.player.x += dx;
      this.player.z += dz;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      this.player.x -= dx;
      this.player.z -= dz;
    }

    // Simple wall collision
    for (const w of this.walls) {
      const dist = Math.hypot(this.player.x - w.x, this.player.z - w.z);
      if (dist < 0.8) {
        this.player.x = prevX;
        this.player.z = prevZ;
        break;
      }
    }

    // Update camera
    this.camera.position.set(this.player.x, 0.8, this.player.z);
    this.camera.rotation.y = this.player.yaw;
  }

  render() {
    if (!this.initialized || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  resize(w, h) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    if (this.renderer) {
      // Dispose all scene objects to prevent memory leaks
      this.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.initialized = false;
  }
}
