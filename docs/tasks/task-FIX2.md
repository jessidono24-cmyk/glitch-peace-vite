# Task FIX2 — Wire src/gameplay-modes/ into ModeManager

## Goal
There are 10 mode classes in `src/gameplay-modes/` that are complete but
never imported anywhere. Meanwhile `src/modes/` contains a parallel set
of modes that IS wired. This task maps which gameplay-modes classes
should replace or augment the active ones, then updates the imports so
all modes are actually reachable in the game.

## Definition of Done
- [ ] `npm run build` passes
- [ ] All modes selectable from the mode select screen are actually running
      their own update/render logic (not falling back to grid mode)
- [ ] Twin-stick Shooter mode feels distinct from Grid mode
- [ ] Constellation mode loads (even if 3D is partial)
- [ ] No "undefined is not a function" errors in console when switching modes
- [ ] Old orphaned mode files noted but NOT deleted yet (FIX3 handles cleanup)

## Scope — touch ONLY these files
- `src/main.js`
- `src/modes/mode-manager.js`
- Any import statements that reference mode classes

Do NOT touch the gameplay-modes files themselves or any game logic files.

---

## Step 1 — Audit before touching anything

Before writing a single line, run this in the terminal and paste output
into a comment at the top of your PR:

```bash
# What's in gameplay-modes?
ls src/gameplay-modes/

# What's in modes/ (currently active)?
ls src/modes/

# What does mode-manager.js currently import?
grep -n "import" src/modes/mode-manager.js

# What does main.js import for modes?
grep -n "import\|mode\|Mode" src/main.js | head -40
```

This tells you the exact mapping before making changes.

---

## Step 2 — Map old → new

Based on the audit, create a mapping like this (adjust based on actual
filenames found):

| gameplay-modes/ file | Replaces or augments | Active in modes/ |
|---------------------|---------------------|-----------------|
| shooter-mode.js | twin-stick-shooter | shooter.js or grid-mode.js |
| constellation-mode.js | constellation | constellation.js |
| rpg-mode.js | RPG overlay | grid-mode.js |
| meditation-mode.js | meditation | meditation-mode.js |
| rhythm-mode.js | rhythm | rhythm-mode.js |

---

## Step 3 — Update imports in mode-manager.js

For each mode that has a better implementation in gameplay-modes/, update
the import to point to the gameplay-modes version:

```js
// BEFORE (example):
import { ShooterMode } from './shooter.js';

// AFTER:
import { ShooterMode } from '../gameplay-modes/shooter-mode.js';
```

Only swap imports where the gameplay-modes/ version is MORE complete than
the current active version. If the current version is already good, leave
it alone.

---

## Step 4 — Verify each mode registers correctly

In mode-manager.js, ensure each mode is registered with a unique string
key that matches what the mode select screen uses:

```js
this.modes = {
  'grid':          new GridMode(),
  'shooter':       new ShooterMode(),
  'constellation': new ConstellationMode(),
  'meditation':    new MeditationMode(),
  'rhythm':        new RhythmMode(),
  'rpg':           new RPGMode(),
  // add any others found in gameplay-modes/
};
```

## Verification
```bash
npm run build
```
Browser:
1. From mode select screen, choose Shooter — feels like twin-stick, not grid
2. Choose Constellation — loads star/constellation visuals
3. Choose Meditation — loads calm mode, different from grid
4. Choose Grid — still works exactly as before
5. No console errors when switching between any two modes

## Commit message
```
fix: FIX2 wire gameplay-modes directory -- all modes now reachable
```
