// ═══════════════════════════════════════════════════════════════════════
//  SESSION ANALYTICS - Cross-session statistics (Phase 10)
//  Tracks lifetime engagement metrics stored in localStorage.
//  Design principle: transparency not surveillance — player can always
//  view and wipe their data. No data leaves the device.
//  Research: Self-efficacy (Bandura 1977) — seeing growth over time
//  reinforces belief in one's ability to change and grow.
// ═══════════════════════════════════════════════════════════════════════

const ANALYTICS_KEY = 'glitch-peace-analytics';

/** @typedef {{ totalSessions: number, totalMinutes: number, totalPeace: number, totalLevels: number, peakScore: number, peakLevel: number, emotionLog: Record<string,number>, dreamscapeVisits: Record<string,number>, modeVisits: Record<string,number>, firstSeen: number, lastSeen: number }} AnalyticsData */

/** Load analytics from localStorage. */
function _load() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    totalSessions: 0,
    totalMinutes: 0,
    totalPeace: 0,
    totalLevels: 0,
    peakScore: 0,
    peakLevel: 0,
    emotionLog: {},
    dreamscapeVisits: {},
    modeVisits: {},
    firstSeen: Date.now(),
    lastSeen: Date.now(),
  };
}

/** Persist analytics to localStorage. */
function _save(data) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (_) {}
}

/**
 * Record the end of a session (called on game-over or quit-to-title).
 * @param {object} gameState - live game state
 */
export function recordSession(gameState) {
  const data = _load();

  data.totalSessions += 1;
  data.lastSeen = Date.now();

  // Session duration in minutes — rounded to 2 decimal places to avoid floating-point drift
  const sessionMs = gameState._sessionStartMs ? (Date.now() - gameState._sessionStartMs) : 0;
  data.totalMinutes = Math.round((data.totalMinutes + sessionMs / 60000) * 100) / 100;

  // Peace nodes and levels
  data.totalPeace += (gameState.peaceCollected || 0);
  data.totalLevels += Math.max(0, (gameState.level || 1) - 1);

  // Peak score / level
  if ((gameState.score || 0) > data.peakScore) data.peakScore = gameState.score;
  if ((gameState.level || 1) > data.peakLevel) data.peakLevel = gameState.level;

  // Emotional field — record dominant emotion per session
  const ef = gameState.emotionalField;
  if (ef && typeof ef.getDominant === 'function') {
    const dom = ef.getDominant();
    if (dom) data.emotionLog[dom] = (data.emotionLog[dom] || 0) + 1;
  }

  // Dreamscape visits
  const ds = (gameState.currentDreamscape || 'RIFT').toUpperCase();
  data.dreamscapeVisits[ds] = (data.dreamscapeVisits[ds] || 0) + 1;

  // Mode visits
  const mode = (gameState.playMode || 'ARCADE').toUpperCase();
  data.modeVisits[mode] = (data.modeVisits[mode] || 0) + 1;

  _save(data);
}

/** Get the full analytics object (read-only view). */
export function getAnalytics() {
  return _load();
}

/**
 * Get a formatted summary string for a given key (for Stats Dashboard).
 * @returns {{ sessions: number, minutes: number, peakScore: number, peakLevel: number, topEmotion: string, topDreamscape: string }}
 */
export function getAnalyticsSummary() {
  const d = _load();
  const topEmotion = Object.entries(d.emotionLog).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const topDreamscape = Object.entries(d.dreamscapeVisits).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  return {
    sessions: d.totalSessions,
    minutes: Math.round(d.totalMinutes),
    totalPeace: d.totalPeace,
    peakScore: d.peakScore,
    peakLevel: d.peakLevel,
    topEmotion,
    topDreamscape,
  };
}

/** Wipe all analytics data. */
export function clearAnalytics() {
  localStorage.removeItem(ANALYTICS_KEY);
}
