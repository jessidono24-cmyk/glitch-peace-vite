// ═══════════════════════════════════════════════════════════════════════
//  EMOTION REGISTRY - Unbounded emotion library + active-set support
//  - Content lives in JSON packs (easy to expand)
//  - Engine stays stable via "small active set" caps
// ═══════════════════════════════════════════════════════════════════════

import { clamp, rnd, pick } from "./utils.js";
import corePack from "../data/emotions/core.json";

/**
 * Emotion record (normalized internally):
 * {
 *   id: string,
 *   label?: string,
 *   axes: { valence: number, arousal: number, coherence: number },
 *   col?: string,
 *   desc?: string,
 *   tags?: string[],
 *   effects?: object,
 *   synergies?: Array<{with:string,result:string,weight?:number}>,
 *   contrasts?: Array<{with:string,result:string,weight?:number}>
 * }
 */

function normalizeEmotion(raw) {
  const id = String(raw.id || "").trim();
  if (!id) throw new Error("Emotion missing id");

  // Support BOTH formats:
  // A) { id, axes: {valence, arousal, coherence}, ... }
  // B) { id, valence, arousal, coherence, ... }  (legacy / simpler)
  const axes = raw.axes ?? {
    valence: raw.valence ?? raw.v ?? 0,
    arousal: raw.arousal ?? raw.a ?? 0,
    coherence: raw.coherence ?? raw.c ?? 0.5,
  };

  const valence = clamp(Number(axes.valence ?? 0), -1, 1);
  const arousal = clamp(Number(axes.arousal ?? 0), 0, 1);
  const coherence = clamp(Number(axes.coherence ?? 0.5), 0, 1);

  return {
    id,
    label: raw.label ?? id,
    axes: { valence, arousal, coherence },
    col: raw.col ?? raw.color ?? "#88ffaa",
    desc: raw.desc ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    effects: raw.effects && typeof raw.effects === "object" ? raw.effects : {},
    synergies: Array.isArray(raw.synergies) ? raw.synergies : [],
    contrasts: Array.isArray(raw.contrasts) ? raw.contrasts : [],
  };
}

function buildMapFromPack(packArr) {
  const map = new Map();
  for (const raw of packArr) {
    const e = normalizeEmotion(raw);
    map.set(e.id, e);
  }
  return map;
}

export class EmotionRegistry {
  constructor() {
    this._packs = new Map(); // packId -> Map(id -> emotion)
    this._activePackId = "core";
    this._activeSetLimit = 8; // safety default (adjustable)
    this._activeEmotionIds = new Set(); // "small active set"

    // Load default core pack
    this.registerPack("core", corePack);
    this.setActivePack("core");

    // Default: pick a stable initial active set
    this.chooseActiveSet({ mode: "diverse" });
  }

  registerPack(packId, packArray) {
    const map = buildMapFromPack(packArray);
    this._packs.set(packId, map);
  }

  hasPack(packId) {
    return this._packs.has(packId);
  }

  setActivePack(packId) {
    if (!this._packs.has(packId)) {
      throw new Error(`Unknown emotion pack: ${packId}`);
    }
    this._activePackId = packId;

    // When pack changes, refresh active set so we only reference valid ids
    const ids = this.ids();
    const kept = [...this._activeEmotionIds].filter((id) => ids.includes(id));
    this._activeEmotionIds = new Set(kept);

    if (this._activeEmotionIds.size === 0) {
      this.chooseActiveSet({ mode: "diverse" });
    }
  }

  getActivePackId() {
    return this._activePackId;
  }

  // All emotions in current active pack
  _pack() {
    return this._packs.get(this._activePackId);
  }

  ids() {
    return [...this._pack().keys()];
  }

  get(id) {
    return this._pack().get(id) ?? null;
  }

  has(id) {
    return this._pack().has(id);
  }

  // Small active set controls (for neurodivergent-friendly pacing)
  setActiveLimit(n) {
    this._activeSetLimit = clamp(Number(n) || 8, 1, 24);
    if (this._activeEmotionIds.size > this._activeSetLimit) {
      // Trim deterministically
      const trimmed = [...this._activeEmotionIds].slice(0, this._activeSetLimit);
      this._activeEmotionIds = new Set(trimmed);
    }
  }

