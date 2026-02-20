'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — progress-dashboard.js — Phase 11: Integration Synthesis
//  Unified view of all systems: learning, wellness, awareness, cosmology.
//  Accessible via a new 'H' key in-game (hides/shows overlay).
//  All metrics are non-judgmental, framed as exploration data.
// ═══════════════════════════════════════════════════════════════════════

// ─── Draw the full progress dashboard overlay ─────────────────────────
export function drawDashboard(ctx, w, h) {
  const data = gatherData();
  const pad = 16;
  const panelW = Math.min(w - 32, 440);
  const panelH = Math.min(h - 32, 840);  // taller to fit quest + alchemy rows
  const px = (w - panelW) / 2;
  const py = (h - panelH) / 2;

  // ── Background ───────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(2,2,14,0.97)'; ctx.fillRect(px, py, panelW, panelH);
  ctx.strokeStyle = 'rgba(0,255,136,0.15)'; ctx.lineWidth = 1;
  ctx.strokeRect(px, py, panelW, panelH);

  // ── Title ─────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 12;
  ctx.font = 'bold 16px Courier New';
  ctx.fillText('◈  GLITCH·PEACE DASHBOARD  ◈', px + panelW/2, py + 24); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = '7px Courier New';
  ctx.fillText('exploration metrics  ·  non-judgmental  ·  all data local', px + panelW/2, py + 36);
  ctx.textAlign = 'left';

  let y = py + 52;
  const col1 = px + pad;
  const col2 = px + panelW/2 + 4;

  // ── Row 1: Session + Learning ──────────────────────────────────────
  _drawSection(ctx, col1, y, panelW/2 - pad, 80, 'SESSION', [
    { label: 'Duration',   val: data.session.duration },
    { label: 'Wellness',   val: data.session.wellnessLabel, color: data.session.wellnessColor },
    { label: 'Today',      val: data.session.todayCount + ' session' + (data.session.todayCount !== 1 ? 's' : '') },
    { label: 'Total Time', val: data.session.totalTime },
  ], '#00ff88');

  _drawSection(ctx, col2, y, panelW/2 - pad, 80, 'LEARNING', [
    { label: 'Words (session)', val: String(data.learning.sessionWords) },
    { label: 'Words (total)',   val: String(data.learning.totalWords) },
    { label: 'Patterns found',  val: String(data.learning.patterns) },
  ], '#ffdd88');

  y += 96;

  // ── Row 2: Awareness + Chakras ─────────────────────────────────────
  _drawSection(ctx, col1, y, panelW/2 - pad, 96, 'EMERGENCE', [
    { label: 'Level',       val: data.emergence.label, color: '#aaccff' },
    { label: 'Progress',    val: Math.round(data.emergence.level * 100) + '%' },
    { label: 'Signs',       val: data.emergence.allTime + '/8 discovered' },
    { label: 'Reflections', val: String(data.emergence.reflections) },
  ], '#aaccff');

  _drawSection(ctx, col2, y, panelW/2 - pad, 96, 'CHAKRAS', [
    { label: 'Kundalini',  val: Math.round(data.chakra.kundalini * 100) + '% flowing' },
    { label: 'Dominant',   val: data.chakra.dominantName, color: data.chakra.dominantColor },
    { label: 'Awakened',   val: data.chakra.awakened + '/7 awakened' },
  ], '#cc88ff');

  y += 112;

  // ── Row 3: Chakra openness bars ─────────────────────────────────────
  const chakraData = data.chakra.openness || [];
  const chakraNames = ['Root', 'Sacral', 'Solar', 'Heart', 'Throat', '3E', 'Crown'];
  const chakraColors = ['#cc2200','#ff6600','#ffdd00','#00cc44','#0088ff','#4400ff','#cc00ff'];
  if (chakraData.length === 7) {
    const barW = (panelW - pad * 2) / 7;
    chakraData.forEach((v, i) => {
      const bx = col1 + i * barW;
      const bh = Math.round(v * 28);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(bx, y, barW - 2, 28);
      ctx.fillStyle = chakraColors[i] + (v > 0.7 ? 'ff' : '88');
      ctx.fillRect(bx, y + 28 - bh, barW - 2, bh);
      ctx.fillStyle = '#444455'; ctx.textAlign = 'center'; ctx.font = '6px Courier New';
      ctx.fillText(chakraNames[i], bx + (barW - 2)/2, y + 38);
    });
    ctx.textAlign = 'left';
  }

  y += 50;

  // ── Row 4: Character Stats (RPG) ────────────────
  const csData = window._characterStats || {};
  _drawSection(ctx, col1, y, panelW - pad * 2, 58, 'CHARACTER (RPG)', [
    { label: 'Level',  val: 'LVL ' + (csData.level || 1) + '  \u00b7  XP ' + Math.round((csData.xpPct || 0) * 100) + '%' },
    { label: 'Stats',  val: 'STR ' + (csData.str || 1) + '  INT ' + (csData.int || 1) + '  WIS ' + (csData.wis || 1) + '  VIT ' + (csData.vit || 1) },
    { label: 'Growth', val: csData.levelUpMsg || 'Keep exploring to grow…' },
  ], '#ffdd88');
  y += 74;

  // ── Row 5: Intelligence (IQ/EQ) ──────────────────────────────────
  _drawSection(ctx, col1, y, panelW/2 - pad, 76, 'COGNITIVE (IQ)', [
    { label: 'Logic Score',    val: data.intelligence.iqScore + '/100' },
    { label: 'Strategy Score', val: data.intelligence.strategicScore + '/100' },
    { label: 'Challenges Seen', val: String(data.intelligence.challengesSeen) },
    { label: 'Current Tip',    val: data.intelligence.strategicTip.slice(0, 28) + '…' },
  ], '#88ddff');

  _drawSection(ctx, col2, y, panelW/2 - pad, 76, 'EMOTIONAL (EQ)', [
    { label: 'EQ Score',       val: data.intelligence.eqScore + '/100' },
    { label: 'Empathy Score',  val: data.intelligence.empathyScore + '/100' },
    { label: 'Labeled',        val: data.intelligence.labelledCount + ' emotions' },
    { label: 'Behaviors',      val: data.intelligence.behaviorsWitnessed + '/12 witnessed' },
  ], '#ffcc88');

  y += 92;

  // ── Row 5: Journey + Quests ───────────────────────────────────────────
  _drawSection(ctx, col1, y, panelW/2 - pad, 72, 'JOURNEY', [
    { label: 'Dreamscapes', val: data.journey.dreamscapes + '/18 this session' },
    { label: 'Campaign',    val: data.journey.campaignTotal + ' completions' },
    { label: 'Sessions',    val: String(data.journey.totalSessions) },
  ], '#ffaacc');

  _drawSection(ctx, col2, y, panelW/2 - pad, 72, 'QUESTS', [
    { label: 'Completed',  val: data.quests.completed + '/5 quests done', color: '#ffdd88' },
    { label: 'Active',     val: data.quests.activeName || 'all complete', color: '#ddcc66' },
    { label: 'Progress',   val: data.quests.activeProgress },
  ], '#ffdd88');

  y += 88;

  // ── Row 6: Alchemy ────────────────────────────────────────────────────
  if (data.alchemy.active || data.alchemy.transmutations > 0) {
    const stonesLabel = data.alchemy.stones + ' philosopher stone' + (data.alchemy.stones !== 1 ? 's' : '');
    const classicProgress = data.alchemy.classicElements + '/4 elements this session';
    _drawSection(ctx, col1, y, panelW - pad * 2, 66, 'ALCHEMY ⚗️', [
      { label: 'Phase',          val: data.alchemy.phase, color: '#cc88ff' },
      { label: 'Seeds',          val: data.alchemy.seedsDisplay || 'none collected' },
      { label: 'Transmutations', val: String(data.alchemy.transmutations) },
      { label: 'Great Work',     val: classicProgress, color: data.alchemy.classicElements >= 4 ? '#ffdd00' : '#666677' },
      { label: 'Stones',         val: stonesLabel },
    ], '#cc88ff');
    y += 82;
  }

  // ── Footer ─────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.fillStyle = '#112211'; ctx.font = '7px Courier New';
  ctx.fillText('H = close  ·  all data local  ·  no judgment  ·  exploration only', px + panelW/2, py + panelH - 8);
  ctx.textAlign = 'left';
}

