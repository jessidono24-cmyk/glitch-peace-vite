/**
 * Constellation Mode Registration
 */
import { ConstellationMode } from './ConstellationMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('constellation', ConstellationMode, {
  name: 'Constellation — Stars & Myth',
  type: 'constellation',
  description: 'Meditative star-connection puzzles: navigate to stars in sequence to trace constellations, unlock mythological lore.',
  icon: '✦',
  tags: ['meditative', 'mythology', 'puzzles', 'astronomy'],
});

console.log('[ConstellationMode] Registered');
export { ConstellationMode };
export default ConstellationMode;
