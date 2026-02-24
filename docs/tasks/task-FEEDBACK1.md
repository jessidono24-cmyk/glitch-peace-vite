# Task FEEDBACK1 — Feedback Loop Systems: Close the Consciousness Loops

**Priority: HIGH — transforms isolated systems into a real consciousness engine**
**Depends on: LANG1a + LANG1b complete, ARCH1 complete**
**Research ref: docs/research/feedback-loops/RESEARCH.md**

---

## Audit First

```bash
# Check current state of all consciousness systems
grep -n "lucidity\|LUC\|dreamYoga\|rcActive" src/main.js | head -20
grep -n "emotionalField\|EmotionalField\|distortion\|coherence" src/main.js | head -20
grep -n "impulseBuffer\|proceedCount\|stopCount" src/main.js | head -10
grep -n "emergenceIndicators\|record\b" src/main.js | head -20

# Check what feedback currently exists at level end
grep -n "interlude\|levelEnd\|LEVEL_END\|session.*summary\|endScreen" src/main.js | head -20
grep -n "drawInterlude\|interludeData\|dreamComplete" src/ui/renderer.js src/ui/menus.js 2>/dev/null | head -20
```

Produce three-section audit before writing any code:
1. **LOOPS ALREADY CLOSED** — action → signal → feedback → behavior change already wired
2. **SIGNAL EXISTS, FEEDBACK MISSING** — system tracks data but player never sees/feels it
3. **NOT YET IMPLEMENTED** — loop described in research but zero code

---

## Loop 1: Lucidity → World Changes (P1)

**What changes**: When `dreamYoga.lucidity` crosses thresholds, the game world visibly responds. This closes the reality-check habit loop — player now has intrinsic motivation to maintain lucidity.

```
Thresholds and effects:
- lucidity >= 25: HIDDEN tiles emit a subtle glow (player begins to "see through" the dream)
- lucidity >= 50: Enemy move speed reduced 10% (heightened awareness = slower chaos)
- lucidity >= 75: ARCHETYPE tiles appear more frequently (+30% spawn weight)
- lucidity >= 100: "LUCID STATE" — special visual mode for duration of level
  - Canvas gets a subtle luminous blue tint overlay (alpha 0.08)
  - Reality check prompts show gold instead of default color
  - LUC bar in HUD pulses
  - All INSIGHT tile values +50%
```

**Implementation location**: `src/main.js` game loop, after `dreamYoga.tick(dt)`:
```js
const luc = dreamYoga.lucidity;
window._lucidModifiers = {
  hiddenGlow: luc >= 25,
  enemySlow: luc >= 50 ? 0.9 : 1.0,
  archetypeBonus: luc >= 75,
  lucidState: luc >= 100
};
```

In `renderer.js`, read `window._lucidModifiers` to apply visual effects.

---

## Loop 2: Emotional State → Language Encoding (P1)

**What changes**: Vocabulary words encountered during high-arousal emotional states get flagged. FSRS gives them fewer required reviews. The word's first-encounter tile type is stored for future review hints.

```js
// In main.js, inside the tile step handler where vocab is shown:
const currentArousal = emotionalField.getArousal ? emotionalField.getArousal() 
                      : (emotionalField.distortion || 0);
const isEmotionallyCharged = currentArousal > 0.6;

if (isEmotionallyCharged && multiWord) {
  languageSystem.markEmotionallyTagged(multiWord.id, {
    emotion: emotionalField.getDominantEmotion(),
    tile: tileType,
    arousal: currentArousal
  });
}
```

In `language-system.js` or `fsrs.js`, `markEmotionallyTagged` should:
- Set a flag on the FSRS card
- Reduce the required review count by 1 (emotional encoding = more durable)
- Store the tile type and emotion for display during future reviews

During quiz feedback: if card is emotionally tagged, briefly show: `"First seen: TERROR tile (fear)"`

---

## Loop 3: Flow State Detection + Difficulty Adjustment (P1)

**What changes**: Game monitors player behavior and adjusts difficulty to keep them in flow. This is adaptive difficulty — not random, not scheduled, but responsive.

