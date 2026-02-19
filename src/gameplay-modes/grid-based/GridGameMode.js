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

    // Generate initial grid
    this.generateLevel(gameState);
  }

  /**
   * Generate a new level
   */
  generateLevel(gameState) {
    const result = generateGrid(gameState);
    
    // Store in mode state
    gameState.modeState.grid = result.grid || gameState.grid;
    gameState.modeState.peaceNodes = result.peaceNodes || gameState.peaceNodes || [];
    gameState.modeState.peaceTotal = gameState.modeState.peaceNodes.length;
    gameState.modeState.peaceCollected = 0;
    
    // Initialize enemies based on play mode
    const enemyCount = this.getEnemyCount(gameState);
    gameState.modeState.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const enemy = createEnemy(gameState, 'chase');
      if (enemy) {
        gameState.modeState.enemies.push(enemy);
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
   * Update game logic
   */
  update(gameState, deltaTime) {
    const now = Date.now();
    const modeState = gameState.modeState;

    // Update enemies
    if (modeState.enemies && modeState.enemies.length > 0) {
      updateEnemies(gameState, modeState.enemies, deltaTime);
    }

    // Update particles
    if (modeState.particles && modeState.particles.length > 0) {
      updateParticles(modeState.particles, deltaTime);
    }

    // Check win condition
    if (modeState.peaceCollected >= modeState.peaceTotal) {
      this.onLevelComplete(gameState);
    }

    // Check lose condition
    if (gameState.player && gameState.player.hp <= 0) {
      this.onGameOver(gameState);
    }
  }

  /**
   * Render the game
   */
  render(gameState, ctx) {
    const modeState = gameState.modeState;
    const grid = modeState.grid;
    const tileSize = this.tileSize;

    if (!grid) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render grid tiles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const tileDef = TILE_DEF[tile] || {};
        
        // Draw tile
        ctx.fillStyle = tileDef.color || '#1a1a2e';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Draw symbol
        if (tileDef.symbol) {
          ctx.fillStyle = tileDef.textColor || '#fff';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            tileDef.symbol,
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2
          );
        }
      }
    }

    // Render peace nodes
    if (modeState.peaceNodes) {
      modeState.peaceNodes.forEach(node => {
        if (!node.collected) {
          ctx.fillStyle = TILE_DEF[T.PEACE].color;
          ctx.fillRect(node.x * tileSize, node.y * tileSize, tileSize, tileSize);
          
          ctx.fillStyle = TILE_DEF[T.PEACE].textColor;
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            TILE_DEF[T.PEACE].symbol,
            node.x * tileSize + tileSize / 2,
            node.y * tileSize + tileSize / 2
          );
        }
      });
    }

    // Render enemies
    if (modeState.enemies) {
      modeState.enemies.forEach(enemy => {
        if (enemy.active) {
          ctx.fillStyle = enemy.color || '#f00';
          ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
          
          ctx.fillStyle = '#fff';
          ctx.font = `${tileSize * 0.6}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            enemy.symbol || '◆',
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
      
      // Player background
      ctx.fillStyle = PLAYER.BG;
      ctx.fillRect(px, py, tileSize, tileSize);
      
      // Player symbol
      ctx.fillStyle = PLAYER.OUTLINE;
      ctx.font = `${tileSize * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        PLAYER.symbol,
        px + tileSize / 2,
        py + tileSize / 2
      );
    }

    // Render particles
    if (modeState.particles) {
      modeState.particles.forEach(particle => {
        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.fillRect(
            particle.x * tileSize,
            particle.y * tileSize,
            tileSize * 0.3,
            tileSize * 0.3
          );
          ctx.restore();
        }
      });
    }
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

    // Get directional input
    const dir = input.getDirectionalInput();
    
    if (dir.x !== 0 || dir.y !== 0) {
      // Attempt to move player
      const moved = movePlayer(gameState, dir.x, dir.y);
      
      if (moved) {
        this.lastMoveTime = now;
        
        // Check for peace node collection
        this.checkPeaceNodeCollection(gameState);
        
        // Trigger move sound if audio available
        if (window.AudioManager) {
          window.AudioManager.playSound('move');
        }
      }
    }
  }

  /**
   * Check if player collected a peace node
   */
  checkPeaceNodeCollection(gameState) {
    const modeState = gameState.modeState;
    const player = gameState.player;
    
    if (!modeState.peaceNodes) return;
    
    modeState.peaceNodes.forEach(node => {
      if (!node.collected && node.x === player.x && node.y === player.y) {
        node.collected = true;
        modeState.peaceCollected++;
        
        // Award points
        gameState.score += 100;
        
        // Trigger emotional response
        gameState.emotionalField?.trigger('joy', 0.6);
        
        // Create particles
        if (modeState.particles) {
          const particles = createParticles(node.x, node.y, 8);
          modeState.particles.push(...particles);
        }
        
        console.log(`[GridGameMode] Peace node collected (${modeState.peaceCollected}/${modeState.peaceTotal})`);
      }
    });
  }

  /**
   * Handle level completion
   */
  onLevelComplete(gameState) {
    console.log(`[GridGameMode] Level ${gameState.level} complete!`);
    
    // Award bonus points
    gameState.score += 500 * gameState.level;
    
    // Advance level
    gameState.level++;
    
    // Trigger positive emotion
    gameState.emotionalField?.trigger('triumph', 0.8);
    
    // Generate new level
    this.generateLevel(gameState);
  }

  /**
   * Handle game over
   */
  onGameOver(gameState) {
    console.log('[GridGameMode] Game Over');
    gameState.gameState = 'GAME_OVER';
    
    // Trigger emotion
    gameState.emotionalField?.trigger('despair', 0.5);
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
