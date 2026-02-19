// ═══════════════════════════════════════════════════════════════════════
//  DREAM YOGA - Phase 2.5
//  Reality checks, dream sign recognition, lucidity meter, body scan
// ═══════════════════════════════════════════════════════════════════════

import { T } from '../core/constants.js';

// ─── DREAM SIGN RECOGNITION ──────────────────────────────────────────────
//  Tracks which tile types and emotional states appear most frequently
//  across sessions, building a personal "dream dictionary".

/**
 * Record a tile encounter for dream sign tracking.
 * Persists to localStorage between sessions.
 */
export function recordDreamSign(tileType, emotionName) {
  try {
    const raw = localStorage.getItem('gp.dreamSigns') || '{}';
    const signs = JSON.parse(raw);
    const key = `tile_${tileType}`;
    signs[key] = (signs[key] || 0) + 1;
    if (emotionName) {
      const emoKey = `emo_${emotionName}`;
      signs[emoKey] = (signs[emoKey] || 0) + 1;
    }
    localStorage.setItem('gp.dreamSigns', JSON.stringify(signs));
  } catch (e) { /* localStorage unavailable */ }
}

/**
 * Get the top N most frequently encountered dream signs.
 * Returns array of { key, count } objects.
 */
export function getTopDreamSigns(n = 5) {
  try {
    const raw = localStorage.getItem('gp.dreamSigns') || '{}';
    const signs = JSON.parse(raw);
    return Object.entries(signs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, n)
      .map(([key, count]) => ({ key, count }));
  } catch (e) { return []; }
}

/**
 * Reset dream signs (for new dream journal chapter).
 */
export function clearDreamSigns() {
  try { localStorage.removeItem('gp.dreamSigns'); } catch (e) {}
}

// ─── LUCIDITY METER ──────────────────────────────────────────────────────
//  A session-persistent lucidity level that rises from:
//  - Answering reality check prompts
//  - Collecting INSIGHT tiles
//  - Completing learning challenges
//  And decays slowly while taking damage.

const LUCIDITY_MAX = 100;
const LUCIDITY_DECAY_PER_HIT = 8;
const LUCIDITY_GAIN_REALITY_CHECK = 12;
const LUCIDITY_GAIN_INSIGHT = 6;
const LUCIDITY_GAIN_CHALLENGE = 15;

/**
 * Get current lucidity level (0–100) from gameState.
 */
export function getLucidity(gameState) {
  return Math.round(Math.min(LUCIDITY_MAX, Math.max(0, gameState._lucidity || 0)));
}

/**
 * Increase lucidity from an event.
 * source: 'reality_check' | 'insight' | 'challenge' | number (raw amount)
 */
export function gainLucidity(gameState, source) {
  const amt = typeof source === 'number' ? source
    : source === 'reality_check' ? LUCIDITY_GAIN_REALITY_CHECK
    : source === 'insight' ? LUCIDITY_GAIN_INSIGHT
    : source === 'challenge' ? LUCIDITY_GAIN_CHALLENGE
    : 5;

  gameState._lucidity = Math.min(LUCIDITY_MAX, (gameState._lucidity || 0) + amt);

  // Record in session for dream journal
  if (!gameState._lucidityHistory) gameState._lucidityHistory = [];
  gameState._lucidityHistory.push({ t: Date.now(), amt, total: gameState._lucidity });

  // Threshold effects
  const prev = (gameState._lucidity || 0) - amt;
  if (prev < 50 && gameState._lucidity >= 50) {
    gameState._lucidEvent = { text: 'HALF-LUCID', color: '#aaccff', shownAtMs: Date.now(), durationMs: 2000 };
    if (gameState.emotionalField?.add) gameState.emotionalField.add('awe', 0.8);
  }
  if (prev < 100 && gameState._lucidity >= 100) {
    gameState._lucidEvent = { text: 'FULLY LUCID', color: '#00ffcc', shownAtMs: Date.now(), durationMs: 3000 };
    // Fully lucid bonus: +500 pts
    gameState.score = (gameState.score || 0) + 500;
    if (gameState.emotionalField?.add) {
      gameState.emotionalField.add('awe', 2.0);
      gameState.emotionalField.add('joy', 1.5);
    }
  }
}

/**
 * Decrease lucidity on damage or hazard hit.
 */
export function loseLucidity(gameState, amount = LUCIDITY_DECAY_PER_HIT) {
  gameState._lucidity = Math.max(0, (gameState._lucidity || 0) - amount);
}

