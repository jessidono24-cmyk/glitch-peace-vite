'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  game-mode.js
//  Base class for all gameplay modes (Grid, Shooter, RPG, Constellation, etc.)
//  Defines the interface that all modes must implement.
// ═══════════════════════════════════════════════════════════════════════

/**
 * GameMode - Base class for all gameplay modes
 * 
 * Each mode (Grid, Shooter, RPG, etc.) extends this class and implements
 * the required methods. All modes share access to core systems like
 * emotional field, temporal system, and audio.
 */
export class GameMode {
  /**
   * @param {Object} sharedSystems - Core systems available to all modes
   * @param {EmotionalField} sharedSystems.emotionalField
   * @param {TemporalSystem} sharedSystems.temporalSystem
   * @param {SfxManager} sharedSystems.sfxManager
   * @param {ImpulseBuffer} sharedSystems.impulseBuffer
   * @param {ConsequencePreview} sharedSystems.consequencePreview
   */
  constructor(sharedSystems) {
    this.emotionalField = sharedSystems.emotionalField;
    this.temporalSystem = sharedSystems.temporalSystem;
    this.sfxManager = sharedSystems.sfxManager;
    this.impulseBuffer = sharedSystems.impulseBuffer;
    this.consequencePreview = sharedSystems.consequencePreview;
    
    this.name = 'base';  // Override in subclasses
    this.isActive = false;
  }

  /**
   * Initialize the mode with configuration
   * Called when mode is first activated
   * @param {Object} config - Mode-specific configuration
   */
  init(config) {
    this.isActive = true;
    // Override in subclasses
  }

  /**
   * Update mode logic - called every frame
   * @param {number} dt - Delta time in milliseconds
   * @param {Set} keys - Currently pressed keys
   * @param {string} matrixActive - Current matrix state ('A' or 'B')
   * @param {number} ts - Current timestamp
   * @returns {Object|null} State change request (e.g., { phase: 'dead', data: {...} })
   */
  update(dt, keys, matrixActive, ts) {
    // Override in subclasses
    return null;
  }

  /**
   * Render the mode - called every frame
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} ts - Current timestamp
   * @param {Object} renderData - Additional rendering data (stars, visions, etc.)
   */
  render(ctx, ts, renderData) {
    // Override in subclasses
  }

  /**
   * Handle input specific to this mode
   * @param {string} key - Key pressed
   * @param {string} action - 'keydown' or 'keyup'
   * @param {Event} event - Original event
   * @returns {boolean} true if input was handled, false to propagate
   */
  handleInput(key, action, event) {
    // Override in subclasses
    return false;
  }

  /**
   * Cleanup resources when switching away from this mode
   */
  cleanup() {
    this.isActive = false;
    // Override in subclasses if cleanup needed
  }

  /**
   * Get current mode state for saving/persistence
   * @returns {Object} Serializable state object
   */
  getState() {
    // Override in subclasses
    return { name: this.name };
  }

  /**
   * Restore mode from saved state
   * @param {Object} state - Previously saved state
   */
  restoreState(state) {
    // Override in subclasses
  }

  /**
   * Get mode-specific configuration options
   * @returns {Array} Array of config options for UI
   */
  getConfigOptions() {
    // Override in subclasses
    return [];
  }

  /**
   * Called when emotional state changes significantly
   * @param {string} emotion - New dominant emotion
   */
  onEmotionChange(emotion) {
    // Optional override in subclasses
  }

  /**
   * Called when temporal modifiers update
   * @param {Object} modifiers - Current temporal modifiers
   */
  onTemporalUpdate(modifiers) {
    // Optional override in subclasses
  }
}
