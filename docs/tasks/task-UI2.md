# Task UI2 — Main Menu Restructure + 3 Memory Slots

## Goal
Main menu shows health bar and HUD from previous game. "Select Mode"
and "Select Dreamscape" are top-level menu items (they should only
appear after Start Journey). No save/load system exists. Fix all of this.

## Definition of Done
- [ ] `npm run build` passes
- [ ] NO health bar, score, or HUD visible on any menu screen
- [ ] "GRID-CLASSIC MODE" label removed from title screen
- [ ] Main menu items: NEW JOURNEY / CONTINUE / HOW TO PLAY / OPTIONS / HIGH SCORES only
- [ ] Select Mode and Select Dreamscape removed from top-level menu
- [ ] NEW JOURNEY and CONTINUE both lead to a 3-slot memory screen
- [ ] Each slot shows: name, dreamscape, emergence level, time played
- [ ] Empty slots show "[ EMPTY ]"
- [ ] Consciousness stats summary visible on main menu for returning players

## Scope — touch ONLY these files
- `src/ui/menus.js`
- `src/core/storage.js`
- `src/main.js` (HUD phase-gating only)

---

## EDIT 1 — Hide HUD on non-gameplay phases

In main.js, find the render/draw call. Gate HUD rendering:
```js
// Only draw HUD during active play or pause
const GAMEPLAY_PHASES = ['playing', 'paused', 'interlude', 'dead'];
if (GAMEPLAY_PHASES.includes(currentPhase)) {
  drawHUD(ctx, state);
  drawBottomBar(ctx, state);
}
// All other phases (title, mode_select, etc.): no HUD drawn
```

---

## EDIT 2 — Clean main menu items

In menus.js, find the main menu items array and replace:
```js
const MAIN_MENU_ITEMS = [
  { id: 'new_journey', label: 'NEW JOURNEY',  sub: 'Begin a new consciousness' },
  { id: 'continue',    label: 'CONTINUE',      sub: 'Return to a saved consciousness' },
  { id: 'how_to_play', label: 'HOW TO PLAY',   sub: '' },
  { id: 'options',     label: 'OPTIONS',        sub: '' },
  { id: 'high_scores', label: 'HIGH SCORES',   sub: '' },
];
```

Remove entirely: Select Mode, Select Dreamscape, Upgrades, any mode label.

Also remove the "GRID-CLASSIC MODE" banner/label from the title draw
function. Search for it:
```bash
grep -n "GRID\|CLASSIC\|grid.classic\|grid-classic" src/ui/menus.js
```
Delete those lines.

---

## EDIT 3 — 3-slot save system in storage.js

Add these functions:
```js
export function loadAllSlots() {
  return [0, 1, 2].map(i => {
    try {
      const data = localStorage.getItem('gp_slot_' + i);
      return data ? { slot: i, empty: false, ...JSON.parse(data) } 
                  : { slot: i, empty: true };
    } catch { return { slot: i, empty: true }; }
  });
}

export function saveSlot(i, gameState) {
  localStorage.setItem('gp_slot_' + i, JSON.stringify({
    name:           gameState.playerName || 'Wanderer',
    dreamscape:     gameState.dreamscapeName || 'Void State',
    emergence:      gameState.emergenceLevel || 'DORMANT',
    score:          gameState.score || 0,
    playTime:       gameState.totalPlayTime || 0,
    savedAt:        new Date().toLocaleDateString(),
  }));
}

export function loadSlot(i) {
  try {
    const d = localStorage.getItem('gp_slot_' + i);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

export function deleteSlot(i) {
  localStorage.removeItem('gp_slot_' + i);
}
```

---

## EDIT 4 — Memory slot selection screen in menus.js

Add a new draw function `drawMemorySlots(ctx, canvas, slots, selectedSlot)`:

```js
function drawMemorySlots(ctx, canvas, slots, selectedSlot) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88';
  ctx.font = fs(32) + 'px ' + FONT;
  ctx.fillText('CHOOSE CONSCIOUSNESS', canvas.width / 2, canvas.height * 0.12);
  
  const slotH = canvas.height * 0.22;
  const slotW = canvas.width * 0.55;
  const slotX = (canvas.width - slotW) / 2;
  const startY = canvas.height * 0.20;
  const gap = canvas.height * 0.26;
  
  slots.forEach((slot, i) => {
    const sy = startY + i * gap;
    const isSelected = i === selectedSlot;
    
    // Slot box
    ctx.strokeStyle = isSelected ? '#00ff88' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(slotX, sy, slotW, slotH);
    ctx.fillStyle = isSelected ? '#001a11' : '#000';
    ctx.fillRect(slotX, sy, slotW, slotH);
    
    ctx.textAlign = 'left';
    const tx = slotX + slotW * 0.06;
    
    if (slot.empty) {
      ctx.fillStyle = '#224433';
      ctx.font = fs(18) + 'px ' + FONT;
      ctx.fillText('SLOT ' + (i + 1) + '  ·  [ EMPTY ]', tx, sy + slotH * 0.45);
      ctx.fillStyle = '#112211';
      ctx.font = fs(14) + 'px ' + FONT;
      ctx.fillText('Press ENTER to begin here', tx, sy + slotH * 0.72);
    } else {
      ctx.fillStyle = '#00ff88';
      ctx.font = fs(20) + 'px ' + FONT;
      ctx.fillText('SLOT ' + (i + 1) + '  ·  ' + slot.name, tx, sy + slotH * 0.32);
      ctx.fillStyle = '#00aa66';
      ctx.font = fs(15) + 'px ' + FONT;
      ctx.fillText(slot.dreamscape + '  ·  ' + slot.emergence, tx, sy + slotH * 0.56);
      ctx.fillStyle = '#336644';
      ctx.font = fs(13) + 'px ' + FONT;
      ctx.fillText('Score: ' + slot.score + '  ·  Saved: ' + slot.savedAt, tx, sy + slotH * 0.78);
    }
  });
  
  // Instructions
  ctx.textAlign = 'center';
  ctx.fillStyle = '#224433';
  ctx.font = fs(13) + 'px ' + FONT;
  ctx.fillText('↑↓ to select  ·  ENTER to load  ·  DEL to erase  ·  ESC to go back', 
    canvas.width / 2, canvas.height * 0.94);
}
```

---

## EDIT 5 — Wire memory screen to menu navigation

In menus.js/main.js, when player selects NEW JOURNEY or CONTINUE:
```js
case 'new_journey':
case 'continue':
  const slots = loadAllSlots();
  setPhase('memory_select', { slots });
  break;
```

When player selects a slot from memory screen:
- Empty slot → go to onboarding/name entry → then mode select
- Filled slot → load that consciousness → go directly to mode select

---

## Verification
1. Main menu: clean, no HUD, no grid label, 5 options only ✓
2. NEW JOURNEY → 3 slot screen ✓
3. Select empty slot → name entry or mode select ✓
4. Select filled slot → loads that save ✓
5. ESC from any menu → goes back correctly ✓

## Commit message
```
feat: UI2 menu restructure + 3 memory slots -- clean menus, save system
```
