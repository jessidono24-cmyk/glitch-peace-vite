---
trigger:
  schedule: "0 9 * * 1"  # Monday 9am UTC
permissions:
  contents: write
  pull-requests: write
---

Run the wiring audit task from docs/tasks/task-WIRE1.md.

Write the audit report to docs/wiring-audit-{date}.md where {date} is the
current date in YYYY-MM-DD format.

Follow the full audit protocol:
1. Run all category checks (A–H) from the task document.
2. Produce the written inventory in the report file.
3. Work through P1, P2, P3 fixes in priority order.
4. If any P1 issues are found, open a PR with fixes and the audit report.
5. If only P2/P3 issues, open a PR with the audit report and any code fixes.
6. Commit message: "feat: WIRE1 wiring audit — {N} connections fixed, {M} dead code removed"
