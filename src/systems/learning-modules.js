// ═══════════════════════════════════════════════════════════════════════
//  LEARNING MODULES - Phase 3
//  Pattern-based learning integrated into gameplay.
//  Tiles present quick challenges; correct responses award extra points.
// ═══════════════════════════════════════════════════════════════════════

import { getLangChallenge, getLangProgress, recordLangAnswer, CEFR_LEVELS } from './languages.js';
import { getSigilChallenge } from './sigils.js';

// ─── VOCABULARY CHALLENGES ──────────────────────────────────────────────
//  Pairs: { prompt, answer, hint } — player presses 1/2/3/4 to choose

const VOCAB_CHALLENGES = [
  { prompt: 'Synonym of CALM', options: ['Agitated', 'Serene', 'Turbulent', 'Anxious'], correct: 1 },
  { prompt: 'Opposite of FEAR', options: ['Terror', 'Panic', 'Courage', 'Worry'], correct: 2 },
  { prompt: 'PATTERN means...', options: ['Chaos', 'Arrangement', 'Noise', 'Random'], correct: 1 },
  { prompt: 'INSIGHT refers to...', options: ['Darkness', 'Clarity', 'Confusion', 'Weight'], correct: 1 },
  { prompt: 'RESILIENCE is...', options: ['Fragility', 'Recovery', 'Collapse', 'Avoidance'], correct: 1 },
  { prompt: 'Synonym of PEACE', options: ['Discord', 'Harmony', 'Conflict', 'Chaos'], correct: 1 },
  { prompt: 'COHERENCE means...', options: ['Disorder', 'Connection', 'Separation', 'Static'], correct: 1 },
  { prompt: 'Opposite of DESPAIR', options: ['Sadness', 'Hopelessness', 'Hope', 'Fear'], correct: 2 },
];

// ─── MATH PATTERN CHALLENGES ─────────────────────────────────────────────

