# COMBINATION ROADMAP

Created after WIRE1 audit pass (2026-02-24).

## Philosophy

One combination at a time. Each new feature, refinement, or story addition
targets a specific intersection of:

- **Game mode** (e.g. Grid Classic, RPG, Constellation)
- **Dreamscape** (e.g. Void State, Mountain Dragon, Crystal Cave)
- **Cosmology** (e.g. Hindu Chakras, Tarot Archetypes, Elements)
- **Play style** (e.g. Classic Arcade, Zen, Speedrun, Ritual Space)

This combination is fully built, tested, and smoke-verified before moving
to the next. No more "add it everywhere at once" — scope tightly, ship clean.

---

## Current Baseline (post-WIRE1)

All 11 GAME_MODES launch without freeze and render correctly:

| Mode | Status |
|------|--------|
| Grid Classic | ✅ Stable |
| First Person (FPS) | ✅ Stable |
| RPG Adventure | ✅ Stable |
| Ornithology | ✅ Stable |
| Mycology | ✅ Stable |
| Architecture | ✅ Stable |
| Constellation | ✅ Stable |
| Alchemy | ✅ Stable |
| Rhythm Mode | ✅ Stable |
| Learning Hub | ✅ Stable |
| Language Learning | ✅ Stable |

---

## Priority Combinations Queue

Work through these in order. Mark `[x]` when the combination is fully
built, playtested, and verified.

### Tier 1 — Foundation (Grid Classic)

- [ ] **Grid Classic × Void State × Chakras × Classic Arcade**
  - _Target_: The definitive "first run" experience. LUC bar, emotion HUD,
    chakra flash, and bot messages all tuned to Void State palette.
  - _Success criteria_: 5-minute playtest with no console errors; all HUD
    elements visible; bot messages appear at least once per run.

- [ ] **Grid Classic × Mountain Dragon × Tarot Archetypes × Zen**
  - _Target_: Slow-pace exploration feel. Auto-heal active. Tarot
    archetype dialogue wired to Zen pace.
  - _Dependencies_: COSMOLOGY1 (tarot-archetypes wiring)

- [ ] **Grid Classic × Courtyard × Elements × Ritual Space**
  - _Target_: Full alchemy loop. Constellation flash rewards. Skymap tiles
    collect named constellations.
  - _Dependencies_: WIRE1-FOLLOWUP (alchemy play-mode activation verified)

### Tier 2 — Narrative Modes

- [ ] **RPG Adventure × Neighborhood × Tarot Archetypes × Classic Arcade**
  - _Target_: First complete quest chain (first_light + the_witness).
    Archetype dialogue fires on correct tiles.
  - _Dependencies_: NARRATIVE1 (campaignStory wiring)

- [ ] **Constellation × Void Nexus × Chakras × Classic Arcade**
  - _Target_: Star-connection gameplay with chakra flash on correct
    constellation completion.

### Tier 3 — Learning Focus

- [ ] **Language Learning × Leaping Field × None × Classic Arcade**
  - _Target_: FSRS-5 card review loop runs for at least one full session.
    Vocabulary words displayed correctly in target language.

- [ ] **Learning Hub × Integration × None × Scholar**
  - _Target_: All discipline branches load and display a challenge.

### Tier 4 — Sensory / Immersive

- [ ] **Rhythm Mode × Solar Temple × None × Rhythm Beat**
  - _Target_: Beat-sync grid moves. Beat countdown indicator visible.
    Music engine responds to dominant emotion.

- [ ] **First Person × Void Nexus × None × Classic Arcade**
  - _Target_: Corridor renders without freeze. ESC pause works. No
    console errors on launch.

### Tier 5 — Bot & Consciousness Integration

- [ ] **Grid Classic × Any × Any × Any — with ArchetypeBot active**
  - _Target_: Bot messages appear at least once per 50-second interval.
    Tile-triggered messages fire on ARCHETYPE tiles.
  - _Dependencies_: WIRE1-FOLLOWUP (bot tick wired for non-grid modes)

---

## Deferred Combinations

These require prerequisite tasks to complete first:

| Combination | Requires |
|-------------|---------|
| Any mode × Tarot Archetypes | COSMOLOGY1 |
| Campaign chapter progression | NARRATIVE1 |
| Co-op any mode | Phase M8 |
| ArchetypeBot in non-grid modes | WIRE1-FOLLOWUP |

---

## How to Add a New Combination

1. Choose one slot from the queue above (or add a new row).
2. Create a task file: `docs/tasks/task-COMB-{ID}.md`
3. Specify: mode + dreamscape + cosmology + play style + success criteria.
4. Build and test only that combination.
5. Mark `[x]` here and update `docs/wiring-audit-{date}.md` if any new
   wiring is discovered.
