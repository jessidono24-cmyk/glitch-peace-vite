'use strict';
// ============================================================
//  GLITCH·PEACE — event-bus.js
//  Lightweight pub/sub for decoupled system communication.
//
//  Usage:
//    import { bus } from '../core/event-bus.js';
//    bus.on('emotion:change', ({ id, value }) => { ... });
//    bus.emit('emotion:change', { id: 'fear', value: 0.8 });
//    const unsub = bus.on('event', handler); unsub(); // cleanup
// ============================================================

class EventBus {
  constructor() { this._listeners = new Map(); }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) { this._listeners.get(event)?.delete(handler); }

  emit(event, data) {
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try { h(data); } catch (e) { console.warn('[EventBus]', event, e); }
    }
  }

  once(event, handler) {
    const w = (data) => { handler(data); this.off(event, w); };
    return this.on(event, w);
  }

  clear(event) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}

export const bus = new EventBus();
