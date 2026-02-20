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
import { renderStatsDashboard } from './ui/stats-dashboard.js';
import { logicPuzzles }        from './intelligence/logic-puzzles.js';
import { emotionRecognition }  from './intelligence/emotion-recognition.js';
import { empathyTraining }     from './intelligence/empathy-training.js';
import { strategicThinking }   from './intelligence/strategic-thinking.js';
import { addScore, getTopScores } from './systems/leaderboard.js';
import { AmbientMusicEngine } from './systems/ambient-music.js';
import { recordSession, getAnalyticsSummary } from './systems/session-analytics.js';
import {
  checkImpulseBuffer, cancelImpulseBuffer, recordEchoPosition,
  checkThresholdMonitor, updateSessionManager, applyRelapseCompassion,
  checkRealityCheck, renderRecoveryOverlays,
} from './systems/recovery-tools.js';
import {
  recordDreamSign, gainLucidity, loseLucidity,
  triggerBodyScan, onGamePaused, onGameResumed,
  renderDreamYogaOverlays,
} from './systems/dream-yoga.js';

// Expose intelligence singletons for stats dashboard (avoids circular imports)
try {
  if (typeof window !== 'undefined') {
    window.__glitchPeaceIntelligence = {
      get iq()       { return logicPuzzles.iqScore; },
      get eq()       { return emotionRecognition.eqScore; },
      get empathy()  { return empathyTraining.empathyScore; },
      get strategy() { return strategicThinking.strategicScore; },
    };
  }
} catch (_) {}

// PHASE 1: New modular architecture imports
import GameStateManager from './core/game-engine/GameStateManager.js';
import InputManager from './core/game-engine/InputManager.js';
import { modeRegistry } from './gameplay-modes/ModeRegistry.js';
import './gameplay-modes/grid-based/index.js';    // Auto-registers GridGameMode
import './gameplay-modes/shooter/index.js';        // Auto-registers ShooterMode (Phase 2)
import './gameplay-modes/rpg/index.js';            // Auto-registers RPGMode skeleton (Phase M5)
import './gameplay-modes/ornithology/index.js';    // Auto-registers OrnithologyMode
import './gameplay-modes/mycology/index.js';       // Auto-registers MycologyMode
import './gameplay-modes/architecture/index.js';   // Auto-registers ArchitectureMode
import './gameplay-modes/constellation/index.js';  // Auto-registers ConstellationMode
import './gameplay-modes/alchemy/index.js';        // Auto-registers AlchemyMode
import './gameplay-modes/rhythm/index.js';         // Auto-registers RhythmMode

// PHASE 1: Initialize new architecture
let gameStateManager = null;
let inputManager = null;
let currentMode = null;

// Ambient music engine (initialized lazily after user gesture)
const ambientMusic = new AmbientMusicEngine();

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
  _playerLastX: undefined,
  _playerLastY: undefined,
  
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
    timezone: 'AUTO',
    messagePause: true, // Pause gameplay when tip/message appears (challenge mode = OFF)
    // Recovery tools (optional global overrides — mode defaults apply when undefined)
    impulseBuffer: undefined,
    patternEcho: undefined,
    consequencePreview: undefined,
    sessionReminders: true,
  }
};

// Initialize UI and MenuSystem
let canvas = null;
let ctx = null;
let menuSystem = null;
let _lastHintText = ''; // cache to avoid redundant DOM updates every frame

function initUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="canvas-wrapper" style="position:relative;display:inline-block;overflow:hidden;">
      <canvas id="canvas" width="800" height="800"></canvas>
      <div id="sprite-layer" aria-hidden="true"></div>
    </div>
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

  // Accessibility: make canvas keyboard-focusable and describe it for screen readers
  if (canvas) {
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'GLITCH·PEACE game canvas. Use arrow keys or WASD to move. Press H for help.');
  }

  // Responsive canvas: fill full viewport while centering the game grid
  function _resizeCanvas() {
    if (!canvas) return;
    // Fill the entire viewport for a truly full-screen experience
    const availW = window.innerWidth;
    const availH = window.innerHeight;
    canvas.width = availW;
    canvas.height = availH;
    canvas.style.width  = `${availW}px`;
    canvas.style.height = `${availH}px`;
    // Notify game state of new canvas dimensions so modes can recalculate
    if (currentMode && currentMode.onResize) {
      currentMode.onResize(canvas, game);
    }
  }
  _resizeCanvas();
  window.addEventListener('resize', _resizeCanvas);
  
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
      // Record session analytics when leaving the game
      if (game.state === 'PLAYING' || game.state === 'PAUSED') {
        try { recordSession(game); } catch (_) {}
      }
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
    onResume: () => {
      game.state = 'PLAYING';
      const pauseReward = onGameResumed(game);
      if (pauseReward) {
        game._message = `⏸ Pause reward: ${pauseReward.bonus}`;
        game._messageMs = Date.now();
      }
    },
    onSelectDreamscape: (dreamscapeId, playModeId, cosmologyId = null, gameModeId = 'grid-classic') => {
      // Fresh start — reset run state
      game.currentDreamscape = dreamscapeId;
      game.playMode = playModeId || 'ARCADE';
      game.currentCosmology = cosmologyId || null;
      game.selectedGameMode = gameModeId || 'grid-classic';
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

  // Load previously saved language preferences into settings
  try {
    const savedNative = localStorage.getItem('glitchpeace.nativeLang');
    const savedTarget = localStorage.getItem('glitchpeace.targetLang');
    const savedDiff   = localStorage.getItem('glitchpeace.difficulty');
    const savedLangLevel = localStorage.getItem('glitchpeace.langLevel');
    const savedImmersion = localStorage.getItem('glitchpeace.langImmersion');
    const savedMusicVol  = localStorage.getItem('glitchpeace.musicVol');
    const savedSfxVol    = localStorage.getItem('glitchpeace.sfxVol');
    if (savedNative) game.settings.nativeLanguage = savedNative;
    if (savedTarget) game.settings.targetLanguage = savedTarget || null;
    if (savedDiff && !hasSaveData()) game.settings.difficulty = savedDiff;
    if (savedLangLevel) game.settings.langLevel = savedLangLevel;
    if (savedImmersion !== null) game.settings.langImmersion = savedImmersion === '1';
    if (savedMusicVol !== null) game.settings.musicVolume = parseFloat(savedMusicVol) || 0.5;
    if (savedSfxVol !== null) game.settings.sfxVolume = parseFloat(savedSfxVol) || 0.7;
  } catch (e) {}

  // Show first-run onboarding if this is the player's first visit
  if (MenuSystem.isFirstRun()) {
    menuSystem.open('onboarding');
  }
  
  console.log('[Phase 1] Modular architecture initialized');
  console.log('[ModeRegistry] Available modes:', modeRegistry.getAllModes());
  // Expose menuSystem on game object for test access
  game.menuSystem = menuSystem;
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

    // Initialize AudioContext and preload synthesized samples on first user interaction
    const _initAudioOnce = () => {
      try {
        if (!AudioManager.ctx) {
          AudioManager.init();
          AudioManager.loadSamples(['move', 'peace', 'damage', 'nav', 'select', 'teleport', 'ambient']);
        }
      } catch (e) {}
      // Start ambient music engine after user gesture
      try { ambientMusic.start(); } catch (_) {}
      document.removeEventListener('keydown', _initAudioOnce);
      document.removeEventListener('click', _initAudioOnce);
    };
    document.addEventListener('keydown', _initAudioOnce, { once: true });
    document.addEventListener('click', _initAudioOnce, { once: true });
  }
} catch (e) {}

// Instantiate TemporalSystem now that settings exist
game.temporalSystem = new TemporalSystem(game.settings.timezone);

