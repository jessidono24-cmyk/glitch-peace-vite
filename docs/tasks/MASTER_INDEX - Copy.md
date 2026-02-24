# GLITCH·PEACE-VITE — Complete Agent Task Suite
# Generated: 2026-02-20

## The Plan in Plain Language

glitch-peace-vite is the canonical codebase going forward.
Everything from glitch-peace-main merges INTO it.

**Code:** No duplication — vite already has newer/better versions of
emotional-engine, temporal-system, impulse-buffer, consequence-preview,
sfx-manager, mode-manager, all modes. The main repo's task files (E2-E4,
T1-T2) are already complete in vite. Don't re-run them.

**Docs:** The glitch-peace-main docs folder is additive — copy these
files into `glitch-peace-vite/docs/` (most don't exist there yet):
  CANON.md, ARCHITECTURE.md, SOVEREIGN_CODEX.md, EMBODIMENT.md,
  EFFORTLESS_LEARNING.md, COGNITIVE_ARCHITECTURE.md,
  PSYCHOLOGY_FOUNDATIONS.md, RESEARCH_INTEGRATION.md, ROADMAP.md,
  BABY_STEPS_GUIDE.md, GAMEPLAY_MODES.md

---

## Task Dependency Order

Run tasks strictly in this sequence. Each builds on the previous.

```
FOUNDATION
  W1 — EventBus (new file, no deps)
  W2 — Remove window globals from GridMode [needs W1]

SYSTEMS WIRING (can do S1-S5 in any order after W1)
  S1 — BiomeSystem visual overlays
  S2 — AchievementSystem popups
  S3 — AlchemySystem seeds + transmutation
  S4 — DreamYoga lucidity + reality checks
  S5 — BossSystem 3-phase management

INTELLIGENCE WIRING (can do I1-I3 in any order after W1)
  I1 — EmotionRecognition observe() + flash labels
  I2 — EmpathyTraining enemy stun hooks
  I3 — LogicPuzzles + StrategicThinking tracking

RENDERING UPGRADES (after S1 so you know the pattern)
  R1 — SpritePlayer replaces static player rect
  R2 — CampaignManager first-visit tutorials

DASHBOARD & AWARENESS (needs I1-I3 done for scores to show)
  D1 — Integration Dashboard (H key overlay)
  D2 — SelfReflection on interlude screen
  D3 — EmergenceIndicators flash + record hooks
```

---

## Task Files

| File | Task | What it does |
|------|------|-------------|
| task-W1.md | EventBus | New pub/sub foundation |
| task-W2.md | GridMode cleanup | Remove window._ leaks |
| task-S1.md | BiomeSystem | Emotion-driven visual overlays |
| task-S2.md | Achievements | Unlock popups |
| task-S3.md | Alchemy | Seeds + transmutation key (X) |
| task-S4.md | DreamYoga | Lucidity bar + reality check overlay |
| task-S5.md | BossSystem | 3-phase transitions + specials |
| task-I1.md | EmotionRecognition | Flash labels when emotion crosses threshold |
| task-I2.md | EmpathyTraining | Compassion phrase on enemy stun |
| task-I3.md | LogicPuzzles + Strategic | IQ/strategic tracking |
| task-R1.md | SpritePlayer | Animated player |
| task-R2.md | CampaignManager | First-visit tutorials |
| task-D1.md | Dashboard | H key overlay, all scores |
| task-D2.md | SelfReflection | Interlude prompts |
| task-D3.md | EmergenceIndicators | Awakening sign flashes |

---

## Docs Merge (No Agent Needed — Manual Copy)

Copy these files from glitch-peace-main/docs/ into
glitch-peace-vite/docs/ (create docs/ folder if it doesn't exist):

```bash
cp main/docs/CANON.md                vite/docs/CANON.md
cp main/docs/ARCHITECTURE.md         vite/docs/ARCHITECTURE.md
cp main/docs/SOVEREIGN_CODEX.md      vite/docs/SOVEREIGN_CODEX.md
cp main/docs/EMBODIMENT.md           vite/docs/EMBODIMENT.md
cp main/docs/EFFORTLESS_LEARNING.md  vite/docs/EFFORTLESS_LEARNING.md
cp main/docs/COGNITIVE_ARCHITECTURE.md vite/docs/COGNITIVE_ARCHITECTURE.md
cp main/docs/PSYCHOLOGY_FOUNDATIONS.md vite/docs/PSYCHOLOGY_FOUNDATIONS.md
cp main/docs/RESEARCH_INTEGRATION.md vite/docs/RESEARCH_INTEGRATION.md
cp main/docs/ROADMAP.md              vite/docs/ROADMAP.md
cp main/docs/BABY_STEPS_GUIDE.md     vite/docs/BABY_STEPS_GUIDE.md
cp main/docs/GAMEPLAY_MODES.md       vite/docs/GAMEPLAY_MODES.md
```

If vite already has ROADMAP.md, ARCHITECTURE.md, or AGENT_TASKS.md —
compare them first. The vite versions will be more current (they
reflect M1-M3 mode work, Phase 9 intelligence systems, etc.).
Keep the vite versions as primary; merge in any content that's only
in the main versions.

---

## What's Already Done in Vite (Don't Redo)

E1 — EmotionalField created
E2 — EmotionalField wired into main.js
E3 — Emotional HUD row (coherence/distortion bars)
E4-A — purgDepth computation + damage modifiers
E4-B — Realm label in HUD footer
T1 — TemporalSystem created
T2 — TemporalSystem wired (lunar/planetary modifiers)
ImpulseBuffer — created (Phase 4)
ConsequencePreview — created (Phase 4)
SFXManager — created and wired (Phase 5)
ModeManager — created
GridMode — extracted
MeditationMode — created
RhythmMode — created
SpritePlayer — created (needs R1 to wire it)
ThreeLayer — created
BossRenderer3D — created
VoidNexus3D — created

---

## After All Tasks Complete

Run the full browser smoke test:

1. Title screen renders ✓
2. Start game -> no console errors ✓
3. Move player -> SpritePlayer animated ✓
4. Walk into TERROR tiles -> red biome tint appears ✓
5. Collect PEACE -> tint lifts, "Peace Found" achievement ✓
6. Press H -> dashboard shows IQ/EQ/lucidity/emergence ✓
7. Toggle matrix 5x -> "Dual Awareness" emergence flash ✓
8. Complete dreamscape -> reflection prompt on interlude screen ✓
9. Seek INSIGHT tiles x3, press X -> alchemy transmutation fires ✓
10. Reality check appears after 4+ minutes ✓

---

## Golden Rules for Agent

1. ONE task at a time. Finish, `npm run build`, verify, commit.
2. Touch ONLY the files listed in the task's "Scope" section.
3. Check actual property names in each system file before writing
   renderer code — don't guess, open the file.
4. If a system file is at a different path than expected, find it
   (use grep) rather than creating a duplicate.
5. Commit message format: `feat: [task id] description`
6. If build fails, fix the task file before moving to the next task.
