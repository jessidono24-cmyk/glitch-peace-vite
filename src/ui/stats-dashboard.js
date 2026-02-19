// ═══════════════════════════════════════════════════════════════════════
//  STATS DASHBOARD — Phase 8 Polish
//  In-game overlay (press D) showing live session metrics:
//  session time · emotional field · lucidity meter · language progress
// ═══════════════════════════════════════════════════════════════════════

// Module-level fallback timestamp (used only if gameState._sessionStartMs was never set,
// e.g. on direct page load without going through startGame()). The canonical session
// start is written to gameState._sessionStartMs in startGame() on level 1.
const _SESSION_START_MS = Date.now();

// Emotion → display color mapping (consistent with emotional-engine palette)
const EMOTION_COLORS = {
  joy:        '#ffdd44', hope:       '#00ff88', curiosity:  '#00aaff',
  tender:     '#ffaacc', awe:        '#aaddff', gratitude:  '#88ffaa',
  grief:      '#4466aa', fear:       '#cc3344', anger:      '#ff4422',
  despair:    '#2244aa', loneliness: '#6644aa', confusion:  '#aa44ff',
  pain:       '#aa2244', anxiety:    '#ff8833', sadness:    '#5566bb',
};

/** Render a full-screen stats overlay on top of the current game frame. */
export function renderStatsDashboard(gameState, ctx, w, h) {
  const now     = Date.now();
  const elapsed = Math.floor((now - (gameState._sessionStartMs || _SESSION_START_MS)) / 1000);
  const mins    = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs    = (elapsed % 60).toString().padStart(2, '0');

  const BOX_W = Math.min(500, Math.floor(w * 0.88));
  const BOX_H = Math.min(400, Math.floor(h * 0.82));
  const bx    = Math.floor((w - BOX_W) / 2);
  const by    = Math.floor((h - BOX_H) / 2);

  ctx.save();

  // Dim the game behind the overlay
  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.fillRect(0, 0, w, h);

  // Panel background + border
  ctx.fillStyle = 'rgba(4,8,22,0.97)';
  ctx.fillRect(bx, by, BOX_W, BOX_H);
  ctx.strokeStyle = '#1e3355';
  ctx.lineWidth   = 1;
  ctx.strokeRect(bx, by, BOX_W, BOX_H);
  // Inner glow border
  ctx.strokeStyle = 'rgba(0,255,136,0.12)';
  ctx.strokeRect(bx + 2, by + 2, BOX_W - 4, BOX_H - 4);

  // ── Header ─────────────────────────────────────────────────────────
  ctx.fillStyle   = '#00ff88';
  ctx.font        = 'bold 13px Courier New';
  ctx.textAlign   = 'center';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur  = 8;
  ctx.fillText('◈  SESSION DASHBOARD', w / 2, by + 22);
  ctx.shadowBlur  = 0;

  ctx.fillStyle = '#334466';
  ctx.font      = '9px Courier New';
  ctx.fillText('[D] or [ESC] to close', w / 2, by + 36);

  // Separator
  _hline(ctx, bx + 12, bx + BOX_W - 12, by + 44);

  ctx.textAlign = 'left';

  // ── Row 1: core stats ───────────────────────────────────────────────
  const r1y = by + 64;
  _label(ctx, 'Session',  bx + 16,  r1y - 12);
  _value(ctx, `${mins}:${secs}`,   bx + 16,  r1y, '#ccddf0');

  _label(ctx, 'Level',    bx + 110, r1y - 12);
  _value(ctx, `${gameState.level || 1}`, bx + 110, r1y, '#ccddf0');

  _label(ctx, 'Score',    bx + 175, r1y - 12);
  _value(ctx, (gameState.score || 0).toLocaleString(), bx + 175, r1y, '#ffdd88');

  _label(ctx, 'Tokens',   bx + 290, r1y - 12);
  _value(ctx, `${gameState.insightTokens || 0} ◆`, bx + 290, r1y, '#88ffdd');

  _label(ctx, 'Combo',    bx + 370, r1y - 12);
  const combo = gameState._combo || gameState.combo || 0;
  _value(ctx, combo ? `×${combo}` : '—', bx + 370, r1y, combo >= 10 ? '#ffaa00' : '#ccddf0');

  // ── Separator ───────────────────────────────────────────────────────
  _hline(ctx, bx + 12, bx + BOX_W - 12, r1y + 16);

  // ── Emotional field ─────────────────────────────────────────────────
  const emoY = r1y + 32;
  _sectionLabel(ctx, 'EMOTIONAL FIELD', bx + 16, emoY);

  const emotions = gameState.emotionalField?.emotions || {};
  const sorted   = Object.entries(emotions)
    .filter(([, v]) => v > 0.01)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const BAR_X = bx + 120;
  const BAR_W = BOX_W - 140;

  if (sorted.length) {
    sorted.forEach(([emotion, value], i) => {
      const ey   = emoY + 14 + i * 22;
      const fill = Math.floor(BAR_W * Math.min(1, value));
      ctx.fillStyle = '#0e1a2a';
      ctx.fillRect(BAR_X, ey - 10, BAR_W, 12);
      ctx.fillStyle = EMOTION_COLORS[emotion] || '#667799';
      ctx.fillRect(BAR_X, ey - 10, fill, 12);
      ctx.fillStyle = '#88aacc';
      ctx.font      = '9px Courier New';
      ctx.fillText(emotion.slice(0, 11), bx + 16, ey);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#556677';
      ctx.fillText(`${Math.round(value * 100)}%`, bx + BOX_W - 14, ey);
      ctx.textAlign = 'left';
    });
  } else {
    ctx.fillStyle = '#2a3a4a';
    ctx.font      = '10px Courier New';
    ctx.fillText('— emotional field is neutral —', bx + 16, emoY + 18);
  }

  // ── Lucidity meter ──────────────────────────────────────────────────
  const lucY     = emoY + 14 + Math.max(1, sorted.length) * 22 + 12;
  _hline(ctx, bx + 12, bx + BOX_W - 12, lucY - 8);

  _sectionLabel(ctx, 'LUCIDITY METER', bx + 16, lucY + 4);

  const lucidity = Math.min(100, Math.max(0, gameState._lucidityMeter || gameState.lucidityMeter || 0));
  const lucFill  = Math.floor(BAR_W * (lucidity / 100));
  ctx.fillStyle  = '#0e1a2a';
  ctx.fillRect(BAR_X, lucY - 6, BAR_W, 12);
  ctx.fillStyle  = lucidity > 70 ? '#00ffee' : lucidity > 40 ? '#00aaff' : '#224466';
  ctx.fillRect(BAR_X, lucY - 6, lucFill, 12);
  ctx.textAlign  = 'right';
  ctx.fillStyle  = '#88aacc';
  ctx.font       = '9px Courier New';
  ctx.fillText(`${Math.round(lucidity)}%`, bx + BOX_W - 14, lucY + 4);
  ctx.textAlign  = 'left';

  // ── Language learning ───────────────────────────────────────────────
  const langY = lucY + 22;
  _hline(ctx, bx + 12, bx + BOX_W - 12, langY - 2);
  _sectionLabel(ctx, 'LANGUAGE LEARNING', bx + 16, langY + 12);

  const nativeLang = gameState.settings?.nativeLanguage || '—';
  const targetLang = gameState.settings?.targetLanguage || '—';
  const challenges = gameState._totalChallengesCompleted || 0;
  ctx.fillStyle = '#88aacc';
  ctx.font      = '10px Courier New';
  ctx.fillText(
    `${nativeLang} → ${targetLang}   ·   ${challenges} challenge${challenges !== 1 ? 's' : ''} complete`,
    bx + 16, langY + 26
  );

  // ── Current mode info ───────────────────────────────────────────────
  const modeY = langY + 46;
  _hline(ctx, bx + 12, bx + BOX_W - 12, modeY - 6);
  _sectionLabel(ctx, 'CURRENT MODE', bx + 16, modeY + 6);

  const modeName  = gameState.modeState?.modeName || 'Grid-Classic';
  const playMode  = (gameState.playMode || 'ARCADE').replace(/_/g, ' ');
  const dreamsc   = gameState.currentDreamscape || '—';
  const archetype = gameState._activeArchetype ? ` · ⚔ ${gameState._activeArchetype}` : '';
  ctx.fillStyle   = '#88aacc';
  ctx.font        = '10px Courier New';
  ctx.fillText(`${modeName}  ·  ${playMode}  ·  ${dreamsc}${archetype}`, bx + 16, modeY + 20);

  // ── Intelligence scores (Phase 9) ──────────────────────────────────
  const iqY = modeY + 42;
  _hline(ctx, bx + 12, bx + BOX_W - 12, iqY - 8);
  _sectionLabel(ctx, 'INTELLIGENCE SCORES  (Phase 9)', bx + 16, iqY + 4);

  // Lazy-import to avoid circular dependencies at module init time
  let iq = 50, eq = 50, empathy = 0, strategy = 0;
  try {
    // These modules are singletons — just read their scores if available via window
    const lp = window.__glitchPeaceIntelligence;
    if (lp) { iq = lp.iq; eq = lp.eq; empathy = lp.empathy; strategy = lp.strategy; }
  } catch (_) {}

  const SCORE_COLS = [
    { label: 'IQ Proxy',  value: iq,       color: '#00ccff' },
    { label: 'EQ',        value: eq,       color: '#ffdd44' },
    { label: 'Empathy',   value: empathy,  color: '#ffaacc' },
    { label: 'Strategy',  value: strategy, color: '#88ffaa' },
  ];
  const colW = Math.floor(BOX_W / 4);
  SCORE_COLS.forEach(({ label, value, color }, i) => {
    const sx = bx + 16 + i * colW;
    const sy = iqY + 18;
    _label(ctx, label, sx, sy - 4);
    // Score bar (mini)
    const barW = colW - 24;
    ctx.fillStyle = '#0e1a2a';
    ctx.fillRect(sx, sy, barW, 6);
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, Math.round(barW * Math.min(1, value / 100)), 6);
    // Numeric value
    ctx.fillStyle = color;
    ctx.font      = 'bold 11px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(value)}`, sx, sy + 18);
  });

  ctx.restore();
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function _hline(ctx, x1, x2, y) {
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function _label(ctx, text, x, y) {
  ctx.fillStyle = '#445566';
  ctx.font      = '9px Courier New';
  ctx.fillText(text, x, y);
}

function _value(ctx, text, x, y, color = '#ccddf0') {
  ctx.fillStyle = color;
  ctx.font      = '13px Courier New';
  ctx.fillText(text, x, y);
}

function _sectionLabel(ctx, text, x, y) {
  ctx.fillStyle = '#2a4a5a';
  ctx.font      = 'bold 9px Courier New';
  ctx.fillText(text, x, y);
}
