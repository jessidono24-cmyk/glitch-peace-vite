# Task RESEARCH2 — Fill All Research Folders: 10-30 Sources Per Field

## Goal
Every research subdirectory in `docs/research/` must contain at least
10 empirically sourced references relevant to that field AND to the game.
Each source must explain how it applies to a specific game mechanic.

## Definition of Done
- [ ] `docs/research/psychology/` — 10+ sources
- [ ] `docs/research/neuroscience/` — 10+ sources
- [ ] `docs/research/biology/mycology/` — 10+ sources
- [ ] `docs/research/biology/ornithology/` — 10+ sources
- [ ] `docs/research/biology/chronobiology/` — 10+ sources
- [ ] `docs/research/physics/` — 10+ sources
- [ ] `docs/research/chemistry/` — 10+ sources
- [ ] `docs/research/architecture/` — 10+ sources
- [ ] `docs/research/engineering/` — 10+ sources
- [ ] `docs/research/language-learning/` — 10+ sources
- [ ] `docs/research/meteorology/` — 10+ sources
- [ ] `docs/research/archaeology/` — 10+ sources
- [ ] `docs/research/sociology/` — 10+ sources
- [ ] `docs/research/philosophy/` — 10+ sources
- [ ] `docs/research/cosmologies/` — 10+ sources (one per tradition at minimum)
- [ ] `docs/research/game-development/` — 10+ sources
- [ ] `docs/research/synthesis/MECHANIC_MAP.md` — every game mechanic mapped

## Gap Definition
A gap exists when:
1. A field has fewer than 10 sources
2. A game mechanic exists with no research citation in MECHANIC_MAP.md
3. A source is listed but has no "Game Application" section explaining
   how it connects to a specific mechanic

## Research Standard
Every entry must follow this format:
```markdown
### [Author Last Name, Year] — [Short Title]
**Full citation:** Author, A. (Year). Title. Journal/Publisher.
**Key finding:** One sentence summary of the most relevant finding.
**Game mechanic:** Which specific mechanic this informs.
**Application:** How this finding justifies or shapes that mechanic.
```

---

## For each folder, create a file named `sources.md`

### Example: `docs/research/biology/mycology/sources.md`

```markdown
# Mycology Research Sources

## Sources (minimum 10)

### [Simard, 1997] — Net Carbon Transfer Between Trees
**Full citation:** Simard, S.W., et al. (1997). Net transfer of carbon between 
ectomycorrhizal tree species in the field. Nature, 388, 579–582.
**Key finding:** Trees share carbon through underground fungal networks in 
non-random, hub-based patterns.
**Game mechanic:** Mycology mode — mushroom spawn algorithm.
**Application:** Mushrooms must spawn near existing network nodes, not randomly.
Large "mother" mushrooms are hubs that unlock others nearby.

### [Stamets, 2005] — Mycelium Running
**Full citation:** Stamets, P. (2005). Mycelium Running. Ten Speed Press.
**Key finding:** Mycelial networks exhibit intelligent routing behavior,
finding shortest paths through maze-like obstacles.
**Game mechanic:** Mycology mode — network path visualization.
**Application:** Visible mycelium threads between mushrooms should follow 
shortest-path logic, not straight lines.

### [Boddy, 2009] — Mycelial Networks: Nutrient Trading
**Full citation:** Boddy, L., Hynes, J., Bebber, D.P., Fricker, M.D. (2009).
Saprotrophic cord systems: Dispersal mechanisms in space and time.
Mycoscience, 50(1), 9–19.
**Key finding:** Mycelial networks optimize for both resilience and efficiency.
**Game mechanic:** Mycology mode — network grows stronger with player activity.
**Application:** The more mushrooms player forages, the more network becomes 
visible and navigable.

### [Wohlleben, 2016] — The Hidden Life of Trees
**Full citation:** Wohlleben, P. (2016). The Hidden Life of Trees. 
Greystone Books.
**Key finding:** Trees communicate distress signals through mycelial networks.
**Game mechanic:** Mycology mode — toxic mushroom warning system.
**Application:** When player encounters a toxic mushroom, visual pulse propagates
outward through the visible network threads to warn of nearby dangers.

### [Sheldrake, 2020] — Entangled Life
**Full citation:** Sheldrake, M. (2020). Entangled Life. Random House.
**Key finding:** Fungi exist on a spectrum from mutualistic to parasitic;
the same species can be helpful or harmful depending on context.
**Game mechanic:** Mycology mode — species context matters.
**Application:** The same mushroom species might be safe in one dreamscape
and toxic in another (context-dependent identification).

### [Kiers, 2011] — Reciprocal Rewards Stabilize Cooperation
**Full citation:** Kiers, E.T., et al. (2011). Reciprocal rewards stabilize 
cooperation in the mycorrhizal symbiosis. Science, 333(6044), 880–882.
**Key finding:** Mycorrhizal networks preferentially reward fungi that deliver
more nutrients — a market-like fairness system.
**Game mechanic:** Mycology mode — player receives more network visibility
the more carefully they forage (reciprocity mechanic).
**Application:** Careful, correct identification = expanded network vision.
Greedy/wrong collection = network dims.

### [Heaton, 2012] — Carbon Transfer Through Ectomycorrhizal Networks
**Full citation:** Heaton, L., et al. (2012). Analysis of fungal networks.
Journal of the Royal Society Interface, 9(70), 894–902.
**Key finding:** Fungal networks show scale-free topology similar to internet
routing — highly connected hubs with many peripheral nodes.
**Game mechanic:** Mycology mode — network topology design.
**Application:** A few "mother" mushroom nodes have many connections;
most mushrooms have 2-3 connections. Hub mushrooms give bigger score bonuses.

### [Fricker, 2017] — Adaptive Foraging in Mycelial Networks
**Full citation:** Fricker, M., et al. (2017). The mathematical basis of 
mycelial growth. Advances in Botanical Research, 83, 1–30.
**Key finding:** Mycelial growth follows mathematical optimization principles
similar to slime molds solving shortest-path problems.
**Game mechanic:** Mycology mode — difficulty scaling.
**Application:** In higher difficulty dreamscapes, the mushroom network
becomes more complex and requires understanding of branching patterns.

### [Dighton, 2016] — Fungi in Ecosystem Services
**Full citation:** Dighton, J. (2016). Fungi in Ecosystem Services. 
CRC Press.
**Key finding:** Fungi are keystone species — removing them collapses ecosystems.
**Game mechanic:** Mycology mode — consequence system.
**Application:** Overharvesting (foraging too fast) destabilizes the network —
mushrooms stop spawning, network disappears. Rest = recovery.

### [Merlin-Sheldrake, 2020] — Underground Intelligence
**Full citation:** Sheldrake, M. & Fricker, M. (2020). Wood wide web: 
underground forest communication. Nature Plants, 6, 106–107.
**Key finding:** Network intelligence is distributed — no central control point.
**Game mechanic:** Mycology mode — awe/wonder effect trigger.
**Application:** When player discovers a major hub mushroom, trigger the 
"profound_awe" effect — text reads: "This organism has been growing for 
centuries. Its network spans the entire dreamscape. You are a guest."
```

