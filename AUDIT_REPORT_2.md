# AUDIT_REPORT_2.md

Audit basis:
- Reachability is determined from `src/main.js` import chain (static imports + dynamic `import()` targets resolvable at build time).
- “Implemented” means both reachable from `src/main.js` and currently capable of visible browser output.
- “Broken/Unwired” means real logic exists but is not reached from `src/main.js` runtime flow.

## HOW TO RUN

- Dev server: `npm run dev`
  - Output appears in terminal (Vite startup logs), then in browser at the local URL Vite prints (typically `http://localhost:5173`).
  - Runtime visuals appear in the browser canvas (menus/hub/gameplay), with console logs in browser DevTools.
- Production build: `npm run build`
  - Output appears in terminal build logs.
  - Bundled assets are written to `dist/`.
- Local preview of build: `npm run preview`
  - Output appears in terminal with a preview URL.
  - Rendered output appears in browser at the preview URL.

## TOP 5 BLOCKERS (RANKED)

1. `src/main.js` — Legacy spine still dominates flow (`title -> memory_select -> modeselect -> dreamselect -> cosmologysel`), so Mooncycle Run is not the canonical default path.
   - Why blocker: prevents required single-spine navigation and keeps legacy mode-select as primary UX.
   - Fix sketch: route fresh start directly to `dreamselect` (Dreamscape Map) and then `lake_hub` entry, keeping `modeselect` behind a dev/backdoor path.

2. `src/main.js` + `src/hub/lakeHub.js` — No always-on DEV truth overlay for phase/stance/runSpec in top-left.
   - Why blocker: wiring bugs are hard to diagnose and requirement explicitly mandates always-visible DEV overlay.
   - Fix sketch: add `src/ui/devOverlay.js` with safe draw function and call it from main draw loop in all phases under `import.meta.env.DEV`.

3. `src/gameplay-modes/ModeRegistry.js` (and `src/gameplay-modes/*/index.js`) — Registry/registration architecture exists but is unreachable from `src/main.js`.
   - Why blocker: mini-game integration is fragmented and duplicated across `modes/` and `gameplay-modes/` with no canonical registry spine.
   - Fix sketch: create a new reachable `src/minigames/MiniGameRegistry.js` and adapt launch/return contracts for all 7 required mini-games.

4. `src/main.js` — Escape/exit behavior returns many modes to `title`, not `lake_hub`.
   - Why blocker: breaks required “launch mini-game from hub -> return to hub -> bank reward” loop.
   - Fix sketch: centralize mini-game exit callback to `setPhase('lake_hub')`, apply reward banking before transition, and remove title fallback for hub-launched runs.

5. `src/ui/menus.js` — Tutorial/how-to-play is a single long page; no shared layout helper preventing overlap across key screens.
   - Why blocker: fails explicit legibility and pagination requirements (including no-overlap constraints).
   - Fix sketch: add shared `src/ui/layout.js` primitives, migrate core menu screens to common stack layout, and split tutorial into paged rendering with next/prev controls.

## ACTUALLY IMPLEMENTED

- File path: `src/main.js`
  - Visible now: Runs the canvas game loop and phase routing that visibly renders onboarding, language options, title, menu screens, lake hub, and gameplay states in browser.

- File path: `src/ui/menus.js`
  - Visible now: Draws all currently reachable menu UIs (onboarding, language, title, mode select, dream select, cosmology select, options, highscores, how-to-play).

- File path: `src/hub/lakeHub.js`
  - Visible now: Renders the Lake Realm hub scene with clickable/hoverable zones and visible zone labels/tooltips.

- File path: `src/core/bootRouter.js`
  - Visible now: Determines whether browser boot lands on onboarding/langopts/title, which changes first visible screen.

- File path: `src/core/runSpecManager.js`
  - Visible now: Persists run data that appears in lake hub header/debug text and updates when portal interactions modify run state.

- File path: `src/game/grid.js`
  - Visible now: Builds the tile map and dreamscape grid content rendered during active grid gameplay.

- File path: `src/game/player.js`
  - Visible now: Processes movement/actions that visibly move the player and trigger on-screen gameplay feedback.

- File path: `src/game/enemy.js`
  - Visible now: Updates enemy behavior that visibly animates/moves hostile entities during play.

- File path: `src/ui/renderer.js`
  - Visible now: Draws live gameplay visuals/effects and dashboard overlay elements in gameplay phases.

- File path: `src/ui/hud.js`
  - Visible now: Displays live HUD values (HP, score, mode state) as visible browser overlay during play.

- File path: `src/modes/constellation-mode.js`
  - Visible now: Constellation mode launches from active selection path and renders playable constellation screen.

- File path: `src/modes/rhythm-mode.js`
  - Visible now: Rhythm mode launches from active selection path and renders note columns/timing gameplay.

- File path: `src/modes/fps-mode.js`
  - Visible now: FPS mode launches from active selection path and renders first-person scene in browser canvas.

- File path: `src/gameplay-modes/alchemy/AlchemyMode.js`
  - Visible now: Alchemy mode is lazy-loaded from runtime selector and renders an alchemy gameplay screen.

- File path: `src/gameplay-modes/architecture/ArchitectureMode.js`
  - Visible now: Architecture mode is lazy-loaded and renders architecture gameplay UI.

- File path: `src/gameplay-modes/mycology/MycologyMode.js`
  - Visible now: Mycology mode is lazy-loaded and renders mycology gameplay UI.

