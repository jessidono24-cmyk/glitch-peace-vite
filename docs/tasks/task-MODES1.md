# Task MODES1 — New Modes + Deep Mechanic Overhaul

## Goal
Add First Person Shooter mode. Deeply fix the mechanics of Constellation,
Ornithology, Mycology, Rhythm, Alchemy, Architecture. Add Learning Hub
as a new mode with sub-disciplines. Implement perceived effects for
encountering awe-inspiring or toxic species.

## Definition of Done
- [ ] `npm run build` passes
- [ ] FPS mode exists and is playable (even if basic 3D corridors)
- [ ] Constellation: player must correctly connect stars to pass level
- [ ] Ornithology: finding real birds in dreamscape setting, with awe/fear effects
- [ ] Mycology: finding real mushrooms, with awe/fear effects, network visualization
- [ ] Rhythm: incorporates music theory (intervals, rhythm drills, ear training)
- [ ] Alchemy: visually looks like a rustic chem lab (dark wood, glass vessels, flame)
- [ ] Architecture: has sub-modes (Construction, Engineering, Crafts, AI Design)
- [ ] Learning Hub: exists as mode with sub-disciplines selectable
- [ ] All modes fill full screen with distinct visual identity

---

## SECTION A: First Person Shooter Mode

### Concept
After mastering Twin-Stick, the camera gradually shifts to first-person.
In FPS mode, the player navigates 3D corridors through dreamscapes.
Consciousness themes: full immersion, embodiment, facing shadows directly.

### Implementation (Three.js — already in project)

```bash
# Find existing Three.js usage
grep -rn "THREE\|three.js\|import.*three" src/ | head -10
```

Create `src/modes/fps-mode.js`:

```js
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
    this.renderer.setPixelRatio(window.devicePixelRatio);

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

    // Generate corridor maze from dreamscape
    this.generateMaze();
    this.initialized = true;
  }

  generateMaze() {
    // Simple corridor based on dreamscape
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x003322 });
    const wallGeo = new THREE.BoxGeometry(1, 3, 1);
    
    // Create a simple maze pattern
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

    // Place player at start
    this.player.x = -4;
    this.player.z = -4;
  }

  update(dt, keys) {
    if (!this.initialized) return;
    if (dt > 0.5) return; // safety guard

    const speed = 4 * dt;
    const turnSpeed = 2 * dt;
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.player.yaw += turnSpeed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.player.yaw -= turnSpeed;

    const dx = Math.sin(this.player.yaw) * speed;
    const dz = Math.cos(this.player.yaw) * speed;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      this.player.x += dx;
      this.player.z += dz;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      this.player.x -= dx;
      this.player.z -= dz;
    }

    // Simple wall collision
    this.walls.forEach(w => {
      const dist = Math.hypot(this.player.x - w.x, this.player.z - w.z);
      if (dist < 0.8) {
        this.player.x -= dx;
        this.player.z -= dz;
      }
    });

    // Update camera
    this.camera.position.set(this.player.x, 0.8, this.player.z);
    this.camera.rotation.y = this.player.yaw;
  }

  render() {
    if (!this.initialized || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  resize(w, h) {
    if (!this.renderer) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    if (this.renderer) this.renderer.dispose();
  }
}
```

Register FPS mode in the mode dispatch in `src/main.js`:
```js
import { FPSMode } from './modes/fps-mode.js';
// In mode initialization: case 'fps': initFPSMode(); break;
```

---

## SECTION B: Constellation — Correct Star Connection Required

Current behavior: stars exist, player moves around.
Required behavior: player must connect stars in the CORRECT order to form
a real constellation pattern. Wrong connections cost health.

Find `src/modes/constellation-mode.js` (or equivalent) and add:

