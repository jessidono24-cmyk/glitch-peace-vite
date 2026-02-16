// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// BASE LAYER v1.0
// ═══════════════════════════════════════════════════════════

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 🔌 LAYER 2 EXPANSION: Add Fibonacci
// export function fibonacci(n) {
//   if (n <= 1) return 1;
//   if (n === 2) return 2;
//   let a = 1, b = 2;
//   for (let i = 3; i <= n; i++) {
//     [a, b] = [b, a + b];
//   }
//   return b;
// }
