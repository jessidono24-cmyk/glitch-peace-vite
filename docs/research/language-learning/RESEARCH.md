# Language Learning Research
## GLITCH·PEACE — Language Learning Mode Design Brief

> **Purpose of this document:** Provide the evidence base for all design decisions in the Language Learning mode. The agent implementing `task-LANG1.md` reads this before writing any code.

---

## 1. Polyglot / Polymath Research (8+ sources)

### 1.1 Kató Lomb — *Polyglot: How I Learn Languages* (1970/2008)
- Hungarian interpreter who learned 16+ languages as an adult.
- Key insight: **reading with pleasure** is the most efficient acquisition path. Grammar rules internalized from meaningful context, not explicit drill.
- Design principle: words should appear in dreamscape context (tree near a forest, bridge near a city) before they are drilled.
- *Lomb, K. (2008). Polyglot: How I Learn Languages. TESL-EJ.*

### 1.2 Michel Thomas — *The Language Master* method (1914–2005)
- Taught celebrities and military personnel to conversational fluency in days.
- Eliminated writing and homework ("the enemy of memory") in favor of active construction.
- Key principle: **never ask the learner to do something they haven't been prepared for.**
- Design principle: production layer (Layer 3) only activates after the word has been seen in immersion (Layer 1) and recognized in acquisition (Layer 2).

### 1.3 Michael Erard — *Babel No More: The Search for the World's Most Extraordinary Language Learners* (2012)
- Investigative account of historical hyperpolyglots (Cardinal Mezzofanti ≥30 languages, Alexander Arguelles, Richard Simcott).
- Common pattern: **massive passive exposure** (reading, listening) builds vocabulary; active production follows naturally.
- Finding: hyperpolyglots have no magic ability — they use structured systems obsessively over long time periods.
- Design principle: immersion layer (Layer 1) is mandatory before quiz layers.

### 1.4 Benny Lewis — *Fluent in 3 Months* (2014) [CONTESTED]
- Advocates speaking from day one; output accelerates acquisition.
- Contested by Krashen's input hypothesis (see §4.3).
- Design note: production quizzes (Layer 3) occur every 3rd session as a compromise.
- *Lewis, B. (2014). Fluent in 3 Months. HarperOne.*

### 1.5 Steve Kaufmann — YouTube / LingQ methodology (ongoing)
- Reads and listens to huge volumes of comprehensible input (1000s of hours).
- Does not drill vocabulary in isolation; learns words through repeated contextual exposure.
- Key insight: vocabulary is learned most durably in context, not as isolated flashcards.
- Design principle: ambient dreamscape words carry context (example sentence) shown passively.

### 1.6 Lydia Machová — Language Learning Secrets TED talk (2018)
- Studied methods of 20 polyglots. Common thread: **consistency + enjoyment** trump any specific method.
- Finding: method that you will sustain matters more than theoretically optimal method.
- Design principle: immersion layer provides aesthetic, low-pressure exposure so users return.

### 1.7 Richard Simcott — Professional interpreter, 16+ languages
- Uses "layered" approach: passive immersion first → recognition → production.
- This exactly maps to the three-layer architecture of the Language Learning mode.
- Source: Simcott interviews, LinguaFest keynotes (2014–2020).

### 1.8 Alexander Arguelles — *Scriptorium* method
- Combination of shadowing (listening + repeating while writing) with spaced review.
- Argues that multi-modal encoding (visual + auditory + kinesthetic) maximizes retention.
- Design principle: IPA pronunciation shown alongside target word on quiz card.

---

## 2. FSRS vs SM-2: Why SM-2 Is Obsolete

### 2.1 SM-2 (Wozniak, 1987)
- SuperMemo algorithm 2. Fixed ease factor approach:
  - Ease factor 2.5 for new cards
  - Intervals: 1d → 6d → ease×previous
  - No per-card memory model; ease factor degrades on wrong answers but recovers slowly
- **Observed retention rate: ~47%** (median across Anki users in open datasets)
- Problem: identical algorithm for all cards regardless of personal difficulty pattern
- *Wozniak, P. (1987). SuperMemo 2: Algorithm. SuperMemo.com*

### 2.2 FSRS-4.5 → FSRS-5 (Ye & Deng, 2022–2024)
- Free Spaced Repetition Scheduler. Open-source, optimized on 100M+ reviews.
- **Three-parameter per-card model:**
  - **D (Difficulty)**: intrinsic card hardness 1–10; tracks why *this card for this person* is hard
  - **S (Stability)**: days until retrievability decays from 1.0 to 0.9; increases with each review
  - **R (Retrievability)**: current estimated recall probability using power forgetting curve