const MATH_CHALLENGES = [
  { prompt: 'Next: 1, 1, 2, 3, 5, ?', options: ['7', '8', '9', '6'], correct: 1 },
  { prompt: 'Next: 2, 4, 8, 16, ?', options: ['24', '30', '32', '28'], correct: 2 },
  { prompt: 'Next: 1, 4, 9, 16, ?', options: ['20', '24', '25', '22'], correct: 2 },
  { prompt: 'Next: 3, 6, 12, 24, ?', options: ['36', '42', '48', '30'], correct: 2 },
  { prompt: 'Next: 5, 10, 15, 20, ?', options: ['22', '24', '25', '30'], correct: 2 },
  { prompt: 'Sum of 1+2+3+...+10 = ?', options: ['45', '50', '55', '60'], correct: 2 },
  { prompt: 'Next: 0, 1, 1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '10'], correct: 2 },
  { prompt: 'Next: 2, 3, 5, 7, 11, ?', options: ['12', '13', '14', '15'], correct: 1 },
];

// ─── MEMORY SEQUENCE CHALLENGES ──────────────────────────────────────────

const MEMORY_SEQUENCES = [
  { sequence: ['◈', '◆', '⊕', '◈'], prompt: 'Complete: ◈ ◆ ⊕ ?', options: ['◆', '◈', '⊕', '☆'], correct: 1 },
  { sequence: ['↑', '→', '↓', '←'], prompt: 'Complete: ↑ → ↓ ?', options: ['→', '↑', '←', '↓'], correct: 2 },
  { sequence: [1, 2, 4, 8, 16], prompt: 'Complete: 1 2 4 8 ?', options: ['12', '16', '14', '18'], correct: 1 },
  { sequence: ['R', 'G', 'B'], prompt: 'Complete: R G ?', options: ['R', 'Y', 'B', 'G'], correct: 2 },
];

// ─── API ─────────────────────────────────────────────────────────────────

/**
 * Get a random challenge appropriate for a given tile/context.
 * type: 'vocab' | 'math' | 'memory' | 'auto'
 * settings: { targetLanguage, langImmersion, langLevel }
 */
export function getChallenge(type = 'auto', targetLangId = null, settings = {}) {
  if (type === 'auto') {
    const r = Math.random();
    // If a target language is set, 35% chance of language challenge
    if (targetLangId && r < 0.35) type = 'language';
    else if (r < 0.50) type = 'vocab';
    else if (r < 0.70) type = 'math';
    else if (r < 0.85) type = 'memory';
    else type = 'sigil'; // 15% sigil pattern reading
  }

  if (type === 'language') {
    // Determine CEFR level: use saved progress unless settings override
    const cefrLevel = settings.langLevel
      || (targetLangId ? getLangProgress(targetLangId).level : 'A1');
    const immersion = settings.langImmersion || false;
    const ch = getLangChallenge(targetLangId || 'en', cefrLevel, immersion);
    if (ch) return ch;
    type = 'vocab'; // fallback if lang challenge fails
  }

  if (type === 'sigil') {
    const ch = getSigilChallenge();
    if (ch) return ch;
    type = 'vocab'; // fallback
  }

  let pool;
  if (type === 'vocab') pool = VOCAB_CHALLENGES;
  else if (type === 'math') pool = MATH_CHALLENGES;
  else pool = MEMORY_SEQUENCES;

  const ch = pool[Math.floor(Math.random() * pool.length)];
  return { ...ch, type };
}

/**
 * Create a learning challenge state on gameState.
 * The challenge pauses input until answered (or times out).
 */
export function triggerLearningChallenge(gameState, type = 'auto') {
  if (gameState._learningChallenge) return; // already active
  const targetLang = gameState.settings?.targetLanguage || null;
  const settings = {
    langImmersion: gameState.settings?.langImmersion || false,
    langLevel: gameState.settings?.langLevel || null, // null = use saved CEFR progress
  };
  const challenge = getChallenge(type, targetLang, settings);
  gameState._learningChallenge = {
    ...challenge,
    selected: 0,
    answeredMs: null,
    result: null,        // 'correct' | 'incorrect' | null
    triggeredMs: Date.now(),
    timeoutMs: 12000,    // 12 seconds to answer
  };
}

/**
 * Handle key input for an active learning challenge.
 * Returns true if input was consumed.
 */
export function handleChallengeInput(gameState, key) {
  const ch = gameState._learningChallenge;
  if (!ch || ch.result) return false;

  const numMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
  if (key in numMap) {
    const chosen = numMap[key];
    const isCorrect = chosen === ch.correct;
    ch.result = isCorrect ? 'correct' : 'incorrect';
    ch.answeredMs = Date.now();

    if (isCorrect) {
      const bonus = 250 * (gameState.scoreMul || 1.0);
      gameState.score = (gameState.score || 0) + Math.round(bonus);
      gameState.combo = (gameState.combo || 0) + 1;
      gameState.comboTimer = Date.now();
      gameState._challengeCorrect = true; // trigger lucidity gain in GridGameMode
      if (gameState.emotionalField?.add) gameState.emotionalField.add('curiosity', 1.0);
    } else {
      if (gameState.emotionalField?.add) gameState.emotionalField.add('grief', 0.4);
    }

    // Record answer for CEFR level progression (language + grammar challenges)
    if ((ch.type === 'language' || ch.type === 'grammar') && ch.lang) {
      const updated = recordLangAnswer(ch.lang, isCorrect);
      // If level advanced/retreated, expose the new level for overlay display
      if (updated.level !== ch.cefrLevel) {
        gameState._langLevelChanged = { lang: ch.lang, from: ch.cefrLevel, to: updated.level, at: Date.now() };
      }
    }

    // Challenge expires 2s after answer (show result briefly)
    ch.timeoutMs = ch.answeredMs - ch.triggeredMs + 2000;
    return true;
  }

  // Arrow keys to navigate options
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    ch.selected = (ch.selected - 1 + ch.options.length) % ch.options.length;
    return true;
  }
  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    ch.selected = (ch.selected + 1) % ch.options.length;
    return true;
  }
  if (key === 'Enter' || key === ' ') {
    return handleChallengeInput(gameState, String(ch.selected + 1));
  }

  return true; // consume all keys while challenge active
}

/**
 * Update learning challenge state (timeout check).
 * Call once per update frame.
 */
export function updateLearningChallenge(gameState, deltaMs) {
  const ch = gameState._learningChallenge;
  if (!ch) return;

  const elapsed = Date.now() - ch.triggeredMs;
  if (elapsed > ch.timeoutMs) {
    // Timeout: mark as incorrect, remove after brief delay
    if (!ch.result) {
      ch.result = 'timeout';
      ch.answeredMs = Date.now();
    }
    if (ch.answeredMs && Date.now() - ch.answeredMs > 1500) {
      delete gameState._learningChallenge;
    }
  }
}

/**
 * Render the learning challenge overlay.
 */
