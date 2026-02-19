// ═══════════════════════════════════════════════════════════════════════
//  UI MENUS - Title / Pause / Options / Tutorial
//  Ported from: _archive/glitch-peace-v5/src/ui/menus.js
// ═══════════════════════════════════════════════════════════════════════

import { GRID_SIZES, DIFF_CFG } from '../core/constants.js';
import { TUTORIAL_PAGES } from './tutorial-content.js';
import { listDreamscapes } from '../systems/dreamscapes.js';
import { getAvailableModes } from '../systems/play-modes.js';
import { getAvailableCosmologies } from '../systems/cosmologies.js';
import { LANGUAGES, getLanguageProgression, getLearnableLanguages } from '../systems/languages.js';

function listFromObjKeys(obj) { return Object.keys(obj); }
function clampInt(n, a, b) { return Math.max(a, Math.min(b, n)); }

export class MenuSystem {
  constructor({ CFG, onStartNew, onContinue, onQuitToTitle, onRestart, onSelectDreamscape }) {
    this.CFG = CFG;

    this.onStartNew = onStartNew;
    this.onContinue = onContinue;
    this.onQuitToTitle = onQuitToTitle;
    this.onRestart = onRestart;
    this.onSelectDreamscape = onSelectDreamscape;

    this.screen = 'title'; // 'title' | 'pause' | 'options' | 'tutorial' | 'credits' | 'dreamscape' | 'playmode' | 'cosmology' | 'onboarding'
    this.sel = 0;
    this.tutPage = 0;
    this.dreamscapeSel = 0;
    this.playmodeSel = 0;
    this.cosmologySel = 0;
    this._pendingDreamscape = null; // dreamscape id chosen before play mode
    this._pendingPlaymode = null;   // play mode id chosen before cosmology

    // Onboarding state
    this._onboardingStep = 0;      // 0=welcome 1=age 2=nativeLang 3=targetLang
    this._onboardingAge = 1;       // index into AGE_GROUPS
    this._nativeLangSel = 0;       // index into LANGUAGES
    this._targetLangSel = 0;       // index into learnable languages
    this._learnableLangs = [];     // filled when native is chosen

    this.hasSave = false;
    this.saveMeta = null;

    this._difficultyKeys = listFromObjKeys(DIFF_CFG);
    this._gridKeys = listFromObjKeys(GRID_SIZES);

    this._pulseT = 0;
  }

  // Call this after boot (or when a save happens)
  setSaveState({ hasSave, meta }) {
    this.hasSave = !!hasSave;
    this.saveMeta = meta || null;
  }

  open(screen) {
    this.screen = screen;
    this.sel = 0;
    if (screen === 'tutorial') this.tutPage = 0;
    if (screen === 'dreamscape') this.dreamscapeSel = 0;
    if (screen === 'playmode') this.playmodeSel = 0;
    if (screen === 'cosmology') this.cosmologySel = 0;
    if (screen === 'onboarding') { this._onboardingStep = 0; this._onboardingAge = 1; this._nativeLangSel = 0; this._targetLangSel = 0; }
    // Note: Canvas-based rendering happens in draw() method, not _render()
  }

  // ────────────────────────────────────────────────────────────────────
  //  INPUT
  // ────────────────────────────────────────────────────────────────────

  handleKey(e) {
    const k = e.key;

    // Global escapes
    if (k === 'Escape') {
      if (this.screen === 'options' || this.screen === 'credits' || this.screen === 'dreamscape') {
        this.open('title');
        return { consumed: true };
      }
      if (this.screen === 'tutorial') {
        // Return to wherever tutorial was opened from ('title' normally, 'pause' when H pressed in-game)
        const ret = this._tutorialReturnScreen || 'title';
        this._tutorialReturnScreen = null;
        this.open(ret);
        return { consumed: true };
      }
      if (this.screen === 'playmode') {
        this.open('dreamscape');
        return { consumed: true };
      }
      if (this.screen === 'cosmology') {
        this.open('playmode');
        return { consumed: true };
      }
      if (this.screen === 'onboarding') {
        // ESC during onboarding = skip setup and go to title
        this._finaliseOnboarding();
        return { consumed: true };
      }
      return { consumed: false };
    }

    if (this.screen === 'title' || this.screen === 'pause') {
      return this._handleListMenu(k);
    }

    if (this.screen === 'options') {
      return this._handleOptions(k);
    }

    if (this.screen === 'tutorial') {
      return this._handleTutorial(k);
    }

    if (this.screen === 'dreamscape') {
      return this._handleDreamscape(k);
    }

    if (this.screen === 'playmode') {
      return this._handlePlaymode(k);
    }

    if (this.screen === 'cosmology') {
      return this._handleCosmology(k);
    }

    if (this.screen === 'credits') {
      if (k === 'Enter' || k === ' ') this.open('title');
      return { consumed: true };
    }

    if (this.screen === 'onboarding') {
      return this._handleOnboarding(k);
    }

    return { consumed: false };
  }

