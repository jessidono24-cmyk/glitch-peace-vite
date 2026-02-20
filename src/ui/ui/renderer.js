import { T, TILE_DEF, ARCHETYPES, CELL, GAP, PAL_A, PAL_B, PAL_HC } from '../core/constants.js';
import { CFG, UPG } from '../core/state.js';
import { spritePlayer } from '../rendering/sprite-player.js';
import { drawBoss3D } from '../rendering/boss-renderer-3d.js';
import { getVoidNexus3D } from '../rendering/void-nexus-3d.js';

// ── Message rendering thresholds ──────────────────────────────────────
const MSG_LEN_LONG    = 55;  // chars — triggers word-wrap + small font
const MSG_LEN_MEDIUM  = 35;  // chars — uses medium font
const MSG_FONT_SMALL  = '9';
const MSG_FONT_MEDIUM = '12';
const MSG_FONT_LARGE  = '16';

export function PAL(matrixActive) {
  if (CFG.highContrast) return PAL_HC;
  return matrixActive === 'A' ? PAL_A : PAL_B;
}

export function drawGame(ctx, ts, game, matrixActive, backgroundStars, visions, hallucinations, anomalyActive, anomalyData, glitchFrames, DPR, ghostPath) {
  const g = game; if (!g) return;
  const sz = g.sz;
  const gp = sz * CELL + (sz - 1) * GAP;
  const w = gp + 48, h = gp + 148;
  const P = PAL(matrixActive);
  const ds = g.ds;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = ds.bgColor; ctx.fillRect(0, 0, w, h);
  const bg2 = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.8);
  bg2.addColorStop(0, ds.bgAccent + '33'); bg2.addColorStop(1, 'transparent');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, w, h);
  if (matrixActive === 'A') { ctx.fillStyle = 'rgba(80,0,20,0.07)'; ctx.fillRect(0, 0, w, h); }

  // ── Emotion-reactive realm tinting (from EmotionalField) ─────────────
  const efData = window._emotionField;
  if (efData && efData.realm) {
    const realmTints = {
      Hell:        'rgba(120,20,0,0.09)',
      Purgatory:   'rgba(90,40,0,0.07)',
      Imagination: 'rgba(60,0,80,0.06)',
      Heaven:      'rgba(0,60,40,0.06)',
      Mind:        null,
    };
    const tint = realmTints[efData.realm];
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h); }
    // Distortion causes subtle chromatic aberration (scanlines shift)
    if (efData.distortion > 0.5) {
      const dAlpha = (efData.distortion - 0.5) * 0.12;
      ctx.fillStyle = `rgba(255,0,60,${dAlpha})`; ctx.fillRect(0, 0, 2, h);
      ctx.fillStyle = `rgba(0,255,136,${dAlpha})`; ctx.fillRect(w - 2, 0, 2, h);
    }
  }

  // Scanlines
  for (let y = 0; y < h; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, y, w, 1); }

  // Stars
  for (const s of backgroundStars) {
    const a = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase));
    ctx.globalAlpha = a; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Glitch
  if (glitchFrames > 0 && !CFG.reducedMotion) {
    ctx.fillStyle = `rgba(${matrixActive === 'A' ? '180,0,60' : '0,180,60'},0.04)`;
    ctx.fillRect(0, Math.floor(Math.random() * h), w, 2 + Math.floor(Math.random() * 4));
  }

  // Shake — disabled when reducedMotion is on
  let ox = 0, oy = 0;
  if (g.shakeFrames > 0) {
    if (!CFG.reducedMotion) {
      ox = (Math.random() - 0.5) * 9 * (g.shakeFrames / 10);
      oy = (Math.random() - 0.5) * 9 * (g.shakeFrames / 10);
    }
    g.shakeFrames--;
  }
  const sx = (w - gp) / 2 + ox, sy = 124 + oy;

  // Vision words
  for (const v of visions) {
    v.x += v.dx; v.y += v.dy; v.life--;
    if (v.life > v.maxLife * 0.85) v.alpha = Math.min(v.targetAlpha, (v.maxLife - v.life) / (v.maxLife * 0.15) * v.targetAlpha);
    else if (v.life < v.maxLife * 0.15) v.alpha = Math.max(0, (v.life / (v.maxLife * 0.15)) * v.targetAlpha);
    if (v.life <= 0) { v.life = 200 + Math.floor(Math.random() * 400); v.maxLife = 600; }
    ctx.globalAlpha = v.alpha * (matrixActive === 'A' ? 0.7 : 1);
    ctx.fillStyle = matrixActive === 'A' ? '#ff4488' : '#00aa55';
    ctx.font = '9px Courier New'; ctx.textAlign = 'center'; ctx.fillText(v.text, v.x, v.y);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';

  // Grid
  // Build tileFlicker lookup Map for O(1) per-tile query (was O(n) array.find)
  const flickerMap = new Map(g.tileFlicker.map(f => [f.y * sz + f.x, f]));

  // 3D-B: isometric view — when CFG.viewMode === 'iso' use parallelogram tiles
  const ISO = CFG.viewMode === 'iso';
  // Isometric coordinate helpers
  const TW = CELL + GAP;   // tile pitch
  const isoTileW = TW;     // iso face width
  const isoTileH = TW / 2; // iso face height (half-diamond)
  // Origin for iso grid centred in canvas
  const isoOriginX = w / 2;
  const isoOriginY = sy + (sz * isoTileH) / 2;
  function isoXY(col, row) {
    return {
      x: isoOriginX + (col - row) * (isoTileW / 2),
      y: isoOriginY + (col + row) * (isoTileH / 2),
    };
  }
  // Isometric tile depth-sort: render higher row+col first (painter's algo)
  const isoOrder = [];
  if (ISO) {
    for (let y2 = 0; y2 < sz; y2++)
      for (let x2 = 0; x2 < sz; x2++)
        isoOrder.push([y2, x2]);
    isoOrder.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  }

  // 3D-B: Isometric tile loop (only runs when ISO mode is active)
  if (ISO) for (let li = 0; li < sz * sz; li++) {
    const [y, x] = isoOrder[li];
    const raw = g.grid[y][x];
    const fl  = flickerMap.get(y * sz + x);
    const val = (fl && fl.reveal && raw === T.HIDDEN) ? T.INSIGHT : raw;
    const td  = TILE_DEF[val] || TILE_DEF[T.VOID];
    const tp  = P[val] || P[T.VOID];
    const { x: ipx, y: ipy } = isoXY(x, y);
    const hw = isoTileW / 2, hh = isoTileH / 2;

    ctx.shadowColor = tp.glow || 'transparent';
    ctx.shadowBlur  = tp.glow ? 8 : 0;

    // Top face (diamond)
    ctx.fillStyle = tp.bg;
    ctx.beginPath();
    ctx.moveTo(ipx,       ipy - hh);
    ctx.lineTo(ipx + hw,  ipy);
    ctx.lineTo(ipx,       ipy + hh);
    ctx.lineTo(ipx - hw,  ipy);
    ctx.closePath(); ctx.fill();

    // Left face (vertical depth illusion)
    const faceH = isoTileH * 0.55;
    const darker = tp.bg + 'cc';
    ctx.fillStyle = darker;
    ctx.beginPath();
    ctx.moveTo(ipx - hw, ipy);
    ctx.lineTo(ipx,      ipy + hh);
    ctx.lineTo(ipx,      ipy + hh + faceH);
    ctx.lineTo(ipx - hw, ipy + faceH);
    ctx.closePath(); ctx.fill();

    // Right face
    const darkerR = tp.bg + '88';
    ctx.fillStyle = darkerR;
    ctx.beginPath();
    ctx.moveTo(ipx,      ipy + hh);
    ctx.lineTo(ipx + hw, ipy);
    ctx.lineTo(ipx + hw, ipy + faceH);
    ctx.lineTo(ipx,      ipy + hh + faceH);
    ctx.closePath(); ctx.fill();

    // Border on top face
    ctx.strokeStyle = tp.bd; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(ipx, ipy - hh); ctx.lineTo(ipx + hw, ipy);
    ctx.lineTo(ipx, ipy + hh); ctx.lineTo(ipx - hw, ipy);
    ctx.closePath(); ctx.stroke();
    ctx.shadowBlur = 0;

    // Tile symbol (icon) centered on top face
    if (td.sym && val !== T.VOID && val !== T.WALL && val !== T.HIDDEN) {
      ctx.fillStyle = tp.bd; ctx.font = '9px Courier New'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.7;
      ctx.fillText(td.sym, ipx, ipy + 4);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';
    }

    // Player on iso grid
    if (g.player.y === y && g.player.x === x) {
      const { x: ppx, y: ppy } = isoXY(x, y);
      ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#005533';
      ctx.beginPath();
      ctx.moveTo(ppx,       ppy - hh - 4);
      ctx.lineTo(ppx + hw * 0.7, ppy - 2);
      ctx.lineTo(ppx,       ppy + hh * 0.5);
      ctx.lineTo(ppx - hw * 0.7, ppy - 2);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Flat grid (default view)
  if (!ISO)
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const raw = g.grid[y][x];
      const fl  = flickerMap.get(y * sz + x);
      const val = (fl && fl.reveal && raw === T.HIDDEN) ? T.INSIGHT : raw;
      const td  = TILE_DEF[val] || TILE_DEF[T.VOID];
      const tp  = P[val] || P[T.VOID];
      const px  = sx + x * (CELL + GAP), py = sy + y * (CELL + GAP);

      if (anomalyActive && (y === anomalyData.row || x === anomalyData.col)) { ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 10; }
      else if (tp.glow) { ctx.shadowColor = tp.glow; ctx.shadowBlur = 12; }
      else ctx.shadowBlur = 0;

      ctx.fillStyle = tp.bg; ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 4); ctx.fill();
      ctx.strokeStyle = tp.bd; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1, 4); ctx.stroke();
      ctx.shadowBlur = 0;

      // Special tile renders
      if (val === T.PEACE) {
        const s2 = (ts * 0.05 + y * 6 + x * 4) % (CELL * 2);
        if (s2 < CELL) {
          const gr = ctx.createLinearGradient(px, py + s2 - 5, px, py + s2 + 5);
          gr.addColorStop(0, 'rgba(0,255,140,0)'); gr.addColorStop(0.5, 'rgba(0,255,140,0.45)'); gr.addColorStop(1, 'rgba(0,255,140,0)');
          ctx.fillStyle = gr; ctx.fillRect(px, py, CELL, CELL);
        }
        ctx.shadowColor = '#00ffaa'; ctx.shadowBlur = 10; ctx.fillStyle = '#00ffaa';
        ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, 5 + 2 * Math.sin(ts * 0.006 + x + y), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (val === T.INSIGHT) {
        ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 14;
        const angle = ts * 0.008 + x * 1.7 + y * 1.3;
        for (let i = 0; i < 4; i++) {
          const a = angle + i * Math.PI * 0.5, r = 7 + 2 * Math.sin(ts * 0.005 + i);
          ctx.fillStyle = i % 2 === 0 ? '#00eeff' : '#00aacc';
          ctx.beginPath(); ctx.arc(px + CELL / 2 + Math.cos(a) * r, py + CELL / 2 + Math.sin(a) * r, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
      if (val === T.ARCHETYPE) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.01 + x + y);
        ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 16 * pulse;
        ctx.fillStyle = `rgba(255,220,0,${0.15 * pulse})`; ctx.fillRect(px, py, CELL, CELL);
        ctx.font = '18px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffee44'; ctx.fillText('☆', px + CELL / 2, py + CELL / 2 + 6);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
      }
      if (val === T.TELEPORT) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.012 + x * 2 + y);
        ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = `rgba(0,170,255,${0.2 * pulse})`; ctx.fillRect(px, py, CELL, CELL);
        ctx.font = '14px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#00ccff'; ctx.fillText('⇒', px + CELL / 2, py + CELL / 2 + 5);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
      }
      if (val === T.MEMORY) {
        const pulse = 0.3 + 0.3 * Math.sin(ts * 0.004 + x + y);
        ctx.globalAlpha = 0.4 + 0.2 * pulse;
        ctx.fillStyle = 'rgba(100,200,150,0.15)'; ctx.fillRect(px, py, CELL, CELL);
        ctx.globalAlpha = 1;
      }
      // ── Phase 2.6: Somatic tile renders ──────────────────────────────────
      if (val === T.BODY_SCAN) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.004 + x * 1.1 + y * 0.9);
        ctx.shadowColor = '#00aa44'; ctx.shadowBlur = 12 * pulse;
        for (let ring = 0; ring < 3; ring++) {
          const r = (5 + ring * 6) + 2 * Math.sin(ts * 0.003 + ring * 1.2);
          ctx.globalAlpha = (0.65 - ring * 0.15) * pulse;
          ctx.strokeStyle = ring === 0 ? '#00ff88' : ring === 1 ? '#00cc66' : '#008844';
          ctx.lineWidth = 1.5 - ring * 0.3;
          ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, r, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (val === T.BREATH_SYNC) {
        const phase_ = (ts * 0.0025) % (Math.PI * 2);
        ctx.shadowColor = '#6688ff'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#6688ff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.85;
        ctx.beginPath();
        const waveW = CELL - 8;
        for (let i = 0; i <= waveW; i++) {
          const wx = px + 4 + i;
          const wy = py + CELL / 2 + Math.sin(phase_ + i * 0.38) * 5.5;
          if (i === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (val === T.ENERGY_NODE) {
        ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 16;
        const ang = ts * 0.01 + x * 1.9 + y * 1.5;
        for (let i = 0; i < 6; i++) {
          const a = ang + i * Math.PI / 3, r = 8 + 3 * Math.sin(ts * 0.007 + i);
          ctx.fillStyle = i % 2 === 0 ? '#cc44ff' : '#8800dd';
          ctx.beginPath(); ctx.arc(px + CELL / 2 + Math.cos(a) * r, py + CELL / 2 + Math.sin(a) * r, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
      if (val === T.GROUNDING) {
        const pulse2 = 0.5 + 0.5 * Math.sin(ts * 0.003 + x + y);
        ctx.shadowColor = '#886644'; ctx.shadowBlur = 9 * pulse2;
        ctx.globalAlpha = 0.7 + 0.2 * pulse2;
        ctx.strokeStyle = '#aa8855'; ctx.lineWidth = 2;
        const cxg = px + CELL / 2, cyg = py + CELL / 2;
        ctx.beginPath(); ctx.moveTo(cxg, cyg - 9); ctx.lineTo(cxg, cyg + 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cxg - 9, cyg); ctx.lineTo(cxg + 9, cyg); ctx.stroke();
        ctx.beginPath(); ctx.arc(cxg, cyg, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (td.sym && val !== T.VOID && val !== T.WALL && val !== T.PEACE && val !== T.INSIGHT &&
          val !== T.ARCHETYPE && val !== T.TELEPORT && val !== T.HIDDEN && val !== T.MEMORY &&
          val !== T.BODY_SCAN && val !== T.BREATH_SYNC && val !== T.ENERGY_NODE && val !== T.GROUNDING) {
        ctx.fillStyle = tp.bd; ctx.font = '12px Courier New'; ctx.textAlign = 'center';
        ctx.globalAlpha = 0.55; ctx.fillText(td.sym, px + CELL / 2, py + CELL / 2 + 5);
        ctx.globalAlpha = 1; ctx.textAlign = 'left';
      }
      if ((val === T.PEACE || val === T.INSIGHT) && UPG.magnet) {
        const md = Math.abs(y - g.player.y) + Math.abs(x - g.player.x);
        if (md <= 2) {
          ctx.strokeStyle = 'rgba(0,255,180,0.28)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(px + 2, py + 2, CELL - 4, CELL - 4, 4); ctx.stroke();
        }
      }
    }
  }
  g.tileFlicker = g.tileFlicker.filter(f => { f.t--; return f.t > 0; });

  // 3D-E: Void Nexus Three.js full-scene composite (replaces 2D grid render)
  if (CFG.viewMode === 'iso' && ds && ds.id === 'void_nexus') {
    try {
      const vn = getVoidNexus3D(w, h);
      vn.syncGrid(g.grid, sz);
      vn.syncPlayer(g.player.y, g.player.x, sz);
      vn.animate(ts);
      vn.composite(ctx, 0, 0);
    } catch (_e) { /* fallback to 2D grid if WebGL unavailable */ }
  }

  // ── Fog of War — visibility radius around player ──────────────────────
  // Insight tiles expand radius; Matrix A shrinks it; normal play = 4 tiles
  if (g.playModeId !== 'skymap' && g.playModeId !== 'meditation') {
    const fogEnabled = CFG.difficulty !== 'easy';  // no fog on easy
    if (fogEnabled) {
      const FOG_RADIUS = (window._fogRadius || 4) + (UPG.aura ? 1 : 0);
      const FOG_SOFT   = 1.5; // tiles of soft fade beyond hard edge
      const py_ = g.player.y, px_ = g.player.x;
      // Draw a fog overlay tile-by-tile using canvas compositing
      // We draw a full black rect then cut a radial "torch" hole using destination-out
      ctx.save();
      // Create a temporary canvas for the fog mask
      const fogCanvas = document.createElement('canvas');
      fogCanvas.width  = ctx.canvas.width;
      fogCanvas.height = ctx.canvas.height;
      const fc = fogCanvas.getContext('2d');
      // Scale for DPR FIRST so all subsequent fog drawing uses logical coordinates
      const dpr = DPR || 1;
      fc.scale(dpr, dpr);
      // Fill fog over the entire logical canvas
      fc.fillStyle = 'rgba(4,4,14,0.94)';
      fc.fillRect(0, 0, fogCanvas.width / dpr, fogCanvas.height / dpr);
      fc.globalCompositeOperation = 'destination-out';
      // Player position in logical canvas coords
      const pcx = sx + px_ * (CELL + GAP) + CELL / 2;
      const pcy = sy + py_ * (CELL + GAP) + CELL / 2;
      const fogPxRadius = (FOG_RADIUS + FOG_SOFT) * (CELL + GAP);
      const grd = fc.createRadialGradient(pcx, pcy, 0, pcx, pcy, fogPxRadius);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(FOG_RADIUS / (FOG_RADIUS + FOG_SOFT), 'rgba(0,0,0,1)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      fc.fillStyle = grd;
      fc.beginPath(); fc.arc(pcx, pcy, fogPxRadius, 0, Math.PI * 2); fc.fill();
      // Also reveal tiles near insight/archetype/peace positions (they beacon through fog)
      for (let fy = 0; fy < sz; fy++) {
        for (let fx = 0; fx < sz; fx++) {
          if (g.grid[fy][fx] === T.INSIGHT || g.grid[fy][fx] === T.ARCHETYPE || g.grid[fy][fx] === T.PEACE) {
            const tcx = sx + fx * (CELL + GAP) + CELL / 2;
            const tcy = sy + fy * (CELL + GAP) + CELL / 2;
            const tGrd = fc.createRadialGradient(tcx, tcy, 0, tcx, tcy, (CELL + GAP) * 1.2);
            tGrd.addColorStop(0, 'rgba(0,0,0,0.5)');
            tGrd.addColorStop(1, 'rgba(0,0,0,0)');
            fc.fillStyle = tGrd;
            fc.beginPath(); fc.arc(tcx, tcy, (CELL + GAP) * 1.2, 0, Math.PI * 2); fc.fill();
          }
        }
      }
      // Composite fog onto main canvas
      ctx.drawImage(fogCanvas, 0, 0);
      ctx.restore();
    }
  }


  if (g.playModeId === 'skymap' || g.playModeId === 'ritual_space') {
    // Collect all INSIGHT (6) and ARCHETYPE (11) positions
    const starTiles = [];
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        if (g.grid[y][x] === T.INSIGHT || g.grid[y][x] === T.ARCHETYPE) {
          starTiles.push({ y, x, t: g.grid[y][x] });
        }
      }
    }
    // Draw constellation lines between stars within 4 tiles (Manhattan distance)
    const CONST_MAX_DIST  = 4;    // max tile distance to draw a line
    const CONST_ALPHA_BASE = 0.18; // base line opacity
    const CONST_ALPHA_PULSE = 0.10; // oscillation amplitude
    const CONST_PULSE_SPEED = 0.002; // angular speed of pulse animation
    ctx.save();
    for (let i = 0; i < starTiles.length; i++) {
      for (let j = i + 1; j < starTiles.length; j++) {
        const a = starTiles[i], b = starTiles[j];
        const dist = Math.abs(a.y - b.y) + Math.abs(a.x - b.x);
        if (dist <= CONST_MAX_DIST) {
          const ax = sx + a.x * (CELL + GAP) + CELL / 2;
          const ay = sy + a.y * (CELL + GAP) + CELL / 2;
          const bx = sx + b.x * (CELL + GAP) + CELL / 2;
          const by = sy + b.y * (CELL + GAP) + CELL / 2;
          // Closer stars = brighter line; archetype connections = gold
          const lineAlpha = (CONST_ALPHA_BASE + CONST_ALPHA_PULSE * Math.sin(ts * CONST_PULSE_SPEED + i + j)) * (1 - dist / (CONST_MAX_DIST + 1));
          const lineColor = (a.t === T.ARCHETYPE || b.t === T.ARCHETYPE) ? '#ffdd88' : '#00eeff';
          ctx.globalAlpha = lineAlpha;
          ctx.strokeStyle = lineColor;
          ctx.shadowColor = lineColor;
          ctx.shadowBlur  = 6;
          ctx.lineWidth   = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    // Gentle star glow pulse on each star tile in skymap
    for (const s of starTiles) {
      const px2 = sx + s.x * (CELL + GAP) + CELL / 2;
      const py2 = sy + s.y * (CELL + GAP) + CELL / 2;
      const pulse2 = 0.3 + 0.2 * Math.sin(ts * 0.004 + s.x * 1.7 + s.y * 1.3);
      ctx.globalAlpha = pulse2;
      ctx.shadowColor = s.t === T.ARCHETYPE ? '#ffdd88' : '#00eeff';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = s.t === T.ARCHETYPE ? '#ffdd88' : '#00eeff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px2, py2, CELL * 0.44, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.restore();
  }

  // Consequence preview ghost path
  if (ghostPath && ghostPath.length > 0) {
    ghostPath.forEach((step, i) => {
      const gpx = sx + step.x * (CELL + GAP), gpy = sy + step.y * (CELL + GAP);
      const alpha = 0.22 - i * 0.05;
      const col = step.hpDelta > 0 ? '#00ffaa' : step.hpDelta < 0 ? '#ff3333' : '#aaaaff';
      ctx.globalAlpha = Math.max(0.05, alpha);
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(gpx + 2, gpy + 2, CELL - 4, CELL - 4, 3); ctx.stroke();
      if (step.hpDelta !== 0) {
        ctx.fillStyle = col; ctx.font = '9px Courier New'; ctx.textAlign = 'center'; ctx.globalAlpha = Math.max(0.1, alpha + 0.1);
        ctx.fillText((step.hpDelta > 0 ? '+' : '') + Math.round(step.hpDelta), gpx + CELL / 2, gpy + CELL / 2 + 4);
        ctx.textAlign = 'left';
      }
    });
    ctx.globalAlpha = 1;
  }

  // Capture zones
  for (const cz of g.captureZones) {
    ctx.strokeStyle = `rgba(255,0,68,${0.4 * (cz.timer / 300)})`; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(sx + cz.x * (CELL + GAP) + CELL / 2, sy + cz.y * (CELL + GAP) + CELL / 2, (cz.r + 0.5) * (CELL + GAP), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Containment zones (C-key: player-placed, stun enemies inside)
  if (g.contZones) {
    const CONT_ZONE_MAX_ALPHA = 0.6;
    for (const cz of g.contZones) {
      const czAlpha = Math.min(1, cz.timer / cz.maxTimer) * CONT_ZONE_MAX_ALPHA;
      const czR = 3.5 * (CELL + GAP);
      const czX = sx + cz.x * (CELL + GAP) + CELL / 2;
      const czY = sy + cz.y * (CELL + GAP) + CELL / 2;
      ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(0,255,200,${czAlpha})`; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(czX, czY, czR, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(0,255,200,${czAlpha * 0.07})`; ctx.beginPath(); ctx.arc(czX, czY, czR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Label
      ctx.fillStyle = `rgba(0,200,160,${czAlpha})`; ctx.font = '7px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('CONTAIN', czX, czY - czR - 4);
      ctx.textAlign = 'left';
    }
  }

  // Echoes
  for (const e of g.echos) {
    ctx.globalAlpha = e.life / e.maxLife * 0.55; ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.arc(sx + e.x, sy + e.y, e.size * (e.life / e.maxLife), 0, Math.PI * 2); ctx.fill();
    e.life--;
  }
  g.echos = g.echos.filter(e => e.life > 0); ctx.globalAlpha = 1;

  // Trail
  if (CFG.particles) {
    for (const t of g.trail) {
      ctx.globalAlpha = (t.life / t.maxLife) * 0.48; ctx.fillStyle = t.color;
      ctx.shadowColor = t.color; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(sx + t.x, sy + t.y, 4 * (t.life / t.maxLife), 0, Math.PI * 2); ctx.fill();
      t.life--;
    }
    g.trail = g.trail.filter(t => t.life > 0); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Hallucinations
  for (const h of hallucinations) {
    if (h.life <= 0) continue;
    const px = sx + h.x * (CELL + GAP), py = sy + h.y * (CELL + GAP);
    const fade = 0.3 + 0.25 * Math.sin(Date.now() * 0.006 + h.x);
    ctx.globalAlpha = fade; ctx.fillStyle = '#220044'; ctx.shadowColor = '#8800ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.roundRect(px + 8, py + 8, CELL - 16, CELL - 16, 4); ctx.fill();
    ctx.fillStyle = 'rgba(170,0,255,0.6)'; ctx.font = '16px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('?', px + CELL / 2, py + CELL / 2 + 5);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  // Enemies
  for (const e of g.enemies) {
    const px = sx + e.x * (CELL + GAP), py = sy + e.y * (CELL + GAP);
    const pulse = 0.6 + 0.4 * Math.sin(ts * 0.007 + e.x * 1.3);
    const stunned = e.stunTimer > 0, isRush = e.type === 'rush';
    const eGlow = stunned ? '#8888ff' : isRush ? '#ff0066' : (matrixActive === 'A' ? '#ff0044' : '#ff4400');
    ctx.shadowColor = eGlow; ctx.shadowBlur = 14 * pulse;
    ctx.fillStyle = stunned ? '#1c1c44' : isRush ? '#4a0022' : (matrixActive === 'A' ? '#660022' : '#aa2200');
    ctx.beginPath(); ctx.roundRect(px + 5, py + 5, CELL - 10, CELL - 10, 6); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = stunned ? '#4444aa' : isRush ? '#ff0066' : (matrixActive === 'A' ? '#ff2266' : '#ff6622');
    ctx.beginPath(); ctx.moveTo(px + CELL / 2, py + 12); ctx.lineTo(px + CELL - 12, py + CELL - 12); ctx.lineTo(px + 12, py + CELL - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = stunned ? '#6666cc' : '#ffcc00';
    ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2 + 2, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Boss — multi-phase render
  if (g.boss && g.boss.hp > 0) {
    const b = g.boss;
    const bx = sx + b.x * (CELL + GAP), by = sy + b.y * (CELL + GAP);
    const pulse = 0.5 + 0.5 * Math.sin(ts * 0.005);
    const bColor = b.color || '#ff00aa', bGlow = b.glow || '#ff00aa';
    const bPhase = b.phaseIdx || 0;
    ctx.shadowColor = bGlow; ctx.shadowBlur = 36 * pulse;
    // Background cell — phase-tinted
    const bgColors = ['#330022', '#220033', '#0d0d0d'];
    ctx.fillStyle = bgColors[bPhase] || '#330022';
    ctx.beginPath(); ctx.roundRect(bx + 1, by + 1, CELL - 2, CELL - 2, 8); ctx.fill();
    // Core orb
    ctx.fillStyle = bColor;
    ctx.beginPath();
    ctx.arc(bx + CELL / 2, by + CELL / 2, (CELL * 0.28 + 4 * pulse) * (1 + bPhase * 0.1), 0, Math.PI * 2);
    ctx.fill();
    // Phase 2+: orbital ring
    if (bPhase >= 1) {
      ctx.strokeStyle = bColor + 'aa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx + CELL / 2, by + CELL / 2, CELL * 0.44 + 2 * pulse, 0, Math.PI * 2); ctx.stroke();
    }
    // Phase 3: orbiting sparkles
    if (bPhase >= 2) {
      const ang = ts * 0.015;
      for (let i = 0; i < 3; i++) {
        const a = ang + i * Math.PI * 2 / 3, r = CELL * 0.44;
        ctx.fillStyle = bColor;
        ctx.beginPath(); ctx.arc(bx + CELL / 2 + Math.cos(a) * r, by + CELL / 2 + Math.sin(a) * r, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    // HP + phase label text
    const hpPct = b.hp / (b.maxHp || b.hp);
    ctx.fillStyle = '#ffccee'; ctx.shadowBlur = 0;
    ctx.font = 'bold 7px Courier New'; ctx.textAlign = 'center';
    ctx.fillText((b.phaseLabel || 'BOSS'), bx + CELL / 2, by + CELL / 2 - 3);
    ctx.fillText(Math.round(hpPct * 100) + '%', bx + CELL / 2, by + CELL / 2 + 8);
    ctx.textAlign = 'left'; ctx.shadowBlur = 0;
    // 3D-D: composite Three.js boss model on top of 2D base
    drawBoss3D(ctx, bx, by, CELL, ts, b);
  }

  // Player — animated sprite (3D-A)
  {
    const px = sx + g.player.x * (CELL + GAP), py = sy + g.player.y * (CELL + GAP);
    const shld    = UPG.shield && UPG.shieldTimer > 0;
    const phase_  = UPG.phaseShift && UPG.phaseTimer > 0;
    const arch    = g.archetypeActive ? (ARCHETYPES[g.archetypeType || 'orb'] || {}) : {};
    spritePlayer.draw(ctx, px, py, CELL, ts, {
      matrixActive,
      archetypeActive: !!g.archetypeActive,
      archetypeGlow:   arch.glow || '#ffdd00',
      shielded:        shld,
      phaseShift:      phase_,
      aura:            UPG.aura,
      emotion:         UPG.emotion,
    });
  }

  // Particles
  if (CFG.particles) {
    game.particles = game.particles.filter(p => p.life > 0);
    for (const p of game.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 7;
      ctx.beginPath(); ctx.arc(sx + p.x, sy + p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--;
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Resonance wave
  if (g.resonanceWave) {
    const rw = g.resonanceWave; rw.r += 7; rw.alpha = Math.max(0, rw.alpha - (0.55 / rw.maxR) * 7);
    ctx.strokeStyle = rw.color; ctx.globalAlpha = rw.alpha; ctx.lineWidth = 2;
    ctx.shadowColor = rw.color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(sx + rw.x, sy + rw.y, rw.r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (rw.r >= rw.maxR) g.resonanceWave = null;
  }

  // Flash — skip visual overlay when reducedMotion is on (still drain counter)
  if (g.flashAlpha > 0) {
    if (!CFG.reducedMotion) {
      ctx.fillStyle = g.flashColor; ctx.globalAlpha = g.flashAlpha; ctx.fillRect(sx, sy, gp, gp);
      ctx.globalAlpha = 1;
    }
    g.flashAlpha = Math.max(0, g.flashAlpha - 0.04);
  }

  // Matrix A vignette
  if (matrixActive === 'A') {
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.9);
    vg.addColorStop(0, 'rgba(80,0,20,0)'); vg.addColorStop(1, 'rgba(80,0,20,0.22)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  }

  drawHUD(ctx, g, w, h, gp, sx, sy, matrixActive);
}

// ── Emotion color map ────────────────────────────────────────────────────
const EMOTION_COLOR = {
  awe:        '#ccddff',
  grief:      '#4466aa',
  anger:      '#ff4422',
  curiosity:  '#ffcc00',
  shame:      '#aa4488',
  tenderness: '#ffaabb',
  fear:       '#cc2244',
  joy:        '#00ffcc',
  despair:    '#2233ff',
  hope:       '#88ffcc',
  peace:      '#00ff88',
  clarity:    '#00eeff',
  panic:      '#ff0022',
  neutral:    '#334455',
};

function drawEmotionRow(ctx, w, efData) {
  if (!efData) return;
  const dominant   = efData.dominant   || 'neutral';
  const coherence  = efData.coherence  || 0;
  const distortion = efData.distortion || 0;
  const synergy    = window._emotionSynergy;

  const emColor = EMOTION_COLOR[dominant] || '#334455';
  const rowY    = 74;
  const barW    = 88;

  // Dominant emotion label
  ctx.font = '8px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = '#223322'; ctx.fillText('EM', 14, rowY + 9);
  ctx.fillStyle = emColor; ctx.shadowColor = emColor; ctx.shadowBlur = 4;
  ctx.font = 'bold 9px Courier New';
  ctx.fillText(dominant.toUpperCase(), 32, rowY + 9);
  ctx.shadowBlur = 0;

  // Coherence bar (blue)
  const cohX = 32;
  const cohY = rowY + 12;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(cohX, cohY, barW, 5);
  ctx.fillStyle = '#0055cc'; ctx.shadowColor = '#0055cc'; ctx.shadowBlur = 3;
  ctx.fillRect(cohX, cohY, barW * Math.min(1, coherence), 5);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,80,200,0.18)'; ctx.lineWidth = 1;
  ctx.strokeRect(cohX, cohY, barW, 5);

  // Distortion bar (red/orange)
  const distY = rowY + 19;
  ctx.fillStyle = '#1a0a00'; ctx.fillRect(cohX, distY, barW, 5);
  const distC = distortion > 0.6 ? '#ff2200' : '#ff8800';
  ctx.fillStyle = distC; ctx.shadowColor = distC; ctx.shadowBlur = 3;
  ctx.fillRect(cohX, distY, barW * Math.min(1, distortion), 5);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(200,80,0,0.18)'; ctx.strokeRect(cohX, distY, barW, 5);

  // Bar labels
  ctx.font = '6px Courier New'; ctx.fillStyle = '#223344';
  ctx.fillText('COH', cohX + barW + 3, cohY + 5);
  ctx.fillStyle = '#332211';
  ctx.fillText('DIS', cohX + barW + 3, distY + 5);

  // Synergy label (gold, only when active)
  if (synergy) {
    ctx.font = 'bold 7px Courier New'; ctx.textAlign = 'center';
    ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 6;
    ctx.fillText(synergy.label ? synergy.label.replace(/_/g, ' ').toUpperCase() : '', w / 2, rowY + 10);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
}

function realmLabel(pd) {
  const DEFAULT_PURG_DEPTH = 0.45; // neutral mid-realm
  if (pd === undefined || pd === null) pd = DEFAULT_PURG_DEPTH;
  if (pd < 0.15) return { name: 'HEAVEN',      color: '#aaffcc' };
  if (pd < 0.35) return { name: 'IMAGINATION', color: '#aaddff' };
  if (pd < 0.55) return { name: 'MIND',        color: '#00ff88' };
  if (pd < 0.75) return { name: 'PURGATORY',   color: '#ff8800' };
  return               { name: 'HELL',         color: '#ff2200' };
}

function drawHUD(ctx, g, w, h, gp, sx, sy, matrixActive) {
  const UPG_ref = UPG;
  const hudH = 120;
  ctx.fillStyle = '#070714'; ctx.fillRect(0, 0, w, hudH);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, hudH); ctx.lineTo(w, hudH); ctx.stroke();

  // ── Dreamscape header band (color-matched to ds accent) ──────────────
  const dsAccent = g.ds.bgAccent || '#001122';
  const headerGrd = ctx.createLinearGradient(0, 0, w, 0);
  headerGrd.addColorStop(0, dsAccent + 'cc');
  headerGrd.addColorStop(0.5, dsAccent + '44');
  headerGrd.addColorStop(1, dsAccent + 'cc');
  ctx.fillStyle = headerGrd; ctx.fillRect(0, 0, w, 16);

  // Show realm label from emotional field if available
  const efData = window._emotionField;
  const realmName = efData ? efData.realm : '';
  const dominantEmotion = efData ? efData.dominant : '';
  const realmColor = realmName === 'Heaven' ? '#aaffcc' : realmName === 'Hell' ? '#ff5533' :
                     realmName === 'Purgatory' ? '#ff8844' : realmName === 'Imagination' ? '#cc88ff' : '#334455';
  ctx.fillStyle = realmColor; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  const tm = window._tmods;
  const temporalSuffix = tm ? ('  |  ' + tm.lunarName + '  ' + tm.planetName) : '';
  const headerText = realmName ? (g.ds.name + '  ·  ' + (dominantEmotion || g.ds.emotion) + '  ·  ' + realmName + temporalSuffix)
                               : (g.ds.name + '  ·  ' + g.ds.emotion + temporalSuffix);
  ctx.fillText(headerText, w / 2, 11); ctx.textAlign = 'left';

  // HP
  const hpBarW = 138;
  ctx.fillStyle = '#333'; ctx.font = '9px Courier New'; ctx.fillText('HP', 14, 30);
  ctx.fillStyle = '#0e0e1e'; ctx.fillRect(32, 20, hpBarW, 13);
  const hpPct = g.hp / UPG_ref.maxHp;
  const hpC = hpPct > 0.6 ? '#00ff88' : hpPct > 0.3 ? '#ffaa00' : '#ff3333';
  ctx.fillStyle = hpC; ctx.shadowColor = hpC; ctx.shadowBlur = 5; ctx.fillRect(32, 20, hpBarW * hpPct, 13);
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(32, 20, hpBarW, 13);
  ctx.fillStyle = '#444'; ctx.font = '8px Courier New'; ctx.fillText(g.hp + '/' + UPG_ref.maxHp, 32 + hpBarW + 4, 30);

  // Energy
  const eBarW = 138;
  ctx.fillStyle = '#222'; ctx.font = '8px Courier New'; ctx.fillText('EN', 14, 50);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(32, 41, eBarW, 9);
  const eC = matrixActive === 'A' ? '#ff0055' : '#0088ff';
  ctx.fillStyle = eC; ctx.shadowColor = eC; ctx.shadowBlur = 4; ctx.fillRect(32, 41, eBarW * (UPG_ref.energy / UPG_ref.energyMax), 9);
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.strokeRect(32, 41, eBarW, 9);

  // PurgDepth bar (dark red depth indicator)
  {
    const pd = window._purgDepth || 0;
    ctx.fillStyle = '#1a0000'; ctx.fillRect(32, 52, eBarW, 5);
    const pdC = pd > 0.7 ? '#ff2222' : pd > 0.4 ? '#aa2200' : '#440000';
    ctx.fillStyle = pdC; ctx.fillRect(32, 52, eBarW * pd, 5);
    ctx.strokeStyle = 'rgba(200,0,0,0.2)'; ctx.strokeRect(32, 52, eBarW, 5);
    if (pd > 0.05) {
      ctx.fillStyle = pd > 0.7 ? '#ff2222' : '#660000'; ctx.font = '6px Courier New';
      ctx.fillText('PURG ' + (pd * 100).toFixed(0) + '%', 32 + eBarW + 4, 58);
    }
  }

  if (UPG_ref.glitchPulse) {
    ctx.fillStyle = '#220a22'; ctx.fillRect(32, 59, eBarW, 5);
    const pChr = UPG_ref.glitchPulseCharge / 100;
    ctx.fillStyle = pChr >= 1 ? '#ff00ff' : '#660088'; ctx.fillRect(32, 59, eBarW * pChr, 5);
    ctx.strokeStyle = 'rgba(150,0,200,0.2)'; ctx.strokeRect(32, 59, eBarW, 5);
    ctx.fillStyle = pChr >= 1 ? '#ff00ff' : '#553355'; ctx.font = '7px Courier New'; ctx.fillText('PULSE' + (pChr >= 1 ? ' READY' : ''), 32 + eBarW + 4, 65);
  }

  // Freeze cooldown strip (shows Q-key freeze charge/cooldown)
  if (UPG_ref.freeze) {
    const fTimer = UPG_ref.freezeTimer || 0;
    if (fTimer > 0) {
      const fPct = fTimer / 2500;
      ctx.fillStyle = '#001a22'; ctx.fillRect(32, 59 + (UPG_ref.glitchPulse ? 7 : 0), eBarW, 4);
      ctx.fillStyle = '#0088ff'; ctx.fillRect(32, 59 + (UPG_ref.glitchPulse ? 7 : 0), eBarW * fPct, 4);
      ctx.strokeStyle = 'rgba(0,136,255,0.2)'; ctx.strokeRect(32, 59 + (UPG_ref.glitchPulse ? 7 : 0), eBarW, 4);
      ctx.fillStyle = '#0088ff'; ctx.font = '6px Courier New';
      ctx.fillText('FREEZE ' + Math.ceil(fTimer / 1000) + 's', 32 + eBarW + 4, 63 + (UPG_ref.glitchPulse ? 7 : 0));
    } else {
      ctx.fillStyle = '#334455'; ctx.font = '6px Courier New';
      ctx.fillText('Q=FREEZE', 32 + eBarW + 4, 63 + (UPG_ref.glitchPulse ? 7 : 0));
    }
  }

  // ImpulseBuffer hold progress (shown when holding into hazard)
  {
    const prog = window._impulseProgress || 0;
    if (prog > 0 && prog < 1) {
      ctx.fillStyle = '#332200'; ctx.fillRect(32, 66, eBarW, 6);
      ctx.fillStyle = '#ffaa00'; ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 4;
      ctx.fillRect(32, 66, eBarW * prog, 6);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,170,0,0.35)'; ctx.strokeRect(32, 66, eBarW, 6);
      ctx.fillStyle = '#ffaa00'; ctx.font = '7px Courier New';
      ctx.fillText('HOLD to enter hazard…', 32 + eBarW + 4, 73);
    }
  }

  // ── Emotional field row (E3) ──────────────────────────────────────────
  drawEmotionRow(ctx, w, window._emotionField || null);

  if (g.archetypeActive && g.archetypeType) {
    const arch = ARCHETYPES[g.archetypeType];
    ctx.fillStyle = arch ? arch.color : '#ffdd00'; ctx.shadowColor = arch ? arch.glow : '#ffdd00'; ctx.shadowBlur = 4;
    ctx.font = '8px Courier New'; ctx.fillText(arch ? arch.name + ' ACTIVE' : '[ARCH ACTIVE]', 14, 90); ctx.shadowBlur = 0;
  } else if (UPG_ref.shield && UPG_ref.shieldTimer > 0) {
    ctx.fillStyle = '#00ffff'; ctx.font = '8px Courier New'; ctx.fillText('SHIELD×' + UPG_ref.shieldTimer, 14, 90);
  } else if (UPG_ref.shieldCount > 0) {
    ctx.fillStyle = '#334455'; ctx.font = '8px Courier New'; ctx.fillText('streak ' + UPG_ref.shieldCount + '/3', 14, 90);
  }

  if (UPG_ref.comboCount > 1) {
    ctx.fillStyle = '#ffcc00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 6;
    ctx.font = '8px Courier New'; ctx.fillText('COMBO ×' + UPG_ref.resonanceMultiplier.toFixed(1), 14, 105);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 5;
  ctx.font = '9px Courier New'; ctx.fillText('◆×' + (window._insightTokens || 0), 14, 113); ctx.shadowBlur = 0;

  // Score
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
  ctx.font = 'bold 19px Courier New'; ctx.textAlign = 'center';
  ctx.fillText(String(g.score).padStart(7, '0'), w / 2, 38); ctx.shadowBlur = 0;
  ctx.fillStyle = '#222838'; ctx.font = '8px Courier New'; ctx.fillText('SCORE', w / 2, 52);

  const mC = matrixActive === 'A' ? '#ff0055' : '#00aa55';
  ctx.fillStyle = mC; ctx.shadowColor = mC; ctx.shadowBlur = 7;
  ctx.font = 'bold 10px Courier New'; ctx.fillText('MTX·' + matrixActive, w / 2 - 16, 68); ctx.shadowBlur = 0;

  ctx.textAlign = 'right';
  ctx.fillStyle = '#445566'; ctx.font = '10px Courier New'; ctx.fillText('LVL ' + g.level, w - 12, 30);
  ctx.fillStyle = '#005533'; ctx.fillText('◈×' + g.peaceLeft, w - 12, 44);
  ctx.fillStyle = '#223344'; ctx.font = '8px Courier New';
  ctx.fillText((window._dreamIdx + 1 || 1) + '/18 DREAMS', w - 12, 58);
  // Phase M5: Character level display
  const cs = window._characterStats;
  if (cs) {
    ctx.fillStyle = '#334455'; ctx.font = '7px Courier New';
    ctx.fillText('LVL·' + cs.level + '  XP ' + Math.round(cs.xpPercent * 100) + '%', w - 12, 104);
    if (cs.levelUpMsg) {
      ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 4;
      ctx.font = '7px Courier New'; ctx.fillText(cs.levelUpMsg, w - 12, 114);
      ctx.shadowBlur = 0;
    }
  }
  ctx.textAlign = 'left';

  if (g.msg && g.msgTimer > 0) {
    ctx.globalAlpha = Math.min(1, g.msgTimer / 18);
    ctx.textAlign = 'center';
    // Adapt font size to message length to prevent overflow
    const msgLen = (g.msg || '').length;
    const msgFontSize = msgLen > MSG_LEN_LONG ? MSG_FONT_SMALL : msgLen > MSG_LEN_MEDIUM ? MSG_FONT_MEDIUM : MSG_FONT_LARGE;
    ctx.font = 'bold ' + msgFontSize + 'px Courier New';
    ctx.fillStyle = g.msgColor; ctx.shadowColor = g.msgColor; ctx.shadowBlur = 16;
    // Word-wrap at w-40 for long messages
    if (msgLen > MSG_LEN_LONG) {
      const words = g.msg.split(' ');
      let line = '', lineY = sy - 26;
      for (const word of words) {
        const test = line + (line ? ' ' : '') + word;
        if (ctx.measureText(test).width > w - 40 && line) {
          ctx.fillText(line, w / 2, lineY); lineY += 13; line = word;
        } else line = test;
      }
      if (line) ctx.fillText(line, w / 2, lineY);
    } else {
      ctx.fillText(g.msg, w / 2, sy - 16);
    }
    ctx.textAlign = 'left'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    g.msgTimer--;
  }

  // ── Phase 6 + Lang: Vocabulary word flash (multilingual) ─────────────
  const vocabWord = window._vocabWord;
  if (vocabWord) {
    // _vocabTimer counts 150→0; fade in during first 20 frames, fade out during last 25 frames
    const vt = window._vocabTimer !== undefined ? window._vocabTimer : 150;
    const fadeIn  = Math.min(1, (150 - vt) / 20);  // 0→1 in first 20 frames
    const fadeOut = Math.min(1, vt / 25);            // 1→0 in last 25 frames
    const vAlpha  = Math.min(fadeIn, fadeOut);
    if (vAlpha > 0) {
      ctx.globalAlpha = vAlpha;
    // Determine if we have a multilingual entry (from language system)
    const hasMulti = vocabWord.targetWord && vocabWord.targetLang;
    const dMode = vocabWord.displayMode || 'bilingual'; // 'native' | 'bilingual' | 'target'
    // Immersion: show only target language. Native-only: show only native.
    const showTarget = hasMulti && dMode !== 'native';
    const showNative = !hasMulti || dMode !== 'target';
    const boxH = (showTarget && showNative) ? 56 : 36;
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(w/2 - 140, sy - 62, 280, boxH);
    ctx.strokeStyle = 'rgba(255,221,136,0.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 140, sy - 62, 280, boxH);
    if (showTarget) {
      // Target language word (primary in immersion, secondary in bilingual)
      const tl = vocabWord.targetLang;
      ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#88bbff'; ctx.shadowBlur = 5;
      ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(vocabWord.targetWord + '  [' + vocabWord.targetPos + ']', w/2, sy - 44); ctx.shadowBlur = 0;
      if (tl) {
        ctx.fillStyle = '#446688'; ctx.font = '8px Courier New';
        ctx.fillText((tl.emoji || '') + ' ' + tl.name + (tl.nativeName !== tl.name ? ' · ' + tl.nativeName : ''), w/2, sy - 30);
      }
      if (showNative) {
        // Bilingual: also show native definition below
        ctx.fillStyle = '#ffdd88'; ctx.font = '9px Courier New';
        ctx.fillText(vocabWord.nativeDef || vocabWord.targetDef, w/2, sy - 14);
      }
    }
    if (!showTarget) {
      // Native-only mode or no multilingual data
      const word = vocabWord.word || vocabWord.nativeWord || '';
      const pos  = vocabWord.pos  || vocabWord.nativePos  || '';
      const def  = vocabWord.def  || vocabWord.nativeDef  || '';
      ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 5;
      ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(word + '  [' + pos + ']', w/2, sy - 44); ctx.shadowBlur = 0;
      ctx.fillStyle = '#886644'; ctx.font = '9px Courier New';
      ctx.fillText(def, w/2, sy - 30);
    }
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    } // end vAlpha > 0
  }

  // ── Sigil system: pattern flash ─────────────────────────────────────
  const sigil = window._activeSigil;
  if (sigil && (window._sigilAlpha || 0) > 0) {
    ctx.globalAlpha = Math.min(1, window._sigilAlpha);
    const sgX = w - 160, sgY = 115;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(sgX, sgY, 152, 62);
    ctx.strokeStyle = 'rgba(255,220,100,0.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(sgX, sgY, 152, 62);
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 6;
    ctx.font = 'bold 18px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(sigil.symbol, sgX + 20, sgY + 24); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc66'; ctx.font = 'bold 9px Courier New';
    ctx.fillText(sigil.tradition.split('(')[0].trim().slice(0, 22), sgX + 80, sgY + 15);
    ctx.fillStyle = '#aa9966'; ctx.font = '8px Courier New';
    const meanParts = sigil.meaning.split('·');
    ctx.fillText((meanParts[0] || '').trim(), sgX + 80, sgY + 28);
    ctx.fillStyle = '#664422'; ctx.font = '7px Courier New';
    ctx.fillText((meanParts[1] || meanParts[0] || '').trim(), sgX + 80, sgY + 40);
    ctx.fillStyle = '#443322'; ctx.font = '7px Courier New';
    ctx.fillText('✦ sigil · ' + (sigil.patterns || []).join(' + '), sgX + 76, sgY + 54);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase M5: Archetype dialogue panel ───────────────────────────────
  const ad = window._archetypeDialogue;
  if (ad && ad.text && ad.alpha > 0.02) {
    const ARCH_COLORS = { dragon:'#ffaa00', child:'#aaffcc', orb:'#aaddff', captor:'#ffaadd', protector:'#88ccff' };
    const adColor = ARCH_COLORS[ad.key] || '#ffdd88';
    const adW = 320, adX = w / 2 - adW / 2, adY = Math.round(h * 0.28) - 44;
    ctx.globalAlpha = Math.min(1, ad.alpha);
    ctx.fillStyle = 'rgba(2,2,12,0.93)'; ctx.fillRect(adX, adY, adW, 68);
    ctx.strokeStyle = adColor + '55'; ctx.lineWidth = 1; ctx.strokeRect(adX, adY, adW, 68);
    ctx.fillStyle = adColor; ctx.shadowColor = adColor; ctx.shadowBlur = 6;
    ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('◈ ARCHETYPE SPEAKS', w / 2, adY + 14); ctx.shadowBlur = 0;
    // Word-wrap dialogue text
    ctx.fillStyle = '#ddeedd'; ctx.font = 'italic 10px Courier New';
    const words = ad.text.split(' ');
    let line = '', ly = adY + 32;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > adW - 24 && line) {
        ctx.fillText(line, w / 2, ly); ly += 15; line = word;
      } else line = test;
    }
    if (line) ctx.fillText(line, w / 2, ly);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 6: Pattern discovery banner ────────────────────────────────
  const banner = window._patternBanner;
  if (banner) {
    const bProg = banner.timer / banner.maxTimer;
    const bAlpha = bProg > 0.85 ? (1 - bProg) / 0.15 : bProg < 0.1 ? bProg / 0.1 : 1;
    ctx.globalAlpha = Math.min(1, bAlpha);
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(w/2 - 148, h/2 - 38, 296, 72);
    ctx.strokeStyle = banner.color + '66'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 148, h/2 - 38, 296, 72);
    ctx.fillStyle = banner.color; ctx.shadowColor = banner.color; ctx.shadowBlur = 12;
    ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(banner.symbol + ' ' + banner.name.toUpperCase() + ' DISCOVERED', w/2, h/2 - 14); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ccbbaa'; ctx.font = '9px Courier New';
    ctx.fillText(banner.description, w/2, h/2 + 4);
    ctx.fillStyle = '#665544'; ctx.font = '8px Courier New';
    ctx.fillText(banner.fact, w/2, h/2 + 20);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Boss phase banner ─────────────────────────────────────────────────
  const bpb = window._bossPhaseBanner;
  if (bpb && bpb.alpha > 0.02) {
    ctx.globalAlpha = Math.min(1, bpb.alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(w/2 - 170, h * 0.14, 340, 60);
    ctx.strokeStyle = bpb.color + '88'; ctx.lineWidth = 2;
    ctx.strokeRect(w/2 - 170, h * 0.14, 340, 60);
    ctx.fillStyle = bpb.color; ctx.shadowColor = bpb.color; ctx.shadowBlur = 14;
    ctx.font = 'bold 13px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(bpb.text, w/2, h * 0.14 + 20); ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa8888'; ctx.font = 'italic 9px Courier New';
    ctx.fillText('"' + (bpb.quote || '') + '"', w/2, h * 0.14 + 38);
    ctx.fillStyle = '#553333'; ctx.font = '7px Courier New';
    ctx.fillText('hold your ground', w/2, h * 0.14 + 52);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Quest completion flash ────────────────────────────────────────────
  const qf = window._questFlash;
  if (qf && qf.alpha > 0.02) {
    ctx.globalAlpha = Math.min(1, qf.alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(w/2 - 170, h * 0.82, 340, 54);
    ctx.strokeStyle = '#ffdd88aa'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 170, h * 0.82, 340, 54);
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 10;
    ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(qf.emoji + '  QUEST COMPLETE  ' + qf.emoji, w/2, h * 0.82 + 16); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ddeedd'; ctx.font = '9px Courier New';
    ctx.fillText(qf.text, w/2, h * 0.82 + 32);
    ctx.fillStyle = '#556644'; ctx.font = '7px Courier New';
    ctx.fillText(qf.name, w/2, h * 0.82 + 46);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Skymap/Ritual: Named constellation reward flash ──────────────────
  const cfl = window._constellationFlash;
  if (cfl && cfl.alpha > 0.02) {
    ctx.globalAlpha = Math.min(1, cfl.alpha);
    ctx.fillStyle = 'rgba(0,0,12,0.92)'; ctx.fillRect(w/2 - 190, h * 0.35, 380, 54);
    ctx.strokeStyle = 'rgba(0,238,255,0.55)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 190, h * 0.35, 380, 54);
    ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 14;
    ctx.font = 'bold 14px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('✦ ' + cfl.name + ' ✦', w/2, h * 0.35 + 22); ctx.shadowBlur = 0;
    ctx.fillStyle = '#446688'; ctx.font = '8px Courier New';
    ctx.fillText('CONSTELLATION DISCOVERED  ·  +score', w/2, h * 0.35 + 40);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Alchemy flash ─────────────────────────────────────────────────────
  const af = window._alchemyFlash;
  if (af && af.alpha > 0.02) {
    ctx.globalAlpha = Math.min(1, af.alpha);
    const afColor = af.color || '#cc88ff';
    ctx.fillStyle = 'rgba(0,0,0,0.90)'; ctx.fillRect(w/2 - 175, h * 0.55, 350, 52);
    ctx.strokeStyle = afColor + '88'; ctx.lineWidth = af.stone ? 2 : 1;
    ctx.strokeRect(w/2 - 175, h * 0.55, 350, 52);
    ctx.fillStyle = afColor; ctx.shadowColor = afColor; ctx.shadowBlur = af.stone ? 20 : 10;
    ctx.font = 'bold ' + (af.stone ? '12' : '10') + 'px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(af.text, w/2, h * 0.55 + 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#998877'; ctx.font = '7px Courier New';
    ctx.fillText('⚗️  ' + af.name + '  ·  the Great Work continues', w/2, h * 0.55 + 34);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Alchemy HUD strip (alchemist mode only) ───────────────────────────
  const alch = window._alchemy;
  if (alch && alch.active && (alch.seedsDisplay || alch.phase)) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#0a0008'; ctx.fillRect(w/2 - 170, h - 34, 340, 20);
    ctx.strokeStyle = 'rgba(200,100,255,0.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 170, h - 34, 340, 20);
    ctx.fillStyle = '#cc88ff'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
    const phaseLabel = { nigredo: '🜏 Nigredo', albedo: '🜃 Albedo', rubedo: '🜔 Rubedo', aurora: '✦ Aurora' }[alch.phase] || alch.phase;
    const seedStr = alch.seedsDisplay ? '  ·  ' + alch.seedsDisplay : '';
    ctx.fillText('⚗️  ' + phaseLabel + seedStr + '  ·  X to transmute', w/2, h - 21);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Play mode label (ornithology / mycology / architecture etc.) ──────
  const pml = window._playModeLabel;
  if (pml) {
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#001408'; ctx.fillRect(w/2 - 140, sy + gp + 8, 280, 18);
    ctx.strokeStyle = 'rgba(0,255,136,0.15)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 140, sy + gp + 8, 280, 18);
    ctx.fillStyle = '#00aa55'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(pml, w/2, sy + gp + 21);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 8: Emergence indicator flash ───────────────────────────────
  const em = window._emergence;
  if (em && em.flash) {
    ctx.globalAlpha = Math.min(1, em.alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(w/2 - 150, h*0.72, 300, 56);
    ctx.strokeStyle = 'rgba(170,200,255,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 150, h*0.72, 300, 56);
    ctx.fillStyle = '#aaccff'; ctx.shadowColor = '#88aaff'; ctx.shadowBlur = 8;
    ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('✦ EMERGENCE · ' + em.flash.label.toUpperCase(), w/2, h*0.72 + 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#667799'; ctx.font = '8px Courier New';
    ctx.fillText(em.flash.desc, w/2, h*0.72 + 36);
    ctx.fillStyle = '#334455'; ctx.font = '7px Courier New';
    ctx.fillText('AWAKENING LEVEL: ' + em.label, w/2, h*0.72 + 50);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 10: Chakra awakening flash ─────────────────────────────────
  const ck = window._chakra;
  if (ck && ck.flash) {
    ctx.globalAlpha = Math.min(1, ck.alpha);
    const fc = ck.flash;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(w/2 - 140, h*0.28, 280, 54);
    ctx.strokeStyle = fc.color + '88'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 140, h*0.28, 280, 54);
    ctx.fillStyle = fc.glow; ctx.shadowColor = fc.glow; ctx.shadowBlur = 10;
    ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('◉ ' + fc.name.toUpperCase() + ' CHAKRA AWAKENED', w/2, h*0.28 + 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa8866'; ctx.font = '9px Courier New';
    ctx.fillText(fc.sanskrit + '  ·  ' + fc.desc, w/2, h*0.28 + 34);
    ctx.fillStyle = '#665544'; ctx.font = '8px Courier New';
    ctx.fillText(fc.powerup, w/2, h*0.28 + 48);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#070714'; ctx.fillRect(0, h - 28, w, 28);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.beginPath(); ctx.moveTo(0, h - 28); ctx.lineTo(w, h - 28); ctx.stroke();
  const rl = realmLabel(window._purgDepth);
  ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = rl.color; ctx.shadowColor = rl.color; ctx.shadowBlur = 5;
  ctx.fillText(rl.name, 14, h - 11);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a1a2a'; ctx.font = '7px Courier New'; ctx.textAlign = 'right';
  ctx.fillText('WASD SHIFT=MTX J R Q C ESC=pause H=dash', w - 10, h - 11);
  ctx.textAlign = 'left';

  // ── Rhythm mode: beat pulse indicator in bottom bar ──────────────────
  const beatPulse = window._beatPulse || 0;
  if (beatPulse > 0.05) {
    ctx.globalAlpha = beatPulse * 0.7;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, h - 28, w * beatPulse, 2);
    ctx.globalAlpha = 1;
  }

  // ── Phase 9: Empathy flash (enemy behavior label shown after freeze) ──
  const iqData = window._iqData;
  if (iqData) {
    const fe = iqData.flashEmotion;
    if (fe && iqData.empathyAlpha > 0) {
      ctx.globalAlpha = Math.min(1, iqData.empathyAlpha);
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(sx, sy + gp + 8, gp, 34);
      ctx.strokeStyle = fe.color + '55'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy + gp + 8, gp, 34);
      ctx.fillStyle = fe.color; ctx.shadowColor = fe.color; ctx.shadowBlur = 6;
      ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(fe.label, sx + gp / 2, sy + gp + 22); ctx.shadowBlur = 0;
      ctx.fillStyle = '#665544'; ctx.font = '7px Courier New';
      ctx.fillText(fe.insight, sx + gp / 2, sy + gp + 34);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    // Phase 9: EQ emotion recognition flash (dominant emotion label)
    const eqfl = iqData.eqFlash;
    if (eqfl && iqData.eqFlashAlpha > 0) {
      ctx.globalAlpha = Math.min(0.85, iqData.eqFlashAlpha);
      const eqX = w - 145, eqY = 85;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(eqX, eqY, 136, 28);
      ctx.strokeStyle = eqfl.color + '44'; ctx.lineWidth = 1;
      ctx.strokeRect(eqX, eqY, 136, 28);
      ctx.fillStyle = eqfl.color; ctx.font = 'bold 9px Courier New';
      ctx.fillText('⟦ ' + eqfl.label.toUpperCase() + ' ⟧', eqX + 4, eqY + 12);
      ctx.fillStyle = '#554433'; ctx.font = '7px Courier New';
      ctx.fillText(eqfl.tip.slice(0, 22), eqX + 4, eqY + 24);
      ctx.globalAlpha = 1;
    }
    // Phase 9: Sequence challenge overlay (logic puzzle)
    const challenge = iqData.challenge;
    if (challenge && iqData.challengeAlpha > 0) {
      ctx.globalAlpha = Math.min(1, iqData.challengeAlpha);
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(w/2 - 160, h*0.42, 320, 80);
      ctx.strokeStyle = 'rgba(136,221,255,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(w/2 - 160, h*0.42, 320, 80);
      ctx.fillStyle = '#88ddff'; ctx.shadowColor = '#66aaff'; ctx.shadowBlur = 8;
      ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('◆ PATTERN RECOGNITION: ' + challenge.name.toUpperCase(), w/2, h*0.42 + 16); ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaccee'; ctx.font = '14px Courier New';
      ctx.fillText(challenge.seq.join('  ·  ') + '  ·  ?', w/2, h*0.42 + 38);
      ctx.fillStyle = '#44aa66'; ctx.font = 'bold 12px Courier New';
      ctx.fillText('next: ' + challenge.next, w/2, h*0.42 + 58);
      ctx.fillStyle = '#445566'; ctx.font = '7px Courier New';
      ctx.fillText(challenge.fact, w/2, h*0.42 + 74);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    // Phase M3: Tutorial hint overlay — cycles one hint at a time
    const tut = window._currentTutorialHint;
    if (tut && tut.text) {
      const ta = (tut.timer > 30 ? 1 : tut.timer / 30) * 0.95;
      ctx.globalAlpha = ta;
      ctx.fillStyle = 'rgba(0,14,4,0.94)'; ctx.fillRect(sx, sy - 50, gp, 44);
      ctx.strokeStyle = 'rgba(0,255,136,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy - 50, gp, 44);
      ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 4;
      ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('✦ HOW TO PLAY  ' + (tut.index + 1) + ' / ' + tut.total, sx + gp / 2, sy - 36);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ccffcc'; ctx.font = '9px Courier New';
      ctx.fillText(tut.text, sx + gp / 2, sy - 20);
      ctx.fillStyle = '#334433'; ctx.font = '7px Courier New';
      ctx.fillText('ESC to open menu · auto-advances…', sx + gp / 2, sy - 8);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    // Phase 2.5: Dream Yoga — lucidity meter (bottom-left of grid)
    const dy = window._dreamYoga;
    if (dy) {
      const lx = sx + 2, ly = sy + gp - 18;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(lx, ly, 88, 14);
      ctx.strokeStyle = 'rgba(100,200,255,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(lx, ly, 88, 14);
      // bar
      ctx.fillStyle = 'rgba(100,180,255,' + Math.min(1, 0.3 + dy.lucidity * 0.005) + ')'; ctx.fillRect(lx + 1, ly + 1, Math.round(dy.lucidity * 0.86), 12);
      ctx.fillStyle = '#88aadd'; ctx.font = '7px Courier New'; ctx.textAlign = 'left';
      ctx.fillText('◐ LUCIDITY ' + dy.lucidity + '%', lx + 3, ly + 10);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;

      // Reality check prompt — centred overlay
      if (dy.rcActive && dy.rcAlpha > 0.02 && dy.rcPrompt) {
        const pa = Math.min(1, dy.rcAlpha);
        ctx.globalAlpha = pa;
        ctx.fillStyle = 'rgba(0,5,20,0.92)'; ctx.fillRect(w / 2 - 200, h / 2 - 55, 400, 100);
        ctx.strokeStyle = 'rgba(100,200,255,0.5)'; ctx.lineWidth = 1;
        ctx.strokeRect(w / 2 - 200, h / 2 - 55, 400, 100);
        ctx.fillStyle = '#aaccff'; ctx.shadowColor = '#aaccff'; ctx.shadowBlur = 10;
        ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
        ctx.fillText('◐ REALITY CHECK', w / 2, h / 2 - 36); ctx.shadowBlur = 0;
        ctx.fillStyle = '#ddeeff'; ctx.font = '13px Courier New';
        ctx.fillText(dy.rcPrompt.q, w / 2, h / 2 - 14);
        ctx.fillStyle = '#556688'; ctx.font = '9px Courier New';
        ctx.fillText(dy.rcPrompt.hint, w / 2, h / 2 + 6);
        ctx.fillStyle = '#334466'; ctx.font = '8px Courier New';
        ctx.fillText('press any key to acknowledge', w / 2, h / 2 + 26);
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      }
    }

    // Phase M4: Speedrun timer overlay
    const srt = window._speedrunTimer;
    if (srt !== undefined && srt !== null && srt >= 0) {
      const secLeft = Math.floor(srt / 1000);
      const timerColor = secLeft <= 30 ? '#ff4422' : secLeft <= 60 ? '#ffaa00' : '#88ddff';
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(w - 80, sy - 2, 74, 20);
      ctx.strokeStyle = timerColor + '55'; ctx.lineWidth = 1;
      ctx.strokeRect(w - 80, sy - 2, 74, 20);
      ctx.fillStyle = timerColor; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
      const mm = Math.floor(secLeft / 60), ss = secLeft % 60;
      ctx.fillText('⏱ ' + mm + ':' + String(ss).padStart(2, '0'), w - 43, sy + 12);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    // Phase M4: Move limit overlay (puzzle mode)
    const mr = window._movesRemaining;
    if (mr !== undefined && mr !== null) {
      const mrColor = mr <= 10 ? '#ff6622' : '#88bbff';
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(w - 80, sy + 22, 74, 18);
      ctx.strokeStyle = mrColor + '44'; ctx.lineWidth = 1;
      ctx.strokeRect(w - 80, sy + 22, 74, 18);
      ctx.fillStyle = mrColor; ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('MOVES: ' + mr, w - 43, sy + 34);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
  }
}
