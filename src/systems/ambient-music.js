/**
 * ambient-music.js — Generative ambient music engine using Tone.js
 *
 * Responds to the game's emotional distortion level to shift between
 * calm (C major arpeggios), medium (minor scale), and high-tension
 * (dissonant clusters) musical states.
 */

import * as Tone from 'tone';

// Volume mapping constants (dB scale)
const MIN_VOLUME_DB = -60;
const VOLUME_RANGE_DB = 60;
const SCALES = {
  calm:   ['C4','E4','G4','B4','C5','E5','G5'],
  medium: ['A3','C4','E4','G4','A4','C5','E5'],
  tense:  ['C4','C#4','F#4','G4','A#4','B4','F5'],
};

const BPM = { calm: 60, medium: 80, tense: 120 };
const NOTE_DUR = { calm: '2n', medium: '4n', tense: '8n' };

export class AmbientMusicEngine {
  constructor() {
    this._started = false;
    this._running = false;
    this._currentState = null;
    this._loop = null;
    this._noteIdx = 0;

    // Synth chain
    this._reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination();
    this._synth  = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).connect(this._reverb);
    this._synth.volume.value = -18;
  }

  /**
   * Begin playback — must be called after a user gesture.
   */
  start() {
    if (this._started) return;
    this._started = true;
    this._running = true;
    Tone.start().catch(() => {});
    this._scheduleLoop('calm');
  }

  stop() {
    this._running = false;
    if (this._loop) {
      this._loop.stop();
      this._loop.dispose();
      this._loop = null;
    }
    this._synth.releaseAll();
    this._currentState = null;
  }

  /**
   * Update musical state based on emotional distortion.
   * @param {{ distortion: number, dominant: string|null }} emotionalState
   */
  update(emotionalState) {
    if (!this._running) return;
    const d = emotionalState?.distortion ?? 0;
    const next = d < 0.3 ? 'calm' : d < 0.7 ? 'medium' : 'tense';
    if (next !== this._currentState) {
      this._scheduleLoop(next);
    }
  }

  /**
   * Set master volume (0–1 mapped to dB).
   */
  setVolume(vol) {
    // Map 0-1 to MIN_VOLUME_DB..0 dB
    Tone.getDestination().volume.value = vol <= 0 ? -Infinity : MIN_VOLUME_DB + vol * VOLUME_RANGE_DB;
  }

  _scheduleLoop(state) {
    if (this._loop) {
      this._loop.stop();
      this._loop.dispose();
      this._loop = null;
    }
    this._currentState = state;
    this._noteIdx = 0;
    Tone.getTransport().bpm.value = BPM[state];

    const scale = SCALES[state];
    const dur   = NOTE_DUR[state];

    this._loop = new Tone.Sequence(
      (time) => {
        if (!this._running) return;
        const note = scale[this._noteIdx % scale.length];
        this._noteIdx++;
        try { this._synth.triggerAttackRelease(note, dur, time); } catch (_) {}
      },
      scale.map((_, i) => i),
      dur,
    );
    this._loop.start(0);
    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }
  }
}
