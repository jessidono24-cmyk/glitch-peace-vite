# GLITCH·PEACE — Codebase Audit Report

**Generated:** 2026-02-24  
**Method:** Static import-graph tracing from `src/main.js`, cross-referenced with direct code inspection of every file in the `src/` tree and the wiring audit completed the same day.

> A feature is counted as *implemented* only when its code is **reachable from `src/main.js`** (directly or transitively imported) **AND** produces visible or audible output in the browser.

---

## 1. ACTUALLY IMPLEMENTED

*Features whose code is reachable from `src/main.js` and produces visible or audible browser output.*

| File(s) | What it does right now |
|---------|------------------------|
| `src/core/constants.js` | Defines all tile types, dreamscape configs, archetypes, upgrade shop data, and fact lists consumed across the entire game. |
| `src/core/state.js` | Holds the live game state (phase, player stats, session data, high scores) and all setters; drives every frame of the state machine. |
| `src/core/utils.js` | `rnd()` and `pick()` helpers called throughout the game for random tile selection and particle generation. |
| `src/core/storage.js` | Reads and writes high scores, player profile, and timezone offset to `localStorage`; scores visibly persist between sessions. |
| `src/core/fsrs.js` | FSRS spaced-repetition deck used by LanguageMode to schedule vocabulary review cards. |
| `src/core/interfaces/GameMode.js` | Abstract base class extended by all `gameplay-modes/` classes; provides the `init`/`update`/`handleInput`/`render` contract. |
| `src/game/grid.js` | Generates the procedural tile grid (17 tile types) and exports canvas-size helpers; visible as the game board every frame. |
| `src/game/enemy.js` | Nine-behavior enemy AI (chase, flee, orbit, rush, spread, boss-assist, etc.) stepped every game frame; enemies render as tiles on the grid. |
| `src/game/player.js` | All player movement, tile interaction, archetype activation, Matrix A/B toggle, and glitch pulse; produces every player-move visual event. |
| `src/game/particles.js` | `burst()` and `resonanceWave()` particle effects triggered on tile collection and archetype activation. |
| `src/ui/renderer.js` | `drawGame()` renders the full tile grid + overlays every frame; also draws the press-H integration dashboard via `drawDashboard`. |
| `src/ui/hud.js` | DOM health bar, score, level, and objective count below the canvas; swaps to wave/kill/combo display in Shooter and Rhythm modes. |
| `src/ui/menus.js` | Draws all menu screens: title star-field, onboarding age picker, language selection, mode select (10 modes), play-style select (13 variants), dreamscape picker (18 entries), cosmology select, archetype select, options, high scores, upgrade shop, pause, interlude, game-over, and achievements. |
| `src/rendering/sprite-player.js` | SVG mage (player) and wraith (enemy) sprites in `#sprite-layer` with CSS walk and flicker animations. |
| `src/rendering/boss-renderer-3d.js` | Three.js procedural 3D boss geometry composited onto the 2D canvas during boss encounters (imported by `renderer.js`). |
| `src/rendering/void-nexus-3d.js` | Replaces the flat grid with a Three.js top-down 3D scene when `viewMode === 'iso'` and the dreamscape is `void_nexus` (imported by `renderer.js`). |
| `src/rendering/three-layer.js` | WebGL render bridge that composites a Three.js 400-star volumetric star field and 2000-particle nebula onto the 2D canvas (imported by `constellation-mode.js`). |
| `src/audio/sfx-manager.js` | WAV sample playback for movement, tile damage, peace collection, dream-complete, and boss-enter events. |
| `src/audio/music-engine.js` | Procedural Tone.js ambient score (calm C-major → minor → dissonant clusters) that switches automatically with emotional distortion level. |
| `src/modes/game-mode.js` | Base `GameMode` class for the `modes/` folder; extended by `shooter-mode.js`, `constellation-mode.js`, `coop-mode.js`, `rhythm-mode.js`, and `meditation-mode.js`. |
| `src/modes/shooter-mode.js` | Wave-survival arena: 3 enemy types, mouse aim, 4 weapon tiers, 7 powerup types, kill counter; own `update`/`render` loop active when `gameMode === 'shooter'`. |
| `src/modes/fps-mode.js` | First-person Three.js corridor shooter; imported and lazily instantiated when the FPS mode is selected from the mode menu. |
| `src/modes/constellation-mode.js` | Star-node connection puzzle (2D) and Three.js 400-star volumetric star field composited via `ctx.drawImage` when `mode3d=true`. |
| `src/modes/meditation-mode.js` | Hazard-free somatic grid with animated breathing-circle overlay and inhale/exhale text; no fail state. |
| `src/modes/coop-mode.js` | Local 2-player shared grid (P1 arrows / P2 WASD); individual HP bars and shared score visible on canvas. |
| `src/modes/rhythm-mode.js` | Four-column falling-note lane game with PERFECT/GOOD/MISS timing windows and 5-level progression. |
| `src/modes/campaign-manager.js` | Displays contextual tutorial hints on first visit to each dreamscape (up to 3 tips); dreamscape-unlock sequence tracked in-session. |
| `src/modes/mode-manager.js` | Instantiates and registers mode instances; `switchMode` dispatches `update`/`render`/`handleInput` to the currently active NON_GRID_MODES mode. |
| `src/modes/language-mode.js` | FSRS-powered language learning mode: immersion layer (floating vocabulary labels in dreamscape), recognition quiz, and production cards. |
| `src/gameplay-modes/alchemy/AlchemyMode.js` | Element tiles (🜂🜄🜃🜁) collected and transmuted; Athanor bar and four-phase arc (Nigredo → Aurora) rendered to canvas. |
| `src/gameplay-modes/architecture/ArchitectureMode.js` | Tile-placement architectural mode with blueprint matching (SPACE/Q/E keys) and structural-integrity scoring on canvas. |
| `src/gameplay-modes/mycology/MycologyMode.js` | Mushroom foraging mode with 20+ species, edibility challenges, and mycelium-network tile mechanics; rendered to canvas. |
| `src/gameplay-modes/ornithology/OrnithologyMode.js` | Bird-observation mode with 30+ species, habitat tiles, and call-type challenges; fully rendered to canvas. |
| `src/gameplay-modes/learning-hub/LearningHubMode.js` | Multi-discipline quiz mode with 10 subject areas (languages, mathematics, biology, physics, etc.) and per-subject question pools. |
| `src/gameplay-modes/rpg/RPGMode.js` | Full RPG mode with named zones, shadow enemies, NPC dialogue trees, and multi-branch quest progression. |
| `src/systems/temporal-system.js` | Reads the real date on startup; returns `enemyMul`, `insightMul`, `coherenceMul` applied to enemy speed and reward scaling every frame. |
| `src/systems/emotional-engine.js` | Ten-emotion `EmotionalField`; drives CSS `glitch-light / medium / heavy` animation classes on the canvas based on live distortion level. |
| `src/systems/biome-system.js` | Dominant-emotion-driven biome color overlays update tile-color tints on the game canvas every frame. |
| `src/systems/play-modes.js` | 13 named play-style variants (Classic, Zen, Speedrun, Puzzle, Survival Horror, etc.); `applyPlayMode` alters tile weights and enemy scale before `startGame`. |
| `src/systems/achievements.js` | 20+ achievement definitions tracked per session and lifetime; unlock popup rendered in every mode. |
| `src/systems/boss-system.js` | Five boss types spawn at level thresholds; boss HP, phase-transition messages, and SFX are all triggered in-game. |
| `src/systems/alchemy-system.js` | Element collection + Athanor transmutation bar; four-phase arc state visible in the canvas when `_currentModeType === 'alchemy'`. |
| `src/systems/campaign-story.js` | `CAMPAIGN_CHAPTERS` data, chapter-progress persistence (`loadCampaignProgress`/`saveChapterComplete`), and dreamscape-unlock helpers. |
| `src/systems/dreamscapes.js` | Dreamscape theme definitions (background, ambient, accent, `tileBias`); imported by `RPGMode.js` via `getDreamscapeTheme`. |
| `src/systems/cosmology/cosmologies.js` | Eight cosmology definitions; selected cosmology modifies tile placement, enemy emotion, and NPC message text in-game. |
| `src/systems/cosmology/chakra-system.js` | Chakra-activation flash overlay drawn on the canvas when gameplay events match chakra conditions; history tracked per session. |
| `src/systems/awareness/dream-yoga.js` | Lucidity bar (0–100%) at the top-left of the play canvas; rises from INSIGHT tiles and decays on damage. |
| `src/systems/awareness/self-reflection.js` | Periodic reflection prompt rendered as an in-game message; reflection count tracked and shown in the dashboard. |
| `src/systems/awareness/emergence-indicators.js` | Flash overlay drawn when the player crosses awareness thresholds (first dream, high lucidity, reflection depth). |
| `src/systems/cessation/session-tracker.js` | Tracks elapsed play time from session start; triggers break-reminder messages at configurable intervals. |
| `src/systems/cessation/urge-management.js` | Box/4-7-8 breathing prompts during prolonged sessions; state rendered in the integration dashboard. |
| `src/systems/difficulty/adaptive-difficulty.js` | Age/skill tier (child/teen/adult/nightmare) loaded from `PLAYER_PROFILE`; adjusts enemy count, tile density, and vocab-tier for the session. |
| `src/systems/rpg/character-stats.js` | Five RPG stats (Strength/Wisdom/Empathy/Resilience/Clarity) with XP; level and stat bar rendered top-right of the canvas during play. |
| `src/systems/rpg/archetype-dialogue.js` | NPC dialogue lines chosen from the player's archetype; shown in the message area on tile-contact events during RPG mode. |
| `src/systems/rpg/quest-system.js` | 13 quest chains with live objectives (collect tiles, pause, activate archetypes, etc.); active quest log rendered below the mode banner. |
| `src/systems/learning/language-system.js` | 16-language definitions; when `langImmersion` is on, HUD labels switch to the target language. |
| `src/systems/learning/vocabulary-engine.js` | Bilingual CEFR A1–C2 vocabulary cards appear on INSIGHT tile steps; interlude word shown on dream completion. |
| `src/systems/learning/sigil-system.js` | Geometric pattern-matching challenge overlay triggered on ARCH tile contact; displays sigil primitives and a prompt. |
| `src/systems/learning/pattern-recognition.js` | Fibonacci/grid pattern observations tracked per session; score reflected in the integration dashboard. |
| `src/intelligence/cognitive/logic-puzzles.js` | IQ-proxy number-sequence challenges scored per dreamscape; cumulative IQ score visible in the press-H integration dashboard. |
| `src/intelligence/cognitive/strategic-thinking.js` | Counts deliberate impulse-buffer cancellations; strategic score tracked and shown in the dashboard. |
| `src/intelligence/emotional/empathy-training.js` | EQ training score accumulates from emotion-congruent tile choices; EQ score shown in the dashboard. |
| `src/intelligence/emotional/emotion-recognition.js` | Emotion-labeling recognition scored per session; shown in the dashboard. |
| `src/recovery/consequence-preview.js` | Draws a 3-step ghost-path ahead of the cursor near hazard tiles, showing HP cost at each future step. |
| `src/recovery/impulse-buffer.js` | 1-second orange hold-bar before committing to a hazard tile; releases early if the player backs away. |
| `src/systems/ai-characters/archetype-bot.js` | Rule-based archetype character bot that delivers contextual messages in the grid mode based on live emotional state. |
| `src/systems/ai-characters/dialogue-pools.js` | Per-archetype and per-context dialogue line pools used by `archetype-bot.js`. |
| `src/systems/ai-characters/session-context.js` | Builds the session context object (distortion, lucidity, dominant emotion, dreamscape) used by `archetype-bot.js` for message selection. |
| `src/data/language-content.js` | Per-dreamscape vocabulary content and language-learning data used by `language-mode.js`. |
| `index.html` CSS + `src/main.js` (isometric toggle, I key) | Press I toggles `.isometric` on `#canvas-wrapper`; CSS applies `perspective(800px) rotateX(18deg) scale(1.05)` — visible 3D tilt. |
| `index.html` CSS glitch keyframes + `src/main.js` | Three `@keyframes` classes (`glitch-light / medium / heavy`) applied to the canvas based on emotional distortion; suppressed by `reducedMotion` flag. |
| `src/main.js` → `pollGamepad` | Left-stick and D-pad navigation; A/B/X/Y/LB/RB/Start/Select mapped in grid mode; gamepad moves the player and navigates menus. |
| `electron/main.js` + `electron/preload.js` | Electron entry point creates a frameless BrowserWindow; `npm run electron:dev` launches the desktop app wrapping the Vite dev server. |
| `public/manifest.json` | Web-app manifest enabling "Add to Home Screen" on mobile; provides app icons, theme color, and `standalone` display mode. |

