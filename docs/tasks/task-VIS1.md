# Task VIS1 — Mode Visual Identities: Every Mode Looks Distinct

## Goal
Every game mode must have its own unmistakable visual identity.
A player should be able to glance at a screenshot and immediately
know which mode they're in. Grid tiles appear ONLY in Grid Navigator.
No other mode uses grid tiles or teal bordered squares.

## Definition of Done
- [ ] `npm run build` passes
- [ ] Grid Navigator: blue/teal bordered tile grid
- [ ] Twin-Stick Shooter: deep space black, neon projectiles, no grid
- [ ] Narrative RPG: warm amber/sepia, text-forward, no grid
- [ ] Constellation: deep navy starfield, star points connected by lines, no grid
- [ ] Meditation: soft gradient background, slow breathing particles, no grid
- [ ] Rhythm: pulsing color waves synced to beat, no grid
- [ ] Alchemy: dark green laboratory aesthetic, no grid
- [ ] Ornithology: natural sky/earth tones, open landscape feel, no grid
- [ ] Mycology: rich earth tones, visible mycelium thread connections, no grid
- [ ] Architecture: blueprint blue precise grid (different from game grid), no game tiles

## Color Palette Reference

| Mode | Primary | Secondary | Accent | Background |
|------|---------|-----------|--------|------------|
| Grid Navigator | #0066cc | #00aaff | #00ff88 | #000d1a |
| Twin-Stick | #ff0044 | #ff6600 | #ffff00 | #000005 |
| Narrative RPG | #cc8800 | #ffaa33 | #ffffff | #0d0800 |
| Constellation | #4444ff | #8888ff | #ffffff | #000008 |
| Meditation | #006688 | #00aacc | #88ffee | #000d0d |
| Rhythm | #cc00cc | #ff44ff | #ffaaff | #0d000d |
| Alchemy | #006600 | #00aa00 | #aaff00 | #000d00 |
| Ornithology | #668833 | #99bb44 | #ffee88 | #0a0d05 |
| Mycology | #664422 | #996633 | #ccaa55 | #0d0800 |
| Architecture | #003399 | #4466cc | #aabbff | #000510 |

---

## Implementation Pattern

For each mode file, find or create a `drawBackground(ctx, canvas, state)` function.

### Grid Navigator — keep existing, just ensure isolation
```js
// Only in grid mode:
function drawGridBackground(ctx, canvas, state) {
  ctx.fillStyle = '#000d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // grid tiles drawn only here
}
```

### Twin-Stick Shooter
```js
function drawShooterBackground(ctx, canvas, state) {
  // Deep space
  ctx.fillStyle = '#000005';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Star field (static, generated once)
  if (!state._stars) {
    state._stars = Array.from({length: 200}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      brightness: Math.random()
    }));
  }
  state._stars.forEach(s => {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + s.brightness * 0.7})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Scan line effect (subtle)
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillStyle = 'rgba(255,0,68,0.015)';
    ctx.fillRect(0, y, canvas.width, 1);
  }
}
```

