// ═══════════════════════════════════════════════════════════
// STORAGE - Save/Load system
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

const SAVE_KEY = 'glitch-peace-save';

export function saveGame(gameState) {
  const saveData = {
    level: gameState.level,
    score: gameState.score,
    player: {
      hp: gameState.player.hp,
      maxHp: gameState.player.maxHp
    },
    settings: {...gameState.settings},
    timestamp: Date.now()
  };
  
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  return true;
}

export function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

export function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSaveData() {
  localStorage.removeItem(SAVE_KEY);
}

// 🔌 LAYER 2 EXPANSION: Add export/import JSON
// export function exportSave() { ... }
// export function importSave(jsonString) { ... }
