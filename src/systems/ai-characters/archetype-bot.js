'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — archetype-bot.js — BOT1: Archetype Character Bots
//  Rule-based archetype selection and message delivery.
//  No external API — entirely deterministic based on game state.
// ═══════════════════════════════════════════════════════════════════════

import { ARCHETYPE_DIALOGUE } from './dialogue-pools.js';
import { buildSessionContext } from './session-context.js';
import { T } from '../../core/constants.js';

const COOLDOWN_MS      = 50 * 1000; // 50 seconds between auto messages
const TILE_COOLDOWN_MS = 15 * 1000; // 15 seconds for tile-triggered messages
const MESSAGE_DURATION_MS  = 6000;  // how long each message stays visible
const FRAME_DELTA_MS       = 16;    // approximate frame delta for timer countdown

export class ArchetypeBot {
  constructor(sharedSystems) {
    this.sys = sharedSystems;
    this.lastSpoke = 0;
    this.pendingMessage = null; // { archetype, text, timer }
  }

  // Called from game loop each frame. g = game state object.
  tick(now, g) {
    // Fade out existing message
    if (this.pendingMessage) {
      this.pendingMessage.timer -= FRAME_DELTA_MS;
      if (this.pendingMessage.timer <= 0) this.pendingMessage = null;
    }
    if (now - this.lastSpoke < COOLDOWN_MS) return;

    const ctx = buildSessionContext(
      g, this.sys.emotionalField, this.sys.dreamYoga,
      this.sys.temporalSystem, this.sys.impulseBuffer, this.sys.languageSystem
    );

    const { archetype, contextKey } = this._selectArchetype(ctx, g);
    if (!archetype) return;

    const pool = ARCHETYPE_DIALOGUE[archetype][contextKey]
               || ARCHETYPE_DIALOGUE[archetype].neutral;
    if (!pool || pool.length === 0) return;

    const text = pool[Math.floor(Math.random() * pool.length)];
    this.pendingMessage = { archetype, text, timer: MESSAGE_DURATION_MS };
    this.lastSpoke = now;
  }

  _selectArchetype(ctx, g) {
    // Priority order — most behaviorally significant first
    const recentTiles = g._recentTiles || [];

    if (ctx.distortion > 0.75)
      return { archetype: 'child_guide', contextKey: 'high_distortion' };

    if (recentTiles.slice(-3).includes(T.SELF_HARM))
      return { archetype: 'teacher', contextKey: 'self_harm_tile' };

    if (ctx.hp < 25 && ctx.level > 1)
      return { archetype: 'protector', contextKey: 'low_hp' };

    if (ctx.impulsiveMovesRatio > 0.7 && ctx.sessionMinutes > 5)
      return { archetype: 'teacher', contextKey: 'recovery_mode' };

    if (ctx.dominantEmotion === 'fear')
      return { archetype: 'child_guide', contextKey: 'fear_context' };

    if (ctx.lucidity > 75)
      return { archetype: 'dragon', contextKey: 'peak_state' };

    if (ctx.timeOfDay === 'evening' && ctx.sessionMinutes > 20)
      return { archetype: 'orb', contextKey: 'pre_sleep' };

    if (ctx.planet === 'Saturn')
      return { archetype: 'teacher', contextKey: 'saturn_day' };

    if (ctx.planet === 'Venus')
      return { archetype: 'protector', contextKey: 'venus_day' };

    if (ctx.planet === 'Mars')
      return { archetype: 'dragon', contextKey: 'mars_day' };

    if (ctx.sessionDeaths > 4)
      return { archetype: 'protector', contextKey: 'multiple_deaths' };

    // Default: rotate through archetypes based on session minute
    const defaults = ['dragon', 'child_guide', 'orb', 'teacher', 'protector'];
    const archetype = defaults[Math.floor(ctx.sessionMinutes / 3) % defaults.length];
    return { archetype, contextKey: 'neutral' };
  }

  // Called from tile event handlers when stepping on a special tile.
  onTileEvent(tileType, g) {
    const now = Date.now();
    if (now - this.lastSpoke < TILE_COOLDOWN_MS) return;

    const TILE_MAP = {
      [T.MEMORY]:    { archetype: 'child_guide', key: 'memory_tile' },
      [T.GLITCH]:    { archetype: 'orb',         key: 'glitch_tile' },
      [T.TELEPORT]:  { archetype: 'orb',         key: 'teleport_tile' },
      [T.GROUNDING]: { archetype: 'protector',   key: 'grounding_tile' },
      [T.ARCHETYPE]: { archetype: 'dragon',      key: 'peak_state' },
    };

    const entry = TILE_MAP[tileType];
    if (!entry) return;
    const lines = ARCHETYPE_DIALOGUE[entry.archetype][entry.key];
    if (!lines || lines.length === 0) return;

    const text = lines[Math.floor(Math.random() * lines.length)];
    this.pendingMessage = { archetype: entry.archetype, text, timer: MESSAGE_DURATION_MS };
    this.lastSpoke = now;
  }
}
