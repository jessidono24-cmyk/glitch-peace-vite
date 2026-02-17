// Enhanced from: _archive/glitch-peace-v5/src/systems/audio.js
// Simple audio engine using Web Audio API. Sounds are optional and muted by default.
export class AudioEngine {
  constructor(settings = {}) {
    this.settings = settings || {};
    this.enabled = !!this.settings.audio;
    this.reduced = !!this.settings.reducedMotion;
    this.ctx = null;
    this.gain = null;
    this.ambient = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.enabled ? (this.reduced ? 0.08 : 0.16) : 0.0;
      this.gain.connect(this.ctx.destination);
    } catch (e) {
      this.ctx = null;
      console.warn('Audio not available', e);
    }
  }

  setEnabled(v) {
    this.enabled = !!v;
    if (!this.ctx) this.init();
    if (this.gain) this.gain.gain.setTargetAtTime(this.enabled ? (this.reduced ? 0.08 : 0.16) : 0.0, this.ctx.currentTime, 0.02);
  }

  _playTone(freq = 440, dur = 0.12, type = 'sine', vol = 0.08) {
    if (!this.ctx || !this.enabled) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol * (this.reduced ? 0.4 : 1);
    o.connect(g);
    g.connect(this.gain);
    const now = this.ctx.currentTime;
    o.start(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.stop(now + dur + 0.02);
  }

  play(name) {
    if (!this.ctx) this.init();
    if (!this.enabled) return;
    // map events to simple tones / patterns
    switch (name) {
      case 'move':
        this._playTone(880, 0.06, 'sine', 0.03);
        break;
      case 'peace':
        this._playTone(540, 0.18, 'triangle', 0.08);
        this._playTone(720, 0.12, 'sine', 0.05);
        break;
      case 'damage':
        this._playTone(120, 0.08, 'sawtooth', 0.08);
        break;
      case 'nav':
        this._playTone(660, 0.06, 'square', 0.04);
        break;
      case 'select':
        this._playTone(980, 0.10, 'triangle', 0.06);
        break;
      case 'teleport':
        this._playTone(300, 0.18, 'sine', 0.06);
        this._playTone(900, 0.14, 'sine', 0.04);
        break;
      case 'ambient':
        // short ambient ping
        this._playTone(220, 0.4, 'sine', 0.02);
        break;
      default:
        this._playTone(660, 0.06, 'sine', 0.03);
    }
  }
}

// Singleton helper (attached to window for easy access)
const _engine = new AudioEngine();
export default _engine;
