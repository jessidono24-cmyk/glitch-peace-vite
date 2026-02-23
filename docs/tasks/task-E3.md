# Task E3 — Emotional HUD Row in renderer.js

## Goal
Add a visible emotional state row to the HUD: dominant emotion name
(color-coded), a coherence bar, a distortion bar, and a synergy label
when active. The emotional field already exists (`window._emotionalField`
from E1/E2) — this task just reads it and draws it.

## Definition of Done
- [ ] `npm run build` passes clean
- [ ] Title screen unchanged
- [ ] In gameplay, HUD shows an emotion name that changes when walking
      into hazard vs peace tiles
- [ ] Coherence bar (blue) and distortion bar (red/orange) are visible
      and update live
- [ ] Synergy label appears (briefly) when relevant — at minimum
      DEEP_INSIGHT should show when collecting back-to-back INSIGHT tiles
- [ ] No layout breakage — existing HP / EN / Score / Matrix labels
      remain readable

## Scope

### Touch ONLY this file
- `src/ui/renderer.js`

### Do NOT touch
- `src/systems/emotional-engine.js`
- `src/main.js`
- `src/game/player.js`
- Any other file

---

## Layout Plan

Current HUD height is **92px**. Expand it to **118px** to fit the
emotional row. All existing elements shift down by the exact amounts
noted below — nothing else changes.

```
0–16px   dreamscape name banner     (unchanged)
17–32px  HP bar                     (unchanged)
33–42px  Energy bar                 (unchanged — already tight)
43–49px  Glitch pulse bar           (conditional, unchanged)
50–64px  ── NEW: Emotion row ──
65–74px  Archetype / shield status  (was 68)
75–84px  Combo multiplier           (was 80)
85–94px  Insight tokens             (was 90)
```

Score / Matrix / Level columns on right side: nudge Y values down ~6px
to stay vertically centred in the taller HUD.

---

## Exact Edits — renderer.js only

### EDIT 1 — Expand hudH constant

Find (line 286):
```js
const hudH = 92;
```
Replace with:
```js
const hudH = 118;
```

---

### EDIT 2 — Add emotion row helper function

Add this new private function **above** `drawHUD` (insert before line 284):

```js
// ─── Emotion color map ───────────────────────────────────────────────────
const EMOTION_COLOR = {
  awe:        '#ccddff',
  grief:      '#4466aa',
  anger:      '#ff4422',
  curiosity:  '#ffcc00',
  shame:      '#aa4488',
  tenderness: '#ffaabb',
  fear:       '#cc2244',
  joy:        '#00ffcc',
  despair:    '#2233ff',
  hope:       '#88ffcc',
  peace:      '#00ff88',
  clarity:    '#00eeff',
  panic:      '#ff0022',
  neutral:    '#334455',
};

function drawEmotionRow(ctx, w, field) {
  if (!field) return;

  const dominant   = field.getDominant?.()   ?? 'neutral';
  const coherence  = field.getCoherence?.()  ?? 0.5;
  const distortion = field.getDistortion?.() ?? 0;
  const synergy    = field.getSynergy?.()    ?? null;

  const emColor = EMOTION_COLOR[dominant] || '#334455';
  const rowY    = 50;
  const barW    = 88;

  // Dominant emotion label
  ctx.font = '8px Courier New'; ctx.textAlign = 'left';
  ctx.fillStyle = '#223322'; ctx.fillText('EM', 14, rowY + 9);
  ctx.fillStyle = emColor; ctx.shadowColor = emColor; ctx.shadowBlur = 4;
  ctx.font = 'bold 9px Courier New';
  ctx.fillText(dominant.toUpperCase(), 32, rowY + 9);
  ctx.shadowBlur = 0;

  // Coherence bar (blue)
  const cohX = 32;
  const cohY = rowY + 12;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(cohX, cohY, barW, 5);
  ctx.fillStyle = '#0055cc'; ctx.shadowColor = '#0055cc'; ctx.shadowBlur = 3;
  ctx.fillRect(cohX, cohY, barW * Math.min(1, coherence), 5);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,80,200,0.18)'; ctx.lineWidth = 1;
  ctx.strokeRect(cohX, cohY, barW, 5);

  // Distortion bar (red/orange)
  const distY = rowY + 19;
  ctx.fillStyle = '#1a0a00'; ctx.fillRect(cohX, distY, barW, 5);
  const distC = distortion > 0.6 ? '#ff2200' : '#ff8800';
  ctx.fillStyle = distC; ctx.shadowColor = distC; ctx.shadowBlur = 3;
  ctx.fillRect(cohX, distY, barW * Math.min(1, distortion), 5);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(200,80,0,0.18)'; ctx.strokeRect(cohX, distY, barW, 5);

  // Bar labels
  ctx.font = '6px Courier New'; ctx.fillStyle = '#223344';
  ctx.fillText('COH', cohX + barW + 3, cohY + 5);
  ctx.fillStyle = '#332211';
  ctx.fillText('DIS', cohX + barW + 3, distY + 5);

  // Synergy label (gold, only when active)
  if (synergy) {
    ctx.font = 'bold 7px Courier New'; ctx.textAlign = 'center';
    ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 6;
    ctx.fillText('⟡ ' + synergy.replace(/_/g, ' '), w / 2, rowY + 10);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
}
```

