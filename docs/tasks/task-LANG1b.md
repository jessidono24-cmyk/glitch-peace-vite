# Task LANG1b — Language Learning: Mode + Wiring

**Requires: LANG1a complete** (FSRS scheduler + language content must exist first)

---

## Audit First

```bash
# Verify LANG1a output exists
ls src/core/fsrs.js src/data/language-content.js
node -e "import('./src/core/fsrs.js').then(m => console.log('FSRS OK:', Object.keys(m)))" 2>/dev/null || echo "check manually"

# Check wiring state
grep -n "language\|LanguageMode\|lang" src/main.js | head -20
grep -n "language\|LanguageMode" src/ui/menus.js | head -10
find src/modes/ -name "*language*"
```

Produce three-section audit before writing any code:
1. **ACTUALLY IMPLEMENTED** — code exists AND visibly working in browser
2. **CODE EXISTS BUT BROKEN/UNWIRED** — files exist but produce no visible output  
3. **DOCUMENTED ONLY** — mentioned in .md with no corresponding code

---

## Three-Layer Architecture (Reference)

- **Layer 1 — IMMERSION:** words float as ambient labels in the active dreamscape background
- **Layer 2 — ACQUISITION:** FSRS-scheduled recognition quiz (see word → select meaning)
- **Layer 3 — PRODUCTION:** every 3rd card, see meaning → select word (reversed)

---

## Phase 3 — Create the Language Mode

Create `src/modes/language-mode.js`.

**Critical:** use `window.innerWidth` / `window.innerHeight` everywhere for dimensions. Never use `CW()` or `CH()` — those return grid pixel dimensions, not viewport.

**Imports:**
```js
import { FSRSDeck } from '../core/fsrs.js';
import { getDreamscapeVocab, LANGUAGE_CONTENT } from '../data/language-content.js';
```

**States:**
```js
const STATES = {
  LANG_SELECT: 'lang_select',
  IMMERSION:   'immersion',
  QUIZ:        'quiz',
  PRODUCTION:  'production',
  FEEDBACK:    'feedback',
  STATS:       'stats',
};
```

**Constructor fields:** canvas, gameState, phase=LANG_SELECT, selectedLang=null, deck=null, currentCard=null, options=[], feedback=null, feedbackTimer=0, menuIndex=0, time=0, ambientLabels=[], immersionTimer=0, sessionCorrect=0, sessionTotal=0, initialized=false

**`init()`** — sets initialized=true, phase=LANG_SELECT, menuIndex=0

**`_startLanguage(langKey)`** — sets selectedLang, creates FSRSDeck with current dreamscape, calls getDreamscapeVocab and adds all cards to deck, calls _refreshAmbientLabels, sets phase=IMMERSION, immersionTimer=8.0

**`_refreshAmbientLabels()`** — calls deck.getAmbientCards(5), maps to objects with: card, x (0.1 to 0.9 spread), y (0.2–0.8 random), alpha=0, targetAlpha (0.55–0.85 random), wobble (random angle), wobbleSpeed (0.3–0.7 random)

**`_nextCard()`** — gets next card from deck. If null → phase=STATS. Otherwise make options, set phase to PRODUCTION if sessionTotal%3===2, else QUIZ.

**`_makeOptions(card)`** — returns array of 4 meanings: correct + 3 random others from deck, shuffled

**`handleInput(key)`** — guard: if !initialized return
- LANG_SELECT: ArrowDown/Up changes menuIndex, Enter calls _startLanguage
- IMMERSION: Enter or Space calls _nextCard
- QUIZ/PRODUCTION: '1'/'2'/'3'/'4' calls _submitAnswer with index
- FEEDBACK: Enter or Space — if sessionTotal%5===0 go to immersion (5s), else _nextCard

**`_submitAnswer(idx)`** — chosen=options[idx], isCorrect=(chosen===currentCard.meaning), rating=isCorrect?3:1, interval=currentCard.review(rating), increment sessionTotal and sessionCorrect. Set this.feedback object with: correct, chosen, correctAnswer, word, context, interval, D/S/R as strings. Set feedbackTimer=3.5, phase=FEEDBACK.

**`update(dt)`** — guard: if !initialized or !dt or dt>0.5 return (freeze guard)
- Animate ambient labels: wobble += wobbleSpeed*dt, fade alpha toward targetAlpha
- Call recordExposure() on each ambient label's card every frame
- IMMERSION: immersionTimer-=dt, if <=0 call _nextCard
- FEEDBACK: feedbackTimer-=dt, if <=0 advance (same logic as handleInput FEEDBACK)

**`render(ctx)`** — guard: if !initialized return
- W=window.innerWidth, H=window.innerHeight, FONT="'Share Tech Mono', monospace", cx=W/2
- Draw dark background: fillRect(0,0,W,H) with '#000810'
- Draw dreamscape tint overlay based on this.gameState.dreamscape
- If not LANG_SELECT and ambientLabels.length>0: call _renderAmbient
- Switch on phase to call appropriate render method

**`_renderAmbient(ctx, W, H, FONT)`** — for each label with alpha>0:
- x = label.x * W + sin(wobble)*20, y = label.y * H + cos(wobble*0.7)*10
- Draw word at globalAlpha=label.alpha*0.4 in '#00ccff', 18px
- Draw meaning 18px below in '#336688', 13px
- Reset globalAlpha=1

**`_renderLangSelect(ctx, W, H, FONT, cx)`:**
- Title 'LANGUAGE LEARNING' at H*0.14, '#00ccff', 32px
- Subtitle at H*0.21, '#335566', 15px
- For each language: draw selection box at H*0.33 + i*90, highlight selected with border and brighter text
- Controls hint at H*0.9

