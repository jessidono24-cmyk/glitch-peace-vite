'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — language-mode.js  (LANG1b)
//  Language Learning Mode — three-layer immersive vocabulary acquisition
//
//  Layer 1 — IMMERSION: words float as ambient labels in the dreamscape
//  Layer 2 — ACQUISITION: FSRS-scheduled recognition quiz (word → meaning)
//  Layer 3 — PRODUCTION: every 3rd card, reversed (meaning → word)
//
//  Uses window.innerWidth / window.innerHeight — NOT CW()/CH().
// ═══════════════════════════════════════════════════════════════════════

import { FSRSDeck } from '../core/fsrs.js';
import { getDreamscapeVocab, LANGUAGE_CONTENT } from '../data/language-content.js';

const STATES = {
  LANG_SELECT: 'lang_select',
  IMMERSION:   'immersion',
  QUIZ:        'quiz',
  PRODUCTION:  'production',
  FEEDBACK:    'feedback',
  STATS:       'stats',
};

const FONT = "'Share Tech Mono', monospace";

// Language metadata for the selection screen
const LANG_META = {
  french:   { flag: '🇫🇷', label: 'FRENCH',   native: 'Français',  hint: 'Romance · Latin script · 600 FSI hrs' },
  spanish:  { flag: '🇪🇸', label: 'SPANISH',  native: 'Español',   hint: 'Romance · Latin script · 600 FSI hrs' },
  japanese: { flag: '🇯🇵', label: 'JAPANESE', native: '日本語',     hint: 'Japonic · 3 scripts · 2200 FSI hrs' },
};
const LANG_KEYS = Object.keys(LANGUAGE_CONTENT); // ['french', 'spanish', 'japanese']

export class LanguageMode {
  constructor(canvas, gameState) {
    this.canvas      = canvas;
    this.gameState   = gameState || { dreamscape: null };
    this.phase       = STATES.LANG_SELECT;
    this.selectedLang = null;
    this.deck        = null;
    this.currentCard = null;
    this.options     = [];
    this.feedback    = null;
    this.feedbackTimer = 0;
    this.menuIndex   = 0;
    this.time        = 0;
    this.ambientLabels = [];
    this.immersionTimer = 0;
    this.sessionCorrect = 0;
    this.sessionTotal   = 0;
    this.initialized    = false;
  }

  init() {
    this.initialized    = true;
    this.phase          = STATES.LANG_SELECT;
    this.menuIndex      = 0;
    this.sessionCorrect = 0;
    this.sessionTotal   = 0;
    this.feedback       = null;
    this.feedbackTimer  = 0;
    this.currentCard    = null;
    this.deck           = null;
    this.ambientLabels  = [];
  }

  // ─── Start selected language ────────────────────────────────────────
  _startLanguage(langKey) {
    this.selectedLang = langKey;
    const ds = this.gameState?.dreamscape || null;
    this.deck = new FSRSDeck(langKey, ds);
    const words = getDreamscapeVocab(langKey, ds);
    for (const w of words) {
      this.deck.addCard(w.word, w.meaning, w.context, langKey);
    }
    this._refreshAmbientLabels();
    this.phase = STATES.IMMERSION;
    this.immersionTimer = 8.0;
  }

  _refreshAmbientLabels() {
    const cards = this.deck.getAmbientCards(5);
    this.ambientLabels = cards.map(card => ({
      card,
      x:          0.1 + Math.random() * 0.8,
      y:          0.2 + Math.random() * 0.6,
      alpha:      0,
      targetAlpha: 0.55 + Math.random() * 0.30,
      wobble:     Math.random() * Math.PI * 2,
      wobbleSpeed: 0.3 + Math.random() * 0.4,
    }));
  }

  // ─── Card flow ──────────────────────────────────────────────────────
  _nextCard() {
    const card = this.deck ? this.deck.getNextCard() : null;
    if (!card) { this.phase = STATES.STATS; return; }
    this.currentCard = card;
    const isProduction = (this.sessionTotal % 3 === 2);
    this.options = this._makeOptions(card, isProduction);
    this.phase = isProduction ? STATES.PRODUCTION : STATES.QUIZ;
  }

  _makeOptions(card, isProduction) {
    // QUIZ (recognition): options are meanings; PRODUCTION (reversed): options are words
    const allCards = this.deck ? [...this.deck.cards.values()] : [];
    const others = allCards.filter(c => c !== card).sort(() => Math.random() - 0.5).slice(0, 3);
    if (isProduction) {
      const opts = [card.word, ...others.map(c => c.word)];
      return opts.sort(() => Math.random() - 0.5);
    }
    const opts = [card.meaning, ...others.map(c => c.meaning)];
    return opts.sort(() => Math.random() - 0.5);
  }

