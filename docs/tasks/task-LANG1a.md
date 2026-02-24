# Task LANG1a — Language Learning: Core Infrastructure (FSRS + Content)

**Run after: ARCH1 complete + RESEARCH-LANG1 complete**
**Run before: LANG1b (which wires everything together)**

---

## Audit First

```bash
cat docs/research/language-learning/RESEARCH.md | head -30
find src/ -name "*lang*" -o -name "*learn*" -o -name "*fsrs*" | grep -v node_modules
grep -rn "language\|LanguageMode\|fsrs" src/main.js | head -10
```

Produce a three-section report before touching any code:
1. **ACTUALLY IMPLEMENTED** — code exists AND visibly working in browser
2. **CODE EXISTS BUT BROKEN/UNWIRED** — files exist but produce no visible output
3. **DOCUMENTED ONLY** — mentioned in .md with no corresponding code

---

## Why FSRS, Not SM2

SM2 (1989): ~47% benchmark success rate.
FSRS (Ye, 2023, ACM KDD): ~90% success rate, 20–30% fewer reviews.
SM2 is obsolete. Do not implement or extend it.

FSRS tracks three values per card:
- **D** — Difficulty (1–10): how hard it is to increase stability after review
- **S** — Stability (days): time until retrievability drops from 1.0 to 0.9
- **R** — Retrievability (0–1): current probability of successful recall

---

## Phase 1 — Create FSRS Scheduler

Create `src/core/fsrs.js`. This file has no UI — pure scheduling logic only.

The file must export two classes: `FSRSCard` and `FSRSDeck`.

**FSRSCard fields:**
- `id`, `word` (target language), `meaning` (native language), `context` (example sentence), `language`
- FSRS state: `D = 5`, `S = 0`, `R = 0`, `reviews = 0`, `lapses = 0`, `lastReview = null`
- `dueDate = Date.now()` (new cards always due immediately)
- `state = 'new'` (new | learning | review | relearning)
- `exposures = 0` (times seen as ambient label in Layer 1)

**FSRSCard methods:**
- `get isDue()` — returns `Date.now() >= this.dueDate`
- `getCurrentR()` — returns retrievability using power forgetting curve:
  `Math.pow(1 + FACTOR * t / S, DECAY)` where t = days since last review
  Returns 0 if S === 0.
- `review(rating)` — rating is 1=Again, 2=Hard, 3=Good, 4=Easy
  - First review (state=new or S=0): initialize S from `w[rating-1]`, D from `w[4] - (rating-3)*w[5]`
  - Subsequent reviews: update D, then if rating>=3 increase S using stability increase formula, else decrease S (lapse)
  - Clamp S between 0.01 and MAX_INTERVAL
  - Increment reviews, set lastReview=Date.now()
  - Calculate interval, set dueDate, update state and R
  - Return interval in days
- `recordExposure()` — increments exposures; if S===0 and exposures>=3, set S=0.1

**FSRS parameters (use these exact values):**
```js
const FSRS_PARAMS = {
  w: [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589,
      1.5330, 0.1544, 0.9332, 1.9671, 0.1100, 0.2915, 2.2700, 0.2500,
      2.9898, 0.5100, 0.4300],
  DECAY: -0.5,
  FACTOR: Math.pow(0.9, 1 / -0.5) - 1,  // ≈ 0.1447
  TARGET_RETENTION: 0.90,
  MAX_INTERVAL: 36500,
};
```

**Stability increase formula (rating >= 3):**
```js
const inc = Math.exp(w[8]) * (11 - this.D) * Math.pow(prevS, -w[9]) *
  (Math.exp((1 - r) * w[10]) - 1) * (rating === 4 ? w[11] : 1);
this.S = prevS * (1 + inc);
```

**Stability decrease formula (rating < 3, lapse):**
```js
this.S = w[17] * Math.pow(this.D, -w[15]) *
  (Math.pow(prevS + 1, w[16]) - 1) *
  Math.exp((1 - r) * w[18]);
```

**Interval calculation:**
```js
const interval = Math.max(1, Math.round(
  this.S / FSRS_PARAMS.FACTOR *
  (Math.pow(FSRS_PARAMS.TARGET_RETENTION, 1 / FSRS_PARAMS.DECAY) - 1)
));
```

**FSRSDeck fields:** `language`, `dreamscape`, `cards = new Map()`

**FSRSDeck methods:**
- `addCard(word, meaning, context, language)` — creates FSRSCard with id `language + '_' + cards.size`, adds to map, returns card
- `getDueCards()` — filters cards where isDue
- `getNextCard()` — from due cards, prefer those with exposures>=3 or reviews>0, sort by lowest R, return first
- `getAmbientCards(count=5)` — all cards sorted by lowest exposures, slice to count
- `get stats()` — returns `{ total, due, retention (0-100 int), avgStability (days int) }`

---

## Phase 2 — Create Language Content

Create `src/data/language-content.js`.

Export `LANGUAGE_FAMILIES`, `LANGUAGE_CONTENT`, and `getDreamscapeVocab`.

**Structure:**
```js
export const LANGUAGE_FAMILIES = {
  romance: ['french', 'spanish'],
  japonic: ['japanese'],
};

export const LANGUAGE_CONTENT = {
  french: { name, nativeName, family, script, core: [...], byDreamscape: {...} },
  spanish: { ... },
  japanese: { ... },
};

export function getDreamscapeVocab(language, dreamscape) {
  // Returns [...contextual, ...core] — contextual words first for priority exposure
}
```

