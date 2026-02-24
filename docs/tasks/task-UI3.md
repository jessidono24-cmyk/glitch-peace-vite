# Task UI3 — Fix Navigation Flow + Remove Playstyles + Cosmology Descriptions

## Goal
Current flow is broken: Mode → Dreamscape → Playstyle → Mode again (circular).
Playstyle page is overwhelming and redundant. Cosmologies have no descriptions.
Dreamscape only shows 6 at a time with no pagination. Fix all of this.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Navigation flow: Start Journey → Mode → Dreamscape → Cosmology → Play
- [ ] NO playstyle selection screen (removed entirely)
- [ ] Mode never appears twice in the flow
- [ ] All dreamscapes visible (pagination if needed, not scroll)
- [ ] Each cosmology shows a 1-line description under its name
- [ ] Cosmology screen uses a 2-column grid layout, not a long list
- [ ] Mode select uses a grid layout (2-3 columns), not a scrolling list
- [ ] ESC goes back one step at every screen

## Scope — touch ONLY these files
- `src/ui/menus.js`
- `src/main.js` (phase/state transitions only)

---

## EDIT 1 — Remove playstyle phase entirely

In main.js and menus.js:
```bash
grep -n "playstyle\|play_style\|playStyle\|PLAYSTYLE" src/main.js src/ui/menus.js
```

Delete or comment out:
- The playstyle selection phase
- The drawPlaystyle() or equivalent function
- Any transition that goes TO playstyle selection

The flow after this change:
```
memory_select → onboarding → mode_select → dreamscape_select → cosmology_select → playing
```
No playstyle step anywhere.

---

## EDIT 2 — Fix the double-mode bug

```bash
grep -n "mode_select\|modeSelect\|selectMode\|phase.*mode" src/main.js | head -20
```

Find where mode_select is triggered. There should be exactly ONE place
mode_select appears in the forward flow. If it appears after dreamscape
or cosmology, remove those extra transitions.

---

## EDIT 3 — Mode select as a grid layout

Replace the scrolling list with a 2-column or 3-column grid.
The game has ~10 modes. Lay them out as a 2×5 or 3×4 grid:

```js
function drawModeSelect(ctx, canvas, modes, selectedIdx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88';
  ctx.font = fs(32) + 'px ' + FONT;
  ctx.fillText('CHOOSE YOUR MODE', canvas.width / 2, canvas.height * 0.10);
  
  ctx.fillStyle = '#224433';
  ctx.font = fs(15) + 'px ' + FONT;
  ctx.fillText('Each mode is its own world', canvas.width / 2, canvas.height * 0.17);
  
  const cols = 2;
  const rows = Math.ceil(modes.length / cols);
  const cardW = canvas.width * 0.38;
  const cardH = canvas.height * 0.13;
  const gapX = canvas.width * 0.04;
  const gapY = canvas.height * 0.02;
  const gridW = cols * cardW + (cols - 1) * gapX;
  const startX = (canvas.width - gridW) / 2;
  const startY = canvas.height * 0.22;
  
  modes.forEach((mode, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);
    const isSelected = i === selectedIdx;
    
    ctx.fillStyle = isSelected ? '#001a11' : '#050a08';
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = isSelected ? '#00ff88' : '#224433';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(cx, cy, cardW, cardH);
    
    // Mode icon + name
    ctx.textAlign = 'left';
    ctx.fillStyle = isSelected ? '#00ff88' : '#006644';
    ctx.font = fs(18) + 'px ' + FONT;
    ctx.fillText(mode.icon + '  ' + mode.label, cx + cardW * 0.06, cy + cardH * 0.42);
    
    ctx.fillStyle = '#334433';
    ctx.font = fs(13) + 'px ' + FONT;
    ctx.fillText(mode.desc, cx + cardW * 0.06, cy + cardH * 0.72);
  });
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#224433';
  ctx.font = fs(13) + 'px ' + FONT;
  ctx.fillText('Arrow keys to select  ·  ENTER to confirm  ·  ESC to go back',
    canvas.width / 2, canvas.height * 0.94);
}
```