  _handleListMenu(k) {
    const items = this.getItems();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') {
      this.sel = (this.sel - 1 + items.length) % items.length;
      try { window.AudioManager?.play('nav'); } catch (e) {}
      return { consumed: true };
    }
    if (k === 'ArrowDown' || k === 's' || k === 'S') {
      this.sel = (this.sel + 1) % items.length;
      try { window.AudioManager?.play('nav'); } catch (e) {}
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      const item = items[this.sel];
      if (item && !item.disabled && item.action) item.action();
      try { window.AudioManager?.play('select'); } catch (e) {}
      return { consumed: true };
    }
    return { consumed: false };
  }

  _handleOptions(k) {
    const rows = this.getOptionRows();

    const go = (dir) => {
      this.sel = clampInt(this.sel + dir, 0, rows.length - 1);
    };

    if (k === 'ArrowUp' || k === 'w' || k === 'W') { go(-1); return { consumed: true }; }
    if (k === 'ArrowDown' || k === 's' || k === 'S') { go(+1); return { consumed: true }; }

    const row = rows[this.sel];
    if (!row) return { consumed: true };

    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      if (row.left) row.left();
      else if (row.toggle) row.toggle();
      try { window.AudioManager?.play('nav'); } catch (e) {}
      return { consumed: true };
    }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      if (row.right) row.right();
      else if (row.toggle) row.toggle();
      try { window.AudioManager?.play('nav'); } catch (e) {}
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      if (row.toggle) row.toggle();
      if (row.action) row.action();
      try { window.AudioManager?.play('select'); } catch (e) {}
      return { consumed: true };
    }
    if (k === 'Backspace') {
      this.open('title');
      return { consumed: true };
    }
    return { consumed: false };
  }

  _handleTutorial(k) {
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      this.tutPage = Math.max(0, this.tutPage - 1);
      return { consumed: true };
    }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      this.tutPage = Math.min(TUTORIAL_PAGES.length - 1, this.tutPage + 1);
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      const last = TUTORIAL_PAGES.length - 1;
      if (this.tutPage >= last) this.open('title');
      else this.tutPage++;
      return { consumed: true };
    }
    if (k === 'Backspace') {
      this.open('title');
      return { consumed: true };
    }
    return { consumed: true };
  }

  _handleDreamscape(k) {
    const dreams = this.getDreamscapeOptions();
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'W' || k === 'a' || k === 'A') {
      this.dreamscapeSel = (this.dreamscapeSel - 1 + dreams.length) % dreams.length;
      return { consumed: true };
    }
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'S' || k === 'd' || k === 'D') {
      this.dreamscapeSel = (this.dreamscapeSel + 1) % dreams.length;
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      const dream = dreams[this.dreamscapeSel];
      if (dream) {
        this._pendingDreamscape = dream.id;
        this.open('playmode');
      }
      return { consumed: true };
    }
    if (k === 'Backspace') {
      this.open('title');
      return { consumed: true };
    }
    return { consumed: false };
  }

  _handlePlaymode(k) {
    const modes = this.getPlaymodeOptions();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') {
      this.playmodeSel = (this.playmodeSel - 1 + modes.length) % modes.length;
      return { consumed: true };
    }
    if (k === 'ArrowDown' || k === 's' || k === 'S') {
      this.playmodeSel = (this.playmodeSel + 1) % modes.length;
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      const mode = modes[this.playmodeSel];
      if (mode) {
        this._pendingPlaymode = mode.id;
        this.open('cosmology'); // proceed to cosmology selection
      }
      return { consumed: true };
    }
    if (k === 'Backspace') {
      this.open('dreamscape');
      return { consumed: true };
    }
    return { consumed: false };
  }

  _handleCosmology(k) {
    const cosmologies = this.getCosmologyOptions();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') {
      this.cosmologySel = (this.cosmologySel - 1 + cosmologies.length) % cosmologies.length;
      return { consumed: true };
    }
    if (k === 'ArrowDown' || k === 's' || k === 'S') {
      this.cosmologySel = (this.cosmologySel + 1) % cosmologies.length;
      return { consumed: true };
    }
    if (k === 'Enter' || k === ' ') {
      const cosmo = cosmologies[this.cosmologySel];
      if (this.onSelectDreamscape) {
        this.onSelectDreamscape(
          this._pendingDreamscape || 'RIFT',
          this._pendingPlaymode || 'ARCADE',
          cosmo?.id || null, // null = no cosmology
        );
      }
      return { consumed: true };
    }
    if (k === 'Backspace') {
      this.open('playmode');
      return { consumed: true };
    }
    return { consumed: false };
  }

  // ─── AGE GROUP DEFINITIONS ──────────────────────────────────────────
  static get AGE_GROUPS() {
    return [
      { label: 'Little Explorer  (age 5–7)',  difficulty: 'sprout',   emoji: '🌱' },
      { label: 'Young Adventurer (age 8–12)', difficulty: 'seedling', emoji: '🌿' },
      { label: 'Teen Explorer    (age 13–17)', difficulty: 'easy',     emoji: '✦' },
      { label: 'Adult            (age 18+)',   difficulty: 'normal',   emoji: '◆' },
    ];
  }

  /**
   * Handle the first-run onboarding flow.
   * Steps: 0=welcome, 1=age group, 2=native language, 3=target language
   */
  _handleOnboarding(k) {
    const up    = k === 'ArrowUp'   || k === 'w' || k === 'W';
    const down  = k === 'ArrowDown' || k === 's' || k === 'S';
    const ok    = k === 'Enter'     || k === ' ';
    const skip  = k === 'Escape'    || k === 'Backspace';

    const ageGroups = MenuSystem.AGE_GROUPS;

    if (skip) {
      // Skip remaining onboarding and go straight to title
      this._finaliseOnboarding();
      return { consumed: true };
    }

    if (this._onboardingStep === 0) {
      // Welcome — any key advances
      if (ok || down) { this._onboardingStep = 1; return { consumed: true }; }
      return { consumed: true };
    }

    if (this._onboardingStep === 1) {
      // Age group
      if (up)   this._onboardingAge = (this._onboardingAge - 1 + ageGroups.length) % ageGroups.length;
      if (down) this._onboardingAge = (this._onboardingAge + 1) % ageGroups.length;
      if (ok) {
        // Apply difficulty from age group
        const chosen = ageGroups[this._onboardingAge];
        this.CFG.difficulty = chosen.difficulty;
        this._onboardingStep = 2;
      }
      return { consumed: true };
    }

    if (this._onboardingStep === 2) {
      // Native language
      if (up)   this._nativeLangSel = (this._nativeLangSel - 1 + LANGUAGES.length) % LANGUAGES.length;
      if (down) this._nativeLangSel = (this._nativeLangSel + 1) % LANGUAGES.length;
      if (ok) {
        const native = LANGUAGES[this._nativeLangSel];
        this.CFG.nativeLanguage = native.id;
        // Pre-compute recommended learning order, filter to our 14
        this._learnableLangs = getLanguageProgression(native.id)
          .map(id => LANGUAGES.find(l => l.id === id))
          .filter(Boolean);
        this._targetLangSel = 0;
        this._onboardingStep = 3;
      }
      return { consumed: true };
    }

    if (this._onboardingStep === 3) {
      // Target language
      const langs = this._learnableLangs;
      if (up)   this._targetLangSel = (this._targetLangSel - 1 + langs.length) % langs.length;
      if (down) this._targetLangSel = (this._targetLangSel + 1) % langs.length;
      if (ok) {
        const target = langs[this._targetLangSel];
        this.CFG.targetLanguage = target.id;
        this._finaliseOnboarding();
      }
      return { consumed: true };
    }

    return { consumed: true };
  }

  /** Save onboarding selections to localStorage and navigate to title */
  _finaliseOnboarding() {
    try {
      localStorage.setItem('glitchpeace.firstRun', 'done');
      if (this.CFG.nativeLanguage) localStorage.setItem('glitchpeace.nativeLang', this.CFG.nativeLanguage);
      if (this.CFG.targetLanguage) localStorage.setItem('glitchpeace.targetLang', this.CFG.targetLanguage);
      if (this.CFG.difficulty) localStorage.setItem('glitchpeace.difficulty', this.CFG.difficulty);
    } catch (e) {}
    this.open('title');
  }

  /** Returns true if first-run onboarding has never been completed */
  static isFirstRun() {
    try { return !localStorage.getItem('glitchpeace.firstRun'); } catch (e) { return false; }
  }

  getItems() {
    const isPause = this.screen === 'pause';

    const common = [];
    if (isPause) {
      common.push({ label: 'RESUME', action: () => this.onQuitToTitle({ to: 'playing' }) });
      common.push({ label: 'RESTART RUN', action: () => this.onRestart() });
    } else {
      common.push({ label: 'NEW GAME', action: () => this.onStartNew() });
      common.push({
        label: this.hasSave ? 'CONTINUE' : 'CONTINUE (NO SAVE)',
        disabled: !this.hasSave,
        action: () => this.hasSave && this.onContinue(),
      });
    }

    common.push({ label: 'TUTORIAL', action: () => this.open('tutorial') });
    common.push({ label: 'OPTIONS', action: () => this.open('options') });
    common.push({ label: 'CREDITS', action: () => this.open('credits') });
    common.push({
      label: isPause ? 'QUIT TO TITLE' : 'EXIT',
      action: () => this.onQuitToTitle({ to: 'title' }),
    });

    return common;
  }

  getOptionRows() {
    const cfg = this.CFG;

    const nextIn = (arr, cur, dir) => {
      const idx = Math.max(0, arr.indexOf(cur));
      const ni = (idx + dir + arr.length) % arr.length;
      return arr[ni];
    };

    // Cache language map for O(1) lookups inside option row value getters
    const langMap = new Map(LANGUAGES.map(l => [l.id, l]));

    return [
      {
        label: 'DIFFICULTY',
        value: cfg.difficulty,
        left: () => (cfg.difficulty = nextIn(this._difficultyKeys, cfg.difficulty, -1)),
        right: () => (cfg.difficulty = nextIn(this._difficultyKeys, cfg.difficulty, +1)),
      },
      {
        label: 'GRID SIZE',
        value: cfg.gridSize,
        left: () => (cfg.gridSize = nextIn(this._gridKeys, cfg.gridSize, -1)),
        right: () => (cfg.gridSize = nextIn(this._gridKeys, cfg.gridSize, +1)),
      },
      {
        label: 'PARTICLES',
        value: cfg.particles ? 'ON' : 'OFF',
        toggle: () => (cfg.particles = !cfg.particles),
      },
      {
        label: 'HIGH CONTRAST',
        value: cfg.highContrast ? 'ON' : 'OFF',
        toggle: () => (cfg.highContrast = !cfg.highContrast),
      },
      {
        label: 'REDUCED MOTION',
        value: cfg.reducedMotion ? 'ON' : 'OFF',
        toggle: () => (cfg.reducedMotion = !cfg.reducedMotion),
      },
      {
        label: 'AUDIO',
        value: cfg.audio ? 'ON' : 'OFF',
        toggle: () => { cfg.audio = !cfg.audio; try { if (window && window.AudioManager) window.AudioManager.setEnabled(cfg.audio); } catch (e) {} },
      },
      {
        label: 'SOUND EFFECTS',
        value: cfg.audioAmbient ? 'ON' : 'OFF',
        toggle: () => { cfg.audioAmbient = !cfg.audioAmbient; try { if (window && window.AudioManager) window.AudioManager.setAmbientEnabled(cfg.audioAmbient); } catch (e) {} },
      },
      {
        label: 'INTENSITY',
        value: (cfg.intensityMul || 1.0).toFixed(2),
        left: () => (cfg.intensityMul = Math.max(0.5, +(cfg.intensityMul - 0.1).toFixed(2))),
        right: () => (cfg.intensityMul = Math.min(1.5, +(cfg.intensityMul + 0.1).toFixed(2))),
      },
      {
        label: 'TIME ZONE',
        value: cfg.timezone || 'AUTO',
        left: () => {
          const local = (typeof Intl !== 'undefined') ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Local';
          const tzOptions = Array.from(new Set(['AUTO', 'UTC', local, 'America/New_York', 'Europe/London', 'Asia/Tokyo']));
          const idx = Math.max(0, tzOptions.indexOf(cfg.timezone || 'AUTO'));
          cfg.timezone = tzOptions[(idx - 1 + tzOptions.length) % tzOptions.length];
          try { localStorage.setItem('glitchpeace.timezone', cfg.timezone); } catch (e) {}
          try { if (window && window.GlitchPeaceGame && window.GlitchPeaceGame.temporalSystem) window.GlitchPeaceGame.temporalSystem.setTimeZone(cfg.timezone === 'AUTO' ? null : cfg.timezone); } catch (e) {}
        },
        right: () => {
          const local = (typeof Intl !== 'undefined') ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Local';
          const tzOptions = Array.from(new Set(['AUTO', 'UTC', local, 'America/New_York', 'Europe/London', 'Asia/Tokyo']));
          const idx = Math.max(0, tzOptions.indexOf(cfg.timezone || 'AUTO'));
          cfg.timezone = tzOptions[(idx + 1) % tzOptions.length];
          try { localStorage.setItem('glitchpeace.timezone', cfg.timezone); } catch (e) {}
          try { if (window && window.GlitchPeaceGame && window.GlitchPeaceGame.temporalSystem) window.GlitchPeaceGame.temporalSystem.setTimeZone(cfg.timezone === 'AUTO' ? null : cfg.timezone); } catch (e) {}
        },
      },
      {
        label: 'HAZARD DELAY',
        value: cfg.impulseBuffer ? 'ON' : 'OFF',
        toggle: () => (cfg.impulseBuffer = !cfg.impulseBuffer),
      },
      {
        label: 'PATTERN ECHO',
        value: cfg.patternEcho ? 'ON' : 'OFF',
        toggle: () => (cfg.patternEcho = !cfg.patternEcho),
      },
      {
        label: 'PATH PREVIEW',
        value: cfg.consequencePreview ? 'ON' : 'OFF',
        toggle: () => (cfg.consequencePreview = !cfg.consequencePreview),
      },
      {
        label: 'SESSION REMINDERS',
        value: cfg.sessionReminders !== false ? 'ON' : 'OFF',
        toggle: () => (cfg.sessionReminders = cfg.sessionReminders === false ? true : false),
      },
      // ── LANGUAGE SETTINGS ────────────────────────────────────────
      {
        label: 'NATIVE LANGUAGE',
        value: (langMap.get(cfg.nativeLanguage) || { name: 'English' }).name,
        left: () => {
          const idx = Math.max(0, LANGUAGES.findIndex(l => l.id === (cfg.nativeLanguage || 'en')));
          cfg.nativeLanguage = LANGUAGES[(idx - 1 + LANGUAGES.length) % LANGUAGES.length].id;
          try { localStorage.setItem('glitchpeace.nativeLang', cfg.nativeLanguage); } catch (e) {}
        },
        right: () => {
          const idx = Math.max(0, LANGUAGES.findIndex(l => l.id === (cfg.nativeLanguage || 'en')));
          cfg.nativeLanguage = LANGUAGES[(idx + 1) % LANGUAGES.length].id;
          try { localStorage.setItem('glitchpeace.nativeLang', cfg.nativeLanguage); } catch (e) {}
        },
      },
      {
        label: 'LEARNING LANGUAGE',
        value: (langMap.get(cfg.targetLanguage) || { name: 'NONE' }).name,
        left: () => {
          const learnable = getLearnableLanguages(cfg.nativeLanguage || 'en');
          const languageOptions = [{ id: null, name: 'NONE' }, ...learnable];
          const idx = Math.max(0, languageOptions.findIndex(l => l.id === (cfg.targetLanguage || null)));
          cfg.targetLanguage = languageOptions[(idx - 1 + languageOptions.length) % languageOptions.length].id;
          try { localStorage.setItem('glitchpeace.targetLang', cfg.targetLanguage || ''); } catch (e) {}
        },
        right: () => {
          const learnable = getLearnableLanguages(cfg.nativeLanguage || 'en');
          const languageOptions = [{ id: null, name: 'NONE' }, ...learnable];
          const idx = Math.max(0, languageOptions.findIndex(l => l.id === (cfg.targetLanguage || null)));
          cfg.targetLanguage = languageOptions[(idx + 1) % languageOptions.length].id;
          try { localStorage.setItem('glitchpeace.targetLang', cfg.targetLanguage || ''); } catch (e) {}
        },
      },
      {
        label: 'BACK',
        value: '',
        action: () => this.open('title'),
      },
    ];
  }

  getDreamscapeOptions() {
    return listDreamscapes();
  }

  getPlaymodeOptions() {
    return getAvailableModes().filter(m => m.id !== 'coop'); // exclude co-op (future)
  }

  getCosmologyOptions() {
    // "None" as first option so cosmology is optional
    const cosmos = getAvailableCosmologies();
    return [
      { id: null, name: 'NO COSMOLOGY', tradition: '—', subtitle: 'Standard gameplay, no cosmology modifier' },
      ...cosmos,
    ];
  }

  // ────────────────────────────────────────────────────────────────────
  //  DRAWING
  // ────────────────────────────────────────────────────────────────────

  draw(ctx, w, h, dtMs = 16) {
    this._pulseT += dtMs;

    // Background
    ctx.fillStyle = '#02020a';
    ctx.fillRect(0, 0, w, h);

    // Subtle scanlines
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, w, 1);
    }

    if (this.screen === 'title' || this.screen === 'pause') return this._drawList(ctx, w, h);
    if (this.screen === 'options') return this._drawOptions(ctx, w, h);
    if (this.screen === 'tutorial') return this._drawTutorial(ctx, w, h);
    if (this.screen === 'dreamscape') return this._drawDreamscape(ctx, w, h);
    if (this.screen === 'playmode') return this._drawPlaymode(ctx, w, h);
    if (this.screen === 'cosmology') return this._drawCosmology(ctx, w, h);
    if (this.screen === 'credits') return this._drawCredits(ctx, w, h);
    if (this.screen === 'onboarding') return this._drawOnboarding(ctx, w, h);
  }

  _drawHeader(ctx, w, h, subtitle) {
    ctx.textAlign = 'center';

    ctx.fillStyle = '#667099';
    ctx.font = '8px Courier New';
    ctx.fillText('A CONSCIOUSNESS SIMULATION', w / 2, h / 2 - 170);

    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 28;
    ctx.font = 'bold 38px Courier New';
    ctx.fillText('GLITCH·PEACE', w / 2, h / 2 - 130);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#667099';
    ctx.font = '9px Courier New';
    ctx.fillText(subtitle, w / 2, h / 2 - 108);

    ctx.textAlign = 'left';
  }

  _drawList(ctx, w, h) {
    const isPause = this.screen === 'pause';
    this._drawHeader(ctx, w, h, isPause ? 'PAUSED' : 'v1.0 · base layer');

    const items = this.getItems();
    const boxW = 360;
    const boxH = 240;
    const bx = (w - boxW) / 2;
    const by = h / 2 - 60;

    // Panel
    ctx.fillStyle = 'rgba(7,7,20,0.9)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    const pulse = 0.6 + 0.4 * Math.sin(this._pulseT * 0.004);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const y = by + 34 + i * 30;

      const isSel = i === this.sel;
      const disabled = !!it.disabled;

      if (isSel) {
        ctx.fillStyle = `rgba(0,255,136,${0.08 + pulse * 0.10})`;
        ctx.fillRect(bx + 18, y - 18, boxW - 36, 24);
        ctx.strokeStyle = `rgba(0,255,136,${0.20 + pulse * 0.20})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 18, y - 18, boxW - 36, 24);
      }

      ctx.fillStyle = disabled ? '#2a2a3a' : (isSel ? '#00ff88' : '#b8b8d0');
      ctx.font = isSel ? 'bold 14px Courier New' : '13px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText((isSel ? '▶ ' : '  ') + it.label, w / 2, y);
      ctx.textAlign = 'left';
    }

    // Footer hint
    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓ to select · ENTER to confirm · ESC to ' + (isPause ? 'pause' : 'exit'), w / 2, by + boxH + 24);
    ctx.textAlign = 'left';
  }

  _drawOptions(ctx, w, h) {
    this._drawHeader(ctx, w, h, 'OPTIONS');

    const rows = this.getOptionRows();

    const boxW = 420;
    const boxH = 270;
    const bx = (w - boxW) / 2;
    const by = h / 2 - 60;

    ctx.fillStyle = 'rgba(7,7,20,0.9)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    const pulse = 0.6 + 0.4 * Math.sin(this._pulseT * 0.004);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const y = by + 40 + i * 30;
      const isSel = i === this.sel;

      if (isSel) {
        ctx.fillStyle = `rgba(0,255,136,${0.08 + pulse * 0.10})`;
        ctx.fillRect(bx + 18, y - 18, boxW - 36, 24);
        ctx.strokeStyle = `rgba(0,255,136,${0.20 + pulse * 0.20})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 18, y - 18, boxW - 36, 24);
      }

      ctx.fillStyle = isSel ? '#00ff88' : '#b8b8d0';
      ctx.font = isSel ? 'bold 13px Courier New' : '12px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, bx + 32, y);

      ctx.fillStyle = isSel ? '#00eeff' : '#667099';
      ctx.textAlign = 'right';
      ctx.fillText(String(r.value || ''), bx + boxW - 32, y);
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓ select · ←/→ adjust · ENTER toggle · ESC back', w / 2, by + boxH + 24);
    ctx.textAlign = 'left';
  }

  _drawTutorial(ctx, w, h) {
    this._drawHeader(ctx, w, h, 'TUTORIAL');

    const p = TUTORIAL_PAGES[this.tutPage];
    if (!p) return;

    const boxW = 460;
    const boxH = 280;
    const bx = (w - boxW) / 2;
    const by = h / 2 - 70;

    ctx.fillStyle = 'rgba(7,7,20,0.92)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(p.title, w / 2, by + 42);

    ctx.fillStyle = '#b8b8d0';
    ctx.font = '12px Courier New';
    let y = by + 78;
    const lineHeight = 22;
    for (const line of p.body) {
      ctx.fillText(line, w / 2, y);
      y += lineHeight;
    }

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.fillText(`Page ${this.tutPage + 1}/${TUTORIAL_PAGES.length} · ←/→ page · ENTER next · ESC back`, w / 2, by + boxH - 22);

    ctx.textAlign = 'left';
  }

  _drawDreamscape(ctx, w, h) {
    this._drawHeader(ctx, w, h, 'SELECT DREAMSCAPE');

    const dreams = this.getDreamscapeOptions();
    const boxW = 460;
    const rowH = 42;
    const paddingV = 16;
    const boxH = dreams.length * rowH + paddingV * 2;
    const bx = (w - boxW) / 2;
    const by = h / 2 - boxH / 2 + 10;

    ctx.fillStyle = 'rgba(7,7,20,0.92)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    const pulse = 0.6 + 0.4 * Math.sin(this._pulseT * 0.004);

    for (let i = 0; i < dreams.length; i++) {
      const dream = dreams[i];
      const isSel = i === this.dreamscapeSel;
      const rowY = by + paddingV + i * rowH;

      if (isSel) {
        ctx.fillStyle = `rgba(0,255,136,${0.08 + pulse * 0.10})`;
        ctx.fillRect(bx + 10, rowY, boxW - 20, rowH - 4);
        ctx.strokeStyle = `rgba(0,255,136,${0.30 + pulse * 0.20})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 10, rowY, boxW - 20, rowH - 4);
      }

      // Label
      ctx.fillStyle = isSel ? '#00ff88' : '#b8b8d0';
      ctx.font = isSel ? 'bold 13px Courier New' : '12px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText((isSel ? '▶ ' : '  ') + dream.label, bx + 26, rowY + rowH / 2 - 3);

      // Flavor (single line, truncated with ellipsis if needed)
      const rawFlavor = dream.flavor.replace(/\n/g, ' ');
      const flavorLine = rawFlavor.length > 40 ? rawFlavor.slice(0, 38) + '…' : rawFlavor;
      ctx.fillStyle = isSel ? '#00eeff' : '#445566';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText(flavorLine, bx + boxW - 20, rowY + rowH / 2 - 3);
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓ choose · ENTER confirm · ESC back', w / 2, by + boxH + 22);
    ctx.textAlign = 'left';
  }

  _drawPlaymode(ctx, w, h) {
    const dreamId = this._pendingDreamscape || 'RIFT';
    this._drawHeader(ctx, w, h, `SELECT PLAY MODE · ${dreamId}`);

    const modes = this.getPlaymodeOptions();
    const boxW = 480;
    const rowH = 40;
    const paddingV = 14;
    const boxH = modes.length * rowH + paddingV * 2;
    const bx = (w - boxW) / 2;
    const by = h / 2 - boxH / 2 + 10;

    ctx.fillStyle = 'rgba(7,7,20,0.92)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    const pulse = 0.6 + 0.4 * Math.sin(this._pulseT * 0.004);

    for (let i = 0; i < modes.length; i++) {
      const mode = modes[i];
      const isSel = i === this.playmodeSel;
      const rowY = by + paddingV + i * rowH;

      if (isSel) {
        ctx.fillStyle = `rgba(0,229,255,${0.07 + pulse * 0.10})`;
        ctx.fillRect(bx + 10, rowY, boxW - 20, rowH - 4);
        ctx.strokeStyle = `rgba(0,229,255,${0.28 + pulse * 0.20})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 10, rowY, boxW - 20, rowH - 4);
      }

      ctx.fillStyle = isSel ? '#00e5ff' : '#b8b8d0';
      ctx.font = isSel ? 'bold 12px Courier New' : '11px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText((isSel ? '▶ ' : '  ') + mode.name, bx + 26, rowY + rowH / 2 - 2);

      const descLine = mode.desc.length > 42 ? mode.desc.slice(0, 40) + '…' : mode.desc;
      ctx.fillStyle = isSel ? '#88ffcc' : '#445566';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText(descLine, bx + boxW - 20, rowY + rowH / 2 - 2);
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓ choose · ENTER confirm · ESC back', w / 2, by + boxH + 22);
    ctx.textAlign = 'left';
  }

  _drawCosmology(ctx, w, h) {
    const dreamId = this._pendingDreamscape || 'RIFT';
    const playMode = this._pendingPlaymode || 'ARCADE';
    this._drawHeader(ctx, w, h, `CHOOSE COSMOLOGY · ${dreamId} · ${playMode}`);

    const cosmologies = this.getCosmologyOptions();
    const boxW = 500;
    const rowH = 38;
    const paddingV = 14;
    const boxH = Math.min(cosmologies.length * rowH + paddingV * 2, h * 0.75);
    const visibleRows = Math.floor((boxH - paddingV * 2) / rowH);
    const bx = (w - boxW) / 2;
    const by = h / 2 - boxH / 2 + 10;

    // Scroll so selected item is visible
    const scrollStart = Math.max(0, Math.min(
      this.cosmologySel - Math.floor(visibleRows / 2),
      cosmologies.length - visibleRows,
    ));

    ctx.fillStyle = 'rgba(7,7,20,0.92)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);

    const pulse = 0.6 + 0.4 * Math.sin(this._pulseT * 0.004);

    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, boxW, boxH);
    ctx.clip();

    for (let i = 0; i < cosmologies.length; i++) {
      const cosmo = cosmologies[i];
      const isSel = i === this.cosmologySel;
      const rowY = by + paddingV + (i - scrollStart) * rowH;
      if (rowY + rowH < by || rowY > by + boxH) continue;

      if (isSel) {
        ctx.fillStyle = `rgba(0,229,255,${0.07 + pulse * 0.10})`;
        ctx.fillRect(bx + 10, rowY, boxW - 20, rowH - 4);
        ctx.strokeStyle = `rgba(0,229,255,${0.28 + pulse * 0.20})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 10, rowY, boxW - 20, rowH - 4);
      }

      const label = cosmo.id === null ? cosmo.name : `${cosmo.name}`;
      ctx.fillStyle = isSel ? '#00e5ff' : '#b8b8d0';
      ctx.font = isSel ? 'bold 11px Courier New' : '11px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText((isSel ? '▶ ' : '  ') + label, bx + 26, rowY + rowH / 2 - 4);

      // tradition + subtitle
      const tradLabel = cosmo.tradition ? `${cosmo.tradition}` : '';
      ctx.fillStyle = isSel ? '#88ffcc' : '#445566';
      ctx.font = '8px Courier New';
      const sub = (cosmo.subtitle || '').length > 38 ? cosmo.subtitle.slice(0, 36) + '…' : (cosmo.subtitle || '');
      ctx.fillText(sub, bx + 26, rowY + rowH / 2 + 8);
      if (tradLabel) {
        ctx.textAlign = 'right';
        ctx.fillStyle = isSel ? '#ccaaff' : '#334';
        ctx.fillText(tradLabel, bx + boxW - 20, rowY + rowH / 2 - 4);
        ctx.textAlign = 'left';
      }
    }

    ctx.restore();

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓ choose · ENTER start · BKSP back', w / 2, by + boxH + 22);
    ctx.textAlign = 'left';
  }

  _drawCredits(ctx, w, h) {
    this._drawHeader(ctx, w, h, 'CREDITS');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#b8b8d0';
    ctx.font = '12px Courier New';
    ctx.fillText('Made for play, pattern, and glow.', w / 2, h / 2 - 10);
    ctx.fillText('Begin in stillness. Emerge through pattern recognition.', w / 2, h / 2 + 20);

    ctx.fillStyle = '#667099';
    ctx.font = '9px Courier New';
    ctx.fillText('MenuSystem ported from _archive/glitch-peace-v5', w / 2, h / 2 + 50);

    ctx.fillStyle = '#445566';
    ctx.font = '8px Courier New';
    ctx.fillText('ENTER to return', w / 2, h / 2 + 75);
    ctx.textAlign = 'left';
  }

  _drawOnboarding(ctx, w, h) {
    const step = this._onboardingStep;
    const ageGroups = MenuSystem.AGE_GROUPS;

    // Background
    ctx.fillStyle = '#030312';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00e5ff';
    ctx.font = `bold ${Math.floor(w / 12)}px Courier New`;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 20;
    ctx.fillText('GLITCH·PEACE', w / 2, h * 0.12);
    ctx.shadowBlur = 0;

    const stepLabels = ['WELCOME', 'YOUR AGE', 'YOUR LANGUAGE', 'LEARN LANGUAGE'];
    ctx.fillStyle = '#334466';
    ctx.font = '8px Courier New';
    ctx.fillText(`SETUP  ${step + 1} / 4  ·  ${stepLabels[step]}`, w / 2, h * 0.18);

    // Step dots
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === step ? '#00e5ff' : i < step ? '#226644' : '#223344';
      ctx.fillRect(w / 2 - 28 + i * 18, h * 0.21, 10, 3);
    }

    if (step === 0) {
      // Welcome
      ctx.fillStyle = '#8899bb';
      ctx.font = `${Math.floor(w / 30)}px Courier New`;
      ctx.fillText('Welcome, explorer.', w / 2, h * 0.35);
      ctx.font = `${Math.floor(w / 36)}px Courier New`;
      ctx.fillStyle = '#556677';
      const lines = [
        'GLITCH·PEACE is a consciousness game about',
        'pattern recognition, learning, and peace.',
        '',
        'We\'ll set up the game for you in 3 quick steps.',
      ];
      lines.forEach((line, i) => ctx.fillText(line, w / 2, h * 0.45 + i * (h * 0.065)));
      ctx.fillStyle = '#00cc88';
      ctx.font = `bold ${Math.floor(w / 34)}px Courier New`;
      ctx.fillText('Press ENTER to begin  ·  ESC to skip', w / 2, h * 0.80);

    } else if (step === 1) {
      // Age group
      ctx.fillStyle = '#aabbcc';
      ctx.font = `bold ${Math.floor(w / 28)}px Courier New`;
      ctx.fillText('How old are you?', w / 2, h * 0.30);
      ctx.fillStyle = '#556677';
      ctx.font = `${Math.floor(w / 38)}px Courier New`;
      ctx.fillText('(this sets a starting difficulty — you can change it later)', w / 2, h * 0.36);

      for (let i = 0; i < ageGroups.length; i++) {
        const ag = ageGroups[i];
        const y = h * 0.46 + i * (h * 0.105);
        const sel = i === this._onboardingAge;
        ctx.fillStyle = sel ? '#001a33' : 'transparent';
        ctx.fillRect(w * 0.18, y - 14, w * 0.64, 26);
        ctx.strokeStyle = sel ? '#00aaff' : '#223344';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.18, y - 14, w * 0.64, 26);
        ctx.fillStyle = sel ? '#00e5ff' : '#667788';
        ctx.font = `${sel ? 'bold ' : ''}${Math.floor(w / 32)}px Courier New`;
        ctx.fillText(`${ag.emoji}  ${ag.label}`, w / 2, y + 4);
      }
      ctx.fillStyle = '#445566';
      ctx.font = '8px Courier New';
      ctx.fillText('↑/↓ to choose  ·  ENTER to confirm  ·  ESC to skip', w / 2, h * 0.90);

    } else if (step === 2) {
      // Native language
      ctx.fillStyle = '#aabbcc';
      ctx.font = `bold ${Math.floor(w / 28)}px Courier New`;
      ctx.fillText('What is your native language?', w / 2, h * 0.28);

      const visCount = 6;
      const startIdx = Math.max(0, Math.min(this._nativeLangSel - Math.floor(visCount / 2), LANGUAGES.length - visCount));
      for (let i = 0; i < visCount; i++) {
        const idx = startIdx + i;
        if (idx >= LANGUAGES.length) break;
        const lang = LANGUAGES[idx];
        const y = h * 0.38 + i * (h * 0.085);
        const sel = idx === this._nativeLangSel;
        ctx.fillStyle = sel ? '#001a33' : 'transparent';
        ctx.fillRect(w * 0.15, y - 12, w * 0.70, 24);
        ctx.strokeStyle = sel ? '#00aaff' : '#1a2233';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.15, y - 12, w * 0.70, 24);
        ctx.fillStyle = sel ? '#00e5ff' : '#667788';
        ctx.font = `${sel ? 'bold ' : ''}${Math.floor(w / 34)}px Courier New`;
        ctx.textAlign = 'left';
        ctx.fillText(lang.name, w * 0.22, y + 4);
        ctx.textAlign = 'right';
        ctx.fillStyle = sel ? '#aaccee' : '#445566';
        ctx.font = `${Math.floor(w / 38)}px Courier New`;
        ctx.fillText(lang.nativeName, w * 0.83, y + 4);
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = '#445566';
      ctx.font = '8px Courier New';
      ctx.fillText('↑/↓ to scroll  ·  ENTER to confirm  ·  ESC to skip', w / 2, h * 0.90);

    } else if (step === 3) {
      // Target language
      const langs = this._learnableLangs;
      ctx.fillStyle = '#aabbcc';
      ctx.font = `bold ${Math.floor(w / 28)}px Courier New`;
      ctx.fillText('Which language would you like to learn?', w / 2, h * 0.27);
      ctx.fillStyle = '#445566';
      ctx.font = `${Math.floor(w / 38)}px Courier New`;
      ctx.fillText('(ordered by how similar they are to your native language)', w / 2, h * 0.33);

      const visCount = 6;
      const startIdx = Math.max(0, Math.min(this._targetLangSel - Math.floor(visCount / 2), langs.length - visCount));
      for (let i = 0; i < visCount; i++) {
        const idx = startIdx + i;
        if (idx >= langs.length) break;
        const lang = langs[idx];
        const y = h * 0.41 + i * (h * 0.085);
        const sel = idx === this._targetLangSel;
        ctx.fillStyle = sel ? '#001a33' : 'transparent';
        ctx.fillRect(w * 0.15, y - 12, w * 0.70, 24);
        ctx.strokeStyle = sel ? '#00aaff' : '#1a2233';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.15, y - 12, w * 0.70, 24);
        ctx.fillStyle = sel ? '#00e5ff' : '#667788';
        ctx.font = `${sel ? 'bold ' : ''}${Math.floor(w / 34)}px Courier New`;
        ctx.textAlign = 'left';
        ctx.fillText(lang.name, w * 0.22, y + 4);
        ctx.textAlign = 'right';
        ctx.fillStyle = sel ? '#aaccee' : '#445566';
        ctx.font = `${Math.floor(w / 38)}px Courier New`;
        ctx.fillText(lang.nativeName, w * 0.83, y + 4);
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = '#00cc88';
      ctx.font = `bold ${Math.floor(w / 36)}px Courier New`;
      ctx.fillText('Vocabulary challenges will appear in this language!', w / 2, h * 0.84);
      ctx.fillStyle = '#445566';
      ctx.font = '8px Courier New';
      ctx.fillText('↑/↓ to scroll  ·  ENTER to confirm  ·  ESC to skip', w / 2, h * 0.90);
    }

    ctx.textAlign = 'left';
  }

  _render() {
    const overlay = document.getElementById('menu-overlay');
    if (!overlay) {
      return;
    }
    // Always clear overlay before rendering to prevent stacking
    overlay.innerHTML = '';
    overlay.classList.remove('hidden');
    if (this.screen === 'hidden') {
      overlay.classList.add('hidden');
      return;
    }
    let html = '';
    if (this.screen === 'title') {
      html = this._renderTitle();
    } else if (this.screen === 'pause') {
      html = this._renderPause();
    } else if (this.screen === 'dreamscape') {
      html = this._renderDreamscape();
    } else if (this.screen === 'tutorial') {
      html = this._renderTutorial();
    } else if (this.screen === 'options') {
      html = this._renderOptions();
    } else if (this.screen === 'credits') {
      html = this._renderCredits();
    }
    overlay.innerHTML = html;
  }

  _renderTitle() {
    // Simple title menu HTML for overlay
    return `
      <div class="menu-title">GLITCH·PEACE</div>
      <div class="menu-subtitle">A Consciousness Simulation</div>
      <div class="menu-items">
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.onStartNew && window.MenuSystem.onStartNew()">NEW GAME</div>
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.onContinue && window.MenuSystem.onContinue()">CONTINUE</div>
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.open && window.MenuSystem.open('tutorial')">TUTORIAL</div>
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.open && window.MenuSystem.open('options')">OPTIONS</div>
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.open && window.MenuSystem.open('credits')">CREDITS</div>
        <div class="menu-item" onclick="window.MenuSystem && window.MenuSystem.onQuitToTitle && window.MenuSystem.onQuitToTitle({to:'title'})">EXIT</div>
      </div>
    `;
  }
}




