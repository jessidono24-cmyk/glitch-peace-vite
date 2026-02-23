# GLITCH·PEACE — AUDIT REPORT 3

**Generated:** 2026-02-21  
**Method:** Full static import-graph trace from `src/main.js`, confirmed against file contents. Nothing is counted as implemented unless it is reachable from `src/main.js` via the import chain.

> Rule: If a file is not imported (directly or transitively) by `src/main.js`, it is **not implemented**, no matter how complete its code is.

---

## 1. ACTUALLY IMPLEMENTED

*Reachable from `src/main.js` and produces visible or audible browser output.*

| File | What it does |
|------|-------------|
| `src/core/constants.js` | Defines all tile types, dreamscape configs, archetypes, upgrade shop data, and fact lists consumed across the entire game. |
| `src/core/state.js` | Holds the live game state (phase, player stats, session data, high scores) and all setters; drives every frame of the state machine. |
| `src/core/utils.js` | `rnd()` and `pick()` helpers called throughout the game for random tile selection and particle generation. |
| `src/core/storage.js` | Reads and writes high scores, player profile, and timezone offset to `localStorage`; scores visibly persist between sessions. |
| `src/game/grid.js` | Generates the procedural tile grid and exports canvas-size helpers (`CW`, `CH`) used every frame; visible as the game board. |
| `src/game/enemy.js` | Nine-behavior enemy AI (chase, flee, orbit, rush, etc.) stepped every game frame; enemies render as tiles on the grid. |
| `src/game/player.js` | All player movement, tile interaction, archetype activation, and Matrix toggle; produces every player-move visual event. |
| `src/game/particles.js` | `burst()` and `resonanceWave()` particle effects triggered on tile collection and archetype activation. |
| `src/ui/renderer.js` | `drawGame()` renders the full tile grid + overlays every frame; also draws the press-H integration dashboard. |
| `src/ui/hud.js` | DOM health bar + score + level counter below the canvas; swaps to wave/kill display in Shooter and Rhythm modes. |
| `src/ui/menus.js` | All screen draw functions: title, onboarding, language, mode select, playstyle, dreamscape, cosmology, archetype, options, high scores, upgrade shop, pause, interlude, dead, achievements. |
| `src/rendering/sprite-player.js` | SVG mage and wraith sprites in `#sprite-layer` with CSS walk animation; player direction and hit state visually reflected. |
| `src/audio/sfx-manager.js` | WAV sample playback for movement, tile damage, peace collection, dream-complete, and boss-enter events. |
| `src/audio/music-engine.js` | Procedural Tone.js ambient score (calm → medium → tense) that shifts automatically with emotional distortion. |
| `src/systems/temporal-system.js` | Reads real date; returns enemy/insight/coherence multipliers applied every frame — visible as wave-difficulty variance. |
| `src/systems/emotional-engine.js` | Ten-emotion `EmotionalField`; drives CSS glitch animation classes and canvas tint on every frame. |
| `src/recovery/consequence-preview.js` | 3-step ghost-path overlay rendered ahead of the cursor near hazard tiles. |
| `src/recovery/impulse-buffer.js` | 1-second orange hold-bar before committing to a hazard tile; cancels on early key release. |
| `src/modes/shooter-mode.js` | Full wave-survival arena (3 enemy types, 4 weapon tiers, mouse aim); `update` + `render` loop active when `gameMode === 'shooter'`. |
| `src/modes/constellation-mode.js` | Star-node connection puzzle; 2D mode plus Three.js star-field composited onto canvas when `mode3d=true`. |
| `src/modes/meditation-mode.js` | Hazard-free somatic grid with animated breathing-circle overlay; no fail state. |
| `src/modes/coop-mode.js` | Local 2-player grid (P1 arrows / P2 WASD); individual HP bars and shared score visible on canvas. |
| `src/modes/rhythm-mode.js` | Four-column falling-note lane game with PERFECT/GOOD/MISS windows and 5-level progression. |
| `src/modes/campaign-manager.js` | Displays contextual tutorial hints on first visit to each dreamscape; tracked in-session. |
| `src/modes/campaign-story.js` | Campaign story mode instance wired to `startGame` for campaign playstyle. |
| `src/gameplay-modes/alchemy/AlchemyMode.js` | Element tiles (🜂🜄🜃🜁) collected and transmuted; Athanor bar and four-phase arc rendered to canvas. |
| `src/gameplay-modes/architecture/ArchitectureMode.js` | Tile-placement architectural mode with blueprint matching (SPACE/Q/E) and structural-integrity scoring on canvas. |
| `src/gameplay-modes/mycology/MycologyMode.js` | Mushroom foraging mode with 20+ species, edibility challenges, and mycelium-network tile mechanics. |
| `src/gameplay-modes/ornithology/OrnithologyMode.js` | Bird-observation mode with 30+ species, habitat tiles, and call-type challenges; fully rendered. |
| `src/systems/play-modes.js` | 13 play-style variants (Classic, Zen, Speedrun, etc.); `applyPlayMode` alters tile weights and enemy scale before `startGame`. |
| `src/systems/cosmology/cosmologies.js` | 8 cosmology definitions; selected cosmology modifies tile placement, enemy emotion, and NPC text in-game. |
| `src/systems/cosmology/chakra-system.js` | Chakra-activation flash drawn on canvas when gameplay events match chakra conditions; history tracked per session. |
| `src/systems/cosmology/tarot-archetypes.js` | One tarot archetype drawn randomly at dreamscape start; name injected into messages and interlude text. |
| `src/systems/awareness/dream-yoga.js` | Lucidity bar (0–100%) at the top-left of the play canvas; rises from INSIGHT tiles and decays on damage. |
| `src/systems/awareness/self-reflection.js` | Periodic reflection prompt rendered as an in-game message; count tracked and shown in the dashboard. |
| `src/systems/awareness/emergence-indicators.js` | Flash overlay when the player crosses awareness thresholds (first dream, high lucidity, reflection depth). |
| `src/systems/cessation/session-tracker.js` | Tracks elapsed play time; triggers break-reminder messages at configurable intervals. |
| `src/systems/cessation/urge-management.js` | Box/4-7-8 breathing prompts during prolonged sessions; state rendered in the dashboard. |
| `src/systems/difficulty/adaptive-difficulty.js` | Age/skill tier (child/teen/adult/nightmare) from `PLAYER_PROFILE`; adjusts enemy count, tile density, vocab tier. |
| `src/systems/rpg/character-stats.js` | Five RPG stats with XP; level and stat bar rendered in the top-right of the canvas during play. |
| `src/systems/rpg/archetype-dialogue.js` | NPC dialogue lines chosen from the player's archetype; shown in the message area on tile-contact events. |
| `src/systems/rpg/quest-system.js` | 13 quest chains with live objectives (collect tiles, pause, activate archetypes); active quest log rendered below the mode banner. |
| `src/systems/alchemy-system.js` | Elemental collection + Athanor transmutation bar; four-phase arc state visible in the canvas during alchemy mode. |
| `src/systems/boss-system.js` | Five boss types spawn at level thresholds; boss HP, phase-transition alerts, and sfx triggered in-game. |
| `src/systems/biome-system.js` | Dominant-emotion-driven biome color overlays update tile tints on the canvas every frame. |
| `src/systems/campaign-story.js` | `CAMPAIGN_CHAPTERS` data, chapter-progress persistence, and dreamscape-unlock helpers. |
| `src/systems/achievements.js` | 20+ achievements tracked per session and lifetime; unlock popup rendered in every mode. |
| `src/systems/learning/language-system.js` | 16-language definitions; when `langImmersion` is on, HUD labels switch to the target language. |
| `src/systems/learning/vocabulary-engine.js` | Bilingual CEFR A1–C2 vocab cards on INSIGHT tile steps; interlude word shown on dream completion. |
| `src/systems/learning/sigil-system.js` | Geometric pattern-matching overlay triggered on ARCH tile contact; sigil visible as `window._activeSigil`. |
| `src/systems/learning/pattern-recognition.js` | Fibonacci/grid pattern observation tracked per session; banner and score reflected in the dashboard. |
| `src/intelligence/cognitive/logic-puzzles.js` | Cumulative IQ-proxy score from logic challenges; visible in the press-H integration dashboard. |
| `src/intelligence/cognitive/strategic-thinking.js` | Counts deliberate impulse-buffer cancellations; strategic score tracked and shown in the dashboard. |
| `src/intelligence/emotional/empathy-training.js` | EQ training score accumulates from emotion-congruent tile choices; EQ score in the dashboard. |
| `src/intelligence/emotional/emotion-recognition.js` | Emotion-labeling score tracked per session; shown in the dashboard. |

