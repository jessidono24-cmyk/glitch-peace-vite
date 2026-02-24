# Task RESEARCH-LANG1 — Language Learning Mode: Research Foundation (30–50 Sources)

**Can run in parallel with ARCH1. Must complete before LANG1.**

---

## Purpose

The Language Learning mode requires an empirical foundation grounded in the best
available evidence — with heavy emphasis on research by and for polyglots and
polymaths, whose acquisition patterns differ significantly from typical L2 learners.

This task produces `docs/research/language-learning/RESEARCH.md` — the reference
file the agent uses when building the actual Language Learning mode in LANG1.

---

## Output File

**`docs/research/language-learning/RESEARCH.md`**

Create the directory if it doesn't exist:
```bash
mkdir -p docs/research/language-learning
```

Format for each source:
```
### [Author, Year] — Short Title
**Full citation:** Author(s). (Year). Title. Journal/Publisher.
**Key finding:** One sentence, in your own words. No direct quotes.
**Relevance tier:** CRITICAL | HIGH | MODERATE
**Game mechanic:** Which specific game system this research justifies
**Application:** 1–2 sentences on how the finding shapes that mechanic
```

---

## Required Coverage Areas

All sections below are mandatory. Polyglot/polymath sources are prioritized.

---

### SECTION A — How Polyglots Actually Learn

These 8 sources are NON-NEGOTIABLE. Every one must appear.

**1. Erard, M. (2012). Babel No More. Free Press.**
Most hyperpolyglots share early musical training, strong phonological memory,
and treat language learning as daily maintenance rather than course-completion.
Mechanic: Daily session streak system; Rhythm mode integration.

**2. Bialystok, E., Craik, F.I.M., & Freedman, M. (2007). Bilingualism as a
protection against the onset of symptoms of dementia. Neuropsychologia, 45(2).**
Include alongside: **Paap, K.R., et al. (2015). The bilingual advantage debate:
количество publications with null results. Cortex, 73.**
The bilingual advantage is real in some populations and absent in others.
Both the claim AND the replication failures must be represented honestly.
Mechanic: Matrix A/B toggle as attentional switching — justified as a mechanic
that trains inhibitory control, not as a guaranteed brain benefit.

**3. Lomb, K. (2008). How I Learn Languages. TESL-EJ Publications.**
Reading for pleasure early; vocabulary always in context; target language as
tool from day one, not object of study.
Mechanic: In-game vocabulary always appears in a full sentence, never isolated.

**4. Machová, L. [TED Talk + coaching material, 2018–present].**
No single best method — the best method is one you enjoy enough to sustain
for 500+ hours. Method diversity is a feature, not a problem.
Mechanic: Player selects learning style (immersion-first / structured / output-first).

**5. Lampariello, L. [Practitioner writing, 2010–present]. Bidirectional translation.**
Translating native → target, then back without looking is output-forced retrieval —
maps directly to the testing effect (Roediger & Karpicke).
Mechanic: Bidirectional recall challenge in Layer 3 production mode.

**6. Simcott, R. [Practitioner documentation, multiple languages].**
Phonological accuracy early and grouping closely related language families
together (Romance, Slavic, Germanic) accelerates acquisition by leveraging
cross-language transfer.
Mechanic: Language family grouping in the language selector.

**7. Kaufmann, S. [LingQ methodology, 2007–present].**
Content-driven extensive reading/listening immersion — maps directly to
Nation's comprehensible input research. Method: massive exposure to meaning
before formal grammar study.
Mechanic: Dreamscape narration layer in target language as passive immersion.

**8. Arguelles, A. [Shadowing methodology documentation].**
Outread shadowing (simultaneous audio + text, spoken aloud) builds phonological
circuit faster than listening alone. Distinct from passive listening.
Mechanic: Audio + text simultaneous display on interlude screens.

Also include:
- Research on metalinguistic awareness in experienced multilinguals (Bialystok)
- Transfer effects: how L3+ acquisition accelerates when related to L2
- Why most SLA research uses beginner monolinguals and why this matters for
  interpreting "what works"

---

### SECTION B — Spaced Repetition and Memory Architecture

**Why FSRS, not SM2:**
Include a brief note explaining: SM2 (1989) achieves ~47% benchmark success rate.
FSRS (Ye, 2023, ACM KDD) achieves ~90% with 20-30% fewer reviews. SM2 is obsolete.