Mode data (add to constants or menus.js):
```js
const GAME_MODES = [
  { id: 'grid',          icon: '◈', label: 'GRID NAVIGATOR',    desc: 'Consciousness as terrain' },
  { id: 'shooter',       icon: '⚡', label: 'TWIN-STICK',        desc: 'Confrontation & integration' },
  { id: 'rpg',           icon: '📖', label: 'NARRATIVE RPG',     desc: 'Story & identity' },
  { id: 'constellation', icon: '✦', label: 'CONSTELLATION',     desc: 'Pattern recognition' },
  { id: 'meditation',    icon: '◯', label: 'MEDITATION',        desc: 'Stillness practice' },
  { id: 'rhythm',        icon: '♪', label: 'RHYTHM',            desc: 'Synchronization' },
  { id: 'alchemy',       icon: '⚗', label: 'ALCHEMY',           desc: 'Transmutation' },
  { id: 'ornithology',   icon: '🐦', label: 'ORNITHOLOGY',      desc: 'Presence & observation' },
  { id: 'mycology',      icon: '🍄', label: 'MYCOLOGY',         desc: 'Hidden connection' },
  { id: 'architecture',  icon: '🏛', label: 'ARCHITECTURE',     desc: 'Structure & form' },
];
```

---

## EDIT 4 — Dreamscape screen: show ALL, paginate if needed

Find the dreamscape draw function. Replace the 6-item limit with pagination:

```js
const ITEMS_PER_PAGE = 8;  // show 8 at a time in a 2-column grid
const totalPages = Math.ceil(dreamscapes.length / ITEMS_PER_PAGE);
const pageStart = currentPage * ITEMS_PER_PAGE;
const visible = dreamscapes.slice(pageStart, pageStart + ITEMS_PER_PAGE);
```

Use same 2-column grid layout as mode select.
Show page indicator: "Page 1 / 2" and "→ for next page".

---

## EDIT 5 — Cosmology screen with descriptions in 2-column grid

Replace the plain list with a described grid:

```js
const COSMOLOGIES = [
  { id: 'none',     icon: '·', label: 'NONE',                 desc: 'Pure gameplay, no tradition overlay' },
  { id: 'chakra',   icon: '🔶', label: 'SEVEN ENERGY FIELDS',  desc: 'Hindu chakra system · energy as power' },
  { id: 'buddhist', icon: '☸', label: 'CYCLE OF ATTACHMENT',   desc: 'Buddhist dharma · suffering & release' },
  { id: 'tao',      icon: '☯', label: 'THE UNCARVED BLOCK',   desc: 'Taoist wu wei · effortless action' },
  { id: 'hermetic', icon: '✦', label: 'SEVEN UNIVERSAL LAWS', desc: 'Hermetic principles · as above so below' },
  { id: 'norse',    icon: '🌳', label: 'NINE REALM TREE',      desc: 'Norse cosmology · Yggdrasil worlds' },
  { id: 'celtic',   icon: '☘', label: 'VEIL CROSSING',        desc: 'Celtic tradition · thin places' },
  { id: 'gnostic',  icon: '👁', label: 'ORDER VS ENTROPY',     desc: 'Gnostic gnosis · light & shadow' },
  { id: 'confucian',icon: '🤝', label: 'FIVE RELATIONS',       desc: 'Confucian harmony · relational ethics' },
  { id: 'egyptian', icon: '⊕', label: 'THE DUAT',             desc: 'Egyptian mystery · underworld journey' },
  { id: 'mayan',    icon: '📅', label: "TZOLK'IN CYCLES",      desc: 'Mayan calendar · sacred time' },
  { id: 'iching',   icon: '≡', label: 'BOOK OF CHANGES',      desc: 'I Ching · change as constant' },
  { id: 'stoic',    icon: '⚖', label: 'STOIC PATH',           desc: 'Stoicism · virtue & reason' },
];
```

Use the same 2-column card grid as mode select.
Each card shows: icon + name on line 1, description on line 2.

---

## Verification
```bash
npm run build
```
Browser full walkthrough:
1. Start Journey → Mode select (2-column grid, all modes visible) ✓
2. Select a mode → Dreamscape select (all dreamscapes, paginated if needed) ✓
3. Select dreamscape → Cosmology select (2-column grid, each has description) ✓
4. Select cosmology → Game starts ✓
5. Mode NEVER appears twice in the flow ✓
6. No playstyle screen anywhere ✓
7. ESC at each step goes back one step ✓

## Commit message
```
feat: UI3 nav flow fixed -- no playstyles, grid layouts, cosmology descriptions
```
