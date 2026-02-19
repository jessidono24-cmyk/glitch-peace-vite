/**
 * Ornithology Mode Registration
 */
import { OrnithologyMode } from './OrnithologyMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('ornithology', OrnithologyMode, {
  name: 'Ornithology — Field Observation',
  type: 'ornithology',
  description: 'Bird-watching grid mode: observe species across biomes, identify rare birds, build your field notebook.',
  icon: '🐦',
  tags: ['nature', 'learning', 'meditative', 'ornithology'],
});

console.log('[OrnithologyMode] Registered');
export { OrnithologyMode };
export default OrnithologyMode;
