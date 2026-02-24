# Task MODES2 — Mode Launch Fixes + World Structure Audit

**Priority: HIGH — game modes that don't launch are broken product**
**Run after: LANG1b complete**

---

## Audit First

```bash
# Inventory all registered modes
grep -n "GAME_MODES\|id:" src/ui/menus.js | head -60
grep -n "gameMode\|modesel\|chosen\|switchMode\|'shooter'\|'constellation'\|'rpg'\|'language'\|'twin'\|'first'" src/main.js | head -60

# Check what actually happens when each mode is selected
grep -n "gameMode ===\|case.*mode\|constellation\|rpg\|meditation\|coop\|rhythm\|language" src/main.js | head -60

# Check language system for the wrong-language-in-quiz bug
grep -rn "targetLang\|nativeLang\|LANG_SELECT\|langSelect\|language.*question\|quiz.*language" src/ | grep -v node_modules | head -30
```

Produce a three-section audit before touching any code:
1. **MODES THAT LAUNCH CORRECTLY** — full pipeline: select → init → renders something non-grid
2. **MODES THAT HANG OR SHOW GRID** — selected but game falls back to grid renderer
3. **MODES MISSING WORLD STRUCTURE** — render exists but uses wrong world type (e.g. RPG showing grid)

---

## Bug 1: Modes That Don't Launch

**Symptom**: Selecting certain modes (twin-stick shooter, constellation, others) from SELECT GAME MODE → dreamscape → cosmology completes the flow but the game either freezes, shows a black screen, or falls back to the grid.

**Root cause pattern** (verify before fixing):
- Mode ID in `GAME_MODES` array in `menus.js` doesn't match `gameMode === 'X'` branch in `main.js`
- Mode is registered in GAME_MODES but `startGame()` never sets `gameMode` to the correct string
- Mode's `init()` crashes silently (missing dependency, bad import) and the game freezes at blank canvas

**Fix for each non-launching mode:**

```
For each broken mode:
1. Find its ID in GAME_MODES (menus.js)
2. Trace what happens in main.js when that ID is chosen (look in the modeselect handler)
3. Ensure startGame() sets gameMode to the right string
4. Ensure the game loop has a branch for that gameMode that calls update() + render()
5. Ensure the mode's init() doesn't throw — add try/catch with console.error if needed
6. Test: select mode → should render SOMETHING (even placeholder) not freeze/grid
```

**At minimum, these must launch:**
- `shooter` / twin-stick / any shooter variant → calls `shooterMode.init()` + `shooterMode.render()`
- `constellation` → calls `constellationMode.init()` + `constellationMode.render()`
- `rpg` → calls RPG handler (see Bug 3 below)
- `language` → calls language mode (see Bug 4 below)
- `meditation` → calls `meditationMode.init()` + `meditationMode.render()`
- `rhythm` → calls `rhythmMode.init()` + `rhythmMode.render()`

---

## Bug 2: Duplicate Constellation Mode

**Symptom**: Two entries in SELECT GAME MODE both say "Constellation" (or similar). One is `constellation-mode.js`, the other is likely `skymap` from `play-modes.js`.

**Fix:**
- Remove the `skymap` play-style from GAME_MODES in `menus.js` — it is redundant
- Keep only the `constellation` entry that maps to `ConstellationMode` class
- If skymap has unique mechanics worth keeping, merge them into `ConstellationMode` as an optional variant, don't show it as a separate mode

---

## Bug 3: RPG Mode Shows Grid

**Symptom**: Selecting RPG Adventure shows the tile grid with the ◈ player, not an RPG interface.

**Root cause**: RPG mode was never given its own world renderer — it falls through to the grid renderer in `main.js`.

