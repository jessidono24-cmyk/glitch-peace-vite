# Research: AI Character Bots for GLITCH·PEACE
## docs/research/ai-characters/RESEARCH.md

**Purpose**: Document the design patterns, technical approaches, and consciousness-relevant applications for AI-driven NPCs and archetype bots in GLITCH·PEACE.

---

## 1. Why AI Characters in a Consciousness Engine?

Traditional game NPCs follow scripts. They can't respond to the player's actual psychological state, adapt to recovery journey stage, or provide the dynamic mirroring that makes therapeutic interaction meaningful.

GLITCH·PEACE already has the emotional field, temporal system, and dreamscape awareness running. AI characters can be the *voice* of those systems — entities that notice the player's state, reflect it back, and guide without prescribing.

**The core use case**: Archetype characters (Dragon, Child Guide, Orb/Sheep, Captor-Teacher, Protector) as interactive presences that respond to the player's EmotionalField, LucidityScore, and dreamscape context. Not scripted dialogue trees. Dynamic responses shaped by what the game actually knows about this session.

---

## 2. Technical Approaches (Simplest to Most Powerful)

### Approach A: Rule-Based Reactive NPCs (No ML — Implementable Now)

Pure JS. Select contextual messages from pools based on live state variables.

```js
class ArchetypeBot {
  constructor(archetype, emotionalField, dreamYoga, temporalSystem) {
    this.archetype = archetype;
    this.ef = emotionalField;
    this.dy = dreamYoga;
    this.ts = temporalSystem;
    this.lastSpoke = 0;
    this.cooldown = 45000; // 45 seconds between messages
  }

  getMessage(now) {
    if (now - this.lastSpoke < this.cooldown) return null;
    this.lastSpoke = now;
    const dom = this.ef.getDominantEmotion();
    const luc = this.dy.lucidity;
    const planet = this.ts.getPlanetaryDay().planet;
    const pool = ARCHETYPE_DIALOGUE[this.archetype];

    if (this.ef.getDistortion() > 0.7) return pool.high_distortion;
    if (dom === 'fear') return pool.fear_context;
    if (dom === 'joy' && luc > 60) return pool.lucid_joy;
    if (planet === 'Saturn') return pool.saturn_discipline;
    return pool.neutral[Math.floor(Math.random() * pool.neutral.length)];
  }
}
```

**Effort**: Low. Reliable offline. No API costs.
**Limitation**: Responses are selected not generated. Can't handle truly novel situations.

---

### Approach B: Claude API Integration (Dynamic, Context-Aware)

At key moments, the game calls the Claude API with the player's session context. Claude generates a short, in-character response.

```js
async function getArchetypeResponse(archetype, sessionContext) {
  const systemPrompt = `You are the ${archetype} archetype in a consciousness-awakening game called GLITCH·PEACE. 
Speak in short poetic fragments — never more than 2 sentences.
You are aware of the player's emotional state and dreamscape.
You do not give advice. You reflect, witness, and occasionally ask one question.
You are warm but not saccharine. You have been through something.
Never break character. Never mention you're an AI.`;

  const userPrompt = `Session context:
- Dominant emotion: ${sessionContext.dominantEmotion} (intensity: ${sessionContext.intensity})
- Dreamscape: ${sessionContext.dreamscape}
- Lucidity: ${sessionContext.lucidity}/100
- Temporal: ${sessionContext.planet} day, ${sessionContext.lunarPhase}
- Recent tiles: ${sessionContext.recentTiles.join(', ')}
- Archetype: ${archetype}

Generate one piece of dialogue this archetype would say right now.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 80,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt
    })
  });
  const data = await response.json();
  return data.content[0].text;
}
```

**When to call the API** (sparingly — not every second):
- Player collects an ARCHETYPE tile
- Lucidity crosses threshold (50, 75, 100)
- EmotionalField distortion crosses 0.8
- Level completion (closing reflection)
- Player idle 3+ minutes (archetype checks in)

**Effort**: Medium. Requires API key in settings. Needs graceful degradation.

```js
// Always degrade gracefully to rule-based
async function getArchetypeMessage(archetype, ctx, now) {
  try {
    if (!PLAYER_PROFILE.aiCompanionEnabled) throw new Error('disabled');
    return await getArchetypeResponse(archetype, ctx);
  } catch (e) {
    return getRuleBasedMessage(archetype, ctx, now);
  }
}
```

