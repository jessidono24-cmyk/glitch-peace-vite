/**
 * ShooterMode.js - Twin-Stick Shooter Gameplay Mode
 *
 * Top-down bullet-hell shooter with 4 weapons, wave-based enemies,
 * and score multipliers. Enemy collision is resolved via matter-js
 * rigid-body physics — replacing the old verlet separation pass.
 */

import GameMode from '../../core/interfaces/GameMode.js';
import { getDreamscapeTheme } from '../../systems/dreamscapes.js';
import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Events } = Matter;

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
    this.kills = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    
    // Canvas reference
    this.canvas = null;
    this.ctx = null;

    // matter-js rigid-body physics (enemy collision resolution)
    this._physEngine = Engine.create({ gravity: { x: 0, y: 0 } });
    this._physWorld  = this._physEngine.world;
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
    this.player.health = this.player.maxHealth;
    
    // Carry over level/score from the shared gameState for mode continuity
    this.waveNumber = gameState.level || 1;
    this.score = gameState.score || 0;
    
    // Start wave matching current level
    this.startWave(this.waveNumber);
    
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
    this._separateEnemies();
    
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
    
    // Handle weapon switching (1-4 keys) — use e.key digit characters
    for (let i = 0; i < 4; i++) {
      if (input.isKeyPressed(String(i + 1))) {
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

    // Transition to GAME_OVER when player dies (only once)
    if (this.player.health <= 0 && gameState.state !== 'GAME_OVER') {
      gameState.state = 'GAME_OVER';
      gameState.score = this.score;
      gameState.level = this.waveNumber;
    }
  }
  
  /**
   * Render shooter game
   */
  render(gameState, ctx) {
    // Use dreamscape theme for background
    const theme = getDreamscapeTheme(gameState.currentDreamscape || 'RIFT');
    ctx.fillStyle = theme.bg || '#0a0a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (theme.ambient) {
      ctx.fillStyle = theme.ambient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Render enemies
    this.renderEnemies(ctx, theme);
    
    // Render bullets
    this.renderBullets(ctx, theme);
    
    // Render particles
    this.renderParticles(ctx);
    
    // Render player
    this.renderPlayer(ctx, theme);
    
    // Render UI overlay
    this.renderUI(ctx, theme);
  }
  
  /**
   * Update player movement and rotation
   */
  updatePlayer(input, dt) {
    // Movement (WASD) — use e.key values (lowercase + Arrow*)
    let dx = 0;
    let dy = 0;
    
    if (input.isKeyDown('w') || input.isKeyDown('W') || input.isKeyDown('ArrowUp')) dy -= 1;
    if (input.isKeyDown('s') || input.isKeyDown('S') || input.isKeyDown('ArrowDown')) dy += 1;
    if (input.isKeyDown('a') || input.isKeyDown('A') || input.isKeyDown('ArrowLeft')) dx -= 1;
    if (input.isKeyDown('d') || input.isKeyDown('D') || input.isKeyDown('ArrowRight')) dx += 1;
    
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
    
    // Rotation towards mouse — use canvas-relative position for correct aiming
    const mouse = input.getCanvasMousePos(this.canvas);
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
    
    // Shoot sound (every other shot to avoid spam)
    try { window.AudioManager?.play('select'); } catch (e) {}
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
   * Resolve enemy overlaps using matter-js rigid-body physics.
   * Each enemy owns a circular Body stored on enemy._body.
   * AI movement sets the body position each frame; the engine step
   * resolves any penetrations so enemies never stack.
   */
  _separateEnemies() {
    // 1. Sync AI positions → physics bodies
    for (const e of this.enemies) {
      if (e._body) Body.setPosition(e._body, { x: e.x, y: e.y });
    }

    // 2. Run a single physics step (gravity is 0; only collision response matters)
    Engine.update(this._physEngine, 16);

    // 3. Read resolved positions back into enemy objects
    for (const e of this.enemies) {
      if (e._body) {
        e.x = e._body.position.x;
        e.y = e._body.position.y;
        // Keep bodies nearly stationary so AI stays in control
        Body.setVelocity(e._body, { x: 0, y: 0 });
      }
    }
  }

  /** Create a matter-js circular body for an enemy and add it to the world. */
  _addEnemyBody(enemy) {
    const body = Bodies.circle(enemy.x, enemy.y, enemy.size, {
      restitution: 0.2,
      friction: 0,
      frictionAir: 0,
      label: 'enemy',
    });
    enemy._body = body;
    World.add(this._physWorld, body);
  }

  /** Remove a matter-js body from the world when an enemy dies. */
  _removeEnemyBody(enemy) {
    if (enemy._body) {
      World.remove(this._physWorld, enemy._body);
      enemy._body = null;
    }
  }

  /**
   * Update all enemies
   */
  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      if (enemy.type === 'zigzag') {
        // Zigzag: perpendicular oscillation added to chase direction
        if (!enemy._zigTime) enemy._zigTime = 0;
        enemy._zigTime += dt;
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          // Perpendicular component
          const perpX = -ny;
          const perpY = nx;
          const zigAmt = Math.sin(enemy._zigTime * 6) * 0.7;
          enemy.x += (nx + perpX * zigAmt) * enemy.speed * dt;
          enemy.y += (ny + perpY * zigAmt) * enemy.speed * dt;
        }
      } else {
        // Default chase AI
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          enemy.x += (dx / dist) * enemy.speed * dt;
          enemy.y += (dy / dist) * enemy.speed * dt;
        }
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
            // Enemy destroyed — remove its physics body from the world
            this._removeEnemyBody(enemy);
            this.score += Math.floor(10 * this.comboMultiplier);
            this.kills++;
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
        health: 30 + Math.floor(waveNum * 5),
        maxHealth: 30 + Math.floor(waveNum * 5),
        size: 12,
        speed: 50 + waveNum * 5,
        type: 'chaser'
      });
    }

    // Add special enemy types on later waves
    if (waveNum >= 3) {
      // TANK: slow, high HP, big
      const tanks = Math.floor(waveNum / 3);
      for (let t = 0; t < tanks; t++) {
        const side = Math.floor(Math.random() * 4);
        let tx, ty;
        switch (side) {
          case 0: tx = Math.random() * this.canvas.width; ty = 0; break;
          case 1: tx = this.canvas.width; ty = Math.random() * this.canvas.height; break;
          case 2: tx = Math.random() * this.canvas.width; ty = this.canvas.height; break;
          default: tx = 0; ty = Math.random() * this.canvas.height; break;
        }
        this.enemies.push({ x: tx, y: ty, health: 150, maxHealth: 150, size: 22, speed: 25 + waveNum * 2, type: 'tank', color: '#ff6600' });
      }
    }

    if (waveNum >= 5) {
      // ZIGZAG: fast and erratic
      const zigzags = Math.min(3, Math.floor(waveNum / 5));
      for (let z = 0; z < zigzags; z++) {
        const side = Math.floor(Math.random() * 4);
        let zx, zy;
        switch (side) {
          case 0: zx = Math.random() * this.canvas.width; zy = 0; break;
          case 1: zx = this.canvas.width; zy = Math.random() * this.canvas.height; break;
          case 2: zx = Math.random() * this.canvas.width; zy = this.canvas.height; break;
          default: zx = 0; zy = Math.random() * this.canvas.height; break;
        }
        this.enemies.push({ x: zx, y: zy, health: 20, maxHealth: 20, size: 8, speed: 110 + waveNum * 8, type: 'zigzag', zigPhase: Math.random() * Math.PI * 2, color: '#ff44ff' });
      }
    }

    // BOSS WAVE — every 5th wave spawns a single powerful boss
    if (waveNum % 5 === 0) {
      const bossHp = 400 + waveNum * 30;
      this.enemies.push({
        x: this.canvas.width / 2,
        y: -60,
        health: bossHp, maxHealth: bossHp,
        size: 36, speed: 18 + waveNum * 1.5,
        type: 'boss', color: '#ff2266',
        _phase: 0,
      });
      // Show boss alert via shared AudioManager if available
      try { window.AudioManager?.play('boss'); } catch (_) {}
    }

    // Register a matter-js rigid body for every newly spawned enemy
    for (const enemy of this.enemies) {
      if (!enemy._body) this._addEnemyBody(enemy);
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
  renderPlayer(ctx, theme = {}) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.rotation);
    
    // Draw ship (triangle) — use dreamscape accent color
    const accent = theme.accent || '#00ffff';
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw weapon indicator
    const weaponColors = ['#ffff00', '#ff00ff', '#ff4444', '#00ff00'];
    ctx.fillStyle = weaponColors[this.player.currentWeapon];
    ctx.fillRect(-8, -3, 6, 6);
    
    ctx.restore();
  }
  
  /**
   * Render all bullets
   */
  renderBullets(ctx, theme = {}) {
    const weaponColors = ['#ffff00', '#ff00ff', '#ff4444', theme.accent || '#00ff00'];
    
    for (const bullet of this.bullets) {
      ctx.fillStyle = weaponColors[bullet.weapon] || '#fff';
      ctx.shadowColor = weaponColors[bullet.weapon] || '#fff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  
  /**
   * Render all enemies
   */
  renderEnemies(ctx, theme = {}) {
    const enemyColor = theme.accent ? this._shiftHue(theme.accent, 180) : '#ff3333';
    const now = Date.now();
    for (const enemy of this.enemies) {
      // Boss: special pulsing ring render
      if (enemy.type === 'boss') {
        const pulse = 0.65 + 0.35 * Math.sin(now / 300);
        ctx.globalAlpha = pulse;
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur  = 20;
        ctx.strokeStyle = '#ff2266';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle   = '#660022';
        ctx.shadowColor = '#ff2266';
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = '#ff6688';
        ctx.font        = `bold ${Math.floor(enemy.size * 0.9)}px monospace`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◆', enemy.x, enemy.y);
        ctx.textBaseline = 'alphabetic';
        continue;
      }

      ctx.fillStyle = enemyColor;
      ctx.shadowColor = enemyColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Health bar
      const barWidth = 20;
      const barHeight = 3;
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#222';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth * healthPercent, barHeight);
    }
  }

  /** Simple complementary hue shift for enemy color differentiation */
  _shiftHue(hex, degrees) {
    // Simplified: for specific dreamscape accents, return a readable enemy color
    const shiftMap = {
      '#00e5ff': '#ff4444', '#00ff88': '#ff3366',
      '#8844ff': '#ffaa00', '#ffcc00': '#cc44ff', '#ddddff': '#ff6644',
    };
    return shiftMap[hex] || '#ff3333';
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
  renderUI(ctx, theme = {}) {
    const accent = theme.accent || '#00ffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    
    // Health
    ctx.fillText(`HP: ${Math.max(0, Math.round(this.player.health))}/${this.player.maxHealth}`, 10, 25);
    
    // Wave
    ctx.fillStyle = accent;
    ctx.fillText(`Wave: ${this.waveNumber}`, 10, 45);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${this.score}`, 10, 65);
    
    // Combo
    if (this.comboMultiplier > 1) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`x${this.comboMultiplier.toFixed(1)} COMBO!`, 10, 85);
    }
    
    // Weapon name
    const weaponNames = ['SPREAD', 'LASER', 'MISSILES', 'ENERGY'];
    ctx.fillStyle = accent;
    ctx.fillText(`Weapon: ${weaponNames[this.player.currentWeapon]} (${this.player.currentWeapon + 1})`, 10, 105);
    
    // Wave incoming banner
    if (!this.waveActive && this.enemies.length === 0) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      const nextWave = this.waveNumber + 1;
      const bossAlert = nextWave % 5 === 0 ? '  ⚠ BOSS WAVE' : '';
      ctx.fillText(`WAVE ${nextWave} INCOMING...${bossAlert}`, this.canvas.width / 2, this.canvas.height - 40);
      ctx.shadowBlur = 0;
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
    }

    // Boss HP bar (centered, bottom of screen) — shown whenever a boss is alive
    const boss = this.enemies.find(e => e.type === 'boss');
    if (boss) {
      const w     = this.canvas.width;
      const barW  = Math.floor(w * 0.6);
      const barX  = Math.floor((w - barW) / 2);
      const barY  = this.canvas.height - 28;
      const pct   = boss.health / boss.maxHealth;

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(barX - 2, barY - 18, barW + 4, 28);

      ctx.fillStyle = '#440011';
      ctx.fillRect(barX, barY - 12, barW, 14);
      ctx.fillStyle = '#ff2266';
      ctx.fillRect(barX, barY - 12, Math.floor(barW * pct), 14);

      ctx.fillStyle = '#ff6688';
      ctx.font      = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff2266';
      ctx.shadowBlur  = 6;
      ctx.fillText(`⚔ BOSS  ${Math.ceil(boss.health)} / ${boss.maxHealth}`, w / 2, barY - 15);
      ctx.shadowBlur = 0;
      ctx.textAlign  = 'left';
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
    // Remove all enemy physics bodies and clear the world
    for (const enemy of this.enemies) this._removeEnemyBody(enemy);
    World.clear(this._physWorld);
    Engine.clear(this._physEngine);
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    console.log('[ShooterMode] Cleaned up');
  }
}
