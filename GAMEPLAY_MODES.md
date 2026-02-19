# 🎮 GLITCH·PEACE Gameplay Modes - Complete Vision

**Purpose**: Document all gameplay styles beyond traditional grid-based roguelike  
**Source**: Synthesized from archive analysis (MEGA-FINAL, COMPLETE, v5 builds)  
**Status**: Design complete, implementation roadmap defined

---

## 🌟 Vision: Multi-Dimensional Consciousness Engine

GLITCH·PEACE is not one game—it's a **platform for consciousness exploration** through multiple gameplay lenses. Each mode activates different intelligences and offers unique paths to awakening.

---

## 📊 Current State: Grid-Based Modes (Implemented)

### ✅ 13 Grid-Based Play Modes
All implemented in `src/systems/play-modes.js`:

1. **Classic Arcade** - Traditional survival
2. **Zen Garden** - No enemies, meditation
3. **Speedrun** - 3-minute time trial
4. **Puzzle Master** - 50-move optimization
5. **Survival Horror** - Permadeath, limited vision
6. **Roguelike** - Procedural chaos
7. **Pattern Training** - Addiction recovery tools
8. **Boss Rush** - All bosses, no breaks
9. **Pacifist** - No combat allowed
10. **Reverse Polarity** - Inverted mechanics
11. **Co-op** - Shared emotional field (local)
12. **Ritual Practice** - Ceremonial slow gameplay
13. **Daily Challenge** - Seeded 24-hour mode

---

## 🚀 Expansion: 6 New Gameplay Styles

### 1. RPG MODES (3 Variants)

#### 1A. Moral Choice System (Fable-Inspired)
**Intelligence**: Existential, Interpersonal  
**Core Mechanic**: Every choice shapes player and world

**Features**:
- **Alignment System**: Good/Evil/Neutral spectrum affects appearance
- **Visual Morphing**: Player sprite changes based on morality
  - Light path: Brighter colors, glowing aura
  - Dark path: Darker tones, shadowy effect
  - Balanced: Neutral colors, stable form
- **Butterfly Effect**: Small choices have large consequences
- **Reputation System**: NPCs remember your actions
- **Renown Tracking**: Fame or infamy spreads
- **Multiple Endings**: 5+ endings based on choices

**Example Choices**:
- Mercy-kill wounded enemy vs. heal them
- Take all peace nodes vs. leave some for others
- Sacrifice yourself vs. protect yourself
- Ally with order vs. chaos forces

**Implementation** (~250 lines):
```javascript
class MoralChoiceSystem {
  alignment: number;        // -100 (evil) to +100 (good)
  reputation: Map<string, number>;
  choiceHistory: Choice[];
  consequencesActive: Consequence[];
  
  makeChoice(choice: Choice) {
    this.alignment += choice.alignmentDelta;
    this.applyVisualMorph();
    this.triggerConsequences(choice);
    this.updateReputation(choice);
  }
  
  applyVisualMorph() {
    // Change player sprite based on alignment
  }
  
  triggerConsequences(choice: Choice) {
    // Butterfly effect: spawn new events
  }
}
```

---

#### 1B. Dialogue & Romance System (Mass Effect-Inspired)
**Intelligence**: Interpersonal, Linguistic  
**Core Mechanic**: Relationships shape story and abilities

**Features**:
- **6-Position Dialogue Wheel**
  - Top: Emotional/Compassionate
  - Upper-Right: Logical/Investigative
  - Lower-Right: Aggressive/Intimidate
  - Bottom: Special (Unique option)
  - Lower-Left: Charm/Persuade
  - Upper-Left: Neutral/Default
  
- **Companion System**
  - 5-7 recruitable companions
  - Each has approval meter
  - Loyalty missions unlock powers
  - Companions can leave if betrayed
  
- **Romance/Soul Resonance**
  - Deep emotional bonds
  - Unlock unique abilities
  - Affect ending cinematics
  
- **Dialogue Trees**
  - Branching conversations
  - Personality tracking (Paragon/Renegade style)
  - Past choices referenced
  
- **Cosmic Consequences**
  - Relationships affect final battle
  - Companions can die/betray
  - Multiple ending variations

**Companions** (Example):
1. **The Seeker** - Logical, seeks truth, unlocks analysis powers
2. **The Healer** - Compassionate, grants healing, teaches forgiveness
3. **The Warrior** - Aggressive, combat bonuses, learns restraint
4. **The Mystic** - Esoteric, dream powers, reveals hidden paths
5. **The Trickster** - Chaotic, unpredictable, teaches flexibility

