'use strict';
// GLITCH·PEACE — shooter-mode.js — Phase M2 (Complete)
import { GameMode } from './game-mode.js';

// ─── Wave difficulty scaling constants ────────────────────────────────
const WAVE_HEALTH_SCALE = 0.15; // per-wave HP multiplier increase
const WAVE_SPEED_SCALE  = 0.08; // per-wave speed multiplier increase
const CONTACT_DAMAGE_COOLDOWN = 0.5; // seconds between contact hits

const ENEMY_TYPES = {
  rusher:  { color: '#ff3366', glowColor: '#ff0044', health: 25,  speed: 80, radius: 12, damage: 12, score: 10,  shoots: false },
  shooter: { color: '#ff8800', glowColor: '#ff6600', health: 40,  speed: 45, radius: 14, damage: 8,  score: 20,  shoots: true,  shootInterval: 2.2, shootSpeed: 260, shootDamage: 6 },
  tank:    { color: '#cc00ff', glowColor: '#aa00ee', health: 120, speed: 28, radius: 20, damage: 18, score: 40,  shoots: false },
};

const POWERUP_TYPES = {
  health:        { color: '#00ff44', label: 'HEAL',    duration: 0,  speedMul: 1,    fireMul: 1    },
  speed:         { color: '#ffff00', label: 'SPEED',   duration: 5,  speedMul: 1.6,  fireMul: 1    },
  rapidfire:     { color: '#ff8800', label: 'RAPID',   duration: 5,  speedMul: 1,    fireMul: 0.3  },
  shield:        { color: '#00aaff', label: 'SHIELD',  duration: 8,  speedMul: 1,    fireMul: 1    },
  multishot:     { color: '#ff00ff', label: 'MULTI',   duration: 6,  speedMul: 1,    fireMul: 1    },
  bomb:          { color: '#ff4400', label: 'BOMB',    duration: 0,  speedMul: 1,    fireMul: 1    },
  invincibility: { color: '#ffffff', label: 'INVINCI', duration: 4,  speedMul: 1,    fireMul: 1    },
};

export class ShooterMode extends GameMode {
  constructor(sharedSystems) {
    super(sharedSystems);
    this.name = 'shooter';
    this.player = { x:0, y:0, vx:0, vy:0, angle:0, health:100, maxHealth:100, speed:200, radius:15, score:0, invincible:0 };
    this.bullets = [];
    this.enemyBullets = [];
    this.fireRate = 0.25;
    this.timeSinceLastShot = 0;
    this.bulletSpeed = 400;
    this.bulletDamage = 10;
    this.enemies = [];
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDelay = 3;
    this.waveBanner = null;
    this.paused = false;
    this.particles = [];
    this.powerUps = [];
    this.activePowerUps = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.isShooting = false;
    this.worldWidth  = 800;
    this.worldHeight = 600;
    this.camera = { x: 0, y: 0 };
    this._lastDt = 0.016;
  }

  init(config = {}) {
    super.init(config);
    this.player.x = this.worldWidth  / 2;
    this.player.y = this.worldHeight / 2;
    this.player.vx = this.player.vy = 0;
    this.player.health = this.player.maxHealth;
    this.player.score = 0;
    this.player.invincible = 0;
    this.bullets = []; this.enemyBullets = [];
    this.enemies = []; this.powerUps = [];
    this.activePowerUps = {}; this.particles = [];
    this.waveBanner = null; this.paused = false;
    this.wave = 1; this.waveTimer = 0; this.timeSinceLastShot = 0;
    this.fireRate = 0.25;
    this.spawnWave();
    console.log('[ShooterMode] Initialized');
  }

  update(dt, keys, matrixActive, ts) {
    if (this.paused) return null;
    const dtSec = dt / 1000;
    this._lastDt = dtSec;
    if (this.waveBanner) {
      this.waveBanner.timer -= dtSec;
      if (this.waveBanner.timer <= 0) this.waveBanner = null;
      if (this.waveBanner && this.waveBanner.timer > 2) return null;
    }
    this.updatePlayerMovement(dtSec, keys);
    this.updateShooting(dtSec);
    this.updateBullets(dtSec);
    this.updateEnemyBullets(dtSec);
    this.updateEnemies(dtSec);
    this.updatePowerUps(dtSec);
    this.updateParticles(dtSec);
    this.checkCollisions(dtSec);
    this.updateWaveSpawning(dtSec);
    this.updateCamera();
    if (this.player.invincible > 0) this.player.invincible -= dtSec;
    const FEAR_RATE = 0.1, JOY_RATE = 0.05;
    if (this.enemies.length > 3) this.emotionalField.addEmotion('fear', FEAR_RATE * dtSec);
    else                          this.emotionalField.addEmotion('joy',  JOY_RATE  * dtSec);
    this.emotionalField.decay(dtSec);
    if (this.player.health <= 0)
      return { phase: 'dead', data: { score: this.player.score, mode: 'shooter', wave: this.wave } };
    return null;
  }

