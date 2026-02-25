# CLAUDE_README (Creative Inspiration folder)

## Purpose
This repo contains the game code **plus** a folder (`/creative inspiration/`) that holds the canonical design wiring + supporting reference docs.  
Your job is to implement the **Mooncycle Run** architecture without inventing lore or “filling in” missing dream/godform content.

## Canonical sources (treat as truth)
1) `SYSTEM_WIRING.md` — system blueprint + wiring + `RunSpec` object model  
2) `REALM_SPECS.md` — realm sheets template + hub layouts (Lake Realm is default hub)  
3) The existing game codebase (Glitch Peace Vite project)

Everything else in `/creative inspiration/` is **reference/inspiration** only.

## Critical constraints (do not break)
### Non-hallucination rule
- Do **not** invent additional dream entries, godforms, or creature lists beyond what is explicitly in the repo files.
- If a realm needs “creatures,” use **Creature Index taxonomy mapping** (tags/layers/roles → realm palette). That mapping is a design choice, not a claim of canon.

### “One main mode” rule
- Implement a single primary mode: **Mooncycle Run**.
- Other “modes” become **mini-games** or realm-local modifiers/encounters inside the main run.

### Lake Realm rule (default hub)
- The Lake Realm is the start and end hub (New Moon + Waning Crescent loop).  
- Pre-run multi-menu selection should be minimized; choices should be **diegetic** (portals, altars, shrines).

### Safety + ethics kernel (Sovereign Codex intent)
- No punitive/shaming loops; pacing and “smallest safe step” are design principles.
- “Stop means stop” and “consent gates” apply to any system that:
  - exports data
  - generates/shareable content
  - uses any model/API integrations (if any are added later)
- Use respectful, non-violent framing for enemies/“predators”: adversaries represent patterns and obstacles, not humiliation.

## Folder inventory (reference docs)
Use these as creative material, mechanics ideas, NPC/guardian language, sensory design, crafting systems, and pacing rules. Do not treat them as canonical system wiring unless explicitly referenced in the canonical specs.

- `GLITCH PEACE INVENTORY.docx` — current vision & module list (existing modes, dreamscapes, renderer notes)
- `dreamscape meditation.docx` — moonphase → realm mapping, archetypes, guides, predator overlays
- `godform library and creature code.docx` — Godform Library + Creature Index taxonomy (Layer/Role/tags)
- `Predators’ Field Guide for Benevolent Systems.docx` — adversary ethics + counterplay framing
- `Mythic Codex Of Guardians.docx` — guardians/watchers + sanctuary/safe-room design language
- `The MythoNeuro Sovereign Nervous System Conditioning Manual v3.docx` — pacing/load, regulation-first design
- `sensory map.docx` — sensory anchors as UX (sound/color/scent metaphors)
- `HERBALISM HANDBOOK.docx` — crafting ingredients, herbal themes
- `PLANT AND NEUROREHAB.docx` — plant-based healing motifs & systems
- `Weekly Offering Schedule.docx` — cadence/calendar hooks (optional seasonal events)
- `🜂 THE VERTICAL TEMPLE.docx` — vertical progression metaphors / spatial symbolism
- `🔸 The Living Axis of Creation.docx` — narrative spine metaphors
- `🜂 HERMETIC MATH PRIMER v1.docx` — puzzle aesthetics / symbolic math motifs
- `AutoRecovery save of Dimensional Deity Map — Scientific + Archetypal (with Ritual Cues).asd.docx` — deity/archetype mapping for visual cues (simulation-only)
- `MythoFramework and Motion Schedule.docx` + `mythoframework and motion.docx` — daily block cadence ideas (convert to quest cadence)
- `hjyhtvhgv.docx`, `dfaasdfasdf.docx`, `Tigerwave for chat.docx` — miscellaneous notes (use cautiously; treat as raw)
- `sovereign_connectome.png` — reference diagram (visual inspiration)

## Implementation style guide
- Prefer **config-driven** architecture: realms, phases, godforms, creature index entries should live in data files (JSON/TS modules), not hard-coded logic.
- Keep underlying grid/tiles if it helps; the “painterly” feel should be achieved through renderer layers (shaders, particles, interpolation), not by deleting stable simulation primitives.
- Favor small PRs: each PR should compile and keep the game runnable.

## Definition of Done (DoD) for each task
- Builds successfully (`npm install` + `npm run dev` or equivalent).
- No crashes on entering Lake Realm.
- Any new system includes:
  - types/interfaces
  - basic tests or runtime assertions
  - minimal docs update (README snippet or inline comments)

## Suggested dev order
1) `RunSpec` foundation + persistence
2) Lake Realm hub as diegetic menu
3) Portal travel to one realm and return
4) Godform deck UI (read-only first)
5) Creature palette mapping (encounters powered by taxonomy)
6) Mini-game plugin system
7) Expand realm-by-realm

