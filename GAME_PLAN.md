# 🗺️ GLITCH·PEACE — Master Game Plan

**Version**: 3.1.0 | **Updated**: February 2026 | **Status**: Active Development

---

## 📊 Current State Audit

### What Is Actually Implemented

| System | Files | Working | Notes |
|--------|-------|---------|-------|
| Grid Roguelike | `src/gameplay-modes/grid-based/` | ✅ Yes | Core gameplay loop stable |
| Twin-Stick Shooter | `src/gameplay-modes/shooter/` | ✅ Yes | Wave-based, 4 weapons, mouse aim |
| RPG Adventure | `src/gameplay-modes/rpg/` | ✅ Yes | Dialogue, quests, NPC interaction |
| Ornithology Mode | `src/gameplay-modes/ornithology/` | ✅ Yes | 16 birds, 7 biomes, ID challenges |
| Mycology Mode | `src/gameplay-modes/mycology/` | ✅ Yes | 12 species, toxic ID, mycelium |
| Architecture Mode | `src/gameplay-modes/architecture/` | ✅ Yes | 10 tile types, 4 blueprints |
| Constellation Mode | `src/gameplay-modes/constellation/` | ✅ Yes | Star-connect, 6 constellations, lore |
| Alchemy Mode | `src/gameplay-modes/alchemy/` | ✅ Yes | 4 elements, 8 reactions, Jungian lore |
| Rhythm Mode | `src/gameplay-modes/rhythm/` | ✅ Yes | Beat-sync, drum machine, accuracy |
| Emotional Field | `src/systems/emotional-engine.js` | ✅ Yes | 10 emotions, synergies, distortion |
| Temporal System | `src/systems/temporal-system.js` | ✅ Yes | Lunar phases, weekday harmonics |
| Language Learning | `src/systems/learning/` | ✅ Yes | 16 languages, progressive vocabulary |
| Sigil Database | `src/systems/learning/sigil-system.js` | ✅ Yes | 31 sigils, 6 traditions |
| Dream Yoga | `src/systems/awareness/dream-yoga.js` | ✅ Yes | Lucidity meter, body scan, reality checks |
| Recovery Tools | `src/recovery/` | ✅ Yes | Impulse buffer, consequence preview |
| Boss System | `src/systems/boss-system.js` | ✅ Yes | 5 boss types, HP bars |
| Achievement System | `src/systems/achievements.js` | ✅ Yes | 15 achievements, badge overlay |
| Campaign Manager | `src/modes/campaign-manager.js` | ✅ Yes | 30-level arc in 3 acts |
| Tone.js Music | `src/audio/music-engine.js` | ✅ Yes | 3 emotional states, procedural |
| Intelligence Systems | `src/intelligence/` | ✅ Yes | Logic puzzles, EQ, empathy, strategy |
| Leaderboard | `src/systems/leaderboard.js` | ✅ Yes | localStorage top-10 per mode |
| Session Analytics | `src/systems/session-analytics.js` | ✅ Yes | Cross-session lifetime stats |
| Cosmologies | `src/systems/cosmology/` | ✅ Yes | 13 cosmologies, chakra, tarot |
| Upgrade Shop | 8 upgrades | ✅ Yes | Insight token economy |
| Gamepad Support | main.js pollGamepad() | ✅ Yes | Left stick, D-pad, 6 buttons, rumble |
| **Full-Screen Canvas** | main.js resizeCanvas() | ✅ **v3.1** | Fills entire viewport, centred |

### Known Gaps vs. Documented Plans

| Planned Feature | Status | Priority |
|----------------|--------|----------|
| Multiplayer / Co-op real networking | 🔴 Stub only (CoopMode placeholder) | Medium |
| 80%+ automated test coverage | 🟡 25 Playwright tests; needs more unit tests | High |
| Full WCAG AA audit | 🟡 High-contrast mode exists; full audit incomplete | High |
| WebGL performance renderer | 🔴 Not started | Low |
| Electron/Steam wrapper | 🟡 Electron config exists; not packaged | Medium |
| Sound: full music library | 🟡 Procedural Tone.js works; no audio assets | Low |

---

## 🔭 Total Vision Recap

GLITCH·PEACE is a **consciousness engine disguised as a game**. The complete vision is:

1. **A Roguelike that teaches by being what it teaches** — pattern recognition helps with pattern recognition; impulse delay mechanics exercise impulse control; reality checks are actual lucid dreaming techniques.

2. **A universal accessibility machine** — playable from age 5 (SPROUT difficulty) to expert (NIGHTMARE); 16 languages; WCAG AA colors; gamepad + keyboard + touch.

