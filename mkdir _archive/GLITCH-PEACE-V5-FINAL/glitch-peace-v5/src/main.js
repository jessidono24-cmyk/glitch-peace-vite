// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE v5 - MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

import { T, TILE_DEF, PLAYER, CELL, GAP, GRID_SIZES, DIFF_CFG, SESSION_MODES, VISION_WORDS } from './core/constants.js';
import { rnd, pick, clamp, lerp, resizeCanvas, storage, isMobile, PerformanceMonitor } from './core/utils.js';
import { EMOTIONS, EmotionalField, getEmotionalModifiers } from './core/emotional-engine.js';

// ═══════════════════════════════════════════════════════════════════════
//  CONFIGURATION & STATE
// ═══════════════════════════════════════════════════════════════════════

const CFG = {
  gridSize: 'medium',
  difficulty: 'easy',
  particles: !isMobile,
  highContrast: false,
  intensityMul: 1.0,
  stillnessMode: false,
  showSimWarning: false,
  autoSoftening: true,
  sessionMode: 'UNLIMITED',
};

let game = null;
let phase = 'title';
let prevTs = 0;
let keys = new Set();
let lastMove = 0;

const emotionalField = new EmotionalField();
const perfMonitor = new PerformanceMonitor();

// Canvas setup
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function SZ() { return GRID_SIZES[CFG.gridSize]; }
function DIFF() { return DIFF_CFG[CFG.difficulty]; }
function GP() { return SZ() * CELL + (SZ() - 1) * GAP; }
function CW() { return GP() + 48; }
function CH() { return GP() + 178; }

resizeCanvas(canvas, ctx, CW(), CH(), DPR);

// ═══════════════════════════════════════════════════════════════════════
//  SIMPLIFIED GAME STATE (v5 starter)
// ═══════════════════════════════════════════════════════════════════════

function makeGrid(sz) {
  const grid = Array.from({ length: sz }, () => new Array(sz).fill(T.VOID));
  const walls = Math.floor(sz * sz * 0.07);
  for (let i = 0; i < walls; i++) {
    const y = 1 + rnd(sz - 2), x = 1 + rnd(sz - 2);
    grid[y][x] = T.WALL;
  }
  grid[0][0] = T.VOID;
  if (sz > 1) { grid[0][1] = T.VOID; grid[1][0] = T.VOID; }
  return grid;
}

function spawnTile(grid, count, type, sz, avoid) {
  let n = 0, itr = 0;
  while (n < count && itr < 9999) {
    itr++;
    const y = rnd(sz), x = rnd(sz);
    if (grid[y][x] === T.VOID && !(avoid && y < 2 && x < 2)) {
      grid[y][x] = type;
      n++;
    }
  }
}

function initGame() {
  const sz = SZ();
  const grid = makeGrid(sz);
  
  // Spawn tiles
  spawnTile(grid, 8, T.PEACE, sz, true);
  spawnTile(grid, 4, T.DESPAIR, sz, true);
  spawnTile(grid, 3, T.TERROR, sz, true);
  spawnTile(grid, 2, T.INSIGHT, sz, true);
  
  return {
    grid,
    sz,
    level: 1,
    player: { y: 0, x: 0 },
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    insightTokens: 0,
    peaceLeft: 8,
    msg: null,
    msgColor: '#fff',
    msgTimer: 0,
    particles: [],
    shakeFrames: 0,
  };
}