---

## 2. CODE EXISTS BUT BROKEN/UNWIRED

*Files that exist in `src/` but are never imported by the `src/main.js` dependency chain — produce zero visible output.*

| File(s) | Why broken | What it needs |
|---------|-----------|---------------|
| `src/core/event-bus.js` | Pub/sub `EventBus` class exists but nothing imports or uses it. | Import in `main.js` and route cross-system events through it to decouple the large inline event handlers. |
| `src/core/emotional-engine.js` | Duplicate `EmotionalField` with a different emotion set; `main.js` uses `src/systems/emotional-engine.js` instead. | Delete or merge; fix any files pointing to this path. |
| `src/core/temporal-system.js` | Duplicate `TemporalSystem` class; only consumed by the also-unwired `GameStateManager.js`. | Delete or merge with `src/systems/temporal-system.js`. |
| `src/core/game-engine/GameStateManager.js` | Mode-agnostic state container; never imported; its internal import of `'../emotional-engine.js'` resolves to the unwired core duplicate. | Fix its import path then wire into `main.js` as the global state holder. |
| `src/core/game-engine/InputManager.js` | Full keyboard + gamepad input abstraction class; never imported; `main.js` uses a raw `keys` Set instead. | Import in `main.js` and route all input events through it; this would also give clean gamepad deadzone handling. |
| `src/core/interfaces/GameMode.js` | Base `GameMode` interface; imported only by `gameplay-modes/` classes whose `index.js` files are themselves unwired. | Enforce this as the base class for all modes once the registry is wired. |
| `src/gameplay-modes/ModeRegistry.js` | Mode registry with `register` / `get` / `list` API; never instantiated. | Instantiate in `main.js`, then import each `gameplay-modes/*/index.js` to auto-register. |
| `src/gameplay-modes/alchemy/index.js` | Re-export wrapper that registers `AlchemyMode` with the registry; bypassed by `main.js` importing `AlchemyMode.js` directly. | Use `index.js` imports once `ModeRegistry` is wired. |
| `src/gameplay-modes/architecture/index.js` | Same registry-registration wrapper as alchemy; bypassed. | Same fix. |
| `src/gameplay-modes/mycology/index.js` | Same pattern; bypassed. | Same fix. |
| `src/gameplay-modes/ornithology/index.js` | Same pattern; bypassed. | Same fix. |
| `src/gameplay-modes/grid-based/GridGameMode.js` + `grid-logic.js` + `grid-player.js` + `grid-enemy.js` + `grid-particles.js` + `index.js` | Complete refactored grid engine (6 files); none are imported — `main.js` uses the older `src/game/` files inline. | Wire `GridGameMode` into `main.js` in place of the inline grid section; its companion files are imported inside it. |
| `src/gameplay-modes/constellation/ConstellationMode.js` + `index.js` | Duplicate of the active `src/modes/constellation-mode.js`; never imported. | Remove duplicate or replace the active mode with this class. |
| `src/gameplay-modes/constellation/Constellation3DMode.js` | Three.js 3D constellation variant; never imported; 3D is currently a flag inside the active constellation mode. | Import in `main.js` and add a `constellation-3d` branch in the game loop. |
| `src/gameplay-modes/rhythm/RhythmMode.js` + `index.js` | Duplicate of active `src/modes/rhythm-mode.js`; never imported. | Remove or replace. |
| `src/gameplay-modes/rpg/RPGMode.js` + `index.js` | Full RPG mode with shadow enemies, named zones, and multi-branch dialogue; never imported — `main.js` has a bespoke inline RPG path. | Import and instantiate alongside the other `gameplay-modes/` instances, replacing the inline RPG path. |
| `src/gameplay-modes/shooter/ShooterMode.js` + `index.js` | Duplicate of active `src/modes/shooter-mode.js`; never imported. | Remove or replace. |
| `src/intelligence/emotion-recognition.js` | Flat-path duplicate of `src/intelligence/emotional/emotion-recognition.js`. | Delete; all consumers should use the `emotional/` path. |
| `src/intelligence/empathy-training.js` | Flat-path duplicate of `src/intelligence/emotional/empathy-training.js`. | Delete. |
| `src/intelligence/logic-puzzles.js` | Flat-path duplicate of `src/intelligence/cognitive/logic-puzzles.js`. | Delete. |
| `src/intelligence/strategic-thinking.js` | Flat-path duplicate of `src/intelligence/cognitive/strategic-thinking.js`. | Delete. |
| `src/modes/game-mode.js` | Base `GameMode` class for the `modes/` folder; only imported by `src/modes/grid-mode.js` which is itself unwired. | Used only if `grid-mode.js` is wired. |
| `src/modes/grid-mode.js` | `GridMode` class wrapping the existing `game/` logic; never imported — `main.js` handles the grid inline. | Import and instantiate as the canonical grid mode, removing the inline grid section. |
| `src/modes/mode-manager.js` | `ModeManager` orchestrator; never imported. | Import in `main.js` and delegate mode-switching to it. |
| `src/rendering/boss-renderer-3d.js` | Three.js procedural 3D boss geometry (fear guardian, void sovereign, despair weaver); never imported by `main.js` — AUDIT_REPORT_2 listed it as implemented via `renderer.js` but no import chain confirms this. | Import in `renderer.js` and call inside `drawGame` during boss encounters. |
| `src/rendering/three-layer.js` | WebGL render bridge for Three.js compositing; directly imported by `modes/constellation-mode.js` ✓ (see note below). | Already wired via constellation mode; this row may be a false alarm — verify the constellation 3D path reaches it. |
| `src/rendering/void-nexus-3d.js` | Full Three.js top-down 3D scene for the Void Nexus dreamscape; never imported by `main.js`. | Import in `renderer.js` and activate when `viewMode === 'iso'` and dreamscape is `void_nexus`. |
| `src/services/apiAgents.js` + `apiAgents.examples.js` + `runApiExamples.js` + `runOpenAIExamples.js` | Node.js Claude + GPT-4 wrappers; require API keys not in `.env`; can't run in the browser bundle. | Move to a server/edge function; call via `fetch` from the browser with API keys in a secure backend. |
| `src/systems/ambient-music.js` | Older Tone.js music engine; superseded by `src/audio/music-engine.js`; not imported. | Delete or consolidate. |
| `src/systems/archetypes.js` | Duplicate archetype definitions; `main.js` uses `ARCHETYPES` from `src/core/constants.js`. | Delete; constants.js is the single source of truth. |
| `src/systems/audio.js` | Older `AudioEngine` class using Web Audio API + Tone.js; superseded by `sfx-manager.js` + `music-engine.js`. | Delete or consolidate. |
| `src/systems/campaign.js` | Full 30-level campaign narrative arc (3 acts, boss encounters); never imported — `campaign-manager.js` provides only hint-system level campaign. | Import alongside `campaignManager` to drive the full arc. |
| `src/systems/cosmologies.js` | Top-level duplicate of `src/systems/cosmology/cosmologies.js`; not imported. | Delete; use the `cosmology/` subfolder version. |
| `src/systems/dream-yoga.js` | Top-level duplicate of `src/systems/awareness/dream-yoga.js`; not imported. | Delete; use the `awareness/` subfolder version. |
| `src/systems/dreamscapes.js` | Dreamscape theme/tile-bias definitions; only consumed by unwired `gameplay-modes/` files. | Import in `main.js` (or `grid.js`) and apply `tileBias` overrides during `buildDreamscape`. |
| `src/systems/integration/progress-dashboard.js` | Full `drawDashboard` panel with all system metrics; never imported — the inline dashboard in `renderer.js` serves this role. | Replace the inline renderer dashboard with this module to keep `renderer.js` clean. |
| `src/systems/languages.js` | Older 16-language system; superseded by `src/systems/learning/language-system.js`. | Delete. |
| `src/systems/leaderboard.js` | Real-time Supabase leaderboard; Supabase URL/key never configured; never imported. | Add credentials to `.env` and import in `main.js`; call `addScore` on game-over. |
| `src/systems/learning-modules.js` | Older learning challenge dispatcher; imports the unwired `languages.js` and `sigils.js`; superseded by `systems/learning/`. | Delete. |
| `src/systems/powerups.js` | Powerup type definitions; only consumed by the unwired `grid-based/GridGameMode.js`. | Import in the grid section of `main.js` and apply powerup effects on tile collection. |
| `src/systems/recovery-tools.js` | 7 recovery-tool definitions; functionality split across active `recovery/` and `cessation/` modules. | Delete or consolidate into the active modules. |
| `src/systems/sampleAssets.js` | Programmatic `AudioBuffer` generators as WAV fallbacks; never imported. | Import in `sfx-manager.js` as a fallback when external WAV files are absent. |
| `src/systems/session-analytics.js` | Cross-session metrics (total sessions, minutes, peak score, dreamscape visits); never imported. | Import in `main.js`; call `recordSession` on game-over; surface in the dashboard. |
| `src/systems/sigils.js` | Older sigil pattern database; superseded by `src/systems/learning/sigil-system.js`; not imported. | Delete. |
| `src/systems/undo.js` | `undoGameMove` function reverting grid state from history; only imported by the unwired `GridGameMode.js`. | Import in the grid section of `main.js` and wire to Ctrl+Z. |
| `src/systems/upgrade-shop.js` | Ten upgrade definitions with `apply(gameState)` functions; superseded by `UPGRADE_SHOP` constant in `constants.js`. | Delete or replace the constants-based shop with this module's richer apply-function definitions. |