```js
// Real constellation data — correct connection sequences
const CONSTELLATIONS = {
  orion: {
    name: "Orion",
    stars: [
      { id: 'betelgeuse', x: 0.3, y: 0.3, name: 'Betelgeuse' },
      { id: 'bellatrix',  x: 0.6, y: 0.3, name: 'Bellatrix' },
      { id: 'alnitak',    x: 0.35, y: 0.5, name: 'Alnitak' },
      { id: 'alnilam',    x: 0.5, y: 0.5, name: 'Alnilam' },
      { id: 'mintaka',    x: 0.65, y: 0.5, name: 'Mintaka' },
      { id: 'rigel',      x: 0.65, y: 0.7, name: 'Rigel' },
      { id: 'saiph',      x: 0.35, y: 0.7, name: 'Saiph' },
    ],
    // Correct connection order (must connect these pairs)
    correctEdges: [
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['betelgeuse', 'bellatrix'],
    ],
    story: "The Hunter stands eternal — confronting the void.",
  },
  cassiopeia: {
    name: "Cassiopeia",
    stars: [
      { id: 'schedar',    x: 0.2, y: 0.45 },
      { id: 'caph',       x: 0.35, y: 0.35 },
      { id: 'gamma',      x: 0.5, y: 0.5 },
      { id: 'ruchbah',    x: 0.65, y: 0.4 },
      { id: 'segin',      x: 0.8, y: 0.45 },
    ],
    correctEdges: [
      ['schedar','caph'], ['caph','gamma'], ['gamma','ruchbah'], ['ruchbah','segin']
    ],
    story: "The Queen — W-shaped, never setting in northern skies.",
  },
};

// Level passes when all correctEdges are connected by player
function checkConstellationComplete(playerEdges, correctEdges) {
  return correctEdges.every(([a, b]) =>
    playerEdges.some(([pa, pb]) =>
      (pa === a && pb === b) || (pa === b && pb === a)
    )
  );
}
```

---

## SECTION C: Ornithology — Real Bird Watching with Perceived Effects

### Species Data
```js
const BIRD_SPECIES = {
  bald_eagle: {
    name: 'Bald Eagle',
    habitat: ['mountain', 'lake', 'sky'],
    rarity: 'uncommon',
    awe: 0.9,  // 0-1 scale: high awe
    sound: 'eagle-cry',
    effect: 'awe',  // perceived effect on player
    effectDescription: 'Majestic. Something in your chest lifts.',
    dreamscapes: ['Mountain Dragon Realm', 'Mountain Summit Realm', 'Sky Temple'],
  },
  yartsagunbu: {
    name: "Yartsa Günbü",
    habitat: ['mountain'],
    rarity: 'legendary',
    awe: 1.0,
    effect: 'profound_awe',
    effectDescription: 'Ancient medicine. Worth more than gold. You feel witnessed by time.',
    dreamscapes: ['Mountain Summit Realm'],
  },
  crow: {
    name: 'Common Crow',
    habitat: ['urban', 'forest', 'field'],
    rarity: 'common',
    awe: 0.2,
    effect: 'curiosity',
    effectDescription: 'Intelligent eyes. Watching you back.',
    dreamscapes: ['Childhood Neighborhood', 'Forest Cathedral'],
  },
  // Toxic/dangerous
  deathcap_proximity: {
    // Not a bird — but when player gets near a toxic mushroom in ornithology
    name: 'Death Cap',
    effect: 'dread',
    effectDescription: 'Something is deeply wrong here. Your skin prickles.',
  },
};

// Perceived effect system
function applyPerceivedEffect(ctx, canvas, state, effect, description) {
  switch(effect) {
    case 'awe':
    case 'profound_awe':
      // Screen brightens briefly, vignette fades, warm golden pulse
      state._awePulse = { timer: 3.0, color: '#ffdd88', intensity: effect === 'profound_awe' ? 1.0 : 0.6 };
      state._aweText = description;
      state._aweTimer = 4.0;
      // Health slightly restores
      state.hp = Math.min(state.maxHp, state.hp + 5);
      break;
    
    case 'dread':
      // Screen darkens, vignette tightens, slight red tint
      state._dreadPulse = { timer: 2.0 };
      state._aweText = description;
      state._aweTimer = 3.0;
      state.hp -= 3;
      break;
    
    case 'curiosity':
      // Subtle shimmer, brief info flash
      state._aweText = description;
      state._aweTimer = 2.0;
      break;
  }
}

// Draw perceived effect overlay
function drawPerceivedEffect(ctx, canvas, state) {
  if (state._awePulse && state._awePulse.timer > 0) {
    const alpha = (state._awePulse.timer / 3.0) * state._awePulse.intensity * 0.15;
    ctx.fillStyle = state._awePulse.color || '#ffffff';
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    state._awePulse.timer -= 0.016;
  }
  
  if (state._dreadPulse && state._dreadPulse.timer > 0) {
    const alpha = (state._dreadPulse.timer / 2.0) * 0.3;
    ctx.fillStyle = '#220000';
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    state._dreadPulse.timer -= 0.016;
  }
  
  if (state._aweText && state._aweTimer > 0) {
    const alpha = Math.min(1, state._aweTimer * 0.5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffdd88';
    ctx.font = Math.round(canvas.width * 0.02) + "px 'Share Tech Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(state._aweText, canvas.width / 2, canvas.height * 0.2);
    ctx.globalAlpha = 1;
    state._aweTimer -= 0.016;
  }
}
```