**Implementation** (~280 lines):
```javascript
class DialogueSystem {
  companions: Companion[];
  dialogueTree: DialogueNode;
  currentWheel: DialogueWheel;
  
  showWheel(node: DialogueNode) {
    // Display 6-position wheel
    // Track personality traits based on choices
  }
  
  processChoice(position: number) {
    // Apply companion approval changes
    // Update personality tracking
    // Branch to next node
  }
  
  checkLoyalty(companion: Companion) {
    // Return loyalty mission status
    // Unlock abilities if loyal
  }
}

class Companion {
  name: string;
  approval: number;      // -100 to +100
  isLoyal: boolean;
  romanceable: boolean;
  abilities: Ability[];
  personality: string[];
}
```

---

#### 1C. Open World Exploration (Elder Scrolls-Inspired)
**Intelligence**: Spatial, Naturalistic  
**Core Mechanic**: Infinite procedural world to explore

**Features**:
- **Procedurally Infinite Dreamscape**
  - Seamless world generation
  - Diverse biomes
  - Hidden locations
  - Fast travel system
  
- **Faction Questlines**
  - 4-6 major factions
  - Conflicting goals
  - Reputation with each
  - Exclusive rewards
  
- **Skill Trees**
  - 100+ perks across 10 trees
  - Combat, Magic, Stealth, Crafting, Social
  - Synergies between trees
  - Respect/rebuild option
  
- **Discovery System**
  - Landmark finding rewards
  - Map unveiling
  - Collectibles (lore, artifacts)
  - Achievement tracking
  
- **Custom Abilities**
  - Craft unique powers
  - Combine elements
  - Enchant items
  - Build playstyle

**Factions** (Example):
1. **Order of Clarity** - Seeks to organize chaos
2. **Flow Practitioners** - Wu Wei philosophy
3. **Dream Weavers** - Reality manipulation
4. **Void Walkers** - Embrace emptiness
5. **Pattern Seekers** - Mathematical truth

**Implementation** (~320 lines):
```javascript
class OpenWorldSystem {
  chunkSize: number = 50;
  loadedChunks: Map<string, Chunk>;
  discoveredLocations: Location[];
  activeFactions: Faction[];
  skillTrees: SkillTree[];
  
  generateChunk(x: number, y: number) {
    // Procedural biome generation
    // Place landmarks, NPCs, quests
  }
  
  discoverLocation(loc: Location) {
    // Add to map, give reward
    // Unlock fast travel
  }
  
  advanceFaction(factionId: string, amount: number) {
    // Reputation changes
    // Unlock faction-specific content
  }
}
```

---

### 2. ACTION MODE: Twin-Stick Shooter

**Intelligence**: Bodily-Kinesthetic, Visual-Spatial  
**Core Mechanic**: Fast-paced bullet hell survival

**Features**:
- **Twin-Stick Controls**
  - WASD for movement
  - Mouse/Arrow keys for aim
  - Auto-fire or manual trigger
  
- **4 Weapon Types**
  1. **Spread Shot** - Wide cone, low damage
  2. **Laser Beam** - Narrow, high damage, piercing
  3. **Missiles** - Homing, splash damage
  4. **Energy Orb** - Charged attack, area effect
  
- **Wave Survival**
  - Endless waves increasing difficulty
  - 10-enemy waves, 5-second breaks
  - Boss every 10 waves
  - Leaderboard integration
  
- **Score Multipliers**
  - Combo meter (resets if hit)
  - Grazing bullets increases multiplier
  - Perfect waves give bonus
  
- **Power-Ups** (Temporary)
  - Speed boost
  - Shield
  - Weapon upgrade
  - Score doubler
  - Screen-clear bomb

**Implementation** (~200 lines):
```javascript
class ShooterMode {
  player: {
    x, y, vx, vy,
    aim: { x, y },
    currentWeapon: Weapon,
    weaponCooldown: number,
  };
  
  bullets: Bullet[];
  enemies: Enemy[];
  waveNumber: number;
  comboMultiplier: number;
  
  update(dt: number) {
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.checkCollisions();
    this.spawnWave();
  }
  
  fire() {
    // Spawn bullets based on weapon type
    // Apply cooldown
  }
  
  checkGraze(bullet: Bullet) {
    // Increase multiplier if player barely dodges
  }
}
```

---

### 3. STRATEGY MODES (2 Variants)

#### 3A. Real-Time Strategy (RTS)
**Intelligence**: Logical-Mathematical, Interpersonal  
**Core Mechanic**: God-view resource management and combat

