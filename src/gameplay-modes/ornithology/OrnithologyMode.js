// ═══════════════════════════════════════════════════════════════════════
//  ORNITHOLOGY MODE — Bird Watching Grid Mode
//  Players move through biome tiles to observe bird species.
//  Rare birds trigger learning challenges (species ID, habitat, behavior).
//  Grounded in field ornithology: habitat, behavior, seasonal presence.
//  Research: attention restoration theory (Kaplan 1989) — nature-based
//  observation restores directed attention and reduces cognitive fatigue.
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';

// ── Bird data ──────────────────────────────────────────────────────────
// Each bird: { name, symbol, rarity, habitat, note (factoid) }
const BIRDS = [
  // Common (rarity 1)
  { name: 'House Sparrow',   symbol: '🐦', rarity: 1, habitat: 'urban',   note: 'Introduced globally; one of the most abundant birds on Earth.' },
  { name: 'American Robin',  symbol: '🐦', rarity: 1, habitat: 'forest',  note: 'First robin of spring signals seasonal thaw in North America.' },
  { name: 'Mallard',         symbol: '🦆', rarity: 1, habitat: 'wetland', note: 'Ancestor of most domestic duck breeds; highly adaptable.' },
  { name: 'Rock Pigeon',     symbol: '🕊', rarity: 1, habitat: 'urban',   note: 'Carrier pigeons saved thousands of lives in WWI & WWII.' },
  { name: 'European Starling',symbol:'🐦', rarity: 1, habitat: 'open',    note: 'Murmuration flocks can contain a million birds moving as one.' },
  // Uncommon (rarity 2)
  { name: 'Great Blue Heron',symbol: '🦤', rarity: 2, habitat: 'wetland', note: 'Stands motionless for minutes before striking at fish.' },
  { name: 'Red-tailed Hawk', symbol: '🦅', rarity: 2, habitat: 'open',    note: 'Most common large hawk in North America; iconic screech call.' },
  { name: 'Barn Owl',        symbol: '🦉', rarity: 2, habitat: 'forest',  note: 'Heart-shaped facial disc focuses sound like a radar dish.' },
  { name: 'Northern Cardinal',symbol:'🐦', rarity: 2, habitat: 'forest',  note: 'One of the few songbirds where females also sing.' },
  { name: 'Cedar Waxwing',   symbol: '🐦', rarity: 2, habitat: 'brush',   note: 'Red waxy tips on wings are pigment from berry enzymes.' },
  // Rare (rarity 3)
  { name: 'Painted Bunting', symbol: '🦜', rarity: 3, habitat: 'brush',   note: 'Called "nonpareil" — without equal — for its vivid colors.' },
  { name: 'Sandhill Crane',  symbol: '🦩', rarity: 3, habitat: 'wetland', note: 'Among the oldest living bird species; 9–10 million years old.' },
  { name: 'Snowy Owl',       symbol: '🦉', rarity: 3, habitat: 'tundra',  note: 'Can locate prey under 12 inches of snow by hearing alone.' },
  { name: 'Resplendent Quetzal',symbol:'🦜',rarity:3, habitat: 'forest',  note: 'Sacred to Mayan civilization; tail feathers reached 3 feet.' },
  // Very rare (rarity 4)
  { name: 'Albatross',       symbol: '🦅', rarity: 4, habitat: 'ocean',   note: 'Soars for years without landing; can sleep while flying.' },
  { name: 'Birds of Paradise',symbol:'🦜', rarity: 4, habitat: 'forest',  note: 'Male performs elaborate dances; females choose the best dancer.' },
];

// Biome tile types for the ornithology grid
const BIOMES = {
  FOREST:  { bg: '#1a2e1a', sy: '🌲', name: 'Forest',  birds: ['American Robin','Northern Cardinal','Barn Owl','Resplendent Quetzal','Birds of Paradise'] },
  WETLAND: { bg: '#0d1f2d', sy: '💧', name: 'Wetland', birds: ['Mallard','Great Blue Heron','Sandhill Crane'] },
  OPEN:    { bg: '#2d2a1e', sy: '🌾', name: 'Open',    birds: ['European Starling','Red-tailed Hawk'] },
  URBAN:   { bg: '#1e1e2a', sy: '🏙', name: 'Urban',   birds: ['House Sparrow','Rock Pigeon'] },
  TUNDRA:  { bg: '#1a2030', sy: '❄', name: 'Tundra',  birds: ['Snowy Owl'] },
  OCEAN:   { bg: '#0a1830', sy: '🌊', name: 'Ocean',   birds: ['Albatross'] },
  BRUSH:   { bg: '#2a1e0d', sy: '🌿', name: 'Brush',   birds: ['Painted Bunting','Cedar Waxwing'] },
};

