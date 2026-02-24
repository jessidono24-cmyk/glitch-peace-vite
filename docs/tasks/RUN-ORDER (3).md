# GLITCH·PEACE — Master Run Order
## Updated: 2026-02-24

---

## ✅ COMPLETED

| Task | What it did |
|------|-------------|
| ARCH1 | Viewport/canvas fix, ModeManager wiring |
| RESEARCH-LANG1 | Language learning research doc |
| LANG1a | FSRS scheduler + language content data layer |
| LANG1b | Language mode + wiring into main.js/menus.js |

---

## 🔲 RUN ORDER

```
1. task-MODES2.md          (fix all broken mode launches — blocking)
2. task-FEEDBACK1.md       (close the consciousness feedback loops)
3. task-BOT1.md            (archetype character bots)
4. task-WIRE1.md           (full wiring audit — connect everything)
```

Each runs after the previous is merged. No parallelism in this sequence — order matters.

The research docs (research-feedback-loops.md, research-ai-characters.md) are already
written and go into docs/research/ before running FEEDBACK1 and BOT1 respectively.
They don't run as separate agent tasks — the agents read them as prerequisites.

---

## Step 1 — MODES2 (URGENT — run first)

**File:** `docs/tasks/task-MODES2.md`
**Depends on:** LANG1b merged ✅

**What it fixes:**
- Modes hanging/black-screening after cosmology selection
- RPG mode showing tile grid instead of text interface
- Language quiz showing Japanese when French was selected
- Duplicate Constellation entry in mode list
- Consolidates Twin Stick Shooter into First Person (one shooter mode)
- Adds "Coming Soon" placeholder for modes without a renderer (no silent grid fallthrough)
- Enforces correct world structure per mode (grid only for grid modes)

**Branch:** `fix/modes2-launch-fixes`

**Verify:**
- [ ] Every mode in SELECT GAME MODE launches without freeze or black screen
- [ ] RPG shows no grid tiles
- [ ] French selected → French vocabulary in quiz
- [ ] Only one Constellation entry
- [ ] No Twin Stick entry
- [ ] `npm run build` zero errors

---

## Step 2 — FEEDBACK1

**File:** `docs/tasks/task-FEEDBACK1.md`
**Depends on:** MODES2 merged
**Research doc:** `docs/research/feedback-loops/RESEARCH.md` (already written — copy to repo before running)

**What it builds:**
- Lucidity → world changes (hidden tile glow at 25, enemy slow at 50, lucid state visual at 100)
- Emotional tagging of language cards (FSRS stability bonus for high-arousal word encounters)
- Flow state detection + adaptive difficulty (deaths in 30s window → hazard adjustment)
- Session behavioral insight at level end ("You stepped into DESPAIR 7 times today")
- Impulse journal in pause menu (stops vs. proceeds chart)

**Branch:** `feat/feedback1-consciousness-loops`

**Verify:**
- [ ] Lucidity increases → world visually responds at each threshold
- [ ] French word encountered during fear tile → card marked emotionally tagged
- [ ] 3 deaths in 30s → next level less hazardous
- [ ] Level complete → interlude shows one behavioral insight
- [ ] Pause menu → Patterns tab with impulse data
- [ ] `npm run build` zero errors

---

## Step 3 — BOT1

**File:** `docs/tasks/task-BOT1.md`
**Depends on:** FEEDBACK1 merged
**Research doc:** `docs/research/ai-characters/RESEARCH.md` (already written — copy to repo before running)

**What it builds:**
- All 5 archetype dialogue pools (Dragon, Child Guide, Orb, Teacher, Protector)
- ArchetypeBot: trigger system, 50s cooldown, priority ranking
- Overlay UI: bottom-left, never blocks gameplay, SPACE to dismiss, 6s auto-fade
- Tile event hooks: MEMORY→Child Guide, GLITCH→Orb, GROUNDING→Protector, SELF_HARM→Teacher, ARCHETYPE→Dragon
- Rule-based only — no API, no external deps, works offline

