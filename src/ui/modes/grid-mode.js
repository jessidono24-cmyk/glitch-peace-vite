'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  grid-mode.js
//  Grid-based tactical movement gameplay mode.
//  Original gameplay: move through tile grid, collect peace nodes, avoid hazards.
// ═══════════════════════════════════════════════════════════════════════

import { GameMode } from './game-mode.js';
import { DREAMSCAPES } from '../core/constants.js';
import { CFG, UPG, matrixActive, setMatrix, matrixHoldTime, setMatrixHoldTime, addMatrixHoldTime,
         insightTokens, addInsightToken, spendInsightTokens, pushDreamHistory, purgDepth, setPurgDepth } from '../core/state.js';
import { rnd, pick } from '../core/utils.js';
import { SZ, buildDreamscape } from '../game/grid.js';
import { stepEnemies } from '../game/enemy.js';
import { tryMove, triggerGlitchPulse, stepTileSpread, setEmotion, activateArchetype, executeArchetypePower } from '../game/player.js';
import { burst, resonanceWave } from '../game/particles.js';
import { drawGame } from '../ui/renderer.js';
import { CW, CH } from '../game/grid.js';

/**
 * GridMode - Original tile-based tactical movement gameplay
 * 
 * Player navigates a grid of tiles, collecting peace nodes while avoiding
 * hazards and enemies. Uses emotional and temporal systems for dynamic difficulty.
 */
export class GridMode extends GameMode {
  constructor(sharedSystems) {
    super(sharedSystems);
    this.name = 'grid';
    
    // Game state
    this.game = null;
    this.lastMove = 0;
    
    // Visual effects
    this.glitchFrames = 0;
    this.glitchTimer = 500;
    this.anomalyActive = false;
    this.anomalyData = { row: -1, col: -1, t: 0 };
    this.hallucinations = [];
    this.backgroundStars = [];
    this.visions = [];
    this.interludeState = { text: '', subtext: '', timer: 0, ds: null };
  }

  init(config) {
    super.init(config);
    
    // Initialize game
    this.startGame(config.dreamIdx || 0, config.prevScore, config.prevLevel, config.prevHp);
    
    // Initialize visual effects
    this.initStars(CW(), CH());
    this.spawnVisions(CW(), CH());
  }

  startGame(dreamIdx, prevScore = 0, prevLevel = 0, prevHp = undefined) {
    CFG.dreamIdx = dreamIdx || 0;
    const level = (prevLevel || 0) + 1;
    const ds = DREAMSCAPES[CFG.dreamIdx % DREAMSCAPES.length];
    setMatrix(ds.matrixDefault);
    
    this.game = buildDreamscape(ds, SZ(), level, prevScore, prevHp, UPG.maxHp, window._dreamHistory || []);
    this.spawnVisions(CW(), CH());
    this.hallucinations = [];
    this.glitchTimer = 500 + rnd(500);
    this.initStars(CW(), CH());
    this.lastMove = 0;
    setMatrixHoldTime(0);
    
    // Expose game to window for compatibility
    window._game = this.game;
    window._insightTokens = insightTokens;
    window._dreamIdx = CFG.dreamIdx;
  }

