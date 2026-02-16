// PARTICLES - Simple VFX (BASE LAYER)
export function createParticles(gameState, gridX, gridY, color, count) {
  if (!gameState.settings.particles) return;
  
  const centerX = gridX * gameState.tileSize + gameState.tileSize / 2;
  const centerY = gridY * gameState.tileSize + gameState.tileSize / 2;
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    
    gameState.particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 1,
      decay: 0.02 + Math.random() * 0.02
    });
  }
}

export function updateParticles(gameState) {
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) gameState.particles.splice(i, 1);
  }
}