---

### Approach C: Lightweight Local LLM (Optional / Advanced)

Run a tiny quantized model in the browser via WebLLM (WebGPU) or Transformers.js (WASM). Phi-3-mini (~2GB) or SmolLM-360M (~360MB) for more constrained use.

**Pros**: Fully offline, no API cost, no latency after initial load.
**Cons**: Large initial download, requires WebGPU (not all browsers), slower generation.

**Recommendation**: Approach A by default → Approach B as opt-in "AI Companion" mode → Approach C as future "offline deep mode". Build A first, wire B in settings.

---

## 3. Archetype Character Design (All Five)

### Dragon — The Initiator
**Voice**: Direct, fierce, brief. Will. Courage. Breaking through resistance.
**Triggers**: High distortion, RAGE tiles, Mars day, depleted energy.
```
"You know what's in the way. What are you waiting for?"
"Fire doesn't apologize for burning."
"Mars is sharp today. Use it."
"Stop looking for permission."
```

### Child Guide — The Mirror
**Voice**: Simple, curious, slightly otherworldly. Asks questions. Observes without judgment.
**Triggers**: MEMORY tiles, HIDDEN tile reveals, first time in a dreamscape, high fear.
```
"Did you notice that wall wasn't there yesterday?"
"What does despair feel like in your body right now?"
"You hid something here. Do you remember what?"
"I've been watching. You're doing something different today."
```

### Orb / Sheep — The Liminal One
**Voice**: Gentle, slippery, phase-aware. Talks about edges, thresholds, between-states.
**Triggers**: Matrix switches, GLITCH tiles, TELEPORT tiles, approaching a dreamscape boundary.
```
"You crossed over. Did you feel it?"
"The matrix remembers every switch. So does the body."
"Coherence and chaos are the same door from different sides."
"You're between things right now. That's allowed."
```

### Captor-Teacher — The Witness
**Voice**: Measured, slightly unsettling. Knows things. Doesn't comfort — clarifies.
**Triggers**: ImpulseBuffer activating, SELF_HARM tiles, rewind power use, high shame.
```
"You knew what would happen. You went anyway. Now you know differently."
"The rewind changes nothing except your understanding of it."
"I've watched you do this before. You're watching yourself now too."
"Pattern noted. That's all it needs to be right now."
```

### Protector — The Steadying Presence
**Voice**: Warm, grounded, brief. Safety. Sufficiency. The body.
**Triggers**: Low HP, multiple deaths in a session, GROUNDING tiles, Venus day, high hopeless.
```
"You're still here. That counts."
"The body knows what the mind forgets."
"Venus is gentle today. Let it hold you."
"You don't have to solve everything in this level."
```

---

## 4. Consciousness-Specific Use Cases

### 4a. Recovery Support

Detect addiction-pattern behavior (rapid moves, repeatedly choosing hazard tiles, ignoring consequence preview) and respond with presence, not alarm:

```js
const impulsive = impulseBuffer.proceedCount > 5 && impulseBuffer.stopCount < 2;
const hazardRepeats = recentTiles.filter(t => [T.SELF_HARM, T.DESPAIR].includes(t)).length > 4;
if (impulsive || hazardRepeats) triggerArchetype('captor_teacher', 'recovery_mode');
```

Response style: Never preachy. Never alarmed. Just present. "I'm noticing something. No rush."

### 4b. Dream Preparation (Pre-Sleep Sessions)

Detect evening play (8pm–midnight, 20+ minute session). Orb archetype transitions into dream yoga guide:

```js
const hour = new Date().getHours();
if (hour >= 20 && sessionMinutes > 20) triggerArchetype('orb', 'pre_sleep');
```

Orb: "Tonight, when you feel yourself drifting, ask the question. You know which one."

### 4c. Learning Encouragement

Detect stuck vocabulary (FSRS stability not increasing after 3+ reviews). Child Guide offers a memory hook:

```js
const stuckCards = fsrsDeck.getCards().filter(c => c.stability < 0.3 && c.reviews > 3);
if (stuckCards.length > 0) triggerArchetype('child_guide', 'learning_stuck', stuckCards[0]);
```

Child Guide: "That one doesn't want to stick. Try saying it out loud — the mouth remembers differently than the eyes."

### 4d. Peak State Recognition

