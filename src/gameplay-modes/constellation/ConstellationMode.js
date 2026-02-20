// ═══════════════════════════════════════════════════════════════════════
//  CONSTELLATION MODE — Meditative Star-Connection Puzzle
//  Players move to star tiles (INSIGHT nodes) and activate them,
//  building constellations by connecting stars in sequence.
//  Unlocks lore fragments about each constellation's mythology.
//  Research: attention restoration theory (Kaplan 1989) — night-sky
//  gazing as restorative experience; cross-cultural myth as shared
//  consciousness substrate (Jung 1968 archetypes).
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';

// ── Constellation data ─────────────────────────────────────────────────
// Each constellation: stars are relative positions, lore is mythology
const CONSTELLATIONS = [
  {
    name: 'Orion the Hunter',
    symbol: '⚔',
    color: '#88ccff',
    lore: "Son of Poseidon; can walk on water. Placed in the sky by Zeus after Scorpius's sting. The three belt stars — Alnitak, Alnilam, Mintaka — have guided travelers for millennia.",
    stars: [[2,0],[4,0],[6,0],[4,2],[2,4],[4,5],[6,4]], // relative [x,y] positions
  },
  {
    name: 'The Pleiades',
    symbol: '✦',
    color: '#aabbff',
    lore: 'The Seven Sisters — daughters of Atlas. Visible to nearly every human culture; the Maori used their heliacal rising to mark the new year. One sister "hides" — only six visible to the naked eye.',
    stars: [[0,0],[2,0],[1,1],[3,1],[0,2],[2,2],[4,2]],
  },
  {
    name: 'Ursa Major',
    symbol: '🐻',
    color: '#ccaaff',
    lore: 'The Great Bear — Callisto transformed by Zeus to protect her. The Big Dipper\'s pointer stars always lead to Polaris, the North Star, enabling navigation without instruments.',
    stars: [[0,0],[2,0],[4,1],[6,1],[7,3],[6,4],[4,4]],
  },
  {
    name: 'Cassiopeia',
    symbol: '♛',
    color: '#ffccaa',
    lore: 'The vain queen of Aethiopia; bound to her throne in the sky, circling forever. Her W-shape has guided sailors since antiquity across every ocean.',
    stars: [[0,2],[2,0],[4,2],[6,0],[8,2]],
  },
  {
    name: 'Scorpius',
    symbol: '🦂',
    color: '#ff8888',
    lore: 'Sent by Artemis to sting Orion — never share the sky together. The red star Antares (anti-Ares) marks the scorpion\'s heart; it could contain 700 million suns.',
    stars: [[0,0],[1,1],[2,1],[3,0],[4,1],[5,2],[5,4],[4,5],[5,6]],
  },
  {
    name: 'Andromeda',
    symbol: '⛓',
    color: '#88ffcc',
    lore: 'Chained to a cliff as sacrifice; rescued by Perseus. The Andromeda Galaxy — visible with the naked eye — will collide with the Milky Way in 4.5 billion years.',
    stars: [[0,2],[2,2],[4,1],[6,0],[4,3],[4,5]],
  },
];

/**
 * ConstellationMode — Meditative connect-the-stars puzzle.
 * Star tiles are scattered across a dark field; player navigates to each
 * and activates them in sequence to trace the constellation shape.
 * All stars of a constellation must be activated in spatial order.
 */
