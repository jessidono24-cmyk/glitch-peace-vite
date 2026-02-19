// GLITCH·PEACE BASE LAYER v1.0 - Phase 2A Integration + Phase 1 Modular Architecture
// Emotional + Temporal Systems fully wired to gameplay
// MenuSystem + core consciousness engine
// Phase 1: Modular gameplay mode system

// Core imports
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

// PHASE 1: New modular architecture imports
import GameStateManager from './core/game-engine/GameStateManager.js';
import InputManager from './core/game-engine/InputManager.js';
import { modeRegistry } from './gameplay-modes/ModeRegistry.js';
import './gameplay-modes/grid-based/index.js'; // Auto-registers GridGameMode
import './gameplay-modes/shooter/index.js'; // Auto-registers ShooterMode (Phase 2)

// PHASE 1: Initialize new architecture
let gameStateManager = null;
let inputManager = null;
let currentMode = null;

// Game state (legacy - will be gradually migrated to GameStateManager)
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
    <canvas id="canvas" width="600" height="600"></canvas>
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
  
  // PHASE 1: Initialize new architecture components
  gameStateManager = new GameStateManager({
    settings: game.settings
  });
  gameStateManager.state = game; // Link to legacy state for now
  gameStateManager.initConsciousnessSystems();
  
  inputManager = new InputManager();
  
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
        // Restore player from save
        if (save.player) {
          game.player = { ...createPlayer(), ...save.player };
        }
        currentMode = null; // force fresh mode on continue
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
    onSelectDreamscape: (dreamscapeId, playModeId) => {
      // Fresh start — reset run state
      game.currentDreamscape = dreamscapeId;
      game.playMode = playModeId || 'ARCADE';
      game.level = 1;
      game.score = 0;
      game.player = createPlayer();
      game.peaceCollected = 0;
      game.peaceTotal = 0;
      currentMode = null; // force new mode creation
      startGame();
    }
  });

  // Check for existing save
  menuSystem.setSaveState({ hasSave: hasSaveData(), meta: null });
  
  console.log('[Phase 1] Modular architecture initialized');
  console.log('[ModeRegistry] Available modes:', modeRegistry.getAllModes());
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

// PHASE 2: Mode switching function
function switchGameMode() {
  const availableModes = ['grid-classic', 'shooter'];
  const currentModeId = currentMode ? (currentMode.type === 'shooter' ? 'shooter' : 'grid-classic') : 'grid-classic';
  const currentIndex = availableModes.indexOf(currentModeId);
  const nextIndex = (currentIndex + 1) % availableModes.length;
  const nextModeId = availableModes[nextIndex];
  
  console.log(`[Phase 2] Switching mode from ${currentModeId} to ${nextModeId}`);
  
  // Cleanup current mode
  if (currentMode && currentMode.cleanup) {
    currentMode.cleanup();
  }
  
  // Create new mode
  currentMode = modeRegistry.createMode(nextModeId);
  if (currentMode) {
    currentMode.init(game, canvas, ctx);
    console.log(`[Phase 2] Switched to ${currentMode.name}`);
  } else {
    console.error(`[Phase 2] Failed to create mode: ${nextModeId}`);
  }
}