function startGame() {
  game = initGame();
  emotionalField.reset();
  phase = 'playing';
  lastMove = 0;
  document.getElementById('loading').classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════════════════
//  PLAYER MOVEMENT
// ═══════════════════════════════════════════════════════════════════════

function tryMove(dy, dx) {
  if (!game) return false;
  const g = game, sz = g.sz;
  const ny = g.player.y + dy, nx = g.player.x + dx;
  
  if (ny < 0 || ny >= sz || nx < 0 || nx >= sz) return false;
  
  const tileType = g.grid[ny][nx];
  if (tileType === T.WALL) return false;
  
  g.player.y = ny;
  g.player.x = nx;
  
  // Tile effects
  const td = TILE_DEF[tileType];
  
  if (tileType === T.PEACE) {
    g.hp = Math.min(g.maxHp, g.hp + 20);
    g.score += 150;
    g.grid[ny][nx] = T.VOID;
    g.peaceLeft--;
    emotionalField.add('joy', 2);
    emotionalField.add('hope', 1);
    showMsg('+PEACE +150', '#00ff88', 40);
    
    if (g.peaceLeft === 0) {
      showMsg('LEVEL COMPLETE!', '#ffdd00', 100);
      setTimeout(() => {
        g.level++;
        game = initGame();
        game.level = g.level;
        game.score = g.score;
      }, 2000);
    }
  } else if (tileType === T.INSIGHT) {
    g.insightTokens++;
    g.score += 300;
    g.grid[ny][nx] = T.VOID;
    emotionalField.add('curiosity', 2);
    showMsg('INSIGHT ◆×' + g.insightTokens, '#00eeff', 60);
  } else if (td && td.d > 0) {
    const dmg = Math.round(td.d * DIFF().dmgMul);
    g.hp = Math.max(0, g.hp - dmg);
    g.shakeFrames = 5;
    emotionalField.add('fear', 1);
    if (tileType === T.DESPAIR) emotionalField.add('despair', 1);
    showMsg(`-${dmg} HP`, '#ff4444', 40);
    
    if (g.hp <= 0) {
      phase = 'dead';
    }
  }
  
  return true;
}

function showMsg(text, color, timer) {
  if (!game) return;
  game.msg = text;
  game.msgColor = color;
  game.msgTimer = timer;
}

// ═══════════════════════════════════════════════════════════════════════
//  RENDERING
// ═══════════════════════════════════════════════════════════════════════

function draw(ts) {
  if (!game) return;
  
  const w = CW(), h = CH();
  const sz = game.sz, gp = GP();
  
  ctx.clearRect(0, 0, w, h);
  
  // Background
  const distortion = emotionalField.calcDistortion();
  const bgBase = distortion > 0.5 ? '#0a0208' : '#02020a';
  ctx.fillStyle = bgBase;
  ctx.fillRect(0, 0, w, h);
  
  // Scanlines
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, y, w, 1);
  }
  
  // Shake
  let ox = 0, oy = 0;
  if (game.shakeFrames > 0) {
    ox = (Math.random() - 0.5) * 8;
    oy = (Math.random() - 0.5) * 8;
    game.shakeFrames--;
  }
  
  const sx = (w - gp) / 2 + ox;
  const sy = 110 + oy;
  
  // Grid
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const tileType = game.grid[y][x];
      const td = TILE_DEF[tileType] || TILE_DEF[T.VOID];
      const px = sx + x * (CELL + GAP);
      const py = sy + y * (CELL + GAP);
      
      // Glow
      if (td.g) {
        ctx.shadowColor = td.g;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
      
      // Tile background
      ctx.fillStyle = td.bg;
      ctx.beginPath();
      ctx.roundRect(px, py, CELL, CELL, 4);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = td.bd;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1, 4);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Symbol
      if (td.sy) {
        ctx.fillStyle = td.bd;
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.6;
        ctx.fillText(td.sy, px + CELL / 2, py + CELL / 2 + 5);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
    }
  }
  
  // Player (WHITE CORE / CYAN OUTLINE)
  {
    const px = sx + game.player.x * (CELL + GAP);
    const py = sy + game.player.y * (CELL + GAP);
    const pulse = 0.55 + 0.45 * Math.sin(ts * 0.009);
    
    ctx.shadowColor = PLAYER.GLOW;
    ctx.shadowBlur = 22 * pulse;
    
    // White core
    ctx.fillStyle = PLAYER.CORE;
    ctx.beginPath();
    ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Cyan outline
    ctx.strokeStyle = PLAYER.OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
  
  // HUD
  const hudH = 102;
  ctx.fillStyle = '#070714';
  ctx.fillRect(0, 0, w, hudH);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hudH);
  ctx.lineTo(w, hudH);
  ctx.stroke();
  
  // HP bar
  ctx.fillStyle = '#333';
  ctx.font = '9px Courier New';
  ctx.fillText('HP', 14, 32);
  
  const hpBarW = 138;
  ctx.fillStyle = '#0e0e1e';
  ctx.fillRect(32, 22, hpBarW, 13);
  
  const hpPct = game.hp / game.maxHp;
  const hpColor = hpPct > 0.6 ? '#00ff88' : hpPct > 0.3 ? '#ffaa00' : '#ff3333';
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 5;
  ctx.fillRect(32, 22, hpBarW * hpPct, 13);
  ctx.shadowBlur = 0;
  
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.strokeRect(32, 22, hpBarW, 13);
  
  ctx.fillStyle = '#444';
  ctx.font = '8px Courier New';
  ctx.fillText(game.hp + '/' + game.maxHp, 32 + hpBarW + 4, 32);
  
  // Score
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 19px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(String(game.score).padStart(7, '0'), w / 2, 40);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#222838';
  ctx.font = '8px Courier New';
  ctx.fillText('SCORE', w / 2, 52);
  
  // Insight tokens
  ctx.fillStyle = '#00eeff';
  ctx.shadowColor = '#00eeff';
  ctx.shadowBlur = 5;
  ctx.font = '9px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText('◆×' + game.insightTokens, 14, 60);
  ctx.shadowBlur = 0;
  
  // Level
  ctx.fillStyle = '#445566';
  ctx.font = '10px Courier New';
  ctx.textAlign = 'right';
  ctx.fillText('LVL ' + game.level, w - 12, 32);
  
  // Peace remaining
  ctx.fillStyle = '#005533';
  ctx.fillText('◈×' + game.peaceLeft, w - 12, 46);
  
  // Distortion indicator
  ctx.fillStyle = '#443344';
  ctx.font = '7px Courier New';
  ctx.fillText('DST:' + Math.round(distortion * 100) + '%', w - 12, 60);
  
  ctx.textAlign = 'left';
  
  // Message
  if (game.msg && game.msgTimer > 0) {
    ctx.globalAlpha = Math.min(1, game.msgTimer / 18);
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = game.msgColor;
    ctx.shadowColor = game.msgColor;
    ctx.shadowBlur = 16;
    ctx.fillText(game.msg, w / 2, sy - 16);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    game.msgTimer--;
  }
  
  // Footer
  ctx.fillStyle = '#070714';
  ctx.fillRect(0, h - 28, w, 28);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.beginPath();
  ctx.moveTo(0, h - 28);
  ctx.lineTo(w, h - 28);
  ctx.stroke();
  
  ctx.fillStyle = '#1a1a2a';
  ctx.font = '8px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('WASD/ARROWS=Move · ESC=Menu · H=Help', w / 2, h - 11);
  ctx.textAlign = 'left';
}

