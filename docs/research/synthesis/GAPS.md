# Research Gaps

> Documents missing research that needs to be found, created, or refined before mechanics can be confidently implemented.  
> Last updated: 2026-02-23

---

## Critical Gaps (must fill before next sprint)

### 1. Somatic / Fascia Research
**Status**: ✅ FILLED — `docs/research/neuroscience/somatic-fascia.md`  
**Why needed**: Meditation mode breath prompts and body scan tiles need grounding in somatic science  
**For mechanic**: Breath prompts, body scan tiles, somatic grounding sequence, embodiment score  
**Key sources found**: Schleip (2012); van der Kolk (2014); Porges (2011) Polyvagal Theory  
**Key insight**: Fascia has 10× more sensory receptors than muscle; breath is the bridge to autonomic regulation; 4-7-8 breathing is evidence-based for vagal toning

### 2. Addiction Neuroscience (specific circuits)
**Status**: ✅ FILLED — `docs/research/neuroscience/addiction-circuits.md`  
**Why needed**: Pattern training mode is the core recovery tool  
**For mechanic**: DESPAIR/RAGE tile damage, health drain, PEACE tile reward timing, impulse buffer  
**Key sources found**: Koob & Volkow (2010); Robinson & Berridge (1993); NIDA (2020)  
**Key insight**: Craving cycle timing (cue → dopamine spike in 100-300ms → peak impulse at 5-30 seconds → fade at 3-10 minutes); impulse buffer mechanic models PFC intervention window

### 3. Mycelium Network Biology
**Status**: ✅ FILLED — `docs/research/biology/mycelium-networks.md`  
**Why needed**: Mycology mode needs to model real fungal network behavior  
**For mechanic**: Mushroom spawn algorithm, mother mushroom, network visualization, stress signals  
**Key sources found**: Simard (1997); Beiler et al. (2010); Sheldrake (2020)  
**Key insight**: Mycorrhizal networks use preferential attachment (not random spawning); hub ("mother") mushrooms route disproportionate resources; stress signals propagate bidirectionally with exponential distance decay

### 4. Bioelectric Fields
**Status**: ✅ FILLED — `docs/research/neuroscience/bioelectric-fields.md`  
**Why needed**: Constellation mode pattern recognition should model bioelectric signaling dynamics  
**For mechanic**: Constellation connection algorithm, phase transition activation, pattern memory  
**Key sources found**: Levin (2021); Becker (1985); McCaig et al. (2005)  
**Key insight**: Bioelectric gradients spread via reaction-diffusion dynamics; phase transitions produce sudden global pattern from accumulated local signals; pattern memory is encoded as lowered activation threshold

### 5. Chronobiology / Planetary Rhythms
**Status**: ✅ FILLED — `docs/research/biology/chronobiology.md`  
**Why needed**: Temporal system (Sun–Saturn weekday mapping) needs accuracy  
**For mechanic**: Daily challenge unlocks by planetary ruler, ultradian session design, circadian timing modifier  
**Key sources found**: Refinetti (2006); Roenneberg & Merrow (2016); Kleitman (1963)  
**Key insight**: 90-minute ultradian cycles set optimal session length; planetary day rulers have documented cultural continuity since ~300 BCE; circadian peak varies by chronotype and should adjust challenge timing

### 6. Ornithology Accuracy
**Status**: ✅ FILLED — `docs/research/biology/ornithology-basics.md`  
**Why needed**: Bird species, habitats, and behaviors must be scientifically accurate  
**For mechanic**: Species identification hierarchy, habitat filtering, rarity scoring, vocalization clues  
**Key sources found**: Sibley (2000); Cornell Lab eBird database; Gill (2007)  
**Key insight**: Identification hierarchy (size/shape → behavior → habitat → vocalization → plumage); habitat filtering more reliable than color alone; rarity ratings from eBird frequency data; written onomatopoeia is standard field-learning tool

---

## Medium Priority Gaps

### 7. Interpersonal Neurobiology (Siegel) — PARTIAL
**Status**: 📋 Stub needed  
**Why needed**: RPG mode relational choices should model interpersonal neurobiology  
**For mechanic**: Relational choice outcomes in RPG mode, co-op mode social dynamics  
**Find**: Siegel, D.J. (2012). *The Developing Mind* (2nd ed.). Guilford. — Chapter 7 (resonance circuits, mirror neurons)  
**Key insight needed**: What are the neural mechanisms of interpersonal attunement? How do early relational patterns shape adult behavior?  
**Priority**: Medium — needed before RPG mode relational content expansion