function startGame() {
  game.state = 'PLAYING';
  if (game.level === 1) {
    game.player = createPlayer();
  }
  
  // PHASE 1: Create and initialize game mode
  if (!currentMode) {
    currentMode = modeRegistry.createMode('grid-classic', {
      playMode: game.playMode || 'ARCADE'
    });
    
    if (currentMode) {
      currentMode.init(game, canvas, ctx);
      console.log('[Phase 1] Game mode initialized:', currentMode.name);
    } else {
      // Fallback to legacy grid generation if mode creation fails
      console.warn('[Phase 1] Mode creation failed, using legacy grid generation');
      generateGrid(game);
    }
  } else {
    // Mode already exists, just generate new level
    if (currentMode.generateLevel) {
      currentMode.generateLevel(game);
    } else {
      generateGrid(game);
    }
  }
  
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

// Input handling (legacy - kept for menu and pause)
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
  
  // Game Over input — ESC returns to title
  if (game.state === 'GAME_OVER') {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      game.state = 'MENU';
      currentMode = null;
      menuSystem.open('title');
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
    
    // PHASE 2: Mode switching with M key (for testing)
    if (e.key === 'm' || e.key === 'M') {
      switchGameMode();
      e.preventDefault();
      return;
    }
  }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

let lastMoveTime = 0;
const MOVE_MS = 150;

// PHASE 1: Enhanced input handling using InputManager
function handleGameInput() {
  const now = Date.now();
  if (game.state !== 'PLAYING') return;
  
  // Use new InputManager if available and mode supports it
  if (inputManager && currentMode && currentMode.handleInput) {
    currentMode.handleInput(game, inputManager);
    // NOTE: clearFrameInput() is called AFTER currentMode.update() in the game loop
    // so modes using game.input.isKeyPressed() inside update() still get press events
  } else {
    // Fallback to legacy input handling
    if (now - lastMoveTime < MOVE_MS) return;
    lastMoveTime = Date.now();
    if (keys['w'] || keys['arrowup']) { movePlayer(game, 0, -1); lastMoveTime = now; }
    else if (keys['s'] || keys['arrowdown']) { movePlayer(game, 0, 1); lastMoveTime = now; }
    else if (keys['a'] || keys['arrowleft']) { movePlayer(game, -1, 0); lastMoveTime = now; }
    else if (keys['d'] || keys['arrowright']) { movePlayer(game, 1, 0); lastMoveTime = now; }
  }
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
    const hint = document.querySelector('.controls-hint');
    if (hint) hint.style.display = 'none';
    return;
  }
  
  if (game.state === 'PLAYING') {
    // PHASE 1: Use mode rendering if available
    if (currentMode && currentMode.render) {
      currentMode.render(game, ctx);
    } else {
      // Fallback to legacy rendering
      renderLegacy();
    }
    
    // Show HUD and controls hint
    document.querySelector('#hud').style.display = 'flex';
    const hint = document.querySelector('.controls-hint');
    if (hint) {
      hint.style.display = 'block';
      hint.textContent = currentMode?.type === 'shooter'
        ? 'WASD: Move · Mouse: Aim · LMB: Shoot · 1-4: Weapon · M: Grid Mode · ESC: Pause'
        : 'WASD/Arrows: Move · Collect ◈ · ESC: Pause · M: Shooter Mode';
    }
  }

  if (game.state === 'GAME_OVER') {
    // Draw game-over overlay
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff4455';
    ctx.font = 'bold 42px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff4455';
    ctx.shadowBlur = 20;
    ctx.fillText('PATTERN INCOMPLETE', canvas.width / 2, canvas.height / 2 - 30);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#b8b8d0';
    ctx.font = '18px Courier New';
    ctx.fillText(`Score: ${game.score}  ·  Level: ${game.level}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillStyle = '#667099';
    ctx.font = '13px Courier New';
    ctx.fillText('ESC to return to menu', canvas.width / 2, canvas.height / 2 + 55);
    ctx.textAlign = 'left';
    document.querySelector('#hud').style.display = 'none';
  }
}

// Legacy rendering (kept as fallback)
function renderLegacy() {
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
    
    // PHASE 1: Use mode update if available
    if (currentMode && currentMode.update) {
      game.input = inputManager; // Expose inputManager for modes that use it (e.g. ShooterMode)
      currentMode.update(game, deltaMs);
      // Clear per-frame input AFTER update so isKeyPressed() works inside update()
      if (inputManager) inputManager.clearFrameInput();
      // Sync mode-specific stats to game so HUD stays accurate
      if (currentMode.type === 'shooter' && currentMode.player) {
        game.player.hp = Math.max(0, Math.round(currentMode.player.health));
        game.player.maxHp = currentMode.player.maxHealth;
        game.score = currentMode.score;
        game.level = currentMode.waveNumber;
      }
    } else {
      // Fallback to legacy game systems
      updateEnemies(game);
      updateParticles(game);
    }
    
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
console.log('🌌 GLITCH·PEACE BASE LAYER v1.0 - Phase 1 Modular Architecture');
initUI();
requestAnimationFrame(gameLoop);
