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