// PHASE 2: Mode switching function
function switchGameMode() {
  const availableModes = ['grid-classic', 'shooter', 'rpg', 'ornithology', 'mycology', 'architecture', 'constellation', 'alchemy', 'rhythm'];
  const typeToId = {
    'grid': 'grid-classic', 'shooter': 'shooter', 'rpg': 'rpg',
    'ornithology': 'ornithology', 'mycology': 'mycology',
    'architecture': 'architecture', 'constellation': 'constellation',
    'constellation-3d': 'constellation-3d',
    'alchemy': 'alchemy', 'rhythm': 'rhythm',
  };
  const currentModeId = currentMode
    ? (typeToId[currentMode.type] || 'grid-classic')
    : 'grid-classic';
  const currentIndex = availableModes.indexOf(currentModeId);
  const nextIndex = (currentIndex + 1) % availableModes.length;
  const nextModeId = availableModes[nextIndex];
  
  // Cleanup current mode (also call dispose for 3D modes that own a second canvas)
  if (currentMode && currentMode.cleanup) {
    currentMode.cleanup();
  }
  if (currentMode && currentMode.dispose) {
    currentMode.dispose();
  }
  
  // Create new mode
  currentMode = modeRegistry.createMode(nextModeId);
  if (currentMode) {
    currentMode.init(game, canvas, ctx);
  } else {
    console.error(`[Phase 2] Failed to create mode: ${nextModeId}`);
  }
}

