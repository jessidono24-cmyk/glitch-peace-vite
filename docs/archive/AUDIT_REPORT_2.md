# GLITCH·PEACE Codebase Audit Report 2

**Generated:** 2026-02-21  
**Method:** Static import-graph tracing from `src/main.js`, cross-referenced with direct code inspection of every file in the `src/` tree.

> A feature is counted as *implemented* only when its code is **reachable from `src/main.js`** (directly or transitively imported) **AND** produces visible output in the browser (canvas draw calls, DOM mutations, CSS animation triggers, or audible sound).

---

## 1. ACTUALLY IMPLEMENTED

*Features whose code is reachable from `src/main.js` and produces visible or audible output.*

| # | File(s) | What it does right now |
|---|---------|------------------------|
| 1 | `src/ui/menus.js` → `drawTitle` | Renders the title screen every frame: deep-space star field, "GLITCH·PEACE" glyph with cyan glow, and a 7-item navigable menu. |
| 2 | `src/ui/menus.js` → `drawOnboarding` | Age-group picker (5–7 / 8–11 / 12–15 / 16+) shown on first launch; routes to language selection before the title. |
| 3 | `src/ui/menus.js` → `drawLanguageOptions` | Lets the player choose native language and target language for bilingual immersion; persisted to `PLAYER_PROFILE`. |
| 4 | `src/ui/menus.js` → `drawModeSelect` | Lists 10 named gameplay modes (Grid Classic, Shooter, RPG, Ornithology, Mycology, Architecture, Constellation, Alchemy, Rhythm, Constellation 3D) with animated selection highlight. |
| 5 | `src/ui/menus.js` → `drawPlayModeSelect` | Lists 13 play-style variations (Classic, Zen, Speedrun, Puzzle, Survival Horror, Roguelike, Pattern, Boss Rush, Pacifist, Reverse, Campaign, Ritual, Daily); modifies tile weights before game start. |
| 6 | `src/ui/menus.js` → `drawDreamSelect` | 18-dreamscape picker; each entry shows a unique name, flavor text, and color scheme. |
| 7 | `src/ui/menus.js` → `drawCosmologySelect` | Eight cosmology overlays (Hindu, Celtic, Egyptian, Norse, Aztec, Taoist, Indigenous, Hermetic) with descriptions; selection modifies tile bias and emotional mappings. |
| 8 | `src/ui/menus.js` → `drawArchetypeSelect` | Five archetypes (Dragon, Child Guide, Orb, Captor-Teacher, Protector) displayed in a grid; pre-loads the chosen power for the run. |
| 9 | `src/ui/menus.js` → `drawHowToPlay` | How-to-play tutorial screen drawn at the `howtoplay` phase. |
| 10 | `src/ui/menus.js` → `drawOptions` | Settings screen with grid size, difficulty, particles, view-mode, accessibility toggles, and font-scale picker. |
| 11 | `src/ui/menus.js` → `drawHighScores` | Top-10 per-dreamscape high-score table rendered from localStorage data. |
| 12 | `src/ui/menus.js` → `drawUpgradeShop` | Upgrade shop screen where insight tokens buy run-scoped powers (HP boost, shield, matrix mastery, phase-walk, etc.). |
| 13 | `src/ui/menus.js` → `drawPause` | Pause overlay with resume/options/quit menu. |
| 14 | `src/ui/menus.js` → `drawInterlude` | Post-dreamscape interlude screen showing self-reflection prompt, vocabulary word, empathy insight, and campaign milestone. |
| 15 | `src/ui/menus.js` → `drawDead` | Game-over screen showing final stats, cause of death, and score vs. personal best. |
| 16 | `src/ui/menus.js` → `drawAchievementPopup` / `drawAchievements` | Achievement unlock toast rendered in every mode; dedicated achievements-list screen accessible from the title. |
| 17 | `src/game/grid.js` + `src/ui/renderer.js` → `drawGame` | Core grid game: procedural 17-tile-type level generation with Fibonacci-scaled peace nodes, rendered to canvas every frame. |
| 18 | `src/game/player.js` | Player movement, tile interaction (damage/healing/archetype triggers), push mechanics, and Matrix A/B toggle — all visible via the grid renderer. |
| 19 | `src/game/enemy.js` | Nine-behavior enemy AI (chase, flee, random, orbit, guard, rush, spread, boss-assist, hallucinatory); enemy positions rendered each frame. |
| 20 | `src/game/particles.js` | Burst and resonance-wave particle effects visible on tile collection and archetype activation. |
| 21 | `src/ui/hud.js` | DOM HUD bar at screen bottom shows health bar, level, score, and objective count; swaps to wave/kill/combo display in Shooter and Rhythm modes. |
| 22 | `src/rendering/sprite-player.js` | SVG mage (player) and wraith (enemy) sprites positioned as absolute `div`s in `#sprite-layer` with CSS walk and flicker animations. |
| 23 | `src/systems/emotional-engine.js` + `index.html` CSS keyframes | Ten-emotion model drives CSS `glitch-light / glitch-medium / glitch-heavy` canvas animation classes based on live distortion level; visible every frame. |
| 24 | `src/recovery/consequence-preview.js` | Draws a 3-step ghost-path ahead of the cursor near hazard tiles, showing HP cost at each future step. |
| 25 | `src/recovery/impulse-buffer.js` | 1-second hold-delay before committing to a hazard tile; an orange arc/bar renders at the tile edge while holding. |
| 26 | `src/modes/shooter-mode.js` | Wave-survival arena: 3 enemy types, mouse aim, 4 weapon tiers, 7 powerup types, kill counter; own `update` + `render` loop active when `gameMode === 'shooter'`. |
| 27 | `src/modes/constellation-mode.js` + `src/rendering/three-layer.js` | Star-node connection puzzle (2D) and Three.js 400-star volumetric star field + 2000-particle nebula composited via `ctx.drawImage` when `mode3d=true`. |
| 28 | `src/modes/meditation-mode.js` | Hazard-free somatic grid; animated breathing circle with inhale/exhale text guides the session; no failure state. |
| 29 | `src/modes/coop-mode.js` | Local 2-player shared grid (P1 arrows, P2 WASD); individual HP bars, shared score, wave progression visible on canvas. |
| 30 | `src/modes/rhythm-mode.js` | Four-column falling-note lane game; PERFECT/GOOD/MISS timing windows; procedural note patterns per dreamscape; 5-level progression. |
| 31 | `src/gameplay-modes/alchemy/AlchemyMode.js` | Full alchemy mode: element tiles (🜂🜄🜃🜁) collected and transmuted at the Athanor; four-phase arc (Nigredo → Albedo → Rubedo → Aurora) rendered to canvas. |
| 32 | `src/gameplay-modes/architecture/ArchitectureMode.js` | Tile-placement architectural mode: blueprint matching with SPACE/Q/E keys; structural integrity scoring rendered on canvas. |
| 33 | `src/gameplay-modes/mycology/MycologyMode.js` | Mushroom foraging mode with 20+ species, edibility challenges, and mycelium-network tile mechanics; rendered to canvas. |
| 34 | `src/gameplay-modes/ornithology/OrnithologyMode.js` | Bird-observation mode with 30+ species, habitat tiles, and call-type challenges; rendered to canvas. |
| 35 | `src/rendering/boss-renderer-3d.js` (via `renderer.js`) | Three.js procedural 3D boss geometry (fear guardian, void sovereign, despair weaver, etc.) composited onto the 2D canvas during boss encounters. |
| 36 | `src/rendering/void-nexus-3d.js` (via `renderer.js`) | Replaces the flat grid with a Three.js top-down 3D scene (crystalline pillars, obsidian walls, glowing player orb) when `viewMode === 'iso'` and dreamscape is `void_nexus`. |
| 37 | `src/systems/boss-system.js` | Five boss types spawn at level thresholds; boss HP, phase transitions, and `_showMsg` alerts are all visible in-game. |
| 38 | `src/systems/achievements.js` | 20+ achievements (first move, score milestones, mode completions); unlock popup and achievements screen both rendered. |
| 39 | `src/audio/music-engine.js` | Procedural Tone.js ambient score: calm (C-major arpeggios) → medium (minor scale) → tense (dissonant clusters); switches with distortion level. |
| 40 | `src/audio/sfx-manager.js` | WAV sample playback for menu navigation, tile damage, peace collection, dream-complete, and boss-enter events. |
| 41 | `src/systems/temporal-system.js` | Reads the real date on startup; returns `enemyMul`, `insightMul`, `coherenceMul` applied to enemy speed and reward scaling each frame. |
| 42 | `src/systems/biome-system.js` | Dominant-emotion-driven biome overlays update tile-color tints on the game canvas each frame. |
| 43 | `src/systems/difficulty/adaptive-difficulty.js` | Age-tier (child/teen/adult/nightmare) loaded from `PLAYER_PROFILE` at startup; adjusts enemy count, tile density, and vocab-tier for the session. |
| 44 | `src/systems/play-modes.js` | 13 named play-style variants; `applyPlayMode` alters tile weights, enemy scale, and hazard rates before `startGame`. |
| 45 | `src/systems/cosmology/cosmologies.js` | Eight cosmology definitions; selected cosmology modifies tile placement and NPC message text in the game. |
| 46 | `src/systems/cosmology/chakra-system.js` | Chakra-activation flash overlay drawn on the canvas when gameplay events match chakra conditions; history tracked per session. |
| 47 | `src/systems/cosmology/tarot-archetypes.js` | One tarot archetype drawn randomly at dreamscape start; name injected into messages and interlude text. |
| 48 | `src/systems/awareness/dream-yoga.js` | Lucidity bar (0–100%) rendered as a small purple bar at the top-left of the play canvas; rises on INSIGHT tiles, decays on damage. |
| 49 | `src/systems/awareness/self-reflection.js` | Periodic reflection prompt rendered as an in-game message; reflection count tracked in the dashboard. |
| 50 | `src/systems/awareness/emergence-indicators.js` | Flash overlay drawn on the canvas when the player crosses awareness thresholds (first dream, high lucidity, reflection depth). |
| 51 | `src/systems/cessation/session-tracker.js` | Tracks elapsed play time from session start; triggers break-reminder messages at configurable intervals. |
| 52 | `src/systems/cessation/urge-management.js` | Urge-surfing and breathing prompts fired after prolonged sessions; state exposed on the dashboard. |
| 53 | `src/systems/rpg/character-stats.js` | Five RPG stats (Strength/Wisdom/Empathy/Resilience/Clarity) with XP; level and stat bar rendered in the top-right of the play canvas. |
| 54 | `src/systems/rpg/archetype-dialogue.js` | NPC dialogue lines selected from the player's archetype; shown in the message area on tile-contact events during RPG mode. |
| 55 | `src/systems/rpg/quest-system.js` | 13 quest chains with live objectives (collect N tiles, activate archetypes, survive hazards, etc.); active quest log rendered as a bordered list below the mode banner. |
| 56 | `src/systems/alchemy-system.js` | Element collection and Athanor transmutation bar; four-phase arc state rendered at the bottom of the canvas when `_currentModeType === 'alchemy'`. |
| 57 | `src/systems/learning/language-system.js` | 16-language definitions; when `langImmersion` is on, HUD labels are replaced with target-language translations. |
| 58 | `src/systems/learning/vocabulary-engine.js` | Bilingual vocabulary cards appear on INSIGHT tile steps; CEFR A1–C2 word bank; interlude word shown on dream completion. |
| 59 | `src/systems/learning/sigil-system.js` | Geometric pattern-matching challenge overlay triggered on ARCH tile contact; displays sigil primitives and prompt text. |
| 60 | `src/systems/learning/pattern-recognition.js` | Tracks Fibonacci and grid pattern observations per session; score reflected in the integration dashboard. |
| 61 | `src/intelligence/cognitive/logic-puzzles.js` | IQ-proxy number-sequence challenges scored after each dreamscape; cumulative IQ score shown in the integration dashboard. |
| 62 | `src/intelligence/cognitive/strategic-thinking.js` | Counts deliberate impulse-buffer cancellations; strategic score tracked and shown in the dashboard. |
| 63 | `src/intelligence/emotional/empathy-training.js` | EQ training score accumulates from emotion-congruent tile choices; EQ score shown in the dashboard. |
| 64 | `src/intelligence/emotional/emotion-recognition.js` | Recognises and scores emotion labeling; EQ recognition score shown in the dashboard. |
| 65 | `src/modes/campaign-manager.js` | Tutorial hints displayed on first visit to each dreamscape (up to 3 contextual tips); dreamscape-unlock sequence tracked in-session. |
| 66 | `src/ui/renderer.js` → `drawDashboard` | Press H: full-screen stats overlay on the game canvas listing intelligence scores, wellness metrics, chakra state, language progress, alchemy phase, and quest log (backed by `window._*` globals set each frame). |
| 67 | `src/core/storage.js` | Reads/writes high scores, player profile, and preferences to `localStorage`; visible effect: top-10 scores persist between sessions. |
| 68 | `index.html` CSS + `src/main.js` → isometric toggle (I key) | Press I toggles `.isometric` on `#canvas-wrapper`; CSS applies `perspective(800px) rotateX(18deg) scale(1.05)` to canvas and sprite layer — visible 3D tilt. |
| 69 | `index.html` CSS glitch keyframes + `src/main.js` | Three `@keyframes` classes (`glitch-light / medium / heavy`) applied to the canvas based on emotional distortion; fully suppressed by `reducedMotion` flag. |
| 70 | `src/main.js` → `pollGamepad` | Left-stick and D-pad navigation; A/B/X/Y/LB/RB/Start/Select mapped in grid mode; visible effect: gamepad moves the player and navigates menus. |
| 71 | `src/main.js` → `dpadBtn` + `index.html` `#mobile-controls` | On-screen D-pad buttons connect touchstart/touchend events to the keyboard-key set; visible on touch devices. |
| 72 | `electron/main.js` + `electron/preload.js` | Electron entry point creates a frameless BrowserWindow; `npm run electron:dev` starts the desktop app wrapping the Vite dev server. |
| 73 | `public/manifest.json` | Web-app manifest enabling "Add to Home Screen" on mobile browsers; provides app icons, theme color, and `standalone` display mode. |