function drawTitle() {
  const w = CW(), h = CH();
  
  ctx.fillStyle = '#02020a';
  ctx.fillRect(0, 0, w, h);
  
  ctx.textAlign = 'center';
  
  ctx.fillStyle = '#0a0a20';
  ctx.font = '8px Courier New';
  ctx.fillText('A CONSCIOUSNESS SIMULATION', w / 2, h / 2 - 140);
  
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 32;
  ctx.font = 'bold 36px Courier New';
  ctx.fillText('GLITCH·PEACE', w / 2, h / 2 - 100);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#0a1a0a';
  ctx.font = '9px Courier New';
  ctx.fillText('v5 · pattern recognition engine', w / 2, h / 2 - 78);
  
  // Start prompt
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
  ctx.fillStyle = `rgba(0,255,136,${0.3 + pulse * 0.4})`;
  ctx.fillRect(w / 2 - 110, h / 2 - 10, 220, 30);
  ctx.strokeStyle = `rgba(0,255,136,${0.5 + pulse * 0.3})`;
  ctx.strokeRect(w / 2 - 110, h / 2 - 10, 220, 30);
  
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 14px Courier New';
  ctx.fillText('▶ PRESS ENTER TO START', w / 2, h / 2 + 8);
  
  ctx.fillStyle = '#131328';
  ctx.font = '8px Courier New';
  ctx.fillText('or click/tap anywhere', w / 2, h / 2 + 40);
  
  ctx.textAlign = 'left';
}

