# GLITCH·PEACE v5

**Temporal-Emotional-Archetypal Consciousness Simulation**  
*With Integrated Pattern Recognition Training for Addiction Recovery*

---

## 🎮 What Is This?

GLITCH·PEACE is a grid-based survival puzzle game that doubles as a **therapeutic tool for pattern recognition training**. It teaches:

- **Emotional regulation** through gameplay mechanics
- **Impulse delay** via intentional choice systems
- **Consequence prediction** through future-state visualization
- **Pattern awareness** through loop detection
- **Alternative thinking** through route discovery

All wrapped in an engaging dreamscape exploration experience.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js v18+** (https://nodejs.org/)
- **VS Code** (recommended) (https://code.visualstudio.com/)

### Installation

```bash
# 1. Extract the project folder
# 2. Open terminal in glitch-peace-v5/
# 3. Install dependencies:
npm install

# 4. Start development server:
npm run dev
# Opens at http://localhost:5173

# 5. Build single HTML file:
npm run build
# Output: dist/glitch-peace-v5.html
```

### Build Variants

```bash
npm run build          # Full version (~4000 lines)
npm run build:lite     # Mobile-optimized (~3000 lines)
npm run build:recovery # Recovery-focused preset (~4000 lines)
npm run build:all      # All three versions
```

---

## 📱 Mobile Support

### Testing on Phone

**Same WiFi Method:**
1. Run `npm run dev` on computer
2. Note the Local IP (e.g., `http://192.168.1.5:5173`)
3. Open that URL on your phone's browser

**Install as App (PWA):**
1. Open the game in mobile browser
2. Tap "Add to Home Screen"
3. Plays fullscreen like native app

### Controls
- **Desktop:** WASD / Arrow Keys
- **Mobile:** Touch D-pad buttons OR swipe gestures
- **Universal:** 
  - SHIFT = Matrix toggle
  - ESC = Pause
  - H = Help overlay
  - J = Archetype power
  - R = Glitch pulse
  - Q = Freeze enemies

---

## 🧠 Game Modes

### 1. **Unlimited Exploration**
- No time limits
- Full experience
- Casual play

### 2. **Timed Practice** (30min)
- Structured session
- Completion bonus
- Fatigue system active

### 3. **Pattern Recognition Focus** (45min) ⚡
- **Recovery Tool Mode**
- All awareness systems enabled:
  - Hazard Pull (craving simulation)
  - Impulse Buffer (delay training)
  - Consequence Preview (future vision)
  - Pattern Echo (loop detection)
  - Route Alternatives (flexibility training)

---

## 🎨 Core Systems

### Emotional Engine
10 emotions with valence/arousal/coherence values:
- Awe, Grief, Anger, Curiosity, Shame
- Tenderness, Fear, Joy, Despair, Hope

**Distortion Formula:**  
`Σ(arousal × (1 - coherence))`

**Synergies:**
- Anger + Coherence → Focused Force
- Grief + Curiosity → Deep Insight
- Shame + Awe → Collapse Event

### Temporal System
- **8 Lunar Phases** (New → Full → Waning)
- **7 Weekly Harmonics** (Radiant Core → Structure & Trial)
- **Matrix A/B Toggle** (Erasure vs Coherence)

Modifiers blend to affect:
- Enemy aggression
- Insight gain
- Dream permeability
- Visibility radius

### Archetype System
15 archetypes with fusion capabilities:
- Dragon, Guardian, Devourer, Mirror, Weaver
- Witness, Wanderer, Judge, Alchemist, Herald
- Child Guide, Orb, Captor-Teacher, Protector

**Fusion Examples:**
- Guardian + Wanderer → Wayfinder
- Devourer + Architect → Reformer
- Mirror + Weaver → Mythsmith

### Dream Biome System
8 procedural biomes selected by emotional state:
- Fracture Fields (shame + anger)
- Water Archives (grief + coherence)
- Spiral Gardens (curiosity + awe)
- Static Cathedrals (high structure)
- Echo Deserts (low arousal)
- Convergence Storms (full moon + chaos)
- Void State (baseline)
- Radiant Core (joy + hope)

---

## 🔬 Recovery Tools (Pattern Training Mode)

### 1. Hazard Pull
Simulates **craving mechanics**:
- Tiles exert magnetic attraction
- Proximity increases intensity
- Visual screen drift shows pull
- Player must consciously resist

**Teaches:** Cravings are observable, distance weakens pull

### 2. Impulse Buffer
Requires **sustained intent** for hazard tiles:
- 1-second hold to confirm harmful moves
- Progress bar shows delay
- Instant movement for healthy choices

**Teaches:** Space between urge and action

### 3. Consequence Preview
Shows **future state** before choice:
- Ghost path 3 moves ahead
- HP projection
- Emotional field changes
- Cascade effect visualization

**Teaches:** Actions have predictable outcomes

### 4. Pattern Echo
Highlights **repetitive loops**:
- Detects 3-5 move sequences
- Visual trail shows stuck pattern
- Gentle awareness message

**Teaches:** Repetition becomes visible

### 5. Route Alternatives
Suggests **different paths** when stuck:
- 3 alternative routes highlighted
- Color-coded options
- Encourages flexibility

**Teaches:** Multiple solutions exist

### 6. Relapse Compassion
**Non-punitive** pattern break response:
- Small consequence, not catastrophic
- Immediate re-choice opportunity
- Nearby recovery tile spawns
- Kind messaging

**Teaches:** Slip ≠ failure, recovery is close

### 7. Threshold Monitor
Tracks **close calls**:
- Near-hazard proximity detection
- Accumulated risk awareness
- No blocking, just data

**Teaches:** Near-misses matter

---

## 🛡️ Accessibility Features

### Visual
- High Contrast Mode
- Symbol overlays (not color-reliant)
- Adjustable particle intensity
- Custom color palettes (future)

### Gameplay
- **Stillness Mode** (no enemies, exploration only)
- Intensity slider (0.5x - 1.5x)
- Auto-softening at high distortion
- Pause anywhere, anytime

### Neurodivergent-Friendly
- No irreversible mistakes
- No punishment spirals
- Clear session boundaries
- Auto-save every 60 seconds
- Recap on return

### Safety Boundaries
- "This is a simulation" framing
- No fate/prediction language
- All adaptive features labeled "algorithmic"
- Designer Mode clearly marked "sandbox"
- Optional session time limits

---

## 📊 Cessation Machine Features

### Session Awareness
- Gentle warnings at 20/45/90 minutes
- No shame, just information
- "Consider taking a break"

### Fatigue System
- Rewards decrease after 30 minutes
- Diminishing returns encourage natural stops
- Never blocking, just feedback

### Pause Rewards
- Rest 10+ min → +10 Max HP
- Rest 60+ min → +2 Insight Tokens
- **Rewards stopping, not playing**

### Completion Bonuses
- Save & Exit → +10% bonus
- Natural break points highlighted
- No penalty for leaving

### Craving Detection
- Monitors return patterns
- 3 quick returns → awareness message
- Suggests 15-minute alternative
- Never blocking, just noticing

### Exit Rituals
- 30-second wind-down phase
- Session summary stats
- Kind affirmation message
- Gradual fade, not abrupt cut

---

## 🗂️ Project Structure

```
src/
├── core/               Foundational systems
│   ├── constants.js    Tile types, colors, configs
│   ├── utils.js        Helper functions
│   ├── emotional-engine.js
│   ├── temporal-system.js
│   ├── archetype-system.js
│   ├── biome-system.js
│   └── pattern-recognition.js
│
├── systems/            Gameplay mechanics
│   ├── grid-generation.js
│   ├── tile-system.js
│   ├── player-movement.js
│   ├── enemy-ai.js
│   ├── boss-system.js
│   ├── particle-system.js
│   └── combat-system.js
│
├── dreamscapes/        10 level definitions
│   ├── void.js
│   ├── dragon-realm.js
│   ├── courtyard.js
│   ├── leaping-field.js
│   ├── summit.js
│   ├── neighborhood.js
│   ├── bedroom.js
│   ├── aztec.js
│   ├── orb-escape.js
│   └── integration.js
│
├── ui/                 Rendering & interface
│   ├── draw-game.js
│   ├── draw-hud.js
│   ├── draw-menus.js
│   ├── draw-guide.js
│   ├── tutorial.js
│   └── mobile-controls.js
│
├── progression/        Meta systems
│   ├── upgrade-shop.js
│   ├── high-scores.js
│   ├── session-manager.js
│   └── save-system.js
│
├── recovery/           Addiction recovery tools
│   ├── hazard-pull.js
│   ├── impulse-buffer.js
│   ├── consequence-preview.js
│   ├── pattern-echo.js
│   ├── route-discovery.js
│   ├── relapse-compassion.js
│   └── threshold-monitor.js
│
└── accessibility/      Inclusive design
    ├── settings.js
    ├── intensity-control.js
    ├── high-contrast.js
    ├── stillness-mode.js
    └── safety-boundaries.js
```

---

## 🎯 Design Philosophy

### Invisible Learning
Every mechanic teaches a real-world skill:
- **Grammar** (symbol syntax rules)
- **Mathematics** (Fibonacci scaling, proportional growth)
- **Physics** (momentum, energy conservation)
- **Psychology** (pattern → consequence)
- **Neuroscience** (attention, regulation, executive function)

**Without ever feeling like a textbook.**

### Pattern Literacy
The game trains:
- Sequence recognition
- Causal prediction
- Alternative generation
- Loop detection
- Flexible responding

**Core skills for addiction recovery, packaged as gameplay.**

### Compassionate Design
- No shame spirals
- No punishment for breaks
- Rewards healthy boundaries
- Meets people where they are
- Explicit safety framing

---

## 🔧 Development

### Adding a New Dreamscape

1. Create `src/dreamscapes/your-dreamscape.js`:
```javascript
export const YOUR_DREAMSCAPE = {
  id: 'unique_id',
  name: 'DREAMSCAPE NAME',
  subtitle: 'short description',
  matrixDefault: 'B',
  bgColor: '#hex',
  bgAccent: '#hex',
  emotion: 'primary_emotion',
  archetype: 'archetype_id',
  hazardSet: [T.DESPAIR, T.TERROR],
  hazardCounts: [4, 3],
  specialTiles: [T.ARCH],
  enemyBehavior: 'wander',
  enemyCount: 3,
  environmentEvent: 'event_name',
  narrative: 'entry text',
  completionText: 'exit text',
};
```

2. Add to `src/dreamscapes/index.js`

3. Implement environment event in `src/systems/grid-generation.js`

### Adding a New Archetype

1. Edit `src/core/archetype-system.js`:
```javascript
export const ARCHETYPES = {
  new_arch: {
    name: 'New Archetype',
    color: '#hex',
    stability: 0.7,
    shadow: 'Shadow Form',
    power: 'power_id',
  },
};
```

2. Implement power in `src/systems/player-movement.js`

### Adding a Recovery Tool

1. Create `src/recovery/your-tool.js`
2. Export init/update/draw functions
3. Import in `src/main.js`
4. Add toggle in `src/accessibility/settings.js`

---

## 📈 Performance

### Target
- 60 FPS on desktop
- 30-60 FPS on mobile (depends on device)
- <3MB build size
- Offline-capable (PWA)

### Optimization Tips
- Disable particles on mobile: `CFG.particles = false`
- Reduce grid size: `CFG.gridSize = 'small'`
- Lower intensity: `CFG.intensityMul = 0.7`

---

## 🐛 Troubleshooting

### Game won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build fails
```bash
# Check Node version (need v18+)
node --version

# Update Vite
npm install vite@latest
```

### Mobile controls not showing
- Check browser window size
- Try landscape orientation
- Refresh page

---

## 📜 License

MIT License - Use freely, attribute appropriately

---

## 🙏 Credits

**Design:** Pattern recognition training based on cognitive-behavioral therapy principles  
**Inspiration:** Mass Effect (consequences), Fable (moral systems), Elder Scrolls (emergent exploration)  
**Philosophy:** Harm reduction, compassionate design, boundary modeling

---

## 🔮 Roadmap

### v5.1 (Next)
- [ ] Sound system (ambient + effects)
- [ ] Additional archetypes (5 more)
- [ ] Custom biome editor
- [ ] Export/import save files

### v6.0 (Future)
- [ ] Multiplayer resonance field
- [ ] Community dreamscape sharing
- [ ] Advanced analytics dashboard
- [ ] Native iOS/Android apps

---

## 💬 Support

For questions, suggestions, or recovery resource recommendations:
- Open an issue on GitHub
- Email: [your-email]

**Remember:** This is a tool, not treatment. If struggling with addiction, please seek professional support.

---

**Play well. Rest well. Notice the patterns.**
