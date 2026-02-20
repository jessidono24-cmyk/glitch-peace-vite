// Enhanced from: _archive/glitch-peace-v5/src/systems/audio.js
// Audio engine: Web Audio API (base) + Tone.js (rich synthesis for learning challenges + boss).
// Tone.js is loaded lazily to avoid parse-time side effects in environments without AudioContext.
import * as Tone from 'tone';

export class AudioEngine {
  constructor(settings = {}) {
    this.settings = settings || {};
    this.enabled = !!this.settings.audio;
    this._toneReady = false;
    this._toneSynth = null;      // PolySynth for challenge feedback
    this._toneDrone = null;      // Drone oscillator for boss spawn
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
    // Initialise Tone.js synths (lazy — needs user gesture first)
    this._initTone();
  }

  _initTone() {
    if (this._toneReady) return;
    try {
      Tone.getContext(); // ensure Tone has a context
      // PolySynth for challenge correct/incorrect arpeggios (FM-like bell)
      this._toneSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.5 },
        volume: -18,
      }).toDestination();
      // AMSynth drone for boss spawn (detuned, eerie)
      this._toneDrone = new Tone.AMSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.3, decay: 0.4, sustain: 0.5, release: 1.2 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
        volume: -24,
      }).toDestination();
      this._toneReady = true;
    } catch (_e) {
      // Tone.js may not be available in test environments — silent fail
      this._toneReady = false;
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
    } else if (name === 'heal') {
      // Gentle upward glissando — soft, reassuring healing sound
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const f = 330 + 220 * t / 0.4; // 330→550Hz over 400ms
        data[i] = 0.45 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.5)
                + 0.20 * Math.sin(2 * Math.PI * f * 1.5 * t) * Math.exp(-t * 3.0);
      }
    } else if (name === 'level_complete') {
      // Major chord arpeggio sweep (C-E-G-C') — victory feeling
      const notes = [261.6, 329.6, 392.0, 523.3];
      len = Math.floor(sr * 0.8);
      buf = this.ctx.createBuffer(1, len, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const noteIdx = Math.min(notes.length - 1, Math.floor(t / 0.18));
        data[i] = 0.5 * Math.sin(2 * Math.PI * notes[noteIdx] * t) * Math.exp(-((t % 0.18) * 6));
      }
    } else if (name === 'combo') {
      // Rising pitch cascade — 3 quick ascending tones
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const f = 660 + 440 * t;
        data[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 5.5);
      }
    } else if (name === 'power' || name === 'archetype') {
      // Low resonant power-up surge
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.5 * Math.sin(2 * Math.PI * (180 + 120 * t) * t) * Math.exp(-t * 1.5)
                + 0.25 * Math.sin(2 * Math.PI * (360 + 240 * t) * t) * Math.exp(-t * 2.0);
      }
    } else if (name === 'boss') {
      // Deep growl — two detuned low sines + noise burst
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.4 * Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 1.2)
                + 0.3 * Math.sin(2 * Math.PI * 93 * t) * Math.exp(-t * 1.0)
                + 0.15 * (Math.random() * 2 - 1) * Math.exp(-t * 3.0);
      }
    } else if (name === 'insight') {
      // Gentle crystalline bell — higher register, slow decay
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.55 * Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 3.5)
                + 0.25 * Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 4.0)
                + 0.15 * Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t * 5.0);
      }
    } else if (name === 'bird') {
      // Quick upward whistle — two-note bird call
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const f = t < 0.15 ? (1200 + 800 * t / 0.15) : (2000 - 400 * (t - 0.15) / 0.15);
        data[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4.5);
      }
    } else if (name === 'spore') {
      // Soft puff sound — filtered noise with gentle envelope
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 8.0)
                + 0.2 * Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 5.0);
      }
    } else if (name === 'build') {
      // Short satisfying click + tone — construction feedback
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.5 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 18.0)
                + 0.2 * (Math.random() * 2 - 1) * Math.exp(-t * 25.0);
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
    } else if (name === 'alchemy_discover') {
      // Transmutation success — ascending triple chord glimmer with shimmer tail
      len = Math.floor(sr * 0.6);
      buf = this.ctx.createBuffer(1, len, sr);
      data = buf.getChannelData(0);
      const alchNotes = [440, 550, 660, 880];
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const ni = Math.min(alchNotes.length - 1, Math.floor(t / 0.12));
        data[i] = 0.45 * Math.sin(2 * Math.PI * alchNotes[ni] * t) * Math.exp(-((t % 0.12) * 7))
                + 0.15 * Math.sin(2 * Math.PI * alchNotes[ni] * 2.001 * t) * Math.exp(-t * 3.0);
      }
    } else if (name === 'rhythm_beat') {
      // Crisp snare-like transient — short noise burst with tonal body
      len = Math.floor(sr * 0.18);
      buf = this.ctx.createBuffer(1, len, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = (Math.random() * 2 - 1) * 0.6 * Math.exp(-t * 30.0)
                + 0.3 * Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 20.0);
      }
    } else if (name === 'mirror_chime') {
      // The Mirror dreamscape — soft overtone bell, two-harmonic resonance
      len = Math.floor(sr * 0.7);
      buf = this.ctx.createBuffer(1, len, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        data[i] = 0.40 * Math.sin(2 * Math.PI * 528 * t) * Math.exp(-t * 2.5)   // "love frequency" 528Hz
                + 0.25 * Math.sin(2 * Math.PI * 792 * t) * Math.exp(-t * 3.0)
                + 0.12 * Math.sin(2 * Math.PI * 1056 * t) * Math.exp(-t * 4.5);
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
      case 'heal':
        this._playBuffer('heal', 0.07, false);
        break;
      case 'level_complete':
        this._playBuffer('level_complete', 0.10, false);
        break;
      case 'combo':
        this._playBuffer('combo', 0.06, false);
        break;
      case 'power':
      case 'archetype':
        this._playBuffer('archetype', 0.08, false);
        break;
      case 'boss':
        this._playBuffer('boss', 0.10, false);
        // Tone.js detuned drone for boss spawn — eerie atmosphere
        if (this._toneReady && this._toneDrone && !this.reduced) {
          try {
            Tone.start().then(() => {
              this._toneDrone.triggerAttackRelease('A1', '2n');
            }).catch(() => {});
          } catch (_) {}
        }
        break;
      case 'challenge_correct':
        // Tone.js ascending arpeggio — reward signal
        if (this._toneReady && this._toneSynth && !this.reduced) {
          try {
            Tone.start().then(() => {
              const now = Tone.now();
              this._toneSynth.triggerAttackRelease('E4', '16n', now);
              this._toneSynth.triggerAttackRelease('G4', '16n', now + 0.08);
              this._toneSynth.triggerAttackRelease('B4', '16n', now + 0.16);
              this._toneSynth.triggerAttackRelease('E5', '8n', now + 0.24);
            }).catch(() => {});
          } catch (_) {}
        } else {
          this._playTone(660, 0.25, 'triangle', 0.07);
        }
        break;
      case 'challenge_incorrect':
        // Tone.js descending minor arpeggio — gentle negative feedback
        if (this._toneReady && this._toneSynth && !this.reduced) {
          try {
            Tone.start().then(() => {
              const now = Tone.now();
              this._toneSynth.triggerAttackRelease('D4', '8n', now);
              this._toneSynth.triggerAttackRelease('Bb3', '8n', now + 0.12);
            }).catch(() => {});
          } catch (_) {}
        } else {
          this._playTone(220, 0.3, 'sawtooth', 0.05);
        }
        break;
      case 'challenge_timeout':
        // Tone.js long low tone — time ran out
        if (this._toneReady && this._toneSynth && !this.reduced) {
          try {
            Tone.start().then(() => {
              this._toneSynth.triggerAttackRelease('C3', '4n', Tone.now());
            }).catch(() => {});
          } catch (_) {}
        }
        break;
      case 'insight':
        this._playBuffer('insight', 0.07, false);
        break;
      case 'bird':
        this._playBuffer('bird', 0.07, false);
        break;
      case 'spore':
        this._playBuffer('spore', 0.06, false);
        break;
      case 'build':
        this._playBuffer('build', 0.05, false);
        break;
      case 'alchemy_discover':
        this._playBuffer('alchemy_discover', 0.09, false);
        break;
      case 'rhythm_beat':
        this._playBuffer('rhythm_beat', 0.07, false);
        break;
      case 'mirror_chime':
        this._playBuffer('mirror_chime', 0.08, false);
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
