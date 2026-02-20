'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — leaderboard.js — Daily Challenge Leaderboard
//
//  Real-time leaderboard backed by Supabase (PostgreSQL + realtime).
//  Requires a Supabase project with the following table:
//
//    CREATE TABLE leaderboard (
//      id          BIGSERIAL PRIMARY KEY,
//      score       INTEGER NOT NULL,
//      date        DATE    NOT NULL DEFAULT CURRENT_DATE,
//      dream_hash  TEXT    NOT NULL,
//      player_tag  TEXT    NOT NULL DEFAULT 'ANON',
//      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
//    );
//    CREATE INDEX ON leaderboard (date, score DESC);
//
//    -- Row-Level Security: allow anonymous inserts + reads
//    ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
//    CREATE POLICY "public read"   ON leaderboard FOR SELECT USING (true);
//    CREATE POLICY "public insert" ON leaderboard FOR INSERT WITH CHECK (true);
//
//  Configuration (set before the game starts, or via environment/build):
//    window.GLITCH_SUPABASE_URL  — your project URL
//    window.GLITCH_SUPABASE_KEY  — your project anon (public) key
//
//  These values are safe to expose in the browser (anon key, RLS enforced).
// ═══════════════════════════════════════════════════════════════════════

const TABLE = 'leaderboard';

/** @returns {{ url: string, key: string } | null} */
function _cfg() {
  if (typeof window === 'undefined') return null;
  const url = window.GLITCH_SUPABASE_URL;
  const key = window.GLITCH_SUPABASE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

/**
 * Build common fetch headers for Supabase REST API.
 * @param {{ url: string, key: string }} cfg
 * @returns {Record<string, string>}
 */
function _headers(cfg) {
  return {
    'Content-Type':  'application/json',
    'apikey':        cfg.key,
    'Authorization': `Bearer ${cfg.key}`,
    'Prefer':        'return=representation',
  };
}

/**
 * Submit a daily challenge score to the leaderboard.
 *
 * @param {object} entry
 * @param {number} entry.score       - final score
 * @param {string} entry.dreamHash   - seeded hash identifying the daily run
 * @param {string} [entry.playerTag] - 1–8 char display tag (default 'ANON')
 * @returns {Promise<{ id: number } | null>}  The inserted row id, or null on failure.
 */
export async function submitScore({ score, dreamHash, playerTag = 'ANON' }) {
  const cfg = _cfg();
  if (!cfg) {
    console.info('[Leaderboard] Supabase not configured — score not submitted.');
    return null;
  }

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${TABLE}`, {
      method:  'POST',
      headers: _headers(cfg),
      body: JSON.stringify({
        score,
        // UTC date (YYYY-MM-DD) ensures consistent daily windows across timezones.
        // The daily challenge seed is also derived from UTC date, so they align.
        date:       new Date().toISOString().slice(0, 10),
        dream_hash: dreamHash,
        player_tag: playerTag.toUpperCase().slice(0, 8),
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [row] = await res.json();
    return row ? { id: row.id } : null;
  } catch (err) {
    console.warn('[Leaderboard] submitScore failed:', err.message);
    return null;
  }
}

/**
 * Fetch today's top N scores for a given dreamHash (daily challenge seed).
 *
 * @param {string} dreamHash   - the seeded hash for today's daily challenge
 * @param {number} [limit=10]  - number of entries to return
 * @returns {Promise<Array<{ id, score, player_tag, created_at }>>}
 */
export async function fetchDailyTop(dreamHash, limit = 10) {
  const cfg = _cfg();
  if (!cfg) return [];

  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({
    date:       `eq.${today}`,
    dream_hash: `eq.${dreamHash}`,
    order:      'score.desc',
    limit:      String(limit),
    select:     'id,score,player_tag,created_at',
  });

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${TABLE}?${params}`, {
      headers: {
        'apikey':        cfg.key,
        'Authorization': `Bearer ${cfg.key}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Leaderboard] fetchDailyTop failed:', err.message);
    return [];
  }
}

/**
 * Subscribe to real-time leaderboard updates for today's daily challenge.
 * Requires the Supabase Realtime channel to be enabled on the `leaderboard` table.
 *
 * @param {string}   dreamHash   - seed for today's run
 * @param {Function} onUpdate    - called with { rows: Array } whenever a new score arrives
 * @returns {Function} unsubscribe — call to tear down the subscription
 */
export function subscribeDaily(dreamHash, onUpdate) {
  const cfg = _cfg();
  if (!cfg) return () => {};

  // Supabase Realtime over WebSocket.
  // Security note: the anon key in the URL is the Supabase *public* anon key —
  // it is intentionally client-visible; all data access is restricted by RLS policies.
  // Treat it like an API endpoint slug, not a secret.
  const wsUrl = cfg.url.replace(/^https?/, 'wss') + '/realtime/v1/websocket?apikey=' + cfg.key;
  const ws = new WebSocket(wsUrl);
  const today = new Date().toISOString().slice(0, 10);
  let joined = false;

  ws.onopen = () => {
    // Join the realtime channel for the leaderboard table
    ws.send(JSON.stringify({
      topic:   'realtime:public:leaderboard',
      event:   'phx_join',
      payload: { config: { broadcast: { self: false }, presence: { key: '' } } },
      ref:     '1',
    }));
    joined = true;
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.event === 'INSERT' && msg.payload?.record?.date === today &&
          msg.payload?.record?.dream_hash === dreamHash) {
        // Re-fetch the top scores so the caller always gets a sorted list
        fetchDailyTop(dreamHash).then((rows) => onUpdate({ rows }));
      }
    } catch (_e) {}
  };

  ws.onerror = (e) => console.warn('[Leaderboard] realtime WS error:', e);

  return function unsubscribe() {
    if (joined) {
      try {
        ws.send(JSON.stringify({ topic: 'realtime:public:leaderboard', event: 'phx_leave', payload: {}, ref: '2' }));
      } catch (_e) {}
    }
    ws.close();
  };
}