---

## 2. CODE EXISTS BUT BROKEN/UNWIRED

*Files that exist in `src/` but are never reached from the `src/main.js` import chain — produce zero visible output.*

| File(s) | Why it's broken | What it would need to work |
|---------|-----------------|---------------------------|
| `src/core/emotional-engine.js` | Duplicate `EmotionalField` class; `main.js` imports the active version from `src/systems/emotional-engine.js` instead. | Delete or merge; update any remaining import paths pointing here. |
| `src/core/event-bus.js` | Lightweight pub/sub `EventBus` class; never imported by any file in the active bundle. | Import in `main.js` and route cross-system events through it to decouple the large inline event handlers. |
| `src/core/game-engine/GameStateManager.js` | Mode-agnostic state container; never imported; also has a broken internal import (`'../emotional-engine.js'` resolves to the unwired `core/` duplicate). | Fix its relative import path, then import and instantiate it in `main.js` as the global state container. |
| `src/core/game-engine/InputManager.js` | Full keyboard + gamepad input abstraction class with deadzone handling; never imported — `main.js` uses a raw `keys` Set instead. | Import in `main.js` and route all keyboard/gamepad/touch events through it. |
| `src/core/temporal-system.js` | Duplicate `TemporalSystem` data (lunar phases, weekday rhythms); active version is `src/systems/temporal-system.js`; only consumed by the unwired `GameStateManager.js`. | Delete or merge with the active `src/systems/temporal-system.js`. |
| `src/gameplay-modes/ModeRegistry.js` | Mode registration class with `register` / `get` / `list` API; never instantiated in the main bundle. | Instantiate in `main.js`, then import each `gameplay-modes/*/index.js` to auto-register modes. |
| `src/gameplay-modes/alchemy/index.js` | Re-export wrapper that registers `AlchemyMode` with `ModeRegistry`; bypassed — `main.js` imports `AlchemyMode.js` directly. | Use `index.js` imports once `ModeRegistry` is wired. |
| `src/gameplay-modes/architecture/index.js` | Same registry-registration wrapper as alchemy; bypassed by direct import. | Same fix. |
| `src/gameplay-modes/mycology/index.js` | Same registry-registration wrapper; bypassed. | Same fix. |
| `src/gameplay-modes/ornithology/index.js` | Same registry-registration wrapper; bypassed. | Same fix. |
| `src/gameplay-modes/rpg/index.js` | Registry-registration wrapper for `RPGMode`; bypassed — `main.js` imports `RPGMode.js` directly. | Same fix. |
| `src/gameplay-modes/constellation/ConstellationMode.js` + `index.js` | Duplicate of the active `src/modes/constellation-mode.js`; never imported. | Remove the duplicate or replace the active mode with this class and update `main.js`. |
| `src/gameplay-modes/constellation/Constellation3DMode.js` | Three.js 3D constellation variant; never imported; 3D is currently a flag inside `src/modes/constellation-mode.js`. | Import in `main.js` and add a `constellation-3d` branch in the game loop. |
| `src/gameplay-modes/rhythm/RhythmMode.js` + `index.js` | Duplicate of the active `src/modes/rhythm-mode.js`; never imported. | Remove the duplicate or replace the active mode. |
| `src/gameplay-modes/shooter/ShooterMode.js` + `index.js` | Duplicate shooter implementation using Matter.js physics; active shooter is `src/modes/shooter-mode.js`; never imported. | Remove the duplicate or replace the active mode. |
| `src/gameplay-modes/grid-based/GridGameMode.js` + `grid-logic.js` + `grid-player.js` + `grid-enemy.js` + `grid-particles.js` + `index.js` | Complete refactored grid engine (6 files); none are imported — `main.js` uses the older `src/game/` files inline. | Wire `GridGameMode` into `main.js` in place of the inline grid section; its companion files are imported inside it. |
| `src/intelligence/emotion-recognition.js` | Flat-path duplicate of the active `src/intelligence/emotional/emotion-recognition.js`; never imported. | Delete; all consumers use the `emotional/` path. |
| `src/intelligence/empathy-training.js` | Flat-path duplicate of `src/intelligence/emotional/empathy-training.js`; never imported. | Delete. |
| `src/intelligence/logic-puzzles.js` | Flat-path duplicate of `src/intelligence/cognitive/logic-puzzles.js`; never imported. | Delete. |
| `src/intelligence/strategic-thinking.js` | Flat-path duplicate of `src/intelligence/cognitive/strategic-thinking.js`; never imported. | Delete. |
| `src/modes/grid-mode.js` | `GridMode` class wrapping the existing `game/` logic; never imported in `main.js`, which handles grid logic inline. | Import and instantiate as the canonical grid mode, removing the inline grid section from `main.js`. |
| `src/modes/campaign-story.js` | Fourteen-chapter narrative campaign with playstyle assignments and cosmology mappings; import is commented out in `main.js` ("Reserved for NARRATIVE1"). | Uncomment the import in `main.js` and call `campaignStory.startChapter` from the campaign play-mode path. |
| `src/services/apiAgents.js` + `apiAgents.examples.js` + `runApiExamples.js` + `runOpenAIExamples.js` | Node.js Claude + GPT-4 API wrappers; require server-side execution and API keys not present in `.env`; cannot run in the browser bundle. | Move to a server/edge function; add `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` to `.env`; call via `fetch` from the browser. |
| `src/systems/ambient-music.js` | Older Tone.js music engine; superseded by `src/audio/music-engine.js`; never imported. | Delete or consolidate into the active music engine. |
| `src/systems/archetypes.js` | Duplicate archetype definitions (wall_jump, reveal, phase-walk, rewind, shield-burst); `main.js` uses `ARCHETYPES` from `src/core/constants.js`. | Delete; ensure `constants.js` is the single source of truth. |
| `src/systems/audio.js` | Older `AudioEngine` class using Web Audio API + Tone.js; superseded by `sfx-manager.js` + `music-engine.js`; never imported. | Delete or consolidate functionality. |
| `src/systems/campaign.js` | Full 30-level campaign narrative arc (3 acts, boss encounters, cutscene text); never imported — the active campaign is the hint-only `campaign-manager.js`. | Import in `main.js` alongside `campaignManager` to drive the full 30-level narrative arc. |
| `src/systems/cosmologies.js` | Top-level duplicate of `src/systems/cosmology/cosmologies.js`; never imported. | Delete; use the `cosmology/` subfolder version. |
| `src/systems/cosmology/tarot-archetypes.js` | Tarot archetype data and `getRandomArchetype` function; the import was removed from `main.js` and is reserved for a future COSMOLOGY1 task; produces no output. | Uncomment the import in `main.js` and call `getRandomArchetype` at dreamscape start to inject the drawn card name into messages. |
| `src/systems/dream-yoga.js` | Top-level duplicate of `src/systems/awareness/dream-yoga.js`; never imported. | Delete; use the `awareness/` subfolder version. |
| `src/systems/integration/progress-dashboard.js` | Full `drawDashboard(ctx, w, h)` panel reading the same `window._*` globals; never imported — `renderer.js` has an equivalent inline dashboard. | Import in `renderer.js` and replace the inline dashboard with this module to reduce `renderer.js` line count. |
| `src/systems/languages.js` | Older 16-language vocabulary-challenge system; superseded by `src/systems/learning/language-system.js`; never imported. | Delete. |
| `src/systems/leaderboard.js` | Real-time Supabase leaderboard with SQL schema and connection logic; Supabase URL/key are never configured; never imported. | Add credentials to `.env`, import in `main.js`, and call `addScore` on game-over. |
| `src/systems/learning-modules.js` | Older learning challenge dispatcher importing the unwired `languages.js` and `sigils.js`; superseded by `systems/learning/`. | Delete. |
| `src/systems/powerups.js` | Powerup type definitions (SHIELD, SPEED, FREEZE, DOUBLE_SCORE, etc.); only consumed by the unwired `grid-based/GridGameMode.js`. | Import in the grid section of `main.js` and apply powerup effects on tile collection. |
| `src/systems/recovery-tools.js` | Seven evidence-based recovery tool helpers (impulse buffer, consequence preview, etc.); never imported — functionality split between active `recovery/` and `cessation/` modules. | Delete or consolidate into the active recovery modules. |
| `src/systems/sampleAssets.js` | Programmatic `AudioBuffer` generators for embedded ambient/SFX sounds; never imported. | Import in `sfx-manager.js` as a fallback when external WAV files are absent. |
| `src/systems/session-analytics.js` | localStorage-based cross-session metrics (total sessions, minutes, peak score, dreamscape visits); never imported. | Import in `main.js`, call `recordSession` on game-over, and surface metrics in the dashboard. |
| `src/systems/sigils.js` | Older sigil pattern database (200+ patterns); superseded by `src/systems/learning/sigil-system.js`; never imported. | Delete. |
| `src/systems/undo.js` | `undoGameMove` function reverting grid state from history; only consumed by the unwired `grid-based/GridGameMode.js`. | Import in the grid section of `main.js` and wire to Ctrl+Z. |
| `src/systems/upgrade-shop.js` | Ten upgrade definitions with `apply(gameState)` functions; never imported — the active upgrade shop uses the `UPGRADE_SHOP` constant in `src/core/constants.js`. | Delete or replace the constants-based shop with this module's richer `apply` function definitions. |

