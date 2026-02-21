'use strict';

// ================================================================
//  GLITCH-PEACE -- Temporal System (T1)
//  Reads the real-world date to determine:
//    - Current lunar phase (8 phases, approximated)
//    - Current planetary day (7 weekdays mapped to planets)
//  Exposes modifiers that T2 will wire into the game loop.
//  All framing is algorithmic simulation -- no metaphysical claims.
// ================================================================

// ── Lunar phases (8, approximated from known new moon anchor) ────────────
// Known new moon: Jan 29 2025. Cycle = 29.53 days.
const LUNAR_ANCHOR_MS = new Date('2025-01-29').getTime();
const LUNAR_CYCLE_MS  = 29.53 * 24 * 60 * 60 * 1000;

// ── Lunar phases (ARCH5 Research-tuned) ─────────────────────────────────
// Sources:
// • Bevington (2013) J. Pineal Research: melatonin peaks near new moon
//   → new moon = restorative; full moon = activating
// • Cajochen (2013) Current Biology: sleep disrupted at full moon (peak arousal)
// • Cutler (1980) Human Biology: menstrual / hormonal entrainment to lunar cycle
// • Wehr (1999) Nature Medicine: bipolar cycle correlates with moon period
// Tuning: insightMul peaks at Full Moon (1.5→ justified, awareness is heightened).
//   enemyMul gradient reflects activation cycle (0.85 new → 1.25 full → 0.85 again).
//   Waxing Gibbous insightMul raised to 1.35 (Bevington: pre-full heightened alertness).
const LUNAR_PHASES = [
  { name: 'New Moon',          fraction: 0.00, insightMul: 1.0,  enemyMul: 0.80, desc: 'Seed — quiet spawns, melatonin peak (Bevington 2013)' },
  { name: 'Waxing Crescent',   fraction: 0.13, insightMul: 1.1,  enemyMul: 0.90, desc: 'Build — gentle challenge increase' },
  { name: 'First Quarter',     fraction: 0.25, insightMul: 1.2,  enemyMul: 1.00, desc: 'Momentum — balanced tension' },
  { name: 'Waxing Gibbous',    fraction: 0.38, insightMul: 1.35, enemyMul: 1.12, desc: 'Amplify — pre-full alertness peak (Bevington 2013)' },
  { name: 'Full Moon',         fraction: 0.50, insightMul: 1.5,  enemyMul: 1.25, desc: 'Illuminate — peak activation, sleep disruption (Cajochen 2013)' },
  { name: 'Waning Gibbous',    fraction: 0.63, insightMul: 1.2,  enemyMul: 1.10, desc: 'Release — pruning, closure rewards' },
  { name: 'Last Quarter',      fraction: 0.75, insightMul: 1.1,  enemyMul: 0.98, desc: 'Reflect — integration, story fragments' },
  { name: 'Waning Crescent',   fraction: 0.88, insightMul: 1.0,  enemyMul: 0.85, desc: 'Rest — soft spawns, melatonin rising again' },
];

// ── Weekly planetary days ─────────────────────────────────────────────────
// Sun=0 Mon=1 Tue=2 Wed=3 Thu=4 Fri=5 Sat=6
const PLANETARY_DAYS = [
  { planet: 'Sun',     coherenceMul: 1.20, insightMul: 1.10, themes: ['Radiance', 'Will', 'Clarity'],        desc: 'Visibility bonuses, coherence stabilisation' },
  { planet: 'Moon',    coherenceMul: 1.10, insightMul: 1.05, themes: ['Dream', 'Tide', 'Reflection'],        desc: 'Dreamscape bias, softer soundscape' },
  { planet: 'Mars',    coherenceMul: 0.85, insightMul: 1.20, themes: ['Trial', 'Courage', 'Initiation'],     desc: 'Enemies more aggressive, higher rewards' },
  { planet: 'Mercury', coherenceMul: 1.05, insightMul: 1.35, themes: ['Signal', 'Learning', 'Pathfinding'], desc: 'Insight tokens more common, puzzles' },
  { planet: 'Jupiter', coherenceMul: 1.15, insightMul: 1.25, themes: ['Expansion', 'Wisdom', 'Fortune'],    desc: 'Map grows, upgrade shop richer' },
  { planet: 'Venus',   coherenceMul: 1.25, insightMul: 1.15, themes: ['Harmony', 'Beauty', 'Love'],         desc: 'Healing nodes, softer hazards' },
  { planet: 'Saturn',  coherenceMul: 0.90, insightMul: 1.00, themes: ['Structure', 'Limits', 'Discipline'], desc: 'Walls and boundaries, planning bonuses' },
];

