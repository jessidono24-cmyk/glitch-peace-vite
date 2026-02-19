// ═══════════════════════════════════════════════════════════════════════
//  GRID-BASED MODE - Entry point and registration
//  Phase 1: Foundation Enhancement
// ═══════════════════════════════════════════════════════════════════════

import { GridGameMode } from './GridGameMode.js';
import { modeRegistry } from '../ModeRegistry.js';

// Register the grid-based mode
modeRegistry.register('grid-classic', GridGameMode, {
  name: 'Grid-Based Roguelike',
  type: 'grid',
  description: 'Traditional grid-based gameplay with 13+ play mode variations',
  icon: '◈',
  playModes: [
    'ARCADE', 'ZEN_GARDEN', 'SPEEDRUN', 'PUZZLE', 
    'SURVIVAL_HORROR', 'ROGUELIKE', 'PATTERN_TRAINING',
    'BOSS_RUSH', 'PACIFIST', 'REVERSE', 'COOP', 
    'RITUAL', 'DAILY'
  ]
});

console.log('[GridMode] Registered grid-based roguelike mode');

export { GridGameMode };
export default GridGameMode;
