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
