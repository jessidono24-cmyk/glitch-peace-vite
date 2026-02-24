# Task BOT1 — Archetype Character Bots: Rule-Based System

**Priority: MEDIUM — meaningful consciousness feature, no external dependencies**
**Depends on: FEEDBACK1 complete (needs session context object)**
**Research ref: docs/research/ai-characters/RESEARCH.md**

---

## Audit First

```bash
# Check if any archetype dialogue system exists
find src/ -name "*archetype*" -o -name "*dialogue*" -o -name "*bot*" | grep -v node_modules
grep -rn "archetype.*speak\|NPC\|dialogue\|bot\b" src/ | grep -v node_modules | head -20

# Check current archetype system
grep -n "archetypeDialogue\|archetype_dialogue\|UPG.archetype" src/main.js | head -20
cat src/systems/rpg/archetype-dialogue.js 2>/dev/null | head -50 || echo "file not found"
```

Produce three-section audit before writing any code:
1. **ARCHETYPE DIALOGUE THAT EXISTS** — any current dialogue or NPC text system
2. **SYSTEMS AVAILABLE TO READ** — EmotionalField, DreamYoga, TemporalSystem, ImpulseBuffer
3. **WIRING GAPS** — what needs to be connected

---

## What to Build

Five archetype characters that speak at the right moments. Rule-based (no API). Overlay UI that never blocks gameplay.

---

## Step 1: Create `src/systems/ai-characters/dialogue-pools.js`