### Narrative RPG
```js
function drawRPGBackground(ctx, canvas, state) {
  // Warm darkness — like candlelight in a library
  ctx.fillStyle = '#0d0800';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Vignette
  const vignette = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, canvas.height * 0.2,
    canvas.width/2, canvas.height/2, canvas.height * 0.8
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Ambient amber glow from center
  const glow = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, 0,
    canvas.width/2, canvas.height/2, canvas.height * 0.5
  );
  glow.addColorStop(0, 'rgba(180,100,0,0.08)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Constellation
```js
function drawConstellationBackground(ctx, canvas, state) {
  // Deep navy void
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Dense star field
  if (!state._stars) {
    state._stars = Array.from({length: 400}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03
    }));
  }
  
  const t = (state.time || 0);
  state._stars.forEach(s => {
    const alpha = 0.4 + 0.4 * Math.sin(t * s.speed + s.twinkle);
    ctx.fillStyle = `rgba(200,220,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Nebula wisps
  const nebula = ctx.createRadialGradient(
    canvas.width * 0.3, canvas.height * 0.4, 0,
    canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.3
  );
  nebula.addColorStop(0, 'rgba(68,68,255,0.06)');
  nebula.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Meditation
```js
function drawMeditationBackground(ctx, canvas, state) {
  // Soft gradient — changes with breath phase
  const breathPhase = Math.sin((state.time || 0) * 0.3); // slow breath
  const intensity = 0.5 + breathPhase * 0.1;
  
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, `rgba(0,${Math.round(40 * intensity)},${Math.round(60 * intensity)},1)`);
  grad.addColorStop(1, `rgba(0,${Math.round(15 * intensity)},${Math.round(25 * intensity)},1)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Floating particles (breath visualization)
  if (!state._particles) {
    state._particles = Array.from({length: 40}, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      speed: 0.2 + Math.random() * 0.5,
      size: 1 + Math.random() * 3,
      alpha: Math.random()
    }));
  }
  state._particles.forEach(p => {
    p.y -= p.speed;
    if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
    ctx.fillStyle = `rgba(136,255,238,${p.alpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

### Rhythm
```js
function drawRhythmBackground(ctx, canvas, state) {
  ctx.fillStyle = '#0d000d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Pulse rings emanating from center on beat
  const beatPhase = ((state.time || 0) * 2) % 1;
  const rings = 3;
  for (let i = 0; i < rings; i++) {
    const phase = (beatPhase + i / rings) % 1;
    const r = phase * canvas.height * 0.8;
    const alpha = (1 - phase) * 0.15;
    ctx.strokeStyle = `rgba(204,0,204,${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}
```

### Alchemy
```js
function drawAlchemyBackground(ctx, canvas, state) {
  // Dark green laboratory
  ctx.fillStyle = '#000d00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Bubbling effect at bottom
  if (!state._bubbles) {
    state._bubbles = Array.from({length: 20}, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height,
      speed: 0.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 6,
      wobble: Math.random() * Math.PI * 2
    }));
  }
  state._bubbles.forEach(b => {
    b.y -= b.speed;
    b.wobble += 0.05;
    b.x += Math.sin(b.wobble) * 0.5;
    if (b.y < -10) { b.y = canvas.height + 10; b.x = Math.random() * canvas.width; }
    ctx.strokeStyle = 'rgba(0,170,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.stroke();
  });
  
  // Cauldron glow at bottom center
  const glow = ctx.createRadialGradient(
    canvas.width/2, canvas.height, 0,
    canvas.width/2, canvas.height, canvas.height * 0.4
  );
  glow.addColorStop(0, 'rgba(0,100,0,0.2)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Ornithology
```js
function drawOrnithologyBackground(ctx, canvas, state) {
  // Natural sky — gradient from horizon to zenith
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0a0d05');     // dark zenith
  grad.addColorStop(0.4, '#1a2a0a');   // mid sky (dark green-blue)
  grad.addColorStop(1, '#0d1205');     // dark ground
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Subtle horizon line
  ctx.strokeStyle = 'rgba(102,136,51,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.55);
  ctx.lineTo(canvas.width, canvas.height * 0.55);
  ctx.stroke();
}
```

### Mycology
```js
function drawMycologyBackground(ctx, canvas, state) {
  // Rich earth — dark soil
  ctx.fillStyle = '#0d0800';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Mycelium network threads (faint connecting lines)
  if (!state._mycelium) {
    // Generate network nodes
    state._mycelium = {
      nodes: Array.from({length: 30}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      })),
    };
    // Connect nearby nodes
    state._mycelium.edges = [];
    state._mycelium.nodes.forEach((a, i) => {
      state._mycelium.nodes.forEach((b, j) => {
        if (i < j) {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 180) state._mycelium.edges.push([i, j, d]);
        }
      });
    });
  }
  
  ctx.strokeStyle = 'rgba(102,68,34,0.15)';
  ctx.lineWidth = 0.5;
  state._mycelium.edges.forEach(([i, j]) => {
    const a = state._mycelium.nodes[i];
    const b = state._mycelium.nodes[j];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });
}
```

### Architecture
```js
function drawArchitectureBackground(ctx, canvas, state) {
  // Blueprint dark blue
  ctx.fillStyle = '#000510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Blueprint grid (different from game grid — very fine, faint)
  const gridSize = 30;
  ctx.strokeStyle = 'rgba(0,51,153,0.2)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
```

---

## Wire Backgrounds to Mode Renderer

In `src/ui/renderer.js` or the mode files, find where each mode draws
its background and replace with the appropriate function above.

Look for the mode dispatch:
```bash
grep -n "case.*shooter\|case.*grid\|case.*meditation\|drawBackground\|modeId\|mode\.id" src/ui/renderer.js | head -20
```

Add a background dispatch at the top of each render cycle:
```js
function drawModeBackground(ctx, canvas, state) {
  const id = state.modeId || state.mode?.id || 'grid';
  switch(id) {
    case 'grid':           drawGridBackground(ctx, canvas, state); break;
    case 'shooter':        drawShooterBackground(ctx, canvas, state); break;
    case 'rpg':            drawRPGBackground(ctx, canvas, state); break;
    case 'constellation':  drawConstellationBackground(ctx, canvas, state); break;
    case 'meditation':     drawMeditationBackground(ctx, canvas, state); break;
    case 'rhythm':         drawRhythmBackground(ctx, canvas, state); break;
    case 'alchemy':        drawAlchemyBackground(ctx, canvas, state); break;
    case 'ornithology':    drawOrnithologyBackground(ctx, canvas, state); break;
    case 'mycology':       drawMycologyBackground(ctx, canvas, state); break;
    case 'architecture':   drawArchitectureBackground(ctx, canvas, state); break;
    default:
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
```

Call this FIRST in every render frame, before drawing any game elements.

---

## Verification
```bash
npm run build
```
Browser: enter each mode and take a screenshot.
Each mode should be immediately visually distinct.
Grid tiles should ONLY appear in Grid Navigator mode.

Run PLAYTEST4 after this task to confirm all visual checks pass.

## Commit message
```
feat: VIS1 mode visual identities -- every mode has distinct aesthetic
```
