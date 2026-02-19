/**
 * Shooter Mode Registration
 * Register the twin-stick shooter mode with the mode registry
 */

import ShooterMode from './ShooterMode.js';
import { modeRegistry } from '../ModeRegistry.js';

// Register shooter mode
modeRegistry.register('shooter', ShooterMode, {
  name: 'Twin-Stick Shooter',
  description: 'Fast-paced bullet-hell action with 4 weapons and wave-based survival',
  type: 'shooter',
  difficulty: 'Medium',
  tags: ['action', 'arcade', 'reflexes', 'combat']
});

console.log('[ShooterMode] Registered twin-stick shooter mode');

export default ShooterMode;
