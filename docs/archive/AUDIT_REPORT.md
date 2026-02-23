# GLITCH·PEACE Codebase Audit Report

**Generated:** 2026-02-21  
**Method:** Static import-graph tracing from `src/main.js` → active dependency tree, cross-referenced with live browser test (Vite dev server) and `.md` documentation.

> A feature is counted as *implemented* only when its code is reachable from `src/main.js`, its output is rendered to the canvas or DOM, and it was confirmed visually during the browser test session.

---

## 1. ACTUALLY IMPLEMENTED
*Features whose code exists, is imported by the active entry point, and produces visible output in the browser.*

| # | Feature | File(s) | Actual state |
|---|---------|---------|--------------|
| 1 | **Onboarding age picker** | `src/ui/menus.js` → `drawOnboarding` | Four age groups (5-7 / 8-11 / 12-15 / 16+) render on first launch and route to language and confirmation steps before the title screen. |
| 2 | **Title screen + animated star field** | `src/ui/menus.js` → `drawTitle` | Every frame: deep-space gradient, 200-star field with brightness pulse, GLITCH·PEACE glyph with cyan glow, seven menu items with hover highlight. |
| 3 | **Mode select screen (10 modes listed)** | `src/ui/menus.js` → `drawModeSelect` | Draws ten named options (Grid Classic, Shooter, RPG, Ornithology, Mycology, Architecture, Constellation, Alchemy, Rhythm, Constellation 3D) with animated selection highlight and sub-labels. |
| 4 | **Play-mode variations** | `src/systems/play-modes.js` | Thirteen named play styles (Classic, Zen, Speedrun, Puzzle, Survival Horror, Roguelike, Pattern, Boss Rush, Pacifist, Reverse, Campaign, Ritual, Daily) selected at `playmodesel` screen; each modifies tile weights, enemy count, and hazard scale before `startGame`. |
| 5 | **Dreamscape select screen** | `src/ui/menus.js` → `drawDreamSelect` | 18-dreamscape picker; each shows unique name, flavor text, and tile distribution; player navigates with ↑↓ before starting. |
| 6 | **Cosmology select screen** | `src/ui/menus.js` → `drawCosmologySelect` | Eight cosmology overlays (Hindu, Celtic, Egyptian, Norse, Aztec, Taoist, Indigenous, Hermetic) listed at `cosmologysel` screen; selection modifies enemy emotion and tile behavior. |
| 7 | **Archetype select screen** | `src/ui/menus.js` → `drawArchetypeSelect` | Five archetypes (Dragon, Child Guide, Orb, Captor-Teacher, Protector) displayed in a grid; selected archetype's power is pre-loaded for the run. |
| 8 | **Grid Roguelike** | `src/game/grid.js`, `src/game/player.js`, `src/game/enemy.js`, `src/ui/renderer.js` | Full tile-based grid game: 17 tile types, procedural level generation, 9 enemy AI behaviors, peace-node collection, Matrix A/B toggle (SHIFT), particle effects; playable. |
| 9 | **Twin-stick Shooter mode** | `src/modes/shooter-mode.js` | Wave-survival arena with 3 enemy types, 7 powerup types, mouse aim, 4 weapon tiers, kill counter, enemy-separation physics; own update/render loop active in `gameMode === 'shooter'` branch. |
| 10 | **Constellation mode** | `src/modes/constellation-mode.js` | Star-node navigation puzzle: INSIGHT/ARCHETYPE tiles highlighted as stars; stepping them in sequence draws constellation lines; win when all nodes collected. |
| 11 | **Constellation 3D mode** | `src/rendering/three-layer.js`, `src/modes/constellation-mode.js` | Three.js off-screen WebGL canvas (`getStarField`/`getNebula`) composited onto the main 2D canvas via `ctx.drawImage`; 400-star volumetric star field + 2 000-particle gaussian nebula visible when `mode3d=true`. |
| 12 | **Rhythm mode** | `src/modes/rhythm-mode.js` | Four-column falling-note lane game; A/S/D/F key bindings; ±80 ms PERFECT / ±180 ms GOOD / MISS timing windows; procedural note patterns per dreamscape; 5-level progression with palette changes. |
| 13 | **Meditation mode** | `src/modes/meditation-mode.js` | Hazard-free grid with somatic tiles (BODY_SCAN, BREATH_SYNC, ENERGY_NODE, GROUNDING) that display breathing-prompt overlays; animated breath circle guides inhale/exhale; no failure state. |
| 14 | **Local 2-player Co-op mode** | `src/modes/coop-mode.js` | Two players on the same grid (P1 arrows, P2 WASD); shared score, individual HP bars; wave progression; session ends when either player dies or all peace nodes are collected. |
| 15 | **Emotional Field system** | `src/systems/emotional-engine.js` | Ten-emotion model (joy, hope, trust, surprise, fear, sadness, disgust, anger, shame, anticipation); calculates live valence, coherence, distortion, synergy; drives canvas glitch CSS animation intensity, realm background tints, and damage/healing multipliers every frame. |
| 16 | **CSS glitch animations** | `index.html` (keyframes) + `src/main.js` | Three mutually exclusive `@keyframes` classes (`glitch-light/medium/heavy`) applied to the canvas element based on `EmotionalField.distortion`; fully suppressed by `reduced-motion` flag. |
| 17 | **Isometric 3D tilt (I key)** | `src/main.js` + `index.html` CSS | Press I toggles `.isometric` on `#canvas-wrapper`; applies `perspective(800px) rotateX(18deg) scale(1.05)` to both canvas and `#sprite-layer`, giving a 3D bird's-eye feel. |
| 18 | **SVG sprite overlay** | `src/rendering/sprite-player.js`, `index.html` CSS | Mage (player) and Wraith (enemy) SVG sprites positioned as absolute `div`s in `#sprite-layer` above the canvas; CSS `@keyframes player-walk` bob cycle; boss sprite uses a separate `boss-rotate` animation. |
| 19 | **Temporal system** | `src/systems/temporal-system.js` | Reads current date on startup; computes 8 lunar phases and 7 weekday rhythms; returns `enemyMul`, `insightMul`, `coherenceMul` applied every game frame to enemy speed and reward scaling. |
| 20 | **Adaptive difficulty** | `src/systems/difficulty/adaptive-difficulty.js` | Tier (child/teen/adult/nightmare) loaded from `PLAYER_PROFILE.ageGroup` at startup; adjusts enemy count, tile density, and move-speed limits for the session. |
| 21 | **HUD** | `src/ui/hud.js` | HTML HUD bar (bottom of viewport) shows health bar, level, score, and objective count during play; swaps to wave/kill display in Shooter mode; hidden on all menu screens. |
| 22 | **Integration dashboard (H key)** | `src/ui/renderer.js` → `drawDashboard` | Press H overlays a full-screen stats panel drawn on the game canvas: intelligence scores, awareness metrics, recovery data, chakra state, language progress, alchemy phase, RPG quest log; backed by `window._*` globals set each frame. |
| 23 | **Achievement system** | `src/systems/achievements.js` | 20+ achievement definitions (first move, score thresholds, mode completions, etc.); unlock popup rendered in every mode; all data persisted to localStorage. |
| 24 | **Upgrade shop** | `src/ui/menus.js` → `drawUpgradeShop`, `src/core/constants.js` UPGRADE_SHOP | Press U with insight tokens to buy run-scoped upgrades (HP boost, shield, matrix mastery, phase-walk, etc.); purchase deducted from token count immediately. |
| 25 | **High scores** | `src/core/storage.js`, `src/ui/menus.js` → `drawHighScores` | Top-10 scores saved to localStorage per dreamscape; dedicated screen accessible from title; populated after every game-over. |
| 26 | **Dream yoga / lucidity meter** | `src/systems/awareness/dream-yoga.js` | Lucidity bar (0–100%) rendered as a small purple bar in the top-left of the play canvas; rises from INSIGHT tile steps and body scans, decays on damage; dream signs logged to localStorage across sessions. |
| 27 | **Impulse buffer** | `src/recovery/impulse-buffer.js` | 1-second hold delay before committing a move into a hazard tile; an orange progress bar appears at the tile edge while holding; releasing early cancels the move. |
| 28 | **Consequence preview** | `src/recovery/consequence-preview.js` | Draws a 3-step ghost-path overlay ahead of the cursor when the player hesitates near a hazard; shows tile type and HP change at each future step. |
| 29 | **Session tracker** | `src/systems/cessation/session-tracker.js` | Tracks elapsed play time since session start; triggers a gentle break-reminder message at configurable intervals; data exposed to the integration dashboard. |
| 30 | **Urge management** | `src/systems/cessation/urge-management.js` | Surfing/breathing prompts fired after prolonged sessions; urge-surfing state machine exposed via `window._urgeManagement` to the dashboard. |
| 31 | **Self reflection** | `src/systems/awareness/self-reflection.js` | Periodic reflection prompt rendered as an in-game message; tracks total reflections per session and lifetime, visible in the integration dashboard. |
| 32 | **Emergence indicators** | `src/systems/awareness/emergence-indicators.js` | Flash overlay drawn in the renderer when the player crosses awareness thresholds (first dream, high lucidity, etc.); label and description shown for 3 seconds. |
| 33 | **Chakra system** | `src/systems/cosmology/chakra-system.js` | Chakra-activation flash overlay rendered in the game canvas when gameplay events match chakra conditions; activation history tracked per session. |
| 34 | **Tarot archetypes** | `src/systems/cosmology/tarot-archetypes.js` | One tarot archetype drawn randomly at dreamscape start; name and meaning injected into messages and interlude text. |
| 35 | **Cosmologies** | `src/systems/cosmology/cosmologies.js` | Eight cosmology definitions with emotion mappings and tile-bias overrides; active cosmology modifies tile placement and NPC speech in grid mode. |
| 36 | **Boss system** | `src/systems/boss-system.js`, `src/rendering/boss-renderer-3d.js` | Five boss types (Fear Guardian 👁, Chaos Bringer ⚡, Pattern Master ◉, Void Keeper ◈, Integration Boss ✦) spawn at level thresholds; 3D Three.js boss geometry composited onto 2D canvas during boss encounters. |
| 37 | **Void Nexus 3D dreamscape** | `src/rendering/void-nexus-3d.js` | Replaces the flat grid with a Three.js top-down 3D scene (crystalline pillars, obsidian walls, glowing player orb) when `viewMode === 'iso'` and the active dreamscape is `void_nexus`. |
| 38 | **RPG mode (grid-based)** | `src/main.js` game loop, `src/systems/rpg/` | Selecting RPG starts a grid game with an 18×18 map, five named zones, NPC dialogue trees (Keeper/Scholar/Seer/Spark/Healer), a visible quest log banner, and character level displayed in the HUD. |
| 39 | **Quest system** | `src/systems/rpg/quest-system.js` | Thirteen quest chains with objectives (collect N tiles, move N times, pause, etc.); active quests rendered as a bordered list below the mode banner in the play canvas. |
| 40 | **Character stats** | `src/systems/rpg/character-stats.js` | Strength/Wisdom/Empathy/Resilience/Clarity stats; level and XP percentage shown in the top-right of the game canvas during play. |
| 41 | **Archetype dialogue** | `src/systems/rpg/archetype-dialogue.js` | NPC dialogue lines selected based on player archetype choice; shown in the in-game message area on tile contact events. |
| 42 | **Alchemy mode (grid overlay)** | `src/systems/alchemy-system.js` | Active when `_currentModeType === 'alchemy'`; elements (🜂Fire 🜄Water 🜃Earth 🜁Air) collected from matching tiles; Athanor transmutation bar shown at the bottom of the play screen; four-phase arc (Nigredo → Albedo → Rubedo → Aurora). |
| 43 | **Biome system** | `src/systems/biome-system.js` | Biome color overlays and tile-behavior tweaks update each frame driven by the dominant emotion from the emotional field. |
| 44 | **Language / bilingual immersion** | `src/systems/learning/language-system.js` | Sixteen languages defined; when `langImmersion` is on, menu labels and HUD text are replaced with target-language translations; onboarding step 2 selects native + target language pair. |
| 45 | **Vocabulary engine** | `src/systems/learning/vocabulary-engine.js` | Bilingual vocabulary cards appear on INSIGHT tile steps; CEFR A1–C2 word bank; score reported to the integration dashboard. |
| 46 | **Sigil system** | `src/systems/learning/sigil-system.js` | Geometric pattern-matching challenges triggered on ARCH tile contact; uses a database of elemental visual primitives. |
| 47 | **Pattern recognition** | `src/systems/learning/pattern-recognition.js` | Fibonacci and grid-layout pattern detection tracked per session; score exposed to the integration dashboard. |
| 48 | **Logic puzzles** | `src/intelligence/cognitive/logic-puzzles.js` | In-game logic challenges scored as an IQ proxy; cumulative IQ score visible in the integration dashboard. |
| 49 | **Strategic thinking tracker** | `src/intelligence/cognitive/strategic-thinking.js` | Counts deliberate impulse cancellations; strategic score tracked and shown in dashboard. |
| 50 | **Empathy training** | `src/intelligence/emotional/empathy-training.js` | EQ-training score accumulates from emotion-congruent tile choices; reported to dashboard. |
| 51 | **Emotion recognition** | `src/intelligence/emotional/emotion-recognition.js` | Recognizes and scores player-selected emotion responses; EQ score shown in dashboard. |
| 52 | **Ornithology flavor** | `src/main.js`, `src/core/constants.js` (BIRD_FACTS) | Selecting "Ornithology" starts a normal grid game labeled "ORNITHOLOGY"; rotating bird facts from a 30-entry database are displayed as in-game messages when the player enters the `forest_sanctuary` dreamscape. |
| 53 | **Mycology flavor** | `src/main.js`, `src/core/constants.js` (MUSHROOM_FACTS) | Selecting "Mycology" starts a normal grid game labeled "MYCOLOGY"; rotating mushroom facts are shown in the `mycelium_depths` dreamscape; toxic vs. edible species names appear in messages. |
| 54 | **Campaign manager** | `src/modes/campaign-manager.js` | Tutorial hint set displayed on first visit to each dreamscape (up to 3 contextual tips); sequential dreamscape unlock tracked in-session. |
| 55 | **Tone.js music engine** | `src/audio/music-engine.js` | Procedural ambient score: calm (C-major arpeggios, 60 BPM) → medium (minor scale, 80 BPM) → tense (dissonant clusters, 120 BPM); switches automatically with game mode and emotional distortion level. |
| 56 | **SFX manager** | `src/audio/sfx-manager.js` | WAV sample playback (`public/sfx/sample1-3.wav`) for menu navigation, selection, tile damage, and peace-node collection. |
| 57 | **Gamepad support** | `src/main.js` → `pollGamepad` | Left stick and D-pad navigation; A/B/X/Y/LB/RB/Start/Select mapped in grid mode; Start/Select/trigger bindings active in shooter mode. |
| 58 | **Electron desktop wrapper** | `electron/main.js`, `electron/preload.js` | Electron entry point creates a frameless BrowserWindow loading the Vite dev URL or the production `dist/index.html`; `npm run electron:dev` is executable. |
| 59 | **PWA manifest** | `public/manifest.json` | Web app manifest with name, icons, theme color, and `standalone` display mode; enables "Add to Home Screen" on mobile browsers. |

