// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE v5 — main.js (DROP-IN REPLACEMENT)
//  Adds: Title menu + Options + Tutorial + Pause menu + Save/Load
//  Goal: PLAYABLE NOW (no missing imports)
// ═══════════════════════════════════════════════════════════════════════

import { TUTORIAL_PAGES } from "./ui/tutorial-content.js";
import { EmotionalField, getEmotionalModifiers, EMOTIONS } from "./core/emotional-engine.js";
import {
  T,
  TILE_DEF,
  PLAYER,
  CELL,
  GAP,
  GRID_SIZES,
  DIFF_CFG,
} from "./core/constants.js";

import {
  rnd,
  clamp,
  lerp,
  resizeCanvas,
  storage,
  isMobile,
  PerformanceMonitor,
} from "./core/utils.js";

import {
  EmotionalField,
  getEmotionalModifiers,
} from "./core/emotional-engine.js";

import { TemporalSystem } from "./core/temporal-system.js";

// ───────────────────────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────────────────────
const CFG = {
  gridSize: "medium",
  difficulty: "easy",
  particles: !isMobile,
  highContrast: false,
  intensityMul: 1.0,
  stillnessMode: false,
  showSimWarning: false,

  gameplayPath: "arcade", // NEW
  showEmotionHUD: true,   // NEW
  showRealmHUD: true,     // NEW
};

const SAVE_KEY = "gp_v5_save";

const PATH_CFG = {
  arcade:   { peaceMul: 1.0, hazardMul: 1.0, insightMul: 1.0, scoreMul: 1.2, emoDecayMul: 1.0 },
  recovery: { peaceMul: 1.3, hazardMul: 0.7, insightMul: 1.1, scoreMul: 0.8, emoDecayMul: 1.25 },
  explorer: { peaceMul: 0.9, hazardMul: 0.9, insightMul: 1.6, scoreMul: 1.0, emoDecayMul: 0.95 },
  ritual:   { peaceMul: 1.0, hazardMul: 1.1, insightMul: 1.2, scoreMul: 1.0, emoDecayMul: 0.85 },
};

function cyclePath(dir) {
  const order = ["arcade", "recovery", "explorer", "ritual"];
  const i = order.indexOf(CFG.gameplayPath);
  const j = (i + dir + order.length) % order.length;
  CFG.gameplayPath = order[j];
}

function realmFromField(field) {
  const distortion = field.calcDistortion?.() ?? 0;
  const coherence = field.calcCoherence?.() ?? 0.5;
  const valence = field.getValence?.() ?? 0;

  // Simple substrate mapping (tweak later)
  if (distortion >= 0.92) return { name: "HELL", col: "#ff3344" };
  if (distortion >= 0.75) return { name: "PURGATORY", col: "#aa66ff" };
  if (coherence >= 0.85 && valence >= 0.15) return { name: "HEAVEN", col: "#00ffcc" };
  if (valence >= 0.20) return { name: "IMAGINATION", col: "#00eeff" };
  return { name: "MIND", col: "#88ffaa" };
}

// ───────────────────────────────────────────────────────────────────────
// Canvas / sizing
// ───────────────────────────────────────────────────────────────────────
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

// Always hide HTML boot overlay
const loadingEl = document.getElementById("loading");
if (loadingEl) loadingEl.style.display = "none";
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function SZ() {
  return GRID_SIZES[CFG.gridSize] ?? GRID_SIZES.medium;
}
function DIFF() {
  return DIFF_CFG[CFG.difficulty] ?? DIFF_CFG.easy;
}
function GRID_PX() {
  const sz = SZ();
  return sz * CELL + (sz - 1) * GAP;
}
function W() {
  return GRID_PX() + 48;
}
function H() {
  // Give room for HUD + footer + menu overlays
  return GRID_PX() + 190;
}

resizeCanvas(canvas, ctx, W(), H(), DPR);
window.addEventListener("resize", () => resizeCanvas(canvas, ctx, W(), H(), DPR));

// ───────────────────────────────────────────────────────────────────────
// Game state
// ───────────────────────────────────────────────────────────────────────
// Force boot into Title on page load (prevents stuck resume states)
gameState = "title";         // or whatever your title state string is
inGame = false;              // if you have it
paused = false;              // if you have it
tutorialActive = false;      // if you have it

let phase = "menu"; // menu | playing | dead | tutorial | options | credits | pause
let game = null;

let prevTs = 0;
let lastMove = 0;
let keys = new Set();

const perfMonitor = new PerformanceMonitor();
const emotionalField = new EmotionalField();
const temporal = new TemporalSystem();
let temporalMods = temporal.getModifiers?.() || { insightMul: 1, enemyMul: 1, coherenceMul: 1, phaseName: "", dayName: "" };


// Menu cursor
let menuIdx = 0;
let optionsIdx = 0;
let tutorialPage = 0;

