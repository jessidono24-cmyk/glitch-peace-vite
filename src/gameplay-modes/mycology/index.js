/**
 * Mycology Mode Registration
 */
import { MycologyMode } from './MycologyMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('mycology', MycologyMode, {
  name: 'Mycology — Forest Foraging',
  type: 'mycology',
  description: 'Forage mushrooms through forest substrates: identify edible species, avoid toxics, reveal mycelium networks.',
  icon: '🍄',
  tags: ['nature', 'learning', 'foraging', 'mycology'],
});

console.log('[MycologyMode] Registered');
export { MycologyMode };
export default MycologyMode;