3. **A Steam-quality experience** — full-screen, 60fps, polished transitions, rich lore, progression system, daily challenges, leaderboards.

4. **A therapeutic tool with integrity** — every mechanic cites its research basis (see RESEARCH.md); no shame mechanics; compassionate relapse design; session health monitoring.

5. **A platform for growth** — 10 gameplay modes serve different learning styles (spatial, kinesthetic, musical, naturalistic, linguistic, etc.); the campaign arc provides a structured 30-level journey through the 10 dreamscapes.

---

## 🎯 New Improvement Plan

### Priority 1: Readability 📖

**Problem**: Text is small, dense, and hard to read — especially on large screens where the game is now full-screen.

| Task | What To Do | Files |
|------|-----------|-------|
| R1: Scale text with viewport | All drawing functions use fixed pixel sizes (e.g. `'12px Courier New'`). Multiply by `min(vw, vh) / 700` scale factor. | `src/ui/menus.js`, `src/ui/renderer.js` |
| R2: Improve menu item spacing | Menu items are spaced ~44px apart in a 744-tall canvas. Distribute evenly across the full height. | `src/ui/menus.js` all draw* functions |
| R3: Add font size option | Add "Text Size: Small / Normal / Large" to Options (already has `fontScale` setting — expose it clearly). | `src/ui/menus.js` drawOptions |
| R4: Clearer HUD labels | Abbreviations like "◈ ×0" unclear to new players; use "Peace Nodes: 0" with icon. | `index.html` HUD HTML, `src/ui/hud.js` |
| R5: Storyline title card | Add a brief 3-second title card with dreamscape name + emotional theme before each level loads. | `src/main.js` interlude logic |

### Priority 2: Usability 🖱️

**Problem**: New players don't know what to do. Controls aren't discoverable. Key features like the Upgrade Shop, Archetype powers, and Mode switching require reading documentation.

| Task | What To Do | Files |
|------|-----------|-------|
| U1: First-move tutorial arrow | On a player's first time in a dreamscape, show blinking arrows around PEACE nodes with "collect these" text. | `src/ui/renderer.js` |
| U2: Contextual control hints | Show relevant key hints on-screen based on current state: "Press J for Archetype Power" when archetype is charged. | `src/ui/hud.js` or `src/ui/renderer.js` |
| U3: Mode select stays accessible | After completing onboarding, show mode selection screen (not jump straight to grid). | `src/main.js` onboarding completion |
| U4: Pause screen with controls | Pause menu (ESC) should show all active controls for current mode. | `src/ui/menus.js` drawPause |
| U5: Clearer objective display | "Objective: ◈ ×0" should say "Collect 3 Peace Nodes to advance" with a count and progress bar. | `src/ui/hud.js`, `index.html` |

### Priority 3: Accessibility ♿

**Problem**: WCAG AA requires 4.5:1 contrast ratio for text. Some foreground/background combos in the game fall short. Screen reader support is minimal.

| Task | What To Do | Files |
|------|-----------|-------|
| A1: Contrast audit all tile colours | Check TILE_DEF symbol colours against their backgrounds using WCAG formula. Fix any failing pairs. | `src/core/constants.js` |
| A2: Skip-to-game link | Add visually-hidden `<a>` to skip onboarding for returning players who use keyboard navigation. | `index.html` |
| A3: ARIA live region for messages | Wrap `#message` div in `aria-live="polite"` so screen readers announce messages. | `index.html` |
| A4: Keyboard-only mode indicator | Show visible focus indicator when navigating menus without mouse. | `index.html` CSS |
| A5: Colour-blind palettes | Add Deuteranopia and Protanopia palette options alongside High Contrast. | `src/core/constants.js`, `src/ui/menus.js` drawOptions |
| A6: Reduced motion completeness | Verify ALL animations (CSS + canvas) respect `CFG.reducedMotion`. | `src/ui/renderer.js`, `index.html` |

### Priority 4: Smoothness 🏎️

**Problem**: The 1.1MB bundle loads slowly. Some animation paths cause jank. The isometric mode resizes the canvas awkwardly.

| Task | What To Do | Files |
|------|-----------|-------|
| S1: Code-split by mode | Use dynamic `import()` for each gameplay mode. Each mode loads only when selected (saves ~300-500KB initial load). | `src/main.js` imports |
| S2: Particle pool tuning | Current cap: 300 live / 200 pool. Profile and reduce to 150/100 for low-end devices. | `src/game/particles.js` |
| S3: Smooth mode transitions | Add 400ms crossfade when switching between modes instead of instant swap. | `src/main.js` |
| S4: Menu animation | Title screen items should fade in staggered instead of appearing instantly. | `src/ui/menus.js` drawTitle |
| S5: Preload critical assets | Tone.js loads lazily; create AudioContext on first user gesture to avoid startup lag. | `src/audio/music-engine.js` |
| S6: Frame rate guard | Add `requestAnimationFrame` delta cap to 60fps; currently capped at 100ms but should target 16.7ms. | `src/main.js` loop() |

