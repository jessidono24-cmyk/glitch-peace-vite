// ═══════════════════════════════════════════════════════════════════════
//  EXAMPLE: Using API Agents for GLITCH·PEACE Content Generation
// ═══════════════════════════════════════════════════════════════════════

// Import the API agents service
import apiAgents from './apiAgents.js';

/**
 * Example 1: Generate a custom dreamscape
 * (Can be called during build or server-side for dynamic content)
 */
export async function exampleGenerateDreamscape() {
  console.log('🌌 Generating dreamscape...');

  const dreamscape = await apiAgents.generateDreamscape({
    emotionalState: {
      grief: 4,
      curiosity: 6,
      awe: 3
    },
    cosmology: 'buddhist-wheel',
    biomeType: 'water-archives',
    difficultyModifier: 1.2
  });

  console.log('✨ Dreamscape generated:', dreamscape);
  return dreamscape;
}

/**
 * Example 2: Get recovery insight during gameplay
 */
export async function exampleGetRecoveryInsight() {
  console.log('🛟 Fetching recovery insight...');

  const insight = await apiAgents.getRecoveryInsight({
    gameState: 'playing',
    sessionDuration: 25,
    patterns: ['repeated-charge', 'impulsive-moves', 'risk-taking'],
    emotionalField: {
      anger: 5,
      fear: 3,
      hope: 2
    },
    userBackground: 'addiction-recovery'
  });

  console.log('💡 Insight:', insight);
  return insight;
}

/**
 * Example 3: Translate a wisdom tradition into game mechanics
 */
export async function exampleCosmoTranslate() {
  console.log('🌿 Translating cosmology...');

  const mechanic = await apiAgents.cosmoTranslate(
    'Buddhist Wheel of Becoming (12 Nidanas): Ignorance → Formations → Consciousness → Name-Form → Six Senses → Contact → Feeling → Craving → Grasping → Becoming → Birth → Decay',
    'enemy-behavior-cycle'
  );

  console.log('⚙️ Mechanic:', mechanic);
  return mechanic;
}

/**
 * Example 4: Generate a learning module
 */
export async function exampleGenerateLearningModule() {
  console.log('📚 Creating learning module...');

  const module = await apiAgents.generateLearningModule(
    'Spanish vocabulary: emotions',
    2  // difficulty 1-5
  );

  console.log('📖 Module:', module);
  return module;
}

/**
 * Example 5: Batch generate multiple content pieces
 * (Most efficient for build-time content generation)
 */
export async function exampleBatchGeneration() {
  console.log('🎨 batch generating content...');

  const batch = {
    dreamscape_1: {
      type: 'dreamscape',
      config: {
        emotionalState: { awe: 5, curiosity: 4 },
        cosmology: 'taoist',
        biomeType: 'spiral-gardens'
      }
    },
    recovery_insight: {
      type: 'recovery',
      context: {
        gameState: 'playing',
        sessionDuration: 15,
        patterns: ['wall-avoidance', 'safe-moves'],
        userBackground: 'anxiety-management'
      }
    },
    learning_math: {
      type: 'learning',
      subject: 'Fibonacci sequence',
      difficulty: 3
    },
    cosmology_hindu: {
      type: 'cosmology',
      tradition: 'Hindu Chakra System: Root (survival) → Sacral (creativity) → Solar Plexus (will) → Heart (love) → Throat (expression) → Third Eye (intuition) → Crown (unity)',
      parameter: 'tile-effect-progression'
    }
  };

  const results = await apiAgents.generateGameContent(batch);
  console.log('📦 Batch results:', results);
  return results;
}

/**
 * Example 6: Generate dynamic enemy personality
 */
export async function exampleGenerateEnemyPersonality() {
  console.log('👾 Creating enemy archetype...');

  const enemy = await apiAgents.generateEnemyPersonality(
    'Mirror archetype',
    {
      shame: 3,
      curiosity: 5,
      coherence: 0.6
    }
  );

  console.log('🎭 Enemy personality:', enemy);
  return enemy;
}

/**
 * Example 7: Suggest emotional synergy
 */
export async function exampleEmotionalSynergy() {
  console.log('⚡ Analyzing emotional synergy...');

  const synergy = await apiAgents.suggestEmotionalSynergy(
    {
      joy: 6,
      hope: 5,
      awe: 3
    },
    'approaching-goal'
  );

  console.log('✨ Synergy suggestion:', synergy);
  return synergy;
}

/**
 * MAIN DEMO: Run all examples
 */
export async function runAllExamples() {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  🌌 GLITCH·PEACE API AGENTS EXAMPLES');
    console.log('═══════════════════════════════════════════════════════\n');

    // Example 1: Dreamscape
    console.log('\n--- Example 1: Dreamscape Generation ---');
    await exampleGenerateDreamscape();

    // Example 2: Recovery Insight
    console.log('\n--- Example 2: Recovery Insight ---');
    await exampleGetRecoveryInsight();

    // Example 3: Cosmology Translation
    console.log('\n--- Example 3: Cosmology → Mechanic ---');
    await exampleCosmoTranslate();

    // Example 4: Learning Module
    console.log('\n--- Example 4: Learning Module ---');
    await exampleGenerateLearningModule();

    // Example 5: Batch Generation (most efficient)
    console.log('\n--- Example 5: Batch Generation ---');
    await exampleBatchGeneration();

    // Example 6: Enemy Personality
    console.log('\n--- Example 6: Enemy Personality ---');
    await exampleGenerateEnemyPersonality();

    // Example 7: Emotional Synergy
    console.log('\n--- Example 7: Emotional Synergy ---');
    await exampleEmotionalSynergy();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ Examples completed!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Example error:', error.message);
  }
}

// Run if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
