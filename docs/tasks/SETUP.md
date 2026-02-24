# GLITCH·PEACE — Agentic Workflow Setup Guide

These four workflows turn your task-based development process into an automated
pipeline. Push a task file → agent runs it → PR appears for your review.

---

## What These Workflows Do

| File | Trigger | What it does |
|------|---------|--------------|
| `run-task.md` | Push any `tasks/task-*.md` to main | Reads the task, executes it, opens a PR |
| `build-verify.md` | Any PR opened or updated | Runs `npm run build`, comments ✅/❌ |
| `pr-fix.md` | Comment `/pr-fix` on a PR | Diagnoses build failure, pushes a fix |
| `research-writer.md` | Every Monday 6am UTC | Writes/maintains research docs |

---

## Prerequisites

- GitHub CLI installed: `gh --version` (need v2.0.0+)
- Claude API key (you'll use Claude as the engine, not Copilot/Codex)
- Write access to the GLITCH·PEACE repo
- GitHub Actions enabled in repo settings

---

## One-Time Setup

### Step 1 — Install the gh-aw extension

```bash
gh extension install github/gh-aw
```

### Step 2 — Add your Claude API key as a repo secret

```bash
gh secret set ANTHROPIC_API_KEY --body "your-key-here"
```

### Step 3 — Copy these workflow files into your repo

```bash
# From the repo root:
mkdir -p .github/workflows

cp agentic-workflows/run-task.md        .github/workflows/run-task.md
cp agentic-workflows/build-verify.md   .github/workflows/build-verify.md
cp agentic-workflows/pr-fix.md         .github/workflows/pr-fix.md
cp agentic-workflows/research-writer.md .github/workflows/research-writer.md
```

### Step 4 — Compile each workflow to YAML

The `gh aw compile` step generates the actual `.lock.yml` GitHub Actions files
that run the agents. The markdown files are the source of truth; the lock files
are what GitHub actually executes.

```bash
cd .github/workflows

gh aw compile run-task.md
gh aw compile build-verify.md
gh aw compile pr-fix.md
gh aw compile research-writer.md
```

This generates:
- `run-task.lock.yml`
- `build-verify.lock.yml`
- `pr-fix.lock.yml`
- `research-writer.lock.yml`

### Step 5 — Set the engine to Claude in each workflow

Open each `.md` file and add/verify this in the frontmatter:

```yaml
engine: claude
```

Or if the compile step prompts you for an engine, choose Claude.

### Step 6 — Commit and push

```bash
git add .github/workflows/
git commit -m "feat: add agentic workflows for task automation"
git push
```

### Step 7 — Test the build verifier first (lowest risk)

Open any small PR (even a README edit). The build verifier should comment
automatically within 2–3 minutes. If it does, the setup is working.

---

## Day-to-Day Usage

### Running a task automatically
Push a task file to `tasks/` on main branch — the agent picks it up and works.

```bash
# Example: after creating task-ARCH1.md
git add tasks/task-ARCH1.md
git commit -m "task: add ARCH1 canvas sizing fix"
git push origin main
# → run-task agent fires, reads the task, executes it, opens a PR
```

### Fixing a broken build on a PR
On any PR with a ❌ build comment, just type in a PR comment:
```
/pr-fix
```
The pr-fix agent wakes up, reads the error, fixes the code, pushes to the branch.

### Running research writer manually
```bash
gh aw run research-writer
```
Or wait for Monday morning — it runs automatically.

### Updating a workflow
Edit the `.md` file, then recompile:
```bash
gh aw compile run-task.md
git add .github/workflows/run-task.md .github/workflows/run-task.lock.yml
git commit -m "update: run-task workflow"
git push
```

---

## Important Notes

**You still review and merge all PRs.** These agents open PRs — they never
merge. You are always in the loop before anything lands on main.

**The run-task agent only fires on pushes to main.** If you want to test a
task without triggering the agent, push to a feature branch instead.

**Research writer is read-only for source files.** It only writes to
`docs/research/`. It cannot touch `src/`.

**Build verifier does not fix — it only reports.** Use `/pr-fix` for fixes.

---

## Troubleshooting

**Agent doesn't fire:**
- Check Actions tab in GitHub — is the workflow listed? Did it get an error?
- Check that `.lock.yml` was committed alongside the `.md`
- Check that `ANTHROPIC_API_KEY` secret is set

**Build verify comments are missing:**
- Verify the workflow has `pull-requests: write` permission
- Check that `safe-outputs: add-comment:` is in the frontmatter

**pr-fix doesn't trigger on `/pr-fix`:**
- The comment must be exactly `/pr-fix` — no extra text on the same line
- The issue_comment trigger only fires on PR comments, not issue comments
- Check that the PR actually has a failing check (not just a warning)

**Want to disable a workflow temporarily:**
- Go to Actions tab → select the workflow → "Disable workflow"
- Or delete the `.lock.yml` file (keep the `.md` as documentation)
