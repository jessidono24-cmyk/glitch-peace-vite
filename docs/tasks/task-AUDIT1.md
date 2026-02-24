# Task AUDIT1 — Full Codebase Deduplication + Archive Rename + README Sync

## Goal
Scan every file and folder in the repo. Find all duplicates and merge them.
Rename _archive to make its purpose clear. Update README to reflect all
completed work. Improve wiring clarity without breaking anything.

## Definition of Done
- [ ] `npm run build` passes before AND after
- [ ] No duplicate files exist anywhere in the repo
- [ ] `_archive/` renamed to `old-game-archive/` with explanation in its README
- [ ] `docs/archive/` remains as the doc archive (different purpose — stays)
- [ ] One README.md at root reflecting all completed tasks
- [ ] No duplicate README files elsewhere in repo
- [ ] One playwright.config.js
- [ ] One package.json (root only)
- [ ] One index.html (root only — temp_index.html merged or deleted)
- [ ] All test files consolidated under `tests/`
- [ ] All task .md files consolidated under `docs/tasks/`
- [ ] Duplicate source files in src/ identified and merged

---

## Step 1 — Full file audit

```bash
# Count total files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" -type f | wc -l

# Find all README files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -iname "readme*" | sort

# Find all package.json files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "package.json" | sort

# Find all index.html files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "index.html" -o -name "temp_index.html" | sort

# Find all playwright config files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "playwright*" | sort

# Find all main.js files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "main.js" | sort

# Find all renderer.js files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "renderer.js" | sort

# Find all menus.js files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "menus.js" | sort

# Find all state.js files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "state.js" | sort

# Find ALL .js files outside src/ tests/ tools/ electron/ (could be misplaced)
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -not -path "*/src/*" -not -path "*/tests/*" -not -path "*/tools/*" \
  -not -path "*/electron/*" -not -path "*/old-game-archive/*" \
  -name "*.js" | sort

# Find all playtest files
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "playtest*" | sort

# Find duplicate .md files (same name in different locations)
find . -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -name "*.md" | xargs -I{} basename {} | sort | uniq -d
```

---

## Step 2 — Rename _archive to old-game-archive

```bash
# Check what's in _archive first
ls _archive/ | head -20
echo "---"
ls _archive/ | wc -l

# Rename it
mv _archive old-game-archive

# Add a README inside so its purpose is permanently clear
cat > old-game-archive/README.md << 'EOF'
# Old Game Archive

This folder contains all previous versions of GLITCH·PEACE built before
the current v4 Vite modular architecture.

These are preserved for reference only. Do NOT import from these files.
The active codebase is entirely in src/.

Contents include earlier Canvas experiments, prototype game loops,
and abandoned approaches that informed the current design.

Last updated: 2026-02-23
EOF

# Update vite.config.js if it references _archive
grep -n "_archive" vite.config.js && \
  sed -i 's/_archive/old-game-archive/g' vite.config.js && \
  echo "Updated vite.config.js" || echo "vite.config.js: no _archive reference"

# Update .gitignore if it references _archive
grep -n "_archive" .gitignore && \
  sed -i 's/_archive/old-game-archive/g' .gitignore && \
  echo "Updated .gitignore" || echo ".gitignore: no _archive reference"
```

---

## Step 3 — Handle temp_index.html

```bash
# Compare temp_index.html with index.html
diff index.html temp_index.html

# If temp_index.html has content NOT in index.html, merge the unique parts
# If it's a subset or duplicate, delete it
# After inspection:
cat temp_index.html  # read it

# If it's safe to remove:
# git rm temp_index.html
# If it has unique content, merge manually then remove
```

**Rule**: There should be exactly ONE index.html at root. 
If temp_index.html was a backup, delete it.
If it has unique content (like a different loading screen), 
merge the best parts into index.html then delete temp_index.html.

---

## Step 4 — Consolidate duplicate README files

```bash
# Read each README found in Step 1
# For each non-root README:
# - If it's inside old-game-archive/ — leave it (that's its own context)
# - If it's inside a src/ subdirectory — check if it's a module readme
# - If it duplicates root README content — delete it
# - If it has unique content — move that content into docs/ then delete

# The ONE canonical README is at root: README.md
# All others should be deleted or moved to docs/
```

