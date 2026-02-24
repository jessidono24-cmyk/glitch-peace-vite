# Task RESEARCH1 — Consolidate All Research + Fill Gaps

## Goal
Find every research-related document scattered across the repo,
consolidate into `docs/research/`, document what's there, identify
what's missing, and fetch what's needed from the web to fill gaps.

## Definition of Done
- [ ] `docs/research/` folder exists with organized subdirectories
- [ ] All existing research docs moved/copied there
- [ ] `docs/research/INDEX.md` lists every file and what it covers
- [ ] `docs/research/GAPS.md` lists missing research with specific papers to find
- [ ] Each gap has: topic, why it matters to the game, suggested source
- [ ] At least 5 research gaps filled with new content
- [ ] Every game mechanic in the codebase has a corresponding research note
  
## Scope
- Read entire `docs/` directory
- Read `src/` for mechanic names (what systems exist)
- Create `docs/research/` structure
- No changes to `src/` in this task

---

## Step 1 — Find all existing research

```bash
find . -name "*.md" | xargs grep -l "research\|theory\|neuroscience\|psychology\|study\|findings\|Csikszentmihalyi\|dopamine\|cortisol\|implicit\|explicit\|cognitive\|behavioral" 2>/dev/null | grep -v node_modules | grep -v .git
```

Also check:
```bash
ls docs/
find docs/ -type f
```

---

## Step 2 — Create folder structure

```
docs/research/
├── INDEX.md                    ← master list of all files
├── GAPS.md                     ← what's missing and where to find it
├── MECHANIC_MAP.md             ← maps each game mechanic to its research basis
│
├── psychology/
│   ├── implicit-learning.md
│   ├── flow-theory.md
│   ├── self-determination.md
│   ├── skill-acquisition.md
│   ├── emotional-regulation.md
│   ├── habit-formation.md
│   └── relapse-prevention.md
│
├── neuroscience/
│   ├── dopamine-reward.md
│   ├── neuroplasticity.md
│   ├── addiction-circuits.md
│   ├── embodied-cognition.md
│   ├── somatic-fascia.md       ← NEW: needed for meditation/movement modes
│   └── bioelectric-fields.md   ← NEW: needed for constellation mode
│
├── biology/
│   ├── mycelium-networks.md    ← needed for mycology mode
│   ├── extremophiles.md        ← needed for difficulty adaptation
│   ├── chronobiology.md        ← needed for temporal/planetary system
│   └── ornithology-basics.md   ← needed for ornithology mode accuracy
│
├── philosophy/
│   ├── hermetic-principles.md
│   ├── norse-cosmology.md
│   ├── hindu-chakras.md
│   ├── buddhist-dharma.md
│   ├── stoicism.md
│   ├── taoism.md
│   └── gnostic-tradition.md
│
└── synthesis/
    ├── consciousness-emergence.md
    ├── addiction-recovery-model.md
    └── game-design-integration.md
```

---

## Step 3 — Move existing docs

