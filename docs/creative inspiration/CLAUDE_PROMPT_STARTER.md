# CLAUDE_PROMPT_STARTER.md

Paste this *at the start of every new Claude chat* for work on this repo.

---

You are working inside the **Glitch Peace** repo. There is a folder: `/creative inspiration/`.

## Canonical truth (do not drift)
Treat these two files as the **only canonical architecture**:
1) `/creative inspiration/SYSTEM_WIRING.md`
2) `/creative inspiration/REALM_SPECS.md`

All other documents in `/creative inspiration/` are **reference/inspiration** only.

## Hard rules
- **Non-hallucination:** Do not invent dream entries, godforms, or creature index items. Only use what is explicitly present in the repo files.
- **One main mode:** Implement a single primary mode: **Mooncycle Run**.
- **Lake Realm default hub:** Start and end at Lake Realm. Minimize pre-run menu trees; choices should be diegetic (portals/altars/shrines).
- **Creature Index is taxonomy:** If you assign creatures to realms, label it as **design mapping by tags**, not canon.
- **No shame loops / pacing first:** Keep systems non-punitive; add Load 0–5 UI density gating.

## Work format
When you respond:
1) List the files you will touch.
2) Provide a step-by-step plan.
3) Make changes in small increments, keeping the project runnable.
4) Include acceptance criteria for each change.
5) If something is ambiguous, propose defaults *without asking questions first*.

## Deliverables expectation
Prefer PR-sized outputs:
- clear diffs
- new types/configs in data modules (not hard-coded logic)
- minimal docs update

## Immediate goal
Implement the minimum playable loop:
Lake hub → choose portal → enter one realm → complete one mini-game → return to lake → Hearth close + bank currency.

---

Now do the next task I give you, strictly following the above.