  // ─── Submit answer ──────────────────────────────────────────────────
  _submitAnswer(idx) {
    if (!this.currentCard || idx < 0 || idx >= this.options.length) return;
    const chosen = this.options[idx];
    const isProduction = (this.phase === STATES.PRODUCTION);
    const isCorrect = isProduction
      ? chosen === this.currentCard.word
      : chosen === this.currentCard.meaning;
    const rating   = isCorrect ? 3 : 1;
    const interval = this.currentCard.review(rating);
    this.sessionTotal++;
    if (isCorrect) this.sessionCorrect++;
    this.feedback = {
      correct:       isCorrect,
      chosen,
      correctAnswer: isProduction ? this.currentCard.word : this.currentCard.meaning,
      word:          this.currentCard.word,
      context:       this.currentCard.context,
      interval,
      D: this.currentCard.D.toFixed(1),
      S: this.currentCard.S.toFixed(1),
      R: Math.round(this.currentCard.R * 100) + '%',
    };
    this.feedbackTimer = 3.5;
    this.phase = STATES.FEEDBACK;
  }

  // ─── Input (raw key string) ─────────────────────────────────────────
  handleInput(key) {
    if (!this.initialized) return;

    if (this.phase === STATES.LANG_SELECT) {
      const n = LANG_KEYS.length;
      if (key === 'ArrowDown') this.menuIndex = (this.menuIndex + 1) % n;
      else if (key === 'ArrowUp') this.menuIndex = (this.menuIndex - 1 + n) % n;
      else if (key === 'Enter') this._startLanguage(LANG_KEYS[this.menuIndex]);
      return;
    }

    if (this.phase === STATES.IMMERSION) {
      if (key === 'Enter' || key === ' ') this._nextCard();
      return;
    }

    if (this.phase === STATES.QUIZ || this.phase === STATES.PRODUCTION) {
      const i = ['1','2','3','4'].indexOf(key);
      if (i !== -1) this._submitAnswer(i);
      return;
    }

    if (this.phase === STATES.FEEDBACK) {
      if (key === 'Enter' || key === ' ') {
        if (this.sessionTotal % 5 === 0) {
          this.phase = STATES.IMMERSION;
          this.immersionTimer = 5.0;
          this._refreshAmbientLabels();
        } else {
          this._nextCard();
        }
      }
      return;
    }
  }

  // ─── Update (dt in seconds) ─────────────────────────────────────────
  update(dt) {
    if (!this.initialized || !dt || dt > 0.5) return;
    this.time += dt;

    // Animate ambient labels
    for (const lbl of this.ambientLabels) {
      lbl.wobble += lbl.wobbleSpeed * dt;
      if (lbl.alpha < lbl.targetAlpha) lbl.alpha = Math.min(lbl.targetAlpha, lbl.alpha + dt * 0.5);
      lbl.card.recordExposure();
    }

    if (this.phase === STATES.IMMERSION) {
      this.immersionTimer -= dt;
      if (this.immersionTimer <= 0) this._nextCard();
    }

    if (this.phase === STATES.FEEDBACK) {
      this.feedbackTimer -= dt;
      if (this.feedbackTimer <= 0) {
        if (this.sessionTotal % 5 === 0) {
          this.phase = STATES.IMMERSION;
          this.immersionTimer = 5.0;
          this._refreshAmbientLabels();
        } else {
          this._nextCard();
        }
      }
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────
  render(ctx) {
    if (!this.initialized) return;
    const W  = window.innerWidth;
    const H  = window.innerHeight;
    const cx = W / 2;

    // Dark base
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, W, H);

    // Dreamscape tint overlay
    const ds = this.gameState?.dreamscape;
    if (ds) {
      const tintMap = {
        'VOID STATE': 'rgba(0,8,20,0.3)',
        'FOREST CATHEDRAL': 'rgba(0,20,10,0.3)',
        'MOUNTAIN DRAGON REALM': 'rgba(10,0,20,0.3)',
      };
      const tint = tintMap[ds] || 'rgba(0,8,20,0.2)';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, W, H);
    }

    // Ambient labels (shown on all phases except lang_select)
    if (this.phase !== STATES.LANG_SELECT && this.ambientLabels.length > 0) {
      this._renderAmbient(ctx, W, H, FONT);
    }

    switch (this.phase) {
      case STATES.LANG_SELECT:  this._renderLangSelect(ctx, W, H, FONT, cx); break;
      case STATES.IMMERSION:    this._renderImmersion(ctx, W, H, FONT, cx);  break;
      case STATES.QUIZ:
      case STATES.PRODUCTION:   this._renderQuiz(ctx, W, H, FONT, cx);       break;
      case STATES.FEEDBACK:     this._renderFeedback(ctx, W, H, FONT, cx);   break;
      case STATES.STATS:        this._renderStats(ctx, W, H, FONT, cx);      break;
    }
  }

