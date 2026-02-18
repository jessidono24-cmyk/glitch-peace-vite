export const POWERUP_TYPES = {
  SHIELD: { 
    duration: 10000, // 10 seconds
    icon: '🛡', 
    color: '#00aaff',
    effect: 'absorb_damage'
  },
  SPEED: {
    duration: 8000,
    icon: '⚡',
    color: '#ffff00',
    effect: 'movement_boost'
  },
  FREEZE: {
    duration: 5000,
    icon: '❄',
    color: '#88ffff',
    effect: 'stun_enemies'
  },
  REGEN: {
    duration: 15000,
    icon: '💚',
    color: '#00ff88',
    effect: 'heal_over_time'
  }
};

export function createPowerup(type, x, y) {
  return {
    type,
    x,
    y,
    collected: false,
    ...POWERUP_TYPES[type]
  };
}

export function applyPowerup(gameState, powerup) {
  gameState.activePowerups = gameState.activePowerups || [];
  
  const active = {
    type: powerup.type,
    effect: powerup.effect,
    expiresAt: Date.now() + powerup.duration,
    icon: powerup.icon,
    color: powerup.color
  };
  
  gameState.activePowerups.push(active);
}

export function updatePowerups(gameState) {
  if (!gameState.activePowerups) return;
  
  const now = Date.now();
  gameState.activePowerups = gameState.activePowerups.filter(p => p.expiresAt > now);
  
  // Apply effects
  for (const p of gameState.activePowerups) {
    if (p.effect === 'heal_over_time') {
      // Heal 1 HP per second
      if (Math.random() < 0.016) { // ~1/60 chance per frame at 60fps
        if (typeof heal === 'function') heal(gameState, 1);
      }
    }
  }
}

export function hasPowerup(gameState, effect) {
  if (!gameState.activePowerups) return false;
  return gameState.activePowerups.some(p => p.effect === effect);
}