---

## 2. CODE EXISTS BUT BROKEN/UNWIRED

*Files with real logic that are never imported in the `src/main.js` dependency tree and therefore produce no visible output.*

| # | File(s) | Why it's broken | What it would need to work |
|---|---------|-----------------|---------------------------|
| 1 | `src/core/emotional-engine.js` | Duplicate `EmotionalField` class; `main.js` imports the active version from `src/systems/emotional-engine.js` instead. | Remove or merge; update any import paths pointing here. |
| 2 | `src/core/event-bus.js` | Lightweight pub/sub implementation; never imported by any file in the active bundle. | Import and use in place of direct function calls across systems to decouple them. |
| 3 | `src/core/game-engine/GameStateManager.js` | Mode-agnostic state manager class; never imported anywhere; also has a broken internal import (`'../emotional-engine.js'` resolves to the unwired `core/` duplicate). | Fix its relative import, then import and instantiate it in `main.js` as the global state container. |
| 4 | `src/core/game-engine/InputManager.js` | Input abstraction layer class; never imported. | Import in `main.js` and route all keyboard/gamepad/touch events through it instead of the inline `keys` Set. |
| 5 | `src/core/temporal-system.js` | Duplicate temporal-system data (lunar phases, weekday rhythms); active version in `src/systems/temporal-system.js`. | Delete or merge; remove the duplicate. |
| 6 | `src/gameplay-modes/ModeRegistry.js` | Mode registration class with `register`, `get`, `list` API; never imported in the main bundle. | Import in `main.js` and use it as the canonical registry; wire up the `index.js` files in each gameplay-modes subdirectory. |
| 7 | `src/gameplay-modes/alchemy/index.js` | Imports `AlchemyMode` and registers it with `ModeRegistry`; never imported (`main.js` imports `AlchemyMode.js` directly and bypasses the registry). | Import these `index.js` files instead of the bare mode class files, after `ModeRegistry` is wired. |
| 8 | `src/gameplay-modes/architecture/index.js` | Same pattern as alchemy/index.js; never imported. | Same fix as above. |
| 9 | `src/gameplay-modes/mycology/index.js` | Same pattern; never imported. | Same fix. |
| 10 | `src/gameplay-modes/ornithology/index.js` | Same pattern; never imported. | Same fix. |
| 11 | `src/gameplay-modes/constellation/ConstellationMode.js` + `index.js` | Duplicate constellation mode class in `gameplay-modes/`; active mode is `src/modes/constellation-mode.js`. | Remove duplicate or replace the active mode with this class and update `main.js`. |
| 12 | `src/gameplay-modes/constellation/Constellation3DMode.js` | Three.js 3D constellation variant; not imported; main.js handles 3D via a `mode3d` flag inside `modes/constellation-mode.js`. | Import and instantiate in `main.js`, then add a `constellation-3d` branch in the game loop. |
| 13 | `src/gameplay-modes/rhythm/RhythmMode.js` + `index.js` | Duplicate rhythm mode; active version is `src/modes/rhythm-mode.js`. | Remove duplicate or replace active mode. |
| 14 | `src/gameplay-modes/rpg/RPGMode.js` + `index.js` | Full RPG mode class with shadow enemies, named zone transitions, and branching dialogue; never imported — `main.js` has its own bespoke inline RPG path instead. | Import and instantiate in `main.js` alongside the other gameplay-modes/ instances, replacing the bespoke RPG path. |
| 15 | `src/gameplay-modes/shooter/ShooterMode.js` + `index.js` | Duplicate shooter implementation using `matter-js` physics; active shooter is `src/modes/shooter-mode.js`. | Remove duplicate or replace active mode. |
| 16 | `src/gameplay-modes/grid-based/GridGameMode.js` + `grid-enemy.js` + `grid-logic.js` + `grid-particles.js` + `grid-player.js` + `index.js` | Complete refactored grid engine (6 files); no file in the chain imports any of them. | Wire `GridGameMode` into `main.js` in place of the inline grid logic, and import its companion files from inside `GridGameMode.js`. |
| 17 | `src/intelligence/emotion-recognition.js` | Flat-path duplicate of the active `src/intelligence/emotional/emotion-recognition.js`. | Remove; all consumers should import from `emotional/`. |
| 18 | `src/intelligence/empathy-training.js` | Flat-path duplicate of `src/intelligence/emotional/empathy-training.js`. | Remove; same as above. |
| 19 | `src/intelligence/logic-puzzles.js` | Flat-path duplicate of `src/intelligence/cognitive/logic-puzzles.js`. | Remove; same pattern. |
| 20 | `src/intelligence/strategic-thinking.js` | Flat-path duplicate of `src/intelligence/cognitive/strategic-thinking.js`. | Remove; same pattern. |
| 21 | `src/modes/grid-mode.js` | `GridMode` class wrapping the existing `game/` logic; never imported in `main.js`, which does its own inline grid handling. | Import and instantiate as the canonical grid mode, removing the inline grid section from `main.js`. |
| 22 | `src/modes/mode-manager.js` | `ModeManager` orchestrator for all gameplay modes; never imported. | Import in `main.js`, register all mode instances, and delegate mode switching to it. |
| 23 | `src/services/apiAgents.js` + `apiAgents.examples.js` + `runApiExamples.js` + `runOpenAIExamples.js` | Claude + GPT-4 API wrappers for procedural content generation; require Node.js (not the browser) and API keys not present in `.env`. | Move to a server/edge function, add `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` to `.env`, and call via fetch from the browser. |
| 24 | `src/systems/ambient-music.js` | Older Tone.js music engine responding to emotional distortion; superseded by `src/audio/music-engine.js`; not imported. | Remove or consolidate into the active music engine. |
| 25 | `src/systems/archetypes.js` | Duplicate archetype definitions (wall_jump, reveal, phase-walk, rewind, shield-burst); `main.js` uses `ARCHETYPES` from `src/core/constants.js`. | Remove; ensure constants.js is the single source of truth. |
| 26 | `src/systems/audio.js` | `AudioEngine` class using Web Audio API + Tone.js; never imported — active audio uses `sfx-manager.js` and `music-engine.js`. | Remove or consolidate functionality. |
| 27 | `src/systems/campaign.js` | 30-level campaign narrative arc (3 acts, boss encounters); never imported — `src/modes/campaign-manager.js` provides a simpler tutorial hint system instead. | Import in `main.js` alongside `campaignManager` and drive the full 30-level arc from it. |
| 28 | `src/systems/cosmologies.js` | Top-level duplicate of `src/systems/cosmology/cosmologies.js`; not imported. | Remove; use the `cosmology/` subfolder version. |
| 29 | `src/systems/dream-yoga.js` | Top-level duplicate of `src/systems/awareness/dream-yoga.js`; not imported. | Remove; use the `awareness/` subfolder version. |
| 30 | `src/systems/dreamscapes.js` | Dreamscape theme definitions (bg, ambient, accent, tileBias); only imported by unwired `gameplay-modes/` files that are not in the main bundle. | Import in `main.js` (or in `grid.js`) and apply `tileBias` overrides during `buildDreamscape`. |
| 31 | `src/systems/integration/progress-dashboard.js` | `drawDashboard` function rendering a 440 px panel with all system metrics; never imported — `main.js` calls the inline dashboard in `src/ui/renderer.js` instead. | Remove or replace the inline renderer dashboard with this module's `drawDashboard`. |
| 32 | `src/systems/languages.js` | Older 16-language system; superseded by `src/systems/learning/language-system.js`; not imported. | Remove. |
| 33 | `src/systems/leaderboard.js` | Real-time Supabase leaderboard with SQL schema and connection logic; Supabase URL/key are never set; never imported. | Configure Supabase credentials in `.env`, import in `main.js`, and call `addScore` on game-over. |
| 34 | `src/systems/learning-modules.js` | Learning challenge dispatcher importing the older `languages.js` and `sigils.js`; superseded by the `systems/learning/` subfolder. | Remove; use the active learning/ modules. |
| 35 | `src/systems/powerups.js` | Powerup type definitions (SHIELD, SPEED, FREEZE, DOUBLE_SCORE, etc.); only consumed by `grid-based/GridGameMode.js` which is itself unwired. | Import in `main.js` grid section and apply powerup effects during tile collection. |
| 36 | `src/systems/recovery-tools.js` | Seven evidence-based recovery tools (urge surfing, consequence preview, etc.); never imported — functionality is split between `recovery/` and `systems/cessation/`. | Remove or consolidate with the active recovery modules. |
| 37 | `src/systems/sampleAssets.js` | Programmatic `AudioBuffer` generators for embedded ambient/sfx sounds; never imported. | Import in `sfx-manager.js` as a fallback when external WAV files are absent. |
| 38 | `src/systems/session-analytics.js` | localStorage-based cross-session metrics (total sessions, minutes, peak score, dreamscape visits); never imported. | Import in `main.js`, call `recordSession` on game-over, and surface metrics in the dashboard. |
| 39 | `src/systems/sigils.js` | Older sigil pattern database; superseded by `src/systems/learning/sigil-system.js`; not imported. | Remove; use `learning/sigil-system.js`. |
| 40 | `src/systems/undo.js` | `undoGameMove` function reverting grid state from history; only imported by the unwired `grid-based/GridGameMode.js`. | Import in `main.js` grid section; wire to a keyboard shortcut (e.g., Ctrl+Z). |
| 41 | `src/systems/upgrade-shop.js` | Ten upgrade definitions with `apply(gameState)` functions; never imported — the active shop uses `UPGRADE_SHOP` constant from `src/core/constants.js`. | Remove or replace the constants-based shop with this module's richer apply-function definitions. |