  updatePlayerMovement(dt, keys) {
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('W') || keys.has('ArrowUp'))    dy -= 1;
    if (keys.has('s') || keys.has('S') || keys.has('ArrowDown'))  dy += 1;
    if (keys.has('a') || keys.has('A') || keys.has('ArrowLeft'))  dx -= 1;
    if (keys.has('d') || keys.has('D') || keys.has('ArrowRight')) dx += 1;
    if (dx !== 0 && dy !== 0) { const len = Math.sqrt(dx*dx+dy*dy); dx /= len; dy /= len; }
    const spd = this.activePowerUps.speed ? this.player.speed * POWERUP_TYPES.speed.speedMul : this.player.speed;
    this.player.vx = dx * spd; this.player.vy = dy * spd;
    this.player.x += this.player.vx * dt; this.player.y += this.player.vy * dt;
    this.player.x = Math.max(this.player.radius, Math.min(this.worldWidth  - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.worldHeight - this.player.radius, this.player.y));
  }

  updateShooting(dt) {
    this.timeSinceLastShot += dt;
    const rate = this.activePowerUps.rapidfire ? this.fireRate * POWERUP_TYPES.rapidfire.fireMul : this.fireRate;
    if (this.isShooting && this.timeSinceLastShot >= rate) { this.shoot(); this.timeSinceLastShot = 0; }
  }

  shoot() {
    const mkBullet = (a) => ({ x: this.player.x, y: this.player.y,
      vx: Math.cos(a) * this.bulletSpeed, vy: Math.sin(a) * this.bulletSpeed,
      damage: this.bulletDamage, radius: 3, age: 0, maxAge: 2 });
    this.bullets.push(mkBullet(this.player.angle));
    if (this.activePowerUps.multishot) {
      this.bullets.push(mkBullet(this.player.angle - 0.25));
      this.bullets.push(mkBullet(this.player.angle + 0.25));
    }
    if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playShoot?.(); }
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.age += dt;
      if (b.age > b.maxAge || b.x < 0 || b.x > this.worldWidth || b.y < 0 || b.y > this.worldHeight)
        this.bullets.splice(i, 1);
    }
  }

  updateEnemyBullets(dt) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.age += dt;
      if (b.age > b.maxAge || b.x < 0 || b.x > this.worldWidth || b.y < 0 || b.y > this.worldHeight)
        this.enemyBullets.splice(i, 1);
    }
  }

  updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dx = this.player.x - e.x, dy = this.player.y - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (e.type === 'shooter') {
        const targetDist = 200;
        if (dist > 0) {
          const approach = dist > targetDist ? 1 : -0.5;
          e.x += (dx / dist) * e.speed * approach * dt;
          e.y += (dy / dist) * e.speed * approach * dt;
        }
        e._shootTimer = (e._shootTimer || 0) - dt;
        if (e._shootTimer <= 0) {
          e._shootTimer = ENEMY_TYPES.shooter.shootInterval;
          const angle = Math.atan2(dy, dx);
          this.enemyBullets.push({ x: e.x, y: e.y,
            vx: Math.cos(angle) * ENEMY_TYPES.shooter.shootSpeed,
            vy: Math.sin(angle) * ENEMY_TYPES.shooter.shootSpeed,
            damage: ENEMY_TYPES.shooter.shootDamage, radius: 4, age: 0, maxAge: 3 });
        }
      } else {
        if (dist > 0) { e.x += (dx/dist) * e.speed * dt; e.y += (dy/dist) * e.speed * dt; }
      }
      if (e.health <= 0) {
        this.spawnParticles(e.x, e.y, ENEMY_TYPES[e.type].glowColor, 12, 120);
        this.player.score += ENEMY_TYPES[e.type].score * this.wave;
        if (Math.random() < 0.22) this.spawnPowerUp(e.x, e.y);
        this.enemies.splice(i, 1);
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  spawnParticles(x, y, color, count, speedPx) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + Math.random() * 0.5;
      const spd   = speedPx * (0.5 + Math.random() * 0.8);
      this.particles.push({ x, y, vx: Math.cos(angle)*spd*0.06, vy: Math.sin(angle)*spd*0.06,
        r: 2 + Math.random()*2, color, life: 0.3 + Math.random()*0.3, maxLife: 0.6 });
    }
  }

  updatePowerUps(dt) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      this.powerUps[i].age += dt; if (this.powerUps[i].age > 12) this.powerUps.splice(i, 1);
    }
    for (const type of Object.keys(this.activePowerUps)) {
      this.activePowerUps[type] -= dt; if (this.activePowerUps[type] <= 0) delete this.activePowerUps[type];
    }
  }

  checkCollisions(dt) {
    outer: for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const dx = b.x - e.x, dy = b.y - e.y;
        if (Math.sqrt(dx*dx+dy*dy) < b.radius + e.radius) {
          e.health -= b.damage;
          this.spawnParticles(b.x, b.y, ENEMY_TYPES[e.type].glowColor, 4, 60);
          this.bullets.splice(i, 1);
          if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playEnemyHit?.(); }
          continue outer;
        }
      }
    }
    if (this.player.invincible <= 0 && !this.activePowerUps.shield) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const b = this.enemyBullets[i];
        const dx = b.x - this.player.x, dy = b.y - this.player.y;
        if (Math.sqrt(dx*dx+dy*dy) < b.radius + this.player.radius) {
          this.player.health -= b.damage;
          this.spawnParticles(b.x, b.y, '#ffaa00', 5, 50);
          this.enemyBullets.splice(i, 1);
          if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playPlayerHurt?.(); }
        }
      }
    }
    if (this.player.invincible <= 0 && !this.activePowerUps.shield) {
      for (const e of this.enemies) {
        const dx = this.player.x - e.x, dy = this.player.y - e.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < this.player.radius + e.radius) {
          if (!e._contactCooldown || e._contactCooldown <= 0) {
            this.player.health -= ENEMY_TYPES[e.type].damage;
            e._contactCooldown = CONTACT_DAMAGE_COOLDOWN;
            if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playPlayerHurt?.(); }
          }
          if (dist > 0) { this.player.x += (dx/dist)*4; this.player.y += (dy/dist)*4; }
        }
        if (e._contactCooldown > 0) e._contactCooldown -= dt;
      }
    }
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      const dx = this.player.x - pu.x, dy = this.player.y - pu.y;
      if (Math.sqrt(dx*dx+dy*dy) < this.player.radius + 10) {
        this.collectPowerUp(pu);
        this.spawnParticles(pu.x, pu.y, POWERUP_TYPES[pu.type].color, 8, 80);
        this.powerUps.splice(i, 1);
      }
    }
  }

  spawnWave() {
    const base = 4 + Math.floor(this.wave * 1.2);
    const counts = {
      rusher:  Math.max(1, Math.floor(base * 0.5)),
      shooter: Math.floor(base * 0.3),
      tank:    Math.floor(base * 0.2),
    };
    for (const [type, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        if      (edge === 0) { x = Math.random() * this.worldWidth; y = -30; }
        else if (edge === 1) { x = this.worldWidth+30; y = Math.random()*this.worldHeight; }
        else if (edge === 2) { x = Math.random()*this.worldWidth; y = this.worldHeight+30; }
        else                 { x = -30; y = Math.random()*this.worldHeight; }
        const def = ENEMY_TYPES[type];
    const scale = 1 + (this.wave-1)*WAVE_HEALTH_SCALE;
        this.enemies.push({ x, y, type,
          health: Math.round(def.health*scale), maxHealth: Math.round(def.health*scale),
          speed: def.speed*(1+(this.wave-1)*WAVE_SPEED_SCALE), radius: def.radius,
          _contactCooldown: 0, _shootTimer: def.shoots ? def.shootInterval : 0 });
      }
    }
    this.waveBanner = { text: 'WAVE '+this.wave, timer: 2.5 };
    if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playWaveComplete?.(); }
    console.log('[ShooterMode] Wave '+this.wave+' spawned: '+this.enemies.length+' enemies');
  }

  updateWaveSpawning(dt) {
    if (this.enemies.length === 0 && !this.waveBanner) {
      this.waveTimer += dt;
      if (this.waveTimer >= this.waveDelay) { this.wave++; this.waveTimer = 0; this.spawnWave(); }
    } else if (this.enemies.length > 0) { this.waveTimer = 0; }
  }

  spawnPowerUp(x, y) {
    const types = Object.keys(POWERUP_TYPES);
    this.powerUps.push({ x, y, type: types[Math.floor(Math.random()*types.length)], age: 0 });
  }

  collectPowerUp(pu) {
    if (this.sfxManager) { this.sfxManager.resume(); this.sfxManager.playPowerUp?.(); }
    switch (pu.type) {
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 35); break;
      case 'speed': case 'rapidfire': case 'multishot': case 'invincibility': case 'shield':
        this.activePowerUps[pu.type] = POWERUP_TYPES[pu.type].duration;
        if (pu.type === 'invincibility') this.player.invincible = POWERUP_TYPES.invincibility.duration;
        break;
      case 'bomb':
        for (const e of this.enemies) {
          if (e.type === 'tank') e.health -= 60; else e.health = 0;
          this.spawnParticles(e.x, e.y, '#ff4400', 10, 150);
        }
        break;
    }
  }

  updateCamera() { this.camera.x = this.player.x - 300; this.camera.y = this.player.y - 250; }

  render(ctx, ts, renderData) {
    const w = renderData?.w || 640, h = renderData?.h || 580;
    ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, w, h);
    for (let sy = 0; sy < h; sy += 3) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, sy, w, 1); }

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    ctx.fillStyle = 'rgba(0,255,136,0.04)';
    for (let gx = 0; gx <= this.worldWidth; gx += 50)
      for (let gy = 0; gy <= this.worldHeight; gy += 50) {
        ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI*2); ctx.fill();
      }
    ctx.strokeStyle = 'rgba(0,255,136,0.1)'; ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);

    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a * 0.85; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pu of this.powerUps) {
      const def = POWERUP_TYPES[pu.type];
      const pulse = Math.sin(pu.age * 4) * 3;
      ctx.fillStyle = def.color; ctx.shadowColor = def.color; ctx.shadowBlur = 10+pulse;
      ctx.beginPath(); ctx.arc(pu.x, pu.y, 10, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(def.label, pu.x, pu.y+22); ctx.textAlign = 'left';
    }

    for (const b of this.enemyBullets) {
      ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (const b of this.bullets) {
      const alpha = 1 - b.age / b.maxAge;
      ctx.fillStyle = 'rgba(0,255,136,'+alpha+')'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (const e of this.enemies) this.drawEnemy(ctx, e, ts);
    this.drawPlayer(ctx, ts);
    ctx.restore();
    this.drawHUD(ctx, w, h);
    if (this.waveBanner) this.drawWaveBanner(ctx, w, h);
  }

  drawPlayer(ctx, ts) {
    const p = this.player;
    if (p.invincible > 0 && Math.floor(p.invincible * 10) % 2 === 0) return;
    const shielded = !!this.activePowerUps.shield;
    const pulse = 0.5 + 0.5 * Math.sin(ts * 0.009);
    if (shielded) {
      ctx.strokeStyle = 'rgba(0,170,255,0.7)'; ctx.lineWidth = 3;
      ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius+7, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#00aa66'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18*pulse;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ccffee'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,255,136,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.angle)*p.radius, p.y + Math.sin(p.angle)*p.radius);
    ctx.lineTo(p.x + Math.cos(p.angle)*(p.radius+12), p.y + Math.sin(p.angle)*(p.radius+12));
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  drawEnemy(ctx, e, ts) {
    const def = ENEMY_TYPES[e.type];
    const hpPct = e.health / e.maxHealth;
    const pulse = 0.6 + 0.4 * Math.sin(ts*0.007 + e.x*0.01);
    ctx.fillStyle = def.color; ctx.shadowColor = def.glowColor; ctx.shadowBlur = 8*pulse;
    if (e.type === 'tank') {
      ctx.beginPath();
      ctx.rect(e.x - e.radius, e.y - e.radius, e.radius*2, e.radius*2);
      ctx.fill();
    } else if (e.type === 'shooter') {
      ctx.beginPath();
      ctx.moveTo(e.x, e.y-e.radius); ctx.lineTo(e.x+e.radius, e.y);
      ctx.lineTo(e.x, e.y+e.radius); ctx.lineTo(e.x-e.radius, e.y);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    const bw = e.radius*2.4;
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(e.x-bw/2, e.y-e.radius-9, bw, 4);
    ctx.fillStyle = hpPct > 0.5 ? '#00ff88' : hpPct > 0.25 ? '#ffaa00' : '#ff3333';
    ctx.fillRect(e.x-bw/2, e.y-e.radius-9, bw*hpPct, 4);
  }

  drawHUD(ctx, w, h) {
    ctx.fillStyle = 'rgba(7,7,20,0.9)'; ctx.fillRect(0, 0, w, 92);
    ctx.strokeStyle = 'rgba(255,102,34,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(w, 92); ctx.stroke();
    ctx.fillStyle = 'rgba(50,20,0,0.8)'; ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = '#ff6622'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('SHOOTER MODE  ·  WASD move  ·  Mouse aim+click shoot  ·  ESC pause', w/2, 10);
    ctx.textAlign = 'left';
    const hpPct = Math.max(0, this.player.health / this.player.maxHealth);
    const hpC   = hpPct > 0.6 ? '#00ff88' : hpPct > 0.3 ? '#ffaa00' : '#ff3333';
    ctx.fillStyle = '#333'; ctx.font = '9px Courier New'; ctx.fillText('HP', 14, 30);
    ctx.fillStyle = '#0e0e1e'; ctx.fillRect(32, 20, 138, 13);
    ctx.fillStyle = hpC; ctx.shadowColor = hpC; ctx.shadowBlur = 5;
    ctx.fillRect(32, 20, 138*hpPct, 13); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(32, 20, 138, 13);
    ctx.fillStyle = '#888'; ctx.font = '8px Courier New';
    ctx.fillText(Math.max(0, Math.ceil(this.player.health))+'/'+this.player.maxHealth, 178, 30);
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
    ctx.font = 'bold 18px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(String(this.player.score).padStart(7, '0'), w/2, 38); ctx.shadowBlur = 0;
    ctx.fillStyle = '#223322'; ctx.font = '7px Courier New';
    ctx.fillText('SCORE', w/2, 50); ctx.textAlign = 'left';
    ctx.textAlign = 'right'; ctx.fillStyle = '#ff8800'; ctx.font = 'bold 11px Courier New';
    ctx.fillText('WAVE '+this.wave, w-12, 30);
    ctx.fillStyle = '#554422'; ctx.font = '8px Courier New';
    ctx.fillText('ENEMIES: '+this.enemies.length, w-12, 44);
    if (this.enemies.length === 0 && !this.waveBanner) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('NEXT: '+(this.waveDelay-this.waveTimer).toFixed(1)+'s', w-12, 58);
    }
    ctx.textAlign = 'left';
    let pyOff = 43;
    for (const [type, timeLeft] of Object.entries(this.activePowerUps)) {
      const def = POWERUP_TYPES[type]; if (!def) continue;
      ctx.fillStyle = def.color; ctx.font = '8px Courier New';
      ctx.fillText(def.label+' '+timeLeft.toFixed(1)+'s', 14, pyOff+15); pyOff += 14;
    }
  }

  drawWaveBanner(ctx, w, h) {
    const alpha = Math.min(1, this.waveBanner.timer > 2
      ? (2.5-this.waveBanner.timer)*4 : this.waveBanner.timer*2.5);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, h/2-50, w, 100);
    ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 30;
    ctx.font = 'bold 40px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(this.waveBanner.text, w/2, h/2+8); ctx.shadowBlur = 0;
    ctx.fillStyle = '#664400'; ctx.font = '13px Courier New';
    ctx.fillText('PREPAREâ¦', w/2, h/2+32);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  handleInput(key, action, event) {
    if (event && event.type === 'mousemove') {
      const rect = event.target.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left + this.camera.x;
      this.mouseY = event.clientY - rect.top  + this.camera.y;
      const dx = this.mouseX - this.player.x, dy = this.mouseY - this.player.y;
      this.player.angle = Math.atan2(dy, dx);
      return true;
    }
    if (action === 'mousedown') { this.isShooting = true;  return true; }
    if (action === 'mouseup')   { this.isShooting = false; return true; }
    return false;
  }

  cleanup() {
    super.cleanup();
    this.bullets = []; this.enemyBullets = [];
    this.enemies = []; this.powerUps = [];
    this.activePowerUps = {}; this.particles = [];
    console.log('[ShooterMode] Cleaned up');
  }

  getState()          { return { name: this.name, wave: this.wave, score: this.player.score }; }
  restoreState(state) { if (state.wave) this.wave = state.wave; if (state.score) this.player.score = state.score; }
}
