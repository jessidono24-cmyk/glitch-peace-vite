// ═══════════════════════════════════════════════════════════════════════
//  MODE REGISTRY - Registration and management of gameplay modes
//  Phase 1: Foundation Enhancement
// ═══════════════════════════════════════════════════════════════════════

/**
 * ModeRegistry manages all available gameplay modes.
 * Modes register themselves here and can be loaded dynamically.
 */
export class ModeRegistry {
  constructor() {
    this.modes = new Map();
    this.modesByType = new Map();
  }

  /**
   * Register a gameplay mode
   * @param {string} id - Unique mode identifier
   * @param {Class} ModeClass - The GameMode class
   * @param {Object} metadata - Mode metadata
   */
  register(id, ModeClass, metadata = {}) {
    if (this.modes.has(id)) {
      console.warn(`Mode '${id}' is already registered. Overwriting.`);
    }

    this.modes.set(id, {
      id,
      ModeClass,
      metadata: {
        name: metadata.name || id,
        type: metadata.type || 'generic',
        description: metadata.description || '',
        icon: metadata.icon || '🎮',
        ...metadata
      }
    });

    // Index by type
    const type = metadata.type || 'generic';
    if (!this.modesByType.has(type)) {
      this.modesByType.set(type, []);
    }
    this.modesByType.get(type).push(id);

    console.log(`[ModeRegistry] Registered mode: ${id} (${type})`);
  }

  /**
   * Get a mode by ID
   * @param {string} id - Mode identifier
   * @returns {Object|null} Mode info
   */
  getMode(id) {
    return this.modes.get(id) || null;
  }

  /**
   * Create an instance of a mode
   * @param {string} id - Mode identifier
   * @param {Object} config - Configuration for the mode
   * @returns {GameMode|null} Mode instance
   */
  createMode(id, config = {}) {
    const modeInfo = this.modes.get(id);
    if (!modeInfo) {
      console.error(`[ModeRegistry] Mode '${id}' not found`);
      return null;
    }

    try {
      const instance = new modeInfo.ModeClass({
        ...config,
        id: modeInfo.id,
        name: modeInfo.metadata.name,
        type: modeInfo.metadata.type,
      });
      console.log(`[ModeRegistry] Created instance of mode: ${id}`);
      return instance;
    } catch (error) {
      console.error(`[ModeRegistry] Failed to create mode '${id}':`, error);
      return null;
    }
  }

  /**
   * Get all registered modes
   * @returns {Array} Array of mode info objects
   */
  getAllModes() {
    return Array.from(this.modes.values()).map(m => ({
      id: m.id,
      ...m.metadata
    }));
  }

  /**
   * Get modes by type
   * @param {string} type - Mode type (grid, shooter, rpg, etc.)
   * @returns {Array} Array of mode info objects
   */
  getModesByType(type) {
    const modeIds = this.modesByType.get(type) || [];
    return modeIds.map(id => {
      const m = this.modes.get(id);
      return { id: m.id, ...m.metadata };
    });
  }

  /**
   * Get all mode types
   * @returns {Array<string>} Array of mode type names
   */
  getTypes() {
    return Array.from(this.modesByType.keys());
  }

  /**
   * Check if a mode exists
   * @param {string} id - Mode identifier
   * @returns {boolean}
   */
  hasMode(id) {
    return this.modes.has(id);
  }

  /**
   * Unregister a mode
   * @param {string} id - Mode identifier
   */
  unregister(id) {
    const modeInfo = this.modes.get(id);
    if (modeInfo) {
      // Remove from type index
      const type = modeInfo.metadata.type;
      const typeList = this.modesByType.get(type);
      if (typeList) {
        const index = typeList.indexOf(id);
        if (index !== -1) {
          typeList.splice(index, 1);
        }
      }
      
      // Remove from main registry
      this.modes.delete(id);
      console.log(`[ModeRegistry] Unregistered mode: ${id}`);
    }
  }
}

// Global singleton instance
export const modeRegistry = new ModeRegistry();

export default modeRegistry;
