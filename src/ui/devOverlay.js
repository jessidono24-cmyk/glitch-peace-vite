'use strict';

const FONT = "'Share Tech Mono', monospace";

function short(value, fallback = '—') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

export function drawDevTruthOverlay(ctx, state = {}) {
  const phase = short(state.phase);
  const spec = state.runSpec || {};
  const stance = short(state.stance || spec.stance, 'balanced?');
  const summary = [
    `realm:${short(spec.realmId)}`,
    `seed:${short(spec.seed)}`,
    `currency:${short(state.currency)}`,
  ].join('  ');

  const x = 8;
  const y = 8;
  const width = Math.min(440, Math.max(280, ctx.canvas.width * 0.28));
  const height = 56;

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 6);
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#00ff88';
  ctx.font = `bold 11px ${FONT}`;
  ctx.fillText(`DEV  phase:${phase}  stance:${stance}`, x + 8, y + 7);

  ctx.fillStyle = '#d7ffe9';
  ctx.font = `10px ${FONT}`;
  ctx.fillText(summary, x + 8, y + 27);

  ctx.restore();
}
