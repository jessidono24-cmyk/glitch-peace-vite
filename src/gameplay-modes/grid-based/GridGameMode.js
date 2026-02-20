// ═══════════════════════════════════════════════════════════════════════
//  GRID GAME MODE - Grid-based roguelike gameplay
//  Phase 1: Foundation Enhancement - Wraps existing grid logic
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';
import { generateGrid } from './grid-logic.js';
import { createPlayer, movePlayer, takeDamage, heal } from './grid-player.js';
import { createEnemy, updateEnemies } from './grid-enemy.js';
import { createParticles, updateParticles } from './grid-particles.js';
import { T, TILE_DEF, PLAYER, DIFF_CFG, SYNERGY_MESSAGES } from '../../core/constants.js';
import { applyMode } from '../../systems/play-modes.js';
import { getDreamscapeTheme, applyDreamscapeBias } from '../../systems/dreamscapes.js';
import { updatePowerups, hasPowerup } from '../../systems/powerups.js';
import { undoGameMove } from '../../systems/undo.js';
import { updateCombo } from '../../game/player.js';
import { getCosmoModifiers } from '../../systems/cosmologies.js';
import {
  triggerLearningChallenge,
  handleChallengeInput,
  updateLearningChallenge,
  renderLearningChallenge,
} from '../../systems/learning-modules.js';
import {
  recordDreamSign,
  gainLucidity,
  loseLucidity,
  triggerBodyScan,
  onGamePaused,
  onGameResumed,
  renderDreamYogaOverlays,
} from '../../systems/dream-yoga.js';
import {
  checkImpulseBuffer,
  cancelImpulseBuffer,
  recordEchoPosition,
  getConsequencePreview,
  getRouteAlternatives,
  checkThresholdMonitor,
  updateSessionManager,
  applyRelapseCompassion,
  resetRelapseCompassion,
  checkRealityCheck,
  renderRecoveryOverlays,
} from '../../systems/recovery-tools.js';
import {
  getCampaignLevel,
  applyCampaignLevel,
  renderCampaignNarrative,
} from '../../systems/campaign.js';
import {
  openUpgradeShop,
  closeUpgradeShop,
  handleShopInput,
  renderUpgradeShop,
} from '../../systems/upgrade-shop.js';
import {
  activateArchetype,
  saveArchetypeHistory,
  updateArchetypes,
  renderArchetypeOverlay,
  getArchetypeForDreamscape,
} from '../../systems/archetypes.js';
import { logicPuzzles }        from '../../intelligence/logic-puzzles.js';
import { emotionRecognition }  from '../../intelligence/emotion-recognition.js';
import { empathyTraining }     from '../../intelligence/empathy-training.js';
import { strategicThinking }   from '../../intelligence/strategic-thinking.js';
import { achievementSystem }   from '../../systems/achievements.js';
import { addScore }            from '../../systems/leaderboard.js';
import { recordSession }       from '../../systems/session-analytics.js';

// ── GLITCH tile animation constants ─────────────────────────────────────────
const GLITCH_FLICKER_PERIOD_MS = 180;  // how fast the GLITCH tile color cycles
const GLITCH_COLOR_COUNT = 6;          // number of distinct GLITCH colors

/**
 * GridGameMode implements the traditional grid-based roguelike gameplay.
 * This wraps the existing game logic from src/game/* files.
 */
export class GridGameMode extends GameMode {
  constructor(config = {}) {
    super({
      ...config,
      type: 'grid',
      name: config.name || 'Grid-Based Roguelike',
    });

    this.playMode = config.playMode || 'ARCADE'; // Which of the 13 play modes
    this.tileSize = 0;
    this._xOff = 0; // horizontal centering offset (pixels)
    this._yOff = 0; // vertical centering offset (pixels)
    this.lastMoveTime = 0;
    this.moveDelay = 150; // ms between moves
    this._levelFlashMs = 0;       // countdown ms for "LEVEL COMPLETE" overlay
    this._LEVEL_FLASH_TOTAL = 3000; // total overlay duration ms
    this._completedLevel = 0;      // level number captured before increment
    this._levelStartScore = 0;     // score at start of level (for delta display)
    this._levelScoreEarned = 0;    // score delta shown in transition screen
    this._ENEMY_HIT_COOLDOWN = 600; // ms between enemy collision hits
  }

  /**
   * Calculate tile size and centering offsets based on canvas dimensions.
   * Centers the square game grid in the full-viewport canvas.
   */
  _calcLayout(canvas, gridSize) {
    const HUD_H = 40; // HUD bar height (fixed overlay at bottom)
    const usableW = canvas.width;
    const usableH = canvas.height - HUD_H;
    // Fit the grid in the smallest usable dimension so tiles stay square
    const gridPixels = Math.min(usableW, usableH);
    this.tileSize = Math.max(1, Math.floor(gridPixels / gridSize));
    // Center the grid horizontally and vertically in the canvas
    this._xOff = Math.floor((usableW  - this.tileSize * gridSize) / 2);
    this._yOff = Math.floor((usableH  - this.tileSize * gridSize) / 2);
  }

  /**
   * Handle canvas resize — recalculate layout without reinitializing the mode.
   */
  onResize(canvas, gameState) {
    if (!gameState) return;
    this._calcLayout(canvas, gameState.gridSize || 13);
    gameState.tileSize = this.tileSize; // keep particle system in sync
  }

  /**
   * Initialize the grid-based game mode
   */
  init(gameState, canvas, ctx) {
    console.log('[GridGameMode] Initializing grid-based mode');
    
    // Calculate tile size — fit the grid into the shorter screen dimension,
    // then center it so the game fills the entire viewport.
    this._calcLayout(canvas, gameState.gridSize);
    // Keep gameState.tileSize in sync (used by particles.js and legacy code)
    gameState.tileSize = this.tileSize;
    
    // Initialize grid-specific state
    gameState.modeState = {
      grid: [],
      tileSize: this.tileSize,
      peaceNodes: [],
      peaceCollected: 0,
      peaceTotal: 0,
      enemies: [],
      particles: [],
    };

    // Create player if not exists
    if (!gameState.player) {
      gameState.player = createPlayer();
    }

    // Apply play mode configuration
    applyMode(gameState, this.playMode);

    // Merge user-level recovery tool preferences from settings (override mode defaults)
    if (!gameState.mechanics) gameState.mechanics = {};
    const s = gameState.settings || {};
    if (s.impulseBuffer !== undefined)       gameState.mechanics.impulseBuffer       = s.impulseBuffer;
    if (s.patternEcho !== undefined)         gameState.mechanics.patternEcho         = s.patternEcho;
    if (s.consequencePreview !== undefined)  gameState.mechanics.consequencePreview  = s.consequencePreview;
    // Session reminders: controlled by settings.sessionReminders (default ON)
    if (s.sessionReminders === false)        gameState._sessionRemindersDisabled = true;

    // Apply difficulty-level flags (SPROUT / SEEDLING add autoCollect + showHints)
    const diffCfg = DIFF_CFG[s.difficulty || 'normal'] || {};
    if (diffCfg.autoCollect) gameState.mechanics.autoCollect = true;
    if (diffCfg.showHints)   gameState.mechanics.routeAlternatives = true;
    // Propagate hazard/damage multipliers from difficulty into gameState
    if (diffCfg.hazardMul !== undefined) gameState.hazardMul = diffCfg.hazardMul;
    if (diffCfg.peaceMul  !== undefined) gameState.peaceMul  = diffCfg.peaceMul;

    // Apply cosmology modifiers (if a cosmology was selected in the menu)
    if (gameState.currentCosmology) {
      const cosmoMods = getCosmoModifiers(gameState.currentCosmology);
      Object.assign(gameState.mechanics, cosmoMods);
      // Cosmology accent color for HUD display
      if (cosmoMods.accent) gameState._cosmoAccent = cosmoMods.accent;
    }

    // Initialize timer for timed modes (SPEEDRUN, PATTERN_TRAINING, DAILY, etc.)
    if (gameState.mechanics?.timeLimit && typeof gameState.mechanics.timeLimit === 'number') {
      gameState.timeRemainingMs = gameState.mechanics.timeLimit * 1000;
    }

    // Archetype: pick based on selected dreamscape
    gameState._archetypeId = getArchetypeForDreamscape(gameState.currentDreamscape || 'RIFT');
    gameState._archetypeLastUsedMs = 0; // ready immediately

    // Matrix A/B: start in Matrix B (Coherence, green)
    if (gameState.matrixActive === undefined) gameState.matrixActive = 'B';
    // Energy bar for matrix (0–100)
    if (gameState.energy === undefined) gameState.energy = 60;

    // Glitch Pulse charge (0–100, filled by peace collection in player.js)
    if (gameState.glitchPulseCharge === undefined) gameState.glitchPulseCharge = 0;

    // Generate initial grid
    this.generateLevel(gameState);
  }

  /**
   * Generate a new level
   */
  generateLevel(gameState) {
    // Track score at level start (used by transition screen to compute earned delta)
    this._levelStartScore = gameState.score || 0;

    // Detect dreamscape change — trigger a visual flash transition
    const dreamscapeId = gameState.currentDreamscape || 'RIFT';
    if (this._lastDreamscape && this._lastDreamscape !== dreamscapeId) {
      const theme = getDreamscapeTheme(dreamscapeId);
      gameState._dreamscapeTransition = {
        from: this._lastDreamscape,
        to: dreamscapeId,
        color: theme.accent || '#00e5ff',
        label: theme.label || dreamscapeId,
        startMs: Date.now(),
        durationMs: 1800,
      };
    }
    this._lastDreamscape = dreamscapeId;

    // generateGrid modifies gameState directly (doesn't return result)
    generateGrid(gameState);

    // Apply dreamscape-specific tile bias
    applyDreamscapeBias(gameState, dreamscapeId);

    // Play dreamscape-specific ambient tone when entering The Mirror
    if (dreamscapeId === 'MIRROR') {
      try { window.AudioManager?.play('mirror_chime'); } catch(_) {}
    }
    
    // Grid data is already in gameState.grid, gameState.peaceNodes, etc.
    // No need to copy to modeState - we'll use gameState directly
    
    // Initialize enemies based on play mode
    const enemyCount = this.getEnemyCount(gameState);
    gameState.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      // Place enemy at a random void tile away from the player
      const enemy = this._spawnEnemyOnGrid(gameState);
      if (enemy) {
        gameState.enemies.push(enemy);
      }
    }