---

### EDIT 3 — Call drawEmotionRow inside drawHUD

Find the glitch pulse block that ends around line 319:
```js
    ctx.fillStyle = pChr >= 1 ? '#ff00ff' : '#553355'; ctx.font = '7px Courier New'; ctx.fillText('PULSE' + (pChr >= 1 ? ' READY' : ''), 32 + eBarW + 4, 59);
  }
```

Immediately after that closing brace, add:
```js
  // ── Emotional field row (E3) ──────────────────────────────────────────
  drawEmotionRow(ctx, w, window._emotionalField || null);
```

---

### EDIT 4 — Shift the lower-left status items down by 14px

Find and update these four Y coordinates in drawHUD:

| Old line (approx) | Old value | New value |
|-------------------|-----------|-----------|
| archetype/shield text | `ctx.fillText('[ARCH ACTIVE]', 14, 68)` | `14, 82` |
| shield timer text | `ctx.fillText('SHIELD×'…, 14, 68)` | `14, 82` |
| shield streak text | `ctx.fillText('streak '…, 14, 68)` | `14, 82` |
| combo multiplier | `ctx.fillText('COMBO ×'…, 14, 80)` | `14, 96` |
| insight tokens | `ctx.fillText('◆×'…, 14, 90)` | `14, 108` |

(All three `68` refs → `82`, the `80` → `96`, the `90` → `108`)

---

### EDIT 5 — Shift right-column items down to match

Find these right-column lines:
```js
ctx.fillText('LVL ' + g.level, w - 12, 30);
ctx.fillText('◈×' + g.peaceLeft, w - 12, 44);
ctx.fillText((window._dreamIdx + 1 || 1) + '/10 DREAMS', w - 12, 58);
```

Replace Y values:
```js
ctx.fillText('LVL ' + g.level,                               w - 12, 30);   // unchanged
ctx.fillText('◈×' + g.peaceLeft,                             w - 12, 46);   // +2
ctx.fillText((window._dreamIdx + 1 || 1) + '/10 DREAMS',     w - 12, 72);   // +14
```

---

### EDIT 6 — Update bottom footer Y to match taller HUD

The footer bar at the bottom is drawn using `h`. No change needed there —
it uses `h` not `hudH`. But the score and matrix labels in the centre
column should shift slightly for visual balance. Find:
```js
ctx.fillText(String(g.score).padStart(7, '0'), w / 2, 38);
ctx.fillStyle = '#222838'; ctx.font = '8px Courier New'; ctx.fillText('SCORE', w / 2, 52);
```
Shift score label and SCORE sublabel:
```js
ctx.fillText(String(g.score).padStart(7, '0'), w / 2, 36);   // -2
ctx.fillText('SCORE', w / 2, 50);                              // -2
```

And the matrix indicator:
```js
ctx.fillText('MTX·' + matrixActive, w / 2 - 16, 68);
```
→
```js
ctx.fillText('MTX·' + matrixActive, w / 2 - 16, 64);   // -4
```

---

## What NOT to do
- Do NOT import EmotionalField directly — use `window._emotionalField`
- Do NOT add any new exports to renderer.js
- Do NOT change `drawGame`'s function signature
- Do NOT modify the grid draw code above `drawHUD`
- Do NOT add emotion tinting to the world yet — that is task E4

---

## Verification steps after editing

```bash
npm run build   # must pass

# Manual browser test:
# 1. Load title → unchanged
# 2. Start game → HUD shows "EM  NEUTRAL" in grey under the energy bar
# 3. Walk into DESPAIR tile → label shifts to "DESPAIR" in blue
# 4. Walk into PEACE tiles → label shifts toward "PEACE" / "JOY" in green
# 5. Coherence bar (blue) should be high when collecting peace nodes
# 6. Distortion bar (red) should rise after hitting hazard tiles
# 7. Layout looks clean — no text overlap with HP/score/matrix
```

## Commit message
```
feat: E3 emotional HUD row — dominant emotion, coherence, distortion bars
```
