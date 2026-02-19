// ═══════════════════════════════════════════════════════════════════════
//  GRID GAME MODE - Grid-based roguelike gameplay
//  Phase 1: Foundation Enhancement - Wraps existing grid logic
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';
import { generateGrid } from './grid-logic.js';
import { createPlayer, movePlayer, takeDamage, heal } from './grid-player.js';
import { createEnemy, updateEnemies } from './grid-enemy.js';
import { createParticles, updateParticles } from './grid-particles.js';
import { T, TILE_DEF, PLAYER, DIFF_CFG } from '../../core/constants.js';
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
    this.lastMoveTime = 0;
    this.moveDelay = 150; // ms between moves
    this._levelFlashMs = 0; // countdown ms for "LEVEL COMPLETE" overlay
    this._ENEMY_HIT_COOLDOWN = 600; // ms between enemy collision hits
  }

  /**
   * Initialize the grid-based game mode
   */
  init(gameState, canvas, ctx) {
    console.log('[GridGameMode] Initializing grid-based mode');
    
    // Calculate tile size
    this.tileSize = Math.floor(canvas.width / gameState.gridSize);
    
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
    // generateGrid modifies gameState directly (doesn't return result)
    generateGrid(gameState);

    // Apply dreamscape-specific tile bias
    const dreamscapeId = gameState.currentDreamscape || 'RIFT';
    applyDreamscapeBias(gameState, dreamscapeId);
    
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
        }
      } else {
        this._stillMs = 0;
        this._lastMovePos = { x: gameState.player.x, y: gameState.player.y };
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

    if (!grid || !Array.isArray(grid)) {
      console.warn('[GridGameMode] No grid data to render');
      return;
    }

    // Apply dreamscape background and ambient overlay
    const theme = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dreamscape ambient tint behind tiles
    if (theme.ambient) {
      ctx.fillStyle = theme.ambient;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Render grid tiles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const tileDef = TILE_DEF[tile] || {};
        
        // Draw tile
        ctx.fillStyle = tileDef.bg || '#1a1a2e';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Draw border
        ctx.strokeStyle = tileDef.bd || 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Draw symbol
        if (tileDef.sy) {
          ctx.fillStyle = tileDef.g || tileDef.bd || '#fff';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            tileDef.sy,
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2
          );
        }
      }
    }

    // Render peace nodes (use gameState.peaceNodes)
    const peaceNodes = gameState.peaceNodes;
    if (peaceNodes) {
      peaceNodes.forEach(node => {
        if (!node.collected) {
          ctx.fillStyle = TILE_DEF[T.PEACE].bg;
          ctx.fillRect(node.x * tileSize, node.y * tileSize, tileSize, tileSize);
          
          ctx.fillStyle = TILE_DEF[T.PEACE].g || '#fff';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            TILE_DEF[T.PEACE].sy,
            node.x * tileSize + tileSize / 2,
            node.y * tileSize + tileSize / 2
          );
        }
      });
    }

    // Render enemies (use gameState.enemies)
    const enemies = gameState.enemies;
    if (enemies) {
      enemies.forEach(enemy => {
        if (enemy.active !== false) {
          if (enemy.isBoss) {
            // Boss: pulsing magenta glow, bigger symbol, HP bar
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
            ctx.save();
            ctx.globalAlpha = 0.55 + 0.25 * pulse;
            ctx.fillStyle = '#ff00aa';
            ctx.fillRect(enemy.x * tileSize - 2, enemy.y * tileSize - 2, tileSize + 4, tileSize + 4);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${tileSize * 0.75}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ff44aa';
            ctx.shadowBlur = 12;
            ctx.fillText('◆', enemy.x * tileSize + tileSize / 2, enemy.y * tileSize + tileSize / 2);
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
            ctx.fillStyle = enemy.color || '#ff6600';
            ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
            ctx.fillStyle = '#fff';
            ctx.font = `${tileSize * 0.6}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.symbol || '■', enemy.x * tileSize + tileSize / 2, enemy.y * tileSize + tileSize / 2);
          }
        }
      });
    }

    // Render player
    if (gameState.player) {
      const px = gameState.player.x * tileSize;
      const py = gameState.player.y * tileSize;
      
      // Player glow
      ctx.fillStyle = '#00e5ff';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(px, py, tileSize, tileSize);
      ctx.globalAlpha = 1.0;
      
      // Player symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = `${tileSize * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        PLAYER.symbol,
        px + tileSize / 2,
        py + tileSize / 2
      );
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

    // Level-complete overlay flash
    if (this._levelFlashMs > 0) {
      const completed = this._completedLevel || (gameState.level - 1);
      const bonus = 500 * completed;
      const alpha = Math.min(0.72, this._levelFlashMs / 800);
      const theme = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = theme.accent;
      ctx.font = `bold ${Math.floor(ctx.canvas.width / 12)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 24;
      ctx.fillText(`LEVEL ${completed} COMPLETE`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
      ctx.shadowBlur = 0;
      ctx.font = `${Math.floor(ctx.canvas.width / 22)}px monospace`;
      ctx.fillStyle = '#b8b8d0';
      ctx.fillText(`+${bonus} pts · Level ${gameState.level} begins`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 24);
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
  }

  /**
   * Render fog-of-war overlay for limited-vision modes (e.g. SURVIVAL_HORROR)
   */
  _renderFogOfWar(gameState, ctx, tileSize) {
    const radius = gameState.visionRadius; // in tiles
    const px = (gameState.player.x + 0.5) * tileSize;
    const py = (gameState.player.y + 0.5) * tileSize;
    const pixelRadius = radius * tileSize;

    // Fill entire canvas with darkness then cut out a radial gradient around the player
    const grad = ctx.createRadialGradient(px, py, pixelRadius * 0.4, px, py, pixelRadius);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0.96)');

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.96)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

    // SHIFT: toggle Matrix A ↔ B
    if (input.isKeyPressed('Shift')) {
      gameState.matrixActive = gameState.matrixActive === 'A' ? 'B' : 'A';
      gameState._matrixMsg = {
        text: gameState.matrixActive === 'A' ? '◈ MATRIX A — ERASURE' : '◈ MATRIX B — COHERENCE',
        color: gameState.matrixActive === 'A' ? '#ff3344' : '#00ff88',
        expiresMs: now + 1800,
      };
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

    // PUZZLE mode undo: U key
    if (gameState.mechanics?.undoEnabled && input.isKeyPressed('u') || input.isKeyPressed('U')) {
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
    this._levelFlashMs = 1800; // show completion overlay for 1.8s
    this._completedLevel = gameState.level; // capture before increment
    
    // Award bonus points
    gameState.score += 500 * gameState.level;
    
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
    
    // Generate new level
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
    
    // Trigger emotion
    if (gameState.emotionalField && typeof gameState.emotionalField.add === 'function') {
      gameState.emotionalField.add('despair', 1.5);
    }
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
