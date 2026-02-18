// GLITCH·PEACE BASE LAYER v1.0 - Phase 2A Integration
// Emotional + Temporal Systems fully wired to gameplay
// MenuSystem + core consciousness engine
import { T, TILE_DEF, DIFF_CFG, GRID_SIZES, BIOMES, SYNERGY_MESSAGES, EXIT_MESSAGES } from './core/constants.js';
import { saveGame, loadGame, hasSaveData } from './core/storage.js';
import { generateGrid } from './game/grid.js';
import { createPlayer, movePlayer, takeDamage, heal } from './game/player.js';
import { createEnemy, updateEnemies } from './game/enemy.js';
import { createParticles, updateParticles } from './game/particles.js';
import { MenuSystem } from './ui/menus.js';
import { EmotionalField, getEmotionalModifiers } from './core/emotional-engine.js';
import { TemporalSystem } from './core/temporal-system.js';
import { updateHUD } from './ui/hud.js';
import AudioManager from './systems/audio.js';

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
  
  // PHASE 2A: Consciousness engine systems
  emotionalField: new EmotionalField(),
  temporalSystem: null,
  lastEmotionUpdate: Date.now(),
  emotionDecayRate: 0.05, // per tick
  
  settings: {
    gridSize: 'medium',
    difficulty: 'normal',
    highContrast: false,
    reducedMotion: false,
    particles: true,
    intensityMul: 1.0,
    audio: false,
    timezone: 'AUTO'
  }
};

// Initialize UI and MenuSystem
let canvas = null;
let ctx = null;
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
  
  // Re-get canvas reference after creating it and expose globally
  canvas = document.getElementById('canvas');
  ctx = canvas?.getContext('2d');
  
  // Initialize MenuSystem with callbacks
  menuSystem = new MenuSystem({
    CFG: game.settings,
    getSettings: () => game.settings,
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

// Attach game to window for cross-module access (menu -> temporalSystem)
try { if (typeof window !== 'undefined') window.GlitchPeaceGame = game; } catch (e) {}

// Attach audio manager and initialize with settings
try {
  if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
    AudioManager.settings = game.settings || {};
    AudioManager.settings.reducedMotion = game.settings.reducedMotion;
    AudioManager.setEnabled(!!game.settings.audio);
  }
} catch (e) {}

// Instantiate TemporalSystem now that settings exist
game.temporalSystem = new TemporalSystem(game.settings.timezone);

function startGame() {
  game.state = 'PLAYING';
  if (game.level === 1) {
    game.player = createPlayer();
  }
  generateGrid(game);
  spawnEnemies();
  updateHUD(game);
}

function spawnEnemies() {
  const cfg = DIFF_CFG[game.settings.difficulty] || { enemyCount: 0 };
  const count = Math.floor((cfg.enemyCount || 0) * (1 + game.level * 0.1));
  game.enemies = [];
  for (let i = 0; i < count; i++) {
    const enemy = createEnemy();
    // Position randomly (simplified)
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * game.gridSize);
      const y = Math.floor(Math.random() * game.gridSize);
      if (game.grid[y] && game.grid[y][x] === T.VOID) {
        enemy.x = x;
        enemy.y = y;
        placed = true;
      }
    }
    game.enemies.push(enemy);
  }
}

// HUD rendering moved to src/ui/hud.js (updateHUD imported)

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

let lastMoveTime = 0;
const MOVE_MS = 150;
function handleGameInput() {
  const now = Date.now();
  if (now - lastMoveTime < MOVE_MS) return;
  if (game.state !== 'PLAYING') return;
  lastMoveTime = Date.now();
  if (keys['w'] || keys['arrowup']) { movePlayer(game, 0, -1); lastMoveTime = now; }
  else if (keys['s'] || keys['arrowdown']) { movePlayer(game, 0, 1); lastMoveTime = now; }
  else if (keys['a'] || keys['arrowleft']) { movePlayer(game, -1, 0); lastMoveTime = now; }
  else if (keys['d'] || keys['arrowright']) { movePlayer(game, 1, 0); lastMoveTime = now; }
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
        const def = TILE_DEF[tile];
        const px = x * game.tileSize;
        const py = y * game.tileSize;
        
        ctx.fillStyle = def.bg;
        ctx.fillRect(px, py, game.tileSize, game.tileSize);
        
        // Draw border
        ctx.strokeStyle = def.bd || 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, game.tileSize, game.tileSize);
        
        // Draw symbol
        if (def.sy) {
          ctx.fillStyle = def.g || def.bd || '#fff';
          ctx.font = `${game.tileSize * 0.6}px Courier New`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.sy, px + game.tileSize / 2, py + game.tileSize / 2);
        }
      }
    }
    
    // Draw player (CYAN glow + WHITE core - fixed anchor)
    const px = game.player.x * game.tileSize;
    const py = game.player.y * game.tileSize;
    ctx.fillStyle = '#00e5ff'; // Cyan glow
    ctx.globalAlpha = 0.3;
    ctx.fillRect(px, py, game.tileSize, game.tileSize);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff'; // White core
    ctx.font = `${game.tileSize * 0.7}px Courier New`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◈', px + game.tileSize / 2, py + game.tileSize / 2);
    
    // Draw enemies
    for (const enemy of game.enemies) {
      const ex = enemy.x * game.tileSize;
      const ey = enemy.y * game.tileSize;
      ctx.fillStyle = '#ff6600'; // Enemy orange
      ctx.font = `${game.tileSize * 0.6}px Courier New`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('■', ex + game.tileSize / 2, ey + game.tileSize / 2);
    }

    // Draw particles (enhanced system)
    if (game.particles && game.particles.length) {
      for (const p of game.particles) {
        const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife || 20)));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color || '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r || 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
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
    
    // PHASE 2A: Update consciousness engine systems
    updateConsciousnessEngine(deltaMs);
    
    // Game systems
    updateEnemies(game);
    updateParticles(game);
    updateHUD(game);
  }
  
  render(Math.min(deltaMs, 32)); // Cap delta at 32ms
  requestAnimationFrame(gameLoop);
}

// PHASE 2A: Consciousness engine update loop
function updateConsciousnessEngine(deltaMs) {
  // Decay emotional field over time
  game.emotionalField.decay(game.emotionDecayRate * (deltaMs / 16));
  
  // Check and update synergies
  const synergy = game.emotionalField.updateSynergy(deltaMs);
  if (synergy && game.emotionDecayRate > 0) {
    console.log(`🌟 ${synergy.message}`);
    // TODO: Apply synergy effect to gameplay (Phase 2B)
  }
  
  // Get current emotional and temporal modifiers
  const emotionalMods = getEmotionalModifiers(game.emotionalField);
  const temporalMods = game.temporalSystem.getModifiers();
  
  // Apply modifiers to game globals (will affect all systems)
  game.currentEmotionalMods = emotionalMods;
  game.currentTemporalMods = temporalMods;
  
  // Visual feedback: world gets darker/more distorted with high distortion
  const distortion = game.emotionalField.calcDistortion();
  game.worldDistortion = distortion;
}

// Init
console.log('🌌 GLITCH·PEACE BASE LAYER v1.0');
initUI();
requestAnimationFrame(gameLoop);






