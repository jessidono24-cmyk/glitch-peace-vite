# Game Design Integration — Research to Mechanic

## Overview
This document maps the translation from research findings to game design decisions, ensuring every mechanic has an evidence basis and every evidence basis has a mechanic.

## Design Principles Derived from Research

### 1. The 70/30 Rule (Flow Calibration)
**Source**: Csikszentmihalyi (1990); Vygotsky's ZPD (1978)
**Principle**: Challenges should succeed 70% of the time and fail 30% — enough success for competence feeling, enough failure for growth
**Implementation**: Dynamic difficulty adjustment targets 70% win rate per session

### 2. Variable Ratio Reward Scheduling
**Source**: Skinner (1938); Schultz (1997)
**Principle**: Variable ratio schedules produce highest behavioral response rates and most durable learning
**Implementation**: PEACE tile bonus clusters appear on variable (not fixed) interval schedules

### 3. Spaced Repetition of Core Patterns
**Source**: Ebbinghaus (1885); Cepeda et al. (2006)
**Principle**: Information reviewed at expanding intervals is retained far better than massed practice
**Implementation**: Core pattern types recur across sessions with increasing time intervals; bonus for recognizing recurring patterns

### 4. Multi-Sensory Encoding
**Source**: Paivio's Dual Coding Theory (1986); Mayer's CTML (2001)
**Principle**: Information encoded through multiple sensory channels is retrieved more reliably
**Implementation**: Every significant game event has visual + audio response; major milestones add tactile (if haptic device) element

### 5. Emotional Tagging Enhances Memory
**Source**: LeDoux (1996); McGaugh (2000)
**Principle**: Emotionally significant events are consolidated into long-term memory preferentially
**Implementation**: Emergence level-ups, first PEACE pattern completions, and major discoveries have enhanced audio/visual celebration → emotional significance → stronger memory encoding

### 6. Social Scaffolding
**Source**: Vygotsky (1978); Bandura (1977)
**Principle**: Learning is accelerated when modeled by others and occurs in social context
**Implementation**: Co-op mode, community leaderboards, and archetype lore show diverse successful strategies

### 7. Transfer Design
**Source**: Singley & Anderson (1989); Barnett & Ceci (2002)
**Principle**: Transfer is maximized when surface features vary but deep structure remains constant
**Implementation**: Same underlying pattern recognition across all modes (grid, constellation, ornithology, mycology) ensures transfer — different surface, same deep structure

## Research → Mechanic Traceability Matrix

| Research Finding | Mechanic | Confidence | Measurable in Code? |
|-----------------|----------|------------|---------------------|
| RPE dopamine timing (Schultz) | PEACE tile reward variability | High | Yes |
| PFC impulse inhibition (Arnsten) | Impulse buffer delay | High | Yes |
| Polyvagal regulation (Porges) | Breath prompt timing (4-7-8) | High | Needs implementation |
| Fascial interoception (Schleip) | Body scan tile mechanic | Medium | Needs implementation |
| Preferential attachment (Beiler) | Mycology spawn algorithm | High | Needs verification |
| Reaction-diffusion (Turing) | Constellation connection algorithm | Medium | Needs implementation |
| Circadian rhythms (Refinetti) | Daily challenge type by day | Medium | Partially implemented |
| Chronotype variation (Roenneberg) | Time-of-day difficulty modifier | Low | Not yet implemented |
| Habit loop (Duhigg) | Daily session cue-routine-reward | High | Yes |
| Glucocorticoid stress (Sapolsky) | RAGE tile health drain rate | High | Needs calibration |

## Quality Assurance Checklist for Each New Mechanic

Before shipping any new mechanic, verify:
- [ ] There is a corresponding research note in `docs/research/`
- [ ] The research note includes a "Falsifiability" section
- [ ] The mechanic is listed in `MECHANIC_MAP.md`
- [ ] The implementation matches the research model (not just thematically, but mechanically)
- [ ] A playtester from the target population (recovery, consciousness exploration) has tested it

## Cross-References
- `docs/research/MECHANIC_MAP.md` — full mechanic-to-research mapping table
- `docs/research/synthesis/addiction-recovery-model.md`
- `docs/research/synthesis/consciousness-emergence.md`
