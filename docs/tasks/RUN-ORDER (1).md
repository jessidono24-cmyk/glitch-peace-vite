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

## 🔲 NEXT — Priority Queue

```
STEP 1:  task-MODES2.md       (fix all broken/wrong modes — URGENT)
STEP 2:  task-FEEDBACK1.md    (close the consciousness feedback loops)
STEP 3:  task-BOT1.md         (archetype character bots)
```

These run **in order** — MODES2 first (blocking bugs), then FEEDBACK1, then BOT1.

---

## Step 1 — MODES2 (URGENT)

**File:** `docs/tasks/task-MODES2.md`
**Priority:** Blocking — modes that don't launch are broken product

Fixes: modes hanging after cosmology selection, RPG showing grid, language quiz wrong language (French selected → Japanese shown), duplicate Constellation entry, consolidates Twin Stick into First Person, adds "Coming Soon" placeholders for unbuilt renderers.

**Branch:** `fix/modes2-launch-fixes`

**Verify:**
- [ ] Every mode launches without freeze or black screen
- [ ] RPG shows no grid tiles
- [ ] French selected → French vocabulary in quiz (not Japanese)
- [ ] Only one Constellation entry in mode list
- [ ] `npm run build` zero errors

---

## Step 2 — FEEDBACK1

**File:** `docs/tasks/task-FEEDBACK1.md`
**Research:** `docs/research/feedback-loops/RESEARCH.md`

Builds the loops that make the consciousness systems meaningful:
- Lucidity → world changes (hidden glow, enemy slow, lucid state visual at 100)
- Emotional tagging of language cards (FSRS stability bonus for emotionally-charged encounters)
- Flow state detection + adaptive difficulty (too hard / too easy / flow)
- Session behavioral insight at level end ("You stepped into DESPAIR 7 times today")
- Impulse journal in pause menu (stops vs. proceeds chart)

**Branch:** `feat/feedback1-consciousness-loops`

---

## Step 3 — BOT1

**File:** `docs/tasks/task-BOT1.md`
**Research:** `docs/research/ai-characters/RESEARCH.md`

Builds the archetype voice system:
- All 5 archetype dialogue pools (Dragon, Child Guide, Orb, Teacher, Protector)
- ArchetypeBot class: trigger conditions + 50s cooldown
- Overlay UI (bottom-left, never blocks gameplay, SPACE to dismiss)
- Tile event hooks (MEMORY → Child Guide, GLITCH → Orb, GROUNDING → Protector, etc.)
- Rule-based only (no API, no external deps)

**Branch:** `feat/bot1-archetype-bots`

---

## Dependency Graph

```
ARCH1 ✅ ──┐
            ├──► LANG1a ✅ ──► LANG1b ✅ ──► MODES2 ──► FEEDBACK1 ──► BOT1
RESEARCH ✅ ┘
```

---

## World Structure Per Mode (Reference)

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

Rule: if a mode's renderer isn't built yet, show styled "Coming Soon" placeholder. Never fall through to grid silently.

---

## Research Documents

| File | Used by |
|------|---------|
| `docs/research/language-learning/RESEARCH.md` | LANG1a, LANG1b (done) |
| `docs/research/feedback-loops/RESEARCH.md` | FEEDBACK1 |
| `docs/research/ai-characters/RESEARCH.md` | BOT1 |