function drawDead() {
  const w = CW(), h = CH();
  
  ctx.fillStyle = 'rgba(8,0,0,0.97)';
  ctx.fillRect(0, 0, w, h);
  
  ctx.textAlign = 'center';
  
  ctx.fillStyle = '#330000';
  ctx.font = '9px Courier New';
  ctx.fillText('CONSCIOUSNESS DISSOLVED', w / 2, h / 2 - 130);
  
  ctx.fillStyle = '#ff2222';
  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 30;
  ctx.font = 'bold 38px Courier New';
  ctx.fillText('ERASED', w / 2, h / 2 - 86);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 24px Courier New';
  ctx.fillText(String(game.score).padStart(7, '0'), w / 2, h / 2 - 26);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#333';
  ctx.font = '10px Courier New';
  ctx.fillText('FINAL SCORE  ·  LEVEL ' + game.level, w / 2, h / 2 - 6);
  
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.004);
  ctx.fillStyle = `rgba(255,34,34,${0.07 * pulse})`;
  ctx.fillRect(w / 2 - 100, h / 2 + 68, 200, 32);
  ctx.strokeStyle = `rgba(255,34,34,${0.45 * pulse})`;
  ctx.strokeRect(w / 2 - 100, h / 2 + 68, 200, 32);
  
  ctx.fillStyle = '#ff2222';
  ctx.font = '12px Courier New';
  ctx.fillText('↺ ENTER TO TRY AGAIN', w / 2, h / 2 + 89);
  
  ctx.textAlign = 'left';
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

function loop(ts) {
  const dt = ts - prevTs;
  prevTs = ts;
  
  perfMonitor.update();
  
  // Auto-reduce quality if performance drops
  if (perfMonitor.shouldReduceQuality() && CFG.particles) {
    CFG.particles = false;
    console.warn('Auto-disabled particles due to low FPS');
  }
  
  if (phase === 'title') {
    drawTitle();
  } else if (phase === 'playing') {
    // Movement
    const MOVE_DELAY = 120;
    const DIRS = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0],
      ArrowLeft: [0, -1], ArrowRight: [0, 1],
      w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
      W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
    };
    
    if (ts - lastMove > MOVE_DELAY) {
      for (const [k, [dy, dx]] of Object.entries(DIRS)) {
        if (keys.has(k)) {
          tryMove(dy, dx);
          lastMove = ts;
          break;
        }
      }
    }
    
    // Emotional decay
    emotionalField.decay(0.001 * dt);
    
    draw(ts);
  } else if (phase === 'dead') {
    drawDead();
  }
  
  requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════════════════════

window.addEventListener('keydown', (e) => {
  keys.add(e.key);
  
  if (phase === 'title') {
    if (e.key === 'Enter' || e.key === ' ') {
      startGame();
    }
  } else if (phase === 'dead') {
    if (e.key === 'Enter' || e.key === ' ') {
      startGame();
    }
  } else if (phase === 'playing') {
    if (e.key === 'Escape') {
      phase = 'title';
    }
  }
  
  const prevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
  if (prevent.includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key);
});

// Mobile/touch
canvas.addEventListener('click', () => {
  if (phase === 'title') startGame();
});

// ═══════════════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════════════

console.log('GLITCH·PEACE v5 initializing...');
console.log('Emotional Field:', emotionalField);
console.log('Config:', CFG);
console.log('Mobile:', isMobile);

requestAnimationFrame(loop);
