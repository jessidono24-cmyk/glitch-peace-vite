// ═══════════════════════════════════════════════════════════════════════
//  RPG Mode Registration — Phase M5 Skeleton
//  Registers the RPG mode in the ModeRegistry.
// ═══════════════════════════════════════════════════════════════════════

import { modeRegistry } from '../ModeRegistry.js';
import RPGMode from './RPGMode.js';

modeRegistry.register('rpg', RPGMode, {
  name: 'RPG Adventure',
  type: 'rpg',
  description: 'Narrative RPG with dialogue trees, character stats, and quests. Phase M5.',
  icon: '⚔',
});

console.log('[RPGMode] Registered RPG mode (Phase M5 skeleton)');