---

## 2. CODE EXISTS BUT BROKEN/UNWIRED
*Files that exist in the repository and contain real logic but are never imported in the active `src/main.js` dependency tree and produce no visible output.*

| # | Feature | File(s) | Actual state |
|---|---------|---------|--------------|
| 1 | **ModeRegistry** | `src/gameplay-modes/ModeRegistry.js` | Registration and lookup class for gameplay modes; never imported anywhere in the main app or any file that main.js reaches. |
| 2 | **gameplay-modes/OrnithologyMode** | `src/gameplay-modes/ornithology/OrnithologyMode.js`, `index.js` | Full mode class with 30+ bird species, habitat tiles, call-type learning challenges, and biome movement; not imported — main.js uses a minimal bird-fact flavor via `_currentModeType='ornithology'` instead. |
| 3 | **gameplay-modes/MycologyMode** | `src/gameplay-modes/mycology/MycologyMode.js`, `index.js` | Full mode class with 20+ mushroom species, edibility challenges, and mycelium-network tile mechanics; not imported — main.js uses a mushroom-fact flavor only. |
| 4 | **gameplay-modes/ArchitectureMode** | `src/gameplay-modes/architecture/ArchitectureMode.js`, `index.js` | Tile-placement mode with blueprint matching (SPACE/Q/E keys), structural integrity scoring, and five building archetypes; not imported — selecting "Architecture" in-game runs a standard grid with only a mode label. |
| 5 | **gameplay-modes/AlchemyMode** | `src/gameplay-modes/alchemy/AlchemyMode.js`, `index.js` | Alternative alchemy implementation with elemental lab mechanics; not imported — active alchemy is handled by `src/systems/alchemy-system.js`. |
| 6 | **gameplay-modes/RPGMode** | `src/gameplay-modes/rpg/RPGMode.js`, `index.js` | Full RPG mode class with shadow enemies, named zone transitions, and multi-branch dialogue; not imported — main.js uses its own bespoke RPG path via `_currentModeType='rpg'`. |
| 7 | **gameplay-modes/ConstellationMode (duplicate)** | `src/gameplay-modes/constellation/ConstellationMode.js`, `index.js` | Parallel constellation mode class; not imported — active mode is `src/modes/constellation-mode.js`. |
| 8 | **gameplay-modes/Constellation3DMode** | `src/gameplay-modes/constellation/Constellation3DMode.js` | Three.js 3D constellation variant; not imported — 3D is handled via the `mode3d` flag inside `src/modes/constellation-mode.js`. |
| 9 | **gameplay-modes/ShooterMode (duplicate)** | `src/gameplay-modes/shooter/ShooterMode.js`, `index.js` | Parallel shooter implementation; not imported — active mode is `src/modes/shooter-mode.js`. |
| 10 | **gameplay-modes/RhythmMode (duplicate)** | `src/gameplay-modes/rhythm/RhythmMode.js`, `index.js` | Parallel rhythm mode; not imported — active mode is `src/modes/rhythm-mode.js`. |
| 11 | **gameplay-modes/grid-based (5 files)** | `src/gameplay-modes/grid-based/GridGameMode.js`, `grid-enemy.js`, `grid-logic.js`, `grid-particles.js`, `grid-player.js`, `index.js` | A complete refactored grid engine that imports leaderboard.js and session-analytics.js; none of these files are imported in the main app. |
| 12 | **AI content generation service** | `src/services/apiAgents.js`, `apiAgents.examples.js`, `runApiExamples.js`, `runOpenAIExamples.js` | Claude + GPT-4 API wrappers for procedural dreamscape generation, affirmations, and learning content; requires Node.js server-side use and API keys not present in `.env`; never imported in the browser bundle. |
| 13 | **Supabase leaderboard** | `src/systems/leaderboard.js` | Real-time daily leaderboard backed by Supabase PostgreSQL; defines SQL schema and connection logic; Supabase URL/key are never configured; not imported in main.js. |
| 14 | **Ambient music (duplicate)** | `src/systems/ambient-music.js` | Older Tone.js music engine responding to emotional distortion; not imported — active engine is `src/audio/music-engine.js`. |
| 15 | **Session analytics** | `src/systems/session-analytics.js` | localStorage-based cross-session metrics (total sessions, minutes, peak score, dreamscape visit counts); not imported in main.js; `src/ui/stats-dashboard.js` does import it but that file is also unwired. |
| 16 | **Stats dashboard** | `src/ui/stats-dashboard.js` | In-game overlay (press D) with session time, emotional field, lucidity, language progress; imports session-analytics.js; not imported in main.js — press-H dashboard in `src/ui/renderer.js` serves this role instead. |
| 17 | **Legacy learning modules** | `src/systems/learning-modules.js` | Challenge dispatcher that imports `languages.js` and `sigils.js`; replaced by `src/systems/learning/` subfolder; not imported in main.js. |
| 18 | **Standalone upgrade-shop** | `src/systems/upgrade-shop.js` | Ten upgrade definitions with apply functions for game-state mutation; not imported — active shop uses `UPGRADE_SHOP` constant from `src/core/constants.js`. |
| 19 | **Standalone archetypes** | `src/systems/archetypes.js` | Alternative archetype-definition file with wall-jump, reveal, phase-walk, rewind, shield-burst powers; not imported — `ARCHETYPES` from `src/core/constants.js` is used instead. |
| 20 | **Standalone dreamscapes** | `src/systems/dreamscapes.js` | Alternative dreamscape theme definitions; not imported — `DREAMSCAPES` from `src/core/constants.js` is used instead. |
| 21 | **Legacy cosmologies** | `src/systems/cosmologies.js` | Older cosmology map (12 traditions); not imported — `src/systems/cosmology/cosmologies.js` is used instead. |
| 22 | **Legacy dream-yoga** | `src/systems/dream-yoga.js` | Older dream-yoga implementation; not imported — `src/systems/awareness/dream-yoga.js` is used instead. |
| 23 | **Legacy emotional engine** | `src/core/emotional-engine.js` | Earlier version of the emotional field model; not imported — `src/systems/emotional-engine.js` is used. |
| 24 | **Legacy temporal system** | `src/core/temporal-system.js` | Earlier temporal system; only imported by the unwired `GameStateManager`; `src/systems/temporal-system.js` is the active version. |
| 25 | **GameStateManager / InputManager** | `src/core/game-engine/GameStateManager.js`, `InputManager.js` | Mode-agnostic state and input abstraction layer; not imported in main.js (main.js manages state directly). |
| 26 | **EventBus** | `src/core/event-bus.js` | Lightweight pub/sub; only imported by the unwired `src/modes/grid-mode.js`. |
| 27 | **Legacy grid-mode / mode-manager** | `src/modes/grid-mode.js`, `src/modes/mode-manager.js` | Refactored grid mode and mode-orchestrator classes; not imported — main.js handles grid logic directly. |
| 28 | **Legacy languages** | `src/systems/languages.js` | CEFR vocabulary-challenge system; replaced by `src/systems/learning/language-system.js` + `vocabulary-engine.js`; only referenced by the unwired `learning-modules.js`. |
| 29 | **Legacy sigils** | `src/systems/sigils.js` | 200+ sigil pattern definitions from neolithic, alchemical, and runic traditions; only referenced by the unwired `learning-modules.js`; the active `sigil-system.js` does not import it. |
| 30 | **Powerups (grid-based)** | `src/systems/powerups.js` | Grid-mode powerup update and collision logic; only referenced by the unwired `gameplay-modes/grid-based/GridGameMode.js`. |
| 31 | **Recovery tools (legacy)** | `src/systems/recovery-tools.js` | Seven recovery-tool helpers (impulse buffer, consequence preview, etc.) as standalone functions; not imported — active recovery tools are the class-based versions in `src/recovery/`. |
| 32 | **Campaign story** | `src/systems/campaign.js` | 30-level narrative arc in 3 acts with cutscene text; not imported — active campaign is `src/modes/campaign-manager.js` (tutorial hints, not story cutscenes). |
| 33 | **Undo system** | `src/systems/undo.js` | Standalone undo/redo stack for grid state; not imported — the active rewind power is the Captor-Teacher archetype action inside `src/game/player.js`. |
| 34 | **Alternative audio engine** | `src/systems/audio.js` | Web Audio API + Tone.js hybrid engine class; not imported — active audio is `src/audio/sfx-manager.js` + `src/audio/music-engine.js`. |
| 35 | **Sample assets generator** | `src/systems/sampleAssets.js` | Programmatic AudioBuffer factory for when WAV files are absent; not imported anywhere. |
| 36 | **Alternative progress dashboard** | `src/systems/integration/progress-dashboard.js` | Exports `drawDashboard(ctx, w, h)` that reads the same `window._*` globals; not imported — the equivalent function is inlined in `src/ui/renderer.js`. |
| 37 | **Top-level intelligence duplicates** | `src/intelligence/emotion-recognition.js`, `empathy-training.js`, `logic-puzzles.js`, `strategic-thinking.js` | Copies of the files in `src/intelligence/cognitive/` and `src/intelligence/emotional/` subfolders; not imported — main.js imports the subfolder versions. |
| 38 | **GameMode base interface** | `src/core/interfaces/GameMode.js` | Abstract base class for gameplay modes; only imported by the unwired `src/gameplay-modes/` tree — the active modes (`shooter-mode.js`, `constellation-mode.js`, etc.) extend `src/modes/game-mode.js` instead. |
| 39 | **`src/ui/` duplicate tree (50+ files)** | `src/ui/main.js`, `src/ui/audio/`, `src/ui/core/`, `src/ui/game/`, `src/ui/modes/`, `src/ui/rendering/`, `src/ui/systems/`, `src/ui/intelligence/`, `src/ui/recovery/`, `src/ui/ui/` | Exact copies of the active source tree, created during a code-reorganization pass that placed the canonical files at the `src/` root level; none are imported (the real `src/ui/menus.js`, `renderer.js`, `hud.js`, and `tutorial-content.js` are the only active `src/ui/` files). |