### 8. Jungian Individuation (detailed) — PARTIAL
**Status**: 📋 Stub needed  
**Why needed**: Alchemy mode transmutation mechanics need deeper Jungian grounding  
**For mechanic**: Element transmutation sequences, shadow integration mechanic, archetype arc  
**Find**: Jung, C.G. (1944). *Psychology and Alchemy* (CW Vol. 12). Princeton. — The Stages of the Opus  
**Key insight needed**: What are the specific stages of Jungian individuation? How does the alchemical Opus (nigredo → albedo → citrinitas → rubedo) map to psychological transformation?  
**Priority**: Medium — needed before Alchemy mode content expansion

### 9. Stoic Philosophy (practical application) — FILLED (basic)
**Status**: ✅ Basic filled in `docs/research/philosophy/stoicism.md`; expansion needed  
**Why needed**: Stoic cosmology flavor and mechanics  
**Find**: Aurelius, M. *Meditations* Books IV–VIII for practical exercises; Irvine, W. (2008). *A Guide to the Good Life* for modern application  
**Key insight needed**: Which Stoic exercises are best adapted to game mechanics? (negative visualization, evening review, dichotomy of control practice)  
**Priority**: Low — covered adequately at present

### 10. Flow State Triggers (specific conditions) — PARTIAL
**Status**: 📋 Needs expansion in `docs/research/psychology/flow-theory.md`  
**Why needed**: Dynamic difficulty system should reliably induce flow state  
**Find**: Nakamura, J. & Csikszentmihalyi, M. (2002). "The concept of flow." In C.R. Snyder (Ed.), *Handbook of Positive Psychology*. pp. 89-105.  
**Key insight needed**: What are the precise conditions that trigger vs. break flow? (distraction threshold, feedback latency limits, goal clarity requirements)  
**Priority**: Medium — important for DDA calibration

---

## Lower Priority Gaps (future sprints)

### 11. Mirror Neurons & Empathy Training
**Why needed**: Empathy training module (`src/intelligence/empathy-training.js`)  
**Find**: Rizzolatti, G. & Craighero, L. (2004). "The mirror-neuron system." *Annual Review of Neuroscience*, 27, 169-192.  
**Priority**: Low

### 12. Sacred Geometry (detailed) — PARTIAL
**Why needed**: PEACE node Fibonacci/golden ratio patterns need rigorous grounding  
**Find**: Livio, M. (2002). *The Golden Ratio: The Story of Phi*. Broadway Books.  
**Priority**: Low (existing `RESEARCH.md` covers adequately)

### 13. Jungian Shadow Work (operational)
**Why needed**: Shadow tiles and integration mechanic need specific shadow work protocols  
**Find**: Zweig, C. & Abrams, J. (1991). *Meeting the Shadow: The Hidden Power of the Dark Side of Human Nature*. Tarcher.  
**Priority**: Medium

### 14. Polyphonic Entrainment (advanced rhythm science)
**Why needed**: Rhythm mode multi-layer beat mechanics  
**Find**: Clayton, M. et al. (2005). "In time with the music: The concept of entrainment and its significance for ethnomusicology." *European Meetings in Ethnomusicology*, 11, 3-142.  
**Priority**: Low (covered adequately in RESEARCH.md Section 11)

### 15. Adverse Childhood Experiences (ACE) & Addiction
**Why needed**: Many players in recovery have trauma histories — game should be trauma-informed  
**Find**: Felitti, V.J. et al. (1998). "Relationship of childhood abuse and household dysfunction to many of the leading causes of death in adults." *American Journal of Preventive Medicine*, 14(4), 245-258.  
**Priority**: High — important for safe design; add crisis protocol documentation

---

## Gap-Filling Progress Summary
- **Critical gaps (6)**: 6/6 filled ✅
- **Medium priority (5)**: 1/5 filled; 4 partial
- **Lower priority (5)**: 0/5 filled (acceptable for current sprint)
- **Total gaps documented**: 15

---

## Cross-References
- `docs/research/MECHANIC_MAP.md` — mechanics awaiting research grounding
- `docs/research/INDEX.md` — full file index
