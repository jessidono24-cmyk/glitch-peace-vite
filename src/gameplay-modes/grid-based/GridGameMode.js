// ═══════════════════════════════════════════════════════════════════════
//  GRID GAME MODE - Grid-based roguelike gameplay
//  Phase 1: Foundation Enhancement - Wraps existing grid logic
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../../core/interfaces/GameMode.js';
import { generateGrid } from './grid-logic.js';
import { createPlayer, movePlayer, takeDamage, heal } from './grid-player.js';
import { createEnemy, updateEnemies } from './grid-enemy.js';
import { createParticles, updateParticles } from './grid-particles.js';
import { T, TILE_DEF, PLAYER } from '../../core/constants.js';
import { applyMode } from '../../systems/play-modes.js';
import { getDreamscapeTheme, applyDreamscapeBias } from '../../systems/dreamscapes.js';
import { updatePowerups, hasPowerup } from '../../systems/powerups.js';

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

    // Initialize timer for timed modes (SPEEDRUN, PATTERN_TRAINING, DAILY, etc.)
    if (gameState.mechanics?.timeLimit && typeof gameState.mechanics.timeLimit === 'number') {
      gameState.timeRemainingMs = gameState.mechanics.timeLimit * 1000;
    }

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

    console.log(`[GridGameMode] Generated level ${gameState.level}`);
  }

  /**
   * Get enemy count based on level and play mode
   */
  getEnemyCount(gameState) {
    // Get from play mode mechanics if specified
    if (gameState.mechanics?.enemyBehavior === 'none') return 0;
    
    // Default: scale with level
    return Math.floor(2 + gameState.level * 0.5);
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

    // Update active powerups (expiry + REGEN effect)
    updatePowerups(gameState);

    // Apply SPEED powerup or SPEEDRUN mode boost to movement delay
    const speedBoost = hasPowerup(gameState, 'movement_boost') ? 2.0 : (gameState.moveSpeedBoost || 1.0);
    this.moveDelay = Math.max(50, Math.round(150 / speedBoost));

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
      this.onGameOver(gameState);
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
        // SHIELD powerup: absorb hit without damage
        if (hasPowerup(gameState, 'absorb_damage')) {
          this._lastEnemyDamageMs = now;
          createParticles(gameState, px, py, '#00aaff', 6);
        } else {
          const dmg = 10;
          gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
          this._lastEnemyDamageMs = now;
          if (gameState.emotionalField?.add) gameState.emotionalField.add('fear', 0.5);
          createParticles(gameState, px, py, 'damage', 8);
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
          ctx.fillStyle = enemy.color || '#ff6600';
          ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
          
          ctx.fillStyle = '#fff';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            enemy.symbol || '■',
            enemy.x * tileSize + tileSize / 2,
            enemy.y * tileSize + tileSize / 2
          );
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

    // Get directional input
    const dir = input.getDirectionalInput();
    
    if (dir.x !== 0 || dir.y !== 0) {
      // Attempt to move player — player.js:movePlayer handles all tile interactions
      // including peace node collection, particles, audio, and peaceCollected increment
      const moved = movePlayer(gameState, dir.x, dir.y);
      
      if (moved) {
        this.lastMoveTime = now;
        // PUZZLE mode: decrement move counter
        if (gameState.movesRemaining !== undefined) {
          gameState.movesRemaining = Math.max(0, gameState.movesRemaining - 1);
        }
        // Trigger move sound if audio available
        try { window.AudioManager?.play('move'); } catch (e) { console.warn('[GridGameMode] Audio error:', e); }
      }
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
    
    // Advance level
    gameState.level++;
    
    // Trigger positive emotion
    if (gameState.emotionalField && typeof gameState.emotionalField.add === 'function') {
      gameState.emotionalField.add('joy', 2.0);
      gameState.emotionalField.add('hope', 1.0);
    }
    
    // Generate new level
    this.generateLevel(gameState);
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