  initStars(w, h) {
    this.backgroundStars = [];
    for (let i = 0; i < 30; i++) {
      this.backgroundStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        a: Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  spawnVisions(w, h) {
    const VISION_WORDS = ['EMERGE', 'DISSOLVE', 'REMEMBER', 'FORGET', 'AWAKEN', 'DREAM', 'HEAL', 'FLOW'];
    this.visions = [];
    for (let i = 0; i < 5; i++) {
      this.visions.push({
        text: pick(VISION_WORDS),
        x: 40 + Math.random() * (w - 80),
        y: 90 + Math.random() * (h - 140),
        alpha: 0,
        targetAlpha: 0.04 + Math.random() * 0.07,
        life: 200 + rnd(500),
        maxLife: 700,
        dx: (Math.random() - 0.5) * 0.05,
        dy: -0.03 - Math.random() * 0.04
      });
    }
  }

  update(dt, keys, matrix, ts) {
    if (!this.game) return null;
    
    const g = this.game;
    
    // Movement handling
    const MOVE_DELAY = g.slowMoves ? UPG.moveDelay * 1.5 : UPG.moveDelay;
    const DIRS = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
      w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
      W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
    };
    
    if (ts - this.lastMove > MOVE_DELAY) {
      for (const [k, [dy, dx]] of Object.entries(DIRS)) {
        if (keys.has(k)) {
          const showMsg = (text, color, timer) => {
            if (g) {
              g.msg = text;
              g.msgColor = color;
              g.msgTimer = timer;
            }
          };
          
          tryMove(g, dy, dx, matrix, () => this.nextDreamscape(), showMsg, insightTokens,
            (n) => {
              while (insightTokens < n) addInsightToken();
              window._insightTokens = insightTokens;
            });
          this.lastMove = ts;
          break;
        }
      }
    }
    
    // Emotional field decay
    const tmods = this.temporalSystem.getModifiers();
    const coherenceMul = (matrix === 'B' ? 1.2 : 0.7) * tmods.coherenceMul;
    this.emotionalField.decay(dt / 1000 * coherenceMul);
    window._tmods = tmods;
    UPG.emotion = this.emotionalField.getDominantEmotion().id;
    g.slowMoves = (UPG.emotion === 'hopeless' || UPG.emotion === 'despair');
    
    // Temporal modifiers
    g.temporalEnemyMul = tmods.enemyMul;
    g.insightMul = tmods.insightMul;
    
    // Realm inference (purgatory depth) — use getter properties directly
    const dist = this.emotionalField.distortion;
    const val  = this.emotionalField.valence;
    const normV = (1 - val) / 2;
    let pd = dist * 0.7 + normV * 0.3;
    if (matrix === 'A') pd = Math.min(1, pd * 1.2);
    else pd = pd * 0.85;
    setPurgDepth(Math.max(0, Math.min(1, pd)));
    window._purgDepth = purgDepth;
    
    // Purgatory depth modifiers
    g.purgDepth = purgDepth;
    g.dmgMul = purgDepth >= 0.8 ? 1.30 : purgDepth >= 0.5 ? 1.15 : 1.0;
    g.healMul = purgDepth <= 0.2 ? 1.25 : purgDepth <= 0.35 ? 1.10 : 1.0;
    
    // Matrix hold time effects
    addMatrixHoldTime(dt);
    if (matrix === 'B' && matrixHoldTime > 4000 && Math.random() < 0.0002 * dt) {
      g.hp = Math.min(UPG.maxHp, g.hp + 1);
    }
    if (matrix === 'A' && matrixHoldTime > 2500 && Math.random() < 0.0003 * dt) {
      g.hp = Math.max(0, g.hp - 1);
    }
    
    // Visual effects
    this.glitchTimer -= dt;
    if (this.glitchTimer <= 0) {
      this.glitchFrames = 2 + rnd(4);
      this.glitchTimer = 500 + rnd(700);
    }
    if (this.anomalyActive) {
      this.anomalyData.t--;
      if (this.anomalyData.t <= 0) this.anomalyActive = false;
    }
    
    // Environment events
    g.environmentTimer -= dt;
    if (g.environmentTimer <= 0) {
      g.environmentTimer = 900 + rnd(700);
      if (Math.random() < 0.6) this.triggerEnvironmentEvent(g);
    }
    
    // Game systems
    stepTileSpread(g, dt);
    const showMsg = (text, color, timer) => {
      if (g) {
        g.msg = text;
        g.msgColor = color;
        g.msgTimer = timer;
      }
    };
    stepEnemies(g, dt, keys, matrix, this.hallucinations, showMsg, setEmotion);
    
    // Check death
    if (g.hp <= 0) {
      return { phase: 'dead', data: { game: g } };
    }
    
    return null;
  }

  render(ctx, ts, renderData) {
    if (!this.game) return;
    
    drawGame(
      ctx, ts, this.game, matrixActive,
      this.backgroundStars, this.visions, this.hallucinations,
      this.anomalyActive, this.anomalyData, this.glitchFrames,
      renderData.DPR || 1
    );
  }

  handleInput(key, action, event) {
    if (action !== 'keydown' || !this.game) return false;
    
    const g = this.game;
    const showMsg = (text, color, timer) => {
      if (g) {
        g.msg = text;
        g.msgColor = color;
        g.msgTimer = timer;
      }
    };
    
    // Matrix toggle
    if (key === 'Shift' && !event.repeat) {
      const next = matrixActive === 'A' ? 'B' : 'A';
      setMatrix(next);
      setMatrixHoldTime(0);
      this.sfxManager.playMatrixSwitch(next === 'A');
      const lbl = next === 'A' ? 'MATRIX·A  ⟨ERASURE⟩' : 'MATRIX·B  ⟨COHERENCE⟩';
      const col = next === 'A' ? '#ff0055' : '#00ff88';
      showMsg(lbl, col, 55);
      if (CFG.particles) burst(g, g.player.x, g.player.y, col, 22, 4);
      return true;
    }
    
    // Archetype power
    if ((key === 'j' || key === 'J') && !event.repeat) {
      if (g.archetypeActive) {
        executeArchetypePower(g);
        this.sfxManager.playArchetypePower();
      } else if (UPG.temporalRewind && UPG.rewindBuffer.length > 0) {
        executeArchetypePower(g);
        this.sfxManager.playArchetypePower();
      } else {
        showMsg('NO ARCHETYPE ACTIVE', '#334455', 25);
      }
      return true;
    }
    
    // Glitch pulse
    if ((key === 'r' || key === 'R') && !event.repeat) {
      if (UPG.glitchPulse && UPG.glitchPulseCharge >= 100) {
        triggerGlitchPulse(g, showMsg);
      } else if (UPG.glitchPulse) {
        showMsg('CHARGING… ' + Math.round(UPG.glitchPulseCharge) + '%', '#660088', 22);
      } else {
        showMsg('BUY GLITCH PULSE IN UPGRADES', '#334455', 28);
      }
      return true;
    }
    
    // Freeze
    if ((key === 'q' || key === 'Q') && !event.repeat) {
      if (UPG.freeze && UPG.freezeTimer <= 0) {
        UPG.freezeTimer = 2500;
        showMsg('FREEZE ACTIVE!', '#0088ff', 50);
        burst(g, g.player.x, g.player.y, '#0088ff', 20, 4);
      }
      return true;
    }
    
    // Containment zone
    if ((key === 'c' || key === 'C') && !event.repeat) {
      if (insightTokens >= 2) {
        spendInsightTokens(2);
        window._insightTokens = insightTokens;
        if (!g.contZones) g.contZones = [];
        g.contZones.push({ x: g.player.x, y: g.player.y, timer: 240, maxTimer: 240 });
        showMsg('CONTAINMENT ZONE', '#00ffcc', 38);
      } else {
        showMsg('NEED 2 ◆ FOR CONTAINMENT', '#334455', 28);
      }
      return true;
    }
    
    return false;
  }

  nextDreamscape() {
    const g = this.game;
    const nextIdx = (CFG.dreamIdx + 1) % DREAMSCAPES.length;
    CFG.dreamIdx = nextIdx;
    window._dreamIdx = nextIdx;
    pushDreamHistory(g.ds.id);
    
    this.interludeState = {
      text: g.ds.completionText,
      subtext: DREAMSCAPES[nextIdx].narrative,
      timer: 220,
      ds: DREAMSCAPES[nextIdx]
    };
    
    // Signal to main loop to show interlude
    return { phase: 'interlude', data: { interludeState: this.interludeState } };
  }

  triggerEnvironmentEvent(g) {
    const event = g.ds.environmentEvent;
    const sz = g.sz;
    if (!event) return;
    
    const showMsg = (text, color, timer) => {
      g.msg = text;
      g.msgColor = color;
      g.msgTimer = timer;
    };
    
    if (event === 'gravity_shift') {
      const [dy, dx] = pick([[-1, 0], [1, 0], [0, -1], [0, 1]]);
      const ny = g.player.y + dy, nx = g.player.x + dx;
      if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== 5) {
        g.player.y = ny;
        g.player.x = nx;
        showMsg('GRAVITY SHIFTS…', '#8888ff', 40);
      }
    } else if (event === 'loop_reset') {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ny = g.player.y + dy, nx = g.player.x + dx;
          if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] === 0 && Math.random() < 0.25) {
            g.grid[ny][nx] = 8;
          }
        }
      }
      showMsg('THE LOOP TIGHTENS…', '#ff8800', 40);
    } else if (event === 'capture_zones') {
      const e = pick(g.enemies);
      if (e) g.captureZones = [{ x: e.x, y: e.y, r: 2, timer: 300 }];
      showMsg('CAPTURE ZONE ACTIVATED', '#ff2244', 40);
    } else if (event === 'rapid_spawn') {
      if (g.enemies.length < 10) {
        const y = 2 + rnd(sz - 4), x = 2 + rnd(sz - 4);
        g.enemies.push({
          y, x, timer: 0, stunTimer: 0, behavior: 'rush', patrolAngle: 0,
          orbitAngle: 0, orbitR: 2, prevY: y, prevX: x, momentum: [0, 0], type: 'rush'
        });
        showMsg('CHAOS ERUPTS!', '#ff0044', 40);
      }
    } else if (event === 'wall_phase') {
      let n = 0;
      for (let y = 0; y < sz && n < 4; y++) {
        for (let x = 0; x < sz && n < 4; x++) {
          if (g.grid[y][x] === 5 && Math.random() < 0.3) {
            g.grid[y][x] = 10;
            n++;
          }
        }
      }
      showMsg('MEMBRANE DISSOLVES…', '#00ccff', 40);
    } else if (event === 'glide_nodes') {
      let n = 0, itr = 0;
      while (n < 2 && itr < 999) {
        itr++;
        const y = rnd(sz), x = rnd(sz);
        if (g.grid[y][x] === 0) {
          g.grid[y][x] = 12;
          n++;
        }
      }
      showMsg('GLIDE NODES APPEAR', '#00aaff', 40);
    } else if (event === 'mashup') {
      const otherDs = pick(DREAMSCAPES.filter(d => d.id !== g.ds.id));
      if (otherDs.hazardSet[0]) {
        let n = 0, itr = 0;
        while (n < 3 && itr < 999) {
          itr++;
          const y = rnd(sz), x = rnd(sz);
          if (g.grid[y][x] === 0) {
            g.grid[y][x] = otherDs.hazardSet[0];
            n++;
          }
        }
      }
      showMsg('DREAMSCAPES MERGE…', '#ffaaff', 40);
    } else if (event === 'line_of_sight') {
      // Summit: enemies become alert; spawn terror tiles near player
      for (const e of g.enemies) if (e.stunTimer > 0) e.stunTimer = 0;
      let n = 0, itr = 0;
      while (n < 3 && itr < 999) { itr++; const y = rnd(sz), x = rnd(sz); if (g.grid[y][x] === 0 && Math.random() < 0.5) { g.grid[y][x] = 2; n++; } }
      showMsg('THE SUMMIT WATCHES…', '#ff4422', 40);
    } else if (event === 'dead_ends') {
      // Aztec: seal random corridors with walls
      let n = 0, itr = 0;
      while (n < 4 && itr < 999) { itr++; const y = 1 + rnd(sz - 2), x = 1 + rnd(sz - 2); if (g.grid[y][x] === 0) { g.grid[y][x] = 5; n++; } }
      showMsg('THE LABYRINTH SHIFTS…', '#cc8800', 40);
    }
    
    if (Math.random() < 0.4) {
      const row = rnd(sz);
      for (let x = 0; x < sz; x++) {
        if (g.grid[row][x] === 1) g.grid[row][x] = 4;
        else if (g.grid[row][x] === 4 && Math.random() < 0.3) g.grid[row][x] = 1;
      }
      this.anomalyData = { row, col: -1, t: 50 };
      this.anomalyActive = true;
    }
  }

  cleanup() {
    super.cleanup();
    this.game = null;
    window._game = null;
  }

  getState() {
    return {
      name: this.name,
      game: this.game,
      dreamIdx: CFG.dreamIdx
    };
  }
}
