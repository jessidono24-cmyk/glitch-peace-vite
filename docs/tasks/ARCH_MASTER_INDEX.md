# GLITCH·PEACE — ARCH Task Suite + FIX4-7
# Generated: 2026-02-20

## Overview

This suite addresses four things simultaneously:
1. Immediate fixes (FIX4-7)
2. Navigation architecture (ARCH1)
3. Consciousness continuity (ARCH2)
4. Campaign mode (ARCH3)
5. Local time for temporal systems (ARCH4)
6. Research applied to live systems (ARCH5)

---

## Run Order (strict — each depends on previous)

```
FIX4  — Minimum font sizes (10px floor, menus scale)
FIX5  — RPGMode: export generateGrid, wire mode
FIX6  — Exclude _archive from Vite, add to .gitignore
FIX7  — Rewrite README to reflect actual current state

ARCH1 — Navigation hierarchy: Mode → Dreamscape → Cosmology → Playstyle
ARCH2 — One consciousness engine persists across all mode switches
ARCH3 — Campaign mode: 10-chapter life progression
ARCH4 — Local timezone setting for temporal systems
ARCH5 — Research docs applied as concrete system tuning
```

Merge between every task. Do not batch.

---

## What Each Task Does

| Task | Files Touched | Time Estimate |
|------|--------------|---------------|
| FIX4 | renderer.js, menus.js | 30 min |
| FIX5 | grid.js, mode-manager.js | 20 min |
| FIX6 | vite.config.js, .gitignore | 10 min |
| FIX7 | README.md | 20 min |
| ARCH1 | menus.js, main.js | 2-3 hrs |
| ARCH2 | main.js, mode-manager.js | 1-2 hrs |
| ARCH3 | campaign-story.js, menus.js, main.js | 2 hrs |
| ARCH4 | temporal-system.js, storage.js, menus.js, main.js | 1 hr |
| ARCH5 | 5 system files + main.js | 1-2 hrs |

---

## The Architecture Vision

```
CAMPAIGN (life progression thread — mirrors real consciousness development)
  └── GAME MODES (each a symbolic universe with own rules + aesthetics)
        ├── Grid Roguelike      (consciousness navigation)
        ├── Shooter             (confrontation/integration)
        ├── RPG/Narrative       (story and identity)
        ├── Constellation       (pattern recognition)
        ├── Rhythm              (synchronization)
        ├── Meditation          (stillness practice)
        ├── Alchemy             (transmutation)
        ├── Ornithology         (presence/observation)
        ├── Mycology            (hidden connection)
        └── Architecture        (structure building)
              └── DREAMSCAPES (symbolic environments per mode)
                    └── COSMOLOGIES (Hindu/Norse/Hermetic/Tarot/Buddhist flavor)
                          └── PLAYSTYLES (Balanced/Lucid/Warrior/Sage/Healer/Explorer)
                                └── ONE CONSCIOUSNESS ENGINE
                                      (emotional field + temporal + emergence +
                                       dream yoga + alchemy — always running,
                                       never resets on mode switch)
```

---

## After _archive Removal (manual step, after FIX6 merges)

Run this ONCE locally to remove _archive from git history and
shrink the repo from 409MB to <10MB:

```bash
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch _archive" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

WARNING: Force push rewrites history. Anyone who cloned before will
need to re-clone. Fine for a solo project.

---

## Changelog Format (add to README.md after each task)

After each task merges, add a line to the README changelog:
```
### YYYY-MM-DD
- [TASK ID] Brief description of what changed
```

This keeps the GitHub main page as a live record of progress.

---

## Golden Rules (same as always)

1. ONE task at a time. Build passes, browser test, merge, then next.
2. Touch ONLY files listed in each task's Scope section.
3. Read the audit steps in ARCH1/ARCH2 BEFORE writing any code.
4. If build fails, fix it before moving to next task.
5. Commit format: `feat: ARCH1 description` or `fix: FIX4 description`