  getActiveLimit() {
    return this._activeSetLimit;
  }

  getActiveIds() {
    return [...this._activeEmotionIds];
  }

  isActive(id) {
    return this._activeEmotionIds.has(id);
  }

  /**
   * Choose a new active set from the full library.
   * mode:
   *  - "diverse": try to span valence/arousal/coherence space
   *  - "random": purely random
   *  - "biased": weighted toward a list of tags or ids
   */
  chooseActiveSet({
    mode = "diverse",
    preferIds = [],
    preferTags = [],
    seed = null,
  } = {}) {
    const all = this.ids().map((id) => this.get(id)).filter(Boolean);
    const limit = this._activeSetLimit;

    if (all.length <= limit) {
      this._activeEmotionIds = new Set(all.map((e) => e.id));
      return this.getActiveIds();
    }

    // Seeded-ish selection: if seed provided, shuffle with simple LCG-ish
    let pool = [...all];
    if (seed != null) {
      let s = Math.abs(Number(seed)) || 1;
      pool.sort(() => {
        // deterministic-ish comparator
        s = (s * 48271) % 0x7fffffff;
        return (s % 1000) / 1000 - 0.5;
      });
    } else {
      pool.sort(() => Math.random() - 0.5);
    }

    const chosen = [];

    // First: force preferred ids
    for (const pid of preferIds) {
      if (this.has(pid) && !chosen.some((e) => e.id === pid)) {
        chosen.push(this.get(pid));
      }
      if (chosen.length >= limit) break;
    }

    // Next: tag-biased
    if (chosen.length < limit && preferTags.length) {
      const tagged = pool.filter((e) => e.tags?.some((t) => preferTags.includes(t)));
      for (const e of tagged) {
        if (!chosen.some((x) => x.id === e.id)) chosen.push(e);
        if (chosen.length >= limit) break;
      }
    }

    // Then: fill remaining according to mode
    if (chosen.length < limit) {
      if (mode === "random") {
        for (const e of pool) {
          if (!chosen.some((x) => x.id === e.id)) chosen.push(e);
          if (chosen.length >= limit) break;
        }
      } else {
        // "diverse": pick points that spread across axes (cheap heuristic)
        const buckets = {
          pos_hi: [], pos_lo: [], neg_hi: [], neg_lo: [],
          calm: [], intense: [], coherent: [], incoherent: [],
        };

        for (const e of pool) {
          const v = e.axes.valence;
          const a = e.axes.arousal;
          const c = e.axes.coherence;

          if (v >= 0 && a >= 0.5) buckets.pos_hi.push(e);
          if (v >= 0 && a < 0.5) buckets.pos_lo.push(e);
          if (v < 0 && a >= 0.5) buckets.neg_hi.push(e);
          if (v < 0 && a < 0.5) buckets.neg_lo.push(e);

          if (a < 0.35) buckets.calm.push(e);
          if (a > 0.75) buckets.intense.push(e);
          if (c > 0.75) buckets.coherent.push(e);
          if (c < 0.35) buckets.incoherent.push(e);
        }

        const order = [
          "pos_hi", "neg_hi", "pos_lo", "neg_lo",
          "coherent", "incoherent", "calm", "intense",
        ];

        for (const key of order) {
          while (chosen.length < limit && buckets[key].length) {
            const e = buckets[key].pop();
            if (!chosen.some((x) => x.id === e.id)) chosen.push(e);
          }
          if (chosen.length >= limit) break;
        }

        // If still short, fill randomly
        for (const e of pool) {
          if (chosen.length >= limit) break;
          if (!chosen.some((x) => x.id === e.id)) chosen.push(e);
        }
      }
    }

    this._activeEmotionIds = new Set(chosen.slice(0, limit).map((e) => e.id));
    return this.getActiveIds();
  }

  /**
   * Safety: when integrating with EmotionalField, you can decide whether
   * non-active emotions should be allowed (recorded) or ignored.
   * - strict=true means ignore emotions not in active set (reduces overload)
   * - strict=false means allow recording but only active set drives world modifiers
   */
  canRecord(id, { strict = false } = {}) {
    if (!this.has(id)) return false;
    if (!strict) return true;
    return this.isActive(id);
  }
}

// Singleton registry used by default everywhere
export const emotionRegistry = new EmotionRegistry();