**Fix (minimum viable RPG that doesn't look like grid):**

RPG mode should use a **text/state machine** world structure — no grid tiles at all.

```js
// In main.js game loop, when gameMode === 'rpg':
// Do NOT call drawGame() (the grid renderer)
// Instead call a dedicated RPG renderer:

if (gameMode === 'rpg') {
  rpgMode.update(dt, keys);
  rpgMode.render(ctx, { w, h, ts });
  animId = requestAnimationFrame(loop);
  return;
}
```

Minimum RPG renderer (if `rpgMode.js` doesn't have one yet):
- Black background
- Dreamscape name as title (top center, styled)
- Current NPC dialogue or room description (center, styled text box)
- Available actions list (`[WASD] navigate  [ENTER] interact  [J] archetype power`)
- Character stats sidebar (HP, level, archetype)
- NO grid. NO tile map.

If the full RPG system is too incomplete to render without crashing, add this guard:

```js
// In rpgMode init/render, if critical systems missing:
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);
ctx.fillStyle = '#00ff88';
ctx.font = '24px monospace';
ctx.fillText('RPG MODE — Coming Soon', w/2, h/2);
```

---

## Bug 4: Language Quiz Shows Wrong Language

**Symptom**: Player selects French in the language sub-discipline screen, but quiz shows a question about Japanese ("Sayōnara is which language?").

**Root cause**: The quiz question generator is pulling from the wrong language pool — likely using `nativeLang` instead of `targetLang`, or pulling from all languages instead of filtering to the selected one. Also: the question shown is a meta-question *about* languages, not a vocabulary question *in* the target language. This is the wrong question type entirely.

**Fix:**

```
1. Find where quiz questions are generated (likely in language-mode.js or language-system.js)
2. Ensure all quiz questions use: languageSystem.targetLang (or the user-selected language code)
3. Vocabulary quiz = show a word IN the target language, ask for its meaning in native language
   - Example for French: show "liberté" → options: freedom / anger / sadness / time
   - NOT: "Sayōnara is which language?" (that's a meta quiz, wrong mode)
4. Production quiz = show meaning in native, ask for word in target language
   - Example for French: show "freedom" → options: liberté / joie / peur / temps
5. Never mix language pools — if targetLang is 'fr', ALL cards come from French vocabulary only
```

---

## Bug 5: First Person / Twin Shooter Consolidation

**Symptom**: There are two separate shooter-type entries. "Twin Stick Shooter" and potentially "First Person" are redundant with each other in intent.

**Fix:**
- **Remove "Twin Stick Shooter"** from GAME_MODES (or rename it to match First Person's intent)
- **Keep "First Person"** — it maps to `ShooterMode` with the 3D corridor presentation
- If "First Person" is using the grid renderer instead of ShooterMode, fix that wiring
- The description should read: `3D corridor dreamscapes · embodied movement · reflex`
- Delete or archive the redundant entry from menus.js

---

## World Structure Standards (Reference for Agent)

Each mode must use its correct world structure. Do NOT use the grid renderer for non-grid modes:

| Mode | World Type | Renderer to call |
|------|-----------|-----------------|
| Grid Classic | Tile grid | `drawGame()` (existing) |
| Shooter / First Person | Free-space 2D | `shooterMode.render()` |
| RPG Adventure | Text / state machine | `rpgMode.render()` — NO grid |
| Constellation | Graph / node network | `constellationMode.render()` |
| Meditation | Particle system | `meditationMode.render()` |
| Rhythm | Particle + beat timer | `rhythmMode.render()` |
| Alchemy | Physics hybrid | alchemy render or placeholder |
| Ornithology | Free-space 2D sprites | ornithology render or placeholder |
| Mycology | Graph / network | mycology render or placeholder |
| Architecture | Grid + physics hybrid | architecture render or placeholder |
| Language | Overlay on dreamscape | `languageMode.render()` |
| Learning Hub | Text / state machine | learning render or placeholder |

**Rule**: If a mode's full renderer isn't built yet, show a styled placeholder screen (mode name + "Coming Soon" + ESC to return). Never silently fall through to the grid renderer.

---

## Verification Checklist

After fixing, test every mode in GAME_MODES:

```
For each mode:
[ ] Select mode → select any dreamscape → select any cosmology
[ ] Game launches without freeze/black screen
[ ] Mode renders something that visually matches its world type (not grid for non-grid modes)
[ ] ESC pauses and shows pause menu
[ ] ESC from pause → resume works
[ ] Language mode: select French → quiz shows French vocabulary, not Japanese
[ ] No duplicate Constellation entry
[ ] No Twin Stick entry (or merged into First Person)
[ ] RPG mode: no grid tiles visible
```

Build must pass: `npm run build` with zero errors before committing.