```js
// Each archetype has pools keyed by context
// Agent: build out at MINIMUM 6 lines per pool per archetype (see research doc)

export const ARCHETYPE_DIALOGUE = {
  dragon: {
    high_distortion: [
      "You know what's in the way. What are you waiting for?",
      "Chaos is fuel. Use it or it uses you.",
    ],
    fear_context: [
      "Fear means something real is at stake. Walk toward it.",
      "The thing you're avoiding is the door.",
    ],
    rage_tile: [
      "Good. Now channel it.",
      "Rage without direction destroys the carrier. Give it a target.",
    ],
    low_energy: [
      "Stop looking for permission.",
      "Rest is strategy. This is not rest.",
    ],
    mars_day: [
      "Mars is sharp today. Use it.",
      "The grid is harder today. So are you.",
    ],
    peak_state: [
      "This is it. Stay exactly here.",
      "Remember this. The body remembers.",
    ],
    neutral: [
      "What are you avoiding?",
      "The wall you keep running from — it's not as solid as it looks.",
      "You're holding back. I can see it.",
    ]
  },
  
  child_guide: {
    high_distortion: [
      "Something feels tangled right now. It's okay to go slower.",
      "When everything feels loud, try just watching one thing.",
    ],
    fear_context: [
      "I see what's scaring you. It's real — and you can still move through it.",
      "Fear says: something matters here. What matters here?",
    ],
    memory_tile: [
      "You hid something here. Do you remember what?",
      "This place knows you.",
    ],
    hidden_reveal: [
      "Did you notice that wall wasn't there yesterday?",
      "The hidden things are always there. You just have to look with a different eye.",
    ],
    learning_stuck: [
      "That one doesn't want to stick. Try saying it out loud.",
      "Some words need more time. That's okay.",
    ],
    lucid_joy: [
      "You're awake in here. This is exactly what we practiced.",
      "This feeling — remember it. It visits dreams.",
    ],
    neutral: [
      "What are you noticing right now?",
      "The hidden tiles remember everything.",
      "You don't have to fight everything you meet.",
      "I've been watching. You're doing something different today.",
    ]
  },

  orb: {
    high_distortion: [
      "You're between things right now. That's allowed.",
      "Dissolution is a kind of doorway.",
    ],
    matrix_switch: [
      "You crossed over. Did you feel it?",
      "The matrix remembers every switch. So does the body.",
    ],
    glitch_tile: [
      "Coherence and chaos are the same door from different sides.",
      "When reality glitches, something true is trying to show through.",
    ],
    teleport_tile: [
      "Sudden location shift. Your dreaming mind loves this.",
      "You'll recognize this tonight.",
    ],
    pre_sleep: [
      "Tonight, when you feel yourself drifting, ask the question. You know which one.",
      "The game ends. The awareness doesn't. Carry it into sleep.",
      "Reality test once more before you close your eyes.",
    ],
    lucid_joy: [
      "Both states at once. This is the practice.",
      "Waking dream. Dream waking. The boundary is already thin.",
    ],
    neutral: [
      "There is a liminal space between every move. That's where you actually live.",
      "The grid is not as solid as it looks.",
      "Notice the edges. Everything real has edges.",
    ]
  },

  teacher: {
    high_distortion: [
      "I've watched you do this before. You're watching yourself now too.",
      "Pattern noted. That's all it needs to be right now.",
    ],
    self_harm_tile: [
      "You knew what would happen. You went anyway. Now you know differently.",
      "The pull toward harm is information. What is it telling you?",
    ],
    impulse_proceed: [
      "The rewind changes nothing except your understanding of it.",
      "You moved faster than you could think. That's the pattern. Seeing it is step one.",
    ],
    impulse_stop: [
      "You paused. That's the whole practice right there.",
      "The gap between urge and action. You found it.",
    ],
    shame_context: [
      "Shame collapses the field. Witnessing expands it.",
      "You don't need to fix it right now. Just see it clearly.",
    ],
    recovery_mode: [
      "I'm noticing something. No rush.",
      "The game knows what you're doing. So do you.",
    ],
    saturn_day: [
      "Saturn day — good for naming what you need to change.",
      "Structure is medicine. What structure are you resisting?",
    ],
    neutral: [
      "The grid reflects what you bring to it.",
      "Consequence is just pattern made visible.",
      "What did you just learn? Not the game — you.",
    ]
  },

  protector: {
    high_distortion: [
      "You're still here. That counts.",
      "I'm here. Nowhere else.",
    ],
    low_hp: [
      "The body knows what the mind forgets.",
      "You don't have to solve everything in this level.",
      "Come to the green tiles. There's time.",
    ],
    hopeless_tile: [
      "Hopeless is a weather pattern, not a fact.",
      "It spreads — but so does peace.",
    ],
    venus_day: [
      "Venus is gentle today. Let it hold you.",
      "Harmony is available. You're allowed to receive it.",
    ],
    grounding_tile: [
      "Root down. The grid will hold you.",
      "Here. Now. This tile. That's enough.",
    ],
    multiple_deaths: [
      "A lot of losses. You keep coming back. That matters.",
      "You're not failing. You're learning the hard way. That's still learning.",
    ],
    neutral: [
      "You're allowed to be here.",
      "No shame spirals. Not in this space.",
      "The body holds what the mind drops. Stay soft.",
    ]
  }
};
```

---

## Step 2: Create `src/systems/ai-characters/session-context.js`

```js
// Build context object from live game state
export function buildSessionContext(g, emotionalField, dreamYoga, temporalSystem, impulseBuffer, languageSystem) {
  const hour = new Date().getHours();
  return {
    dreamscape: g.ds?.name || 'VOID STATE',
    planet: temporalSystem.getPlanetaryDay?.()?.planet || 'Sun',
    lunarPhase: temporalSystem.getLunarPhase?.()?.name || 'New Moon',
    lucidity: dreamYoga.lucidity || 0,
    dominantEmotion: emotionalField.getDominantEmotion?.() || 'neutral',
    emotionIntensity: emotionalField.distortion || 0,
    distortion: emotionalField.distortion || 0,
    coherence: emotionalField.coherence || 0.5,
    recentTiles: g._recentTiles || [],
    impulsiveMovesRatio: impulseBuffer 
      ? (impulseBuffer.proceedCount || 0) / Math.max(1, (impulseBuffer.proceedCount || 0) + (impulseBuffer.stopCount || 0))
      : 0,
    wordsLearnedToday: languageSystem?.sessionCount || 0,
    level: g.level || 1,
    hp: g.hp || 100,
    maxHp: g.maxHp || 100,
    sessionDeaths: g._sessionDeaths || 0,
    sessionMinutes: g._sessionStart ? Math.floor((Date.now() - g._sessionStart) / 60000) : 0,
    timeOfDay: hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
    hourOfDay: hour
  };
}
```

