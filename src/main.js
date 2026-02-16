// GLITCH·PEACE BASE LAYER v1.0
// Main entry point
import { TILE_TYPES, TILE_DEFS, DIFFICULTY, GRID_SIZES, COLORS } from './core/constants.js';
import { saveGame, loadGame, hasSaveData } from './core/storage.js';
import { generateGrid } from './game/grid.js';
import { createPlayer, movePlayer, takeDamage, heal } from './game/player.js';
import { createEnemy, updateEnemies } from './game/enemy.js';
import { createParticles, updateParticles } from './game/particles.js';

// Game state
const game = {
  state: 'MENU',
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
  settings: {
    gridSize: 'MEDIUM',
    difficulty: 'STILLNESS',
    highContrast: false,
    reducedMotion: false,
    particles: true
  }
};

// Initialize UI
function initUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
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
    <canvas id="canvas" width="700" height="700" style="display:none"></canvas>
    <div class="controls-hint" style="display:none">WASD/Arrows: Move | ESC: Pause | H: Help</div>
  `;
  
  const menu = document.getElementById('menu-overlay');
  menu.innerHTML = `
    <div><div class="menu-title">GLITCH·PEACE</div>
    <div class="menu-subtitle">Begin in stillness. Emerge through pattern recognition.</div>
    <div class="menu-items">
      <div class="menu-item" id="btn-start">START NEW GAME</div>
      <div class="menu-item" id="btn-continue">CONTINUE</div>
      <div class="menu-item" id="btn-help">HELP</div>
    </div></div>
  `;
  
  document.getElementById('btn-start').onclick = startNew;
  document.getElementById('btn-continue').onclick = continueGame;
  document.getElementById('btn-help').onclick = showHelp;
}

function startNew() {
  game.state = 'PLAYING';
  game.level = 1;
  game.score = 0;
  game.player = createPlayer();
  generateGrid(game);
  spawnEnemies();
  showGame();
}

function continueGame() {
  const save = loadGame();
  if (save) {
    Object.assign(game, save);
    generateGrid(game);
    spawnEnemies();
    showGame();
  } else {
    showMessage('No save found');
    startNew();
  }
}

function showGame() {
  document.getElementById('menu-overlay').classList.add('hidden');
  document.querySelector('#hud').style.display = 'flex';
  document.querySelector('#canvas').style.display = 'block';
  document.querySelector('.controls-hint').style.display = 'block';
}

function spawnEnemies() {
  const diff = DIFFICULTY[game.settings.difficulty];
  const count = Math.floor(diff.enemyCount * (1 + game.level * 0.1));
  game.enemies = [];
  // Spawn logic here (simplified)
}

function showHelp() {
  alert('GLITCH·PEACE BASE LAYER\n\nWASD/Arrows: Move\nESC: Pause\n\nCollect all ● peace nodes to advance.\n\nBegin in stillness.');
}

function showMessage(text) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 1500);
}

// Input
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape' && game.state === 'PLAYING') {
    saveGame(game);
    showMessage('Saved');
  }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function handleInput() {
  if (game.state !== 'PLAYING') return;
  if (keys['w'] || keys['arrowup']) movePlayer(game, 0, -1);
  if (keys['s'] || keys['arrowdown']) movePlayer(game, 0, 1);
  if (keys['a'] || keys['arrowleft']) movePlayer(game, -1, 0);
  if (keys['d'] || keys['arrowright']) movePlayer(game, 1, 0);
}

// Render
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');

function render() {
  if (!ctx) return;
  game.tileSize = canvas.width / game.gridSize;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid (simplified for brevity)
  for (let y = 0; y < game.gridSize; y++) {
    for (let x = 0; x < game.gridSize; x++) {
      const tile = game.grid[y][x];
      const def = TILE_DEFS[tile];
      const px = x * game.tileSize;
      const py = y * game.tileSize;
      ctx.fillStyle = def.bg;
      ctx.fillRect(px, py, game.tileSize, game.tileSize);
      if (def.symbol) {
        ctx.fillStyle = def.border;
        ctx.font = `${game.tileSize*0.6}px Courier New`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.symbol, px + game.tileSize/2, py + game.tileSize/2);
      }
    }
  }
  
  // Draw player
  ctx.fillStyle = COLORS.PLAYER;
  ctx.font = `${game.tileSize*0.7}px Courier New`;
  ctx.fillText(game.player.symbol, 
    game.player.x * game.tileSize + game.tileSize/2,
    game.player.y * game.tileSize + game.tileSize/2
  );
}

// Game loop
function gameLoop() {
  if (game.state === 'PLAYING') {
    handleInput();
    updateEnemies(game);
    updateParticles(game);
    render();
  }
  requestAnimationFrame(gameLoop);
}

// Init
console.log('🌌 GLITCH·PEACE BASE LAYER v1.0');
initUI();
gameLoop();
