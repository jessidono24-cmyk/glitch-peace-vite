# Task CLEANUP1 — Repo Organization: One Research Folder, Clean Root

## Goal
The repo root has 50+ loose .md files, two separate research folders,
and 69 branches. This task organizes everything without breaking any code.

## Definition of Done
- [ ] `npm run build` passes before AND after
- [ ] All research-related docs consolidated into `docs/research/`
- [ ] All loose .md files at root moved to `docs/archive/` or `docs/`
- [ ] `docs/research/INDEX.md` lists every research file
- [ ] Root contains ONLY: src/, docs/, tests/, tools/, public/, electron/,
      index.html, package.json, vite.config.js, playwright.config.js,
      README.md, .gitignore, .env.example
- [ ] No code files touched — only doc reorganization
- [ ] GitHub README updated to show current game description

## Step 1 — Audit what exists

```bash
# See all loose files at root
ls -la *.md | wc -l

# Find all research folders
find . -type d -name "research" | grep -v node_modules | grep -v .git

# List existing docs structure
find docs/ -type f | sort

# List what's in each research folder
find . -path "*/research/*" -type f | grep -v node_modules | grep -v .git | sort
```

## Step 2 — Create clean docs structure

```bash
mkdir -p docs/research/psychology
mkdir -p docs/research/neuroscience
mkdir -p docs/research/biology/mycology
mkdir -p docs/research/biology/ornithology
mkdir -p docs/research/biology/chronobiology
mkdir -p docs/research/physics
mkdir -p docs/research/chemistry
mkdir -p docs/research/architecture
mkdir -p docs/research/engineering
mkdir -p docs/research/language-learning
mkdir -p docs/research/meteorology
mkdir -p docs/research/archaeology
mkdir -p docs/research/sociology
mkdir -p docs/research/philosophy
mkdir -p docs/research/cosmologies
mkdir -p docs/research/game-development
mkdir -p docs/research/synthesis
mkdir -p docs/archive
mkdir -p docs/tasks
mkdir -p docs/vision
```

## Step 3 — Move existing research docs

```bash
# Find and move all research-type docs
# Check root for research files first
for f in PSYCHOLOGY_FOUNDATIONS.md COGNITIVE_ARCHITECTURE.md EMBODIMENT.md \
          EFFORTLESS_LEARNING.md RESEARCH_INTEGRATION.md COMPREHENSIVE_RESEARCH_SESSION.md \
          MULTIDIMENSIONAL_INTEGRATION.md INTEGRATION_MAP.md INTEGRATION_PLAN.md; do
  [ -f "$f" ] && mv "$f" docs/research/synthesis/ && echo "Moved $f"
done

# Move vision/design docs to docs/vision/
for f in CANON.md GAMEPLAY_MODES.md ARCHITECTURE.md ROADMAP.md FEATURES.md \
          GAME_PLAN.md VISION.md MCA_SovereignCodex_Export.md SOVEREIGN_CODEX.md \
          GAMEPLAY_MODES_SESSION.md; do
  [ -f "$f" ] && mv "$f" docs/vision/ && echo "Moved $f"
done

# Move task docs
for f in task-*.md AGENT_TASKS.md; do
  [ -f "$f" ] && mv "$f" docs/tasks/ && echo "Moved $f"
done

# Move all remaining loose .md files to archive
for f in *.md; do
  [ -f "$f" ] && [ "$f" != "README.md" ] && mv "$f" docs/archive/ && echo "Archived $f"
done
```

## Step 4 — Merge any second research folder

```bash
# If there's a /research folder at root level, merge it:
if [ -d "research" ]; then
  cp -r research/* docs/research/ 2>/dev/null
  echo "Contents of research/ merged into docs/research/"
  # Don't delete yet — verify contents first
fi
```

## Step 5 — Write docs/research/INDEX.md

