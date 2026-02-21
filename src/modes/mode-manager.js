'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  mode-manager.js
//  Manages multiple gameplay modes and handles switching between them.
//  Central orchestrator for Grid, Shooter, RPG, Constellation modes.
// ═══════════════════════════════════════════════════════════════════════

import { AlchemyMode }      from '../gameplay-modes/alchemy/AlchemyMode.js';
import { ArchitectureMode } from '../gameplay-modes/architecture/ArchitectureMode.js';
import { MycologyMode }     from '../gameplay-modes/mycology/MycologyMode.js';
import { OrnithologyMode }  from '../gameplay-modes/ornithology/OrnithologyMode.js';

/**
 * ModeManager - Orchestrates multiple gameplay modes
 * 
 * Responsibilities:
 * - Register available gameplay modes
 * - Switch between modes
 * - Delegate update/render/input to current mode
 * - Provide shared systems to all modes
 */
export class ModeManager {
  /**
   * @param {Object} sharedSystems - Core systems available to all modes
   */
  constructor(sharedSystems) {
    this.modes = new Map();           // name -> ModeClass
    this.instances = new Map();       // name -> mode instance
    this.currentMode = null;          // Currently active mode instance
    this.currentModeName = null;      // Currently active mode name
    this.sharedSystems = sharedSystems;
    this.config = {};                 // Mode-specific configs

    // Pre-register gameplay-modes/ implementations
    this.registerMode('alchemy',      AlchemyMode);
    this.registerMode('architecture', ArchitectureMode);
    this.registerMode('mycology',     MycologyMode);
    this.registerMode('ornithology',  OrnithologyMode);
  }

  /**
   * Register a gameplay mode
   * @param {string} name - Unique mode name (e.g., 'grid', 'shooter')
   * @param {Class} ModeClass - GameMode subclass
   */
  registerMode(name, ModeClass) {
    if (this.modes.has(name)) {
      console.warn(`Mode '${name}' already registered, overwriting`);
    }
    this.modes.set(name, ModeClass);
  }

  /**
   * Get or create a mode instance
   * @param {string} name - Mode name
   * @returns {GameMode|null} Mode instance or null if not found
   */
  getModeInstance(name) {
    if (!this.modes.has(name)) {
      console.error(`Mode '${name}' not registered`);
      return null;
    }

    // Create instance if it doesn't exist
    if (!this.instances.has(name)) {
      const ModeClass = this.modes.get(name);
      const instance = new ModeClass(this.sharedSystems);
      this.instances.set(name, instance);
    }

    return this.instances.get(name);
  }

  /**
   * Switch to a different gameplay mode
   * @param {string} name - Mode name to switch to
   * @param {Object} config - Configuration for the mode
   * @returns {boolean} true if switch successful
   */
  switchMode(name, config = {}) {
    // Get mode instance
    const newMode = this.getModeInstance(name);
    if (!newMode) {
      return false;
    }

    // Cleanup current mode
    if (this.currentMode) {
      this.currentMode.cleanup();
    }

    // Switch to new mode
    this.currentMode = newMode;
    this.currentModeName = name;
    this.config[name] = config;

    // Initialize new mode
    this.currentMode.init(config);

    console.log(`[ModeManager] Switched to mode: ${name}`);
    return true;
  }

  /**
   * Get current mode name
   * @returns {string|null} Current mode name or null
   */
  getCurrentModeName() {
    return this.currentModeName;
  }

  /**
   * Get current mode instance
   * @returns {GameMode|null} Current mode or null
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Update current mode
   * @param {number} dt - Delta time
   * @param {Set} keys - Pressed keys
   * @param {string} matrixActive - Matrix state
   * @param {number} ts - Timestamp
   * @returns {Object|null} State change request from mode
   */
  update(dt, keys, matrixActive, ts) {
    if (!this.currentMode) {
      return null;
    }
    return this.currentMode.update(dt, keys, matrixActive, ts);
  }

  /**
   * Render current mode
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} ts - Timestamp
   * @param {Object} renderData - Additional render data
   */
  render(ctx, ts, renderData) {
    if (!this.currentMode) {
      return;
    }
    this.currentMode.render(ctx, ts, renderData);
  }

  /**
   * Handle input for current mode
   * @param {string} key - Key pressed
   * @param {string} action - 'keydown' or 'keyup'
   * @param {Event} event - Original event
   * @returns {boolean} true if handled
   */
  handleInput(key, action, event) {
    if (!this.currentMode) {
      return false;
    }
    return this.currentMode.handleInput(key, action, event);
  }

  /**
   * Get list of all registered mode names
   * @returns {Array<string>} Array of mode names
   */
  getAvailableModes() {
    return Array.from(this.modes.keys());
  }

  /**
   * Check if a mode is registered
   * @param {string} name - Mode name
   * @returns {boolean} true if registered
   */
  hasMode(name) {
    return this.modes.has(name);
  }

  /**
   * Get current state of all modes for saving
   * @returns {Object} State object
   */
  getState() {
    const state = {
      currentMode: this.currentModeName,
      configs: this.config,
      modeStates: {}
    };

    // Get state from each initialized mode
    for (const [name, instance] of this.instances.entries()) {
      state.modeStates[name] = instance.getState();
    }

    return state;
  }

  /**
   * Restore state from saved data
   * @param {Object} state - Previously saved state
   */
  restoreState(state) {
    if (!state) return;

    // Restore configs
    this.config = state.configs || {};

    // Restore individual mode states
    if (state.modeStates) {
      for (const [name, modeState] of Object.entries(state.modeStates)) {
        const instance = this.getModeInstance(name);
        if (instance) {
          instance.restoreState(modeState);
        }
      }
    }

    // Switch to saved mode
    if (state.currentMode) {
      const config = this.config[state.currentMode] || {};
      this.switchMode(state.currentMode, config);
    }
  }

  /**
   * Notify all modes of emotional change
   * @param {string} emotion - New emotion
   */
  notifyEmotionChange(emotion) {
    for (const instance of this.instances.values()) {
      if (instance.isActive) {
        instance.onEmotionChange(emotion);
      }
    }
  }

  /**
   * Notify all modes of temporal update
   * @param {Object} modifiers - Temporal modifiers
   */
  notifyTemporalUpdate(modifiers) {
    for (const instance of this.instances.values()) {
      if (instance.isActive) {
        instance.onTemporalUpdate(modifiers);
      }
    }
  }
}
