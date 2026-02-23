# Addiction Neuroscience — Brain Circuits

## Sources
- Koob, G.F. & Volkow, N.D. (2010). "Neuroscience of addiction: Focus on dopamine." *Neuron*, 65(5), 713-729.
- Volkow, N.D. et al. (2016). "Neurobiologic advances from the brain disease model of addiction." *New England Journal of Medicine*, 374(4), 363-371.
- NIDA (2020). *Drugs, Brains, and Behavior: The Science of Addiction*. National Institute on Drug Abuse.
- Robinson, T.E. & Berridge, K.C. (1993). "The neural basis of drug craving: an incentive-salience theory of addiction." *Brain Research Reviews*, 18(3), 247-291.

## Key Findings

### The Reward Circuit
The brain's reward pathway runs from the **Ventral Tegmental Area (VTA)** → **Nucleus Accumbens (NAc)** → **Prefrontal Cortex (PFC)**:

1. **Dopamine release** in NAc signals reward/salience (not just pleasure)
2. Natural rewards (food, sex, social connection) cause modest dopamine spikes (~100-200% above baseline)
3. Addictive substances cause **massive dopamine surges** (cocaine: ~400%, meth: ~1000% above baseline)
4. **Repeated exposure** down-regulates dopamine receptors → tolerance → need more for same effect

### Incentive Salience (Wanting vs. Liking)
Robinson & Berridge's crucial distinction:
- **"Wanting"** (craving): Dopamine-mediated incentive motivation — drives compulsive seeking
- **"Liking"** (pleasure): Opioid-mediated hedonic enjoyment — much smaller brain circuit
- In addiction: **Wanting escalates dramatically** even as Liking decreases
- This explains why addicts compulsively seek drugs they no longer enjoy

### Craving Cycle Timing
```
Cue exposure → Dopamine spike (within 100-300ms)
              → "Wanting" activates (300ms–2 seconds)
              → Conscious craving awareness (2–10 seconds)
              → Action impulse (5–30 seconds peak)
              → If suppressed: craving fades (3–10 minutes)
              → If acted upon: reinforcement → stronger next cycle
```

### Prefrontal Cortex Damage
- Chronic addiction impairs the PFC — the brain's "brakes" on impulsive behavior
- Reduced PFC activation = reduced impulse control, poor decision-making
- Recovery involves **rebuilding PFC regulation** over months to years
- Stress directly weakens PFC function (Arnsten, 2009) — heightening relapse risk

### Neuroplasticity in Recovery
- Abstinence allows partial restoration of dopamine receptor density (weeks–months)
- New coping behaviors create **alternative reward pathways**
- Exercise is evidence-based for dopaminergic recovery (Dishman et al., 2009)
- Mindfulness meditation restores PFC thickness and top-down regulation

### Stress & Relapse
- CRF (corticotropin-releasing factor) system mediates stress-induced relapse
- Stress cues activate same craving circuits as drug cues
- **Allostatic model** (Koob): Set point shifts negative → substance needed to feel normal
- Recovery requires resetting the allostatic set point through new positive experiences

## Mechanic Implications

### DESPAIR/RAGE Tile Damage
- **DESPAIR tiles** model the withdrawal/dysphoric state (negative affect during abstinence)
- **RAGE tiles** model the stress-induced craving spike
- Health drain rate should be non-linear: slow at first, then spiking — mirrors real craving crescendo
- Player learns: staying in DESPAIR zones costs more health than avoiding them (avoidance training)

### PEACE Tile Reward Timing
- **Critical insight**: Dopamine rewards work on *prediction* not just delivery
- Established PEACE patterns should trigger dopamine-like reward BEFORE collection (anticipation)
- Variable ratio reinforcement (unpredictable reward) creates stronger behavioral reinforcement
- After reaching a pattern, brief "collection animation" delay = models natural dopamine timing

### Health Bar as Allostatic Load
- Health bar represents the allostatic load — accumulated stress/craving burden
- Slow drain (ticking down) = allostatic dysregulation even between active threats
- PEACE tile collection resets the allostatic baseline (not just acute relief)
- Full health = "set point restored" state

### Impulse Buffer Mechanic
- The impulse buffer (`src/recovery/impulse-buffer.js`) models the PFC inhibition window
- 300ms–2s delay before action completes = the window between cue and craving peak
- Successfully waiting out the impulse buffer = PFC successfully engaging
- Mechanic teaches the neurologically accurate intervention: **pause before acting**

### Matrix A/B Toggle
- Matrix A (default) = prefrontal-online, deliberate, regulated state
- Matrix B = limbic-dominant, reactive, craving-active state
- Toggle mirrors the neuroscience of addiction: PFC goes offline under stress/craving
- Player learns to function in Matrix B (triggered state) without acting on impulse

## Falsifiability
If health drain is purely random and PEACE tile rewards don't vary based on pattern establishment, the dopamine timing model is not implemented.

## Cross-References
- `docs/research/neuroscience/somatic-fascia.md` — somatic regulation of addiction
- `docs/research/neuroscience/dopamine-reward.md` — detailed dopamine mechanics
- `docs/research/psychology/relapse-prevention.md` — behavioral interventions
- `docs/research/synthesis/addiction-recovery-model.md` — integration
- Game mechanics: `src/recovery/impulse-buffer.js`, `src/game/grid.js`