---

## Template: Create similar files for all other folders

The agent should create `sources.md` in every subdirectory following
the same format. Use web search to find real empirical sources for each field.

### Required fields and minimum source counts:

| Folder | Min Sources | Key Topics |
|--------|-------------|------------|
| psychology | 10 | flow, implicit learning, habit, emotion regulation, SDT |
| neuroscience | 10 | dopamine, neuroplasticity, addiction circuits, embodiment |
| biology/mycology | 10 | (see above) |
| biology/ornithology | 10 | species behavior, habitat, attention, awe research |
| biology/chronobiology | 10 | circadian rhythms, ultradian, planetary hour effects |
| physics | 10 | thermodynamics, quantum, electrostatics, wave mechanics |
| chemistry | 10 | alchemy history, real chemistry, transmutation metaphor |
| architecture | 10 | sacred geometry, structural principles, cognitive architecture |
| engineering | 10 | systems thinking, optimization, cognitive engineering |
| language-learning | 10 | acquisition theory, spaced repetition, immersion methods |
| meteorology | 10 | atmospheric science, weather perception, climate psychology |
| archaeology | 10 | excavation methods, artifact dating, ancient knowledge systems |
| sociology | 10 | social learning, community, addiction sociology |
| philosophy | 10 | consciousness, ethics, existentialism, epistemology |
| cosmologies | 13+ | one entry per cosmology (Hindu, Buddhist, Norse, Hermetic...) |
| game-development | 10 | player psychology, UX, difficulty curves, reward systems |

### For cosmologies — sacred texts (copyright-free)
The following are in public domain and can be linked/referenced freely:
- I Ching (Wilhelm translation, 1950) — public domain
- Tao Te Ching (various translations) — original text ancient, translations vary
- Stoic texts: Meditations (Aurelius), Discourses (Epictetus) — public domain
- Norse Eddas (Prose Edda, Poetic Edda) — public domain
- Hermetic texts: Corpus Hermeticum — public domain
- Buddhist Pali Canon — public domain
- Hindu Vedas, Upanishads, Bhagavad Gita — original text ancient, some translations public domain
- Mayan Popol Vuh — original text ancient
- Egyptian Book of the Dead — public domain translations available
- Confucian Analects — public domain
- Celtic: Mabinogion — public domain

Link to Project Gutenberg, Sacred Texts (sacred-texts.com), or 
Internet Archive for free legal access to each.

---

## Mechanic Map Update

After creating all sources, update `docs/research/synthesis/MECHANIC_MAP.md`
to include a citation column for every mechanic:

```markdown
| Mechanic | Research Basis | Citation | Confidence |
|----------|----------------|----------|------------|
| Mycelium network spawn | Hub-based preferential attachment | Simard (1997) | High |
| Awe effect on bird encounter | Awe and elevation research | Keltner & Haidt (2003) | High |
| Rhythm entrainment | Musical entrainment theory | Clayton et al. (2005) | High |
| Constellation pattern | Gestalt figure-ground | Wertheimer (1923) | High |
| FPS embodiment | Embodied cognition | Varela et al. (1991) | Medium |
| Alchemy transmutation | Jungian individuation | Jung (1944) | Medium |
...
```

## Commit message
```
docs: RESEARCH2 all folders filled -- 10+ sources per field, mechanic map complete
```
