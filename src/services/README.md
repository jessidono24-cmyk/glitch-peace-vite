# 🤖 API Agents Service

**Anthropic (Claude) + OpenAI (GPT-4) integration for GLITCH·PEACE consciousness engine**

This service generates dynamic, AI-powered content for the game to support:
- Procedural dreamscape generation
- Emotional/temporal/cosmology mechanics
- Recovery affirmations & pattern insights
- Educational micro-content (learning modules)
- Dynamic enemy personalities

---

## ✨ What It Does

### **Claude (Anthropic) — World-Building & Wisdom**
Used for creative, nuanced, long-form content:
- **Dreamscapes**: Procedural level design with thematic coherence
- **Cosmology Translation**: Converting world traditions into game mechanics  
- **Emotional Synergies**: Complex emotional state interpretation
- **Learning Modules**: Micro-educational content (languages, math, psychology)

**Why Claude?** Excellent at weaving complex systems, sterilizing dogmatic concepts into mechanics, understanding multi-layered consciousness frameworks.

### **GPT-4 (OpenAI) — Real-Time Context & Recovery**
Used for immediate, context-aware responses:
- **Recovery Insights**: Session-aware, compassionate pattern feedback
- **Enemy Personalities**: Dynamic behaviors based on game state
- **Affirmations**: Real-time encouragement during gameplay

**Why GPT-4?** Fast, context-sensitive, excellent at conversational empathy and real-time adaptation.

---

## 🔧 How to Use

### **Setup**

1. **Ensure .env exists** with your API keys:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Import the service**:
   ```javascript
   import apiAgents from './services/apiAgents.js';
   ```

### **API Functions**

#### **1. Generate Dreamscape**
```javascript
const dreamscape = await apiAgents.generateDreamscape({
  emotionalState: { grief: 4, curiosity: 6 },
  cosmology: 'buddhist-wheel',
  biomeType: 'water-archives',
  difficultyModifier: 1.2
});

// Returns:
{
  name: "Dreamscape name",
  flavor: "Description",
  symbol: "◇",
  tilePool: ["DESPAIR", "PEACE", "INSIGHT"],
  enemyBehaviour: "chase",
  emotionalModifiers: {...},
  recoveryFocus: "Pattern message",
  wisdom: "Sterilized quote"
}
```

#### **2. Cosmology Translation**
Convert world wisdom traditions into game mechanics:
```javascript
const mechanic = await apiAgents.cosmoTranslate(
  'Buddhist Wheel of Becoming (12 Nidanas: Ignorance → Formations → ...)',
  'enemy-behavior-cycle'
);

// Returns implementation guidelines for the mechanic
```

#### **3. Recovery Insight** (Real-time during gameplay)
```javascript
const insight = await apiAgents.getRecoveryInsight({
  gameState: 'playing',
  sessionDuration: 25,
  patterns: ['repeated-charge', 'impulsive-moves'],
  emotionalField: { anger: 5, fear: 3 },
  userBackground: 'addiction-recovery'
});

// Returns: "Brief, compassionate insight (30 words max)"
```

#### **4. Learning Module**
```javascript
const module = await apiAgents.generateLearningModule(
  'Spanish vocabulary: emotions',
  2  // difficulty 1-5
);

// Returns micro-learning module with quiz
```

#### **5. Enemy Personality**
```javascript
const enemy = await apiAgents.generateEnemyPersonality(
  'Mirror archetype',
  { shame: 3, curiosity: 5, coherence: 0.6 }
);

// Returns behavior rules and symbolic meaning
```

#### **6. Emotional Synergy**
```javascript
const synergy = await apiAgents.suggestEmotionalSynergy(
  { joy: 6, hope: 5, awe: 3 },
  'approaching-goal'
);

// Returns synergy activation suggestion
```

#### **7. Batch Generation** (Most Efficient)
Generate multiple content pieces in one call:
```javascript
const results = await apiAgents.generateGameContent({
  dreamscape_1: {
    type: 'dreamscape',
    config: { emotionalState: { awe: 5 } }
  },
  learning_module: {
    type: 'learning',
    subject: 'Fibonacci',
    difficulty: 3
  },
  cosmology: {
    type: 'cosmology',
    tradition: 'Hindu Chakras...',
    parameter: 'tile-progression'
  }
});
```

---

## 📊 Use Cases

### **Build-Time Content Generation**
Generate all dreamscapes, cosmologies, and learning content during build:
```bash
node scripts/generateContent.js  # Batch generate everything
```

### **Runtime Content** (Gameplay)
- **Recovery Insights**: Called when player takes damage or shows patterns
- **Enemy Behaviors**: Generated based on current emotional field + game state
- **Emotional Synergies**: Suggested when emotions align

### **Development & Expansion**
- Generate new cosmology mechanics from wisdom traditions
- Create learning module banks (languages, science, psychology)
- Design themed dreamscapes on demand

---

## 🎯 Design Philosophy

**Sterilized Wisdom**: All content from world traditions is translated into mechanical/game concepts—no dogma, just patterns.

**Compassionate Output**: Recovery insights and affirmations are never clinical or shaming. Focus on pattern recognition, growth, and boundaries.

**Pattern-First**: Every generated mechanic teaches something about pattern recognition, emotional dynamics, or consciousness.

---

## ⚠️ Error Handling

The service gracefully handles API errors:
```javascript
if (!result) {
  console.error('API generation failed, using fallback');
  // Fallback to static content or simpler generation
}
```

---

## 📝 Examples

See `apiAgents.examples.js` for runnable examples of all functions:
```bash
node src/services/apiAgents.examples.js
```

---

## 🔐 Security Notes

- **API Keys**: Stored in `.env`, never committed to git
- **Browser Side**: API agents run Node.js-only (never leak keys to client)
- **Rate Limits**: Respect Anthropic/OpenAI rate limits in production
- **Cost**: Monitor token usage—Claude 3.5 Sonnet is ~0.3¢/1K tokens

---

## 📚 Next Steps

1. **Run examples**: `node src/services/apiAgents.examples.js`
2. **Create build script**: `scripts/generateContent.js` (batch generates all dreamscapes)
3. **Integrate recovery insights**: Call during gameplay when patterns detected
4. **Expand learning modules**: Build language banks, science modules, psychology content
5. **Cosmology database**: Generate mechanics for all 12+ world traditions

---

## 🌌 Vision

This service transforms GLITCH·PEACE from a static game into a **living, generative consciousness engine** where:
- Every session generates unique, thematically coherent dreamscapes
- Recovery training adapts to player patterns in real-time
- World wisdom traditions become playable mechanics
- Learning is always optional, immersive, and low-stimulation

**Made with ◈ for consciousness explorers** 🌟