Detect flow/lucid state (high lucidity + high coherence + low distortion). Dragon or Protector acknowledges:

```js
if (lucidity > 75 && coherence > 0.8 && distortion < 0.2) triggerArchetype('dragon', 'peak_state');
```

Dragon: "This is it. Stay exactly here."

---

## 5. File Architecture

```
src/
  systems/
    ai-characters/
      archetype-bot.js       — Base class, rule-based engine, trigger evaluation
      claude-connector.js    — API integration + graceful degradation
      dialogue-pools.js      — All rule-based lines by archetype + context key
      session-context.js     — Builds context object from live game state
      trigger-conditions.js  — When each archetype fires (priority, cooldowns)
```

**Session context object** passed to both rule-based and API systems:
```js
{
  archetype: 'child_guide',
  dreamscape: 'VOID STATE',
  planet: 'Mercury',
  lunarPhase: 'Full Moon',
  lucidity: 72,
  dominantEmotion: 'fear',
  emotionIntensity: 0.8,
  distortion: 0.65,
  coherence: 0.4,
  sessionMinutes: 23,
  recentTiles: ['PEACE', 'TERROR', 'INSIGHT', 'SELF_HARM'],
  impulsiveMovesRatio: 0.3,
  wordsLearnedToday: 4,
  level: 3,
  timeOfDay: 'evening',
  hourOfDay: 21
}
```

---

## 6. UI Integration

Archetype messages appear as floating text overlays — never blocking gameplay:

```
╔─────────────────────────────╗
  ✦ CHILD GUIDE
  "Did you notice that wall
   wasn't there yesterday?"
                    [SPACE dismiss]
╚─────────────────────────────╝
```

- Position: bottom-left of game canvas (doesn't overlap HUD)
- Duration: 6 seconds auto-dismiss, or SPACE to dismiss immediately
- Never interrupts movement or combat
- Fade in / fade out
- Character-specific color (Dragon = red-orange, Child Guide = soft blue, Orb = purple, Teacher = grey-gold, Protector = green)

---

## 7. Privacy and Safety Non-Negotiables

1. **No data leaves device without explicit opt-in.** Rule-based is the default. Claude API is opt-in under "AI Companion" in settings. Context objects are never logged.

2. **No crisis detection.** These characters witness — they don't diagnose. Recovery support language is from pre-reviewed pools, not dynamically generated. The game never tells a player they are in crisis.

3. **Characters never claim to know the player's real feelings.** They reflect game state only. "Your character is encountering a lot of despair tiles" not "You are depressed."

4. **Always dismissible.** Any message dismissed immediately with SPACE. Characters never speak over gameplay or block input.

5. **Transparent in settings.** Options screen explains: "AI Companion — archetype characters respond dynamically using Claude. Requires internet. Optional. Default: OFF." 

---

## 8. Implementation Priority

| Component | Effort | Impact | Priority |
|-----------|--------|--------|----------|
| Rule-based dialogue pools (all 5 archetypes) | Low | High | P1 |
| Trigger condition system | Low | High | P1 |
| UI overlay renderer | Low | High | P1 |
| Session context builder | Low-Med | High | P1 |
| Claude API connector + settings toggle | Medium | Very High | P2 |
| Pre-sleep dream yoga integration | Low | High | P2 |
| Recovery support detection | Medium | Very High | P2 |
| Local LLM (WebLLM) | High | Medium | P4 |

---

## 9. Research Basis

The use of in-game characters as therapeutic mirrors draws on:

- **Internal Family Systems (Schwartz, 1995)** — the idea that psyche contains distinct "parts" (archetypes in GLITCH·PEACE's framing). Dialogue with parts produces integration, not just insight.
- **Narrative therapy (White & Epston, 1990)** — externalizing problems through characters reduces shame. The Captor-Teacher archetype embodies this: it sees the pattern without being the pattern.
- **Motivational Interviewing (Miller & Rollnick, 2012)** — effective therapeutic dialogue reflects rather than directs. Archetype messages are designed as reflections, not advice.
- **Therapeutic alliance research (Bordin, 1979)** — even brief, consistent, warm interactions create alliance that predicts behavior change. The Protector archetype is specifically designed for this.
- **Avatar/character identification in games (Yee & Bailenson, 2007)** — players who identify with game characters show behavioral transfer effects. Archetype identification strengthens the therapeutic value of all other systems.
