// ═══════════════════════════════════════════════════════════════════════
//  MYCOLOGY MODE — Mushroom Foraging Grid Mode
//  Players forage through forest tiles collecting edible mushrooms while
//  avoiding toxic species. Rare mycelium network tiles connect species.
//  Learning challenges: species identification, edibility determination.
//  Research: "wood wide web" research (Simard 1997); mycorrhizal networks
//  as a metaphor for interconnected consciousness and underground support.
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';

// ── Mushroom species data ───────────────────────────────────────────────
// notes: array of facts shown in rotation on each encounter with the same species
const MUSHROOMS = [
  // Edible (safe: true)
  { name: 'Chanterelle',      symbol: '🍄', safe: true,  rarity: 2,
    notes: ['Golden, funnel-shaped; fruity apricot scent. Partner of oaks and beeches.',
            'Cannot be cultivated—requires a live tree partner root network to grow.',
            'Rich in vitamin D; traditional European forest delicacy for centuries.'] },
  { name: 'Morel',            symbol: '🍄', safe: true,  rarity: 3,
    notes: ['Honeycomb cap; highly prized; fruits only in early spring.',
            'Appears after forest fires—benefits from the nutrient-rich ash layer.',
            'Must be cooked; contains hydrazine compounds that are toxic when raw.'] },
  { name: 'Oyster Mushroom',  symbol: '🍄', safe: true,  rarity: 1,
    notes: ['Grows in shelf clusters on dead wood; used for mycelium packaging.',
            'Can digest hydrocarbons in contaminated soil—a powerful bioremediation tool.',
            'One of the few fungi that actively hunts; paralyzes nematodes with toxin.'] },
  { name: "Lion's Mane",      symbol: '🍄', safe: true,  rarity: 3,
    notes: ["Cascading white teeth; compounds studied for nerve growth factor.",
            'Clinical trials show potential for reducing mild cognitive impairment.',
            'Used in Traditional Chinese Medicine for centuries as a tonic mushroom.'] },
  { name: 'Shiitake',         symbol: '🍄', safe: true,  rarity: 2,
    notes: ['Cultivated for 1,000+ years; second most consumed mushroom worldwide.',
            'Contains lentinan—a polysaccharide studied for immune modulation.',
            'The umami compound lentilic acid intensifies as the mushroom dries.'] },
  { name: 'Porcini',          symbol: '🍄', safe: true,  rarity: 2,
    notes: ['Broad brown cap; called "king bolete"; forms mycorrhizae with conifers.',
            'Cannot be farmed—it requires specific live-tree root partnerships.',
            'Drying concentrates the flavor by a factor of 10.'] },
  { name: 'Giant Puffball',   symbol: '🍄', safe: true,  rarity: 2,
    notes: ['Can grow to 150 cm; edible when flesh is pure white throughout.',
            'A single specimen can produce 7 trillion spores.',
            'Used as a wound staunching agent by Indigenous peoples for centuries.'] },
  // Inedible / toxic (safe: false)
  { name: 'Death Cap',        symbol: '💀', safe: false, rarity: 3,
    notes: ['Amanita phalloides — responsible for 90% of fatal mushroom poisonings.',
            'Tastes pleasantly mild—the deadliest mushroom has no warning flavor.',
            'Half a cap contains enough amatoxin to kill an adult human.'] },
  { name: 'Destroying Angel', symbol: '💀', safe: false, rarity: 3,
    notes: ['Pure white; no antidote; symptoms appear 6–24 hours after ingestion.',
            'Often mistaken for edible button mushrooms by inexperienced foragers.',
            'Amatoxins block RNA polymerase II—halting protein synthesis in cells.'] },
  { name: "Jack-o'Lantern",   symbol: '🟠', safe: false, rarity: 2,
    notes: ['Glows faint blue-green in the dark; causes severe gastrointestinal distress.',
            'The bioluminescence is produced by a luciferin-luciferase reaction.',
            'Grows at the base of oaks; looks similar to chanterelles but is deadly.'] },
  { name: 'Fly Agaric',       symbol: '🔴', safe: false, rarity: 2,
    notes: ['Classic red-and-white; psychoactive; used ceremonially in Siberian shamanism.',
            'The active compounds muscimol and ibotenic acid are not psilocybin.',
            'Reindeer seek it out intentionally for its psychoactive effects.'] },
  { name: 'False Morel',      symbol: '⚠',  safe: false, rarity: 2,
    notes: ['Resembles true morels; contains gyromitrin, converted to monomethylhydrazine in body.',
            'Poisoning can occur from inhaling vapors while cooking the mushroom.',
            'Considered a delicacy in some Eastern European countries despite toxicity.'] },
  // Network (special — not collected; reveals connections)
  { name: 'Mycelium Node',    symbol: '🕸', safe: null,  rarity: 0,
    notes: ['Underground hyphal networks; a single organism can span thousands of acres.',
            'Transfers carbon, water, and nutrients between trees in a forest.',
            'Can recognize self vs. non-self; defends territory from rival fungi.'] },
];

