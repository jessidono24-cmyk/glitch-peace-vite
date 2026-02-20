'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — biome-system.js
//
//  8 emotion-driven biome overlays that alter the visual aesthetic of
//  any dreamscape in real time, based on the dominant emotion registered
//  in the EmotionalField.
//
//  Biome overlay data:
//    tint      — CSS color applied as a subtle screen overlay
//    tintAlpha — opacity of the tint layer (0.0–0.2)
//    scanlines — scanline density multiplier (1.0 = normal)
//    vignette  — radial vignette strength (0–1)
//    particleColor — particle burst color override
//    bgShift   — offset added to dreamscape bgColor (HSL shift string, informational)
//    label     — display name for the biome
// ═══════════════════════════════════════════════════════════════════════

export const BIOMES = {
  fear: {
    label:         'BLOOD TEMPEST',
    tint:          '#ff0000',
    tintAlpha:     0.07,
    scanlines:     1.8,
    vignette:      0.5,
    particleColor: '#ff2222',
    bgShift:       'red',
  },
  joy: {
    label:         'GOLDEN DAWN',
    tint:          '#ffcc00',
    tintAlpha:     0.05,
    scanlines:     0.5,
    vignette:      0.1,
    particleColor: '#ffee44',
    bgShift:       'golden',
  },
  sadness: {
    label:         'BLUE RAIN',
    tint:          '#0044cc',
    tintAlpha:     0.08,
    scanlines:     1.4,
    vignette:      0.4,
    particleColor: '#4488ff',
    bgShift:       'blue-grey',
  },
  anger: {
    label:         'EMBER STORM',
    tint:          '#ff4400',
    tintAlpha:     0.09,
    scanlines:     1.6,
    vignette:      0.45,
    particleColor: '#ff6600',
    bgShift:       'orange-red',
  },
  hope: {
    label:         'VERDANT RISE',
    tint:          '#00ff88',
    tintAlpha:     0.04,
    scanlines:     0.6,
    vignette:      0.05,
    particleColor: '#00ffcc',
    bgShift:       'soft-green',
  },
  numbness: {
    label:         'ASH VOID',
    tint:          '#888888',
    tintAlpha:     0.10,
    scanlines:     2.0,
    vignette:      0.55,
    particleColor: '#aaaaaa',
    bgShift:       'desaturated',
  },
  awe: {
    label:         'VIOLET COSMOS',
    tint:          '#8800ff',
    tintAlpha:     0.06,
    scanlines:     0.7,
    vignette:      0.2,
    particleColor: '#cc44ff',
    bgShift:       'violet',
  },
  integration: {
    label:         'PRISMATIC UNITY',
    tint:          '#ffffff',
    tintAlpha:     0.03,
    scanlines:     0.4,
    vignette:      0.0,
    particleColor: '#ffffff',
    bgShift:       'rainbow',
  },
};

// Emotion → biome key mapping (extends the 8 core emotions to handle
// the richer set returned by EmotionalField)
const EMOTION_TO_BIOME = {
  fear:        'fear',
  panic:       'fear',
  terror:      'fear',
  joy:         'joy',
  wonder:      'joy',
  happiness:   'joy',
  sadness:     'sadness',
  vulnerability:'sadness',
  grief:       'sadness',
  anger:       'anger',
  frustration: 'anger',
  rage:        'anger',
  hope:        'hope',
  anticipation:'hope',
  trust:       'hope',
  surprise:    'joy',
  disgust:     'anger',
  shame:       'sadness',
  exhaustion:  'numbness',
  numbness:    'numbness',
  chaos:       'fear',
  awe:         'awe',
  anxiety:     'fear',
  integration: 'integration',
  neutral:     null,
};

const DEFAULT_BIOME = {
  label: '', tint: '#000000', tintAlpha: 0, scanlines: 1.0, vignette: 0,
  particleColor: '#00ff88', bgShift: '',
};

export class BiomeSystem {
  constructor() {
    this._currentBiome   = null;
    this._targetBiome    = null;
    this._blendT         = 0;   // 0..1 blend toward target
    this._blendSpeed     = 0.0015; // blend per ms
    this._lastEmotion    = null;
  }

  /** Update based on dominant emotion string (from emotionalField or ds.emotion) */
  setEmotion(emotion) {
    if (!emotion || emotion === this._lastEmotion) return;
    this._lastEmotion = emotion;
    const biomeKey = EMOTION_TO_BIOME[emotion] || null;
    const newBiome = biomeKey ? BIOMES[biomeKey] : null;
    if (newBiome !== this._targetBiome) {
      this._targetBiome = newBiome;
      this._blendT = 0;
    }
  }

  /** Advance blend each frame */
  update(dt) {
    if (this._targetBiome !== this._currentBiome) {
      this._blendT = Math.min(1, this._blendT + dt * this._blendSpeed);
      if (this._blendT >= 1) {
        this._currentBiome = this._targetBiome;
        this._blendT = 0;
      }
    }
  }

  /**
   * Apply biome overlay to canvas.
   * Call AFTER the main game/grid has been drawn, BEFORE the HUD.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w - canvas logical width
   * @param {number} h - canvas logical height
   * @param {number} ts - timestamp (ms)
   */
  draw(ctx, w, h, ts) {
    const biome = this._currentBiome || this._targetBiome;
    if (!biome || biome.tintAlpha <= 0) return;

    // Blend factor: if still transitioning, lerp alpha
    const alpha = biome.tintAlpha *
      (this._currentBiome === biome ? 1 : this._blendT);
    if (alpha < 0.002) return;

    // Subtle breathing pulse
    const pulse = 1 + 0.12 * Math.sin(ts * 0.0015);

    ctx.globalAlpha = alpha * pulse;
    ctx.fillStyle = biome.tint;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Vignette
    if (biome.vignette > 0) {
      const v = biome.vignette * (this._currentBiome === biome ? 1 : this._blendT);
      if (v > 0.01) {
        const grd = ctx.createRadialGradient(w/2, h/2, h*0.25, w/2, h/2, Math.max(w,h)*0.75);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, `rgba(0,0,0,${v.toFixed(2)})`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Extra scanlines for high-density biomes
    if (biome.scanlines > 1.2) {
      const step = Math.max(1, Math.round(4 / biome.scanlines));
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let y = 0; y < h; y += step) {
        ctx.fillRect(0, y, w, 1);
      }
    }

    // Rainbow shimmer for integration biome
    if (biome === BIOMES.integration) {
      const t = ts * 0.001;
      const BANDS = 6;
      for (let i = 0; i < BANDS; i++) {
        const hue = (360 * i / BANDS + t * 30) % 360;
        ctx.fillStyle = `hsla(${hue},100%,60%,0.018)`;
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

  /** Get current particle color override (or null to use default) */
  getParticleColor() {
    return this._currentBiome?.particleColor || null;
  }

  /** Get label for HUD */
  getBiomeLabel() {
    return this._currentBiome?.label || '';
  }
}

export const biomeSystem = new BiomeSystem();
