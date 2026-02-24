# Task UI4 — Fix Alchemy Freeze + Ornithology/Mycology Screen Issues

## Goal
Alchemy mode always freezes. Ornithology and Mycology modes have text
all over the screen, don't fill the screen, and are hard to play.
This task fixes the freeze and cleans up both modes.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Alchemy mode does NOT freeze — gameplay proceeds
- [ ] Ornithology mode fills the full screen
- [ ] Ornithology: max 3 lines of text on screen during active play
- [ ] Ornithology: quiz/identification popup is clean and centered
- [ ] Mycology mode fills the full screen
- [ ] Mycology: max 3 lines of text on screen during active play
- [ ] Both modes: HUD text is readable at 14px minimum
- [ ] Both modes: gameplay area centered on screen

## Scope — touch ONLY these files
- `src/gameplay-modes/alchemy-mode.js` (or wherever alchemy lives)
- `src/gameplay-modes/ornithology-mode.js`
- `src/gameplay-modes/mycology-mode.js`
- `src/ui/renderer.js` (rendering sections for these modes only)

---

## Step 1 — Diagnose the alchemy freeze

```bash
grep -n "freeze\|while\|setInterval\|requestAnimationFrame\|infinite\|loop" src/gameplay-modes/alchemy-mode.js 2>/dev/null || \
grep -rn "alchemy" src/modes/ | head -20
```

Common freeze causes:
1. Infinite loop in update() — a `while` that never exits
2. Missing `break` in a switch statement causing cascade
3. An await with no resolution
4. A condition that's always true blocking the game loop

Find the freeze, fix the condition. If uncertain, add a safety guard:
```js
update(dt) {
  // Safety: skip update if dt is unreasonably large (tab was hidden)
  if (dt > 1.0) return;
  // ... rest of update
}
```

---

## Step 2 — Ornithology: reduce text clutter

In ornithology-mode.js, find the render/draw function.
The mode likely draws too many overlapping labels.

Rules to enforce:
- During active observation (bird present on screen): show ONLY the timer and species count
- Bird identification quiz: show ONLY the quiz panel (centered, clean)
- Between birds: show ONLY "Observing..." and the score

Remove from the active play screen:
- Any debug labels
- Full habitat descriptions (save for quiz only)
- Any text that repeats what's already in the HUD

The quiz popup should be:
```
┌─────────────────────────────────┐
│  🐦  SPECIES IDENTIFICATION      │
│                                 │
│  Which species did you observe? │
│  Habitat: ocean · Rarity: rare  │
│                                 │
│  [1] Albatross                  │
│  [2] Mallard                    │
│  [3] Red-tailed Hawk            │
│  [4] Cedar Waxwing              │
│                              8s │
└─────────────────────────────────┘
```

Centered at canvas.width/2, canvas.height/2.
Width: canvas.width * 0.5.

---

## Step 3 — Mycology: reduce text clutter

Same approach as ornithology. During foraging:
- Show ONLY: mushroom count, score, level
- Remove text that overlaps the play area

The forage area should be the RIGHT side of the screen (where mushrooms are).
The LEFT side black void should either:
a) Show subtle mycelium network art (faint connecting lines)
b) Or be filled with more terrain

---

## Step 4 — Both modes: fill full screen

Find where the game area is positioned. Both modes are drawing to only
the right portion of the screen.

```bash
grep -n "offsetX\|offsetY\|startX\|startY\|panelX\|areaX\|gameX" \
  src/gameplay-modes/ornithology-mode.js \
  src/gameplay-modes/mycology-mode.js 2>/dev/null | head -20
```

Replace any hardcoded offsets with canvas-relative values:
```js
// Instead of:
const gameAreaX = 500;  // fixed offset

// Use:
const gameAreaX = canvas.width * 0.05;  // 5% from left edge
const gameAreaW = canvas.width * 0.90;  // 90% of screen width
```

---

## Verification
```bash
npm run build
```
Browser:
1. Enter Alchemy mode → does NOT freeze → gameplay proceeds ✓
2. Enter Ornithology → fills full screen ✓
3. Ornithology during play: only timer and count visible ✓
4. Bird appears → observe → quiz popup: clean, centered ✓
5. Enter Mycology → fills full screen ✓
6. Mycology: mushrooms visible across wider area, minimal text ✓

## Commit message
```
fix: UI4 alchemy freeze fixed + ornithology/mycology full screen and declutter
```
