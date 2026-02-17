// ═══════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

// Random & Math
export const rnd = n => Math.floor(Math.random() * n);
export const pick = arr => arr[rnd(arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (y1, x1, y2, x2) => Math.abs(y2 - y1) + Math.abs(x2 - x1);

// Canvas utilities
export function resizeCanvas(canvas, ctx, w, h, dpr = 1) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${Math.min(w, window.innerWidth - 16)}px`;
  canvas.style.height = 'auto';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// Local storage with error handling
export const storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.warn('Storage get error:', e);
      return fallback;
    }
  },
  
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('Storage set error:', e);
      return false;
    }
  },
  
  clear(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Storage clear error:', e);
      return false;
    }
  },
};

// Deep clone object
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Timestamp helpers
export function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

// Grid helpers
export function inBounds(y, x, size) {
  return y >= 0 && y < size && x >= 0 && x < size;
}

export function getNeighbors(y, x, size) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return dirs
    .map(([dy, dx]) => [y + dy, x + dx])
    .filter(([ny, nx]) => inBounds(ny, nx, size));
}

// Color utilities
export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lerpColor(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Pathfinding (simple A* for AI)
export function findPath(start, goal, grid, maxSteps = 50) {
  const open = [{ ...start, g: 0, h: dist(start.y, start.x, goal.y, goal.x), f: 0, path: [] }];
  const closed = new Set();
  
  while (open.length > 0 && open[0].path.length < maxSteps) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    
    if (current.y === goal.y && current.x === goal.x) {
      return current.path;
    }
    
    closed.add(`${current.y},${current.x}`);
    
    const neighbors = getNeighbors(current.y, current.x, grid.length);
    for (const [ny, nx] of neighbors) {
      if (closed.has(`${ny},${nx}`)) continue;
      if (grid[ny][nx] === 5) continue; // wall
      
      const g = current.g + 1;
      const h = dist(ny, nx, goal.y, goal.x);
      const f = g + h;
      
      const existing = open.find(n => n.y === ny && n.x === nx);
      if (!existing || g < existing.g) {
        if (existing) open.splice(open.indexOf(existing), 1);
        open.push({
          y: ny,
          x: nx,
          g,
          h,
          f,
          path: [...current.path, { y: ny, x: nx }],
        });
      }
    }
  }
  
  return []; // No path found
}

// Fibonacci sequence generator (for peace scaling)
export function fibonacci(n) {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

// Mobile detection
export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
export const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.lastTime = performance.now();
  }
  
  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frames.push(delta);
    if (this.frames.length > 60) this.frames.shift();
  }
  
  getFPS() {
    if (this.frames.length === 0) return 60;
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return Math.round(1000 / avg);
  }
  
  shouldReduceQuality() {
    return this.getFPS() < 30;
  }
}