### Priority 5: Straightforward Gameplay 🎮

**Problem**: The game has enormous depth but players can get lost or overwhelmed. The first 5 minutes need to be much clearer.

| Task | What To Do | Files |
|------|-----------|-------|
| G1: Guided first session | If it's the player's first session, force "VOID STATE" dreamscape + "Classic Arcade" play style with a short guided intro. | `src/main.js` startGame() |
| G2: Simplify title menu | Current menu: NEW GAME / MODE SELECT / SELECT DREAMSCAPE / HOW TO PLAY / OPTIONS / HIGH SCORES / UPGRADE SHOP. Reduce to: PLAY / HOW TO PLAY / OPTIONS for first-run users. | `src/ui/menus.js` drawTitle |
| G3: In-game objective clarity | Show "Level N — Collect X peace nodes ◈" prominently at level start, fade after 3 seconds. | `src/ui/renderer.js` |
| G4: Tooltip on first hazard | When player first steps adjacent to a DESPAIR/TERROR tile, show "Danger tile — avoids these or use Glitch Pulse (R)". | `src/game/player.js` |
| G5: Clear level complete | Make the level-complete screen show: nodes collected, bonus earned, and what's coming next (dreamscape name + brief hook). | `src/ui/menus.js` drawInterlude |
| G6: Consistent mode entry | Every alternate mode (Alchemy, Rhythm, etc.) should have a 2-sentence description screen before gameplay begins. | `src/gameplay-modes/*/` each mode |

---

## 🚀 Steam Release Checklist

For Steam Early Access, the following must be complete:

- [ ] **Full-screen mode** — canvas fills entire screen ✅ Done (v3.1)
- [ ] **Electron wrapper** — desktop app build (`npm run electron:build`)
- [ ] **60fps stable** — profile and fix any frame drops
- [ ] **~5 minute onboarding** — new player gets up to speed in 5 min max
- [ ] **Clear core game loop** — first session has a satisfying arc (begin → play → level up → dreamscape advance → feel good)
- [ ] **Save / load** — progress persists across sessions ✅ Done
- [ ] **Settings persistence** — all options saved to localStorage ✅ Done
- [ ] **Gamepad support** — works with Xbox/PlayStation controllers ✅ Done
- [ ] **Accessibility minimum** — high-contrast mode, reduce motion, adjustable text ✅ Done (needs audit)
- [ ] **Steam metadata** — app icon, banner, description, screenshots
- [ ] **Content rating** — appropriate for ESRB / PEGI rating (recovery themes)
- [ ] **No external API calls on startup** — AI SDK imports present in package.json (Anthropic, OpenAI) but should be opt-in / not blocking

---

## 📅 Recommended Next Sessions

### Session A: Readability + First-Run UX (1-2 days)
- R2: Distribute menu items across full screen height
- U1: First-move tutorial arrow
- G1: Guided first session for new players
- G2: Simplify title menu for first-run

### Session B: Accessibility Audit (1 day)
- A1: Contrast audit
- A3: ARIA live regions
- A5: Colour-blind palettes
- A6: Verify reduced motion completeness

### Session C: Performance + Smoothness (1-2 days)
- S1: Code-split modes (biggest impact)
- S4: Menu fade-in animations
- S5: AudioContext preload

### Session D: Steam Packaging (2-3 days)
- Electron build + testing
- App icon + Steam metadata
- Full playthrough QA

---

## 🧭 Design Principles (Non-Negotiable)

These come from CANON.md and must be honoured in every change:

1. **No shame mechanics** — failure states are compassionate, never punishing
2. **Sterilised wisdom** — spiritual/psychological content is framed as simulation, never dogma
3. **Accessibility first** — every feature must degrade gracefully for players with disabilities
4. **Privacy paramount** — all data stays in localStorage; no external tracking
5. **Neurodivergent-first design** — ADHD-friendly pacing, dyslexia-aware fonts, stimulation-adjustable environments
6. **Baby steps** — every feature ships working before the next begins
7. **Evidence-based** — every claim cites its research source (see RESEARCH.md)

---

*This document is the authoritative plan for GLITCH·PEACE development. Update it after each meaningful session.*

**Last Updated**: February 2026 | **Next Review**: After Session A completion