// ───────────────────────────────────────────────────────────────────────
// Save / load helpers
// ───────────────────────────────────────────────────────────────────────
function hasSave() {
  return !!storage.get(SAVE_KEY);
}

function saveGame() {
  if (!game) return false;
  const payload = {
    v: 5,
    t: Date.now(),
    CFG: { ...CFG },
    game: game,
    emotional: emotionalField.export ? emotionalField.export() : null,
  };
  storage.set(SAVE_KEY, payload);
  return true;
}

function loadGame() {
  const payload = storage.get(SAVE_KEY);
  if (!payload) return false;

  try {
    Object.assign(CFG, payload.CFG || {});
    // Resize if CFG changed
    resizeCanvas(canvas, ctx, W(), H(), DPR);

    game = payload.game || null;
    if (payload.emotional && emotionalField.import) emotionalField.import(payload.emotional);

    // If the save is missing any runtime fields, patch them
    patchGameRuntime(game);

    phase = "playing";
    return true;
  } catch (e) {
    console.warn("Failed to load save", e);
    return false;
  }
}

function clearSave() {
  storage.clear(SAVE_KEY);
}

// ───────────────────────────────────────────────────────────────────────
// Game init
// ───────────────────────────────────────────────────────────────────────
function makeGrid(sz) {
  const g = Array.from({ length: sz }, () => new Array(sz).fill(T.VOID));
  // sprinkle walls lightly (easy starter)
  const wallCount = Math.round(sz * 1.2);
  for (let i = 0; i < wallCount; i++) {
    const y = 1 + rnd(Math.max(1, sz - 2));
    const x = 1 + rnd(Math.max(1, sz - 2));
    g[y][x] = T.WALL;
  }
  // ensure start area clear
  g[0][0] = T.VOID;
  if (sz > 1) { g[0][1] = T.VOID; g[1][0] = T.VOID; }
  return g;
}

function spawnTile(grid, count, type, sz, avoidStart) {
  let n = 0, itr = 0;
  while (n < count && itr < 9999) {
    itr++;
    const y = rnd(sz), x = rnd(sz);
    if (grid[y][x] !== T.VOID) continue;
    if (avoidStart && y < 2 && x < 2) continue;
    grid[y][x] = type;
    n++;
  }
}

function initGame({ keepScore = 0, keepLevel = 1, keepHp = 100 } = {}) {
  const sz = SZ();
  const grid = makeGrid(sz);

  // Scale spawns a bit with level, but keep early gentle
  const lvl = keepLevel ?? 1;

  const tmods = temporal?.getModifiers?.() || { insightMul: 1, enemyMul: 1, coherenceMul: 1 };
  temporalMods = { ...(temporalMods || {}), ...tmods };
   const pcfg = PATH_CFG[CFG.gameplayPath] || PATH_CFG.arcade;

  const peaceCount = clamp(Math.round((6 + Math.floor(lvl * 0.6)) * pcfg.peaceMul), 6, 22);
  const despairCount = clamp(Math.round((2 + Math.floor(lvl * 0.5)) * tmods.enemyMul * pcfg.hazardMul), 1, 22);
  const terrorCount = clamp(Math.round((1 + Math.floor(lvl * 0.35)) * tmods.enemyMul * pcfg.hazardMul), 0, 18);
  const insightCount = clamp(Math.round((1 + Math.floor(lvl * 0.25)) * tmods.insightMul * pcfg.insightMul), 1, 16);

  spawnTile(grid, peaceCount, T.PEACE, sz, true);
  if (T.DESPAIR != null) spawnTile(grid, despairCount, T.DESPAIR, sz, true);
  if (T.TERROR != null) spawnTile(grid, terrorCount, T.TERROR, sz, true);
  if (T.INSIGHT != null) spawnTile(grid, insightCount, T.INSIGHT, sz, true);

  const g = {
    grid,
    sz,
    level: lvl,
    player: { y: 0, x: 0 },
    hp: clamp(keepHp, 1, 100),
    maxHp: 100,
    score: keepScore ?? 0,
    insightTokens: 0,
    peaceLeft: peaceCount,
    msg: null,
    msgColor: "#fff",
    msgTimer: 0,
    shakeFrames: 0,
    flashColor: null,
    flashAlpha: 0,
    particles: [],
    purgatoryWarned: false,
  };

  patchGameRuntime(g);
  return g;
}

function patchGameRuntime(g) {
  if (!g) return;
  if (!g.particles) g.particles = [];
  if (g.shakeFrames == null) g.shakeFrames = 0;
  if (g.flashAlpha == null) g.flashAlpha = 0;
  if (g.msgTimer == null) g.msgTimer = 0;
}

function startNewGame() {
  game = initGame({ keepScore: 0, keepLevel: 1, keepHp: 100 });
  emotionalField.reset?.();
  phase = "playing";
  lastMove = 0;
}

