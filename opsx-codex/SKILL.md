---
name: opsx-codex
description: >
  Workflow instructions for the /squad command. Load this skill only when the
  user explicitly runs /squad or asks for the opsx-codex workflow by name.
  Do NOT trigger on individual /opsx:* or /codex:* commands — those run
  independently and do not need this skill loaded.
---

# OpenSpec + Codex Workflow

You are the process owner. Follow this workflow exactly.
Codex is your critic and sounding board — invoke it at the marked checkpoints.
The hardest decisions (architectural tradeoffs, scope changes, unresolved conflicts)
go to the user. Everything else you handle.

---

## Roles

**Claude** — drives the full workflow, creates artifacts, writes code, makes decisions.

**Codex** — independent critic. Challenges your reasoning, reviews your code.
Codex does not drive the workflow. You decide what to do with its feedback.

**User** — final authority on hard decisions. Escalate when genuinely stuck or
when the tradeoff is too significant to decide alone.

---

## Phase 1 — Explore

Run `/opsx:explore <problem>` and investigate.

Map the problem: read relevant files, trace the bug, identify where it lives.

**When you have identified 2 or more viable approaches, STOP.**

Before choosing one, invoke Codex:

```
/codex:adversarial-review --wait focus: [describe the problem and list the approaches you're considering]
```

Read Codex's response. It may invalidate an approach, reveal a risk you missed,
or confirm your instinct. Make your decision, record which approach you chose and why.

**Escalate to the user when:**
- Codex and Claude disagree and neither argument is clearly stronger
- The choice involves a significant architectural tradeoff (e.g. touching a core abstraction)
- You need information only the user has (business logic, product intent)

If there is only one viable approach and it's obvious, skip the Codex call and proceed.

---

## Phase 2 — Specify

Run `/opsx:ff <change-name>` to generate all artifacts (proposal, design, specs, tasks).

After artifacts are written, invoke Codex:

```
/codex:adversarial-review --wait focus: proposal and plan for <change-name>
```

For each objection Codex raises, do one of:
- **Accept** — update the artifact, note what changed
- **Reject** — write one sentence explaining why, move on
- **Partial** — update the valid part, dismiss the rest

One round only. Do not re-invoke adversarial review to relitigate the same point.

**Escalate to the user when** Codex identifies a fundamental flaw that would require
re-scoping the change entirely.

---

## Phase 3 — Implement

Run `/opsx:apply <change-name>`.

You are the sole author of code changes. Mark each task done as you complete it.

If you hit a blocker you cannot resolve after one genuine attempt, invoke rescue:

```
/codex:rescue investigate: [specific problem at file:line]
```

Do not invoke rescue speculatively. Try first, rescue only if stuck.

---

## Phase 4 — Code Review

After all tasks are complete, invoke Codex review:

```
/codex:review --wait
```

For each finding:
- **Real bug / regression risk** → fix it
- **Style / nitpick / preference** → acknowledge and skip

If a bug is found and your fix attempt fails, invoke rescue with the specific problem.

---

## Phase 5 — Verify & Archive

```
/opsx:verify <change-name>
```

Fix any CRITICAL issues before archiving. Use judgment on warnings.

```
/opsx:archive <change-name>
```

---

## Decision Rules

| Situation | Action |
| --------- | ------ |
| 2+ viable approaches in explore | Invoke `/codex:adversarial-review` before choosing |
| 1 obvious approach | Skip Codex in explore, proceed |
| Artifacts ready | Invoke `/codex:adversarial-review` on proposal |
| All tasks done | Invoke `/codex:review` |
| Blocked during implement | Try once, then `/codex:rescue` |
| Codex and Claude disagree | Decide + record rationale, or escalate to user |
| Architectural tradeoff | Escalate to user |

---

## Anti-Patterns

**Do not** run Codex more than once per phase — one adversarial review in explore,
one adversarial review on the proposal, one code review after apply.

**Do not** relay Codex output to the user and ask what to do. You make the call.
Tell the user the decision you made, not the raw Codex output.

**Do not** invoke rescue as a default second opinion. It is for real blockers.

**Do not** keep iterating if Codex only finds style issues. Ship it.

---

## Definition of Done

- [ ] All tasks in tasks.md marked `[x]`
- [ ] `/opsx:verify` reports no CRITICAL issues
- [ ] `/codex:review` was run after implementation
- [ ] All real bugs from the review are fixed
- [ ] `/opsx:archive` completed
