'use strict';
// ============================================================
//  GLITCH·PEACE — lakeHub.js
//  Lake Realm hub — diegetic main menu (Canvas 2D).
//
//  Hub layout (from REALM_SPECS.md lines 119-129):
//
//           [Moonlit Dock]
//                |
//  [Portal Stones] -- [Mirror Lake] -- [Lily Ring]
//                |
//             [Lodge]
//       /        |         \
//  [Herb Bench] [Dream Log] [Godform Altar]
//
//  This module renders the Lake Realm and handles click/hover
//  on interactable zones. External callers register callbacks
//  for zone interactions.
// ============================================================

import { bus } from '../core/event-bus.js';
import { EVENTS } from '../core/events.js';
import { runSpecManager } from '../core/runSpecManager.js';

// ── Zone definitions ──────────────────────────────────────────
// Each zone is positioned as a fraction of canvas (0-1 range)
// and will be scaled to actual canvas dimensions at draw time.

const ZONES = [
  {
    id: 'moonlit_dock',
    label: 'Moonlit Dock',
    icon: '🌙',
    x: 0.50, y: 0.08,
    w: 0.16, h: 0.08,
    description: 'View the current moon phase',
  },
  {
    id: 'portal_stones',
    label: 'Portal Stones',
    icon: '🪨',
    x: 0.20, y: 0.28,
    w: 0.18, h: 0.10,
    description: 'Travel to another realm',
  },
  {
    id: 'mirror_lake',
    label: 'Mirror Lake',
    icon: '💧',
    x: 0.50, y: 0.28,
    w: 0.16, h: 0.10,
    description: 'Reflect and view run status',
  },
  {
    id: 'lily_ring',
    label: 'Lily Ring',
    icon: '🌸',
    x: 0.78, y: 0.28,
    w: 0.16, h: 0.10,
    description: 'Upgrades and currency',
  },
  {
    id: 'lodge',
    label: 'Lodge',
    icon: '🏠',
    x: 0.50, y: 0.50,
    w: 0.14, h: 0.08,
    description: 'Rest and settings',
  },
  {
    id: 'herb_bench',
    label: 'Herb Bench',
    icon: '🌿',
    x: 0.22, y: 0.68,
    w: 0.16, h: 0.08,
    description: 'Crafting and alchemy',
  },
  {
    id: 'dream_log',
    label: 'Dream Log',
    icon: '📖',
    x: 0.50, y: 0.68,
    w: 0.14, h: 0.08,
    description: 'Journal and run history',
  },
  {
    id: 'godform_altar',
    label: 'Godform Altar',
    icon: '⚗️',
    x: 0.78, y: 0.68,
    w: 0.16, h: 0.08,
    description: 'Equip godforms for your run',
  },
];

// ── State ─────────────────────────────────────────────────────
let hoveredZone = null;
let callbacks = {};  // zoneId → fn
let _currency = 0;   // displayed Insight count

// ── Colors / theme ────────────────────────────────────────────
const LAKE_BG         = '#050a18';
const LAKE_WATER      = '#0a1a3a';
const ZONE_BG         = 'rgba(10, 30, 60, 0.7)';
const ZONE_BORDER     = '#1a4a7a';
const ZONE_HOVER_BG   = 'rgba(20, 60, 100, 0.85)';
const ZONE_HOVER_BORDER = '#4af';
const TEXT_PRIMARY     = '#c0d8f0';
const TEXT_SECONDARY   = '#6a8ab0';
const TEXT_ACCENT      = '#00ff88';
const TITLE_COLOR      = '#e0f0ff';

// ── Rendering ─────────────────────────────────────────────────