```js
// Add to state tracking (state.js or inline in main.js):
const FLOW_WINDOW = 30; // seconds
let recentDeaths = [];
let recentMoveMs = [];

// In game loop, track move speed:
if (playerMoved) {
  recentMoveMs.push(Date.now());
  recentMoveMs = recentMoveMs.filter(t => Date.now() - t < FLOW_WINDOW * 1000);
}

// In death handler:
recentDeaths.push(Date.now());
recentDeaths = recentDeaths.filter(t => Date.now() - t < FLOW_WINDOW * 1000);

// Classify player state:
function detectFlowState() {
  const deathRate = recentDeaths.length; // deaths in last 30s
  const moveRate = recentMoveMs.length;  // moves in last 30s
  const hp = g.hp;
  
  if (deathRate >= 3) return 'too_hard';
  if (hp > 80 && deathRate === 0 && moveRate < 8) return 'too_easy';
  return 'flow';
}

// Apply adjustments:
const flowState = detectFlowState();
if (flowState === 'too_hard') {
  // Reduce hazard density on next level gen
  // Increase healing tile frequency
  window._difficultyAdjust = { hazardMul: 0.7, healMul: 1.5 };
} else if (flowState === 'too_easy') {
  // Increase enemy spawn rate slightly
  window._difficultyAdjust = { enemySpeedMul: 1.15, hazardMul: 1.2 };
} else {
  window._difficultyAdjust = { hazardMul: 1.0, healMul: 1.0, enemySpeedMul: 1.0 };
}
```

Apply `window._difficultyAdjust` in grid generation and enemy spawning.

---

## Loop 4: Meta-Pattern Session Summary (P2)

**What changes**: At level end (interlude screen), show ONE behavioral insight about this session. Not a score — a pattern observation.

```js
// Generate insight from session data:
function generateSessionInsight(sessionData) {
  const { recentTiles, impulseStops, impulseProceeds, matrixSwitches, insightCount } = sessionData;
  
  const despairSteps = recentTiles.filter(t => t === T.DESPAIR).length;
  const selfHarmSteps = recentTiles.filter(t => t === T.SELF_HARM).length;
  const peaceCollected = recentTiles.filter(t => t === T.PEACE).length;
  
  // Priority: most behaviorally significant insight first
  if (selfHarmSteps > 3) return `You stepped into SELF_HARM ${selfHarmSteps} times. Notice the pull.`;
  if (impulseProceeds > impulseStops * 2) return `${impulseProceeds} times the impulse won. ${impulseStops} times you paused. The pause is growing.`;
  if (despairSteps > 6) return `Despair tiles drew you ${despairSteps} times. Something is seeking expression.`;
  if (insightCount > 5) return `${insightCount} insight tiles — your curiosity was active today.`;
  if (matrixSwitches > 4) return `${matrixSwitches} matrix switches — you're learning to move between states.`;
  if (peaceCollected >= 10) return `${peaceCollected} peace nodes. The grid is becoming safer.`;
  return null; // No insight this session — don't force it
}
```

Add to interlude screen render: if insight exists, show below session stats in italic, dimmer text.

---

## Loop 5: Impulse Journal in Pause Menu (P2)

**What changes**: Pause menu shows a "Patterns" tab with impulse data from the current session.

```
PATTERNS (this session)
─────────────────────────
Impulse moments:    8
  Paused:           3  ███░░░░░░░
  Proceeded:        5  █████░░░░░

Hazard tiles stepped: 12
Insight tiles found:   7

Most visited tile: DESPAIR
```

Track in `impulseBuffer.js`:
- `proceedCount` — incremented when player moves into hazard after buffer
- `stopCount` — incremented when player holds and redirects

Expose these on `window._sessionPatterns` for the pause menu renderer to read.

---

## Verification

```
[ ] Grid Classic mode: reality check fires, LUC bar visible
[ ] lucidity reaches 50 → enemies visibly slower (testable by watching enemy move speed)
[ ] lucidity reaches 100 → canvas gets blue tint overlay
[ ] French word encountered during high-despair tile → "emotionally tagged" flag set in FSRS card
[ ] After 3 deaths in 30s → next level has fewer hazard tiles
[ ] After easy run → enemies slightly faster on next level
[ ] Level completion → interlude shows session insight (if any)
[ ] Pause menu → Patterns tab shows impulse data
[ ] npm run build — zero errors
```