Copy (don't delete) existing research files into the new structure:
```bash
cp docs/PSYCHOLOGY_FOUNDATIONS.md docs/research/psychology/foundations.md
cp docs/COGNITIVE_ARCHITECTURE.md docs/research/psychology/cognitive-architecture.md
cp docs/EMBODIMENT.md docs/research/neuroscience/embodied-cognition.md
cp docs/EFFORTLESS_LEARNING.md docs/research/psychology/effortless-learning.md
# etc. — copy all relevant docs
```

---

## Step 4 — Write MECHANIC_MAP.md

This is the most important file. It maps every game mechanic to research:

```markdown
# Mechanic → Research Map

| Game Mechanic | Research Basis | Source | Confidence |
|---------------|----------------|--------|------------|
| PEACE tile collection | Positive reinforcement / operant conditioning | Skinner (1938) | High |
| Matrix A/B toggle | Dual-process theory | Kahneman (2011) | High |
| Emergence levels | Skill acquisition stages | Fitts & Posner (1967) | High |
| Emotional field (colors) | Plutchik's wheel of emotions | Plutchik (1980) | High |
| Health bar drain | Stress accumulation model | Sapolsky (2004) | Medium |
| Temporal system (lunar/planetary) | Chronobiology circadian rhythms | Refinetti (2006) | Medium |
| Mycelium connections (mycology) | Mycorrhizal network research | Simard (1997) | High |
| Bird identification (ornithology) | Attention training / mindfulness | Kabat-Zinn (1994) | Medium |
| Alchemy transmutation | Jungian individuation | Jung (1944) | Medium |
| Constellation pattern | Gestalt pattern recognition | Wertheimer (1923) | High |
| Rhythm synchronization | Entrainment theory | Clayton (2005) | Medium |
| Grid navigation | Spatial cognition / cognitive mapping | O'Keefe & Nadel (1978) | High |
| Twin-stick confrontation | Exposure therapy principles | Foa & Kozak (1986) | Medium |
| RPG identity choice | Narrative identity theory | McAdams (1993) | Medium |
| Architecture building | Constructivism / building knowledge | Piaget (1952) | Medium |
```

---

## Step 5 — Write GAPS.md

Document what research is missing and needs to be added:

```markdown
# Research Gaps

## Critical Gaps (must fill before next sprint)

### 1. Somatic/Fascia Research
**Why needed:** Meditation mode and embodiment mechanics need grounding
**For mechanic:** Breath prompts, body scan tiles, somatic grounding
**Find:** Schleip (2012) "Fascial plasticity", van der Kolk (2014) "The Body Keeps the Score"
**Key insight needed:** How does physical sensation relate to emotional regulation?

### 2. Addiction Neuroscience (specific circuits)
**Why needed:** Pattern training mode is the core recovery tool
**For mechanic:** DESPAIR/RAGE tile damage, health drain, PEACE tile reward timing
**Find:** Koob & Volkow (2010) "Neuroscience of addiction", NIDA research summaries
**Key insight needed:** What is the exact dopamine timing in craving cycles?

### 3. Mycelium Network Biology  
**Why needed:** Mycology mode needs to model real fungal network behavior
**For mechanic:** How mushrooms spawn, spread, connect in the game
**Find:** Simard (1997) "Net transfer of carbon between ectomycorrhizal tree species"
**Key insight needed:** What are the rules of mycelium network formation?

### 4. Bioelectric Fields
**Why needed:** Constellation mode pattern recognition should model bioelectric signaling
**For mechanic:** How constellations connect, spread, activate
**Find:** Levin (2021) "Bioelectric signaling", Becker (1985) "The Body Electric"
**Key insight needed:** How do bioelectric gradients guide development?

### 5. Chronobiology / Planetary Rhythms
**Why needed:** Temporal system (Sun-Saturn weekday mapping) needs accuracy
**For mechanic:** Daily challenge unlocks, planetary rhythm quests
**Find:** Refinetti (2006) "Circadian Physiology", traditional planetary hour systems
**Key insight needed:** What are the evidence-based effects of circadian timing on cognition?

### 6. Ornithology Accuracy
**Why needed:** Bird species, habitats, and behaviors must be accurate
**For mechanic:** Species identification quizzes, habitat clues, rarity ratings
**Find:** Cornell Lab eBird database, Sibley Guide species data
**Key insight needed:** Which species are common to each habitat type?

## Medium Priority Gaps

### 7. Interpersonal Neurobiology (Siegel)
**Why needed:** RPG mode relational choices
**Find:** Siegel (2012) "The Developing Mind"

### 8. Jungian Individuation (detailed)
**Why needed:** Alchemy mode transmutation mechanics
**Find:** Jung (1944) "Psychology and Alchemy"

### 9. Stoic Philosophy (practical application)
**Why needed:** Stoic cosmology flavor and mechanics
**Find:** Aurelius "Meditations", Epictetus "Discourses"

### 10. Flow State Triggers (specific conditions)
**Why needed:** Dynamic difficulty should target flow state
**Find:** Csikszentmihalyi (1990) "Flow", Nakamura & Csikszentmihalyi (2002)
```

---

## Step 6 — Fill at least 5 gaps

For each gap in the critical list, create a research file:

```bash
# Example: create mycelium research file
cat > docs/research/biology/mycelium-networks.md << 'EOF'
# Mycelium Network Research

## Source
Simard, S.W. et al. (1997). "Net transfer of carbon between ectomycorrhizal 
tree species in the field." Nature, 388, 579-582.

## Key Findings
1. Trees share carbon through underground fungal networks
2. Larger "mother trees" preferentially route resources to seedlings
3. Network is not random — it has hubs and preferential connections
4. Stress signals (drought, damage) propagate through the network
5. Chemical signals travel bidirectionally

## Mechanic Implications for Mycology Mode
- Mushrooms should NOT spawn randomly — they spawn near existing network nodes
- "Mother mushroom" concept: some are hubs that unlock others
- Toxic mushrooms spread warning signals (visual pulse) to nearby safe ones
- Foraging a safe mushroom increases detection radius for nearby species
- Network visualization: faint connecting lines between mushrooms should appear
  as player progresses (rewarding exploration with systemic understanding)

## Falsifiability
If the network spawning algorithm is random rather than hub-based,
the model is inaccurate. Spawn logic should show preferential attachment.

## Cross-References
- docs/research/psychology/implicit-learning.md (learning the network pattern)
- Game mechanic: mycology-mode.js spawn algorithm
EOF
```

Repeat for each critical gap.

---

## Verification
```bash
ls docs/research/
ls docs/research/psychology/
ls docs/research/neuroscience/
ls docs/research/biology/
cat docs/research/INDEX.md
cat docs/research/GAPS.md | grep "^###" | wc -l  # should show 10 gaps
cat docs/research/MECHANIC_MAP.md | grep "^|" | wc -l  # should show 15+ mechanics
```

## Commit message
```
docs: RESEARCH1 -- consolidated all research, mechanic map, gaps identified and filled
```
