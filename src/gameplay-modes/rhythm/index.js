/**
 * Rhythm Mode Registration
 */
import { RhythmMode } from './RhythmMode.js';
import { modeRegistry } from '../ModeRegistry.js';

modeRegistry.register('rhythm', RhythmMode, {
  name: 'Rhythm — Beat Synchrony',
  type: 'rhythm',
  description: 'Move to pulsing tiles in sync with the drum beat. Land on beat for bonus points. Rhythm entrains the nervous system.',
  icon: '♩',
  tags: ['rhythm', 'music', 'synchrony', 'flow', 'entrainment'],
});

console.log('[RhythmMode] Registered — The beat begins');
export { RhythmMode };
export default RhythmMode;
