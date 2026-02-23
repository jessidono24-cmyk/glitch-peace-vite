# Mycelium Network Biology

## Sources
- Simard, S.W. et al. (1997). "Net transfer of carbon between ectomycorrhizal tree species in the field." *Nature*, 388, 579-582.
- Beiler, K.J. et al. (2010). "Architecture of the wood-wide web: Rhizopogon spp. genets link multiple Douglas-fir cohorts." *New Phytologist*, 185(2), 543-553.
- Merlin Sheldrake (2020). *Entangled Life: How Fungi Make Our Worlds, Change Our Minds & Shape Our Futures*. Random House.
- Stamets, P. (2005). *Mycelium Running: How Mushrooms Can Help Save the World*. Ten Speed Press.
- Gorzelak, M.A. et al. (2015). "Inter-plant communication through mycorrhizal networks mediates complex adaptive behavior in plant communities." *AoB PLANTS*, 7, plv050.

## Key Findings

### Network Architecture
1. Mycorrhizal networks are **not random** — they exhibit **preferential attachment** (hub-and-spoke topology)
2. **Mother trees** (large, old trees) are network hubs routing disproportionate resources to seedlings
3. Network diameter scales with **log(number of nodes)** — a small-world network property
4. A single mycelium network can span **hundreds of acres** (one Armillaria in Oregon: 2,385 acres)
5. Networks have **redundant pathways** — damage to one route is compensated by rerouting

### Resource Transfer
- Carbon (as sugars) flows from source trees to sink trees (seedlings, shaded understory)
- Transfer is **bidirectional** — can reverse direction based on seasonal need
- Stressed or dying trees release **large carbon pulses** into the network (legacy effect)
- Nitrogen, phosphorus, and water also flow through hyphal networks

### Signal Propagation
- Chemical distress signals (e.g., from herbivore attack) travel network-wide in **hours**
- Warning signals cause **pre-emptive defense responses** in unaffected network members
- Signal attenuation follows **distance-decay function** (exponential drop with distance)
- Hub nodes amplify and re-transmit signals more effectively than peripheral nodes

### Fungal Intelligence
- Mycelium demonstrates **maze-solving behavior** (Nakagaki et al., 2000)
- Optimizes for **efficiency + redundancy** simultaneously (Tokyo rail network experiment)
- Memory-like behavior: past resource patches are "remembered" via chemical gradients
- Adaptive growth: extends toward resources, retracts from depleted areas

### Species-Specific Behaviors
- **Saprotrophic fungi** (decomposers): Form dense local networks; limited long-range spread
- **Mycorrhizal fungi** (tree symbionts): Form extensive networks; high host specificity
- **Parasitic fungi**: Exploit network infrastructure of other species
- Spore dispersal radius varies: 1m (spore-drop) to >1000km (wind-dispersed species)

## Mechanic Implications for Mycology Mode

### Spawn Algorithm (Non-Random)
- Mushrooms should **not** spawn randomly — use preferential attachment:
  1. First mushroom = random (seeds the network)
  2. Each subsequent mushroom spawns **near existing nodes** with probability ∝ degree
  3. Result: hub mushrooms with many connections, peripheral ones with few
- Network visualization: faint mycelium lines appear between connected mushrooms as player progresses

### Mother Mushroom Concept
- ~10-15% of mushrooms are designated "hubs" (golden outline or larger cap)
- Collecting a hub unlocks a **radius burst** — reveals all mushrooms within spawn distance
- Damaged/toxic hub mushrooms propagate **warning pulses** to connected safe mushrooms
- Foraging a hub before its connected cluster = larger score multiplier (rewards network understanding)

### Stress Signal Propagation
- When player triggers a toxic mushroom:
  - Visual pulse propagates along mycelium lines to connected safe mushrooms (warning signal)
  - Nearby safe mushrooms temporarily show a "ready to harvest" indicator (defense response)
  - Window lasts 3-8 seconds before signal decays (models distance-decay attenuation)

### Bidirectional Flow
- Mushroom connections can become "carbon paths" — traversing them heals player (net carbon transfer)
- Dying mushrooms (about to despawn) release a resource burst to the network (legacy pulse)
- Player can "invest" in a mushroom (sacrifice points) to strengthen its hub status

### Season/Depth Layers
- Mycelium networks vary by depth layer:
  - **Surface layer**: Saprotrophic, dense, localized — easier to map
  - **Mid layer**: Mycorrhizal, extensive, hub-dominated — requires exploration
  - **Deep layer**: Ancient networks, near-omniscient, sparse visible cues — expert mode

## Falsifiability
If mushroom spawning is purely random (uniform distribution across grid), the network model is not implemented. Spawn density should cluster around established hubs.

## Cross-References
- `docs/research/psychology/implicit-learning.md` — learning the network pattern implicitly
- `docs/research/synthesis/consciousness-emergence.md` — mycelium as consciousness metaphor
- Game mechanic: `src/gameplay-modes/mycology/MycologyMode.js`