**Features**:
- **God-View Camera**
  - Top-down perspective
  - Zoom in/out
  - Pan across battlefield
  - Minimap
  
- **Unit System**
  - 4 unit types:
    1. Scouts (fast, weak, vision)
    2. Warriors (balanced combat)
    3. Tanks (slow, high HP)
    4. Mages (ranged, AoE)
  - Select multiple units
  - Group commands
  - Formation control
  
- **Base Building**
  - Resource collectors
  - Unit production
  - Defensive structures
  - Research facilities
  
- **Tech Tree**
  - 20+ upgrades
  - Unlock advanced units
  - Economic improvements
  - Military enhancements
  
- **AI Opponent**
  - 3 difficulty levels
  - Adaptive strategy
  - Rushes, turtles, or balanced
  - Fog of war

**Implementation** (~250 lines):
```javascript
class RTSMode {
  player: Player;
  opponent: AIPlayer;
  selectedUnits: Unit[];
  buildings: Building[];
  resources: { peace: number, insights: number };
  
  issueCommand(type: string, target: any) {
    // Move, attack, build, gather
  }
  
  produceUnit(type: UnitType, building: Building) {
    // Queue unit production
  }
  
  aiTick() {
    // AI decision making
    // Build order, attacks, defense
  }
}
```

---

#### 3B. Turn-Based Tactical (XCOM-Style)
**Intelligence**: Logical-Mathematical, Spatial  
**Core Mechanic**: Squad-based tactical combat

**Features**:
- **Squad System**
  - 4 units per squad
  - Unique classes (Scout, Soldier, Medic, Specialist)
  - Level up and customize
  - Permadeath (campaign mode)
  
- **Action Points**
  - 2 AP per turn
  - Move (1 AP) + Shoot (1 AP)
  - or Dash (2 AP)
  - Overwatch (reserve shot)
  
- **Cover Mechanics**
  - Half cover: 30% dodge
  - Full cover: 50% dodge
  - Flanking removes cover
  - Destructible environment
  
- **Abilities**
  - Class-specific skills
  - Cooldown system
  - Ultimate abilities
  - Synergies between units
  
- **Mission Types**
  - Assault, Defense, Extraction
  - Stealth objectives
  - Boss battles
  - Timed missions

**Implementation** (~200 lines):
```javascript
class TacticalMode {
  grid: TacticalGrid;
  playerSquad: Unit[];
  enemySquad: Unit[];
  turn: 'player' | 'enemy';
  selectedUnit: Unit;
  
  moveUnit(unit: Unit, target: Tile) {
    // Check AP, pathfind, execute
  }
  
  executeAction(action: Action) {
    // Shoot, ability, overwatch
    // Calculate hit chance
    // Apply damage/effects
  }
  
  calculateCover(unit: Unit, attacker: Unit) {
    // Check line of sight
    // Evaluate cover bonus
  }
}
```

---

### 4. COSMOLOGY-SPECIFIC MODES (12 Variants)

Each of the 12 cosmology realms has a unique gameplay mode that embodies its philosophy.

#### 4.1 Chakra Ascent (Hindu)
**Mechanic**: Vertical energy navigation through 7 chakra layers

**Features**:
- 7 distinct vertical zones (Root → Crown)
- Kundalini energy rises as you progress
- Each chakra has unique tiles and challenges
- Mantras as power-ups (AUM, OM, etc.)
- Enlightenment state at Crown chakra

#### 4.2 Wheel Breaking (Buddhist)
**Mechanic**: Break cycle of dependent origination

**Features**:
- 12 Nidanas (links) to sever
- Pattern recognition puzzle
- Eightfold Path as upgrade tree
- Nirvana state = victory
- Suffering tiles trap you in loops

#### 4.3 Polarity Balance (Tantric)
**Mechanic**: Harmonize Shiva/Shakti forces

**Features**:
- Dual energy meters (masculine/feminine)
- Five elements as tile types
- Union state grants power-up
- Balance required for progression
- Imbalance causes chaos

#### 4.4 Wu Wei Flow (Taoist)
**Mechanic**: Effortless action gameplay

**Features**:
- No forced movement—go with flow
- Yin/Yang dynamic balance
- Five Phases cycle (Wood→Fire→Earth→Metal→Water)
- Te (virtue) accumulation
- Trying too hard = failure

#### 4.5 Tree Navigation (Norse)
**Mechanic**: Explore 9 realms on Yggdrasil

