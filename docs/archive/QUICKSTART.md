# GLITCH·PEACE — QUICKSTART

## Install & Run

```bash
cd glitch-peace-vite
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Build

```bash
npm run build
# output in dist/
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| SHIFT | Toggle Matrix A/B |
| J | Archetype power (when active) |
| R | Glitch Pulse (when charged) |
| Q | Freeze enemies (if unlocked) |
| C | Containment zone (costs 2 ◆) |
| ESC | Pause |
| H | (reserved for field guide, Phase 2) |

## File Map

```
src/
  main.js              ← state machine + game loop (start here)
  core/
    constants.js       ← ALL tile types, colors, configs
    state.js           ← runtime state, upgrades, phase
    utils.js           ← math helpers
    storage.js         ← save/load
  game/
    grid.js            ← level generation
    player.js          ← movement + tile interactions
    enemy.js           ← AI behaviors
    particles.js       ← VFX
  ui/
    renderer.js        ← canvas draw (game + HUD)
    menus.js           ← all screens
```

## Expansion Hooks

Every file has `// 🔌 LAYER N EXPANSION:` comments marking where new systems plug in.

See `AGENT_TASKS.md` for the prioritized task queue.
See `CANON.md` for design laws and source of truth.