---

## Step 3: Create `src/systems/ai-characters/archetype-bot.js`

```js
import { ARCHETYPE_DIALOGUE } from './dialogue-pools.js';
import { buildSessionContext } from './session-context.js';

const COOLDOWN_MS = 50000; // 50 seconds between messages

export class ArchetypeBot {
  constructor(sharedSystems) {
    this.sys = sharedSystems;
    this.lastSpoke = 0;
    this.pendingMessage = null; // { archetype, text, alpha, timer }
  }

  // Called from game loop. g = game state object.
  tick(now, g) {
    // Fade out existing message
    if (this.pendingMessage) {
      this.pendingMessage.timer -= 16;
      if (this.pendingMessage.timer <= 0) this.pendingMessage = null;
    }
    if (now - this.lastSpoke < COOLDOWN_MS) return;

    const ctx = buildSessionContext(
      g, this.sys.emotionalField, this.sys.dreamYoga,
      this.sys.temporalSystem, this.sys.impulseBuffer, this.sys.languageSystem
    );
    
    const { archetype, contextKey } = this._selectArchetype(ctx, g);
    if (!archetype) return;
    
    const pool = ARCHETYPE_DIALOGUE[archetype][contextKey] 
               || ARCHETYPE_DIALOGUE[archetype].neutral;
    if (!pool || pool.length === 0) return;
    
    const text = pool[Math.floor(Math.random() * pool.length)];
    this.pendingMessage = { archetype, text, timer: 6000 };
    this.lastSpoke = now;
  }

  _selectArchetype(ctx, g) {
    // Priority order — most behaviorally significant first
    const recentTiles = g._recentTiles || [];
    
    if (ctx.distortion > 0.75)
      return { archetype: 'child_guide', contextKey: 'high_distortion' };
    
    if (recentTiles.slice(-3).includes(3)) // SELF_HARM
      return { archetype: 'teacher', contextKey: 'self_harm_tile' };
    
    if (ctx.hp < 25 && ctx.level > 1)
      return { archetype: 'protector', contextKey: 'low_hp' };
    
    if (ctx.impulsiveMovesRatio > 0.7 && ctx.sessionMinutes > 5)
      return { archetype: 'teacher', contextKey: 'recovery_mode' };
    
    if (ctx.dominantEmotion === 'fear')
      return { archetype: 'child_guide', contextKey: 'fear_context' };
    
    if (ctx.lucidity > 75)
      return { archetype: 'dragon', contextKey: 'peak_state' };
    
    if (ctx.timeOfDay === 'evening' && ctx.sessionMinutes > 20)
      return { archetype: 'orb', contextKey: 'pre_sleep' };
    
    if (ctx.planet === 'Saturn')
      return { archetype: 'teacher', contextKey: 'saturn_day' };
    
    if (ctx.planet === 'Venus')
      return { archetype: 'protector', contextKey: 'venus_day' };
    
    if (ctx.planet === 'Mars')
      return { archetype: 'dragon', contextKey: 'mars_day' };
    
    if (ctx.sessionDeaths > 4)
      return { archetype: 'protector', contextKey: 'multiple_deaths' };
    
    // Default: rotate through archetypes based on session minute
    const defaults = ['dragon', 'child_guide', 'orb', 'teacher', 'protector'];
    const archetype = defaults[Math.floor(ctx.sessionMinutes / 3) % defaults.length];
    return { archetype, contextKey: 'neutral' };
  }

  // Called from tile event handlers
  onTileEvent(tileType, g) {
    const now = Date.now();
    if (now - this.lastSpoke < 15000) return; // shorter cooldown for tile events
    
    const pool = {
      [T.MEMORY]:    { archetype: 'child_guide', key: 'memory_tile' },
      [T.GLITCH]:    { archetype: 'orb',         key: 'glitch_tile' },
      [T.TELEPORT]:  { archetype: 'orb',         key: 'teleport_tile' },
      [T.GROUNDING]: { archetype: 'protector',   key: 'grounding_tile' },
      [T.ARCHETYPE]: { archetype: 'dragon',      key: 'peak_state' },
    }[tileType];
    
    if (!pool) return;
    const lines = ARCHETYPE_DIALOGUE[pool.archetype][pool.key];
    if (!lines) return;
    
    const text = lines[Math.floor(Math.random() * lines.length)];
    this.pendingMessage = { archetype: pool.archetype, text, timer: 6000 };
    this.lastSpoke = now;
  }
}
```

