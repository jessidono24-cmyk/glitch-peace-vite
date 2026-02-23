# GLITCH·PEACE Repository Structure

## Overview

This repository contains the GLITCH·PEACE consciousness engine - a transformative tool for awakening, learning, and healing.

## Directory Structure

```
glitch-peace/
│
├── docs/                           # 📚 Blueprint Materials (SACRED - Source of Truth)
│   ├── ARCHITECTURE.md            # System architecture and vision
│   ├── CANON.md                   # Design laws and source of truth
│   ├── AGENT_TASKS.md             # Task queue and implementation guide
│   └── QUICKSTART.md              # Getting started guide
│
├── src/                            # 💻 Game Source Code
│   │
│   ├── main.js                    # 🎯 Entry point, game loop, state machine
│   │
│   ├── core/                      # ⚙️ Core Engine
│   │   ├── constants.js          # All tile types, colors, configs
│   │   ├── state.js              # Runtime state management
│   │   ├── utils.js              # Math and utility functions
│   │   └── storage.js            # Save/load persistence
│   │
│   ├── game/                      # 🎮 Core Gameplay
│   │   ├── grid.js               # Level generation (Fibonacci)
│   │   ├── player.js             # Movement and interactions
│   │   ├── enemy.js              # AI behaviors
│   │   └── particles.js          # Visual effects
│   │
│   ├── ui/                        # 🎨 User Interface
│   │   ├── renderer.js           # Canvas rendering + HUD
│   │   └── menus.js              # All screen states
│   │
│   ├── systems/                   # 🧠 Consciousness Systems
│   │   ├── emotional-engine.js   # ✅ 10-emotion field system
│   │   ├── temporal-system.js    # ✅ Lunar/weekday harmonics
│   │   │
│   │   ├── learning/             # 📖 Learning Acceleration
│   │   │   ├── language/        # Language acquisition
│   │   │   ├── mathematics/     # Mathematical thinking
│   │   │   └── meta-learning/   # Learning how to learn
│   │   │
│   │   ├── cessation/            # 🌱 Addiction Cessation
│   │   │   └── README.md        # Session tracking, urge management
│   │   │
│   │   ├── awareness/            # 🧘 Consciousness Emergence
│   │   │   └── README.md        # Self-reflection, presence, awakening
│   │   │
│   │   └── cosmology/            # 🌌 Wisdom Traditions
│   │       └── README.md        # Chakras, Tarot, I-Ching, etc.
│   │
│   ├── recovery/                  # 🛡️ Pattern Recognition
│   │   ├── impulse-buffer.js     # ✅ Hazard prevention
│   │   └── consequence-preview.js # ✅ Future projection
│   │
│   ├── audio/                     # 🔊 Sound Engine
│   │   └── sfx-manager.js        # ✅ Procedural audio
│   │
│   ├── intelligence/              # 🎓 IQ/EQ Enhancement
│   │   ├── cognitive/            # IQ development
│   │   ├── emotional/            # EQ development
│   │   └── README.md
│   │
│   └── integration/               # 🔗 Synthesis Layer
│       └── README.md             # Dashboard, journal, transformation map
│
├── public/                         # 🖼️ Static Assets (to be created)
│   └── (images, fonts, etc.)
│
├── tests/                          # ✅ Test Files (to be created)
│   └── (unit and integration tests)
│
├── tools/                          # 🔧 Development Tools (to be created)
│   └── (build scripts, utilities)
│
├── index.html                      # 🌐 Entry HTML
├── vite.config.js                  # ⚡ Build configuration
├── package.json                    # 📦 Dependencies
├── .gitignore                      # 🚫 Ignored files
│
└── README.md                       # 📘 You are here
```

## Implementation Status

### ✅ Complete (Phases 1-5)
- **Phase 1**: Base game mechanics
- **Phase 2**: Emotional engine
- **Phase 3**: Temporal system
- **Phase 4**: Pattern recognition
- **Phase 5**: Audio engine

### 🔲 Planned (Phases 6-10+)
- **Phase 6**: Learning systems (language, mathematics)
- **Phase 7**: Cessation tools (addiction support)
- **Phase 8**: Awareness features (consciousness awakening)
- **Phase 9**: Intelligence enhancement (IQ/EQ)
- **Phase 10**: Cosmology integration (wisdom traditions)
- **Phase 11+**: Integration dashboard and synthesis

## Code Statistics

- **Current**: ~5,000 lines across 16 files
- **Target**: 20,000+ lines for full vision
- **Growth**: 4x expansion planned

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Documentation

- **Vision**: See `docs/ARCHITECTURE.md`
- **Design Laws**: See `docs/CANON.md`
- **Task Queue**: See `docs/AGENT_TASKS.md`
- **Getting Started**: See `docs/QUICKSTART.md`

## System READMEs

Each subsystem has its own README:
- `src/systems/learning/README.md` - Learning acceleration
- `src/systems/cessation/README.md` - Addiction cessation
- `src/systems/awareness/README.md` - Consciousness awakening
- `src/systems/cosmology/README.md` - Wisdom traditions
- `src/intelligence/README.md` - IQ/EQ enhancement
- `src/integration/README.md` - Synthesis layer

## Development Principles

1. **Baby Steps**: Small, verified changes only
2. **Documentation First**: Document before implementing
3. **Test Thoroughly**: Verify each change
4. **Respect CANON**: docs/CANON.md is source of truth
5. **No Dogma**: Sterilized wisdom, simulation framing
6. **Accessibility**: Everyone can play and learn
7. **Privacy**: Player data stays with player

## Contributing

When adding new features:
1. Read `docs/CANON.md` first
2. Check `docs/ARCHITECTURE.md` for vision alignment
3. Follow task queue in `docs/AGENT_TASKS.md`
4. Document in appropriate README
5. Test before committing
6. Small, focused commits

## License

See LICENSE.md

## Vision

GLITCH·PEACE is a consciousness-awakening tool that helps players:
- 🌟 Awaken to deeper awareness
- 🌱 Break free from addictive patterns
- 📚 Accelerate learning (language, mathematics)
- 🧠 Strengthen intelligence (IQ and EQ)
- 🕉️ Explore wisdom traditions
- 🔄 Integrate insights into life

Through gentle stress inoculation and immersive gameplay, players build resilience, awareness, and wisdom.

---

**Remember**: The docs/ folder contains the vision. When in doubt, refer there.
