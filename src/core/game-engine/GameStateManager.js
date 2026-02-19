// ═══════════════════════════════════════════════════════════════════════
//  GAME STATE MANAGER - Mode-agnostic state management
//  Phase 1: Foundation Enhancement
// ═══════════════════════════════════════════════════════════════════════

import { EmotionalField } from '../emotional-engine.js';
import { TemporalSystem } from '../temporal-system.js';

/**
 * GameStateManager handles the global game state in a mode-agnostic way.
 * Individual gameplay modes can extend this with mode-specific state.
 */
export class GameStateManager {
  constructor(config = {}) {
    this.state = {
      // Core game state
      gameState: 'MENU', // MENU | MENU_DREAMSCAPE | PLAYING | PAUSED | GAME_OVER
      currentMode: null, // Current GameMode instance
      modeType: 'grid', // grid, shooter, rpg, strategy, cosmology
      
      // Universal game properties
      level: 1,
      score: 0,
      
      // Consciousness systems (always active)
      emotionalField: new EmotionalField(),
      temporalSystem: null,
      lastEmotionUpdate: Date.now(),
      emotionDecayRate: 0.05,
      
      // Player (mode-dependent structure)
      player: null,
      
      // Settings
      settings: {
        gridSize: 'medium',
        difficulty: 'normal',
        highContrast: false,
        reducedMotion: false,
        particles: true,
        intensityMul: 1.0,
        audio: false,
        timezone: 'AUTO',
        ...config.settings
      },
      
      // Mode-specific state (managed by active mode)
      modeState: {},
    };
  }

  /**
   * Get current state
   * @returns {Object} The complete game state
   */
  getState() {
    return this.state;
  }

  /**
   * Update a specific state property
   * @param {string} key - State property key
   * @param {any} value - New value
   */
  setState(key, value) {
    this.state[key] = value;
  }

  /**
   * Update multiple state properties
   * @param {Object} updates - Object with state updates
   */
  updateState(updates) {
    Object.assign(this.state, updates);
  }

  /**
   * Initialize consciousness systems
   */
  initConsciousnessSystems() {
    const tz = this.state.settings.timezone === 'AUTO' 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : this.state.settings.timezone;
    this.state.temporalSystem = new TemporalSystem(tz);
  }

  /**
   * Update consciousness systems (called every frame)
   * @param {number} deltaTime - Time since last update
   */
  updateConsciousnessSystems(deltaTime) {
    // Update emotional field
    if (this.state.emotionalField) {
      const now = Date.now();
      const timeSinceLastUpdate = now - this.state.lastEmotionUpdate;
      
      if (timeSinceLastUpdate > 100) { // Update every 100ms
        this.state.emotionalField.decay(this.state.emotionDecayRate);
        this.state.lastEmotionUpdate = now;
      }
    }
    
    // Temporal system doesn't need frame-by-frame updates
  }

  /**
   * Set the current gameplay mode
   * @param {GameMode} mode - The mode instance
   */
  setMode(mode) {
    // Cleanup previous mode
    if (this.state.currentMode) {
      this.state.currentMode.cleanup(this.state);
    }
    
    this.state.currentMode = mode;
    this.state.modeType = mode.type;
    this.state.modeState = {}; // Reset mode-specific state
  }

  /**
   * Get the current gameplay mode
   * @returns {GameMode|null}
   */
  getMode() {
    return this.state.currentMode;
  }

  /**
   * Reset game state (for new game)
   */
  reset() {
    this.state.level = 1;
    this.state.score = 0;
    this.state.emotionalField = new EmotionalField();
    this.state.lastEmotionUpdate = Date.now();
    this.state.modeState = {};
    // Keep settings, temporalSystem
  }

  /**
   * Get save data
   * @returns {Object} Serializable save data
   */
  getSaveData() {
    const saveData = {
      level: this.state.level,
      score: this.state.score,
      modeType: this.state.modeType,
      settings: { ...this.state.settings },
      emotionalField: this.state.emotionalField.serialize(),
      timestamp: Date.now(),
    };

    // Add mode-specific save data
    if (this.state.currentMode) {
      saveData.modeData = this.state.currentMode.getSaveData(this.state);
    }

    return saveData;
  }

  /**
   * Load save data
   * @param {Object} saveData - Previously saved data
   */
  loadSaveData(saveData) {
    if (!saveData) return false;

    this.state.level = saveData.level || 1;
    this.state.score = saveData.score || 0;
    this.state.modeType = saveData.modeType || 'grid';
    
    if (saveData.settings) {
      Object.assign(this.state.settings, saveData.settings);
    }

    if (saveData.emotionalField) {
      this.state.emotionalField.deserialize(saveData.emotionalField);
    }

    return true;
  }

  /**
   * Trigger emotional event
   * @param {string} emotion - Emotion name
   * @param {number} intensity - Intensity (0-1)
   */
  triggerEmotion(emotion, intensity = 0.5) {
    if (this.state.emotionalField) {
      this.state.emotionalField.trigger(emotion, intensity);
    }
  }

  /**
   * Get current emotional state
   * @returns {Object} Dominant emotion and synergies
   */
  getEmotionalState() {
    if (!this.state.emotionalField) return null;
    return {
      dominant: this.state.emotionalField.getDominant(),
      synergies: this.state.emotionalField.checkSynergies(),
      distortion: this.state.emotionalField.distortion,
      coherence: this.state.emotionalField.coherence,
    };
  }

  /**
   * Get temporal modifiers
   * @returns {Object} Current temporal state
   */
  getTemporalState() {
    if (!this.state.temporalSystem) return null;
    return this.state.temporalSystem.getState();
  }
}

export default GameStateManager;