**`_renderImmersion(ctx, W, H, FONT, cx)`:**
- Semi-transparent panel at bottom (y=H*0.7, height=100)
- Label 'IMMERSION — LAYER 1' at H*0.74
- Description text at H*0.79
- Progress bar at H*0.84 (fills left to right as timer counts down from 8s to 0)
- Hint 'ENTER to begin practice early' at H*0.9

**`_renderQuiz(ctx, W, H, FONT, cx)`:**
- If !currentCard return
- Label at H*0.1 (RECOGNITION LAYER 2 or PRODUCTION LAYER 3 depending on phase)
- Word in white, 46px at H*0.28
- Context sentence in '#334455', 14px at H*0.37 (if exists)
- R/S/D memory stats in very small text (#1a2a3a, 11px) at H*0.43 — format: `R:XX%  S:X.Xd  D:X.X`
- Four option boxes at H*0.52 + i*64 each (48px tall, spanning W*0.18 to W*0.82)
- Each option: dark bg box, border, text `[N]  meaning` in '#5599bb', 17px
- Controls hint at H*0.93

**`_renderFeedback(ctx, W, H, FONT, cx)`:**
- If !feedback return
- Tint entire canvas: green tint if correct, red tint if not
- '✓ CORRECT' or '✗ NOT QUITE' at H*0.28 in '#00ff88' or '#ff5555'
- Word in white, 36px at H*0.40
- '= meaning' in '#aaaaaa', 22px at H*0.50
- Context in '#556677', 14px at H*0.60
- `Next review in X days · D:X S:Xd R:X%` at H*0.70
- Auto-advance timer bar at H*0.80 (same color as correct/incorrect)
- 'ENTER to continue' hint at H*0.88

**`_renderStats(ctx, W, H, FONT, cx)`:**
- 'SESSION COMPLETE' in '#00ffcc', 28px at H*0.25
- Score line `X / Y correct (Z%)` in white, 22px at H*0.38
- Deck retention, avg stability, cards due — each on own line, '#446688', 15px
- 'ESC to return to title' at H*0.82

**`destroy()`** — sets initialized=false

---

## Phase 4 — Wire to main.js

Read the current state of main.js before making any changes:
```bash
grep -n "import.*Mode\|new.*Mode\|registerMode" src/main.js | head -30
grep -n "gameMode\|setPhase\|'playing'" src/main.js | grep -i "lang\|language" | head -10
grep -n "NON_GRID_MODES\|modeManager" src/main.js | head -10
```

**A. Add import at top of main.js:**
```js
import { LanguageMode } from './modes/language-mode.js';
```

**B. Instantiate alongside other modes:**
```js
const languageMode = new LanguageMode(canvas, { dreamscape: null });
```

**C. Register with ModeManager (if ARCH1 wired it):**
```js
modeManager.registerModeInstance('language', languageMode);
```
If ModeManager is not yet wired, skip this line — the mode will be dispatched directly in the loop.

**D. In the mode select handler** — find where `chosen` (or selected mode id) is handled, add:
```js
else if (chosen === 'language') {
  const dsName = DREAMSCAPES?.[CFG?.dreamIdx]?.name || 'Void State';
  languageMode.gameState = { dreamscape: dsName };
  languageMode.init();
  gameMode = 'language';
  setPhase('playing');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}
```
Adapt variable names to match what main.js actually uses — read it first.

**E. In loop() — add BEFORE drawGame() is called:**
```js
if (gameMode === 'language') {
  languageMode.update(dt / 1000);
  languageMode.render(ctx);
  drawAchievementPopup(ctx, window.innerWidth, window.innerHeight, achievementSystem?.popup, ts);
  animId = requestAnimationFrame(loop);
  return; // critical — must return before drawGame()
}
```

**F. In keydown handler** — add where other mode-specific keys are handled:
```js
if (phase === 'playing' && gameMode === 'language') {
  languageMode.handleInput(e.key);
  if (e.key === 'Escape') {
    languageMode.destroy();
    gameMode = 'grid';
    setPhase('title');
  }
  e.preventDefault();
  return;
}
```

---

## Phase 5 — Add to Mode Select Menu

Find the GAME_MODES array in `src/ui/menus.js` (or wherever mode list lives):
```bash
grep -n "GAME_MODES\|mode.*id\|icon.*label" src/ui/menus.js | head -20
```

Add language mode entry:
```js
{ id: 'language', icon: '🗣', label: 'LANGUAGE LEARNING',
  desc: 'FSRS adaptive spacing  ·  French · Spanish · Japanese  ·  3-layer immersion' },
```

---

## Phase 6 — Verification

```bash
npm run build && echo "BUILD OK"
```

Manual checks in browser:
- [ ] Language Learning appears in mode select screen
- [ ] Language select screen shows French / Spanish / Japanese with family/script info
- [ ] Selecting French enters immersion phase — word labels float on dark dreamscape-tinted bg
- [ ] After 8 seconds (or ENTER), recognition quiz appears (Layer 2)
- [ ] Every 3rd question shows reversed prompt (Layer 3 — production)
- [ ] Answer feedback shows D/S/R values and next interval in days
- [ ] After 5 cards, immersion phase returns briefly
- [ ] Stats screen shows session score, retention%, avg stability, cards due
- [ ] ESC at any point returns to title screen
- [ ] Zero grid tiles visible at any point in this mode
- [ ] Canvas fills full screen (no black bars — requires ARCH1)
- [ ] No freeze at any point

## Commit Message
```
feat: LANG1b — Language Learning mode render + main.js wiring
```

---
**LANG1a + LANG1b together complete the full Language Learning mode.**
