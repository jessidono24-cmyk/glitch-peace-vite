'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — music-engine.js — Tone.js procedural soundtrack
//
//  Generates ambient procedural music that responds to:
//    - Dreamscape emotion (fear, peace, despair, clarity…)
//    - Realm (MIND, PURGATORY, HEAVEN, HELL, IMAGINATION)
//    - Game mode (grid, shooter, constellation, meditation)
//    - Player action events (peace collect, hazard hit, boss fight)
//
//  Architecture:
//    - Drone layer (slow evolving bass note)
//    - Pad layer (harmonic pad texture using Tone.PolySynth)
//    - Melody layer (sparse wandering melody notes)
//    - Percussion layer (subtle atmospheric pulses in shooter/horror)
//    - All crossfaded smoothly on dreamscape/emotion change
// ═══════════════════════════════════════════════════════════════════════

import * as Tone from 'tone';

// Emotion → musical key + mode + tempo BPM + colour description
const EMOTION_MUSIC = {
  peace:       { root: 'C4',  scale: 'major',      bpm: 60,  label: 'serene' },
  hope:        { root: 'G4',  scale: 'major',      bpm: 70,  label: 'bright' },
  clarity:     { root: 'D4',  scale: 'dorian',     bpm: 65,  label: 'clear' },
  trust:       { root: 'F4',  scale: 'major',      bpm: 58,  label: 'warm' },
  neutral:     { root: 'A3',  scale: 'dorian',     bpm: 72,  label: 'neutral' },
  anticipation:{ root: 'E4',  scale: 'phrygian',   bpm: 84,  label: 'tense' },
  fear:        { root: 'D3',  scale: 'phrygian',   bpm: 90,  label: 'fearful' },
  sadness:     { root: 'B3',  scale: 'aeolian',    bpm: 52,  label: 'melancholic' },
  despair:     { root: 'A2',  scale: 'aeolian',    bpm: 45,  label: 'desolate' },
  hopeless:    { root: 'G2',  scale: 'locrian',    bpm: 40,  label: 'collapsed' },
  panic:       { root: 'C#3', scale: 'locrian',    bpm: 110, label: 'panic' },
  rage:        { root: 'D3',  scale: 'phrygian',   bpm: 98,  label: 'rage' },
};

// Scale interval patterns (semitone offsets from root)
const SCALES = {
  major:     [0, 2, 4, 5, 7, 9, 11],
  minor:     [0, 2, 3, 5, 7, 8, 10],
  dorian:    [0, 2, 3, 5, 7, 9, 10],
  phrygian:  [0, 1, 3, 5, 7, 8, 10],
  aeolian:   [0, 2, 3, 5, 7, 8, 10],
  locrian:   [0, 1, 3, 5, 6, 8, 10],
};

// Game mode → orchestration adjustments
const MODE_OVERRIDES = {
  shooter:       { droneVol: -24, padVol: -30, melVol: -38, percVol: -12, reverbSend: 0.2 },
  constellation: { droneVol: -18, padVol: -22, melVol: -28, percVol: -40, reverbSend: 0.8 },
  meditation:    { droneVol: -20, padVol: -18, melVol: -28, percVol: -50, reverbSend: 0.95 },
  grid:          { droneVol: -22, padVol: -26, melVol: -32, percVol: -38, reverbSend: 0.55 },
};

// Master mix level (dB) — adjust during sound balancing
const MASTER_VOLUME_DB = -6;

export class MusicEngine {
  constructor() {
    this._started    = false;
    this._emotion    = 'neutral';
    this._gameMode   = 'grid';
    this._bpm        = 72;
    this._droneNote  = 'A2';
    this._padSynth   = null;
    this._droneSynth = null;
    this._melSynth   = null;
    this._reverb     = null;
    this._delay      = null;
    this._melSeq     = null;
    this._droneSeq   = null;
    this._padSeq     = null;
    this._muted      = false;
    this._volume     = 0.5;
    this._masterVol  = null;
    this._initialized = false;
  }

  // Call once after first user interaction (AudioContext requires gesture)
  async start() {
    if (this._started) return;
    this._started = true;
    await Tone.start();
    this._build();
    Tone.Transport.start();
  }