function startGame() {
  game.state = 'PLAYING';
  if (game.level === 1) {
    game.player = createPlayer();
    game._sessionStartMs = Date.now(); // track session start for Stats Dashboard
    game._leaderboardRank = null;      // clear stale rank from previous run
  }
  
  // PHASE 1: Create and initialize game mode
  if (!currentMode) {
    const modeId = game.selectedGameMode || 'grid-classic';
    currentMode = modeRegistry.createMode(modeId, {
      playMode: game.playMode || 'ARCADE'
    });
    
    if (currentMode) {
      currentMode.init(game, canvas, ctx);
      game._currentModeType = currentMode.type; // expose for HUD
      game._currentMode = currentMode;          // expose for tests + dev tools
      console.log('[Phase 1] Game mode initialized:', currentMode.name);
    } else {
      // Fallback to legacy grid generation if mode creation fails
      console.warn('[Phase 1] Mode creation failed, using legacy grid generation');
      game._currentModeType = 'grid';
      generateGrid(game);
    }
  } else {
    game._currentModeType = currentMode.type;
    game._currentMode = currentMode;
    // Mode already exists, just generate new level
    if (currentMode.generateLevel) {
      currentMode.generateLevel(game);
    } else {
      generateGrid(game);
    }
  }
  
  // Only use legacy spawnEnemies() when no mode is active (fallback path).
  // GridGameMode.generateLevel() handles enemy spawning internally.
  if (!currentMode) {
    spawnEnemies();
  }
  updateHUD(game);

  // Show a brief first-play tip on level 1 so new players know where to start.
  if (game.level === 1) {
    const modeTips = {
      'shooter':       'WASD: Move · Mouse: Aim · LMB: Shoot · Survive the waves · Press H for Help',
      'rpg':           'WASD: Move on the grid · Walk to ◈ Peace nodes · ↑/↓+ENTER: Dialogue · Press H for Help',
      'ornithology':   'WASD: Move through biomes · Observe birds · Answer challenges · Press H for Help',
      'mycology':      'WASD: Forage mushrooms · Identify toxic species to avoid them · Press H for Help',
      'architecture':  'WASD: Move · SPACE: Place tile · Q/E: Cycle tiles · X: Erase · Press H for Help',
      'constellation': 'WASD: Navigate to stars · Activate them in sequence · Press H for Help',
      'alchemy':       'WASD: Collect elements · Walk to ⚗ Athanor to transmute · Press H for Help',
      'rhythm':        'WASD: Move to pulsing tiles ON THE BEAT · Build a streak for score multipliers · Press H for Help',
    };
    const tip = modeTips[currentMode?.type] || 'Collect ◈ Peace tiles to advance · Press H anytime for Help';
    _showGameTip(tip, 5000);
  }
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

/** Timer handle for the game tip auto-dismiss (module-level to avoid DOM property mutation). */
let _tipTimer = null;
/** Timer handle for the mute-toggle notification auto-dismiss. */
let _muteNotifTimer = null;

/** Show a brief tip message in the #message element, auto-fades after durationMs.
 *  If game.settings.messagePause is true, gameplay pauses until player dismisses. */
function _showGameTip(text, durationMs = 4000) {
  try {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(_tipTimer);
    if (game.settings.messagePause && game.state === 'PLAYING') {
      // Pause gameplay — player dismisses by pressing any key or clicking
      game.state = 'MESSAGE_PAUSE';
      game._messagePauseText = text;
    } else {
      // Challenge mode: message auto-dismisses, game keeps running
      _tipTimer = setTimeout(() => el.classList.remove('show'), durationMs);
    }
  } catch (e) {
    console.warn('[_showGameTip] Could not display tip:', e);
  }
}

// HUD rendering moved to src/ui/hud.js (updateHUD imported)

// Input handling (legacy - kept for menu and pause)
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  
  // MESSAGE_PAUSE: any meaningful key dismisses the message and resumes play
  if (game.state === 'MESSAGE_PAUSE') {
    // Ignore modifier-only keys so accidental presses don't dismiss
    const dismiss = !['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key);
    if (dismiss) {
      game.state = 'PLAYING';
      game._messagePauseText = null;
      try {
        const el = document.getElementById('message');
        if (el) el.classList.remove('show');
      } catch (_) {}
      e.preventDefault();
      return;
    }
  }

  // Menu input
  if (menuSystem && (game.state === 'MENU' || game.state === 'MENU_DREAMSCAPE' || game.state === 'PAUSED')) {
    const result = menuSystem.handleKey(e);
    if (result.resumeGame) {
      // Tutorial ESC with 'resume' sentinel → go directly back to playing
      game.state = 'PLAYING';
      e.preventDefault();
      return;
    }
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

  // Stats dashboard: ESC or D closes it
  if (game._showStats) {
    if (e.key === 'Escape' || e.key === 'd' || e.key === 'D') {
      game._showStats = false;
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
      onGamePaused();
      e.preventDefault();
      return;
    }
    
    // H key: open in-game help / tutorial (ESC from tutorial → returns directly to PLAYING)
    if (e.key === 'h' || e.key === 'H') {
      game.state = 'PAUSED';
      menuSystem._tutorialReturnScreen = 'resume'; // special sentinel: ESC from tutorial resumes game
      menuSystem.open('tutorial');
      onGamePaused();
      e.preventDefault();
      return;
    }

    // D key: toggle live stats dashboard overlay
    if (e.key === 'd' || e.key === 'D') {
      game._showStats = !game._showStats;
      e.preventDefault();
      return;
    }

    // I key: toggle isometric 3D tilt on canvas wrapper
    if (e.key === 'i' || e.key === 'I') {
      const wrapper = document.getElementById('canvas-wrapper');
      if (wrapper) {
        const on = wrapper.classList.toggle('isometric');
        game._message = on ? '⟁ Isometric view ON (I to toggle)' : '⟁ Isometric view OFF';
        game._messageMs = Date.now();
      }
      e.preventDefault();
      return;
    }
    
    // PHASE 2: Mode switching with M key
    if (e.key === 'm' || e.key === 'M') {
      switchGameMode();
      e.preventDefault();
      return;
    }

    // N key: toggle audio mute/unmute
    if (e.key === 'n' || e.key === 'N') {
      game.settings.audio = !game.settings.audio;
      // Silently ignore AudioManager errors (not available in all environments)
      try { if (window.AudioManager) window.AudioManager.setEnabled(game.settings.audio); } catch (_) {}
      try {
        const el = document.getElementById('message');
        if (el) {
          el.textContent = game.settings.audio ? '🔊 Music ON' : '🔇 Music OFF';
          el.classList.add('show');
          clearTimeout(_muteNotifTimer);
          _muteNotifTimer = setTimeout(() => el.classList.remove('show'), 1500);
        }
      } catch (_) { /* DOM unavailable — safe to ignore */ }
      e.preventDefault();
      return;
    }
  }

  // ESC during PAUSE: resume game (unless in a sub-screen like tutorial/options)
  if (game.state === 'PAUSED' && e.key === 'Escape') {
    if (menuSystem && menuSystem.screen === 'pause') {
      // ESC on the pause menu itself → resume
      game.state = 'PLAYING';
      const pauseReward = onGameResumed(game);
      if (pauseReward) {
        game._message = `⏸ Pause reward: ${pauseReward.bonus}`;
        game._messageMs = Date.now();
      }
      e.preventDefault();
      return;
    }
    // Sub-screens handle their own ESC via menuSystem.handleKey (already handled above)
  }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Click-to-dismiss message pause
document.addEventListener('click', () => {
  if (game.state === 'MESSAGE_PAUSE') {
    game.state = 'PLAYING';
    game._messagePauseText = null;
    try {
      const el = document.getElementById('message');
      if (el) el.classList.remove('show');
    } catch (_) {}
  }
});

let lastMoveTime = 0;
const MOVE_MS = 150;

// PHASE 1: Enhanced input handling using InputManager
function handleGameInput() {
  const now = Date.now();
  if (game.state !== 'PLAYING') return;

  // Poll gamepad each frame so controller input maps to keyboard actions
  if (inputManager) inputManager.pollGamepad();

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
  
  if (game.state === 'PLAYING' || game.state === 'MESSAGE_PAUSE') {
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
      const hints = {
        'shooter':       'WASD: Move · Mouse: Aim · LMB: Shoot · 1-4: Weapon · M: Switch Mode · ESC: Pause',
        'rpg':           'WASD/Arrows: Move · Walk to ◈ Peace nodes · ↑/↓+ENTER: Dialogue · U: Shop · D: Stats · M: Switch Mode · ESC: Pause',
        'ornithology':   'WASD/Arrows: Move to observe birds · 1-4: Answer challenges · M: Switch Mode · ESC: Pause',
        'mycology':      'WASD/Arrows: Forage mushrooms · 1-4: Identify toxic species · M: Switch Mode · ESC: Pause',
        'architecture':  'WASD: Move · SPACE: Place tile · Q/E: Cycle tiles · X: Erase · M: Switch Mode · ESC: Pause',
        'constellation': 'WASD/Arrows: Navigate to stars · Activate in sequence · M: Switch Mode · ESC: Pause',
        'constellation-3d': 'WASD/Arrows: Navigate to stars · 3D starfield view · M: Switch Mode · ESC: Pause',
        'alchemy':       'WASD: Move · Step on elements (🜂Fire 🜄Water 🜃Earth 🜁Air) to collect · Walk to ⚗ Athanor tile to transmute · M: Switch Mode · ESC: Pause',
        'rhythm':        'WASD/Arrows: Move to pulsing tiles ON THE BEAT · Build streak for ×multiplier · M: Switch Mode · ESC: Pause',
      };
      // Only update the DOM when the text actually changes to prevent flicker
      // Grid mode: dynamically adjust hint based on what's currently active
      let gridHint = 'WASD/Arrows: Move · J: Archetype · SHIFT: Matrix · H: Help · D: Stats · N: Mute · ESC: Pause';
      if (currentMode?.type === 'grid') {
        const g = game;
        const pulseReady = (g.glitchPulseCharge || 0) >= 100;
        const hasTokens = (g.insightTokens || 0) > 0;
        const puzzleMode = !!g.mechanics?.undoEnabled;
        gridHint = 'WASD/Arrows: Move · J: Archetype · SHIFT: Matrix'
          + (pulseReady ? ' · R: PULSE READY!' : ' · R: Pulse (charge needed)')
          + (hasTokens ? ' · U: Shop' : '')
          + (puzzleMode ? ' · Z: Undo' : '')
          + ' · H: Help · D: Stats · N: Mute · ESC: Pause';
      }
      const newHintText = hints[currentMode?.type] || gridHint;
      if (newHintText !== _lastHintText) {
        hint.textContent = newHintText;
        _lastHintText = newHintText;
      }
    }

    // MESSAGE_PAUSE overlay: dim the screen and show "press any key to continue"
    if (game.state === 'MESSAGE_PAUSE') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = '13px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('[ press any key to continue ]', canvas.width / 2, canvas.height - 20);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // Stats dashboard overlay — rendered on top of game, below game-over
    if (game._showStats) {
      renderStatsDashboard(game, ctx, canvas.width, canvas.height);
    }

    // Dream Yoga + Recovery overlays (lucidity bar, body scan, reality checks)
    if (game.state === 'PLAYING') {
      renderDreamYogaOverlays(game, ctx);
      renderRecoveryOverlays(game, ctx, game.tileSize || 32);
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

  // Update sprite layer (CSS character sprites over canvas)
  updateSpriteLayer();
}

// ── Sprite Layer: position CSS character sprites over the canvas ────────────
// Uses a pool of DOM elements to avoid constant createElement calls.
const _spritePool = { player: null, enemies: [] };

function updateSpriteLayer() {
  const layer = document.getElementById('sprite-layer');
  if (!layer || !canvas) return;

  // Only show sprites in grid-based game modes (not menus/game-over)
  if (game.state !== 'PLAYING' && game.state !== 'MESSAGE_PAUSE') {
    layer.style.display = 'none';
    return;
  }
  // Only show for grid-type modes
  const modeType = currentMode?.type;
  if (modeType && modeType !== 'grid' && modeType !== 'rpg') {
    layer.style.display = 'none';
    return;
  }
  layer.style.display = 'block';

  const tileSize = currentMode?.tileSize || game.tileSize || 32;
  const xOff = currentMode?._xOff || 0;
  const yOff = currentMode?._yOff || 0;

  // Player sprite
  const px = game.player?.x;
  const py = game.player?.y;
  if (px !== undefined && py !== undefined) {
    if (!_spritePool.player) {
      _spritePool.player = document.createElement('div');
      _spritePool.player.className = 'player-sprite';
      layer.appendChild(_spritePool.player);
    }
    const sx = xOff + px * tileSize + tileSize / 2;
    const sy = yOff + py * tileSize + tileSize;
    _spritePool.player.style.left = `${sx}px`;
    _spritePool.player.style.top  = `${sy}px`;
    _spritePool.player.style.display = 'block';

    // Toggle 'walking' class when player moves
    if (px !== game._playerLastX || py !== game._playerLastY) {
      _spritePool.player.classList.add('walking');
      game._playerLastX = px;
      game._playerLastY = py;
    } else {
      _spritePool.player.classList.remove('walking');
    }
  } else if (_spritePool.player) {
    _spritePool.player.style.display = 'none';
  }

  // Enemy sprites (pool: reuse DOM nodes)
  const enemies = game.enemies || [];
  // Grow pool if needed
  while (_spritePool.enemies.length < enemies.length) {
    const el = document.createElement('div');
    el.className = 'enemy-sprite';
    layer.appendChild(el);
    _spritePool.enemies.push(el);
  }
  enemies.forEach((enemy, i) => {
    const el = _spritePool.enemies[i];
    if (!el) return;
    const ex = xOff + enemy.x * tileSize + tileSize / 2;
    const ey = yOff + enemy.y * tileSize + tileSize / 2;
    el.style.left = `${ex}px`;
    el.style.top  = `${ey}px`;
    el.style.display = enemy.active === false ? 'none' : 'block';
    // Boss gets bigger hexagon shape; use boss color if set
    if (enemy.isBoss) {
      el.classList.add('boss');
      if (enemy.color) el.style.background = enemy.color + 'cc';
    } else {
      el.classList.remove('boss');
      el.style.background = (enemy.color || '#ff6600') + 'cc';
    }
  });
  // Hide unused pool slots
  for (let i = enemies.length; i < _spritePool.enemies.length; i++) {
    _spritePool.enemies[i].style.display = 'none';
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

    // ── Dream Yoga & Recovery: process tile-triggered flags ───────────────
    if (game._triggerBodyScan) {
      delete game._triggerBodyScan;
      triggerBodyScan(game);
    }
    if (game._triggerLearningChallenge) {
      delete game._triggerLearningChallenge;
      gainLucidity(game, 'challenge');
    }
    if (game._lastTileType !== undefined) {
      const dom = game.emotionalField?.getDominant() || null;
      recordDreamSign(game._lastTileType, dom);
      delete game._lastTileType;
    }
    // Session manager: tick fatigue/time-warning systems
    if (game.mechanics) updateSessionManager(game, deltaMs);
    // Reality check: may show occasional prompt after many moves
    checkRealityCheck(game);
    
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
        // Expose shooter-specific data for HUD objective display
        game._waveNumber = currentMode.waveNumber || 1;
        game._killCount = currentMode.kills || 0;
      }
    } else {
      // Fallback to legacy game systems
      updateEnemies(game);
      updateParticles(game);
    }
    
    updateHUD(game);
  } else if (game.state === 'MESSAGE_PAUSE') {
    // Gameplay is paused for message — still clear per-frame input to avoid stale presses
    if (inputManager) inputManager.clearFrameInput();
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
  if (synergy) {
    // Apply synergy effects to gameplay
    if (synergy.effect.scoreMultiplier) {
      game.synergyMultiplier = synergy.effect.scoreMultiplier;
      game._synergyMulTimer = 3000;
    }
    if (synergy.effect.shieldBonus && game.player) {
      game.player.hp = Math.min(game.player.maxHp, (game.player.hp || 0) + synergy.effect.shieldBonus);
    }
    // Show synergy banner so player knows what fired
    const label = synergy.message || (synergy.id ? synergy.id.replace(/_/g, ' ').toUpperCase() : '') || '';
    game._synergyBanner = { text: label, shownAtMs: Date.now(), durationMs: 2800, id: synergy.id };
  }

  // Decay synergy multiplier after duration expires
  if (game._synergyMulTimer > 0) {
    game._synergyMulTimer -= deltaMs;
    if (game._synergyMulTimer <= 0) {
      game.synergyMultiplier = 1.0;
      game._synergyMulTimer = 0;
    }
  }

  // Get current emotional and temporal modifiers
  const emotionalMods = getEmotionalModifiers(game.emotionalField);
  const temporalMods = game.temporalSystem.getModifiers();
  
  // Apply modifiers to game globals (will affect all systems)
  game.currentEmotionalMods = emotionalMods;
  game.currentTemporalMods = temporalMods;
  
  // Apply emotional move speed modifier — combines with play-mode speed boost
  if (emotionalMods.moveSpeedMod && currentMode?.moveDelay !== undefined) {
    // Lower = faster; emotional distortion slows movement by up to 20%
    game.emotionMoveSpeedMod = emotionalMods.moveSpeedMod;
  }

  // Apply emotional hazard damage modifier to game state
  game.emotionHazardMod = emotionalMods.hazardDamageMod || 1.0;
  
  // Visual feedback: world gets darker/more distorted with high distortion
  const distortion = game.emotionalField.calcDistortion();
  game.worldDistortion = distortion;

  // Update ambient music engine if audio is enabled
  if (game.settings?.audio) {
    try {
      ambientMusic.update({
        distortion,
        dominant: game.emotionalField?.getDominant() || null,
      });
    } catch (_) {}
  }

  // CSS glitch animation driven by distortion level — respects reducedMotion setting
  if (!game.settings?.reducedMotion) {
    canvas.classList.toggle('glitch-heavy',  distortion > 0.7);
    canvas.classList.toggle('glitch-medium', distortion > 0.35 && distortion < 0.7);
    canvas.classList.toggle('glitch-light',  distortion > 0.15 && distortion <= 0.35);
  } else {
    canvas.classList.remove('glitch-heavy', 'glitch-medium', 'glitch-light');
  }
}

// Init
console.log('🌌 GLITCH·PEACE BASE LAYER v1.0 - Phase 1 Modular Architecture');
initUI();
requestAnimationFrame(gameLoop);
