# Task FIX3 — Delete Duplicate src/ui/ Tree and Legacy Files

## Goal
The audit found 50+ duplicate files in src/ui/ and legacy versions of
core systems that are never imported. These create confusion, slow down
the agent, and make the codebase look larger than it is. This task
deletes only the confirmed-dead files.

## Definition of Done
- [ ] `npm run build` passes (this is the only real test — if it builds, nothing was accidentally deleted)
- [ ] No duplicate UI files remain
- [ ] Legacy system versions removed
- [ ] `find src -name "*.js" | wc -l` returns a meaningfully smaller number

## Scope
Deletions only. Zero edits to any active file.

---

## Step 1 — Confirm before deleting

Run this FIRST to confirm these paths exist and are not imported anywhere:

```bash
# Find all JS files in src/
find src -name "*.js" | sort > /tmp/all_files.txt
cat /tmp/all_files.txt

# Check if any file in src/ui/ duplicate tree is imported anywhere
# (adjust path if needed based on what you find)
grep -r "from.*src/ui" src/ | grep -v "node_modules"

# Check for any legacy files that import nothing
grep -rL "export" src/systems/ 2>/dev/null
```

---

## Step 2 — Delete confirmed dead files

Only delete files that meet ALL THREE criteria:
1. Never appear in any import statement anywhere in the codebase
2. Have a newer/better version in a different location
3. `npm run build` still passes after deletion

**Delete in this order, building after each group:**

### Group A: Duplicate src/ui/ files
```bash
# First identify exactly what's duplicated:
ls src/ui/

# Delete only files that are exact duplicates of files in src/
# DO NOT delete the active renderer.js or menus.js
# Example (adjust paths based on actual findings):
# rm src/ui/duplicate-renderer.js
# rm src/ui/duplicate-menus.js
```

### Group B: Legacy system versions
```bash
# Legacy emotional-engine (if a newer one exists in src/systems/)
# Legacy temporal-system
# Legacy dreamscapes (if active ones exist elsewhere)
# Example:
# rm src/systems/emotional-engine-v1.js
# rm src/systems/temporal-system-legacy.js
```

### Group C: Empty placeholder files
```bash
# Files that exist but contain only comments or empty exports
find src -name "*.js" -empty
# Review and delete empties
```

---

## Step 3 — Build verification after each group

```bash
npm run build
```

If build fails after any deletion, restore that file with:
```bash
git checkout HEAD -- path/to/file.js
```
Then investigate why it was actually imported before trying again.

---

## CRITICAL RULE
If you are uncertain whether a file is dead, DO NOT DELETE IT.
Leave a comment in the PR listing "unsure" files for human review.
A false positive deletion that breaks the build is worse than leaving
a dead file.

## Verification
```bash
npm run build   # must pass
npm run dev     # open browser, all modes still work
```

## Commit message
```
chore: FIX3 remove duplicate ui tree and legacy files -- codebase cleanup
```