---

## Step 5 — Merge duplicate test files

```bash
# List all test files
find tests/ -type f | sort

# Check for duplicates with similar names
ls tests/
```

Rules:
- `tests/smoke.spec.js` — keep (quick sanity check)
- `tests/modes.spec.js` — keep (mode-specific tests)
- `tests/playtest-full.js` — keep (PLAYTEST1)
- `tests/playtest-deep.js` — keep (PLAYTEST2/3)
- `tests/playtest-combo.js` — keep (PLAYTEST4)
- Any file that duplicates another test file's content → merge into the more complete one, delete the duplicate

---

## Step 6 — Audit src/ for duplicate logic

```bash
# Find functions defined in multiple files
grep -rn "^function \|^export function \|^const.*= function\|^export const.*=.*=>" src/ | \
  awk -F: '{print $NF}' | sort | uniq -d | head -20

# Find duplicate imports
grep -rn "^import" src/ | awk '{print $NF}' | sort | uniq -d | head -20

# Specific known potential duplicates:
grep -rn "drawHUD\|drawBackground\|drawTiles\|drawPlayer\|drawEnemy" src/ | \
  grep "function\|= (" | head -20
```

For each duplicate function found:
1. Identify which file is the canonical location
2. Remove the duplicate definition
3. Add an import if the function is needed elsewhere
4. Verify build still passes

---

## Step 7 — Consolidate docs/tasks/

```bash
# Move any task files still at root to docs/tasks/
find . -maxdepth 1 -name "task-*.md" -exec mv {} docs/tasks/ \;
find . -maxdepth 1 -name "PLAYTEST*.md" -exec mv {} docs/tasks/ \;

# List what's in docs/tasks/ now
ls docs/tasks/ | sort
```

---

## Step 8 — Write the updated README.md

This README must reflect ALL completed work from this project.

