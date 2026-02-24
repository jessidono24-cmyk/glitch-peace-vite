# Task ARCH5 — Apply Research Docs to Live Systems

## Goal
The docs/ folder contains EMBODIMENT.md, COGNITIVE_ARCHITECTURE.md,
EFFORTLESS_LEARNING.md, PSYCHOLOGY_FOUNDATIONS.md, and SOVEREIGN_CODEX.md.
These are detailed research frameworks that should be shaping game
behavior but currently sit unused. This task applies their key
principles as concrete tuning changes to live systems.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Emotional field decay rates reflect cognitive load theory
      (faster decay in high-arousal states, slower in flow)
- [ ] Impulse buffer timing reflects implicit learning research
      (1.2 seconds for hazards — just enough for unconscious pattern recognition)
- [ ] Consequence preview ghost shows exactly 3 moves (working memory limit)
- [ ] Emergence indicator thresholds tuned to realistic awakening timescales
- [ ] Playstyle modifiers apply research-based adjustments per style
- [ ] Sovereign codex: all consciousness features are opt-in, never forced

## Scope — touch ONLY these files
- `src/systems/emotional-engine.js` (decay tuning)
- `src/recovery/impulse-buffer.js` (timing tuning)
- `src/recovery/consequence-preview.js` (depth tuning)
- `src/systems/awareness/emergence-indicators.js` (threshold tuning)
- `src/main.js` (playstyle modifier application only)

---

## Research Principles to Apply

### From COGNITIVE_ARCHITECTURE.md
**Working memory limit = 7±2 chunks**
- Consequence preview: cap at 3 moves ahead (not more — exceeds WM capacity)
- HUD: never show more than 5 active status indicators simultaneously
- Achievement popup: max 1 at a time, queue the rest

**Cognitive load theory (Sweller)**
- High distortion (chaos) = high extraneous load = slower learning
- In Matrix A (red/erasure): reduce new information density
- In Matrix B (green/coherence): optimal intrinsic load, enable deeper prompts

### From EFFORTLESS_LEARNING.md
**Implicit learning is faster and more durable than explicit**
- Emergence indicators should NOT announce themselves loudly
- Subtle environmental changes signal emergence better than text popups
- Dream yoga reality checks should feel like they arise naturally, not interrupt

**Spaced repetition**
- Self-reflection prompts should space out: never same depth twice in a row
- Alchemy transmutation should have a cooldown that matches forgetting curve

### From EMBODIMENT.md
**Sensorimotor integration**
- Impulse buffer: 1200ms (not 1000ms) — research shows 1.2s for motor inhibition
- Player should feel the hesitation, not just see it

**Flow state calibration**
- Emotional decay rate should slow when player is in "flow" (high coherence, active)
- Flow detected when: coherence > 0.7, active moves > 3/minute, no damage in 30s

### From PSYCHOLOGY_FOUNDATIONS.md
**Habit formation (Wood & Neal)**
- Relapse prevention: after 3 consecutive hazard hits, show urge management prompt
- No shame messaging: "Pattern incomplete" not "You died"

**Emotional regulation (Gross)**
- High fear + Matrix B toggle = reappraisal (reward this explicitly)
- Suppression (high fear + no action) = gently prompt movement

### From SOVEREIGN_CODEX.md
**Informed consent for consciousness features**
- Dream yoga: first time reality check fires, show one-time explanation
- Emergence indicators: first flash shows brief "what is this?" tooltip
- All advanced features must be skippable (already mostly true, verify)

---

## Concrete Code Changes

### emotional-engine.js: flow-aware decay
```js
// Find the decay function. Add flow detection:
decay(dt, coherenceMul = 1) {
  // Detect flow state
  const inFlow = this.getCoherence() > 0.7;
  const flowMul = inFlow ? 0.6 : 1.0; // Decay 40% slower in flow
  
  for (const [id, em] of Object.entries(this.emotions)) {
    em.value = Math.max(0, em.value - em.decayRate * dt * coherenceMul * flowMul);
  }
}
```

### impulse-buffer.js: 1200ms timing
```js
// Find HAZARD_HOLD_MS or equivalent constant
const HAZARD_HOLD_MS = 1200; // was 1000, research: 1.2s for motor inhibition
```

### consequence-preview.js: cap at 3
```js
// Find depth/lookahead constant
const MAX_PREVIEW_DEPTH = 3; // working memory limit (7±2, conservative)
```

### emergence-indicators.js: realistic thresholds
```js
// Find the threshold values for each indicator
// Adjust to be less hair-trigger:
const INDICATOR_THRESHOLDS = {
  matrix_mastery:      { trigger: 10,  // was probably 5
  pause_frequency:     { trigger: 8,   // 8 intentional pauses
  reflection_depth:    { trigger: 5,   // 5 deep reflections
  pattern_noticing:    { trigger: 15,  // 15 pattern moments
  insight_accumulation:{ trigger: 20,  // 20 insight tiles
  peace_chain:         { trigger: 13,  // Fibonacci: 13
  dream_completion:    { trigger: 3,   // 3 dreamscapes
  vocabulary_growth:   { trigger: 10,  // 10 words
};
```

### main.js: playstyle modifier application
```js
// After playstyle is selected (from ARCH1), apply research-based modifiers:
function applyPlaystyleModifiers(playstyle, consciousness) {
  switch(playstyle) {
    case 'lucid':
      // Dream yoga research: lucid dreamers have higher metacognitive awareness
      consciousness.dreamYoga.lucidityDecayRate *= 0.5; // slower lucidity loss
      break;
    case 'sage':
      // Implicit learning: slower pace = deeper encoding
      // Slow enemy speed by 20%, increase insight token value by 50%
      CFG.enemySpeedMul = 0.8;
      CFG.insightMul = 1.5;
      break;
    case 'warrior':
      // Stress inoculation: higher challenge = faster EQ growth
      CFG.enemySpeedMul = 1.3;
      consciousness.emotion.growthRate *= 1.2;
      break;
    case 'healer':
      // Recovery research: self-compassion practices
      CFG.hpRegenRate = 0.05; // gentle HP regen
      break;
    case 'explorer':
      // Curiosity research: novelty-seeking enhances dopamine
      CFG.insightMul = 1.2;
      CFG.hiddenTileMul = 1.5; // more hidden tiles
      break;
  }
}
```

## Verification
```bash
npm run build
```
Browser:
1. Play in high-fear state (lots of TERROR tiles) → emotions decay normally
2. Find flow state (peaceful play, no damage) → emotions decay noticeably slower
3. Impulse buffer on hazard → feels like 1.2 seconds (slightly longer than before)
4. Consequence preview shows max 3 ghost steps
5. First reality check → brief "what is this?" explanation appears
6. Select "Sage" playstyle → enemies visibly slower, more insight tokens

## Commit message
```
feat: ARCH5 research integration -- cognitive/embodiment research applied to live systems
```