---

## 3. DOCUMENTED ONLY

*Concepts described in `.md` files in this repository with zero corresponding code files anywhere in `src/`.*

| # | Documented in | What the doc describes | Code status |
|---|--------------|------------------------|-------------|
| 1 | `GAMEPLAY_MODES.md`, `ROADMAP.md` (Phase M8) | **Platformer Mode** — side-scrolling platformer with consciousness and embodiment themes, physics-based movement, collectible nodes. | No `PlatformerMode.js` or related file exists anywhere. |
| 2 | `GAMEPLAY_MODES.md` (Multiplayer Mode → Competitive Mode), `ROADMAP.md` (Phase M8) | **Online Competitive Multiplayer** — separate but parallel dreamscapes, real-time score competition, social rivalry via optional leaderboard. | No networking code, no WebSocket/WebRTC layer, no server. (Local 2-player co-op *does* exist.) |
| 3 | `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Grammar Patterns system** (`grammar-patterns.js`) — sentence structure learning through in-game messages. | File does not exist. |
| 4 | `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Pronunciation Practice system** (`pronunciation-practice.js`) — audio-based language practice using the Web Speech API. | File does not exist. |
| 5 | `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Immersion Context system** (`immersion-context.js`) — situational language use tied to dreamscape environments. | File does not exist. |
| 6 | `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Mathematics sub-system** — dedicated `mathematics/` folder with `fibonacci-teaching.js`, `spatial-reasoning.js`, `problem-solving.js`. | None of these files exist; Fibonacci is referenced only as data in `grid.js` scoring. |
| 7 | `src/systems/learning/README.md` | **Meta-learning sub-system** — `attention-training.js`, `memory-techniques.js`, `transfer-learning.js`. | None of these files exist. |
| 8 | `src/intelligence/README.md` | **Social Intelligence system** (`social-intelligence.js`) — understanding social dynamics through dreamscape NPCs. | File does not exist; no NPC social-simulation logic is present. |
| 9 | `src/intelligence/README.md` | **Creative Problem-Solving system** (`creative-problem-solving.js`) — novel-solution finding tracked as a cognitive metric. | File does not exist. |
| 10 | `DREAM_YOGA.md` | **Inter-player Shared Dream Space** — multiple players occupying the same dreamscape simultaneously, seeing each other's reality-check signals. | No networking or shared-state code exists for this. |
| 11 | `ROADMAP.md` (Phase M9), `GAMEPLAY_MODES.md` | **Challenge Mode** — timed daily challenges with fixed seed, global scoring, and a dedicated leaderboard. | No `ChallengeMode.js` or daily-seed logic exists; only the Supabase leaderboard skeleton (itself unwired — see Section 2) touches this concept. |
| 12 | `INSTALLATION.md`, `README.md` | **Steam Cloud Save** — player profile and high scores synced via Steam's remote storage API. | Only the Electron wrapper exists; no Steam SDK (`greenworks` or Steamworks.js) integration is present. |