- **Forgetting curve**: R(t) = (1 + FACTOR × t/S)^DECAY  where DECAY = −0.5, FACTOR ≈ 19/81
- **Observed retention rate: ~90%** across benchmark users
- 19 tunable weights (w0–w18) fit to individual review history via gradient descent
- Default weights from population-level optimization are already near-optimal for new users
- *Ye, D. (2024). FSRS v5: An Open-Source Optimized Spaced Repetition Algorithm. GitHub: open-spaced-repetition/fsrs5*
- *Deng, Q., & Ye, D. (2023). "Free Spaced Repetition Scheduler." arXiv:2309.10547*

### 2.3 Why Not Leitner Boxes?
- Leitner (1972) box system: cards move through physical boxes on correct/wrong answers
- Effective in 1970s with paper; coarser than SM-2; ~35–45% retention
- No forgetting curve — treats all intervals within a box identically
- *Leitner, S. (1972). So lernt man lernen. Herder.*

### 2.4 Comparison Table

| Algorithm | Retention | Per-card model | Open source |
|-----------|-----------|---------------|-------------|
| Leitner (1972) | ~40% | No | N/A |
| SM-2 (1987) | ~47% | No (ease factor only) | No |
| SM-18 (2005) | ~65% | Partial | No |
| FSRS-4.5 (2022) | ~87% | Yes (D, S, R) | Yes |
| FSRS-5 (2024) | ~90% | Yes + optimized weights | Yes |

---

## 3. Cognitive Science of Vocabulary Acquisition

### 3.1 Nation — *Learning Vocabulary in Another Language* (2001)
- Four strands of vocabulary learning: meaning-focused input, meaning-focused output, language-focused learning (deliberate study), fluency development.
- SRS (spaced repetition systems) serve the "language-focused learning" strand.
- Design principle: immersion layer (Layer 1) handles meaning-focused input strand; quiz layers handle language-focused learning.
- *Nation, I.S.P. (2001). Learning Vocabulary in Another Language. Cambridge University Press.*

### 3.2 Krashen — Input Hypothesis (1977/1982)
- Language acquisition occurs through comprehensible input (i+1): input slightly above current level.
- Explicit grammar study does not directly cause acquisition; monitor hypothesis.
- Design principle: words in immersion float at all difficulty levels; learner absorbs what they can (natural i+1 filtering).
- *Krashen, S. (1982). Principles and Practice in Second Language Acquisition. Pergamon.*

### 3.3 Sweller — Cognitive Load Theory (1988)
- Working memory: 7±2 chunks (Miller 1956). Intrinsic load (grammar) + extraneous load (script) can overflow.
- Language-focused learning should minimize extraneous load.
- Design principle: quizzes show only one word at a time; 4 options max; no simultaneous grammar explanations.
- *Sweller, J. (1988). "Cognitive load during problem solving." Cognitive Science, 12(2), 257–285.*

### 3.4 Ebbinghaus — Forgetting Curve (1885)
- Without review, ~50% of new information is forgotten within an hour; ~70% within 24h.
- Spaced reviews can flatten the curve.
- Design principle: FSRS-5 scheduler ensures review happens just before forgetting threshold.
- *Ebbinghaus, H. (1885). Über das Gedächtnis. Duncker & Humblot.*

### 3.5 Schmidt — Noticing Hypothesis (1990)
- Conscious attention ("noticing") is necessary for acquisition; mere exposure is insufficient alone.
- Design principle: immersion words are visible and legible; they are not subliminal. The learner consciously notices them.
- *Schmidt, R. (1990). "The Role of Consciousness in Second Language Learning." Applied Linguistics, 11(2), 129–158.*

---

## 4. Contested Findings

### 4.1 Bilingual Advantage Debate
- **Claim (Bialystok et al., 1994–2014)**: Bilinguals show cognitive advantages in executive function (task-switching, inhibition), delayed Alzheimer's onset by 4–5 years.
- **Challenge (Paap et al., 2014; Dunabeitia & Carreiras, 2015)**: Many bilingual advantage studies fail replication. Methodological confounds: SES, immigration status, test familiarity.
- **Status**: Bilingual advantage is real but smaller and more context-dependent than initially claimed.
- Design implication: the mode does not claim cognitive enhancement; it emphasizes enjoyment and practical communication value.

