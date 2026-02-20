# GLITCH·PEACE Baby Steps Development Guide

## Philosophy

Every change must be:
1. **Small** - One feature, one file, one system at a time
2. **Tested** - Manually verified before moving on
3. **Documented** - Explained clearly
4. **Committed** - Saved to version control
5. **Verified** - Confirmed working with previous systems

## The Baby Step Process

### Step 1: Plan
Before touching code:
- [ ] Read relevant docs (CANON.md, ARCHITECTURE.md, ROADMAP.md)
- [ ] Identify exact change to make
- [ ] Check for dependencies
- [ ] Verify no conflicts with existing code
- [ ] Document what you'll do

### Step 2: Implement
Making the change:
- [ ] Create or modify ONE file at a time
- [ ] Keep changes minimal and focused
- [ ] Follow existing code style
- [ ] Add comments explaining non-obvious parts
- [ ] Don't touch unrelated code

### Step 3: Test
Verify the change:
- [ ] Run dev server (`npm run dev`)
- [ ] Test in browser
- [ ] Verify existing features still work
- [ ] Check console for errors
- [ ] Test edge cases
- [ ] Take screenshot if UI changed

### Step 4: Document
Update documentation:
- [ ] Update README if needed
- [ ] Update ARCHITECTURE.md if significant
- [ ] Comment code thoroughly
- [ ] Note any future TODOs
- [ ] Explain design decisions

### Step 5: Commit
Save your work:
- [ ] Stage changed files only
- [ ] Write clear commit message
- [ ] Follow format: `feat: [component] description`
- [ ] Push to repository
- [ ] Verify commit succeeded

### Step 6: Verify
Double-check everything:
- [ ] Pull fresh copy (if working with others)
- [ ] Test again from clean slate
- [ ] Confirm no regressions
- [ ] Ready for next baby step

## Baby Step Examples

### Good Baby Step ✅
**Commit**: `feat: learning - add basic vocabulary engine skeleton`
- Created `src/systems/learning/language/vocabulary-engine.js`
- Empty class with method stubs
- Documented API in comments
- No integration yet
- ~50 lines
- Tested: imports successfully

### Bad Baby Step ❌
**Commit**: `feat: add all learning systems`
- Modified 15 files
- Added 2,000 lines
- Integrated with everything
- No testing
- Multiple systems at once
- Documentation outdated

### Good Baby Step ✅
**Commit**: `feat: learning - integrate vocabulary into tile system`
- Modified `src/game/player.js` (one function)
- Added vocabulary.learn() call
- Tested: word appears in console
- ~5 lines changed
- Documented in comments

## File Creation Template

When creating a new file, use this structure:

```javascript
'use strict';
/**
 * [FILE NAME] - [PURPOSE]
 * 
 * Part of GLITCH·PEACE consciousness engine
 * Phase: [PHASE NUMBER]
 * System: [SYSTEM NAME]
 * 
 * Purpose:
 * [Explain what this file does and why it exists]
 * 
 * Design principles:
 * - [Principle 1]
 * - [Principle 2]
 * 
 * Integration points:
 * - [How it connects to other systems]
 * 
 * Future expansion:
 * - [What could be added later]
 */

// === IMPORTS ===
// (Organize by: external, core, game, systems, local)

// === CONSTANTS ===
// (Define at top level)

// === MAIN CLASS/FUNCTION ===
// (Core implementation)

// === EXPORTS ===
// (Explicit exports at bottom)

// === NOTES ===
// (Any important notes or TODOs)
```

## Testing Checklist

### Before Every Commit
- [ ] Game starts (`npm run dev`)
- [ ] Title screen renders
- [ ] Can start game
- [ ] Can move player
- [ ] No console errors
- [ ] New feature works
- [ ] Old features still work

### Before Every Phase
- [ ] All phase objectives met
- [ ] Documentation updated
- [ ] No regressions
- [ ] Performance acceptable
- [ ] Code reviewed
- [ ] Ready for next phase

## Common Pitfalls to Avoid

### 1. Scope Creep
❌ **Don't**: "While I'm here, let me also..."
✅ **Do**: Stay focused on one change

### 2. Premature Optimization
❌ **Don't**: Optimize before it's working
✅ **Do**: Make it work, then make it fast

### 3. Over-Engineering
❌ **Don't**: Add complexity for future flexibility
✅ **Do**: Solve today's problem simply

