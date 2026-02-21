// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — systems/campaign-story.js — ARCH3
//  10-chapter life progression campaign with unlock system.
//  Mirrors real consciousness development: birth → confrontation → integration.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'glitch_campaign';

// ─── Dreamscape key → DREAMSCAPES id mapping ───────────────────────────
const DREAMSCAPE_KEY_MAP = {
  'void_state':      'void',
  'leaping_field':   'leaping_field',
  'childhood':       'neighborhood',
  'aztec':           'aztec',
  'mountain_dragon': 'mountain_dragon',
  'orb_escape':      'orb_escape',
  'integration':     'integration',
  'none':            null,
};

// ─── 10 Campaign Chapters ──────────────────────────────────────────────
export const CAMPAIGN_CHAPTERS = [
  // ACT 1: AWAKENING
  {
    id: 'ch1', act: 1, title: 'First Breath',
    mode: 'grid', dreamscape: 'void_state', cosmology: 'none',
    playstyle: 'balanced',
    description: 'You begin in stillness. Learn to move.',
    unlockCondition: null, // always available
    completionRequirement: { peaceCollected: 5 },
  },
  {
    id: 'ch2', act: 1, title: 'The Body Remembers',
    mode: 'meditation', dreamscape: 'leaping_field', cosmology: 'chakra',
    playstyle: 'healer',
    description: 'Rest in the field. Feel the energy centers.',
    unlockCondition: { completedChapter: 'ch1' },
    completionRequirement: { meditationMinutes: 2 },
  },
  {
    id: 'ch3', act: 1, title: 'First Contact',
    mode: 'grid', dreamscape: 'childhood', cosmology: 'none',
    playstyle: 'explorer',
    description: 'Navigate the neighborhood of memory.',
    unlockCondition: { completedChapter: 'ch2' },
    completionRequirement: { dreamscapeComplete: true },
  },

  // ACT 2: CONFRONTATION
  {
    id: 'ch4', act: 2, title: 'Into the Storm',
    mode: 'shooter', dreamscape: 'aztec', cosmology: 'norse',
    playstyle: 'warrior',
    description: 'Face what pursues you. Fight or integrate.',
    unlockCondition: { completedChapter: 'ch3' },
    completionRequirement: { bossDefeated: true },
  },
  {
    id: 'ch5', act: 2, title: 'The Pattern Beneath',
    mode: 'constellation', dreamscape: 'void_state', cosmology: 'hermetic',
    playstyle: 'sage',
    description: 'See the connections. Name the structure.',
    unlockCondition: { completedChapter: 'ch4' },
    completionRequirement: { constellationsFormed: 3 },
  },
  {
    id: 'ch6', act: 2, title: 'The Living World',
    mode: 'ornithology', dreamscape: 'mountain_dragon', cosmology: 'buddhist',
    playstyle: 'explorer',
    description: 'Observe without disturbing. Presence as practice.',
    unlockCondition: { completedChapter: 'ch5' },
    completionRequirement: { birdsObserved: 5 },
  },

  // ACT 3: INTEGRATION
  {
    id: 'ch7', act: 3, title: 'The Underground Network',
    mode: 'mycology', dreamscape: 'void_state', cosmology: 'hermetic',
    playstyle: 'sage',
    description: 'Everything is connected beneath the surface.',
    unlockCondition: { completedChapter: 'ch6' },
    completionRequirement: { networkNodes: 7 },
  },
  {
    id: 'ch8', act: 3, title: 'The Rhythm of Being',
    mode: 'rhythm', dreamscape: 'orb_escape', cosmology: 'none',
    playstyle: 'lucid',
    description: 'Find your rhythm. Synchronize with what is.',
    unlockCondition: { completedChapter: 'ch7' },
    completionRequirement: { rhythmStreaks: 2 },
  },
  {
    id: 'ch9', act: 3, title: 'The Story You Tell',
    mode: 'rpg', dreamscape: 'integration', cosmology: 'tarot',
    playstyle: 'sage',
    description: 'Who are you in the story? Write the next chapter.',
    unlockCondition: { completedChapter: 'ch8' },
    completionRequirement: { questComplete: true },
  },
  {
    id: 'ch10', act: 3, title: 'The Return',
    mode: 'grid', dreamscape: 'integration', cosmology: 'chakra',
    playstyle: 'balanced',
    description: 'Come back to the grid. Everything has changed.',
    unlockCondition: { completedChapter: 'ch9', emergenceLevel: 'NOTICING' },
    completionRequirement: { dreamscapeComplete: true, peaceCollected: 34 },
  },
];

// ─── Progress persistence ──────────────────────────────────────────────
export function loadCampaignProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      completedChapters: [],
      currentChapter: 'ch1',
      totalConsciousnessScore: 0,
      actUnlocked: 1,
    };
  } catch (_) {
    return {
      completedChapters: [],
      currentChapter: 'ch1',
      totalConsciousnessScore: 0,
      actUnlocked: 1,
    };
  }
}

export function saveChapterComplete(chapterId, consciousnessScore) {
  const progress = loadCampaignProgress();
  if (!progress.completedChapters.includes(chapterId)) {
    progress.completedChapters.push(chapterId);
    progress.totalConsciousnessScore += (consciousnessScore || 0);
  }
  // Advance currentChapter to the next uncompleted chapter
  const idx = CAMPAIGN_CHAPTERS.findIndex(c => c.id === chapterId);
  if (idx >= 0 && idx < CAMPAIGN_CHAPTERS.length - 1) {
    progress.currentChapter = CAMPAIGN_CHAPTERS[idx + 1].id;
    progress.actUnlocked = Math.max(progress.actUnlocked, CAMPAIGN_CHAPTERS[idx + 1].act);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (_) {}
  return progress;
}

// ─── Dreamscape index lookup ───────────────────────────────────────────
export function getDreamscapeIndex(dreamscapeKey, DREAMSCAPES) {
  if (!DREAMSCAPES) return 0;
  const dsId = DREAMSCAPE_KEY_MAP[dreamscapeKey] ?? dreamscapeKey;
  if (!dsId) return 0;
  const idx = DREAMSCAPES.findIndex(d => d.id === dsId);
  return idx >= 0 ? idx : 0;
}

// ─── Unlock check ─────────────────────────────────────────────────────
// emergenceLevelValue is a 0-1 float from emergenceIndicators.emergenceLevel
const NOTICING_THRESHOLD = 0.35;
export function isChapterUnlocked(chapter, progress, emergenceLevelValue) {
  if (!chapter.unlockCondition) return true;
  const cond = chapter.unlockCondition;
  const completedChapters = progress.completedChapters || [];
  if (cond.completedChapter) {
    const ids = Array.isArray(completedChapters)
      ? completedChapters
      : [...completedChapters];
    if (!ids.includes(cond.completedChapter)) return false;
  }
  if (cond.emergenceLevel) {
    if ((emergenceLevelValue || 0) < NOTICING_THRESHOLD) return false;
  }
  return true;
}
