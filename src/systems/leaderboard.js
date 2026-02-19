// ═══════════════════════════════════════════════════════════════════════
//  LEADERBOARD - Local high score persistence (Phase 10)
//  Stores top 10 runs per dreamscape/mode combination.
//  All data lives in localStorage — privacy-respecting, offline-first.
//  Research: Self-determination theory (Deci & Ryan 1985) — intrinsic
//  motivation is supported by mastery feedback (progress visibility) not
//  external comparison pressure; leaderboard shows personal bests only.
// ═══════════════════════════════════════════════════════════════════════

const LEADERBOARD_KEY = 'glitch-peace-leaderboard';
const MAX_ENTRIES_PER_BUCKET = 10;

/**
 * A single leaderboard entry.
 * @typedef {{ score: number, level: number, mode: string, dreamscape: string, ts: number }} LeaderboardEntry
 */

/** Load all leaderboard data from localStorage. */
function _load() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/** Persist leaderboard data to localStorage. */
function _save(data) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
  } catch (_) {
    // Storage quota exceeded — silently skip
  }
}

/** Derive a bucket key from mode + dreamscape. */
function _bucketKey(mode, dreamscape) {
  const m = (mode || 'ARCADE').toUpperCase();
  const d = (dreamscape || 'RIFT').toUpperCase();
  return `${m}::${d}`;
}

/**
 * Add a completed run to the leaderboard.
 * @param {object} gameState - live game state
 * @returns {number|null} rank (1-based) if the score made the top-10, else null
 */
export function addScore(gameState) {
  const score = gameState.score || 0;
  const level = gameState.level || 1;
  const mode = gameState.playMode || 'ARCADE';
  const dreamscape = gameState.currentDreamscape || 'RIFT';

  /** @type {LeaderboardEntry} */
  const entry = { score, level, mode, dreamscape, ts: Date.now() };
  const key = _bucketKey(mode, dreamscape);
  const data = _load();
  if (!data[key]) data[key] = [];

  data[key].push(entry);
  // Sort descending by score, then by level as tiebreaker
  data[key].sort((a, b) => b.score - a.score || b.level - a.level);
  // Keep only top-N
  const rank = data[key].findIndex(e => e === entry) + 1; // 1-based after sort
  data[key] = data[key].slice(0, MAX_ENTRIES_PER_BUCKET);
  _save(data);

  // If entry was bumped out (rank > MAX), return null
  return rank <= MAX_ENTRIES_PER_BUCKET ? rank : null;
}

/**
 * Get top scores for a given mode/dreamscape combination.
 * @param {string} mode
 * @param {string} dreamscape
 * @returns {LeaderboardEntry[]}
 */
export function getTopScores(mode = 'ARCADE', dreamscape = 'RIFT') {
  const data = _load();
  return data[_bucketKey(mode, dreamscape)] || [];
}

/**
 * Get the all-time global top scores across ALL buckets (flattened, sorted by score).
 * @param {number} limit
 * @returns {LeaderboardEntry[]}
 */
export function getGlobalTopScores(limit = 10) {
  const data = _load();
  const all = Object.values(data).flat();
  all.sort((a, b) => b.score - a.score || b.level - a.level);
  return all.slice(0, limit);
}

/**
 * Get the personal best score for a mode/dreamscape.
 * @param {string} mode
 * @param {string} dreamscape
 * @returns {number}
 */
export function getPersonalBest(mode = 'ARCADE', dreamscape = 'RIFT') {
  const top = getTopScores(mode, dreamscape);
  return top.length ? top[0].score : 0;
}

/** Clear all leaderboard data (used by "Clear Data" option). */
export function clearLeaderboard() {
  localStorage.removeItem(LEADERBOARD_KEY);
}