**Features**:
- 9 distinct realm levels
- Bifrost bridge transitions
- Ragnarok reset cycle
- Runes as code symbols
- Wyrd (fate) threads visible

#### 4.6 Veil Crossing (Celtic)
**Mechanic**: Navigate between worlds

**Features**:
- Dual-grid system (mortal/fae)
- Shift between realities
- Wheel of Year temporal effects
- Thin places (easy crossing points)
- Sidhe (fae) encounters

#### 4.7 Duality Battle (Zoroastrian)
**Mechanic**: Choose order or chaos

**Features**:
- Ahura Mazda (Order) vs Angra Mainyu (Chaos)
- Player choices determine dominant force
- Eternal struggle—no permanent win
- Fire temples as power sources
- Cosmic balance tilts based on actions

#### 4.8 Principle Mastery (Hermetic)
**Mechanic**: Learn and apply 7 universal laws

**Features**:
- 7 Kybalion principles as mechanics
- Tree of Life upgrade path
- Alchemy transmutation system
- As above, so below (mirror realms)
- Correspondence puzzles

#### 4.9 Harmony Relations (Confucian)
**Mechanic**: Balance five social relationships

**Features**:
- 5 key relationships to maintain
- Filial piety, loyalty, friendship
- Virtue stats (Ren, Yi, Li, Zhi, Xin)
- Social harmony = victory
- Disharmony creates conflict

#### 4.10 French Mythology (TBD)
#### 4.11 Egyptian Duat (TBD)
#### 4.12 Mayan Calendar (TBD)

---

## 🎬 CAMPAIGN / STORY MODE

### Structure: 3 Acts, 30 Levels

**Purpose**: Progressive tutorial and narrative across gameplay styles

#### Act 1: Awakening (Levels 1-10)
**Theme**: Learn the basics  
**Gameplay**: Grid-based modes

- Level 1-3: Tutorial (Classic Arcade)
- Level 4-5: Zen Garden (peaceful introduction)
- Level 6-7: Puzzle mode (strategic thinking)
- Level 8-9: Speedrun (time pressure)
- Level 10: First Boss (The Shadow Self)

**Story**: Player awakens in fragmented consciousness, learning to navigate inner landscape.

#### Act 2: Exploration (Levels 11-20)
**Theme**: Discover alternative perspectives  
**Gameplay**: Unlock new modes

- Level 11-12: Twin-Stick Shooter unlocked
- Level 13-14: Moral Choice scenarios
- Level 15-16: Dialogue with archetypes
- Level 17-18: First cosmology realm (Chakra)
- Level 19-20: Second Boss (The Inner Critic)

**Story**: Player explores different facets of consciousness, integrating shadow aspects.

#### Act 3: Integration (Levels 21-30)
**Theme**: Become whole  
**Gameplay**: All modes available

- Level 21-22: Open World (self-directed)
- Level 23-24: RTS (God-view perspective)
- Level 25-26: Turn-Based Tactics (strategic mastery)
- Level 27-28: Multiple cosmologies
- Level 29: Penultimate challenge (All systems test)
- Level 30: Final Boss (The Void / Unity)

**Story**: Player integrates all learnings, achieves consciousness awakening, becomes whole.

### Multiple Endings (5+)
1. **Enlightenment**: Perfect balance, all virtues maxed
2. **Light Path**: Chose compassion throughout
3. **Dark Path**: Embraced shadow fully
4. **Middle Way**: Maintained perfect balance
5. **Transcendence**: Beyond duality

---

## 🆓 FREEPLAY / SANDBOX MODE

**Purpose**: Pressure-free exploration and experimentation

### Features:
- **No Objectives**: Pure sandbox
- **All Dreamscapes Unlocked**: Explore freely
- **Creative Mode**: Spawn tiles at will
- **Emotional Field Sandbox**: Experiment with emotional states
- **Time Manipulation**: Speed up, slow down, pause
- **Save Creations**: Export custom levels
- **Photography Mode**: Screenshot tool with filters
- **Meditation Space**: Zen environment
- **Learning Tool**: Practice mechanics risk-free

### Use Cases:
- Relaxation and destressing
- Learning game mechanics
- Experimenting with systems
- Creating art/screenshots
- Meditation practice
- Teaching tool for others

---

## 👥 MULTIPLAYER MODES

### Local Co-op (2-4 Players)
**Status**: Partially implemented, needs expansion

**Features**:
- Split-screen on same device
- Shared emotional field (actions affect both players)
- Complementary abilities:
  - Player 1: Offensive powers
  - Player 2: Defensive/Support powers