---

## SECTION D: Rhythm — Music Theory Integration

Add music theory drills to rhythm mode:

```js
const MUSIC_THEORY_ELEMENTS = {
  intervals: {
    unison: { semitones: 0, feel: 'stillness' },
    minor_second: { semitones: 1, feel: 'tension' },
    major_second: { semitones: 2, feel: 'step' },
    minor_third: { semitones: 3, feel: 'melancholy' },
    major_third: { semitones: 4, feel: 'brightness' },
    perfect_fourth: { semitones: 5, feel: 'stability' },
    tritone: { semitones: 6, feel: 'dissonance' },
    perfect_fifth: { semitones: 7, feel: 'power' },
    minor_sixth: { semitones: 8, feel: 'longing' },
    major_sixth: { semitones: 9, feel: 'warmth' },
    minor_seventh: { semitones: 10, feel: 'tension' },
    major_seventh: { semitones: 11, feel: 'leading' },
    octave: { semitones: 12, feel: 'completion' },
  },
  
  rhythms: {
    // Player must match the pattern by pressing keys on beat
    patterns: [
      { name: '4/4 basic', beats: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
      { name: 'syncopation', beats: [1,0,1,0, 0,1,0,0, 1,0,1,0, 0,1,0,0] },
      { name: 'triplet feel', beats: [1,0,0,1,0,0,1,0,0,1,0,0] },
      { name: 'polyrhythm 3:2', beats: [1,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1] },
    ],
  },
  
  earTraining: {
    // Play a note, player identifies interval
    drills: ['identify interval', 'identify scale degree', 'match the rhythm', 'call and response'],
  },
};
```

---

## SECTION E: Alchemy — Visual Overhaul to Rustic Chem Lab

Replace the current alchemy background with a detailed lab scene:

