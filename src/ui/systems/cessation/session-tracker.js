'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — session-tracker.js — Phase 7: Cessation Tools
//  Monitors play sessions for healthy patterns and gently suggests breaks.
//  Non-judgmental: all data is local, no shame messaging.
// ═══════════════════════════════════════════════════════════════════════

// ─── Break suggestion thresholds (milliseconds) ───────────────────────
const BREAK_INTERVALS = [
  { ms: 20 * 60 * 1000, id: '20min', msg: "You've been playing 20 minutes — a slow breath helps retention." },
  { ms: 45 * 60 * 1000, id: '45min', msg: 'Wonderful focus — 45 minutes in. Stretch your hands if you like.' },
  { ms: 60 * 60 * 1000, id: '1hr',   msg: "One hour of dreamscapes. A walk will help integrate what you've felt." },
  { ms: 90 * 60 * 1000, id: '90min', msg: "Beautiful dedication — 90 minutes. Rest is part of the journey." },
];

// ─── Session health evaluation ────────────────────────────────────────
function evaluateHealth(durationMs, sessionsToday) {
  if (durationMs < 15 * 60 * 1000)  return { label: 'Focused',    color: '#00ff88', score: 1.0 };
  if (durationMs < 40 * 60 * 1000)  return { label: 'Engaged',    color: '#88ffaa', score: 0.9 };
  if (durationMs < 70 * 60 * 1000)  return { label: 'Extended',   color: '#ffdd00', score: 0.7 };
  if (durationMs < 120 * 60 * 1000) return { label: 'Deep Dive',  color: '#ffaa00', score: 0.5 };
  return                                    { label: 'Rest Needed', color: '#ff6644', score: 0.3 };
}

const STORAGE_KEY = 'gp_sessions';

export class SessionTracker {
  constructor() {
    this._startTime      = null;
    this._pausedAt       = null;
    this._totalPausedMs  = 0;
    this._suggestionsGiven = new Set();
    this._pendingSuggestion = null; // { msg, id }
    this._history        = this._loadHistory();
    this._dreamscapesCompleted = 0;
    this._wellnessScore  = 1.0;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────
  startSession() {
    this._startTime    = Date.now();
    this._pausedAt     = null;
    this._totalPausedMs = 0;
    this._suggestionsGiven.clear();
    this._pendingSuggestion = null;
    this._dreamscapesCompleted = 0;
  }

  pauseSession() {
    if (!this._pausedAt) this._pausedAt = Date.now();
  }

  resumeSession() {
    if (this._pausedAt) {
      this._totalPausedMs += Date.now() - this._pausedAt;
      this._pausedAt = null;
    }
  }

  endSession(score, dreamscapesCompleted) {
    if (!this._startTime) return;
    const duration = this.activeDurationMs;
    this._history.push({
      date:       new Date().toISOString(),
      durationMs: duration,
      score,
      dreamscapesCompleted,
      health:     evaluateHealth(duration, this.sessionsTodayCount).label,
    });
    // Keep only last 30 sessions
    if (this._history.length > 30) this._history = this._history.slice(-30);
    this._saveHistory();
    this._startTime = null;
  }

  onDreamscapeComplete() { this._dreamscapesCompleted++; }

  // ─── Tick — call each game frame ────────────────────────────────
  tick() {
    if (!this._startTime || this._pausedAt) return;

    const duration = this.activeDurationMs;
    this._wellnessScore = evaluateHealth(duration, 0).score;

    // Check break intervals
    for (const interval of BREAK_INTERVALS) {
      if (duration >= interval.ms && !this._suggestionsGiven.has(interval.id)) {
        this._suggestionsGiven.add(interval.id);
        this._pendingSuggestion = { msg: interval.msg, id: interval.id };
      }
    }
  }

  // ─── Consume the pending suggestion (call from pause menu) ───────
  consumeSuggestion() {
    const s = this._pendingSuggestion;
    this._pendingSuggestion = null;
    return s;
  }

  // ─── Accessors ───────────────────────────────────────────────────
  get activeDurationMs() {
    if (!this._startTime) return 0;
    const now = this._pausedAt || Date.now();
    return now - this._startTime - this._totalPausedMs;
  }

  get durationFormatted() {
    const ms  = this.activeDurationMs;
    const m   = Math.floor(ms / 60000);
    const s   = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  get wellnessScore() { return this._wellnessScore; }

  get wellness() {
    return evaluateHealth(this.activeDurationMs, 0);
  }

  get hasPendingSuggestion() { return !!this._pendingSuggestion; }

  get pendingSuggestion() { return this._pendingSuggestion; }

  get sessionsTodayCount() {
    const today = new Date().toDateString();
    return this._history.filter(s => new Date(s.date).toDateString() === today).length;
  }

  get sessionHistory() { return [...this._history]; }

  get dreamscapesCompleted() { return this._dreamscapesCompleted; }

  get totalPlayTimeFormatted() {
    const totalMs = this._history.reduce((acc, s) => acc + (s.durationMs || 0), 0);
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _saveHistory() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._history)); } catch (_) {}
  }

  _loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }
}

export const sessionTracker = new SessionTracker();
