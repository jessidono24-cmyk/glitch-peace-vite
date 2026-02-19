/**
 * ShooterMode.js - Twin-Stick Shooter Gameplay Mode
 * 
 * Top-down bullet-hell shooter with 4 weapons, wave-based enemies,
 * and score multipliers. Tests modular architecture from Phase 1.
 */

import GameMode from '../../core/interfaces/GameMode.js';

export default class ShooterMode extends GameMode {
  constructor() {
    super();
    this.name = 'Twin-Stick Shooter';
    this.type = 'shooter';
    
    // Player state
    this.player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      speed: 200, // pixels per second
      health: 100,
      maxHealth: 100,
      shields: 0,
      size: 16,
      currentWeapon: 0, // 0-3
      weaponCooldowns: [0, 0, 0, 0]
    };
    
    // Game state
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.waveNumber = 1;
    this.waveActive = false;
    this.enemiesRemaining = 0;
    this.score = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    
    // Canvas reference
    this.canvas = null;
    this.ctx = null;
  }
  
  /**
   * Initialize shooter mode
   */
  init(gameState, canvas, ctx) {
    console.log('[ShooterMode] Initializing twin-stick shooter');
    
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Center player
    this.player.x = canvas.width / 2;
    this.player.y = canvas.height / 2;
    
    // Start first wave
    this.startWave(1);
    
    // Set mode-specific state
    gameState.modeState = {
      modeName: this.name,
      waveNumber: this.waveNumber,
      score: this.score
    };
  }
  
  /**
   * Update game logic
   */
  update(gameState, deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    const input = gameState.input;
    
    // Update player
    this.updatePlayer(input, dt);
    
    // Update bullets
    this.updateBullets(dt);
    
    // Update enemies
    this.updateEnemies(dt);
    
    // Update particles
    this.updateParticles(dt);
    
    // Check collisions
    this.checkCollisions();
    
    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboMultiplier = 1;
      }
    }
    
    // Check wave completion
    if (this.waveActive && this.enemies.length === 0) {
      this.completeWave();
    }
    
    // Handle shooting
    if (input.isMouseDown(0)) { // Left mouse button
      this.fireWeapon();
    }
    
    // Handle weapon switching (1-4 keys)
    for (let i = 0; i < 4; i++) {
      if (input.isKeyPressed(`Digit${i + 1}`)) {
        this.player.currentWeapon = i;
      }
    }
    
    // Update weapon cooldowns
    for (let i = 0; i < 4; i++) {
      if (this.player.weaponCooldowns[i] > 0) {
        this.player.weaponCooldowns[i] -= dt;
      }
    }
    
    // Update mode state
    gameState.modeState = {
      modeName: this.name,
      waveNumber: this.waveNumber,
      score: this.score,
      combo: this.comboMultiplier
    };
  }
  
  /**
   * Render shooter game
   */
  render(gameState, ctx) {
    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render enemies
    this.renderEnemies(ctx);
    
    // Render bullets
    this.renderBullets(ctx);
    
    // Render particles
    this.renderParticles(ctx);
    
    // Render player
    this.renderPlayer(ctx);
    
    // Render UI overlay
    this.renderUI(ctx);
  }
  
  /**
   * Update player movement and rotation
   */
  updatePlayer(input, dt) {
    // Movement (WASD)
    let dx = 0;
    let dy = 0;
    
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) dy -= 1;
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) dy += 1;
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) dx -= 1;
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }
    
    // Apply movement
    this.player.vx = dx * this.player.speed;
    this.player.vy = dy * this.player.speed;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    
    // Keep player in bounds
    const margin = this.player.size;
    this.player.x = Math.max(margin, Math.min(this.canvas.width - margin, this.player.x));
    this.player.y = Math.max(margin, Math.min(this.canvas.height - margin, this.player.y));
    
    // Rotation towards mouse
    const mouse = input.getMousePosition();
    if (mouse) {
      const dx = mouse.x - this.player.x;
      const dy = mouse.y - this.player.y;
      this.player.rotation = Math.atan2(dy, dx);
    }
  }
  
  /**
   * Fire current weapon
   */
  fireWeapon() {
    const weaponId = this.player.currentWeapon;
    const cooldown = this.player.weaponCooldowns[weaponId];
    
    if (cooldown > 0) return;
    
    const weapons = [
      { name: 'Spread', cooldown: 0.2, bullets: 3, spread: 0.3 },
      { name: 'Laser', cooldown: 0.1, bullets: 1, spread: 0 },
      { name: 'Missiles', cooldown: 0.5, bullets: 1, spread: 0 },
      { name: 'Energy', cooldown: 0.3, bullets: 1, spread: 0 }
    ];
    
    const weapon = weapons[weaponId];
    this.player.weaponCooldowns[weaponId] = weapon.cooldown;
    
    // Create bullets
    for (let i = 0; i < weapon.bullets; i++) {
      const angle = this.player.rotation + (i - (weapon.bullets - 1) / 2) * weapon.spread;
      const speed = 400;
      
      this.bullets.push({
        x: this.player.x + Math.cos(angle) * 20,
        y: this.player.y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4,
        damage: 10,
        weapon: weaponId,
        lifetime: 2
      });
    }
  }
  
  /**
   * Update all bullets
   */
  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.lifetime -= dt;
      
      // Remove if out of bounds or expired
      if (bullet.x < 0 || bullet.x > this.canvas.width ||
          bullet.y < 0 || bullet.y > this.canvas.height ||
          bullet.lifetime <= 0) {
        this.bullets.splice(i, 1);
      }
    }
  }
  
  /**
   * Update all enemies
   */
  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      // Simple chase AI
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        enemy.x += (dx / dist) * enemy.speed * dt;
        enemy.y += (dy / dist) * enemy.speed * dt;
      }
    }
  }
  
  /**
   * Update particles
   */
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt;
      p.alpha -= dt / p.maxLifetime;
      
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Check bullet-enemy and enemy-player collisions
   */
  checkCollisions() {
    // Bullet vs Enemy
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bullet.size + enemy.size) {
          // Hit!
          enemy.health -= bullet.damage;
          this.bullets.splice(i, 1);
          
          // Create hit particles
          this.createParticles(enemy.x, enemy.y, 5, '#ff4444');
          
          if (enemy.health <= 0) {
            // Enemy destroyed
            this.score += Math.floor(10 * this.comboMultiplier);
            this.comboMultiplier += 0.1;
            this.comboTimer = 3; // Reset combo timer
            this.createParticles(enemy.x, enemy.y, 15, '#ffaa00');
            this.enemies.splice(j, 1);
          }
          
          break;
        }
      }
    }
    
    // Enemy vs Player
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.player.size + enemy.size) {
        this.player.health -= 20;
        this.createParticles(this.player.x, this.player.y, 10, '#ff0000');
        // Push enemy back
        enemy.x -= dx * 0.5;
        enemy.y -= dy * 0.5;
      }
    }
  }
  
  /**
   * Create explosion particles
   */
  createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        lifetime: 0.5 + Math.random() * 0.5,
        maxLifetime: 1,
        alpha: 1
      });
    }
  }
  
  /**
   * Start a new wave
   */
  startWave(waveNum) {
    this.waveNumber = waveNum;
    this.waveActive = true;
    
    // Spawn enemies based on wave
    const count = 5 + waveNum * 3;
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch (side) {
        case 0: x = Math.random() * this.canvas.width; y = 0; break;
        case 1: x = this.canvas.width; y = Math.random() * this.canvas.height; break;
        case 2: x = Math.random() * this.canvas.width; y = this.canvas.height; break;
        case 3: x = 0; y = Math.random() * this.canvas.height; break;
      }
      
      this.enemies.push({
        x, y,
        health: 30,
        maxHealth: 30,
        size: 12,
        speed: 50 + waveNum * 5,
        type: 'chaser'
      });
    }
    
    console.log(`[ShooterMode] Wave ${waveNum} started - ${count} enemies`);
  }
  
  /**
   * Complete current wave
   */
  completeWave() {
    this.waveActive = false;
    this.score += Math.floor(100 * this.waveNumber);
    console.log(`[ShooterMode] Wave ${this.waveNumber} complete! Score: ${this.score}`);
    
    // Start next wave after delay
    setTimeout(() => {
      if (this.player.health > 0) {
        this.startWave(this.waveNumber + 1);
      }
    }, 2000);
  }
  
  /**
   * Render player ship
   */
  renderPlayer(ctx) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.rotation);
    
    // Draw ship (triangle)
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    
    // Draw weapon indicator
    const weaponColors = ['#ffff00', '#ff00ff', '#ff4444', '#00ff00'];
    ctx.fillStyle = weaponColors[this.player.currentWeapon];
    ctx.fillRect(-8, -3, 6, 6);
    
    ctx.restore();
  }
  
  /**
   * Render all bullets
   */
  renderBullets(ctx) {
    const bulletColors = ['#ffff00', '#ff00ff', '#ff4444', '#00ff00'];
    
    for (const bullet of this.bullets) {
      ctx.fillStyle = bulletColors[bullet.weapon];
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Render all enemies
   */
  renderEnemies(ctx) {
    for (const enemy of this.enemies) {
      // Draw enemy (circle)
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw health bar
      const barWidth = 20;
      const barHeight = 3;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth * healthPercent, barHeight);
    }
  }
  
  /**
   * Render particles
   */
  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  
  /**
   * Render UI overlay
   */
  renderUI(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    
    // Health
    ctx.fillText(`HP: ${Math.max(0, this.player.health)}/${this.player.maxHealth}`, 10, 25);
    
    // Wave
    ctx.fillText(`Wave: ${this.waveNumber}`, 10, 45);
    
    // Score
    ctx.fillText(`Score: ${this.score}`, 10, 65);
    
    // Combo
    if (this.comboMultiplier > 1) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`x${this.comboMultiplier.toFixed(1)} COMBO!`, 10, 85);
    }
    
    // Weapon name
    const weaponNames = ['SPREAD', 'LASER', 'MISSILES', 'ENERGY'];
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`Weapon: ${weaponNames[this.player.currentWeapon]} (${this.player.currentWeapon + 1})`, 10, 105);
    
    // Game over
    if (this.player.health <= 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = '48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      ctx.fillText(`Waves Survived: ${this.waveNumber - 1}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
      
      ctx.textAlign = 'left';
    }
  }
  
  /**
   * Get HUD data for external display
   */
  getHUDData() {
    return {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      level: this.waveNumber,
      score: this.score,
      objective: `Survive Wave ${this.waveNumber}`
    };
  }
  
  /**
   * Handle input (delegated to update)
   */
  handleInput(gameState, input) {
    // Input handled in update() for shooter mode
  }
  
  /**
   * Pause shooter
   */
  pause() {
    console.log('[ShooterMode] Paused');
  }
  
  /**
   * Resume shooter
   */
  resume() {
    console.log('[ShooterMode] Resumed');
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    console.log('[ShooterMode] Cleaned up');
  }
}