// ─── BODY SCAN SYSTEM ────────────────────────────────────────────────────
//  Body awareness tiles (T.COVER acts as a grounding anchor).
//  Stepping on COVER triggers a brief body scan reminder.

const BODY_PARTS = ['feet', 'legs', 'belly', 'chest', 'hands', 'shoulders', 'face'];

/**
 * Trigger a body scan reminder.
 * Returns the prompt object or null if one is already active.
 */
export function triggerBodyScan(gameState) {
  if (gameState._bodyScanPrompt) return null; // already active
  const part = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)];
  const prompts = {
    feet: 'Feel your feet · Press into the ground',
    legs: 'Soften your legs · Sense their weight',
    belly: 'Breathe into your belly · Let it expand',
    chest: 'Notice your heartbeat · Breathe slowly',
    hands: 'Relax your hands · Open your palms',
    shoulders: 'Drop your shoulders · Release tension',
    face: 'Soften your jaw · Relax your eyes',
  };
  gameState._bodyScanPrompt = {
    part,
    text: prompts[part],
    shownAtMs: Date.now(),
    durationMs: 5000,
    color: '#88ccaa',
  };
  gainLucidity(gameState, 4);
  return gameState._bodyScanPrompt;
}

// ─── SLEEP PREPARATION ───────────────────────────────────────────────────
//  Triggered when player voluntarily pauses for 60+ seconds.
//  Collects a dream intention and shows wind-down guidance.

let _sessionPauseStart = null;

export function onGamePaused() {
  _sessionPauseStart = Date.now();
}

export function onGameResumed(gameState) {
  if (!_sessionPauseStart) return null;
  const pauseDurationMs = Date.now() - _sessionPauseStart;
  _sessionPauseStart = null;

  // Pause rewards (from ROADMAP)
  if (pauseDurationMs >= 60000 && gameState.player) { // 60s pause
    gameState.insightTokens = (gameState.insightTokens || 0) + 2;
    gainLucidity(gameState, 10);
    return { type: 'long_pause', bonus: '+2 insights, +10 lucidity' };
  }
  if (pauseDurationMs >= 600000 && gameState.player) { // 10 min pause → +10 HP
    gameState.player.hp = Math.min(
      gameState.player.maxHp || 100,
      (gameState.player.hp || 0) + 10,
    );
    return { type: 'break', bonus: '+10 HP' };
  }
  return null;
}

// ─── RENDER ──────────────────────────────────────────────────────────────

/**
 * Render all dream yoga overlays.
 */
export function renderDreamYogaOverlays(gameState, ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Lucidity meter (top-right corner, compact bar)
  const lucidity = getLucidity(gameState);
  if (lucidity > 0) {
    const barW = 80;
    const barH = 6;
    const bx = w - barW - 8;
    const by = 8;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#001122';
    ctx.fillRect(bx, by, barW, barH);
    const frac = lucidity / LUCIDITY_MAX;
    ctx.fillStyle = frac >= 1.0 ? '#00ffcc' : frac >= 0.5 ? '#aaccff' : '#446688';
    ctx.fillRect(bx, by, Math.round(barW * frac), barH);
    ctx.fillStyle = '#667788';
    ctx.font = '7px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`LUCID ${lucidity}%`, bx + barW, by + barH + 10);
    ctx.restore();
  }

  // Lucidity event flash (half-lucid / fully lucid)
  if (gameState._lucidEvent) {
    const { text, color, shownAtMs, durationMs } = gameState._lucidEvent;
    const age = Date.now() - shownAtMs;
    if (age < durationMs) {
      const alpha = Math.min(1, age / 300) * (age > durationMs - 500 ? (durationMs - age) / 500 : 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillText(text, w / 2, h * 0.14);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      delete gameState._lucidEvent;
    }
  }

  // Body scan reminder
  if (gameState._bodyScanPrompt) {
    const { text, shownAtMs, durationMs, color } = gameState._bodyScanPrompt;
    const age = Date.now() - shownAtMs;
    if (age < durationMs) {
      const alpha = Math.min(1, age / 400) * (age > durationMs - 700 ? (durationMs - age) / 700 : 1);
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = 'rgba(0,12,8,0.80)';
      ctx.fillRect(0, h * 0.78, w, h * 0.18);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `${Math.floor(w / 26)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h * 0.87);
      ctx.restore();
    } else {
      delete gameState._bodyScanPrompt;
    }
  }
}
