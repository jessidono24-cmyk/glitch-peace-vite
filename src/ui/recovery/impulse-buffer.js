'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — impulse-buffer.js — Phase 4
//  Pattern Recognition: Hold-to-confirm for hazard moves
// ═══════════════════════════════════════════════════════════════════════

/**
 * ImpulseBuffer prevents accidental moves into hazards
 * - Safe tiles: instant move
 * - Hazard tiles: require 1-second hold
 * - Shows progress bar during hold
 * - Cancels if key released early
 */

export class ImpulseBuffer {
  constructor() {
    this.activeDirection = null;  // [dy, dx] or null
    this.holdStartTime = 0;
    this.holdDuration = 400;      // 0.4 second in ms — brief pause for awareness without blocking
    this.isHazard = false;
    this.cancelled = false;
  }

  /**
   * Check if a tile is considered hazardous
   * @param {number} tileType - Tile ID from constants
   * @returns {boolean}
   */
  isHazardTile(tileType) {
    // Hazard tiles: DESPAIR=1, TERROR=2, SELF_HARM=3, RAGE=8, HOPELESS=9, TRAP=14, PAIN=16
    return [1, 2, 3, 8, 9, 14, 16].includes(tileType);
  }

  /**
   * Start tracking a move attempt
   * @param {Array} direction - [dy, dx]
   * @param {number} targetTile - Target tile type
   * @param {number} timestamp - Current timestamp
   */
  startMove(direction, targetTile, timestamp) {
    this.activeDirection = direction;
    this.holdStartTime = timestamp;
    this.isHazard = this.isHazardTile(targetTile);
    this.cancelled = false;

    // Safe tiles move instantly
    if (!this.isHazard) {
      return { ready: true, progress: 1.0 };
    }

    return { ready: false, progress: 0.0 };
  }

  /**
   * Update hold progress
   * @param {number} timestamp - Current timestamp
   * @returns {Object} { ready: boolean, progress: 0-1, cancelled: boolean }
   */
  update(timestamp) {
    if (!this.activeDirection || this.cancelled) {
      return { ready: false, progress: 0, cancelled: this.cancelled };
    }

    // Safe tiles always ready
    if (!this.isHazard) {
      return { ready: true, progress: 1.0, cancelled: false };
    }

    const elapsed = timestamp - this.holdStartTime;
    const progress = Math.min(1.0, elapsed / this.holdDuration);

    return {
      ready: progress >= 1.0,
      progress: progress,
      cancelled: false
    };
  }

  /**
   * Cancel current hold
   */
  cancel() {
    this.cancelled = true;
    this.activeDirection = null;
    this.holdStartTime = 0;
    this.isHazard = false;
  }

  /**
   * Reset buffer
   */
  reset() {
    this.activeDirection = null;
    this.holdStartTime = 0;
    this.isHazard = false;
    this.cancelled = false;
  }

  /**
   * Get current progress for rendering
   * @returns {number} 0-1
   */
  getProgress() {
    if (!this.activeDirection || !this.isHazard || this.cancelled) {
      return 0;
    }
    const elapsed = Date.now() - this.holdStartTime;
    return Math.min(1.0, elapsed / this.holdDuration);
  }

  /**
   * Check if currently holding
   * @returns {boolean}
   */
  isHolding() {
    return this.activeDirection !== null && !this.cancelled && this.isHazard;
  }
}
