'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — campaign-story.js — ARCH3
//  10-chapter life progression that mirrors real consciousness development.
//  Each chapter is a life stage: birth → death → rebirth (integration).
//  Run as an opt-in overlay on top of the standard game loop.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gp_campaign_story';

// ─── 10 Life Chapters ─────────────────────────────────────────────────────
// Each chapter maps to a dreamscape, a mode, and a psychological theme.
export const CAMPAIGN_CHAPTERS = [
  {
    chapter:   1,
    title:     'EMERGENCE',
    subtitle:  'Birth into the pattern',
    theme:     'Numbness → Awakening',
    dreamscape: 'void',        // use DREAMSCAPES[0]
    mode:      'grid-classic',
    cosmology: null,
    playstyle: 'balanced',
    narrative: [
      'You exist.',
      'You are a signal in the static.',
      'Learn to move. The pattern is waiting.',
    ],
    objective: 'Collect 5 peace nodes without dying',
    completionHint: 'The first breath is taken.',
  },
  {
    chapter:   2,
    title:     'INITIATION',
    subtitle:  'Meeting the guardian',
    theme:     'Fear → Courage',
    dreamscape: 'dragon',
    mode:      'grid-classic',
    cosmology: 'hermetic',
    playstyle: 'warrior',
    narrative: [
      'Something ancient stirs at the gate.',
      'It tests you not from malice,',
      'but because transformation requires pressure.',
    ],
    objective: 'Complete the dreamscape on the first attempt',
    completionHint: 'The gate opens for those who face it.',
  },
  {
    chapter:   3,
    title:     'ENTRAPMENT',
    subtitle:  'The loop and the teacher',
    theme:     'Frustration → Understanding',
    dreamscape: 'courtyard',
    mode:      'rpg',
    cosmology: 'tarot',
    playstyle: 'sage',
    narrative: [
      'The same walls. The same voices.',
      'Every loop carries a clue.',
      'The captor is also the teacher.',
    ],
    objective: 'Speak to the Elder NPC and collect 3 insight tokens',
    completionHint: 'The prison dissolves when understood.',
  },
  {
    chapter:   4,
    title:     'TRUST',
    subtitle:  'Learning to leap',
    theme:     'Vulnerability → Trust',
    dreamscape: 'field',
    mode:      'grid-classic',
    cosmology: 'buddhist',
    playstyle: 'lucid',
    narrative: [
      'The orb guide appears.',
      'It does not speak — it moves.',
      'Follow without knowing why.',
    ],
    objective: 'Use a TELEPORT tile',
    completionHint: 'Trust is a skill, not a feeling.',
  },
  {
    chapter:   5,
    title:     'TRIUMPH',
    subtitle:  'The summit reached',
    theme:     'Exhaustion → Achievement',
    dreamscape: 'summit',
    mode:      'shooter',
    cosmology: 'norse',
    playstyle: 'warrior',
    narrative: [
      'The climb was real.',
      'So is the view.',
      'The guardian returns — transformed.',
    ],
    objective: 'Survive 3 waves in the summit arena',
    completionHint: 'What you overcome becomes your strength.',
  },
  {
    chapter:   6,
    title:     'COMPASSION',
    subtitle:  'Protecting what was wounded',
    theme:     'Panic → Compassion',
    dreamscape: 'neighborhood',
    mode:      'grid-classic',
    cosmology: null,
    playstyle: 'healer',
    narrative: [
      'The streets you ran as a child.',
      'Old patterns reactivate.',
      'The protector in you wakes up.',
    ],
    objective: 'Collect a GROUNDING tile and activate the Protector archetype',
    completionHint: 'Compassion is protection, not weakness.',
  },
  {
    chapter:   7,
    title:     'PRESENCE',
    subtitle:  'Clarity under pressure',
    theme:     'Chaos → Clarity',
    dreamscape: 'bedroom',
    mode:      'rhythm',
    cosmology: 'hermetic',
    playstyle: 'lucid',
    narrative: [
      'The walls shake.',
      'You breathe.',
      'This moment is the only moment.',
    ],
    objective: 'Complete 8 rhythm beats in succession',
    completionHint: 'Presence is the sword that cuts through chaos.',
  },
  {
    chapter:   8,
    title:     'DISSOLUTION',
    subtitle:  'The labyrinth without walls',
    theme:     'Confinement → Escape',
    dreamscape: 'aztec',
    mode:      'constellation',
    cosmology: 'tarot',
    playstyle: 'explorer',
    narrative: [
      'Dead ends are teachers.',
      'Every captor contains a key.',
      'The pattern shows the exit.',
    ],
    objective: 'Connect 5 constellation nodes',
    completionHint: 'Freedom is found inside the labyrinth.',
  },
  {
    chapter:   9,
    title:     'RELEASE',
    subtitle:  'Phase through everything',
    theme:     'Dissolution → Freedom',
    dreamscape: 'orb',
    mode:      'meditation',
    cosmology: 'buddhist',
    playstyle: 'balanced',
    narrative: [
      'The orb guide leads outward.',
      'Walls were never real.',
      'Let go. Pass through.',
    ],
    objective: 'Complete 3 minutes of meditation mode',
    completionHint: 'The one who lets go arrives first.',
  },
  {
    chapter:   10,
    title:     'INTEGRATION',
    subtitle:  'All systems converge',
    theme:     'Fragmentation → Wholeness',
    dreamscape: 'integration',
    mode:      'grid-classic',
    cosmology: 'hindu',
    playstyle: 'sage',
    narrative: [
      'Every archetype is present.',
      'Every system is available.',
      'The consciousness remembers itself.',
    ],
    objective: 'Complete the integration dreamscape with all systems active',
    completionHint: 'You were whole the entire time.',
  },
];