Required sources:
- Ebbinghaus, H. (1885/1913). Memory: A contribution to experimental psychology.
- Wozniak, P.A., & Gorzelanczyk, E.J. (1994). Optimization of repetition spacing
  in the practice of learning. Acta Neurobiologiae Experimentalis, 54(1).
- Cepeda, N.J., et al. (2006). Distributed practice in verbal recall tasks.
  Psychological Bulletin, 132(3).
- Cepeda, N.J., et al. (2008). Spacing effects in learning. Psychological Science, 19(11).
- Roediger, H.L., & Karpicke, J.D. (2006). Test-enhanced learning.
  Psychological Science, 17(3).
- Kornell, N., & Bjork, R.A. (2008). Learning concepts and categories.
  Psychological Science, 19(6).
- Dunlosky, J., et al. (2013). Improving students' learning with effective
  learning techniques. Psychological Science in the Public Interest, 14(1).
- Ye, J. (2023). A stochastic shortest path algorithm for optimizing spaced
  repetition scheduling. ACM KDD 2023.

---

### SECTION C — Comprehensible Input and Immersion

- Krashen, S.D. (1982). Principles and practice in second language acquisition.
- Krashen, S.D. (1985). The input hypothesis: Issues and implications.
- VanPatten, B. (1996). Input processing and grammar instruction.
- Nation, I.S.P. (2001). Learning vocabulary in another language. Cambridge UP.
- Laufer, B., & Nation, P. (1999). A vocabulary-size test of controlled productive
  ability. Language Testing, 16(1).
- Hu, M., & Nation, I.S.P. (2000). Vocabulary density and reading comprehension.
  Reading in a Foreign Language, 23(1).
- Webb, S. (2007). The effects of repetition on vocabulary knowledge.
  Applied Linguistics, 28(1).

---

### SECTION D — Neuroscience of Language Acquisition

- Kuhl, P.K. (2010). Brain mechanisms in early language acquisition. Neuron, 67(5).
- Mechelli, A., et al. (2004). Neurolinguistics: Structural plasticity in the
  bilingual brain. Nature, 431(7010).
- Abutalebi, J., & Green, D. (2007). Bilingual language production: The
  neurocognition of language representation and control. Journal of Neurolinguistics.
- Patel, A.D. (2008). Music, Language, and the Brain. Oxford UP.
  (Musical rhythm training accelerates phonological acquisition — directly supports
  Rhythm mode integration with language learning.)

---

### SECTION E — Output, Production, and Speaking Early

- Swain, M. (1985). Communicative competence: Some roles of comprehensible input
  and comprehensible output in its development. In Gass & Madden (Eds.).
- Swain, M. (1995). Three functions of output in second language learning.
  In Cook & Seidlhofer (Eds.).
- Schmidt, R. (1990). The role of consciousness in second language learning.
  Applied Linguistics, 11(2).
  (Noticing Hypothesis: conscious attention to form is required for acquisition —
  justifies making vocabulary salient rather than purely ambient.)
- Mackey, A. (1999). Input, interaction, and second language development.
  Studies in Second Language Acquisition, 21(4).

---

### SECTION F — Motivation and Long-Term Retention

- Dörnyei, Z. (2009). The L2 motivational self system. In Dörnyei & Ushioda (Eds.).
- Csikszentmihalyi, M. (1990). Flow: The psychology of optimal experience. Harper.
- Ryan, R.M., & Deci, E.L. (2000). Self-determination theory and the facilitation
  of intrinsic motivation. American Psychologist, 55(1).
- Gardner, R.C., & Lambert, W.E. (1972). Attitudes and motivation in second-language
  learning. Newbury House.

---

### SECTION G — Accelerated and Polymath Learning

- Ericsson, K.A., Krampe, R.T., & Tesch-Römer, C. (1993). The role of deliberate
  practice in the acquisition of expert performance. Psychological Review, 100(3).
  (Deliberate practice ≠ repetition — deliberate practice requires immediate feedback
  on errors. Maps to FSRS feedback loop showing D/S/R values after each review.)
- Ferriss, T. (2012). The 4-Hour Chef. Houghton Mifflin Harcourt.
  (Practitioner, not peer-reviewed. DiSSS: Deconstruction, Selection, Sequencing,
  Stakes. Pareto analysis of vocabulary: top 1,000 words = ~85% of spoken language.
  Justifies frequency-ordered vocabulary introduction.)
