'use strict';
// ============================================================
//  GLITCH·PEACE — runSpecManager.js
//  Persistence + lifecycle manager for the canonical RunSpec.
//
//  API:
//    runSpecManager.get()              → current RunSpec (copy)
//    runSpecManager.set(partial)       → merge partial, persist
//    runSpecManager.resetToDefault()   → reset to Lake Realm defaults
//
//  Persistence:
//    localStorage key: 'gp_runspec'
//    Versioned — schema mismatch auto-resets to defaults.
//
//  Refs:
//    RunSpec shape: /creative inspiration/SYSTEM_WIRING.md
//    Default hub:   /creative inspiration/REALM_SPECS.md (Lake Realm)
// ============================================================

import {
  createDefaultRunSpec,
  validateRunSpec,
  RUNSPEC_SCHEMA_VERSION
} from './runSpec.js';

const STORAGE_KEY = 'gp_runspec';

/** Deep-clone a plain object (RunSpec is JSON-safe). */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Try to load persisted RunSpec from localStorage.
 * Returns null if missing, corrupted, or schema version mismatch.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const envelope = JSON.parse(raw);

    // Version gate — if schema changed, discard stale data
    if (envelope._schemaVersion !== RUNSPEC_SCHEMA_VERSION) {
      console.warn(
        `[runSpecManager] Schema version mismatch: stored=${envelope._schemaVersion}, ` +
        `current=${RUNSPEC_SCHEMA_VERSION}. Resetting to defaults.`
      );
      return null;
    }

    const spec = envelope.data;
    const { valid, errors } = validateRunSpec(spec);
    if (!valid) {
      console.warn('[runSpecManager] Stored RunSpec failed validation:', errors);
      return null;
    }

    return spec;
  } catch (e) {
    console.warn('[runSpecManager] Failed to load from storage:', e);
    return null;
  }
}

/** Persist current RunSpec to localStorage. */
function saveToStorage(spec) {
  try {
    const envelope = {
      _schemaVersion: RUNSPEC_SCHEMA_VERSION,
      data: spec,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.warn('[runSpecManager] Failed to save to storage:', e);
  }
}

// ── Initialize ────────────────────────────────────────────────
let _current = loadFromStorage() || createDefaultRunSpec();

// ── Public API ────────────────────────────────────────────────
export const runSpecManager = {
  /**
   * Get the current RunSpec (returns a defensive copy).
   */
  get() {
    return clone(_current);
  },

  /**
   * Merge a partial update into the current RunSpec and persist.
   * Only known keys are accepted; unknown keys are silently dropped.
   *
   * @param {Partial<RunSpec>} partial
   * @returns {RunSpec} the updated RunSpec (copy)
   */
  set(partial) {
    if (!partial || typeof partial !== 'object') return this.get();

    const allowed = new Set([
      'moonPhase', 'realmId', 'archetype', 'guides',
      'predatorOverlay', 'primaryDeities', 'godforms', 'creaturePalette',
    ]);

    for (const key of Object.keys(partial)) {
      if (allowed.has(key)) {
        _current[key] = clone(partial[key]);
      }
    }

    saveToStorage(_current);
    return this.get();
  },

  /**
   * Reset to Lake Realm defaults and persist.
   */
  resetToDefault() {
    _current = createDefaultRunSpec();
    saveToStorage(_current);
    return this.get();
  },

  /**
   * Direct read (no copy) for performance-critical paths.
   * Callers must NOT mutate the returned object.
   */
  peek() {
    return _current;
  },
};