```bash
cat > docs/research/INDEX.md << 'EOF'
# GLITCH·PEACE Research Index

All research that informs the game's design and mechanics.
Each file maps to specific game systems.

## Structure
- psychology/       — learning, emotion, habit, flow, motivation
- neuroscience/     — brain systems, addiction, embodiment, plasticity
- biology/          — mycology, ornithology, chronobiology
- physics/          — thermodynamics, quantum, mechanics
- chemistry/        — alchemy, transmutation
- architecture/     — design principles, sacred geometry
- engineering/      — systems, cognitive, mechanical
- language-learning/ — acquisition theory, methods
- meteorology/      — weather, atmosphere, climate
- archaeology/      — ancient knowledge systems
- sociology/        — social dynamics, community, culture
- philosophy/       — ethics, consciousness, existence
- cosmologies/      — world traditions, sacred texts, belief systems
- game-development/ — game design research, UX, player psychology
- synthesis/        — cross-domain integration notes

## Minimum Standard
Every subdirectory must contain at least 10 empirically sourced references.
Maximum 30 references per subdirectory for now.

## Gap Definition
A research gap exists when:
1. A game mechanic exists with no documented research basis
2. A research area relevant to the game has fewer than 10 sources
3. A claim is made in the game design without a cited source

## File Naming
[topic]-[subtopic].md
Example: neuroscience/dopamine-reward-timing.md
EOF
```

## Step 6 — Update README.md

The README should auto-reflect the current state of the game.
Write a new README.md at root:

```markdown
# GLITCH·PEACE

**A consciousness engine disguised as a video game.**

> v4 · Vite modular · 11 play modes · 18 dreamscapes · 13 cosmologies

GLITCH·PEACE is a therapeutic gaming system that models consciousness
emergence, emotional regulation, and pattern recognition through play.
Built on peer-reviewed research in psychology, neuroscience, and biology.

## Play Modes
| Mode | Description |
|------|-------------|
| Grid Navigator | Tile-based tactical movement — mapping the mind |
| Twin-Stick Shooter | Confrontation and integration through combat |
| First Person | Full immersion — you ARE in the experience |
| Narrative RPG | Identity formation through story and choice |
| Constellation | Pattern recognition across a star field |
| Meditation | Stillness, breath, presence |
| Rhythm | Synchronization through music theory |
| Alchemy | Transmutation — old patterns become new |
| Ornithology | Presence and attention through bird watching |
| Mycology | Hidden connection through fungal networks |
| Architecture | Structure, form, and creation |
| Learning Hub | Language, mathematics, science, and more |

## Dreamscapes (18)
Void State · Mountain Dragon Realm · Mountain Courtyard of Ojos ·
Leaping Field · Mountain Summit Realm · Childhood Neighborhood ·
The Bedroom · Aztec Dreamscape · Orb Escape · Integration ·
Crystal Cavern · Ocean Deep · Forest Cathedral · Desert Mirage ·
Sky Temple · Underground Network · Starfield Nexus · Hearthspace

## Cosmologies (13)
None · Seven Energy Fields · Cycle of Attachment · The Uncarved Block ·
Field of Polarity · Nine Realm Tree · Veil Crossing · Order vs Entropy ·
Seven Universal Laws · Five Relations · The Duat · Tzolk'in Cycles ·
Book of Changes

## Development
```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
```

## Research Foundation
All game mechanics are mapped to peer-reviewed research in `docs/research/`.
See `docs/research/INDEX.md` for the full mechanic-to-research map.

## License
MIT
```

## Step 7 — Verify nothing broke

```bash
npm run build
echo "Build status: $?"
```

## Commit message
```
chore: CLEANUP1 repo organization -- one research folder, clean root, updated README
```

## Note for agent
After this task, the repo root should contain ONLY:
src/ docs/ tests/ tools/ public/ electron/
index.html package.json vite.config.js playwright.config.js
README.md .gitignore .env.example

If any of those files are missing from root after cleanup, do NOT delete
the originals from archive yet — restore them first.
