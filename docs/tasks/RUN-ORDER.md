# Run Order — ARCH1 → RESEARCH-LANG1 → LANG1

## Quick Reference

```
STEP 1:  task-ARCH1.md          (canvas + ModeManager — run alone, no deps)
STEP 2:  task-RESEARCH-LANG1.md (docs only — can run in parallel with ARCH1)
STEP 3:  task-LANG1.md          (requires ARCH1 + RESEARCH-LANG1 both done)
```

---

## Step 1 — ARCH1 (run first, alone)

**File:** `docs/tasks/task-ARCH1.md`
**Depends on:** nothing
**Can be parallelized with:** RESEARCH-LANG1 (docs only, no code conflict)

**What it does:**
- Fixes the root cause of ALL black bars and ALL broken non-grid modes
- `CW()`/`CH()` return ~588×688px grid dimensions; every mode renders in that tiny box
- Adds `VW()`/`VH()` for viewport dimensions
- Fixes `resizeCanvas()` to use `window.innerWidth / window.innerHeight`
- Fixes `drawGame()` to use canvas dimensions instead of hardcoded grid size
- Centers grid in full viewport
- Wires existing `ModeManager` into `main.js` loop (it exists but is unused)
- Adds freeze guard to alchemy mode
- Adds early return for RPG mode (stops grid tile fallthrough)
- Fixes ornithology HUD text clip

**How to run:**
```
Give agent: task-ARCH1.md
Branch: fix/arch1-viewport-canvas
```

**Verify complete:**
- [ ] `npm run build` passes
- [ ] No black bars on any screen
- [ ] Grid centered in full viewport
- [ ] Alchemy does not freeze
- [ ] RPG shows no grid tiles

---

## Step 2 — RESEARCH-LANG1 (can run in parallel with ARCH1)

**File:** `docs/tasks/task-RESEARCH-LANG1.md`
**Depends on:** nothing (docs only, no code)
**Can be parallelized with:** ARCH1

**What it does:**
- Writes `docs/research/language-learning/RESEARCH.md`
- 30–50 sourced references in structured format
- Heavy emphasis on polyglot/polymath research (Erard, Lomb, Machová,
  Lampariello, Simcott, Kaufmann, Arguelles)
- FSRS vs SM2 comparison (why SM2 is obsolete)
- Contested findings section (bilingual advantage debate, Krashen critiques)
- Game mechanics mapping table
- Design Principles summary section
- This file is what the LANG1 agent reads before building the mode

**How to run:**
```
Give agent: task-RESEARCH-LANG1.md
Branch: docs/research-lang1-sources
```

**Verify complete:**
- [ ] `docs/research/language-learning/RESEARCH.md` exists
- [ ] 30+ sources in structured format
- [ ] Polyglot section present (8+ sources)
- [ ] Contested findings section present
- [ ] Mechanics mapping table present
- [ ] Design Principles section present

---

## Step 3 — LANG1 (requires both ARCH1 and RESEARCH-LANG1)

**File:** `docs/tasks/task-LANG1.md`
**Depends on:** ARCH1 (canvas must fill viewport) + RESEARCH-LANG1 (agent reads sources first)

**What it does:**
- Implements the Language Learning game mode
- FSRS-5 scheduler in `src/core/fsrs.js` (not SM2)
  - Tracks D (difficulty), S (stability), R (retrievability) per word
  - ~90% benchmark success rate vs ~47% for SM2
- Language content in `src/data/language-content.js`
  - French, Spanish, Japanese minimum
  - 30+ words per language
  - Words organized by dreamscape context (not just alphabetically)
- Three-layer mode in `src/modes/language-mode.js`:
  - Layer 1 IMMERSION: words drift as ambient labels in dreamscape
  - Layer 2 ACQUISITION: FSRS-scheduled recognition quiz
  - Layer 3 PRODUCTION: see meaning, select/type the word
- Wired into `main.js` and `menus.js`
- Uses `window.innerWidth/Height` internally — NOT `CW()`/`CH()`

**How to run:**
```
Give agent: task-LANG1.md
(agent reads docs/research/language-learning/RESEARCH.md first — it will find it)
Branch: feat/lang1-language-mode
```

**Verify complete:**
- [ ] Language Learning in mode select
- [ ] Language selector shows French / Spanish / Japanese
- [ ] Immersion phase shows floating ambient word labels
- [ ] Quiz shows word + 4 options
- [ ] Every 3rd quiz is production (meaning → word)
- [ ] Feedback shows D/S/R values + next interval
- [ ] Stats screen shows session retention
- [ ] No grid tiles visible
- [ ] Canvas fills screen (no black bars)
- [ ] Does not freeze

---

## Dependency Graph

```
ARCH1 ──────────────────────────────────────────────────────► LANG1
                                                                  ▲
RESEARCH-LANG1 ─────────────────────────────────────────────────┘

(ARCH1 and RESEARCH-LANG1 have no dependencies on each other —
 they can run simultaneously in separate Codespaces branches)
```

---

## Notes for Agent

- **ARCH1** is surgical — it does NOT rewrite existing mode files.
  It adds two functions, fixes three calculations, wires one existing class.
  The ModeManager and GameMode base class already exist and are well-designed.
  They just aren't being used. ARCH1 connects them.

- **RESEARCH-LANG1** writes real citations. The agent should not invent
  sources. All listed sources are real published works. If a source cannot
  be verified, mark it as [UNVERIFIED] rather than fabricating details.

- **LANG1** reads `docs/research/language-learning/RESEARCH.md` before writing
  any code. The Design Principles section in that doc is the brief the agent
  uses for all design decisions in the mode.

- All three tasks begin with a three-section audit (ACTUALLY IMPLEMENTED /
  CODE EXISTS BUT BROKEN / DOCUMENTED ONLY). Do not skip this step.
  The audit has caught bugs in previous sessions that the code-writing would
  have missed.
