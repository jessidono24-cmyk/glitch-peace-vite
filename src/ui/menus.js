'use strict';
import { DREAMSCAPES, ARCHETYPES, UPGRADE_SHOP, MAIN_MENU, PAUSE_MENU, OPT_GRID, OPT_DIFF } from '../core/constants.js';
import { CFG, PLAYER_PROFILE } from '../core/state.js';
import { LANGUAGES, LANGUAGE_PATHS, LANG_LIST } from '../systems/learning/language-system.js';
import { DIFFICULTY_TIERS } from '../systems/difficulty/adaptive-difficulty.js';
import { PLAY_MODES, PLAY_MODE_LIST, getPlayModeMeta } from '../systems/play-modes.js';
import { getCosmologyForDreamscape } from '../systems/cosmology/cosmologies.js';
import { isChapterUnlocked } from '../systems/campaign-story.js';
// ── ARCH4: Timezone options (UTC offset in hours; null = auto-detect) ─────
export const TZ_OPTIONS = [
  { label: 'Auto-detect',          value: null },
  { label: 'UTC-12 (Baker Island)', value: -12  },
  { label: 'UTC-11 (Samoa)',        value: -11  },
  { label: 'UTC-10 (Hawaii)',       value: -10  },
  { label: 'UTC-9 (Alaska)',        value:  -9  },
  { label: 'UTC-8 (Pacific US)',    value:  -8  },
  { label: 'UTC-7 (Mountain US)',   value:  -7  },
  { label: 'UTC-6 (Central US)',    value:  -6  },
  { label: 'UTC-5 (Eastern US)',    value:  -5  },
  { label: 'UTC-4 (Atlantic)',      value:  -4  },
  { label: 'UTC-3 (Brazil)',        value:  -3  },
  { label: 'UTC-2',                 value:  -2  },
  { label: 'UTC-1 (Azores)',        value:  -1  },
  { label: 'UTC+0 (London)',        value:   0  },
  { label: 'UTC+1 (Paris)',         value:   1  },
  { label: 'UTC+2 (Cairo)',         value:   2  },
  { label: 'UTC+3 (Moscow)',        value:   3  },
  { label: 'UTC+4 (Dubai)',         value:   4  },
  { label: 'UTC+5 (Karachi)',       value:   5  },
  { label: 'UTC+5:30 (India)',      value: 5.5  },
  { label: 'UTC+6 (Dhaka)',         value:   6  },
  { label: 'UTC+7 (Bangkok)',       value:   7  },
  { label: 'UTC+8 (Beijing)',       value:   8  },
  { label: 'UTC+9 (Tokyo)',         value:   9  },
  { label: 'UTC+10 (Sydney)',       value:  10  },
  { label: 'UTC+11 (Vladivostok)',  value:  11  },
  { label: 'UTC+12 (Auckland)',     value:  12  },
  { label: 'UTC+13 (Tonga)',        value:  13  },
  { label: 'UTC+14 (Kiribati)',     value:  14  },
];
// ── Canvas-responsive font size helper ───────────────────────────────
// base = ideal px at 1280×720; scales with CSS pixel canvas size, never below 14px
const FONT = "'Share Tech Mono', monospace";
function fs(base, canvas) {
  const scale = Math.min(canvas.clientWidth / 1280, canvas.clientHeight / 720);
  return Math.max(14, Math.round(base * Math.max(scale, 0.85)));
}
function stars(ctx, backgroundStars, ts) {
  for (const s of backgroundStars) {
    ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase));
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Mode select definitions ──────────────────────────────────────────
export const GAME_MODES = [
  { id: 'grid-classic',    label: '🗂️  GRID CLASSIC',       sub: 'tactical tile navigation · original',                      color: '#00ff88' },
  { id: 'fps',             label: '🎯  FIRST PERSON',        sub: '3D corridor dreamscapes · embodied movement · reflex',      color: '#ff4444' },
  { id: 'rpg',             label: '⚔   RPG ADVENTURE',       sub: 'dialogue, quests, character stats',                        color: '#ffcc44' },
  { id: 'ornithology',     label: '🦅  ORNITHOLOGY',         sub: 'observe birds · awe effects',                              color: '#88ffcc' },
  { id: 'mycology',        label: '🍄  MYCOLOGY',            sub: 'forage mushrooms · network visualization',                 color: '#cc88ff' },
  { id: 'architecture',    label: '🏛   ARCHITECTURE',        sub: 'place tiles · design structures (SPACE/Q/E)',              color: '#aaddff' },
  { id: 'constellation',   label: '✦   CONSTELLATION',       sub: 'connect stars correctly · wrong = HP cost',                color: '#aaddff' },
  { id: 'alchemy',         label: '⚗   ALCHEMY',             sub: 'collect elements · rustic lab visuals',                    color: '#ff8800' },
  { id: 'rhythm',          label: '🎵  RHYTHM MODE',         sub: 'music theory intervals · beat matching',                   color: '#ffaa44' },
  { id: 'learning_hub',    label: '📚  LEARNING HUB',        sub: 'select discipline · contextual puzzles',                   color: '#44aaff' },
  { id: 'language_learning', label: '🗣️  LANGUAGE LEARNING',   sub: 'FSRS-5 · French · Spanish · Japanese · immersive dreamscape', color: '#44ffdd' },
];

// ─── ARCH1: Dreamscapes available per game mode ───────────────────────
export const MODE_DREAMSCAPES = {
  'grid-classic':    ['void', 'mountain_dragon', 'courtyard', 'leaping_field', 'summit', 'neighborhood', 'bedroom', 'aztec', 'orb_escape', 'integration'],
  'rpg':             ['neighborhood', 'courtyard', 'summit', 'integration', 'crystal_cave', 'cloud_city'],
  'constellation':   ['void', 'orb_escape', 'integration', 'void_nexus', 'cloud_city'],
  'meditation':      ['leaping_field', 'neighborhood', 'integration', 'deep_ocean', 'forest_sanctuary'],
  'rhythm':          ['leaping_field', 'mountain_dragon', 'orb_escape', 'solar_temple', 'cloud_city'],
  'alchemy':         ['courtyard', 'summit', 'integration', 'solar_temple', 'ancient_structure'],
  'ornithology':     ['leaping_field', 'mountain_dragon', 'summit', 'forest_sanctuary'],
  'mycology':        ['void', 'neighborhood', 'leaping_field', 'mycelium_depths', 'forest_sanctuary'],
  'architecture':    ['courtyard', 'summit', 'integration', 'ancient_structure', 'crystal_cave'],
  'fps':             ['void', 'mountain_dragon', 'aztec', 'void_nexus', 'ancient_structure'],
  'learning_hub':    ['leaping_field', 'neighborhood', 'integration', 'courtyard', 'cloud_city'],
  'language_learning': ['leaping_field', 'neighborhood', 'integration', 'courtyard', 'cloud_city'],
};

// ─── Main menu items ──────────────────────────────────────────────────────
const MAIN_MENU_ITEMS = [
  { id: 'start',       label: 'START JOURNEY',  sub: 'Begin a new consciousness' },
  { id: 'continue',    label: 'CONTINUE',        sub: 'Return to a saved consciousness' },
  { id: 'how_to_play', label: 'HOW TO PLAY',     sub: '' },
  { id: 'options',     label: 'OPTIONS',          sub: '' },
  { id: 'high_scores', label: 'HIGH SCORES',     sub: '' },
];

