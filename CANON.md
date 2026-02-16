# GLITCH·PEACE Canon (Agent Rules)

## Northstar
Ship a stable base-layer of the game that can be built, launched, and smoke-tested automatically.

## Non-negotiables
1) Do not introduce coercive content. Keep tone non-violent and non-shaming.
2) Preserve player safety and recovery framing. “Stop means stop.”
3) No destructive refactors unless the task explicitly authorizes it.

## Engineering constraints
1) Prefer small modules. Avoid mega-files.
2) One task = one outcome. Keep diffs tight.
3) No breaking changes to the public API of systems unless necessary and explained.
4) Must run and pass:
   - `npm run build`
   - Playwright smoke test (once added)

## Change limits
- Default max: 12 files changed per task.
- Default max: 300 LOC net new per task.
- If a task needs more, it must say so.

## Definition of Done (DoD)
A task is done when:
1) It builds (`npm run build` succeeds)
2) Smoke test passes
3) The change matches the task goal and does not regress menus/visuals/core loop
4) A short note is added to CHANGELOG section in the PR summary (or commit message)

## Stop conditions
Stop and report instead of continuing if:
- Build fails twice after attempted fixes
- A change would touch many unrelated systems
- The problem appears architectural, not local