export class ConstellationMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'constellation',
      name: 'Constellation — Stars & Myth',
    });
    this.tileSize = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 150;
    this._stars = [];         // { x, y, starIdx, activated, activatedAt }
    this._connections = [];   // [ [x1,y1,x2,y2, activatedAt] ]
    this._constellationIdx = 0;
    this._activationOrder = []; // indices of activated stars in order
    this._loreShowing = null;  // { text, shownAtMs }
    this._completionFlash = null;
    this._bgStars = [];       // decorative background stars
  }

  init(gameState, canvas, ctx) {
    const gridSz = gameState.gridSize || 12;
    const HUD_H = 40;
    const gridPixels = Math.min(canvas.width, canvas.height - HUD_H);
    this.tileSize = Math.floor(gridPixels / gridSz);
    this._xOff = Math.floor((canvas.width - this.tileSize * gridSz) / 2);
    this._yOff = Math.floor(((canvas.height - HUD_H) - this.tileSize * gridSz) / 2);
    gameState.player = gameState.player || { x: 0, y: 0, hp: 100, maxHp: 100, symbol: '◈', color: '#00e5ff' };
    gameState.score = gameState.score || 0;
    gameState.peaceCollected = 0;
    gameState.peaceTotal = CONSTELLATIONS.length;
    this._constellationIdx = 0;
    this._bgStars = this._generateBgStars(gameState);
    this._loadConstellation(gameState);
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

  _generateBgStars(gameState) {
    const sz = gameState.gridSize || 12;
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * sz,
        y: Math.random() * sz,
        brightness: 0.1 + Math.random() * 0.25,
        twinkle: Math.random() * Math.PI * 2,
        size: 0.5 + Math.random() * 1.2,
      });
    }
    return stars;
  }

  _loadConstellation(gameState) {
    const sz = gameState.gridSize || 12;
    const c = CONSTELLATIONS[this._constellationIdx % CONSTELLATIONS.length];
    this._stars = [];
    this._connections = [];
    this._activationOrder = [];
    this._loreShowing = null;

    // Place constellation stars, fitting within grid bounds
    const starCoords = c.stars;
    const maxX = Math.max(...starCoords.map(s => s[0]));
    const maxY = Math.max(...starCoords.map(s => s[1]));
    const scaleX = Math.min(1, (sz - 3) / (maxX || 1));
    const scaleY = Math.min(1, (sz - 3) / (maxY || 1));
    const scale = Math.min(scaleX, scaleY);
    const offsetX = Math.floor((sz - maxX * scale) / 2);
    const offsetY = Math.floor((sz - maxY * scale) / 2);

    for (let i = 0; i < starCoords.length; i++) {
      const gx = Math.round(starCoords[i][0] * scale) + offsetX;
      const gy = Math.round(starCoords[i][1] * scale) + offsetY;
      this._stars.push({
        x: Math.max(1, Math.min(sz - 2, gx)),
        y: Math.max(1, Math.min(sz - 2, gy)),
        starIdx: i,
        activated: false,
        activatedAt: 0,
      });
    }
    // Place player at a nearby starting spot
    gameState.player.x = Math.max(0, this._stars[0].x - 1);
    gameState.player.y = Math.max(0, this._stars[0].y - 1);
    gameState.peaceCollected = this._constellationIdx;
  }

  update(gameState, deltaTime) {
    // Nothing time-sensitive besides flash cleanup
  }

  handleInput(gameState, input) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;
    if (this._loreShowing) {
      // Any key dismisses lore and advances
      const dir = input.getDirectionalInput();
      if (dir.x !== 0 || dir.y !== 0 || input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
        this._loreShowing = null;
        this._advanceConstellation(gameState);
        this.lastMoveTime = now;
      }
      return;
    }

    const dir = input.getDirectionalInput();
    if (dir.x === 0 && dir.y === 0) return;
    const sz = gameState.gridSize || 12;
    gameState.player.x = Math.max(0, Math.min(sz - 1, gameState.player.x + dir.x));
    gameState.player.y = Math.max(0, Math.min(sz - 1, gameState.player.y + dir.y));
    this.lastMoveTime = now;
    this._checkStarActivation(gameState);
  }

  _checkStarActivation(gameState) {
    const { x, y } = gameState.player;
    const star = this._stars.find(s => !s.activated && s.x === x && s.y === y);
    if (!star) return;

    star.activated = true;
    star.activatedAt = Date.now();
    this._activationOrder.push(star.starIdx);

    // Draw connection to previous star
    if (this._activationOrder.length >= 2) {
      const prev = this._stars.find(s => s.starIdx === this._activationOrder[this._activationOrder.length - 2]);
      if (prev) {
        this._connections.push({
          x1: prev.x, y1: prev.y,
          x2: star.x, y2: star.y,
          at: Date.now(),
          color: CONSTELLATIONS[this._constellationIdx % CONSTELLATIONS.length].color,
        });
      }
    }

    const pts = 50 * (this._activationOrder.length) * (gameState.level || 1);
    gameState.score = (gameState.score || 0) + pts;
    try { window.AudioManager?.play('insight'); } catch(e) {}

    // All stars activated → constellation complete
    if (this._activationOrder.length >= this._stars.length) {
      const c = CONSTELLATIONS[this._constellationIdx % CONSTELLATIONS.length];
      const bonus = 500 * (gameState.level || 1);
      gameState.score = (gameState.score || 0) + bonus;
      this._completionFlash = { c, at: Date.now() };
      this._loreShowing = { text: c.lore, name: c.name, color: c.color, symbol: c.symbol, shownAtMs: Date.now() };
      try { window.AudioManager?.play('level_complete'); } catch(e) {}
    }
  }

  _advanceConstellation(gameState) {
    this._constellationIdx++;
    if (this._constellationIdx >= CONSTELLATIONS.length) {
      this._constellationIdx = 0;
      gameState.level = (gameState.level || 1) + 1;
    }
    this._loadConstellation(gameState);
    this._bgStars = this._generateBgStars(gameState);
    gameState.peaceCollected = this._constellationIdx;
  }

  render(gameState, ctx) {
    const sz = gameState.gridSize || 12;
    const ts = this.tileSize;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const now = Date.now();
    const c = CONSTELLATIONS[this._constellationIdx % CONSTELLATIONS.length];

    // Night sky background
    ctx.fillStyle = '#03050f';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this._xOff || 0, this._yOff || 0);

    // Background stars (twinkle)
    for (const bs of this._bgStars) {
      const twinkle = bs.brightness + 0.06 * Math.sin(now / 800 + bs.twinkle);
      ctx.save();
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bs.x * ts, bs.y * ts, bs.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Drawn connections (lines between activated stars)
    for (const conn of this._connections) {
      const age = now - conn.at;
      const fade = Math.min(1, age / 400);
      ctx.save();
      ctx.globalAlpha = fade * 0.7;
      ctx.strokeStyle = conn.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = conn.color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(conn.x1 * ts + ts / 2, conn.y1 * ts + ts / 2);
      ctx.lineTo(conn.x2 * ts + ts / 2, conn.y2 * ts + ts / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Star tiles
    for (let i = 0; i < this._stars.length; i++) {
      const star = this._stars[i];
      const px = star.x * ts + ts / 2;
      const py = star.y * ts + ts / 2;
      const pulse = 0.6 + 0.4 * Math.sin(now / 900 + i * 1.3);
      ctx.save();
      if (star.activated) {
        const age = now - star.activatedAt;
        const glow = Math.max(0.5, 1 - age / 5000);
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 16 * glow;
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.6 + glow * 0.4;
        ctx.font = `bold ${Math.floor(ts * 0.7)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', px, py);
        // Activation ring
        ctx.globalAlpha = glow * 0.4;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, ts * 0.38 + glow * 4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.35 + pulse * 0.3;
        ctx.fillStyle = '#aabbff';
        ctx.shadowColor = '#aabbff';
        ctx.shadowBlur = 4;
        ctx.font = `${Math.floor(ts * 0.55)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', px, py);
        // Sequence number hint
        ctx.globalAlpha = pulse * 0.4;
        ctx.fillStyle = '#445566';
        ctx.font = `${Math.floor(ts * 0.25)}px monospace`;
        ctx.fillText(String(i + 1), px + ts * 0.28, py - ts * 0.28);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.font = `bold ${Math.floor(ts * 0.65)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', gameState.player.x * ts + ts / 2, gameState.player.y * ts + ts / 2);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();

    // Constellation name and progress (top)
    ctx.save();
    ctx.fillStyle = c.color;
    ctx.font = `bold ${Math.floor(w / 26)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = c.color;
    ctx.shadowBlur = 6;
    ctx.fillText(`${c.symbol} ${c.name}`, w / 2, 6);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#445566';
    ctx.font = `${Math.floor(w / 38)}px monospace`;
    ctx.fillText(`Stars: ${this._activationOrder.length}/${this._stars.length}  ·  Score: ${gameState.score || 0}  ·  Lv.${gameState.level || 1}`, w / 2, 6 + Math.floor(w / 21));
    ctx.restore();

    // Lore overlay
    if (this._loreShowing) {
      const age = now - this._loreShowing.shownAtMs;
      const fade = Math.min(1, age / 400);
      ctx.save();
      ctx.globalAlpha = fade * 0.96;
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = fade;

      // Constellation name
      ctx.fillStyle = this._loreShowing.color;
      ctx.font = `bold ${Math.floor(w / 14)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = this._loreShowing.color;
      ctx.shadowBlur = 22;
      ctx.fillText(`${this._loreShowing.symbol} ${this._loreShowing.name}`, w / 2, h * 0.24);
      ctx.shadowBlur = 0;

      // Lore text (word-wrapped)
      ctx.fillStyle = '#aabbcc';
      ctx.font = `${Math.floor(w / 32)}px monospace`;
      const words = this._loreShowing.text.split(' ');
      const lineW = Math.floor(w * 0.80);
      let line = '';
      let lineY = h * 0.40;
      const lineH = Math.floor(w / 27);
      for (const word of words) {
        const test = line + word + ' ';
        const meas = ctx.measureText(test).width;
        if (meas > lineW && line) {
          ctx.fillText(line.trim(), w / 2, lineY);
          lineY += lineH;
          line = word + ' ';
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line.trim(), w / 2, lineY);

      // Continue prompt
      if (age > 1000) {
        const promptFade = Math.min(1, (age - 1000) / 400) * (0.5 + 0.5 * Math.sin(now / 500));
        ctx.globalAlpha = fade * promptFade;
        ctx.fillStyle = '#445566';
        ctx.font = `${Math.floor(w / 36)}px monospace`;
        ctx.fillText('Move or SPACE to continue', w / 2, h * 0.82);
      }
      ctx.restore();
    }

    // Completion flash overlay
    if (this._completionFlash && !this._loreShowing) {
      const age = now - this._completionFlash.at;
      if (age < 1500) {
        const fade = age < 500 ? age / 500 : (1500 - age) / 1000;
        ctx.save();
        ctx.globalAlpha = fade * 0.7;
        ctx.fillStyle = c.color;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }
  }
}