---

## 3. DOCUMENTED ONLY

*Described in `.md` files in this repository with zero corresponding code in `src/`.*

| Documented in | What it describes |
|---------------|------------------|
| `GAMEPLAY_MODES.md`, `ROADMAP.md` | **Tarot card game mode** — preset decks, guided custom deck building with symbolic accuracy; no `TarotMode.js` exists. |
| `GAMEPLAY_MODES.md`, `ROADMAP.md` | **True first-person shooter** — distinct from the twin-stick shooter; no first-person rendering or camera system exists. |
| `AGENT_TASKS.md`, `FEATURES.md` | **Learning Mode with subject selection** — math, physics, neuroscience, psychology, sociology, philosophy, languages, statistics, biology, mycology, ornithology; no `LearningMode.js` exists. |
| `ROADMAP.md` | **Stoicism/Philosophy cosmology** — not present in `src/systems/cosmology/cosmologies.js`. |
| `ROADMAP.md`, `ARCHITECTURE.md` | **Weekly planetary rhythm quests** — Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn mapped to days with day-specific missions; `temporal-system.js` reads weekday but triggers no quests. |
| `GAMEPLAY_MODES.md`, `ROADMAP.md` | **Platformer Mode** — side-scrolling with consciousness themes; no `PlatformerMode.js` exists. |
| `ROADMAP.md`, `DREAM_YOGA.md` | **Online shared dream space** — multiple players in the same dreamscape; no networking layer (WebSocket/WebRTC) exists. |
| `ROADMAP.md`, `GAMEPLAY_MODES.md` | **Challenge Mode** — timed daily challenges with fixed seed and global leaderboard; only the Supabase skeleton exists (itself unwired). |
| `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Grammar Patterns system** (`grammar-patterns.js`) — sentence-structure learning via in-game messages; file does not exist. |
| `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Pronunciation Practice** (`pronunciation-practice.js`) — Web Speech API language practice; file does not exist. |
| `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Immersion Context** (`immersion-context.js`) — situational language use per dreamscape; file does not exist. |
| `src/systems/learning/README.md`, `ARCHITECTURE.md` | **Mathematics sub-system** — `fibonacci-teaching.js`, `spatial-reasoning.js`, `problem-solving.js`; none of these files exist. |
| `src/systems/learning/README.md` | **Meta-learning sub-system** — `attention-training.js`, `memory-techniques.js`, `transfer-learning.js`; none exist. |
| `src/intelligence/README.md` | **Social Intelligence system** (`social-intelligence.js`) — NPC social-simulation; file does not exist. |
| `src/intelligence/README.md` | **Creative Problem-Solving system** (`creative-problem-solving.js`) — novel-solution metric; file does not exist. |
| `INSTALLATION.md`, `README.md` | **Steam Cloud Save** — no Steam SDK (`greenworks` / `Steamworks.js`) integration; only the Electron shell exists. |
| `research/cognitive-architecture/README.md` | **Cognitive architecture research files** — directory is a placeholder template with no actual research documents. |
| `research/neuroscience/README.md` | **Neuroscience research files** — same: placeholder template only. |
| `research/psychology/README.md` | **Psychology research files** — same: placeholder template only. |
| `research/sociology/README.md` | **Sociology research files** — same: placeholder template only. |
| `research/synthesis/README.md` | **Synthesis research files** — same: placeholder template only. |

---

## 4. RECENTLY ADDED (last 7 days)

*All files in this repository were added in the single merge commit `2668ab1` (PR #52 — "apply-research-docs-to-systems", 2026-02-21). The working branch adds only `AUDIT_REPORT_3.md` itself. The table below highlights the most significant additions and their wired status.*

| File(s) | Wired? | Notes |
|---------|--------|-------|
| `src/core/game-engine/GameStateManager.js` | ❌ No | New mode-agnostic state container; broken import of `../emotional-engine.js` (resolves to unwired core duplicate). |
| `src/core/game-engine/InputManager.js` | ❌ No | New full keyboard + gamepad abstraction with deadzone handling; not yet integrated. |
| `src/core/interfaces/GameMode.js` | ❌ No | New base interface for gameplay modes; only used by the `gameplay-modes/` classes whose index files are themselves unwired. |
| `src/core/event-bus.js` | ❌ No | New pub/sub EventBus; not yet used by any file. |
| `src/gameplay-modes/ModeRegistry.js` | ❌ No | New dynamic mode registry; never instantiated. |
| `src/gameplay-modes/grid-based/` (6 files) | ❌ No | Complete refactored grid engine; no file in the chain imports it. |
| `src/gameplay-modes/rpg/RPGMode.js` | ❌ No | Full RPG mode class; never imported. |
| `src/gameplay-modes/rhythm/RhythmMode.js` | ❌ No | Duplicate rhythm mode; active version is `src/modes/rhythm-mode.js`. |
| `src/gameplay-modes/shooter/ShooterMode.js` | ❌ No | Duplicate shooter; active version is `src/modes/shooter-mode.js`. |
| `src/gameplay-modes/constellation/Constellation3DMode.js` | ❌ No | New 3D constellation variant; never imported. |
| `src/systems/cosmology/chakra-system.js` | ✅ Yes | Newly structured cosmology submodule; fully wired into main game loop. |
| `src/systems/cosmology/cosmologies.js` | ✅ Yes | Cosmology data reorganized into subfolder; active in cosmology select screen. |
| `src/systems/cosmology/tarot-archetypes.js` | ✅ Yes | New tarot archetype data; drawn at dreamscape start. |
| `src/systems/awareness/dream-yoga.js` | ✅ Yes | Dream yoga system reorganized into subfolder; fully active. |
| `src/systems/awareness/self-reflection.js` | ✅ Yes | Self-reflection prompts; active in game loop. |
| `src/systems/awareness/emergence-indicators.js` | ✅ Yes | Awareness threshold overlays; active in game loop. |
| `src/systems/cessation/session-tracker.js` | ✅ Yes | Session timing and break reminders; active. |
| `src/systems/cessation/urge-management.js` | ✅ Yes | Breathing pattern prompts; active in game loop. |
| `src/systems/difficulty/adaptive-difficulty.js` | ✅ Yes | Age-tier difficulty; applied from player profile at startup. |
| `src/systems/integration/progress-dashboard.js` | ❌ No | New modular dashboard; superseded by the inline dashboard in `renderer.js`. |
| `src/systems/rpg/character-stats.js` | ✅ Yes | RPG stats; rendered on canvas during play. |
| `src/systems/rpg/archetype-dialogue.js` | ✅ Yes | NPC dialogue; shown in message area on tile events. |
| `src/systems/rpg/quest-system.js` | ✅ Yes | Quest log; rendered on canvas. |
| `src/intelligence/cognitive/logic-puzzles.js` | ✅ Yes | IQ-proxy score; tracked per session. |
| `src/intelligence/cognitive/strategic-thinking.js` | ✅ Yes | Strategic score; tracked per session. |
| `src/intelligence/emotional/empathy-training.js` | ✅ Yes | EQ score; tracked per session. |
| `src/intelligence/emotional/emotion-recognition.js` | ✅ Yes | Emotion recognition score; tracked per session. |
| `research/*/README.md` (5 files) | N/A | Placeholder scaffold templates with no actual research content yet. |
| `src/ui/systems/*/README.md` (4 files) | N/A | Architecture documentation for planned UI submodules; no code. |
| `src/ui/integration/README.md` | N/A | Documents the planned integration dashboard UI layer; no code. |
| `src/ui/intelligence/README.md` | N/A | Documents the planned intelligence UI; no code. |
| `AUDIT_REPORT.md`, `AUDIT_REPORT_2.md` | N/A | Previous audit reports generated the same day as this one. |
| `task-E2.md`, `task-E3.md`, `task-E4.md`, `task-E4-A.md`, `task-E4-B.md`, `task-T1.md`, `task-T2.md` | N/A | Agent task specifications; not code. |
| `tests/canvas-fill.spec.js`, `tests/smoke.spec.js`, `tests/modes.spec.js`, `tests/interactive-tiles.spec.js` | N/A | Playwright test suite; test infrastructure, not game code. |

---

## KEY FINDINGS

1. **The game is actually playable.** The 55 wired files in Section 1 form a complete, running game with 10 named modes, 18 dreamscapes, 8 cosmologies, consciousness systems, and audio.

2. **Largest structural debt:** 41 files in Section 2 contain complete, sometimes excellent code that produces zero output. The `gameplay-modes/` classes (AlchemyMode, ArchitectureMode, MycologyMode, OrnithologyMode) are imported and run — but 6 of the 10 named modes in that folder are duplicates of older `modes/` classes, causing confusion about which version is "real."

3. **The new architecture (GameStateManager + InputManager + GameMode + ModeRegistry) is fully designed but 0% wired.** It represents the intended future refactor of the inline `main.js` state machine but hasn't been connected yet.

4. **Research directories are empty scaffolds.** All 5 `research/*/README.md` files are placeholder templates. No actual research documents have been placed in them yet.

5. **Why the GitHub page may not be updating:** The git log shows only 2 commits in this clone (a grafted merge + the audit branch). Changes made on other branches are not reaching `main` because PRs are merging into feature branches rather than into `main`, or the `gh-pages` workflow is not re-running after the merge. Run `git log --oneline --all` from your local machine to see the full branch topology.