  // ─── Ambient layer ──────────────────────────────────────────────────
  _renderAmbient(ctx, W, H) {
    ctx.textAlign = 'center';
    for (const lbl of this.ambientLabels) {
      if (lbl.alpha <= 0) continue;
      const x = lbl.x * W + Math.sin(lbl.wobble) * 20;
      const y = lbl.y * H + Math.cos(lbl.wobble * 0.7) * 10;
      ctx.globalAlpha = lbl.alpha * 0.4;
      ctx.fillStyle = '#00ccff';
      ctx.font = `18px ${FONT}`;
      ctx.fillText(lbl.card.word, x, y);
      ctx.globalAlpha = lbl.alpha * 0.4;
      ctx.fillStyle = '#336688';
      ctx.font = `13px ${FONT}`;
      ctx.fillText(lbl.card.meaning, x, y + 18);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ─── Language select ────────────────────────────────────────────────
  _renderLangSelect(ctx, W, H, FONT, cx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ccff';
    ctx.font = `32px ${FONT}`;
    ctx.fillText('LANGUAGE LEARNING', cx, H * 0.14);

    ctx.fillStyle = '#335566';
    ctx.font = `15px ${FONT}`;
    ctx.fillText('FSRS-5 spaced repetition  ·  immersive dreamscape vocabulary', cx, H * 0.21);

    LANG_KEYS.forEach((key, i) => {
      const meta = LANG_META[key] || {};
      const boxY = H * 0.33 + i * 90;
      const boxW = Math.min(460, W * 0.6);
      const boxX = cx - boxW / 2;
      const sel  = i === this.menuIndex;

      ctx.fillStyle = sel ? 'rgba(0,204,255,0.12)' : 'rgba(0,8,20,0.7)';
      ctx.fillRect(boxX, boxY, boxW, 72);
      ctx.strokeStyle = sel ? '#00ccff' : '#0a1a2a';
      ctx.lineWidth   = sel ? 2 : 1;
      ctx.strokeRect(boxX, boxY, boxW, 72);

      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#00eeff' : '#557788';
      ctx.font = `bold 18px ${FONT}`;
      ctx.fillText(`${meta.flag || ''}  ${meta.label || key.toUpperCase()}`, boxX + 18, boxY + 26);
      ctx.fillStyle = '#223344';
      ctx.font = `13px ${FONT}`;
      ctx.fillText(`${meta.native || ''}  ·  ${meta.hint || ''}`, boxX + 18, boxY + 50);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#112233';
    ctx.font = `13px ${FONT}`;
    ctx.fillText('↑ ↓ to select  ·  ENTER to begin', cx, H * 0.9);
    ctx.textAlign = 'left';
  }

  // ─── Immersion (Layer 1) ────────────────────────────────────────────
  _renderImmersion(ctx, W, H, FONT, cx) {
    // Semi-transparent panel at bottom
    ctx.fillStyle = 'rgba(0,8,20,0.75)';
    ctx.fillRect(0, H * 0.7, W, 100);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ccff';
    ctx.font = `14px ${FONT}`;
    ctx.fillText('IMMERSION — LAYER 1', cx, H * 0.74);

    ctx.fillStyle = '#224455';
    ctx.font = `13px ${FONT}`;
    ctx.fillText('Words are floating around you — absorb them passively', cx, H * 0.79);

    // Progress bar (fills as timer counts down)
    const pct  = Math.max(0, Math.min(1, this.immersionTimer / 8.0));
    const barW = W * 0.5;
    const barX = cx - barW / 2;
    ctx.fillStyle = 'rgba(0,20,40,0.8)';
    ctx.fillRect(barX, H * 0.84, barW, 6);
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(barX, H * 0.84, barW * pct, 6);

    ctx.fillStyle = '#112233';
    ctx.font = `12px ${FONT}`;
    ctx.fillText('ENTER to begin practice early', cx, H * 0.9);
    ctx.textAlign = 'left';
  }

  // ─── Quiz / Production ──────────────────────────────────────────────
  _renderQuiz(ctx, W, H, FONT, cx) {
    if (!this.currentCard) return;
    const isProduction = (this.phase === STATES.PRODUCTION);

    ctx.textAlign = 'center';
    ctx.fillStyle = isProduction ? '#ffaa00' : '#00ccff';
    ctx.font = `13px ${FONT}`;
    ctx.fillText(
      isProduction ? 'PRODUCTION  —  LAYER 3' : 'RECOGNITION  —  LAYER 2',
      cx, H * 0.1
    );

    // Word or meaning as prompt
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 46px ${FONT}`;
    ctx.fillText(
      isProduction ? this.currentCard.meaning : this.currentCard.word,
      cx, H * 0.28
    );

    // Context sentence
    if (this.currentCard.context) {
      ctx.fillStyle = '#334455';
      ctx.font = `14px ${FONT}`;
      ctx.fillText(this.currentCard.context, cx, H * 0.37);
    }

    // R/S/D stats
    ctx.fillStyle = '#1a2a3a';
    ctx.font = `11px ${FONT}`;
    ctx.fillText(
      `R:${Math.round(this.currentCard.R * 100)}%  S:${this.currentCard.S.toFixed(1)}d  D:${this.currentCard.D.toFixed(1)}`,
      cx, H * 0.43
    );

    // Options
    const optW = W * 0.82 - W * 0.18;
    const optX = W * 0.18;
    this.options.forEach((opt, i) => {
      const oy = H * 0.52 + i * 64;
      ctx.fillStyle = 'rgba(0,8,20,0.85)';
      ctx.fillRect(optX, oy, optW, 48);
      ctx.strokeStyle = '#0a2030';
      ctx.lineWidth = 1;
      ctx.strokeRect(optX, oy, optW, 48);
      ctx.fillStyle = '#5599bb';
      ctx.font = `17px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`[${i + 1}]  ${opt}`, optX + 16, oy + 30);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#112233';
    ctx.font = `12px ${FONT}`;
    ctx.fillText('Press 1 / 2 / 3 / 4 to answer', cx, H * 0.93);
    ctx.textAlign = 'left';
  }

  // ─── Feedback ───────────────────────────────────────────────────────
  _renderFeedback(ctx, W, H, FONT, cx) {
    if (!this.feedback) return;
    const fb = this.feedback;

    // Tint canvas
    ctx.fillStyle = fb.correct ? 'rgba(0,60,20,0.25)' : 'rgba(60,0,20,0.25)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.fillStyle = fb.correct ? '#00ff88' : '#ff5555';
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillText(fb.correct ? '✓ CORRECT' : '✗ NOT QUITE', cx, H * 0.28);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 36px ${FONT}`;
    ctx.fillText(fb.word, cx, H * 0.40);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = `22px ${FONT}`;
    ctx.fillText(`= ${fb.correctAnswer}`, cx, H * 0.50);

    if (fb.context) {
      ctx.fillStyle = '#556677';
      ctx.font = `14px ${FONT}`;
      ctx.fillText(fb.context, cx, H * 0.60);
    }

    ctx.fillStyle = '#334455';
    ctx.font = `14px ${FONT}`;
    ctx.fillText(
      `Next review in ${fb.interval} day${fb.interval !== 1 ? 's' : ''}  ·  D:${fb.D}  S:${fb.S}d  R:${fb.R}`,
      cx, H * 0.70
    );

    // Auto-advance timer bar
    const pct   = Math.max(0, this.feedbackTimer / 3.5);
    const barW  = W * 0.4;
    const barX  = cx - barW / 2;
    ctx.fillStyle = 'rgba(0,20,40,0.6)';
    ctx.fillRect(barX, H * 0.80, barW, 5);
    ctx.fillStyle = fb.correct ? '#00ff88' : '#ff5555';
    ctx.fillRect(barX, H * 0.80, barW * pct, 5);

    ctx.fillStyle = '#223344';
    ctx.font = `13px ${FONT}`;
    ctx.fillText('ENTER to continue', cx, H * 0.88);
    ctx.textAlign = 'left';
  }

  // ─── Stats ───────────────────────────────────────────────────────────
  _renderStats(ctx, W, H, FONT, cx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc';
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillText('SESSION COMPLETE', cx, H * 0.25);

    const pct = this.sessionTotal > 0
      ? Math.round(this.sessionCorrect / this.sessionTotal * 100)
      : 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `22px ${FONT}`;
    ctx.fillText(`${this.sessionCorrect} / ${this.sessionTotal} correct (${pct}%)`, cx, H * 0.38);

    if (this.deck) {
      const st = this.deck.stats;
      const lines = [
        `Retention:  ${st.retention}%`,
        `Avg stability:  ${st.avgStability}d`,
        `Cards due:  ${st.due}`,
      ];
      ctx.fillStyle = '#446688';
      ctx.font = `15px ${FONT}`;
      lines.forEach((line, i) => ctx.fillText(line, cx, H * 0.50 + i * 26));
    }

    ctx.fillStyle = '#1a2a3a';
    ctx.font = `14px ${FONT}`;
    ctx.fillText('ESC to return to title', cx, H * 0.82);
    ctx.textAlign = 'left';
  }

  // ─── Cleanup ────────────────────────────────────────────────────────
  destroy() {
    this.initialized = false;
  }

  // Legacy compat for GameMode-based callers
  cleanup() { this.destroy(); }
}
