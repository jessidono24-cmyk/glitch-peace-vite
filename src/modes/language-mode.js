'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — language-mode.js
//  Language Learning Mode — three-layer immersive vocabulary acquisition
//
//  Research basis (see docs/research/language-learning/RESEARCH.md):
//  - Krashen (1982): Input Hypothesis — comprehensible i+1 exposure
//  - Nation (2001): Incidental learning through meaning-focused reading
//  - Lomb (2008): Reading with pleasure; emotional engagement aids retention
//  - Erard (2012): Polyglot pattern — contextual immersion before drilling
//  - FSRS-5 (Ye 2024): ~90% retention vs ~47% for SM-2 (Wozniak 1987)
//
//  Layer 1 — IMMERSION: words drift as ambient labels in the dreamscape.
//    No quiz pressure — incidental exposure builds familiarity.
//    Words float at varying speeds & opacities, anchored to dreamscape theme.
//
//  Layer 2 — ACQUISITION: FSRS-scheduled recognition quiz.
//    See target word → choose correct English meaning from 4 options.
//    After N quizzes, every 3rd is a production quiz (Layer 3).
//
//  Layer 3 — PRODUCTION: see English meaning → select the target word.
//    Higher cognitive demand; triggered every 3rd quiz automatically.
//
//  Uses window.innerWidth/Height internally — NOT CW()/CH().
// ═══════════════════════════════════════════════════════════════════════

import GameMode from '../core/interfaces/GameMode.js';
import { newCard, review, getDueCards, sessionRetention } from '../core/fsrs.js';
import { LANGUAGE_CONTENT, getWords, getDistractors, LANG_LEARNING_CODES } from '../data/language-content.js';

const FONT = "'Share Tech Mono', monospace";
const FONT_MONO = 'monospace';

// ─── Ambient word particle ───────────────────────────────────────────
function makeAmbientWord(word, w, h) {
  return {
    text:  word.word,
    sub:   word.meaning,
    x:     Math.random() * w,
    y:     Math.random() * h,
    vx:    (Math.random() - 0.5) * 0.18,
    vy:    (Math.random() - 0.5) * 0.12,
    alpha: 0.15 + Math.random() * 0.45,
    size:  14 + Math.floor(Math.random() * 10),
    pulse: Math.random() * Math.PI * 2,
    color: _contextColor(word.context),
  };
}

function _contextColor(ctx) {
  const map = {
    nature: '#44ff88', sky: '#aaddff', dream: '#cc88ff',
    body: '#ff88cc', action: '#ffcc44', urban: '#88ccff',
  };
  return map[ctx] || '#aaffaa';
}

// ─── Language selector screen ────────────────────────────────────────
const LANG_LABELS = {
  fr: { flag: '🇫🇷', name: 'FRENCH',   native: 'Français',  hint: 'Romance · Latin script · 600 FSI hrs' },
  es: { flag: '🇪🇸', name: 'SPANISH',  native: 'Español',   hint: 'Romance · Latin script · 600 FSI hrs' },
  ja: { flag: '🇯🇵', name: 'JAPANESE', native: '日本語',     hint: 'Japonic · 3 scripts · 2200 FSI hrs' },
};

export class LanguageMode extends GameMode {
  constructor(sharedSystems) {
    super(sharedSystems || {});
    this.name = 'language_learning';

    // Persistent per-language FSRS decks: { langCode: { wordId: card } }
    this._decks = {};
    for (const code of LANG_LEARNING_CODES) {
      this._decks[code] = {};
    }

    // Session state
    this._lang      = null;   // active language code
    this._phase     = 'lang_select';  // 'lang_select' | 'immersion' | 'quiz' | 'stats'
    this._cursor    = 0;

    // Immersion layer state
    this._ambientWords = [];
    this._immersionTimer = 0;
    this._immersionDuration = 12000; // ms before first quiz prompt

    // Quiz state
    this._quizWord   = null;
    this._quizOptions = [];
    this._quizAnswer  = -1;   // index selected, or -1
    this._quizCorrect = null;
    this._quizFeedback = null; // { text, color, dsrText, at }
    this._quizCount   = 0;    // quizzes completed this session
    this._quizRatings = [];   // array of ratings for session retention
    this._isProduction = false; // Layer 3 flag

    // Stats
    this._sessionStart = null;
  }

