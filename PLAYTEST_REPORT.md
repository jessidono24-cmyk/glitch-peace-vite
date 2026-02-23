# GLITCH·PEACE Playtest Report
**Generated:** 2026-02-23T19:07:01.474Z
**Viewport:** 1280x720
**Screenshots:** test-results/playtest/


### 1. LOADING & TITLE SCREEN
✅ PASS: Canvas fills full screen (1280x720)
✅ PASS: [object Object] bug not present

### 2. MAIN MENU STRUCTURE
✅ PASS: "GRID-CLASSIC MODE" label removed

### 3. NAVIGATION FLOW

### 4. MODE SELECT SCREEN
✅ PASS: Mode select: arrow key navigation works

### 5. DREAMSCAPE SELECT SCREEN
✅ PASS: Dreamscape select screen reached

### 6. COSMOLOGY SELECT SCREEN
✅ PASS: Cosmology select screen reached

### 7. GRID MODE GAMEPLAY
✅ PASS: No playstyle screen in navigation flow
✅ PASS: Grid mode: player movement works
❌ FAIL: No console errors in grid mode — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: H key opens dashboard
✅ PASS: ESC pauses game

### 8. TEST ALL GAME MODES
✅ PASS: shooter: fills full screen
❌ FAIL: shooter: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: constellation: fills full screen
❌ FAIL: constellation: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: meditation: fills full screen
❌ FAIL: meditation: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: rhythm: fills full screen
❌ FAIL: rhythm: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: alchemy: fills full screen
✅ PASS: alchemy: does not freeze after 5 seconds
❌ FAIL: alchemy: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: ornithology: fills full screen
❌ FAIL: ornithology: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: mycology: fills full screen
❌ FAIL: mycology: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: architecture: fills full screen
❌ FAIL: architecture: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED
✅ PASS: rpg: fills full screen
❌ FAIL: rpg: no console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED

### 9. TEST ALL DREAMSCAPES (Grid Mode)
✅ PASS: Dreamscape select: all dreamscapes visible (check screenshot dreamscape-select-all.png)

### 10. VERIFY NO GRID OVERLAY IN NON-GRID MODES
⚠️  VISUAL CHECK REQUIRED: Review these screenshots for grid tile absence:
   → test-results/playtest/mode-shooter.png
   → test-results/playtest/mode-constellation.png
   → test-results/playtest/mode-meditation.png
   → test-results/playtest/mode-rhythm.png

### 11. MEMORY SLOTS
✅ PASS: Memory slot screen reachable

### 12. FONT SIZE CHECK
⚠️  VISUAL CHECK REQUIRED: Review 02-title.png and 07-mode-select-full.png
   → Verify all text is readable at arm's length
   → No text should appear smaller than 14px equivalent

### 13. FINAL CONSOLE ERROR SUMMARY
❌ FAIL: Final check: console errors — Failed to load resource: net::ERR_NAME_NOT_RESOLVED | Failed to load resource: net::ERR_NAME_NOT_RESOLVED | Failed to load resource: net::ERR_NAME_NOT_RESOLVED

## Screenshot Index
All screenshots saved to `test-results/playtest/`
Review visual checks manually for:
- Grid overlay absence in non-grid modes
- Font readability
- Full screen layout
- Dreamscape count on select screen