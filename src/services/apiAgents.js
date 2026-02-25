// ── AI CLIENT INITIALIZATION ─────────────────────────────────────────────
//
// SECURITY NOTE: API keys must NEVER be initialized here (renderer bundle).
// In a Vite build, process.env values are inlined into the JS at build time
// and will be visible to anyone who unpacks the shipped game.
//
// CORRECT ARCHITECTURE for when AI features return:
//   1. Keep Anthropic/OpenAI clients in electron/main.cjs (Node context only)
//   2. Expose a narrow IPC API via contextBridge in electron/preload.cjs:
//        window.glitchPeaceElectron.ai.generateDialogue(prompt)
//   3. This file calls window.glitchPeaceElectron.ai.* instead of SDK directly
//
// The IPC stub already exists in electron/main.cjs.
// When ready to wire AI: implement ipcMain.handle('ai:*', ...) handlers there.
//
// For now: all AI calls are no-ops that return null gracefully.

const AI_DISABLED_REASON = 'AI features pending IPC migration (see apiAgents.js)';

export const anthropicClient = null;
export const openaiClient = null;

export async function generateDreamscapeNarrative(config) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function generateArchetypeDialogue(context) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function generateDreamscape(config) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function cosmoTranslate(tradition, gameParameter) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function getRecoveryInsight(context) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function generateLearningModule(subject, difficulty) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function generateEnemyPersonality(enemyType, emotionalContext) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function suggestEmotionalSynergy(emotionalField, gameState) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return null;
}

export async function generateGameContent(batch) {
  console.debug('[AI] ' + AI_DISABLED_REASON);
  return {};
}

export default {
  generateDreamscape,
  cosmoTranslate,
  getRecoveryInsight,
  generateLearningModule,
  generateEnemyPersonality,
  suggestEmotionalSynergy,
  generateGameContent
};
