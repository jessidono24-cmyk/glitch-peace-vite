// Enhanced from: _archive/gp-v5-YOUR-BUILD/src/main.js (HUD)
export function updateHUD(game) {
  if (!game) return;
  // ensure hud exists
  const hudEl = document.getElementById('hud');
  if (!hudEl) return;

  // ensure sections
  hudEl.style.display = (game.state === 'PLAYING') ? 'flex' : 'none';

  // update HP
  const hpText = document.getElementById('hp-text');
  const hpFill = document.getElementById('hp-fill');
  const level = document.getElementById('level');
  const score = document.getElementById('score');
  const objective = document.getElementById('objective');

  if (hpText) hpText.textContent = `${game.player.hp}/${game.player.maxHp || 100}`;
  if (hpFill) hpFill.style.width = `${(game.player.hp / (game.player.maxHp || 100)) * 100}%`;
  if (level) level.textContent = String(game.level || 1);
  if (score) score.textContent = String(game.score || 0);
  if (objective) objective.textContent = `◈ ×${game.peaceTotal || 0}`;

  // Emotional Field indicator (compact)
  const ef = game.emotionalField;
  if (ef) {
    const dom = ef.getDominant?.();
    const domVal = dom ? (ef.values?.[dom] ?? 0) : 0;
    const coh = ef.calcCoherence?.() ?? 0.5;
    const dis = ef.calcDistortion?.() ?? 0;

    // inject tiny HUD row if missing
    let emoRow = document.getElementById('hud-emo');
    if (!emoRow) {
      emoRow = document.createElement('div');
      emoRow.id = 'hud-emo';
      emoRow.style.display = 'flex';
      emoRow.style.gap = '8px';
      emoRow.style.alignItems = 'center';
      emoRow.style.marginTop = '6px';
      hudEl.appendChild(emoRow);
    }
    emoRow.innerHTML = '';

    const domLabel = document.createElement('div');
    domLabel.textContent = dom ? dom.toUpperCase() + ` ${domVal.toFixed(1)}` : 'NEUTRAL';
    domLabel.style.color = dom ? (ef.EMOTIONS?.[dom]?.col || '#fff') : '#aaa';
    domLabel.style.fontFamily = 'Courier New';
    domLabel.style.fontSize = '12px';
    emoRow.appendChild(domLabel);

    const cohBar = document.createElement('div');
    cohBar.style.width = '120px';
    cohBar.style.height = '8px';
    cohBar.style.background = 'rgba(255,255,255,0.08)';
    cohBar.style.border = '1px solid rgba(255,255,255,0.04)';
    const cohFill = document.createElement('div');
    cohFill.style.width = `${Math.round(coh * 100)}%`;
    cohFill.style.height = '100%';
    cohFill.style.background = '#00ffcc';
    cohBar.appendChild(cohFill);
    emoRow.appendChild(cohBar);

    const disBar = document.createElement('div');
    disBar.style.width = '80px';
    disBar.style.height = '8px';
    disBar.style.background = 'rgba(255,255,255,0.08)';
    const disFill = document.createElement('div');
    disFill.style.width = `${Math.round(dis * 100)}%`;
    disFill.style.height = '100%';
    disFill.style.background = '#ff66aa';
    disBar.appendChild(disFill);
    emoRow.appendChild(disBar);
  }

  // Realm indicator and temporal modifiers (compact)
  const realmRowId = 'hud-realm';
  let realmRow = document.getElementById(realmRowId);
  if (!realmRow) {
    realmRow = document.createElement('div');
    realmRow.id = realmRowId;
    realmRow.style.marginTop = '6px';
    realmRow.style.fontFamily = 'Courier New';
    realmRow.style.fontSize = '11px';
    hudEl.appendChild(realmRow);
  }
  const realm = (game.emotionalField && typeof game.emotionalField.calcDistortion === 'function')
    ? (function() {
        const distortion = game.emotionalField.calcDistortion?.() ?? 0;
        const coherence = game.emotionalField.calcCoherence?.() ?? 0.5;
        const valence = game.emotionalField.getValence?.() ?? 0;
        if (distortion >= 0.92) return { name: 'HELL', col: '#ff3344' };
        if (distortion >= 0.75) return { name: 'PURGATORY', col: '#aa66ff' };
        if (coherence >= 0.85 && valence >= 0.15) return { name: 'HEAVEN', col: '#00ffcc' };
        if (valence >= 0.20) return { name: 'IMAGINATION', col: '#00eeff' };
        return { name: 'MIND', col: '#88ffaa' };
      })()
    : { name: 'MIND', col: '#88ffaa' };

  realmRow.textContent = `${realm.name} · ${game.temporalSystem?.getModifiers?.()?.phaseName || ''} ${game.temporalSystem?.getModifiers?.()?.dayName || ''}`;
  realmRow.style.color = realm.col;
}
