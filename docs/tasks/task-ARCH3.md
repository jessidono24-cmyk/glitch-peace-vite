# Task ARCH3 — Campaign Mode: Life Progression Thread

## Goal
Campaign mode is the "real life" experience — a structured journey through
all game modes in a meaningful sequence that mirrors actual consciousness
development. This task builds the campaign data structure and progression
tracking. UI was scaffolded in ARCH1; this task makes it functional.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Campaign has defined chapters, each with a mode + dreamscape + cosmology
- [ ] Completing a chapter unlocks the next
- [ ] Campaign progress persists in localStorage
- [ ] Campaign map screen shows completed/current/locked chapters
- [ ] Consciousness scores from all chapters accumulate
- [ ] "Life progression" feel: early chapters simple, later chapters complex

## Scope — touch ONLY these files
- `src/systems/campaign-story.js` (create or extend if exists)
- `src/ui/menus.js` (campaign map screen only)
- `src/main.js` (campaign state transitions only)

---

## Campaign Chapter Structure

```js
const CAMPAIGN_CHAPTERS = [
  // ACT 1: AWAKENING
  {
    id: 'ch1', act: 1, title: 'First Breath',
    mode: 'grid', dreamscape: 'void_state', cosmology: 'none',
    playstyle: 'balanced',
    description: 'You begin in stillness. Learn to move.',
    unlockCondition: null, // always available
    completionRequirement: { peaceCollected: 5 }
  },
  {
    id: 'ch2', act: 1, title: 'The Body Remembers',
    mode: 'meditation', dreamscape: 'leaping_field', cosmology: 'chakra',
    playstyle: 'healer',
    description: 'Rest in the field. Feel the energy centers.',
    unlockCondition: { completedChapter: 'ch1' },
    completionRequirement: { meditationMinutes: 2 }
  },
  {
    id: 'ch3', act: 1, title: 'First Contact',
    mode: 'grid', dreamscape: 'childhood', cosmology: 'none',
    playstyle: 'explorer',
    description: 'Navigate the neighborhood of memory.',
    unlockCondition: { completedChapter: 'ch2' },
    completionRequirement: { dreamscapeComplete: true }
  },

  // ACT 2: CONFRONTATION  
  {
    id: 'ch4', act: 2, title: 'Into the Storm',
    mode: 'shooter', dreamscape: 'aztec', cosmology: 'norse',
    playstyle: 'warrior',
    description: 'Face what pursues you. Fight or integrate.',
    unlockCondition: { completedChapter: 'ch3' },
    completionRequirement: { bossDefeated: true }
  },
  {
    id: 'ch5', act: 2, title: 'The Pattern Beneath',
    mode: 'constellation', dreamscape: 'void_state', cosmology: 'hermetic',
    playstyle: 'sage',
    description: 'See the connections. Name the structure.',
    unlockCondition: { completedChapter: 'ch4' },
    completionRequirement: { constellationsFormed: 3 }
  },
  {
    id: 'ch6', act: 2, title: 'The Living World',
    mode: 'ornithology', dreamscape: 'mountain_dragon', cosmology: 'buddhist',
    playstyle: 'explorer',
    description: 'Observe without disturbing. Presence as practice.',
    unlockCondition: { completedChapter: 'ch5' },
    completionRequirement: { birdsObserved: 5 }
  },

  // ACT 3: INTEGRATION
  {
    id: 'ch7', act: 3, title: 'The Underground Network',
    mode: 'mycology', dreamscape: 'void_state', cosmology: 'hermetic',
    playstyle: 'sage',
    description: 'Everything is connected beneath the surface.',
    unlockCondition: { completedChapter: 'ch6' },
    completionRequirement: { networkNodes: 7 }
  },
  {
    id: 'ch8', act: 3, title: 'The Rhythm of Being',
    mode: 'rhythm', dreamscape: 'orb_escape', cosmology: 'none',
    playstyle: 'lucid',
    description: 'Find your rhythm. Synchronize with what is.',
    unlockCondition: { completedChapter: 'ch7' },
    completionRequirement: { rhythmStreaks: 2 }
  },
  {
    id: 'ch9', act: 3, title: 'The Story You Tell',
    mode: 'rpg', dreamscape: 'integration', cosmology: 'tarot',
    playstyle: 'sage',
    description: 'Who are you in the story? Write the next chapter.',
    unlockCondition: { completedChapter: 'ch8' },
    completionRequirement: { questComplete: true }
  },
  {
    id: 'ch10', act: 3, title: 'The Return',
    mode: 'grid', dreamscape: 'integration', cosmology: 'chakra',
    playstyle: 'balanced',
    description: 'Come back to the grid. Everything has changed.',
    unlockCondition: { completedChapter: 'ch9', emergenceLevel: 'NOTICING' },
    completionRequirement: { dreamscapeComplete: true, peaceCollected: 34 }
  },
];
```

---

## Campaign State Management

```js
// In campaign-story.js or storage.js
function loadCampaignProgress() {
  const saved = localStorage.getItem('glitch_campaign');
  return saved ? JSON.parse(saved) : {
    completedChapters: [],
    currentChapter: 'ch1',
    totalConsciousnessScore: 0,
    actUnlocked: 1,
  };
}

function saveChapterComplete(chapterId, consciousnessScore) {
  const progress = loadCampaignProgress();
  if (!progress.completedChapters.includes(chapterId)) {
    progress.completedChapters.push(chapterId);
    progress.totalConsciousnessScore += consciousnessScore;
  }
  // Find next chapter
  const idx = CAMPAIGN_CHAPTERS.findIndex(c => c.id === chapterId);
  if (idx < CAMPAIGN_CHAPTERS.length - 1) {
    progress.currentChapter = CAMPAIGN_CHAPTERS[idx + 1].id;
  }
  localStorage.setItem('glitch_campaign', JSON.stringify(progress));
}
```

---

## Campaign Map Screen (menus.js)

Draw a visual map showing:
- Completed chapters (✓, grayed out but clickable to replay)
- Current chapter (highlighted, pulsing)
- Locked chapters (🔒, shown but not selectable)
- Act dividers (ACT 1 / ACT 2 / ACT 3)
- Total consciousness score accumulated

Navigation:
- Arrow keys to move between chapters
- ENTER to start selected chapter
- ESC to go back to title

---

## Starting a Campaign Chapter

When player starts a chapter, pre-set the game config:
```js
function startCampaignChapter(chapter) {
  CFG.mode = chapter.mode;
  CFG.dreamIdx = getDreamscapeIndex(chapter.dreamscape);
  CFG.cosmology = chapter.cosmology;
  CFG.playstyle = chapter.playstyle;
  CFG.campaignChapter = chapter.id;
  // Do NOT reset consciousness — it carries over
  transitionToPhase('playing');
}
```

## Verification
```bash
npm run build
```
Browser:
1. CAMPAIGN from title → campaign map shows 10 chapters, ch1 highlighted
2. Start ch1 (void_state, grid) → plays grid mode in void dreamscape
3. Complete ch1 → ch2 unlocks, map shows ✓ on ch1
4. Progress saves (refresh browser → ch1 still shows complete)
5. Ch10 shows 🔒 until earlier chapters done

## Commit message
```
feat: ARCH3 campaign mode -- 10-chapter life progression with unlock system
```
