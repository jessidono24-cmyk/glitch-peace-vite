# TASKS_FOR_CLAUDE.md

These tasks are written to be copy/paste-friendly into Claude.  
Canonical specs: `SYSTEM_WIRING.md` + `REALM_SPECS.md`.

---

## 0) Repo orientation (no code changes)
**Task:** Read `SYSTEM_WIRING.md` and `REALM_SPECS.md`, then summarize in 10 bullets how the Mooncycle Run is supposed to work.  
**Acceptance criteria:** Summary mentions `RunSpec`, Lake Realm default hub, portals, godforms as UI deck, creature palette via taxonomy mapping, mini-games as embedded modes.

---

## 1) Create the canonical `RunSpec` type + defaults
**Task:** Implement `RunSpec` exactly as in `SYSTEM_WIRING.md` (TypeScript), plus a default instance for Lake Realm (New Moon).  
**Acceptance criteria:**
- `RunSpec` exported from a single module (e.g., `src/core/runSpec.ts`)
- Default `RunSpec` uses realmId `lake_realm`
- Game compiles

---

## 2) Add `runSpecManager` (persistence + lifecycle)
**Task:** Create `runSpecManager` with:
- `get()`, `set(partial)`, `resetToDefault()`
- persistence to `localStorage` (or equivalent) with versioning
**Acceptance criteria:**
- Safe migrations (if schema version mismatches, reset to defaults)
- No crashes if storage is empty or corrupted

---

## 3) Add an EventBus (thin, typed)
**Task:** Implement a small typed event bus with events from `SYSTEM_WIRING.md`:
- `RUN_START(spec)`, `REALM_ENTER(realmId)`, `REALM_EXIT(realmId)`,
- `HUD_RENDER_REQUEST(budget)`, `SAVE_REQUEST(payload, dataClass)` (stub ok)
**Acceptance criteria:** Types compile; at least one event emitted and received in dev

---

## 4) Lake Realm hub as diegetic main menu
**Task:** Replace the pre-run selection menu with a **Lake Realm Hub** screen/scene:
- shows current phase and realm
- has interactables: Portal Stones, Godform Altar, Dream Log (UI panels ok)
**Acceptance criteria:**
- App loads into Lake Realm by default
- Clicking a Portal Stone triggers a realm transition (to one realm stub)

---

## 5) Realm transition pipeline (portal travel)
**Task:** Implement `enterRealm(realmId)`:
- updates RunSpec.realmId
- emits `REALM_EXIT` then `REALM_ENTER`
- switches renderer/state cleanly
**Acceptance criteria:**
- Travel Lake -> one realm -> back to Lake works
- No memory leaks or duplicated loops (only one active update loop)

---

## 6) Import realm data config from `REALM_SPECS.md`
**Task:** Create a data module `realmRegistry` (JSON or TS object) with entries:
- id, name, phase anchor string, hubLayoutAscii, and placeholder fields for: archetype, guides, predatorOverlay
Populate at least: `lake_realm`, `leaping_field`, `civic_center_maze`, `mansion_compound`, `water_park`, `ethereal_bog`, `mountain_summit`, `castle_region`.
**Acceptance criteria:** The hub UI reads from registry (no hard-coded realm labels)

---

## 7) Implement Moonphase selector in-world (not a menu tree)
**Task:** In Lake Realm, Portal Stones correspond to moon phases/realms.
Clicking a portal sets:
- `RunSpec.moonPhase` + `RunSpec.realmId`
**Acceptance criteria:**
- Visible feedback in UI
- Phase/realm reflected in RunSpec debug overlay

---

## 8) Godform deck: read-only UI first
**Task:** Parse the `godform library and creature code.docx` content into a structured data file (manual transcription into JSON/TS is fine). Implement a UI panel that:
- lists godforms
- shows macro/anchors if present
- lets player “equip” 2–4 godforms into RunSpec
**Acceptance criteria:**
- No lore invention: only entries present in the doc are used
- Equipping updates RunSpec and persists

---

## 9) Creature Index: taxonomy-driven encounter palettes
**Task:** Implement a `CreatureIndex` data file (Layer/Role/tags entries) based on the same doc.
Add `mapCreaturePalette(realmId)` which selects 4–8 creatures using tag rules (design mapping; documented).
**Acceptance criteria:**
- Function is deterministic given a seed
- Output displayed in a debug panel for the current realm
- Mapping rules are written in comments (explicitly “design mapping”)

---

## 10) Predator overlay as realm modifier (mechanical, not just text)
**Task:** Implement predator overlay modifiers that affect gameplay variables (examples):
- visibility radius
- movement tempo
- encounter frequency
- reward bias
Tie it to `RunSpec.predatorOverlay`.
**Acceptance criteria:** Toggling predator overlay changes at least 2 numeric parameters in game

---

## 11) Mini-game plugin system (turn old modes into embedded encounters)
**Task:** Create `MiniGame` interface:
- `id`, `title`, `realmIds`, `start(ctx)`, `tick(dt)`, `end()`, `reward()`
Implement 2 sample mini-games:
- “Puzzle Room” (Civic Center)
- “Ritual Practice” (Mansion or Lake)
**Acceptance criteria:**
- Mini-games can be entered/exited without breaking the main run
- Reward modifies a RunSpec-linked currency (e.g., Insight/Coherence/Integrity)

---

## 12) Unified currency + progression loop
**Task:** Add one canonical currency (choose one name):
- `Insight` or `Coherence` or `Integrity`
Currency is earned from realms/mini-games and banked at Lake.
**Acceptance criteria:**
- Currency increases on completing a mini-game
- Currency persists and displays in Lake hub

---

## 13) “Hearth close” loop on return to Lake
**Task:** When returning to Lake, show a short closure panel:
- summary of realm visited
- 1 choice: bank currency / convert to upgrade
- optional “journal prompt” text (no forced writing)
**Acceptance criteria:** Return-to-lake always triggers closure once (no duplicates)

---

## 14) Accessibility + pacing gates
**Task:** Add settings for:
- UI density (Load 0–5)
- motion reduction
- text size
Tie them to MCA “Load” concept (from wiring).  
**Acceptance criteria:**
- Setting changes actual UI complexity (e.g., fewer panels at high load)
- Stored in localStorage

---

## 15) Renderer budget + performance guardrails
**Task:** Add a “render budget” limiter:
- cap draw calls / particle count per load level
- basic FPS counter in dev mode
**Acceptance criteria:** High-load reduces visual complexity automatically; no major FPS drops during hub->realm travel

---

## 16) Documentation updates
**Task:** Update project README with:
- Mooncycle Run overview
- How RunSpec works
- How to add a realm, godform, creature, mini-game
**Acceptance criteria:** README section exists and is consistent with `SYSTEM_WIRING.md`

---

## 17) Testing / sanity checks
**Task:** Add basic tests or runtime assertions for:
- RunSpec schema validity
- realmRegistry contains required realm IDs
- mini-game enter/exit lifecycle
**Acceptance criteria:** Tests pass or assertions run in dev without crashing

---

## 18) Deliverable checkpoint
**Task:** Produce a short “Checkpoint Demo Plan”:
- start at Lake
- pick portal
- do one mini-game
- return and bank currency
**Acceptance criteria:** Steps are reproducible and match current implemented features
