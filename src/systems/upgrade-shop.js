// ═══════════════════════════════════════════════════════════════════════
//  UPGRADE SHOP - Phase 7
//  Spend insight tokens to buy permanent upgrades for the run.
// ═══════════════════════════════════════════════════════════════════════

export const UPGRADES = [
  {
    id: 'hp_boost',
    name: 'HP BOOST',
    desc: '+20 max HP · Heal to full',
    cost: 2,
    icon: '❤',
    apply: (gameState) => {
      gameState.player.maxHp = (gameState.player.maxHp || 100) + 20;
      gameState.player.hp = gameState.player.maxHp;
    },
  },
  {
    id: 'speed_boost',
    name: 'SPEED BOOST',
    desc: '+20% movement speed',
    cost: 2,
    icon: '⚡',
    apply: (gameState) => {
      gameState.moveSpeedBoost = Math.min(2.0, (gameState.moveSpeedBoost || 1.0) + 0.2);
    },
  },
  {
    id: 'vision_extend',
    name: 'VISION EXTEND',
    desc: '+2 vision radius (Horror)',
    cost: 1,
    icon: '👁',
    apply: (gameState) => {
      if (gameState.visionRadius) {
        gameState.visionRadius = Math.min(10, gameState.visionRadius + 2);
      }
    },
  },
  {
    id: 'insight_mul',
    name: 'INSIGHT LENS',
    desc: '+50% insight score',
    cost: 3,
    icon: '✦',
    apply: (gameState) => {
      if (!gameState.currentTemporalMods) gameState.currentTemporalMods = {};
      gameState.currentTemporalMods.insightMul = ((gameState.currentTemporalMods.insightMul || 1.0) + 0.5);
    },
  },
  {
    id: 'score_mul',
    name: 'SCORE LENS',
    desc: '+25% all score',
    cost: 3,
    icon: '◈',
    apply: (gameState) => {
      gameState.scoreMul = Math.min(4.0, (gameState.scoreMul || 1.0) + 0.25);
    },
  },
  {
    id: 'rewind_power',
    name: 'REWIND',
    desc: '+3 undo charges',
    cost: 2,
    icon: '↩',
    apply: (gameState) => {
      gameState.undoCharges = (gameState.undoCharges || 0) + 3;
    },
  },
  {
    id: 'phase_power',
    name: 'PHASE WALK',
    desc: 'Pass through walls once',
    cost: 4,
    icon: '◻',
    apply: (gameState) => {
      gameState.phaseWalkCharges = (gameState.phaseWalkCharges || 0) + 1;
    },
  },
  {
    id: 'lucidity_boost',
    name: 'LUCID ANCHOR',
    desc: '+25 starting lucidity',
    cost: 2,
    icon: '🌙',
    apply: (gameState) => {
      gameState._lucidity = Math.min(100, (gameState._lucidity || 0) + 25);
    },
  },
];

/**
 * Open the upgrade shop. Returns false if already open.
 */
export function openUpgradeShop(gameState) {
  if (gameState._shopOpen) return false;
  gameState._shopOpen = true;
  gameState._shopSelection = 0;
  gameState._shopPurchased = gameState._shopPurchased || new Set();
  return true;
}

/**
 * Close the upgrade shop.
 */
export function closeUpgradeShop(gameState) {
  gameState._shopOpen = false;
}

/**
 * Handle key input for the upgrade shop.
 * Returns true if input was consumed.
 */
