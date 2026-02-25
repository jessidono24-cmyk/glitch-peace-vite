'use strict';
// ============================================================
//  GLITCH·PEACE — events.js
//  Canonical event names for the Mooncycle Run lifecycle.
//
//  These events map to the pipeline in SYSTEM_WIRING.md:
//    RunSpec → WorldGen → Palette → Encounters → MiniGames → Return-to-Lake
//
//  Usage:
//    import { bus } from './event-bus.js';
//    import { EVENTS } from './events.js';
//    bus.emit(EVENTS.RUN_START, { spec });
//    bus.on(EVENTS.REALM_ENTER, ({ realmId }) => { ... });
// ============================================================

/**
 * Canonical event names.
 * Payload contracts documented in JSDoc for each.
 */
export const EVENTS = {
  // ── Run lifecycle ───────────────────────────────────────────
  /**
   * Fired when a new Mooncycle Run begins.
   * @payload {{ spec: RunSpec }}
   */
  RUN_START: 'run:start',

  /**
   * Fired when the run ends (return to Lake or quit).
   * @payload {{ spec: RunSpec, reason: 'hearth_close' | 'quit' }}
   */
  RUN_END: 'run:end',

  // ── Realm transitions ──────────────────────────────────────
  /**
   * Fired just before leaving a realm.
   * @payload {{ realmId: string }}
   */
  REALM_EXIT: 'realm:exit',

  /**
   * Fired when entering a new realm.
   * @payload {{ realmId: string }}
   */
  REALM_ENTER: 'realm:enter',

  // ── HUD / rendering ────────────────────────────────────────
  /**
   * Request a HUD redraw with a given render budget.
   * @payload {{ budget: number }} — budget 0-5 maps to Load levels
   */
  HUD_RENDER_REQUEST: 'hud:render_request',

  // ── Persistence ────────────────────────────────────────────
  /**
   * Request to save game data.
   * @payload {{ payload: any, dataClass: string }}
   */
  SAVE_REQUEST: 'save:request',

  // ── Mini-game lifecycle ────────────────────────────────────
  /**
   * A mini-game encounter started within a realm.
   * @payload {{ miniGameId: string, realmId: string }}
   */
  MINIGAME_START: 'minigame:start',

  /**
   * A mini-game encounter ended.
   * @payload {{ miniGameId: string, reward: object }}
   */
  MINIGAME_END: 'minigame:end',

  // ── Currency ───────────────────────────────────────────────
  /**
   * Currency (Insight) was earned.
   * @payload {{ amount: number, source: string }}
   */
  CURRENCY_EARNED: 'currency:earned',

  /**
   * Currency banked at Lake hub (Hearth close).
   * @payload {{ amount: number }}
   */
  CURRENCY_BANKED: 'currency:banked',
};