```markdown
# GLITCH·PEACE

**A consciousness engine disguised as a video game.**

> v4 · Vite + Three.js · 12 play modes · 18 dreamscapes · 13 cosmologies · Research-grounded

GLITCH·PEACE is a therapeutic gaming system built on peer-reviewed research in 
psychology, neuroscience, biology, and philosophy. It models consciousness emergence,
emotional regulation, and pattern recognition through play.

---

## Play Modes (12)

| Mode | Description | Status |
|------|-------------|--------|
| Grid Navigator | Tile-based tactical movement — mapping internal terrain | ✅ Complete |
| Twin-Stick Shooter | Confrontation and integration through combat | ✅ Complete |
| First Person | Full immersion 3D corridors through dreamscapes | ✅ Added |
| Narrative RPG | Identity formation through story and choice | ✅ Complete |
| Constellation | Connect stars correctly to pass levels | ✅ Complete |
| Meditation | Stillness, breath, presence, particle visualization | ✅ Complete |
| Rhythm | Music theory drills, ear training, entrainment | ✅ Complete |
| Alchemy | Rustic chem lab — transmutation of old patterns | ✅ Complete |
| Ornithology | Bird watching with real species, awe/dread effects | ✅ Complete |
| Mycology | Fungal networks — hub-based foraging, perceived effects | ✅ Complete |
| Architecture | Construction, Engineering, Sacred Geometry, Crafts, AI Design | ✅ Complete |
| Learning Hub | Language, Mathematics, Physics, Biology, Psychology, and more | ✅ Added |

---

## Dreamscapes (18)
Void State · Mountain Dragon Realm · Mountain Courtyard of Ojos · Leaping Field ·
Mountain Summit Realm · Childhood Neighborhood · The Bedroom · Aztec Dreamscape ·
Orb Escape · Integration · Crystal Cavern · Ocean Deep · Forest Cathedral ·
Desert Mirage · Sky Temple · Underground Network · Starfield Nexus · Hearthspace

## Cosmologies (13)
None · Seven Energy Fields (Hindu) · Cycle of Attachment (Buddhist) ·
The Uncarved Block (Taoist) · Field of Polarity (Hermetic) · Nine Realm Tree (Norse) ·
Veil Crossing (Celtic) · Order vs Entropy (Gnostic) · Seven Universal Laws (Hermetic) ·
Five Relations (Confucian) · The Duat (Egyptian) · Tzolk'in Cycles (Mayan) ·
Book of Changes (I Ching)

---

## Completed Work

### Foundation
- ✅ W1/W2 — EventBus wiring
- ✅ FIX1-7 — Canvas fullscreen, font floor, grid isolation, README
- ✅ ARCH1-5 — Core architecture refactor

### Stability
- ✅ STABLE1 — Grid mode rendering isolation
- ✅ STABLE2 — [object Object] bug fixed, HUD declutter
- ✅ STABLE3 — Full screen canvas, readable fonts

### UI
- ✅ UI1 — Full screen + Share Tech Mono font + loading screen
- ✅ UI2 — Main menu restructure + 3 memory slots
- ✅ UI3 — Nav flow fixed, playstyle removed from pre-game, cosmology descriptions
- ✅ UI4 — Alchemy freeze fixed, ornithology/mycology screen fixes

### Visual Identity
- ✅ VIS1 — Every mode has distinct visual identity, grid tiles isolated

### Testing
- ✅ PLAYTEST1 — Basic integration test
- ✅ PLAYTEST2 — Deep test: all modes, dreamscapes, cosmologies (0 failures)
- ✅ PLAYTEST3 — Fix loop complete (0 failures)
- ✅ PLAYTEST4 — Combinatorial test: all modes × dreamscapes × cosmologies

### Research
- ✅ RESEARCH1 — All research consolidated into docs/research/
- ✅ RESEARCH2 — 10+ sources per field, mechanic map complete

### New Features
- ✅ MODES1 — FPS mode, constellation fix, awe effects, music theory, alchemy lab, architecture sub-modes, learning hub

### Organization
- ✅ CLEANUP1 — Repo root clean, research consolidated
- ✅ AUDIT1 — Full deduplication, archive renamed, README synced

---

## Architecture

```
src/
├── main.js              # State machine, game loop, input
├── core/
│   ├── constants.js     # Tile types, colors, archetypes, dreamscapes
│   ├── state.js         # Runtime state
│   ├── storage.js       # 3-slot save system
│   └── utils.js         # Math helpers
├── game/
│   ├── grid.js          # Grid generation, Fibonacci scaling
│   ├── player.js        # Movement, tile interactions, archetype powers
│   ├── enemy.js         # 9 AI behavior types
│   └── particles.js     # VFX
├── modes/               # One file per game mode
│   ├── fps-mode.js
│   ├── constellation-mode.js
│   ├── ornithology-mode.js
│   ├── mycology-mode.js
│   ├── rhythm-mode.js
│   ├── alchemy-mode.js
│   ├── architecture-mode.js
│   └── learning-hub-mode.js
└── ui/
    ├── renderer.js      # Canvas draw — mode backgrounds + HUD
    └── menus.js         # All menu screens

docs/
├── research/            # Peer-reviewed sources (10-30 per field)
├── vision/              # CANON.md, GAMEPLAY_MODES.md, VISION.md
├── tasks/               # All agent task files
└── archive/             # Superseded design docs

old-game-archive/        # Pre-v4 game versions (reference only)
tests/                   # Playwright test suite
```

---

## Development

```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
npm install
npm run dev
# Opens at http://localhost:3001
```

## Research Foundation
All game mechanics are mapped to peer-reviewed research.
See `docs/research/INDEX.md` and `docs/research/synthesis/MECHANIC_MAP.md`.

## License
MIT
```

---

## Step 9 — Final verification

```bash
# Build must pass
npm run build && echo "✅ BUILD OK"

# Confirm no _archive reference in codebase
grep -rn "_archive" . --include="*.js" --include="*.json" --include="*.html" | \
  grep -v node_modules | grep -v .git | grep -v old-game-archive

# Confirm no temp_index.html
ls temp_index.html 2>/dev/null && echo "⚠️ temp_index.html still exists" || echo "✅ temp_index.html removed"

# Confirm single README at root
find . -maxdepth 1 -name "README.md" | wc -l

# Confirm docs/tasks exists and has content
ls docs/tasks/ | wc -l
```

## Commit message
```
chore: AUDIT1 -- full dedup, _archive renamed to old-game-archive, README synced with all completed tasks
```