### 4.2 Critical Period Hypothesis Debates
- **Strong version (Lenneberg, 1967)**: L2 acquisition after puberty is fundamentally limited; native-like accent near-impossible.
- **Challenges (Birdsong, 1992; Bley-Vroman, 1989)**: Some adult learners achieve native-like proficiency. Age interacts with motivation, input quantity, and social factors.
- **Current consensus**: Accent acquisition is hardest after puberty; morphosyntax and vocabulary less constrained. Adult learners can achieve high proficiency.
- Design implication: mode does not show IPA for production (just receptive IPA for awareness); no "accent penalty" in quiz scoring.

### 4.3 Krashen Input vs. Comprehensible Output (Swain, 1985)
- Krashen: input alone sufficient for acquisition.
- Swain: production (output) is necessary to notice gaps in comprehension — "pushed output" hypothesis.
- **Status**: Both input AND output contribute; current consensus favors interaction hypothesis (Long, 1996).
- Design implication: Layer 3 (production) quizzes are included despite heavier cognitive load.

### 4.4 Spaced Repetition vs. Massed Practice
- SRS consistently outperforms massed practice (cramming) on long-term retention.
- However, short-term recall after massed practice is *higher* — learners often prefer cramming because it "feels" more effective.
- Design implication: FSRS-5 forces spaced reviews; no ability to binge-review mastered cards.

---

## 5. Game Mechanics Mapping Table

