'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — self-reflection.js — Phase 8: Awareness Features
//  Provides dreamscape-specific reflection prompts for interlude screens.
//  Non-prescriptive: questions invite, they don't demand.
//  Traces the awakening journey through the 10 dreamscapes.
// ═══════════════════════════════════════════════════════════════════════

// ─── Reflection prompts per dreamscape emotion ─────────────────────────
// Each dreamscape has 3 prompts; one is randomly selected per visit.
const PROMPTS = {
  numbness: [
    { prompt: 'What did you notice about the silence?',       depth: 'surface',  tag: 'awareness' },
    { prompt: 'Was there something beneath the emptiness?',   depth: 'mid',      tag: 'presence'  },
    { prompt: 'Who was aware of the numbness?',               depth: 'deep',     tag: 'meta'      },
  ],
  fear: [
    { prompt: 'Fear showed you what you care about.',        depth: 'surface',  tag: 'emotion'   },
    { prompt: 'What in you faced the dragon?',               depth: 'mid',      tag: 'strength'  },
    { prompt: 'The dragon is energy. What will you do with it?', depth: 'deep', tag: 'transmute' },
  ],
  frustration: [
    { prompt: "Repetition teaches what linear thinking can't.", depth: 'surface', tag: 'pattern' },
    { prompt: 'What loop are you ready to exit in your own life?', depth: 'mid',  tag: 'life'    },
    { prompt: 'Who keeps re-entering the loop?',               depth: 'deep',     tag: 'meta'    },
  ],
  vulnerability: [
    { prompt: 'Leaping requires trusting the unknown.',        depth: 'surface',  tag: 'trust'   },
    { prompt: 'Where do you feel held back in waking life?',   depth: 'mid',      tag: 'life'    },
    { prompt: 'What part of you is done with smallness?',      depth: 'deep',     tag: 'growth'  },
  ],
  exhaustion: [
    { prompt: 'You reached a summit. Rest is allowed.',        depth: 'surface',  tag: 'rest'    },
    { prompt: 'What did the climb cost? What did it reveal?',  depth: 'mid',      tag: 'meaning' },
    { prompt: 'From the peak, everything below is smaller.',   depth: 'deep',     tag: 'perspective' },
  ],
  panic: [
    { prompt: "You moved even in the fear. That's courage.",  depth: 'surface',  tag: 'strength' },
    { prompt: 'What shadow were you running from?',            depth: 'mid',      tag: 'shadow'  },
    { prompt: 'What if the pursuer is a part of yourself?',    depth: 'deep',     tag: 'meta'    },
  ],
  chaos: [
    { prompt: 'Order emerged from chaos. It always does.',     depth: 'surface',  tag: 'pattern' },
    { prompt: 'What does chaos reveal about your need for control?', depth: 'mid', tag: 'control' },
    { prompt: 'Can you be still at the center of the storm?',  depth: 'deep',     tag: 'stillness' },
  ],
  anxiety: [
    { prompt: 'Ancient corridors. Your steps echoed forward.',  depth: 'surface', tag: 'presence' },
    { prompt: 'What ancient pattern are you tracing?',          depth: 'mid',     tag: 'ancestry' },
    { prompt: 'You are both the maze and the one walking it.',  depth: 'deep',    tag: 'meta'     },
  ],
  hope: [
    { prompt: 'The membrane was real. You passed through.',     depth: 'surface', tag: 'threshold' },
    { prompt: 'Where in life are you approaching a membrane?',  depth: 'mid',     tag: 'life'     },
    { prompt: 'Liberation is not an escape. It is expansion.',  depth: 'deep',    tag: 'freedom'  },
  ],
  integration: [
    { prompt: 'You carried all of it. Every dreamscape lives in you.', depth: 'surface', tag: 'completion' },
    { prompt: 'Which dreamscape taught you the most?',          depth: 'mid',     tag: 'reflection' },
    { prompt: 'The player and the game were always one.',       depth: 'deep',    tag: 'meta'     },
  ],
};

// ─── Universal prompts (appear when no dreamscape match) ──────────────
const UNIVERSAL_PROMPTS = [
  { prompt: 'What just happened?',                             depth: 'surface', tag: 'awareness' },
  { prompt: 'What surprised you?',                            depth: 'surface', tag: 'attention' },
  { prompt: 'Was there a moment of stillness?',               depth: 'mid',     tag: 'presence'  },
  { prompt: 'What part of you played that?',                  depth: 'deep',    tag: 'meta'      },
];

// ─── Affirmations shown on completion ─────────────────────────────────
const AFFIRMATIONS = [
  'Every ending is a portal.',
  'You are larger than what you faced.',
  'Awareness grows each time you look.',
  "Rest is not retreat — it's integration.",
  'The observer was always already here.',
  'You brought your whole self.',
  'That which watches fear is not afraid.',
  'Each cycle reveals more of the whole.',
  'You are the dreamer and the dream.',
  'Consciousness playing at being human.',
];

export class SelfReflection {
  constructor() {
    this._visitCounts   = {};     // emotion → number of visits
    this._depthLevel    = 0;      // 0=surface, 1=mid, 2=deep
    this._sessionPrompts = [];    // prompts shown this session
  }

  // ─── Get a reflection prompt for a completed dreamscape ──────────
  getPrompt(dreamscapeEmotion) {
    const pool    = PROMPTS[dreamscapeEmotion] || UNIVERSAL_PROMPTS;
    const visits  = (this._visitCounts[dreamscapeEmotion] || 0);
    this._visitCounts[dreamscapeEmotion] = visits + 1;

    // Gradually increase depth with revisits: surface → mid → deep
    const depthLabels = ['surface', 'mid', 'deep'];
    const targetDepth  = depthLabels[Math.min(2, Math.floor(visits / 2))];

    // Prefer unseen prompts at target depth
    const byDepth  = pool.filter(p => p.depth === targetDepth);
    const unseen   = byDepth.filter(p => !this._sessionPrompts.includes(p.prompt));
    const source   = unseen.length > 0 ? unseen : (byDepth.length > 0 ? byDepth : pool);
    const chosen   = source[Math.floor(Math.random() * source.length)];

    this._sessionPrompts.push(chosen.prompt);
    return chosen;
  }

  // ─── Get a random affirmation ─────────────────────────────────────
  getAffirmation() {
    return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
  }

  // ─── True if player is ready for deeper prompts ──────────────────
  get isDeepReady() {
    const total = Object.values(this._visitCounts).reduce((a, b) => a + b, 0);
    return total >= 4;
  }

  // ─── Stats for awareness dashboard ───────────────────────────────
  get totalReflections() { return this._sessionPrompts.length; }

  get depthDistribution() {
    // Count prompts by depth level for this session
    const dist = { surface: 0, mid: 0, deep: 0 };
    this._sessionPrompts.forEach(p => {
      const match = Object.values(PROMPTS).flat().concat(UNIVERSAL_PROMPTS).find(e => e.prompt === p);
      if (match) dist[match.depth]++;
    });
    return dist;
  }

  resetSession() {
    this._sessionPrompts = [];
  }
}

export const selfReflection = new SelfReflection();