    // Boss encounter: every 5th level when bossEnabled
    if (gameState.mechanics?.bossEnabled && gameState.level % 5 === 0) {
      this._spawnBoss(gameState);
    }

    console.log(`[GridGameMode] Generated level ${gameState.level}`);

    // Apply campaign level data if in CAMPAIGN play mode
    if (gameState.playMode === 'CAMPAIGN' || gameState.playMode === 'campaign') {
      const campaignLevel = getCampaignLevel(gameState.level);
      if (campaignLevel) {
        applyCampaignLevel(gameState, campaignLevel);
        // Re-apply dreamscape bias for campaign-selected dreamscape
        applyDreamscapeBias(gameState, gameState.currentDreamscape || 'RIFT');
      }
    }
  }

  /**
   * Get enemy count based on level, play mode, and temporal modifiers
   */
  getEnemyCount(gameState) {
    // ZEN/PUZZLE: no enemies
    if (gameState.mechanics?.enemyBehavior === 'none') return 0;
    
    // Base count scaled by level and difficulty
    const diff = gameState.settings?.difficulty || 'normal';
    const diffEnemyMap = { easy: 0, normal: 1, hard: 2, nightmare: 4 };
    const base = (diffEnemyMap[diff] ?? 1) + Math.floor(gameState.level * 0.5);

    // Apply temporal enemy multiplier (lunar phase)
    const temporalMod = gameState.currentTemporalMods?.enemyMul ?? 1.0;
    return Math.max(0, Math.round(base * temporalMod));
  }

  /**
   * Spawn an enemy at a random valid grid position (away from the player)
   */
  _spawnEnemyOnGrid(gameState) {
    const sz = gameState.gridSize;
    for (let attempt = 0; attempt < 150; attempt++) {
      const x = 1 + Math.floor(Math.random() * (sz - 2));
      const y = 1 + Math.floor(Math.random() * (sz - 2));
      const dist = Math.abs(x - gameState.player.x) + Math.abs(y - gameState.player.y);
      if (gameState.grid[y]?.[x] === T.VOID && dist > 5) {
        return createEnemy(x, y, gameState.level);
      }
    }
    return null;
  }

  /**
   * Spawn a boss enemy — larger, faster, more HP, distinctive color.
   * Called every 5th level when bossEnabled is true.
   */
  _spawnBoss(gameState) {
    const sz = gameState.gridSize;
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = 1 + Math.floor(Math.random() * (sz - 2));
      const y = 1 + Math.floor(Math.random() * (sz - 2));
      const dist = Math.abs(x - gameState.player.x) + Math.abs(y - gameState.player.y);
      if (gameState.grid[y]?.[x] === T.VOID && dist > 7) {
        const boss = createEnemy(x, y, gameState.level);
        boss.isBoss = true;
        boss.hp = 50 + gameState.level * 10;
        boss.maxHp = boss.hp;
        boss.speed = Math.max(200, boss.speed * 0.65); // faster than normal
        boss.dmg = 25; // higher collision damage
        boss.color = '#ff00aa';
        boss.symbol = '◆';
        boss.size = 1; // occupies 1 tile but rendered larger
        gameState.enemies.push(boss);

        // Announce boss
        gameState._bossAlert = {
          text: `LEVEL ${gameState.level} · BOSS ENCOUNTER`,
          subtext: 'Pattern entity manifesting',
          shownAtMs: Date.now(),
          durationMs: 2500,
          color: '#ff44aa',
        };
        if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', 0.8);
        return;
      }
    }
  }

  /**
   * Update game logic
   */
  update(gameState, deltaTime) {
    // Tick level-complete overlay timer
    if (this._levelFlashMs > 0) {
      this._levelFlashMs -= deltaTime;
    }

    // Timed mode countdown (SPEEDRUN, PATTERN_TRAINING, DAILY...)
    if (gameState.timeRemainingMs !== undefined) {
      gameState.timeRemainingMs = Math.max(0, gameState.timeRemainingMs - deltaTime);
      if (gameState.timeRemainingMs <= 0) {
        this.onGameOver(gameState);
        return;
      }
    }

    // ZEN_GARDEN auto-heal
    if (gameState.mechanics?.autoHeal && gameState.player) {
      gameState.player.hp = Math.min(
        gameState.player.maxHp || 100,
        (gameState.player.hp || 0) + gameState.mechanics.autoHeal * (deltaTime / 1000)
      );
    }

    // SPROUT: auto-collect any peace node within 1 step of player (adjacent)
    if (gameState.mechanics?.autoCollect && gameState.player && gameState.grid) {
      const px = gameState.player.x;
      const py = gameState.player.y;
      for (const node of (gameState.peaceNodes || [])) {
        if (!node.collected && Math.abs(node.x - px) <= 1 && Math.abs(node.y - py) <= 1) {
          node.collected = true;
          gameState.peaceCollected = Math.min(
            (gameState.peaceTotal || 0),
            (gameState.peaceCollected || 0) + 1
          );
          gameState.score = (gameState.score || 0) + Math.round(100 * (gameState.scoreMul || 1.0));
          if (gameState.emotionalField?.add) gameState.emotionalField.add('joy', 0.6);
          try { window.AudioManager?.play('peace'); } catch (e) {}
        }
      }
    }

    // Wu Wei / Taoist flowBonus: score trickles while player stands still
    if (gameState.mechanics?.flowBonus && gameState.player) {
      if (!this._lastMovePos) this._lastMovePos = { x: gameState.player.x, y: gameState.player.y };
      if (gameState.player.x === this._lastMovePos.x && gameState.player.y === this._lastMovePos.y) {
        if (!this._stillMs) this._stillMs = 0;
        this._stillMs += deltaTime;
        if (this._stillMs >= 2000) { // award flow score every 2s of stillness
          this._stillMs = 0;
          const flowScore = Math.round(25 * (gameState.scoreMul || 1.0));
          gameState.score = (gameState.score || 0) + flowScore;
          if (gameState.emotionalField?.add) gameState.emotionalField.add('tender', 0.2);
          // Behavioral tracking: prolonged stillness → idle/contemplative
          if (gameState.emotionalField?.observeBehavior) {
            gameState.emotionalField.observeBehavior('idle', { hp: gameState.player.hp, maxHp: gameState.player.maxHp || 100 });
          }
        }
      } else {
        this._stillMs = 0;
        this._lastMovePos = { x: gameState.player.x, y: gameState.player.y };
      }
    } else if (gameState.player) {
      // Non-flowBonus modes: track idle behavior after 3 seconds of inactivity
      if (!this._idleTrackMs) this._idleTrackMs = 0;
      const playerStill = this._prevPlayerPos &&
        this._prevPlayerPos.x === gameState.player.x &&
        this._prevPlayerPos.y === gameState.player.y;
      if (playerStill) {
        this._idleTrackMs += deltaTime;
        if (this._idleTrackMs >= 3000 && gameState.emotionalField?.observeBehavior) {
          this._idleTrackMs = 0;
          gameState.emotionalField.observeBehavior('idle', { hp: gameState.player.hp, maxHp: gameState.player.maxHp || 100 });
        }
      } else {
        this._idleTrackMs = 0;
        this._prevPlayerPos = { x: gameState.player.x, y: gameState.player.y };
      }
    }

    // Update active powerups (expiry + REGEN effect)
    updatePowerups(gameState);

    // Update combo decay (3s timeout between peace collections)
    updateCombo(gameState, 3000);

    // ── Recovery Tools: session, threshold, reality check ──────────────
    updateSessionManager(gameState, deltaTime);
    checkThresholdMonitor(gameState);
    checkRealityCheck(gameState);

    // Update active learning challenge (timeout check)
    updateLearningChallenge(gameState, deltaTime);

    // Learning challenge correct answer → lucidity gain (handled in handleChallengeInput via flag)
    if (gameState._challengeCorrect) {
      delete gameState._challengeCorrect;
      gainLucidity(gameState, 'challenge');
    }

    // Handle INSIGHT tile → learning challenge trigger signal
    if (gameState._triggerLearningChallenge) {
      delete gameState._triggerLearningChallenge;
      triggerLearningChallenge(gameState);
      gainLucidity(gameState, 'insight');
    }

    // Handle COVER tile → body scan (dream yoga embodiment practice)
    if (gameState._triggerBodyScan) {
      delete gameState._triggerBodyScan;
      triggerBodyScan(gameState);
    }

    // Record dream sign when player steps on a new tile type
    if (gameState._lastTileType !== undefined) {
      const tileType = gameState._lastTileType;
      delete gameState._lastTileType;
      const domEmo = gameState.emotionalField?.getDominant?.();
      recordDreamSign(tileType, domEmo || null);
    }

    // Route alternatives + consequence preview (refreshed each frame)
    gameState._routeAlternatives = getRouteAlternatives(gameState);
    // Consequence preview uses last-stored direction (updated in handleInput)
    if (gameState._lastDir && (gameState._lastDir.x || gameState._lastDir.y)) {
      gameState._consequencePreview = getConsequencePreview(
        gameState, gameState._lastDir.x, gameState._lastDir.y
      );
    } else {
      gameState._consequencePreview = [];
    }

    // Apply SPEED powerup or SPEEDRUN mode boost to movement delay
    // Also apply RITUAL slowMotion modifier:
    //   slowMotion: 0.7 means 70% of max speed → divide by 0.7 → more delay (slower).
    const slowMul = gameState.mechanics?.slowMotion || 1.0;
    const speedBoost = hasPowerup(gameState, 'movement_boost') ? 2.0 : (gameState.moveSpeedBoost || 1.0);
    this.moveDelay = Math.max(50, Math.round(150 / speedBoost / slowMul));

    // Update archetype system (reveal-hidden timer, etc.)
    updateArchetypes(gameState, deltaTime);

    // ── Phase 9: Intelligence systems tick every frame ─────────────────────
    logicPuzzles.tick();
    emotionRecognition.tick();
    empathyTraining.tick();
    // Observe dominant emotion for EQ labeling
    const domEmo = gameState.emotionalField?.getDominant?.();
    if (domEmo) {
      const domVal = gameState.emotionalField?.emotions?.[domEmo] || 0;
      emotionRecognition.observe(domEmo, domVal, gameState.matrixActive);
    }
    // Track max combo for achievements
    const curCombo = gameState.combo || 0;
    if (curCombo > (gameState._maxComboThisSession || 0)) {
      gameState._maxComboThisSession = curCombo;
    }
    // Track dreamscapes visited for achievements
    if (gameState.currentDreamscape) {
      if (!gameState._dreamscapesVisited) gameState._dreamscapesVisited = new Set();
      gameState._dreamscapesVisited.add(gameState.currentDreamscape);
    }
    // Expose empathy behaviors witnessed count for achievements
    gameState._empathyBehaviorsWitnessed = empathyTraining.behaviorsWitnessed;
    // Check achievements
    achievementSystem.check(gameState);

    // Matrix A/B: energy drain (Matrix A) or regen (Matrix B)
    if (gameState.matrixActive === 'A') {
      gameState.energy = Math.max(0, (gameState.energy || 0) - 0.8 * (deltaTime / 16));
    } else {
      gameState.energy = Math.min(100, (gameState.energy || 0) + 0.3 * (deltaTime / 16));
    }

    // DESPAIR / HOPELESS tile spread (every ~4s)
    if (!this._spreadTimer) this._spreadTimer = 0;
    this._spreadTimer += deltaTime;
    if (this._spreadTimer >= 4000 && gameState.grid) {
      this._spreadTimer = 0;
      this._tickTileSpread(gameState);
    }

    // Update enemies
    if (gameState.enemies && gameState.enemies.length > 0) {
      updateEnemies(gameState); // enemy.js: single-arg signature updateEnemies(gameState)
      // Enemy-player collision: deal damage when an enemy occupies the player's tile
      this._checkEnemyCollisions(gameState);
    }

    // Update particles (particles.js updateParticles(gameState))
    if (gameState.particles && gameState.particles.length > 0) {
      updateParticles(gameState);
    }

    // Check win condition (use gameState directly)
    if (gameState.peaceTotal > 0 && gameState.peaceCollected >= gameState.peaceTotal) {
      this.onLevelComplete(gameState);
    }

    // Check lose condition
    if (gameState.player && gameState.player.hp <= 0) {
      // Relapse compassion: give a second chance before game over
      if (!applyRelapseCompassion(gameState)) {
        this.onGameOver(gameState);
      }
    }

    // PUZZLE mode: lose if moves exhausted and peace not all collected
    if (gameState.movesRemaining !== undefined && gameState.movesRemaining <= 0
        && gameState.peaceCollected < gameState.peaceTotal) {
      this.onGameOver(gameState);
    }

    // ZEN_GARDEN tileRespawn: periodically add new PEACE tiles
    if (gameState.mechanics?.tileRespawn && gameState.grid && gameState.peaceCollected > 0) {
      if (!this._respawnTimer) this._respawnTimer = 0;
      this._respawnTimer += deltaTime;
      if (this._respawnTimer >= 3000) { // every 3 seconds
        this._respawnTimer = 0;
        const sz = gameState.gridSize;
        for (let attempt = 0; attempt < 30; attempt++) {
          const x = 1 + Math.floor(Math.random() * (sz - 2));
          const y = 1 + Math.floor(Math.random() * (sz - 2));
          if (gameState.grid[y]?.[x] === T.VOID) {
            gameState.grid[y][x] = T.PEACE;
            gameState.peaceTotal++;
            break;
          }
        }
      }
    }
  }

  /**
   * Check if any enemy occupies the player's tile and deal damage.
   * Enemy is pushed back on contact.
   */
  _checkEnemyCollisions(gameState) {
    if (!gameState.player || !gameState.enemies) return;
    const px = gameState.player.x;
    const py = gameState.player.y;
    const now = Date.now();
    if (!this._lastEnemyDamageMs) this._lastEnemyDamageMs = 0;
    if (now - this._lastEnemyDamageMs < this._ENEMY_HIT_COOLDOWN) return; // cooldown between hits

    for (const enemy of gameState.enemies) {
      if (enemy.x === px && enemy.y === py) {
        // Empathy training: register this encounter (surface emotional context for new behaviors)
        const behavior = enemy.behavior || (enemy.isBoss ? 'boss' : 'chase');
        empathyTraining.onEnemyEncounter(behavior);

        // PACIFIST / noCombat mode: no damage, but score bonus for "stealth" (being close)
        if (gameState.mechanics?.noCombat) {
          // Stealth score: reward being adjacent without dying
          if (!gameState._lastStealthScoreMs || now - gameState._lastStealthScoreMs > 3000) {
            const stealthBonus = 50 * (gameState.scoreMul || 1.0);
            gameState.score = (gameState.score || 0) + Math.round(stealthBonus);
            gameState._lastStealthScoreMs = now;
            createParticles(gameState, px, py, '#88ff44', 6);
          }
          break;
        }
        // SHIELD powerup OR archetype shield: absorb hit without damage
        if (hasPowerup(gameState, 'absorb_damage') || gameState._archetypeShield?.moves > 0) {
          this._lastEnemyDamageMs = now;
          createParticles(gameState, px, py, '#00aaff', 6);
        } else {
          const dmg = enemy.dmg || 10; // boss deals more damage
          gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
          loseLucidity(gameState, enemy.isBoss ? 15 : 8);
          this._lastEnemyDamageMs = now;
          if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', enemy.isBoss ? 1.0 : 0.5);
          createParticles(gameState, px, py, enemy.isBoss ? '#ff44aa' : 'damage', enemy.isBoss ? 16 : 8);
          try { window.AudioManager?.play('damage'); } catch (e) {}
          // Gamepad rumble on hit — tactile feedback
          try { gameState.input?.vibrateGamepad(0.6, 0.3, enemy.isBoss ? 300 : 150); } catch (_) {}
          // Strategic thinking: record damage and which matrix was active
          strategicThinking.onDamage(gameState.matrixActive || 'B');
          // Reset no-damage tracking for pacifist achievement
          gameState._noDamageThisLevel = false;
        }
        break;
      }
    }
  }

  /**
   * Render the game
   */
  render(gameState, ctx) {
    // Use grid from main gameState (generateGrid writes there)
    const grid = gameState.grid;
    const tileSize = this.tileSize;

    // ── GAME_OVER: render compassionate overlay without returning to menu ──
    if (gameState.state === 'GAME_OVER') {
      this._renderGameOver(gameState, ctx);
      return;
    }

    if (!grid || !Array.isArray(grid)) {
      console.warn('[GridGameMode] No grid data to render');
      return;
    }

    // Apply dreamscape background and ambient overlay
    const theme = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // High Contrast mode: override background with black for WCAG AA compliance
    const highContrast = gameState.settings?.highContrast;
    if (highContrast) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Dreamscape ambient tint behind tiles (skip in high contrast)
    if (theme.ambient && !highContrast) {
      ctx.fillStyle = theme.ambient;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // High Contrast tile color overrides — WCAG AA (4.5:1 on black background)
    // Maps each tile type to a strongly contrasting fill and symbol color.
    const HC_TILE = highContrast ? {
      bg: '#000000', bd: '#555555',
      [T.PEACE]:    { bg: '#001a00', bd: '#00ff44', sy: '#00ff44' },
      [T.INSIGHT]:  { bg: '#001818', bd: '#00ffee', sy: '#00ffee' },
      [T.ARCH]:     { bg: '#1a1400', bd: '#ffee00', sy: '#ffee00' },
      [T.DESPAIR]:  { bg: '#000033', bd: '#4488ff', sy: '#4488ff' },
      [T.TERROR]:   { bg: '#220000', bd: '#ff3333', sy: '#ff3333' },
      [T.HARM]:     { bg: '#1a0000', bd: '#ff6666', sy: '#ff6666' },
      [T.RAGE]:     { bg: '#1a0010', bd: '#ff44bb', sy: '#ff44bb' },
      [T.HOPELESS]: { bg: '#001020', bd: '#3399ff', sy: '#3399ff' },
      [T.GLITCH]:   { bg: '#0d0022', bd: '#cc88ff', sy: '#cc88ff' },
      [T.TRAP]:     { bg: '#1a0a00', bd: '#ffaa33', sy: '#ffaa33' },
      [T.TELE]:     { bg: '#001422', bd: '#33aaff', sy: '#33aaff' },
      [T.COVER]:    { bg: '#0a0a14', bd: '#aaaacc', sy: '#aaaacc' },
      [T.MEM]:      { bg: '#000a08', bd: '#66ccaa', sy: '#66ccaa' },
      [T.WALL]:     { bg: '#141414', bd: '#888888', sy: null },
    } : null;

    // ── Translate context so the grid is centered in the full-viewport canvas ──
    const xOff = this._xOff || 0;
    const yOff = this._yOff || 0;
    ctx.save();
    ctx.translate(xOff, yOff);

    // Render grid tiles (with per-tile animations for GLITCH and INSIGHT)
    const nowTile = Date.now();
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const tileDef = TILE_DEF[tile] || {};
        const hcDef   = HC_TILE?.[tile];
        
        // Draw tile background
        ctx.fillStyle = hcDef ? hcDef.bg : (tileDef.bg || '#1a1a2e');
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Draw border
        ctx.strokeStyle = hcDef ? hcDef.bd : (tileDef.bd || 'rgba(255,255,255,0.1)');
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // ── GLITCH tile: random color flicker every GLITCH_FLICKER_PERIOD_MS ─
        if (tile === T.GLITCH) {
          const flicker = (Math.floor(nowTile / GLITCH_FLICKER_PERIOD_MS + x * 7 + y * 13) % GLITCH_COLOR_COUNT);
          const glitchColors = ['#dd00ff','#ff00aa','#00ffdd','#ffdd00','#ff4455','#aa00ff'];
          ctx.save();
          ctx.globalAlpha = 0.55 + 0.45 * ((flicker % 2) === 0 ? 1 : 0.4);
          ctx.fillStyle = glitchColors[flicker];
          ctx.shadowColor = glitchColors[flicker];
          ctx.shadowBlur = 8;
          ctx.font = `bold ${tileSize * 0.65}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
          ctx.shadowBlur = 0;
          ctx.restore();
          continue;
        }

        // ── INSIGHT tile: slow shimmer glow with radial gradient ─────────
        if (tile === T.INSIGHT) {
          const shimmer = 0.55 + 0.45 * Math.sin(nowTile / 900 + x * 1.1 + y * 0.7);
          ctx.save();
          // Radial gradient glow behind symbol
          const cx2 = x * tileSize + tileSize / 2;
          const cy2 = y * tileSize + tileSize / 2;
          const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, tileSize * 0.7);
          grad.addColorStop(0, `rgba(0,255,238,${shimmer * 0.4})`);
          grad.addColorStop(1, 'rgba(0,255,238,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          ctx.globalAlpha = shimmer;
          ctx.shadowColor = '#00ffee';
          ctx.shadowBlur = 8 + shimmer * 10;
          ctx.fillStyle = '#00ffee';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('◆', cx2, cy2);
          ctx.shadowBlur = 0;
          ctx.restore();
          continue;
        }

        // ── ARCH tile: golden star shimmer ───────────────────────────────
        if (tile === T.ARCH && !hcDef) {
          const shimmer = 0.6 + 0.4 * Math.sin(nowTile / 1100 + x * 0.9 + y * 1.3);
          ctx.save();
          const cx2 = x * tileSize + tileSize / 2;
          const cy2 = y * tileSize + tileSize / 2;
          const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, tileSize * 0.8);
          grad.addColorStop(0, `rgba(255,220,0,${shimmer * 0.35})`);
          grad.addColorStop(1, 'rgba(255,220,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          ctx.globalAlpha = 0.7 + shimmer * 0.3;
          ctx.shadowColor = '#ffee44';
          ctx.shadowBlur = 6 + shimmer * 8;
          ctx.fillStyle = '#ffee44';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('☆', cx2, cy2);
          ctx.shadowBlur = 0;
          ctx.restore();
          continue;
        }

        // ── PEACE tile (grid cell, not peaceNode): soft green glow ───────
        if (tile === T.PEACE && !hcDef) {
          const pulse = 0.55 + 0.45 * Math.sin(nowTile / 700 + x * 0.5 + y * 0.7);
          ctx.save();
          const cx2 = x * tileSize + tileSize / 2;
          const cy2 = y * tileSize + tileSize / 2;
          const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, tileSize * 0.7);
          grad.addColorStop(0, `rgba(0,255,136,${pulse * 0.3})`);
          grad.addColorStop(1, 'rgba(0,255,136,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          ctx.globalAlpha = 0.7 + pulse * 0.3;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 6 + pulse * 6;
          ctx.fillStyle = '#00ffcc';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('◈', cx2, cy2);
          ctx.shadowBlur = 0;
          ctx.restore();
          continue;
        }

        // Draw symbol (default for all other tile types)
        if (tileDef.sy) {
          const symColor = hcDef?.sy || tileDef.g || tileDef.bd || '#fff';
          // Hazard tiles get a subtle glow for readability
          const isHazard = (tileDef.d || 0) > 0;
          ctx.save();
          if (isHazard && !hcDef) {
            ctx.shadowColor = symColor;
            ctx.shadowBlur = 4;
          }
          ctx.fillStyle = symColor;
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tileDef.sy, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
          if (isHazard && !hcDef) ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // Render peace nodes with animated radial pulse glow
    const peaceNodes = gameState.peaceNodes;
    if (peaceNodes) {
      const nowPeace = Date.now();
      peaceNodes.forEach((node, idx) => {
        if (!node.collected) {
          const pulse = 0.55 + 0.45 * Math.sin(nowPeace / 600 + idx * 0.8);
          const pcx = node.x * tileSize + tileSize / 2;
          const pcy = node.y * tileSize + tileSize / 2;
          ctx.save();
          // Radial gradient glow halo
          const grad = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, tileSize * 0.9);
          grad.addColorStop(0, `rgba(0,255,136,${pulse * 0.5})`);
          grad.addColorStop(0.5, `rgba(0,255,136,${pulse * 0.2})`);
          grad.addColorStop(1, 'rgba(0,255,136,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(node.x * tileSize - tileSize * 0.3, node.y * tileSize - tileSize * 0.3, tileSize * 1.6, tileSize * 1.6);
          // Symbol
          ctx.globalAlpha = 0.7 + pulse * 0.3;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 10 + pulse * 8;
          ctx.fillStyle = '#00ffcc';
          ctx.font = `bold ${tileSize * 0.7}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('◈', pcx, pcy);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      });
    }

    // Render enemies with color-coded glows per behavior type
    const enemies = gameState.enemies;
    if (enemies) {
      const nowEnemy = Date.now();
      enemies.forEach(enemy => {
        if (enemy.active !== false) {
          if (enemy.isBoss) {
            // Boss: pulsing magenta glow + bigger symbol + HP bar
            const pulse = 0.5 + 0.5 * Math.sin(nowEnemy / 250);
            ctx.save();
            // Glow halo
            const bcx = enemy.x * tileSize + tileSize / 2;
            const bcy = enemy.y * tileSize + tileSize / 2;
            const bGrad = ctx.createRadialGradient(bcx, bcy, 0, bcx, bcy, tileSize * 1.2);
            bGrad.addColorStop(0, `rgba(255,0,170,${0.4 + pulse * 0.3})`);
            bGrad.addColorStop(1, 'rgba(255,0,170,0)');
            ctx.fillStyle = bGrad;
            ctx.fillRect(enemy.x * tileSize - tileSize * 0.5, enemy.y * tileSize - tileSize * 0.5, tileSize * 2, tileSize * 2);
            ctx.globalAlpha = 0.7 + pulse * 0.3;
            ctx.fillStyle = '#ff00aa';
            ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${tileSize * 0.8}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ff44aa';
            ctx.shadowBlur = 14 + pulse * 8;
            ctx.fillText('◆', bcx, bcy);
            ctx.shadowBlur = 0;
            // HP bar below boss
            if (enemy.hp !== undefined && enemy.maxHp) {
              const bw = tileSize;
              const frac = enemy.hp / enemy.maxHp;
              ctx.fillStyle = '#330011';
              ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize + tileSize, bw, 4);
              ctx.fillStyle = frac > 0.5 ? '#ff44aa' : (frac > 0.25 ? '#ffaa00' : '#ff3344');
              ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize + tileSize, Math.round(bw * frac), 4);
            }
            ctx.restore();
          } else {
            // Regular enemies: color-coded by behavior
            const eColor = enemy.color || '#ff6600';
            const ecx = enemy.x * tileSize + tileSize / 2;
            const ecy = enemy.y * tileSize + tileSize / 2;
            ctx.save();
            // Simple solid fill + glowing border
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = eColor;
            ctx.fillRect(enemy.x * tileSize + 2, enemy.y * tileSize + 2, tileSize - 4, tileSize - 4);
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = eColor;
            ctx.lineWidth = 1;
            ctx.shadowColor = eColor;
            ctx.shadowBlur = 6;
            ctx.strokeRect(enemy.x * tileSize + 1, enemy.y * tileSize + 1, tileSize - 2, tileSize - 2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = `${tileSize * 0.6}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.symbol || '■', ecx, ecy);
            ctx.restore();
          }
        }
      });
    }

    // Render player with animated cyan halo + glowing symbol
    if (gameState.player) {
      const plx = gameState.player.x * tileSize;
      const ply = gameState.player.y * tileSize;
      const plcx = plx + tileSize / 2;
      const plcy = ply + tileSize / 2;
      const nowPl = Date.now();
      const plPulse = 0.6 + 0.4 * Math.sin(nowPl / 500);
      
      ctx.save();
      // Outer radial glow halo
      const plGrad = ctx.createRadialGradient(plcx, plcy, 0, plcx, plcy, tileSize * 0.9);
      plGrad.addColorStop(0, `rgba(0,229,255,${plPulse * 0.55})`);
      plGrad.addColorStop(0.5, `rgba(0,180,255,${plPulse * 0.2})`);
      plGrad.addColorStop(1, 'rgba(0,100,255,0)');
      ctx.fillStyle = plGrad;
      ctx.fillRect(plx - tileSize * 0.3, ply - tileSize * 0.3, tileSize * 1.6, tileSize * 1.6);
      // Solid inner tile
      ctx.globalAlpha = 0.2 + plPulse * 0.15;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(plx, ply, tileSize, tileSize);
      ctx.globalAlpha = 1.0;
      // Glowing border
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8 + plPulse * 6;
      ctx.strokeRect(plx + 1, ply + 1, tileSize - 2, tileSize - 2);
      // Player symbol
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10 + plPulse * 8;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${tileSize * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(PLAYER.symbol, plcx, plcy);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Limited vision (fog of war) — SURVIVAL_HORROR mode
    if (gameState.visionRadius && gameState.player) {
      this._renderFogOfWar(gameState, ctx, tileSize);
    }

    // Render particles (use gameState.particles)
    const particles = gameState.particles;
    if (particles && particles.length) {
      particles.forEach(particle => {
        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, particle.life / (particle.maxLife || 20));
          ctx.fillStyle = particle.color || '#fff';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.r || 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    }

    // Memory flash ring (expands from MEM tile, reveals hidden area)
    if (gameState.memoryFlash) {
      const { x, y, radius, expiresMs } = gameState.memoryFlash;
      const age = expiresMs - Date.now();
      if (age > 0) {
        const progress = 1 - age / 800;
        const ringR = progress * radius * tileSize;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.8;
        ctx.strokeStyle = '#66ccff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc((x + 0.5) * tileSize, (y + 0.5) * tileSize, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        delete gameState.memoryFlash;
      }
    }

    // Recovery tool overlays (echo trail, consequence preview, impulse buffer, alerts)
    renderRecoveryOverlays(gameState, ctx, tileSize);

    // ── End of grid-space rendering — restore canvas transform ────────────
    ctx.restore();

    // World distortion overlay (emotional engine effect)
    const distortion = gameState.worldDistortion || 0;
    if (distortion > 0.1) {
      const alpha = Math.min(0.35, distortion * 0.45);
      ctx.fillStyle = distortion > 0.7 ? `rgba(180,0,40,${alpha})` : `rgba(80,0,160,${alpha})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // Vignette effect at extreme distortion
      if (distortion > 0.6) {
        const grad = ctx.createRadialGradient(
          ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
          ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.7
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.6, (distortion - 0.6) * 1.5)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }

    // ── Dreamscape transition flash (when switching worlds between levels) ──
    if (gameState._dreamscapeTransition) {
      const { color, label, startMs, durationMs } = gameState._dreamscapeTransition;
      const age = Date.now() - startMs;
      if (age < durationMs) {
        // Fast flash-in (0→200ms) then quick fade-out (200→1800ms)
        const fadeIn  = Math.min(1, age / 200);
        const fadeOut = age > 200 ? Math.max(0, 1 - (age - 200) / (durationMs - 200)) : 1;
        const a = fadeIn * fadeOut;
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cw, ch);
        ctx.globalAlpha = a;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.floor(cw / 14)}px monospace`;
        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        ctx.fillText(label, cw / 2, ch / 2 - Math.floor(cw / 20));
        ctx.font = `${Math.floor(cw / 28)}px monospace`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('ENTERING NEW DREAMSCAPE', cw / 2, ch / 2 + Math.floor(cw / 20));
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._dreamscapeTransition;
      }
    }

    // ── Level-complete transition overlay ────────────────────────────────
    if (this._levelFlashMs > 0) {
      const total = this._LEVEL_FLASH_TOTAL;
      const remaining = this._levelFlashMs;
      const age = total - remaining;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      // Smooth fade-in (0→400ms) + solid hold + fade-out (last 600ms)
      const fadeIn  = Math.min(1, age / 400);
      const fadeOut = remaining < 600 ? remaining / 600 : 1;
      const alpha   = fadeIn * fadeOut;

      const completed = this._completedLevel || (gameState.level - 1);
      const earned    = this._levelScoreEarned || (500 * completed);
      const theme     = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
      const accent    = theme.accent || '#00ff88';

      ctx.save();

      // Nearly-opaque background so text is fully legible
      ctx.globalAlpha = alpha * 0.93;
      ctx.fillStyle   = theme.bg || '#040408';
      ctx.fillRect(0, 0, w, h);

      // Subtle accent scanlines at ±35% height
      ctx.globalAlpha = alpha * 0.25;
      ctx.strokeStyle = accent;
      ctx.lineWidth   = 1;
      [[h * 0.38, w * 0.08, w * 0.92], [h * 0.64, w * 0.08, w * 0.92]].forEach(([y, x0, x1]) => {
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      });

      ctx.globalAlpha = alpha;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';

      // ── Header: level complete ───────────────────────────────────────
      ctx.shadowColor = accent;
      ctx.shadowBlur  = 22;
      ctx.fillStyle   = accent;
      ctx.font        = `bold ${Math.floor(w / 13)}px monospace`;
      ctx.fillText(`LEVEL  ${completed}  COMPLETE`, w / 2, h * 0.30);
      ctx.shadowBlur  = 0;

      // ── Score earned ────────────────────────────────────────────────
      ctx.fillStyle = '#ffdd88';
      ctx.font      = `${Math.floor(w / 24)}px monospace`;
      ctx.fillText(`+${earned.toLocaleString()} pts earned`, w / 2, h * 0.43);

      // ── Total score ─────────────────────────────────────────────────
      ctx.fillStyle = '#778899';
      ctx.font      = `${Math.floor(w / 30)}px monospace`;
      ctx.fillText(`Total: ${(gameState.score || 0).toLocaleString()}`, w / 2, h * 0.50);

      // ── Next level line ──────────────────────────────────────────────
      ctx.fillStyle = '#99aacc';
      ctx.font      = `${Math.floor(w / 26)}px monospace`;
      ctx.fillText(`Level ${gameState.level} loading...`, w / 2, h * 0.59);

      // ── Skip prompt (appears after hard-block expires at 1.5s) ───────
      if (age > 1500) {
        ctx.globalAlpha = alpha * Math.min(1, (age - 1500) / 300);
        ctx.fillStyle   = '#445566';
        ctx.font        = `${Math.floor(w / 38)}px monospace`;
        ctx.fillText('Move or Space to continue', w / 2, h * 0.72);
        ctx.globalAlpha = alpha;
      }

      ctx.restore();
    }

    // Boss alert banner
    if (gameState._bossAlert) {
      const { text, subtext, shownAtMs, durationMs, color } = gameState._bossAlert;
      const age = Date.now() - shownAtMs;
      if (age < durationMs) {
        const alpha = Math.min(1, age / 300) * (age > durationMs - 500 ? (durationMs - age) / 500 : 1);
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = 'rgba(20,0,10,0.9)';
        ctx.fillRect(0, h * 0.38, w, h * 0.26);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.floor(w / 15)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillText(text, w / 2, h * 0.47);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#cc88aa';
        ctx.font = `${Math.floor(w / 30)}px monospace`;
        ctx.fillText(subtext, w / 2, h * 0.56);
        ctx.restore();
      } else {
        delete gameState._bossAlert;
      }
    }

    // Learning challenge overlay (rendered last — on top of everything)
    renderLearningChallenge(gameState, ctx);

    // Dream yoga overlays (lucidity meter, body scan, lucid event)
    renderDreamYogaOverlays(gameState, ctx);

    // Campaign narrative
    renderCampaignNarrative(gameState, ctx);

    // Upgrade shop (if open)
    renderUpgradeShop(gameState, ctx);

    // Archetype overlay (cooldown bar + activation message)
    renderArchetypeOverlay(gameState, ctx);

    // Hallucinations (chaos phantoms rendered as purple flicker tiles)
    if (gameState._hallucinations?.length) {
      const now = Date.now();
      for (const h of gameState._hallucinations) {
        const flicker = Math.sin(now / 80 + h.x * 1.3 + h.y * 0.9) > 0;
        if (flicker) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = '#8800cc';
          ctx.fillRect(h.x * tileSize, h.y * tileSize, tileSize, tileSize);
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = '#dd00ff';
          ctx.font = `${tileSize * 0.55}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', h.x * tileSize + tileSize / 2, h.y * tileSize + tileSize / 2);
          ctx.restore();
        }
      }
    }

    // Matrix A/B notification message
    if (gameState._matrixMsg && Date.now() < gameState._matrixMsg.expiresMs) {
      const fade = Math.min(1, (gameState._matrixMsg.expiresMs - Date.now()) / 600);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = gameState._matrixMsg.color;
      ctx.font = `bold ${Math.floor(ctx.canvas.width / 24)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = gameState._matrixMsg.color;
      ctx.shadowBlur = 10;
      ctx.fillText(gameState._matrixMsg.text, ctx.canvas.width / 2, ctx.canvas.height * 0.88);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Glitch Pulse charge bar (bottom-right) + message
    const gpc = gameState.glitchPulseCharge || 0;
    const gpbw = 80, gpbh = 8;
    const gpbx = ctx.canvas.width - gpbw - 8;
    const gpby = ctx.canvas.height - 48;
    ctx.save();
    ctx.fillStyle = '#110011';
    ctx.fillRect(gpbx, gpby, gpbw, gpbh);
    ctx.fillStyle = gpc >= 100 ? '#aa00ff' : '#551177';
    ctx.fillRect(gpbx, gpby, Math.round(gpbw * gpc / 100), gpbh);
    ctx.strokeStyle = '#332244';
    ctx.lineWidth = 1;
    ctx.strokeRect(gpbx, gpby, gpbw, gpbh);
    ctx.fillStyle = gpc >= 100 ? '#dd00ff' : '#667';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`R Pulse${gpc >= 100 ? ' ✓' : ` ${gpc}%`}`, gpbx + gpbw, gpby - 2);
    ctx.restore();

    if (gameState._glitchPulseMsg && Date.now() < gameState._glitchPulseMsg.expiresMs) {
      const fade = Math.min(1, (gameState._glitchPulseMsg.expiresMs - Date.now()) / 500);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = '#aa00ff';
      ctx.font = `bold ${Math.floor(ctx.canvas.width / 22)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#aa00ff';
      ctx.shadowBlur = 14;
      ctx.fillText(gameState._glitchPulseMsg.text, ctx.canvas.width / 2, ctx.canvas.height * 0.82);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Matrix A energy bar (top-right, below HUD)
    {
      const energy = gameState.energy || 0;
      const embw = 60, embh = 5;
      const embx = ctx.canvas.width - embw - 8;
      const emby = 6;
      ctx.save();
      ctx.fillStyle = '#110022';
      ctx.fillRect(embx, emby, embw, embh);
      const matCol = gameState.matrixActive === 'A' ? '#ff3344' : '#00ff88';
      ctx.fillStyle = matCol;
      ctx.fillRect(embx, emby, Math.round(embw * energy / 100), embh);
      ctx.strokeStyle = '#334';
      ctx.lineWidth = 1;
      ctx.strokeRect(embx, emby, embw, embh);
      ctx.fillStyle = matCol;
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const matLabel = gameState.matrixActive === 'A' ? 'A ERASURE' : 'B COHERENCE';
      ctx.fillText(`⇄ ${matLabel}`, embx + embw, emby - 1);
      ctx.restore();
    }

    // Breathing pause prompt (RITUAL mode, shown between levels)
    if (gameState._breathingPrompt) {
      const { text, subtext, shownAtMs, durationMs, color } = gameState._breathingPrompt;
      const age = Date.now() - shownAtMs;
      if (age < durationMs) {
        const fade = Math.min(1, age / 400) * (age > durationMs - 600 ? (durationMs - age) / 600 : 1);
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        // Animated breathing circle
        const breathPhase = (age % 4000) / 4000;
        const r = 30 + 20 * Math.sin(breathPhase * Math.PI * 2);
        ctx.save();
        ctx.globalAlpha = fade * 0.18;
        ctx.fillStyle = '#aaccff';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = fade;
        ctx.fillStyle = color;
        ctx.font = `${Math.floor(w / 14)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, h / 2 - 12);
        ctx.fillStyle = '#8899bb';
        ctx.font = `${Math.floor(w / 32)}px monospace`;
        ctx.fillText(subtext, w / 2, h / 2 + 20);
        ctx.restore();
      } else {
        delete gameState._breathingPrompt;
      }
    }

    // ── Combo multiplier indicator (bottom-left) ─────────────────────────
    const combo = gameState.combo || 0;
    if (combo >= 2) {
      const comboMul = (1 + Math.min(3, (combo - 1) * 0.2)).toFixed(1);
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      // Cosine pulse on fresh combo hits: scale briefly exceeds 1.0 then settles
      const COMBO_PULSE_DURATION_MS = 220;  // pulse lasts 220ms after each collect
      const COMBO_PULSE_AMPLITUDE   = 0.18; // scale goes up to 1.18× at peak
      const timeSinceLastCombo = gameState.comboTimer ? Date.now() - gameState.comboTimer : 9999;
      const pulse = timeSinceLastCombo < COMBO_PULSE_DURATION_MS
        ? 1 + COMBO_PULSE_AMPLITUDE * Math.cos(timeSinceLastCombo / COMBO_PULSE_DURATION_MS * Math.PI / 2)
        : 1.0;
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const fontSize = Math.floor(w / 22 * pulse);
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.shadowColor = '#ffdd44';
      ctx.shadowBlur = 8 * pulse;
      ctx.fillStyle = combo >= 10 ? '#ff9900' : '#ffdd44';
      ctx.fillText(`×${comboMul} COMBO ${combo}`, 10, h - 10);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ── Synergy banner (center, timed) ──────────────────────────────────
    if (gameState._synergyBanner) {
      const { text, shownAtMs, durationMs } = gameState._synergyBanner;
      const age = Date.now() - shownAtMs;
      if (age < durationMs) {
        const fade = Math.min(1, age / 250) * (age > durationMs - 500 ? (durationMs - age) / 500 : 1);
        const w = ctx.canvas.width;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#ffdd88';
        ctx.font = `bold ${Math.floor(w / 26)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 12;
        ctx.fillText(`✦ ${text} ✦`, w / 2, ctx.canvas.height * 0.78);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._synergyBanner;
      }
    }

    // ── Quest completed banner (used by RPGMode, shown on grid too) ──────
    if (gameState._questCompleted) {
      const now = Date.now();
      if (!gameState._questCompletedAt) gameState._questCompletedAt = now;
      const age = now - gameState._questCompletedAt;
      const dur = 3000;
      if (age < dur) {
        const fade = Math.min(1, age / 300) * (age > dur - 600 ? (dur - age) / 600 : 1);
        const w = ctx.canvas.width;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#aaffcc';
        ctx.font = `bold ${Math.floor(w / 26)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        ctx.fillText(`◇ QUEST: ${gameState._questCompleted}`, w / 2, ctx.canvas.height * 0.85);
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        delete gameState._questCompleted;
        delete gameState._questCompletedAt;
      }
    }

    // ── Phase 9: Intelligence overlays ─────────────────────────────────────

    // Logic Puzzle: sequence challenge (shown after each dreamscape completion)
    const challenge = logicPuzzles.activeChallenge;
    if (challenge) {
      const a    = logicPuzzles.challengeAlpha;
      const cw   = ctx.canvas.width;
      const ch   = ctx.canvas.height;
      const PW   = Math.min(380, Math.floor(cw * 0.72));
      const PH   = 110;
      const cpx  = Math.floor((cw - PW) / 2);
      const cpy  = Math.floor(ch * 0.18);
      ctx.save();
      ctx.globalAlpha = a * 0.96;
      ctx.fillStyle   = 'rgba(4,6,20,0.96)';
      ctx.fillRect(cpx, cpy, PW, PH);
      ctx.strokeStyle = '#00ffee';
      ctx.lineWidth   = 1;
      ctx.strokeRect(cpx, cpy, PW, PH);
      ctx.globalAlpha = a;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle   = '#00ffee';
      ctx.font        = `bold ${Math.floor(cw / 32)}px monospace`;
      ctx.shadowColor = '#00ffee';
      ctx.shadowBlur  = 8;
      ctx.fillText(`◆ ${challenge.name}`, cw / 2, cpy + 20);
      ctx.shadowBlur  = 0;
      // Sequence display
      ctx.fillStyle = '#ccddff';
      ctx.font      = `${Math.floor(cw / 28)}px monospace`;
      ctx.fillText(`${challenge.seq.join('  ·  ')}  ·  ?`, cw / 2, cpy + 50);
      // Next answer
      ctx.fillStyle = '#ffdd44';
      ctx.font      = `bold ${Math.floor(cw / 30)}px monospace`;
      ctx.fillText(`Next: ${challenge.next}`, cw / 2, cpy + 75);
      // Fact below
      ctx.fillStyle = '#667788';
      ctx.font      = `${Math.floor(cw / 44)}px monospace`;
      // Truncate fact to canvas width
      const maxChars = Math.floor(PW / 6.5);
      const fact = challenge.fact.length > maxChars ? challenge.fact.slice(0, maxChars - 1) + '…' : challenge.fact;
      ctx.fillText(fact, cw / 2, cpy + 96);
      ctx.restore();
    }

    // Emotion Recognition: dominant emotion label flash (right-side HUD)
    const emotionFlash = emotionRecognition.flashLabel;
    if (emotionFlash) {
      const ea  = emotionRecognition.flashAlpha;
      const ew  = ctx.canvas.width;
      const eh  = ctx.canvas.height;
      const EW  = Math.min(180, Math.floor(ew * 0.32));
      const efx = ew - EW - 8;
      const efy = Math.floor(eh * 0.52);
      ctx.save();
      ctx.globalAlpha = ea * 0.92;
      ctx.fillStyle   = 'rgba(4,6,20,0.88)';
      ctx.fillRect(efx, efy, EW, 52);
      ctx.strokeStyle = emotionFlash.color;
      ctx.lineWidth   = 1;
      ctx.strokeRect(efx, efy, EW, 52);
      ctx.globalAlpha = ea;
      ctx.textAlign   = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle   = emotionFlash.color;
      ctx.font        = `bold ${Math.floor(ew / 34)}px monospace`;
      ctx.fillText(emotionFlash.label, efx + 8, efy + 8);
      ctx.fillStyle = '#778899';
      ctx.font      = `${Math.floor(ew / 52)}px monospace`;
      // Word-wrap tip to EW width
      const tipMax = Math.floor((EW - 16) / 5.5);
      const tip = emotionFlash.tip.length > tipMax ? emotionFlash.tip.slice(0, tipMax) + '…' : emotionFlash.tip;
      ctx.fillText(tip, efx + 8, efy + 28);
      ctx.restore();
    }

    // Empathy Training: compassion phrase (bottom-center) when enemy stunned
    const compassPhrase = empathyTraining.compassPhrase;
    if (compassPhrase) {
      const cpAlpha = Math.min(1, compassPhrase.timer / 20);
      const ew = ctx.canvas.width;
      ctx.save();
      ctx.globalAlpha = cpAlpha * 0.88;
      ctx.fillStyle   = '#aaddff';
      ctx.font        = `${Math.floor(ew / 36)}px monospace`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(compassPhrase.text, ew / 2, ctx.canvas.height - 16);
      ctx.restore();
    }

    // Empathy emotion flash (top-left context label when first encountering new behavior)
    const empathyFlash = empathyTraining.flashEmotion;
    if (empathyFlash) {
      const epa = empathyTraining.flashAlpha;
      const ew  = ctx.canvas.width;
      ctx.save();
      ctx.globalAlpha = epa * 0.9;
      ctx.fillStyle   = empathyFlash.color;
      ctx.font        = `${Math.floor(ew / 38)}px monospace`;
      ctx.textAlign   = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = empathyFlash.color;
      ctx.shadowBlur  = 6;
      ctx.fillText(`⟳ ${empathyFlash.label}`, 8, ctx.canvas.height * 0.6);
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = '#778899';
      ctx.font        = `${Math.floor(ew / 52)}px monospace`;
      const insightMax = Math.floor((ctx.canvas.width * 0.35) / 5.5);
      const ins = empathyFlash.insight.length > insightMax
        ? empathyFlash.insight.slice(0, insightMax) + '…'
        : empathyFlash.insight;
      ctx.fillText(ins, 8, ctx.canvas.height * 0.6 + 16);
      ctx.restore();
    }

    // Achievement badge (top-right)
    achievementSystem.renderBadge(ctx, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * Render fog-of-war overlay for limited-vision modes (e.g. SURVIVAL_HORROR)
   * Called inside the grid-space translate context; compensates for the offset
   * when filling the full canvas with darkness.
   */
  _renderFogOfWar(gameState, ctx, tileSize) {
    const radius = gameState.visionRadius; // in tiles
    const px = (gameState.player.x + 0.5) * tileSize;
    const py = (gameState.player.y + 0.5) * tileSize;
    const pixelRadius = radius * tileSize;

    // Fill entire canvas with darkness — compensate for active translate offset
    const xOff = this._xOff || 0;
    const yOff = this._yOff || 0;
    const grad = ctx.createRadialGradient(px, py, pixelRadius * 0.4, px, py, pixelRadius);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0.96)');

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.96)';
    // Extend the fill to cover the full canvas accounting for the translation offset
    ctx.fillRect(-xOff, -yOff, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, pixelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /**
   * Handle input for grid-based gameplay
   */
  handleInput(gameState, input) {
    const now = Date.now();

    // ── GAME_OVER: ENTER restarts the level; ESC is handled by main.js ───
    if (gameState.state === 'GAME_OVER') {
      const age = gameState._gameOverAt ? now - gameState._gameOverAt : 9999;
      if (age > 1200 && (input.isKeyPressed('Enter') || input.isKeyPressed(' '))) {
        // Soft restart: reset level to 1, fresh player, clear game-over flag
        gameState.state = 'PLAYING';
        gameState.level = 1;
        gameState.score = 0;
        gameState.combo = 0;
        gameState.comboTimer = null;
        gameState.player = createPlayer();
        gameState.glitchPulseCharge = 0;
        gameState.energy = 60;
        gameState.insightTokens = 0;
        gameState.peaceCollected = 0;
        gameState.peaceTotal = 0;
        this._gameOverMsg = null;
        delete gameState._gameOverAt;
        this.generateLevel(gameState);
      }
      return;
    }

    // ── Level transition: block input until overlay has been readable ──────
    if (this._levelFlashMs > 0) {
      const age = this._LEVEL_FLASH_TOTAL - this._levelFlashMs;
      // Hard block for first 1.5s so the player always reads the screen.
      if (age < 1500) return;
      // After 1.5s: any directional move or SPACE/ENTER dismisses the overlay.
      const dir = input.getDirectionalInput?.();
      if ((dir && (dir.x !== 0 || dir.y !== 0))
          || input.isKeyPressed?.(' ')
          || input.isKeyPressed?.('Enter')) {
        this._levelFlashMs = 0;
      }
      return;
    }

    // SHIFT: toggle Matrix A ↔ B
    if (input.isKeyPressed('Shift')) {
      gameState.matrixActive = gameState.matrixActive === 'A' ? 'B' : 'A';
      gameState._matrixMsg = {
        text: gameState.matrixActive === 'A' ? '◈ MATRIX A — ERASURE' : '◈ MATRIX B — COHERENCE',
        color: gameState.matrixActive === 'A' ? '#ff3344' : '#00ff88',
        expiresMs: now + 1800,
      };
      logicPuzzles.onMatrixSwitch();
    }

    // J key: activate archetype power
    if (input.isKeyPressed('j') || input.isKeyPressed('J')) {
      activateArchetype(gameState);
    }

    // R key: fire Glitch Pulse (clears hazards radius 3, stuns enemies radius 4)
    if (input.isKeyPressed('r') || input.isKeyPressed('R')) {
      if ((gameState.glitchPulseCharge || 0) >= 100) {
        gameState.glitchPulseCharge = 0;
        const sz = gameState.gridSize;
        const px = gameState.player?.x ?? 0;
        const py = gameState.player?.y ?? 0;
        let cleared = 0;
        for (let y = 0; y < sz; y++) {
          for (let x = 0; x < sz; x++) {
            if (Math.abs(y - py) + Math.abs(x - px) <= 3 && TILE_DEF[gameState.grid[y]?.[x]]?.d > 0) {
              gameState.grid[y][x] = T.VOID;
              cleared++;
            }
          }
        }
        for (const e of (gameState.enemies || [])) {
          if (Math.abs(e.y - py) + Math.abs(e.x - px) <= 4) {
            e.stunTimer = 1800;
            e.stunTurns = 4;
          }
        }
        if (gameState.emotionalField?.add) gameState.emotionalField.add('joy', 0.8);
        gameState._glitchPulseMsg = {
          text: `GLITCH PULSE! ${cleared} CLEARED`,
          color: '#aa00ff',
          expiresMs: now + 2000,
        };
        createParticles(gameState, px, py, '#aa00ff', 18);
        try { window.AudioManager?.play('power'); } catch(e) {}
      }
    }

    // U key: toggle upgrade shop (if player has insight tokens)
    if (input.isKeyPressed('u') || input.isKeyPressed('U')) {
      if (gameState._shopOpen) {
        closeUpgradeShop(gameState);
      } else if ((gameState.insightTokens || 0) > 0) {
        openUpgradeShop(gameState);
      }
    }

    // Upgrade shop input
    if (gameState._shopOpen) {
      const pressedKeys = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', 'Enter', ' ', 'Escape', 'q', 'Q'];
      for (const k of pressedKeys) {
        if (input.isKeyPressed(k)) {
          handleShopInput(gameState, k);
          break;
        }
      }
      return; // block movement while shop open
    }

    // Learning challenge: consume all input while active
    if (gameState._learningChallenge) {
      const pressedKeys = ['1','2','3','4','Enter',' ','ArrowUp','ArrowDown','w','W','s','S'];
      for (const k of pressedKeys) {
        if (input.isKeyPressed(k)) {
          handleChallengeInput(gameState, k);
          break;
        }
      }
      return; // block movement while challenge is active
    }
    
    // Throttle movement
    if (now - this.lastMoveTime < this.moveDelay) {
      return;
    }

    // Stun check (trap tiles set stunTurns)
    if (gameState.player?.stunTurns > 0) {
      gameState.player.stunTurns--;
      this.lastMoveTime = now; // consumes a "turn"
      return;
    }

    // PUZZLE mode undo: Z key (U is reserved for upgrade shop)
    if (gameState.mechanics?.undoEnabled && (input.isKeyPressed('z') || input.isKeyPressed('Z'))) {
      undoGameMove(gameState);
      this.lastMoveTime = now;
      return;
    }

    // Get directional input
    const dir = input.getDirectionalInput();
    
    if (dir.x !== 0 || dir.y !== 0) {
      // Store last direction for consequence preview
      gameState._lastDir = { x: dir.x, y: dir.y };

      // Compute target tile
      const targetX = gameState.player.x + dir.x;
      const targetY = gameState.player.y + dir.y;

      // Impulse Buffer: mandatory pause before hazard tiles
      if (checkImpulseBuffer(gameState, targetX, targetY, now)) {
        // Move blocked — countdown is running, don't advance lastMoveTime
        return;
      }

      // Save undo snapshot for PUZZLE mode before moving
      if (gameState.mechanics?.undoEnabled) {
        if (!gameState.history) gameState.history = [];
        const snap = {
          player: { ...gameState.player },
          grid: gameState.grid.map(row => [...row]),
          peaceCollected: gameState.peaceCollected,
          peaceTotal: gameState.peaceTotal,
          score: gameState.score,
          movesRemaining: gameState.movesRemaining,
        };
        gameState.history.push(snap);
        if (gameState.history.length > 20) gameState.history.shift(); // cap at 20
      }

      // Save archetype rewind history before moving
      saveArchetypeHistory(gameState);

      // Attempt to move player — player.js:movePlayer handles all tile interactions
      // including peace node collection, particles, audio, and peaceCollected increment
      const moved = movePlayer(gameState, dir.x, dir.y);
      
      if (moved) {
        this.lastMoveTime = now;
        // Record echo position (pattern trail)
        recordEchoPosition(gameState);

        // ── Behavioral emotion tracking ─────────────────────────────────
        if (gameState.emotionalField?.observeBehavior) {
          const behaviorCtx = {
            hp: gameState.player?.hp,
            maxHp: gameState.player?.maxHp || 100,
            combo: gameState.combo || 0,
          };
          // Detect rapid movement (interval since last move very short)
          const moveInterval = now - (this._prevMoveTime || 0);
          this._prevMoveTime = now;
          if (moveInterval < 180) {
            gameState.emotionalField.observeBehavior('rapid_move', behaviorCtx);
          } else {
            gameState.emotionalField.observeBehavior('move', behaviorCtx);
          }

          // Check if the player collected a peace node this move
          if (gameState._lastPeaceCollected !== gameState.peaceCollected) {
            gameState.emotionalField.observeBehavior('peace_collect', behaviorCtx);
          }

          // Check if the player reversed direction vs. last move
          if (this._lastMoveDir &&
              dir.x === -this._lastMoveDir.x && dir.y === -this._lastMoveDir.y) {
            gameState.emotionalField.observeBehavior('reverse', behaviorCtx);
          }
          this._lastMoveDir = { x: dir.x, y: dir.y };

          // Check if the next tile is a hazard (approaching a hazard)
          const nextX = gameState.player.x + dir.x;
          const nextY = gameState.player.y + dir.y;
          const nextTile = gameState.grid?.[nextY]?.[nextX];
          if (nextTile && (TILE_DEF[nextTile]?.d || 0) > 0) {
            gameState.emotionalField.observeBehavior('hazard_approach', behaviorCtx);
          }

          // Check if current tile is a hazard (player just entered one)
          const curTile = gameState.grid?.[gameState.player.y]?.[gameState.player.x];
          if (curTile && (TILE_DEF[curTile]?.d || 0) > 0) {
            gameState.emotionalField.observeBehavior('hazard_enter', behaviorCtx);
          }
        }

        // Phase 9: track mindful vs. reactive move
        const usedPreview = (gameState._consequencePreview?.length > 0);
        const impulseActive = !!gameState._impulseBuffer;
        logicPuzzles.onMove(usedPreview, impulseActive);
        if (usedPreview || impulseActive) strategicThinking.onMindfulMove();
        else strategicThinking.onImpulsiveMove();
        // Phase walk: decrement move counter
        if (gameState._phaseWalkMoves > 0) {
          gameState._phaseWalkMoves--;
          if (gameState._phaseWalkMoves === 0) {
            gameState._archetypeMsg = { text: 'PHASE WALK ENDED', color: '#aaddff', expiresMs: now + 1200 };
          }
        }
        // Shield: decrement move counter
        if (gameState._archetypeShield?.moves > 0) {
          gameState._archetypeShield.moves--;
          if (gameState._archetypeShield.moves === 0) {
            delete gameState._archetypeShield;
            gameState._archetypeMsg = { text: 'SHIELD FADED', color: '#446688', expiresMs: now + 1000 };
          }
        }
        // Witness: decrement clarity tile counters on each move
        if (gameState._clarityTiles?.length) {
          gameState._clarityTiles = gameState._clarityTiles.filter(ct => {
            ct.movesLeft--;
            if (ct.movesLeft <= 0) {
              // Restore original shadow tile only if still COVER
              if (gameState.grid[ct.y]?.[ct.x] === T.COVER) {
                gameState.grid[ct.y][ct.x] = ct.original;
              }
              return false;
            }
            return true;
          });
        }
        // Glitch Pulse: charge +15 per peace node collected (tracked via peaceCollected change)
        if (gameState._lastPeaceCollected !== gameState.peaceCollected) {
          gameState.glitchPulseCharge = Math.min(100, (gameState.glitchPulseCharge || 0) + 15);
          gameState._lastPeaceCollected = gameState.peaceCollected;
        }
        // PUZZLE mode: decrement move counter
        if (gameState.movesRemaining !== undefined) {
          gameState.movesRemaining = Math.max(0, gameState.movesRemaining - 1);
        }
        // Trigger move sound if audio available
        try { window.AudioManager?.play('move'); } catch (e) { console.warn('[GridGameMode] Audio error:', e); }
      }
    }
    // Clear last direction when no input (impulse buffer reset on direction change)
    if (dir.x === 0 && dir.y === 0) {
      cancelImpulseBuffer(gameState);
    }
  }

  /**
   * Handle level completion
   */
  onLevelComplete(gameState) {
    console.log(`[GridGameMode] Level ${gameState.level} complete!`);
    this._completedLevel = gameState.level; // capture before increment

    // Capture score earned during this level (before bonus)
    const preBonusScore = gameState.score || 0;
    const levelBonus = 500 * gameState.level;

    // Award bonus points
    gameState.score = preBonusScore + levelBonus;

    // Store total score earned this level (gameplay delta + completion bonus)
    // Use ?? instead of || so a legitimate _levelStartScore of 0 (level 1) is handled correctly
    this._levelScoreEarned = (preBonusScore - (this._levelStartScore ?? 0)) + levelBonus;

    // Start the readable transition overlay (3s total — blocks input for first 1.5s)
    this._levelFlashMs = this._LEVEL_FLASH_TOTAL;
    try { window.AudioManager?.play('level_complete'); } catch(e) {}
    // Gamepad rumble on level complete — celebratory pulse
    try { gameState.input?.vibrateGamepad(0.2, 0.7, 200); } catch(_) {}
    
    // Phase 9: signal dreamscape completion to logic puzzles (surfaces sequence challenge)
    logicPuzzles.onDreamscapeComplete();
    // Reset no-damage tracking for pacifist achievement
    gameState._noDamageThisLevel = true;
    
    // Reset per-level state
    resetRelapseCompassion(gameState);
    
    // Advance level
    gameState.level++;
    
    // Trigger positive emotion
    if (gameState.emotionalField && typeof gameState.emotionalField.add === 'function') {
      gameState.emotionalField.add('joy', 2.0);
      gameState.emotionalField.add('hope', 1.0);
    }

    // RITUAL mode: show a brief breathing pause prompt between levels
    if (gameState.mechanics?.breathingPauses) {
      gameState._breathingPrompt = {
        text: 'Breathe',
        subtext: 'Inhale · Pause · Release',
        shownAtMs: Date.now(),
        durationMs: 3500,
        color: '#aaccff',
      };
    }

    // Upgrade shop: open automatically every 5 levels as reward
    if (gameState.level % 5 === 1 && gameState.level > 1 && (gameState.insightTokens || 0) > 0) {
      openUpgradeShop(gameState);
    }
    
    // Generate new level grid (ready underneath the transition overlay)
    this.generateLevel(gameState);
  }

  /**
   * DESPAIR / HOPELESS tiles slowly spread to adjacent void cells.
   * Based on the glitch-peace tile-spread mechanic — creates a growing sense
   * of environmental pressure as negative emotional tiles multiply.
   */
  _tickTileSpread(gameState) {
    const sz = gameState.gridSize;
    const candidates = [];
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const v = gameState.grid[y]?.[x];
        if ((v === T.DESPAIR || v === T.HOPELESS) && Math.random() < 0.18) {
          for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < sz && nx >= 0 && nx < sz &&
                gameState.grid[ny]?.[nx] === T.VOID) {
              candidates.push({ y: ny, x: nx, type: v });
            }
          }
        }
      }
    }
    // Limit to 2 new tiles per tick to stay gradual
    for (const c of candidates.slice(0, 2)) {
      gameState.grid[c.y][c.x] = c.type;
    }
  }

  /**
   * Handle game over
   */
  onGameOver(gameState) {
    if (gameState.state === 'GAME_OVER') return; // already handled
    console.log('[GridGameMode] Game Over');
    gameState.state = 'GAME_OVER';
    gameState._gameOverAt = Date.now();

    // Persist score to local leaderboard
    const rank = addScore(gameState);
    gameState._leaderboardRank = rank; // show in overlay if top-10

    // Record session analytics
    recordSession(gameState);
    
    // Trigger emotion
    if (gameState.emotionalField && typeof gameState.emotionalField.add === 'function') {
      gameState.emotionalField.add('despair', 1.5);
    }
  }

  /**
   * Compassionate game-over overlay (rendered in place of the grid).
   * Non-punishment framing; shows what was accomplished, offers a gentle way forward.
   * Research basis: relapse compassion design (Sovereign Codex) + polyvagal safety cues.
   */
  _renderGameOver(gameState, ctx) {
    // Pick a compassionate ending message (deterministic based on score mod)
    const messages = [
      'Every pattern teaches. You learned.',
      'The pattern paused. It has not ended.',
      'Returning is not failure — it is courage.',
      'You played. That matters.',
      'The grid remembers your path.',
      'Rest. The pattern will be here.',
    ];
    // Score is divided by this to index into the messages array;
    // 100 gives variety across a typical score range without cycling too fast.
    const GAME_OVER_MESSAGE_SCORE_DIVISOR = 100;
    if (!this._gameOverMsg) {
      this._gameOverMsg = messages[Math.floor((gameState.score || 0) / GAME_OVER_MESSAGE_SCORE_DIVISOR) % messages.length];
    }
    const theme = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const age = gameState._gameOverAt ? Date.now() - gameState._gameOverAt : 9999;

    // Fade-in (600ms)
    const fadeIn = Math.min(1, age / 600);

    ctx.save();
    ctx.globalAlpha = fadeIn * 0.92;
    ctx.fillStyle = theme.bg || '#040408';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = fadeIn;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dim accent lines
    ctx.globalAlpha = fadeIn * 0.18;
    ctx.strokeStyle = '#882244';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.28); ctx.lineTo(w * 0.9, h * 0.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.72); ctx.lineTo(w * 0.9, h * 0.72); ctx.stroke();
    ctx.globalAlpha = fadeIn;

    // Header
    ctx.fillStyle = '#ff4466';
    ctx.font = `bold ${Math.floor(w / 13)}px monospace`;
    ctx.shadowColor = '#ff2244';
    ctx.shadowBlur = 18;
    ctx.fillText('PATTERN INCOMPLETE', w / 2, h * 0.20);
    ctx.shadowBlur = 0;

    // Compassionate message
    ctx.fillStyle = '#aabbcc';
    ctx.font = `${Math.floor(w / 26)}px monospace`;
    ctx.fillText(this._gameOverMsg, w / 2, h * 0.32);

    // Stats row 1: Score & Level
    ctx.fillStyle = '#ffdd88';
    ctx.font = `bold ${Math.floor(w / 26)}px monospace`;
    ctx.fillText(`Score: ${(gameState.score || 0).toLocaleString()}`, w / 2, h * 0.42);

    ctx.fillStyle = '#667799';
    ctx.font = `${Math.floor(w / 30)}px monospace`;
    ctx.fillText(`Level ${gameState.level || 1}  ·  ◈ ${gameState.peaceCollected || 0} peace collected`, w / 2, h * 0.49);

    // Stats row 2: RPG level + quests (if available)
    const rpgLevel = gameState._rpgLevel;
    const questsDone = gameState._questsCompleted || 0;
    if (rpgLevel || questsDone > 0) {
      ctx.fillStyle = '#8899bb';
      ctx.font = `${Math.floor(w / 34)}px monospace`;
      const rpgLine = [
        rpgLevel ? `RPG Lv.${rpgLevel}` : null,
        questsDone > 0 ? `${questsDone} quest${questsDone > 1 ? 's' : ''} completed` : null,
      ].filter(Boolean).join('  ·  ');
      if (rpgLine) ctx.fillText(rpgLine, w / 2, h * 0.555);
    }

    // Stats row 3: Alchemy progress (if any transmutations)
    const transCount = gameState._alchemyTransmutations || 0;
    if (transCount > 0) {
      const alchPhase = gameState._alchemyPhase || 'Novice';
      ctx.fillStyle = '#cc88ff';
      ctx.font = `${Math.floor(w / 36)}px monospace`;
      ctx.fillText(`Alchemy: ${alchPhase}  ·  ${transCount} transmutation${transCount !== 1 ? 's' : ''}`, w / 2, h * 0.60);
    }

    // Dreamscape + play mode line
    const ds = gameState.currentDreamscape || 'RIFT';
    const pm = gameState.playMode && gameState.playMode !== 'ARCADE' ? `  ·  ${gameState.playMode}` : '';
    ctx.fillStyle = '#445566';
    ctx.font = `${Math.floor(w / 38)}px monospace`;
    ctx.fillText(`${ds}${pm}  ·  ${gameState.settings?.difficulty || 'normal'} difficulty`, w / 2, h * 0.645);

    // Leaderboard rank (show only for valid 1-based ranks 1–10)
    if (gameState._leaderboardRank >= 1 && gameState._leaderboardRank <= 10) {
      ctx.fillStyle = gameState._leaderboardRank <= 3 ? '#ffcc44' : '#778899';
      ctx.font = `${Math.floor(w / 32)}px monospace`;
      ctx.fillText(`Personal best #${gameState._leaderboardRank} for this run`, w / 2, h * 0.685);
    }

    // Action prompts (appear after 1.2s)
    if (age > 1200) {
      const promptFade = Math.min(1, (age - 1200) / 400);
      ctx.globalAlpha = fadeIn * promptFade;
      ctx.fillStyle = '#99aacc';
      ctx.font = `${Math.floor(w / 28)}px monospace`;
      ctx.fillText('ENTER  · try again', w / 2, h * 0.75);
      ctx.fillStyle = '#556677';
      ctx.font = `${Math.floor(w / 36)}px monospace`;
      ctx.fillText('ESC  · return to menu', w / 2, h * 0.82);
      ctx.globalAlpha = fadeIn;
    }

    ctx.restore();
  }

  /**
   * Get HUD data specific to grid mode
   */
  getHUDData(gameState) {
    const base = super.getHUDData(gameState);
    const modeState = gameState.modeState;
    
    return {
      ...base,
      objective: `◈ ×${modeState.peaceTotal - modeState.peaceCollected}`,
      enemies: modeState.enemies?.filter(e => e.active).length || 0,
    };
  }

  /**
   * Get save data
   */
  getSaveData(gameState) {
    return {
      ...super.getSaveData(gameState),
      playMode: this.playMode,
      grid: gameState.modeState.grid,
      peaceNodes: gameState.modeState.peaceNodes,
      peaceCollected: gameState.modeState.peaceCollected,
      player: { ...gameState.player },
    };
  }

  /**
   * Load save data
   */
  loadSaveData(gameState, saveData) {
    if (saveData.playMode) {
      this.playMode = saveData.playMode;
    }
    
    if (saveData.grid) {
      gameState.modeState.grid = saveData.grid;
    }
    
    if (saveData.peaceNodes) {
      gameState.modeState.peaceNodes = saveData.peaceNodes;
      gameState.modeState.peaceCollected = saveData.peaceCollected || 0;
      gameState.modeState.peaceTotal = saveData.peaceNodes.length;
    }
    
    if (saveData.player) {
      gameState.player = saveData.player;
    }
  }
}

export default GridGameMode;