---

## 3. DOCUMENTED ONLY
*Things described or promised in `.md` files for which no corresponding source code exists anywhere in the repository.*

| # | Feature | Documented in | Actual state |
|---|---------|--------------|--------------|
| 1 | **Habit Replacement module** | `ROADMAP.md` ("C3: Create `habit-replacement.js`") | No `habit-replacement.js` exists in any folder; described as suggesting positive alternatives, tracking new habits, and building game-use rituals. |
| 2 | **Relapse Prevention module** | `ROADMAP.md` ("C4: Create `relapse-prevention.js`") | No `relapse-prevention.js` exists; described as an early-warning system with emergency pause and trigger identification. |
| 3 | **Attention Training module** | `ROADMAP.md` ("L3: Create `meta-learning/attention-training.js`") | No `attention-training.js` exists; described as flow-state indicators, focus metrics, and distraction-recovery mechanics. |
| 4 | **Steamworks SDK / Steam achievements + cloud saves** | `README.md` (Steam integration table), `electron/main.js` (comment stub only) | `greenworks` or `steamworks.js` is not installed; no Steam API calls exist in any source file; the electron main has a placeholder comment only. |
| 5 | **Steam cloud save sync** | `README.md` ("Steam cloud saves means dream sign database persists across devices") | Only localStorage is used; no cloud-sync path exists. |
| 6 | **Online multiplayer / WebSocket relay server** | `src/modes/coop-mode.js` (`RelayClient` class references `ws://localhost:8765`), `CANON.md` | The relay server binary or script is not included in the repository; online co-op is unreachable without a separately running relay process. |
| 7 | **Supabase leaderboard backend (configured)** | `src/systems/leaderboard.js` SQL schema comments, `README.md` Daily Challenge leaderboard | `leaderboard.js` exists (see Section 2) but the Supabase URL and anon key are never set; `.env.example` only has placeholder values; the leaderboard table has never been provisioned. |
| 8 | **Daily Challenge server-generated seed** | `README.md` ("Daily Challenge" as a live event mode) | The in-game "DAILY CHALLENGE" option picks a deterministic local dreamscape seeded by today's calendar date; there is no server, no shared seed, and no global leaderboard for it. |
| 9 | **Service worker / offline PWA** | `README.md` ("installable as PWA"), `public/manifest.json` | No `sw.js` service worker exists; no Workbox or manual cache registration is present; the app cannot function offline after install. |
| 10 | **AI procedural dreamscape generation (live)** | `README.md` ("Claude / GPT-4 procedural dreamscape generation"), `FEATURES.md` ("OpenAI/Claude integration") | `src/services/apiAgents.js` wraps both APIs but requires Node.js server-side execution and API keys not shipped with the project; there is no in-game trigger or server endpoint to call it. |

---

*End of audit.*
