// ═══════════════════════════════════════════════════════════════════════
//  API AGENTS SERVICE - Consciousness Engine Content Generation
//  Uses Anthropic (Claude) & OpenAI (GPT-4) for:
//  - Procedural dreamscape generation
//  - Emotional/cosmology system suggestions
//  - Recovery affirmations & wisdom
//  - Learning module content
//  - Pattern training suggestions
// ═══════════════════════════════════════════════════════════════════════

import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- OpenAI model detection + safe wrapper ---
let cachedOpenAIModel = null;
async function detectOpenAIModel() {
  const candidates = [
    'gpt-4-turbo',
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-3.5-turbo'
  ];
  for (const model of candidates) {
    try {
      // tiny probe to check availability
      await openai.chat.completions.create({
        model,
        max_tokens: 1,
        messages: [{ role: 'system', content: 'probe' }]
      });
      cachedOpenAIModel = model;
      return model;
    } catch (err) {
      // if model not found or access denied, try next
      const msg = err?.message || '';
      if (msg.includes('does not exist') || msg.includes('do not have access') || (err?.status === 404)) {
        continue;
      }
      // other errors (rate limits, auth) should be surfaced
      throw err;
    }
  }
  return null;
}

async function openaiChatCompletion(messages, max_tokens = 256) {
  if (!cachedOpenAIModel) {
    await detectOpenAIModel();
  }
  if (!cachedOpenAIModel) {
    throw new Error('No available OpenAI model found for completion');
  }
  return openai.chat.completions.create({ model: cachedOpenAIModel, max_tokens, messages });
}

/**
 * DREAMSCAPE GENERATION
 * Uses Claude for creativity + world-building
 */
export async function generateDreamscape(config = {}) {
  const { 
    emotionalState = {},  // { emotion: value } pairs
    cosmology = 'neutral',
    biomeType = 'void',
    difficultyModifier = 1.0
  } = config;

  const emotionalContext = Object.entries(emotionalState)
    .map(([emotion, value]) => `${emotion}: ${value}`)
    .join(', ') || 'baseline state';

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `As a consciousness simulation designer, generate a dreamscape for GLITCH·PEACE.

Player emotional state: ${emotionalContext}
Cosmology lens: ${cosmology}
Biome type: ${biomeType}
Difficulty: ${difficultyModifier}x

Return JSON with:
{
  "name": "Dreamscape name",
  "flavor": "One-line description",
  "symbol": "◇ or ◆ etc",
  "tilePool": ["DESPAIR", "TERROR", "PEACE", "INSIGHT"],
  "enemyBehaviour": "wander|chase|patrol|ambush",
  "emotionalModifiers": {"anger": 0.5, "awe": -0.3},
  "recoveryFocus": "compassionate message or teaching",
  "wisdom": "Relevant quote (sterilized, no dogma)"
}

Keep tone non-violent, pattern-recognition focused.`
      }
    ]
  });

  try {
    const jsonMatch = message.content[0].type === 'text' 
      ? message.content[0].text.match(/\{[\s\S]*\}/)
      : null;
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error('Dreamscape generation parse error:', e);
    return null;
  }
}

/**
 * COSMOLOGY MECHANICS TRANSLATOR
 * Claude → Turns world traditions into game rules
 */
export async function cosmoTranslate(tradition, gameParameter) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Convert this wisdom tradition into a game mechanic for GLITCH·PEACE (consciousness engine).

Tradition: ${tradition}
Target parameter: ${gameParameter} (e.g., enemy behavior, tile effect, emotional synergy)

Return JSON:
{
  "mechanic_name": "Game rule name",
  "description": "How it works (non-dogmatic, sterilized)",
  "implementation": ["code pseudocode", "or key rules"],
  "teaches": "What consciousness skill/insight this develops"
}

Remember: This is a pattern-recognition tool, not a belief system. Strip dogma, keep principles.`
      }
    ]
  });

  try {
    const jsonMatch = message.content[0].type === 'text'
      ? message.content[0].text.match(/\{[\s\S]*\}/)
      : null;
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error('Cosmology translation error:', e);
    return null;
  }
}

/**
 * RECOVERY AFFIRMATIONS & PATTERN INSIGHTS
 * GPT-4 for immediate, context-aware recovery support
 */
export async function getRecoveryInsight(context = {}) {
  const {
    gameState = 'playing',
    sessionDuration = 0,
    patterns = [],
    emotionalField = {},
    userBackground = 'general'  // 'addiction', 'anxiety', 'adhd', 'general'
  } = context;

  const patternSummary = patterns.slice(0, 3)
    .map(p => `repeated ${p}`)
    .join(', ') || 'no patterns yet';

  const emotionalSummary = Object.entries(emotionalField)
    .filter(([_, v]) => v > 3)
    .map(([e, v]) => `${e}: ${Math.round(v)}`)
    .join(', ') || 'stable';

  const response = await openaiChatCompletion([
    {
      role: 'system',
      content: `You are a recovery pattern trainer inside GLITCH·PEACE, a consciousness simulation game. 