**Branch:** `feat/bot1-archetype-bots`

**Verify:**
- [ ] Play 2+ minutes → at least one archetype message appears
- [ ] Message is bottom-left, doesn't overlap HUD
- [ ] SPACE dismisses immediately
- [ ] Correct archetype fires for each tile type
- [ ] Evening play (8pm+, 20+ min) → Orb gives pre-sleep message
- [ ] 50s cooldown enforced (no spam)
- [ ] `npm run build` zero errors

---

## Step 4 — WIRE1 (Full Wiring Audit)

**File:** `docs/tasks/task-WIRE1.md`
**Depends on:** BOT1 merged
**Recurs:** After every major sprint and as a scheduled Monday agentic workflow

**What it does:**
- Sweeps the entire codebase for disconnected code (imported but unused, exported but never imported, window._ written but never read, stubs, dead loop branches, event handlers never called)
- Writes audit report to `docs/wiring-audit-YYYY-MM-DD.md`
- Fixes P1 issues (broken gameplay) immediately
- Wires P2 issues (data tracked but invisible) to HUD/pause/interlude display
- Cleans up P3 (dead code, orphaned exports)
- Verifies every game mode launches and every consciousness system is visible to the player

**Branch:** `fix/wire1-full-wiring-audit`

**Verify:**
- [ ] Audit report written to docs/
- [ ] All P1 issues resolved (every mode launches, no silent fallthrough)
- [ ] All consciousness system data visible somewhere in UI (LUC, emotion, realm, session patterns)
- [ ] `npm run build` zero errors
- [ ] Smoke test: manually launch every mode, confirm non-black non-grid render

---

## After WIRE1: Development Philosophy Shifts

Once the wiring audit is clean, the approach changes to **one combination at a time**:

Each new feature, refinement, story addition, or visual polish targets exactly:
- One **game mode** (e.g. Grid Classic)
- One **dreamscape** (e.g. Void State)
- One **cosmology** (e.g. Hindu Chakras)
- One **play style** (e.g. Classic Arcade)

That combination is fully built, tested, and verified before the next begins.
This prevents the current problem of broken modes accumulating across sprints.

First artifact of this phase: `docs/COMBINATION_ROADMAP.md` (created during WIRE1).

---

## Dependency Graph

```
ARCH1 ✅ ──┐
            ├──► LANG1a ✅ ──► LANG1b ✅
RESEARCH ✅ ┘
                                  │
                                  ▼
                              MODES2 ──► FEEDBACK1 ──► BOT1 ──► WIRE1
                                                                   │
                                                                   ▼
                                                     One-combination-at-a-time phase
```

---

## Research Docs (copy to repo before running dependent tasks)

| File | Copy to | Required before |
|------|---------|----------------|
| `research-feedback-loops.md` | `docs/research/feedback-loops/RESEARCH.md` | FEEDBACK1 |
| `research-ai-characters.md` | `docs/research/ai-characters/RESEARCH.md` | BOT1 |

---

## World Structure Reference

| Mode | World Type | Must NOT use grid renderer |
|------|-----------|---------------------------|
| Grid Classic | Tile grid | — (correct) |
| Shooter / First Person | Free-space 2D | ✓ |
| RPG Adventure | Text / state machine | ✓ |
| Constellation | Graph / node network | ✓ |
| Meditation | Particle system | ✓ |
| Rhythm | Particle + beat timer | ✓ |
| Alchemy | Physics hybrid | ✓ |
| Ornithology | Free-space 2D sprites | ✓ |
| Mycology | Graph / network | ✓ |
| Architecture | Grid + physics hybrid | ✓ |
| Language | Overlay on dreamscape | ✓ |
| Learning Hub | Text / state machine | ✓ |

Rule: if a mode's renderer isn't built, show styled "Coming Soon" placeholder. Never fall through to grid silently.
