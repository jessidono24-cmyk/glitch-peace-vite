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
    this.sampleBuffers = {}; // keyed audio buffers for events
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

  // Load an external sample into an AudioBuffer (public/sfx/{name}.wav or .mp3)
  async loadSample(name, url) {
    if (!this.ctx) this.init();
    if (!this.ctx) return null;
    try {
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(ab);
      this.sampleBuffers[name] = buf;
      return buf;
    } catch (e) {
      // silent fail - fallback will use synthesized buffer
      return null;
    }
  }

  // Convenience loader for a list of common sample names (tries .wav then .mp3)
  async loadSamples(names = []) {
    if (!Array.isArray(names) || !names.length) return;
    for (const n of names) {
      const wav = `/sfx/${n}.wav`;
      const mp3 = `/sfx/${n}.mp3`;
      const got = await this.loadSample(n, wav) || await this.loadSample(n, mp3);
      if (!got) {
        // fallback: synthesize sample so _playBuffer has something
        this.sampleBuffers[n] = this._makeSample(n);
      }
    }
  }

  setEnabled(v) {
    this.enabled = !!v;
    if (!this.ctx) this.init();
    if (this.gain) this.gain.gain.setTargetAtTime(this.enabled ? (this.reduced ? 0.08 : 0.16) : 0.0, this.ctx.currentTime, 0.02);
  }

  // Ambient loop control
  setAmbientEnabled(v) {
    if (!this.ctx) this.init();
    if (v) this.startAmbient(); else this.stopAmbient();
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

  // Synthesize small AudioBuffers for better SFX (fallback to oscillator if not available)
  _makeSample(name) {
    if (!this.ctx) return null;
    const sr = this.ctx.sampleRate;
    let len = Math.floor(sr * 0.4);
    let buf = this.ctx.createBuffer(1, len, sr);
    let data = buf.getChannelData(0);

    if (name === 'damage') {
      // short noise burst
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.12));
    } else if (name === 'peace') {
      // gentle harmonic swell
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.6 * Math.sin(2 * Math.PI * 540 * t) * Math.exp(-t * 2.0)
                + 0.25 * Math.sin(2 * Math.PI * 720 * t) * Math.exp(-t * 1.8);
      }
    } else if (name === 'select' || name === 'nav') {
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = Math.sin(2 * Math.PI * (name === 'select' ? 980 : 660) * t) * Math.exp(-t * 12.0);
      }
    } else if (name === 'teleport') {
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = Math.sin(2 * Math.PI * (300 + 600 * t) * t) * Math.exp(-t * 2.0);
      }
    } else if (name === 'ambient') {
      // loopable low drone (we create shorter loop-friendly buffer)
      const loopLen = Math.floor(sr * 1.0);
      buf = this.ctx.createBuffer(1, loopLen, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < loopLen; i++) {
        const t = i / sr;
        data[i] = 0.08 * Math.sin(2 * Math.PI * 110 * t) + 0.03 * Math.sin(2 * Math.PI * 220 * t);
      }
    } else {
      // default short blip
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 10.0);
      }
    }

    return buf;
  }

  _playBuffer(name, vol = 0.08, loop = false) {
    if (!this.ctx || !this.enabled) return;
    try {
      // Prefer externally loaded sample buffer; synthesize fallback if missing
      let buf = this.sampleBuffers[name];
      if (!buf) {
        buf = this._makeSample(name);
        this.sampleBuffers[name] = buf;
      }
      if (!buf) return this._playTone();
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = !!loop;
      const g = this.ctx.createGain();
      g.gain.value = vol * (this.reduced ? 0.4 : 1);
      src.connect(g);
      g.connect(this.gain);
      src.start(this.ctx.currentTime + 0.001);
      return src;
    } catch (e) {
      // fallback
      return this._playTone();
    }
  }

  play(name) {
    if (!this.ctx) this.init();
    if (!this.enabled) return;
    // map events to simple tones / patterns
    switch (name) {
      case 'move':
        this._playBuffer('nav', 0.03, false);
        break;
      case 'peace':
        this._playBuffer('peace', 0.08, false);
        break;
      case 'damage':
        this._playBuffer('damage', 0.08, false);
        break;
      case 'nav':
        this._playBuffer('nav', 0.04, false);
        break;
      case 'select':
        this._playBuffer('select', 0.06, false);
        break;
      case 'teleport':
        this._playBuffer('teleport', 0.06, false);
        break;
      case 'ambient':
        // ambient handled by startAmbient/stopAmbient, but allow a ping
        this._playBuffer('ambient', 0.02, false);
        break;
      default:
        this._playBuffer('default', 0.03, false);
    }
  }

  // Start a low-volume ambient loop (respects reducedMotion and enabled)
  startAmbient() {
    if (!this.ctx) this.init();
    if (!this.enabled) return;
    try {
      this.stopAmbient();
      const src = this._playBuffer('ambient', 0.02, true);
      if (src && src.loop) this.ambient = src; else this.ambient = null;
    } catch (e) { this.ambient = null; }
  }

  stopAmbient() {
    try {
      if (this.ambient && this.ambient.stop) {
        this.ambient.stop(0);
      }
    } catch (e) {}
    this.ambient = null;
  }
}

// Singleton helper (attached to window for easy access)
const _engine = new AudioEngine();
export default _engine;