// Next level (infinite)
function nextLevel() {
  if (!game) return;
  const keep = { keepScore: game.score + 250, keepLevel: game.level + 1, keepHp: clamp(game.hp + 20, 1, 100) };
  game = initGame(keep);
  showMsg(`LEVEL ${game.level}`, "#ffdd00", 85);
}

// ───────────────────────────────────────────────────────────────────────
// Effects
// ───────────────────────────────────────────────────────────────────────
function showMsg(text, color = "#fff", timer = 50) {
  if (!game) return;
  game.msg = text;
  game.msgColor = color;
  game.msgTimer = timer;
}

function burst(gx, gy, color, count = 12, speed = 3.0) {
  if (!game || !CFG.particles) return;
  const baseX = gx * (CELL + GAP) + CELL / 2;
  const baseY = gy * (CELL + GAP) + CELL / 2;
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + (Math.random() * 0.4);
    const s = speed * (0.6 + Math.random() * 0.8);
    game.particles.push({
      x: baseX,
      y: baseY,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 0.6,
      r: 2 + Math.random() * 2.5,
      color,
      life: 16 + rnd(14),
      maxLife: 30,
    });
  }
}

// ───────────────────────────────────────────────────────────────────────
// Movement + tile effects
// ───────────────────────────────────────────────────────────────────────
function tryMove(dy, dx) {
  if (!game) return false;

  const g = game;
  const ny = g.player.y + dy;
  const nx = g.player.x + dx;

  if (ny < 0 || ny >= g.sz || nx < 0 || nx >= g.sz) return false;

  const tileType = g.grid[ny][nx];
  if (tileType === T.WALL) return false;

  g.player.y = ny;
  g.player.x = nx;

  const td = TILE_DEF[tileType];

  // Purgatory depth (0..1), rises with emotional distortion
  const dist = emotionalField.calcDistortion?.() ?? 0;
  const purgDepth = clamp((dist - 0.65) / 0.35, 0, 1);
  if (purgDepth > 0.6 && !g.purgatoryWarned) {
    g.purgatoryWarned = true;
    showMsg("PURGATORY RISING", "#ff6688", 70);
  }

  // Peace
  if (tileType === T.PEACE) {
    const heal = Math.max(6, Math.round(15 * (1 - 0.4 * purgDepth)));
    g.hp = Math.min(g.maxHp, g.hp + heal);
    g.score += 150 + Math.floor(g.level * 10);
    g.grid[ny][nx] = T.VOID;
    g.peaceLeft--;

    emotionalField.add?.("joy", 1.5);
    emotionalField.add?.("hope", 0.8);

    burst(nx, ny, "#00ffaa", 16, 3.2);
    showMsg("+PEACE", "#00ffcc", 38);

    if (g.peaceLeft <= 0) {
      showMsg("LEVEL COMPLETE", "#ffdd00", 85);
      setTimeout(nextLevel, 650);
    }
    return true;
  }

  // Insight
  if (tileType === T.INSIGHT) {
    g.insightTokens++;
    g.score += 300;
    g.grid[ny][nx] = T.VOID;
    emotionalField.add?.("curiosity", 2.0);
    burst(nx, ny, "#00eeff", 18, 3.6);
    showMsg(`INSIGHT ◆×${g.insightTokens}`, "#00eeff", 60);
    return true;
  }

  // Damage tiles
  if (td && td.d > 0) {
    const tEnemy = temporalMods?.enemyMul || 1;
    const dmg = Math.round(td.d * DIFF().dmgMul * CFG.intensityMul * (1 + 0.6 * purgDepth) * tEnemy);
    g.hp = Math.max(0, g.hp - dmg);
    g.shakeFrames = 6;
    g.flashColor = "#ff2200";
    g.flashAlpha = 0.22;

    emotionalField.add?.("fear", 1.0);
    if (tileType === T.DESPAIR) emotionalField.add?.("despair", 1.0);

    burst(nx, ny, "#ff4444", 10, 3.0);
    showMsg(`-${dmg} HP`, "#ff4444", 40);

    if (g.hp <= 0) {
      phase = "dead";
    }
    return true;
  }

  return true;
}

// ───────────────────────────────────────────────────────────────────────
// Drawing helpers
// ───────────────────────────────────────────────────────────────────────
function clearScreen() {
  ctx.clearRect(0, 0, W(), H());
  ctx.fillStyle = "#02020a";
  ctx.fillRect(0, 0, W(), H());
}