// ─── Draw a data section ──────────────────────────────────────────────
function _drawSection(ctx, x, y, w, h, title, rows, titleColor) {
  ctx.strokeStyle = titleColor + '22'; ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = titleColor + '11'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = titleColor; ctx.shadowColor = titleColor; ctx.shadowBlur = 4;
  ctx.font = 'bold 8px Courier New';
  ctx.fillText(title, x + 4, y + 10); ctx.shadowBlur = 0;
  rows.forEach((row, i) => {
    ctx.fillStyle = row.color || '#445566'; ctx.font = '7px Courier New';
    ctx.fillText(row.label + ': ' + row.val, x + 4, y + 24 + i * 13);
  });
}

// ─── Gather all data from window globals ─────────────────────────────
function gatherData() {
  const session  = window._sessionWellness  || { label: '—', color: '#667788' };
  const learn    = window._learnStats       || { words: 0, patterns: 0 };
  const em       = window._emergence        || { level: 0, label: 'Dreaming', session: 0 };
  const ck       = window._chakra           || { dominant: { name:'—', color:'#888' }, openness:[], kundalini:0.5 };
  const tracker  = window._trackerData      || {};
  const iq       = window._iqData           || {};

  return {
    session: {
      duration:       window._sessionDuration   || '00:00',
      wellnessLabel:  session.label || '—',
      wellnessColor:  session.color || '#667788',
      todayCount:     tracker.todayCount        || 0,
      totalTime:      tracker.totalTime         || '0m',
    },
    learning: {
      sessionWords: learn.words || 0,
      totalWords:   learn.totalWords || 0,
      patterns:     learn.patterns || 0,
    },
    emergence: {
      level:       em.level || 0,
      label:       em.label || 'Dreaming',
      allTime:     window._emergenceAllTime  || 0,
      reflections: window._reflections      || 0,
    },
    chakra: {
      kundalini:     ck.kundalini || 0.5,
      dominantName:  ck.dominant?.name  || '—',
      dominantColor: ck.dominant?.color || '#888',
      awakened:      window._chakraAwakened || 0,
      openness:      ck.openness || [],
    },
    intelligence: {
      iqScore:           iq.iqScore          || 50,
      strategicScore:    iq.strategicScore   || 0,
      eqScore:           iq.eqScore          || 50,
      empathyScore:      iq.empathyScore     || 0,
      challengesSeen:    iq.challengesSeen   || (window._campaignTotal || 0),
      strategicTip:      iq.strategicTip     || 'Preview consequences before each move.',
      labelledCount:     iq.eqFlash ? 1 : 0,
      behaviorsWitnessed: iq.behaviorsWitnessed || 0,
    },
    journey: {
      dreamscapes:    window._dreamscapesThisSession || 0,
      campaignTotal:  window._campaignTotal          || 0,
      totalSessions:  tracker.totalSessions          || 0,
    },
    quests: _gatherQuestData(),
    alchemy: _gatherAlchemyData(),
  };
}

function _gatherQuestData() {
  const qd = window._questData;
  if (!qd || !qd.length) return { completed: 0, activeName: '—', activeProgress: 'begin your journey' };
  const completed = qd.filter(q => q.done).length;
  const active    = qd.find(q => !q.done);
  if (!active) return { completed, activeName: 'all complete!', activeProgress: '' };
  // Find first incomplete objective
  const obj = active.objectives.find(o => o.current < o.max);
  const prog = obj ? obj.label + ' (' + obj.current + '/' + obj.max + ')' : '—';
  return { completed, activeName: active.emoji + ' ' + active.name, activeProgress: prog };
}

function _gatherAlchemyData() {
  const al = window._alchemy || {};
  return {
    active:          al.active || false,
    phase:           al.phase  || 'nigredo',
    seedsDisplay:    al.seedsDisplay || '',
    transmutations:  al.transmutations || 0,
    stones:          al.stones || 0,
    classicElements: al.classicElements || 0,
  };
}

// ─── Dashboard state (module-level) ──────────────────────────────────
let _visible = false;
export const dashboard = {
  get visible()  { return _visible; },
  toggle()       { _visible = !_visible; },
  show()         { _visible = true; },
  hide()         { _visible = false; },
};