- File path: `src/gameplay-modes/ornithology/OrnithologyMode.js`
  - Visible now: Ornithology mode is lazy-loaded and renders ornithology gameplay UI.

- File path: `src/gameplay-modes/rpg/RPGMode.js`
  - Visible now: RPG mode is lazy-loaded and renders RPG gameplay screen in the browser.

- File path: `src/gameplay-modes/learning-hub/LearningHubMode.js`
  - Visible now: Learning Hub mode is lazy-loaded and renders a learning-hub gameplay UI.

- File path: `src/modes/language-mode.js`
  - Visible now: Language-learning mode initializes and renders language practice UI in browser.

## CODE EXISTS BUT BROKEN/UNWIRED

- File path: `src/gameplay-modes/ModeRegistry.js`
  - Why unwired: never imported from reachable runtime chain; registration side effects do not execute.
  - What would wire it: import a registry bootstrap module from `src/main.js` and use registry lookup for launches.

- File path: `src/gameplay-modes/grid-based/GridGameMode.js`
  - Why unwired: legacy grid path in `src/main.js` uses `src/game/*` directly, not `GridGameMode`.
  - What would wire it: route grid launch through `GridGameMode` adapter in canonical mini-game registry.

- File path: `src/gameplay-modes/grid-based/grid-logic.js`
  - Why unwired: only consumed by unwired `GridGameMode` path.
  - What would wire it: wiring `GridGameMode` into runtime launch pipeline.

- File path: `src/gameplay-modes/grid-based/grid-player.js`
  - Why unwired: only consumed by unwired `GridGameMode` path.
  - What would wire it: wiring `GridGameMode` into runtime launch pipeline.

- File path: `src/gameplay-modes/grid-based/grid-enemy.js`
  - Why unwired: only consumed by unwired `GridGameMode` path.
  - What would wire it: wiring `GridGameMode` into runtime launch pipeline.

- File path: `src/gameplay-modes/grid-based/grid-particles.js`
  - Why unwired: only consumed by unwired `GridGameMode` path.
  - What would wire it: wiring `GridGameMode` into runtime launch pipeline.

- File path: `src/gameplay-modes/constellation/Constellation3DMode.js`
  - Why unwired: no active UI path sets mode selection to `constellation-3d`.
  - What would wire it: add a selectable launcher/adaptor and return-to-hub path in runtime spine.

- File path: `src/gameplay-modes/shooter/ShooterMode.js`
  - Why unwired: runtime uses `src/modes/shooter-mode.js`; this parallel implementation is not referenced.
  - What would wire it: switch launcher to this mode or remove duplication by consolidating to one shooter implementation.

- File path: `src/gameplay-modes/rhythm/RhythmMode.js`
  - Why unwired: runtime uses `src/modes/rhythm-mode.js`; this parallel implementation is not referenced.
  - What would wire it: switch launcher to this mode or consolidate to one rhythm implementation.

- File path: `src/core/game-engine/InputManager.js`
  - Why unwired: runtime input is handled directly in `src/main.js` listeners.
  - What would wire it: replace direct handlers with InputManager dispatch and adapt mode input APIs.

- File path: `src/core/game-engine/GameStateManager.js`
  - Why unwired: state/phase transitions are in `src/main.js`, not this manager.
  - What would wire it: migrate phase/state transitions to manager and call it from main loop.

- File path: `src/systems/integration/progress-dashboard.js`
  - Why unwired: no import/call path from active renderer pipeline.
  - What would wire it: import and invoke its draw function from the active render pass when dashboard is open.

- File path: `src/services/apiAgents.js`
  - Why unwired: no runtime UI or game-loop caller invokes this service.
  - What would wire it: add explicit trigger path (menu/dev action) and render returned outputs.

- File path: `src/services/runApiExamples.js`
  - Why unwired: example harness is never called from app startup or runtime controls.
  - What would wire it: execute from a dev command/hotkey or explicit startup hook.

## DOCUMENTED ONLY

- Markdown file: `docs/creative inspiration/TASKS_FOR_CLAUDE.md`
  - Missing code symbol/module path: `realmRegistry` module (e.g., `src/data/realmRegistry.*`) is not present in reachable runtime.

- Markdown file: `docs/creative inspiration/TASKS_FOR_CLAUDE.md`
  - Missing code symbol/module path: `enterRealm(realmId)` function is documented but no such symbol exists in `src/`.

- Markdown file: `docs/creative inspiration/REALM_SPECS.md`
  - Missing code symbol/module path: documented realm IDs `civic_center_maze`, `mansion_compound`, `water_park`, `ethereal_bog`, `mountain_summit`, `castle_region` have no corresponding realm module/registry entries in `src/`.

- Markdown file: `docs/creative inspiration/CLAUDE_PROMPT_STARTER.md`
  - Missing code symbol/module path: process rule “run universal prompt” has no runtime-enforced module or validator (no `src/...` enforcement component).

- Markdown file: `docs/research/INDEX.md`
  - Missing code symbol/module path: “minimum 10 references per subdirectory” governance rule has no checker module (e.g., no `tools/research-audit.*` in runtime path).

- Markdown file: `docs/wiring-audit-2026-02-24.md`
  - Missing code symbol/module path: architecture recommendations are documented only; no corresponding migration/orchestrator module was found in reachable `src/main.js` chain.
