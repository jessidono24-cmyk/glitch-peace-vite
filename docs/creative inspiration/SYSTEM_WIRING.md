# SYSTEM_WIRING_DIAGRAM

Repo drop-in: `SYSTEM_WIRING.md`


## The one-line idea

**Moonphase chooses Realm; Realm chooses palette + mechanics; Godforms choose UI behavior; Creature Index chooses encounter grammar.**


---

## Engineering wiring (ASCII)

```text
                            ┌───────────────────────────────┐
                            │            SC CORE             │
                            │  (consent, non-violence, stop) │
                            └──────────────┬────────────────┘
                                           │ hard gates
                                           ▼
                   ┌────────────────────────────────────────────────┐
                   │                     MCA                         │
                   │ routing + load + ethics + overlays + debrief     │
                   └──────────────┬───────────────────────┬─────────┘
                                  │                       │
                                  │                       │
                                  ▼                       ▼
                ┌───────────────────────────┐   ┌─────────────────────────┐
                │           MNF             │   │      GODFORMS DECK       │
                │ (content + cues + realms) │   │ (UI buttons / macros)    │
                └──────────────┬────────────┘   └───────────┬─────────────┘
                               │                            │
                               ▼                            ▼
               ┌────────────────────────────────────────────────────────┐
               │                  GLITCH PEACE CLIENT                    │
               │  Mooncycle Run:                                          │
               │   RunSpec{phase, realm, archetype, guides, predator}     │
               │     -> WorldGen(realm)                                   │
               │     -> Palette(creatures by tags)                        │
               │     -> Encounters(creature roles)                        │
               │     -> MiniGames(embedded modes)                         │
               │     -> Return-to-Lake (bank + integrate)                 │
               └────────────────────────────────────────────────────────┘
```

---

## Runtime object model (copy-paste)

```ts
// Canonical run-state packet
export type RunSpec = {
  moonPhase: string;        // e.g., "🌑 New Moon — Seed & Declare"
  realmId: string;          // e.g., "lake_realm"
  archetype: string;        // e.g., "🌱 Nurturer & Creator"
  guides: string[];         // e.g., ["Water Dancer", "Inner Child"]
  predatorOverlay: string[];// e.g., ["Wolf", "Eagle", ...]
  primaryDeities: string[]; // simulation-only flavor layer
  godforms: string[];       // e.g., ["Gatekeeper", "Hearthkeeper"]
  creaturePalette: Array<{name:string; layer:string; role:string; tags:string[]}>;
};
```