'use strict';

export function rnd(n)        { return Math.floor(Math.random() * n); }
export function pick(arr)     { return arr[rnd(arr.length)]; }
export function clamp(v,a,b)  { return Math.max(a, Math.min(b, v)); }

// Fibonacci sequence for peace node scaling
const FIB = [1,1,2,3,5,8,13,21,34,55,89];
export function fibonacci(n)  { return FIB[Math.min(n, FIB.length-1)]; }

// Canvas helpers
export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