// ── Core calculations ─────────────────────────────────────────────────────
function getLunarFraction() {
  const elapsed = Date.now() - LUNAR_ANCHOR_MS;
  // Handle dates before the anchor
  const cycleMs = ((elapsed % LUNAR_CYCLE_MS) + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS;
  return cycleMs / LUNAR_CYCLE_MS; // 0.0 – 1.0
}

function getLunarPhase() {
  const fraction = getLunarFraction();
  // Find the phase whose fraction is closest without exceeding
  let phase = LUNAR_PHASES[0];
  for (const p of LUNAR_PHASES) {
    if (fraction >= p.fraction) phase = p;
  }
  return phase;
}

function getPlanetaryDay(utcOffsetHours) {
  let dayOfWeek;
  if (utcOffsetHours !== null && utcOffsetHours !== undefined) {
    // ARCH4: Use player-configured UTC offset for accurate local day
    const nowUtcMs = Date.now() + utcOffsetHours * 3600000;
    dayOfWeek = new Date(nowUtcMs).getUTCDay(); // 0=Sun … 6=Sat in configured tz
  } else {
    dayOfWeek = new Date().getDay(); // 0=Sun … 6=Sat in browser local time
  }
  return PLANETARY_DAYS[dayOfWeek];
}

// ── Public API ────────────────────────────────────────────────────────────
export class TemporalSystem {
  constructor() {
    this._utcOffsetHours = null; // ARCH4: null = use browser local time
    this._lunar  = getLunarPhase();
    this._planet = getPlanetaryDay(this._utcOffsetHours);
    this._lastRefresh = 0;
  }

  // ARCH4: Set UTC offset (hours from UTC, e.g. -5 for EST, +9 for JST).
  // Pass null to revert to browser local time.
  setTimezoneOffset(utcOffsetHours) {
    this._utcOffsetHours = (utcOffsetHours !== null && utcOffsetHours !== undefined)
      ? Math.max(-12, Math.min(14, Number(utcOffsetHours)))
      : null;
    this.refresh();
  }

  getTimezoneOffset() {
    return this._utcOffsetHours;
  }

  // Call once per game-start (or once per real minute is fine)
  refresh() {
    this._lunar  = getLunarPhase();
    this._planet = getPlanetaryDay(this._utcOffsetHours);
    this._lastRefresh = Date.now();
  }

  // Returns the current lunar phase object
  getLunarPhase()   { return this._lunar;  }

  // Returns the current planetary day object
  getPlanetaryDay() { return this._planet; }

  // Combined enemy speed multiplier (lower = faster enemies)
  // enemyMul < 1 means enemies are slower (easier days)
  // enemyMul > 1 means enemies are faster (harder days)
  getEnemyMul() {
    const base = this._lunar.enemyMul;
    // Mars day makes enemies 10% more aggressive on top of lunar
    const dayBonus = this._planet.planet === 'Mars' ? 0.10 : 0;
    return base + dayBonus;
  }

  // Combined insight token value multiplier
  getInsightMul() {
    return this._lunar.insightMul * (this._planet.insightMul ?? 1.0);
  }

  // Coherence multiplier for emotional decay (from planetary day only)
  getCoherenceMul() {
    return this._planet.coherenceMul ?? 1.0;
  }

  // Convenience: everything packaged for the game loop
  getModifiers() {
    return {
      enemyMul:     this.getEnemyMul(),
      insightMul:   this.getInsightMul(),
      coherenceMul: this.getCoherenceMul(),
      lunarName:    this._lunar.name,
      planetName:   this._planet.planet,
      lunarDesc:    this._lunar.desc,
      planetDesc:   this._planet.desc,
      themes:       this._planet.themes,
    };
  }
}

// Singleton export -- import this instance everywhere
export const temporalSystem = new TemporalSystem();
