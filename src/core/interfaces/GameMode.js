// ═══════════════════════════════════════════════════════════════════════
//  GAME MODE INTERFACE - Base class for all gameplay modes
//  Phase 1: Foundation Enhancement
// ═══════════════════════════════════════════════════════════════════════

/**
 * Base class/interface for all gameplay modes.
 * Each mode (grid-based, shooter, RPG, etc.) implements this interface.
 */
export class GameMode {
  constructor(config = {}) {
    this.id = config.id || 'unknown';
    this.name = config.name || 'Unknown Mode';
    this.type = config.type || 'generic'; // grid, shooter, rpg, strategy, cosmology
    this.config = config;
  }

  /**
   * Initialize the game mode
   * @param {Object} gameState - The global game state
   * @param {HTMLCanvasElement} canvas - The game canvas
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   */
  init(gameState, canvas, ctx) {
    throw new Error('GameMode.init() must be implemented by subclass');
  }

  /**
   * Update game logic (called every frame)
   * @param {Object} gameState - The global game state
   * @param {number} deltaTime - Time since last update in ms
   */
  update(gameState, deltaTime) {
    throw new Error('GameMode.update() must be implemented by subclass');
  }

  /**
   * Render the game (called every frame)
   * @param {Object} gameState - The global game state
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   */
  render(gameState, ctx) {
    throw new Error('GameMode.render() must be implemented by subclass');
  }

  /**
   * Handle input events
   * @param {Object} gameState - The global game state
   * @param {Object} input - Input state object
   */
  handleInput(gameState, input) {
    // Optional: Override if mode needs custom input handling
  }

  /**
   * Cleanup when switching away from this mode
   * @param {Object} gameState - The global game state
   */
  cleanup(gameState) {
    // Optional: Override if mode needs cleanup
  }

  /**
   * Pause the mode
   * @param {Object} gameState - The global game state
   */
  pause(gameState) {
    // Optional: Override for custom pause behavior
  }

  /**
   * Resume the mode
   * @param {Object} gameState - The global game state
   */
  resume(gameState) {
    // Optional: Override for custom resume behavior
  }

  /**
   * Get mode-specific save data
   * @param {Object} gameState - The global game state
   * @returns {Object} Save data for this mode
   */
  getSaveData(gameState) {
    return {
      modeId: this.id,
      modeType: this.type,
    };
  }

  /**
   * Load mode-specific save data
   * @param {Object} gameState - The global game state
   * @param {Object} saveData - Previously saved mode data
   */
  loadSaveData(gameState, saveData) {
    // Optional: Override to restore mode-specific state
  }

  /**
   * Get mode-specific HUD data
   * @param {Object} gameState - The global game state
   * @returns {Object} HUD display data
   */
  getHUDData(gameState) {
    return {
      health: gameState.player?.hp || 0,
      maxHealth: gameState.player?.maxHp || 100,
      level: gameState.level || 1,
      score: gameState.score || 0,
    };
  }
}

export default GameMode;
