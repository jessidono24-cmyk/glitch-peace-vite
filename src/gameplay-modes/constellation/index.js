/**
 * Constellation Mode Registration
 */
import { ConstellationMode } from './ConstellationMode.js';
import Constellation3DMode from './Constellation3DMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('constellation', ConstellationMode, {
  name: 'Constellation — Stars & Myth',
  type: 'constellation',
  description: 'Meditative star-connection puzzles: navigate to stars in sequence to trace constellations, unlock mythological lore.',
  icon: '✦',
  tags: ['meditative', 'mythology', 'puzzles', 'astronomy'],
});

modeRegistry.register('constellation-3d', Constellation3DMode, {
  name: 'Constellation 3D — Stars & Myth',
  type: 'constellation-3d',
  description: '3D starfield constellation mode: same meditative gameplay with Three.js immersive rendering.',
  icon: '🌌',
  tags: ['meditative', 'mythology', 'puzzles', 'astronomy', '3d'],
});

console.log('[ConstellationMode] Registered (2D + 3D)');
export { ConstellationMode, Constellation3DMode };
export default ConstellationMode;
