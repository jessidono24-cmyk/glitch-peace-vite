'use strict';

const SAVE_KEY = 'glitch_peace_v4';

export function saveGame(payload) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch(e) { console.warn('Save failed:', e); }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function saveHighScores(scores) {
  try {
    localStorage.setItem(SAVE_KEY + '_scores', JSON.stringify(scores));
  } catch(e) {}
}

export function loadHighScores() {
  try {
    const raw = localStorage.getItem(SAVE_KEY + '_scores');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

// ARCH4: Timezone offset persistence
const TZ_KEY = SAVE_KEY + '_tz_offset';

export function saveTimezoneOffset(offsetHours) {
  try {
    if (offsetHours === null || offsetHours === undefined) {
      localStorage.removeItem(TZ_KEY);
    } else {
      localStorage.setItem(TZ_KEY, String(Number(offsetHours)));
    }
  } catch(e) {}
}

export function loadTimezoneOffset() {
  try {
    const raw = localStorage.getItem(TZ_KEY);
    if (raw === null) return null; // use browser local time
    const n = parseFloat(raw);
    return isNaN(n) ? null : Math.max(-12, Math.min(14, n)); // clamp to valid range
  } catch(e) { return null; }
}

// ── 3-slot memory (save) system ──────────────────────────────────────────

export function loadAllSlots() {
  return [0, 1, 2].map(i => {
    try {
      const data = localStorage.getItem('gp_slot_' + i);
      return data ? { slot: i, empty: false, ...JSON.parse(data) }
                  : { slot: i, empty: true };
    } catch { return { slot: i, empty: true }; }
  });
}

export function saveSlot(i, gameState) {
  localStorage.setItem('gp_slot_' + i, JSON.stringify({
    name:       gameState.playerName  || 'Wanderer',
    dreamscape: gameState.dreamscapeName || 'Void State',
    emergence:  gameState.emergenceLevel || 'DORMANT',
    score:      gameState.score       || 0,
    playTime:   gameState.totalPlayTime  || 0,
    savedAt:    new Date().toLocaleDateString(),
  }));
}

export function loadSlot(i) {
  try {
    const d = localStorage.getItem('gp_slot_' + i);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

export function deleteSlot(i) {
  localStorage.removeItem('gp_slot_' + i);
}