const EDIBLE   = MUSHROOMS.filter(m => m.safe === true);
const TOXIC    = MUSHROOMS.filter(m => m.safe === false);
const NETWORK  = MUSHROOMS.find(m => m.safe === null);

// Forest substrate tiles
const SUBSTRATES = {
  OAK:      { bg: '#1a1408', sy: '🌳', note: 'Supports chanterelle, porcini, truffle.' },
  PINE:     { bg: '#0d1a0d', sy: '🌲', note: 'Home to morels, fly agaric, porcini.' },
  DEADWOOD: { bg: '#1a0e08', sy: '🪵', note: 'Oyster, lion\'s mane, chicken of the woods.' },
  MEADOW:   { bg: '#1a1a0a', sy: '🌿', note: 'Giant puffball, field mushroom.' },
  WETLOG:   { bg: '#0d150d', sy: '💧', note: 'Shiitake, velvet foot.' },
};

/**
 * MycologyMode — Foraging simulation with learning challenges.
 * Edible mushrooms award points and trigger connection reveals.
 * Toxic mushrooms penalize HP and trigger mandatory ID challenges.
 * Mycelium network tiles light up nearby connections.
 */
export class MycologyMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'mycology',
      name: 'Mycology — Forest Foraging',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 160;
    this._substrateGrid = [];
    this._mushroomSpawns = []; // { x, y, mushroom, collected }
    this._networkNodes = [];    // { x, y, active }
    this._challengeActive = null;
    this._challengeTimer = 0;
    this._foragingFlash = null;
    this._revealedConnections = []; // pairs [ [x1,y1],[x2,y2] ] briefly shown
  }

  init(gameState, canvas, ctx) {
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
    gameState.player = gameState.player || { x: 1, y: 1, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    gameState._forageLog = gameState._forageLog || { safe: 0, toxic: 0, species: {} };
    gameState.peaceCollected = 0;
    gameState.peaceTotal = 0;
    gameState.score = gameState.score || 0;
    this._buildSubstrateGrid(gameState);
    this._spawnMushrooms(gameState);
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

  _buildSubstrateGrid(gameState) {
    const sz = gameState.gridSize || 12;
    const keys = Object.keys(SUBSTRATES);
    this._substrateGrid = [];
    for (let y = 0; y < sz; y++) {
      this._substrateGrid[y] = [];
      for (let x = 0; x < sz; x++) {
        this._substrateGrid[y][x] = keys[Math.floor(Math.random() * keys.length)];
      }
    }
  }

  _spawnMushrooms(gameState) {
    const sz = gameState.gridSize || 12;
    // Edible mushrooms (peace nodes)
    const edibleCount = 5 + gameState.level;
    // Toxic (hazards)
    const toxicCount = 2 + Math.floor(gameState.level * 0.8);
    // Network nodes
    const networkCount = 3;

    const placed = new Set();
    this._mushroomSpawns = [];
    this._networkNodes = [];

    const _place = (arr, mushroom) => {
      let attempts = 0;
      while (attempts < 100) {
        attempts++;
        const x = 1 + Math.floor(Math.random() * (sz - 2));
        const y = 1 + Math.floor(Math.random() * (sz - 2));
        const key = `${x},${y}`;
        if (placed.has(key)) continue;
        placed.add(key);
        arr.push({ x, y, mushroom, collected: false });
        return;
      }
    };

    for (let i = 0; i < edibleCount; i++) {
      _place(this._mushroomSpawns, EDIBLE[Math.floor(Math.random() * EDIBLE.length)]);
    }
    for (let i = 0; i < toxicCount; i++) {
      _place(this._mushroomSpawns, TOXIC[Math.floor(Math.random() * TOXIC.length)]);
    }
    for (let i = 0; i < networkCount; i++) {
      let attempts = 0;
      while (attempts < 100) {
        attempts++;
        const x = 1 + Math.floor(Math.random() * (sz - 2));
        const y = 1 + Math.floor(Math.random() * (sz - 2));
        const key = `${x},${y}`;
        if (placed.has(key)) continue;
        placed.add(key);
        this._networkNodes.push({ x, y, active: false, revealedAt: 0 });
        break;
      }
    }

    gameState.peaceTotal = this._mushroomSpawns.filter(m => m.mushroom.safe).length;
  }

  update(gameState, deltaTime) {
    if (this._challengeActive) {
      this._challengeTimer -= deltaTime;
      if (this._challengeTimer <= 0) {
        this._challengeActive = null;
      }
    }
    // Fade revealed connections
    this._revealedConnections = this._revealedConnections.filter(c => Date.now() - c.at < 3000);
  }

  handleInput(gameState, input) {
    if (this._challengeActive) {
      for (const k of ['1','2','3','4']) {
        if (input.isKeyPressed(k)) {
          this._resolveChallenge(gameState, parseInt(k) - 1);
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
    gameState.player.x = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
    gameState.player.y = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
    this.lastMoveTime = now;
    this._checkForage(gameState);
    this._checkNetwork(gameState);
  }

  _checkForage(gameState) {
    const { x, y } = gameState.player;
    const spawn = this._mushroomSpawns.find(s => !s.collected && s.x === x && s.y === y);
    if (!spawn) return;
    spawn.collected = true;
    const m = spawn.mushroom;

    // Track how many times this species has been encountered to rotate notes
    if (!gameState._forageLog.speciesCount) gameState._forageLog.speciesCount = {};
    gameState._forageLog.speciesCount[m.name] = (gameState._forageLog.speciesCount[m.name] || 0) + 1;
    const encounterIdx = gameState._forageLog.speciesCount[m.name] - 1;
    const notes = m.notes || [m.note || ''];
    const currentNote = notes[encounterIdx % notes.length];

    if (m.safe) {
      const pts = (m.rarity || 1) * 120 * (gameState.level || 1);
      gameState.score = (gameState.score || 0) + pts;
      gameState.peaceCollected = (gameState.peaceCollected || 0) + 1;
      gameState._forageLog.safe = (gameState._forageLog.safe || 0) + 1;
      gameState._forageLog.species[m.name] = (gameState._forageLog.species[m.name] || 0) + 1;
      this._foragingFlash = { mushroom: m, outcome: 'safe', note: currentNote, shownAtMs: Date.now() };
      try { window.AudioManager?.play('spore'); } catch(e) {}
    } else {
      const dmg = 15 + m.rarity * 5;
      gameState.player.hp = Math.max(1, (gameState.player.hp || 100) - dmg);
      gameState._forageLog.toxic = (gameState._forageLog.toxic || 0) + 1;
      this._foragingFlash = { mushroom: m, outcome: 'toxic', note: currentNote, shownAtMs: Date.now() };
      // Mandatory identification challenge for toxic species
      this._launchToxicChallenge(m);
      try { window.AudioManager?.play('damage'); } catch(e) {}
    }

    if (gameState.peaceCollected >= gameState.peaceTotal) {
      setTimeout(() => this._onLevelComplete(gameState), 600);
    }
  }

  _checkNetwork(gameState) {
    const { x, y } = gameState.player;
    const node = this._networkNodes.find(n => n.x === x && n.y === y);
    if (!node) return;
    node.active = true;
    node.revealedAt = Date.now();
    // Reveal connections between all nearby mushroom spawns
    const nearby = this._mushroomSpawns.filter(s =>
      Math.abs(s.x - x) <= 3 && Math.abs(s.y - y) <= 3
    );
    for (let i = 0; i < nearby.length - 1; i++) {
      this._revealedConnections.push({
        from: [nearby[i].x, nearby[i].y],
        to: [nearby[i + 1].x, nearby[i + 1].y],
        at: Date.now(),
      });
    }
    gameState.score = (gameState.score || 0) + 50;
    try { window.AudioManager?.play('insight'); } catch(e) {}
  }

  _launchToxicChallenge(mushroom) {
    const distractors = MUSHROOMS
      .filter(m => m.name !== mushroom.name && m.safe !== null)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [mushroom, ...distractors].sort(() => Math.random() - 0.5);
    this._challengeActive = {
      question: `⚠ Identify this toxic species!`,
      options: opts.map(m => m.name),
      correctIdx: opts.indexOf(mushroom),
      mushroom,
    };
    this._challengeTimer = 10000;
  }

  _resolveChallenge(gameState, idx) {
    if (!this._challengeActive) return;
    if (idx === this._challengeActive.correctIdx) {
      gameState.score = (gameState.score || 0) + 150;
      gameState._challengeResult = { correct: true, text: `✓ Correct! Avoid ${this._challengeActive.mushroom.name}`, color: '#00ff88' };
      try { window.AudioManager?.play('insight'); } catch(e) {}
    } else {
      gameState._challengeResult = { correct: false, text: `✗ That was ${this._challengeActive.mushroom.name}`, color: '#ff4466' };
    }
    gameState._challengeResultAt = Date.now();
    this._challengeActive = null;
  }

  _onLevelComplete(gameState) {
    gameState.score = (gameState.score || 0) + 500 * (gameState.level || 1);
    gameState.level = (gameState.level || 1) + 1;
    this._buildSubstrateGrid(gameState);
    this._spawnMushrooms(gameState);
    gameState.peaceCollected = 0;
    try { window.AudioManager?.play('level_complete'); } catch(e) {}
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 12;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();
    const xOff = this._xOff || 0;
    const yOff = this._yOff || 0;

    // Background (full canvas)
    ctx.fillStyle = '#060c06';
    ctx.fillRect(0, 0, w, h);

    // Translate context so grid is centered
    ctx.save();
    ctx.translate(xOff, yOff);

    // Substrate tiles
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const sub = SUBSTRATES[this._substrateGrid[y]?.[x]] || SUBSTRATES.OAK;
        ctx.fillStyle = sub.bg;
        ctx.fillRect(x * ts, y * ts, ts, ts);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * ts, y * ts, ts, ts);
      }
    }

    // Mycelium network connections (revealed)
    for (const conn of this._revealedConnections) {
      const age = now - conn.at;
      const fade = age > 2500 ? (3000 - age) / 500 : 1;
      ctx.save();
      ctx.globalAlpha = fade * 0.5;
      ctx.strokeStyle = '#88ff88';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(conn.from[0] * ts + ts / 2, conn.from[1] * ts + ts / 2);
      ctx.lineTo(conn.to[0] * ts + ts / 2, conn.to[1] * ts + ts / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Network nodes
    for (const node of this._networkNodes) {
      const px = node.x * ts + ts / 2;
      const py = node.y * ts + ts / 2;
      const pulse = 0.5 + 0.5 * Math.sin(now / 700 + node.x);
      ctx.save();
      ctx.globalAlpha = node.active ? (0.6 + pulse * 0.35) : (0.3 + pulse * 0.2);
      ctx.fillStyle = '#44ff88';
      ctx.shadowColor = '#44ff88';
      ctx.shadowBlur = node.active ? 12 : 4;
      ctx.font = `${Math.floor(ts * 0.55)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(NETWORK.symbol, px, py);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Mushroom spawns
    for (const sp of this._mushroomSpawns) {
      if (sp.collected) continue;
      const px = sp.x * ts + ts / 2;
      const py = sp.y * ts + ts / 2;
      const m = sp.mushroom;
      // Toxic mushrooms have a subtle danger glow that only shows when nearby
      const distToPlayer = Math.abs(sp.x - gameState.player.x) + Math.abs(sp.y - gameState.player.y);
      const isNear = distToPlayer <= 2;
      ctx.save();
      if (!m.safe && isNear) {
        ctx.shadowColor = '#ff2244';
        ctx.shadowBlur = 8;
      } else if (m.safe) {
        ctx.shadowColor = '#44cc66';
        ctx.shadowBlur = 4;
      }
      ctx.font = `${Math.floor(ts * 0.65)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = m.safe ? '#aaffaa' : (isNear ? '#ff6677' : '#888');
      ctx.fillText(m.symbol, px, py);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', gameState.player.x * ts + ts / 2, gameState.player.y * ts + ts / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── End grid-space rendering — restore canvas transform ────────────
    ctx.restore();

    // HP bar (canvas-space overlay)
    const hpFrac = Math.max(0, (gameState.player.hp || 100) / (gameState.player.maxHp || 100));
    ctx.fillStyle = '#220022';
    ctx.fillRect(8, h - 18, 100, 10);
    ctx.fillStyle = hpFrac < 0.3 ? '#ff2244' : '#44cc66';
    ctx.fillRect(8, h - 18, Math.round(100 * hpFrac), 10);
    ctx.strokeStyle = '#334433';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, h - 18, 100, 10);

    // Challenge overlay
    if (this._challengeActive) {
      this._renderChallenge(ctx, w, h);
    }

    // Foraging flash
    if (this._foragingFlash) {
      const age = now - this._foragingFlash.shownAtMs;
      const dur = 2800;
      if (age < dur) {
        const fade = Math.min(1, age / 200) * (age > dur - 500 ? (dur - age) / 500 : 1);
        const { mushroom, outcome, note } = this._foragingFlash;
        const col = outcome === 'safe' ? '#aaffaa' : '#ff4466';
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = `rgba(0,0,0,${fade * 0.85})`;
        ctx.fillRect(0, h * 0.80, w, h * 0.20);
        ctx.fillStyle = col;
        ctx.font = `bold ${Math.floor(w / 26)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        const label = outcome === 'safe' ? `✓ Edible: ${mushroom.name}` : `✗ Toxic: ${mushroom.name}`;
        ctx.fillText(label, w / 2, h * 0.86);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#778899';
        ctx.font = `${Math.floor(w / 36)}px monospace`;
        // Use the rotating note (or fallback to first note / old .note field)
        let noteText = note || (mushroom.notes ? mushroom.notes[0] : mushroom.note) || '';
        while (noteText.length > 0 && ctx.measureText(noteText).width > w * 0.88) {
          const lastSpace = noteText.lastIndexOf(' ');
          noteText = lastSpace > 0 ? noteText.substring(0, lastSpace) + '…' : noteText.substring(0, noteText.length - 2) + '…';
        }
        ctx.fillText(noteText, w / 2, h * 0.93);
        ctx.restore();
      } else {
        this._foragingFlash = null;
      }
    }

    // Challenge result
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
        ctx.fillText(gameState._challengeResult.text, w / 2, h * 0.14);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._challengeResult;
        delete gameState._challengeResultAt;
      }
    }

    // Status bar
    ctx.save();
    ctx.fillStyle = '#aaffaa';
    ctx.font = `${Math.floor(w / 34)}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`🍄 ${gameState.peaceCollected || 0}/${gameState.peaceTotal}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, 8, 8);
    const log = gameState._forageLog || {};
    ctx.fillStyle = '#446644';
    ctx.font = `${Math.floor(w / 42)}px monospace`;
    ctx.fillText(`Foraged: ${log.safe || 0} safe · ${log.toxic || 0} toxic · ${Object.keys(log.species || {}).length} species`, 8, 8 + Math.floor(w / 28));
    ctx.restore();
  }

  _renderChallenge(ctx, w, h) {
    const c = this._challengeActive;
    const timeLeft = Math.max(0, Math.ceil(this._challengeTimer / 1000));
    ctx.save();
    ctx.globalAlpha = 0.93;
    ctx.fillStyle = '#060c06';
    ctx.fillRect(w * 0.05, h * 0.18, w * 0.90, h * 0.58);
    ctx.strokeStyle = '#ff4455';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.05, h * 0.18, w * 0.90, h * 0.58);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff8888';
    ctx.font = `bold ${Math.floor(w / 22)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.question, w / 2, h * 0.26);
    c.options.forEach((opt, i) => {
      const oy = h * (0.36 + i * 0.09);
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(w * 0.12, oy - 14, w * 0.76, 28);
      ctx.strokeStyle = '#442222';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.12, oy - 14, w * 0.76, 28);
      ctx.fillStyle = '#cc8888';
      ctx.font = `${Math.floor(w / 32)}px monospace`;
      ctx.fillText(`[${i + 1}]  ${opt}`, w / 2, oy);
    });
    ctx.fillStyle = timeLeft <= 3 ? '#ff4455' : '#884444';
    ctx.font = `${Math.floor(w / 32)}px monospace`;
    ctx.fillText(`${timeLeft}s`, w / 2, h * 0.73);
    ctx.restore();
  }
}
