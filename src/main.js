// GLITCH·PEACE BASE LAYER v1.0
// Main entry point with integrated MenuSystem
// Note: API agents available server-side via src/services/apiAgents.js
import { TILE_TYPES, TILE_DEFS, DIFFICULTY, GRID_SIZES, COLORS, DREAMSCAPES, DIFF_CFG } from './core/constants.js';
import { saveGame, loadGame, hasSaveData } from './core/storage.js';
import { generateGrid } from './game/grid.js';
import { createPlayer, movePlayer, takeDamage, heal } from './game/player.js';
import { createEnemy, updateEnemies } from './game/enemy.js';
import { createParticles, updateParticles } from './game/particles.js';
import { MenuSystem } from './ui/menus.js';

// Game state
const game = {
  state: 'MENU', // MENU | MENU_DREAMSCAPE | PLAYING | PAUSED
  level: 1,
  score: 0,
  gridSize: 14,
  tileSize: 0,
  grid: [],
  player: createPlayer(),
  enemies: [],
  peaceNodes: [],
  peaceCollected: 0,
  peaceTotal: 0,
  particles: [],
  currentDreamscape: 'RIFT', // RIFT | LODGE
  settings: {
    gridSize: 'MEDIUM',
    difficulty: 'STILLNESS',
    highContrast: false,
    reducedMotion: false,
    particles: true,
    intensityMul: 1.0
  }
};

// Initialize UI and MenuSystem
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
let menuSystem = null;

function initUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <canvas id="canvas" width="700" height="700"></canvas>
    <div id="hud" style="display:none">
      <div class="hud-section">
        <div class="hud-item">
          <span class="hud-label">Health</span>
          <div id="hp-bar"><div id="hp-fill" style="width:100%"></div><div id="hp-text">100/100</div></div>
        </div>
      </div>
      <div class="hud-section">
        <div class="hud-item"><span class="hud-label">Level</span><span class="hud-value" id="level">1</span></div>
        <div class="hud-item"><span class="hud-label">Score</span><span class="hud-value" id="score">0</span></div>
        <div class="hud-item"><span class="hud-label">Objective</span><span class="hud-value" id="objective">○○○</span></div>
      </div>
    </div>
    <div class="controls-hint" style="display:none">WASD/Arrows: Move | ESC: Pause | H: Help</div>
  `;
  
  // Re-get canvas reference after creating it
  const newCanvas = document.getElementById('canvas');
  const newCtx = newCanvas?.getContext('2d');
  
  // Initialize MenuSystem with callbacks
  menuSystem = new MenuSystem({
    CFG: game.settings,
    onStartNew: () => {
      game.state = 'MENU_DREAMSCAPE';
      menuSystem.open('dreamscape');
    },
    onContinue: () => {
      const save = loadGame();
      if (save) {
        Object.assign(game, save);
        startGame();
      } else {
        game.state = 'MENU_DREAMSCAPE';
        menuSystem.open('dreamscape');
      }
    },
    onQuitToTitle: ({ to }) => {
      if (to === 'playing') {
        game.state = 'PLAYING';
        menuSystem.open('title');
      } else {
        game.state = 'MENU';
        menuSystem.open('title');
      }
    },
    onRestart: () => {
      game.level = 1;
      game.score = 0;
      game.player = createPlayer();
      startGame();
    },
    onSelectDreamscape: (dreamscapeId) => {
      game.currentDreamscape = dreamscapeId;
      startGame();
    }
  });

  // Check for existing save
  menuSystem.setSaveState({ hasSave: hasSaveData(), meta: null });
}

function startGame() {
  game.state = 'PLAYING';
  if (game.level === 1) {
    game.player = createPlayer();
  }
  generateGrid(game);
  spawnEnemies();
  updateHUD();
}

function spawnEnemies() {
  const diff = DIFFICULTY[game.settings.difficulty];
  const count = Math.floor(diff.enemyCount * (1 + game.level * 0.1));
  game.enemies = [];
  for (let i = 0; i < count; i++) {
    const enemy = createEnemy();
    // Position randomly (simplified)
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * game.gridSize);
      const y = Math.floor(Math.random() * game.gridSize);
      if (game.grid[y] && game.grid[y][x] === TILE_TYPES.VOID) {
        enemy.x = x;
        enemy.y = y;
        placed = true;
      }
    }
    game.enemies.push(enemy);
  }
}

function updateHUD() {
  const hp = document.getElementById('hp-text');
  const hpFill = document.getElementById('hp-fill');
  const level = document.getElementById('level');
  const score = document.getElementById('score');
  
  if (hp) hp.textContent = `${game.player.hp}/${game.player.maxHp || 100}`;
  if (hpFill) hpFill.style.width = `${(game.player.hp / (game.player.maxHp || 100)) * 100}%`;
  if (level) level.textContent = String(game.level);
  if (score) score.textContent = String(game.score);
}

// Input handling
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  
  // Menu input
  if (menuSystem && (game.state === 'MENU' || game.state === 'MENU_DREAMSCAPE' || game.state === 'PAUSED')) {
    const result = menuSystem.handleKey(e);
    if (result.consumed) {
      e.preventDefault();
      return;
    }
  }
  
  // Game input
  if (game.state === 'PLAYING') {
    if (e.key === 'Escape') {
      game.state = 'PAUSED';
      menuSystem.open('pause');
      saveGame(game);
      e.preventDefault();
      return;
    }
  }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function handleGameInput() {
  if (game.state !== 'PLAYING') return;
  if (keys['w'] || keys['arrowup']) movePlayer(game, 0, -1);
  if (keys['s'] || keys['arrowdown']) movePlayer(game, 0, 1);
  if (keys['a'] || keys['arrowleft']) movePlayer(game, -1, 0);
  if (keys['d'] || keys['arrowright']) movePlayer(game, 1, 0);
}

// Render
function render(deltaMs = 16) {
  if (!ctx || !canvas) return;
  
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (game.state === 'MENU' || game.state === 'MENU_DREAMSCAPE' || game.state === 'PAUSED') {
    // Draw menu
    if (menuSystem) {
      menuSystem.draw(ctx, canvas.width, canvas.height, deltaMs);
    }
    document.querySelector('#hud').style.display = 'none';
    return;
  }
  
  if (game.state === 'PLAYING') {
    // Draw game
    game.tileSize = canvas.width / game.gridSize;
    
    // Draw grid
    for (let y = 0; y < game.gridSize; y++) {
      for (let x = 0; x < game.gridSize; x++) {
        const tile = game.grid[y][x];
        const def = TILE_DEFS[tile];
        const px = x * game.tileSize;
        const py = y * game.tileSize;
        
        ctx.fillStyle = def.bg;
        ctx.fillRect(px, py, game.tileSize, game.tileSize);
        
        // Draw border
        ctx.strokeStyle = def.border || 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, game.tileSize, game.tileSize);
        
        // Draw symbol
        if (def.symbol) {
          ctx.fillStyle = def.glow || def.border || '#fff';
          ctx.font = `${game.tileSize * 0.6}px Courier New`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.symbol, px + game.tileSize / 2, py + game.tileSize / 2);
        }
      }
    }
    
    // Draw player
    const px = game.player.x * game.tileSize;
    const py = game.player.y * game.tileSize;
    ctx.fillStyle = COLORS.PLAYER;
    ctx.font = `${game.tileSize * 0.7}px Courier New`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', px + game.tileSize / 2, py + game.tileSize / 2);
    
    // Draw enemies (simplified)
    for (const enemy of game.enemies) {
      const ex = enemy.x * game.tileSize;
      const ey = enemy.y * game.tileSize;
      ctx.fillStyle = COLORS.ENEMY;
      ctx.font = `${game.tileSize * 0.6}px Courier New`;
      ctx.fillText('■', ex + game.tileSize / 2, ey + game.tileSize / 2);
    }
    
    // Show HUD
    document.querySelector('#hud').style.display = 'flex';
  }
}

// Game loop
let lastTime = 0;
function gameLoop(currentTime) {
  const deltaMs = currentTime - lastTime;
  lastTime = currentTime;
  
  if (game.state === 'PLAYING') {
    handleGameInput();
    updateEnemies(game);
    updateParticles(game);
    updateHUD();
  }
  
  render(Math.min(deltaMs, 32)); // Cap delta at 32ms
  requestAnimationFrame(gameLoop);
}

// Init
console.log('🌌 GLITCH·PEACE BASE LAYER v1.0');
initUI();
gameLoop();