const BIOME_KEYS = Object.keys(BIOMES);

/**
 * OrnithologyMode — A meditative observation mode.
 * Grid tiles represent biomes; bird sightings appear as collectible "observations".
 * Each bird collected adds to a field notebook (gameState._birdNotebook).
 * Rare birds flash learning challenges.
 * Consciousness connection: attention restoration, present-moment awareness.
 */
export class OrnithologyMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'ornithology',
      name: 'Ornithology — Field Observation',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 180; // slightly slower — observation requires patience
    this._biomeGrid = [];
    this._birdSightings = []; // { x, y, bird, observed }
    this._challengeActive = null;
    this._challengeTimer = 0;
    this._sightingFlash = null; // { bird, shownAtMs }
  }

  init(gameState, canvas, ctx) {
    this.tileSize = Math.floor(canvas.width / (gameState.gridSize || 12));
    gameState._birdNotebook = gameState._birdNotebook || {};
    gameState._totalObservations = gameState._totalObservations || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = 0;
    gameState.score = gameState.score || 0;
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    this._generateBiomeGrid(gameState);
    this._spawnBirdSightings(gameState);
  }

  _generateBiomeGrid(gameState) {
    const sz = gameState.gridSize || 12;
    this._biomeGrid = [];
    for (let y = 0; y < sz; y++) {
      this._biomeGrid[y] = [];
      for (let x = 0; x < sz; x++) {
        // Weighted biome selection based on position (creates natural clusters)
        const r = Math.random();
        if (r < 0.30) this._biomeGrid[y][x] = 'FOREST';
        else if (r < 0.46) this._biomeGrid[y][x] = 'WETLAND';
        else if (r < 0.60) this._biomeGrid[y][x] = 'OPEN';
        else if (r < 0.70) this._biomeGrid[y][x] = 'URBAN';
        else if (r < 0.78) this._biomeGrid[y][x] = 'BRUSH';
        else if (r < 0.84) this._biomeGrid[y][x] = 'TUNDRA';
        else this._biomeGrid[y][x] = 'OCEAN';
      }
    }
  }

  _spawnBirdSightings(gameState) {
    const sz = gameState.gridSize || 12;
    const sightingCount = 6 + Math.floor(gameState.level * 1.5);
    this._birdSightings = [];
    const placed = new Set();
    let attempts = 0;
    while (this._birdSightings.length < sightingCount && attempts < 200) {
      attempts++;
      const x = 1 + Math.floor(Math.random() * (sz - 2));
      const y = 1 + Math.floor(Math.random() * (sz - 2));
      const key = `${x},${y}`;
      if (placed.has(key)) continue;
      const biome = this._biomeGrid[y]?.[x] || 'FOREST';
      const compatible = BIRDS.filter(b => BIOMES[biome]?.birds?.includes(b.name));
      const pool = compatible.length > 0 ? compatible : BIRDS.filter(b => b.rarity === 1);
      // Weight by rarity (rarer = less likely)
      const weights = pool.map(b => 5 - b.rarity);
      const total = weights.reduce((a, v) => a + v, 0);
      let rand = Math.random() * total;
      let bird = pool[0];
      for (let i = 0; i < pool.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { bird = pool[i]; break; }
      }
      placed.add(key);
      this._birdSightings.push({ x, y, bird, observed: false });
    }
    gameState.peaceTotal = this._birdSightings.length;
  }

  update(gameState, deltaTime) {
    if (this._challengeActive) {
      this._challengeTimer -= deltaTime;
      if (this._challengeTimer <= 0) {
        // Time expired — mark wrong
        this._challengeActive = null;
      }
    }
  }

  handleInput(gameState, input) {
    // Block input during challenge
    if (this._challengeActive) {
      const opts = ['1','2','3','4'];
      for (const k of opts) {
        if (input.isKeyPressed(k)) {
          const idx = parseInt(k) - 1;
          this._resolveChallengeAnswer(gameState, idx);
          break;
        }
      }
      return;
    }

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;

    const dir = input.getDirectionalInput();
    if (dir.x === 0 && dir.y === 0) return;

    const sz = gameState.gridSize || 12;
    const nx = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
    const ny = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
    gameState.player.x = nx;
    gameState.player.y = ny;
    this.lastMoveTime = now;
    try { window.AudioManager?.play('move'); } catch(e) {}

    // Check if player is on a sighting
    this._checkSighting(gameState);
  }

  _checkSighting(gameState) {
    const { x, y } = gameState.player;
    const sighting = this._birdSightings.find(s => !s.observed && s.x === x && s.y === y);
    if (!sighting) return;

    sighting.observed = true;
    gameState.peaceCollected = (gameState.peaceCollected || 0) + 1;
    const pts = sighting.bird.rarity * 100 * (gameState.level || 1);
    gameState.score = (gameState.score || 0) + pts;
    gameState._totalObservations = (gameState._totalObservations || 0) + 1;

    // Add to field notebook
    if (!gameState._birdNotebook[sighting.bird.name]) {
      gameState._birdNotebook[sighting.bird.name] = { count: 0, firstSeen: Date.now() };
    }
    gameState._birdNotebook[sighting.bird.name].count++;

    // Show sighting flash
    this._sightingFlash = { bird: sighting.bird, shownAtMs: Date.now() };
    try { window.AudioManager?.play('bird'); } catch(e) {}

    // Rare birds (rarity 3+) trigger identification challenge
    if (sighting.bird.rarity >= 3) {
      this._launchChallenge(gameState, sighting.bird);
    }

    // Level complete when all sightings observed
    if (gameState.peaceCollected >= gameState.peaceTotal) {
      setTimeout(() => this._onLevelComplete(gameState), 600);
    }
  }

  _launchChallenge(gameState, bird) {
    // Pick 3 distractors from other birds
    const distractors = BIRDS
      .filter(b => b.name !== bird.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [bird, ...distractors].sort(() => Math.random() - 0.5);
    const correctIdx = options.indexOf(bird);
    this._challengeActive = {
      question: `Which species did you just observe?`,
      hint: `Habitat: ${bird.habitat} · Rarity: ${'★'.repeat(bird.rarity)}`,
      options: options.map(b => b.name),
      correctIdx,
      bird,
    };
    this._challengeTimer = 12000; // 12s to answer
  }

  _resolveChallengeAnswer(gameState, idx) {
    if (!this._challengeActive) return;
    const correct = idx === this._challengeActive.correctIdx;
    if (correct) {
      gameState.score = (gameState.score || 0) + 250 * this._challengeActive.bird.rarity;
      gameState._challengeResult = { correct: true, text: `✓ ${this._challengeActive.bird.name}`, color: '#00ff88' };
      try { window.AudioManager?.play('insight'); } catch(e) {}
    } else {
      gameState._challengeResult = { correct: false, text: `✗ It was a ${this._challengeActive.bird.name}`, color: '#ff4466' };
      try { window.AudioManager?.play('damage'); } catch(e) {}
    }
    gameState._challengeResultAt = Date.now();
    this._challengeActive = null;
  }

  _onLevelComplete(gameState) {
    gameState.score = (gameState.score || 0) + 500 * (gameState.level || 1);
    gameState.level = (gameState.level || 1) + 1;
    this._generateBiomeGrid(gameState);
    this._spawnBirdSightings(gameState);
    gameState.peaceCollected = 0;
    try { window.AudioManager?.play('level_complete'); } catch(e) {}
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 12;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#0a120a';
    ctx.fillRect(0, 0, w, h);

    // Render biome tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const biomeKey = this._biomeGrid[y]?.[x] || 'FOREST';
        const biome = BIOMES[biomeKey];
        ctx.fillStyle = biome.bg;
        ctx.fillRect(x * ts, y * ts, ts, ts);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * ts, y * ts, ts, ts);
        // Biome symbol (subtle)
        if (ts >= 20) {
          ctx.globalAlpha = 0.18;
          ctx.font = `${Math.floor(ts * 0.45)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(biome.sy, x * ts + ts / 2, y * ts + ts / 2);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Render unobserved bird sightings (glow + symbol)
    const now = Date.now();
    for (const s of this._birdSightings) {
      if (s.observed) continue;
      const px = s.x * ts + ts / 2;
      const py = s.y * ts + ts / 2;
      // Rarity glow
      const glowColors = ['', '#aaffaa', '#88ccff', '#ffcc44', '#ff88ff'];
      const glowColor = glowColors[s.bird.rarity] || '#aaffaa';
      const pulse = 0.55 + 0.45 * Math.sin(now / 600 + s.x + s.y);
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6 + pulse * 8;
      ctx.globalAlpha = 0.65 + pulse * 0.25;
      ctx.font = `${Math.floor(ts * 0.65)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = glowColor;
      ctx.fillText(s.bird.symbol, px, py);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Render player
    const plx = gameState.player.x * ts + ts / 2;
    const ply = gameState.player.y * ts + ts / 2;
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', plx, ply);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Bird identification challenge overlay
    if (this._challengeActive) {
      this._renderChallenge(ctx, w, h);
    }

    // Sighting flash (bottom banner)
    if (this._sightingFlash) {
      const age = now - this._sightingFlash.shownAtMs;
      const dur = 3000;
      if (age < dur) {
        const fade = Math.min(1, age / 200) * (age > dur - 500 ? (dur - age) / 500 : 1);
        const bird = this._sightingFlash.bird;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = `rgba(0,20,0,${fade * 0.88})`;
        ctx.fillRect(0, h * 0.82, w, h * 0.18);
        ctx.fillStyle = ['', '#aaffaa', '#88ccff', '#ffcc44', '#ff88ff'][bird.rarity] || '#aaffaa';
        ctx.font = `bold ${Math.floor(w / 24)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillText(`${bird.symbol}  ${bird.name}  ${'★'.repeat(bird.rarity)}`, w / 2, h * 0.88);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#778899';
        ctx.font = `${Math.floor(w / 34)}px monospace`;
        ctx.fillText(bird.note, w / 2, h * 0.94);
        ctx.restore();
      } else {
        this._sightingFlash = null;
      }
    }

    // Challenge answer result flash
    if (gameState._challengeResult && gameState._challengeResultAt) {
      const age = now - gameState._challengeResultAt;
      if (age < 2000) {
        const fade = age > 1500 ? (2000 - age) / 500 : 1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = gameState._challengeResult.color;
        ctx.font = `bold ${Math.floor(w / 22)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = gameState._challengeResult.color;
        ctx.shadowBlur = 12;
        ctx.fillText(gameState._challengeResult.text, w / 2, h * 0.12);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._challengeResult;
        delete gameState._challengeResultAt;
      }
    }

    // Observations counter (top-left)
    ctx.save();
    ctx.fillStyle = '#aaffaa';
    ctx.font = `${Math.floor(w / 32)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const remaining = gameState.peaceTotal - (gameState.peaceCollected || 0);
    ctx.fillText(`🐦 ${gameState.peaceCollected || 0}/${gameState.peaceTotal}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, 8, 8);
    ctx.fillStyle = '#446644';
    ctx.font = `${Math.floor(w / 40)}px monospace`;
    ctx.fillText(`Notebook: ${Object.keys(gameState._birdNotebook || {}).length} species`, 8, 8 + Math.floor(w / 26));
    ctx.restore();
  }

  _renderChallenge(ctx, w, h) {
    const c = this._challengeActive;
    const timeLeft = Math.max(0, Math.ceil(this._challengeTimer / 1000));
    ctx.save();
    ctx.globalAlpha = 0.93;
    ctx.fillStyle = '#040a04';
    ctx.fillRect(w * 0.05, h * 0.20, w * 0.90, h * 0.55);
    ctx.strokeStyle = '#00aa44';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.05, h * 0.20, w * 0.90, h * 0.55);
    ctx.globalAlpha = 1;
    // Question
    ctx.fillStyle = '#aaffaa';
    ctx.font = `bold ${Math.floor(w / 24)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.question, w / 2, h * 0.27);
    ctx.fillStyle = '#446644';
    ctx.font = `${Math.floor(w / 36)}px monospace`;
    ctx.fillText(c.hint, w / 2, h * 0.32);
    // Options
    c.options.forEach((opt, i) => {
      const oy = h * (0.38 + i * 0.09);
      ctx.fillStyle = '#1a2a1a';
      ctx.fillRect(w * 0.12, oy - 14, w * 0.76, 28);
      ctx.strokeStyle = '#224422';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.12, oy - 14, w * 0.76, 28);
      ctx.fillStyle = '#88cc88';
      ctx.font = `${Math.floor(w / 32)}px monospace`;
      ctx.fillText(`[${i + 1}]  ${opt}`, w / 2, oy);
    });
    // Timer
    ctx.fillStyle = timeLeft <= 3 ? '#ff4455' : '#446644';
    ctx.font = `${Math.floor(w / 32)}px monospace`;
    ctx.fillText(`${timeLeft}s`, w / 2, h * 0.72);
    ctx.restore();
  }
}