---

## 3. DOCUMENTED ONLY

*Concepts described in `.md` files in this repository with zero corresponding source code in `src/`.*

| Documented in | What the doc describes | Code status |
|--------------|------------------------|-------------|
| `docs/vision/GAMEPLAY_MODES.md`, `docs/vision/ROADMAP.md` | **Platformer Mode** — side-scrolling platformer with consciousness themes, physics-based movement, and collectible nodes. | No `PlatformerMode.js` or related file exists anywhere. |
| `docs/vision/GAMEPLAY_MODES.md`, `docs/vision/ROADMAP.md` | **Online Competitive Multiplayer** — parallel dreamscapes, real-time score competition via optional leaderboard. | No networking code, no WebSocket/WebRTC layer, no server; local 2-player co-op does exist. |
| `docs/vision/GAMEPLAY_MODES.md`, `docs/vision/ROADMAP.md` | **Challenge Mode** — timed daily challenges with a fixed seed and a global leaderboard. | No `ChallengeMode.js`; only the Supabase leaderboard skeleton exists (itself unwired — Section 2). |
| `src/systems/learning/README.md`, `docs/vision/ARCHITECTURE.md` | **Grammar Patterns system** (`grammar-patterns.js`) — sentence-structure learning delivered through in-game messages. | File does not exist. |
| `src/systems/learning/README.md`, `docs/vision/ARCHITECTURE.md` | **Pronunciation Practice** (`pronunciation-practice.js`) — audio-based language practice using the Web Speech API. | File does not exist. |
| `src/systems/learning/README.md`, `docs/vision/ARCHITECTURE.md` | **Immersion Context** (`immersion-context.js`) — situational language use tied to dreamscape environments. | File does not exist. |
| `src/systems/learning/README.md`, `docs/vision/ARCHITECTURE.md` | **Mathematics sub-system** — dedicated files: `fibonacci-teaching.js`, `spatial-reasoning.js`, `problem-solving.js`. | None of these files exist; Fibonacci appears only as a scoring constant in `grid.js`. |
| `src/systems/learning/README.md` | **Meta-learning sub-system** — `attention-training.js`, `memory-techniques.js`, `transfer-learning.js`. | None of these files exist. |
| `src/intelligence/README.md` | **Social Intelligence system** (`social-intelligence.js`) — understanding social dynamics through dreamscape NPCs. | File does not exist; no NPC social-simulation logic is present. |
| `src/intelligence/README.md` | **Creative Problem-Solving system** (`creative-problem-solving.js`) — novel-solution metric tracked as a cognitive score. | File does not exist. |
| `docs/research/synthesis/DREAM_YOGA.md` | **Inter-player Shared Dream Space** — multiple players occupying the same dreamscape, seeing each other's reality-check signals. | No networking or shared-state code exists for this. |
| `docs/vision/ROADMAP.md`, `docs/vision/GAMEPLAY_MODES.md` | **Stoicism / Philosophy cosmology** — listed in the cosmology roadmap as a ninth tradition. | Not present in `src/systems/cosmology/cosmologies.js` (only 8 traditions implemented). |
| `docs/vision/ROADMAP.md`, `docs/vision/ARCHITECTURE.md` | **Weekly planetary rhythm quests** — Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn each assigned day-specific quests. | `temporal-system.js` reads the weekday but triggers no quests from it. |
| `docs/tasks/INSTALLATION.md`, `README.md` | **Steam Cloud Save** — player profile and high scores synced via Steam's remote storage API. | Only the Electron shell exists; no Steam SDK (`greenworks` / `Steamworks.js`) integration is present. |
| `README.md` | **Service worker / offline PWA** — app described as installable and functional offline. | No `sw.js` service worker and no Workbox setup; the app requires a live server after install. |
| `README.md`, `docs/vision/FEATURES.md` | **Live AI procedural dreamscape generation** — Claude / GPT-4 called in-game to generate dreamscape text. | `src/services/apiAgents.js` wraps both APIs but requires a server and API keys not shipped with the project; no in-game trigger or server endpoint exists. |
| `docs/tasks/AGENT_TASKS.md`, `docs/vision/FEATURES.md` | **Habit Replacement module** — suggests positive alternatives, tracks new habits, and builds game-use rituals. | No `habit-replacement.js` exists anywhere in `src/`. |
| `docs/vision/ROADMAP.md` | **Relapse Prevention module** (`relapse-prevention.js`) — early-warning system with emergency pause and trigger identification. | File does not exist. |

---

*End of audit.*
