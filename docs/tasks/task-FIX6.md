# Task FIX6 — Exclude _archive from Vite + Shrink Repo Size

## Goal
The `_archive` folder contains the entire Three.js source tree and is
causing two problems:
1. Vite scans it on startup and throws unresolvable dependency warnings
2. It makes the repo 409MB which makes `git clone` take minutes instead
   of seconds

## Definition of Done
- [ ] `npm run dev` starts without any dependency scan warnings
- [ ] `vite.config.js` excludes _archive from scanning
- [ ] `_archive` added to `.gitignore`
- [ ] Instructions provided for removing _archive from git history
       (agent does NOT run git filter-branch — just documents the steps)

## Scope — touch ONLY these files
- `vite.config.js`
- `.gitignore`

Do NOT delete _archive, do NOT run any git history rewriting commands.

---

## EDIT 1 — vite.config.js: exclude _archive from scanning

Find the existing config object and add:

```js
export default defineConfig({
  // ... existing config ...
  optimizeDeps: {
    exclude: ['_archive'],
    // If optimizeDeps already exists, just add to it
  },
  server: {
    watch: {
      ignored: ['**/_archive/**']
    }
  }
});
```

## EDIT 2 — .gitignore: add _archive

Add these lines to .gitignore:
```
# Archive folder - large historical files, not needed for gameplay
_archive/
```

## Document for human (add to PR description, not to code):

To fully remove _archive from git history and reduce repo size from
409MB to <10MB, run these commands LOCALLY after merging this PR:

```bash
# Remove _archive from all git history (WARNING: rewrites history)
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch _archive" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (will break anyone else's clone, but this is a solo project)
git push origin --force --all

# Clean up local refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Note: This is a one-time operation. After running it, anyone who
previously cloned the repo will need to re-clone.

## Verification
```bash
npm run dev
```
Should start cleanly with no `(!) Failed to run dependency scan` warnings.

## Commit message
```
chore: FIX6 exclude _archive from vite scan, add to gitignore
```
