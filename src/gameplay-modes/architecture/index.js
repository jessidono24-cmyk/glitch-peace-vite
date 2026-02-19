/**
 * Architecture Mode Registration
 */
import { ArchitectureMode } from './ArchitectureMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('architecture', ArchitectureMode, {
  name: 'Architecture — Build & Create',
  type: 'architecture',
  description: 'Spatial construction: place tiles to complete sacred-geometry blueprints, from meditation halls to garden courts.',
  icon: '🏛',
  tags: ['construction', 'creative', 'spatial', 'sacred-geometry'],
});

console.log('[ArchitectureMode] Registered');
export { ArchitectureMode };
export default ArchitectureMode;
