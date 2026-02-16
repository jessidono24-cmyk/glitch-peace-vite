# Agent Task Format

## Task Title
(Short and specific)

## Goal (single outcome)
(One sentence)

## Definition of Done
- [ ] Build passes: `npm run build`
- [ ] Smoke test passes
- [ ] No regressions in menus/title/gameplay
- [ ] Diff stays within limits (or task explicitly authorizes expansion)

## Scope
### Touch these files (likely)
- (list)

### Do NOT touch
- (list)

## Tests
- `npm run build`
- `npx playwright test`

## Notes / Constraints
- Keep changes minimal.
- Explain any new constants or behaviors.