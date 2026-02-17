import fs from 'fs';
import path from 'path';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('.env not found at', envPath);
    return;
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([^#][^=]+?)\s*=\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

async function main() {
  loadDotEnv();
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in environment or .env.');
    process.exit(1);
  }

  const apiAgents = await import('./apiAgents.js');

  try {
    console.log('\n--- OpenAI Example: Recovery Insight ---\n');
    const insight = await apiAgents.getRecoveryInsight({
      gameState: 'playing',
      sessionDuration: 10,
      patterns: ['wall-avoidance', 'safe-moves'],
      emotionalField: { anger: 2, fear: 1, hope: 3 },
      userBackground: 'general'
    });
    console.log('Recovery insight:', insight);
  } catch (e) {
    console.error('Recovery insight error:', e?.message || e);
  }

  try {
    console.log('\n--- OpenAI Example: Enemy Personality ---\n');
    const enemy = await apiAgents.generateEnemyPersonality('Test archetype', { shame:1, curiosity:4, coherence:0.5 });
    console.log('Enemy personality:', enemy);
  } catch (e) {
    console.error('Enemy personality error:', e?.message || e);
  }
}

main().catch(e => { console.error('Runner error:', e); process.exit(1); });
