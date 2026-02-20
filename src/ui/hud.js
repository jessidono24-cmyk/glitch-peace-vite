// Enhanced from: _archive/gp-v5-YOUR-BUILD/src/main.js (HUD)
// Cache element references across frames to avoid repeated DOM queries and repaints
const _hudCache = {};

export function updateHUD(game) {
  if (!game || !game.player) return;
  // ensure hud exists
  const hudEl = _hudCache.hudEl || (_hudCache.hudEl = document.getElementById('hud'));
  if (!hudEl) return;

  // ensure sections
  hudEl.style.display = (game.state === 'PLAYING') ? 'flex' : 'none';

  // update HP
  const hpText = _hudCache.hpText || (_hudCache.hpText = document.getElementById('hp-text'));
  const hpFill = _hudCache.hpFill || (_hudCache.hpFill = document.getElementById('hp-fill'));
  const level = _hudCache.level || (_hudCache.level = document.getElementById('level'));
  const score = _hudCache.score || (_hudCache.score = document.getElementById('score'));
  const objective = _hudCache.objective || (_hudCache.objective = document.getElementById('objective'));

  const hpRounded = Math.round(Math.max(0, game.player.hp || 0));
  const hpMax = game.player.maxHp || 100;
  const hpStr = `${hpRounded}/${hpMax}`;
  if (hpText && hpText.textContent !== hpStr) hpText.textContent = hpStr;
  if (hpFill) {
    const hpRatio = hpRounded / hpMax;
    const pct = `${(hpRatio * 100).toFixed(1)}%`;
    if (hpFill.style.width !== pct) hpFill.style.width = pct;
    // Red flash when low HP
    const newBg = hpRatio < 0.25
      ? 'linear-gradient(90deg, #ff3344, #aa1122)'
      : 'linear-gradient(90deg, #00ff88, #00aa66)';
    if (hpFill.style.background !== newBg) hpFill.style.background = newBg;
  }
  const levelStr = String(game.level || 1);
  if (level && level.textContent !== levelStr) level.textContent = levelStr;
  const scoreStr = String(game.score || 0);
  if (score && score.textContent !== scoreStr) score.textContent = scoreStr;
  // Objective: remaining peace nodes + timer (if timed) + moves left (PUZZLE)
  let objParts = [`◈ ×${Math.max(0, (game.peaceTotal || 0) - (game.peaceCollected || 0))}`];
  if (game.movesRemaining !== undefined) objParts.push(`${game.movesRemaining}↕`);
  if (game.timeRemainingMs !== undefined) {
    const secs = Math.ceil(game.timeRemainingMs / 1000);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    objParts.push(`⏱${mm}:${ss}`);
  }
  const objStr = objParts.join(' · ');
  if (objective && objective.textContent !== objStr) objective.textContent = objStr;

  // Emotional Field indicator (compact) — update in-place instead of rebuild each frame
  const ef = game.emotionalField;
  if (ef) {
    const dom = ef.getDominant?.();
    const domVal = dom ? (ef.values?.[dom] ?? 0) : 0;
    const coh = ef.calcCoherence?.() ?? 0.5;
    const dis = ef.calcDistortion?.() ?? 0;

    // Inject tiny HUD row once; update in-place every frame to avoid flicker
    let emoRow = _hudCache.emoRow || (_hudCache.emoRow = document.getElementById('hud-emo'));
    if (!emoRow) {
      emoRow = document.createElement('div');
      emoRow.id = 'hud-emo';
      emoRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:6px;';

      const domLabel = document.createElement('div');
      domLabel.id = 'hud-emo-label';
      domLabel.style.cssText = 'font-family:Courier New;font-size:12px;min-width:100px;';

      const cohBar = document.createElement('div');
      cohBar.style.cssText = 'width:120px;height:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.04);overflow:hidden;';
      const cohFill = document.createElement('div');
      cohFill.id = 'hud-coh-fill';
      cohFill.style.cssText = 'height:100%;background:#00ffcc;';
      cohBar.appendChild(cohFill);

      const disBar = document.createElement('div');
      disBar.style.cssText = 'width:80px;height:8px;background:rgba(255,255,255,0.08);overflow:hidden;';
      const disFill = document.createElement('div');
      disFill.id = 'hud-dis-fill';
      disFill.style.cssText = 'height:100%;background:#ff66aa;';
      disBar.appendChild(disFill);

      emoRow.appendChild(domLabel);
      emoRow.appendChild(cohBar);
      emoRow.appendChild(disBar);
      hudEl.appendChild(emoRow);
      _hudCache.emoRow = emoRow;
    }

    // Update label text and colour in-place (no DOM rebuild)
    const domLabel = _hudCache.emoLabel || (_hudCache.emoLabel = document.getElementById('hud-emo-label'));
    const cohFill  = _hudCache.cohFill  || (_hudCache.cohFill  = document.getElementById('hud-coh-fill'));
    const disFill  = _hudCache.disFill  || (_hudCache.disFill  = document.getElementById('hud-dis-fill'));

    if (domLabel) {
      const newTxt = dom ? dom.toUpperCase() + ` ${domVal.toFixed(1)}` : 'NEUTRAL';
      const newCol = dom ? (ef.EMOTIONS?.[dom]?.col || '#fff') : '#aaa';
      if (domLabel.textContent !== newTxt) domLabel.textContent = newTxt;
      if (domLabel.style.color !== newCol) domLabel.style.color = newCol;
    }
    if (cohFill) {
      const pct = `${Math.round(coh * 100)}%`;
      if (cohFill.style.width !== pct) cohFill.style.width = pct;
    }
    if (disFill) {
      const pct = `${Math.round(dis * 100)}%`;
      if (disFill.style.width !== pct) disFill.style.width = pct;
    }
  }

  // Realm indicator and temporal modifiers (compact)
  let realmRow = _hudCache.realmRow || (_hudCache.realmRow = document.getElementById('hud-realm'));
  if (!realmRow) {
    realmRow = document.createElement('div');
    realmRow.id = 'hud-realm';
    realmRow.style.cssText = 'margin-top:6px;font-family:Courier New;font-size:11px;';
    hudEl.appendChild(realmRow);
    _hudCache.realmRow = realmRow;
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

  const temporalMods = game.temporalSystem?.getModifiers?.();
  const dreamscape = game.currentDreamscape ? ` · ${game.currentDreamscape}` : '';
  const playMode = game.playMode && game.playMode !== 'ARCADE' ? ` · ${game.playMode}` : '';
  const cosmology = game.currentCosmology ? ` · ${game.currentCosmology.replace(/_/g, ' ').toUpperCase()}` : '';
  let realmText = `${realm.name}${dreamscape}${playMode}${cosmology} · ${temporalMods?.phaseName || ''} ${temporalMods?.dayName || ''}`;

  // Append insight tokens if any earned
  if (game.insightTokens && game.insightTokens > 0) {
    realmText += ` · ☆×${game.insightTokens}`;
  }

  // Append near-miss count (threshold monitor)
  if (game._nearMissCount && game._nearMissCount > 0) {
    realmText += ` · ⚠×${game._nearMissCount}`;
  }

  // Only update DOM when content actually changes (prevents per-frame repaint)
  if (realmRow.textContent !== realmText) realmRow.textContent = realmText;
  if (realmRow.style.color !== realm.col) realmRow.style.color = realm.col;
}

export function renderHUD(game) {
  // Basic HUD HTML generator
  if (!game || !game.player) return '';
  let powerupHTML = '';
  if (Array.isArray(game.activePowerups) && game.activePowerups.length > 0) {
    powerupHTML = `<div class="hud-section" title="Active Power-Ups: Temporary abilities. Timer bar shows duration."><div class="hud-item"><span class="hud-label">Power-Ups</span>`;
    for (const p of game.activePowerups) {
      const timeLeft = Math.max(0, Math.floor((p.expiresAt - Date.now()) / 1000));
      const total = Math.max(1, Math.floor((p.expiresAt - (p.duration ? (p.expiresAt - p.duration) : Date.now())) / 1000));
      const percent = p.duration ? Math.max(0, Math.min(100, 100 * (p.expiresAt - Date.now()) / p.duration)) : 100;
      powerupHTML += `<span style="display:inline-block;margin:0 6px;color:${p.color};font-size:18px;vertical-align:middle;">${p.icon} <span style='font-size:12px;'>${timeLeft}s</span><div style='height:4px;width:32px;background:#222;margin-top:2px;border-radius:2px;overflow:hidden;'><div style='height:100%;width:${percent}%;background:${p.color};opacity:0.7;'></div></div></span>`;
    }
    powerupHTML += `</div></div>`;
  }
  let comboHTML = '';
  if (game.combo && game.combo > 1) {
    comboHTML = `<div class="hud-section" title="Combo: Consecutive successful actions. Higher combo = more score!"><div class="hud-item"><span class="hud-label">Combo</span> <span style="color:#ffcc00;font-size:18px;">x${game.combo}</span></div></div>`;
  }
  return `
    <div class="hud-section" title="Health: If this reaches 0, you lose.">
      <div class="hud-item">
        <span class="hud-label">Health</span>
        <div id="hp-bar"><div id="hp-fill" style="width:${(game.player.hp / (game.player.maxHp || 100)) * 100}%"></div><div id="hp-text">${game.player.hp}/${game.player.maxHp || 100}</div></div>
      </div>
    </div>
    <div class="hud-section" title="Level, Score, and Objective (Peace nodes to collect)">
      <div class="hud-item"><span class="hud-label">Level</span><span class="hud-value" id="level">${game.level}</span></div>
      <div class="hud-item"><span class="hud-label">Score</span><span class="hud-value" id="score">${game.score}</span></div>
      <div class="hud-item"><span class="hud-label">Objective</span><span class="hud-value" id="objective">◈ ×${game.peaceTotal}</span></div>
    </div>
    ${powerupHTML}
    ${comboHTML}
  `;
}