```js
function drawAlchemyLabScene(ctx, canvas) {
  // Dark oak floor
  ctx.fillStyle = '#1a0f00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Wooden workbench
  const benchY = canvas.height * 0.65;
  const benchH = canvas.height * 0.08;
  ctx.fillStyle = '#3d2000';
  ctx.fillRect(0, benchY, canvas.width, benchH);
  // Wood grain lines
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = '#2a1500';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width * (i/8), benchY);
    ctx.lineTo(canvas.width * (i/8) + 20, benchY + benchH);
    ctx.stroke();
  }
  
  // Glass vessels / flasks
  const vessels = [
    { x: 0.2, color: '#004400', glow: '#00ff00', label: 'VIRIDIAN EXTRACT' },
    { x: 0.4, color: '#440000', glow: '#ff4400', label: 'ESSENCE OF RAGE' },
    { x: 0.6, color: '#000044', glow: '#4444ff', label: 'VOID TINCTURE' },
    { x: 0.8, color: '#444400', glow: '#ffff00', label: 'SOLAR RESIN' },
  ];
  
  vessels.forEach(v => {
    const vx = canvas.width * v.x;
    const vy = benchY - canvas.height * 0.15;
    const vw = canvas.width * 0.05;
    const vh = canvas.height * 0.12;
    
    // Flask glow
    ctx.shadowColor = v.glow;
    ctx.shadowBlur = 20;
    
    // Flask body
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.ellipse(vx, vy + vh * 0.7, vw * 0.5, vh * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Flask neck
    ctx.fillRect(vx - vw * 0.12, vy, vw * 0.24, vh * 0.4);
    
    ctx.shadowBlur = 0;
    
    // Label
    ctx.fillStyle = '#664422';
    ctx.font = Math.round(canvas.width * 0.008) + "px 'Share Tech Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(v.label, vx, vy + vh + 15);
  });
  
  // Flame under central cauldron
  const cx = canvas.width * 0.5;
  const cy = benchY - canvas.height * 0.02;
  const flameH = canvas.height * 0.06;
  const t = Date.now() / 1000;
  
  // Animated flame
  for (let i = 0; i < 5; i++) {
    const wobble = Math.sin(t * 3 + i) * 5;
    const alpha = 0.4 + Math.sin(t * 4 + i) * 0.2;
    ctx.fillStyle = `rgba(255,${Math.round(100 + i * 20)},0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, cy - flameH * (i/5), 15 - i * 2, 20 - i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

---

## SECTION F: Architecture Sub-Modes

```js
const ARCHITECTURE_SUBMODES = [
  {
    id: 'construction',
    name: 'CONSTRUCTION',
    desc: 'Place structural elements to build load-bearing designs',
    mechanic: 'Grid placement with physics constraints — structures must be stable',
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    desc: 'Design systems: circuits, fluid dynamics, mechanisms',
    mechanic: 'Logic puzzles — connect inputs to outputs through correct paths',
  },
  {
    id: 'sacred_geometry',
    name: 'SACRED GEOMETRY',
    desc: 'Construct geometric patterns used in world traditions',
    mechanic: 'Compass-and-rule construction — follow ancient geometric principles',
  },
  {
    id: 'ai_design',
    name: 'AI SYSTEMS',
    desc: 'Design neural network architectures and decision trees',
    mechanic: 'Node graph — connect layers to solve problems',
  },
  {
    id: 'crafts',
    name: 'CRAFTS',
    desc: 'Weaving, pottery, woodworking — making with hands',
    mechanic: 'Pattern matching and material selection puzzles',
  },
];
```

---

## SECTION G: Learning Hub Mode

```js
const LEARNING_HUB_DISCIPLINES = [
  {
    id: 'language',
    name: 'LANGUAGE',
    icon: '🗣',
    sub: ['French', 'Spanish', 'Japanese', 'Arabic', 'Sanskrit', 'Ancient Greek'],
    mechanic: 'Spaced repetition + contextual immersion — words appear in dreamscape',
  },
  {
    id: 'mathematics',
    name: 'MATHEMATICS',
    icon: '∑',
    sub: ['Arithmetic', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Number Theory'],
    mechanic: 'Puzzle solving — equations become terrain obstacles',
  },
  {
    id: 'biology',
    name: 'BIOLOGY',
    icon: '🧬',
    sub: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Mycology', 'Ornithology'],
    mechanic: 'Classification and systems identification',
  },
  {
    id: 'physics',
    name: 'PHYSICS',
    icon: 'ⓟ',
    sub: ['Classical', 'Thermodynamics', 'Quantum', 'Electromagnetism', 'Relativity'],
    mechanic: 'Physical simulation — laws of nature as game rules',
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    icon: '⚙',
    sub: ['Mechanical', 'Electrical', 'Cognitive', 'Quantum', 'Petroleum', 'Structural'],
    mechanic: 'System design and optimization puzzles',
  },
  {
    id: 'psychology',
    name: 'PSYCHOLOGY',
    icon: '🧠',
    sub: ['Cognitive', 'Behavioral', 'Developmental', 'Social', 'Positive', 'Clinical'],
    mechanic: 'Pattern recognition in behavioral scenarios',
  },
  {
    id: 'neuroscience',
    name: 'NEUROSCIENCE',
    icon: '⚡',
    sub: ['Brain anatomy', 'Neural circuits', 'Neuroplasticity', 'Consciousness'],
    mechanic: 'Navigate neural network maps — signal routing puzzles',
  },
  {
    id: 'sociology',
    name: 'SOCIOLOGY',
    icon: '👥',
    sub: ['Social structures', 'Culture', 'Institutions', 'Inequality', 'Community'],
    mechanic: 'Simulation of social dynamics — choices ripple through community',
  },
  {
    id: 'meteorology',
    name: 'METEOROLOGY',
    icon: '🌩',
    sub: ['Atmospheric science', 'Climate', 'Weather systems', 'Forecasting'],
    mechanic: 'Predict and navigate weather patterns in dreamscape',
  },
  {
    id: 'archaeology',
    name: 'ARCHAEOLOGY',
    icon: '⛏',
    sub: ['Excavation', 'Artifact analysis', 'Ancient civilizations', 'Dating methods'],
    mechanic: 'Excavation puzzles — careful uncovering of hidden layers',
  },
];
```

---

## Verification
```bash
npm run build
```
Then run PLAYTEST4 to confirm all modes load.

## Commit message
```
feat: MODES1 -- FPS mode, constellation correct-connection, ornithology/mycology awe effects, rhythm music theory, alchemy lab visual, architecture submodes, learning hub
```