### 4. Insufficient Testing
❌ **Don't**: Assume it works
✅ **Do**: Test every change manually

### 5. Poor Documentation
❌ **Don't**: "Code is self-documenting"
✅ **Do**: Explain WHY, not just what

### 6. Breaking Existing Code
❌ **Don't**: Change shared code carelessly
✅ **Do**: Test all dependencies

### 7. Large Commits
❌ **Don't**: Save up changes for one big commit
✅ **Do**: Commit frequently, small changes

## Integration Guidelines

### When Adding New System

1. **Create folder structure**
   - Just the directories
   - Commit: `chore: create [system] folder structure`

2. **Add README**
   - Document the vision
   - Commit: `docs: add [system] README`

3. **Create skeleton file**
   - Empty class with method stubs
   - Commit: `feat: [system] skeleton implementation`

4. **Implement core logic**
   - One method at a time
   - Commit each: `feat: [system] implement [method]`

5. **Add tests**
   - Manual testing documented
   - Commit: `test: verify [system] functionality`

6. **Integrate with existing systems**
   - One integration point at a time
   - Commit each: `feat: integrate [system] with [other]`

7. **Add UI**
   - Separate from logic
   - Commit: `feat: [system] add UI elements`

8. **Polish and optimize**
   - Performance, UX, accessibility
   - Commit: `refactor: [system] optimization`

## Code Style

### Naming Conventions
- **Classes**: PascalCase (`VocabularyEngine`)
- **Functions**: camelCase (`learnWord()`)
- **Constants**: UPPER_SNAKE (`MAX_WORDS`)
- **Files**: kebab-case (`vocabulary-engine.js`)
- **Variables**: camelCase (`wordCount`)

### Comments
```javascript
// Single-line for quick notes

/**
 * Multi-line for:
 * - Function documentation
 * - Class documentation
 * - Complex logic explanation
 */

// 🔌 EXPANSION POINT: [explanation]
// Used to mark where future systems can plug in
```

### Structure
1. Imports at top
2. Constants after imports
3. Helper functions before main
4. Main class/function in middle
5. Exports at bottom
6. Notes/TODOs at very bottom

## Commit Message Format

```
<type>: <scope> <subject>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```
feat: learning - add vocabulary engine core
fix: cessation - session tracker timestamp bug
docs: update ARCHITECTURE with learning systems
refactor: awareness - improve reflection UX
test: verify emotional engine integration
chore: clean up unused imports
```

## Emergency Protocol

### If Something Breaks

1. **Don't panic**
   - Bugs are normal
   - Every bug is fixable

2. **Identify the issue**
   - When did it start?
   - What changed?
   - Error messages?

3. **Isolate the problem**
   - Reproduce consistently
   - Minimal test case
   - Specific to one system?

4. **Fix carefully**
   - One change at a time
   - Test after each fix
   - Document the bug and solution

5. **Learn from it**
   - How could it be prevented?
   - Add safeguards
   - Update testing checklist

### If You're Stuck

1. **Step back**
   - Take a break
   - Review documentation
   - Check similar code

2. **Simplify**
   - Remove complexity
   - Start with minimal version
   - Build up incrementally

3. **Ask for help**
   - Describe the problem
   - Show what you've tried
   - Specific questions

## Success Indicators

### You're Doing It Right If:
- ✅ Each commit is small and focused
- ✅ Tests pass after every change
- ✅ Documentation stays updated
- ✅ Code is readable and commented
- ✅ No scary multi-file commits
- ✅ Making steady progress
- ✅ Existing features don't break
- ✅ Feel confident about changes

### Warning Signs:
- ⚠️ Commits are large (>200 lines)
- ⚠️ Modifying many files at once
- ⚠️ Skipping testing
- ⚠️ Documentation outdated
- ⚠️ Breaking existing features
- ⚠️ Uncertain about changes
- ⚠️ "I'll test it later"
- ⚠️ "I'll document it later"

## Remember

> **The tortoise beats the hare.**

Slow, steady, verified progress beats fast, careless rushing every time.

- Small steps compound
- Testing saves time
- Documentation helps future you
- Quality over speed
- Progress over perfection

---

**Follow this guide and GLITCH·PEACE will grow reliably from 5,000 to 20,000+ lines over time, without breaking.**

Last Updated: 2026-02-19