  _build() {
    if (this._initialized) return;
    this._initialized = true;

    // ── Master volume ───────────────────────────────────────────────
    this._masterVol = new Tone.Volume(MASTER_VOLUME_DB).toDestination();

    // ── Effects chain ───────────────────────────────────────────────
    this._reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).connect(this._masterVol);
    this._delay  = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.28, wet: 0.15 }).connect(this._reverb);

    // ── Drone layer — slow evolving bass ────────────────────────────
    this._droneSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope:   { attack: 2.5, decay: 0, sustain: 1, release: 3.0 },
      volume:     -22,
    }).connect(this._reverb);

    // ── Pad layer — harmonic texture ────────────────────────────────
    this._padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope:   { attack: 1.8, decay: 0, sustain: 0.9, release: 2.5 },
      volume:     -28,
    }).connect(this._reverb);

    // ── Melody layer — sparse, improvised ───────────────────────────
    this._melSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope:   { attack: 0.3, decay: 0.4, sustain: 0.5, release: 1.2 },
      volume:     -32,
    }).connect(this._delay);

    // Drone loop — plays one long note then changes
    this._droneSeq = new Tone.Sequence((time) => {
      const note = this._droneNote;
      this._droneSynth.triggerAttackRelease(note, '2n', time);
    }, [0], '4m');
    this._droneSeq.start(0);

    // Pad loop — sustain a chord voicing
    this._padSeq = new Tone.Sequence((time, chord) => {
      if (!chord) return;
      this._padSynth.triggerAttackRelease(chord, '2m', time);
    }, [[]], '2m');
    this._padSeq.start(0);

    // Melody loop — sparse random notes from scale
    this._melSeq = new Tone.Sequence((time) => {
      if (Math.random() > 0.55) return; // 45% silence
      const note = this._randomMelNote();
      this._melSynth.triggerAttackRelease(note, '8n', time);
    }, Array(8).fill(0), '4n');
    this._melSeq.start(0);

    this._applyEmotion(this._emotion);
  }

  _midiToNote(midi) {
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    return notes[midi % 12] + Math.floor(midi / 12 - 1);
  }

  _noteToMidi(note) {
    const m = note.match(/^([A-G]#?)(\d)$/);
    if (!m) return 60;
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    return notes.indexOf(m[1]) + (parseInt(m[2]) + 1) * 12;
  }

  _scaleNotes(root, scaleName, octaveOffset = 0) {
    const midi   = this._noteToMidi(root) + octaveOffset * 12;
    const ints   = SCALES[scaleName] || SCALES.dorian;
    return ints.map(i => this._midiToNote(midi + i));
  }

  _randomMelNote() {
    const cfg = EMOTION_MUSIC[this._emotion] || EMOTION_MUSIC.neutral;
    const notes = [
      ...this._scaleNotes(cfg.root, cfg.scale, 0),
      ...this._scaleNotes(cfg.root, cfg.scale, 1),
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  _buildChord(root, scaleName) {
    const ints = SCALES[scaleName] || SCALES.dorian;
    const midi = this._noteToMidi(root);
    // Triad from scale degrees 1, 3, 5
    return [0, 2, 4].map(si => this._midiToNote(midi + ints[si % ints.length]));
  }

  _applyEmotion(em) {
    if (!this._initialized) return;
    const cfg = EMOTION_MUSIC[em] || EMOTION_MUSIC.neutral;
    this._droneNote = cfg.root.replace(/\d/, '') + (parseInt(cfg.root.slice(-1)) - 1);
    this._bpm = cfg.bpm;
    Tone.Transport.bpm.rampTo(cfg.bpm, 4);

    // Update pad chord
    const chord = this._buildChord(cfg.root, cfg.scale);
    this._padSeq.events = [chord];

    // Apply mode overrides to volumes
    const mo = MODE_OVERRIDES[this._gameMode] || MODE_OVERRIDES.grid;
    if (this._droneSynth) this._droneSynth.volume.rampTo(mo.droneVol, 3);
    if (this._padSynth)   this._padSynth.volume.rampTo(mo.padVol, 3);
    if (this._melSynth)   this._melSynth.volume.rampTo(mo.melVol, 3);
    if (this._reverb)     this._reverb.wet.rampTo(mo.reverbSend, 3);
  }

  // ── Public API ─────────────────────────────────────────────────────

  setEmotion(em) {
    if (em === this._emotion) return;
    this._emotion = em;
    this._applyEmotion(em);
  }

  setGameMode(mode) {
    if (mode === this._gameMode) return;
    this._gameMode = mode;
    this._applyEmotion(this._emotion);
  }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterVol)
      this._masterVol.volume.rampTo(this._muted ? -Infinity : Tone.gainToDb(this._volume), 0.5);
  }

  mute()   { this._muted = true;  if (this._masterVol) this._masterVol.volume.rampTo(-Infinity, 0.5); }
  unmute() { this._muted = false; if (this._masterVol) this._masterVol.volume.rampTo(Tone.gainToDb(this._volume), 0.5); }

  // Momentary musical reaction to a game event
  onPeaceCollect() {
    if (!this._initialized || this._muted) return;
    const cfg = EMOTION_MUSIC[this._emotion] || EMOTION_MUSIC.neutral;
    const notes = this._scaleNotes(cfg.root, cfg.scale, 1);
    const n = notes[Math.floor(Math.random() * notes.length)];
    this._melSynth?.triggerAttackRelease(n, '16n');
  }

  onHazardHit() {
    if (!this._initialized || this._muted) return;
    this._droneSynth?.triggerAttackRelease(this._droneNote, '32n');
  }

  onBossSpawn() {
    if (!this._initialized) return;
    Tone.Transport.bpm.rampTo(Math.min(130, this._bpm + 30), 2);
    if (this._droneSynth) this._droneSynth.volume.rampTo(-16, 1);
  }

  onBossDeath() {
    if (!this._initialized) return;
    Tone.Transport.bpm.rampTo(this._bpm, 4);
    this._applyEmotion(this._emotion);
  }

  stop() {
    Tone.Transport.stop();
    this._droneSynth?.triggerRelease();
    this._padSynth?.releaseAll();
    this._melSynth?.triggerRelease();
  }
}

// Module-level singleton
export const musicEngine = new MusicEngine();
