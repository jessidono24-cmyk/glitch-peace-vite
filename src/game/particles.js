// Enhanced from: _archive/gp-v5-YOUR-BUILD/src/main.js (particles logic)
// PARTICLES - Enhanced VFX with pooling, types, reducedMotion and settings
// Keep function signatures: createParticles(gameState, gridX, gridY, color, count)

const POOL = [];

function obtainParticle() {
  return POOL.pop() || { x: 0, y: 0, vx: 0, vy: 0, r: 2, color: '#fff', life: 0, maxLife: 30 };
}

function releaseParticle(p) {
  POOL.push(p);
}

export function createParticles(gameState, gridX, gridY, color = '#ffffff', count = 10) {
  if (!gameState?.settings?.particles) return;

  const reduced = !!gameState.settings.reducedMotion;
  const tile = gameState.tileSize || 32;
  const cx = gridX * tile + tile / 2;
  const cy = gridY * tile + tile / 2;

  // Allow string "type" shortcuts: 'healing', 'damage', 'aura', 'trail'
  let type = 'burst';
  let col = color;
  if (typeof color === 'string') {
    const c = color.toLowerCase();
    if (c === 'healing' || c === 'heal' || c === 'peace') { type = 'healing'; col = '#00ff88'; }
    else if (c === 'damage' || c === 'hurt') { type = 'damage'; col = '#ff4444'; }
    else if (c === 'aura') { type = 'aura'; col = '#ffaaee'; }
    else if (c === 'trail') { type = 'trail'; col = '#00ccff'; }
    else if (c.startsWith('#')) { col = color; }
  }

  const actualCount = reduced ? Math.max(2, Math.round(count * 0.35)) : count;

  for (let i = 0; i < actualCount; i++) {
    const p = obtainParticle();
    p.x = cx + (Math.random() - 0.5) * (tile * 0.4);
    p.y = cy + (Math.random() - 0.5) * (tile * 0.4);
    const ang = Math.random() * Math.PI * 2;
    let speed = (type === 'trail') ? (0.2 + Math.random() * 0.6) : (0.8 + Math.random() * 2.8);
    if (type === 'healing') speed *= 0.8;
    if (type === 'damage') speed *= 1.2;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed - (type === 'damage' ? 0.6 : 0.0);
    p.r = (type === 'trail') ? (1 + Math.random() * 1.5) : (2 + Math.random() * 2.5);
    p.color = col;
    p.life = reduced ? (10 + Math.random() * 8) : (18 + Math.random() * 18);
    p.maxLife = p.life;
    gameState.particles = gameState.particles || [];
    gameState.particles.push(p);
  }
}

export function updateParticles(gameState) {
  if (!gameState || !gameState.particles) return;
  const reduced = !!gameState.settings.reducedMotion;
  // iterate backwards so we can recycle
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    // simple physics
    p.x += p.vx * (reduced ? 0.6 : 1);
    p.y += p.vy * (reduced ? 0.6 : 1);
    // gravity / drift
    p.vy += (reduced ? 0.06 : 0.18);
    p.life -= 1;
    if (p.life <= 0) {
      gameState.particles.splice(i, 1);
      releaseParticle(p);
    }
  }
}
