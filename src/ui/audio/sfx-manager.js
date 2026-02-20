'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — sfx-manager.js — Phase 5
//  Audio Engine: Procedural sound effects using Web Audio API
// ═══════════════════════════════════════════════════════════════════════

/**
 * SFXManager creates all sounds procedurally
 * No external audio files required
 * Uses Web Audio API oscillators and filters
 */

export class SFXManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.3; // Default volume
    
    this.initialize();
  }

  /**
   * Initialize Web Audio API
   */
  initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  /**
   * Resume audio context (needed for user interaction requirement)
   */
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Set master volume
   * @param {number} vol - Volume 0-1
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Play peace collect sound (chime arpeggio)
   */
  playPeaceCollect() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  /**
   * Play damage sound (harsh buzz)
   */
  playDamage() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play matrix switch sound (tone shift)
   */
  playMatrixSwitch(toMatrixA = false) {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    
    if (toMatrixA) {
      // Switch to Matrix A (Erasure) - descending tone
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    } else {
      // Switch to Matrix B (Coherence) - ascending tone
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Play level complete sound (chord)
   */
  playLevelComplete() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const chord = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    chord.forEach((freq) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  /**
   * Play enemy hit sound (thud)
   */
  playEnemyHit() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    filter.type = 'lowpass';
    filter.frequency.value = 400;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play menu navigation sound
   */
  playMenuNav() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 440;

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play menu select sound
   */
  playMenuSelect() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.value = 880;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play archetype power activation
   */
  playArchetypePower() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Create a rising cascade
    for (let i = 0; i < 5; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = 220 * (i + 1);

      const startTime = now + i * 0.03;
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  /**
   * Play shooter bullet fire sound (crisp pop)
   */
  playShoot() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Play wave complete fanfare (ascending major triad)
   */
  playWaveComplete() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const notes = [392, 494, 587, 784]; // G4, B4, D5, G5
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  /**
   * Play power-up collect (bright sparkle)
   */
  playPowerUp() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880 + i * 440;
      const t = now + i * 0.05;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  /**
   * Play insight collect sound (rising crystalline sparkle, upper register)
   */
  playInsightCollect() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const notes = [784, 1047, 1319, 1568]; // G5, C6, E6, G6
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.25);
    });
  }

  /**
   * Play somatic tile collect (warm calming tones for BODY_SCAN, BREATH_SYNC, etc.)
   */
  playSomaticTile() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const chord = [220, 275, 330]; // A3 + fifth + octave fifth (warm, organic)
    chord.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.05 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(now); osc.stop(now + 0.7);
    });
  }

  /**
   * Play RPG level-up fanfare (ascending major arpeggio)
   */
  playLevelUp() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4 E4 G4 C5 E5
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.13, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.5);
    });
  }

  /**
   * Play death / game over sound (descending somber tones)
   */
  playDeath() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    // Descending sawtooth — dissolution
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.8);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1); gain1.connect(this.masterGain);
    osc1.start(now); osc1.stop(now + 0.8);
    // Low drone fade-in
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 80;
    gain2.gain.setValueAtTime(0, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.45);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2); gain2.connect(this.masterGain);
    osc2.start(now + 0.2); osc2.stop(now + 1.2);
  }


  /**
   * Play boss phase transition (tension: descending sawtooth cascade)
   */
  playBossPhase() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sawtooth';
      const t = now + i * 0.1;
      osc.frequency.setValueAtTime(440 - i * 40, t);
      osc.frequency.exponentialRampToValueAtTime(220 - i * 20, t + 0.18);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.18);
    }
  }

  /**
   * Play boss enter / spawn (ominous deep power chord)
   */
  playBossEnter() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const freqs = [55, 82.5, 110]; // A1, E2, A2 — deep power chord
    freqs.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 1.1);
    });
  }

  /**
   * Play quest complete (bright ascending 5-note fanfare)
   */
  playQuestComplete() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const notes = [392, 523.25, 659.25, 784, 1047]; // G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.13, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.5);
    });
  }

  /**
   * Play alchemical transmutation (mystic shimmer: rising sines + soft bell)
   */
  playTransmutation() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    // Shimmer: three sine sweeps
    const shimmers = [220, 330, 440, 550, 660];
    shimmers.forEach((freq, i) => {
      const osc  = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      const t = now + i * 0.07;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.5, t + 0.3);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.35);
    });
    // Bell tone
    const bell = this.audioContext.createOscillator();
    const bellGain = this.audioContext.createGain();
    bell.type = 'sine';
    bell.frequency.value = 880;
    bellGain.gain.setValueAtTime(0, now + 0.2);
    bellGain.gain.linearRampToValueAtTime(0.15, now + 0.22);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    bell.connect(bellGain); bellGain.connect(this.masterGain);
    bell.start(now + 0.2); bell.stop(now + 1.0);
  }

  /**
   * Play Philosopher's Stone (grand chord: overtone series)
   */
  playPhilosopherStone() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const freqs = [110, 165, 220, 330, 440, 660, 880]; // harmonic series on A2
    freqs.forEach((freq, i) => {
      const osc  = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12 / (i + 1), t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 2.0);
    });
  }

  /**
   * Play player hurt (low thud + static)
   */
  playPlayerHurt() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 2;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Play dream complete (gentle ascending chord with long decay — distinct from level-up)
   * Evokes crossing a threshold: peaceful, resolving, spacious.
   */
  playDreamComplete() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();
    const now = this.audioContext.currentTime;
    // Gentle pentatonic chord: C4 E4 G4 B4 (major 7th — open, unresolved in the best way)
    const freqs = [261.63, 329.63, 392.00, 493.88];
    freqs.forEach((freq, i) => {
      const osc  = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.10 - i * 0.015, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2); // long, spacious decay
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 2.2);
    });
    // Overtone shimmer on top (soft triangle at 2×)
    const shimmer = this.audioContext.createOscillator();
    const shimGain = this.audioContext.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.value = 523.25; // C5
    shimGain.gain.setValueAtTime(0, now + 0.3);
    shimGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
    shimGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
    shimmer.connect(shimGain); shimGain.connect(this.masterGain);
    shimmer.start(now + 0.3); shimmer.stop(now + 2.8);
  }

  /**
   * Clean up
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
export const sfxManager = new SFXManager();
