// ═══════════════════════════════════════════════════════════════════════
//  TEMPORAL SYSTEM
//  Lunar phases (8) + weekly archetypal rhythm (7)
//  Creates a dual-matrix of time-based gameplay modifiers
// ═══════════════════════════════════════════════════════════════════════

export const LUNAR_PHASES = [
  { id: "new",        name: "New Void",        insight: 1.2, enemy: 0.8 },
  { id: "crescent",   name: "Crescent Rise",   insight: 1.1, enemy: 0.9 },
  { id: "quarter",    name: "Half Light",      insight: 1.0, enemy: 1.0 },
  { id: "gibbous",    name: "Swelling Field",  insight: 0.9, enemy: 1.1 },
  { id: "full",       name: "Full Radiance",   insight: 0.8, enemy: 1.3 },
  { id: "waning",     name: "Waning Flame",    insight: 1.1, enemy: 1.0 },
  { id: "lastQuarter",name: "Last Divide",     insight: 1.0, enemy: 0.9 },
  { id: "dark",       name: "Dark Integration",insight: 1.3, enemy: 0.7 },
];

export const WEEK_RHYTHM = [
  { id: "sun",     name: "Radiant Core",     coherence: 1.2 },
  { id: "moon",    name: "Reflective Tide",  coherence: 1.1 },
  { id: "mars",    name: "Force & Trial",    coherence: 0.9 },
  { id: "mercury", name: "Signal & Motion",  coherence: 1.0 },
  { id: "jupiter", name: "Expansion",        coherence: 1.1 },
  { id: "venus",   name: "Harmony",          coherence: 1.2 },
  { id: "saturn",  name: "Structure",        coherence: 0.95 },
];

export class TemporalSystem {
  constructor(timeZone) {
    // Time zone can be passed in (IANA name) or left undefined for AUTO
    this.dayStart = Date.now();
    const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('glitchpeace.timezone') : null;
    this.timeZone = timeZone || stored || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC') || 'UTC';
  }

  setTimeZone(tz) {
    this.timeZone = tz || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('glitchpeace.timezone', this.timeZone); } catch (e) {}
  }

  getTimeZone() {
    return this.timeZone;
  }

  getLunarPhase() {
    // Compute the calendar date in the configured timeZone, then derive a day count
    const now = new Date();
    let year, month, day;
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: this.timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
      year = Number(parts.find(p => p.type === 'year').value);
      month = Number(parts.find(p => p.type === 'month').value);
      day = Number(parts.find(p => p.type === 'day').value);
    } catch (e) {
      // Fallback to UTC date
      year = now.getUTCFullYear();
      month = now.getUTCMonth() + 1;
      day = now.getUTCDate();
    }

    const dayCount = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    return LUNAR_PHASES[dayCount % LUNAR_PHASES.length];
  }

  getWeekDay() {
    // Determine weekday for the configured timezone
    const now = new Date();
    let year, month, day;
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: this.timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
      year = Number(parts.find(p => p.type === 'year').value);
      month = Number(parts.find(p => p.type === 'month').value);
      day = Number(parts.find(p => p.type === 'day').value);
    } catch (e) {
      year = now.getUTCFullYear();
      month = now.getUTCMonth() + 1;
      day = now.getUTCDate();
    }

    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return WEEK_RHYTHM[weekday];
  }

  getModifiers() {
    const moon = this.getLunarPhase();
    const week = this.getWeekDay();

    return {
      insightMul: moon.insight,
      enemyMul: moon.enemy,
      coherenceMul: week.coherence,
      phaseName: moon.name,
      dayName: week.name,
    };
  }
}