function drawBackground(ctx, w, h, ts) {
  // Dark lake background with gentle gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#080e20');
  grad.addColorStop(0.4, LAKE_BG);
  grad.addColorStop(0.7, LAKE_WATER);
  grad.addColorStop(1, '#020810');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle stars
  ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 137.5) % w);
    const sy = ((i * 97.3 + Math.sin(ts / 3000 + i) * 2) % (h * 0.4));
    const sr = 0.5 + (i % 3) * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Water shimmer line
  const waterY = h * 0.35;
  ctx.strokeStyle = `rgba(100, 180, 255, ${0.15 + 0.05 * Math.sin(ts / 1500)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x += 4) {
    ctx.lineTo(x, waterY + Math.sin(x / 40 + ts / 1000) * 3);
  }
  ctx.stroke();
}

function drawConnections(ctx, w, h) {
  ctx.strokeStyle = 'rgba(100, 160, 220, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);

  // Dock → Mirror Lake
  drawLine(ctx, w, h, 0.50, 0.16, 0.50, 0.28);
  // Portal Stones → Mirror Lake
  drawLine(ctx, w, h, 0.38, 0.33, 0.42, 0.33);
  // Mirror Lake → Lily Ring
  drawLine(ctx, w, h, 0.66, 0.33, 0.70, 0.33);
  // Mirror Lake → Lodge
  drawLine(ctx, w, h, 0.50, 0.38, 0.50, 0.50);
  // Lodge → sub-zones
  drawLine(ctx, w, h, 0.43, 0.58, 0.30, 0.68);
  drawLine(ctx, w, h, 0.50, 0.58, 0.50, 0.68);
  drawLine(ctx, w, h, 0.57, 0.58, 0.70, 0.68);

  ctx.setLineDash([]);
}

function drawLine(ctx, w, h, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1 * w, y1 * h);
  ctx.lineTo(x2 * w, y2 * h);
  ctx.stroke();
}

function drawZone(ctx, zone, w, h, isHovered, ts) {
  const px = zone.x * w - (zone.w * w) / 2;
  const py = zone.y * h - (zone.h * h) / 2;
  const pw = zone.w * w;
  const ph = zone.h * h;
  const r = 6;

  // Background
  ctx.fillStyle = isHovered ? ZONE_HOVER_BG : ZONE_BG;
  ctx.strokeStyle = isHovered ? ZONE_HOVER_BORDER : ZONE_BORDER;
  ctx.lineWidth = isHovered ? 2 : 1;

  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, r);
  ctx.fill();
  ctx.stroke();

  // Glow on hover
  if (isHovered) {
    ctx.shadowColor = '#4af';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Icon
  const iconSize = Math.min(pw, ph) * 0.35;
  ctx.font = `${iconSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(zone.icon, px + pw / 2, py + ph * 0.35);

  // Label
  const labelSize = Math.max(10, Math.min(14, pw * 0.09));
  ctx.font = `${labelSize}px 'Share Tech Mono', monospace`;
  ctx.fillStyle = isHovered ? TEXT_ACCENT : TEXT_PRIMARY;
  ctx.fillText(zone.label, px + pw / 2, py + ph * 0.72);

  // Tooltip on hover
  if (isHovered && zone.description) {
    const tipY = py + ph + 14;
    ctx.font = `${Math.max(9, labelSize - 2)}px 'Share Tech Mono', monospace`;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(zone.description, px + pw / 2, tipY);
  }
}

function drawHeader(ctx, w, h) {
  const spec = runSpecManager.peek();

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = "18px 'Share Tech Mono', monospace";
  ctx.fillStyle = TITLE_COLOR;
  ctx.fillText('Lake & Lodge', w / 2, 12);

  // Phase + realm info
  ctx.font = "12px 'Share Tech Mono', monospace";
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.fillText(spec.moonPhase, w / 2, 34);

  // Currency
  ctx.textAlign = 'right';
  ctx.fillStyle = TEXT_ACCENT;
  ctx.fillText(`✦ ${_currency} Insight`, w - 16, 14);
}

function drawDebugOverlay(ctx, w, h) {
  const spec = runSpecManager.peek();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = "9px 'Share Tech Mono', monospace";
  ctx.fillStyle = 'rgba(100,160,200,0.4)';
  const lines = [
    `realm: ${spec.realmId}`,
    `phase: ${spec.moonPhase}`,
    `godforms: [${spec.godforms.join(', ')}]`,
    `archetype: ${spec.archetype}`,
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, 8, h - 50 + i * 12);
  });
}

// ── Public API ────────────────────────────────────────────────

export const lakeHub = {
  /**
   * Register a callback for when a zone is clicked.
   * @param {string} zoneId — one of ZONES[].id
   * @param {Function} fn
   */
  onZoneClick(zoneId, fn) {
    callbacks[zoneId] = fn;
  },

  /**
   * Set the displayed currency count.
   */
  setCurrency(n) {
    _currency = n;
  },

  /**
   * Main draw call — render the entire Lake hub scene.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w — canvas width
   * @param {number} h — canvas height
   * @param {number} ts — timestamp (ms)
   */
  draw(ctx, w, h, ts) {
    drawBackground(ctx, w, h, ts);
    drawConnections(ctx, w, h);

    for (const zone of ZONES) {
      drawZone(ctx, zone, w, h, hoveredZone === zone.id, ts);
    }

    drawHeader(ctx, w, h);
    drawDebugOverlay(ctx, w, h);
  },

  /**
   * Handle mouse move — update hover state.
   * @param {number} mx — mouse x (canvas coords)
   * @param {number} my — mouse y (canvas coords)
   * @param {number} w — canvas width
   * @param {number} h — canvas height
   */
  handleMouseMove(mx, my, w, h) {
    hoveredZone = null;
    for (const zone of ZONES) {
      const px = zone.x * w - (zone.w * w) / 2;
      const py = zone.y * h - (zone.h * h) / 2;
      const pw = zone.w * w;
      const ph = zone.h * h;
      if (mx >= px && mx <= px + pw && my >= py && my <= py + ph) {
        hoveredZone = zone.id;
        break;
      }
    }
    return hoveredZone;
  },

  /**
   * Handle click — fire zone callback if hit.
   * @param {number} mx — mouse x
   * @param {number} my — mouse y
   * @param {number} w — canvas width
   * @param {number} h — canvas height
   * @returns {string|null} — clicked zone id, or null
   */
  handleClick(mx, my, w, h) {
    this.handleMouseMove(mx, my, w, h);
    if (hoveredZone && callbacks[hoveredZone]) {
      callbacks[hoveredZone]();
    }
    return hoveredZone;
  },

  /**
   * Get all zone definitions (for external UI/testing).
   */
  getZones() {
    return ZONES;
  },

  /**
   * Reset hover state.
   */
  resetHover() {
    hoveredZone = null;
  },
};
