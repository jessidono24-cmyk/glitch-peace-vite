'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — session-context.js — BOT1: Archetype Character Bots
//  Build context object from live game state for archetype bot decisions.
// ═══════════════════════════════════════════════════════════════════════

export function buildSessionContext(g, emotionalField, dreamYoga, temporalSystem, impulseBuffer, languageSystem) {
  const hour = new Date().getHours();
  return {
    dreamscape: g.ds?.name || 'VOID STATE',
    planet: temporalSystem.getPlanetaryDay?.()?.planet || 'Sun',
    lunarPhase: temporalSystem.getLunarPhase?.()?.name || 'New Moon',
    lucidity: dreamYoga.lucidity || 0,
    dominantEmotion: emotionalField.getDominantEmotion?.()?.id || 'neutral',
    emotionIntensity: emotionalField.distortion || 0,
    distortion: emotionalField.distortion || 0,
    coherence: emotionalField.coherence || 0.5,
    recentTiles: g._recentTiles || [],
    impulsiveMovesRatio: impulseBuffer
      ? (impulseBuffer.proceedCount || 0) / Math.max(1, (impulseBuffer.proceedCount || 0) + (impulseBuffer.stopCount || 0))
      : 0,
    wordsLearnedToday: languageSystem?.sessionCount || 0,
    level: g.level || 1,
    hp: g.hp || 100,
    maxHp: g.maxHp || 100,
    sessionDeaths: g._sessionDeaths || 0,
    sessionMinutes: g._sessionStart ? Math.floor((Date.now() - g._sessionStart) / 60000) : 0,
    timeOfDay: hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
    hourOfDay: hour,
  };
}