---

## Step 4: Render the Overlay (add to `renderer.js`)

```js
// In renderer.js, add drawArchetypeMessage(ctx, w, h, message)
// message = { archetype, text, timer }

export function drawArchetypeMessage(ctx, w, h, message) {
  if (!message) return;
  const alpha = Math.min(1, message.timer / 800); // fade in/out
  
  const COLORS = {
    dragon:      '#ff6b35',
    child_guide: '#88ccff',
    orb:         '#cc88ff',
    teacher:     '#ccaa44',
    protector:   '#44cc88',
  };
  
  const NAMES = {
    dragon:      '🔥 DRAGON',
    child_guide: '✨ CHILD GUIDE',
    orb:         '◯ ORB',
    teacher:     '⊕ TEACHER',
    protector:   '◈ PROTECTOR',
  };
  
  const color = COLORS[message.archetype] || '#ffffff';
  const name  = NAMES[message.archetype] || message.archetype.toUpperCase();
  
  // Box dimensions
  const bw = Math.min(420, w * 0.4);
  const bh = 90;
  const bx = 16;
  const by = h - bh - 70; // above bottom HUD bar
  
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  
  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.stroke();
  
  // Archetype name
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = '11px monospace';
  ctx.fillText(name, bx + 10, by + 18);
  
  // Message text (word-wrap to box width)
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '13px monospace';
  wrapText(ctx, `"${message.text}"`, bx + 10, by + 36, bw - 20, 18);
  
  // Dismiss hint
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '10px monospace';
  ctx.fillText('[SPACE dismiss]', bx + bw - 110, by + bh - 8);
  
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, cy);
      line = word + ' ';
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}
```

---

## Step 5: Wire into `main.js`

```js
import { ArchetypeBot } from './systems/ai-characters/archetype-bot.js';
import { drawArchetypeMessage } from './ui/renderer.js';

// In shared systems object:
const archetypeBot = new ArchetypeBot({
  emotionalField, dreamYoga, temporalSystem, impulseBuffer, languageSystem
});

// In game loop (after dreamYoga.tick):
archetypeBot.tick(ts, g);

// In tile step handler (after tile effects apply):
archetypeBot.onTileEvent(targetTile, g);

// In render pipeline (after drawGame, before HUD):
drawArchetypeMessage(ctx, w, h, archetypeBot.pendingMessage);

// In keydown handler (SPACE dismiss):
if (e.key === ' ' && archetypeBot.pendingMessage) {
  archetypeBot.pendingMessage = null;
}

// Track session deaths and recent tiles on g:
// g._sessionDeaths: increment on death
// g._recentTiles: rolling array of last 15 tile types stepped on
// g._sessionStart: set to Date.now() when game starts
```

---

## Verification

```
[ ] Start Grid Classic, play for 2+ minutes → at least one archetype message appears
[ ] Message appears bottom-left, doesn't overlap main HUD
[ ] SPACE key dismisses message immediately
[ ] Message fades in and out smoothly
[ ] Steps on MEMORY tile → Child Guide responds within ~5 seconds
[ ] Steps on GROUNDING tile → Protector responds
[ ] Steps on GLITCH tile → Orb responds
[ ] High distortion (lots of hazards) → Child Guide or Teacher
[ ] Evening session (8pm+, 20+ min) → Orb gives pre-sleep message
[ ] Only one message visible at a time (no stacking)
[ ] 50-second cooldown between messages (not spamming)
[ ] npm run build — zero errors
```