export function renderLearningChallenge(gameState, ctx) {
  const ch = gameState._learningChallenge;
  if (!ch) return;

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const elapsed = Date.now() - ch.triggeredMs;
  const timeFrac = ch.result ? 1 : Math.min(1, elapsed / ch.timeoutMs);

  // Background panel
  ctx.save();
  ctx.globalAlpha = 0.93;
  ctx.fillStyle = 'rgba(4,4,18,0.96)';
  ctx.fillRect(w * 0.06, h * 0.2, w * 0.88, h * 0.60);
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.06, h * 0.2, w * 0.88, h * 0.60);
  ctx.globalAlpha = 1.0;

  // Title row
  const cefrTag = ch.cefrLevel ? ` [${ch.cefrLevel}]` : '';
  const typeLabel = ch.type === 'vocab' ? 'VOCABULARY'
    : ch.type === 'math' ? 'PATTERN'
    : ch.type === 'grammar' ? `GRAMMAR · ${(ch.langName || ch.lang || '').toUpperCase()}${cefrTag}`
    : ch.type === 'language' ? `LANGUAGE · ${(ch.langName || '').toUpperCase()}${cefrTag}`
    : ch.type === 'sigil' ? 'SIGIL · PATTERN GRAMMAR'
    : 'MEMORY';
  ctx.fillStyle = '#667799';
  ctx.font = '8px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText(`LEARNING MODULE · ${typeLabel}`, w * 0.10, h * 0.25);

  // Timer bar
  const tbarW = w * 0.80;
  const tbarX = w * 0.10;
  const tbarY = h * 0.27;
  ctx.fillStyle = '#112233';
  ctx.fillRect(tbarX, tbarY, tbarW, 4);
  const timerColor = timeFrac > 0.7 ? '#ff4444' : timeFrac > 0.4 ? '#ffaa00' : '#00cc88';
  ctx.fillStyle = timerColor;
  ctx.fillRect(tbarX, tbarY, tbarW * (1 - timeFrac), 4);

  // Challenge prompt
  ctx.fillStyle = '#aaccee';
  ctx.font = `bold ${Math.floor(w / 22)}px Courier New`;
  ctx.textAlign = 'center';
  ctx.fillText(ch.prompt, w / 2, h * 0.38);

  // Options
  for (let i = 0; i < ch.options.length; i++) {
    const optY = h * 0.47 + i * (h * 0.085);
    const isSelected = i === ch.selected && !ch.result;
    const isCorrect = ch.result && i === ch.correct;
    const isWrong = ch.result && i === ch.selected && !isCorrect;

    const boxColor = isCorrect ? '#004422' : isWrong ? '#440000' : isSelected ? '#001133' : '#060614';
    const borderColor = isCorrect ? '#00cc66' : isWrong ? '#cc2222' : isSelected ? '#00aaff' : '#223344';
    const textColor = isCorrect ? '#00ff88' : isWrong ? '#ff4444' : isSelected ? '#00e5ff' : '#8899aa';

    ctx.fillStyle = boxColor;
    ctx.fillRect(w * 0.12, optY - 12, w * 0.76, 28);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.12, optY - 12, w * 0.76, 28);

    ctx.fillStyle = textColor;
    ctx.font = `${isSelected ? 'bold ' : ''}${Math.floor(w / 28)}px Courier New`;
    ctx.textAlign = 'left';
    ctx.fillText(`  ${i + 1}.  ${ch.options[i]}`, w * 0.14, optY + 4);

    if (isCorrect) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('✓', w * 0.86, optY + 4);
    }
  }

  // Result message
  if (ch.result) {
    const resText = ch.result === 'correct' ? '+250 pts · CORRECT' : ch.result === 'timeout' ? 'TIMED OUT' : 'INCORRECT';
    const resColor = ch.result === 'correct' ? '#00ff88' : '#ff8844';
    ctx.fillStyle = resColor;
    ctx.font = `bold ${Math.floor(w / 20)}px Courier New`;
    ctx.textAlign = 'center';
    ctx.shadowColor = resColor;
    ctx.shadowBlur = 16;
    ctx.fillText(resText, w / 2, h * 0.765);
    ctx.shadowBlur = 0;

    // Show grammar hint / sigil primitives after answer
    const hintText = ch.hint || (ch.type === 'sigil' && ch.primitives ? `Primitives: ${ch.primitives.join(' + ')}` : null);
    if (hintText) {
      // Word-wrap hint to canvas width
      ctx.fillStyle = '#8899aa';
      ctx.font = `${Math.floor(w / 42)}px Courier New`;
      let ht = hintText;
      while (ht.length > 0 && ctx.measureText(ht).width > w * 0.80) {
        const sp = ht.lastIndexOf(' ');
        ht = sp > 0 ? ht.substring(0, sp) + '…' : ht.substring(0, ht.length - 2) + '…';
      }
      ctx.fillText(ht, w / 2, h * 0.800);
    }
  } else {
    ctx.fillStyle = '#334';
    ctx.font = '9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Press 1/2/3/4 or ↑/↓ + ENTER to answer', w / 2, h * 0.775);
  }

  ctx.restore();

  // ── CEFR level-up / level-down notification ─────────────────────────
  if (gameState._langLevelChanged) {
    const { from, to, at } = gameState._langLevelChanged;
    const age = Date.now() - at;
    const dur = 3500;
    if (age < dur) {
      const fade = Math.min(1, age / 200) * (age > dur - 500 ? (dur - age) / 500 : 1);
      const isUp = CEFR_LEVELS.indexOf(to) > CEFR_LEVELS.indexOf(from);
      const col = isUp ? '#00ff88' : '#ff8844';
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = col;
      ctx.font = `bold ${Math.floor(w / 22)}px Courier New`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.fillText(isUp ? `⬆ LEVEL UP: ${to}` : `⬇ LEVEL: ${to}`, w / 2, h * 0.14);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      delete gameState._langLevelChanged;
    }
  }
}
