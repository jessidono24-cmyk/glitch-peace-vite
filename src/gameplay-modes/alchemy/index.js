/**
 * Alchemy Mode Registration
 */
import { AlchemyMode } from './AlchemyMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('alchemy', AlchemyMode, {
  name: 'Alchemy — The Great Work',
  type: 'alchemy',
  description: 'Collect Fire, Water, Earth, and Air elements. Combine them at the Athanor to perform the 8 alchemical transmutations. Reach the Philosopher\'s Stone.',
  icon: '⚗',
  tags: ['alchemy', 'hermetic', 'puzzle', 'transmutation', 'jungian'],
});

console.log('[AlchemyMode] Registered — The Great Work begins');
export { AlchemyMode };
export default AlchemyMode;