export function drawModeSelect(ctx, w, h, modeIdx, backgroundStars, ts) {
  // Deep dark background
  ctx.fillStyle = '#01010a'; ctx.fillRect(0, 0, w, h);
  for (let y2 = 0; y2 < h; y2 += 4) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(0, y2, w, 1); }
  if (backgroundStars) stars(ctx, backgroundStars, ts);

  // Corner brackets matching title screen style
  const cSz = 14, cPad = 10, cAlpha = 0.2 + 0.1 * Math.sin(ts * 0.003);
  ctx.globalAlpha = cAlpha; ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1.5;
  [[cPad, cPad, 1, 1], [w - cPad, cPad, -1, 1], [cPad, h - cPad, 1, -1], [w - cPad, h - cPad, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(cx + dx * cSz, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * cSz); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('SELECT GAME MODE', w / 2, 52); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('choose your path through the dreamscapes', w / 2, 70);
  ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('STEP 1 of 3  ·  Mode → Dreamscape → Cosmology', w / 2, 86);

  const cols = 2;
  const cardW = w * 0.38;
  const cardH = h * 0.13;
  const gapX = w * 0.04;
  const gapY = h * 0.02;
  const gridW = cols * cardW + (cols - 1) * gapX;
  const startX = (w - gridW) / 2;
  const startY = h * 0.16;

  GAME_MODES.forEach((mode, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);
    const isSelected = i === modeIdx;

    ctx.fillStyle = isSelected ? '#001a11' : '#050a08';
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = isSelected ? '#00ff88' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(cx, cy, cardW, cardH);

    ctx.textAlign = 'left';
    ctx.fillStyle = isSelected ? '#00ff88' : '#006644';
    ctx.shadowColor = isSelected ? '#00ff88' : 'transparent';
    ctx.shadowBlur = isSelected ? 8 : 0;
    ctx.font = (isSelected ? 'bold ' : '') + fs(15, ctx.canvas) + 'px ' + FONT;
    ctx.fillText(mode.label, cx + cardW * 0.06, cy + cardH * 0.42);
    ctx.shadowBlur = 0;

    ctx.fillStyle = isSelected ? '#334433' : '#1a2a1a';
    ctx.font = fs(12, ctx.canvas) + 'px ' + FONT;
    ctx.fillText(mode.sub, cx + cardW * 0.06, cy + cardH * 0.72);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('Arrow keys to select  ·  ENTER confirm  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, w, h, backgroundStars, ts, menuIdx, gameMode) {
  // Deep space background
  const bgGrd = ctx.createLinearGradient(0, 0, 0, h);
  bgGrd.addColorStop(0, '#01010a');
  bgGrd.addColorStop(0.5, '#02020e');
  bgGrd.addColorStop(1, '#010108');
  ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, y, w, 1); }
  stars(ctx, backgroundStars, ts);

  // Animated horizontal scan line
  const scanY = ((ts * 0.06) % h);
  ctx.globalAlpha = 0.04; ctx.fillStyle = '#00ff88';
  ctx.fillRect(0, scanY, w, 2);
  ctx.globalAlpha = 1;

  // Corner decorations (L-shaped brackets)
  const cornerSize = 18, cornerPad = 12;
  const cornerAlpha = 0.28 + 0.12 * Math.sin(ts * 0.003);
  ctx.globalAlpha = cornerAlpha; ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1.5;
  [[cornerPad, cornerPad, 1, 1], [w - cornerPad, cornerPad, -1, 1],
   [cornerPad, h - cornerPad, 1, -1], [w - cornerPad, h - cornerPad, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(cx + dx * cornerSize, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * cornerSize); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';

  // Subtitle above title
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('⬦  A BEING NAVIGATES THE DREAMSCAPES  ⬦', w / 2, h / 2 - 162);

  // Animated glitch on title occasionally
  const glitch = Math.sin(ts * 0.0013) > 0.97;
  if (glitch) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ff0055'; ctx.shadowColor = '#ff0055'; ctx.shadowBlur = 20;
    ctx.font = 'bold '+ fs(40, ctx.canvas) + "px " + FONT; ctx.fillText('GLITCH·PEACE', w / 2 + 2, h / 2 - 122);
    ctx.globalAlpha = 1;
  }
  // Title
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 36;
  ctx.font = 'bold '+ fs(40, ctx.canvas) + "px " + FONT; ctx.fillText('GLITCH·PEACE', w / 2, h / 2 - 120); ctx.shadowBlur = 0;

  // Tagline with animated glow
  const tlPulse = 0.5 + 0.5 * Math.sin(ts * 0.002);
  ctx.fillStyle = `rgba(0,80,40,${0.6 + 0.4 * tlPulse})`;
  ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('v4  ·  dreamscape consciousness simulation  ·  18 dreamscapes  ·  6 modes', w / 2, h / 2 - 98);

  // Menu items
  const _titleItemH = Math.max(28, Math.round(h * 0.05));
  const menuTop = h / 2 - 68;
  const _titlePanelHalf = Math.round(w * 0.18);
  MAIN_MENU_ITEMS.forEach((item, i) => {
    const sel = i === menuIdx, y = menuTop + i * _titleItemH;
    const isPrimary = i < 2;
    const itemColor = '#00ff88';
    if (sel) {
      const selGrd = ctx.createLinearGradient(w / 2 - _titlePanelHalf, y - 18, w / 2 + _titlePanelHalf, y - 18);
      selGrd.addColorStop(0, 'rgba(0,255,136,0.01)');
      selGrd.addColorStop(0.5, isPrimary ? 'rgba(0,255,136,0.14)' : 'rgba(0,255,136,0.09)');
      selGrd.addColorStop(1, 'rgba(0,255,136,0.01)');
      ctx.fillStyle = selGrd; ctx.fillRect(w / 2 - _titlePanelHalf, y - 18, _titlePanelHalf * 2, 26);
      ctx.strokeStyle = isPrimary ? 'rgba(0,255,136,0.55)' : 'rgba(0,255,136,0.35)'; ctx.strokeRect(w / 2 - _titlePanelHalf, y - 18, _titlePanelHalf * 2, 26);
    }
    const baseColor = sel ? itemColor : (isPrimary ? '#1e3a1e' : '#2a3a2a');
    ctx.fillStyle = baseColor; ctx.shadowColor = sel ? itemColor : 'transparent'; ctx.shadowBlur = sel ? 10 : 0;
    ctx.font = sel ? 'bold '+ fs(16, ctx.canvas) + "px " + FONT : (isPrimary ? 'bold '+ fs(14, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT);
    ctx.fillText(item.label, w / 2, y); ctx.shadowBlur = 0;
  });

  // Footer
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ navigate  ·  ENTER select  ·  gamepad supported', w / 2, h - 20);
  ctx.textAlign = 'left';
}

const DREAM_ITEMS_PER_PAGE = 8;

export function drawDreamSelect(ctx, w, h, dreamscapes, dreamIdx, dreamPage) {
  // dreamscapes: filtered array of dreamscape objects for the chosen mode
  // dreamIdx: index into the dreamscapes array (not global DREAMSCAPES)
  // dreamPage: current pagination page (0-based)
  const dsList = (dreamscapes && dreamscapes.length > 0) ? dreamscapes : DREAMSCAPES;
  const page = dreamPage || 0;
  const totalPages = Math.ceil(dsList.length / DREAM_ITEMS_PER_PAGE);
  const pageStart = page * DREAM_ITEMS_PER_PAGE;
  const visible = dsList.slice(pageStart, pageStart + DREAM_ITEMS_PER_PAGE);

  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('SELECT DREAMSCAPE', w / 2, 50); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('choose your symbolic environment', w / 2, 68);
  ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('STEP 2 of 3  ·  Mode → Dreamscape → Cosmology', w / 2, 84);

  const cols = 2;
  const cardW = w * 0.38;
  const cardH = h * 0.10;
  const gapX = w * 0.04;
  const gapY = h * 0.015;
  const gridW = cols * cardW + (cols - 1) * gapX;
  const startX = (w - gridW) / 2;
  const startY = h * 0.14;

  visible.forEach((ds, vi) => {
    if (!ds) return;
    const di = pageStart + vi;
    const col = vi % cols;
    const row = Math.floor(vi / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);
    const isSelected = di === dreamIdx;

    ctx.fillStyle = isSelected ? '#001a11' : '#050a08';
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = isSelected ? '#00ff88' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(cx, cy, cardW, cardH);

    ctx.textAlign = 'left';
    ctx.fillStyle = isSelected ? '#00ff88' : '#2a3a2a';
    ctx.shadowColor = isSelected ? '#00ff88' : 'transparent';
    ctx.shadowBlur = isSelected ? 8 : 0;
    ctx.font = (isSelected ? 'bold ' : '') + fs(14, ctx.canvas) + 'px ' + FONT;
    ctx.fillText((di + 1) + '.  ' + ds.name, cx + cardW * 0.05, cy + cardH * 0.40);
    ctx.shadowBlur = 0;

    ctx.fillStyle = isSelected ? '#334455' : '#1a2a1a';
    ctx.font = fs(11, ctx.canvas) + 'px ' + FONT;
    ctx.fillText(ds.subtitle + '  ·  ' + ds.emotion, cx + cardW * 0.05, cy + cardH * 0.72);
  });

  ctx.textAlign = 'center';
  if (totalPages > 1) {
    const prevHint = page > 0 ? '← prev' : '';
    const nextHint = page < totalPages - 1 ? '→ next' : '';
    const pageHints = [prevHint, nextHint].filter(Boolean).join('  ');
    ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('Page ' + (page + 1) + ' / ' + totalPages + (pageHints ? '  ·  ' + pageHints : ''), w / 2, h - 36);
  }
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ ←→ navigate  ·  ENTER select  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawOptions(ctx, w, h, optIdx) {
  const OPT_START_Y   = 48;  // y of first row label
  const OPT_ROW_H     = 46;  // vertical spacing between rows
  const OPT_BTN_SPACE = 90;  // horizontal spacing between option buttons
  const OPT_BTN_W     = 90;  // button width
  const OPT_BTN_HALF  = 44;  // half button width (for fillRect offset)
  const OPT_BTN_H     = 22;  // button height
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('OPTIONS', w / 2, 50); ctx.shadowBlur = 0;
  const langMeta  = LANGUAGES[PLAYER_PROFILE.nativeLang] || {};
  const tgtMeta   = LANGUAGES[PLAYER_PROFILE.targetLang]  || {};
  const playMeta  = getPlayModeMeta(CFG.playMode || 'arcade');
  // SFX volume display  (PLAYER_PROFILE.sfxVol 0-1 → percentage label)
  const sfxPct   = Math.round((PLAYER_PROFILE.sfxVol !== undefined ? PLAYER_PROFILE.sfxVol : 0.3) * 100);
  const sfxMuted = PLAYER_PROFILE.sfxMuted || false;
  const FONT_SCALE_LABELS = { 0.8: 'S', 1.0: 'M', 1.2: 'L', 1.4: 'XL' };
  const fontScaleLabel = FONT_SCALE_LABELS[CFG.fontScale] || 'M';
  const tzOffset = PLAYER_PROFILE.utcOffsetHours;
  const curTzOpt = TZ_OPTIONS.find(o => o.value === tzOffset) || TZ_OPTIONS[0];
  const tzCycleLabel = '‹ ' + curTzOpt.label + ' ›';
  const rows = [
    { label:'GRID SIZE',      opts:OPT_GRID, cur:CFG.gridSize },
    { label:'DIFFICULTY',     opts:OPT_DIFF, cur:CFG.difficulty },
    { label:'PARTICLES',      opts:['on','off'], cur:CFG.particles ? 'on' : 'off' },
    { label:'PLAY STYLE',     opts:['‹ ' + (playMeta.emoji||'') + ' ' + playMeta.name + ' ›'], cur:'‹ ' + (playMeta.emoji||'') + ' ' + playMeta.name + ' ›',
      hint: playMeta.desc },
    { label:'VIEW MODE',      opts:['flat','iso'], cur: CFG.viewMode || 'flat', hint: 'flat = grid · iso = isometric 2.5D' },
    { label:'SFX VOLUME',     opts:['0%','25%','50%','75%','100%'], cur: sfxPct + '%', hint: sfxMuted ? 'muted — ←→ adjust volume  ENTER=toggle mute' : '←→ adjust volume  ENTER=toggle mute' },
    { label:'HIGH CONTRAST',  opts:['off','on'], cur: CFG.highContrast ? 'on' : 'off', hint: 'colorblind-friendly palette' },
    { label:'REDUCED MOTION', opts:['off','on'], cur: CFG.reducedMotion ? 'on' : 'off', hint: 'no screen shake or flash' },
    { label:'FONT SCALE',     opts:['S','M','L','XL'], cur: fontScaleLabel, hint: 'text size: S=80%  M=100%  L=120%  XL=140%' },
    { label:'LOCAL TIME ZONE', opts:[tzCycleLabel], cur:tzCycleLabel, hint: '←→ cycle offset · sets planetary day for local time' },
    { label:'LANGUAGES',      opts:['OPEN →'], cur:'OPEN →', hint: (langMeta.emoji||'') + ' → ' + (tgtMeta.emoji||'') + ' ' + (tgtMeta.name||'') },
    { label:'',               opts:['← BACK'], cur:'← BACK' },
  ];
  rows.forEach((row, i) => {
    const sel = i === optIdx, baseY = OPT_START_Y + i * OPT_ROW_H;
    if (row.label) {
      ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(row.label, w / 2, baseY);
      if (row.hint) { ctx.fillStyle = '#445566'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(row.hint.slice(0, 60), w / 2, baseY + 12); }
    }
    const rowOpts = row.opts;
    rowOpts.forEach((opt, j) => {
      const active = opt === row.cur;
      const oy_off = row.hint ? 30 : 22;
      const ox = w / 2 + (j - (rowOpts.length - 1) / 2) * OPT_BTN_SPACE, oy = baseY + oy_off;
      ctx.fillStyle = (sel && active) ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.02)'; ctx.fillRect(ox - OPT_BTN_HALF, oy - OPT_BTN_H + 8, OPT_BTN_W, OPT_BTN_H);
      ctx.strokeStyle = (sel && active) ? 'rgba(0,255,136,0.5)' : active ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.04)'; ctx.strokeRect(ox - OPT_BTN_HALF, oy - OPT_BTN_H + 8, OPT_BTN_W, OPT_BTN_H);
      ctx.fillStyle = active ? '#00ff88' : '#334455'; ctx.shadowColor = active ? '#00ff88' : 'transparent'; ctx.shadowBlur = active ? 5 : 0;
      ctx.font = active ? 'bold '+ fs(13, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(opt.toUpperCase().slice(0, 22), ox, oy); ctx.shadowBlur = 0;
    });
    if (sel) { ctx.fillStyle = '#00ff88'; ctx.font = fs(14, ctx.canvas) + "px " + FONT; ctx.fillText('▶', w / 2 - 154, baseY + (row.hint ? 30 : 22)); }
    // SFX row: draw a live volume bar
    if (row.label === 'SFX VOLUME' && sel) {
      const barX = w / 2 - 110, barY = baseY + (row.hint ? 30 : 22) - 6, barW = 220, barH = 6;
      ctx.fillStyle = '#111122'; ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = sfxMuted ? '#443344' : '#00cc77';
      ctx.fillRect(barX, barY, barW * (sfxPct / 100), barH);
      ctx.strokeStyle = 'rgba(0,255,136,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
    }
  });
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('↑↓ row  ·  ←→ value  ·  ENTER action  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawHighScores(ctx, w, h, highScores) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('HIGH SCORES', w / 2, 50); ctx.shadowBlur = 0;
  if (!highScores.length) { ctx.fillStyle = '#223322'; ctx.font = fs(14, ctx.canvas) + "px " + FONT; ctx.fillText('no scores yet…', w / 2, h / 2); }
  else {
    highScores.slice(0, 8).forEach((s, i) => {
      const y = 95 + i * 38, med = i === 0 ? '◈' : i === 1 ? '◇' : '·';
      ctx.fillStyle = i === 0 ? '#ffdd00' : i === 1 ? '#aaaaaa' : i === 2 ? '#cc8833' : '#334455';
      ctx.font = i < 3 ? 'bold '+ fs(16, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(`${med}  ${String(s.score).padStart(7,'0')}   LVL${String(s.level).padStart(2,'0')}   ${s.dreamscape}   ${s.date}`, w / 2, y);
    });
  }
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('ENTER / ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawUpgradeShop(ctx, w, h, shopIdx, insightTokens, checkOwned) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 16;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('UPGRADES', w / 2, 50); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('◆ insight tokens: ' + insightTokens, w / 2, 68);
  UPGRADE_SHOP.forEach((up, i) => {
    const sel = i === shopIdx, owned = checkOwned(up.id), canBuy = insightTokens >= up.cost && !owned;
    const y = 92 + i * 48;
    if (sel) {
      ctx.fillStyle = 'rgba(0,238,255,0.06)'; ctx.fillRect(w / 2 - 155, y - 14, 310, 40);
      ctx.strokeStyle = 'rgba(0,238,255,0.22)'; ctx.strokeRect(w / 2 - 155, y - 14, 310, 40);
    }
    ctx.fillStyle = owned ? '#00ff88' : canBuy ? '#00ccdd' : '#334455';
    ctx.shadowColor = owned ? '#00ff88' : sel ? '#00ccdd' : 'transparent'; ctx.shadowBlur = (sel && !owned) ? 5 : 0;
    ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(up.name, w / 2 - 55, y); ctx.shadowBlur = 0;
    ctx.fillStyle = '#334'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(up.desc, w / 2 - 55, y + 14);
    ctx.fillStyle = owned ? '#005533' : canBuy ? '#006677' : '#221122';
    ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(owned ? 'OWNED' : '◆×' + up.cost, w / 2 + 88, y + 4);
  });
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('↑↓ select  ·  ENTER buy  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawPause(ctx, w, h, game, pauseIdx) {
  ctx.fillStyle = 'rgba(0,0,0,0.87)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 14;
  ctx.font = 'bold '+ fs(32, ctx.canvas) + "px " + FONT; ctx.fillText('PAUSED', w / 2, h / 2 - 82); ctx.shadowBlur = 0;
  if (game) {
    ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(game.ds.name + '  ·  LEVEL ' + game.level, w / 2, h / 2 - 60);
    ctx.fillStyle = '#334455'; ctx.fillText(game.ds.narrative, w / 2, h / 2 - 46);
  } else {
    // Shooter mode pause
    const ss = window._shooterState;
    if (ss) {
      ctx.fillStyle = '#ff6622'; ctx.shadowColor = '#ff6622'; ctx.shadowBlur = 6;
      ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('SHOOTER ARENA  ·  WAVE ' + ss.wave, w / 2, h / 2 - 60);
      ctx.shadowBlur = 0; ctx.fillStyle = '#664422';
      ctx.fillText('SCORE: ' + ss.score + '  ·  HP: ' + ss.health, w / 2, h / 2 - 46);
    }
  }

  // Phase 7: Session wellness display
  const wellness = window._sessionWellness;
  const duration = window._sessionDuration || '00:00';
  const learnStats = window._learnStats || { words: 0, patterns: 0 };
  if (wellness) {
    ctx.fillStyle = wellness.color; ctx.shadowColor = wellness.color; ctx.shadowBlur = 4;
    ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('SESSION · ' + duration + ' · ' + wellness.label, w / 2, h / 2 - 30);
    ctx.shadowBlur = 0;
  }
  // Phase 6: Learning stats
  ctx.fillStyle = '#335533'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('WORDS: ' + learnStats.words + '  ·  PATTERNS: ' + learnStats.patterns, w / 2, h / 2 - 18);

  // Phase 8: Emergence level
  const em = window._emergence;
  if (em) {
    ctx.fillStyle = '#445566'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('EMERGENCE · ' + em.label, w / 2, h / 2 - 6);
  }

  // Phase 9: Strategic coaching tip + EQ insight
  const iqData = window._iqData;
  if (iqData) {
    ctx.fillStyle = '#223340'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('IQ ' + iqData.iqScore + '  EQ ' + iqData.eqScore + '  STRATEGY ' + iqData.strategicScore + '  EMPATHY ' + iqData.empathyScore, w / 2, h / 2 + 6);
    ctx.fillStyle = '#334455'; ctx.font = 'italic '+ fs(13, ctx.canvas) + "px " + FONT;
    const tipText = iqData.strategicTip
      ? (iqData.strategicTip.length > 54 ? iqData.strategicTip.slice(0, 54) + '…' : iqData.strategicTip)
      : '';
    ctx.fillText(tipText, w / 2, h / 2 + 18);
  }

  // Phase 7: Breathing panel (if active)
  const breath = window._breathState;
  if (breath && breath.isActive) {
    const cx = w / 2, cy = h / 2 + 90;
    const maxR = 28, minR = 8;
    const r = minR + (maxR - minR) * breath.radius;
    // Outer glow ring
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = breath.color; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Main circle
    ctx.fillStyle = breath.color; ctx.shadowColor = breath.color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#000'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(breath.label, cx, cy + 4);
    // Phrase below
    ctx.fillStyle = '#667788'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(breath.phrase || '', cx, cy + 50);
    ctx.fillStyle = '#223344'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('CYCLES: ' + (breath.cycles || 0) + '  ·  B=stop breathing', cx, h / 2 + 150);
  } else {
    ctx.fillStyle = '#223344'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('B = start breathing exercise (Box / 4-7-8 / Coherent)', w / 2, h - 34);
  }

  // ── Loop 5: Patterns display ─────────────────────────────────────────
  const patterns = window._sessionPatterns;
  if (patterns && (patterns.impulseTotal > 0 || patterns.insightCount > 0)) {
    const total = patterns.impulseTotal || 0;
    const stops = patterns.impulseStops || 0;
    const ins   = patterns.insightCount || 0;
    const hazard = patterns.hazardSteps || 0;
    const stopRatio = total > 0 ? Math.min(10, Math.round(stops / total * 10)) : 0;
    const stopBar = '█'.repeat(stopRatio) + '░'.repeat(10 - stopRatio);
    ctx.fillStyle = '#223344'; ctx.font = fs(11, ctx.canvas) + "px " + FONT;
    ctx.fillText('PATTERNS  impulse×' + total + '  paused: ' + stops + '  ' + stopBar + '  ◆×' + ins + '  ⚠×' + hazard, w / 2, h - 52);
  }

  PAUSE_MENU.forEach((txt, i) => {
    const sel = i === pauseIdx, y = h / 2 + 30 + i * 32;
    if (sel) {
      ctx.fillStyle = 'rgba(0,255,136,0.07)'; ctx.fillRect(w / 2 - 110, y - 16, 220, 24);
      ctx.strokeStyle = 'rgba(0,255,136,0.26)'; ctx.strokeRect(w / 2 - 110, y - 16, 220, 24);
    }
    ctx.fillStyle = sel ? '#00ff88' : '#334433'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 6 : 0;
    ctx.font = sel ? 'bold '+ fs(16, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(txt, w / 2, y); ctx.shadowBlur = 0;
  });
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('↑↓ navigate  ·  ENTER select  ·  ESC resume', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawInterlude(ctx, w, h, interludeState, ts) {
  // ── Timing (ms-based, frame-rate independent) ─────────────────────────
  const elapsed   = interludeState.elapsed  || 0;
  const duration  = interludeState.duration || 10000;
  const minAdv    = interludeState.minAdvanceMs || 3500;

  // Global fade-in (first 600 ms) and fade-out (last 800 ms)
  const FADE_IN  = 600;
  const FADE_OUT = 800;
  let alpha;
  if      (elapsed < FADE_IN)             alpha = elapsed / FADE_IN;
  else if (elapsed > duration - FADE_OUT) alpha = Math.max(0, (duration - elapsed) / FADE_OUT);
  else                                    alpha = 1;

  // Helper: per-element fade-in starting at `startMs`, taking 350 ms
  const elemAlpha = (startMs) => Math.min(1, Math.max(0, (elapsed - startMs) / 350));

  const ds = interludeState.ds || DREAMSCAPES[0];
  // Rich background: blend dreamscape color with animated radial gradient
  ctx.fillStyle = ds.bgColor || '#02020a'; ctx.fillRect(0, 0, w, h);
  const bgAccent = ds.bgAccent || '#002810';
  const bgGrd2 = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
  bgGrd2.addColorStop(0, bgAccent + '44'); bgGrd2.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGrd2; ctx.fillRect(0, 0, w, h);

  // Animated scan lines
  for (let i = 0; i < 7; i++) {
    const lx = (ts * 0.02 + i * w / 7) % w;
    ctx.strokeStyle = `rgba(0,255,136,${0.025 * alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx - 100, h); ctx.stroke();
  }
  ctx.globalAlpha = alpha; ctx.textAlign = 'center';

  // ── Completion text (immediate) ────────────────────────────────────────
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 20;
  ctx.font = 'bold '+ fs(20, ctx.canvas) + "px " + FONT; ctx.fillText(interludeState.text, w / 2, h / 2 - 76); ctx.shadowBlur = 0;

  // ── Reflection prompt (1.0 s) ──────────────────────────────────────────
  if (interludeState.reflectionPrompt) {
    ctx.globalAlpha = alpha * elemAlpha(1000);
    const depthColor = { surface: '#446644', mid: '#4466aa', deep: '#884488' }[interludeState.reflectionDepth || 'surface'];
    ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillStyle = depthColor;
    ctx.fillText((interludeState.reflectionDepth || 'surface').toUpperCase() + ' REFLECTION', w / 2, h / 2 - 56);
    ctx.fillStyle = '#aaffcc'; ctx.shadowColor = '#00cc88'; ctx.shadowBlur = 8;
    ctx.font = 'italic '+ fs(14, ctx.canvas) + "px " + FONT;
    ctx.fillText('\u201c' + interludeState.reflectionPrompt + '\u201d', w / 2, h / 2 - 42); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  // ── Affirmation (1.8 s) ────────────────────────────────────────────────
  if (interludeState.affirmation) {
    ctx.globalAlpha = alpha * elemAlpha(1800);
    ctx.fillStyle = '#335533'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(interludeState.affirmation, w / 2, h / 2 - 18);
    ctx.globalAlpha = alpha;
  }

  // ── Next dreamscape info (2.2 s) ──────────────────────────────────────
  ctx.globalAlpha = alpha * elemAlpha(2200);
  ctx.fillStyle = '#223322'; ctx.font = fs(14, ctx.canvas) + "px " + FONT; ctx.fillText('ENTERING: ' + ds.name, w / 2, h / 2 + 6);
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(ds.narrative, w / 2, h / 2 + 24);
  ctx.globalAlpha = alpha;

  // ── Vocabulary word (2.8 s) ───────────────────────────────────────────
  if (interludeState.vocabWord) {
    const vw = interludeState.vocabWord;
    ctx.globalAlpha = alpha * elemAlpha(2800);
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 6;
    ctx.font = 'bold '+ fs(16, ctx.canvas) + "px " + FONT;
    ctx.fillText(vw.word + '  [' + vw.pos + ']', w / 2, h / 2 + 50); ctx.shadowBlur = 0;
    ctx.fillStyle = '#554422'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(vw.def, w / 2, h / 2 + 66);
    ctx.globalAlpha = alpha;
  }

  // ── Archetype (3.1 s) ─────────────────────────────────────────────────
  if (ds.archetype && ARCHETYPES[ds.archetype]) {
    const arch = ARCHETYPES[ds.archetype];
    ctx.globalAlpha = alpha * elemAlpha(3100);
    ctx.fillStyle = arch.glow; ctx.shadowColor = arch.glow; ctx.shadowBlur = 10;
    ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('archetype: ' + arch.name, w / 2, h / 2 + 86); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  // ── Empathy reflection (3.5 s) ────────────────────────────────────────
  if (interludeState.empathyReflection) {
    ctx.globalAlpha = alpha * elemAlpha(3500);
    ctx.fillStyle = '#887755'; ctx.font = 'italic '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(interludeState.empathyReflection, w / 2, h / 2 + 104);
    ctx.globalAlpha = alpha;
  }

  // ── Cosmology info (4.2 s) ────────────────────────────────────────────
  const cosmo = getCosmologyForDreamscape(ds.id);
  if (cosmo) {
    ctx.globalAlpha = alpha * elemAlpha(4200);
    ctx.fillStyle = '#4a4a66'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText((cosmo.emoji || '') + '  ' + cosmo.name + '  ·  ' + cosmo.tradition, w / 2, h / 2 + 120);
    ctx.globalAlpha = alpha;
  }

  // ── RPG level + active quest (4.8 s) ─────────────────────────────────
  const cs = window._characterStats;
  const qd = window._questData;
  if (cs || qd) {
    ctx.globalAlpha = alpha * elemAlpha(4800);
    const parts = [];
    if (cs && cs.level > 1) parts.push('RPG LVL ' + cs.level);
    if (qd) {
      const activeQ = qd.find(q => !q.done);
      if (activeQ) {
        const obj = activeQ.objectives.find(o => o.current < o.max);
        if (obj) parts.push(activeQ.emoji + ' ' + activeQ.name + ': ' + obj.current + '/' + obj.max);
      } else {
        parts.push('✦ All quests complete');
      }
    }
    if (parts.length) {
      ctx.fillStyle = '#445555'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(parts.join('  ·  '), w / 2, h / 2 + 136);
    }
    ctx.globalAlpha = alpha;
  }

  // ── Campaign milestone (5.2 s) ────────────────────────────────────────
  if (interludeState.milestone) {
    ctx.globalAlpha = alpha * elemAlpha(5200);
    ctx.fillStyle = '#ffdd44'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 8;
    ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('✦  ' + interludeState.milestone, w / 2, h / 2 + 152); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  // ── Loop 4: Session insight (5.8 s) — one behavioral observation ─────────
  if (interludeState.sessionInsight) {
    ctx.globalAlpha = alpha * elemAlpha(5800);
    ctx.fillStyle = '#446644'; ctx.font = 'italic '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(interludeState.sessionInsight, w / 2, h / 2 + 168);
    ctx.globalAlpha = alpha;
  }

  // ── "Continue" prompt — appears once all content is visible ───────────
  if (elapsed >= minAdv) {
    const contAlpha = Math.min(1, (elapsed - minAdv) / 400);
    const pulse = 0.65 + 0.35 * Math.sin(ts * 0.003);
    ctx.globalAlpha = alpha * contAlpha * pulse;
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 5;
    ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('ENTER · SPACE  to continue', w / 2, h - 20); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

export function drawDead(ctx, w, h, game, highScores, dreamHistory, insightTokens, sessionRep) {
  // Animated scanline vignette for death screen
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.004);
  ctx.fillStyle = 'rgba(8,0,0,0.97)'; ctx.fillRect(0, 0, w, h);
  for (let y2 = 0; y2 < h; y2 += 3) { ctx.fillStyle = 'rgba(40,0,0,0.06)'; ctx.fillRect(0, y2, w, 1); }
  // Red vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
  vg.addColorStop(0, 'rgba(80,0,0,0)'); vg.addColorStop(1, 'rgba(80,0,0,0.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  const ds = game?.ds;
  ctx.fillStyle = '#330000'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('THE BEING DISSOLVES IN ' + (ds?.name || 'THE VOID').toUpperCase(), w / 2, h / 2 - 140);
  // "ERASED" with glitch/shimmer
  ctx.fillStyle = '#ff0000'; ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 40 * pulse;
  ctx.font = 'bold '+ fs(40, ctx.canvas) + "px " + FONT; ctx.fillText('ERASED', w / 2, h / 2 - 88); ctx.shadowBlur = 0;
  // Dreamscape emotion
  if (ds?.emotion) {
    ctx.fillStyle = '#440000'; ctx.font = 'italic '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('"' + ds.emotion + '"  ·  ' + (ds.narrative || ''), w / 2, h / 2 - 64);
  }

  // Score box
  ctx.strokeStyle = `rgba(0,255,136,${0.3 * pulse})`; ctx.lineWidth = 1;
  ctx.strokeRect(w / 2 - 80, h / 2 - 50, 160, 34);
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 14 * pulse;
  ctx.font = 'bold '+ fs(32, ctx.canvas) + "px " + FONT; ctx.fillText(String(game.score).padStart(7, '0'), w / 2, h / 2 - 22); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('FINAL SCORE  ·  LEVEL ' + game.level, w / 2, h / 2 - 4);

  // Session stats row
  ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('DREAMS  ' + dreamHistory.length + '/' + DREAMSCAPES.length + '  ·  REP ' + (sessionRep >= 0 ? '+' : '') + sessionRep + '  ·  ◆×' + insightTokens, w / 2, h / 2 + 16);

  // Run stats from window globals
  const learnStats = window._learnStats || { words: 0, patterns: 0 };
  if (learnStats.words > 0 || learnStats.patterns > 0) {
    ctx.fillStyle = '#224422'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('WORDS LEARNED: ' + learnStats.words + '  ·  PATTERNS: ' + learnStats.patterns, w / 2, h / 2 + 32);
  }

  // ── RPG stats snapshot ──────────────────────────────────────────────
  const cs = window._characterStats;
  if (cs && cs.level > 1) {
    ctx.fillStyle = '#ffdd88'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('RPG  LVL ' + cs.level + '  STR ' + (cs.str||1) + '  INT ' + (cs.int||1) + '  WIS ' + (cs.wis||1) + '  VIT ' + (cs.vit||1), w / 2, h / 2 + 48);
  }
  // ── Quest summary ───────────────────────────────────────────────────
  const qd = window._questData;
  if (qd) {
    const qDone = qd.filter(q => q.done).length;
    ctx.fillStyle = qDone > 0 ? '#ddcc66' : '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('QUESTS  ' + qDone + '/5 complete', w / 2, cs && cs.level > 1 ? h / 2 + 62 : h / 2 + 48);
  }
  // ── Alchemy phase ───────────────────────────────────────────────────
  const al = window._alchemy;
  let alY = h / 2 + 48;
  if (cs && cs.level > 1) alY = h / 2 + 62;
  if (qd) alY = h / 2 + (cs && cs.level > 1 ? 76 : 62);
  if (al && al.transmutations > 0) {
    const phaseLabel = { nigredo: '🜏 Nigredo', albedo: '🜃 Albedo', rubedo: '🜔 Rubedo', aurora: '✦ Aurora' }[al.phase] || al.phase;
    ctx.fillStyle = '#cc88ff'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('ALCHEMY  ' + phaseLabel + '  ·  ' + al.transmutations + ' transmutation' + (al.transmutations !== 1 ? 's' : ''), w / 2, alY);
  }

  // ── High score rank ──────────────────────────────────────────────────
  const rankY = alY + (al && al.transmutations > 0 ? 18 : 0);
  if (highScores.length > 0) {
    const rank = highScores.findIndex(s => s.score === game.score);
    if (rank === 0) {
      ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 8;
      ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('🏆  NEW HIGH SCORE!  RANK #1', w / 2, rankY); ctx.shadowBlur = 0;
    } else if (rank >= 0) {
      ctx.fillStyle = '#ffdd00'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('RANK #' + (rank + 1) + ' ALL TIME', w / 2, rankY);
    }
  }

  // ── Continue prompt ──────────────────────────────────────────────────
  const btnY = rankY + 22;
  ctx.fillStyle = `rgba(255,34,34,${0.07 * pulse})`; ctx.fillRect(w / 2 - 110, btnY, 220, 34);
  ctx.strokeStyle = `rgba(255,34,34,${0.45 * pulse})`; ctx.strokeRect(w / 2 - 110, btnY, 220, 34);
  ctx.fillStyle = '#ff2222'; ctx.font = fs(14, ctx.canvas) + "px " + FONT; ctx.fillText('↺  ENTER TO TRY AGAIN', w / 2, btnY + 22);
  ctx.fillStyle = '#221122'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('ESC → TITLE', w / 2, btnY + 40);
  ctx.textAlign = 'left';
}

// ─── Onboarding screen ────────────────────────────────────────────────
// Shown once on first launch. Asks age group, native language, and
// preferred learning language. Choices are persisted in PLAYER_PROFILE.
//
// onboardCursor layout:
//   0 = age group selection
//   1 = native language selection
//   2 = target language selection
//   3 = confirm / start
//
const AGE_OPTS = [
  { key: 'child5',  label: '🌱  5 – 7',    tier: 'tiny',     desc: 'Safe & playful — very gentle pace' },
  { key: 'child8',  label: '🌿  8 – 11',   tier: 'gentle',   desc: 'Friendly challenge, encouraging words' },
  { key: 'teen12',  label: '⚡  12 – 15',  tier: 'explorer', desc: 'Moderate challenge, rich vocabulary' },
  { key: 'teen16',  label: '🔷  16 – 19',  tier: 'standard', desc: 'Full experience, all dreamscapes' },
  { key: 'adult',   label: '🔥  20 +',     tier: 'standard', desc: 'Full experience (change in Options)' },
];

// LANG_LIST is imported from language-system.js — no local duplicate

export function drawOnboarding(ctx, w, h, ob) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('WELCOME TO GLITCH·PEACE', w / 2, 44); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('let\'s set up your personal experience  ·  all settings changeable later', w / 2, 62);

  // Step indicator
  const steps = ['age', 'language', 'learning', 'confirm'];
  steps.forEach((s, i) => {
    const active = i === ob.step;
    const done   = i < ob.step;
    const x = w / 2 - 90 + i * 60;
    ctx.fillStyle   = done ? '#00aa44' : active ? '#00ff88' : '#223322';
    ctx.shadowColor = active ? '#00ff88' : 'transparent'; ctx.shadowBlur = active ? 6 : 0;
    ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText((done ? '✓' : String(i + 1)) + ' ' + s.toUpperCase(), x, 82);
    ctx.shadowBlur = 0;
  });

  const cy = 110;

  if (ob.step === 0) {
    // ── Step 0: Age group ──────────────────────────────────────────────
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('How old are you?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('(difficulty adjusts automatically — you can always change it later)', w / 2, cy + 16);
    AGE_OPTS.forEach((opt, i) => {
      const sel = i === ob.ageIdx;
      const y = cy + 44 + i * 44;
      if (sel) {
        ctx.fillStyle = 'rgba(0,255,136,0.07)'; ctx.fillRect(w / 2 - 150, y - 16, 300, 36);
        ctx.strokeStyle = 'rgba(0,255,136,0.3)'; ctx.strokeRect(w / 2 - 150, y - 16, 300, 36);
      }
      ctx.fillStyle = sel ? '#00ff88' : '#334455'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 5 : 0;
      ctx.font = sel ? 'bold '+ fs(16, ctx.canvas) + "px " + FONT : fs(14, ctx.canvas) + "px " + FONT; ctx.fillText(opt.label, w / 2, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#446655' : '#1a2a1a'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(opt.desc, w / 2, y + 14);
    });

  } else if (ob.step === 1) {
    // ── Step 1: Native language ────────────────────────────────────────
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('What is your native language?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('Game will teach vocabulary with your language as the anchor', w / 2, cy + 16);
    const perRow = 4, colW = 140, rowH = 48;
    const startX = w / 2 - (perRow / 2) * colW + colW / 2;
    LANG_LIST.forEach((code, i) => {
      const lang = LANGUAGES[code];
      if (!lang) return;
      const col = i % perRow, row = Math.floor(i / perRow);
      const lx = startX + col * colW, ly = cy + 42 + row * rowH;
      const sel = i === ob.nativeIdx;
      if (sel) {
        ctx.fillStyle = 'rgba(0,255,136,0.08)'; ctx.fillRect(lx - 58, ly - 14, 116, 34);
        ctx.strokeStyle = 'rgba(0,255,136,0.35)'; ctx.strokeRect(lx - 58, ly - 14, 116, 34);
      }
      ctx.fillStyle = sel ? '#00ff88' : '#334455'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 4 : 0;
      ctx.font = sel ? 'bold '+ fs(13, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(lang.emoji + '  ' + lang.name, lx, ly); ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#335544' : '#1a2020'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(lang.nativeName, lx, ly + 12);
    });

  } else if (ob.step === 2) {
    // ── Step 2: Target learning language ──────────────────────────────
    const nativeCode = LANG_LIST[ob.nativeIdx] || 'en';
    const path = LANGUAGE_PATHS[nativeCode] || LANGUAGE_PATHS.en;
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('Which language would you like to start learning?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('Ordered by ease for ' + (LANGUAGES[nativeCode]?.name || 'English') + ' speakers  ·  more unlock as you play', w / 2, cy + 16);

    const perRow = 2, colW = 210, rowH = 52;
    const startX = w / 2 - colW / 2;
    path.slice(0, 8).forEach((code, i) => {
      const lang = LANGUAGES[code];
      if (!lang) return;
      const col = i % perRow, row = Math.floor(i / perRow);
      const lx = startX + col * colW, ly = cy + 44 + row * rowH;
      const sel = i === ob.targetIdx;
      if (sel) {
        ctx.fillStyle = 'rgba(100,200,255,0.07)'; ctx.fillRect(lx - 90, ly - 14, 180, 42);
        ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.strokeRect(lx - 90, ly - 14, 180, 42);
      }
      ctx.fillStyle = sel ? '#aaddff' : '#334455'; ctx.shadowColor = sel ? '#aaddff' : 'transparent'; ctx.shadowBlur = sel ? 4 : 0;
      ctx.font = sel ? 'bold '+ fs(13, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(lang.emoji + '  ' + lang.name + '  ' + lang.nativeName, lx, ly); ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#224455' : '#111a20'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      const dist = Math.round(lang.distance * 100);
      const fsi  = lang.fsiHours ? lang.fsiHours + 'h' : '—';
      ctx.fillText('distance ' + dist + '%  ·  ~' + fsi + ' to fluency', lx, ly + 13);
      ctx.fillStyle = '#1a2520'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(lang.description.slice(0, 48) + (lang.description.length > 48 ? '…' : ''), lx, ly + 25);
    });

  } else if (ob.step === 3) {
    // ── Step 3: Confirm ────────────────────────────────────────────────
    const nCode = LANG_LIST[ob.nativeIdx] || 'en';
    const tCode = (LANGUAGE_PATHS[nCode] || LANGUAGE_PATHS.en)[ob.targetIdx] || 'no';
    const age   = AGE_OPTS[ob.ageIdx] || AGE_OPTS[4];
    const tier  = DIFFICULTY_TIERS[age.tier] || DIFFICULTY_TIERS.standard;
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 14;
    ctx.font = 'bold '+ fs(20, ctx.canvas) + "px " + FONT; ctx.fillText('YOUR PROFILE', w / 2, cy + 10); ctx.shadowBlur = 0;

    const rows = [
      ['AGE GROUP',        age.label],
      ['DIFFICULTY TIER',  tier.label],
      ['NATIVE LANGUAGE',  LANGUAGES[nCode]?.emoji + ' ' + LANGUAGES[nCode]?.name],
      ['LEARNING',         LANGUAGES[tCode]?.emoji + ' ' + LANGUAGES[tCode]?.name],
      ['',                 ''],
      ['FIRST LANGUAGE',   LANGUAGES[nCode]?.description?.slice(0, 52) + '…'],
      ['LEARNING PATH',    LANGUAGES[tCode]?.description?.slice(0, 52) + '…'],
    ];
    rows.forEach(([label, val], i) => {
      if (!label && !val) return;
      const y = cy + 44 + i * 28;
      ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.textAlign = 'right';
      ctx.fillText(label, w / 2 - 10, y);
      ctx.fillStyle = '#00ff88'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.textAlign = 'left';
      ctx.fillText(val, w / 2 + 10, y);
    });
    ctx.textAlign = 'center';
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
    ctx.fillStyle = `rgba(0,255,136,${0.08 * pulse})`; ctx.fillRect(w / 2 - 120, h / 2 + 78, 240, 34);
    ctx.strokeStyle = `rgba(0,255,136,${0.5 * pulse})`; ctx.strokeRect(w / 2 - 120, h / 2 + 78, 240, 34);
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold '+ fs(16, ctx.canvas) + "px " + FONT;
    ctx.fillText('ENTER  ·  BEGIN JOURNEY', w / 2, h / 2 + 100);
  }

  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.textAlign = 'center';
  if (ob.step < 3) ctx.fillText('↑↓ select  ·  ENTER next  ·  BACKSPACE back', w / 2, h - 20);
  else             ctx.fillText('ENTER confirm  ·  BACKSPACE back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

// ─── Language options overlay (accessible from Options screen) ────────
export function drawLanguageOptions(ctx, w, h, langOb) {
  ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 14;
  ctx.font = 'bold '+ fs(22, ctx.canvas) + "px " + FONT; ctx.fillText('LANGUAGE SETTINGS', w / 2, 50); ctx.shadowBlur = 0;

  // Display mode human labels
  const DISPLAY_LABELS = {
    native:    'NATIVE ONLY',
    bilingual: 'BILINGUAL',
    target:    'IMMERSION (target only)',
  };

  const sections = [
    { label: 'NATIVE LANGUAGE', idx: langOb.nativeIdx, list: LANG_LIST, col: '#00ff88' },
    { label: 'LEARNING TARGET', idx: langOb.targetIdx, list: (LANGUAGE_PATHS[LANG_LIST[langOb.nativeIdx]] || LANGUAGE_PATHS.en), col: '#aaddff' },
    { label: 'DISPLAY MODE',    idx: langOb.modeIdx,   list: ['native','bilingual','target'], col: '#ffdd88',
      hintFn: (code) => DISPLAY_LABELS[code] || code },
  ];

  sections.forEach((sec, si) => {
    const baseY = 80 + si * 110;
    const sel = langOb.row === si;
    ctx.fillStyle = sec.col; ctx.font = (sel ? 'bold ' : '') + fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText((sel ? '▶ ' : '  ') + sec.label, w / 2, baseY);
    const opts = sec.list.slice(0, 8);
    opts.forEach((code, i) => {
      const lang = LANGUAGES[code];
      const label = sec.hintFn ? sec.hintFn(code) : (lang ? lang.emoji + ' ' + lang.name : code.toUpperCase());
      const active = i === sec.idx;
      const ox = w / 2 + (i - (opts.length - 1) / 2) * 78;
      ctx.fillStyle = (sel && active) ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(ox - 34, baseY + 14, 68, 22);
      ctx.strokeStyle = active ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.06)';
      ctx.strokeRect(ox - 34, baseY + 14, 68, 22);
      ctx.fillStyle = active ? sec.col : '#334455';
      ctx.font = active ? 'bold '+ fs(13, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText(label.slice(0, 20), ox, baseY + 29);
    });
  });

  // Mode description hint
  const modeList = ['native','bilingual','target'];
  const modeDescriptions = {
    native:    'Shows words in your native language only.',
    bilingual: 'Shows both native + target language words.',
    target:    'Full immersion — target language only. Sink or swim.',
  };
  const curMode = modeList[langOb.modeIdx] || 'bilingual';
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText(modeDescriptions[curMode] || '', w / 2, h - 36);

  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ row  ·  ←→ value  ·  ENTER/ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

// ─── How To Play screen ───────────────────────────────────────────────
// A first-time-player reference: objective, tile guide, controls, matrix.
export function drawHowToPlay(ctx, w, h) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, y, w, 1); }
  ctx.textAlign = 'center';

  // ── Title ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(26, ctx.canvas) + "px " + FONT; ctx.fillText('HOW TO PLAY', w / 2, 40); ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a3a1a'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('a consciousness engine disguised as a tile game  ·  18 dreamscapes · 21 play modes · gamepad supported', w / 2, 56);

  // ── Objective ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#00cc77'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('OBJECTIVE', w / 2, 78);
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('Use WASD or Arrow Keys to move through the dreamscape grid.', w / 2, 93);
  ctx.fillText('Collect ◈ PEACE tiles to fill your bar and clear the level.', w / 2, 107);
  ctx.fillText('Avoid hazard tiles. Reach the exit to enter the next dreamscape.', w / 2, 121);
  ctx.fillText('Press ESC any time to pause — your state is always safe to leave.', w / 2, 135);

  // ── Divider ───────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(0,255,136,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2 - 200, 144); ctx.lineTo(w / 2 + 200, 144); ctx.stroke();

  // ── Tile Guide ────────────────────────────────────────────────────────
  ctx.fillStyle = '#00cc77'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('TILE GUIDE', w / 2, 158);

  const TILES_HELP = [
    { sym: '◈', name: 'PEACE',      col: '#00ffaa', desc: 'Collect to progress' },
    { sym: '◆', name: 'INSIGHT',    col: '#00eeff', desc: 'Earn upgrade tokens' },
    { sym: '↓', name: 'DESPAIR',    col: '#5566ff', desc: 'Hazard — spreads' },
    { sym: '!', name: 'TERROR',     col: '#ff3333', desc: 'High damage' },
    { sym: '✕', name: 'SELF-HARM',  col: '#cc2222', desc: 'Moderate damage' },
    { sym: '~', name: 'HOPELESS',   col: '#2266ff', desc: 'Spreads slowly' },
    { sym: '▲', name: 'RAGE',       col: '#ff2266', desc: 'Damage + pushback' },
    { sym: '?', name: 'GLITCH',     col: '#dd00ff', desc: 'Random teleport' },
    { sym: '⇒', name: 'TELEPORT',   col: '#00ccff', desc: 'Fast travel portal' },
    { sym: '☆', name: 'ARCHETYPE',  col: '#ffdd00', desc: 'Guardian power — J' },
    { sym: '◯', name: 'BODY SCAN',  col: '#00aa44', desc: 'Somatic restore' },
    { sym: '≋', name: 'BREATH',     col: '#6688ff', desc: 'Energy / calm sync' },
    { sym: '✦', name: 'ENERGY NODE',col: '#cc44ff', desc: 'Energy boost' },
    { sym: '⊕', name: 'GROUNDING',  col: '#886644', desc: 'Root / heal' },
  ];

  const tStartY = 172, rowH = 21, colL = w / 2 - 205, colR = w / 2 + 5;
  TILES_HELP.forEach((t, i) => {
    const col = i % 2 === 0 ? colL : colR;
    const ty = tStartY + Math.floor(i / 2) * rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = t.col; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(t.sym + ' ' + t.name, col, ty);
    ctx.fillStyle = '#445566'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText('— ' + t.desc, col + 76, ty);
  });
  ctx.textAlign = 'center';

  // ── Divider ───────────────────────────────────────────────────────────
  const afterTiles = tStartY + Math.ceil(TILES_HELP.length / 2) * rowH + 4;
  ctx.strokeStyle = 'rgba(0,255,136,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2 - 200, afterTiles); ctx.lineTo(w / 2 + 200, afterTiles); ctx.stroke();

  // ── Controls ─────────────────────────────────────────────────────────
  const ctrlY = afterTiles + 14;
  ctx.fillStyle = '#00cc77'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('CONTROLS', w / 2, ctrlY);

  const CONTROLS_HELP = [
    ['WASD / ↑↓←→', 'Move',                 'ESC',   'Pause (always safe)'],
    ['SHIFT',        'Switch Matrix A ↔ B',  'H',     'Toggle dashboard'],
    ['J',            'Archetype power',       'R',     'Glitch Pulse (charged)'],
    ['Q',            'Freeze enemies',        'C',     'Containment zone (2◆)'],
    ['X',            'Transmute (Alchemist/Ritual)', 'Gamepad', 'Left stick=move  A=arch  Y=pulse  LB=freeze'],
  ];
  CONTROLS_HELP.forEach(([k1, v1, k2, v2], i) => {
    const cy2 = ctrlY + 16 + i * 18;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00aa66'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(k1, w / 2 - 205, cy2);
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(v1, w / 2 - 130, cy2);
    ctx.fillStyle = '#00aa66'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(k2, w / 2 + 10, cy2);
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.fillText(v2, w / 2 + 46, cy2);
  });
  ctx.textAlign = 'center';

  // ── Matrix System ─────────────────────────────────────────────────────
  const matY = ctrlY + 16 + CONTROLS_HELP.length * 18 + 12;
  ctx.strokeStyle = 'rgba(0,255,136,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2 - 200, matY - 6); ctx.lineTo(w / 2 + 200, matY - 6); ctx.stroke();

  ctx.fillStyle = '#00cc77'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('MATRIX SYSTEM  (SHIFT to toggle)', w / 2, matY + 6);
  ctx.fillStyle = '#ff3366'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('MATRIX A  ⟨ERASURE⟩   — red glow · reveals hidden tiles · more dangerous', w / 2, matY + 22);
  ctx.fillStyle = '#00ff88';
  ctx.fillText('MATRIX B  ⟨COHERENCE⟩ — green glow · restores health · safer recovery', w / 2, matY + 38);
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('Holding Matrix B heals slowly. Holding Matrix A drains slowly. Choose wisely.', w / 2, matY + 54);

  // ── First Steps ───────────────────────────────────────────────────────
  const fsY = matY + 68;
  ctx.strokeStyle = 'rgba(0,255,136,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2 - 200, fsY - 6); ctx.lineTo(w / 2 + 200, fsY - 6); ctx.stroke();

  ctx.fillStyle = '#00cc77'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('YOUR FIRST STEPS', w / 2, fsY + 6);
  const STEPS = [
    '1.  Choose START JOURNEY from the title — the first dreamscape is VOID STATE.',
    '2.  Move with WASD or Arrow Keys. Collect every ◈ you see.',
    '3.  When your HP bar gets low, switch to Matrix B (SHIFT) and move to green tiles.',
    '4.  Collect ☆ ARCHETYPE tiles — then press J to release their power.',
    '5.  Reach the far edge of the grid to enter the next dreamscape.',
  ];
  STEPS.forEach((s, i) => {
    ctx.fillStyle = '#335544'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(s, w / 2, fsY + 22 + i * 16);
  });

  // ── Co-op Setup ───────────────────────────────────────────────────────
  const coopY = fsY + 22 + STEPS.length * 16 + 16;
  ctx.strokeStyle = 'rgba(255,204,68,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2 - 200, coopY - 6); ctx.lineTo(w / 2 + 200, coopY - 6); ctx.stroke();
  ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 8;
  ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.fillText('🤝  CO-OP SETUP  (two players on one keyboard)', w / 2, coopY + 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#998844'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('From the title, choose SELECT MODE → CO-OP MODE and press ENTER.', w / 2, coopY + 22);
  ctx.fillStyle = '#00ff88'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('PLAYER 1:', w / 2 - 100, coopY + 38);
  ctx.fillStyle = '#ff8844';
  ctx.fillText('PLAYER 2:', w / 2 + 60, coopY + 38);
  ctx.fillStyle = '#aaccaa'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('Arrow Keys ↑↓←→', w / 2 - 100, coopY + 52);
  ctx.fillStyle = '#cc9977';
  ctx.fillText('W A S D', w / 2 + 60, coopY + 52);
  ctx.fillStyle = '#445566'; ctx.font = fs(13, ctx.canvas) + "px " + FONT; ctx.textAlign = 'center';
  ctx.fillText('Both share the same dreamscape. Collect ◈ tiles to clear the level together.', w / 2, coopY + 68);
  ctx.fillText('Somatic tiles (◯ ≋ ✦ ⊕) heal both players simultaneously.', w / 2, coopY + 82);

  // ── Footer ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#1a2a1a'; ctx.font = 'italic '+ fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('All data stays local · No shame spirals · Pause any time · Your identity is always safe.', w / 2, h - 30);
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('ENTER / ESC  ·  return to title', w / 2, h - 16);
  ctx.textAlign = 'left';
}

// ─── Achievement popup overlay (drawn over any phase) ──────────────────
export function drawAchievementPopup(ctx, w, h, popup, ts) {
  if (!popup) return;
  const alpha  = Math.min(1, popup.progress);
  const slide  = Math.min(1, popup.progress);
  const panelW = 290, panelH = 64;
  const px     = w - panelW - 14;
  const py     = 14 + (1 - slide) * -80;

  ctx.globalAlpha = alpha * 0.97;
  // Animated glow behind panel
  ctx.shadowColor = '#ffdd44'; ctx.shadowBlur = 20 * alpha;
  ctx.fillStyle = '#060610';
  ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 8); ctx.fill();
  ctx.shadowBlur = 0;
  // Border: gold achievement color
  ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(px + 0.5, py + 0.5, panelW - 1, panelH - 1, 8); ctx.stroke();
  // Top "ACHIEVEMENT UNLOCKED" gold band
  ctx.fillStyle = 'rgba(255,221,68,0.12)';
  ctx.beginPath(); ctx.roundRect(px + 1, py + 1, panelW - 2, 22, [7, 7, 0, 0]); ctx.fill();

  // Icon
  ctx.font = fs(22, ctx.canvas) + "px " + FONT; ctx.textAlign = 'left';
  ctx.fillStyle = '#ffdd44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 10;
  ctx.fillText(popup.icon || '🏆', px + 10, py + 44);
  ctx.shadowBlur = 0;

  // Labels
  ctx.fillStyle = '#ffdd44'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT; ctx.textAlign = 'left';
  ctx.fillText('✦  ACHIEVEMENT UNLOCKED  ✦', px + 42, py + 15);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText(popup.name, px + 42, py + 33);
  ctx.fillStyle = '#556677'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  const descStr = popup.desc || '';
  ctx.fillText(descStr.length > 36 ? descStr.slice(0, 34) + '…' : descStr, px + 42, py + 50);

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─── Achievements screen ──────────────────────────────────────────────
export function drawAchievements(ctx, w, h, achievementSystem, scrollOffset) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdd44'; ctx.shadowColor = '#ffdd44'; ctx.shadowBlur = 16;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT;
  ctx.fillText('ACHIEVEMENTS', w / 2, 46);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#445566'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText(achievementSystem.unlockedCount + ' / ' + achievementSystem.totalCount + ' unlocked', w / 2, 64);

  const all = (window._achieveDefs && window._achieveDefs.ACHIEVEMENT_DEFS) || [];
  const visible = Math.min(all.length, 8);
  const startI  = scrollOffset || 0;
  for (let i = 0; i < visible && startI + i < all.length; i++) {
    const def = all[startI + i];
    const unlocked = achievementSystem.isUnlocked(def.id);
    const y = 90 + i * 52;
    ctx.fillStyle = unlocked ? 'rgba(0,255,136,0.06)' : 'rgba(255,255,255,0.02)';
    ctx.fillRect(w / 2 - 200, y - 12, 400, 42);
    ctx.strokeStyle = unlocked ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.06)';
    ctx.strokeRect(w / 2 - 200, y - 12, 400, 42);
    ctx.fillStyle = unlocked ? '#ffdd44' : '#334455'; ctx.font = fs(18, ctx.canvas) + "px " + FONT; ctx.textAlign = 'left';
    ctx.fillText(def.icon || '?', w / 2 - 188, y + 14);
    ctx.fillStyle = unlocked ? '#00ff88' : '#334455'; ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(unlocked ? def.name : (def.hidden ? '???' : def.name), w / 2 - 162, y + 6);
    ctx.fillStyle = unlocked ? '#445566' : '#223322'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    const rawDesc = unlocked ? def.desc : (def.hidden ? 'Hidden achievement' : def.desc);
    const descText = rawDesc.length > 36 ? rawDesc.slice(0, 34) + '…' : rawDesc;
    ctx.fillText(descText, w / 2 - 162, y + 20);
    if (unlocked) {
      ctx.fillStyle = '#ffdd44'; ctx.textAlign = 'right'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText('✓', w / 2 + 188, y + 14);
    }
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#131328'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ scroll  ·  ENTER / ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

// ─── Archetype Selector ───────────────────────────────────────────────────
export function drawArchetypeSelect(ctx, w, h, selIdx, backgroundStars, ts) {
  // Background
  ctx.fillStyle = '#01010a'; ctx.fillRect(0, 0, w, h);
  for (let y2 = 0; y2 < h; y2 += 4) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(0, y2, w, 1); }
  if (backgroundStars) {
    for (const s of backgroundStars) {
      ctx.globalAlpha = s.a * (0.4 + 0.3 * Math.sin(ts * 0.0008 + s.phase));
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdd44'; ctx.shadowColor = '#ffdd44'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(22, ctx.canvas) + "px " + FONT; ctx.fillText('CHOOSE YOUR ARCHETYPE', w / 2, 44); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334422'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('your power shapes the dreamscape', w / 2, 60);

  const archKeys = Object.keys(ARCHETYPES);
  const COLS_ARCH = 3;
  const rowH = 80, colW = Math.floor((w - 40) / COLS_ARCH);
  const startX = 20, startY = 80;

  archKeys.forEach((key, i) => {
    const arch = ARCHETYPES[key];
    const col  = i % COLS_ARCH;
    const row  = Math.floor(i / COLS_ARCH);
    const rx   = startX + col * colW;
    const ry   = startY + row * rowH;
    const sel  = i === selIdx;
    const pulse = sel ? 0.5 + 0.5 * Math.sin(ts * 0.006) : 0;

    // Card background
    if (sel) {
      const bg = ctx.createLinearGradient(rx, ry, rx + colW - 6, ry + rowH - 4);
      bg.addColorStop(0, arch.color + '22');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg; ctx.fillRect(rx, ry, colW - 6, rowH - 4);
      ctx.strokeStyle = arch.color + Math.round(60 + pulse * 80).toString(16).padStart(2,'0');
      ctx.lineWidth = 1.5; ctx.strokeRect(rx, ry, colW - 6, rowH - 4);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1; ctx.strokeRect(rx, ry, colW - 6, rowH - 4);
    }

    // Archetype name
    ctx.fillStyle = sel ? arch.color : '#2a3a2a';
    ctx.shadowColor = sel ? arch.color : 'transparent'; ctx.shadowBlur = sel ? 8 : 0;
    ctx.font = sel ? 'bold '+ fs(13, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
    ctx.textAlign = 'left';
    ctx.fillText(arch.name, rx + 8, ry + 18); ctx.shadowBlur = 0;

    // Power description (truncated)
    ctx.fillStyle = sel ? '#88aacc' : '#1a2a1a'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    const pd = (arch.powerDesc || '').length > 32 ? arch.powerDesc.slice(0,30)+'…' : (arch.powerDesc||'');
    ctx.fillText(pd, rx + 8, ry + 32);

    // Activation message preview
    if (sel) {
      ctx.fillStyle = '#445533'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
      const am = (arch.activationMsg || '').length > 34 ? arch.activationMsg.slice(0,32)+'…' : (arch.activationMsg||'');
      ctx.fillText(am, rx + 8, ry + 46);
    }

    // Selection marker
    if (sel) {
      ctx.fillStyle = arch.color; ctx.shadowColor = arch.color; ctx.shadowBlur = 4;
      ctx.font = 'bold '+ fs(13, ctx.canvas) + "px " + FONT;
      ctx.fillText('▶', rx + 2, ry + 18); ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'left';
  });

  // Selected archetype details panel at bottom
  const selKey  = archKeys[selIdx] || archKeys[0];
  const selArch = ARCHETYPES[selKey];
  if (selArch) {
    const panY = h - 72;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(20, panY, w - 40, 60);
    ctx.strokeStyle = selArch.color + '44'; ctx.lineWidth = 1;
    ctx.strokeRect(20, panY, w - 40, 60);
    ctx.textAlign = 'left';
    ctx.fillStyle = selArch.color; ctx.font = 'bold '+ fs(16, ctx.canvas) + "px " + FONT;
    ctx.fillText(selArch.name, 32, panY + 18);
    ctx.fillStyle = '#aabbcc'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(selArch.powerDesc || '', 32, panY + 32);
    ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(selArch.completionBonus || '', 32, panY + 44);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓←→ navigate  ·  ENTER select  ·  ESC skip (no archetype)', w / 2, h - 10);
  ctx.textAlign = 'left';
}

// ─── Play Mode Selection Screen ────────────────────────────────────────────
export function drawPlayModeSelect(ctx, w, h, modeIdx, backgroundStars, ts) {
  ctx.fillStyle = '#01010a'; ctx.fillRect(0, 0, w, h);
  if (backgroundStars) { for (const s of backgroundStars) { ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('SELECT PLAY STYLE', w / 2, 52); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('how do you want to experience this dreamscape?', w / 2, 70);
  ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('STEP 4 of 4  ·  Mode → Dreamscape → Cosmology → Playstyle', w / 2, 84);
  const rowH = 32, startY = 90;
  PLAY_MODE_LIST.forEach((id, i) => {
    const meta = PLAY_MODES[id]; if (!meta) return;
    const sel = i === modeIdx, y = startY + i * rowH;
    ctx.fillStyle = sel ? 'rgba(0,255,136,0.08)' : 'transparent'; ctx.fillRect(w / 2 - 160, y - 16, 320, 28);
    if (sel) { ctx.strokeStyle = 'rgba(0,255,136,0.4)'; ctx.strokeRect(w / 2 - 160, y - 16, 320, 28); }
    ctx.fillStyle = sel ? meta.color || '#00ff88' : '#2a3a2a';
    ctx.font = sel ? 'bold '+ fs(16, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(`${meta.emoji || ''}  ${meta.name}`, w / 2, y);
  });
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ navigate  ·  ENTER select  ·  ESC back', w / 2, h - 15);
  ctx.textAlign = 'left';
}

// ─── Cosmology Selection Screen ────────────────────────────────────────────
const COSMOLOGY_DESCS = {
  null:       'Pure gameplay, no tradition overlay',
  chakra_realm:         'Hindu chakra system · energy as power',
  wheel_of_becoming:    'Buddhist dharma · suffering & release',
  wu_wei_flow:          'Taoist wu wei · effortless action',
  hermetic_principles:  'Hermetic principles · as above so below',
  yggdrasil_realms:     'Norse cosmology · Yggdrasil worlds',
  celtic_veil:          'Celtic tradition · thin places',
  gnostic_gnosis:       'Gnostic gnosis · light & shadow',
  confucian_harmony:    'Confucian harmony · relational ethics',
  egyptian_duat:        'Egyptian mystery · underworld journey',
  mayan_tzolkin:        'Mayan calendar · sacred time',
  iching_changes:       'I Ching · change as constant',
  stoic_path:           'Stoicism · virtue & reason',
};
export function drawCosmologySelect(ctx, w, h, cosmoIdx, cosmologyList, backgroundStars, ts) {
  ctx.fillStyle = '#01010a'; ctx.fillRect(0, 0, w, h);
  if (backgroundStars) { for (const s of backgroundStars) { ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('SELECT COSMOLOGY', w / 2, 52); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334455'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('choose a world tradition (optional — affects tile lore)', w / 2, 70);
  ctx.fillStyle = '#334433'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('STEP 3 of 3  ·  Mode → Dreamscape → Cosmology', w / 2, 84);

  const entries = [{ id: null, name: 'NONE', emoji: '·', color: '#aaaaaa', subtitle: 'Pure gameplay, no tradition overlay' }, ...cosmologyList];

  const cols = 2;
  const cardW = w * 0.38;
  const cardH = h * 0.10;
  const gapX = w * 0.04;
  const gapY = h * 0.015;
  const gridW = cols * cardW + (cols - 1) * gapX;
  const startX = (w - gridW) / 2;
  const startY = h * 0.14;

  entries.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);
    if (cy + cardH > h - 30) return;
    const isSelected = i === cosmoIdx;

    ctx.fillStyle = isSelected ? '#00060f' : '#050a08';
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = isSelected ? '#aaddff' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(cx, cy, cardW, cardH);

    ctx.textAlign = 'left';
    ctx.fillStyle = isSelected ? (c.color || '#aaddff') : '#334455';
    ctx.shadowColor = isSelected ? (c.color || '#aaddff') : 'transparent';
    ctx.shadowBlur = isSelected ? 8 : 0;
    ctx.font = (isSelected ? 'bold ' : '') + fs(14, ctx.canvas) + 'px ' + FONT;
    ctx.fillText((c.emoji || '') + '  ' + c.name, cx + cardW * 0.05, cy + cardH * 0.40);
    ctx.shadowBlur = 0;

    const desc = COSMOLOGY_DESCS[c.id] || c.subtitle || '';
    ctx.fillStyle = isSelected ? '#334466' : '#1a2233';
    ctx.font = fs(11, ctx.canvas) + 'px ' + FONT;
    ctx.fillText(desc, cx + cardW * 0.05, cy + cardH * 0.72);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0d1a0d'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('Arrow keys to select  ·  ENTER confirm  ·  ESC back', w / 2, h - 15);
  ctx.textAlign = 'left';
}

// ─── Campaign Story Select Screen (ARCH3) ─────────────────────────────────
export function drawCampaignSelect(ctx, w, h, chapterIdx, chapters, progress, backgroundStars, ts, emergenceLvl) {
  ctx.fillStyle = '#02010a'; ctx.fillRect(0, 0, w, h);
  if (backgroundStars) {
    for (const s of backgroundStars) {
      ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase));
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 18;
  ctx.font = 'bold '+ fs(24, ctx.canvas) + "px " + FONT; ctx.fillText('CAMPAIGN', w / 2, 46); ctx.shadowBlur = 0;
  ctx.fillStyle = '#554422'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('10-chapter life progression · mirrors consciousness development', w / 2, 64);
  // Progress header
  const completedIds = Array.isArray(progress?.completedChapters) ? progress.completedChapters
    : (progress?.completedChapters ? [...progress.completedChapters] : []);
  const completedCount = completedIds.length;
  const totalScore = progress?.totalConsciousnessScore || 0;
  ctx.fillStyle = '#665533'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText(`${completedCount}/${chapters.length} chapters complete  ·  consciousness: ${totalScore}`, w / 2, 80);
  const rowH = 54, startY = 100, visN = Math.min(chapters.length, 8);
  const startI = Math.max(0, Math.min(chapterIdx - 3, chapters.length - visN));
  for (let i = 0; i < visN; i++) {
    const ci = startI + i;
    if (ci >= chapters.length) break;
    const ch = chapters[ci], sel = ci === chapterIdx;
    // Determine chapter status
    const chId = ch.id || String(ch.chapter);
    const isDone = completedIds.includes(chId);
    const isCurrent = progress?.currentChapter === ch.id;
    const isLocked = ch.unlockCondition !== undefined
      ? !isChapterUnlocked(ch, progress || { completedChapters: completedIds }, emergenceLvl || 0)
      : false;
    const y = startY + i * rowH;
    // Act divider before first chapter of each new act
    if (ci > 0 && ch.act && chapters[ci - 1] && ch.act !== chapters[ci - 1].act) {
      ctx.strokeStyle = 'rgba(255,204,68,0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w / 2 - 180, y - rowH / 2); ctx.lineTo(w / 2 + 180, y - rowH / 2); ctx.stroke();
      ctx.fillStyle = '#554422'; ctx.font = fs(10, ctx.canvas) + "px " + FONT;
      ctx.fillText(`── ACT ${ch.act} ──`, w / 2, y - rowH / 2 + 7);
    }
    // Selection highlight (pulsing for current chapter)
    if (sel) {
      const pulse = isCurrent ? 0.05 + 0.04 * Math.sin(ts * 0.004) : 0.07;
      ctx.fillStyle = `rgba(255,204,68,${pulse})`; ctx.fillRect(w / 2 - 195, y - 18, 390, 48);
      const strokeA = isCurrent ? 0.3 + 0.15 * Math.sin(ts * 0.004) : 0.35;
      ctx.strokeStyle = `rgba(255,204,68,${strokeA})`; ctx.strokeRect(w / 2 - 195, y - 18, 390, 48);
    }
    // Status icon
    const icon = isDone ? '✓' : isLocked ? '🔒' : isCurrent ? '▶' : '○';
    // Chapter title
    ctx.fillStyle = isLocked ? '#332222' : isDone ? '#446644' : sel ? '#ffcc44' : '#664422';
    ctx.font = sel ? 'bold ' + fs(16, ctx.canvas) + "px " + FONT : fs(13, ctx.canvas) + "px " + FONT;
    ctx.fillText(`${icon}  ${ch.title ? ch.title.toUpperCase() : ''}`, w / 2, y);
    // Sub-info: description or legacy subtitle/theme
    ctx.fillStyle = isLocked ? '#221111' : sel ? '#667755' : '#332211';
    ctx.font = fs(11, ctx.canvas) + "px " + FONT;
    let sub = ch.description || '';
    if (!sub && ch.subtitle) sub = ch.theme ? ch.subtitle + '  ·  ' + ch.theme : ch.subtitle;
    ctx.fillText(sub, w / 2, y + 16);
    // Mode/dreamscape hint for selected unlocked chapter
    if (sel && !isLocked) {
      ctx.fillStyle = '#443322'; ctx.font = fs(11, ctx.canvas) + "px " + FONT;
      const hint = [ch.mode, ch.dreamscape].filter(Boolean).join(' · ');
      ctx.fillText(hint, w / 2, y + 30);
    }
  }
  ctx.fillStyle = '#221100'; ctx.font = fs(13, ctx.canvas) + "px " + FONT;
  ctx.fillText('↑↓ navigate  ·  ENTER begin chapter  ·  ESC back', w / 2, h - 18);
  ctx.textAlign = 'left';
}

export function drawMemorySlots(ctx, canvas, slots, selectedSlot) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88';
  ctx.font = fs(32, canvas) + 'px ' + FONT;
  ctx.fillText('CHOOSE CONSCIOUSNESS', canvas.width / 2, canvas.height * 0.12);

  const slotH = canvas.height * 0.22;
  const slotW = canvas.width * 0.55;
  const slotX = (canvas.width - slotW) / 2;
  const startY = canvas.height * 0.20;
  const gap = canvas.height * 0.26;

  slots.forEach((slot, i) => {
    const sy = startY + i * gap;
    const isSelected = i === selectedSlot;

    ctx.strokeStyle = isSelected ? '#00ff88' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(slotX, sy, slotW, slotH);
    ctx.fillStyle = isSelected ? '#001a11' : '#000';
    ctx.fillRect(slotX, sy, slotW, slotH);

    ctx.textAlign = 'left';
    const tx = slotX + slotW * 0.06;

    if (slot.empty) {
      ctx.fillStyle = '#224433';
      ctx.font = fs(18, canvas) + 'px ' + FONT;
      ctx.fillText('SLOT ' + (i + 1) + '  ·  [ EMPTY ]', tx, sy + slotH * 0.45);
      ctx.fillStyle = '#112211';
      ctx.font = fs(14, canvas) + 'px ' + FONT;
      ctx.fillText('Press ENTER to begin here', tx, sy + slotH * 0.72);
    } else {
      ctx.fillStyle = '#00ff88';
      ctx.font = fs(20, canvas) + 'px ' + FONT;
      ctx.fillText('SLOT ' + (i + 1) + '  ·  ' + slot.name, tx, sy + slotH * 0.32);
      ctx.fillStyle = '#00aa66';
      ctx.font = fs(15, canvas) + 'px ' + FONT;
      ctx.fillText(slot.dreamscape + '  ·  ' + slot.emergence, tx, sy + slotH * 0.56);
      ctx.fillStyle = '#336644';
      ctx.font = fs(13, canvas) + 'px ' + FONT;
      ctx.fillText('Score: ' + slot.score + '  ·  Saved: ' + slot.savedAt, tx, sy + slotH * 0.78);
    }
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#224433';
  ctx.font = fs(13, canvas) + 'px ' + FONT;
  ctx.fillText('↑↓ to select  ·  ENTER to load  ·  DEL to erase  ·  ESC to go back',
    canvas.width / 2, canvas.height * 0.94);
}