export function handleShopInput(gameState, key) {
  if (!gameState._shopOpen) return false;

  const available = UPGRADES.filter(u => !gameState._shopPurchased?.has(u.id));

  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    gameState._shopSelection = Math.max(0, (gameState._shopSelection || 0) - 1);
    return true;
  }
  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    gameState._shopSelection = Math.min(available.length - 1, (gameState._shopSelection || 0) + 1);
    return true;
  }
  if (key === 'Enter' || key === ' ') {
    const upgrade = available[gameState._shopSelection || 0];
    if (upgrade && (gameState.insightTokens || 0) >= upgrade.cost) {
      gameState.insightTokens -= upgrade.cost;
      upgrade.apply(gameState);
      if (!gameState._shopPurchased) gameState._shopPurchased = new Set();
      gameState._shopPurchased.add(upgrade.id);
      // Move selection up if list shrinks
      const newLen = available.length - 1;
      gameState._shopSelection = Math.min(gameState._shopSelection || 0, Math.max(0, newLen - 1));
      if (gameState.emotionalField?.add) gameState.emotionalField.add('joy', 0.8);
    }
    return true;
  }
  if (key === 'Escape' || key === 'q' || key === 'Q') {
    closeUpgradeShop(gameState);
    return true;
  }

  return true; // consume all input while shop open
}

/**
 * Render the upgrade shop overlay.
 */
export function renderUpgradeShop(gameState, ctx) {
  if (!gameState._shopOpen) return;

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const tokens = gameState.insightTokens || 0;
  const purchased = gameState._shopPurchased || new Set();
  const available = UPGRADES.filter(u => !purchased.has(u.id));
  const sel = Math.min(gameState._shopSelection || 0, available.length - 1);

  // Background
  ctx.save();
  ctx.globalAlpha = 0.96;
  ctx.fillStyle = 'rgba(2,4,14,0.97)';
  ctx.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
  ctx.globalAlpha = 1.0;

  // Header
  ctx.fillStyle = '#00ccaa';
  ctx.font = `bold ${Math.floor(w / 18)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('UPGRADE SHOP', w / 2, h * 0.14);

  ctx.fillStyle = '#667799';
  ctx.font = `${Math.floor(w / 35)}px Courier New`;
  ctx.fillText(`Insight Tokens: ☆×${tokens}`, w / 2, h * 0.19);

  // Items
  const rowH = Math.min(52, (h * 0.72) / Math.max(1, available.length));
  const startY = h * 0.23;

  for (let i = 0; i < available.length; i++) {
    const upg = available[i];
    const isSel = i === sel;
    const canAfford = tokens >= upg.cost;
    const rowY = startY + i * rowH;

    if (isSel) {
      ctx.fillStyle = `rgba(0,200,160,0.12)`;
      ctx.fillRect(w * 0.09, rowY - 4, w * 0.82, rowH - 2);
      ctx.strokeStyle = `rgba(0,200,160,0.35)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.09, rowY - 4, w * 0.82, rowH - 2);
    }

    // Icon + name
    ctx.fillStyle = isSel ? (canAfford ? '#00ffcc' : '#ff6644') : '#8899aa';
    ctx.font = `${isSel ? 'bold ' : ''}${Math.floor(w / 28)}px Courier New`;
    ctx.textAlign = 'left';
    ctx.fillText(`  ${upg.icon} ${upg.name}`, w * 0.10, rowY + rowH * 0.38);

    // Description
    ctx.fillStyle = isSel ? '#aabbcc' : '#445566';
    ctx.font = `${Math.floor(w / 40)}px Courier New`;
    ctx.fillText(`      ${upg.desc}`, w * 0.10, rowY + rowH * 0.72);

    // Cost
    ctx.textAlign = 'right';
    ctx.fillStyle = canAfford ? '#ffcc44' : '#886633';
    ctx.font = `bold ${Math.floor(w / 30)}px Courier New`;
    ctx.fillText(`☆×${upg.cost}`, w * 0.88, rowY + rowH * 0.55);
  }

  if (available.length === 0) {
    ctx.fillStyle = '#556677';
    ctx.font = `${Math.floor(w / 24)}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText('All upgrades purchased', w / 2, h * 0.55);
  }

  // Footer
  ctx.fillStyle = '#334455';
  ctx.font = '9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('↑/↓ browse · ENTER buy · ESC close', w / 2, h * 0.90);
  ctx.restore();
}
