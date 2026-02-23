# Ornithology Basics — Species Identification & Behavior

## Sources
- Sibley, D.A. (2000). *The Sibley Guide to Birds*. Knopf.
- Cornell Lab of Ornithology. *Birds of the World* and *eBird* database. https://ebird.org
- Gill, F.B. (2007). *Ornithology* (3rd ed.). Freeman.
- Alerstam, T. (1990). *Bird Migration*. Cambridge University Press.
- Stap, D. (1990). *A Parrot Without a Name: The Search for the Last Unknown Birds on Earth*. Knopf.

## Key Findings

### Bird Identification System
Bird identification relies on a hierarchy of cues:

1. **Size and shape** (most reliable): Overall body size, bill shape, tail length, wing shape in flight
2. **Behavior**: Foraging style (gleaning, probing, hawking), movement (hop vs. walk), posture
3. **Habitat**: Specific microhabitats within biomes strongly predict species present
4. **Vocalizations**: Song (learned, complex) vs. call (innate, simple) — often more diagnostic than plumage
5. **Plumage**: Color patterns, wing bars, eye rings — variable by age, sex, season

### Habitat Categories & Representative Species
| Habitat | Representative Species | Key Field Marks |
|---------|----------------------|-----------------|
| Forest interior | Ovenbird, Barred Owl, Pileated Woodpecker | Orange crown stripe; hooting; red crest |
| Forest edge | Gray Catbird, Indigo Bunting, American Robin | Mew call; brilliant blue; red breast |
| Wetland | Great Blue Heron, Belted Kingfisher, Common Gallinule | S-neck profile; rattling call; red bill |
| Grassland | Eastern Meadowlark, Bobolink, Dickcissel | Yellow breast/black V; male black/white; yellow breast |
| Shrubland | Yellow Warbler, Common Yellowthroat, Field Sparrow | All-yellow; black mask; pink bill |
| Urban | Rock Pigeon, House Sparrow, European Starling | Iridescent neck; streaked brown; spotted breast |
| Coastal | Laughing Gull, Willets, Semipalmated Plover | Black hood; gray wings; breast band |
| Open water | Common Loon, Bufflehead, Double-crested Cormorant | Checkered back; white head patch; orange throat |
| Sky | Chimney Swift, Barn Swallow, Common Nighthawk | Cigar body; forked tail; white wing patches |

### Rarity Ratings (eBird Frequency Scale)
- **Abundant** (>30% checklists): Rock Pigeon, American Robin, European Starling
- **Common** (10–30%): Song Sparrow, Red-winged Blackbird, Mourning Dove
- **Fairly Common** (3–10%): Eastern Phoebe, Cedar Waxwing, Yellow Warbler
- **Uncommon** (1–3%): Cerulean Warbler, Rusty Blackbird, Golden-winged Warbler
- **Rare** (<1%): Most out-of-range vagrants; many specialist species
- **Casual/Accidental**: Species far outside normal range (<5 total records for region)

### Migration Patterns
- Most North American land birds migrate **nocturnally** using star navigation and magnetic sensing
- Peak migration: **spring (April–May)** and **fall (August–October)**
- Migration corridors follow geographic features: coastlines, river valleys, mountain ridges
- Radar ornithology shows millions of birds aloft simultaneously on peak nights
- Climate change is shifting migration timing: spring arrivals ~5 days earlier per decade

### Vocalization Structure
- **Songs**: Complex sequences, learned during sensitive period; used for territory and mate attraction
- **Calls**: Simpler, innate; used for alarm, contact, flock coordination
- **Dawn Chorus**: Multi-species singing at dawn — each species has distinct start time
- Frequency range: Most bird calls in **1–8 kHz** range (peak human hearing sensitivity)

### Conservation Status (IUCN categories)
- LC (Least Concern), NT (Near Threatened), VU (Vulnerable), EN (Endangered), CR (Critically Endangered)
- ~12% of world's ~10,000 bird species are threatened
- Habitat loss, cats, window strikes, and pesticides are primary North American threats

## Mechanic Implications for Ornithology Mode

### Identification Challenge System
- Present species identification challenges using the real hierarchy:
  1. **Level 1** (easiest): Identify from clear full-body image in correct habitat
  2. **Level 2**: Identify from behavior description + habitat clue only (no image)
  3. **Level 3**: Identify from vocalization clue only (written onomatopoeia or phonetic description)
  4. **Level 4** (hardest): Identify from single field mark + season + habitat combination
- Higher levels of the hierarchy = rarer species with narrower habitat tolerance

### Habitat Clue System
- Each challenge tile shows habitat type — player uses this to narrow candidates
- Habitat matching gives score bonus (realistic field identification behavior)
- Wrong habitat + correct species = partial credit (acknowledges rarity/vagrants)
- "Habitat specialist" badge for identifying 5 consecutive correct species in same habitat

### Rarity Score
- Abundant species = low points (easily seen)
- Rare/uncommon species = high points (reward for specific knowledge)
- Seasonal timing matters: bonus points for correctly identifying a migrant in migration season
- Life list mechanic: Each new species identified goes into permanent collection

### Vocalization Integration
- Written onomatopoeia clues ("fee-bee-ee" = Black-capped Chickadee; "drink-your-teeeea" = Eastern Towhee)
- Players learn that call descriptions are memory devices, not literal transcriptions
- Bonus discovery: some species' names are derived from their calls (Chickadee, Phoebe, Killdeer, Bobolink)

### Behavioral Clues
- Foraging behavior description as identification clue:
  - "Walks along mudflat probing with long bill" → shorebird (not warbler)
  - "Sits still on high perch then dives to water" → Belted Kingfisher
  - "Creeps down tree headfirst" → White-breasted Nuthatch (not creeper, which goes up)

## Falsifiability
If species identification only uses color/visual matching with no habitat, behavior, or vocalization cues, the multi-modal field identification model is not implemented.

## Cross-References
- `docs/research/psychology/implicit-learning.md` — building field identification skill implicitly
- `docs/research/psychology/foundations.md` — attention training through mindful observation
- Game mechanic: `src/gameplay-modes/ornithology/OrnithologyMode.js`
