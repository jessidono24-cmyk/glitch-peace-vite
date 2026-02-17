// ═══════════════════════════════════════════════════════════════════════
//  TEMPORAL SYSTEM
//  Lunar phases + weekly archetypal rhythm
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
  constructor() {
    this.dayStart = Date.now();
  }

  getLunarPhase() {
    const days = Math.floor((Date.now() - this.dayStart) / 86400000);
    return LUNAR_PHASES[days % LUNAR_PHASES.length];
  }

  getWeekDay() {
    const day = new Date().getDay();
    return WEEK_RHYTHM[day];
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