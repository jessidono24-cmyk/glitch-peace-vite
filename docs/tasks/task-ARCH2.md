# Task ARCH2 — One Consciousness Engine Across All Modes

## Goal
The emotional field, temporal system, emergence indicators, dream yoga,
and alchemy state should persist and carry across mode switches. Right now
each mode may reinitialize these systems independently. This task makes
the consciousness engine truly global — one continuous experience
regardless of which mode the player is in.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Switching from Grid to Shooter keeps emotion state (doesn't reset to neutral)
- [ ] Lunar phase and planetary day are the same in all modes
- [ ] Emergence level carries across modes
- [ ] Lucidity carries across modes
- [ ] Alchemy seeds carry across modes
- [ ] Achievements track across modes
- [ ] Dashboard (H key) shows same scores in all modes
- [ ] Local time setting persists across modes (see ARCH4)

## Scope — touch ONLY these files
- `src/main.js`
- `src/modes/mode-manager.js`
- Any mode file that calls resetSession() or reinitializes consciousness systems

---

## Step 1 — Audit what gets reset on mode switch

```bash
grep -rn "reset\|init\|new Emotional\|new Temporal\|resetSession" src/modes/
grep -rn "reset\|init\|new Emotional\|new Temporal\|resetSession" src/main.js
```

List everything that resets on mode switch. That's the hit list.

---

## Step 2 — Separate "session reset" from "mode switch"

There are two distinct events that currently both trigger resets:
- **New game / fresh start** → SHOULD reset consciousness systems
- **Mode switch** → should NOT reset consciousness systems

Find where mode switching happens in mode-manager.js. Ensure it calls
`mode.cleanup()` and `newMode.init()` but does NOT reinitialize:
- emotionalField
- temporalSystem  
- dreamYoga
- alchemySystem
- emergenceIndicators
- achievementSystem

These should only reset on explicit "new game" from the title screen.

---

## Step 3 — Global consciousness state object

In main.js, ensure all consciousness systems are instantiated ONCE
at the top level, outside of any mode initialization:

```js
// These live at the TOP LEVEL — never inside mode init
import { emotionalField } from './systems/emotional-engine.js';
import { temporalSystem } from './systems/temporal-system.js';
import { dreamYoga } from './systems/dream-yoga.js';
import { alchemySystem } from './systems/alchemy-system.js';
import { emergenceIndicators } from './systems/awareness/emergence-indicators.js';
import { achievementSystem } from './systems/achievements.js';

// Expose globally so all modes can read them
window._consciousness = {
  emotion: emotionalField,
  temporal: temporalSystem,
  dreamYoga,
  alchemy: alchemySystem,
  emergence: emergenceIndicators,
  achievements: achievementSystem,
};
```

---

## Step 4 — Pass consciousness to each mode

When mode-manager switches modes, pass the consciousness object:

```js
switchMode(modeId) {
  this.currentMode?.cleanup();
  const mode = this.modes[modeId];
  mode.init({ consciousness: window._consciousness });
  this.currentMode = mode;
}
```

Each mode should accept consciousness in its init() and use it rather
than creating its own instances.

---

## Step 5 — Tick consciousness once per frame

In main.js game loop, tick all consciousness systems BEFORE the active
mode's update:

```js
// Consciousness tick (always runs, regardless of mode)
const tmods = temporalSystem.getModifiers();
emotionalField.decay(dt, tmods.coherenceMul);
dreamYoga.tick(dt);
alchemySystem.tick();
emergenceIndicators.tick();
achievementSystem.tick(dt);
achievementSystem.onScoreUpdate(globalScore);
biomeSystem.setEmotion(emotionalField.getDominant());
biomeSystem.update(dt);

// Then tick active mode
modeManager.currentMode?.update(dt, input);
```

## Verification
```bash
npm run build
```
Browser:
1. Start in Grid mode, collect TERROR tiles until fear > 0.3
2. Switch to Shooter mode — fear level should still be ~0.3, not reset
3. `window._consciousness.emotion.getDominant()` returns same emotion
   before and after mode switch
4. Lunar phase same in H dashboard in both modes
5. Achievement popup from Grid mode doesn't re-trigger in Shooter

## Commit message
```
feat: ARCH2 one consciousness engine -- emotional/temporal state persists across modes
```