**Every word entry must have exactly these four fields:**
```js
{ word: 'string', meaning: 'string', ipa: 'string', context: 'full sentence in target language' }
```

**Minimum 30 words per language** across these categories:
- Consciousness / inner life (éveil, paix, conscience, âme...)
- High-frequency verbs (être, avoir, voir, savoir, pouvoir, vouloir, faire...)
- Dreamscape-specific words (organized under byDreamscape keys)
- Time words (maintenant, toujours, jamais, hier, demain...)
- Numbers 1–10
- Colors (at least 3)
- Body / somatic (le corps, respirer, sentir...)

**byDreamscape must include keys for at minimum:**
- 'Void State'
- 'Forest Cathedral'
- 'Mountain Dragon Realm'

**French starter words (continue to 30+):**

Consciousness/inner life:
- `la conscience` / consciousness / /la kɔ̃sjɑ̃s/ / `La conscience est un outil puissant.`
- `la paix` / peace / /la pɛ/ / `La paix commence en soi.`
- `l'éveil` / awakening / /levɛj/ / `L'éveil est un voyage, pas une destination.`
- `l'âme` / soul / /lam/ / `L'âme cherche toujours la lumière.`
- `la sagesse` / wisdom / /la saʒɛs/ / `La sagesse vient avec le temps.`

High-frequency verbs:
- `être` / to be / /ɛtʁ/ / `Être ici, maintenant.`
- `avoir` / to have / /avwaʁ/ / `Avoir la paix de l'esprit.`
- `voir` / to see / /vwaʁ/ / `Voir clairement.`
- `savoir` / to know / /savwaʁ/ / `Savoir sans comprendre.`
- `guérir` / to heal / /ɡeʁiʁ/ / `On peut toujours guérir.`
- `vouloir` / to want / /vulwaʁ/ / `Vouloir, c'est pouvoir.`
- `pouvoir` / to be able / /puvwaʁ/ / `Tout est possible.`
- `sentir` / to feel / /sɑ̃tiʁ/ / `Sentir la terre sous ses pieds.`
- `respirer` / to breathe / /ʁɛspiʁe/ / `Respirer profondément.`
- `choisir` / to choose / /ʃwaziʁ/ / `Choisir son chemin.`

**Spanish and Japanese** — same structure, same minimum 30 words each.

**Spanish starter words (continue to 30+):**
- `la conciencia` / consciousness / /la konˈθjenθja/ / `La conciencia es el primer paso.`
- `la paz` / peace / /la paθ/ / `La paz comienza adentro.`
- `ser` / to be (essence) / /seɾ/ / `Ser, no parecer.`
- `estar` / to be (state) / /esˈtaɾ/ / `Estar completamente presente.`
- `sanar` / to heal / /saˈnaɾ/ / `Es posible sanar.`
- `despertar` / to awaken / /despeɾˈtaɾ/ / `Es hora de despertar.`
- `respirar` / to breathe / /respiˈɾaɾ/ / `Respirar es vivir.`
- `sentir` / to feel / /senˈtiɾ/ / `Sentir el momento presente.`
- `el alma` / soul / /el ˈalma/ / `El alma nunca miente.`
- `la sabiduría` / wisdom / /la saβiðuˈɾia/ / `La sabiduría llega con calma.`

**Japanese starter words (continue to 30+):**
- `意識 (ishiki)` / consciousness / i·shi·ki / `意識を高める — raise one's consciousness`
- `平和 (heiwa)` / peace / hei·wa / `平和な心を保つ — maintain a peaceful mind`
- `道 (michi)` / path/way / mi·chi / `自分の道を歩む — walk one's own path`
- `魂 (tamashii)` / soul / ta·ma·shi·i / `魂の声を聞く — listen to the soul's voice`
- `知恵 (chie)` / wisdom / chi·e / `知恵は経験から生まれる — wisdom is born from experience`
- `癒し (iyashi)` / healing / i·ya·shi / `心の癒し — healing of the heart`
- `目覚め (mezame)` / awakening / me·za·me / `新しい目覚め — a new awakening`
- `呼吸 (kokyū)` / breathing / ko·kyū / `深い呼吸 — deep breathing`
- `感じる (kanjiru)` / to feel / kan·ji·ru / `今を感じる — feel the present moment`
- `選ぶ (erabu)` / to choose / e·ra·bu / `自分で選ぶ — choose for yourself`

---

## Verification

```bash
npm run build && echo "BUILD OK"
```

Check:
- [ ] `src/core/fsrs.js` exists and exports `FSRSCard` and `FSRSDeck`
- [ ] `src/data/language-content.js` exists and exports `LANGUAGE_CONTENT` and `getDreamscapeVocab`
- [ ] French has 30+ words total (core + byDreamscape combined)
- [ ] Spanish has 30+ words total
- [ ] Japanese has 30+ words total
- [ ] Each word has word, meaning, ipa, context fields
- [ ] Build passes — no import errors

## Commit Message
```
feat: LANG1a — FSRS scheduler + language content data (French/Spanish/Japanese)
```

---
**NEXT: task-LANG1b.md — mode rendering + wiring to main.js**
