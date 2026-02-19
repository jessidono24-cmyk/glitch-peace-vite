// ═══════════════════════════════════════════════════════════════════════
//  RPG Mode Registration — Phase M5 (Active)
//  Registers the RPG mode in the ModeRegistry.
// ═══════════════════════════════════════════════════════════════════════

import { modeRegistry } from '../ModeRegistry.js';
import RPGMode from './RPGMode.js';

modeRegistry.register('rpg', RPGMode, {
  name: 'RPG Adventure',
  type: 'rpg',
  description: 'Narrative RPG — walkable grid world, dialogue trees, character stats, shadow enemies, quests.',
  icon: '⚔',
});

console.log('[RPGMode] Registered RPG Adventure mode (Phase M5 active)');
