'use strict';
// ============================================================
//  GLITCH·PEACE — runSpec.js
//  Canonical run-state packet for the Mooncycle Run.
//
//  Shape defined in: /creative inspiration/SYSTEM_WIRING.md
//  Default hub:      Lake Realm (New Moon)
//    — per /creative inspiration/REALM_SPECS.md lines 103-109
// ============================================================

/**
 * Schema version — bump when RunSpec shape changes.
 * Used by runSpecManager for safe localStorage migrations.
 */
export const RUNSPEC_SCHEMA_VERSION = 1;

/**
 * Create a fresh RunSpec with Lake Realm defaults.
 *
 * Fields (from SYSTEM_WIRING.md):
 *   moonPhase        — e.g. "🌑 New Moon — Seed & Declare"
 *   realmId          — e.g. "lake_realm"
 *   archetype        — e.g. "🌱 Nurturer & Creator"
 *   guides           — e.g. ["Water Dancer", "Inner Child"]
 *   predatorOverlay  — e.g. ["Wolf", "Eagle"]
 *   primaryDeities   — simulation-only flavor layer
 *   godforms         — e.g. ["Gatekeeper", "Hearthkeeper"]
 *   creaturePalette  — Array<{name, layer, role, tags}>
 *
 * Lake Realm values from REALM_SPECS.md (lines 103-130):
 *   Phase anchor:   🌑 New Moon — Seed & Declare
 *   Archetype:      🌱 Nurturer & Creator
 *   Primary Deities: Brigid, Quan Yin, Water Dancer
 *   Recommended godforms: Hearthkeeper, Grounding Stone, Gatekeeper
 */
export function createDefaultRunSpec() {
  return {
    moonPhase:       '🌑 New Moon — Seed & Declare',
    realmId:         'lake_realm',
    archetype:       '🌱 Nurturer & Creator',
    guides:          ['Water Dancer', 'Inner Child'],
    predatorOverlay: [],
    primaryDeities:  ['Brigid', 'Quan Yin', 'Water Dancer'],
    godforms:        ['Gatekeeper', 'Hearthkeeper'],
    creaturePalette: [],
  };
}

/**
 * Validate that an object has all required RunSpec keys with correct types.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateRunSpec(obj) {
  const errors = [];
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['RunSpec must be a non-null object'] };
  }

  const stringFields = ['moonPhase', 'realmId', 'archetype'];
  const arrayOfStringFields = ['guides', 'predatorOverlay', 'primaryDeities', 'godforms'];

  for (const f of stringFields) {
    if (typeof obj[f] !== 'string') errors.push(`${f} must be a string`);
  }
  for (const f of arrayOfStringFields) {
    if (!Array.isArray(obj[f])) errors.push(`${f} must be an array`);
  }
  if (!Array.isArray(obj.creaturePalette)) {
    errors.push('creaturePalette must be an array');
  }

  return { valid: errors.length === 0, errors };
}