- Doidge, N. (2007). The Brain That Changes Itself. Viking.
  (Neuroplasticity in adult learners — justifies adult acquisition framing.)

---

### SECTION H — Specific Mechanics Research Support

**Shadowing:**
- Hamada, Y. (2016). Shadowing: Who benefits and how? RELC Journal, 47(1).
- Hamada, Y. (2019). Shadowing for listening comprehension. Language Teaching Research.

**Gamification:**
- Deterding, S., et al. (2011). From game design elements to gamefulness.
  Proceedings of the 15th International Academic MindTrek Conference.
- Hung, H.T., et al. (2018). Gamification in language learning. Applied Linguistics Review.
- Cornillie, F., et al. (2012). Digital games for language learning. ReCALL, 24(3).

**Sleep and Memory:**
- Stickgold, R. (2005). Sleep-dependent memory consolidation. Nature, 437(7063).
- Walker, M. (2017). Why We Sleep. Scribner.
  (Practitioner-facing. Sleep consolidates declarative memory — justifies presenting
  only a limited set of new words per session, to be reviewed after sleep.)

---

### SECTION I — Contested Findings (Honest Section)

This section is REQUIRED. Include a brief summary of what the research disputes:

1. **The bilingual advantage controversy** — Bialystok's executive function advantage
   has not replicated consistently across labs (Paap et al., 2015; de Bruin et al., 2015).
   Game design implication: do not advertise the mode as "making you smarter" —
   the mechanism is uncertain.

2. **Krashen's Input Hypothesis** — Widely influential but unfalsifiable as stated.
   Output researchers (Swain) and interaction researchers (Long, Mackey) have
   shown that production and feedback are also necessary for acquisition,
   not just input. Game implication: include all three layers (input, recognition,
   production) rather than input-only immersion.

3. **Spaced repetition for vocabulary** — SR works well for form-meaning pairs
   but less clearly for productive use and grammar. FSRS optimizes recall, not
   production fluency. Acknowledge this limit in the design principles.

4. **Gamification effects** — Deterding et al. (2011) and subsequent meta-analyses
   show mixed results; extrinsic rewards can undermine intrinsic motivation
   (Deci et al., 1999). Implication: points/streaks should feel like progress
   tracking, not manipulation.

---

## Game Mechanics Mapping Table

At the end of RESEARCH.md, include this table (agent populates citations column):

| Game System | Primary Research Basis | Confidence |
|-------------|----------------------|------------|
| FSRS scheduler (D/S/R model) | Ye (2023); Cepeda et al. (2006, 2008) | HIGH |
| In-context vocabulary (sentences not lists) | Nation (2001); Laufer & Nation (1999); Lomb (2008) | HIGH |
| Retrieval over re-study | Roediger & Karpicke (2006) | HIGH |
| Three-layer model (immersion → recognition → production) | Krashen (1982); Swain (1985, 1995); Schmidt (1990) | HIGH |
| i+1 difficulty scaling | Krashen (1982) | MODERATE — contested |
| Bidirectional translation (Layer 3) | Lampariello (practitioner); Swain (1985) | MODERATE |
| Language family grouping | Simcott (practitioner); transfer research | MODERATE |
| Daily session design | Dörnyei (2009); Csikszentmihalyi (1990) | HIGH |
| Limited new words per session (sleep gate) | Stickgold (2005); Walker (2017) | MODERATE |
| Musical rhythm + language integration | Patel (2008) | HIGH |
| Polyglot method selector | Machová; Erard (2012) | LOW — practitioner |
| Ambient immersion layer | Krashen (1982); Kaufmann method | MODERATE |

Confidence: HIGH = multiple independent replications | MODERATE = some support, contested | LOW = practitioner consensus

---

## Design Principles Section

After the mechanics table, write a section titled **"Design Principles"**
(200–400 words) summarizing the 5 most important evidence-based decisions
for the Language Learning mode. This section becomes the reference for
the agent building LANG1.

---

## Verification

```bash
mkdir -p docs/research/language-learning
# After writing:
wc -l docs/research/language-learning/RESEARCH.md       # should be 400+ lines
grep -c "^\###" docs/research/language-learning/RESEARCH.md  # count sources, should be 30+
```

## Commit Message
```
docs: RESEARCH-LANG1 — 30-50 sources language learning mode, polyglot/polymath focus
```

---
**NEXT TASK: LANG1** (requires both ARCH1 and RESEARCH-LANG1 complete)
