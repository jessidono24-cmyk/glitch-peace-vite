// Small runner to load .env and execute the API examples
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
  if (!process.env.ANTHROPIC_API_KEY || !process.env.OPENAI_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY or OPENAI_API_KEY in environment or .env. Create .env from .env.example and add keys.');
    process.exit(1);
  }

  // Import examples after env vars are loaded so SDKs pick up keys at construction
  const examples = await import('./apiAgents.examples.js');
  if (!examples || !examples.runAllExamples) {
    console.error('Could not load API examples.');
    process.exit(1);
  }

  await examples.runAllExamples();
}

main().catch(e => { console.error(e); process.exit(1); });