// ─── CampaignStory class ──────────────────────────────────────────────────
export class CampaignStory {
  constructor() {
    this._data = this._load();
    this._currentChapter = this._data.currentChapter || 1;
    this._completedChapters = new Set(this._data.completedChapters || []);
    this._chapterProgress = this._data.chapterProgress || {};
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentChapter:   this._currentChapter,
        completedChapters: [...this._completedChapters],
        chapterProgress:   this._chapterProgress,
      }));
    } catch(e) {}
  }

  /** Get the current chapter data */
  getCurrentChapter() {
    const idx = Math.min(this._currentChapter - 1, CAMPAIGN_CHAPTERS.length - 1);
    return CAMPAIGN_CHAPTERS[idx];
  }

  /** Get chapter by number (1-10) */
  getChapter(n) {
    return CAMPAIGN_CHAPTERS[(n - 1) % CAMPAIGN_CHAPTERS.length];
  }

  /** Mark a chapter as complete and advance */
  completeChapter(chapterNum) {
    this._completedChapters.add(chapterNum);
    if (chapterNum === this._currentChapter && this._currentChapter < CAMPAIGN_CHAPTERS.length) {
      this._currentChapter++;
    }
    this._save();
    return this.getCurrentChapter();
  }

  /** Check if a chapter is completed */
  isCompleted(chapterNum) {
    return this._completedChapters.has(chapterNum);
  }

  /** Get progress summary */
  getProgress() {
    return {
      currentChapter:   this._currentChapter,
      completedCount:   this._completedChapters.size,
      totalChapters:    CAMPAIGN_CHAPTERS.length,
      percentComplete:  Math.round(this._completedChapters.size / CAMPAIGN_CHAPTERS.length * 100),
      allComplete:      this._completedChapters.size >= CAMPAIGN_CHAPTERS.length,
    };
  }

  /** Reset campaign progress */
  reset() {
    this._currentChapter = 1;
    this._completedChapters = new Set();
    this._chapterProgress = {};
    this._save();
  }
}

export const campaignStory = new CampaignStory();