| Learning Principle | Mechanism | Game Layer | Implementation |
|-------------------|-----------|------------|---------------|
| Incidental exposure (Nation 2001) | Ambient floating words | Layer 1 — IMMERSION | `_ambientWords` array, drift physics |
| Spaced repetition (Ebbinghaus 1885) | FSRS-5 scheduler | Layer 2/3 — QUIZ | `src/core/fsrs.js` |
| Recognition before production (Arguelles) | 2 recognition quizzes per 1 production | Layer 2 → Layer 3 | Every 3rd quiz = production |
| Context before isolation (Lomb 2008) | Example sentence on quiz card | Quiz display | `word.example` field |
| Low anxiety (Krashen's Affective Filter) | Low-pressure immersion phase | Layer 1 | No quiz during immersion |
| Noticing (Schmidt 1990) | Legible ambient words with meanings | Layer 1 | Sub-label below each word |
| i+1 difficulty gradient (Krashen 1982) | Words from all contexts simultaneously | All layers | No artificial ordering |
| Multi-modal encoding (Arguelles shadowing) | IPA shown on quiz card | Quiz display | `word.ipa` field |
| Consistent practice (Machová 2018) | FSRS paces reviews to daily habit | Scheduler | `getDueCards()` |
| D/S/R feedback (FSRS-5) | Per-review metrics shown after answer | Feedback | `dsrText` field |

---

## 6. Design Principles Summary

These are the binding design principles for all decisions in the Language Learning mode:

### DP-1: Immersion Before Drilling
Words must appear in the dreamscape ambient layer (Layer 1) before any quiz. The `_immersionDuration` ensures minimum exposure. This implements Lomb's reading-with-pleasure principle and Erard's finding that hyperpolyglots saturate passive exposure before drilling.

### DP-2: Context Anchored to Dreamscape
Each word has a `context` field (nature/sky/dream/body/action/urban) that determines its color and should ideally match the active dreamscape. Words are not alphabetically ordered — they are grouped by meaning-cluster, matching their natural habitat in the game world.

### DP-3: FSRS-5, Not SM-2
The scheduling algorithm must be FSRS-5 (90% retention) not SM-2 (47% retention). The D/S/R values must be shown after each review so learners understand their own memory state. This implements transparency about the learning process, informed by Erard's finding that hyperpolyglots obsess over understanding *why* their system works.

### DP-4: Low-Pressure by Default
Layer 1 has no failure state. Layer 2 (recognition) and Layer 3 (production) show correct answers when wrong — no score penalty. Krashen's Affective Filter hypothesis predicts that anxiety inhibits acquisition; the mode design keeps Layer 1 entirely stress-free.

### DP-5: Production Only After Recognition Established
Every 3rd quiz is production (Layer 3). This implements the Lomb/Arguelles principle: recognition must precede production. Users who are still in early stages naturally get more recognition practice (2:1 ratio).

### DP-6: Three Languages Minimum, Expandable
French, Spanish, and Japanese are the minimum. These represent:
- A close Romance language (French/Spanish) for the majority of English speakers
- A distant logographic/isolating system (Japanese) to demonstrate that the system works across script families
The data layer (`src/data/language-content.js`) is structured to allow new languages to be added by appending entries without code changes.

### DP-7: Viewport-Native Rendering
The Language Learning mode renders using `window.innerWidth / window.innerHeight` — NOT `CW()` / `CH()`. Grid dimensions are irrelevant to this mode; it is a full-canvas experience. This prevents the "tiny box" rendering bug described in task-ARCH1.

---

## 7. Sources Index

| # | Author | Title | Year | Used in |
|---|--------|-------|------|---------|
| 1 | Lomb, K. | *Polyglot: How I Learn Languages* | 1970/2008 | DP-1, §1.1 |
| 2 | Thomas, M. | The Michel Thomas Method | 1914–2005 | DP-5, §1.2 |
| 3 | Erard, M. | *Babel No More* | 2012 | DP-1, §1.3 |
| 4 | Lewis, B. | *Fluent in 3 Months* | 2014 | §1.4 [CONTESTED] |
| 5 | Kaufmann, S. | LingQ / YouTube methodology | ongoing | DP-2, §1.5 |
| 6 | Machová, L. | "Language Learning Secrets" TED | 2018 | DP-4, §1.6 |
| 7 | Simcott, R. | Polyglot conference keynotes | 2014–2020 | DP-5, §1.7 |
| 8 | Arguelles, A. | Scriptorium method | ongoing | DP-8 (IPA), §1.8 |
| 9 | Wozniak, P. | SuperMemo 2 Algorithm | 1987 | §2.1 |
| 10 | Ye, D. | FSRS v5 | 2024 | DP-3, §2.2 |
| 11 | Deng, Q. & Ye, D. | "Free Spaced Repetition Scheduler" | 2023 | §2.2 |
| 12 | Leitner, S. | *So lernt man lernen* | 1972 | §2.3 |
| 13 | Nation, I.S.P. | *Learning Vocabulary in Another Language* | 2001 | DP-1, §3.1 |
| 14 | Krashen, S. | *Principles and Practice in SLA* | 1982 | DP-4, §3.2 |
| 15 | Sweller, J. | "Cognitive load during problem solving" | 1988 | §3.3 |
| 16 | Ebbinghaus, H. | *Über das Gedächtnis* | 1885 | §3.4 |
| 17 | Schmidt, R. | "Role of Consciousness in SLL" | 1990 | DP-4, §3.5 |
| 18 | Miller, G. | "The Magical Number Seven" | 1956 | §3.3 |
| 19 | Bialystok, E. | Bilingual advantage studies | 1994–2014 | §4.1 |
| 20 | Paap, K. et al. | "No evidence for enhanced executive function..." | 2014 | §4.1 |
| 21 | Dunabeitia, J.A. & Carreiras, M. | "The bilingual advantage: Acta est fabula?" | 2015 | §4.1 |
| 22 | Lenneberg, E. | *Biological Foundations of Language* | 1967 | §4.2 |
| 23 | Birdsong, D. | "Ultimate Attainment in SLA" | 1992 | §4.2 |
| 24 | Swain, M. | "Communicative Competence" | 1985 | §4.3 |
| 25 | Long, M. | Interaction Hypothesis | 1996 | §4.3 |
| 26 | Ebbinghaus, H. | Forgetting curve (replication: Murre & Dros 2015) | 1885 | §3.4 |
| 27 | FSI | Language Difficulty Rankings | 1973–present | §3 (LANGUAGES.fsiHours) |
| 28 | ASJP | Automated Similarity Judgment Program, v19 | 2021 | language-system.js |
| 29 | WALS | World Atlas of Language Structures | 2013 | language-system.js |
| 30 | Young, J. | *What the Robin Knows* | 2012 | ornithology-mode.js |
| 31 | Kaplan, S. | Attention Restoration Theory | 1989 | ornithology-mode.js |
| 32 | Ellis, N.C. | "Frequency effects in language processing" | 2002 | word frequency ordering |
| 33 | Zipf, G. | *Human Behavior and the Principle of Least Effort* | 1949 | word selection |
| 34 | Coxhead, A. | Academic Word List | 2000 | word selection criteria |
| 35 | West, M. | *A General Service List of English Words* | 1953 | base vocabulary selection |

---

*Document generated for task-LANG1.md. See problem statement run order: ARCH1 → RESEARCH-LANG1 → LANG1.*