function drawCenteredText(text, y, size = 18, color = "#fff", shadow = null) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Courier New`;
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fillText(text, W() / 2, y);
  ctx.restore();
}

function drawBox(x, y, w, h, fill = "rgba(0,0,0,0.55)", stroke = "rgba(255,255,255,0.08)") {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

// ───────────────────────────────────────────────────────────────────────
// HUD + Gameplay rendering
// ───────────────────────────────────────────────────────────────────────
function drawHUD(ts) {
  if (!game) return;
  const g = game;

  // top bar
  ctx.save();
  ctx.fillStyle = "#08081a";
  ctx.fillRect(0, 0, W(), 64);
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(W(), 64);
  ctx.stroke();

  // hp bar
  ctx.fillStyle = "#333";
  ctx.font = "10px Courier New";
  ctx.fillText("HP", 16, 22);

  const hpW = 160;
  ctx.fillStyle = "#0e0e1e";
  ctx.fillRect(40, 12, hpW, 16);

  const hp = clamp(g.hp, 0, g.maxHp);
  const hpColor = hp > 60 ? "#00ff88" : hp > 30 ? "#ffaa00" : "#ff3333";
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 8;
  ctx.fillRect(40, 12, hpW * (hp / g.maxHp), 16);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.strokeRect(40, 12, hpW, 16);

  // score center
  ctx.textAlign = "center";
  ctx.fillStyle = "#00ff88";
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 10;
  ctx.font = "bold 20px Courier New";
  ctx.fillText(String(g.score).padStart(6, "0"), W() / 2, 36);
  ctx.shadowBlur = 0;

  if (CFG.showEmotionHUD && emotionalField) {
    const dom = emotionalField.getDominant?.();
    const domVal = dom ? (emotionalField.values?.[dom] ?? 0) : 0;
    const coh = emotionalField.calcCoherence?.() ?? 0.5;
    const dis = emotionalField.calcDistortion?.() ?? 0;

    const domCol = dom ? (EMOTIONS?.[dom]?.col ?? "#fff") : "#666";
    const label = dom ? `${dom.toUpperCase()} ${domVal.toFixed(1)}` : "NEUTRAL";

    // left info
    ctx.textAlign = "left";
    ctx.font = "10px Courier New";
    ctx.fillStyle = "#aab";
    ctx.fillText(label, 40, 52);

    // tiny bars (coherence + distortion)
    const bx = 160, by = 44, bw = 120, bh = 6;

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = domCol;
    ctx.fillRect(bx, by, bw * clamp(domVal / 10, 0, 1), bh);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(bx, by + 10, bw, bh);
    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(bx, by + 10, bw * clamp(coh, 0, 1), bh);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(bx, by + 20, bw, bh);
    ctx.fillStyle = "#ff55aa";
    ctx.fillRect(bx, by + 20, bw * clamp(dis, 0, 1), bh);
  }

  if (CFG.showRealmHUD && emotionalField) {
    const r = realmFromField(emotionalField);
    ctx.textAlign = "right";
    ctx.font = "10px Courier New";
    ctx.fillStyle = r.col;
    ctx.fillText(r.name, W() - 16, 38);
  }

  // temporal label (top-right)
  const tmods = temporal?.getModifiers?.() || temporalMods;
  ctx.textAlign = "right";
  ctx.fillStyle = "#667";
  ctx.font = "10px Courier New";
  ctx.fillText(`${tmods.phaseName} · ${tmods.dayName}`, W() - 16, 22);

  // level / peace
  ctx.textAlign = "left";
  ctx.fillStyle = "#bbb";
  ctx.font = "10px Courier New";
  ctx.fillText(`LVL ${g.level}`, W() - 98, 22);
  ctx.fillStyle = "#00aa66";
  ctx.fillText(`◈ ×${g.peaceLeft}`, W() - 98, 42);

  ctx.restore();
}

function drawGame(ts) {
  if (!game) return;
  const g = game;

  clearScreen();

  // camera shake
  let ox = 0, oy = 0;
  if (g.shakeFrames > 0) {
    ox = (Math.random() - 0.5) * 7 * (g.shakeFrames / 8);
    oy = (Math.random() - 0.5) * 7 * (g.shakeFrames / 8);
    g.shakeFrames--;
  }

  const gridPX = GRID_PX();
  const sx = (W() - gridPX) / 2 + ox;
  const sy = 78 + oy;

  // apply emotional modifiers (soft)
  const mods = getEmotionalModifiers ? getEmotionalModifiers(emotionalField) : null;
  const dist = mods?.particleIntensity ? clamp((mods.particleIntensity - 0.5) / 0.5, 0, 1) : 0;

  // grid
  for (let y = 0; y < g.sz; y++) {
    for (let x = 0; x < g.sz; x++) {
      const t = g.grid[y][x];
      const def = TILE_DEF[t] || TILE_DEF[T.VOID];

      const px = sx + x * (CELL + GAP);
      const py = sy + y * (CELL + GAP);

      const bg = CFG.highContrast ? (def.hcBg || def.bg || "#06060f") : (def.bg || "#06060f");
      const border = CFG.highContrast ? (def.hcBorder || def.border || "rgba(255,255,255,0.06)") : (def.border || "rgba(255,255,255,0.06)");

      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(px, py, CELL, CELL, 4);
      ctx.fill();

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1, 4);
      ctx.stroke();

      // peace shimmer
      if (t === T.PEACE) {
        const s2 = (ts * 0.05 + y * 6 + x * 4) % (CELL * 2);
        if (s2 < CELL) {
          const gr = ctx.createLinearGradient(px, py + s2 - 6, px, py + s2 + 6);
          gr.addColorStop(0, "rgba(0,255,140,0)");
          gr.addColorStop(0.5, "rgba(0,255,140,0.35)");
          gr.addColorStop(1, "rgba(0,255,140,0)");
          ctx.fillStyle = gr;
          ctx.fillRect(px, py, CELL, CELL);
        }
        ctx.fillStyle = "#00ffaa";
        ctx.shadowColor = "#00ffaa";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px + CELL / 2, py + CELL / 2, 4 + 2 * Math.sin(ts * 0.006 + x + y), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // insight glyph
      if (t === T.INSIGHT) {
        ctx.fillStyle = "#00eeff";
        ctx.shadowColor = "#00eeff";
        ctx.shadowBlur = 10;
        ctx.font = "bold 18px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("◆", px + CELL / 2, py + CELL / 2 + 7);
        ctx.textAlign = "left";
        ctx.shadowBlur = 0;
      }
    }
  }

  // player (LOCKED identity color: cyan/white, never shifts)
  {
    const px = sx + g.player.x * (CELL + GAP);
    const py = sy + g.player.y * (CELL + GAP);

    ctx.shadowColor = "#aaffff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#003a44";
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 4, CELL - 8, CELL - 8, 8);
    ctx.fill();

    ctx.fillStyle = "#00ccff";
    ctx.beginPath();
    ctx.roundRect(px + 10, py + 10, CELL - 20, CELL - 20, 6);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.roundRect(px + 16, py + 16, CELL - 32, CELL - 32, 4);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // particles
  if (CFG.particles && g.particles?.length) {
    g.particles = g.particles.filter((p) => p.life > 0);
    for (const p of g.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 7 + 7 * dist;
      ctx.beginPath();
      ctx.arc(sx + p.x, sy + p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18 + 0.12 * dist;
      p.life--;
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // flash
  if (g.flashAlpha > 0) {
    ctx.globalAlpha = g.flashAlpha;
    ctx.fillStyle = g.flashColor || "#ff2200";
    ctx.fillRect(sx, sy, gridPX, gridPX);
    ctx.globalAlpha = 1;
    g.flashAlpha = Math.max(0, g.flashAlpha - 0.04);
  }

  // message popup
  if (g.msg && g.msgTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.msgTimer / 18);
    ctx.textAlign = "center";
    ctx.font = "bold 18px Courier New";
    ctx.fillStyle = g.msgColor || "#fff";
    ctx.shadowColor = g.msgColor || "#fff";
    ctx.shadowBlur = 16;
    ctx.fillText(g.msg, W() / 2, sy - 14);
    ctx.restore();
    g.msgTimer--;
  }

  drawHUD(ts);

  // footer hint
  ctx.save();
  ctx.fillStyle = "#090916";
  ctx.fillRect(0, H() - 30, W(), 30);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.moveTo(0, H() - 30);
  ctx.lineTo(W(), H() - 30);
  ctx.stroke();
  ctx.fillStyle = "#666";
  ctx.font = "10px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("WASD / Arrows · collect ◈ · Esc = Pause", W() / 2, H() - 10);
  ctx.restore();
}

// ───────────────────────────────────────────────────────────────────────
// Title / Menus
// ───────────────────────────────────────────────────────────────────────
function drawMenu(ts) {
  clearScreen();

  // title
  drawCenteredText("GLITCH·PEACE", 120, 44, "#00ff88", "#00ff88");
  drawCenteredText("a matrix survival game", 152, 12, "#6aa", null);

  // menu options
  const items = [
    { label: "START NEW GAME", action: () => startNewGame() },
    { label: hasSave() ? "CONTINUE" : "CONTINUE (no save)", action: () => { if (hasSave()) loadGame(); } },
    { label: "TUTORIAL", action: () => { phase = "tutorial"; tutorialPage = 0; } },
    { label: "OPTIONS", action: () => { phase = "options"; optionsIdx = 0; } },
    { label: "CREDITS", action: () => { phase = "credits"; } },
  ];

  const boxW = 420;
  const boxH = 260;
  const x = (W() - boxW) / 2;
  const y = 190;

  drawBox(x, y, boxW, boxH, "rgba(0,0,0,0.60)", "rgba(0,255,136,0.18)");

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "14px Courier New";
  for (let i = 0; i < items.length; i++) {
    const yy = y + 56 + i * 36;
    const selected = i === menuIdx;
    ctx.fillStyle = selected ? "#00ffcc" : "#9aa";
    if (selected) {
      ctx.shadowColor = "#00ffcc";
      ctx.shadowBlur = 16;
      ctx.fillText("▶ " + items[i].label, W() / 2, yy);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillText(items[i].label, W() / 2, yy);
    }
  }
  ctx.restore();

  // hint
  drawCenteredText("↑↓ select · Enter confirm", y + boxH + 36, 12, "#444", null);

  // tiny warning toggle (optional)
  if (CFG.showSimWarning) {
    drawCenteredText("simulation / metaphor layer enabled (purely fictional)", H() - 48, 10, "#555", null);
  }
}

function drawPause(ts) {
  // draw gameplay behind, then overlay
  drawGame(ts);

  const boxW = 420;
  const boxH = 220;
  const x = (W() - boxW) / 2;
  const y = 150;
  drawBox(x, y, boxW, boxH, "rgba(0,0,0,0.72)", "rgba(255,255,255,0.10)");

  drawCenteredText("PAUSED", y + 46, 26, "#fff", null);

  const items = [
    { label: "RESUME", action: () => { phase = "playing"; } },
    { label: "SAVE", action: () => { saveGame(); showMsg("SAVED", "#00ffcc", 45); phase = "playing"; } },
    { label: "QUIT TO TITLE", action: () => { phase = "menu"; menuIdx = 0; } },
  ];

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "14px Courier New";
  for (let i = 0; i < items.length; i++) {
    const yy = y + 100 + i * 34;
    const selected = i === menuIdx;
    ctx.fillStyle = selected ? "#00ffcc" : "#9aa";
    ctx.fillText((selected ? "▶ " : "  ") + items[i].label, W() / 2, yy);
  }
 // emotion tint overlay (subtle, but makes the field "felt")
      if (CFG.showEmotionHUD && emotionalField) {
        const dom = emotionalField.getDominant?.();
        const domVal = dom ? (emotionalField.values?.[dom] ?? 0) : 0;
        const col = dom ? (EMOTIONS?.[dom]?.col ?? null) : null;
        if (col && domVal > 0.2) {
          const a = clamp((domVal / 10) * 0.14, 0, 0.14);
          ctx.fillStyle = col;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.roundRect(px, py, CELL, CELL, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

  ctx.restore();
}

function drawOptions(ts) {
  clearScreen();
  drawCenteredText("OPTIONS", 110, 36, "#00ffcc", "#00ffcc");

  const boxW = 520;
  const boxH = 320;
  const x = (W() - boxW) / 2;
  const y = 170;
  drawBox(x, y, boxW, boxH, "rgba(0,0,0,0.60)", "rgba(0,255,204,0.15)");

  const rows = [
    { label: "GRID SIZE", value: CFG.gridSize, left: () => cycleGrid(-1), right: () => cycleGrid(1) },
    { label: "DIFFICULTY", value: CFG.difficulty, left: () => cycleDiff(-1), right: () => cycleDiff(1) },
    { label: "PARTICLES", value: CFG.particles ? "ON" : "OFF", left: () => CFG.particles = !CFG.particles, right: () => CFG.particles = !CFG.particles },
    { label: "HIGH CONTRAST", value: CFG.highContrast ? "ON" : "OFF", left: () => CFG.highContrast = !CFG.highContrast, right: () => CFG.highContrast = !CFG.highContrast },
    { label: "INTENSITY", value: CFG.intensityMul.toFixed(2), left: () => CFG.intensityMul = clamp(CFG.intensityMul - 0.05, 0.6, 1.4), right: () => CFG.intensityMul = clamp(CFG.intensityMul + 0.05, 0.6, 1.4) },
    { label: "BACK", value: "", left: () => {}, right: () => {} },
    {label: "GAMEPLAY PATH", value: CFG.gameplayPath.toUpperCase(), left: () => cyclePath(-1), right: () => cyclePath(1) },
    {label: "EMOTION HUD", value: CFG.showEmotionHUD ? "ON" : "OFF", left: () => CFG.showEmotionHUD = !CFG.showEmotionHUD, right: () => CFG.showEmotionHUD = !CFG.showEmotionHUD },
    {label: "REALM HUD", value: CFG.showRealmHUD ? "ON" : "OFF", left: () => CFG. showRealmHUD = !CFG.showRealmHUD, right: () => CFG.showRealmHUD = !CFG.showRealmHUD },
  ];

  ctx.save();
  ctx.font = "14px Courier New";
  ctx.textAlign = "left";

  for (let i = 0; i < rows.length; i++) {
    const yy = y + 64 + i * 42;
    const selected = i === optionsIdx;

    ctx.fillStyle = selected ? "#00ffcc" : "#9aa";
    ctx.fillText((selected ? "▶ " : "  ") + rows[i].label, x + 30, yy);

    ctx.textAlign = "right";
    ctx.fillStyle = selected ? "#dff" : "#7aa";
    ctx.fillText(rows[i].value, x + boxW - 30, yy);
    ctx.textAlign = "left";
  }

  ctx.restore();

  drawCenteredText("← → change · ↑↓ select · Enter confirm · Esc back", y + boxH + 34, 12, "#444", null);
}

function cycleGrid(dir) {
  const keys = Object.keys(GRID_SIZES);
  const idx = keys.indexOf(CFG.gridSize);
  const next = (idx + dir + keys.length) % keys.length;
  CFG.gridSize = keys[next];
  // resize canvas so grid fits instantly
  resizeCanvas(canvas, ctx, W(), H(), DPR);
}

function cycleDiff(dir) {
  const keys = Object.keys(DIFF_CFG);
  const idx = keys.indexOf(CFG.difficulty);
  const next = (idx + dir + keys.length) % keys.length;
  CFG.difficulty = keys[next];
}

function drawCredits() {
  clearScreen();
  drawCenteredText("CREDITS", 110, 36, "#00ffcc", "#00ffcc");

  const lines = [
    "Created by Jessica + tool-assisted prototyping",
    "A playable mythic-sci-fi matrix, purely fictional",
    "v5 starter build: menu + save + infinite levels",
    "",
    "Press Esc to return",
  ];

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "14px Courier New";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = i === 0 ? "#fff" : "#889";
    ctx.fillText(lines[i], W() / 2, 200 + i * 28);
  }
  ctx.restore();
}

function drawTutorial(ts) {
  clearScreen();
  drawCenteredText("TUTORIAL", 110, 36, "#00ffcc", "#00ffcc");

  const pages = TUTORIAL_PAGES;

  const p = pages[clamp(tutorialPage, 0, pages.length - 1)];

  const boxW = 560;
  const boxH = 360;
  const x = (W() - boxW) / 2;
  const y = 170;
  drawBox(x, y, boxW, boxH, "rgba(0,0,0,0.60)", "rgba(0,255,204,0.15)");

  drawCenteredText(p.title, y + 54, 22, "#fff", null);

  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "14px Courier New";
  ctx.fillStyle = "#9aa";
  for (let i = 0; i < p.body.length; i++) {
    ctx.fillText("• " + p.body[i], x + 34, y + 100 + i * 28);
  }
  ctx.restore();

  drawCenteredText("← → page · Esc back · Enter title", y + boxH + 34, 12, "#444", null);
}

// ───────────────────────────────────────────────────────────────────────
// Dead screen
// ───────────────────────────────────────────────────────────────────────
function drawDead(ts) {
  clearScreen();
  drawCenteredText("ERASED", 160, 54, "#ff2222", "#ff2222");
  if (game) {
    drawCenteredText(String(game.score).padStart(6, "0"), 220, 28, "#00ff88", "#00ff88");
    drawCenteredText(`FINAL SCORE · LEVEL ${game.level}`, 252, 14, "#889", null);
  }
  drawCenteredText("Enter = Try Again · Esc = Title", 320, 14, "#666", null);
}

// ───────────────────────────────────────────────────────────────────────
// Main loop
// ───────────────────────────────────────────────────────────────────────
function loop(ts) {
  const dt = ts - prevTs;
  prevTs = ts;

  perfMonitor.update();
  // If performance drops, auto disable particles (soft)
  if (perfMonitor.shouldReduceQuality?.() && CFG.particles) {
    CFG.particles = false;
  }

  // States
  if (phase === "menu") {
    drawMenu(ts);
    requestAnimationFrame(loop);
    return;
  }

  if (phase === "options") {
    drawOptions(ts);
    requestAnimationFrame(loop);
    return;
  }

  if (phase === "tutorial") {
    drawTutorial(ts);
    requestAnimationFrame(loop);
    return;
  }

  if (phase === "credits") {
    drawCredits(ts);
    requestAnimationFrame(loop);
    return;
  }

  if (phase === "pause") {
    drawPause(ts);
    requestAnimationFrame(loop);
    return;
  }

  if (phase === "dead") {
    drawDead(ts);
    requestAnimationFrame(loop);
    return;
  }

  // playing
  if (phase === "playing") {
    const MOVE_DELAY = 120;
    const DIRS = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      w: [-1, 0],
      s: [1, 0],
      a: [0, -1],
      d: [0, 1],
      W: [-1, 0],
      S: [1, 0],
      A: [0, -1],
      D: [0, 1],
    };

    if (ts - lastMove > MOVE_DELAY) {
      for (const [k, [dy, dx]] of Object.entries(DIRS)) {
        if (keys.has(k)) {
          tryMove(dy, dx);
          lastMove = ts;
          break;
        }
      }
    }

    // temporal rhythm (lunar + weekday)
    temporalMods = temporal?.getModifiers?.() || temporalMods;

   // slow emotional decay (weekday coherence + gameplay path scales settling)
const cohMul = temporalMods?.coherenceMul || 1;
const pcfg = (typeof PATH_CFG !== "undefined" && PATH_CFG[CFG.gameplayPath]) ? PATH_CFG[CFG.gameplayPath] : { emoDecayMul: 1.0 };
emotionalField.decay?.(0.001 * dt * cohMul * (pcfg.emoDecayMul ?? 1.0));

    drawGame(ts);

    requestAnimationFrame(loop);
    return;
  }

  // fallback
  phase = "menu";
  requestAnimationFrame(loop);
}

// ───────────────────────────────────────────────────────────────────────
// Input
// ───────────────────────────────────────────────────────────────────────
function handleMenuKey(e) {
  const itemsCount = 5; // Start/Continue/Tutorial/Options/Credits
  if (e.key === "ArrowUp") menuIdx = (menuIdx - 1 + itemsCount) % itemsCount;
  if (e.key === "ArrowDown") menuIdx = (menuIdx + 1) % itemsCount;

  if (e.key === "Enter" || e.key === " ") {
    // Execute selection
    if (menuIdx === 0) startNewGame();
    else if (menuIdx === 1) { if (hasSave()) loadGame(); }
    else if (menuIdx === 2) { phase = "tutorial"; tutorialPage = 0; }
    else if (menuIdx === 3) { phase = "options"; optionsIdx = 0; }
    else if (menuIdx === 4) { phase = "credits"; }
  }
}

function handleOptionsKey(e) {
  const maxIdx = 5; // 0..5
  if (e.key === "ArrowUp") optionsIdx = (optionsIdx - 1 + (maxIdx + 1)) % (maxIdx + 1);
  if (e.key === "ArrowDown") optionsIdx = (optionsIdx + 1) % (maxIdx + 1);

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const dir = e.key === "ArrowLeft" ? -1 : 1;
    if (optionsIdx === 0) cycleGrid(dir);
    if (optionsIdx === 1) cycleDiff(dir);
    if (optionsIdx === 2) CFG.particles = !CFG.particles;
    if (optionsIdx === 3) CFG.highContrast = !CFG.highContrast;
    if (optionsIdx === 4) {
      CFG.intensityMul = clamp(CFG.intensityMul + dir * 0.05, 0.6, 1.4);
    }
  }

  if (e.key === "Enter") {
    if (optionsIdx === 5) {
      phase = "menu";
      menuIdx = 0;
    }
  }

  if (e.key === "Escape") {
    phase = "menu";
    menuIdx = 0;
  }
}

function handleTutorialKey(e) {
  const max = Math.max(0, (TUTORIAL_PAGES?.length || 1) - 1);
  if (e.key === "ArrowLeft") tutorialPage = clamp(tutorialPage - 1, 0, max);
  if (e.key === "ArrowRight") tutorialPage = clamp(tutorialPage + 1, 0, max);

  if (e.key === "Escape") {
    phase = "menu";
    menuIdx = 0;
  }
  if (e.key === "Enter") {
    phase = "menu";
    menuIdx = 0;
  }
}

function handlePauseKey(e) {
  const itemsCount = 3; // Resume/Save/Quit
  if (e.key === "ArrowUp") menuIdx = (menuIdx - 1 + itemsCount) % itemsCount;
  if (e.key === "ArrowDown") menuIdx = (menuIdx + 1) % itemsCount;

  if (e.key === "Enter" || e.key === " ") {
    if (menuIdx === 0) phase = "playing";
    if (menuIdx === 1) { saveGame(); if (game) showMsg("SAVED", "#00ffcc", 45); phase = "playing"; }
    if (menuIdx === 2) { phase = "menu"; menuIdx = 0; }
  }
  if (e.key === "Escape") {
    phase = "playing";
  }
}

window.addEventListener("keydown", (e) => {
  // IMPORTANT: this was broken in your file; keep it simple and valid.
  keys.add(e.key);

  // route by phase
  if (phase === "menu") {
    handleMenuKey(e);
  } else if (phase === "options") {
    handleOptionsKey(e);
  } else if (phase === "tutorial") {
    handleTutorialKey(e);
  } else if (phase === "credits") {
    if (e.key === "Escape" || e.key === "Enter") { phase = "menu"; menuIdx = 0; }
  } else if (phase === "dead") {
    if (e.key === "Enter" || e.key === " ") startNewGame();
    if (e.key === "Escape") { phase = "menu"; menuIdx = 0; }
  } else if (phase === "pause") {
    handlePauseKey(e);
  } else if (phase === "playing") {
    if (e.key === "Escape") {
      // open pause
      phase = "pause";
      menuIdx = 0;
      // optional autosave-on-pause:
      // saveGame();
    }
  }

  // prevent scroll
  const prevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
  if (prevent.includes(e.key)) e.preventDefault();
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key);
});

// Mobile: tap canvas to start (nice)
canvas.addEventListener("click", () => {
  if (phase === "menu") startNewGame();
});

// ───────────────────────────────────────────────────────────────────────
// Boot
// ───────────────────────────────────────────────────────────────────────
console.log("GLITCH·PEACE v5 booted");
requestAnimationFrame(loop);