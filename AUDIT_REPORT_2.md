# AUDIT_REPORT_2

Audit basis: static import-chain walk starting at `src/main.js` (current entrypoint) plus direct loop/phase usage checks in `src/main.js`.

- `src/*.js` files found: **122**
- Reachable from `src/main.js`: **70**
- Not reachable from `src/main.js`: **52**

Only items reachable from `src/main.js` and producing browser-visible behavior are counted as implemented.

---

## 1) ACTUALLY IMPLEMENTED

- **`src/main.js`** — Initializes full-viewport canvas, game loop, phase state machine, input handling, and runtime mode switching that is visibly rendered in the browser.
- **`src/ui/menus.js`** — Renders title/options/dream-select/campaign/memory-slot/play-mode/cosmology selection screens that are shown during menu phases.
- **`src/ui/renderer.js`** — Draws the active gameplay scene, overlays, mode labels, and effect layers during play.
- **`src/ui/hud.js`** — Updates the on-screen HUD with health/score/level and mode-specific status every frame.
- **`src/game/grid.js`** — Builds dreamscape tile grids and spawns gameplay tiles that appear directly on the playfield.
- **`src/game/player.js`** — Executes movement, tile interactions, archetype activation, and gameplay feedback messages visible during play.
- **`src/game/enemy.js`** — Advances enemy behavior in live gameplay and affects what the player sees on the board.
- **`src/systems/play-modes.js`** — Applies mode modifiers that visibly alter grid behavior (e.g., mode-specific tile/environment transformations).
- **`src/systems/awareness/dream-yoga.js`** — Runs lucidity/reality-check progression and feeds dream-yoga state used by visible UI overlays.
- **`src/systems/awareness/emergence-indicators.js`** — Tracks emergence progress and drives visible emergence flashes/labels exposed to the renderer.
- **`src/systems/cosmology/chakra-system.js`** — Updates chakra openness/dominance state and triggers chakra awakening visual feedback.
- **`src/systems/achievements.js`** — Processes unlock conditions and powers visible achievement popups.
- **`src/audio/sfx-manager.js`** — Plays menu/gameplay sound effects tied to interactions (collect, damage, level-up, etc.).
- **`src/audio/music-engine.js`** — Runs adaptive background music that changes with emotion/game mode during runtime.
- **`src/modes/mode-manager.js`** — Dispatches registered non-grid mode instances (shooter/constellation/meditation/coop/rhythm) into active runtime flow.

---

## 2) CODE EXISTS BUT BROKEN/UNWIRED

These files contain real logic but are not import-reachable from `src/main.js`, so they never execute in the current runtime.

- **`src/systems/integration/progress-dashboard.js`** — Dashboard rendering logic exists, but no current import/call path draws it; needs import from `src/main.js` and invocation in an active render phase.
- **`src/systems/leaderboard.js`** — Leaderboard state/UI logic exists, but it is never imported by the active entrypoint; needs wiring into menu flow and persistence hooks.
- **`src/systems/cosmology/tarot-archetypes.js`** — Extended tarot archetype logic exists, but the `main.js` tarot import path is currently reserved/commented; needs active import and call sites during archetype selection.
- **`src/core/game-engine/GameStateManager.js`** — Engine-level state orchestration exists, but the live app uses direct state flow in `src/main.js`; needs replacement/refactor of current loop to route through this manager.
- **`src/core/game-engine/InputManager.js`** — Centralized input abstraction exists, but `src/main.js` currently handles keyboard/gamepad directly; needs event binding delegation and consumer migration.
- **`src/modes/grid-mode.js`** — Alternate grid mode class has logic but is not instantiated from current mode-selection/runtime wiring; needs registration and dispatch from the active mode manager path.
- **`src/gameplay-modes/constellation/Constellation3DMode.js`** — 3D constellation mode logic exists but is disconnected from current runtime imports; needs mode registration plus rendering/canvas ownership wiring.
- **`src/gameplay-modes/constellation/ConstellationMode.js`** — Parallel constellation implementation exists in this folder but current runtime uses `src/modes/constellation-mode.js`; needs consolidation or explicit routing.
- **`src/services/apiAgents.js`** — Generative API agent service logic exists but no runtime call path in `src/main.js` uses it; needs UI trigger + environment key handling + async integration points.
- **`src/systems/recovery-tools.js`** — Recovery utility systems exist in this legacy module path, but active runtime uses other systems folders; needs import-chain wiring or archival removal.

---

## 3) DOCUMENTED ONLY

Items below are documented in markdown but have no corresponding code feature in `src/` (no import chain and no source matches for the topic terms used here).

- **`docs/research/biology/chronobiology.md`** — Chronobiology research notes exist, but no chronobiology mechanic/system is implemented in runtime code.
- **`docs/research/biology/extremophiles.md`** — Extremophile concept documentation exists, but no extremophile gameplay/content system exists in `src/`.
- **`docs/research/neuroscience/bioelectric-fields.md`** — Bioelectric-fields theory is documented, but there is no code module implementing it as a game mechanic.
- **`docs/research/neuroscience/somatic-fascia.md`** — Somatic-fascia research exists in docs only, with no corresponding executable feature.
- **`docs/research/synthesis/MULTIDIMENSIONAL_INTEGRATION.md`** — Multidimensional integration plan exists in docs, but no dedicated implementation module is wired.
- **`docs/CREATIVITY_CHANNEL.md`** — Creativity-channel concept is documented, but no named creativity-channel runtime system is present.

---

### Notes

- This report intentionally applies your rule: if a module is not reachable from `src/main.js`, it is not counted as implemented.
- “Unwired” above means **currently unreachable in the active app entrypoint**, even if code quality inside the file is good.