Provide brief, compassionate, non-clinical insights about game patterns that reflect real-world pattern recognition.
Use gaming language, not therapy language. Celebrate boundaries. Never shame.`
    },
    {
      role: 'user',
      content: `Game state: ${gameState}
Session time: ${sessionDuration}m
Observed patterns: ${patternSummary}
Current emotions: ${emotionalSummary}
Context: ${userBackground}

Give ONE actionable insight (30 words max) connecting the game pattern to player growth.`
    }
  ], 256);

  return response.choices[0]?.message?.content || null;
}

/**
 * LEARNING MODULE CONTENT GENERATOR
 * Claude for educational micro-content (languages, math, psychology)
 */
export async function generateLearningModule(subject, difficulty) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Create a micro-learning module for GLITCH·PEACE embedded in gameplay.

Subject: ${subject} (e.g., Spanish vocab, prime numbers, decision psychology)
Difficulty: ${difficulty} (1-5)

Return JSON:
{
  "title": "Glyph name",
  "concept": "Single concept to teach",
  "examples": ["example 1", "example 2"],
  "connection": "How this relates to pattern recognition/consciousness",
  "quiz": {
    "question": "Simple question",
    "options": ["A", "B", "C", "D"],
    "correct": 0
  }
}

Keep it micro (one insight). Low cognitive load. Optional to player.`
      }
    ]
  });

  try {
    const jsonMatch = message.content[0].type === 'text'
      ? message.content[0].text.match(/\{[\s\S]*\}/)
      : null;
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error('Learning module generation error:', e);
    return null;
  }
}

/**
 * ENEMY AI BEHAVIOR GENERATOR
 * GPT-4 for dynamic, context-aware enemy personalities
 */
export async function generateEnemyPersonality(enemyType, emotionalContext) {
  const response = await openaiChatCompletion([
    {
      role: 'system',
      content: `You are an AI game designer creating enemy behaviors for GLITCH·PEACE.
Each enemy is a pattern archetype (not evil—just different).
Return JSON with behavior rules and symbolic meaning.`
    },
    {
      role: 'user',
      content: `Enemy archetype: ${enemyType}
Emotional context: ${JSON.stringify(emotionalContext)}

Return JSON:
{
  "behavior": "wander|chase|patrol|ambush",
  "speed": 0-1,
  "aggression": 0-1,
  "pattern": "Description of movement pattern",
  "teaching": "What this enemy archetype teaches about patterns"
}`
    }
  ], 256);

  try {
    const json = JSON.parse(response.choices[0]?.message?.content || '{}');
    return json;
  } catch (e) {
    console.error('Enemy personality generation error:', e);
    return null;
  }
}

/**
 * EMOTIONAL SYNERGY SUGGESTIONS
 * Claude for complex emotional state interpretation
 */
export async function suggestEmotionalSynergy(emotionalField, gameState) {
  const emotions = Object.entries(emotionalField)
    .filter(([_, v]) => v > 2)
    .map(([e, v]) => `${e}:${Math.round(v)}`)
    .join(', ')
    || 'equilibrium';

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `In GLITCH·PEACE consciousness engine, suggest emotional synergy activation.

Active emotions: ${emotions}
Game state: ${gameState}

Return JSON:
{
  "synergy": "Synergy name",
  "effect": "Brief game effect",
  "insight": "What this teaches about emotional dynamics",
  "activate": true/false
}`
      }
    ]
  });

  try {
    const jsonMatch = message.content[0].type === 'text'
      ? message.content[0].text.match(/\{[\s\S]*\}/)
      : null;
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error('Emotional synergy suggestion error:', e);
    return null;
  }
}

/**
 * BATCH GENERATION (efficient for multiple content pieces)
 */
export async function generateGameContent(batch) {
  const results = {};

  for (const [key, request] of Object.entries(batch)) {
    try {
      switch (request.type) {
        case 'dreamscape':
          results[key] = await generateDreamscape(request.config);
          break;
        case 'recovery':
          results[key] = await getRecoveryInsight(request.context);
          break;
        case 'learning':
          results[key] = await generateLearningModule(request.subject, request.difficulty);
          break;
        case 'cosmology':
          results[key] = await cosmoTranslate(request.tradition, request.parameter);
          break;
        default:
          results[key] = null;
      }
    } catch (error) {
      console.error(`Error generating ${key}:`, error);
      results[key] = null;
    }
  }

  return results;
}

export default {
  generateDreamscape,
  cosmoTranslate,
  getRecoveryInsight,
  generateLearningModule,
  generateEnemyPersonality,
  suggestEmotionalSynergy,
  generateGameContent
};
