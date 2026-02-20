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
// Each bird: { name, symbol, rarity, habitat, notes: [...], call: { type, meaning } }
// Multiple facts rotate on each sighting so repeat encounters teach new things.
// Bird language: based on Jon Young's "What the Robin Knows" (2012) &
// Cornell Lab "Bird Academy" — call types and their alarm/communication meanings.
const BIRDS = [
  // Common (rarity 1)
  { name: 'House Sparrow',    symbol: '🐦', rarity: 1, habitat: 'urban',
    notes: ['Introduced globally; one of the most abundant birds on Earth.',
            'Communicates through complex chirp sequences—up to 25 distinct calls.',
            'Builds messy nests in any cavity; will evict other nesting birds.'],
    call: { type: 'Contact call', sound: '"chirp-chirp"', meaning: 'Flock cohesion — "I am here, where are you?"' } },
  { name: 'American Robin',   symbol: '🐦', rarity: 1, habitat: 'forest',
    notes: ['First robin of spring signals seasonal thaw in North America.',
            'Detects earthworms by tilting its head and listening—not sight.',
            'Can migrate up to 3,000 miles; some stay year-round if food is available.'],
    call: { type: 'Alarm call', sound: '"tut-tut-tut"', meaning: 'Terrestrial predator alert — fox, cat, or snake nearby.' } },
  { name: 'Mallard',          symbol: '🦆', rarity: 1, habitat: 'wetland',
    notes: ['Ancestor of most domestic duck breeds; highly adaptable.',
            'Females give the classic "quack"; males produce a soft raspy call.',
            'Dabbles head-down to filter seeds and invertebrates from shallow water.'],
    call: { type: 'Alarm quack', sound: 'Rapid "QUACK-QUACK-QUACK"', meaning: 'Aerial predator (hawk/eagle) — dive or escape immediately.' } },
  { name: 'Rock Pigeon',      symbol: '🕊', rarity: 1, habitat: 'urban',
    notes: ['Carrier pigeons saved thousands of lives in WWI & WWII.',
            'Navigates using Earth\'s magnetic field, sun position, and landmarks.',
            'One of only a handful of bird species that feeds crop milk to nestlings.'],
    call: { type: 'Coo call', sound: '"coo-coo-coo"', meaning: 'Territory and courtship — claiming space peacefully.' } },
  { name: 'European Starling', symbol: '🐦', rarity: 1, habitat: 'open',
    notes: ['Murmuration flocks can contain a million birds moving as one.',
            'Introduced to North America in 1890 by a group trying to bring every bird from Shakespeare.',
            'Can mimic 20+ other bird species plus mechanical and human sounds.'],
    call: { type: 'Mimic/Song', sound: 'Varied, often includes other species', meaning: 'Mate attraction — complexity signals good health and memory.' } },
  // Uncommon (rarity 2)
  { name: 'Great Blue Heron', symbol: '🦤', rarity: 2, habitat: 'wetland',
    notes: ['Stands motionless for minutes before striking at fish.',
            'Can swallow prey up to 30 cm long whole; occasionally drowns.',
            'Rookeries (nesting colonies) can hold hundreds of pairs—nests reused yearly.'],
    call: { type: 'Alarm squawk', sound: '"FRAANK-FRAANK"', meaning: 'Startled flush alarm — major disturbance in the area.' } },
  { name: 'Red-tailed Hawk',  symbol: '🦅', rarity: 2, habitat: 'open',
    notes: ['Most common large hawk in North America; iconic screech call.',
            'Can see ultraviolet light, making rodent urine trails visible.',
            'Mates for life; pairs perform aerial courtship displays together.'],
    call: { type: 'Aerial alarm', sound: 'High-pitched "keeeeeer"', meaning: 'Own territory call AND causes small birds to take cover.' } },
  { name: 'Barn Owl',         symbol: '🦉', rarity: 2, habitat: 'forest',
    notes: ['Heart-shaped facial disc focuses sound like a radar dish.',
            'Can locate and catch prey in total darkness by hearing alone.',
            'Swallows prey whole and regurgitates compressed pellets of fur and bone.'],
    call: { type: 'Raspy screech', sound: '"SHREEEEE"', meaning: 'Contact call between mates in darkness — "I am hunting nearby."' } },
  { name: 'Northern Cardinal', symbol: '🐦', rarity: 2, habitat: 'forest',
    notes: ['One of the few songbirds where females also sing.',
            'Males aggressively fight their own reflections—mistaking glass for rivals.',
            'A group of cardinals is called a "college," "conclave," or "radiance."'],
    call: { type: 'Chip alarm', sound: 'Sharp "CHIP" or "TINK"', meaning: 'Aerial predator alert — short chips = hawk overhead.' } },
  { name: 'Cedar Waxwing',    symbol: '🐦', rarity: 2, habitat: 'brush',
    notes: ['Red waxy tips on wings are pigment from berry enzymes.',
            'Passes berries beak-to-beak down a perched line of birds—social grooming.',
            'Orange tail band on some birds comes from eating honeysuckle berries.'],
    call: { type: 'High seet', sound: 'Very high "seeeeee"', meaning: 'Aerial alarm — so high-pitched that location is undetectable by predators.' } },
  // Rare (rarity 3)
  { name: 'Painted Bunting',  symbol: '🦜', rarity: 3, habitat: 'brush',
    notes: ['Called "nonpareil" — without equal — for its vivid colors.',
            'Males are fiercely territorial; fights can be fatal.',
            'Navigates by the stars during nocturnal migration over the Gulf of Mexico.'],
    call: { type: 'Song', sound: 'Rich, warbling melody', meaning: 'Territory proclamation — "this space is occupied and defended."' } },
  { name: 'Sandhill Crane',   symbol: '🦩', rarity: 3, habitat: 'wetland',
    notes: ['Among the oldest living bird species; 9–10 million years old.',
            'Performs elaborate pair-bonding dances: bowing, leaping, wing-flapping.',
            'Paints its feathers with iron-rich mud for better camouflage.'],
    call: { type: 'Unison call', sound: 'Resonant "gurrr-oo-oo"', meaning: 'Pair bond reinforcement — mates call together to strengthen partnership.' } },
  { name: 'Snowy Owl',        symbol: '🦉', rarity: 3, habitat: 'tundra',
    notes: ['Can locate prey under 12 inches of snow by hearing alone.',
            'Unlike most owls, snowy owls hunt during daylight hours.',
            'Flies silently: feather edges are serrated to disrupt turbulence.'],
    call: { type: 'Hooting bark', sound: 'Deep "hoo-hoo" or sharp bark', meaning: 'Territory defense and mate calling in open tundra.' } },
  { name: 'Resplendent Quetzal', symbol: '🦜', rarity: 3, habitat: 'forest',
    notes: ['Sacred to Mayan civilization; tail feathers reached 3 feet.',
            'Cannot survive in captivity—it dies of stress.',
            'National bird of Guatemala; its image is on the flag and currency.'],
    call: { type: 'Wailing call', sound: '"kyow-kyow" or "uwac"', meaning: 'Contact call in dense cloud forest — helps mates locate each other.' } },
  // Very rare (rarity 4)
  { name: 'Albatross',        symbol: '🦅', rarity: 4, habitat: 'ocean',
    notes: ['Soars for years without landing; can sleep while flying.',
            'Largest wingspan of any living bird—up to 3.5 meters.',
            'Produces stomach oil as a high-energy food for chicks.'],
    call: { type: 'Bill clatter', sound: 'Rapid bill-snapping and moaning', meaning: 'Courtship dance ritual — signals fitness and readiness to bond.' } },
  { name: 'Birds of Paradise', symbol: '🦜', rarity: 4, habitat: 'forest',
    notes: ['Male performs elaborate dances; females choose the best dancer.',
            'Has 45 species, nearly all found only in New Guinea.',
            'The feathers produce structural color—iridescence without pigment.'],
    call: { type: 'Display song', sound: 'Mechanical buzzing or loud squawking', meaning: 'Dance accompaniment — sound and movement form a unified display.' } },
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
    // Use the shorter dimension for tile size to keep the grid square and centered
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
    gameState._birdNotebook = gameState._birdNotebook || {};
    gameState._totalObservations = gameState._totalObservations || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = 0;
    gameState.score = gameState.score || 0;
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    this._generateBiomeGrid(gameState);
    this._spawnBirdSightings(gameState);
  }

  onResize(canvas, gameState) {
    if (!gameState) return;
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
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

    // Add to field notebook — track visit count so we can rotate facts
    if (!gameState._birdNotebook[sighting.bird.name]) {
      gameState._birdNotebook[sighting.bird.name] = { count: 0, firstSeen: Date.now() };
    }
    const notebookEntry = gameState._birdNotebook[sighting.bird.name];
    notebookEntry.count++;

    // Pick a rotating fact based on how many times this species has been seen
    const notes = sighting.bird.notes || [sighting.bird.note || ''];
    const noteIdx = (notebookEntry.count - 1) % notes.length;
    const currentNote = notes[noteIdx];

    // Show sighting flash with the rotating fact
    this._sightingFlash = { bird: sighting.bird, note: currentNote, shownAtMs: Date.now() };
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
    // Alternate between species ID challenge and bird language challenge
    const notebookEntry = gameState._birdNotebook?.[bird.name];
    const visitCount = notebookEntry?.count || 1;
    const useBirdLanguage = bird.call && visitCount % 2 === 0; // even visits = bird language challenge

    if (useBirdLanguage) {
      // Bird language challenge: what does this call mean?
      const wrongMeanings = BIRDS
        .filter(b => b.call && b.name !== bird.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(b => b.call.meaning);
      const options = [bird.call.meaning, ...wrongMeanings].sort(() => Math.random() - 0.5);
      this._challengeActive = {
        question: `${bird.name}: ${bird.call.type} — ${bird.call.sound}\nWhat does this call mean?`,
        hint: `Bird Language: calls carry survival information for all forest animals.`,
        options,
        correctIdx: options.indexOf(bird.call.meaning),
        bird,
        isBirdLanguage: true,
      };
    } else {
      // Species identification challenge
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
    }
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
    const xOff = this._xOff || 0;
    const yOff = this._yOff || 0;

    // Background (full canvas)
    ctx.fillStyle = '#0a120a';
    ctx.fillRect(0, 0, w, h);

    // Translate context so grid is centered in the full-screen canvas
    ctx.save();
    ctx.translate(xOff, yOff);

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

    // ── End grid-space rendering — restore canvas transform ────────────
    ctx.restore();

    // Bird identification challenge overlay (full-canvas)
    if (this._challengeActive) {
      this._renderChallenge(ctx, w, h);
    }

    // Sighting flash (bottom banner)
    if (this._sightingFlash) {
      const age = now - this._sightingFlash.shownAtMs;
      const dur = 4000;
      if (age < dur) {
        const fade = Math.min(1, age / 200) * (age > dur - 500 ? (dur - age) / 500 : 1);
        const bird = this._sightingFlash.bird;
        const rarityColor = ['', '#aaffaa', '#88ccff', '#ffcc44', '#ff88ff'][bird.rarity] || '#aaffaa';
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = `rgba(0,20,0,${fade * 0.88})`;
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
        ctx.fillStyle = rarityColor;
        ctx.font = `bold ${Math.floor(w / 24)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = rarityColor;
        ctx.shadowBlur = 8;
        ctx.fillText(`${bird.symbol}  ${bird.name}  ${'★'.repeat(bird.rarity)}`, w / 2, h * 0.83);
        ctx.shadowBlur = 0;
        // Fact text line
        ctx.fillStyle = '#778899';
        ctx.font = `${Math.floor(w / 36)}px monospace`;
        const noteText = this._sightingFlash.note || bird.notes?.[0] || '';
        ctx.fillText(noteText, w / 2, h * 0.89);
        // Bird language line (shown when call data exists)
        if (bird.call) {
          ctx.fillStyle = '#55bbaa';
          ctx.font = `italic ${Math.floor(w / 42)}px monospace`;
          ctx.fillText(`🔊 ${bird.call.type}: ${bird.call.sound} — "${bird.call.meaning}"`, w / 2, h * 0.94);
        }
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
    ctx.fillText(`🐦 ${gameState.peaceCollected || 0}/${gameState.peaceTotal}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, 8, 8);
    ctx.fillStyle = '#446644';
    ctx.font = `${Math.floor(w / 40)}px monospace`;
    ctx.fillText(`Notebook: ${Object.keys(gameState._birdNotebook || {}).length} species`, 8, 8 + Math.floor(w / 26));
    ctx.restore();
  }

  _renderChallenge(ctx, w, h) {
    const c = this._challengeActive;
    const timeLeft = Math.max(0, Math.ceil(this._challengeTimer / 1000));
    const headerColor = c.isBirdLanguage ? '#55bbaa' : '#aaffaa';
    const borderColor = c.isBirdLanguage ? '#008888' : '#00aa44';
    ctx.save();
    ctx.globalAlpha = 0.93;
    ctx.fillStyle = '#040a08';
    ctx.fillRect(w * 0.05, h * 0.18, w * 0.90, h * 0.60);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.05, h * 0.18, w * 0.90, h * 0.60);
    ctx.globalAlpha = 1;

    // Mode label
    const modeLabel = c.isBirdLanguage ? '🔊 BIRD LANGUAGE' : '🐦 SPECIES IDENTIFICATION';
    ctx.fillStyle = headerColor;
    ctx.font = `bold ${Math.floor(w / 40)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(modeLabel, w / 2, h * 0.22);

    // Question (handle multi-line via newline split)
    const questionLines = c.question.split('\n');
    ctx.fillStyle = headerColor;
    ctx.font = `bold ${Math.floor(w / 28)}px monospace`;
    const LINE_SPACING = Math.floor(w / 22); // ~line height for question text
    questionLines.forEach((line, i) => {
      ctx.fillText(line, w / 2, h * 0.27 + i * LINE_SPACING);
    });

    ctx.fillStyle = '#446655';
    ctx.font = `italic ${Math.floor(w / 38)}px monospace`;
    ctx.fillText(c.hint, w / 2, h * 0.36);

    // Options
    c.options.forEach((opt, i) => {
      const oy = h * (0.41 + i * 0.085);
      ctx.fillStyle = '#0a1a14';
      ctx.fillRect(w * 0.10, oy - 14, w * 0.80, 28);
      ctx.strokeStyle = '#224433';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.10, oy - 14, w * 0.80, 28);
      ctx.fillStyle = '#88ccaa';
      ctx.font = `${Math.floor(w / 32)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`  [${i + 1}]  ${opt}`, w * 0.12, oy + 4);
    });

    // Timer
    ctx.textAlign = 'center';
    ctx.fillStyle = timeLeft <= 3 ? '#ff4455' : '#446644';
    ctx.font = `${Math.floor(w / 32)}px monospace`;
    ctx.fillText(`${timeLeft}s`, w / 2, h * 0.76);
    ctx.restore();
  }
}