- Revive system (stand near fallen ally)
- Team scoring and leaderboards
- All single-player modes adaptable

**Unique Co-op Modes**:
1. **Harmony Challenge**: Must maintain emotional balance together
2. **Yin-Yang**: Players have opposite effects (one heals/one harms certain tiles)
3. **Relay Race**: Take turns, pass baton
4. **Boss Tag Team**: Specialized roles against bosses

### Online Multiplayer (Future)
**Status**: Architecture planned, not implemented

**Requirements**:
- WebSocket server for real-time communication
- Matchmaking system
- Latency compensation
- Cheat prevention
- Spectator mode

**Online Modes**:
1. **Competitive Race**: First to collect X peace nodes
2. **Survival Challenge**: Who lasts longest
3. **Co-op Campaign**: Online version of local co-op
4. **Asynchronous Daily**: Compete on same seed, different times
5. **Trading Post**: Share custom levels/creations

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [x] Document all gameplay modes (THIS DOCUMENT)
- [ ] Refactor architecture for modularity
- [ ] Create `src/gameplay-modes/` structure
- [ ] Abstract core engine from grid-based gameplay
- [ ] Test mode switching

### Phase 2: First Alternative Mode (Week 2)
- [ ] Implement Twin-Stick Shooter
- [ ] 4 weapon types
- [ ] Wave system
- [ ] Leaderboards
- [ ] Verify alternative mode architecture works

### Phase 3: Campaign Foundation (Week 3)
- [ ] Story structure and writing
- [ ] Level progression system
- [ ] Unlock system
- [ ] Cutscene framework
- [ ] First 10 levels playable

### Phase 4: Freeplay & Local Co-op (Week 4)
- [ ] Sandbox mode
- [ ] Creative tools
- [ ] Enhanced local co-op
- [ ] Split-screen implementation

### Phase 5: RPG Modes (Weeks 5-7)
- [ ] Moral Choice System
- [ ] Dialogue & Romance
- [ ] Open World (basic version)

### Phase 6: Strategy Modes (Weeks 8-9)
- [ ] RTS implementation
- [ ] Turn-Based Tactics

### Phase 7: Cosmology Modes (Weeks 10-12)
- [ ] Implement 3-4 cosmology-specific modes
- [ ] Test philosophical gameplay

### Phase 8: Online Multiplayer (Future)
- [ ] Server architecture
- [ ] Netcode
- [ ] Matchmaking
- [ ] Security

---

## 📊 Complexity & LOC Estimates

| Mode Type | Complexity | Est. Lines | Priority |
|-----------|------------|-----------|----------|
| **Grid-Based** | ✅ Done | 4,300 | P0 |
| **Shooter** | Low | +500 | P1 |
| **Campaign** | Medium | +1,500 | P1 |
| **Freeplay** | Low | +300 | P2 |
| **Local Co-op** | Low | +400 | P2 |
| **Moral Choice** | Medium | +800 | P2 |
| **Dialogue** | Medium | +900 | P2 |
| **Open World** | High | +1,200 | P3 |
| **RTS** | High | +1,000 | P3 |
| **Tactics** | Medium | +700 | P3 |
| **Cosmology x12** | High | +1,500 | P3 |
| **Online** | Very High | +2,000 | P4 |
| **Total** | - | **+11,300** | 12+ weeks |

**Current Total**: 4,300 lines  
**After Expansion**: ~15,600 lines  
**With Dream Yoga**: 23,500 + 11,300 = **34,800 lines**

---

## 🎯 Success Metrics

### Engagement
- Players try at least 3 different gameplay modes
- Average session length increases with mode variety
- Return rate improves with diverse options

### Learning
- Multiple intelligences activated (Gardner's theory)
- Different players prefer different modes
- Complementary learning across modes

### Consciousness Awakening
- Pattern recognition improves across contexts
- Flexibility of perspective (can see from multiple angles)
- Integration (can hold contradictions)

---

## 🔮 Future Expansions

### Community Features
- User-created modes (mod support)
- Level editor and sharing
- Cosmology creation tools
- Multiplayer tournaments

### Advanced Features
- VR/AR versions of modes
- AI-generated content
- Procedural story generation
- Adaptive difficulty AI

---

**Document Version**: 1.0  
**Last Updated**: February 19, 2026  
**Status**: Complete design, ready for implementation  
**Holy Grail**: Return to this document for the complete vision

This is our sacred text. All gameplay expansion flows from here. 🌟