  init(gameState, canvas, ctx) {
    this.isActive = true;
    this._canvas  = canvas;
    this._ctx     = ctx;
    this._phase   = 'lang_select';
    this._cursor  = 0;
    this._quizCount = 0;
    this._quizRatings = [];
    this._sessionStart = Date.now();
    this._ambientWords = [];
    this._immersionTimer = 0;
    this._quizFeedback = null;
  }

  // ─── Language selector ─────────────────────────────────────────────
  _selectLang(code) {
    this._lang = code;
    // Ensure deck has cards for all words
    const words = getWords(code);
    const deck  = this._decks[code];
    for (const w of words) {
      if (!deck[w.id]) deck[w.id] = newCard();
    }
    this._phase = 'immersion';
    this._immersionTimer = 0;
    this._buildAmbientWords();
  }

  _buildAmbientWords() {
    const w  = window.innerWidth;
    const h  = window.innerHeight;
    const words = getWords(this._lang);
    this._ambientWords = words.map(word => makeAmbientWord(word, w, h));
  }

  // ─── Quiz scheduling ───────────────────────────────────────────────
  _startQuiz() {
    const code = this._lang;
    const deck = this._decks[code];
    const due  = getDueCards(deck, 1);
    // If no due cards, pick a random word (all reviewed recently)
    const words = getWords(code);
    let wordEntry;
    if (due.length > 0) {
      wordEntry = words.find(w => w.id === due[0]);
    } else {
      wordEntry = words[Math.floor(Math.random() * words.length)];
    }
    if (!wordEntry) { this._phase = 'immersion'; return; }

    this._quizWord    = wordEntry;
    // Production (Layer 3) every 3rd quiz: positions 3, 6, 9... (0-indexed: 2, 5, 8...)
    this._isProduction = (this._quizCount + 1) % 3 === 0 && this._quizCount > 0;
    this._quizAnswer  = -1;
    this._quizCorrect = null;
    this._quizFeedback = null;

    if (!this._isProduction) {
      // Layer 2: see word → pick meaning
      const distractors = getDistractors(code, wordEntry.id, 3);
      const options = [wordEntry.meaning, ...distractors].sort(() => Math.random() - 0.5);
      this._quizOptions = options;
    } else {
      // Layer 3: see meaning → pick word
      const allWords = words.filter(w => w.id !== wordEntry.id);
      const wrong    = allWords.sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.word);
      const options  = [wordEntry.word, ...wrong].sort(() => Math.random() - 0.5);
      this._quizOptions = options;
    }
    this._phase = 'quiz';
  }

  _submitAnswer(optionIdx) {
    if (this._quizCorrect !== null) return; // already answered

    const word = this._quizWord;
    const selected = this._quizOptions[optionIdx];
    const correct  = this._isProduction ? word.word : word.meaning;
    const isCorrect = selected === correct;

    this._quizAnswer  = optionIdx;
    this._quizCorrect = isCorrect;

    // Rate: Easy=4, Good=3, Hard=2, Again=1 (binary for now — correct=Good, wrong=Again)
    const rating = isCorrect ? 3 : 1;
    const deck   = this._decks[this._lang];
    const card   = deck[word.id] || newCard();
    const result = review(card, rating);
    deck[word.id] = result.card;

    this._quizRatings.push(rating);
    this._quizFeedback = {
      text:   isCorrect ? '✓ CORRECT' : `✗ ${correct}`,
      color:  isCorrect ? '#00ff88' : '#ff4466',
      dsrText: result.dsrText,
      at:     Date.now(),
    };
    this._quizCount++;
  }

  _advanceFromQuiz() {
    this._phase = 'immersion';
    this._quizWord = null;
    this._quizFeedback = null;
    this._immersionTimer = 0;
    this._immersionDuration = 8000 + Math.random() * 6000;
  }

  // ─── Update ────────────────────────────────────────────────────────
  update(gameState, deltaTime) {
    if (!deltaTime || deltaTime > 500 || isNaN(deltaTime)) return;
    if (this._phase !== 'immersion') return;
    this._immersionTimer += deltaTime;

    const w = window.innerWidth, h = window.innerHeight;
    for (const aw of this._ambientWords) {
      aw.x += aw.vx;
      aw.y += aw.vy;
      aw.pulse += 0.012;
      if (aw.x < -120)  aw.x = w + 60;
      if (aw.x > w + 120) aw.x = -60;
      if (aw.y < -40)   aw.y = h + 20;
      if (aw.y > h + 40) aw.y = -20;
    }

    if (this._immersionTimer >= this._immersionDuration) {
      this._startQuiz();
    }
  }

  handleInput(gameState, input) {
    if (this._phase === 'lang_select') {
      const dir = input.getDirectionalInput ? input.getDirectionalInput() : { x: 0, y: 0 };
      const n   = LANG_LEARNING_CODES.length;
      if (dir.y < 0) this._cursor = (this._cursor - 1 + n) % n;
      if (dir.y > 0) this._cursor = (this._cursor + 1) % n;
      if (input.isKeyPressed('Enter') || input.isKeyPressed(' ')) {
        this._selectLang(LANG_LEARNING_CODES[this._cursor]);
      }
      return;
    }

    if (this._phase === 'quiz' && this._quizWord) {
      if (this._quizCorrect !== null) {
        // Advance on any key after feedback shown
        if (input.isKeyPressed('Enter') || input.isKeyPressed(' ') ||
            input.isKeyPressed('ArrowRight') || input.isKeyPressed('ArrowLeft')) {
          this._advanceFromQuiz();
        }
        return;
      }
      const dir = input.getDirectionalInput ? input.getDirectionalInput() : { x: 0, y: 0 };
      const n   = this._quizOptions.length;
      // Initialize selection to 0 on first navigation (before any arrow key)
      if (dir.y < 0) this._quizAnswer = this._quizAnswer < 0 ? n - 1 : (this._quizAnswer === 0 ? n - 1 : this._quizAnswer - 1);
      if (dir.y > 0) this._quizAnswer = this._quizAnswer < 0 ? 0     : (this._quizAnswer >= n - 1 ? 0 : this._quizAnswer + 1);
      // Allow number keys 1–4
      for (let i = 1; i <= n; i++) {
        if (input.isKeyPressed(String(i))) { this._quizAnswer = i - 1; this._submitAnswer(i - 1); return; }
      }
      if ((input.isKeyPressed('Enter') || input.isKeyPressed(' ')) && this._quizAnswer >= 0) {
        this._submitAnswer(this._quizAnswer);
      }
      return;
    }

    if (this._phase === 'stats') {
      if (input.isKeyPressed('Enter') || input.isKeyPressed(' ')) {
        this._phase = 'lang_select';
      }
    }
  }

  // ─── Render ────────────────────────────────────────────────────────
  render(gameState, ctx) {
    const canvas = ctx.canvas;
    const w      = window.innerWidth;
    const h      = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this._phase === 'lang_select') {
      this._renderLangSelect(ctx, w, h);
    } else if (this._phase === 'immersion') {
      this._renderImmersion(ctx, w, h);
    } else if (this._phase === 'quiz') {
      this._renderQuiz(ctx, w, h);
    } else if (this._phase === 'stats') {
      this._renderStats(ctx, w, h);
    }
  }

  _renderLangSelect(ctx, w, h) {
    // Deep background
    ctx.fillStyle = '#01010a';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, y, w, 1); }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#44aaff';
    ctx.shadowColor = '#44aaff'; ctx.shadowBlur = 16;
    ctx.font = `bold ${Math.max(18, Math.floor(w * 0.025))}px ${FONT}`;
    ctx.fillText('LANGUAGE LEARNING', w / 2, h * 0.14);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#223344';
    ctx.font = `${Math.max(12, Math.floor(w * 0.014))}px ${FONT}`;
    ctx.fillText('FSRS-5 spaced repetition · immersive dreamscape vocabulary', w / 2, h * 0.20);
    ctx.fillText('Arrow keys to select · Enter to begin', w / 2, h * 0.245);

    const cardW = Math.min(420, w * 0.55);
    const cardH = 80;
    const startY = h * 0.33;

    LANG_LEARNING_CODES.forEach((code, i) => {
      const meta  = LANG_LABELS[code];
      const cy    = startY + i * (cardH + 16);
      const cx    = (w - cardW) / 2;
      const sel   = i === this._cursor;

      ctx.fillStyle = sel ? 'rgba(68,170,255,0.18)' : 'rgba(10,20,30,0.7)';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = sel ? '#44aaff' : '#1a2a3a';
      ctx.lineWidth   = sel ? 2 : 1;
      ctx.strokeRect(cx, cy, cardW, cardH);

      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#88ddff' : '#aabbcc';
      ctx.font = `bold ${Math.max(16, Math.floor(w * 0.019))}px ${FONT}`;
      ctx.fillText(`${meta.flag}  ${meta.name}`, cx + 20, cy + 28);

      ctx.fillStyle = '#556677';
      ctx.font = `${Math.max(11, Math.floor(w * 0.013))}px ${FONT}`;
      ctx.fillText(`${meta.native}  ·  ${meta.hint}`, cx + 20, cy + 52);

      // Word count
      const wc = getWords(code).length;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#334455';
      ctx.fillText(`${wc} words`, cx + cardW - 16, cy + 52);
    });

    ctx.textAlign = 'left';
  }

  _renderImmersion(ctx, w, h) {
    // Dreamscape background
    ctx.fillStyle = '#010815';
    ctx.fillRect(0, 0, w, h);

    // Subtle vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

    // Floating ambient words (Layer 1)
    ctx.textAlign = 'center';
    const ts = Date.now() * 0.001;
    for (const aw of this._ambientWords) {
      const a = aw.alpha * (0.7 + 0.3 * Math.sin(aw.pulse + ts));
      ctx.globalAlpha = a;
      ctx.fillStyle = aw.color;
      ctx.font = `${aw.size}px ${FONT_MONO}`;
      ctx.fillText(aw.text, aw.x, aw.y);
      // Tiny meaning below at lower opacity
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = '#aabbcc';
      ctx.font = `${Math.max(10, aw.size - 4)}px ${FONT_MONO}`;
      ctx.fillText(aw.sub, aw.x, aw.y + aw.size + 2);
    }
    ctx.globalAlpha = 1;

    // Language label + immersion progress
    const meta  = LANG_LABELS[this._lang] || {};
    const pct   = Math.min(1, this._immersionTimer / this._immersionDuration);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(68,170,255,0.4)';
    ctx.font = `${Math.max(11, Math.floor(w * 0.013))}px ${FONT}`;
    ctx.fillText(`${meta.flag || ''} ${meta.name || this._lang}  ·  IMMERSION`, w / 2, h - 32);

    // Progress bar (bottom)
    const barW = w * 0.3;
    const bx   = (w - barW) / 2;
    const by   = h - 18;
    ctx.fillStyle = 'rgba(10,20,40,0.7)';
    ctx.fillRect(bx, by, barW, 4);
    ctx.fillStyle = '#44aaff';
    ctx.fillRect(bx, by, barW * pct, 4);

    // Quiz approaching hint
    if (pct > 0.75) {
      const fade = (pct - 0.75) / 0.25;
      ctx.globalAlpha = fade * 0.6;
      ctx.fillStyle = '#aaddff';
      ctx.font = `${Math.max(12, Math.floor(w * 0.014))}px ${FONT}`;
      ctx.fillText('QUIZ APPROACHING…', w / 2, h - 50);
      ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'left';
  }

  _renderQuiz(ctx, w, h) {
    // Dimmed dreamscape background
    ctx.fillStyle = '#010512';
    ctx.fillRect(0, 0, w, h);

    // Subtle ambient words at low opacity for context
    if (this._ambientWords.length > 0) {
      const ts = Date.now() * 0.001;
      ctx.textAlign = 'center';
      for (const aw of this._ambientWords) {
        ctx.globalAlpha = aw.alpha * 0.08 * (0.7 + 0.3 * Math.sin(aw.pulse + ts));
        ctx.fillStyle = aw.color;
        ctx.font = `${aw.size}px ${FONT_MONO}`;
        ctx.fillText(aw.text, aw.x, aw.y);
      }
      ctx.globalAlpha = 1;
    }

    const popW = Math.min(560, w * 0.85);
    const popH = Math.min(460, h * 0.78);
    const popX = (w - popW) / 2;
    const popY = (h - popH) / 2;
    const cx   = w / 2;

    // Card background
    ctx.fillStyle = 'rgba(4,8,20,0.96)';
    ctx.fillRect(popX, popY, popW, popH);
    const borderCol = this._isProduction ? '#ffcc44' : '#44aaff';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 2;
    ctx.strokeRect(popX, popY, popW, popH);

    const fs = n => Math.max(12, Math.floor(popW / n));

    // Layer label
    const layerLabel = this._isProduction ? '✍  PRODUCTION  (Layer 3)' : '👁  ACQUISITION  (Layer 2)';
    const layerColor = this._isProduction ? '#ffcc44' : '#44aaff';
    ctx.textAlign = 'center';
    ctx.fillStyle = layerColor;
    ctx.font = `bold ${fs(30)}px ${FONT}`;
    ctx.fillText(layerLabel, cx, popY + popH * 0.09);

    // Prompt
    const word = this._quizWord;
    const promptText = this._isProduction
      ? word.meaning.toUpperCase()
      : word.word;
    ctx.fillStyle = '#eef4ff';
    ctx.font = `bold ${fs(16)}px ${FONT}`;
    ctx.shadowColor = borderCol; ctx.shadowBlur = 8;
    ctx.fillText(promptText, cx, popY + popH * 0.23);
    ctx.shadowBlur = 0;

    // IPA / example
    ctx.fillStyle = '#445566';
    ctx.font = `italic ${fs(28)}px ${FONT}`;
    ctx.fillText(this._isProduction ? word.word : word.ipa, cx, popY + popH * 0.31);

    ctx.fillStyle = '#334455';
    ctx.font = `${fs(32)}px ${FONT}`;
    ctx.fillText(word.example, cx, popY + popH * 0.38);

    // Question prompt
    ctx.fillStyle = '#556677';
    ctx.font = `${fs(30)}px ${FONT}`;
    const question = this._isProduction
      ? 'Select the word in ' + (LANG_LABELS[this._lang]?.name || this._lang) + ':'
      : 'What does this mean?';
    ctx.fillText(question, cx, popY + popH * 0.46);

    // Options
    const optH  = Math.min(44, popH * 0.09);
    const optW  = popW * 0.82;
    const optX  = popX + (popW - optW) / 2;
    const optY0 = popY + popH * 0.52;

    this._quizOptions.forEach((opt, i) => {
      const oy  = optY0 + i * (optH + 8);
      let bg    = 'rgba(12,20,36,0.9)';
      let border = '#1a2a3a';
      let textCol = '#aabbcc';

      if (this._quizCorrect !== null) {
        const isCorrectOpt = opt === (this._isProduction ? word.word : word.meaning);
        if (isCorrectOpt) { bg = 'rgba(0,60,30,0.9)'; border = '#00ff88'; textCol = '#00ff88'; }
        else if (i === this._quizAnswer && !this._quizCorrect) {
          bg = 'rgba(60,0,20,0.9)'; border = '#ff4466'; textCol = '#ff4466';
        }
      } else if (i === this._quizAnswer) {
        bg = 'rgba(20,40,70,0.9)'; border = '#44aaff'; textCol = '#88ddff';
      }

      ctx.fillStyle = bg;
      ctx.fillRect(optX, oy, optW, optH);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(optX, oy, optW, optH);

      ctx.fillStyle = textCol;
      ctx.font = `${fs(28)}px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}.  ${opt}`, optX + 14, oy + optH * 0.64);
      ctx.textAlign = 'center';
    });

    // Feedback
    if (this._quizFeedback) {
      const fb = this._quizFeedback;
      const age = Date.now() - fb.at;
      const fade = age > 1200 ? Math.max(0, (2000 - age) / 800) : 1;
      ctx.globalAlpha = fade;
      ctx.fillStyle = fb.color;
      ctx.font = `bold ${fs(22)}px ${FONT}`;
      ctx.shadowColor = fb.color; ctx.shadowBlur = 10;
      ctx.fillText(fb.text, cx, popY + popH * 0.88);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#445566';
      ctx.font = `${fs(36)}px ${FONT}`;
      ctx.fillText(fb.dsrText, cx, popY + popH * 0.94);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2a3a4a';
      ctx.font = `${fs(34)}px ${FONT}`;
      ctx.fillText('Enter / Space to continue', cx, popY + popH * 0.99);
    } else {
      ctx.fillStyle = '#2a3a4a';
      ctx.font = `${fs(34)}px ${FONT}`;
      ctx.fillText('1-4 or Arrow keys + Enter', cx, popY + popH * 0.97);
    }

    ctx.textAlign = 'left';
  }

  _renderStats(ctx, w, h) {
    ctx.fillStyle = '#01010a';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#44aaff';
    ctx.font = `bold ${Math.max(18, Math.floor(w * 0.022))}px ${FONT}`;
    ctx.fillText('SESSION COMPLETE', cx, h * 0.22);

    const retention = sessionRetention(this._quizRatings);
    const dur = Math.round((Date.now() - this._sessionStart) / 1000);
    const meta = LANG_LABELS[this._lang] || {};

    const rows = [
      ['Language',   `${meta.flag || ''} ${meta.name || this._lang}`],
      ['Retention',  `${Math.round(retention * 100)}%  (FSRS-5 target: 90%)`],
      ['Quizzes',    `${this._quizCount}`],
      ['Duration',   `${dur}s`],
      ['Words due',  `${getDueCards(this._decks[this._lang] || {}, 100).length} due now`],
    ];

    const fsSm = Math.max(13, Math.floor(w * 0.015));
    ctx.font = `${fsSm}px ${FONT}`;
    rows.forEach(([label, val], i) => {
      const y = h * 0.36 + i * (fsSm + 12);
      ctx.fillStyle = '#445566';
      ctx.textAlign = 'right';
      ctx.fillText(label + ' :', cx - 10, y);
      ctx.fillStyle = '#aabbcc';
      ctx.textAlign = 'left';
      ctx.fillText(val, cx + 10, y);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a3a4a';
    ctx.font = `${Math.max(12, Math.floor(w * 0.013))}px ${FONT}`;
    ctx.fillText('Enter to return to language select', cx, h * 0.72);
    ctx.textAlign = 'left';
  }

  cleanup() {
    this.isActive = false;
    this._ambientWords = [];
  }

  getState() {
    return {
      name: this.name,
      lang: this._lang,
      decks: this._decks,
      quizCount: this._quizCount,
    };
  }

  restoreState(state) {
    if (!state) return;
    if (state.lang) this._lang = state.lang;
    if (state.decks) this._decks = state.decks;
    if (state.quizCount !== undefined) this._quizCount = state.quizCount;
  }
}
